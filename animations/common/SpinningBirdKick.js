import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SpinningBirdKick — 旋鸟脚（街霸春丽）
 * 倒立→双腿像直升机螺旋桨一样水平旋转
 */
export class SpinningBirdKick extends AnimationBase {
  constructor() {
    super('SpinningBirdKick', 1.6);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    if (t < 0.15) { // 倒立准备
      const e = (t/0.15)**2;
      pose.mesh = { y: e*0.8, rx: e*3.14 };
      pose.rightShoulder = { rx: -e*0.5 };
      pose.leftShoulder = { rx: -e*0.5 };
      pose.rightHip = { rx: -e*0.3 };
      pose.leftHip = { rx: -e*0.3 };
    }
    else if (t < 0.70) { // 双手撑地旋转！
      const p = (t-0.15)/0.55;
      const e = 1-(1-p)**3;
      const spins = e * Math.PI * 6; // 3圈

      pose.mesh = { y: 0.8, rx: 3.14, ry: spins };

      // 双腿水平展开像螺旋桨
      pose.rightHip = { rx: -0.3, rz: Math.sin(spins*2)*0.3 + 0.8 };
      pose.rightKnee = { rx: 0.1 };
      pose.leftHip = { rx: -0.3, rz: Math.sin(spins*2 + Math.PI)*0.3 - 0.8 };
      pose.leftKnee = { rx: 0.1 };

      // 双手撑地
      pose.rightShoulder = { rx: -0.5, rz: -0.3 };
      pose.rightElbow = { rx: -0.2 };
      pose.leftShoulder = { rx: -0.5, rz: 0.3 };
      pose.leftElbow = { rx: -0.2 };
    }
    else if (t < 0.85) { // 收腿翻转
      const p = (t-0.70)/0.15;
      const e = 1-(1-p)**2;
      pose.mesh = { y: 0.8-e*0.8, rx: 3.14-e*3.14, ry: Math.PI*6 };
      pose.rightHip = { rx: -0.3+e*0.3, rz: 0.8-e*0.8 };
      pose.leftHip = { rx: -0.3+e*0.3, rz: -0.8+e*0.8 };
      pose.rightShoulder = { rx: -0.5+e*0.5 };
      pose.leftShoulder = { rx: -0.5+e*0.5 };
    }
    else { // 恢复
      const p = (t-0.85)/0.15;
      const e = p*p;
      pose.mesh = { ry: Math.PI*6 - e*Math.PI*6 };
    }
    return pose;
  }
}
