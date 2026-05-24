import * as THREE from 'three';
import { AnimationRegistry, CameraMoveRegistry } from 'dula-engine';
import { ProjectileSystem } from 'dula-engine';
import { SpiritGunProjectile } from '../projectiles/SpiritGunProjectile.js';

/**
 * CombatDirector —— 格斗战斗导演
 *
 * 职责：
 * 1. 管理战斗轴线（Battle Line）：确保双方始终侧向相对（左右站位）
 * 2. 编排招式序列（Combo Sequencer）：自动衔接攻击→命中→受击→恢复
 * 3. 命中判定与同步（Hit Sync）：在正确时机触发 SFX + Hitstop + 受击动画
 * 4. 摄像机导演（Fight Camera）：低角度侧拍、冲击特写
 *
 * 设计原则：Storyboard 负责"时间线"，CombatDirector 负责"格斗逻辑"。
 */

// 预定义的格斗连段模板（KOF97 风格）
// camera 字段支持: 'FightSide' | 'FightImpact' | 'FightWide' | 'FightDramatic' | 'FightFollow'
export const COMBO_TEMPLATES = {
  // ========== 基础连段 ==========
  // 轻拳→轻拳→重拳
  jab_cross_hook: [
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'ComboPunch', hitFrame: 0.9, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 前冲→重拳
  dash_punch: [
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
  ],
  // 三连踢
  triple_kick: [
    { anim: 'Kick', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Kick', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'SpinKick', hitFrame: 0.4, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 上勾拳→跳击
  uppercut_jump: [
    { anim: 'Uppercut', hitFrame: 0.35, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.25, camera: 'FightDramatic' },
    { anim: 'JumpAttack', hitFrame: 0.5, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],

  // ========== 幽游白书专属 ==========
  // 灵剑斩
  spirit_sword_combo: [
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 灵丸
  spirit_gun: [
    { anim: 'SpiritGunCharge', hitFrame: null, camera: 'FightDramatic' },
    { anim: 'SpiritGunFire', hitFrame: 0.15, sfx: 'energy_blast', reaction: 'HitStagger', hitstop: 0.1, shake: 0.3, camera: 'FightImpact' },
  ],

  // ========== 防御/闪避 ==========
  block_counter: [
    { anim: 'Block', hitFrame: null, camera: 'FightSide' },
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
  ],
  dodge_counter: [
    { anim: 'Dodge', hitFrame: null, camera: 'FightFollow' },
    { anim: 'Kick', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
  ],

  // ========== 扩展连段 ==========
  // 重拳→上勾拳→跳击（高伤害连段）
  heavy_combo: [
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Uppercut', hitFrame: 0.35, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.25, camera: 'FightDramatic' },
    { anim: 'JumpAttack', hitFrame: 0.5, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 前冲→回旋踢（突进连段）
  dash_spinkick: [
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'SpinKick', hitFrame: 0.4, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 轻拳→轻拳→前踢→重拳（经典4连段）
  classic_4hit: [
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Kick', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'ComboPunch', hitFrame: 0.9, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 灵剑斩×3（桑原终极连段）
  spirit_sword_3x: [
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 灵丸连射（幽助快速射击）
  spirit_gun_rapid: [
    { anim: 'SpiritGunFire', hitFrame: 0.15, sfx: 'energy_blast', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'SpiritGunFire', hitFrame: 0.15, sfx: 'energy_blast', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'SpiritGunFire', hitFrame: 0.15, sfx: 'energy_blast', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 组合拳→上勾拳（近身压制）
  pressure_combo: [
    { anim: 'ComboPunch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Uppercut', hitFrame: 0.35, sfx: 'punch_hit', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightDramatic' },
  ],
  // 闪避→前冲→回旋踢（机动连段）
  mobility_combo: [
    { anim: 'Dodge', hitFrame: null, camera: 'FightFollow' },
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'SpinKick', hitFrame: 0.4, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 防御→闪避→反击（完美防御连段）
  perfect_defense: [
    { anim: 'Block', hitFrame: null, camera: 'FightSide' },
    { anim: 'Dodge', hitFrame: null, camera: 'FightFollow' },
    { anim: 'ComboPunch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
};

// 各动画的命中帧数据（相对于动画开始的时间，秒）
export const ATTACK_HIT_FRAMES = {
  Punch: 0.25,
  ComboPunch: 0.25, // 第一hit
  Kick: 0.35,
  Uppercut: 0.35,
  SpinKick: 0.4,
  JumpAttack: 0.5,
  DashForward: null, // 无命中，纯位移
  SpiritSwordSwing: 0.3,
  SpiritGunFire: 0.15,
  Block: null,
  Dodge: null,
  FightingStance: null,
};

// 各动画的默认受击反应
export const DEFAULT_REACTIONS = {
  Punch: 'HitStagger',
  ComboPunch: 'HitStagger',
  Kick: 'HitStagger',
  Uppercut: 'HitStagger',
  SpinKick: 'Knockdown',
  JumpAttack: 'Knockdown',
  SpiritSwordSwing: 'HitStagger',
  SpiritGunFire: 'HitStagger',
};

// 各动画的默认 SFX
export const DEFAULT_SFX = {
  Punch: 'punch_hit',
  ComboPunch: 'punch_hit',
  Kick: 'kick_impact',
  Uppercut: 'punch_hit',
  SpinKick: 'kick_impact',
  JumpAttack: 'kick_impact',
  DashForward: 'dash_whoosh',
  SpiritSwordSwing: 'sword_slash',
  SpiritGunFire: 'energy_blast',
  Block: 'impact_thud',
  Dodge: 'dash_whoosh',
};

export class CombatDirector {
  constructor(storyboard) {
    this.sb = storyboard;
    this.fighters = new Map(); // name -> { side: 'left'|'right', opponent: name }
    this.battleLine = new THREE.Vector3(1, 0, 0); // X轴为战斗方向
    this.combos = []; // 已编排的连段
    this.hitEvents = []; // 预计算的命中事件
    this.cameraOverrides = []; // { startTime, endTime, cameraType, options }
    this.autoCameraEnabled = true; // 是否自动安排格斗相机
    this.projectileSystem = new ProjectileSystem(); // 弹道系统
  }

  /**
   * 设置相机覆盖（编剧手动 Camera 标签优先）
   */
  setCameraOverride(startTime, endTime, cameraType, options = {}) {
    this.cameraOverrides.push({ startTime, endTime, cameraType, options });
  }

  /**
   * 检查指定时间是否有相机覆盖
   */
  _hasCameraOverride(t, duration) {
    for (const ov of this.cameraOverrides) {
      if (t < ov.endTime && t + duration > ov.startTime) {
        return true;
      }
    }
    return false;
  }

  /**
   * 初始化战斗站位
   * @param {string} charA - 左侧角色
   * @param {string} charB - 右侧角色
   * @param {number} centerX - 战斗中心X坐标
   * @param {number} centerZ - 战斗中心Z坐标
   * @param {number} distance - 双方初始距离（默认4）
   */
  setupBattleLine(charA, charB, centerX = 0, centerZ = 0, distance = 4) {
    const charAObj = this.sb.characters.get(charA);
    const charBObj = this.sb.characters.get(charB);
    if (!charAObj || !charBObj) {
      console.warn(`[CombatDirector] Characters not found: ${charA}, ${charB}`);
      return;
    }

    // A在左（-X），面向右（+X）
    charAObj.setPosition(centerX - distance / 2, 0.01, centerZ);
    charAObj.mesh.rotation.y = Math.PI / 2;
    if (!charAObj.mesh.userData) charAObj.mesh.userData = {};
    charAObj.mesh.userData.facingDir = 1;
    charAObj.mesh.userData.inCombat = true;
    charAObj.mesh.userData.combatSide = 'left';

    // B在右（+X），面向左（-X）
    charBObj.setPosition(centerX + distance / 2, 0.01, centerZ);
    charBObj.mesh.rotation.y = -Math.PI / 2;
    if (!charBObj.mesh.userData) charBObj.mesh.userData = {};
    charBObj.mesh.userData.facingDir = -1;
    charBObj.mesh.userData.inCombat = true;
    charBObj.mesh.userData.combatSide = 'right';

    this.fighters.set(charA, { side: 'left', opponent: charB });
    this.fighters.set(charB, { side: 'right', opponent: charA });

    console.log(`[CombatDirector] Battle line set: ${charA}(left) vs ${charB}(right) at x=${centerX}, z=${centerZ}`);
  }

  /**
   * 获取角色面向方向（1=右，-1=左）
   */
  getFacingDir(characterName) {
    const char = this.sb.characters.get(characterName);
    if (!char) return 1;
    return char.mesh?.userData?.facingDir || 1;
  }

  /**
   * 获取角色的对手
   */
  getOpponent(characterName) {
    const info = this.fighters.get(characterName);
    return info ? info.opponent : null;
  }

  /**
   * 编排一段连击
   * @param {string} attacker - 攻击者名字
   * @param {string} defender - 防御者名字
   * @param {string|Array} sequence - 连段模板名或自定义数组
   * @param {number} startTime - 开始时间
   * @returns {number} 连段总时长
   */
  scheduleCombo(attacker, defender, sequence, startTime) {
    const moves = typeof sequence === 'string' ? COMBO_TEMPLATES[sequence] : sequence;
    if (!moves || moves.length === 0) {
      console.warn(`[CombatDirector] Unknown combo sequence: ${sequence}`);
      return 0;
    }

    const attackerChar = this.sb.characters.get(attacker);
    const defenderChar = this.sb.characters.get(defender);
    if (!attackerChar || !defenderChar) {
      console.warn(`[CombatDirector] Characters not found for combo`);
      return 0;
    }

    let t = startTime;
    let totalDuration = 0;

    for (const move of moves) {
      const AnimClass = AnimationRegistry[move.anim];
      if (!AnimClass) {
        console.warn(`[CombatDirector] Animation not found: ${move.anim}`);
        continue;
      }

      const inst = new AnimClass();
      const animDuration = inst.duration;

      // 播放攻击动画
      attackerChar.playAnimation(AnimClass, t);

      // 自动安排格斗相机（除非被覆盖或全局禁用）
      if (this.autoCameraEnabled && !this._hasCameraOverride(t, animDuration)) {
        const cameraType = move.camera || this._getDefaultCamera(move.anim);
        if (cameraType && this.sb.playCameraMove) {
          const CameraClass = this._getCameraClass(cameraType);
          if (CameraClass) {
            const camOptions = this._buildCameraOptions(cameraType, attacker, defender, move);
            this.sb.playCameraMove(CameraClass, t, animDuration, camOptions);
          }
        }
      }

      // 记录命中事件
      const hitFrame = move.hitFrame !== undefined ? move.hitFrame : ATTACK_HIT_FRAMES[move.anim];
      if (hitFrame !== null && hitFrame !== undefined) {
        const hitTime = t + hitFrame;
        this.hitEvents.push({
          time: hitTime,
          attacker,
          defender,
          anim: move.anim,
          sfx: move.sfx || DEFAULT_SFX[move.anim],
          reaction: move.reaction || DEFAULT_REACTIONS[move.anim] || 'HitStagger',
          hitstop: move.hitstop || 0.08,
          shake: move.shake || 0.2,
          triggered: false,
        });
        
        // 灵丸发射：创建世界坐标系弹道
        if (move.anim === 'SpiritGunFire' && SpiritGunProjectile) {
          this._scheduleSpiritGunProjectile(attacker, defender, hitTime);
        }
      }

      t += animDuration;
      totalDuration += animDuration;
    }

    // 连段结束后自动进入 FightingStance
    const FightingStance = AnimationRegistry['FightingStance'];
    if (FightingStance) {
      attackerChar.playAnimation(FightingStance, t);
    }

    console.log(`[CombatDirector] Scheduled combo "${sequence}" for ${attacker} vs ${defender}, start=${startTime.toFixed(2)}s, duration=${totalDuration.toFixed(2)}s`);
    return totalDuration;
  }

  /**
   * 编排单个攻击动作（带自动命中）
   */
  scheduleAttack(attacker, defender, animName, startTime, options = {}) {
    const AnimClass = AnimationRegistry[animName];
    if (!AnimClass) {
      console.warn(`[CombatDirector] Animation not found: ${animName}`);
      return 0;
    }

    const attackerChar = this.sb.characters.get(attacker);
    if (!attackerChar) {
      console.warn(`[CombatDirector] Attacker not found: ${attacker}`);
      return 0;
    }

    const inst = new AnimClass();
    attackerChar.playAnimation(AnimClass, startTime);

    // 自动命中
    const hitFrame = options.hitFrame !== undefined ? options.hitFrame : ATTACK_HIT_FRAMES[animName];
    if (hitFrame !== null && hitFrame !== undefined) {
      const hitTime = startTime + hitFrame;
      this.hitEvents.push({
        time: hitTime,
        attacker,
        defender,
        anim: animName,
        sfx: options.sfx || DEFAULT_SFX[animName],
        reaction: options.reaction || DEFAULT_REACTIONS[animName] || 'HitStagger',
        hitstop: options.hitstop || 0.08,
        shake: options.shake || 0.2,
        triggered: false,
      });
    }

    // 攻击结束后自动进入 FightingStance
    const FightingStance = AnimationRegistry['FightingStance'];
    if (FightingStance && !options.noStance) {
      attackerChar.playAnimation(FightingStance, startTime + inst.duration);
    }

    return inst.duration;
  }

  /**
   * 编排受击反应（手动触发）
   */
  scheduleReaction(characterName, reactionAnim, startTime, options = {}) {
    const char = this.sb.characters.get(characterName);
    if (!char) return;

    const AnimClass = AnimationRegistry[reactionAnim];
    if (!AnimClass) return;

    char.playAnimation(AnimClass, startTime);

    // 受击结束后自动进入 FightingStance
    const inst = new AnimClass();
    const FightingStance = AnimationRegistry['FightingStance'];
    if (FightingStance && !options.noStance) {
      char.playAnimation(FightingStance, startTime + inst.duration);
    }
  }

  /**
   * 更新：检查并触发命中事件
   * 在 Storyboard.update() 中每帧调用
   */
  update(time) {
    for (const ev of this.hitEvents) {
      if (ev.triggered) continue;
      if (time >= ev.time && time < ev.time + 0.05) {
        ev.triggered = true;
        this._triggerHit(ev, time);
      }
    }
  }

  /**
   * 内部：执行命中逻辑
   */
  _triggerHit(ev, currentTime) {
    const defender = this.sb.characters.get(ev.defender);
    if (!defender) return;

    // 1. 播放受击动画
    const ReactionAnim = AnimationRegistry[ev.reaction];
    if (ReactionAnim) {
      defender.playAnimation(ReactionAnim, currentTime);

      // 受击结束后自动进入 FightingStance
      const inst = new ReactionAnim();
      const FightingStance = AnimationRegistry['FightingStance'];
      if (FightingStance) {
        defender.playAnimation(FightingStance, currentTime + inst.duration);
      }
    }

    // 2. 触发 Hitstop
    if (this.sb.hitstopManager && ev.hitstop > 0) {
      this.sb.hitstopManager.trigger(currentTime, ev.hitstop, ev.shake, true);
    }

    // 3. 触发 SFX（通过 entries 注入，让 Storyboard 的 _updateSFXVisuals 处理）
    // 注：SFX 的实际播放由 Python 后处理管道处理，这里只需要确保 story 脚本中有 SFX 标签
    // 我们在运行时通过 console 提示，实际音频需要在 .story 中声明

    console.log(`[CombatDirector] HIT! ${ev.attacker} -> ${ev.defender} with ${ev.anim} at t=${currentTime.toFixed(3)}s`);
  }

  /**
   * 调度灵丸弹道
   * 在 SpiritGunFire 动画的命中帧创建世界坐标系弹道
   */
  _scheduleSpiritGunProjectile(attacker, defender, fireTime) {
    const attackerChar = this.sb.characters.get(attacker);
    const defenderChar = this.sb.characters.get(defender);
    if (!attackerChar || !defenderChar) return;
    
    // 获取发射位置（从 attacker 手掌位置）
    const fromPos = new THREE.Vector3();
    if (attackerChar.rightArm) {
      // 从手臂末端发射
      attackerChar.rightArm.getWorldPosition(fromPos);
      fromPos.y -= 0.3; // 调整到手掌位置
    } else {
      fromPos.copy(attackerChar.mesh.position);
      fromPos.y += 1.2;
    }
    
    // 获取目标位置（defender 胸口）
    const toPos = defenderChar.mesh.position.clone();
    toPos.y += 1.0; // 胸口高度
    
    const projectile = new SpiritGunProjectile({
      startTime: fireTime,
      fromPos,
      toPos,
      attacker,
      defender,
      speed: 25, // 灵丸速度很快
    });
    
    this.projectileSystem.schedule(projectile);
    console.log(`[CombatDirector] SpiritGun projectile scheduled: ${attacker} -> ${defender} at t=${fireTime.toFixed(3)}s`);
  }

  /**
   * 清理所有事件
   */
  clear() {
    this.hitEvents = [];
    this.combos = [];
    this.fighters.clear();
    if (this.projectileSystem) {
      this.projectileSystem.clear(this.sb.currentScene?.scene);
    }
  }

  /**
   * 根据动画类型获取默认相机
   */
  _getDefaultCamera(animName) {
    const cameraMap = {
      Punch: 'FightImpact',
      ComboPunch: 'FightImpact',
      Kick: 'FightImpact',
      Uppercut: 'FightDramatic',
      SpinKick: 'FightImpact',
      JumpAttack: 'FightImpact',
      DashForward: 'FightFollow',
      Dodge: 'FightFollow',
      Block: 'FightSide',
      SpiritSwordSwing: 'FightImpact',
      SpiritGunCharge: 'FightDramatic',
      SpiritGunFire: 'FightImpact',
      FightingStance: 'FightSide',
      HitStagger: 'FightImpact',
      Knockdown: 'FightWide',
      GetUp: 'FightSide',
    };
    return cameraMap[animName] || 'FightSide';
  }

  /**
   * 获取相机类
   */
  _getCameraClass(cameraType) {
    return CameraMoveRegistry[cameraType] || null;
  }

  /**
   * 构建相机参数
   */
  _buildCameraOptions(cameraType, attacker, defender, move) {
    const baseOptions = {
      characterA: attacker,
      characterB: defender,
      attacker: attacker,
      defender: defender,
      character: attacker,
      characterName: attacker,
    };

    switch (cameraType) {
      case 'FightImpact':
        return {
          ...baseOptions,
          attacker,
          defender,
          hitTime: move.hitFrame ? (move.hitFrame / (move.hitFrame + 0.1)) : 0.5,
          shakeIntensity: move.shake ? move.shake * 0.5 : 0.1,
        };
      case 'FightDramatic':
        return {
          ...baseOptions,
          character: attacker,
        };
      case 'FightFollow':
        return {
          ...baseOptions,
          characterA: attacker,
          characterB: defender,
        };
      case 'FightWide':
        return {
          ...baseOptions,
          characterA: attacker,
          characterB: defender,
        };
      case 'FightSide':
      default:
        return {
          ...baseOptions,
          characterA: attacker,
          characterB: defender,
        };
    }
  }

  /**
   * 计算格斗摄像机位置（兼容旧 API）
   * @param {string} viewType - 'side' | 'lowAngle' | 'impact' | 'wide'
   * @param {string} focus - 焦点角色
   */
  computeCamera(viewType, focus, options = {}) {
    const focusChar = this.sb.characters.get(focus);
    if (!focusChar) return null;

    const pos = focusChar.mesh.position;
    const opponent = this.getOpponent(focus);
    const oppChar = opponent ? this.sb.characters.get(opponent) : null;
    const oppPos = oppChar ? oppChar.mesh.position : null;

    switch (viewType) {
      case 'side': {
        const side = focusChar.userData?.facingDir === 1 ? -1 : 1;
        const dist = options.distance || 6;
        const height = options.height || 2.5;
        const cameraPos = new THREE.Vector3(pos.x + side * dist, height, 4);
        const lookAt = oppPos
          ? new THREE.Vector3((pos.x + oppPos.x) / 2, 1.2, 0)
          : new THREE.Vector3(pos.x, 1.2, 0);
        return { position: cameraPos, lookAt };
      }
      case 'lowAngle': {
        const side = focusChar.userData?.facingDir === 1 ? -1 : 1;
        const dist = options.distance || 4;
        const height = options.height || 0.8;
        const cameraPos = new THREE.Vector3(pos.x + side * dist, height, 3);
        const lookAt = new THREE.Vector3(pos.x, 1.5, 0);
        return { position: cameraPos, lookAt };
      }
      case 'impact': {
        const side = focusChar.userData?.facingDir === 1 ? -1 : 1;
        const dist = options.distance || 2.5;
        const height = options.height || 1.8;
        const cameraPos = new THREE.Vector3(pos.x + side * dist, height, 2);
        const lookAt = oppPos
          ? new THREE.Vector3(oppPos.x, 1.2, 0)
          : new THREE.Vector3(pos.x, 1.2, 0);
        return { position: cameraPos, lookAt };
      }
      case 'wide': {
        const centerX = oppPos ? (pos.x + oppPos.x) / 2 : pos.x;
        const height = options.height || 3.5;
        const dist = options.distance || 8;
        const cameraPos = new THREE.Vector3(centerX, height, dist);
        const lookAt = new THREE.Vector3(centerX, 1.2, 0);
        return { position: cameraPos, lookAt };
      }
      default:
        return null;
    }
  }
}
