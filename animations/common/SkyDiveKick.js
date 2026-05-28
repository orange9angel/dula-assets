import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SkyDiveKick — 高空斜踢
 * 跳到 3 人高度，空中翻转后斜向踢击
 * 修复：明显的斜下踢腿动作
 */
export class SkyDiveKick extends AnimationBase {
  constructor() {
    super('SkyDiveKick', 1.8);
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

    // Phase 1: Crouch (0-0.12) - 深蹲蓄力
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      pose.mesh = { y: -ease * 0.4, ry: -ease * 0.4 };

      pose.rightHip = { rx: ease * 0.4 };
      pose.rightKnee = { rx: ease * 1.4 };
      pose.leftHip = { rx: ease * 0.4 };
      pose.leftKnee = { rx: ease * 1.4 };

      pose.rightShoulder = { rz: -ease * 0.8, rx: -ease * 0.6 };
      pose.leftShoulder = { rz: ease * 0.8, rx: -ease * 0.6 };
    }
    // Phase 2: Launch to 5.5m (0.12-0.38) - 爆发起跳
    else if (t < 0.38) {
      const p = (t - 0.12) / 0.26;
      const ease = 1 - Math.pow(1 - p, 3);

      pose.mesh = {
        y: -0.4 + ease * 5.5,
        ry: -0.4 + ease * 2.0,
      };

      // 双腿收起
      pose.rightHip = { rx: 0.4 + ease * 0.6 };
      pose.rightKnee = { rx: 1.4 + ease * 0.4 };
      pose.leftHip = { rx: 0.4 + ease * 0.6 };
      pose.leftKnee = { rx: 1.4 + ease * 0.4 };

      // 手臂上摆
      pose.rightShoulder = { rz: -0.8 + ease * 0.4, rx: -0.6 - ease * 1.8 };
      pose.rightElbow = { rx: -ease * 0.6 };
      pose.leftShoulder = { rz: 0.8 - ease * 0.4, rx: -0.6 - ease * 1.8 };
      pose.leftElbow = { rx: -ease * 0.6 };
    }
    // Phase 3: Flip + aim (0.38-0.50) - 空中翻转瞄准
    else if (t < 0.50) {
      const p = (t - 0.38) / 0.12;
      const ease = p * p;

      pose.mesh = {
        y: 5.1,
        ry: 1.6 + ease * 2.0,
        rx: ease * 0.8,  // 身体前倾
      };

      // 右腿抬起准备斜踢
      pose.rightHip = { rx: 1.0 + ease * 1.0, rz: ease * 0.4 };
      pose.rightKnee = { rx: 1.8 - ease * 0.8 };
      pose.rightAnkle = { rx: -ease * 0.4 };

      // 左腿收起
      pose.leftHip = { rx: 1.0 };
      pose.leftKnee = { rx: 1.8 };

      // 手臂张开平衡
      pose.rightShoulder = { rz: -0.4 - ease * 0.6, rx: -2.4 };
      pose.leftShoulder = { rz: 0.4 + ease * 0.6, rx: -2.4 };
    }
    // Phase 4: DIVE KICK! (0.50-0.68) - 斜向踢击（重点！）
    else if (t < 0.68) {
      const p = (t - 0.50) / 0.18;
      const ease = 1 - Math.pow(1 - p, 2);

      // 身体大幅倾斜斜下
      pose.mesh = {
        y: 5.1 - ease * 2.0,
        ry: 3.6 + ease * 0.3,
        rx: 0.8 + ease * 1.0,  // 身体前倾45°+
      };

      // 右腿完全伸直斜下劈！髋屈+外展
      pose.rightHip = { rx: 2.0 + ease * 1.2, rz: 0.4 + ease * 0.6 };
      pose.rightKnee = { rx: 1.0 - ease * 1.0 };  // 完全伸直
      pose.rightAnkle = { rx: -0.4 - ease * 0.3 };

      // 左腿弯曲收起贴腹
      pose.leftHip = { rx: 1.0 + ease * 0.8, rz: -ease * 0.3 };
      pose.leftKnee = { rx: 1.8 + ease * 0.2 };

      // 手臂前伸助力下劈
      pose.rightShoulder = { rz: -1.0, rx: -2.4 + ease * 1.0 };
      pose.leftShoulder = { rz: 1.0, rx: -2.4 + ease * 1.0 };
    }
    // Phase 5: Descend (0.68-0.88) - 下降收腿
    else if (t < 0.88) {
      const p = (t - 0.68) / 0.20;
      const ease = p * p;

      pose.mesh = {
        y: 3.1 - ease * 3.5,
        ry: 3.9 - ease * 3.5,
        rx: 1.8 - ease * 1.8,
      };

      // 右腿收回
      pose.rightHip = { rx: 3.2 - ease * 3.0, rz: 1.0 - ease * 1.0 };
      pose.rightKnee = { rx: ease * 0.6 };
      pose.rightAnkle = { rx: -0.7 + ease * 0.5 };

      // 左腿准备落地
      pose.leftHip = { rx: 1.8 - ease * 1.2 };
      pose.leftKnee = { rx: 2.0 - ease * 1.2 };
      pose.leftAnkle = { rx: -0.4 + ease * 0.3 };

      pose.rightShoulder = { rz: -1.0 + ease * 0.6, rx: -1.4 + ease * 0.8 };
      pose.leftShoulder = { rz: 1.0 - ease * 0.6, rx: -1.4 + ease * 0.8 };
    }
    // Phase 6: Land (0.88-1.0) - 落地恢复
    else {
      const p = (t - 0.88) / 0.12;
      const ease = p * p;

      pose.mesh = { ry: 0.4 - ease * 0.4 };

      pose.rightHip = { rx: ease * 0.2 };
      pose.rightKnee = { rx: ease * 0.15 };
      pose.leftHip = { rx: ease * 0.2 };
      pose.leftKnee = { rx: ease * 0.15 };

      pose.rightShoulder = { rz: -ease * 1.0, rx: -ease * 0.8 };
      pose.leftShoulder = { rz: ease * 0.6, rx: -ease * 0.5 };
    }

    return pose;
  }
}
