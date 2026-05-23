import { AnimationBase } from 'dula-engine';

/**
 * FightingStance — 战斗姿态
 * 经典奥特曼格斗起手式
 * 适配新Ultraman比例
 */
export class FightingStance extends AnimationBase {
  constructor() {
    super('FightingStance', 1.5);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Smooth transition to fighting stance
    const p = t < 0.3 ? t / 0.3 : 1;

    // Right arm: fist raised near face
    rArm.rotation.z = rBaseZ - p * 1.0;
    rArm.rotation.x = -p * 0.8;

    // Left arm: extended forward, open hand
    lArm.rotation.z = lBaseZ + p * 0.6;
    lArm.rotation.x = -p * 0.4;

    // Slight crouch (relative to baseY)
    if (character.baseY !== undefined) {
      character.mesh.position.y = character.baseY - p * 0.3;
    }

    // Body angled
    character.mesh.rotation.y = p * 0.3;
  }
}
