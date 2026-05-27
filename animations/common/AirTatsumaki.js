import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * AirTatsumaki — 空中龙卷旋风脚（街霸经典对空技）
 *
 * 隆的标志性动作：起跳后身体水平，双腿交替踢出，
 * 整个人在空中横向旋转推进。ry 旋转 720°+，视觉冲击极强。
 *
 * 5段式：
 *   0.00-0.12 起跳蓄力（深蹲→蹬地）
 *   0.12-0.30 升空旋转（身体水平化，ry 0→-3.5）
 *   0.30-0.58 空中连踢（ry -3.5→-7.0，双腿交替伸展）
 *   0.58-0.78 下落减速（ry 保持，高度下降）
 *   0.78-1.00 落地恢复（屈膝缓冲→站起）
 */
export class AirTatsumaki extends AnimationBase {
  constructor() {
    super('AirTatsumaki', 1.05);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Launch prep (0-0.12) — 极短蓄力，深蹲蹬地
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      pose.mesh = {
        y: -ease * 0.3,
        x: -ease * 0.06,
        rx: ease * 0.25,
      };

      pose.headGroup = { rx: ease * 0.12 };

      // 双臂：收紧胸前准备
      pose.rightShoulder = { rz: -ease * 0.65, rx: -ease * 0.55 };
      pose.rightElbow = { rx: -ease * 0.85 };
      pose.leftShoulder = { rz: ease * 0.65, rx: -ease * 0.55 };
      pose.leftElbow = { rx: -ease * 0.85 };

      // 双腿：深蹲蓄力
      pose.rightHip = { rx: ease * 0.55 };
      pose.rightKnee = { rx: ease * 1.05 };
      pose.rightAnkle = { rx: -ease * 0.18 };
      pose.leftHip = { rx: ease * 0.45 };
      pose.leftKnee = { rx: ease * 0.95 };
      pose.leftAnkle = { rx: -ease * 0.16 };
    }
    // Phase 2: LAUNCH & SPIN (0.12-0.30) — 蹬地升空，身体水平化
    else if (t < 0.30) {
      const p = (t - 0.12) / 0.18;
      const ease = 1 - Math.pow(1 - p, 3);
      const lift = 1.0 * ease;

      // 身体：快速升空+水平化+开始旋转
      pose.mesh = {
        y: -0.3 + lift,
        x: -0.06 + ease * 0.25,
        rx: 0.25 - ease * 0.65,
        ry: -ease * 3.5,
        rz: -ease * 0.12,
      };

      pose.headGroup = {
        rx: 0.12 - ease * 0.3,
        ry: ease * 0.25,
      };

      // 双臂：展开保持平衡（像直升机旋翼）
      pose.rightShoulder = {
        rz: -0.65 - ease * 0.55,
        rx: -0.55 + ease * 0.25,
      };
      pose.rightElbow = { rx: -0.85 + ease * 0.35 };
      pose.leftShoulder = {
        rz: 0.65 + ease * 0.55,
        rx: -0.55 + ease * 0.25,
      };
      pose.leftElbow = { rx: -0.85 + ease * 0.35 };

      // 右腿：开始伸直踢出
      pose.rightHip = {
        rx: 0.55 - ease * 1.5,
        rz: -ease * 0.4,
      };
      pose.rightKnee = { rx: 1.05 - ease * 0.6 };
      pose.rightAnkle = { rx: -0.18 - ease * 0.18 };

      // 左腿：收膝准备交替
      pose.leftHip = { rx: 0.45 - ease * 1.1 };
      pose.leftKnee = { rx: 0.95 + ease * 0.35 };
      pose.leftAnkle = { rx: -0.16 - ease * 0.1 };
    }
    // Phase 3: MID-AIR SPIN (0.30-0.58) — 空中720°旋转，双腿交替踢
    else if (t < 0.58) {
      const p = (t - 0.30) / 0.28;
      const ease = p * p;
      // 两圈完整旋转：从 -3.5 到 -7.0 (约 400° 额外)
      const spinAngle = -3.5 - ease * 3.5;
      const legCycle = Math.sin(p * Math.PI * 4); // 两腿交替4次

      // 身体：水平悬浮，持续旋转，横向推进
      pose.mesh = {
        y: 0.7 + Math.sin(p * Math.PI * 2) * 0.06,
        x: 0.19 + ease * 0.6,
        rx: -0.4 + Math.sin(p * Math.PI * 2) * 0.04,
        ry: spinAngle,
        rz: -0.12 + Math.sin(p * Math.PI * 3) * 0.06,
      };

      pose.headGroup = {
        rx: -0.18 + Math.sin(p * Math.PI * 2) * 0.05,
        ry: 0.25 + Math.sin(p * Math.PI) * 0.08,
      };

      // 双臂：随旋转大幅摆动（像风车）
      pose.rightShoulder = {
        rz: -1.2 + Math.sin(p * Math.PI * 4) * 0.4,
        rx: -0.3 + Math.cos(p * Math.PI * 4) * 0.15,
      };
      pose.rightElbow = { rx: -0.5 + Math.sin(p * Math.PI * 4) * 0.25 };
      pose.leftShoulder = {
        rz: 1.2 + Math.sin(p * Math.PI * 4 + Math.PI) * 0.4,
        rx: -0.3 + Math.cos(p * Math.PI * 4 + Math.PI) * 0.15,
      };
      pose.leftElbow = { rx: -0.5 + Math.sin(p * Math.PI * 4 + Math.PI) * 0.25 };

      // 双腿：交替踢出（剪刀腿，一伸一收）
      pose.rightHip = {
        rx: -0.95 + legCycle * 0.55,
        rz: -0.4 + legCycle * 0.2,
      };
      pose.rightKnee = { rx: 0.45 - legCycle * 0.35 };
      pose.rightAnkle = { rx: -0.36 + legCycle * 0.12 };

      pose.leftHip = {
        rx: -0.65 - legCycle * 0.55,
        rz: legCycle * 0.15,
      };
      pose.leftKnee = { rx: 1.3 + legCycle * 0.25 };
      pose.leftAnkle = { rx: -0.26 - legCycle * 0.08 };
    }
    // Phase 4: DESCEND (0.58-0.78) — 下落，旋转减速
    else if (t < 0.78) {
      const p = (t - 0.58) / 0.2;
      const ease = p * p;

      pose.mesh = {
        y: 0.7 - ease * 0.85,
        x: 0.79 - ease * 0.2,
        rx: -0.36 + ease * 0.45,
        ry: -7.0 + ease * 1.8,
        rz: -0.12 + ease * 0.12,
      };

      pose.headGroup = {
        rx: -0.13 + ease * 0.18,
        ry: 0.25 - ease * 0.25,
      };

      pose.rightShoulder = {
        rz: -1.2 + ease * 0.6,
        rx: -0.3 + ease * 0.2,
      };
      pose.rightElbow = { rx: -0.5 + ease * 0.3 };
      pose.leftShoulder = {
        rz: 1.2 - ease * 0.6,
        rx: -0.3 + ease * 0.2,
      };
      pose.leftElbow = { rx: -0.5 + ease * 0.3 };

      pose.rightHip = {
        rx: -0.95 + ease * 0.8,
        rz: -0.4 + ease * 0.25,
      };
      pose.rightKnee = { rx: 0.45 + ease * 0.35 };
      pose.rightAnkle = { rx: -0.36 + ease * 0.2 };

      pose.leftHip = {
        rx: -0.65 + ease * 0.6,
        rz: -ease * 0.1,
      };
      pose.leftKnee = { rx: 1.3 - ease * 0.7 };
      pose.leftAnkle = { rx: -0.26 + ease * 0.15 };
    }
    // Phase 5: Landing (0.78-1.0) — 屈膝缓冲→站起
    else {
      const p = (t - 0.78) / 0.22;
      const ease = 1 - Math.pow(1 - p, 2);
      const bounce = Math.sin(p * Math.PI) * 0.05;

      pose.mesh = {
        y: -0.15 + bounce + ease * 0.03,
        x: 0.59 * (1 - ease),
        rx: 0.09 - ease * 0.09,
        ry: -5.2 * (1 - ease),
        rz: 0,
      };

      pose.headGroup = {
        rx: 0.05 * (1 - ease),
        ry: 0,
      };

      pose.rightShoulder = {
        rz: -0.6 - ease * 0.3,
        rx: -0.1 - ease * 0.4,
      };
      pose.rightElbow = { rx: -0.2 - ease * 0.55 };
      pose.leftShoulder = {
        rz: 0.6 + ease * 0.1,
        rx: -0.1 - ease * 0.3,
      };
      pose.leftElbow = { rx: -0.2 - ease * 0.45 };

      pose.rightHip = { rx: -0.15 + ease * 0.15 };
      pose.rightKnee = { rx: 0.8 - ease * 0.55 };
      pose.rightAnkle = { rx: -0.16 + ease * 0.06 };

      pose.leftHip = { rx: -0.05 + ease * 0.05 };
      pose.leftKnee = { rx: 0.6 - ease * 0.4 };
      pose.leftAnkle = { rx: -0.11 + ease * 0.04 };
    }

    return pose;
  }
}
