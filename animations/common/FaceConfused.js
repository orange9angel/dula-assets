import { AnimationBase } from 'dula-engine';

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

    // Left eyebrow: raise high (questioning)
    if (character.leftEyebrow) {
      character.leftEyebrow.position.y += ease * 0.02;
      character.leftEyebrow.rotation.z -= ease * 0.2;
    }

    // Right eyebrow: lower / flat
    if (character.rightEyebrow) {
      character.rightEyebrow.position.y -= ease * 0.005;
      character.rightEyebrow.rotation.z = 0;
    }

    // Eyelids: left eye wider
    if (character.leftEyelid) {
      character.leftEyelid.visible = false;
    }
    if (character.rightEyelid) {
      character.rightEyelid.visible = true;
      character.rightEyelid.scale.y = 1 - ease * 0.1;
    }

    // Pupils: slight drift apart (unfocused)
    if (character.leftPupil) {
      character.leftPupil.position.x += ease * 0.003;
    }
    if (character.rightPupil) {
      character.rightPupil.position.x -= ease * 0.003;
    }

    // Mouth: small open "o" (puzzled)
    if (character.mouth) {
      const geoType = character.mouth.geometry?.type || 'Unknown';
      if (geoType === 'TubeGeometry') {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.5);
        character.mouth.scale.x = character.mouthBaseScaleX * (1 + ease * 0.2);
      } else if (geoType === 'SphereGeometry') {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.6);
      } else {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.4);
      }
    }

    // Head: tilt to one side (classic confused pose)
    head.rotation.z = ease * 0.08;
  }
}
