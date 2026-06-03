import { AnimationBase, PoseMatrix } from 'dula-engine';

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function numberOption(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function depthFromOptions(options) {
  const preset = String(options.level || options.height || '').toLowerCase();
  if (preset === 'shallow' || preset === 'low') return 0.16;
  if (preset === 'mid' || preset === 'medium') return 0.28;
  if (preset === 'deep' || preset === 'high') return 0.42;

  return numberOption(options.depth ?? options.amount ?? options.lower, 0.28);
}

function heightFromDepth(depth) {
  // 蹲得越深，跳得越高：线性映射 depth 0.04~0.52 -> height 0.3~2.0
  return 0.3 + (depth / 0.52) * 1.7;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

/**
 * CrouchJump — 下蹲蓄力起跳（组合动作）
 *
 * 内置三段式：蓄力下蹲 → 爆发起跳 → 缓冲落地
 * 下蹲深度自动决定起跳高度（蹲得越深，跳得越高）
 *
 * Story examples:
 *   {Zorak}{CrouchJump|depth=0.35|duration=1.2}
 *   {Zorak}{CrouchJump|level=deep|arms=balance}
 *   {Zorak}{CrouchJump|height=1.5|duration=1.5}  // 直接指定起跳高度
 */
export class CrouchJump extends AnimationBase {
  constructor(options = {}) {
    super('CrouchJump', Math.max(0.5, numberOption(options.duration, 1.2)));
    this.usePoseMatrix = true;

    // 下蹲深度
    this.depth = clamp(0.04, 0.52, depthFromOptions(options));

    // 起跳高度：优先使用直接配置，否则联动下蹲深度
    const explicitHeight = numberOption(options.height, null);
    this.jumpHeight = explicitHeight !== null
      ? clamp(0.2, 3.0, explicitHeight)
      : heightFromDepth(this.depth);

    // 前倾角度
    this.lean = clamp(-0.05, 0.35, numberOption(options.lean, 0.1));

    // 手臂姿势：guard（防御）/ balance（平衡）/ none（自然下垂）/ reach（前伸）
    this.arms = String(options.arms || 'balance').toLowerCase();

    // 各阶段时长比例（相对总时长）
    this.crouchRatio = clamp(0.15, 0.45, numberOption(options.crouchRatio, 0.25));
    this.jumpRatio = clamp(0.25, 0.6, numberOption(options.jumpRatio, 0.45));
    // 落地恢复 = 剩余部分

    this.tags = {
      requires: ['rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'alien'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.5,
      maxHeight: 4.0,
    };
  }

  getPoseMatrix(t, elapsed = 0, duration = this.duration) {
    const pose = new PoseMatrix();
    const activeDuration = Math.max(0.01, duration || this.duration);

    // 计算各阶段边界
    const crouchEnd = this.crouchRatio;
    const jumpEnd = crouchEnd + this.jumpRatio;
    const landEnd = 1.0;

    const depth = this.depth;
    const lean = this.lean;
    const jumpH = this.jumpHeight;

    if (t < crouchEnd) {
      // ===== Phase 1: 蓄力下蹲 =====
      const p = t / crouchEnd;
      const ease = easeOutCubic(p);
      const breathe = Math.sin(elapsed * Math.PI * 2.2) * 0.008 * ease;
      const bend = clamp(0, 1.15, depth / 0.45);

      pose.mesh = {
        y: -depth * ease + breathe,
        rx: lean * ease,
      };

      pose.headGroup = {
        rx: -lean * 0.55 * ease,
      };

      // 深蹲：臀部后移，膝盖前弯
      pose.rightHip = { rx: -0.35 * bend * ease };
      pose.leftHip = { rx: -0.35 * bend * ease };
      pose.rightKnee = { rx: 1.1 * bend * ease };
      pose.leftKnee = { rx: 1.1 * bend * ease };
      pose.rightAnkle = { rx: -0.55 * bend * ease };
      pose.leftAnkle = { rx: -0.55 * bend * ease };

      this._applyArms(pose, ease, -depth * ease / this.jumpHeight);

    } else if (t < jumpEnd) {
      // ===== Phase 2: 爆发起跳 + 空中 =====
      const p = (t - crouchEnd) / (jumpEnd - crouchEnd);
      // 抛物线起跳：从地面加速上升，顶点减速，然后自然下落
      // 使用二次贝塞尔曲线模拟真实抛体运动
      // p=0(地面) -> p=0.5(顶点) -> p=1(落地前)
      let y;
      if (p < 0.5) {
        // 上升阶段：加速上升
        const up = p / 0.5; // 0 -> 1
        y = jumpH * (2 * up - up * up); // 二次缓出，顶点时达到 jumpH
      } else {
        // 下降阶段：加速下落
        const down = (p - 0.5) / 0.5; // 0 -> 1
        y = jumpH * (1 - down * down); // 二次缓入，平滑下降
      }
      // 前30%还在蹬地，从深蹲位置过渡到起跳
      const launchEase = easeOutCubic(Math.min(1, p / 0.3));
      y = -depth * (1 - launchEase) + y;

      pose.mesh = {
        y: Math.max(-depth, y),
        rx: lean * (1 - p * 0.5), // 逐渐恢复直立
      };

      pose.headGroup = {
        rx: -lean * 0.55 * (1 - p * 0.5),
      };

      // 蹬地：腿从弯曲到伸直
      const legStraighten = easeOutCubic(Math.min(1, p / 0.4));
      const bend = clamp(0, 1.15, depth / 0.45);

      pose.rightHip = { rx: -0.35 * bend * (1 - legStraighten) };
      pose.leftHip = { rx: -0.35 * bend * (1 - legStraighten) };
      pose.rightKnee = { rx: 1.1 * bend * (1 - legStraighten) };
      pose.leftKnee = { rx: 1.1 * bend * (1 - legStraighten) };
      pose.rightAnkle = { rx: -0.55 * bend * (1 - legStraighten) + legStraighten * 0.3 };
      pose.leftAnkle = { rx: -0.55 * bend * (1 - legStraighten) + legStraighten * 0.3 };

      this._applyArms(pose, 1 - p * 0.3, y / this.jumpHeight);

    } else {
      // ===== Phase 3: 缓冲落地 =====
      const p = (t - jumpEnd) / (landEnd - jumpEnd);
      const ease = easeOutQuad(p);

      // 从空中回到地面（继续从Phase2结束时的下落轨迹）
      // Phase2结束时p=1, y=0（已在地面），所以Phase3应该保持在地面上
      const y = 0;

      pose.mesh = {
        y: Math.max(0, y),
        rx: lean * 0.5 * (1 - ease),
      };

      pose.headGroup = {
        rx: -lean * 0.3 * (1 - ease),
      };

      // 落地缓冲：保持直立姿势，不做膝盖弯曲（避免idle恢复时的视觉上升）
      // 所有关节显式设为0，确保动画结束时的pose与PoseMatrix.zero()完全一致
      // 这样_idle恢复时不会有任何lerp变化
      pose.rightHip = { rx: 0 };
      pose.leftHip = { rx: 0 };
      pose.rightKnee = { rx: 0 };
      pose.leftKnee = { rx: 0 };
      pose.rightAnkle = { rx: 0 };
      pose.leftAnkle = { rx: 0 };

      this._applyArms(pose, 0.7 * (1 - ease), y / this.jumpHeight);
    }

    return pose;
  }

  _applyArms(pose, enter, heightRatio) {
    // heightRatio: 身体高度相对于 jumpHeight 的比例
    // -0.2(深蹲) -> 1.0(顶点) -> 0(地面)
    // 手臂摆动与身体高度联动：越低越后摆蓄力，越高越上举

    if (this.arms === 'guard') {
      pose.rightShoulder = { rz: -0.5 * enter, rx: -0.45 * enter };
      pose.leftShoulder = { rz: 0.5 * enter, rx: -0.45 * enter };
      pose.rightElbow = { rx: -0.7 * enter };
      pose.leftElbow = { rx: -0.7 * enter };
    } else if (this.arms === 'balance') {
      // 手臂上举角度与身体高度正相关
      // 深蹲(-0.2) -> 手臂后摆约45度
      // 顶点(1.0) -> 手臂上举约140度（更夸张）
      // 落地(0) -> 手臂回落约0度
      const armRx = (-0.45 + heightRatio * 1.8) * enter;
      const armRz = 0.5 * enter; // 侧向展开保持平衡

      pose.rightShoulder = { rz: -armRz, rx: armRx };
      pose.leftShoulder = { rz: armRz, rx: armRx };

      // 肘部：上举时微弯，下落时更弯
      const elbowBend = -0.25 - Math.max(0, heightRatio) * 0.35;
      pose.rightElbow = { rx: elbowBend * enter };
      pose.leftElbow = { rx: elbowBend * enter };
    } else if (this.arms === 'reach') {
      // 手臂前伸（抓取/扑击）
      // 深蹲时收臂蓄力，起跳时猛力前伸，顶点伸最直
      const reach = Math.max(0, heightRatio); // 0 -> 1 -> 0
      const armRx = (-0.3 - reach * 1.0) * enter; // 前伸
      pose.rightShoulder = { rx: armRx, rz: -0.2 * enter };
      pose.leftShoulder = { rx: armRx, rz: 0.2 * enter };
      const elbowBend = -0.6 + reach * 0.4; // 顶点时最直
      pose.rightElbow = { rx: elbowBend * enter };
      pose.leftElbow = { rx: elbowBend * enter };
    }
    // arms === 'none'：不做任何设置，保持自然下垂
  }
}
