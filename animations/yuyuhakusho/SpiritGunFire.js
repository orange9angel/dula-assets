import { AnimationBase } from 'dula-engine';

/**
 * SpiritGunFire — 霊丸発射
 * Firing the Spirit Gun - arm thrusts forward sharply
 * Energy blast effect
 * Quick recoil
 */
export class SpiritGunFire extends AnimationBase {
  constructor() {
    super('SpiritGunFire', 1.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const head = character.headGroup;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;

    // Reset at t=0
    if (t === 0) {
      rArm.rotation.z = rBaseZ - 1.3;
      rArm.rotation.x = rBaseX - 0.2;
      if (head) head.rotation.y = -0.15;
      if (character.spiritGunOrb) {
        character.spiritGunOrb.visible = true;
        character.spiritGunOrb.scale.setScalar(2.0);
      }
      return;
    }

    // Phase 1: Thrust forward (0-0.2)
    if (t < 0.2) {
      const p = t / 0.2;
      rArm.rotation.z = (rBaseZ - 1.3) + p * 0.3; // thrust down slightly
      rArm.rotation.x = (rBaseX - 0.2) - p * 0.8; // thrust forward sharply
    }
    // Phase 2: Blast effect + recoil start (0.2-0.4)
    else if (t < 0.4) {
      const p = (t - 0.2) / 0.2;
      rArm.rotation.z = rBaseZ - 1.0;
      rArm.rotation.x = rBaseX - 1.0 + p * 0.3; // recoil back
      // Flash the orb then hide it (fired)
      if (character.spiritGunOrb) {
        character.spiritGunOrb.scale.setScalar(2.0 + p * 1.5);
        if (character.spiritGunOrb.material) {
          character.spiritGunOrb.material.opacity = 1.0 - p;
        }
      }
    }
    // Phase 3: Recoil (0.4-0.7)
    else if (t < 0.7) {
      const p = (t - 0.4) / 0.3;
      const easeRecoil = 1 - Math.pow(1 - p, 2);
      rArm.rotation.z = rBaseZ - 1.0 + easeRecoil * 0.4;
      rArm.rotation.x = rBaseX - 0.7 + easeRecoil * 0.5;
      if (character.spiritGunOrb) {
        character.spiritGunOrb.visible = false;
      }
    }
    // Phase 4: Recover (0.7-1.0)
    else {
      const p = (t - 0.7) / 0.3;
      const easeRecover = p * p;
      rArm.rotation.z = (rBaseZ - 0.6) - easeRecover * 0.6;
      rArm.rotation.x = (rBaseX - 0.2) - easeRecover * 0.0;
    }

    // Head follows the action
    if (head) head.rotation.y = -0.15;
  }
}
