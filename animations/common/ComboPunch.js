import { AnimationBase } from 'dula-engine';

/**
 * ComboPunch — 连击拳 (KOF97经典连段)
 * 左拳→右拳→左勾拳 三连击
 * 每个hit有独立的windup/strike/recovery
 * Duration: 1.2s
 */
/**
 * ComboPunch — 连击拳 (KOF97经典连段)
 * 左拳→右拳→左勾拳 三连击
 *
 * Tags:
 *   requires: [rightArm, leftArm]
 *   suits: [humanoid, fighter, athletic]
 *   notSuits: [round, tiny, quadruped, slow]
 *   note: Best on agile fighters with good arm articulation
 */
export class ComboPunch extends AnimationBase {
  constructor() {
    super('ComboPunch', 1.2);
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseZ = character.leftArmBaseZ || 0;
    const lBaseX = character.leftArmBaseX || 0;

    // Hit 1: Left jab (0-0.35)
    if (t < 0.35) {
      const ht = t / 0.35;
      if (ht < 0.25) {
        // windup
        const p = ht / 0.25;
        const ease = p * p;
        lArm.rotation.z = lBaseZ + ease * 0.6;
        lArm.rotation.x = lBaseX - ease * 0.4;
        rArm.rotation.z = rBaseZ - ease * 0.2;
        character.mesh.rotation.y = ease * 0.1;
      } else if (ht < 0.6) {
        // strike
        const p = (ht - 0.25) / 0.35;
        const ease = 1 - Math.pow(1 - p, 2);
        lArm.rotation.z = (lBaseZ + 0.6) - ease * 1.0;
        lArm.rotation.x = (lBaseX - 0.4) - ease * 0.8;
        rArm.rotation.z = (rBaseZ - 0.2) + ease * 0.1;
        character.mesh.rotation.y = 0.1 + ease * 0.15;
        character.mesh.position.z = ease * 0.08;
      } else {
        // recover
        const p = (ht - 0.6) / 0.4;
        const ease = p * p;
        lArm.rotation.z = (lBaseZ - 0.4) + ease * 0.4;
        lArm.rotation.x = (lBaseX - 1.2) + ease * 1.2;
        rArm.rotation.z = (rBaseZ - 0.1) - ease * 0.1;
        character.mesh.rotation.y = 0.25 - ease * 0.25;
        character.mesh.position.z = 0.08 - ease * 0.08;
      }
    }
    // Hit 2: Right cross (0.35-0.7)
    else if (t < 0.7) {
      const ht = (t - 0.35) / 0.35;
      if (ht < 0.25) {
        const p = ht / 0.25;
        const ease = p * p;
        rArm.rotation.z = rBaseZ - ease * 0.8;
        rArm.rotation.x = rBaseX - ease * 0.5;
        lArm.rotation.z = lBaseZ + ease * 0.3;
        character.mesh.rotation.y = -ease * 0.15;
      } else if (ht < 0.6) {
        const p = (ht - 0.25) / 0.35;
        const ease = 1 - Math.pow(1 - p, 2);
        rArm.rotation.z = (rBaseZ - 0.8) + ease * 1.3;
        rArm.rotation.x = (rBaseX - 0.5) - ease * 1.0;
        lArm.rotation.z = (lBaseZ + 0.3) - ease * 0.2;
        character.mesh.rotation.y = -0.15 + ease * 0.35;
        character.mesh.position.z = ease * 0.12;
      } else {
        const p = (ht - 0.6) / 0.4;
        const ease = p * p;
        rArm.rotation.z = (rBaseZ + 0.5) - ease * 0.5;
        rArm.rotation.x = (rBaseX - 1.5) + ease * 1.5;
        lArm.rotation.z = (lBaseZ + 0.1) - ease * 0.1;
        character.mesh.rotation.y = 0.2 - ease * 0.2;
        character.mesh.position.z = 0.12 - ease * 0.12;
      }
    }
    // Hit 3: Left hook finisher (0.7-1.0)
    else if (t < 1.0) {
      const ht = (t - 0.7) / 0.3;
      if (ht < 0.2) {
        const p = ht / 0.2;
        const ease = p * p;
        lArm.rotation.z = lBaseZ + ease * 1.0;
        lArm.rotation.x = lBaseX - ease * 0.3;
        rArm.rotation.z = rBaseZ - ease * 0.4;
        character.mesh.rotation.y = ease * 0.3;
      } else if (ht < 0.6) {
        const p = (ht - 0.2) / 0.4;
        const ease = 1 - Math.pow(1 - p, 2);
        lArm.rotation.z = (lBaseZ + 1.0) - ease * 2.0;
        lArm.rotation.x = (lBaseX - 0.3) - ease * 0.6;
        rArm.rotation.z = (rBaseZ - 0.4) + ease * 0.2;
        character.mesh.rotation.y = 0.3 - ease * 0.5;
        character.mesh.position.z = ease * 0.15;
      } else {
        const p = (ht - 0.6) / 0.4;
        const ease = p * p;
        lArm.rotation.z = (lBaseZ - 1.0) + ease * 1.0;
        lArm.rotation.x = (lBaseX - 0.9) + ease * 0.9;
        rArm.rotation.z = (rBaseZ - 0.2) + ease * 0.2;
        character.mesh.rotation.y = -0.2 + ease * 0.2;
        character.mesh.position.z = 0.15 - ease * 0.15;
      }
    }
    // Final recovery (1.0-1.2) - return to fighting stance
    else {
      const p = (t - 1.0) / 0.2;
      const ease = p * p;
      // Fighting stance: right back, left forward, body angled
      lArm.rotation.z = lBaseZ + ease * 0.5;
      lArm.rotation.x = lBaseX - ease * 0.4;
      rArm.rotation.z = rBaseZ - ease * 0.9;
      rArm.rotation.x = rBaseX - ease * 0.7;
      character.mesh.rotation.y = ease * 0.35;
      character.mesh.position.z = 0;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
    }
  }
}
