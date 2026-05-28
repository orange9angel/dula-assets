import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * GalaxyWhirl — 银河旋风（KOF克拉克）
 * 抓住对手→旋转多圈→扔出
 */
export class GalaxyWhirl extends AnimationBase {
  constructor() {
    super('GalaxyWhirl', 2.0);
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

    if (t < 0.15) { // 前冲抓人
      const e = (t/0.15)**2;
      pose.mesh = { x: e*0.5, ry: -e*0.2 };
      pose.rightShoulder = { rx: -e*0.8, rz: -e*0.6 };
      pose.rightElbow = { rx: -e*1.2 };
      pose.leftShoulder = { rx: -e*0.8, rz: e*0.6 };
      pose.leftElbow = { rx: -e*1.2 };
      pose.rightHip = { rx: e*0.3 };
      pose.leftHip = { rx: e*0.3 };
    }
    else if (t < 0.75) { // 抓住旋转！
      const p = (t-0.15)/0.60;
      const e = 1-(1-p)**3;
      const spins = e * Math.PI * 7;
      pose.mesh = { x: 0.5, ry: spins };
      // 双臂抱紧
      pose.rightShoulder = { rx: -0.8, rz: -0.6 };
      pose.rightElbow = { rx: -1.2 };
      pose.leftShoulder = { rx: -0.8, rz: 0.6 };
      pose.leftElbow = { rx: -1.2 };
      // 身体倾斜
      pose.mesh.rx = Math.sin(spins)*0.3;
      // 马步
      pose.rightHip = { rx: 0.4 };
      pose.rightKnee = { rx: 0.8 };
      pose.leftHip = { rx: 0.4 };
      pose.leftKnee = { rx: 0.8 };
    }
    else if (t < 0.88) { // 扔出
      const p = (t-0.75)/0.13;
      const e = 1-(1-p)**3;
      pose.mesh = { x: 0.5+e*1.0, ry: Math.PI*7 };
      pose.rightShoulder = { rx: -0.8+e*2.0, rz: -0.6 };
      pose.rightElbow = { rx: -1.2+e*1.6 };
      pose.leftShoulder = { rx: -0.8+e*2.0, rz: 0.6 };
      pose.leftElbow = { rx: -1.2+e*1.6 };
      pose.rightHip = { rx: 0.4 };
      pose.leftHip = { rx: 0.4 };
    }
    else { // 恢复
      const p = (t-0.88)/0.12;
      const e = p*p;
      pose.mesh = { x: 1.5-e*1.5, ry: Math.PI*7 - e*Math.PI*7 };
      pose.rightShoulder = { rx: 1.2-e*1.2, rz: -0.6 };
      pose.rightElbow = { rx: 0.4-e*0.4 };
      pose.leftShoulder = { rx: 1.2-e*1.2, rz: 0.6 };
      pose.leftElbow = { rx: 0.4-e*0.4 };
    }
    return pose;
  }
}
