import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * BackBreaker — 背摔（KOF大门五郎）
 * 跳起→后仰→用背把对手砸向地面
 */
export class BackBreaker extends AnimationBase {
  constructor() {
    super('BackBreaker', 1.5);
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
      pose.mesh = { x: e*0.8, ry: -e*0.2 };
      pose.rightShoulder = { rx: -e*0.8, rz: -e*0.6 };
      pose.rightElbow = { rx: -e*1.2 };
      pose.leftShoulder = { rx: -e*0.8, rz: e*0.6 };
      pose.leftElbow = { rx: -e*1.2 };
      pose.rightHip = { rx: e*0.3 };
      pose.leftHip = { rx: e*0.3 };
    }
    else if (t < 0.30) { // 跳起后仰
      const p = (t-0.15)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { x: 0.8, y: e*1.5, rx: -e*1.5 };
      pose.rightShoulder = { rx: -0.8, rz: -0.6 };
      pose.rightElbow = { rx: -1.2+e*0.8 };
      pose.leftShoulder = { rx: -0.8, rz: 0.6 };
      pose.leftElbow = { rx: -1.2+e*0.8 };
      pose.rightHip = { rx: 0.3+e*0.5 };
      pose.rightKnee = { rx: e*0.8 };
      pose.leftHip = { rx: 0.3+e*0.5 };
      pose.leftKnee = { rx: e*0.8 };
    }
    else if (t < 0.45) { // 背砸顶点
      pose.mesh = { x: 0.8, y: 1.5, rx: -1.5 };
      pose.rightShoulder = { rx: -0.8, rz: -0.6 };
      pose.rightElbow = { rx: -0.4 };
      pose.leftShoulder = { rx: -0.8, rz: 0.6 };
      pose.leftElbow = { rx: -0.4 };
      pose.rightHip = { rx: 0.8 };
      pose.rightKnee = { rx: 0.8 };
      pose.leftHip = { rx: 0.8 };
      pose.leftKnee = { rx: 0.8 };
    }
    else if (t < 0.60) { // 砸地！
      const p = (t-0.45)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { x: 0.8, y: 1.5-e*1.9, rx: -1.5+e*1.5 };
      pose.rightHip = { rx: 0.8-e*0.6 };
      pose.rightKnee = { rx: 0.8+e*0.4 };
      pose.leftHip = { rx: 0.8-e*0.6 };
      pose.leftKnee = { rx: 0.8+e*0.4 };
    }
    else { // 恢复
      const p = (t-0.60)/0.40;
      const e = p*p;
      pose.mesh = { x: 0.8-e*0.8, y: -0.4+e*0.4 };
      pose.rightHip = { rx: 0.2-e*0.2 };
      pose.rightKnee = { rx: 1.2-e*1.0 };
      pose.leftHip = { rx: 0.2-e*0.2 };
      pose.leftKnee = { rx: 1.2-e*1.0 };
      pose.rightShoulder = { rx: -0.8+e*0.8 };
      pose.leftShoulder = { rx: -0.8+e*0.8 };
    }
    return pose;
  }
}
