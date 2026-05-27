import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * JumpAttack — 跳击（13点矩阵控制版）
 *
 * 使用关节：全部13点
 */
export class JumpAttack extends AnimationBase {
  constructor() {
    super('JumpAttack', 1.0);
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

    // Phase 1: Crouch (0-0.15) - 蓄力下蹲
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;

      pose.mesh = { y: -ease * 0.12, x: -ease * 0.05 };

      pose.rightShoulder = { rz: -ease * 0.6, rx: ease * 0.3 };
      pose.rightElbow = { rx: ease * 0.5 };
      pose.leftShoulder = { rz: ease * 0.4, rx: ease * 0.2 };
      pose.leftElbow = { rx: ease * 0.3 };

      pose.rightHip = { rx: ease * 0.4 };
      pose.rightKnee = { rx: ease * 0.5 };
      pose.leftHip = { rx: ease * 0.3 };
      pose.leftKnee = { rx: ease * 0.4 };
    }
    // Phase 2: Leap (0.15-0.4) - 起跳前冲
    else if (t < 0.4) {
      const p = (t - 0.15) / 0.25;
      const ease = 1 - Math.pow(1 - p, 2);
      const jumpHeight = Math.sin(p * Math.PI * 0.6) * 0.6;

      pose.mesh = { y: -0.12 + jumpHeight, x: -0.05 + ease * 0.3 };

      pose.rightShoulder = { rz: -0.6 + ease * 0.3, rx: 0.3 - ease * 0.8 };
      pose.rightElbow = { rx: 0.5 - ease * 1.0 };
      pose.leftShoulder = { rz: 0.4 - ease * 0.2, rx: 0.2 - ease * 0.4 };
      pose.leftElbow = { rx: 0.3 - ease * 0.5 };

      pose.rightHip = { rx: 0.4 - ease * 0.6 };
      pose.rightKnee = { rx: 0.5 - ease * 0.8 };
      pose.leftHip = { rx: 0.3 - ease * 0.5 };
      pose.leftKnee = { rx: 0.4 - ease * 0.6 };
    }
    // Phase 3: STRIKE (0.4-0.6) - 空中打击
    else if (t < 0.6) {
      const p = (t - 0.4) / 0.2;
      const ease = 1 - Math.pow(1 - p, 2);
      const fallProgress = p;

      pose.mesh = { y: 0.48 - fallProgress * 0.3, x: 0.3 };

      pose.rightShoulder = { rz: -0.3 - ease * 0.5, rx: -0.5 - ease * 1.0 };
      pose.rightElbow = { rx: -0.5 - ease * 0.5 };
      pose.leftShoulder = { rz: 0.2 + ease * 0.3, rx: -0.2 - ease * 0.3 };
      pose.leftElbow = { rx: -0.2 - ease * 0.3 };

      pose.rightHip = { rx: -0.2 + ease * 0.3 };
      pose.rightKnee = { rx: -0.3 + ease * 0.5 };
      pose.leftHip = { rx: -0.2 + ease * 0.2 };
      pose.leftKnee = { rx: -0.2 + ease * 0.3 };
    }
    // Phase 4: Land (0.6-0.8) - 落地冲击
    else if (t < 0.8) {
      const p = (t - 0.6) / 0.2;
      const ease = p * p;

      pose.mesh = { y: 0.18 - ease * 0.2, rx: ease * 0.1 };

      pose.rightShoulder = { rz: -0.8 + ease * 0.5, rx: -1.5 + ease * 1.0 };
      pose.rightElbow = { rx: -1.0 + ease * 0.8 };
      pose.leftShoulder = { rz: 0.5 - ease * 0.3, rx: -0.5 + ease * 0.3 };
      pose.leftElbow = { rx: -0.5 + ease * 0.3 };

      pose.rightHip = { rx: 0.1 + ease * 0.2 };
      pose.rightKnee = { rx: 0.2 + ease * 0.3 };
      pose.leftHip = { rx: ease * 0.2 };
      pose.leftKnee = { rx: 0.1 + ease * 0.2 };
    }
    // Phase 5: Recover (0.8-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.8) / 0.2;
      const ease = p * p;

      pose.mesh = { y: -0.02 - ease * 0.04, rx: 0.1 - ease * 0.02 };

      pose.rightShoulder = { rz: -0.3 - ease * 0.6, rx: -0.5 - ease * 0.2 };
      pose.rightElbow = { rx: -0.2 - ease * 0.3 };
      pose.leftShoulder = { rz: 0.2 + ease * 0.3, rx: -0.2 - ease * 0.2 };
      pose.leftElbow = { rx: -0.2 - ease * 0.2 };

      pose.rightHip = { rx: 0.3 - ease * 0.05 };
      pose.rightKnee = { rx: 0.3 - ease * 0.1 };
      pose.leftHip = { rx: 0.2 };
      pose.leftKnee = { rx: 0.2 - ease * 0.05 };
    }

    return pose;
  }
}
