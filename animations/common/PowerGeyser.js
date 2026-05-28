import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * PowerGeyser — 能量喷泉（KOF特瑞）
 * 单拳砸地→能量柱从地面喷出
 */
export class PowerGeyser extends AnimationBase {
  constructor() {
    super('PowerGeyser', 1.6);
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

    if (t < 0.20) { // 后拉蓄力
      const e = (t/0.20)**2;
      pose.mesh = { y: -e*0.3, ry: -e*0.4 };
      pose.rightShoulder = { rx: -e*0.8, rz: -e*0.6 };
      pose.rightElbow = { rx: -e*1.4 };
      pose.leftShoulder = { rx: -e*0.6, rz: e*0.4 };
      pose.leftElbow = { rx: -e*1.0 };
      pose.rightHip = { rx: e*0.4 };
      pose.rightKnee = { rx: e*0.8 };
      pose.leftHip = { rx: e*0.3 };
      pose.leftKnee = { rx: e*0.6 };
    }
    else if (t < 0.35) { // 砸地！
      const p = (t-0.20)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { y: -0.3+e*0.1, ry: -0.4+e*0.6, x: e*0.4, rx: e*0.6 };
      pose.rightShoulder = { rx: -0.8+e*2.0, rz: -0.6+e*0.2 };
      pose.rightElbow = { rx: -1.4+e*1.6 };
      pose.leftShoulder = { rx: -0.6, rz: 0.4 };
      pose.leftElbow = { rx: -1.0 };
      pose.rightHip = { rx: 0.4 };
      pose.rightKnee = { rx: 0.8 };
      pose.leftHip = { rx: 0.3 };
      pose.leftKnee = { rx: 0.6 };
    }
    else if (t < 0.55) { // 能量喷发保持
      const e = Math.sin((t-0.35)/0.20*Math.PI);
      pose.mesh = { rx: 0.6, x: 0.4+e*0.1 };
      pose.rightShoulder = { rx: 1.2, rz: -0.4 };
      pose.rightElbow = { rx: 0.2 };
      pose.headGroup = { rx: e*0.3 };
    }
    else { // 恢复
      const p = (t-0.55)/0.45;
      const e = p*p;
      pose.mesh = { rx: 0.6-e*0.6, x: 0.5-e*0.5 };
      pose.rightShoulder = { rx: 1.2-e*1.2, rz: -0.4 };
      pose.rightElbow = { rx: 0.2-e*0.2 };
      pose.headGroup = { rx: 0 };
    }
    return pose;
  }
}
