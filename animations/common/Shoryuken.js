import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Shoryuken — 升龙拳（街霸隆风格专业版）
 * 下蹲→腾空→上勾拳→翻转落地
 *
 * 改进：下蹲不穿地，腾空更高，落地有缓冲
 */
export class Shoryuken extends AnimationBase {
  constructor() {
    super('Shoryuken', 1.4);
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

    if (t < 0.12) { // 下蹲蓄力（限制下沉）
      const e = (t/0.12)**2;
      pose.mesh = { y: -e*0.08, ry: -e*0.3 };
      pose.rightShoulder = { rx: -e*1.8, rz: -e*0.5 };
      pose.rightElbow = { rx: -e*1.6 };
      pose.leftShoulder = { rx: -e*0.8, rz: e*0.8 };
      pose.leftElbow = { rx: -e*1.2 };
      pose.rightHip = { rx: e*0.6 };
      pose.rightKnee = { rx: e*1.4 };
      pose.rightAnkle = { rx: -e*0.3 };
      pose.leftHip = { rx: e*0.4 };
      pose.leftKnee = { rx: e*1.0 };
      pose.leftAnkle = { rx: -e*0.2 };
    }
    else if (t < 0.35) { // 腾空上勾拳
      const p = (t-0.12)/0.23;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.08+e*3.8, ry: -0.3+e*0.5, rx: -e*0.6 };
      pose.rightShoulder = { rx: -1.8-e*0.4, rz: -0.5 };
      pose.rightElbow = { rx: -1.6+e*1.0 };
      pose.leftShoulder = { rx: -0.8-e*0.6, rz: 0.8 };
      pose.leftElbow = { rx: -1.2 };
      pose.rightHip = { rx: 0.6-e*0.4 };
      pose.rightKnee = { rx: 1.4-e*0.8 };
      pose.rightAnkle = { rx: -e*0.2 };
      pose.leftHip = { rx: 0.4+e*0.4 };
      pose.leftKnee = { rx: 1.0 };
      pose.leftAnkle = { rx: -e*0.15 };
    }
    else if (t < 0.55) { // 顶点翻转
      const p = (t-0.35)/0.20;
      const e = Math.sin(p*Math.PI);
      pose.mesh = { y: 3.72, ry: 0.2+e*0.3, rx: -0.6+e*1.2 };
      pose.rightShoulder = { rx: -2.2, rz: -0.5+e*0.3 };
      pose.rightElbow = { rx: -0.6 };
      pose.leftShoulder = { rx: -1.4, rz: 0.8 };
      pose.leftElbow = { rx: -1.2 };
      pose.rightHip = { rx: 0.2 };
      pose.rightKnee = { rx: 0.6 };
      pose.rightAnkle = { rx: -0.1 };
      pose.leftHip = { rx: 0.8 };
      pose.leftKnee = { rx: 1.0 };
      pose.leftAnkle = { rx: -0.1 };
    }
    else if (t < 0.80) { // 下落
      const p = (t-0.55)/0.25;
      const e = p*p;
      pose.mesh = { y: 3.72-e*3.8, ry: 0.5-e*0.5, rx: 0.6-e*0.6 };
      pose.rightShoulder = { rx: -2.2+e*2.0, rz: -0.2 };
      pose.rightElbow = { rx: -0.6+e*0.4 };
      pose.leftShoulder = { rx: -1.4+e*1.2, rz: 0.8-e*0.5 };
      pose.leftElbow = { rx: -1.2+e*0.8 };
      pose.rightHip = { rx: 0.2+e*0.2 };
      pose.rightKnee = { rx: 0.6+e*0.4 };
      pose.rightAnkle = { rx: -0.1+e*0.1 };
      pose.leftHip = { rx: 0.8-e*0.4 };
      pose.leftKnee = { rx: 1.0-e*0.6 };
      pose.leftAnkle = { rx: -0.1+e*0.1 };
    }
    else { // 落地恢复（带缓冲）
      const p = (t-0.80)/0.20;
      const e = p*p;
      pose.mesh = { y: -0.08+e*0.08 };
      pose.rightShoulder = { rx: -0.2-e*0.2, rz: -0.2 };
      pose.rightElbow = { rx: -0.2 };
      pose.leftShoulder = { rx: -0.2, rz: 0.3 };
      pose.leftElbow = { rx: -0.4 };
      pose.rightHip = { rx: 0.4-e*0.4 };
      pose.rightKnee = { rx: 1.0-e*0.8 };
      pose.rightAnkle = { rx: -e*0.1 };
      pose.leftHip = { rx: 0.4-e*0.4 };
      pose.leftKnee = { rx: 0.4-e*0.4 };
      pose.leftAnkle = { rx: -e*0.05 };
    }
    return pose;
  }
}
