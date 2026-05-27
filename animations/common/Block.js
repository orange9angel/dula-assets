import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Block — 格挡（13点矩阵控制版）
 *
 * 使用关节：rightShoulder, rightElbow, leftShoulder, leftElbow,
 *           rightHip, rightKnee, leftHip, leftKnee, mesh
 */
export class Block extends AnimationBase {
  constructor() {
    super('Block', 0.8);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'defensive'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.5,
      maxHeight: 3.0,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    const p = t < 0.25 ? t / 0.25 : 1;
    const ease = 1 - Math.pow(1 - p, 2);

    // 右臂：交叉到中心，前臂垂直
    pose.rightShoulder = { rz: -ease * 1.0, rx: -ease * 0.8 };
    pose.rightElbow = { rx: -ease * 1.0 };

    // 左臂：交叉覆盖右臂，形成 X 格挡
    pose.leftShoulder = { rz: ease * 1.0, rx: -ease * 0.8 };
    pose.leftElbow = { rx: -ease * 1.0 };

    // 身体：微前倾，下沉
    pose.mesh = { y: -ease * 0.08, rx: ease * 0.1 };

    // 腿部：屈膝稳定防御站姿
    pose.rightHip = { rx: ease * 0.35 };
    pose.rightKnee = { rx: ease * 0.3 };
    pose.leftHip = { rx: ease * 0.3 };
    pose.leftKnee = { rx: ease * 0.25 };

    // Hold phase: 微妙震动显示承受冲击
    if (t >= 0.25) {
      const holdT = (t - 0.25) / 0.75;
      const vibration = Math.sin(holdT * Math.PI * 12) * 0.015;
      pose.mesh.y = -0.08 + vibration;
      pose.rightShoulder.rz = -1.0 + vibration;
      pose.leftShoulder.rz = 1.0 - vibration;
    }

    return pose;
  }
}
