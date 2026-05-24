import { AnimationBase } from 'dula-engine';

/**
 * SpinKick — 回旋踢
 * Classic fighting game spinning kick (KOF style)
 * Body spins 360°, leg extends at apex
 * Duration: 0.8s
 */
/**
 * SpinKick — 回旋踢
 * Classic fighting game spinning kick (KOF style)
 *
 * Tags:
 *   requires: [rightLeg, leftLeg, rightArm, leftArm]
 *   suits: [humanoid, fighter, athletic, agile]
 *   notSuits: [round, tiny, quadruped, slow, floating]
 *   note: Requires good balance — best on athletic humanoids
 */
export class SpinKick extends AnimationBase {
  constructor() {
    super('SpinKick', 0.8);
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
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

    // Phase 1: Wind up (0-0.2) - coil and pivot
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;
      // Body starts turning
      character.mesh.rotation.y = -ease * 0.8;
      // Arms spread for balance
      if (rArm) {
        rArm.rotation.z = rBaseZ - ease * 0.5;
        rArm.rotation.x = -ease * 0.3;
      }
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.5;
        lArm.rotation.x = -ease * 0.3;
      }
      // Right leg chambers
      rLeg.rotation.x = rLegBaseX - ease * 0.8;
      // Left leg plants
      lLeg.rotation.x = lLegBaseX + ease * 0.1;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.05;
      }
    }
    // Phase 2: SPIN (0.2-0.55) - 360° rotation with kick
    else if (t < 0.55) {
      const p = (t - 0.2) / 0.35;
      const ease = 1 - Math.pow(1 - p, 2);
      // Full 360 spin
      character.mesh.rotation.y = -0.8 + ease * Math.PI * 2;
      // Right leg extends during spin
      rLeg.rotation.x = (rLegBaseX - 0.8) + ease * 1.2;
      // Left leg stays planted but pivots
      lLeg.rotation.x = (lLegBaseX + 0.1) - ease * 0.3;
      // Arms pull in during spin
      if (rArm) {
        rArm.rotation.z = (rBaseZ - 0.5) + ease * 0.3;
        rArm.rotation.x = -0.3 + ease * 0.2;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.5) - ease * 0.3;
        lArm.rotation.x = -0.3 + ease * 0.2;
      }
      // Slight rise during spin
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.05) + ease * 0.08;
      }
    }
    // Phase 3: Retract (0.55-0.75) - pull leg back
    else if (t < 0.75) {
      const p = (t - 0.55) / 0.2;
      const ease = p * p;
      character.mesh.rotation.y = (-0.8 + Math.PI * 2) - ease * 0.2;
      rLeg.rotation.x = (rLegBaseX + 0.4) - ease * 0.4;
      lLeg.rotation.x = (lLegBaseX - 0.2) + ease * 0.2;
      if (rArm) {
        rArm.rotation.z = (rBaseZ - 0.2) + ease * 0.2;
        rArm.rotation.x = -0.1 + ease * 0.1;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.2) - ease * 0.2;
        lArm.rotation.x = -0.1 + ease * 0.1;
      }
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY + 0.03) - ease * 0.03;
      }
    }
    // Phase 4: Recover (0.75-1.0) - return to fighting stance
    else {
      const p = (t - 0.75) / 0.25;
      const ease = p * p;
      // Normalize rotation to fighting stance angle
      character.mesh.rotation.y = (-0.8 + Math.PI * 2 - 0.2) + ease * 0.15; // → ~0.35
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
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
    }
  }
}
