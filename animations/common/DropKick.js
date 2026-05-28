import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * DropKick — 飞身DropKick（摔角）
 * 跳起→身体水平→双脚前蹬
 */
export class DropKick extends AnimationBase {
  constructor() {
    super('DropKick', 1.2);
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
      pose.mesh = { y: e*0.5, x: e*0.3 };
      pose.rightHip = { rx: e*0.3 };
      pose.rightKnee = { rx: e*0.6 };
      pose.leftHip = { rx: e*0.3 };
      pose.leftKnee = { rx: e*0.6 };
      pose.rightShoulder = { rx: -e*0.4 };
      pose.leftShoulder = { rx: -e*0.4 };
    }
    else if (t < 0.35) { // 水平飞身
      const p = (t-0.15)/0.20;
      const e = 1-(1-p)**3;
      pose.mesh = { y: 0.5+e*0.8, x: 0.3+e*1.5, rx: -e*1.57 };
      // 双腿前蹬伸直
      pose.rightHip = { rx: 0.3-e*0.3, rz: e*0.2 };
      pose.rightKnee = { rx: 0.6-e*0.5 };
      pose.leftHip = { rx: 0.3-e*0.3, rz: -e*0.2 };
      pose.leftKnee = { rx: 0.6-e*0.5 };
      // 双臂前伸
      pose.rightShoulder = { rx: -0.4-e*0.6, rz: -e*0.3 };
      pose.leftShoulder = { rx: -0.4-e*0.6, rz: e*0.3 };
    }
    else if (t < 0.50) { // 顶点保持
      pose.mesh = { y: 1.3, x: 1.8, rx: -1.57 };
      pose.rightHip = { rz: 0.2 };
      pose.leftHip = { rz: -0.2 };
      pose.rightKnee = { rx: 0.1 };
      pose.leftKnee = { rx: 0.1 };
      pose.rightShoulder = { rx: -1.0, rz: -0.3 };
      pose.leftShoulder = { rx: -1.0, rz: 0.3 };
    }
    else if (t < 0.70) { // 下落
      const p = (t-0.50)/0.20;
      const e = p*p;
      pose.mesh = { y: 1.3-e*1.7, x: 1.8, rx: -1.57+e*1.57 };
      pose.rightHip = { rz: 0.2-e*0.2 };
      pose.leftHip = { rz: -0.2+e*0.2 };
      pose.rightKnee = { rx: 0.1+e*0.5 };
      pose.leftKnee = { rx: 0.1+e*0.5 };
      pose.rightShoulder = { rx: -1.0+e*1.0 };
      pose.leftShoulder = { rx: -1.0+e*1.0 };
    }
    else { // 恢复
      const p = (t-0.70)/0.30;
      const e = p*p;
      pose.mesh = { y: -0.4+e*0.4, x: 1.8-e*1.8 };
      pose.rightHip = { rx: e*0.2 };
      pose.leftHip = { rx: e*0.2 };
      pose.rightKnee = { rx: 0.6-e*0.4 };
      pose.leftKnee = { rx: 0.6-e*0.4 };
    }
    return pose;
  }
}
