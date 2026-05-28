import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Dodge — 闪避（KOF/街霸风格专业版）
 *
 * 更大幅度的闪避动作：
 * - 后撤步更大
 * - 身体倾斜更明显
 * - 快速弹回
 */
export class Dodge extends AnimationBase {
  constructor() {
    super('Dodge', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'slow'],
      minHeight: 0.5,
      maxHeight: 3.0,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Lean back (0-0.25) - 快速后撤
    if (t < 0.25) {
      const p = t / 0.25;
      const ease = 1 - Math.pow(1 - p, 2);

      // 后撤步更大
      pose.mesh = { x: -ease * 0.5, rx: -ease * 0.4, y: -ease * 0.06 };

      // 双臂护脸
      pose.rightShoulder = { rz: -ease * 0.8, rx: -ease * 0.6 };
      pose.rightElbow = { rx: -ease * 0.7 };
      pose.leftShoulder = { rz: ease * 0.8, rx: -ease * 0.6 };
      pose.leftElbow = { rx: -ease * 0.7 };

      // 腿部：深屈膝准备
      pose.rightHip = { rx: ease * 0.3, rz: ease * 0.05 };
      pose.rightKnee = { rx: ease * 0.4 };
      pose.rightAnkle = { rx: -ease * 0.15 };
      pose.leftHip = { rx: ease * 0.25, rz: -ease * 0.03 };
      pose.leftKnee = { rx: ease * 0.35 };
      pose.leftAnkle = { rx: -ease * 0.12 };

      // 头保持水平（对抗身体倾斜）
      pose.headGroup = { rx: ease * 0.4 * 0.6 };
    }
    // Phase 2: Snap back (0.25-1.0) - 快速回到格斗站姿
    else {
      const p = (t - 0.25) / 0.75;
      const ease = p * p;

      pose.mesh = { x: -0.5 * (1 - ease), rx: -0.4 + ease * 0.4, y: -0.06 + ease * 0.02 };

      pose.rightShoulder = { rz: -0.8 - ease * 0.2, rx: -0.6 + ease * 0.5 };
      pose.rightElbow = { rx: -0.7 + ease * 0.5 };
      pose.leftShoulder = { rz: 0.8 + ease * 0.2, rx: -0.6 + ease * 0.5 };
      pose.leftElbow = { rx: -0.7 + ease * 0.5 };

      pose.rightHip = { rx: 0.3 - ease * 0.25, rz: 0.05 - ease * 0.05 };
      pose.rightKnee = { rx: 0.4 - ease * 0.3 };
      pose.rightAnkle = { rx: -0.15 + ease * 0.1 };
      pose.leftHip = { rx: 0.25 - ease * 0.2, rz: -0.03 + ease * 0.03 };
      pose.leftKnee = { rx: 0.35 - ease * 0.25 };
      pose.leftAnkle = { rx: -0.12 + ease * 0.08 };

      pose.headGroup = { rx: -0.24 + ease * 0.24 };
    }

    return pose;
  }
}
