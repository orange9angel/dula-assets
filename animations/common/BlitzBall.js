import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * BlitzBall — 闪电球（KOF二阶堂红丸）
 * 单手举天→雷电能量聚集→向前推出
 */
export class BlitzBall extends AnimationBase {
  constructor() {
    super('BlitzBall', 1.4);
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

    if (t < 0.25) { // 单手举天蓄力
      const e = (t/0.25)**2;
      pose.mesh = { y: -e*0.2, ry: -e*0.3 };
      pose.rightShoulder = { rx: -e*2.8, rz: -e*0.4 };
      pose.rightElbow = { rx: -e*0.3 };
      pose.leftShoulder = { rx: -e*0.4, rz: e*0.3 };
      pose.leftElbow = { rx: -e*0.8 };
      pose.headGroup = { rx: -e*0.3, ry: e*0.2 };
      pose.rightHip = { rx: e*0.2 };
      pose.leftHip = { rx: e*0.2 };
    }
    else if (t < 0.40) { // 推出！
      const p = (t-0.25)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.2+e*0.2, ry: -0.3+e*0.5, x: e*0.3 };
      pose.rightShoulder = { rx: -2.8+e*2.6, rz: -0.4 };
      pose.rightElbow = { rx: -0.3+e*0.5 };
      pose.leftShoulder = { rx: -0.4, rz: 0.3 };
      pose.leftElbow = { rx: -0.8 };
      pose.headGroup = { rx: -0.3+e*0.3, ry: 0.2 };
    }
    else if (t < 0.60) { // 保持推出
      const e = Math.sin((t-0.40)/0.20*Math.PI);
      pose.mesh = { ry: 0.2, x: 0.3+e*0.1 };
      pose.rightShoulder = { rx: -0.2, rz: -0.4 };
      pose.rightElbow = { rx: 0.2 };
      pose.headGroup = { ry: 0.2 };
    }
    else { // 恢复
      const p = (t-0.60)/0.40;
      const e = p*p;
      pose.mesh = { ry: 0.2-e*0.2, x: 0.4-e*0.4 };
      pose.rightShoulder = { rx: -0.2-e*0.2, rz: -0.4 };
      pose.rightElbow = { rx: 0.2-e*0.2 };
      pose.headGroup = { ry: 0.2-e*0.2 };
    }
    return pose;
  }
}
