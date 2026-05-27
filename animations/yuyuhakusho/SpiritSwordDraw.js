import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SpiritSwordDraw — 霊剣召喚（极速版）
 * Kuwabara drawing his Spirit Sword - FAST
 * Right arm raises, orange energy blade extends from hand
 * Dramatic pose hold at end
 * Duration: 0.8s for snappy fighting game feel
 *
 * Migrated to matrix mode: no longer overwrites mesh.rotation.y
 * Sword glow/length handled via character hooks in getPoseMatrix
 */
export class SpiritSwordDraw extends AnimationBase {
  constructor() {
    super('SpiritSwordDraw', 0.8);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: FAST draw (0-0.35) - sword extends rapidly
    if (t < 0.35) {
      const p = t / 0.35;
      const ease = 1 - Math.pow(1 - p, 3); // sharp ease-out
      const breathe = Math.sin(t * Math.PI * 2) * 0.03;

      // Right arm raises up and outward quickly
      pose.rightShoulder = { rz: -1.1 * ease, rx: -0.3 * ease };
      // Left arm braces
      pose.leftShoulder = { rz: 0.2 * ease };
      // Slight body lean (rx = forward lean, NOT ry which is rotation/yaw)
      pose.mesh = { rx: 0.05 * ease };
    }
    // Phase 2: HOLD pose (0.35-1.0) - maintain dramatic stance
    else {
      const p = (t - 0.35) / 0.65;
      const breathe = Math.sin(p * Math.PI * 2) * 0.03;

      pose.rightShoulder = { rz: -1.1 + breathe, rx: -0.3 + breathe * 0.5 };
      pose.leftShoulder = { rz: 0.2 - breathe * 0.5 };
      pose.mesh = { rx: 0.05 + breathe * 0.1 };
    }

    return pose;
  }

  // Keep old update for sword glow/length side effects (visual only, no rotation override)
  update(t, character) {
    if (t === 0) {
      if (character.hideSpiritSword) character.hideSpiritSword();
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(0);
      if (character.setSpiritSwordLength) character.setSpiritSwordLength(0);
      return;
    }

    if (t < 0.35) {
      const ease = 1 - Math.pow(1 - t / 0.35, 3);
      if (character.showSpiritSword) character.showSpiritSword();
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(ease);
      if (character.setSpiritSwordLength) {
        const lengthEase = t < 0.3 ? Math.pow(t / 0.3, 0.5) : 1;
        character.setSpiritSwordLength(lengthEase);
      }
    } else {
      const p = (t - 0.35) / 0.65;
      const breathe = Math.sin(p * Math.PI * 2) * 0.03;
      if (character.showSpiritSword) character.showSpiritSword();
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.0 + breathe);
      if (character.setSpiritSwordLength) character.setSpiritSwordLength(1.0);
    }
  }
}
