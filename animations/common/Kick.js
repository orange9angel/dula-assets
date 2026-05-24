import { AnimationBase } from 'dula-engine';

/**
 * Kick — 前踢
 * Classic fighting game front kick (KOF style)
 * Right leg extends forward in a sharp kick, arms balance
 * Duration: 0.6s
 */
/**
 * Kick — 前踢
 * Classic fighting game front kick (KOF style)
 *
 * Tags:
 *   requires: [rightLeg, leftLeg, rightArm, leftArm]
 *   suits: [humanoid, fighter, athletic]
 *   notSuits: [round, tiny, quadruped, floating]
 */
export class Kick extends AnimationBase {
  constructor() {
    super('Kick', 0.6);
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  update(t, character) {
    const rLeg = character.rightLeg;
    const lLeg = character.leftLeg;
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rLeg || !lLeg) return;

    const rLegBaseX = character.rightLegBaseX || 0;
    const lLegBaseX = character.leftLegBaseX || 0;
    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Chamber (0-0.25) - lift knee, balance on left leg
    if (t < 0.25) {
      const p = t / 0.25;
      const ease = p * p;
      // Right leg chambers (knee lifts)
      rLeg.rotation.x = rLegBaseX - ease * 1.2; // knee up
      // Left leg plants firmly
      lLeg.rotation.x = lLegBaseX + ease * 0.1;
      // Arms spread for balance
      if (rArm) {
        rArm.rotation.z = rBaseZ - ease * 0.6;
        rArm.rotation.x = -ease * 0.4;
      }
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.6;
        lArm.rotation.x = -ease * 0.4;
      }
      // Slight lean back
      character.mesh.rotation.x = ease * 0.1;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY + ease * 0.03;
      }
    }
    // Phase 2: KICK! (0.25-0.45) - leg extends sharply
    else if (t < 0.45) {
      const p = (t - 0.25) / 0.2;
      const ease = 1 - Math.pow(1 - p, 2);
      // Right leg extends forward
      rLeg.rotation.x = (rLegBaseX - 1.2) + ease * 1.0; // extend
      // Left leg stays planted
      lLeg.rotation.x = lLegBaseX + 0.1;
      // Arms counter-balance
      if (rArm) {
        rArm.rotation.z = (rBaseZ - 0.6) + ease * 0.3;
        rArm.rotation.x = -0.4 + ease * 0.2;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.6) - ease * 0.3;
        lArm.rotation.x = -0.4 + ease * 0.2;
      }
      // Body leans into kick
      character.mesh.rotation.x = 0.1 - ease * 0.2;
      // Lunge forward
      character.mesh.position.z = ease * 0.2;
    }
    // Phase 3: Retract (0.45-0.7) - pull leg back
    else if (t < 0.7) {
      const p = (t - 0.45) / 0.25;
      const ease = p * p;
      rLeg.rotation.x = (rLegBaseX - 0.2) - ease * 0.2;
      lLeg.rotation.x = (lLegBaseX + 0.1) - ease * 0.1;
      if (rArm) {
        rArm.rotation.z = (rBaseZ - 0.3) + ease * 0.3;
        rArm.rotation.x = -0.2 + ease * 0.2;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.3) - ease * 0.3;
        lArm.rotation.x = -0.2 + ease * 0.2;
      }
      character.mesh.rotation.x = -0.1 + ease * 0.1;
      character.mesh.position.z = 0.2 - ease * 0.2;
    }
    // Phase 4: Recover (0.7-1.0) - return to fighting stance
    else {
      const p = (t - 0.7) / 0.3;
      const ease = p * p;
      rLeg.rotation.x = rLegBaseX + ease * 0.25;
      lLeg.rotation.x = lLegBaseX + ease * 0.2;
      if (rArm) {
        rArm.rotation.z = rBaseZ - ease * 0.9;
        rArm.rotation.x = -ease * 0.7;
      }
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.5;
        lArm.rotation.x = -ease * 0.4;
      }
      character.mesh.rotation.x = ease * 0.08;
      character.mesh.rotation.y = ease * 0.35;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
    }
  }
}
