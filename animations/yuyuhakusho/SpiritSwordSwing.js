import { AnimationBase } from 'dula-engine';

/**
 * SpiritSwordSwing — 霊剣斬り
 * Kuwabara swinging the Spirit Sword
 * Wide horizontal slash motion
 * Arm follows through
 */
export class SpiritSwordSwing extends AnimationBase {
  constructor() {
    super('SpiritSwordSwing', 1.2);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Reset at t=0 - start from drawn position
    if (t === 0) {
      rArm.rotation.z = rBaseZ - 1.1;
      rArm.rotation.x = rBaseX - 0.3;
      if (lArm) lArm.rotation.z = lBaseZ + 0.2;
      if (character.spiritSword) {
        character.spiritSword.visible = true;
        character.spiritSword.scale.set(1, 1, 2.6);
      }
      return;
    }

    // Phase 1: Wind up (0-0.2)
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;
      rArm.rotation.z = (rBaseZ - 1.1) - ease * 0.4; // pull back
      rArm.rotation.x = (rBaseX - 0.3) - ease * 0.3;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.2) + ease * 0.2;
    }
    // Phase 2: Slash forward (0.2-0.5)
    else if (t < 0.5) {
      const p = (t - 0.2) / 0.3;
      const ease = 1 - Math.pow(1 - p, 2);
      rArm.rotation.z = (rBaseZ - 1.5) + ease * 2.0; // wide horizontal slash
      rArm.rotation.x = (rBaseX - 0.6) + ease * 0.5;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.4) - ease * 0.3;
      // Sword trail effect
      if (character.spiritSword && character.spiritSword.material) {
        character.spiritSword.material.opacity = 0.9 + Math.sin(p * Math.PI) * 0.1;
      }
    }
    // Phase 3: Follow through (0.5-0.8)
    else if (t < 0.8) {
      const p = (t - 0.5) / 0.3;
      const ease = 1 - Math.pow(1 - p, 3);
      rArm.rotation.z = (rBaseZ + 0.5) + ease * 0.3;
      rArm.rotation.x = (rBaseX - 0.1) + ease * 0.2;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.1) - ease * 0.1;
    }
    // Phase 4: Recover (0.8-1.0)
    else {
      const p = (t - 0.8) / 0.2;
      const ease = p * p;
      rArm.rotation.z = (rBaseZ + 0.8) - ease * 0.8;
      rArm.rotation.x = (rBaseX + 0.1) - ease * 0.1;
      if (lArm) lArm.rotation.z = lBaseZ;
    }

    // Body rotation follows the slash
    if (character.mesh) {
      if (t < 0.2) {
        character.mesh.rotation.y = 0.1 - (t / 0.2) * 0.1;
      } else if (t < 0.5) {
        character.mesh.rotation.y = (t - 0.2) / 0.3 * 0.4;
      } else if (t < 0.8) {
        character.mesh.rotation.y = 0.4 - (t - 0.5) / 0.3 * 0.2;
      } else {
        character.mesh.rotation.y = 0.2 - (t - 0.8) / 0.2 * 0.2;
      }
    }
  }
}
