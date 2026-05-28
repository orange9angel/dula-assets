import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * LightningKick — 闪电踢（KOF红丸）
 * 原地→双脚交替闪电般连环踢
 */
export class LightningKick extends AnimationBase {
  constructor() {
    super('LightningKick', 1.2);
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
    const speed = 14;
    const kick = Math.sin(t * speed);

    // 身体微震
    pose.mesh = { x: Math.sin(t*speed*2)*0.03 };

    // 右腿闪电踢
    pose.rightHip = { rx: -0.5 + Math.max(0, kick)*1.8, rz: Math.max(0, kick)*0.5 };
    pose.rightKnee = { rx: 0.8 - Math.max(0, kick)*0.6 };

    // 左腿支撑微屈
    pose.leftHip = { rx: 0.3 + Math.max(0, -kick)*0.3 };
    pose.leftKnee = { rx: 0.5 };

    // 双臂护头
    pose.rightShoulder = { rx: -0.6, rz: -0.4 + Math.max(0, kick)*0.3 };
    pose.rightElbow = { rx: -1.0 };
    pose.leftShoulder = { rx: -0.6, rz: 0.4 };
    pose.leftElbow = { rx: -1.0 };

    // 头部锁定
    pose.headGroup = { ry: Math.sin(t*speed)*0.05 };

    return pose;
  }
}
