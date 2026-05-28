import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Kick — 前踢（KOF/街霸风格专业版）
 *
 * 核心改进：
 * - 提膝更高（hip rx -1.6+ rad）
 * - 踢出时腿完全伸直（knee rx 1.8+ rad 展开）
 * - 支撑腿更弯曲稳定重心
 * - 躯干后仰保持平衡
 * - 手臂展开→收紧配合踢击
 */
export class Kick extends AnimationBase {
  constructor() {
    super('Kick', 0.6);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Chamber (0-0.22) - 提膝蓄力
    if (t < 0.22) {
      const p = t / 0.22;
      const ease = p * p;

      // 右腿：高提膝，髋屈接近90°
      pose.rightHip = { rx: -ease * 1.6, rz: ease * 0.15 };
      pose.rightKnee = { rx: ease * 1.8 };
      pose.rightAnkle = { rx: -ease * 0.4 };

      // 左腿：支撑明显弯曲
      pose.leftHip = { rx: ease * 0.25, rz: -ease * 0.05 };
      pose.leftKnee = { rx: ease * 0.5 };
      pose.leftAnkle = { rx: -ease * 0.2 };

      // 双臂：展开保持平衡
      pose.rightShoulder = { rz: -ease * 0.8, rx: -ease * 0.3 };
      pose.rightElbow = { rx: -ease * 0.5 };
      pose.leftShoulder = { rz: ease * 0.8, rx: -ease * 0.3 };
      pose.leftElbow = { rx: -ease * 0.5 };

      // 身体：微后仰保持平衡
      pose.mesh = { y: ease * 0.02, rx: -ease * 0.08 };

      // 头：微后仰
      pose.headGroup = { rx: -0.06 * ease };
    }
    // Phase 2: KICK! (0.22-0.40) - 腿伸直踢出
    else if (t < 0.40) {
      const p = (t - 0.22) / 0.18;
      const ease = 1 - Math.pow(1 - p, 3);

      // 右腿：髋前推，膝完全伸直，踝绷直
      pose.rightHip = { rx: -1.6 + ease * 0.5, rz: 0.15 - ease * 0.1 };
      pose.rightKnee = { rx: 1.8 - ease * 1.8 };
      pose.rightAnkle = { rx: -0.4 + ease * 0.3 };

      // 左腿：保持稳定支撑
      pose.leftHip = { rx: 0.25, rz: -0.05 };
      pose.leftKnee = { rx: 0.5 };
      pose.leftAnkle = { rx: -0.2 };

      // 双臂：收紧护脸
      pose.rightShoulder = { rz: -0.8 + ease * 0.5, rx: -0.3 + ease * 0.2 };
      pose.rightElbow = { rx: -0.5 + ease * 0.3 };
      pose.leftShoulder = { rz: 0.8 - ease * 0.5, rx: -0.3 + ease * 0.2 };
      pose.leftElbow = { rx: -0.5 + ease * 0.3 };

      // 身体：突进 + 后仰回中
      pose.mesh = { x: ease * 0.25, y: 0.02, rx: -0.08 + ease * 0.05 };

      // 头：回中
      pose.headGroup = { rx: -0.06 + ease * 0.04 };
    }
    // Phase 3: Hold (0.40-0.50) - 维持踢击姿态
    else if (t < 0.50) {
      const p = (t - 0.40) / 0.10;

      pose.rightHip = { rx: -1.1, rz: 0.05 };
      pose.rightKnee = { rx: 0 };
      pose.rightAnkle = { rx: -0.1 };

      pose.leftHip = { rx: 0.25, rz: -0.05 };
      pose.leftKnee = { rx: 0.5 };
      pose.leftAnkle = { rx: -0.2 };

      pose.rightShoulder = { rz: -0.3, rx: -0.1 };
      pose.rightElbow = { rx: -0.2 };
      pose.leftShoulder = { rz: 0.3, rx: -0.1 };
      pose.leftElbow = { rx: -0.2 };

      pose.mesh = { x: 0.25, y: 0.02, rx: -0.03 };
      pose.headGroup = { rx: -0.02 };
    }
    // Phase 4: Retract (0.50-0.70) - 收腿
    else if (t < 0.70) {
      const p = (t - 0.50) / 0.20;
      const ease = p * p;

      pose.rightHip = { rx: -1.1 - ease * 0.3, rz: 0.05 - ease * 0.05 };
      pose.rightKnee = { rx: ease * 0.6 };
      pose.rightAnkle = { rx: -0.1 + ease * 0.1 };

      pose.leftHip = { rx: 0.25 - ease * 0.1, rz: -0.05 + ease * 0.02 };
      pose.leftKnee = { rx: 0.5 - ease * 0.2 };
      pose.leftAnkle = { rx: -0.2 + ease * 0.1 };

      pose.rightShoulder = { rz: -0.3 + ease * 0.3, rx: -0.1 + ease * 0.1 };
      pose.rightElbow = { rx: -0.2 + ease * 0.2 };
      pose.leftShoulder = { rz: 0.3 - ease * 0.3, rx: -0.1 + ease * 0.1 };
      pose.leftElbow = { rx: -0.2 + ease * 0.2 };

      pose.mesh = { x: 0.25 * (1 - ease), y: 0.02 - ease * 0.03 };
      pose.headGroup = { rx: -0.02 + ease * 0.02 };
    }
    // Phase 5: Recover (0.70-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.70) / 0.30;
      const ease = p * p;

      pose.rightHip = { rx: -1.4 + ease * 0.35, rz: ease * 0.05 };
      pose.rightKnee = { rx: 0.6 - ease * 0.6 };
      pose.rightAnkle = { rx: -ease * 0.1 };

      pose.leftHip = { rx: 0.15 + ease * 0.05, rz: -0.03 + ease * 0.03 };
      pose.leftKnee = { rx: 0.3 + ease * 0.05 };
      pose.leftAnkle = { rx: -0.1 - ease * 0.05 };

      pose.rightShoulder = { rz: -ease * 0.6, rx: -ease * 0.4 };
      pose.rightElbow = { rx: -ease * 0.3 };
      pose.leftShoulder = { rz: ease * 0.4, rx: -ease * 0.3 };
      pose.leftElbow = { rx: -ease * 0.2 };

      pose.mesh = { y: -ease * 0.04, rx: ease * 0.02 };
      pose.headGroup = { rx: 0 };
    }

    return pose;
  }
}
