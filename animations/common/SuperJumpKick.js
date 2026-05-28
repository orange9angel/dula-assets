import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SuperJumpKick — 超级跳踢（KOF特瑞 能量喷泉）
 * 跳到高空→双脚并拢向下猛踩
 */
export class SuperJumpKick extends AnimationBase {
  constructor() {
    super('SuperJumpKick', 1.5);
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

    if (t < 0.15) { // 深蹲
      const e = (t/0.15)**2;
      pose.mesh = { y: -e*0.5 };
      pose.rightHip = { rx: e*0.5 };
      pose.rightKnee = { rx: e*1.4 };
      pose.leftHip = { rx: e*0.5 };
      pose.leftKnee = { rx: e*1.4 };
      pose.rightShoulder = { rz: -e*0.6 };
      pose.leftShoulder = { rz: e*0.6 };
    }
    else if (t < 0.40) { // 跳到高空
      const p = (t-0.15)/0.25;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.5+e*4.0 };
      // 双腿并拢收起
      pose.rightHip = { rx: 0.5+e*0.3, rz: e*0.2 };
      pose.rightKnee = { rx: 1.4-e*0.6 };
      pose.leftHip = { rx: 0.5+e*0.3, rz: -e*0.2 };
      pose.leftKnee = { rx: 1.4-e*0.6 };
      // 双臂上举
      pose.rightShoulder = { rx: -e*2.0, rz: -0.6 };
      pose.leftShoulder = { rx: -e*2.0, rz: 0.6 };
    }
    else if (t < 0.55) { // 顶点双脚并拢
      pose.mesh = { y: 3.5 };
      pose.rightHip = { rx: 0.8, rz: 0.2 };
      pose.rightKnee = { rx: 0.8 };
      pose.leftHip = { rx: 0.8, rz: -0.2 };
      pose.leftKnee = { rx: 0.8 };
      pose.rightShoulder = { rx: -2.0, rz: -0.6 };
      pose.leftShoulder = { rx: -2.0, rz: 0.6 };
    }
    else if (t < 0.70) { // 双脚猛踩下！
      const p = (t-0.55)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { y: 3.5-e*2.5, rx: e*0.5 };
      // 双腿伸直下踩
      pose.rightHip = { rx: 0.8+e*0.8, rz: 0.2 };
      pose.rightKnee = { rx: 0.8-e*0.6 };
      pose.leftHip = { rx: 0.8+e*0.8, rz: -0.2 };
      pose.leftKnee = { rx: 0.8-e*0.6 };
      // 双臂下压
      pose.rightShoulder = { rx: -2.0+e*1.5, rz: -0.6 };
      pose.leftShoulder = { rx: -2.0+e*1.5, rz: 0.6 };
    }
    else if (t < 0.85) { // 落地缓冲
      const p = (t-0.70)/0.15;
      const e = p*p;
      pose.mesh = { y: 1.0-e*1.4, rx: 0.5-e*0.5 };
      pose.rightHip = { rx: 1.6-e*1.4 };
      pose.rightKnee = { rx: 0.2+e*0.8 };
      pose.leftHip = { rx: 1.6-e*1.4 };
      pose.leftKnee = { rx: 0.2+e*0.8 };
      pose.rightShoulder = { rx: -0.5 };
      pose.leftShoulder = { rx: -0.5 };
    }
    else { // 恢复
      const p = (t-0.85)/0.15;
      const e = p*p;
      pose.mesh = { y: -0.4+e*0.4 };
      pose.rightHip = { rx: 0.2-e*0.2 };
      pose.rightKnee = { rx: 1.0-e*0.8 };
      pose.leftHip = { rx: 0.2-e*0.2 };
      pose.leftKnee = { rx: 1.0-e*0.8 };
    }
    return pose;
  }
}
