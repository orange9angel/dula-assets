import { AnimationBase } from 'dula-engine';

/**
 * PowerGlow — 力量光环
 * She-Ra 全身散发光芒，力量涌动
 */
export class PowerGlow extends AnimationBase {
  constructor() {
    super('PowerGlow', 2.0);
  }

  update(t, character) {
    // Gentle hover
    character.mesh.position.y = character.baseY + Math.sin(t * Math.PI * 2) * 0.08;

    // Arms spread, accepting power
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (rArm && lArm) {
      const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
      const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

      const spread = Math.sin(t * Math.PI) * 0.3;
      rArm.rotation.z = rBaseZ - 0.5 - spread;
      lArm.rotation.z = lBaseZ + 0.5 + spread;
      rArm.rotation.x = -0.3;
      lArm.rotation.x = -0.3;
    }

    // Slow rotation
    character.mesh.rotation.y = Math.sin(t * Math.PI) * 0.2;

    // Head tilted back slightly
    if (character.headGroup) {
      character.headGroup.rotation.x = -0.2 + Math.sin(t * Math.PI * 3) * 0.05;
    }

    if (character.attachSword) character.attachSword();
  }
}
