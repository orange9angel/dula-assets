import { AnimationBase } from 'dula-engine';

/**
 * FaceAngry — 愤怒表情
 * Eyebrows lower and angle inward, eyes narrow, mouth tightens
 * Works on any character with eyebrows + mouth
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, fighter]
 *   note: Gracefully skips missing eyebrow / eyelid parts
 */
export class FaceAngry extends AnimationBase {
  constructor() {
    super('FaceAngry', 0.4);
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'monster', 'fighter'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const head = character.headGroup;
    if (!head) return;
    const base = character._faceBaseState || {};

    const ease = t < 0.3 ? t / 0.3 : 1; // quick settle

    // Eyebrows: lower and angle inward (angry V-shape)
    if (character.leftEyebrow && base.leftEyebrow) {
      character.leftEyebrow.position.y = base.leftEyebrow.position.y - ease * 0.015;
      character.leftEyebrow.rotation.z = base.leftEyebrow.rotation.z + ease * 0.35; // inner edge down
    }
    if (character.rightEyebrow && base.rightEyebrow) {
      character.rightEyebrow.position.y = base.rightEyebrow.position.y - ease * 0.015;
      character.rightEyebrow.rotation.z = base.rightEyebrow.rotation.z - ease * 0.35; // inner edge down
    }

    // Eyelids: narrow eyes (squint)
    if (character.leftEyelid && base.leftEyelid) {
      character.leftEyelid.visible = true;
      character.leftEyelid.scale.y = base.leftEyelid.scale.y * (1 - ease * 0.4);
      character.leftEyelid.position.y = base.leftEyelid.position.y + ease * 0.01;
    }
    if (character.rightEyelid && base.rightEyelid) {
      character.rightEyelid.visible = true;
      character.rightEyelid.scale.y = base.rightEyelid.scale.y * (1 - ease * 0.4);
      character.rightEyelid.position.y = base.rightEyelid.position.y + ease * 0.01;
    }

    // Mouth: tight / flat line
    if (character.mouth) {
      const geoType = character.mouth.geometry?.type || 'Unknown';
      if (geoType === 'TubeGeometry') {
        // Flatten the smile curve by scaling Y down
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.5);
      } else if (geoType === 'SphereGeometry') {
        // Doraemon-style ellipse mouth: shrink to tight line
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.6);
      } else {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 - ease * 0.3);
      }
    }

    // Head: slight forward thrust (aggressive posture)
    if (base.headGroup) {
      head.rotation.x = base.headGroup.rotation.x + ease * 0.08;
    } else {
      head.rotation.x = ease * 0.08;
    }
  }
}
