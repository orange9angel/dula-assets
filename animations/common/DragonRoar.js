import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * DragonRoar — 龙吼拳（街霸豪鬼）
 * 蓄力→一拳轰出，身体前倾几乎贴地
 */
export class DragonRoar extends AnimationBase {
  constructor() {
    super('DragonRoar', 1.4);
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

    if (t < 0.25) { // 深蓄力
      const e = (t/0.25)**2;
      pose.mesh = { y: -e*0.4, ry: -e*0.3, rx: e*0.3 };
      pose.rightShoulder = { rx: -e*1.2, rz: -e*0.6 };
      pose.rightElbow = { rx: -e*1.6 };
      pose.leftShoulder = { rx: -e*0.6, rz: e*0.4 };
      pose.leftElbow = { rx: -e*1.0 };
      pose.rightHip = { rx: e*0.5 };
      pose.rightKnee = { rx: e*1.0 };
      pose.leftHip = { rx: e*0.3 };
      pose.leftKnee = { rx: e*0.6 };
    }
    else if (t < 0.40) { // 轰出！
      const p = (t-0.25)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.4+e*0.2, ry: -0.3+e*0.5, x: e*1.0, rx: 0.3-e*0.8 };
      pose.rightShoulder = { rx: -1.2+e*2.4, rz: -0.6+e*0.2 };
      pose.rightElbow = { rx: -1.6+e*1.8 };
      pose.leftShoulder = { rx: -0.6, rz: 0.4 };
      pose.leftElbow = { rx: -1.0 };
      pose.rightHip = { rx: 0.5 };
      pose.rightKnee = { rx: 1.0 };
      pose.leftHip = { rx: 0.3 };
      pose.leftKnee = { rx: 0.6 };
      pose.headGroup = { rx: e*0.4 };
    }
    else if (t < 0.60) { // 冲击保持
      const e = Math.sin((t-0.40)/0.20*Math.PI);
      pose.mesh = { x: 1.0+e*0.2, rx: -0.5 };
      pose.rightShoulder = { rx: 1.2, rz: -0.4 };
      pose.rightElbow = { rx: 0.2 };
      pose.headGroup = { rx: 0.4+e*0.2 };
    }
    else { // 恢复
      const p = (t-0.60)/0.40;
      const e = p*p;
      pose.mesh = { x: 1.2-e*1.2, rx: -0.5+e*0.5 };
      pose.rightShoulder = { rx: 1.2-e*1.2, rz: -0.4 };
      pose.rightElbow = { rx: 0.2-e*0.2 };
      pose.headGroup = { rx: 0.6-e*0.6 };
    }
    return pose;
  }
}
