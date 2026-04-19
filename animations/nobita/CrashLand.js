import { AnimationBase } from 'dula-engine';

export class CrashLand extends AnimationBase {
  constructor() {
    super('CrashLand', 1.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    if (t < 0.4) {
      // Falling toward ground
      const p = t / 0.4;
      const ease = p * p;
      character.mesh.rotation.x = ease * 1.2;
      rArm.rotation.z = rBaseZ + ease * 0.5;
      lArm.rotation.z = lBaseZ - ease * 0.5;
    } else if (t < 0.6) {
      // Impact
      const p = (t - 0.4) / 0.2;
      character.mesh.rotation.x = 1.2 - p * 0.3;
      character.mesh.position.y = (character.baseY || 0) + Math.sin(p * Math.PI) * 0.1;
    } else {
      // Dazed on ground
      const p = (t - 0.6) / 0.4;
      character.mesh.rotation.x = 0.9 + Math.sin(p * Math.PI * 4) * 0.02;
      rArm.rotation.z = rBaseZ + 0.3;
      lArm.rotation.z = lBaseZ - 0.3;
      if (character.headGroup) {
        character.headGroup.rotation.x = 0.2 + Math.sin(p * Math.PI * 3) * 0.05;
      }
    }
  }
}
