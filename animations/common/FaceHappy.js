import { AnimationBase } from 'dula-engine';

/**
 * FaceHappy — 开心/微笑表情
 * Eyebrows raise slightly, eyes open wide, mouth curves up
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, round, tiny]
 *   note: Universal positive expression
 */
export class FaceHappy extends AnimationBase {
  constructor() {
    super('FaceHappy', 0.4);
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

    const ease = t < 0.3 ? t / 0.3 : 1;

    // Eyebrows: raise slightly (friendly arch)
    if (character.leftEyebrow && base.leftEyebrow) {
      character.leftEyebrow.position.y = base.leftEyebrow.position.y + ease * 0.012;
      character.leftEyebrow.rotation.z = base.leftEyebrow.rotation.z - ease * 0.15;
    }
    if (character.rightEyebrow && base.rightEyebrow) {
      character.rightEyebrow.position.y = base.rightEyebrow.position.y + ease * 0.012;
      character.rightEyebrow.rotation.z = base.rightEyebrow.rotation.z + ease * 0.15;
    }

    // Eyelids: wide open (bright eyes)
    if (character.leftEyelid) {
      character.leftEyelid.visible = false;
    }
    if (character.rightEyelid) {
      character.rightEyelid.visible = false;
    }

    // Mouth: big smile — curve up
    if (character.mouth) {
      const geoType = character.mouth.geometry?.type || 'Unknown';
      if (geoType === 'TubeGeometry') {
        // Smile curve: scale Y up to exaggerate the curve
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.6);
        // Slight upward shift
        if (base.mouth) {
          character.mouth.position.y = base.mouth.position.y + ease * 0.005;
        }
      } else if (geoType === 'SphereGeometry') {
        // Doraemon-style: expand to big open smile
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.8);
        character.mouth.scale.x = character.mouthBaseScaleX * (1 + ease * 0.2);
      } else {
        character.mouth.scale.y = character.mouthBaseScaleY * (1 + ease * 0.4);
      }
    }

    // Head: slight tilt up (cheerful)
    if (base.headGroup) {
      head.rotation.x = base.headGroup.rotation.x - ease * 0.05;
    } else {
      head.rotation.x = -ease * 0.05;
    }
  }
}
