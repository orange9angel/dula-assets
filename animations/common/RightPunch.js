import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * RightPunch — 右手直拳（KOF/街霸风格专业版）
 *
 * 右臂独立出拳，左臂保持护脸。
 * 包含躯干扭转、重心转移、过伸跟随。
 */
export class RightPunch extends AnimationBase {
  constructor() {
    super('RightPunch', 0.45);
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

    // Phase 1: Wind up (0-0.10) - 蓄力后拉
    if (t < 0.10) {
      const p = t / 0.10;
      const ease = p * p;

      // 右臂：向后拉到极限
      pose.rightShoulder = { rz: -ease * 0.6, rx: -ease * 0.7 };
      pose.rightElbow = { rx: -ease * 1.5 };
      pose.rightWrist = { rz: -ease * 0.3 };

      // 左臂：保持护脸
      pose.leftShoulder = { rz: ease * 0.7, rx: -ease * 0.5 };
      pose.leftElbow = { rx: -ease * 1.0 };

      // 身体：后坐 + 预扭转
      pose.mesh = { x: -ease * 0.12, y: -ease * 0.03, ry: ease * 0.2 };

      // 髋部预扭转
      pose.rightHip = { rz: -ease * 0.1 };
      pose.leftHip = { rz: ease * 0.08 };

      pose.headGroup = { ry: -0.06 * ease };
    }
    // Phase 2: PUNCH! (0.10-0.26) - 爆发突刺
    else if (t < 0.26) {
      const p = (t - 0.10) / 0.16;
      const ease = 1 - Math.pow(1 - p, 3);

      // 右臂：爆发前推伸直
      pose.rightShoulder = { rz: -0.6 + ease * 2.0, rx: -0.7 - ease * 1.1 };
      pose.rightElbow = { rx: -1.5 + ease * 1.7 };
      pose.rightWrist = { rz: -0.3 + ease * 0.4 };

      // 左臂：收紧护脸
      pose.leftShoulder = { rz: 0.7 - ease * 0.2, rx: -0.5 - ease * 0.2 };
      pose.leftElbow = { rx: -1.0 - ease * 0.2 };

      // 身体：突进 + 反向扭转
      pose.mesh = {
        x: -0.12 + ease * 0.5,
        y: -0.03 + ease * 0.03,
        ry: 0.2 - ease * 0.4,
      };

      // 髋部：爆发扭转
      pose.rightHip = { rz: -0.1 + ease * 0.25 };
      pose.leftHip = { rz: 0.08 - ease * 0.18 };

      // 右腿蹬地
      pose.rightKnee = { rx: ease * 0.1 };

      pose.headGroup = { ry: -0.06 + ease * 0.18 };
    }
    // Phase 3: Follow-through (0.26-0.36) - 过伸
    else if (t < 0.36) {
      const p = (t - 0.26) / 0.10;
      const ease = p * p;

      pose.rightShoulder = { rz: 1.4 + ease * 0.12, rx: -1.8 + ease * 0.05 };
      pose.rightElbow = { rx: 0.2 + ease * 0.05 };
      pose.rightWrist = { rz: 0.1 + ease * 0.03 };

      pose.leftShoulder = { rz: 0.5, rx: -0.7 };
      pose.leftElbow = { rx: -1.2 };

      pose.mesh = { x: 0.38 - ease * 0.03, ry: -0.2 + ease * 0.03 };

      pose.rightHip = { rz: 0.15 - ease * 0.02 };
      pose.leftHip = { rz: -0.1 + ease * 0.01 };

      pose.headGroup = { ry: 0.12 - ease * 0.02 };
    }
    // Phase 4: Recovery (0.36-1.0) - 回位
    else {
      const p = (t - 0.36) / 0.64;
      const ease = p * p;

      pose.rightShoulder = { rz: 1.52 - ease * 1.7, rx: -1.75 + ease * 0.65 };
      pose.rightElbow = { rx: 0.25 - ease * 1.1 };
      pose.rightWrist = { rz: 0.13 - ease * 0.4 };

      pose.leftShoulder = { rz: 0.5 + ease * 0.1, rx: -0.7 + ease * 0.1 };
      pose.leftElbow = { rx: -1.2 + ease * 0.1 };

      pose.mesh = { x: 0.35 * (1 - ease), y: -ease * 0.03, ry: -0.17 + ease * 0.17 };

      pose.rightHip = { rz: 0.13 - ease * 0.13 };
      pose.leftHip = { rz: -0.09 + ease * 0.09 };

      pose.headGroup = { ry: 0.1 * (1 - ease) };
    }

    return pose;
  }
}
