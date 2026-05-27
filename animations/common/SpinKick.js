import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SpinKick — 回旋踢（空中回旋踢版）
 *
 * 动作分解：
 * 1. 蓄力下蹲（0-0.15s）
 * 2. 起跳+身体旋转（0.15-0.35s）
 * 3. 空中回旋踢出（0.35-0.55s）— 右腿高踢，身体水平旋转
 * 4. 落地收腿（0.55-0.80s）
 * 5. 恢复站姿（0.80-1.0s）
 */
export class SpinKick extends AnimationBase {
  constructor() {
    super('SpinKick', 0.9);
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

    // Phase 1: Crouch wind-up (0-0.15) - 蓄力下蹲
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;

      // 下蹲蓄力
      pose.mesh = { y: -ease * 0.25, ry: -ease * 0.3 };

      // 右腿向后抬起蓄力
      pose.rightHip = { rx: -ease * 0.6, rz: ease * 0.2 };
      pose.rightKnee = { rx: ease * 1.2 };
      pose.rightAnkle = { rx: -ease * 0.4 };

      // 左腿弯曲支撑
      pose.leftHip = { rx: ease * 0.4 };
      pose.leftKnee = { rx: ease * 0.8 };
      pose.leftAnkle = { rx: -ease * 0.3 };

      // 手臂张开保持平衡
      pose.rightShoulder = { rz: -ease * 0.8, rx: -ease * 0.3 };
      pose.rightElbow = { rx: -ease * 0.6 };
      pose.leftShoulder = { rz: ease * 0.8, rx: -ease * 0.3 };
      pose.leftElbow = { rx: -ease * 0.6 };
    }
    // Phase 2: Jump + spin start (0.15-0.35) - 起跳旋转
    else if (t < 0.35) {
      const p = (t - 0.15) / 0.2;
      const ease = 1 - Math.pow(1 - p, 2);

      // 身体起跳+旋转
      pose.mesh = {
        y: -0.25 + ease * 0.6,  // 起跳高度
        ry: -0.3 + ease * 1.8,   // 大幅旋转（约100度）
      };

      // 右腿开始向前上方踢出
      pose.rightHip = { rx: -0.6 + ease * 1.8, rz: 0.2 - ease * 0.2 };
      pose.rightKnee = { rx: 1.2 - ease * 0.3 };
      pose.rightAnkle = { rx: -0.4 + ease * 0.6 };

      // 左腿收起
      pose.leftHip = { rx: 0.4 + ease * 0.4 };
      pose.leftKnee = { rx: 0.8 + ease * 0.4 };
      pose.leftAnkle = { rx: -0.3 - ease * 0.2 };

      // 手臂配合旋转
      pose.rightShoulder = { rz: -0.8 + ease * 0.4, rx: -0.3 + ease * 0.2 };
      pose.rightElbow = { rx: -0.6 + ease * 0.3 };
      pose.leftShoulder = { rz: 0.8 - ease * 0.6, rx: -0.3 + ease * 0.2 };
      pose.leftElbow = { rx: -0.6 + ease * 0.3 };
    }
    // Phase 3: KICK! (0.35-0.55) - 空中回旋踢最高点
    else if (t < 0.55) {
      const p = (t - 0.35) / 0.2;
      const ease = Math.sin(p * Math.PI);  // 峰值曲线

      // 空中最高点，身体水平
      pose.mesh = {
        y: 0.35 + ease * 0.15,
        ry: 1.5,  // 保持旋转角度
        rx: ease * 0.15,  // 轻微侧倾
      };

      // 右腿完全踢出（高踢）
      pose.rightHip = { rx: 1.2 + ease * 0.3, rz: 0 };
      pose.rightKnee = { rx: 0.9 - ease * 0.6 };
      pose.rightAnkle = { rx: 0.2 + ease * 0.2 };

      // 左腿弯曲收起
      pose.leftHip = { rx: 0.8, rz: -0.1 };
      pose.leftKnee = { rx: 1.2 };
      pose.leftAnkle = { rx: -0.5 };

      // 手臂张开保持平衡
      pose.rightShoulder = { rz: -0.4, rx: -0.1 };
      pose.rightElbow = { rx: -0.3 };
      pose.leftShoulder = { rz: 0.2, rx: -0.1 };
      pose.leftElbow = { rx: -0.3 };
    }
    // Phase 4: Land + retract (0.55-0.80) - 落地收腿
    else if (t < 0.80) {
      const p = (t - 0.55) / 0.25;
      const ease = p * p;

      // 落地
      pose.mesh = {
        y: 0.5 - ease * 0.5,
        ry: 1.5 - ease * 1.2,
        rx: ease * 0.1,
      };

      // 右腿收回
      pose.rightHip = { rx: 1.5 - ease * 1.5, rz: ease * 0.1 };
      pose.rightKnee = { rx: 0.3 + ease * 0.3 };
      pose.rightAnkle = { rx: 0.4 - ease * 0.4 };

      // 左腿落地支撑
      pose.leftHip = { rx: 0.8 - ease * 0.6 };
      pose.leftKnee = { rx: 1.2 - ease * 0.8 };
      pose.leftAnkle = { rx: -0.5 + ease * 0.3 };

      // 手臂收回
      pose.rightShoulder = { rz: -0.4 + ease * 0.2, rx: -0.1 + ease * 0.1 };
      pose.rightElbow = { rx: -0.3 + ease * 0.2 };
      pose.leftShoulder = { rz: 0.2 - ease * 0.1, rx: -0.1 + ease * 0.1 };
      pose.leftElbow = { rx: -0.3 + ease * 0.2 };
    }
    // Phase 5: Recover (0.80-1.0) - 恢复格斗站姿
    else {
      const p = (t - 0.80) / 0.2;
      const ease = p * p;

      pose.mesh = { ry: 0.3 - ease * 0.3 };

      pose.rightHip = { rx: ease * 0.2 };
      pose.rightKnee = { rx: ease * 0.1 };
      pose.rightAnkle = { rx: -ease * 0.1 };

      pose.leftHip = { rx: ease * 0.2 };
      pose.leftKnee = { rx: ease * 0.1 };
      pose.leftAnkle = { rx: -ease * 0.1 };

      pose.rightShoulder = { rz: -ease * 0.9, rx: -ease * 0.7 };
      pose.rightElbow = { rx: -ease * 0.5 };
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.4 };
      pose.leftElbow = { rx: -ease * 0.4 };
    }

    return pose;
  }
}
