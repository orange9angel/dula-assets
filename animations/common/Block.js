import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Block — 格挡（KOF/街霸风格专业版）
 *
 * 更稳固的防御姿态：
 * - 更低重心
 * - 双臂交叉更紧密
 * - 腿部更弯曲稳定
 * - 受击时震动更明显
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

    const p = t < 0.2 ? t / 0.2 : 1;
    const ease = 1 - Math.pow(1 - p, 2);

    // 右臂：交叉到中心，前臂垂直护脸前
    pose.rightShoulder = { rz: -ease * 1.2, rx: -ease * 0.9 };
    pose.rightElbow = { rx: -ease * 1.2 };
    pose.rightWrist = { rz: -ease * 0.2 };

    // 左臂：交叉覆盖右臂，形成紧密 X 格挡
    pose.leftShoulder = { rz: ease * 1.2, rx: -ease * 0.9 };
    pose.leftElbow = { rx: -ease * 1.2 };
    pose.leftWrist = { rz: ease * 0.2 };

    // 身体：前倾，重心下沉更低
    pose.mesh = { y: -ease * 0.12, rx: ease * 0.12 };

    // 腿部：深屈膝稳定防御站姿
    pose.rightHip = { rx: ease * 0.45, rz: ease * 0.05 };
    pose.rightKnee = { rx: ease * 0.5 };
    pose.rightAnkle = { rx: -ease * 0.15 };

    pose.leftHip = { rx: ease * 0.4, rz: -ease * 0.03 };
    pose.leftKnee = { rx: ease * 0.45 };
    pose.leftAnkle = { rx: -ease * 0.12 };

    // Hold phase: 明显震动显示承受冲击
    if (t >= 0.2) {
      const holdT = (t - 0.2) / 0.8;
      const vibration = Math.sin(holdT * Math.PI * 16) * 0.02;
      pose.mesh.y = -0.12 + vibration;
      pose.mesh.x = vibration * 0.3;
      pose.rightShoulder.rz = -1.2 + vibration;
      pose.leftShoulder.rz = 1.2 - vibration;
    }

    return pose;
  }
}
