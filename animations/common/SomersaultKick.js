import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SomersaultKick — 空翻踢（街霸肯）
 * 后空翻→双脚向上蹬踢
 */
export class SomersaultKick extends AnimationBase {
  constructor() {
    super('SomersaultKick', 1.3);
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

    if (t < 0.15) { // 下蹲
      const e = (t/0.15)**2;
      pose.mesh = { y: -e*0.4 };
      pose.rightHip = { rx: e*0.4 };
      pose.rightKnee = { rx: e*1.0 };
      pose.leftHip = { rx: e*0.4 };
      pose.leftKnee = { rx: e*1.0 };
      pose.rightShoulder = { rz: -e*0.4 };
      pose.leftShoulder = { rz: e*0.4 };
    }
    else if (t < 0.45) { // 后空翻双脚上踢！
      const p = (t-0.15)/0.30;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.4+e*2.5, rx: -e*3.14 };
      // 双腿上蹬
      pose.rightHip = { rx: 0.4-e*2.5, rz: e*0.2 };
      pose.rightKnee = { rx: 1.0-e*0.8 };
      pose.leftHip = { rx: 0.4-e*2.5, rz: -e*0.2 };
      pose.leftKnee = { rx: 1.0-e*0.8 };
      // 双臂护头
      pose.rightShoulder = { rx: -e*1.0, rz: -0.4 };
      pose.leftShoulder = { rx: -e*1.0, rz: 0.4 };
    }
    else if (t < 0.60) { // 顶点
      pose.mesh = { y: 2.1, rx: -3.14 };
      pose.rightHip = { rx: -2.1, rz: 0.2 };
      pose.leftHip = { rx: -2.1, rz: -0.2 };
      pose.rightKnee = { rx: 0.2 };
      pose.leftKnee = { rx: 0.2 };
      pose.rightShoulder = { rx: -1.0, rz: -0.4 };
      pose.leftShoulder = { rx: -1.0, rz: 0.4 };
    }
    else if (t < 0.85) { // 下落翻转
      const p = (t-0.60)/0.25;
      const e = p*p;
      pose.mesh = { y: 2.1-e*2.5, rx: -3.14+e*3.14 };
      pose.rightHip = { rx: -2.1+e*2.1 };
      pose.leftHip = { rx: -2.1+e*2.1 };
      pose.rightKnee = { rx: 0.2+e*0.8 };
      pose.leftKnee = { rx: 0.2+e*0.8 };
      pose.rightShoulder = { rx: -1.0+e*1.0 };
      pose.leftShoulder = { rx: -1.0+e*1.0 };
    }
    else { // 恢复
      const p = (t-0.85)/0.15;
      const e = p*p;
      pose.mesh = { y: -0.4+e*0.4 };
    }
    return pose;
  }
}
