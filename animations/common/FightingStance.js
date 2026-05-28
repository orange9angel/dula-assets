import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FightingStance — 格斗站姿（KOF/街霸风格）
 *
 * 持续循环的格斗准备姿势，带轻微呼吸和重心转移。
 * 用于战斗开始、对峙、等待状态。
 * 参考：KOF 草薙京站姿、街霸隆的架势
 */
export class FightingStance extends AnimationBase {
  constructor() {
    super('FightingStance', 1.2);
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

    // 循环周期 1.2s，纯上下呼吸（去掉左右晃动）
    const cycle = t * Math.PI * 2;
    const breathe = Math.sin(cycle) * 0.008;

    // 身体：更低更稳的格斗站姿，重心下沉但不左右晃
    pose.mesh = {
      y: -0.06 + breathe,
      rx: 0.04,
    };

    // 头部：保持水平，微随呼吸
    pose.headGroup = {
      rx: -0.04 + Math.sin(cycle * 0.8) * 0.008,
      ry: Math.sin(cycle * 0.3) * 0.015,
    };

    // 右臂：前伸护脸（拳架）— 更大角度，更专业
    pose.rightShoulder = {
      rz: -0.9 + Math.sin(cycle * 0.7) * 0.02,
      rx: -0.7 + Math.sin(cycle * 0.6) * 0.015,
    };
    pose.rightElbow = {
      rx: -1.1 + Math.sin(cycle * 0.8) * 0.03,
    };
    pose.rightWrist = {
      rz: -0.2,
      rx: -0.15,
    };

    // 左臂：稍靠后，护肋 — 同样增大角度
    pose.leftShoulder = {
      rz: 0.8 + Math.sin(cycle * 0.7 + 1) * 0.02,
      rx: -0.6 + Math.sin(cycle * 0.6 + 1) * 0.015,
    };
    pose.leftElbow = {
      rx: -1.0 + Math.sin(cycle * 0.8 + 1) * 0.03,
    };
    pose.leftWrist = {
      rz: 0.15,
      rx: -0.1,
    };

    // 右腿：明显弯曲，主力腿 — KOF风格低重心
    pose.rightHip = {
      rx: 0.25 + Math.sin(cycle * 0.5) * 0.015,
      rz: 0.05,
    };
    pose.rightKnee = {
      rx: 0.45 + Math.sin(cycle * 0.5) * 0.02,
    };
    pose.rightAnkle = {
      rx: -0.15,
    };

    // 左腿：同样弯曲，辅助支撑
    pose.leftHip = {
      rx: 0.2 - Math.sin(cycle * 0.5) * 0.01,
      rz: -0.03,
    };
    pose.leftKnee = {
      rx: 0.35 - Math.sin(cycle * 0.5) * 0.015,
    };
    pose.leftAnkle = {
      rx: -0.1,
    };

    return pose;
  }
}
