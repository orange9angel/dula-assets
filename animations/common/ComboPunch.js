import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * ComboPunch — 连击拳 (KOF/街霸风格专业版)
 *
 * 左刺拳→右直拳→左勾拳 三连击
 * 每击都有躯干扭转和重心转移
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

    // Hit 1: Left jab (0-0.32)
    if (t < 0.32) {
      const ht = t / 0.32;
      if (ht < 0.22) {
        const p = ht / 0.22;
        const ease = p * p;
        // 左臂后拉蓄力
        pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.5 };
        pose.leftElbow = { rx: -ease * 1.0 };
        pose.leftWrist = { rz: ease * 0.2 };
        // 右臂护脸
        pose.rightShoulder = { rz: -ease * 0.7, rx: -ease * 0.4 };
        pose.rightElbow = { rx: -ease * 0.8 };
        // 身体预扭转
        pose.mesh = { ry: -ease * 0.15, y: -ease * 0.02 };
        pose.leftHip = { rz: ease * 0.08 };
        pose.rightHip = { rz: -ease * 0.05 };
      } else if (ht < 0.65) {
        const p = (ht - 0.22) / 0.43;
        const ease = 1 - Math.pow(1 - p, 3);
        // 左臂爆发前刺
        pose.leftShoulder = { rz: 0.5 - ease * 1.4, rx: -0.5 - ease * 0.9 };
        pose.leftElbow = { rx: -1.0 + ease * 1.4 };
        pose.leftWrist = { rz: 0.2 - ease * 0.3 };
        pose.rightShoulder = { rz: -0.7 + ease * 0.1, rx: -0.4 - ease * 0.1 };
        pose.rightElbow = { rx: -0.8 - ease * 0.2 };
        pose.mesh = { x: ease * 0.1, ry: -0.15 + ease * 0.3, y: -0.02 + ease * 0.02 };
        pose.leftHip = { rz: 0.08 - ease * 0.18 };
        pose.rightHip = { rz: -0.05 + ease * 0.12 };
      } else {
        const p = (ht - 0.65) / 0.35;
        const ease = p * p;
        // 左臂快速收回
        pose.leftShoulder = { rz: -0.9 + ease * 0.6, rx: -1.4 + ease * 1.0 };
        pose.leftElbow = { rx: 0.4 - ease * 0.8 };
        pose.leftWrist = { rz: -0.1 + ease * 0.15 };
        pose.rightShoulder = { rz: -0.6, rx: -0.5 };
        pose.rightElbow = { rx: -1.0 };
        pose.mesh = { x: 0.1 * (1 - ease), ry: 0.15 - ease * 0.1 };
        pose.leftHip = { rz: -0.1 + ease * 0.08 };
        pose.rightHip = { rz: 0.07 - ease * 0.05 };
      }
    }
    // Hit 2: Right cross (0.32-0.65)
    else if (t < 0.65) {
      const ht = (t - 0.32) / 0.33;
      if (ht < 0.22) {
        const p = ht / 0.22;
        const ease = p * p;
        // 右臂后拉蓄力
        pose.rightShoulder = { rz: -ease * 0.6, rx: -ease * 0.6 };
        pose.rightElbow = { rx: -ease * 1.3 };
        pose.rightWrist = { rz: -ease * 0.25 };
        pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.4 };
        pose.leftElbow = { rx: -ease * 0.8 };
        pose.mesh = { ry: ease * 0.2, y: -ease * 0.02 };
        pose.rightHip = { rz: -ease * 0.1 };
        pose.leftHip = { rz: ease * 0.06 };
      } else if (ht < 0.65) {
        const p = (ht - 0.22) / 0.43;
        const ease = 1 - Math.pow(1 - p, 3);
        // 右臂爆发直拳
        pose.rightShoulder = { rz: -0.6 + ease * 1.9, rx: -0.6 - ease * 1.1 };
        pose.rightElbow = { rx: -1.3 + ease * 1.6 };
        pose.rightWrist = { rz: -0.25 + ease * 0.35 };
        pose.leftShoulder = { rz: 0.5 - ease * 0.2, rx: -0.4 - ease * 0.1 };
        pose.leftElbow = { rx: -0.8 - ease * 0.2 };
        pose.mesh = { x: ease * 0.18, ry: 0.2 - ease * 0.4, y: -0.02 + ease * 0.02 };
        pose.rightHip = { rz: -0.1 + ease * 0.22 };
        pose.leftHip = { rz: 0.06 - ease * 0.15 };
      } else {
        const p = (ht - 0.65) / 0.35;
        const ease = p * p;
        pose.rightShoulder = { rz: 1.3 - ease * 0.7, rx: -1.7 + ease * 1.1 };
        pose.rightElbow = { rx: 0.3 - ease * 0.6 };
        pose.rightWrist = { rz: 0.1 - ease * 0.15 };
        pose.leftShoulder = { rz: 0.3, rx: -0.5 };
        pose.leftElbow = { rx: -1.0 };
        pose.mesh = { x: 0.18 * (1 - ease), ry: -0.2 + ease * 0.15 };
        pose.rightHip = { rz: 0.12 - ease * 0.1 };
        pose.leftHip = { rz: -0.09 + ease * 0.07 };
      }
    }
    // Hit 3: Left hook finisher (0.65-0.95)
    else if (t < 0.95) {
      const ht = (t - 0.65) / 0.30;
      if (ht < 0.18) {
        const p = ht / 0.18;
        const ease = p * p;
        // 左臂蓄力（勾拳姿势）
        pose.leftShoulder = { rz: ease * 0.8, rx: -ease * 0.4 };
        pose.leftElbow = { rx: -ease * 1.2 };
        pose.leftWrist = { rz: ease * 0.3 };
        pose.rightShoulder = { rz: -ease * 0.5, rx: -ease * 0.3 };
        pose.rightElbow = { rx: -ease * 0.6 };
        pose.mesh = { ry: -ease * 0.2 };
        pose.leftHip = { rz: ease * 0.1 };
      } else if (ht < 0.6) {
        const p = (ht - 0.18) / 0.42;
        const ease = 1 - Math.pow(1 - p, 3);
        // 左勾拳爆发！大角度横向挥出
        pose.leftShoulder = { rz: 0.8 - ease * 2.2, rx: -0.4 - ease * 0.6 };
        pose.leftElbow = { rx: -1.2 + ease * 1.6 };
        pose.leftWrist = { rz: 0.3 - ease * 0.5 };
        pose.rightShoulder = { rz: -0.5 + ease * 0.2, rx: -0.3 - ease * 0.1 };
        pose.rightElbow = { rx: -0.6 - ease * 0.2 };
        pose.mesh = { x: ease * 0.2, ry: -0.2 + ease * 0.45, y: ease * 0.02 };
        pose.leftHip = { rz: 0.1 - ease * 0.22 };
        pose.rightHip = { rz: -0.03 + ease * 0.12 };
      } else {
        const p = (ht - 0.6) / 0.4;
        const ease = p * p;
        pose.leftShoulder = { rz: -1.4 + ease * 0.9, rx: -1.0 + ease * 0.7 };
        pose.leftElbow = { rx: 0.4 - ease * 0.7 };
        pose.leftWrist = { rz: -0.2 + ease * 0.25 };
        pose.rightShoulder = { rz: -0.3, rx: -0.4 };
        pose.rightElbow = { rx: -0.8 };
        pose.mesh = { x: 0.2 * (1 - ease), ry: 0.25 - ease * 0.2 };
        pose.leftHip = { rz: -0.12 + ease * 0.1 };
        pose.rightHip = { rz: 0.09 - ease * 0.07 };
      }
    }
    // Final recovery (0.95-1.2)
    else {
      const p = (t - 0.95) / 0.25;
      const ease = p * p;
      pose.leftShoulder = { rz: -0.5 + ease * 0.5, rx: -0.3 + ease * 0.2 };
      pose.leftElbow = { rx: -0.3 - ease * 0.3 };
      pose.rightShoulder = { rz: -0.3 - ease * 0.4, rx: -0.4 - ease * 0.2 };
      pose.rightElbow = { rx: -0.8 + ease * 0.2 };
      pose.mesh = { y: -ease * 0.04 };
    }

    return pose;
  }
}
