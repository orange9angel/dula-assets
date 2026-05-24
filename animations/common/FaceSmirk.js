import { AnimationBase } from 'dula-engine';

/**
 * FaceSmirk — 得意/坏笑表情
 * One eyebrow raised, one side of mouth curled up
 * Perfect for Yusuke-style delinquent attitude
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, fighter, delinquent, agile]
 *   note: Asymmetric expression — best on expressive humanoids
 */
export class FaceSmirk extends AnimationBase {
  constructor() {
    super('FaceSmirk', 0.4);
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'fighter', 'delinquent', 'agile'],
      notSuits: [],
      minHeight: 0.5,
      maxHeight: 3.0,
    };
  }

  update(t, character) {
    const head = character.headGroup;
    if (!head) return;
    const base = character._faceBaseState || {};

    const ease = t < 0.3 ? t / 0.3 : 1;

    // Left eyebrow: raise (cocky)
    if (character.leftEyebrow && base.leftEyebrow) {
      character.leftEyebrow.position.y = base.leftEyebrow.position.y + ease * 0.018;
      character.leftEyebrow.rotation.z = base.leftEyebrow.rotation.z - ease * 0.1;
    }

    // Right eyebrow: lower slightly (asymmetric)
    if (character.rightEyebrow && base.rightEyebrow) {
      character.rightEyebrow.position.y = base.rightEyebrow.position.y - ease * 0.005;
      character.rightEyebrow.rotation.z = base.rightEyebrow.rotation.z + ease * 0.15;
    }

    // Eyelids: left eye slightly more open
    if (character.leftEyelid) {
      character.leftEyelid.visible = false;
    }
    if (character.rightEyelid && base.rightEyelid) {
      character.rightEyelid.visible = true;
      character.rightEyelid.scale.y = base.rightEyelid.scale.y * (1 - ease * 0.15);
    }

    // Mouth: one side up (smirk)
    if (character.mouth) {
      const geoType = character.mouth.geometry?.type || 'Unknown';
      if (geoType === 'TubeGeometry') {
        // Rotate slightly to favor one side
        character.mouth.rotation.z = -ease * 0.15;
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.3);
      } else if (geoType === 'SphereGeometry') {
        // Shift position to one side
        if (base.mouth) {
          character.mouth.position.x = base.mouth.position.x + ease * 0.01;
        }
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.4);
      } else {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.2);
      }
    }

    // Head: slight tilt (confident)
    if (base.headGroup) {
      head.rotation.z = base.headGroup.rotation.z - ease * 0.06;
      head.rotation.x = base.headGroup.rotation.x - ease * 0.03;
    } else {
      head.rotation.z = -ease * 0.06;
      head.rotation.x = -ease * 0.03;
    }
  }
}
