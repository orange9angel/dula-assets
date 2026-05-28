import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Hadoken — 波动拳（街霸隆）
 * 双手后拉蓄力→前推发波
 */
export class Hadoken extends AnimationBase {
  constructor() {
    super('Hadoken', 1.2);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    if (t < 0.25) { // 双手后拉蓄力
      const e = (t/0.25)**2;
      pose.mesh = { y: -e*0.15, ry: -e*0.2 };
      pose.rightShoulder = { rx: -e*1.2, rz: -e*0.8 };
      pose.rightElbow = { rx: -e*1.6 };
      pose.leftShoulder = { rx: -e*1.2, rz: e*0.8 };
      pose.leftElbow = { rx: -e*1.6 };
      pose.rightHip = { rx: e*0.3 };
      pose.leftHip = { rx: e*0.3 };
    }
    else if (t < 0.40) { // 前推！
      const p = (t-0.25)/0.15;
      const e = 1-(1-p)**2;
      pose.mesh = { y: -0.15+e*0.15, ry: -0.2+e*0.4, x: e*0.3 };
      pose.rightShoulder = { rx: -1.2+e*2.0, rz: -0.8+e*0.6 };
      pose.rightElbow = { rx: -1.6+e*1.8 };
      pose.leftShoulder = { rx: -1.2+e*2.0, rz: 0.8-e*0.6 };
      pose.leftElbow = { rx: -1.6+e*1.8 };
      pose.rightHip = { rx: 0.3 };
      pose.leftHip = { rx: 0.3 };
    }
    else if (t < 0.60) { // 保持推掌
      pose.mesh = { ry: 0.2 };
      pose.rightShoulder = { rx: 0.8, rz: -0.2 };
      pose.rightElbow = { rx: 0.2 };
      pose.leftShoulder = { rx: 0.8, rz: 0.2 };
      pose.leftElbow = { rx: 0.2 };
    }
    else { // 恢复
      const p = (t-0.60)/0.40;
      const e = p*p;
      pose.mesh = { ry: 0.2-e*0.2 };
      pose.rightShoulder = { rx: 0.8-e*0.8, rz: -0.2 };
      pose.rightElbow = { rx: 0.2-e*0.2 };
      pose.leftShoulder = { rx: 0.8-e*0.8, rz: 0.2 };
      pose.leftElbow = { rx: 0.2-e*0.2 };
    }
    return pose;
  }
}
