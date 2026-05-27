import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * CounterStance — 反击预备姿势（参考KOF坂崎琢磨、街霸Gouken）
 *
 * 低重心防守姿势，一手护头一手护腹，随时准备反击。
 * 带轻微的前后重心晃动，显示蓄势待发的紧张感。
 */
export class CounterStance extends AnimationBase {
  constructor() {
    super('CounterStance', 1.0);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'defensive'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // 循环呼吸+重心转移
    const cycle = t * Math.PI * 2.5;
    const breathe = Math.sin(cycle) * 0.01;
    const sway = Math.sin(cycle * 0.6) * 0.015;
    const tension = Math.sin(cycle * 1.2) * 0.008;

    // 身体：低重心，微蹲
    pose.mesh = {
      y: -0.12 + breathe,
      x: sway,
      rx: 0.08 + tension,
    };

    // 头部：保持警觉，微随呼吸
    pose.headGroup = {
      rx: -0.06 + Math.sin(cycle * 0.8) * 0.006,
      ry: Math.sin(cycle * 0.4) * 0.012,
    };

    // 右臂：前伸护头（拳架高位）
    pose.rightShoulder = {
      rz: -0.9 + tension * 2,
      rx: -0.65 + Math.sin(cycle * 0.7) * 0.02,
    };
    pose.rightElbow = {
      rx: -1.1 + Math.sin(cycle * 0.9) * 0.03,
    };
    pose.rightWrist = {
      rz: -0.18 + tension * 2,
      rx: -0.12,
    };

    // 左臂：护腹低位
    pose.leftShoulder = {
      rz: 0.55 + tension * 2,
      rx: -0.4 + Math.sin(cycle * 0.7 + 1) * 0.02,
    };
    pose.leftElbow = {
      rx: -0.75 + Math.sin(cycle * 0.9 + 1) * 0.03,
    };
    pose.leftWrist = {
      rz: 0.15 + tension * 2,
      rx: -0.08,
    };

    // 右腿：主力腿，微屈
    pose.rightHip = {
      rx: 0.2 + Math.sin(cycle * 0.5) * 0.015,
    };
    pose.rightKnee = {
      rx: 0.35 + Math.sin(cycle * 0.5) * 0.02,
    };
    pose.rightAnkle = {
      rx: -0.1 + Math.sin(cycle * 0.5) * 0.005,
    };

    // 左腿：辅助支撑
    pose.leftHip = {
      rx: 0.12 - Math.sin(cycle * 0.5) * 0.01,
    };
    pose.leftKnee = {
      rx: 0.22 - Math.sin(cycle * 0.5) * 0.015,
    };
    pose.leftAnkle = {
      rx: -0.06 + Math.sin(cycle * 0.5) * 0.005,
    };

    return pose;
  }
}
