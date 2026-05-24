import { AnimationBase } from 'dula-engine';

/**
 * SpiritSwordSwing — 霊剣斬り（极速版）
 * Kuwabara swinging the Spirit Sword - FAST
 * Wide horizontal slash motion
 * Arm follows through with glowing trail
 * Duration: 0.7s for snappy fighting game feel
 */
export class SpiritSwordSwing extends AnimationBase {
  constructor() {
    super('SpiritSwordSwing', 0.7);
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
      if (character.showSpiritSword) character.showSpiritSword();
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.0);
      if (character.setSpiritSwordLength) character.setSpiritSwordLength(1.0);
      return;
    }

    // Phase 1: Wind up (0-0.15) - quick pull back
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;
      rArm.rotation.z = (rBaseZ - 1.1) - ease * 0.5;
      rArm.rotation.x = (rBaseX - 0.3) - ease * 0.4;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.2) + ease * 0.3;
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.0 + ease * 0.5);
    }
    // Phase 2: SLASH! (0.15-0.4) - explosive horizontal slash
    else if (t < 0.4) {
      const p = (t - 0.15) / 0.25;
      const ease = 1 - Math.pow(1 - p, 2);
      rArm.rotation.z = (rBaseZ - 1.6) + ease * 2.2;
      rArm.rotation.x = (rBaseX - 0.7) + ease * 0.6;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.5) - ease * 0.4;
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.5);
    }
    // Phase 3: Follow through (0.4-0.6)
    else if (t < 0.6) {
      const p = (t - 0.4) / 0.2;
      const ease = 1 - Math.pow(1 - p, 3);
      rArm.rotation.z = (rBaseZ + 0.6) + ease * 0.2;
      rArm.rotation.x = (rBaseX - 0.1) + ease * 0.2;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.1) - ease * 0.1;
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.2 - ease * 0.4);
    }
    // Phase 4: Recover (0.6-1.0) - return to fighting stance
    else {
      const p = (t - 0.6) / 0.4;
      const ease = p * p;
      // Fighting stance: right arm back guard, left forward
      rArm.rotation.z = (rBaseZ + 0.8) - ease * 1.7;   // → rBaseZ - 0.9
      rArm.rotation.x = (rBaseX + 0.1) - ease * 0.8;   // → rBaseX - 0.7
      if (lArm) lArm.rotation.z = lBaseZ + ease * 0.5; // → lBaseZ + 0.5
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(0.8 - ease * 0.8);
      // Body angle to fighting stance
      character.mesh.rotation.y = 0.2 - ease * 0.15;   // → 0.05 (near 0.35)
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
    }

    // Body rotation follows the slash
    if (character.mesh) {
      if (t < 0.15) {
        character.mesh.rotation.y = 0.1 - (t / 0.15) * 0.15;
      } else if (t < 0.4) {
        character.mesh.rotation.y = -0.05 + (t - 0.15) / 0.25 * 0.5;
      } else if (t < 0.6) {
        character.mesh.rotation.y = 0.45 - (t - 0.4) / 0.2 * 0.25;
      } else {
        character.mesh.rotation.y = 0.2 - (t - 0.6) / 0.4 * 0.2;
      }
    }
  }
}
