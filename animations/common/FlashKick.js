import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FlashKick — 闪光踢（街霸盖尔）
 * 后仰倒立→双脚向上蹬踢→翻转落地
 */
export class FlashKick extends AnimationBase {
  constructor() {
    super('FlashKick', 1.3);
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

    if (t < 0.15) { // 后仰蓄力
      const e = (t/0.15)**2;
      pose.mesh = { y: -e*0.3, rx: -e*1.0 };
      pose.rightShoulder = { rx: -e*0.5, rz: -e*0.8 };
      pose.leftShoulder = { rx: -e*0.5, rz: e*0.8 };
      pose.rightHip = { rx: e*0.3 };
      pose.leftHip = { rx: e*0.3 };
    }
    else if (t < 0.35) { // 倒立双脚上蹬！
      const p = (t-0.15)/0.20;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.3+e*2.5, rx: -1.0-e*2.0 };
      pose.rightHip = { rx: 0.3-e*2.8, rz: e*0.3 };
      pose.rightKnee = { rx: e*0.2 };
      pose.leftHip = { rx: 0.3-e*2.8, rz: -e*0.3 };
      pose.leftKnee = { rx: e*0.2 };
      pose.rightShoulder = { rx: -0.5, rz: -0.8 };
      pose.leftShoulder = { rx: -0.5, rz: 0.8 };
    }
    else if (t < 0.50) { // 顶点保持
      pose.mesh = { y: 2.2, rx: -3.0 };
      pose.rightHip = { rx: -2.5, rz: 0.3 };
      pose.leftHip = { rx: -2.5, rz: -0.3 };
    }
    else if (t < 0.75) { // 翻转下落
      const p = (t-0.50)/0.25;
      const e = p*p;
      pose.mesh = { y: 2.2-e*2.6, rx: -3.0+e*3.0 };
      pose.rightHip = { rx: -2.5+e*2.5 };
      pose.leftHip = { rx: -2.5+e*2.5 };
      pose.rightShoulder = { rx: -0.5+e*0.5 };
      pose.leftShoulder = { rx: -0.5+e*0.5 };
    }
    else { // 恢复
      const p = (t-0.75)/0.25;
      const e = p*p;
      pose.mesh = { y: -0.4+e*0.4 };
    }
    return pose;
  }
}
