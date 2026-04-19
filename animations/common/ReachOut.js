import { AnimationBase } from 'dula-engine';

export class ReachOut extends AnimationBase {
  constructor() {
    super('ReachOut', 1.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const ease = t < 0.3 ? t / 0.3 : 1;
    const easeOut = ease * (2 - ease);

    // Right arm reaches forward/up
    rArm.rotation.z = rBaseZ + easeOut * 0.2;
    rArm.rotation.x = -easeOut * 1.2;

    // Slight body lean
    character.mesh.rotation.x = easeOut * 0.15;
  }
}
