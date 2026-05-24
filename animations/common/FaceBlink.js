import { AnimationBase } from 'dula-engine';

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
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'monster', 'round', 'tiny'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const head = character.headGroup;
    if (!head) return;

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
    if (character.leftEyelid) {
      character.leftEyelid.visible = true;
      character.leftEyelid.scale.y = 1 - blink * 0.95;
    }
    if (character.rightEyelid) {
      character.rightEyelid.visible = true;
      character.rightEyelid.scale.y = 1 - blink * 0.95;
    }

    // Fallback: if no eyelids but has pupils, shrink pupils slightly during blink
    if (!character.leftEyelid && character.leftPupil) {
      character.leftPupil.scale.setScalar(1 - blink * 0.3);
    }
    if (!character.rightEyelid && character.rightPupil) {
      character.rightPupil.scale.setScalar(1 - blink * 0.3);
    }
  }
}
