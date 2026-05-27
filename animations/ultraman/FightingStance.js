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

    // Right arm: fist up guarding face (rear guard)
    rArm.rotation.z = rBaseZ - p * 0.15;
    rArm.rotation.x = -p * 1.3;

    // Left arm: fist up guarding face (lead guard)
    lArm.rotation.z = lBaseZ + p * 0.1;
    lArm.rotation.x = -p * 1.2;

    // Slight crouch (relative to baseY)
    if (character.baseY !== undefined) {
      character.mesh.position.y = character.baseY - p * 0.3;
    }

    // Body angled
    character.mesh.rotation.y = p * 0.3;
  }
}
