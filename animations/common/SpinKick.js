import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SpinKick — 回旋踢（13点矩阵控制版）
 *
 * 使用关节：rightHip, rightKnee, rightAnkle, leftHip, leftKnee,
 *           rightShoulder, leftShoulder, mesh
 */
export class SpinKick extends AnimationBase {
  constructor() {
    super('SpinKick', 0.8);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Wind up (0-0.2) - 蓄力旋转
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;

      pose.rightShoulder = { rz: -ease * 0.5, rx: -ease * 0.3 };
      pose.rightElbow = { rx: -ease * 0.4 };
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.3 };
      pose.leftElbow = { rx: -ease * 0.4 };

      pose.rightHip = { rx: -ease * 0.8 };
      pose.rightKnee = { rx: ease * 0.5 };
      pose.leftHip = { rx: ease * 0.1 };

      pose.mesh = { y: -ease * 0.05, ry: -ease * 0.2 };
    }
    // Phase 2: SPIN (0.2-0.55) - 旋转踢出
    else if (t < 0.55) {
      const p = (t - 0.2) / 0.35;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.rightShoulder = { rz: -0.5 + ease * 0.3, rx: -0.3 + ease * 0.2 };
      pose.rightElbow = { rx: -0.4 + ease * 0.2 };
      pose.leftShoulder = { rz: 0.5 - ease * 0.3, rx: -0.3 + ease * 0.2 };
      pose.leftElbow = { rx: -0.4 + ease * 0.2 };

      pose.rightHip = { rx: -0.8 + ease * 1.2 };
      pose.rightKnee = { rx: 0.5 - ease * 0.8 };
      pose.rightAnkle = { rx: ease * 0.3 };
      pose.leftHip = { rx: 0.1 - ease * 0.3 };
      pose.leftKnee = { rx: ease * 0.2 };

      pose.mesh = { y: -0.05 + ease * 0.08, x: ease * 0.3, ry: -0.2 + ease * 0.5 };
    }
    // Phase 3: Retract (0.55-0.75) - 收腿
    else if (t < 0.75) {
      const p = (t - 0.55) / 0.2;
      const ease = p * p;

      pose.rightHip = { rx: 0.4 - ease * 0.4 };
      pose.rightKnee = { rx: -0.3 + ease * 0.5 };
      pose.leftHip = { rx: -0.2 + ease * 0.2 };
      pose.leftKnee = { rx: 0.2 - ease * 0.2 };

      pose.rightShoulder = { rz: -0.2 + ease * 0.2, rx: -0.1 + ease * 0.1 };
      pose.rightElbow = { rx: -0.2 + ease * 0.2 };
      pose.leftShoulder = { rz: 0.2 - ease * 0.2, rx: -0.1 + ease * 0.1 };
      pose.leftElbow = { rx: -0.2 + ease * 0.2 };

      pose.mesh = { y: 0.03 - ease * 0.03, x: 0.3 * (1 - ease), ry: 0.3 - ease * 0.3 };
    }
    // Phase 4: Recover (0.75-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.75) / 0.25;
      const ease = p * p;

      pose.rightHip = { rx: ease * 0.25 };
      pose.rightKnee = { rx: ease * 0.2 };
      pose.leftHip = { rx: ease * 0.2 };
      pose.leftKnee = { rx: ease * 0.15 };

      pose.rightShoulder = { rz: -ease * 0.9, rx: -ease * 0.7 };
      pose.rightElbow = { rx: -ease * 0.5 };
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.4 };
      pose.leftElbow = { rx: -ease * 0.4 };

      pose.mesh = { y: -ease * 0.06 };
    }

    return pose;
  }
}
