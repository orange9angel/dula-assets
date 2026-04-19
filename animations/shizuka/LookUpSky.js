import { AnimationBase } from 'dula-engine';

export class LookUpSky extends AnimationBase {
  constructor() {
    super('LookUpSky', 1.5);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    const ease = t < 0.4 ? t / 0.4 : 1;
    const easeOut = ease * (2 - ease);

    // Hands shade eyes from sun
    rArm.rotation.z = rBaseZ + easeOut * 0.5;
    lArm.rotation.z = lBaseZ - easeOut * 0.5;
    rArm.rotation.x = -easeOut * 0.8;
    lArm.rotation.x = -easeOut * 0.8;

    // Head tilts back
    if (character.headGroup) {
      character.headGroup.rotation.x = -easeOut * 0.45;
    }

    // Body leans back slightly
    character.mesh.rotation.x = -easeOut * 0.08;
  }
}
