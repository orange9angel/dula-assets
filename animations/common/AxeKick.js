import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * AxeKick — 战斧下劈腿
 * 腿直直向上踢到头顶，然后像斧头一样垂直下劈
 * 大幅度夸张版本
 */
export class AxeKick extends AnimationBase {
  constructor() {
    super('AxeKick', 1.2);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Chamber (0-0.12) - 提膝蓄力
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      pose.mesh = { y: -ease * 0.2 };

      // 右腿高抬提膝
      pose.rightHip = { rx: -ease * 2.2, rz: ease * 0.3 };
      pose.rightKnee = { rx: ease * 2.4 };
      pose.rightAnkle = { rx: -ease * 0.6 };

      // 左腿支撑微屈
      pose.leftHip = { rx: ease * 0.4 };
      pose.leftKnee = { rx: ease * 0.5 };

      // 手臂张开平衡
      pose.rightShoulder = { rz: -ease * 1.0, rx: -ease * 0.4 };
      pose.leftShoulder = { rz: ease * 1.0, rx: -ease * 0.4 };
    }
    // Phase 2: Extend up (0.12-0.28) - 腿向上伸直
    else if (t < 0.28) {
      const p = (t - 0.12) / 0.16;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = { y: -0.2 + ease * 0.15 };

      // 右腿直直向上（过头顶，髋屈接近180°）
      pose.rightHip = { rx: -2.2 - ease * 1.0, rz: 0.3 };
      pose.rightKnee = { rx: 2.4 - ease * 2.4 };
      pose.rightAnkle = { rx: -0.6 + ease * 0.3 };

      // 左腿支撑
      pose.leftHip = { rx: 0.4 + ease * 0.3 };
      pose.leftKnee = { rx: 0.5 + ease * 0.3 };

      // 手臂保持平衡
      pose.rightShoulder = { rz: -1.0, rx: -0.4 };
      pose.leftShoulder = { rz: 1.0, rx: -0.4 };
    }
    // Phase 3: HOLD at top (0.28-0.40) - 顶点停顿
    else if (t < 0.40) {
      pose.mesh = { y: -0.05 };

      pose.rightHip = { rx: -3.2, rz: 0.3 };
      pose.rightKnee = { rx: 0 };
      pose.rightAnkle = { rx: -0.3 };

      pose.leftHip = { rx: 0.7 };
      pose.leftKnee = { rx: 0.8 };

      pose.rightShoulder = { rz: -1.0 };
      pose.leftShoulder = { rz: 1.0 };
    }
    // Phase 4: CHOP down (0.40-0.55) - 战斧下劈
    else if (t < 0.55) {
      const p = (t - 0.40) / 0.15;
      const ease = 1 - Math.pow(1 - p, 3);

      pose.mesh = { y: -0.05 - ease * 0.3 };

      // 右腿垂直下劈
      pose.rightHip = { rx: -3.2 + ease * 4.0, rz: 0.3 - ease * 0.3 };
      pose.rightKnee = { rx: ease * 0.2 };
      pose.rightAnkle = { rx: -0.3 + ease * 0.6 };

      // 左腿弯曲缓冲
      pose.leftHip = { rx: 0.7 + ease * 0.4 };
      pose.leftKnee = { rx: 0.8 + ease * 0.8 };

      // 手臂配合下劈
      pose.rightShoulder = { rz: -1.0 + ease * 0.6, rx: -ease * 0.4 };
      pose.leftShoulder = { rz: 1.0 - ease * 0.6, rx: -ease * 0.4 };
    }
    // Phase 5: Impact hold (0.55-0.70) - 砸地停顿
    else if (t < 0.70) {
      pose.mesh = { y: -0.35 };

      pose.rightHip = { rx: 0.8 };
      pose.rightKnee = { rx: 0.2 };
      pose.rightAnkle = { rx: 0.3 };

      pose.leftHip = { rx: 1.1 };
      pose.leftKnee = { rx: 1.6 };

      pose.rightShoulder = { rz: -0.4 };
      pose.leftShoulder = { rz: 0.4 };
    }
    // Phase 6: Recover (0.70-1.0) - 恢复站姿
    else {
      const p = (t - 0.70) / 0.30;
      const ease = p * p;

      pose.mesh = { y: -0.35 + ease * 0.35 };

      pose.rightHip = { rx: 0.8 - ease * 0.8 };
      pose.rightKnee = { rx: 0.2 - ease * 0.2 };
      pose.rightAnkle = { rx: 0.3 - ease * 0.3 };

      pose.leftHip = { rx: 1.1 - ease * 1.1 };
      pose.leftKnee = { rx: 1.6 - ease * 1.4 };

      pose.rightShoulder = { rz: -0.4 - ease * 0.8, rx: -ease * 0.8 };
      pose.rightElbow = { rx: -ease * 0.6 };
      pose.leftShoulder = { rz: 0.4 + ease * 0.3, rx: -ease * 0.5 };
      pose.leftElbow = { rx: -ease * 0.5 };
    }

    return pose;
  }
}
