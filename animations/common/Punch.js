import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Punch — 直拳（KOF/街霸风格专业版）
 *
 * 核心改进：
 * - 躯干扭转（hip ry + shoulder rz 联动）形成鞭打效应
 * - 更大的关节角度（shoulder rz 1.3+ rad）
 * - 更短的爆发时间（0.12s）
 * - 重心前移更明显（mesh.x 0.5+）
 * - 过伸跟随（follow-through）
 */
export class Punch extends AnimationBase {
  constructor() {
    super('Punch', 0.5);
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

    // Phase 1: Wind up (0-0.12) - 蓄力后拉
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      // 右臂：向后拉到极限，肘部深屈蓄力
      pose.rightShoulder = { rz: -ease * 0.5, rx: -ease * 0.6 };
      pose.rightElbow = { rx: -ease * 1.5 };
      pose.rightWrist = { rz: -ease * 0.3 };

      // 左臂：收紧护脸
      pose.leftShoulder = { rz: ease * 0.6, rx: -ease * 0.6 };
      pose.leftElbow = { rx: -ease * 1.0 };

      // 身体：后坐蓄力 + 髋肩预扭转
      pose.mesh = { x: -ease * 0.15, y: -ease * 0.04, ry: ease * 0.25 };

      // 髋部：预扭转（右拳左髋后拉）
      pose.rightHip = { rz: -ease * 0.1 };
      pose.leftHip = { rz: ease * 0.1 };

      // 头：后拉
      pose.headGroup = { ry: -0.08 * ease, rx: 0.03 * ease };
    }
    // Phase 2: PUNCH! (0.12-0.30) - 爆发突刺
    else if (t < 0.30) {
      const p = (t - 0.12) / 0.18;
      const ease = 1 - Math.pow(1 - p, 3);

      // 右臂：肩膀前推，肘部爆发伸直，拳头冲出
      // shoulder rz: -0.5 → 1.3 (大角度外展)
      pose.rightShoulder = { rz: -0.5 + ease * 1.8, rx: -0.6 - ease * 1.2 };
      pose.rightElbow = { rx: -1.5 + ease * 1.8 };
      pose.rightWrist = { rz: -0.3 + ease * 0.4 };

      // 左臂：收紧护脸
      pose.leftShoulder = { rz: 0.6 - ease * 0.2, rx: -0.6 - ease * 0.2 };
      pose.leftElbow = { rx: -1.0 - ease * 0.3 };

      // 身体：突进 + 髋肩反向扭转（鞭打）
      pose.mesh = {
        x: -0.15 + ease * 0.55,
        y: -0.04 + ease * 0.04,
        ry: 0.25 - ease * 0.45,
      };

      // 髋部：爆发扭转
      pose.rightHip = { rz: -0.1 + ease * 0.25 };
      pose.leftHip = { rz: 0.1 - ease * 0.2 };

      // 右腿：蹬地发力
      pose.rightKnee = { rx: ease * 0.15 };
      pose.rightAnkle = { rx: -ease * 0.1 };

      // 头：跟进
      pose.headGroup = { ry: -0.08 + ease * 0.2, rx: 0.03 + ease * 0.06 };
    }
    // Phase 3: Follow-through (0.30-0.42) - 过伸跟随
    else if (t < 0.42) {
      const p = (t - 0.30) / 0.12;
      const ease = p * p;

      // 过伸：肩膀超过目标 15%
      pose.rightShoulder = { rz: 1.3 + ease * 0.15, rx: -1.8 + ease * 0.1 };
      pose.rightElbow = { rx: 0.3 + ease * 0.1 };
      pose.rightWrist = { rz: 0.1 + ease * 0.05 };

      pose.leftShoulder = { rz: 0.4, rx: -0.8 };
      pose.leftElbow = { rx: -1.3 };

      pose.mesh = { x: 0.4 - ease * 0.05, ry: -0.2 + ease * 0.05 };

      pose.rightHip = { rz: 0.15 - ease * 0.03 };
      pose.leftHip = { rz: -0.1 + ease * 0.02 };

      pose.headGroup = { ry: 0.12 - ease * 0.03, rx: 0.09 - ease * 0.02 };
    }
    // Phase 4: Recovery (0.42-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.42) / 0.58;
      const ease = p * p;

      // 右臂：回到护脸姿势
      pose.rightShoulder = { rz: 1.45 - ease * 1.6, rx: -1.7 + ease * 0.7 };
      pose.rightElbow = { rx: 0.4 - ease * 1.2 };
      pose.rightWrist = { rz: 0.15 - ease * 0.4 };

      // 左臂：回到护脸
      pose.leftShoulder = { rz: 0.4 + ease * 0.2, rx: -0.8 + ease * 0.1 };
      pose.leftElbow = { rx: -1.3 + ease * 0.2 };

      // 身体：回位
      pose.mesh = { x: 0.35 * (1 - ease), y: -ease * 0.04, ry: -0.15 + ease * 0.15 };

      // 髋部回中
      pose.rightHip = { rz: 0.12 - ease * 0.12 };
      pose.leftHip = { rz: -0.08 + ease * 0.08 };

      // 头：回中
      pose.headGroup = { ry: 0.09 * (1 - ease), rx: 0.07 * (1 - ease) };
    }

    return pose;
  }
}
