import { AnimationBase } from 'dula-engine';

/**
 * SpiritSwordDraw — 霊剣召喚
 * Kuwabara drawing his Spirit Sword
 * Right arm raises, orange energy blade extends from hand
 * Dramatic pose hold at end
 */
export class SpiritSwordDraw extends AnimationBase {
  constructor() {
    super('SpiritSwordDraw', 2.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // easeInOutQuad easing
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Reset at t=0
    if (t === 0) {
      rArm.rotation.z = rBaseZ;
      rArm.rotation.x = rBaseX;
      if (lArm) lArm.rotation.z = lBaseZ;
      if (character.spiritSword) {
        character.spiritSword.visible = false;
        character.spiritSword.scale.setScalar(0);
      }
      return;
    }

    // Right arm raises up and outward
    rArm.rotation.z = rBaseZ - 1.1 * ease;
    rArm.rotation.x = rBaseX - 0.3 * ease;

    // Left arm braces slightly
    if (lArm) {
      lArm.rotation.z = lBaseZ + 0.2 * ease;
    }

    // Spirit Sword extends from hand
    if (character.spiritSword) {
      character.spiritSword.visible = true;
      // Sword grows longer as it's drawn
      const swordEase = t < 0.6 ? (t / 0.6) * (t / 0.6) : 1;
      character.spiritSword.scale.set(1, 1, 0.1 + swordEase * 2.5);
      if (character.spiritSword.material) {
        character.spiritSword.material.opacity = 0.5 + ease * 0.4;
      }
    }

    // Slight body lean into the pose
    if (character.mesh) {
      character.mesh.rotation.y = 0.1 * ease;
    }
  }
}
