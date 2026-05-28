import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * HeadStomp — 踩头（街霸巴洛克）
 * 跳起→双脚并拢踩下→弹起
 */
export class HeadStomp extends AnimationBase {
  constructor() {
    super('HeadStomp', 1.3);
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
      pose.mesh = { y: e*2.0 };
      pose.rightHip = { rx: e*0.4, rz: e*0.2 };
      pose.rightKnee = { rx: e*0.8 };
      pose.leftHip = { rx: e*0.4, rz: -e*0.2 };
      pose.leftKnee = { rx: e*0.8 };
      pose.rightShoulder = { rx: -e*0.6, rz: -e*0.4 };
      pose.leftShoulder = { rx: -e*0.6, rz: e*0.4 };
    }
    else if (t < 0.30) { // 双脚并拢踩下！
      const p = (t-0.15)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { y: 2.0-e*1.5, rx: e*0.5 };
      // 双腿并拢伸直下踩
      pose.rightHip = { rx: 0.4+e*0.8, rz: 0.2 };
      pose.rightKnee = { rx: 0.8-e*0.6 };
      pose.leftHip = { rx: 0.4+e*0.8, rz: -0.2 };
      pose.leftKnee = { rx: 0.8-e*0.6 };
      // 双臂上举
      pose.rightShoulder = { rx: -0.6-e*1.4, rz: -0.4 };
      pose.leftShoulder = { rx: -0.6-e*1.4, rz: 0.4 };
    }
    else if (t < 0.45) { // 踩中保持
      pose.mesh = { y: 0.5, rx: 0.5 };
      pose.rightHip = { rx: 1.2 };
      pose.leftHip = { rx: 1.2 };
      pose.rightKnee = { rx: 0.2 };
      pose.leftKnee = { rx: 0.2 };
      pose.rightShoulder = { rx: -2.0 };
      pose.leftShoulder = { rx: -2.0 };
    }
    else if (t < 0.60) { // 弹起
      const p = (t-0.45)/0.15;
      const e = 1-(1-p)**2;
      pose.mesh = { y: 0.5+e*1.0, rx: 0.5-e*0.5 };
      pose.rightHip = { rx: 1.2-e*0.8 };
      pose.leftHip = { rx: 1.2-e*0.8 };
      pose.rightKnee = { rx: 0.2+e*0.4 };
      pose.leftKnee = { rx: 0.2+e*0.4 };
      pose.rightShoulder = { rx: -2.0+e*1.4 };
      pose.leftShoulder = { rx: -2.0+e*1.4 };
    }
    else { // 恢复
      const p = (t-0.60)/0.40;
      const e = p*p;
      pose.mesh = { y: 1.5-e*1.5 };
      pose.rightHip = { rx: 0.4-e*0.4 };
      pose.leftHip = { rx: 0.4-e*0.4 };
      pose.rightKnee = { rx: 0.6-e*0.4 };
      pose.leftKnee = { rx: 0.6-e*0.4 };
      pose.rightShoulder = { rx: -0.6+e*0.6 };
      pose.leftShoulder = { rx: -0.6+e*0.6 };
    }
    return pose;
  }
}
