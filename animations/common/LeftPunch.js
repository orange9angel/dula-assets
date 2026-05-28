import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * LeftPunch — 左手直拳（KOF/街霸风格专业版）
 *
 * 左臂独立出拳，右臂保持护脸。
 * 左拳通常是前手拳（jab），速度更快但幅度稍小。
 */
export class LeftPunch extends AnimationBase {
  constructor() {
    super('LeftPunch', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Wind up (0-0.08) - 快速蓄力
    if (t < 0.08) {
      const p = t / 0.08;
      const ease = p * p;

      // 左臂：向后拉（前手拳蓄力较短）
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.6 };
      pose.leftElbow = { rx: -ease * 1.3 };
      pose.leftWrist = { rz: ease * 0.25 };

      // 右臂：保持护脸
      pose.rightShoulder = { rz: -ease * 0.7, rx: -ease * 0.5 };
      pose.rightElbow = { rx: -ease * 1.0 };

      // 身体：微后坐 + 预扭转
      pose.mesh = { x: -ease * 0.08, y: -ease * 0.02, ry: -ease * 0.15 };

      // 髋部预扭转
      pose.leftHip = { rz: ease * 0.08 };
      pose.rightHip = { rz: -ease * 0.06 };

      pose.headGroup = { ry: 0.04 * ease };
    }
    // Phase 2: JAB! (0.08-0.22) - 快速突刺
    else if (t < 0.22) {
      const p = (t - 0.08) / 0.14;
      const ease = 1 - Math.pow(1 - p, 3);

      // 左臂：爆发前推（前手拳角度稍小但更快速）
      pose.leftShoulder = { rz: 0.5 - ease * 1.6, rx: -0.6 - ease * 1.0 };
      pose.leftElbow = { rx: -1.3 + ease * 1.6 };
      pose.leftWrist = { rz: 0.25 - ease * 0.35 };

      // 右臂：收紧护脸
      pose.rightShoulder = { rz: -0.7 + ease * 0.2, rx: -0.5 - ease * 0.15 };
      pose.rightElbow = { rx: -1.0 - ease * 0.2 };

      // 身体：突进 + 反向扭转
      pose.mesh = {
        x: -0.08 + ease * 0.4,
        y: -0.02 + ease * 0.02,
        ry: -0.15 + ease * 0.35,
      };

      // 髋部：爆发扭转
      pose.leftHip = { rz: 0.08 - ease * 0.2 };
      pose.rightHip = { rz: -0.06 + ease * 0.15 };

      // 左腿蹬地
      pose.leftKnee = { rx: ease * 0.1 };

      pose.headGroup = { ry: 0.04 - ease * 0.12 };
    }
    // Phase 3: Snap back (0.22-0.32) - 快速收回（jab特性）
    else if (t < 0.32) {
      const p = (t - 0.22) / 0.10;
      const ease = p * p;

      pose.leftShoulder = { rz: -1.1 + ease * 0.5, rx: -1.6 + ease * 0.4 };
      pose.leftElbow = { rx: 0.3 - ease * 0.3 };
      pose.leftWrist = { rz: -0.1 + ease * 0.05 };

      pose.rightShoulder = { rz: -0.5, rx: -0.65 };
      pose.rightElbow = { rx: -1.2 };

      pose.mesh = { x: 0.32 - ease * 0.15, ry: 0.2 - ease * 0.15 };

      pose.leftHip = { rz: -0.12 + ease * 0.08 };
      pose.rightHip = { rz: 0.09 - ease * 0.06 };

      pose.headGroup = { ry: -0.08 + ease * 0.05 };
    }
    // Phase 4: Recovery (0.32-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.32) / 0.68;
      const ease = p * p;

      pose.leftShoulder = { rz: -0.6 + ease * 0.7, rx: -1.2 + ease * 0.4 };
      pose.leftElbow = { rx: 0 - ease * 0.8 };
      pose.leftWrist = { rz: -0.05 + ease * 0.15 };

      pose.rightShoulder = { rz: -0.5 - ease * 0.1, rx: -0.65 + ease * 0.05 };
      pose.rightElbow = { rx: -1.2 + ease * 0.1 };

      pose.mesh = { x: 0.17 * (1 - ease), y: -ease * 0.02, ry: 0.05 - ease * 0.05 };

      pose.leftHip = { rz: -0.04 + ease * 0.04 };
      pose.rightHip = { rz: 0.03 - ease * 0.03 };

      pose.headGroup = { ry: -0.03 * (1 - ease) };
    }

    return pose;
  }
}
