import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * RollPunch — 前滚翻 + 起身直拳
 * 身体向前翻滚（绕X轴），同时向前移动，然后弹起出直拳
 */
export class RollPunch extends AnimationBase {
  constructor() {
    super('RollPunch', 2.0);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Drop and start roll (0-0.15) - 下蹲开始前滚
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;

      // 身体前倾贴地，开始向前移动
      pose.mesh = {
        y: -ease * 0.45,
        rx: ease * 1.57,  // 向前倾90°（身体前倾）
        x: ease * 0.3,     // 开始向前移动
      };

      // 四肢蜷缩准备翻滚
      pose.rightHip = { rx: ease * 0.8 };
      pose.rightKnee = { rx: ease * 1.4 };
      pose.leftHip = { rx: ease * 0.8 };
      pose.leftKnee = { rx: ease * 1.4 };

      pose.rightShoulder = { rx: -ease * 0.6 };
      pose.rightElbow = { rx: -ease * 1.2 };
      pose.leftShoulder = { rx: -ease * 0.6 };
      pose.leftElbow = { rx: -ease * 1.2 };
    }
    // Phase 2: Forward roll 1st half (0.15-0.45) - 前滚翻第一圈前半
    else if (t < 0.45) {
      const p = (t - 0.15) / 0.30;
      const ease = p * p;

      // 绕X轴翻滚（身体向前滚），同时向前移动
      pose.mesh = {
        y: -0.45 + Math.sin(p * Math.PI) * 0.25,
        rx: 1.57 + ease * Math.PI,  // 继续向前翻滚180°
        x: 0.3 + ease * 1.2,         // 向前移动
      };

      // 翻滚时四肢收紧
      pose.rightHip = { rx: 0.8 };
      pose.rightKnee = { rx: 1.4 };
      pose.leftHip = { rx: 0.8 };
      pose.leftKnee = { rx: 1.4 };

      pose.rightShoulder = { rx: -0.6 };
      pose.rightElbow = { rx: -1.2 };
      pose.leftShoulder = { rx: -0.6 };
      pose.leftElbow = { rx: -1.2 };
    }
    // Phase 3: Forward roll 2nd half (0.45-0.75) - 前滚翻第一圈后半
    else if (t < 0.75) {
      const p = (t - 0.45) / 0.30;
      const ease = p * p;

      pose.mesh = {
        y: -0.45 + Math.sin(p * Math.PI) * 0.25,
        rx: 1.57 + Math.PI + ease * Math.PI,  // 再滚180°
        x: 1.5 + ease * 1.2,                   // 继续向前
      };

      pose.rightHip = { rx: 0.8 };
      pose.rightKnee = { rx: 1.4 };
      pose.leftHip = { rx: 0.8 };
      pose.leftKnee = { rx: 1.4 };

      pose.rightShoulder = { rx: -0.6 };
      pose.rightElbow = { rx: -1.2 };
      pose.leftShoulder = { rx: -0.6 };
      pose.leftElbow = { rx: -1.2 };
    }
    // Phase 4: Spring up (0.75-0.90) - 弹起蓄力
    else if (t < 0.90) {
      const p = (t - 0.75) / 0.15;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = {
        y: -0.45 + ease * 0.45,  // 回到站立高度
        rx: 1.57 + Math.PI * 2 - ease * (1.57 + Math.PI * 2),  // 恢复直立
        x: 2.7 + ease * 0.3,      // 继续向前一点
      };

      // 右臂后拉蓄力
      pose.rightShoulder = { rz: -ease * 0.8, rx: -ease * 0.8 };
      pose.rightElbow = { rx: -ease * 1.6 };
      pose.rightWrist = { rz: -ease * 0.4 };

      // 左臂护脸
      pose.leftShoulder = { rz: ease * 0.6, rx: -ease * 0.6 };
      pose.leftElbow = { rx: -ease * 1.0 };

      // 腿微屈准备
      pose.rightHip = { rx: ease * 0.4 };
      pose.rightKnee = { rx: ease * 0.6 };
      pose.leftHip = { rx: ease * 0.4 };
      pose.leftKnee = { rx: ease * 0.6 };
    }
    // Phase 5: PUNCH! (0.90-1.0) - 直拳爆发
    else {
      const p = (t - 0.90) / 0.10;
      const ease = 1 - Math.pow(1 - p, 3);

      pose.mesh = { x: 3.0 + ease * 0.5, ry: -ease * 0.1 };

      // 右臂直拳冲出
      pose.rightShoulder = { rz: -0.8 + ease * 1.6, rx: -0.8 - ease * 1.2 };
      pose.rightElbow = { rx: -1.6 + ease * 2.0 };
      pose.rightWrist = { rz: -0.4 + ease * 0.5 };

      // 左臂收紧护脸
      pose.leftShoulder = { rz: 0.6 - ease * 0.2, rx: -0.6 - ease * 0.3 };
      pose.leftElbow = { rx: -1.0 - ease * 0.4 };

      // 身体前冲
      pose.rightHip = { rx: 0.4 };
      pose.rightKnee = { rx: 0.6 };
      pose.leftHip = { rx: 0.4 };
      pose.leftKnee = { rx: 0.6 };

      pose.headGroup = { ry: -0.1 + ease * 0.2, rx: ease * 0.1 };
    }

    return pose;
  }
}
