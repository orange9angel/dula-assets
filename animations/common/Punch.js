import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Punch — 直拳（13点矩阵控制版）
 *
 * 使用关节：rightShoulder, rightElbow, rightWrist, leftShoulder, leftElbow, headGroup, mesh
 *
 * 姿势约定（相对基线偏移）：
 * - rx 负值 = 向前（出拳方向）
 * - rz 正值 = 向外展开，负值 = 向内收
 * - elbow rx 负值 = 前臂向前弯曲（护脸/出拳）
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

    // Phase 1: Wind up (0-0.15) - 蓄力
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;

      // 右臂：向后拉，肘部弯曲蓄力
      pose.rightShoulder = { rz: -ease * 0.3, rx: -ease * 0.4 };
      pose.rightElbow = { rx: -ease * 1.2 };
      pose.rightWrist = { rz: -ease * 0.2 };

      // 左臂：护脸准备
      pose.leftShoulder = { rz: ease * 0.4, rx: -ease * 0.5 };
      pose.leftElbow = { rx: -ease * 0.8 };

      // 身体：微蹲蓄力
      pose.mesh = { y: -ease * 0.06, ry: -ease * 0.1 };

      // 头：后拉
      pose.headGroup = { ry: -0.05 * ease, rx: 0.02 * ease };
    }
    // Phase 2: PUNCH! (0.15-0.35) - 爆发突刺
    else if (t < 0.35) {
      const p = (t - 0.15) / 0.2;
      const ease = 1 - Math.pow(1 - p, 3);

      // 右臂：肩膀前推，肘部伸直，拳头冲出
      pose.rightShoulder = { rz: -0.3 + ease * 1.0, rx: -0.4 - ease * 1.0 };
      pose.rightElbow = { rx: -1.2 + ease * 1.5 };
      pose.rightWrist = { rz: -0.2 + ease * 0.3 };

      // 左臂：收紧护脸
      pose.leftShoulder = { rz: 0.4 - ease * 0.1, rx: -0.5 - ease * 0.2 };
      pose.leftElbow = { rx: -0.8 - ease * 0.3 };

      // 身体：突进
      pose.mesh = { x: ease * 0.3, y: -0.06 + ease * 0.06, ry: -0.1 + ease * 0.15 };

      // 头：跟进
      pose.headGroup = { ry: -0.05 + ease * 0.15, rx: 0.02 + ease * 0.05 };
    }
    // Phase 3: Recovery (0.35-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.35) / 0.65;
      const ease = p * p;

      // 右臂：回到护脸姿势
      pose.rightShoulder = { rz: 0.7 - ease * 0.85, rx: -1.4 + ease * 0.5 };
      pose.rightElbow = { rx: 0.3 - ease * 1.1 };
      pose.rightWrist = { rz: 0.1 - ease * 0.3 };

      // 左臂：回到护脸
      pose.leftShoulder = { rz: 0.3 + ease * 0.1, rx: -0.7 + ease * 0.2 };
      pose.leftElbow = { rx: -1.1 + ease * 0.3 };

      // 身体：回位
      pose.mesh = { x: 0.3 * (1 - ease), y: -ease * 0.06, ry: 0.05 - ease * 0.05 };

      // 头：回中
      pose.headGroup = { ry: 0.1 * (1 - ease), rx: 0.07 * (1 - ease) };
    }

    return pose;
  }
}
