import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceSad — 悲伤/沮丧表情
 * Eyebrows angle up at inner edges, eyes droop, mouth curves down
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, round, tiny]
 *   note: Universal sorrow expression
 */
export class FaceSad extends AnimationBase {
  constructor() {
    super('FaceSad', 0.5);
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
    const ease = t < 0.3 ? t / 0.3 : 1;
    const pose = new PoseMatrix();

    // Eyebrows: inner edges raise strongly (sad arch / \ shape)
    pose.eyebrows = {
      left: { py: ease * 0.022, rz: -ease * 0.55 },
      right: { py: ease * 0.022, rz: ease * 0.55 },
    };

    // Eyelids: half-closed (droopy eyes)
    pose.eyelids = {
      left: { visible: true, sy: -ease * 0.55 },
      right: { visible: true, sy: -ease * 0.55 },
    };

    // Pupils: look down slightly
    pose.pupils = {
      left: { py: -ease * 0.015 },
      right: { py: -ease * 0.015 },
    };

    // Mouth: smaller and slightly droopy (frown) when not speaking
    pose.mouth = { tension: 0.0, sx: -ease * 0.15, sy: -ease * 0.25 };

    // Head: droop forward
    pose.headGroup = {
      rx: ease * 0.12,
    };

    return pose;
  }
}
