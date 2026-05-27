import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SweepKick — 扫堂腿/低扫踢（参考KOF大门五郎、街霸Guy）
 *
 * 身体下沉，单腿支撑，另一腿水平扫出。
 * 典型的下段攻击，用于击倒对手。
 */
export class SweepKick extends AnimationBase {
  constructor() {
    super('SweepKick', 0.7);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Drop & wind (0-0.18) - 下沉蓄力
    if (t < 0.18) {
      const p = t / 0.18;
      const ease = p * p;

      // 身体：大幅下沉+前倾
      pose.mesh = {
        y: -ease * 0.35,
        x: -ease * 0.15,
        rx: ease * 0.35,
        rz: -ease * 0.12,
      };

      pose.headGroup = { rx: ease * 0.2, ry: ease * 0.1 };

      // 双臂：展开平衡
      pose.rightShoulder = { rz: -ease * 0.7, rx: -ease * 0.4 };
      pose.rightElbow = { rx: -ease * 0.5 };
      pose.leftShoulder = { rz: ease * 0.7, rx: -ease * 0.4 };
      pose.leftElbow = { rx: -ease * 0.5 };

      // 右腿：支撑腿屈膝
      pose.rightHip = { rx: ease * 0.4 };
      pose.rightKnee = { rx: ease * 0.7 };
      pose.rightAnkle = { rx: -ease * 0.15 };

      // 左腿：收腿准备
      pose.leftHip = { rx: -ease * 0.3, rz: ease * 0.2 };
      pose.leftKnee = { rx: ease * 0.8 };
      pose.leftAnkle = { rx: -ease * 0.2 };
    }
    // Phase 2: SWEEP (0.18-0.38) - 扫腿！
    else if (t < 0.38) {
      const p = (t - 0.18) / 0.2;
      const ease = 1 - Math.pow(1 - p, 3);

      // 身体：继续下沉+旋转
      pose.mesh = {
        y: -0.35 - ease * 0.1,
        x: -0.15 + ease * 0.35,
        rx: 0.35 - ease * 0.1,
        rz: -0.12 + ease * 0.25,
        ry: -ease * 0.3,
      };

      pose.headGroup = { rx: 0.2 - ease * 0.1, ry: 0.1 - ease * 0.15 };

      // 右臂：后摆
      pose.rightShoulder = { rz: -0.7 + ease * 0.2, rx: -0.4 + ease * 0.1 };
      pose.rightElbow = { rx: -0.5 + ease * 0.2 };

      // 左臂：前伸
      pose.leftShoulder = { rz: 0.7 - ease * 0.3, rx: -0.4 + ease * 0.2 };
      pose.leftElbow = { rx: -0.5 + ease * 0.3 };

      // 右腿：支撑腿蹬直
      pose.rightHip = { rx: 0.4 - ease * 0.2 };
      pose.rightKnee = { rx: 0.7 - ease * 0.3 };
      pose.rightAnkle = { rx: -0.15 + ease * 0.05 };

      // 左腿：水平扫出！
      pose.leftHip = { rx: -0.3 - ease * 1.0, rz: 0.2 + ease * 0.4 };
      pose.leftKnee = { rx: 0.8 - ease * 1.3 };
      pose.leftAnkle = { rx: -0.2 + ease * 0.3 };
    }
    // Phase 3: Hold (0.38-0.5) - 扫腿保持
    else if (t < 0.5) {
      const p = (t - 0.38) / 0.12;
      const breathe = Math.sin(p * Math.PI) * 0.02;

      pose.mesh = {
        y: -0.45 + breathe,
        x: 0.2,
        rx: 0.25,
        rz: 0.13,
        ry: -0.3,
      };

      pose.headGroup = { rx: 0.1 + breathe * 0.3, ry: -0.05 };

      pose.rightShoulder = { rz: -0.5, rx: -0.3 };
      pose.rightElbow = { rx: -0.3 };
      pose.leftShoulder = { rz: 0.4, rx: -0.2 };
      pose.leftElbow = { rx: -0.2 };

      pose.rightHip = { rx: 0.2 };
      pose.rightKnee = { rx: 0.4 };
      pose.rightAnkle = { rx: -0.1 };

      pose.leftHip = { rx: -1.3, rz: 0.6 };
      pose.leftKnee = { rx: -0.5 };
      pose.leftAnkle = { rx: 0.1 };
    }
    // Phase 4: Retract (0.5-0.7) - 收腿
    else {
      const p = (t - 0.5) / 0.2;
      const ease = p * p;

      pose.mesh = {
        y: -0.45 + ease * 0.35,
        x: 0.2 * (1 - ease),
        rx: 0.25 - ease * 0.25,
        rz: 0.13 - ease * 0.13,
        ry: -0.3 * (1 - ease),
      };

      pose.headGroup = { rx: 0.1 * (1 - ease), ry: -0.05 * (1 - ease) };

      pose.rightShoulder = { rz: -0.5 + ease * 0.5, rx: -0.3 + ease * 0.3 };
      pose.rightElbow = { rx: -0.3 + ease * 0.3 };
      pose.leftShoulder = { rz: 0.4 - ease * 0.4, rx: -0.2 + ease * 0.2 };
      pose.leftElbow = { rx: -0.2 + ease * 0.2 };

      pose.rightHip = { rx: 0.2 - ease * 0.2 };
      pose.rightKnee = { rx: 0.4 - ease * 0.4 };
      pose.rightAnkle = { rx: -0.1 + ease * 0.1 };

      pose.leftHip = { rx: -1.3 + ease * 1.3, rz: 0.6 - ease * 0.6 };
      pose.leftKnee = { rx: -0.5 + ease * 0.5 };
      pose.leftAnkle = { rx: 0.1 - ease * 0.1 };
    }

    return pose;
  }
}
