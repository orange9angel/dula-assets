import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SpinKick — 街霸红丸式 360° 多圈回旋踢（专业版）
 *
 * 改进：
 * - 起跳更高，踢腿更直
 * - 旋转时身体更水平
 * - 落地有缓冲
 */
export class SpinKick extends AnimationBase {
  constructor() {
    super('SpinKick', 1.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Crouch wind-up (0-0.12) - 蓄力下蹲
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      // 下蹲但不穿地（限制下沉）
      pose.mesh = { y: -ease * 0.08, ry: -ease * 0.5 };

      // 右腿向后抬起蓄力
      pose.rightHip = { rx: -ease * 0.8, rz: ease * 0.3 };
      pose.rightKnee = { rx: ease * 1.4 };
      pose.rightAnkle = { rx: -ease * 0.5 };

      // 左腿弯曲支撑
      pose.leftHip = { rx: ease * 0.5 };
      pose.leftKnee = { rx: ease * 1.0 };
      pose.leftAnkle = { rx: -ease * 0.4 };

      // 手臂张开保持平衡
      pose.rightShoulder = { rz: -ease * 1.0, rx: -ease * 0.4 };
      pose.rightElbow = { rx: -ease * 0.8 };
      pose.leftShoulder = { rz: ease * 1.0, rx: -ease * 0.4 };
      pose.leftElbow = { rx: -ease * 0.8 };
    }
    // Phase 2: Jump + 5-spin (0.12-0.55) - 起跳+高速旋转5圈
    else if (t < 0.55) {
      const p = (t - 0.12) / 0.43;
      const ease = 1 - Math.pow(1 - p, 2);

      // 起跳高度 + 5圈旋转 (5 * 2π = 31.4 rad)
      pose.mesh = {
        y: -0.08 + ease * 1.5,
        ry: -0.5 + ease * 31.4,
        rx: ease * 0.35,
      };

      // 右腿：蓄力→完全伸直 水平高踢
      pose.rightHip = { rx: -0.8 + ease * 2.8, rz: 0.3 - ease * 0.3 };
      pose.rightKnee = { rx: 1.4 - ease * 1.4 };
      pose.rightAnkle = { rx: -0.5 + ease * 0.5 };

      // 左腿：收起贴紧身体
      pose.leftHip = { rx: 0.5 + ease * 0.8, rz: -ease * 0.2 };
      pose.leftKnee = { rx: 1.0 + ease * 0.5 };
      pose.leftAnkle = { rx: -0.4 - ease * 0.3 };

      // 手臂：张开→收紧旋转
      pose.rightShoulder = { rz: -1.0 + ease * 0.5, rx: -0.4 + ease * 0.3 };
      pose.rightElbow = { rx: -0.8 + ease * 0.5 };
      pose.leftShoulder = { rz: 1.0 - ease * 0.7, rx: -0.4 + ease * 0.3 };
      pose.leftElbow = { rx: -0.8 + ease * 0.5 };
    }
    // Phase 3: HOLD kick (0.55-0.75) - 维持旋转+踢击
    else if (t < 0.75) {
      const p = (t - 0.55) / 0.2;
      const hold = 1 - p * 0.1;

      pose.mesh = {
        y: 1.42 * hold,
        ry: 30.9 * hold,
        rx: 0.35 * hold,
      };

      // 右腿保持伸直高踢
      pose.rightHip = { rx: 2.0, rz: 0 };
      pose.rightKnee = { rx: 0 };
      pose.rightAnkle = { rx: 0 };

      // 左腿保持收起
      pose.leftHip = { rx: 1.3, rz: -0.2 };
      pose.leftKnee = { rx: 1.5 };
      pose.leftAnkle = { rx: -0.7 };

      // 手臂保持旋转姿态
      pose.rightShoulder = { rz: -0.5, rx: -0.1 };
      pose.rightElbow = { rx: -0.3 };
      pose.leftShoulder = { rz: 0.3, rx: -0.1 };
      pose.leftElbow = { rx: -0.3 };
    }
    // Phase 4: Land + retract (0.75-0.90) - 落地收腿
    else if (t < 0.90) {
      const p = (t - 0.75) / 0.15;
      const ease = p * p;

      pose.mesh = {
        y: 1.28 - ease * 1.28,
        ry: 27.8 - ease * 27.3,
        rx: 0.32 - ease * 0.32,
      };

      // 右腿收回
      pose.rightHip = { rx: 2.0 - ease * 2.0, rz: ease * 0.1 };
      pose.rightKnee = { rx: ease * 0.4 };
      pose.rightAnkle = { rx: -ease * 0.2 };

      // 左腿落地支撑
      pose.leftHip = { rx: 1.3 - ease * 0.9 };
      pose.leftKnee = { rx: 1.5 - ease * 1.1 };
      pose.leftAnkle = { rx: -0.7 + ease * 0.5 };

      // 手臂收回
      pose.rightShoulder = { rz: -0.5 + ease * 0.3, rx: -0.1 + ease * 0.1 };
      pose.rightElbow = { rx: -0.3 + ease * 0.2 };
      pose.leftShoulder = { rz: 0.3 - ease * 0.2, rx: -0.1 + ease * 0.1 };
      pose.leftElbow = { rx: -0.3 + ease * 0.2 };
    }
    // Phase 5: Recover (0.90-1.0) - 恢复格斗站姿
    else {
      const p = (t - 0.90) / 0.1;
      const ease = p * p;

      pose.mesh = { ry: 0.5 - ease * 0.5 };

      pose.rightHip = { rx: ease * 0.2 };
      pose.rightKnee = { rx: ease * 0.15 };
      pose.rightAnkle = { rx: -ease * 0.1 };

      pose.leftHip = { rx: ease * 0.2 };
      pose.leftKnee = { rx: ease * 0.15 };
      pose.leftAnkle = { rx: -ease * 0.1 };

      pose.rightShoulder = { rz: -ease * 0.9, rx: -ease * 0.7 };
      pose.rightElbow = { rx: -ease * 0.5 };
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.4 };
      pose.leftElbow = { rx: -ease * 0.4 };
    }

    return pose;
  }
}
