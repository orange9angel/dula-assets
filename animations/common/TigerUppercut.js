import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * TigerUppercut — 猛虎上勾拳（街霸沙加特）
 * 单膝跪地→猛虎般跃起上勾拳
 */
export class TigerUppercut extends AnimationBase {
  constructor() {
    super('TigerUppercut', 1.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    if (t < 0.15) { // 单膝跪地蓄力
      const e = (t/0.15)**2;
      pose.mesh = { y: -e*0.5, ry: -e*0.3 };
      pose.rightHip = { rx: e*1.4 };
      pose.rightKnee = { rx: e*1.6 };
      pose.leftHip = { rx: -e*0.3 };
      pose.leftKnee = { rx: e*0.4 };
      pose.rightShoulder = { rx: -e*0.6, rz: -e*0.4 };
      pose.rightElbow = { rx: -e*1.2 };
      pose.leftShoulder = { rx: -e*0.8, rz: e*0.6 };
      pose.leftElbow = { rx: -e*1.0 };
    }
    else if (t < 0.40) { // 猛虎跃起！
      const p = (t-0.15)/0.25;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.5+e*3.0, ry: -0.3+e*0.5, rx: -e*0.4 };
      pose.rightHip = { rx: 1.4-e*1.0 };
      pose.rightKnee = { rx: 1.6-e*1.2 };
      pose.leftHip = { rx: -0.3+e*0.5 };
      pose.leftKnee = { rx: 0.4 };
      // 右臂上勾拳
      pose.rightShoulder = { rx: -0.6-e*1.4, rz: -0.4 };
      pose.rightElbow = { rx: -1.2+e*0.8 };
      pose.leftShoulder = { rx: -0.8-e*0.4, rz: 0.6 };
      pose.leftElbow = { rx: -1.0 };
    }
    else if (t < 0.55) { // 顶点
      pose.mesh = { y: 2.5, ry: 0.2, rx: -0.4 };
      pose.rightShoulder = { rx: -2.0, rz: -0.4 };
      pose.rightElbow = { rx: -0.4 };
      pose.leftShoulder = { rx: -1.2, rz: 0.6 };
    }
    else if (t < 0.80) { // 下落
      const p = (t-0.55)/0.25;
      const e = p*p;
      pose.mesh = { y: 2.5-e*3.0, rx: -0.4+e*0.4 };
      pose.rightShoulder = { rx: -2.0+e*2.0 };
      pose.rightElbow = { rx: -0.4 };
      pose.leftShoulder = { rx: -1.2+e*1.2 };
      pose.rightHip = { rx: 0.4+e*0.2 };
      pose.rightKnee = { rx: 0.4+e*0.4 };
      pose.leftHip = { rx: 0.2 };
      pose.leftKnee = { rx: 0.4 };
    }
    else { // 恢复
      const p = (t-0.80)/0.20;
      const e = p*p;
      pose.mesh = { y: -0.5+e*0.5 };
    }
    return pose;
  }
}
