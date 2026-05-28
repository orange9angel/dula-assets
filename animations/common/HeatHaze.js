import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * HeatHaze — 阳炎（侍魂霸王丸）
 * 拔刀→瞬步前冲→大上段斩
 */
export class HeatHaze extends AnimationBase {
  constructor() {
    super('HeatHaze', 1.3);
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

    if (t < 0.15) { // 拔刀架势
      const e = (t/0.15)**2;
      pose.mesh = { ry: -e*0.3 };
      pose.rightShoulder = { rx: -e*1.0, rz: -e*0.8 };
      pose.rightElbow = { rx: -e*1.2 };
      pose.leftShoulder = { rx: -e*0.4, rz: e*0.6 };
      pose.leftElbow = { rx: -e*0.8 };
      pose.rightHip = { rx: e*0.3 };
      pose.leftHip = { rx: -e*0.2 };
    }
    else if (t < 0.30) { // 瞬步前冲！
      const p = (t-0.15)/0.15;
      const e = 1-(1-p)**3;
      pose.mesh = { x: e*2.0, ry: -0.3 };
      pose.rightShoulder = { rx: -1.0+e*2.2, rz: -0.8+e*0.4 };
      pose.rightElbow = { rx: -1.2+e*1.6 };
      pose.leftShoulder = { rx: -0.4, rz: 0.6 };
      pose.leftElbow = { rx: -0.8 };
      pose.rightHip = { rx: 0.3 };
      pose.leftHip = { rx: -0.2 };
    }
    else if (t < 0.45) { // 大上段斩
      const p = (t-0.30)/0.15;
      const e = 1-(1-p)**2;
      pose.mesh = { x: 2.0, ry: -0.3+e*0.8, rx: -e*0.5 };
      pose.rightShoulder = { rx: 1.2-e*0.4, rz: -0.4 };
      pose.rightElbow = { rx: 0.4 };
      pose.leftShoulder = { rx: -0.4, rz: 0.6 };
      pose.headGroup = { ry: e*0.3 };
    }
    else if (t < 0.65) { // 收刀
      const p = (t-0.45)/0.20;
      const e = p*p;
      pose.mesh = { x: 2.0, ry: 0.5-e*0.5, rx: -0.5+e*0.5 };
      pose.rightShoulder = { rx: 0.8-e*0.8, rz: -0.4 };
      pose.rightElbow = { rx: 0.4-e*0.4 };
      pose.headGroup = { ry: 0.3-e*0.3 };
    }
    else { // 恢复
      const p = (t-0.65)/0.35;
      const e = p*p;
      pose.mesh = { x: 2.0-e*2.0 };
    }
    return pose;
  }
}
