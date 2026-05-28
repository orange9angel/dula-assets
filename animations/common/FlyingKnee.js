import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FlyingKnee — 飞膝撞
 * 短距离冲刺腾空，单膝前顶撞击
 * 参考：泰拳飞膝 / MMA 飞膝 KO
 */
export class FlyingKnee extends AnimationBase {
  constructor() {
    super('FlyingKnee', 1.2);
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

    // Phase 1: Dash (0-0.20) - 冲刺蓄力
    if (t < 0.20) {
      const p = t / 0.20;
      const e = p * p;

      pose.mesh = { x: e * 1.5, ry: -e * 0.2 };

      // 右腿后蹬
      pose.rightHip = { rx: e * 0.4 };
      pose.rightKnee = { rx: e * 0.6 };

      // 左腿提膝准备
      pose.leftHip = { rx: -e * 1.2 };
      pose.leftKnee = { rx: e * 1.6 };

      // 双臂后摆
      pose.rightShoulder = { rx: -e * 1.0, rz: -e * 0.3 };
      pose.leftShoulder = { rx: -e * 1.0, rz: e * 0.3 };
    }
    // Phase 2: Launch (0.20-0.35) - 腾空
    else if (t < 0.35) {
      const p = (t - 0.20) / 0.15;
      const e = 1 - Math.pow(1 - p, 3);

      pose.mesh = {
        x: 1.5 + e * 1.0,
        y: e * 1.8,
        ry: -0.2 + e * 0.3,
      };

      // 右腿后伸
      pose.rightHip = { rx: 0.4 + e * 0.8 };
      pose.rightKnee = { rx: 0.6 + e * 0.4 };

      // 左腿膝击前顶（髋屈+膝折叠）
      pose.leftHip = { rx: -1.2 - e * 0.8, rz: e * 0.2 };
      pose.leftKnee = { rx: 1.6 + e * 0.6 };
      pose.leftAnkle = { rx: -e * 0.5 };

      // 双臂上拉助力
      pose.rightShoulder = { rx: -1.0 - e * 0.8, rz: -0.3 };
      pose.leftShoulder = { rx: -1.0 - e * 0.8, rz: 0.3 };
    }
    // Phase 3: KNEE STRIKE! (0.35-0.50) - 膝击顶点
    else if (t < 0.50) {
      const p = (t - 0.35) / 0.15;
      const e = Math.sin(p * Math.PI);

      pose.mesh = {
        x: 2.5 + e * 0.5,
        y: 1.8 + e * 0.3,
        ry: 0.1 + e * 0.2,
      };

      // 右腿后伸平衡
      pose.rightHip = { rx: 1.2 + e * 0.3 };
      pose.rightKnee = { rx: 1.0 };

      // 左腿膝击最大化
      pose.leftHip = { rx: -2.0, rz: 0.2 };
      pose.leftKnee = { rx: 2.2 };  // 膝折叠最大
      pose.leftAnkle = { rx: -0.5 };

      // 双臂下拉助力
      pose.rightShoulder = { rx: -1.8 + e * 0.5, rz: -0.3 };
      pose.leftShoulder = { rx: -1.8 + e * 0.5, rz: 0.3 };

      // 身体前倾
      pose.mesh.rx = e * 0.4;
    }
    // Phase 4: Descend (0.50-0.75) - 下落
    else if (t < 0.75) {
      const p = (t - 0.50) / 0.25;
      const e = p * p;

      pose.mesh = {
        x: 3.0 - e * 1.0,
        y: 2.1 - e * 2.6,
        ry: 0.3 - e * 0.3,
      };

      // 右腿准备落地
      pose.rightHip = { rx: 1.5 - e * 1.0 };
      pose.rightKnee = { rx: 1.0 - e * 0.5 };

      // 左腿收回
      pose.leftHip = { rx: -2.0 + e * 1.8 };
      pose.leftKnee = { rx: 2.2 - e * 1.8 };
      pose.leftAnkle = { rx: -0.5 + e * 0.3 };

      pose.rightShoulder = { rx: -1.3 + e * 0.8 };
      pose.leftShoulder = { rx: -1.3 + e * 0.8 };
    }
    // Phase 5: Land (0.75-1.0) - 落地恢复
    else {
      const p = (t - 0.75) / 0.25;
      const e = p * p;

      pose.mesh = { x: 2.0 - e * 2.0, y: -0.5 + e * 0.5 };

      pose.rightHip = { rx: 0.5 - e * 0.5 };
      pose.rightKnee = { rx: 0.5 - e * 0.5 };
      pose.leftHip = { rx: -0.2 + e * 0.2 };
      pose.leftKnee = { rx: 0.4 - e * 0.4 };

      pose.rightShoulder = { rz: -e * 0.3 };
      pose.leftShoulder = { rz: e * 0.3 };
    }

    return pose;
  }
}
