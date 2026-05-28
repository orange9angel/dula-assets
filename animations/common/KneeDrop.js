import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * KneeDrop — 飞膝砸（摔角）
 * 跳起→单膝高举→垂直砸下
 */
export class KneeDrop extends AnimationBase {
  constructor() {
    super('KneeDrop', 1.3);
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
      pose.mesh = { y: e*1.5 };
      pose.rightHip = { rx: e*0.4 };
      pose.rightKnee = { rx: e*0.6 };
      pose.leftHip = { rx: -e*1.2, rz: -e*0.3 };
      pose.leftKnee = { rx: e*1.6 };
      pose.rightShoulder = { rx: -e*0.4 };
      pose.leftShoulder = { rx: -e*0.4 };
    }
    else if (t < 0.35) { // 单膝高举
      const p = (t-0.15)/0.20;
      const e = 1-(1-p)**3;
      pose.mesh = { y: 1.5+e*1.0, rx: e*0.6 };
      // 左腿高举
      pose.leftHip = { rx: -1.2-e*0.8, rz: -0.3 };
      pose.leftKnee = { rx: 1.6-e*0.4 };
      // 右腿后伸
      pose.rightHip = { rx: 0.4+e*0.4 };
      pose.rightKnee = { rx: 0.6 };
      // 双臂前伸
      pose.rightShoulder = { rx: -0.4-e*0.8, rz: -e*0.3 };
      pose.leftShoulder = { rx: -0.4-e*0.8, rz: e*0.3 };
    }
    else if (t < 0.50) { // 顶点
      pose.mesh = { y: 2.5, rx: 0.6 };
      pose.leftHip = { rx: -2.0, rz: -0.3 };
      pose.leftKnee = { rx: 1.2 };
      pose.rightHip = { rx: 0.8 };
      pose.rightKnee = { rx: 0.6 };
      pose.rightShoulder = { rx: -1.2, rz: -0.3 };
      pose.leftShoulder = { rx: -1.2, rz: 0.3 };
    }
    else if (t < 0.65) { // 砸下！
      const p = (t-0.50)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { y: 2.5-e*2.9, rx: 0.6-e*0.6 };
      pose.leftHip = { rx: -2.0+e*1.8 };
      pose.leftKnee = { rx: 1.2-e*1.0 };
      pose.rightHip = { rx: 0.8-e*0.6 };
      pose.rightKnee = { rx: 0.6+e*0.4 };
      pose.rightShoulder = { rx: -1.2+e*1.0 };
      pose.leftShoulder = { rx: -1.2+e*1.0 };
    }
    else { // 恢复
      const p = (t-0.65)/0.35;
      const e = p*p;
      pose.mesh = { y: -0.4+e*0.4 };
      pose.leftHip = { rx: -0.2+e*0.2 };
      pose.leftKnee = { rx: 0.2-e*0.2 };
      pose.rightHip = { rx: 0.2-e*0.2 };
      pose.rightKnee = { rx: 1.0-e*0.8 };
    }
    return pose;
  }
}
