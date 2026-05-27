import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceBlink — 眨眼
 * Quick eyelid close and open
 * Can be chained for double-blink
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, round, tiny]
 *   note: Works even without eyelids (skips gracefully)
 */
export class FaceBlink extends AnimationBase {
  constructor() {
    super('FaceBlink', 0.25);
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

    // Blink curve: close quickly (0-0.4), hold (0.4-0.6), open (0.6-1.0)
    let blink;
    if (t < 0.4) {
      blink = t / 0.4; // close
    } else if (t < 0.6) {
      blink = 1; // closed
    } else {
      blink = 1 - (t - 0.6) / 0.4; // open
    }

    // Eyelids: scale Y down to close
    pose.eyelids = {
      left: { sy: -blink * 0.95, visible: true },
      right: { sy: -blink * 0.95, visible: true },
    };

    // Fallback: if no eyelids but has pupils, shrink pupils slightly during blink
    pose.pupils = {
      left: { sx: -blink * 0.3, sy: -blink * 0.3, sz: -blink * 0.3 },
      right: { sx: -blink * 0.3, sy: -blink * 0.3, sz: -blink * 0.3 },
    };

    return pose;
  }
}
