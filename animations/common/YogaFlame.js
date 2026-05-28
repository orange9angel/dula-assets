import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * YogaFlame — 瑜伽火焰（街霸达尔锡）
 * 后仰→大口喷火
 */
export class YogaFlame extends AnimationBase {
  constructor() {
    super('YogaFlame', 1.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['headGroup', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter'],
      notSuits: ['round', 'tiny'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    if (t < 0.20) { // 深吸后仰
      const e = (t/0.20)**2;
      pose.mesh = { y: -e*0.3, rx: -e*0.5 };
      pose.headGroup = { rx: -e*0.8 };
      pose.rightShoulder = { rx: -e*1.0, rz: -e*1.2 };
      pose.rightElbow = { rx: -e*0.8 };
      pose.leftShoulder = { rx: -e*1.0, rz: e*1.2 };
      pose.leftElbow = { rx: -e*0.8 };
      pose.rightHip = { rx: e*0.5 };
      pose.leftHip = { rx: e*0.5 };
    }
    else if (t < 0.35) { // 前扑喷火
      const p = (t-0.20)/0.15;
      const e = 1-(1-p)**2;
      pose.mesh = { y: -0.3+e*0.3, rx: -0.5+e*1.0, x: e*0.5 };
      pose.headGroup = { rx: -0.8+e*1.2 };
      pose.rightShoulder = { rx: -1.0+e*1.8, rz: -1.2+e*0.8 };
      pose.rightElbow = { rx: -0.8+e*1.2 };
      pose.leftShoulder = { rx: -1.0+e*1.8, rz: 1.2-e*0.8 };
      pose.leftElbow = { rx: -0.8+e*1.2 };
      pose.rightHip = { rx: 0.5 };
      pose.leftHip = { rx: 0.5 };
    }
    else if (t < 0.60) { // 持续喷火
      const e = Math.sin((t-0.35)/0.25*Math.PI);
      pose.mesh = { rx: 0.5, x: 0.5+e*0.2 };
      pose.headGroup = { rx: 0.4+e*0.2 };
      pose.rightShoulder = { rx: 0.8, rz: -0.4 };
      pose.rightElbow = { rx: 0.4 };
      pose.leftShoulder = { rx: 0.8, rz: 0.4 };
      pose.leftElbow = { rx: 0.4 };
    }
    else { // 恢复
      const p = (t-0.60)/0.40;
      const e = p*p;
      pose.mesh = { rx: 0.5-e*0.5, x: 0.7-e*0.7 };
      pose.headGroup = { rx: 0.6-e*0.6 };
      pose.rightShoulder = { rx: 0.8-e*0.8, rz: -0.4 };
      pose.rightElbow = { rx: 0.4-e*0.4 };
      pose.leftShoulder = { rx: 0.8-e*0.8, rz: 0.4 };
      pose.leftElbow = { rx: 0.4-e*0.4 };
    }
    return pose;
  }
}
