import { AnimationBase } from 'dula-engine';

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

    const ease = t < 0.3 ? t / 0.3 : 1;

    // Eyebrows: inner edges raise (sad arch / \\ shape)
    if (character.leftEyebrow) {
      character.leftEyebrow.position.y += ease * 0.01;
      character.leftEyebrow.rotation.z -= ease * 0.3; // outer edge down
    }
    if (character.rightEyebrow) {
      character.rightEyebrow.position.y += ease * 0.01;
      character.rightEyebrow.rotation.z += ease * 0.3; // outer edge down
    }

    // Eyelids: half-closed (droopy eyes)
    if (character.leftEyelid) {
      character.leftEyelid.visible = true;
      character.leftEyelid.scale.y = 1 - ease * 0.5;
    }
    if (character.rightEyelid) {
      character.rightEyelid.visible = true;
      character.rightEyelid.scale.y = 1 - ease * 0.5;
    }

    // Pupils: look down slightly
    if (character.leftPupil) {
      character.leftPupil.position.y -= ease * 0.008;
    }
    if (character.rightPupil) {
      character.rightPupil.position.y -= ease * 0.008;
    }

    // Mouth: curve down (frown)
    if (character.mouth) {
      const geoType = character.mouth.geometry?.type || 'Unknown';
      if (geoType === 'TubeGeometry') {
        // Invert smile: rotate 180° around Z to flip curve
        character.mouth.rotation.z = ease * Math.PI;
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.3);
      } else if (geoType === 'SphereGeometry') {
        // Flatten and pull down
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.5);
        character.mouth.position.y -= ease * 0.01;
      } else {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.3);
      }
    }

    // Head: droop forward
    head.rotation.x = ease * 0.12;
  }
}
