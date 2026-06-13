import * as THREE from 'three';

/**
 * SceneDirector — 多人场景位置编排与对话朝向控制
 *
 * 职责：
 * 1. FormationEngine：语义化布局（semicircle/triangle/line/diamond/staggered）
 *    - 根据角色数量自动计算位置
 *    - 简单避障（避开场景中的大型物体）
 *    - 通过 char.moveTo() 平滑移动角色
 * 2. DialogueGazeController：自动对话朝向
 *    - auto 模式：谁说话，其他人自动面向说话人
 *    - fixed 模式：所有人都固定看某个目标
 *    - group 模式：分组对话，组内互相看
 *    - free 模式：不控制朝向（手动 Position 优先）
 *
 * 设计原则：
 * - 与 CombatDirector 不冲突：检测到 inCombat 的角色不控制
 * - 与手动 Position 不冲突：手动 face 优先级高于 auto gaze
 * - 不写 {SceneDirector:...} 标签 = 完全回退到现有行为
 */

// 场景物体避障配置：哪些类型的物体会阻挡角色站位
const OBSTACLE_TYPES = new Set([
  'rock', 'boulder', 'tree', 'building', 'wall', 'crate', 'pillar',
]);

// 默认角色间距（米）
const DEFAULT_CHAR_SPACING = 2.5;

// 避障缓冲距离（米）
const OBSTACLE_BUFFER = 0.8;

export class SceneDirector {
  constructor(storyboard) {
    this.sb = storyboard;
    this.formations = [];      // { startTime, type, center, radius, focusChar, options, positions }
    this.gazeEvents = [];      // { startTime, endTime, mode, target, groups, options }
    this.currentFormation = null;
    this.currentGazeMode = 'free';
    this.currentGazeTarget = null;
    this.currentGazeGroups = null;
    this.appliedFormations = new Set(); // 已应用过的 formation startTime
    this._lastSpeaker = null;
    this._lastSpeakerTime = -1;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //  公共 API：编排
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * 编排一个布局
   * @param {string} type - 'semicircle' | 'triangle' | 'line' | 'diamond' | 'staggered' | 'conversation' | 'vshape' | 'arc'
   * @param {Object} center - { x, y, z }
   * @param {number} radius - 布局半径（米）
   * @param {string|null} focusChar - 焦点角色（布局中心朝向的角色）
   * @param {number} startTime - 应用时间
   * @param {Object} options - 额外选项
   */
  scheduleFormation(type, center, radius, focusChar, startTime, options = {}) {
    const chars = this._getActiveCharacters();
    if (chars.length === 0) return;

    const positions = this._computePositions(type, chars, center, radius, focusChar, options);

    this.formations.push({
      startTime,
      type,
      center: { ...center },
      radius,
      focusChar,
      options,
      positions,
    });

    // 按时间排序
    this.formations.sort((a, b) => a.startTime - b.startTime);

    // 清除已应用标记中早于当前时间的（允许重新应用相同时间的布局）
    // 这里不需要特殊处理，appliedFormations 用 startTime 作为 key

    console.log(`[SceneDirector] Formation scheduled: ${type} at t=${startTime.toFixed(2)}s, focus=${focusChar}, chars=${chars.map(c => c.name).join(',')}`);
  }

  /**
   * 编排朝向模式
   * @param {string} mode - 'auto' | 'fixed' | 'group' | 'free'
   * @param {string|null} target - fixed 模式的目标角色
   * @param {number} startTime - 开始时间
   * @param {number} duration - 持续时间（0 = 永久）
   * @param {Object} options - { groups: [[name1,name2], [name3,name4]] }
   */
  scheduleGaze(mode, target, startTime, duration = 0, options = {}) {
    this.gazeEvents.push({
      startTime,
      endTime: duration > 0 ? startTime + duration : Infinity,
      mode,
      target,
      groups: options.groups || null,
      options,
    });

    // 按时间排序
    this.gazeEvents.sort((a, b) => a.startTime - b.startTime);

    console.log(`[SceneDirector] Gaze scheduled: ${mode} at t=${startTime.toFixed(2)}s, target=${target}`);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //  公共 API：运行时更新
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * 每帧调用，应用布局和更新朝向
   * @param {number} t - 当前时间
   */
  update(t) {
    this._applyFormationsAtTime(t);
    this._applyPendingMoves(t);
    this._updateGazeAtTime(t);
    this._updateCharacterFacing(t);
  }

  /**
   * 处理待执行的移动动画
   */
  _applyPendingMoves(t) {
    if (!this._pendingMoves) return;
    const remaining = [];
    for (const pm of this._pendingMoves) {
      if (t >= pm.startTime && t <= pm.startTime + pm.duration + 0.1) {
        // 查找动画注册表并播放
        const { AnimationRegistry } = this.sb;
        const WalkAnim = AnimationRegistry?.['Walk'];
        const RunAnim = AnimationRegistry?.['Run'];
        if (pm.dist > 3 && RunAnim) {
          pm.char.playAnimation(RunAnim, pm.startTime, pm.duration);
        } else if (WalkAnim) {
          pm.char.playAnimation(WalkAnim, pm.startTime, pm.duration);
        }
      } else if (t < pm.startTime) {
        remaining.push(pm);
      }
      // 已过期的不再保留
    }
    this._pendingMoves = remaining;
  }

  /**
   * 立即应用一个布局（用于场景切换时）
   * @param {string} type
   * @param {Object} center
   * @param {number} radius
   * @param {string|null} focusChar
   * @param {Object} options
   */
  applyFormationNow(type, center, radius, focusChar, options = {}) {
    const chars = this._getActiveCharacters();
    if (chars.length === 0) return;

    const positions = this._computePositions(type, chars, center, radius, focusChar, options);

    // 立即设置位置（不移动）
    for (const [name, pos] of Object.entries(positions)) {
      const char = this.sb.characters.get(name);
      if (!char || this._isInCombat(char)) continue;
      char.setPosition(pos.x, pos.y, pos.z);
      if (pos.face && typeof pos.face === 'string') {
        this._applyFace(char, pos.face);
      }
    }

    this.currentFormation = { type, center: { ...center }, radius, focusChar, options, positions };

    // 标记为已应用，避免 update() 中重复应用
    // 查找匹配的 scheduled formation 并标记
    for (const formation of this.formations) {
      if (formation.startTime <= 0 && formation.type === type) {
        this.appliedFormations.add(formation.startTime);
      }
    }
  }

  /**
   * 清除所有编排
   */
  clear() {
    this.formations = [];
    this.gazeEvents = [];
    this.currentFormation = null;
    this.currentGazeMode = 'free';
    this.currentGazeTarget = null;
    this.currentGazeGroups = null;
    this.appliedFormations.clear();
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //  内部：布局计算
  // ═════════════════════════════════════════════════════════════════════════════

  _computePositions(type, chars, center, radius, focusChar, options = {}) {
    const positions = {};
    const count = chars.length;
    const cx = center.x ?? 0;
    const cy = center.y ?? 0.01;
    const cz = center.z ?? 0;

    // 获取焦点角色的索引（如果有）
    const focusIndex = focusChar ? chars.findIndex(c => c.name === focusChar) : -1;

    switch (type) {
      case 'semicircle':
      case 'conversation': {
        // 焦点角色在最前方（朝向相机方向），其他人在后方半圆
        // 如果没有焦点，所有人均匀分布在半圆上
        const effectiveCount = focusIndex >= 0 ? count - 1 : count;
        const angleStep = effectiveCount > 1 ? Math.PI / (effectiveCount) : 0;
        const startAngle = Math.PI; // 从左侧开始

        let sideIdx = 0;
        for (let i = 0; i < count; i++) {
          const char = chars[i];
          if (i === focusIndex) {
            // 焦点角色在圆心前方
            positions[char.name] = {
              x: cx,
              y: cy,
              z: cz + radius * 0.3,
              face: 'center',
            };
          } else {
            const angle = startAngle + sideIdx * angleStep;
            const px = cx + Math.cos(angle) * radius;
            const pz = cz + Math.sin(angle) * radius * 0.5; // 压扁一点，不要太深
            positions[char.name] = {
              x: px,
              y: cy,
              z: pz,
              face: focusChar || 'center',
            };
            sideIdx++;
          }
        }
        break;
      }

      case 'triangle': {
        // 3人三角：焦点在顶点，其他两人在底边
        if (count >= 1) {
          const topIdx = focusIndex >= 0 ? focusIndex : 0;
          positions[chars[topIdx].name] = {
            x: cx,
            y: cy,
            z: cz - radius * 0.5,
            face: 'center',
          };
          const others = chars.filter((_, i) => i !== topIdx);
          if (others.length >= 1) {
            positions[others[0].name] = {
              x: cx - radius * 0.6,
              y: cy,
              z: cz + radius * 0.4,
              face: focusChar || chars[topIdx].name,
            };
          }
          if (others.length >= 2) {
            positions[others[1].name] = {
              x: cx + radius * 0.6,
              y: cy,
              z: cz + radius * 0.4,
              face: focusChar || chars[topIdx].name,
            };
          }
          // 多余的人放在后面
          for (let i = 3; i < count; i++) {
            const angle = Math.PI + (i - 3) * 0.5;
            positions[chars[i].name] = {
              x: cx + Math.cos(angle) * radius * 0.8,
              y: cy,
              z: cz + Math.sin(angle) * radius * 0.5,
              face: focusChar || 'center',
            };
          }
        }
        break;
      }

      case 'line': {
        // 横排，所有人面向前方（-Z 方向，朝向相机）
        const spacing = options.spacing ?? DEFAULT_CHAR_SPACING;
        const offset = ((count - 1) * spacing) / 2;
        const faceTarget = options.face || focusChar || 'forward';
        for (let i = 0; i < count; i++) {
          positions[chars[i].name] = {
            x: cx + i * spacing - offset,
            y: cy,
            z: cz,
            face: faceTarget,
          };
        }
        break;
      }

      case 'diamond': {
        // 菱形：4人站四角，适合对峙/谈判
        if (count >= 1) {
          positions[chars[0].name] = { x: cx, y: cy, z: cz - radius * 0.6, face: 'center' };
        }
        if (count >= 2) {
          positions[chars[1].name] = { x: cx + radius * 0.6, y: cy, z: cz, face: chars[0].name };
        }
        if (count >= 3) {
          positions[chars[2].name] = { x: cx, y: cy, z: cz + radius * 0.6, face: chars[0].name };
        }
        if (count >= 4) {
          positions[chars[3].name] = { x: cx - radius * 0.6, y: cy, z: cz, face: chars[0].name };
        }
        // 多余的人放在外围
        for (let i = 4; i < count; i++) {
          const angle = (i - 4) * Math.PI / 2 + Math.PI / 4;
          positions[chars[i].name] = {
            x: cx + Math.cos(angle) * radius * 0.9,
            y: cy,
            z: cz + Math.sin(angle) * radius * 0.9,
            face: focusChar || chars[0].name,
          };
        }
        break;
      }

      case 'staggered': {
        // 前后两排交错
        const spacing = options.spacing ?? DEFAULT_CHAR_SPACING;
        const rowDepth = options.rowDepth ?? radius * 0.5;
        const frontCount = Math.ceil(count / 2);
        const backCount = count - frontCount;
        const frontOffset = ((frontCount - 1) * spacing) / 2;
        const backOffset = ((backCount - 1) * spacing) / 2;

        for (let i = 0; i < count; i++) {
          const isFront = i < frontCount;
          const rowIdx = isFront ? i : i - frontCount;
          const rowZ = isFront ? cz - rowDepth * 0.5 : cz + rowDepth * 0.5;
          const rowOffset = isFront ? frontOffset : backOffset;
          const stagger = isFront ? 0 : spacing * 0.5;

          positions[chars[i].name] = {
            x: cx + rowIdx * spacing - rowOffset + stagger,
            y: cy,
            z: rowZ,
            face: focusChar || 'center',
          };
        }
        break;
      }

      case 'vshape': {
        // V 字形：焦点在顶点，其他人沿两臂展开
        const armAngle = options.armAngle ?? Math.PI / 3; // 60度张角
        const armLength = options.armLength ?? radius;
        const topIdx = focusIndex >= 0 ? focusIndex : 0;

        positions[chars[topIdx].name] = {
          x: cx,
          y: cy,
          z: cz - armLength * 0.3,
          face: 'center',
        };

        const others = chars.filter((_, i) => i !== topIdx);
        const leftCount = Math.ceil(others.length / 2);
        for (let i = 0; i < others.length; i++) {
          const isLeft = i < leftCount;
          const sideIdx = isLeft ? i : i - leftCount;
          const sideCount = isLeft ? leftCount : others.length - leftCount;
          const step = armLength / Math.max(sideCount, 1);
          const dist = (sideIdx + 1) * step;
          const angle = isLeft ? -armAngle / 2 : armAngle / 2;

          positions[others[i].name] = {
            x: cx + Math.sin(angle) * dist,
            y: cy,
            z: cz - Math.cos(angle) * dist,
            face: focusChar || chars[topIdx].name,
          };
        }
        break;
      }

      case 'arc': {
        // 弧线：所有人均匀分布在一段弧上，面向弧心
        const arcAngle = options.arcAngle ?? Math.PI * 0.8; // 144度弧
        const startAngle = -arcAngle / 2;
        const step = count > 1 ? arcAngle / (count - 1) : 0;

        for (let i = 0; i < count; i++) {
          const angle = startAngle + i * step;
          positions[chars[i].name] = {
            x: cx + Math.sin(angle) * radius,
            y: cy,
            z: cz - Math.cos(angle) * radius * 0.5,
            face: focusChar || 'center',
          };
        }
        break;
      }

      default: {
        // 回退到 line
        const spacing = DEFAULT_CHAR_SPACING;
        const offset = ((count - 1) * spacing) / 2;
        for (let i = 0; i < count; i++) {
          positions[chars[i].name] = {
            x: cx + i * spacing - offset,
            y: cy,
            z: cz,
            face: focusChar || 'forward',
          };
        }
      }
    }

    // 避障调整
    if (options.avoidObstacles !== false) {
      for (const [name, pos] of Object.entries(positions)) {
        const adjusted = this._avoidObstacles({ ...pos }, name);
        positions[name] = adjusted;
      }
    }

    return positions;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //  内部：避障
  // ═════════════════════════════════════════════════════════════════════════════

  _avoidObstacles(pos, charName) {
    const scene = this.sb.currentScene;
    if (!scene || !scene.scene) return pos;

    const char = this.sb.characters.get(charName);
    const myRadius = char?.boundingRadius ?? 0.5;

    // 收集所有场景中的几何体（递归遍历 Group）
    const obstacles = [];
    this._collectObstacles(scene.scene, obstacles, char?.mesh);

    for (const obj of obstacles) {
      const { objRadius, objHeight, objPos } = obj;

      // 水平距离检查
      const dx = pos.x - objPos.x;
      const dz = pos.z - objPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = myRadius + objRadius + OBSTACLE_BUFFER;

      if (dist < minDist && dist > 0.01) {
        // 沿远离方向偏移
        const pushFactor = (minDist - dist) / dist;
        pos.x += dx * pushFactor;
        pos.z += dz * pushFactor;
      }
    }

    return pos;
  }

  /**
   * 递归收集场景中的所有障碍物几何体
   */
  _collectObstacles(node, obstacles, charMesh) {
    if (!node) return;

    // 跳过角色自身
    if (node === charMesh) return;

    // 如果是网格且有几何体，评估是否为障碍物
    if (node.geometry) {
      const obstacle = this._evaluateObstacle(node);
      if (obstacle) obstacles.push(obstacle);
    }

    // 递归遍历子节点
    if (node.children) {
      for (const child of node.children) {
        this._collectObstacles(child, obstacles, charMesh);
      }
    }
  }

  /**
   * 评估一个网格是否为角色需要避开的障碍物
   * 返回 { objRadius, objHeight, objPos } 或 null
   */
  _evaluateObstacle(obj) {
    const geoType = obj.geometry.type;

    // 跳过地板和天花板（PlaneGeometry 或水平的大平面）
    if (geoType === 'PlaneGeometry') return null;

    // 跳过角色骨骼/SkinnedMesh
    if (geoType === 'BufferGeometry' && obj.isSkinnedMesh) return null;

    let objRadius = 0;
    let objHeight = 0;

    if (obj.geometry.boundingSphere) {
      objRadius = obj.geometry.boundingSphere.radius * Math.max(obj.scale.x, obj.scale.z);
      objHeight = obj.geometry.boundingSphere.radius * 2 * obj.scale.y;
    } else if (obj.geometry.parameters) {
      const p = obj.geometry.parameters;
      if (p.radius !== undefined) {
        // SphereGeometry, DodecahedronGeometry, IcosahedronGeometry, etc.
        objRadius = p.radius * Math.max(obj.scale.x, obj.scale.z);
        objHeight = p.radius * 2 * obj.scale.y;
      } else if (p.width !== undefined) {
        // BoxGeometry: width, height, depth
        const w = p.width * obj.scale.x;
        const h = p.height * obj.scale.y;
        const d = (p.depth || p.width) * obj.scale.z;
        // 只把"垂直结构"（墙、柱子）当作障碍物，跳过扁平的物体
        if (h < Math.max(w, d) * 0.5) return null;
        objRadius = Math.max(w, d) * 0.5;
        objHeight = h;
      } else if (p.radiusTop !== undefined) {
        // CylinderGeometry, ConeGeometry
        objRadius = Math.max(p.radiusTop, p.radiusBottom || 0) * Math.max(obj.scale.x, obj.scale.z);
        objHeight = (p.height || 0) * obj.scale.y;
      }
    }

    if (objRadius < 0.3) return null; // 太小的物体忽略
    if (objRadius > 8) return null;   // 太大的物体（如整个房间的结构）忽略

    // 世界空间位置
    const objPos = new THREE.Vector3();
    obj.getWorldPosition(objPos);

    // 跳过在角色头顶或脚下的物体
    if (objPos.y + objHeight * 0.5 < 0.3) return null; // 在脚底下
    if (objPos.y - objHeight * 0.5 > 2.5) return null; // 在头顶上

    return { objRadius, objHeight, objPos };
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //  内部：应用布局
  // ═════════════════════════════════════════════════════════════════════════════

  _applyFormationsAtTime(t) {
    for (const formation of this.formations) {
      if (formation.startTime > t) continue;
      if (this.appliedFormations.has(formation.startTime)) continue;

      this.appliedFormations.add(formation.startTime);
      this.currentFormation = formation;

      // 重新计算位置，使用当前活跃的角色（可能包括新加入场景的角色）
      const chars = this._getActiveCharacters();
      const positions = this._computePositions(
        formation.type,
        chars,
        formation.center,
        formation.radius,
        formation.focusChar,
        formation.options
      );
      formation.positions = positions;

      // 移动角色到目标位置
      for (const [name, pos] of Object.entries(positions)) {
        const char = this.sb.characters.get(name);
        if (!char || this._isInCombat(char)) continue;

        const currentPos = char.mesh.position;
        const dist = Math.sqrt(
          (pos.x - currentPos.x) ** 2 +
          (pos.z - currentPos.z) ** 2
        );

        // 如果 formation 的开始时间已经过去超过 0.5s，说明我们是在"补应用"
        //（例如 verify 从中间开始渲染），此时直接瞬移，避免角色从旧位置飞过来
        const isLateApply = t > formation.startTime + 0.5;

        if (dist < 0.1 || isLateApply) {
          // 已经很近了，或者是补应用，直接设置位置
          char.setPosition(pos.x, pos.y, pos.z);
          // 清除可能存在的旧移动指令，避免冲突
          if (char.moves) {
            char.moves = char.moves.filter(m => m.endTime <= t);
          }
        } else {
          // 使用 moveTo 平滑移动
          const duration = formation.options.moveDuration ?? Math.min(2.0, dist / 2);
          // 清除与当前 formation 时间重叠的旧移动指令，避免冲突
          if (char.moves) {
            const formationEnd = formation.startTime + duration;
            char.moves = char.moves.filter(m => m.endTime <= formation.startTime || m.startTime >= formationEnd);
          }
          char.moveTo({ x: pos.x, y: pos.y, z: pos.z }, formation.startTime, duration);

          // 自动播放移动动画（延迟到运行时通过 AnimationRegistry 查找）
          // 在 update 循环中通过 _pendingMoves 处理
          if (!this._pendingMoves) this._pendingMoves = [];
          this._pendingMoves.push({
            char,
            startTime: formation.startTime,
            duration,
            dist,
          });
        }
      }

      console.log(`[SceneDirector] Formation applied: ${formation.type} at t=${t.toFixed(2)}s, chars=${Object.keys(positions).join(',')}`);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //  内部：朝向控制
  // ═════════════════════════════════════════════════════════════════════════════

  _updateGazeAtTime(t) {
    // 找到当前活跃的 gaze 事件
    let activeGaze = null;
    for (const ev of this.gazeEvents) {
      if (t >= ev.startTime && t <= ev.endTime) {
        activeGaze = ev;
      }
    }

    if (activeGaze) {
      this.currentGazeMode = activeGaze.mode;
      this.currentGazeTarget = activeGaze.target;
      this.currentGazeGroups = activeGaze.groups;
    } else if (this.gazeEvents.length > 0 && t > this.gazeEvents[this.gazeEvents.length - 1].endTime) {
      // 所有 gaze 事件都结束了，回退到 free
      this.currentGazeMode = 'free';
      this.currentGazeTarget = null;
      this.currentGazeGroups = null;
    }
  }

  _updateCharacterFacing(t) {
    if (this.currentGazeMode === 'free') return;

    const chars = this._getActiveCharacters();
    const speaker = this._getCurrentSpeaker(t);

    // 如果当前有手动 Position 标签设置了 face，且时间在当前条目内，跳过自动朝向
    // （手动 face 优先级更高）
    const manualFaceChars = this._getManualFaceCharsAtTime(t);

    for (const char of chars) {
      if (this._isInCombat(char)) continue;
      if (manualFaceChars.has(char.name)) continue;

      let targetName = null;

      switch (this.currentGazeMode) {
        case 'auto': {
          // 谁说话大家看谁；说话人看听众群体的中心（或formation焦点）
          if (speaker && speaker !== char.name) {
            // 听众面向说话人
            targetName = speaker;
          } else if (speaker === char.name) {
            // 说话人面向听众群体的中心位置，或formation焦点
            const listeners = chars.filter(c => c.name !== speaker && !this._isInCombat(c));
            if (this.currentFormation?.focusChar && this.currentFormation.focusChar !== speaker) {
              // 如果有formation焦点且焦点不是说话人自己，面向焦点
              targetName = this.currentFormation.focusChar;
            } else if (listeners.length === 1) {
              // 只有一个听众，直接面向他
              targetName = listeners[0].name;
            } else if (listeners.length > 1) {
              // 多个听众：面向听众群体的中心（而不是最近的单个听众）
              let centerX = 0, centerZ = 0;
              for (const l of listeners) {
                centerX += l.mesh.position.x;
                centerZ += l.mesh.position.z;
              }
              centerX /= listeners.length;
              centerZ /= listeners.length;
              // 直接设置rotation而不是通过targetName
              const dx = centerX - char.mesh.position.x;
              const dz = centerZ - char.mesh.position.z;
              char.mesh.rotation.y = Math.atan2(dx, dz);
              continue; // 跳过下面的 _faceCharacter
            }
          }
          break;
        }
        case 'fixed': {
          targetName = this.currentGazeTarget;
          break;
        }
        case 'group': {
          // 分组模式：找到 char 所在的组，看组的焦点
          if (this.currentGazeGroups) {
            const group = this.currentGazeGroups.find(g => g.includes(char.name));
            if (group) {
              // 组内其他人互相看，或者看组外焦点
              const focus = this.currentGazeTarget;
              if (focus && !group.includes(focus)) {
                targetName = focus;
              } else {
                // 组内找另一个成员看
                const other = group.find(n => n !== char.name);
                if (other) targetName = other;
              }
            }
          }
          break;
        }
      }

      if (targetName) {
        this._faceCharacter(char, targetName);
      }
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //  内部：辅助方法
  // ═════════════════════════════════════════════════════════════════════════════

  _getActiveCharacters() {
    const result = [];
    if (!this.sb.currentScene) return result;

    for (const char of this.sb.currentScene.characters) {
      if (char.mesh && char.mesh.visible !== false) {
        result.push(char);
      }
    }
    return result;
  }

  _isInCombat(char) {
    return char.userData?.inCombat === true || char.mesh?.userData?.inCombat === true;
  }

  _getCurrentSpeaker(t) {
    // 使用 Storyboard 的 entries 找到当前说话人
    if (!this.sb.entries) return null;

    // 缓存：同一帧内避免重复计算
    if (this._lastSpeakerTime === t) {
      return this._lastSpeaker;
    }

    for (const entry of this.sb.entries) {
      if (!entry.character) continue;
      const audioDur = this.sb.audioDurations?.get(entry.index);
      const speakDuration = audioDur ? Math.max(0.05, audioDur + 0.15) : (entry.endTime - entry.startTime);
      const speechEndTime = Math.max(entry.endTime, entry.startTime + speakDuration);

      if (t >= entry.startTime && t <= speechEndTime) {
        this._lastSpeakerTime = t;
        this._lastSpeaker = entry.character;
        return entry.character;
      }
    }

    this._lastSpeakerTime = t;
    this._lastSpeaker = null;
    return null;
  }

  _getManualFaceCharsAtTime(t) {
    // 检查当前时间是否有手动 Position 标签设置了 face
    const manualChars = new Set();
    if (!this.sb.storyPlacements) return manualChars;

    for (const p of this.sb.storyPlacements) {
      if (p.scene !== this.sb.currentSceneName) continue;
      if (p.startTime === undefined || Math.abs(p.startTime - t) < 0.1) {
        if (p.face) manualChars.add(p.character);
      }
    }
    return manualChars;
  }

  _faceCharacter(char, targetName) {
    const targetChar = this.sb.characters.get(targetName);
    if (!targetChar || !targetChar.mesh) {
      // 目标不是角色，可能是 'center' / 'forward' / 'back' 等
      this._applyFace(char, targetName);
      return;
    }

    // 水平朝向目标
    const dx = targetChar.mesh.position.x - char.mesh.position.x;
    const dz = targetChar.mesh.position.z - char.mesh.position.z;
    char.mesh.rotation.y = Math.atan2(dx, dz);
  }

  _applyFace(char, face) {
    if (!char || !char.mesh) return;

    if (face === 'center') {
      const dx = -(char.mesh.position.x);
      const dz = -(char.mesh.position.z);
      char.mesh.rotation.y = Math.atan2(dx, dz);
    } else if (face === 'forward') {
      char.mesh.lookAt(char.mesh.position.x, char.mesh.position.y, char.mesh.position.z + 5);
    } else if (face === 'back') {
      char.mesh.rotation.y = Math.PI;
    } else if (face === 'left') {
      char.mesh.rotation.y = -Math.PI / 2;
    } else if (face === 'right') {
      char.mesh.rotation.y = Math.PI / 2;
    } else if (face === 'camera') {
      // Face toward the camera (positive Z direction)
      char.mesh.lookAt(char.mesh.position.x, char.mesh.position.y, char.mesh.position.z + 5);
    } else {
      // 尝试作为角色名
      const targetChar = this.sb.characters.get(face);
      if (targetChar && targetChar.mesh) {
        const dx = targetChar.mesh.position.x - char.mesh.position.x;
        const dz = targetChar.mesh.position.z - char.mesh.position.z;
        char.mesh.rotation.y = Math.atan2(dx, dz);
      }
    }
  }
}
