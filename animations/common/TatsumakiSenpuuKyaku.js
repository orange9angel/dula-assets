import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * TatsumakiSenpuuKyaku — 红丸式旋风脚
 * 一个脚水平伸直旋转，一个脚垂直向上踢
 * 真正的 hurricane kick：身体水平旋转，一腿横扫，一腿直踢上天
 */
export class TatsumakiSenpuuKyaku extends AnimationBase {
  constructor() {
    super('TatsumakiSenpuuKyaku', 2.2);
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
    const PI2 = Math.PI * 2;

    // Phase 1: Crouch charge (0-0.12) - 蓄力下蹲
    if (t < 0.12) {
      const p = t / 0.12;
      const e = p * p;

      pose.mesh = { y: -e * 0.25, ry: -e * 0.3 };

      // 右腿收起蓄力
      pose.rightHip = { rx: -e * 0.8, rz: e * 0.2 };
      pose.rightKnee = { rx: e * 1.4 };

      // 左腿支撑
      pose.leftHip = { rx: e * 0.4 };
      pose.leftKnee = { rx: e * 0.8 };

      // 双臂张开平衡
      pose.rightShoulder = { rz: -e * 1.2, rx: -e * 0.4 };
      pose.leftShoulder = { rz: e * 1.2, rx: -e * 0.4 };
    }
    // Phase 2: Launch + horizontal spin (0.12-0.55) - 起跳水平旋转
    else if (t < 0.55) {
      const p = (t - 0.12) / 0.43;
      const e = 1 - Math.pow(1 - p, 3);
      const spins = 5 * PI2 * e;

      pose.mesh = {
        y: -0.25 + e * 1.8,   // 跳到1.8m高
        ry: spins,             // 水平旋转5圈
        rx: e * 0.15,
      };

      // 右腿：水平伸直，横扫旋转（旋风脚主力腿）
      pose.rightHip = { rx: -0.8 + e * 0.5, rz: 0.2 + e * 1.0 };
      pose.rightKnee = { rx: 1.4 - e * 1.4 };  // 完全伸直
      pose.rightAnkle = { rx: e * 0.3 };

      // 左腿：垂直向上踢（90°高踢）
      pose.leftHip = { rx: 0.4 - e * 2.2, rz: -0.2 - e * 0.6 };
      pose.leftKnee = { rx: 0.8 - e * 0.8 };   // 完全伸直向上
      pose.leftAnkle = { rx: -e * 0.5 };

      // 双臂收紧护头
      pose.rightShoulder = { rz: -1.2 + e * 0.8, rx: -e * 0.6 };
      pose.leftShoulder = { rz: 1.2 - e * 0.8, rx: -e * 0.6 };
    }
    // Phase 3: Peak kick hold (0.55-0.75) - 最高点保持
    else if (t < 0.75) {
      const p = (t - 0.55) / 0.20;
      const e = Math.sin(p * Math.PI);
      const spins = 5 * PI2;

      pose.mesh = {
        y: 1.55 + e * 0.3,
        ry: spins + e * 0.2,
        rx: 0.15 + e * 0.2,
      };

      // 右腿保持水平伸直
      pose.rightHip = { rx: -0.3, rz: 1.2 };
      pose.rightKnee = { rx: 0 };
      pose.rightAnkle = { rx: 0.3 };

      // 左腿保持垂直向上踢
      pose.leftHip = { rx: -1.8, rz: -0.8 };
      pose.leftKnee = { rx: 0 };
      pose.leftAnkle = { rx: -0.5 };

      // 双臂护头
      pose.rightShoulder = { rz: -0.4, rx: -0.6 };
      pose.leftShoulder = { rz: 0.4, rx: -0.6 };
    }
    // Phase 4: Descend (0.75-0.90) - 旋转下落
    else if (t < 0.90) {
      const p = (t - 0.75) / 0.15;
      const e = p * p;
      const spins = 5 * PI2 + e * PI2 * 0.5;

      pose.mesh = {
        y: 1.85 - e * 2.1,
        ry: spins,
        rx: 0.35 - e * 0.35,
      };

      // 右腿收回
      pose.rightHip = { rx: -0.3 + e * 1.5, rz: 1.2 - e * 1.2 };
      pose.rightKnee = { rx: e * 0.8 };
      pose.rightAnkle = { rx: 0.3 - e * 0.3 };

      // 左腿收回
      pose.leftHip = { rx: -1.8 + e * 2.0, rz: -0.8 + e * 0.8 };
      pose.leftKnee = { rx: e * 0.6 };
      pose.leftAnkle = { rx: -0.5 + e * 0.5 };

      pose.rightShoulder = { rz: -0.4 + e * 0.6 };
      pose.leftShoulder = { rz: 0.4 - e * 0.6 };
    }
    // Phase 5: Land buffer (0.90-0.96) - 落地缓冲
    else if (t < 0.96) {
      const p = (t - 0.90) / 0.06;
      const e = p * p;

      pose.mesh = { y: -0.25 + e * 0.25, ry: 5.5 * PI2 - e * 5.5 * PI2 };

      pose.rightHip = { rx: 1.2 - e * 1.0 };
      pose.rightKnee = { rx: 0.8 - e * 0.6 };
      pose.leftHip = { rx: 0.2 + e * 0.1 };
      pose.leftKnee = { rx: 0.6 - e * 0.4 };

      pose.rightShoulder = { rz: 0.2 - e * 0.5 };
      pose.leftShoulder = { rz: -0.2 + e * 0.5 };
    }
    // Phase 6: Recover (0.96-1.0) - 恢复
    else {
      const p = (t - 0.96) / 0.04;
      const e = p * p;

      pose.mesh = { y: e * 0.05 };

      pose.rightHip = { rx: 0.2 - e * 0.2 };
      pose.rightKnee = { rx: 0.2 - e * 0.2 };
      pose.leftHip = { rx: 0.3 - e * 0.3 };
      pose.leftKnee = { rx: 0.2 - e * 0.2 };

      pose.rightShoulder = { rz: -0.3 - e * 0.2 };
      pose.leftShoulder = { rz: 0.3 + e * 0.2 };
    }

    return pose;
  }
}
