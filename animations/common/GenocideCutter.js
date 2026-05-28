import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * GenocideCutter — 灭族切割（KOF卢卡尔）
 * 单脚支撑→另一腿向上斜切多段
 */
export class GenocideCutter extends AnimationBase {
  constructor() {
    super('GenocideCutter', 1.5);
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

    if (t < 0.12) { // 单脚支撑准备
      const e = (t/0.12)**2;
      pose.mesh = { y: -e*0.2 };
      pose.leftHip = { rx: e*0.3 };
      pose.leftKnee = { rx: e*0.5 };
      pose.rightHip = { rx: -e*0.8, rz: e*0.2 };
      pose.rightKnee = { rx: e*1.2 };
      pose.rightShoulder = { rz: -e*0.6 };
      pose.leftShoulder = { rz: e*0.6 };
    }
    else if (t < 0.35) { // 第一段上切！
      const p = (t-0.12)/0.23;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.2+e*1.5, ry: -e*0.3 };
      // 左腿支撑
      pose.leftHip = { rx: 0.3 };
      pose.leftKnee = { rx: 0.5 };
      // 右腿斜上切
      pose.rightHip = { rx: -0.8-e*1.8, rz: 0.2 };
      pose.rightKnee = { rx: 1.2-e*1.0 };
      pose.rightAnkle = { rx: e*0.5 };
      // 双臂
      pose.rightShoulder = { rz: -0.6, rx: -e*0.5 };
      pose.leftShoulder = { rz: 0.6 };
    }
    else if (t < 0.50) { // 第二段上切！
      const p = (t-0.35)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { y: 1.3+e*0.8, ry: -0.3+e*0.3 };
      pose.rightHip = { rx: -2.6+e*0.4, rz: 0.2 };
      pose.rightKnee = { rx: 0.2 };
      pose.rightAnkle = { rx: 0.5 };
      pose.leftHip = { rx: 0.3 };
      pose.leftKnee = { rx: 0.5 };
      pose.rightShoulder = { rz: -0.6, rx: -0.5 };
    }
    else if (t < 0.70) { // 下落
      const p = (t-0.50)/0.20;
      const e = p*p;
      pose.mesh = { y: 2.1-e*2.5, ry: e*0.2 };
      pose.rightHip = { rx: -2.2+e*2.0 };
      pose.rightKnee = { rx: e*0.6 };
      pose.rightAnkle = { rx: 0.5-e*0.3 };
      pose.leftHip = { rx: 0.3-e*0.3 };
      pose.leftKnee = { rx: 0.5+e*0.3 };
      pose.rightShoulder = { rz: -0.6+e*0.4 };
      pose.leftShoulder = { rz: 0.6-e*0.4 };
    }
    else { // 恢复
      const p = (t-0.70)/0.30;
      const e = p*p;
      pose.mesh = { y: -0.4+e*0.4 };
      pose.rightHip = { rx: -0.2+e*0.2 };
      pose.rightKnee = { rx: 0.6-e*0.4 };
      pose.leftHip = { rx: e*0.2 };
      pose.leftKnee = { rx: 0.8-e*0.6 };
    }
    return pose;
  }
}
