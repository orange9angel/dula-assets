import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Knockdown — 击倒（13点矩阵控制版）
 */
export class Knockdown extends AnimationBase {
  constructor() {
    super('Knockdown', 0.8);
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

    // Phase 1: Impact flinch (0-0.15)
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;

      pose.mesh = { rx: -ease * 0.3, x: -ease * 0.1 };

      pose.rightShoulder = { rz: ease * 0.3, rx: ease * 0.3 };
      pose.rightElbow = { rx: ease * 0.3 };
      pose.leftShoulder = { rz: -ease * 0.3, rx: ease * 0.3 };
      pose.leftElbow = { rx: ease * 0.3 };

      pose.headGroup = { rx: ease * 0.1 };
    }
    // Phase 2: Fall back (0.15-0.6) - 向后倒下
    else if (t < 0.6) {
      const p = (t - 0.15) / 0.45;
      const ease = 1 - Math.pow(1 - p, 2);
      const arc = Math.sin(p * Math.PI) * 0.15;

      pose.mesh = { rx: -0.3 - ease * 1.4, x: -0.1 - ease * 0.4, y: arc - ease * 0.3 };

      pose.rightShoulder = { rz: 0.3 + ease * 0.8, rx: 0.3 + ease * 0.5 };
      pose.rightElbow = { rx: 0.3 + ease * 0.3 };
      pose.leftShoulder = { rz: -0.3 - ease * 0.8, rx: 0.3 + ease * 0.5 };
      pose.leftElbow = { rx: 0.3 + ease * 0.3 };

      pose.rightHip = { rx: -ease * 0.6 };
      pose.rightKnee = { rx: ease * 0.4 };
      pose.leftHip = { rx: -ease * 0.5 };
      pose.leftKnee = { rx: ease * 0.3 };

      pose.headGroup = { rx: p * 0.3 };
    }
    // Phase 3: Hit ground (0.6-0.75) - 落地反弹
    else if (t < 0.75) {
      const p = (t - 0.6) / 0.15;
      const bounce = Math.sin(p * Math.PI) * 0.03;

      pose.mesh = { rx: -1.7, x: -0.5, y: -0.3 + bounce };

      pose.rightShoulder = { rz: 1.1 };
      pose.leftShoulder = { rz: -1.1 };

      pose.headGroup = { rx: 0.3 };
    }
    // Phase 4: Lie still (0.75-1.0)
    else {
      pose.mesh = { rx: -1.7, x: -0.5, y: -0.3 };

      pose.rightShoulder = { rz: 1.1 };
      pose.leftShoulder = { rz: -1.1 };

      pose.headGroup = { rx: 0.3 };
    }

    return pose;
  }
}
