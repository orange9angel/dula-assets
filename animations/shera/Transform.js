import { AnimationBase } from 'dula-engine';

/**
 * Transform — 变身动画
 * Adora 举起剑，光芒四射，变身为 She-Ra
 * 经典台词："For the honor of Grayskull... I am She-Ra!"
 */
export class Transform extends AnimationBase {
  constructor() {
    super('Transform', 3.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    // Phase 1: Draw sword (0-0.3)
    if (t < 0.3) {
      const p = t / 0.3;
      rArm.rotation.z = rBaseZ - p * 0.8;
      rArm.rotation.x = -p * 0.5;
      if (character.attachSword) character.attachSword();
    }
    // Phase 2: Raise high (0.3-0.5)
    else if (t < 0.5) {
      const p = (t - 0.3) / 0.2;
      rArm.rotation.z = rBaseZ - 0.8 - p * 0.7;
      rArm.rotation.x = -0.5 - p * 1.8;
      // Head looks up at sword
      if (character.headGroup) character.headGroup.rotation.x = -p * 0.5;
    }
    // Phase 3: Flash / transformation burst (0.5-0.7)
    else if (t < 0.7) {
      const p = (t - 0.5) / 0.2;
      // Hold sword high
      rArm.rotation.z = rBaseZ - 1.5;
      rArm.rotation.x = -2.3;
      // Body glows / scales up slightly
      const glow = Math.sin(p * Math.PI);
      character.mesh.scale.setScalar(1 + glow * 0.05);
      if (character.headGroup) character.headGroup.rotation.x = -0.5;
    }
    // Phase 4: Land in hero pose (0.7-1.0)
    else {
      const p = (t - 0.7) / 0.3;
      // Transition to heroic stance
      rArm.rotation.z = rBaseZ - 1.5 + p * 0.5;
      rArm.rotation.x = -2.3 + p * 1.3;
      if (lArm) {
        lArm.rotation.z = lBaseZ + p * 0.3;
        lArm.rotation.x = -p * 0.3;
      }
      character.mesh.scale.setScalar(1.05 - p * 0.05);
      if (character.headGroup) character.headGroup.rotation.x = -0.5 + p * 0.5;
      // Feet planted
      if (character.leftLeg) character.leftLeg.rotation.x = -p * 0.1;
      if (character.rightLeg) character.rightLeg.rotation.x = p * 0.1;
    }

    if (character.attachSword) character.attachSword();
  }
}
