import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceConfused — 困惑/疑惑表情
 * One eyebrow raised high, other normal, mouth slightly open
 * Perfect for "huh?" moments
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, round, tiny]
 *   note: Asymmetric expression
 */
export class FaceConfused extends AnimationBase {
  constructor() {
    super('FaceConfused', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'monster', 'round', 'tiny'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const ease = t < 0.3 ? t / 0.3 : 1;

    // Left eyebrow: raise high (questioning)
    // Right eyebrow: lower / flat
    pose.eyebrows = {
      left: { py: ease * 0.02, rz: -ease * 0.2 },
      right: { py: -ease * 0.005, rz: 0 },
    };

    // Eyelids: left eye wider, right slightly narrowed
    pose.eyelids = {
      left: { visible: false },
      right: { sy: -ease * 0.1, visible: true },
    };

    // Pupils: slight drift apart (unfocused)
    pose.pupils = {
      left: { px: ease * 0.003 },
      right: { px: -ease * 0.003 },
    };

    // Mouth: small open "o" (puzzled)
    pose.mouth = { sy: ease * 0.5, sx: ease * 0.2 };

    // Head: tilt to one side (classic confused pose)
    pose.headGroup = { rz: ease * 0.08 };

    return pose;
  }
}
