import { AnimationBase } from 'dula-engine';

/**
 * FaceReset — 表情重置
 * Smoothly returns all facial features to their neutral/base positions
 * Use this to clear a previous expression before applying a new one
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, round, tiny]
 *   note: Universal cleanup expression
 */
export class FaceReset extends AnimationBase {
  constructor() {
    super('FaceReset', 0.3);
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
    const base = character._faceBaseState;
    if (!base) return;

    const ease = t; // linear fade back

    // Head rotation reset
    if (base.headGroup) {
      head.rotation.x = base.headGroup.rotation.x;
      head.rotation.y = base.headGroup.rotation.y;
      head.rotation.z = base.headGroup.rotation.z;
    }

    // Eyebrows: restore to base positions
    if (character.leftEyebrow && base.leftEyebrow) {
      character.leftEyebrow.position.copy(base.leftEyebrow.position);
      character.leftEyebrow.rotation.z = base.leftEyebrow.rotation.z;
    }
    if (character.rightEyebrow && base.rightEyebrow) {
      character.rightEyebrow.position.copy(base.rightEyebrow.position);
      character.rightEyebrow.rotation.z = base.rightEyebrow.rotation.z;
    }

    // Eyelids: restore
    if (character.leftEyelid && base.leftEyelid) {
      character.leftEyelid.scale.copy(base.leftEyelid.scale);
      character.leftEyelid.position.copy(base.leftEyelid.position);
    }
    if (character.rightEyelid && base.rightEyelid) {
      character.rightEyelid.scale.copy(base.rightEyelid.scale);
      character.rightEyelid.position.copy(base.rightEyelid.position);
    }

    // Pupils: restore scale
    if (character.leftPupil) {
      character.leftPupil.scale.setScalar(1);
    }
    if (character.rightPupil) {
      character.rightPupil.scale.setScalar(1);
    }

    // Mouth: reset scale, position, rotation
    if (character.mouth && base.mouth) {
      character.mouth.scale.copy(base.mouth.scale);
      character.mouth.position.copy(base.mouth.position);
      character.mouth.rotation.copy(base.mouth.rotation);
    }
  }
}
