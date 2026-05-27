import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * GetUp — 起身（13点矩阵控制版）
 */
export class GetUp extends AnimationBase {
  constructor() {
    super('GetUp', 0.8);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: ['tiny', 'floating'],
      minHeight: 0.5,
      maxHeight: 3.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Roll (0-0.2) - 侧滚
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;

      pose.mesh = { rx: -1.7 + ease * 1.0, rz: ease * 0.3, y: -0.3 + ease * 0.15 };

      pose.rightShoulder = { rz: 1.1 - ease * 0.6, rx: ease * 0.5 };
      pose.rightElbow = { rx: ease * 0.3 };
      pose.leftShoulder = { rz: -1.1 + ease * 0.6, rx: ease * 0.5 };
      pose.leftElbow = { rx: ease * 0.3 };

      pose.rightHip = { rx: -0.6 + ease * 0.3 };
      pose.rightKnee = { rx: ease * 0.3 };
      pose.leftHip = { rx: -0.5 + ease * 0.3 };
      pose.leftKnee = { rx: ease * 0.2 };
    }
    // Phase 2: Push up (0.2-0.5) - 撑地起身
    else if (t < 0.5) {
      const p = (t - 0.2) / 0.3;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = { rx: -0.7 + ease * 0.7, rz: 0.3 - ease * 0.3, y: -0.15 + ease * 0.2, x: -ease * 0.1 };

      pose.rightShoulder = { rz: 0.5 - ease * 0.5, rx: 0.5 - ease * 0.5 };
      pose.rightElbow = { rx: 0.3 - ease * 0.3 };
      pose.leftShoulder = { rz: -0.5 + ease * 0.5, rx: 0.5 - ease * 0.5 };
      pose.leftElbow = { rx: 0.3 - ease * 0.3 };

      pose.rightHip = { rx: -0.3 + ease * 0.3 };
      pose.rightKnee = { rx: 0.3 - ease * 0.2 };
      pose.leftHip = { rx: -0.2 + ease * 0.2 };
      pose.leftKnee = { rx: 0.2 - ease * 0.1 };
    }
    // Phase 3: Crouch (0.5-0.7) - 低姿准备站立
    else if (t < 0.7) {
      const p = (t - 0.5) / 0.2;
      const ease = p * p;

      pose.mesh = { rx: ease * 0.05, y: 0.05 - ease * 0.08, x: -0.1 + ease * 0.05 };

      pose.rightShoulder = { rz: ease * 0.2, rx: -ease * 0.2 };
      pose.rightElbow = { rx: -ease * 0.3 };
      pose.leftShoulder = { rz: -ease * 0.2, rx: -ease * 0.2 };
      pose.leftElbow = { rx: -ease * 0.3 };

      pose.rightHip = { rx: ease * 0.4 };
      pose.rightKnee = { rx: ease * 0.3 };
      pose.leftHip = { rx: ease * 0.3 };
      pose.leftKnee = { rx: ease * 0.25 };
    }
    // Phase 4: Stand (0.7-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.7) / 0.3;
      const ease = p * p;

      pose.mesh = { rx: 0.05 + ease * 0.03, y: -0.03 - ease * 0.03 };

      pose.rightShoulder = { rz: 0.2 - ease * 1.1, rx: -0.2 - ease * 0.5 };
      pose.rightElbow = { rx: -0.3 - ease * 0.5 };
      pose.leftShoulder = { rz: -0.2 + ease * 0.7, rx: -0.2 - ease * 0.2 };
      pose.leftElbow = { rx: -0.3 - ease * 0.2 };

      pose.rightHip = { rx: 0.4 - ease * 0.15 };
      pose.rightKnee = { rx: 0.3 - ease * 0.1 };
      pose.leftHip = { rx: 0.3 - ease * 0.1 };
      pose.leftKnee = { rx: 0.25 - ease * 0.05 };
    }

    return pose;
  }
}
