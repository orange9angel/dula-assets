import { AnimationBase } from 'dula-engine';

export class FlyPose extends AnimationBase {
  constructor() {
    super('FlyPose', 2.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    // Arms out like wings
    const flap = Math.sin(t * Math.PI * 3) * 0.12;
    rArm.rotation.z = rBaseZ + 0.6 + flap;
    lArm.rotation.z = lBaseZ - 0.6 - flap;

    // Body leans forward (flying posture)
    character.mesh.rotation.x = 0.25 + Math.sin(t * Math.PI * 2) * 0.03;

    // Legs dangle back slightly
    if (character.leftLeg) {
      character.leftLeg.rotation.x = -0.15 + Math.sin(t * Math.PI * 2 + 0.5) * 0.05;
    }
    if (character.rightLeg) {
      character.rightLeg.rotation.x = -0.15 + Math.sin(t * Math.PI * 2 + 1.0) * 0.05;
    }

    // Head looks forward/up
    if (character.headGroup) {
      character.headGroup.rotation.x = -0.15;
    }
  }
}
