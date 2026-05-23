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
      if (character.spiritGunOrb) {
        character.spiritGunOrb.visible = false;
        character.spiritGunOrb.scale.setScalar(0);
      }
      return;
    }

    // Right arm raises and points forward
    rArm.rotation.z = rBaseZ - 1.3 * ease; // raise arm up
    rArm.rotation.x = rBaseX - 0.2 * ease; // slight forward angle

    // Head turns slightly toward aiming direction
    if (head) head.rotation.y = -0.15 * ease;

    // Spirit Gun orb grows at fingertip
    if (character.spiritGunOrb) {
      character.spiritGunOrb.visible = true;
      character.spiritGunOrb.scale.setScalar(0.2 + ease * 1.8);
      if (character.spiritGunOrb.material) {
        character.spiritGunOrb.material.opacity = 0.4 + ease * 0.5;
      }
    }
  }
}
