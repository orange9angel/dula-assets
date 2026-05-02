import { AnimationBase } from 'dula-engine';

/**
 * BattleStance — 战斗姿态
 * She-Ra 摆出经典战斗姿势：剑在前，盾牌护胸
 */
export class BattleStance extends AnimationBase {
  constructor() {
    super('BattleStance', 2.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    // Smooth transition into stance
    const ease = t < 0.3 ? t / 0.3 : 1;

    // Right arm: sword forward, slightly raised
    rArm.rotation.z = rBaseZ - 0.6 * ease;
    rArm.rotation.x = -0.4 * ease;

    // Left arm: shield up, guarding
    lArm.rotation.z = lBaseZ + 0.5 * ease;
    lArm.rotation.x = -0.3 * ease;

    // Slight body rotation
    character.mesh.rotation.y = -0.2 * ease;

    // Ensure equipment visible
    if (character.attachSword) character.attachSword();
    if (character.attachShield) character.attachShield();
  }
}
