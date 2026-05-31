import * as THREE from 'three';
import { AnimationRegistry, CameraMoveRegistry } from 'dula-engine';
import { COMBO_TEMPLATES, ATTACK_HIT_FRAMES, DEFAULT_REACTIONS, DEFAULT_SFX } from './CombatDirector.js';

/**
 * CinematicCombatAdapter —— 电影化格斗适配器
 *
 * 职责：
 * 1. 慢动作编排 (BulletTime)：平滑变速，不影响音频
 * 2. 情绪镜头覆盖 (Emotional Override)：编剧 Camera 标签优先于自动格斗相机
 * 3. 特殊调度 (Special Staging)：2v1、夹击、撤退等非对称战斗
 * 4. 自定义连段 (Ad-hoc Combo)：编剧在 .story 中定义一次性连段
 *
 * 设计原则：装饰器模式，包装 CombatDirector，不修改其内部逻辑。
 * 三层控制：编剧手动覆盖 > CinematicAdapter > CombatDirector
 */

export class CinematicCombatAdapter {
  constructor(combatDirector) {
    this.cd = combatDirector;
    this.sb = combatDirector.sb;

    // 慢动作事件队列
    this.bulletTimeEvents = []; // { startTime, endTime, scale, easeIn, easeOut }

    // 情绪镜头覆盖队列
    this.cameraOverrides = []; // { startTime, endTime, cameraType, options, priority }

    // 特殊调度事件队列
    this.stagingEvents = []; // { startTime, endTime, type, characters, target, options }

    // 自定义连段注册表（一次性，不污染 COMBO_TEMPLATES）
    this.adHocCombos = new Map(); // name -> move[]
  }

  // ========== 委托给 CombatDirector 的方法 ==========

  setupBattleLine(charA, charB, centerX, centerZ, distance) {
    return this.cd.setupBattleLine(charA, charB, centerX, centerZ, distance);
  }

  getFacingDir(characterName) {
    return this.cd.getFacingDir(characterName);
  }

  getOpponent(characterName) {
    return this.cd.getOpponent(characterName);
  }

  clear() {
    this.bulletTimeEvents = [];
    this.cameraOverrides = [];
    this.stagingEvents = [];
    this.adHocCombos.clear();
    this.cd.clear();
  }

  // ========== 慢动作系统 (BulletTime) ==========

  /**
   * 编排慢动作事件
   * @param {number} startTime - 相对于 entry.startTime 的偏移（秒）
   * @param {number} duration - 慢动作持续时间（秒）
   * @param {number} scale - 时间缩放比例（0.1 = 10% 速度）
   * @param {number} easeIn - 渐入时间（秒）
   * @param {number} easeOut - 渐出时间（秒）
   */
  scheduleBulletTime(startTime, duration, scale = 0.3, easeIn = 0.1, easeOut = 0.1) {
    const absStart = startTime;
    const absEnd = startTime + duration;
    this.bulletTimeEvents.push({
      startTime: absStart,
      endTime: absEnd,
      scale: Math.max(0.05, Math.min(1.0, scale)),
      easeIn: Math.max(0, easeIn),
      easeOut: Math.max(0, easeOut),
    });
    console.log(`[CinematicCombatAdapter] BulletTime scheduled: t=${absStart.toFixed(2)}s, duration=${duration.toFixed(2)}s, scale=${scale}`);
  }

  /**
   * 计算当前时间缩放值
   */
  computeTimeScale(t) {
    let scale = 1.0;
    for (const ev of this.bulletTimeEvents) {
      if (t < ev.startTime || t > ev.endTime) continue;
      const elapsed = t - ev.startTime;
      const total = ev.endTime - ev.startTime;
      let factor;
      if (elapsed < ev.easeIn && ev.easeIn > 0) {
        // 渐入：从 1.0 降到 scale
        factor = 1.0 - (elapsed / ev.easeIn) * (1.0 - ev.scale);
      } else if (elapsed > total - ev.easeOut && ev.easeOut > 0) {
        // 渐出：从 scale 升到 1.0
        factor = ev.scale + ((elapsed - (total - ev.easeOut)) / ev.easeOut) * (1.0 - ev.scale);
      } else {
        // 稳定期
        factor = ev.scale;
      }
      // 取最小值（多个慢动作重叠时取最慢）
      scale = Math.min(scale, factor);
    }
    return scale;
  }

  // ========== 情绪镜头覆盖 ==========

  /**
   * 注册相机覆盖
   * @param {number} startTime - 开始时间
   * @param {number} duration - 持续时间
   * @param {string} cameraType - CameraMoveRegistry 中的名字
   * @param {Object} options - 相机参数
   * @param {number} priority - 优先级（越大越优先，默认 10）
   */
  scheduleCameraOverride(startTime, duration, cameraType, options = {}, priority = 10) {
    const CameraClass = CameraMoveRegistry[cameraType];
    if (!CameraClass) {
      console.warn(`[CinematicCombatAdapter] Camera override "${cameraType}" not found`);
      return;
    }
    this.cameraOverrides.push({
      startTime,
      endTime: startTime + duration,
      cameraType,
      options,
      priority,
      triggered: false,
    });
    console.log(`[CinematicCombatAdapter] Camera override scheduled: ${cameraType} at t=${startTime.toFixed(2)}s, duration=${duration.toFixed(2)}s`);
  }

  /**
   * 检查是否有活跃的相机覆盖
   */
  getActiveCameraOverride(t) {
    let active = null;
    for (const ov of this.cameraOverrides) {
      if (t >= ov.startTime && t <= ov.endTime) {
        if (!active || ov.priority > active.priority) {
          active = ov;
        }
      }
    }
    return active;
  }

  // ========== 特殊调度 (Staging) ==========

  /**
   * 编排特殊战场调度
   * @param {string} type - 'pincer' | 'retreat' | 'intercept' | 'surround' | 'charge'
   * @param {string[]} characters - 参与调度的角色名
   * @param {string} target - 目标角色名
   * @param {number} startTime - 开始时间
   * @param {number} duration - 持续时间
   * @param {Object} options - 额外参数
   */
  scheduleStaging(type, characters, target, startTime, duration = 1.0, options = {}) {
    this.stagingEvents.push({
      type,
      characters: Array.isArray(characters) ? characters : characters.split(','),
      target,
      startTime,
      endTime: startTime + duration,
      options,
      triggered: false,
    });
    console.log(`[CinematicCombatAdapter] Staging scheduled: ${type} at t=${startTime.toFixed(2)}s`);
  }

  /**
   * 执行调度逻辑（在 update 中调用）
   */
  _executeStaging(ev, t) {
    const targetChar = this.sb.characters.get(ev.target);
    if (!targetChar) return;

    const targetPos = targetChar.mesh.position.clone();
    const attackers = ev.characters.map((c) => this.sb.characters.get(c)).filter(Boolean);
    if (attackers.length === 0) return;

    switch (ev.type) {
      case 'pincer': {
        // 夹击：角色从两侧包围目标
        const spacing = ev.options.spacing ?? 3;
        attackers.forEach((char, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const destX = targetPos.x + side * spacing;
          const destZ = targetPos.z + (ev.options.depth ?? 0);
          char.moveTo({ x: destX, y: 0.01, z: destZ }, ev.startTime, ev.endTime - ev.startTime);
          this._playMovementAnimation(char, ev.startTime, ev.endTime - ev.startTime);
        });
        break;
      }
      case 'surround': {
        // 包围：角色均匀分布在目标周围
        const radius = ev.options.radius ?? 4;
        const angleStep = (Math.PI * 2) / attackers.length;
        attackers.forEach((char, i) => {
          const angle = angleStep * i;
          const destX = targetPos.x + Math.cos(angle) * radius;
          const destZ = targetPos.z + Math.sin(angle) * radius;
          char.moveTo({ x: destX, y: 0.01, z: destZ }, ev.startTime, ev.endTime - ev.startTime);
          this._playMovementAnimation(char, ev.startTime, ev.endTime - ev.startTime);
          // 面向目标
          const dx = targetPos.x - destX;
          const dz = targetPos.z - destZ;
          char.mesh.rotation.y = Math.atan2(dx, dz);
          if (!char.mesh.userData) char.mesh.userData = {};
          char.userData = char.mesh.userData;
          char.mesh.userData.facingDir = dx >= 0 ? 1 : -1;
        });
        break;
      }
      case 'intercept': {
        // 截击：角色挡在目标前方
        const blocker = attackers[0];
        const dir = ev.options.dir ?? 1; // 1 = 右侧，-1 = 左侧
        const destX = targetPos.x + dir * 2;
        blocker.moveTo({ x: destX, y: 0.01, z: targetPos.z }, ev.startTime, ev.endTime - ev.startTime);
        this._playMovementAnimation(blocker, ev.startTime, ev.endTime - ev.startTime);
        break;
      }
      case 'retreat': {
        // 撤退：角色远离目标
        const retreatDist = ev.options.distance ?? 5;
        attackers.forEach((char) => {
          const charPos = char.mesh.position.clone();
          const away = new THREE.Vector3().subVectors(charPos, targetPos).normalize();
          const dest = charPos.clone().add(away.multiplyScalar(retreatDist));
          char.moveTo({ x: dest.x, y: 0.01, z: dest.z }, ev.startTime, ev.endTime - ev.startTime);
          this._playMovementAnimation(char, ev.startTime, ev.endTime - ev.startTime);
        });
        break;
      }
      case 'charge': {
        // 冲锋：角色向目标突进
        attackers.forEach((char) => {
          const charPos = char.mesh.position.clone();
          const toward = new THREE.Vector3().subVectors(targetPos, charPos).normalize();
          const dest = targetPos.clone().add(toward.multiplyScalar(-1.5)); // 停在目标前方1.5单位
          char.moveTo({ x: dest.x, y: 0.01, z: dest.z }, ev.startTime, ev.endTime - ev.startTime);
          this._playMovementAnimation(char, ev.startTime, ev.endTime - ev.startTime);
        });
        break;
      }
    }
  }

  _playMovementAnimation(char, startTime, duration) {
    const MoveAnim = AnimationRegistry['Run'] || AnimationRegistry['Walk'];
    if (!MoveAnim || !char?.playAnimation) return;

    const hasBlockingBodyAction = (char.animations || []).some((anim) => {
      const name = anim.instance?.name;
      if (!name || name.startsWith('FX') || name.startsWith('Face')) return false;
      if (name === 'FightingStance') return false;
      return startTime < anim.endTime && startTime + duration > anim.startTime;
    });

    if (!hasBlockingBodyAction) {
      char.playAnimation(MoveAnim, startTime, duration);
    }
  }

  // ========== 自定义连段 (Ad-hoc Combo) ==========

  /**
   * 注册一次性自定义连段
   * @param {string} name - 连段名（仅本次战斗有效）
   * @param {string} movesStr - "anim,hitFrame,anim,hitFrame,..." 格式，hitFrame 可为 null
   */
  registerAdHocCombo(name, movesStr) {
    const parts = movesStr.split(',').map((s) => s.trim());
    const moves = [];
    for (let i = 0; i < parts.length; i += 2) {
      const anim = parts[i];
      const hitFrameStr = parts[i + 1];
      if (!anim) continue;
      const hitFrame = hitFrameStr === 'null' || hitFrameStr === '' ? null : parseFloat(hitFrameStr);
      moves.push({
        anim,
        hitFrame,
        sfx: DEFAULT_SFX[anim],
        reaction: DEFAULT_REACTIONS[anim] || 'HitStagger',
        hitstop: 0.08,
        shake: 0.2,
        camera: this.cd._getDefaultCamera(anim),
      });
    }
    this.adHocCombos.set(name, moves);
    console.log(`[CinematicCombatAdapter] Ad-hoc combo registered: "${name}" with ${moves.length} moves`);
  }

  /**
   * 编排自定义连段（委托给 CombatDirector，但使用自定义 moves）
   */
  scheduleAdHocCombo(attacker, defender, comboName, startTime) {
    const moves = this.adHocCombos.get(comboName);
    if (!moves) {
      console.warn(`[CinematicCombatAdapter] Ad-hoc combo "${comboName}" not found`);
      return 0;
    }
    // 直接调用 CombatDirector 的 scheduleCombo，传入自定义数组
    return this.cd.scheduleCombo(attacker, defender, moves, startTime);
  }

  // ========== 委托编排（带 cinematic 开关） ==========

  scheduleCombo(attacker, defender, sequence, startTime, options = {}) {
    if (options.noAutoCamera) {
      // 临时禁用 CombatDirector 的自动相机
      const originalPlayCameraMove = this.sb.playCameraMove;
      this.sb.playCameraMove = () => {}; // no-op
      const result = this.cd.scheduleCombo(attacker, defender, sequence, startTime);
      this.sb.playCameraMove = originalPlayCameraMove;
      return result;
    }
    return this.cd.scheduleCombo(attacker, defender, sequence, startTime);
  }

  scheduleAttack(attacker, defender, animName, startTime, options = {}) {
    if (options.noAutoCamera) {
      const originalPlayCameraMove = this.sb.playCameraMove;
      this.sb.playCameraMove = () => {};
      const result = this.cd.scheduleAttack(attacker, defender, animName, startTime, options);
      this.sb.playCameraMove = originalPlayCameraMove;
      return result;
    }
    return this.cd.scheduleAttack(attacker, defender, animName, startTime, options);
  }

  scheduleReaction(characterName, reactionAnim, startTime, options = {}) {
    return this.cd.scheduleReaction(characterName, reactionAnim, startTime, options);
  }

  // ========== update：每帧更新 ==========

  update(t) {
    // 1. 触发 staging 事件
    for (const ev of this.stagingEvents) {
      if (ev.triggered) continue;
      if (t >= ev.startTime && t < ev.startTime + 0.05) {
        ev.triggered = true;
        this._executeStaging(ev, t);
      }
    }

    // 2. 触发相机覆盖（通过 Storyboard 的 cameraMoves 队列插入）
    for (const ov of this.cameraOverrides) {
      if (ov.triggered) continue;
      if (t >= ov.startTime && t < ov.startTime + 0.05) {
        ov.triggered = true;
        const CameraClass = CameraMoveRegistry[ov.cameraType];
        if (CameraClass && this.sb.playCameraMove) {
          this.sb.playCameraMove(CameraClass, ov.startTime, ov.endTime - ov.startTime, ov.options);
        }
      }
    }

    // 3. 委托 CombatDirector 更新命中事件
    this.cd.update(t);
  }
}
