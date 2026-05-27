import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Kick — 前踢（13点矩阵控制版）
 *
 * 使用关节：rightHip, rightKnee, rightAnkle, leftHip, leftKnee,
 *           rightShoulder, leftShoulder, headGroup, mesh
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

    // Phase 1: Chamber (0-0.25) - 提膝蓄力
    if (t < 0.25) {
      const p = t / 0.25;
      const ease = p * p;

      // 右腿：提膝
      pose.rightHip = { rx: -ease * 1.2 };
      pose.rightKnee = { rx: ease * 1.5 };
      pose.rightAnkle = { rx: -ease * 0.3 };

      // 左腿：支撑微屈
      pose.leftHip = { rx: ease * 0.1 };
      pose.leftKnee = { rx: ease * 0.2 };

      // 双臂：平衡展开
      pose.rightShoulder = { rz: -ease * 0.6, rx: -ease * 0.4 };
      pose.leftShoulder = { rz: ease * 0.6, rx: -ease * 0.4 };

      // 身体：微升
      pose.mesh = { y: ease * 0.03 };

      // 头：后仰保持平衡
      pose.headGroup = { rx: -0.05 * ease, ry: -0.03 * ease };
    }
    // Phase 2: KICK! (0.25-0.45) - 腿伸直踢出
    else if (t < 0.45) {
      const p = (t - 0.25) / 0.2;
      const ease = 1 - Math.pow(1 - p, 2);

      // 右腿：髋前推，膝伸直，踝绷直
      pose.rightHip = { rx: -1.2 + ease * 0.3 };
      pose.rightKnee = { rx: 1.5 - ease * 1.5 };
      pose.rightAnkle = { rx: -0.3 + ease * 0.2 };

      // 左腿：保持稳定
      pose.leftHip = { rx: 0.1 };
      pose.leftKnee = { rx: 0.2 };

      // 双臂：收紧
      pose.rightShoulder = { rz: -0.6 + ease * 0.3, rx: -0.4 + ease * 0.2 };
      pose.leftShoulder = { rz: 0.6 - ease * 0.3, rx: -0.4 + ease * 0.2 };

      // 身体：突进
      pose.mesh = { x: ease * 0.2 };

      // 头：前倾
      pose.headGroup = { rx: -0.05 + ease * 0.12, ry: ease * 0.06 };
    }
    // Phase 3: Retract (0.45-0.7) - 收腿
    else if (t < 0.7) {
      const p = (t - 0.45) / 0.25;
      const ease = p * p;

      pose.rightHip = { rx: -0.9 - ease * 0.2 };
      pose.rightKnee = { rx: ease * 0.8 };
      pose.rightAnkle = { rx: -0.1 + ease * 0.1 };

      pose.leftHip = { rx: 0.1 - ease * 0.1 };
      pose.leftKnee = { rx: 0.2 - ease * 0.2 };

      pose.rightShoulder = { rz: -0.3 + ease * 0.3, rx: -0.2 + ease * 0.2 };
      pose.leftShoulder = { rz: 0.3 - ease * 0.3, rx: -0.2 + ease * 0.2 };

      pose.mesh = { x: 0.2 * (1 - ease) };

      pose.headGroup = { rx: 0.07 * (1 - ease), ry: 0.06 * (1 - ease) };
    }
    // Phase 4: Recover (0.7-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.7) / 0.3;
      const ease = p * p;

      pose.rightHip = { rx: -1.1 + ease * 0.25 };
      pose.rightKnee = { rx: 0.8 - ease * 0.8 };
      pose.rightAnkle = { rx: -ease * 0.1 };

      pose.leftHip = { rx: ease * 0.2 };
      pose.leftKnee = { rx: ease * 0.2 };

      pose.rightShoulder = { rz: -ease * 0.9, rx: -ease * 0.7 };
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.4 };

      pose.mesh = { y: -ease * 0.06 };

      pose.headGroup = { rx: 0, ry: 0 };
    }

    return pose;
  }
}
