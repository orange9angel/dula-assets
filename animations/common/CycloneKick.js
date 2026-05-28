import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * CycloneKick — 旋风腿（KOF金家藩）
 * 单脚支撑→另一腿水平旋转多圈
 */
export class CycloneKick extends AnimationBase {
  constructor() {
    super('CycloneKick', 1.6);
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

    if (t < 0.12) { // 提膝
      const e = (t/0.12)**2;
      pose.mesh = { y: -e*0.2 };
      pose.rightHip = { rx: -e*1.2, rz: e*0.3 };
      pose.rightKnee = { rx: e*1.6 };
      pose.leftHip = { rx: e*0.3 };
      pose.leftKnee = { rx: e*0.4 };
      pose.rightShoulder = { rz: -e*0.8 };
      pose.leftShoulder = { rz: e*0.8 };
    }
    else if (t < 0.65) { // 旋风旋转！
      const p = (t-0.12)/0.53;
      const e = 1-(1-p)**3;
      const spins = e * Math.PI * 5;
      pose.mesh = { y: -0.2+e*0.3, ry: spins };
      // 左腿支撑微屈
      pose.leftHip = { rx: 0.3 };
      pose.leftKnee = { rx: 0.4+e*0.2 };
      // 右腿水平旋转
      pose.rightHip = { rx: -1.2, rz: 0.3+Math.sin(spins*2)*0.1 };
      pose.rightKnee = { rx: 1.6-e*1.4 }; // 逐渐伸直
      // 双臂平衡
      pose.rightShoulder = { rz: -0.8+Math.sin(spins)*0.2 };
      pose.leftShoulder = { rz: 0.8+Math.sin(spins)*0.2 };
    }
    else if (t < 0.80) { // 收腿
      const p = (t-0.65)/0.15;
      const e = p*p;
      pose.mesh = { y: 0.1-e*0.1, ry: Math.PI*5 };
      pose.rightHip = { rx: -1.2+e*1.2 };
      pose.rightKnee = { rx: 0.2+e*0.2 };
      pose.leftHip = { rx: 0.3-e*0.3 };
      pose.leftKnee = { rx: 0.6-e*0.4 };
      pose.rightShoulder = { rz: -0.8+e*0.5 };
      pose.leftShoulder = { rz: 0.8-e*0.5 };
    }
    else { // 恢复
      const p = (t-0.80)/0.20;
      const e = p*p;
      pose.mesh = { ry: Math.PI*5 - e*Math.PI*5 };
    }
    return pose;
  }
}
