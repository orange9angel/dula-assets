import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * ViperStrike — 毒蛇击（街霸巴洛克/叉子）
 * 跳跃→空中翻滚→双脚蹬墙反踢
 */
export class ViperStrike extends AnimationBase {
  constructor() {
    super('ViperStrike', 1.5);
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

    if (t < 0.15) { // 起跳
      const e = (t/0.15)**2;
      pose.mesh = { y: e*1.5, ry: -e*0.5 };
      pose.rightHip = { rx: -e*0.5, rz: e*0.3 };
      pose.leftHip = { rx: -e*0.5, rz: -e*0.3 };
      pose.rightShoulder = { rx: -e*0.6, rz: -e*0.4 };
      pose.leftShoulder = { rx: -e*0.6, rz: e*0.4 };
    }
    else if (t < 0.40) { // 空中翻滚
      const p = (t-0.15)/0.25;
      const e = 1-(1-p)**3;
      pose.mesh = { y: 1.5+e*1.0, ry: -0.5+e*1.5, rx: e*2.0 };
      pose.rightHip = { rx: -0.5, rz: 0.3 };
      pose.rightKnee = { rx: e*0.4 };
      pose.leftHip = { rx: -0.5, rz: -0.3 };
      pose.leftKnee = { rx: e*0.4 };
      pose.rightShoulder = { rx: -0.6, rz: -0.4 };
      pose.leftShoulder = { rx: -0.6, rz: 0.4 };
    }
    else if (t < 0.55) { // 双脚蹬踢
      const p = (t-0.40)/0.15;
      const e = 1-(1-p)**2;
      pose.mesh = { y: 2.5, ry: 1.0, rx: 2.0 };
      // 双腿前蹬
      pose.rightHip = { rx: -0.5-e*1.5, rz: 0.3 };
      pose.rightKnee = { rx: 0.4-e*0.3 };
      pose.leftHip = { rx: -0.5-e*1.5, rz: -0.3 };
      pose.leftKnee = { rx: 0.4-e*0.3 };
      // 双臂后展
      pose.rightShoulder = { rx: -0.6+e*0.6, rz: -0.4-e*0.4 };
      pose.leftShoulder = { rx: -0.6+e*0.6, rz: 0.4+e*0.4 };
    }
    else if (t < 0.75) { // 下落
      const p = (t-0.55)/0.20;
      const e = p*p;
      pose.mesh = { y: 2.5-e*2.9, ry: 1.0-e*1.0, rx: 2.0-e*2.0 };
      pose.rightHip = { rx: -2.0+e*1.8 };
      pose.leftHip = { rx: -2.0+e*1.8 };
      pose.rightShoulder = { rx: 0 };
      pose.leftShoulder = { rx: 0 };
    }
    else { // 恢复
      const p = (t-0.75)/0.25;
      const e = p*p;
      pose.mesh = { y: -0.4+e*0.4 };
    }
    return pose;
  }
}
