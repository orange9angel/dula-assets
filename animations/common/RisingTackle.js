import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * RisingTackle — 上升 tackle（KOF特瑞）
 * 后仰→身体水平旋转上升→像钻头一样
 */
export class RisingTackle extends AnimationBase {
  constructor() {
    super('RisingTackle', 1.4);
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

    if (t < 0.15) { // 后仰
      const e = (t/0.15)**2;
      pose.mesh = { y: -e*0.3, rx: -e*0.8 };
      pose.rightShoulder = { rx: -e*0.5, rz: -e*0.6 };
      pose.leftShoulder = { rx: -e*0.5, rz: e*0.6 };
    }
    else if (t < 0.50) { // 水平旋转上升！
      const p = (t-0.15)/0.35;
      const e = 1-(1-p)**3;
      const spins = e * Math.PI * 4;
      pose.mesh = { y: -0.3+e*3.5, rx: -0.8+e*1.8, ry: spins };
      // 身体水平，四肢像螺旋桨
      pose.rightHip = { rx: -0.3, rz: 0.8 };
      pose.rightKnee = { rx: 0.1 };
      pose.leftHip = { rx: -0.3, rz: -0.8 };
      pose.leftKnee = { rx: 0.1 };
      pose.rightShoulder = { rx: -0.5, rz: -0.8 };
      pose.rightElbow = { rx: 0.1 };
      pose.leftShoulder = { rx: -0.5, rz: 0.8 };
      pose.leftElbow = { rx: 0.1 };
    }
    else if (t < 0.70) { // 顶点翻转
      const p = (t-0.50)/0.20;
      const e = p*p;
      pose.mesh = { y: 3.2-e*1.0, rx: 1.0-e*0.5, ry: Math.PI*4 };
    }
    else if (t < 0.90) { // 下落
      const p = (t-0.70)/0.20;
      const e = p*p;
      pose.mesh = { y: 2.2-e*2.6, rx: 0.5-e*0.5 };
      pose.rightHip = { rx: -0.3+e*0.3 };
      pose.leftHip = { rx: -0.3+e*0.3 };
      pose.rightShoulder = { rx: -0.5+e*0.5 };
      pose.leftShoulder = { rx: -0.5+e*0.5 };
    }
    else { // 恢复
      const p = (t-0.90)/0.10;
      const e = p*p;
      pose.mesh = { y: -0.4+e*0.4 };
    }
    return pose;
  }
}
