import { AnimationBase } from 'dula-engine';

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
    const base = character._faceBaseState || {};

    const ease = t < 0.25 ? t / 0.25 : 1;

    // Eyebrows: shoot way up
    if (character.leftEyebrow && base.leftEyebrow) {
      character.leftEyebrow.position.y = base.leftEyebrow.position.y + ease * 0.025;
      character.leftEyebrow.rotation.z = base.leftEyebrow.rotation.z; // flat / raised
    }
    if (character.rightEyebrow && base.rightEyebrow) {
      character.rightEyebrow.position.y = base.rightEyebrow.position.y + ease * 0.025;
      character.rightEyebrow.rotation.z = base.rightEyebrow.rotation.z;
    }

    // Eyelids: wide open (no squint)
    if (character.leftEyelid) {
      character.leftEyelid.visible = false;
    }
    if (character.rightEyelid) {
      character.rightEyelid.visible = false;
    }

    // Pupils: shrink slightly (shock)
    if (character.leftPupil) {
      character.leftPupil.scale.setScalar(1 - ease * 0.2);
    }
    if (character.rightPupil) {
      character.rightPupil.scale.setScalar(1 - ease * 0.2);
    }

    // Mouth: open wide (O shape)
    if (character.mouth) {
      const geoType = character.mouth.geometry?.type || 'Unknown';
      if (geoType === 'TubeGeometry') {
        // Open the curve: scale Y up dramatically
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 1.2);
        character.mouth.scale.x = character.mouthBaseScaleX * (1 + ease * 0.4);
      } else if (geoType === 'SphereGeometry') {
        // Doraemon-style: expand to big O
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 1.5);
        character.mouth.scale.x = character.mouthBaseScaleX * (1 + ease * 0.8);
      } else if (geoType === 'BoxGeometry') {
        // Ultraman-style flat mouth: open vertically
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 1.0);
      } else {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.8);
      }
    }

    // Head: snap back slightly
    if (base.headGroup) {
      head.rotation.x = base.headGroup.rotation.x - ease * 0.1;
    } else {
      head.rotation.x = -ease * 0.1;
    }
  }
}
