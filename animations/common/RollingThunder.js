import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * RollingThunder — 滚雷（KOF拉尔夫）
 * 向前连续翻滚撞击
 */
export class RollingThunder extends AnimationBase {
  constructor() {
    super('RollingThunder', 1.8);
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

    if (t < 0.10) { // 下蹲
      const e = (t/0.10)**2;
      pose.mesh = { y: -e*0.4, x: e*0.2 };
      pose.rightHip = { rx: e*0.5 };
      pose.rightKnee = { rx: e*1.2 };
      pose.leftHip = { rx: e*0.5 };
      pose.leftKnee = { rx: e*1.2 };
      pose.rightShoulder = { rx: -e*0.5 };
      pose.leftShoulder = { rx: -e*0.5 };
    }
    else if (t < 0.80) { // 连续翻滚！
      const p = (t-0.10)/0.70;
      const e = p*p;
      const spins = e * Math.PI * 5;
      pose.mesh = {
        y: -0.4 + Math.sin(p*Math.PI*5)*0.15,
        x: 0.2 + e*3.0,
        rx: 1.57,
        rz: spins,
      };
      // 四肢蜷缩
      pose.rightHip = { rx: 0.8 };
      pose.rightKnee = { rx: 1.4 };
      pose.leftHip = { rx: 0.8 };
      pose.leftKnee = { rx: 1.4 };
      pose.rightShoulder = { rx: -0.6 };
      pose.rightElbow = { rx: -1.2 };
      pose.leftShoulder = { rx: -0.6 };
      pose.leftElbow = { rx: -1.2 };
    }
    else if (t < 0.90) { // 起身
      const p = (t-0.80)/0.10;
      const e = 1-(1-p)**2;
      pose.mesh = {
        y: -0.4 + e*0.4,
        x: 3.2,
        rx: 1.57 - e*1.57,
        rz: Math.PI*5,
      };
      pose.rightHip = { rx: 0.8-e*0.6 };
      pose.rightKnee = { rx: 1.4-e*1.0 };
      pose.leftHip = { rx: 0.8-e*0.6 };
      pose.leftKnee = { rx: 1.4-e*1.0 };
      pose.rightShoulder = { rx: -0.6+e*0.4 };
      pose.leftShoulder = { rx: -0.6+e*0.4 };
    }
    else { // 恢复
      const p = (t-0.90)/0.10;
      const e = p*p;
      pose.mesh = { x: 3.2-e*3.2 };
      pose.rightHip = { rx: 0.2-e*0.2 };
      pose.leftHip = { rx: 0.2-e*0.2 };
      pose.rightKnee = { rx: 0.4-e*0.4 };
      pose.leftKnee = { rx: 0.4-e*0.4 };
    }
    return pose;
  }
}
