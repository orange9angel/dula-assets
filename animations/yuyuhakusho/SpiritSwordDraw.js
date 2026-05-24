import { AnimationBase } from 'dula-engine';

/**
 * SpiritSwordDraw — 霊剣召喚（极速版）
 * Kuwabara drawing his Spirit Sword - FAST
 * Right arm raises, orange energy blade extends from hand
 * Dramatic pose hold at end
 * Duration: 0.8s for snappy fighting game feel
 */
export class SpiritSwordDraw extends AnimationBase {
  constructor() {
    super('SpiritSwordDraw', 0.8);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Reset at t=0
    if (t === 0) {
      rArm.rotation.z = rBaseZ;
      rArm.rotation.x = rBaseX;
      if (lArm) lArm.rotation.z = lBaseZ;
      if (character.hideSpiritSword) character.hideSpiritSword();
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(0);
      if (character.setSpiritSwordLength) character.setSpiritSwordLength(0);
      return;
    }

    // Phase 1: FAST draw (0-0.35) - sword extends rapidly
    if (t < 0.35) {
      const p = t / 0.35;
      const ease = 1 - Math.pow(1 - p, 3); // sharp ease-out

      // Right arm raises up and outward quickly
      rArm.rotation.z = rBaseZ - 1.1 * ease;
      rArm.rotation.x = rBaseX - 0.3 * ease;

      // Left arm braces
      if (lArm) {
        lArm.rotation.z = lBaseZ + 0.2 * ease;
      }

      // Spirit Sword extends FAST
      if (character.showSpiritSword) {
        character.showSpiritSword();
      }
      if (character.setSpiritSwordGlow) {
        character.setSpiritSwordGlow(ease);
      }
      if (character.setSpiritSwordLength) {
        // Sword grows to full length by t=0.3
        const lengthEase = t < 0.3 ? Math.pow(t / 0.3, 0.5) : 1;
        character.setSpiritSwordLength(lengthEase);
      }

      // Slight body lean
      if (character.mesh) {
        character.mesh.rotation.y = 0.1 * ease;
      }
    }
    // Phase 2: HOLD pose (0.35-1.0) - maintain dramatic stance
    else {
      const p = (t - 0.35) / 0.65;
      // Subtle breathing/sway while holding sword
      const breathe = Math.sin(p * Math.PI * 2) * 0.03;

      rArm.rotation.z = (rBaseZ - 1.1) + breathe;
      rArm.rotation.x = (rBaseX - 0.3) + breathe * 0.5;

      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.2) - breathe * 0.5;
      }

      // Keep sword fully extended and glowing
      if (character.showSpiritSword) character.showSpiritSword();
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.0 + breathe);
      if (character.setSpiritSwordLength) character.setSpiritSwordLength(1.0);

      if (character.mesh) {
        character.mesh.rotation.y = 0.1 + breathe * 0.3;
      }
    }
  }
}
