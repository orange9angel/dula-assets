import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FightingStance — 战斗姿态（13点矩阵控制版）
 *
 * 经典奥特曼格斗起手式
 */
export class UltraFightingStance extends AnimationBase {
  constructor() {
    super('FightingStance', 1.5);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const p = t < 0.3 ? t / 0.3 : 1;

    // 右臂：握拳护脸（后手防守）
    pose.rightShoulder = { rz: -p * 0.15, rx: -p * 0.9 };
    pose.rightElbow = { rx: -p * 0.8 };

    // 左臂：握拳护脸（前手防守）
    pose.leftShoulder = { rz: p * 0.1, rx: -p * 0.8 };
    pose.leftElbow = { rx: -p * 0.7 };

    // 腿部前后马步
    pose.rightHip = { rx: -p * 0.15 };
    pose.rightKnee = { rx: p * 0.1 };
    pose.leftHip = { rx: p * 0.15 };
    pose.leftKnee = { rx: p * 0.2 };

    // 身体微蹲
    pose.mesh = { y: -p * 0.3, ry: p * 0.3 };

    return pose;
  }
}
