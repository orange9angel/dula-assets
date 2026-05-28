import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * GroundSlam — 腾空下砸肘击
 * 高高跳起，身体后仰，然后全身力量下砸
 * 参考：WWE  elbow drop + 格斗游戏重击
 */
export class GroundSlam extends AnimationBase {
  constructor() {
    super('GroundSlam', 1.4);
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

    // Phase 1: Crouch (0-0.12) - 深蹲蓄力
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      pose.mesh = { y: -ease * 0.5 };

      pose.rightHip = { rx: ease * 0.4 };
      pose.rightKnee = { rx: ease * 1.2 };
      pose.leftHip = { rx: ease * 0.4 };
      pose.leftKnee = { rx: ease * 1.2 };

      // 双臂上举
      pose.rightShoulder = { rx: -ease * 2.5 };
      pose.leftShoulder = { rx: -ease * 2.5 };
    }
    // Phase 2: Jump high (0.12-0.30) - 高高跳起
    else if (t < 0.30) {
      const p = (t - 0.12) / 0.18;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = {
        y: -0.5 + ease * 4.0,
        rx: -ease * 0.3,
      };

      // 双腿收起
      pose.rightHip = { rx: 0.4 + ease * 0.6 };
      pose.rightKnee = { rx: 1.2 + ease * 0.4 };
      pose.leftHip = { rx: 0.4 + ease * 0.6 };
      pose.leftKnee = { rx: 1.2 + ease * 0.4 };

      // 双臂保持上举
      pose.rightShoulder = { rx: -2.5 };
      pose.rightElbow = { rx: -ease * 0.3 };
      pose.leftShoulder = { rx: -2.5 };
      pose.leftElbow = { rx: -ease * 0.3 };
    }
    // Phase 3: Lean back (0.30-0.45) - 后仰准备
    else if (t < 0.45) {
      const p = (t - 0.30) / 0.15;
      const ease = p * p;

      pose.mesh = {
        y: 3.5,
        rx: -0.3 - ease * 0.8,
      };

      // 右腿弯曲，左腿伸直
      pose.rightHip = { rx: 1.0 };
      pose.rightKnee = { rx: 1.6 };
      pose.leftHip = { rx: 1.0 - ease * 0.3 };
      pose.leftKnee = { rx: 1.6 - ease * 0.8 };

      // 右臂后拉，左臂前伸
      pose.rightShoulder = { rx: -2.5 + ease * 1.0, rz: -ease * 0.5 };
      pose.rightElbow = { rx: -0.3 - ease * 1.0 };
      pose.leftShoulder = { rx: -2.5 + ease * 0.5 };
      pose.leftElbow = { rx: -0.3 };
    }
    // Phase 4: SLAM! (0.45-0.55) - 下砸
    else if (t < 0.55) {
      const p = (t - 0.45) / 0.10;
      const ease = 1 - Math.pow(1 - p, 3);

      pose.mesh = {
        y: 3.5 - ease * 4.0,
        rx: -1.1 + ease * 1.1,
      };

      // 右腿伸直下砸
      pose.rightHip = { rx: 1.0 - ease * 0.8 };
      pose.rightKnee = { rx: 1.6 - ease * 1.6 };
      pose.leftHip = { rx: 0.7 - ease * 0.5 };
      pose.leftKnee = { rx: 0.8 - ease * 0.5 };

      // 右臂肘击下砸
      pose.rightShoulder = { rx: -1.5 + ease * 0.5, rz: -0.5 };
      pose.rightElbow = { rx: -1.3 + ease * 0.8 };
      pose.leftShoulder = { rx: -2.0 + ease * 1.5 };
      pose.leftElbow = { rx: -0.3 - ease * 0.5 };
    }
    // Phase 5: Impact hold (0.55-0.70) - 砸地停顿
    else if (t < 0.70) {
      pose.mesh = { y: -0.5 };

      pose.rightHip = { rx: 0.2 };
      pose.rightKnee = { rx: 0 };
      pose.leftHip = { rx: 0.2 };
      pose.leftKnee = { rx: 0.3 };

      pose.rightShoulder = { rx: -1.0, rz: -0.5 };
      pose.rightElbow = { rx: -0.5 };
      pose.leftShoulder = { rx: -0.5 };
      pose.leftElbow = { rx: -0.8 };
    }
    // Phase 6: Recover (0.70-1.0) - 起身恢复
    else {
      const p = (t - 0.70) / 0.30;
      const ease = p * p;

      pose.mesh = { y: -0.5 + ease * 0.5 };

      pose.rightHip = { rx: 0.2 - ease * 0.2 };
      pose.rightKnee = { rx: ease * 0.15 };
      pose.leftHip = { rx: 0.2 - ease * 0.2 };
      pose.leftKnee = { rx: 0.3 - ease * 0.15 };

      pose.rightShoulder = { rx: -1.0 + ease * 0.8, rz: -0.5 + ease * 0.5 };
      pose.rightElbow = { rx: -0.5 + ease * 0.3 };
      pose.leftShoulder = { rx: -0.5 + ease * 0.3 };
      pose.leftElbow = { rx: -0.8 + ease * 0.5 };
    }

    return pose;
  }
}
