import { AnimationBase } from 'dula-engine';

export class FallPanic extends AnimationBase {
  constructor() {
    super('FallPanic', 1.5);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    // Arms flail wildly
    const rAngle = Math.sin(t * Math.PI * 10) * 0.8;
    const lAngle = Math.sin(t * Math.PI * 10 + 2.0) * 0.8;

    rArm.rotation.z = rBaseZ + rAngle;
    lArm.rotation.z = lBaseZ + lAngle;
    rArm.rotation.x = -0.5 + Math.sin(t * Math.PI * 8) * 0.5;
    lArm.rotation.x = -0.5 + Math.sin(t * Math.PI * 8 + 1.5) * 0.5;

    // Body tumbles
    character.mesh.rotation.z = Math.sin(t * Math.PI * 6) * 0.2;
    character.mesh.rotation.x = Math.sin(t * Math.PI * 5) * 0.15;

    // Legs kick
    if (character.leftLeg) {
      character.leftLeg.rotation.x = Math.sin(t * Math.PI * 7) * 0.3;
    }
    if (character.rightLeg) {
      character.rightLeg.rotation.x = Math.sin(t * Math.PI * 7 + 1.0) * 0.3;
    }

    // Head shakes in panic
    if (character.headGroup) {
      character.headGroup.rotation.y = Math.sin(t * Math.PI * 12) * 0.15;
      character.headGroup.rotation.x = 0.1;
    }
  }
}
