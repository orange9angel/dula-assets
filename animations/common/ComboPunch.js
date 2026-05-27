import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * ComboPunch — 连击拳 (13点矩阵控制版)
 *
 * 左拳→右拳→左勾拳 三连击
 */
export class ComboPunch extends AnimationBase {
  constructor() {
    super('ComboPunch', 1.2);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Hit 1: Left jab (0-0.35)
    if (t < 0.35) {
      const ht = t / 0.35;
      if (ht < 0.25) {
        const p = ht / 0.25;
        const ease = p * p;
        pose.leftShoulder = { rz: ease * 0.6, rx: -ease * 0.4 };
        pose.leftElbow = { rx: -ease * 0.8 };
        pose.rightShoulder = { rz: -ease * 0.2 };
        pose.rightElbow = { rx: -ease * 0.3 };
      } else if (ht < 0.6) {
        const p = (ht - 0.25) / 0.35;
        const ease = 1 - Math.pow(1 - p, 2);
        pose.leftShoulder = { rz: 0.6 - ease * 1.0, rx: -0.4 - ease * 0.8 };
        pose.leftElbow = { rx: -0.8 - ease * 0.5 };
        pose.rightShoulder = { rz: -0.2 + ease * 0.1 };
        pose.mesh = { x: ease * 0.08 };
      } else {
        const p = (ht - 0.6) / 0.4;
        const ease = p * p;
        pose.leftShoulder = { rz: -0.4 + ease * 0.4, rx: -1.2 + ease * 1.2 };
        pose.leftElbow = { rx: -1.3 + ease * 1.0 };
        pose.rightShoulder = { rz: -0.1 - ease * 0.1 };
        pose.mesh = { x: 0.08 * (1 - ease) };
      }
    }
    // Hit 2: Right cross (0.35-0.7)
    else if (t < 0.7) {
      const ht = (t - 0.35) / 0.35;
      if (ht < 0.25) {
        const p = ht / 0.25;
        const ease = p * p;
        pose.rightShoulder = { rz: -ease * 0.8, rx: -ease * 0.5 };
        pose.rightElbow = { rx: -ease * 0.8 };
        pose.leftShoulder = { rz: ease * 0.3 };
        pose.leftElbow = { rx: -ease * 0.5 };
      } else if (ht < 0.6) {
        const p = (ht - 0.25) / 0.35;
        const ease = 1 - Math.pow(1 - p, 2);
        pose.rightShoulder = { rz: -0.8 + ease * 1.3, rx: -0.5 - ease * 1.0 };
        pose.rightElbow = { rx: -0.8 + ease * 1.3 };
        pose.leftShoulder = { rz: 0.3 - ease * 0.2 };
        pose.mesh = { x: ease * 0.12 };
      } else {
        const p = (ht - 0.6) / 0.4;
        const ease = p * p;
        pose.rightShoulder = { rz: 0.5 - ease * 0.5, rx: -1.5 + ease * 1.5 };
        pose.rightElbow = { rx: 0.5 - ease * 0.8 };
        pose.leftShoulder = { rz: 0.1 - ease * 0.1 };
        pose.mesh = { x: 0.12 * (1 - ease) };
      }
    }
    // Hit 3: Left hook finisher (0.7-1.0)
    else if (t < 1.0) {
      const ht = (t - 0.7) / 0.3;
      if (ht < 0.2) {
        const p = ht / 0.2;
        const ease = p * p;
        pose.leftShoulder = { rz: ease * 1.0, rx: -ease * 0.3 };
        pose.leftElbow = { rx: -ease * 0.8 };
        pose.rightShoulder = { rz: -ease * 0.4 };
      } else if (ht < 0.6) {
        const p = (ht - 0.2) / 0.4;
        const ease = 1 - Math.pow(1 - p, 2);
        pose.leftShoulder = { rz: 1.0 - ease * 2.0, rx: -0.3 - ease * 0.6 };
        pose.leftElbow = { rx: -0.8 + ease * 1.5 };
        pose.rightShoulder = { rz: -0.4 + ease * 0.2 };
        pose.mesh = { x: ease * 0.15 };
      } else {
        const p = (ht - 0.6) / 0.4;
        const ease = p * p;
        pose.leftShoulder = { rz: -1.0 + ease * 1.0, rx: -0.9 + ease * 0.9 };
        pose.leftElbow = { rx: 0.7 - ease * 0.7 };
        pose.rightShoulder = { rz: -0.2 + ease * 0.2 };
        pose.mesh = { x: 0.15 * (1 - ease) };
      }
    }
    // Final recovery (1.0-1.2)
    else {
      const p = (t - 1.0) / 0.2;
      const ease = p * p;
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.4 };
      pose.leftElbow = { rx: -ease * 0.6 };
      pose.rightShoulder = { rz: -ease * 0.9, rx: -ease * 0.7 };
      pose.rightElbow = { rx: -ease * 0.5 };
      pose.mesh = { y: -ease * 0.06 };
    }

    return pose;
  }
}
