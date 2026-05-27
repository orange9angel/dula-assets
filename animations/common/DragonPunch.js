import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * DragonPunch — 升龙拳（参考街霸隆的Shoryuken）
 *
 * 下蹲蓄力 → 垂直升空 → 旋转上勾拳 → 顶点停顿 → 下落恢复
 * 经典的对空技，全身旋转+单臂上勾。
 */
export class DragonPunch extends AnimationBase {
  constructor() {
    super('DragonPunch', 1.0);
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

    // Phase 1: Crouch (0-0.12) - 极短蓄力
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      pose.mesh = {
        y: -ease * 0.3,
        rx: ease * 0.25,
        ry: -ease * 0.4,
      };

      pose.headGroup = { rx: ease * 0.15 };

      // 右臂：收肘蓄力
      pose.rightShoulder = { rz: -ease * 0.4, rx: ease * 0.6 };
      pose.rightElbow = { rx: ease * 0.8 };

      // 左臂：护脸
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.4 };
      pose.leftElbow = { rx: -ease * 0.6 };

      // 双腿：深蹲
      pose.rightHip = { rx: ease * 0.5 };
      pose.rightKnee = { rx: ease * 1.0 };
      pose.leftHip = { rx: ease * 0.4 };
      pose.leftKnee = { rx: ease * 0.9 };
    }
    // Phase 2: EXPLODE UP (0.12-0.35) - 爆发升空+旋转
    else if (t < 0.35) {
      const p = (t - 0.12) / 0.23;
      const ease = 1 - Math.pow(1 - p, 3);
      const lift = 1.6 * ease;

      pose.mesh = {
        y: -0.3 + lift,
        rx: 0.25 - ease * 0.6,
        ry: -0.4 + ease * 1.2,
        rz: -ease * 0.3,
      };

      pose.headGroup = {
        rx: 0.15 - ease * 0.35,
        ry: ease * 0.2,
      };

      // 右臂：旋转上勾！
      pose.rightShoulder = {
        rz: -0.4 + ease * 2.2,
        rx: 0.6 - ease * 2.4,
      };
      pose.rightElbow = { rx: 0.8 - ease * 1.8 };
      pose.rightWrist = { rz: ease * 0.4 };

      // 左臂：展开平衡
      pose.leftShoulder = {
        rz: 0.5 - ease * 0.8,
        rx: -0.4 - ease * 0.3,
      };
      pose.leftElbow = { rx: -0.6 + ease * 0.2 };

      // 右腿：收起
      pose.rightHip = { rx: 0.5 - ease * 1.3 };
      pose.rightKnee = { rx: 1.0 - ease * 0.4 };
      pose.rightAnkle = { rx: -ease * 0.25 };

      // 左腿：蹬直
      pose.leftHip = { rx: 0.4 - ease * 1.0 };
      pose.leftKnee = { rx: 0.9 - ease * 0.9 };
      pose.leftAnkle = { rx: -ease * 0.2 };
    }
    // Phase 3: PEAK (0.35-0.48) - 顶点旋转
    else if (t < 0.48) {
      const p = (t - 0.35) / 0.13;
      const ease = p * p;
      const spin = Math.sin(p * Math.PI) * 0.15;

      pose.mesh = {
        y: 1.3 + spin * 0.1,
        rx: -0.35 + spin * 0.05,
        ry: 0.8 + spin,
        rz: -0.3 + spin * 0.1,
      };

      pose.headGroup = { rx: -0.2 + spin * 0.05, ry: 0.2 };

      // 右臂：保持上勾最高点
      pose.rightShoulder = { rz: 1.8 + spin * 0.1, rx: -1.8 + spin * 0.05 };
      pose.rightElbow = { rx: -1.0 + spin * 0.05 };
      pose.rightWrist = { rz: 0.4 };

      // 左臂：展开
      pose.leftShoulder = { rz: -0.3, rx: -0.7 };
      pose.leftElbow = { rx: -0.4 };

      // 双腿：空中收起
      pose.rightHip = { rx: -0.8 };
      pose.rightKnee = { rx: 0.6 };
      pose.rightAnkle = { rx: -0.25 };

      pose.leftHip = { rx: -0.6 };
      pose.leftKnee = { rx: 0.0 };
      pose.leftAnkle = { rx: -0.2 };
    }
    // Phase 4: Fall (0.48-0.75) - 下落
    else if (t < 0.75) {
      const p = (t - 0.48) / 0.27;
      const ease = p * p;

      pose.mesh = {
        y: 1.3 - ease * 1.5,
        rx: -0.3 + ease * 0.35,
        ry: 0.95 - ease * 0.5,
        rz: -0.2 + ease * 0.2,
      };

      pose.headGroup = { rx: -0.15 + ease * 0.2, ry: 0.2 - ease * 0.2 };

      pose.rightShoulder = { rz: 1.8 - ease * 1.5, rx: -1.8 + ease * 1.3 };
      pose.rightElbow = { rx: -1.0 + ease * 0.8 };
      pose.rightWrist = { rz: 0.4 - ease * 0.4 };

      pose.leftShoulder = { rz: -0.3 + ease * 0.5, rx: -0.7 + ease * 0.5 };
      pose.leftElbow = { rx: -0.4 + ease * 0.3 };

      pose.rightHip = { rx: -0.8 + ease * 0.7 };
      pose.rightKnee = { rx: 0.6 + ease * 0.3 };
      pose.rightAnkle = { rx: -0.25 + ease * 0.1 };

      pose.leftHip = { rx: -0.6 + ease * 0.5 };
      pose.leftKnee = { rx: ease * 0.4 };
      pose.leftAnkle = { rx: -0.2 + ease * 0.05 };
    }
    // Phase 5: Landing recovery (0.75-1.0)
    else {
      const p = (t - 0.75) / 0.25;
      const ease = 1 - Math.pow(1 - p, 2);
      const bounce = Math.sin(p * Math.PI) * 0.05;

      pose.mesh = {
        y: -0.2 + bounce + ease * 0.02,
        rx: 0.05 - ease * 0.05,
        ry: 0.45 * (1 - ease),
        rz: 0,
      };

      pose.headGroup = { rx: 0.05 * (1 - ease), ry: 0 };

      pose.rightShoulder = { rz: 0.3 - ease * 0.5, rx: -0.5 + ease * 0.3 };
      pose.rightElbow = { rx: -0.2 - ease * 0.5 };
      pose.rightWrist = { rz: -ease * 0.1 };

      pose.leftShoulder = { rz: 0.2 + ease * 0.1, rx: -0.2 - ease * 0.3 };
      pose.leftElbow = { rx: -0.1 - ease * 0.4 };

      pose.rightHip = { rx: -0.1 + ease * 0.1 };
      pose.rightKnee = { rx: 0.9 - ease * 0.6 };
      pose.rightAnkle = { rx: -0.15 + ease * 0.05 };

      pose.leftHip = { rx: -0.1 + ease * 0.08 };
      pose.leftKnee = { rx: 0.4 - ease * 0.25 };
      pose.leftAnkle = { rx: -0.15 + ease * 0.05 };
    }

    return pose;
  }
}
