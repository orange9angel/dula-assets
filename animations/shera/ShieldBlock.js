import { AnimationBase } from 'dula-engine';

/**
 * ShieldBlock — 盾牌格挡
 * She-Ra 举起盾牌防御，身体微蹲
 */
export class ShieldBlock extends AnimationBase {
  constructor() {
    super('ShieldBlock', 1.2);
  }

  update(t, character) {
    const lArm = character.leftArm;
    const rArm = character.rightArm;
    if (!lArm || !rArm) return;

    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;
    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;

    const ease = t < 0.2 ? t / 0.2 : 1;

    // Left arm raises shield high
    lArm.rotation.z = lBaseZ + 1.0 * ease;
    lArm.rotation.x = -0.5 * ease;

    // Right arm holds sword back, ready to counter
    rArm.rotation.z = rBaseZ - 0.3 * ease;
    rArm.rotation.x = -0.2 * ease;

    // Crouch slightly
    character.mesh.position.y = character.baseY - 0.1 * ease;

    // Brace impact at t=0.5
    if (t > 0.4 && t < 0.6) {
      const impact = Math.sin((t - 0.4) / 0.2 * Math.PI);
      character.mesh.position.x = impact * 0.05;
      lArm.rotation.z = lBaseZ + 1.0 + impact * 0.1;
    }

    if (character.attachShield) character.attachShield();
    if (character.attachSword) character.attachSword();
  }
}
