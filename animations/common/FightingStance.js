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

    // 循环周期 1.2s，重心左右微移
    const cycle = t * Math.PI * 2;
    const breathe = Math.sin(cycle) * 0.012;
    const sway = Math.sin(cycle * 0.5) * 0.02;

    // 身体：微蹲，重心下沉
    pose.mesh = {
      y: -0.08 + breathe,
      x: sway,
      rx: 0.06,
    };

    // 头部：保持水平，微随呼吸
    pose.headGroup = {
      rx: -0.04 + Math.sin(cycle * 0.8) * 0.008,
      ry: Math.sin(cycle * 0.3) * 0.015,
    };

    // 右臂：前伸护脸（拳架）
    pose.rightShoulder = {
      rz: -0.75 + Math.sin(cycle * 0.7) * 0.03,
      rx: -0.55 + Math.sin(cycle * 0.6) * 0.02,
    };
    pose.rightElbow = {
      rx: -0.95 + Math.sin(cycle * 0.8) * 0.04,
    };
    pose.rightWrist = {
      rz: -0.15,
      rx: -0.1,
    };

    // 左臂：稍靠后，护肋
    pose.leftShoulder = {
      rz: 0.65 + Math.sin(cycle * 0.7 + 1) * 0.03,
      rx: -0.45 + Math.sin(cycle * 0.6 + 1) * 0.02,
    };
    pose.leftElbow = {
      rx: -0.85 + Math.sin(cycle * 0.8 + 1) * 0.04,
    };
    pose.leftWrist = {
      rz: 0.12,
      rx: -0.08,
    };

    // 右腿：微屈，主力腿
    pose.rightHip = {
      rx: 0.15 + Math.sin(cycle * 0.5) * 0.02,
    };
    pose.rightKnee = {
      rx: 0.25 + Math.sin(cycle * 0.5) * 0.03,
    };
    pose.rightAnkle = {
      rx: -0.08,
    };

    // 左腿：稍直，辅助支撑
    pose.leftHip = {
      rx: 0.08 - Math.sin(cycle * 0.5) * 0.01,
    };
    pose.leftKnee = {
      rx: 0.18 - Math.sin(cycle * 0.5) * 0.02,
    };
    pose.leftAnkle = {
      rx: -0.05,
    };

    return pose;
  }
}
