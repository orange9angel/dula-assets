import { AnimationBase } from 'dula-engine';

/**
 * FacePain — 痛苦/受伤表情
 * Eyebrows pinch together and up, eyes squeeze shut, mouth grimaces
 * Perfect for hit reactions and damage
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Pairs well with HitStagger / Knockdown
 */
export class FacePain extends AnimationBase {
  constructor() {
    super('FacePain', 0.5);
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const head = character.headGroup;
    if (!head) return;
    const base = character._faceBaseState || {};

    const ease = t < 0.2 ? t / 0.2 : 1;

    // Eyebrows: pinch together and raise (pain furrow)
    if (character.leftEyebrow && base.leftEyebrow) {
      character.leftEyebrow.position.y = base.leftEyebrow.position.y + ease * 0.015;
      character.leftEyebrow.position.x = base.leftEyebrow.position.x + ease * 0.008; // move toward center
      character.leftEyebrow.rotation.z = base.leftEyebrow.rotation.z - ease * 0.2;
    }
    if (character.rightEyebrow && base.rightEyebrow) {
      character.rightEyebrow.position.y = base.rightEyebrow.position.y + ease * 0.015;
      character.rightEyebrow.position.x = base.rightEyebrow.position.x - ease * 0.008; // move toward center
      character.rightEyebrow.rotation.z = base.rightEyebrow.rotation.z + ease * 0.2;
    }

    // Eyelids: squeeze shut
    if (character.leftEyelid && base.leftEyelid) {
      character.leftEyelid.visible = true;
      character.leftEyelid.scale.y = base.leftEyelid.scale.y * (1 - ease * 0.85);
    }
    if (character.rightEyelid && base.rightEyelid) {
      character.rightEyelid.visible = true;
      character.rightEyelid.scale.y = base.rightEyelid.scale.y * (1 - ease * 0.85);
    }

    // Mouth: grimace — open slightly, twisted
    if (character.mouth) {
      const geoType = character.mouth.geometry?.type || 'Unknown';
      if (geoType === 'TubeGeometry') {
        // Open and flatten
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.3);
        character.mouth.scale.x = character.mouthBaseScaleX * (1 + ease * 0.2);
      } else if (geoType === 'SphereGeometry') {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.5);
        character.mouth.scale.x = character.mouthBaseScaleX * (1 - ease * 0.2);
      } else {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.3);
      }
    }

    // Head: flinch back
    if (base.headGroup) {
      head.rotation.x = base.headGroup.rotation.x - ease * 0.1;
      head.rotation.z = base.headGroup.rotation.z + (Math.random() - 0.5) * ease * 0.05; // subtle shake
    } else {
      head.rotation.x = -ease * 0.1;
      head.rotation.z = (Math.random() - 0.5) * ease * 0.05; // subtle shake
    }
  }
}
