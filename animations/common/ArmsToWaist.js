import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * ArmsToWaist — 双拳都放在身体右侧腰间
 *
 * 策略：身体侧转90度，双臂向前伸，从正面看双拳在右侧
 */
export class ArmsToWaist extends AnimationBase {
  constructor() {
    super('ArmsToWaist', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // 身体微蹲，侧转90度（侧面朝向镜头）
    pose.mesh = { y: -0.3, ry: -1.57 };

    // === 右臂：向前伸，拳头在腰间高度 ===
    // 身体侧面朝向镜头，右臂向前（朝向镜头右侧）
    pose.rightShoulder = {
      ry: -1.245,   // 抵消baseline
      rx: -0.5,     // 向前伸（负值=向前）
      rz: 0,
    };
    // 肘部弯曲，小臂向下到腰间
    pose.rightElbow = { rx: -1.0 };
    pose.rightWrist = { rx: -0.3 };

    // === 左臂：也向前伸，双拳并拢 ===
    pose.leftShoulder = {
      ry: 1.245,    // 抵消baseline
      rx: -0.5,     // 向前伸
      rz: 0,
    };
    pose.leftElbow = { rx: -1.0 };
    pose.leftWrist = { rx: -0.3 };

    // 头部
    pose.headGroup = { rx: 0.1 };

    return pose;
  }
}
