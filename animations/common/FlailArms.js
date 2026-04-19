import { AnimationBase } from 'dula-engine';

export class FlailArms extends AnimationBase {
  constructor() {
    super('FlailArms', 1.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    // Chaotic arm waving
    const rAngle = Math.sin(t * Math.PI * 8) * 0.7;
    const lAngle = Math.sin(t * Math.PI * 8 + 1.5) * 0.7;

    rArm.rotation.z = rBaseZ + rAngle;
    lArm.rotation.z = lBaseZ + lAngle;
    rArm.rotation.x = Math.sin(t * Math.PI * 6) * 0.4;
    lArm.rotation.x = Math.sin(t * Math.PI * 6 + 2) * 0.4;

    // Body shakes
    character.mesh.rotation.z = Math.sin(t * Math.PI * 10) * 0.06;
  }
}
