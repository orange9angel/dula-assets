import { AnimationBase } from 'dula-engine';

/**
 * SpiritGunCharge — 霊丸チャージ
 * Yusuke's signature move - charging a Spirit Gun at his fingertip
 * Right arm raises, index finger points forward
 * Blue/white energy ball grows at fingertip
 */
export class SpiritGunCharge extends AnimationBase {
  constructor() {
    super('SpiritGunCharge', 2.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const head = character.headGroup;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;

    // easeInOutQuad easing
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Reset at t=0
    if (t === 0) {
      rArm.rotation.z = rBaseZ;
      rArm.rotation.x = rBaseX;
      if (head) head.rotation.y = 0;
      // Hide orb and beam, reset intensity
      if (character.hideSpiritGunOrb) character.hideSpiritGunOrb();
      if (character.hideSpiritGunBeam) character.hideSpiritGunBeam();
      if (character.setSpiritGunIntensity) character.setSpiritGunIntensity(0);
      if (character.setSpiritGunBeamExtend) character.setSpiritGunBeamExtend(0);
      return;
    }

    // Phase 1: Arm raises and points forward (0-0.7)
    if (t < 0.7) {
      const p = t / 0.7;
      const armEase = 1 - Math.pow(1 - p, 3); // smooth ease out
      // Right arm raises up and points forward
      rArm.rotation.z = rBaseZ - 1.4 * armEase; // raise arm high
      rArm.rotation.x = rBaseX - 0.3 * armEase; // slight forward angle
    }
    // Phase 2: Hold aiming pose (0.7-1.0)
    else {
      rArm.rotation.z = rBaseZ - 1.4;
      rArm.rotation.x = rBaseX - 0.3;
    }

    // Head turns slightly toward aiming direction
    if (head) head.rotation.y = -0.2 * ease;

    // Spirit Gun orb grows at fingertip using the new API
    if (character.showSpiritGunOrb) {
      character.showSpiritGunOrb();
    }
    if (character.setSpiritGunIntensity) {
      // Intensity builds up: slow start, fast finish
      const intensityEase = t < 0.3 ? (t / 0.3) * (t / 0.3) * 0.3 : 0.3 + (t - 0.3) / 0.7 * 0.7;
      character.setSpiritGunIntensity(intensityEase);
    }
  }
}
