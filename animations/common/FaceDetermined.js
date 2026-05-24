import { AnimationBase } from 'dula-engine';

/**
 * FaceDetermined — 坚定/决意表情
 * Eyebrows level and focused, eyes sharp, mouth firm line
 * Perfect for pre-fight or resolve moments
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Battle-ready expression
 */
export class FaceDetermined extends AnimationBase {
  constructor() {
    super('FaceDetermined', 0.4);
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

    const ease = t < 0.3 ? t / 0.3 : 1;

    // Eyebrows: level, slightly lowered (intense focus)
    if (character.leftEyebrow && base.leftEyebrow) {
      character.leftEyebrow.position.y = base.leftEyebrow.position.y - ease * 0.008;
      character.leftEyebrow.rotation.z = base.leftEyebrow.rotation.z; // perfectly level (relative to base)
    }
    if (character.rightEyebrow && base.rightEyebrow) {
      character.rightEyebrow.position.y = base.rightEyebrow.position.y - ease * 0.008;
      character.rightEyebrow.rotation.z = base.rightEyebrow.rotation.z;
    }

    // Eyelids: slight squint (sharp focus)
    if (character.leftEyelid && base.leftEyelid) {
      character.leftEyelid.visible = true;
      character.leftEyelid.scale.y = base.leftEyelid.scale.y * (1 - ease * 0.25);
    }
    if (character.rightEyelid && base.rightEyelid) {
      character.rightEyelid.visible = true;
      character.rightEyelid.scale.y = base.rightEyelid.scale.y * (1 - ease * 0.25);
    }

    // Pupils: focused forward (reset any drift)
    if (character.leftPupil && character.leftPupil.userData.baseX !== undefined) {
      character.leftPupil.position.x = character.leftPupil.userData.baseX;
    }
    if (character.rightPupil && character.rightPupil.userData.baseX !== undefined) {
      character.rightPupil.position.x = character.rightPupil.userData.baseX;
    }

    // Mouth: firm straight line (grit)
    if (character.mouth) {
      const geoType = character.mouth.geometry?.type || 'Unknown';
      if (geoType === 'TubeGeometry') {
        // Flatten curve to near-line
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.7);
        character.mouth.rotation.z = 0;
      } else if (geoType === 'SphereGeometry') {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.5);
      } else {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.4);
      }
    }

    // Head: slight forward (locked in)
    if (base.headGroup) {
      head.rotation.x = base.headGroup.rotation.x + ease * 0.05;
      head.rotation.y = base.headGroup.rotation.y; // face forward, no tilt
    } else {
      head.rotation.x = ease * 0.05;
      head.rotation.y = 0;
    }
  }
}
