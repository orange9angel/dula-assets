import { AnimationBase } from 'dula-engine';

export class WaveUp extends AnimationBase {
  constructor() {
    super('WaveUp', 1.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;

    // Wave high above head
    const angle = Math.sin(t * Math.PI * 5) * 0.35;
    rArm.rotation.z = rBaseZ + angle;
    rArm.rotation.x = -1.0 + Math.sin(t * Math.PI * 3) * 0.1;

    // Look up while waving
    if (character.headGroup) {
      character.headGroup.rotation.x = -0.25;
    }
  }
}
