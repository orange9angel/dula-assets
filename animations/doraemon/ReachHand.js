import { AnimationBase } from 'dula-engine';

export class ReachHand extends AnimationBase {
  constructor() {
    super('ReachHand', 1.2);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    // Reach forward with both hands (rescuing)
    const ease = t < 0.25 ? t / 0.25 : 1;
    const easeOut = ease * (2 - ease);

    rArm.rotation.z = rBaseZ + easeOut * 0.15;
    lArm.rotation.z = lBaseZ - easeOut * 0.15;
    rArm.rotation.x = -easeOut * 1.3;
    lArm.rotation.x = -easeOut * 1.3;

    // Body leans forward urgently
    character.mesh.rotation.x = easeOut * 0.2;

    // Head looks down at target
    if (character.headGroup) {
      character.headGroup.rotation.x = easeOut * 0.25;
    }

    // Slight hover wobble when holding
    if (t > 0.3) {
      const wobble = Math.sin((t - 0.3) * Math.PI * 4) * 0.02;
      character.mesh.position.y = (character.baseY || 0) + wobble;
    }
  }
}
