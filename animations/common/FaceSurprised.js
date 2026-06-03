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
      left: { py: ease * 0.025 },
      right: { py: ease * 0.025 },
    };

    // Eyelids: wide open (no squint)
    pose.eyelids = {
      left: { visible: false },
      right: { visible: false },
    };

    // Pupils: shrink slightly (shock)
    pose.pupils = {
      left: { sx: -ease * 0.2, sy: -ease * 0.2, sz: -ease * 0.2 },
      right: { sx: -ease * 0.2, sy: -ease * 0.2, sz: -ease * 0.2 },
    };

    // Mouth: open wide (O shape)
    pose.mouth = { tension: -0.2 };

    // Head: snap back slightly
    pose.headGroup = {
      rx: -ease * 0.1,
    };

    return pose;
  }
}
