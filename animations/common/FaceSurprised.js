import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceSurprised — 惊讶/震惊表情
 * Eyebrows shoot up, eyes wide open, mouth opens in O-shape
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, round, tiny]
 *   note: High-energy reaction expression
 */
export class FaceSurprised extends AnimationBase {
  constructor() {
    super('FaceSurprised', 0.35);
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
    const ease = t < 0.25 ? t / 0.25 : 1;
    const pose = new PoseMatrix();

    // Eyebrows: shoot way up
    pose.eyebrows = {
      left: { py: ease * 0.040, rz: -ease * 0.15 },
      right: { py: ease * 0.040, rz: ease * 0.15 },
    };

    // Eyelids: wide open (no squint)
    pose.eyelids = {
      left: { visible: false, sy: 0 },
      right: { visible: false, sy: 0 },
    };

    // Pupils: shrink (shock)
    pose.pupils = {
      left: { sx: -ease * 0.30, sy: -ease * 0.30, sz: -ease * 0.30 },
      right: { sx: -ease * 0.30, sy: -ease * 0.30, sz: -ease * 0.30 },
    };

    // Mouth: open wide (O shape) when not speaking; tension relaxes lip-sync
    pose.mouth = { tension: -0.25, sx: ease * 0.35, sy: ease * 0.65 };

    // Head: snap back slightly
    pose.headGroup = {
      rx: -ease * 0.1,
    };

    return pose;
  }
}
