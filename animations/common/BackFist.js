import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * BackFist — 反手拳/背拳（参考KOF八神庵、街霸春丽）
 *
 * 身体旋转180度，利用离心力挥出反手拳。
 * 动作快、范围大、出其不意。
 */
export class BackFist extends AnimationBase {
  constructor() {
    super('BackFist', 0.55);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Wind up (0-0.12) - 快速蓄力转身
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      // 身体：开始转身+微蹲
      pose.mesh = {
        y: -ease * 0.08,
        ry: -ease * 0.6,
        rx: ease * 0.1,
      };

      pose.headGroup = { ry: -ease * 0.3, rx: ease * 0.05 };

      // 右臂：向后拉蓄力
      pose.rightShoulder = { rz: -ease * 0.8, rx: ease * 0.4 };
      pose.rightElbow = { rx: ease * 0.6 };
      pose.rightWrist = { rz: -ease * 0.3 };

      // 左臂：前伸平衡
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.3 };
      pose.leftElbow = { rx: -ease * 0.5 };

      // 腿部：微屈准备
      pose.rightHip = { rx: ease * 0.15 };
      pose.rightKnee = { rx: ease * 0.25 };
      pose.leftHip = { rx: ease * 0.1 };
      pose.leftKnee = { rx: ease * 0.2 };
    }
    // Phase 2: STRIKE (0.12-0.28) - 反手拳挥出
    else if (t < 0.28) {
      const p = (t - 0.12) / 0.16;
      const ease = 1 - Math.pow(1 - p, 3);

      // 身体：旋转加速
      pose.mesh = {
        y: -0.08 + ease * 0.06,
        ry: -0.6 + ease * 1.4,
        x: ease * 0.2,
        rx: 0.1 - ease * 0.15,
      };

      pose.headGroup = { ry: -0.3 + ease * 0.5, rx: 0.05 - ease * 0.1 };

      // 右臂：反手拳挥出！
      pose.rightShoulder = {
        rz: -0.8 + ease * 2.0,
        rx: 0.4 - ease * 1.6,
      };
      pose.rightElbow = { rx: 0.6 - ease * 1.4 };
      pose.rightWrist = { rz: -0.3 + ease * 0.6 };

      // 左臂：收回护肋
      pose.leftShoulder = { rz: 0.5 - ease * 0.3, rx: -0.3 - ease * 0.2 };
      pose.leftElbow = { rx: -0.5 - ease * 0.2 };

      // 右腿：蹬地推进
      pose.rightHip = { rx: 0.15 - ease * 0.3 };
      pose.rightKnee = { rx: 0.25 - ease * 0.1 };
      pose.rightAnkle = { rx: -ease * 0.1 };

      // 左腿：支撑
      pose.leftHip = { rx: 0.1 + ease * 0.05 };
      pose.leftKnee = { rx: 0.2 + ease * 0.05 };
    }
    // Phase 3: Follow-through (0.28-0.42) - 跟进
    else if (t < 0.42) {
      const p = (t - 0.28) / 0.14;
      const ease = p * p;

      pose.mesh = {
        y: -0.02 - ease * 0.04,
        ry: 0.8 + ease * 0.3,
        x: 0.2 + ease * 0.1,
        rx: -0.05 + ease * 0.05,
      };

      pose.headGroup = { ry: 0.2 + ease * 0.1, rx: -0.05 + ease * 0.05 };

      pose.rightShoulder = { rz: 1.2 - ease * 0.3, rx: -1.2 + ease * 0.3 };
      pose.rightElbow = { rx: -0.8 + ease * 0.2 };
      pose.rightWrist = { rz: 0.3 - ease * 0.1 };

      pose.leftShoulder = { rz: 0.2 - ease * 0.1, rx: -0.5 + ease * 0.1 };
      pose.leftElbow = { rx: -0.7 + ease * 0.1 };

      pose.rightHip = { rx: -0.15 + ease * 0.1 };
      pose.rightKnee = { rx: 0.15 + ease * 0.05 };
      pose.leftHip = { rx: 0.15 - ease * 0.05 };
      pose.leftKnee = { rx: 0.25 - ease * 0.05 };
    }
    // Phase 4: Recover (0.42-1.0) - 回位
    else {
      const p = (t - 0.42) / 0.58;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = {
        y: -0.06 * (1 - ease),
        ry: 1.1 * (1 - ease),
        x: 0.3 * (1 - ease),
        rx: 0,
      };

      pose.headGroup = { ry: 0.3 * (1 - ease), rx: 0 };

      pose.rightShoulder = { rz: 0.9 - ease * 0.9, rx: -0.9 + ease * 0.9 };
      pose.rightElbow = { rx: -0.6 + ease * 0.6 };
      pose.rightWrist = { rz: 0.2 - ease * 0.2 };

      pose.leftShoulder = { rz: 0.1 - ease * 0.1, rx: -0.4 + ease * 0.4 };
      pose.leftElbow = { rx: -0.6 + ease * 0.6 };

      pose.rightHip = { rx: -0.05 + ease * 0.05 };
      pose.rightKnee = { rx: 0.2 - ease * 0.2 };
      pose.rightAnkle = { rx: -0.1 + ease * 0.1 };

      pose.leftHip = { rx: 0.1 - ease * 0.1 };
      pose.leftKnee = { rx: 0.2 - ease * 0.2 };
      pose.leftAnkle = { rx: -0.05 + ease * 0.05 };
    }

    return pose;
  }
}
