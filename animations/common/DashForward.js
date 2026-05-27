import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * DashForward — 前冲（13点矩阵控制版）
 */
export class DashForward extends AnimationBase {
  constructor() {
    super('DashForward', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'slow', 'floating'],
      minHeight: 0.5,
      maxHeight: 3.0,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Wind up (0-0.15) - 后撤蓄力
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;

      pose.mesh = { x: -ease * 0.1, y: -ease * 0.05 };

      pose.rightShoulder = { rz: -ease * 0.4 };
      pose.rightElbow = { rx: -ease * 0.3 };
      pose.leftShoulder = { rz: ease * 0.4 };
      pose.leftElbow = { rx: -ease * 0.3 };

      pose.rightHip = { rx: ease * 0.3 };
      pose.rightKnee = { rx: ease * 0.3 };
      pose.leftHip = { rx: -ease * 0.2 };
      pose.leftKnee = { rx: ease * 0.2 };
    }
    // Phase 2: DASH! (0.15-0.3) - 爆发突进
    else if (t < 0.3) {
      const p = (t - 0.15) / 0.15;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = { x: -0.1 + ease * 0.6, y: -0.05 + ease * 0.02 };

      pose.rightShoulder = { rz: -0.4 - ease * 0.3, rx: -ease * 0.6 };
      pose.rightElbow = { rx: -0.3 - ease * 0.3 };
      pose.leftShoulder = { rz: 0.4 + ease * 0.3, rx: -ease * 0.6 };
      pose.leftElbow = { rx: -0.3 - ease * 0.3 };

      pose.rightHip = { rx: 0.3 - ease * 0.8 };
      pose.rightKnee = { rx: 0.3 - ease * 0.5 };
      pose.leftHip = { rx: -0.2 + ease * 0.6 };
      pose.leftKnee = { rx: 0.2 + ease * 0.3 };
    }
    // Phase 3: Brake (0.3-1.0) - 刹车到格斗站姿
    else {
      const p = (t - 0.3) / 0.7;
      const ease = p * p;

      pose.mesh = { y: -0.03 - ease * 0.03 };

      pose.rightShoulder = { rz: -0.7 - ease * 0.2, rx: -0.6 + ease * 0.1 };
      pose.rightElbow = { rx: -0.6 + ease * 0.3 };
      pose.leftShoulder = { rz: 0.7 - ease * 0.2, rx: -0.6 + ease * 0.6 };
      pose.leftElbow = { rx: -0.6 + ease * 0.4 };

      pose.rightHip = { rx: -0.5 + ease * 0.5 };
      pose.rightKnee = { rx: -0.2 + ease * 0.2 };
      pose.leftHip = { rx: 0.4 - ease * 0.4 };
      pose.leftKnee = { rx: 0.5 - ease * 0.3 };
    }

    return pose;
  }
}
