import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Dodge — 闪避（13点矩阵控制版）
 *
 * 使用关节：rightShoulder, rightElbow, leftShoulder, leftElbow,
 *           rightHip, rightKnee, leftHip, leftKnee, headGroup, mesh
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

    // Phase 1: Lean back (0-0.3) - 快速后撤
    if (t < 0.3) {
      const p = t / 0.3;
      const ease = 1 - Math.pow(1 - p, 2);

      // 后撤
      pose.mesh = { x: -ease * 0.4, rx: -ease * 0.35, y: -ease * 0.08 };

      // 双臂护脸
      pose.rightShoulder = { rz: -ease * 0.7, rx: -ease * 0.5 };
      pose.rightElbow = { rx: -ease * 0.6 };
      pose.leftShoulder = { rz: ease * 0.7, rx: -ease * 0.5 };
      pose.leftElbow = { rx: -ease * 0.6 };

      // 腿部：屈膝准备
      pose.rightHip = { rx: ease * 0.2 };
      pose.rightKnee = { rx: ease * 0.3 };
      pose.leftHip = { rx: ease * 0.15 };
      pose.leftKnee = { rx: ease * 0.25 };

      // 头保持水平
      pose.headGroup = { rx: ease * 0.35 * 0.6 };
    }
    // Phase 2: Snap back (0.3-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.3) / 0.7;
      const ease = p * p;

      pose.mesh = { x: -0.4 * (1 - ease), rx: -0.35 + ease * 0.35, y: -0.08 + ease * 0.02 };

      pose.rightShoulder = { rz: -0.7 - ease * 0.2, rx: -0.5 + ease * 0.5 };
      pose.rightElbow = { rx: -0.6 + ease * 0.6 };
      pose.leftShoulder = { rz: 0.7 - ease * 0.2, rx: -0.5 + ease * 0.5 };
      pose.leftElbow = { rx: -0.6 + ease * 0.6 };

      pose.rightHip = { rx: 0.2 - ease * 0.2 };
      pose.rightKnee = { rx: 0.3 - ease * 0.3 };
      pose.leftHip = { rx: 0.15 - ease * 0.15 };
      pose.leftKnee = { rx: 0.25 - ease * 0.25 };

      pose.headGroup = { rx: -0.21 + ease * 0.21 };
    }

    return pose;
  }
}
