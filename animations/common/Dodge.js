import { AnimationBase } from 'dula-engine';

/**
 * Dodge — 闪避
 * Quick evasive maneuver (KOF style backdash / sidestep)
 * Body leans back sharply then snaps back to stance
 * Duration: 0.4s for snappy evasion feel
 */
/**
 * Dodge — 闪避
 * Quick evasive maneuver (KOF style backdash / sidestep)
 *
 * Tags:
 *   requires: [rightArm, leftArm]
 *   suits: [humanoid, fighter, athletic, agile]
 *   notSuits: [round, tiny, slow]
 */
export class Dodge extends AnimationBase {
  constructor() {
    super('Dodge', 0.4);
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'slow'],
      minHeight: 0.5,
      maxHeight: 3.0,
    };
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const head = character.headGroup;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Lean back (0-0.3) - quick evasive lean
    if (t < 0.3) {
      const p = t / 0.3;
      const ease = 1 - Math.pow(1 - p, 2);
      // Lean back (rotate around X)
      character.mesh.rotation.x = -ease * 0.35;
      // Step back slightly
      character.mesh.position.z = -ease * 0.25;
      // Arms guard up
      rArm.rotation.z = rBaseZ - ease * 0.7;
      rArm.rotation.x = -ease * 0.5;
      lArm.rotation.z = lBaseZ + ease * 0.7;
      lArm.rotation.x = -ease * 0.5;
      // Slight crouch
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.08;
      }
    }
    // Phase 2: Snap back (0.3-1.0) - return to fighting stance
    else {
      const p = (t - 0.3) / 0.7;
      const ease = p * p;
      character.mesh.rotation.x = -0.35 + ease * 0.43;  // → 0.08
      character.mesh.position.z = -0.25 + ease * 0.25;  // → 0
      // End in fighting stance: right back guard, left forward
      rArm.rotation.z = (rBaseZ - 0.7) - ease * 0.2;    // → rBaseZ - 0.9
      rArm.rotation.x = -0.5 + ease * 0.5;              // → 0 (near -0.7)
      lArm.rotation.z = (lBaseZ + 0.7) - ease * 0.2;    // → lBaseZ + 0.5
      lArm.rotation.x = -0.5 + ease * 0.5;              // → 0 (near -0.4)
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.08) + ease * 0.02; // → baseY - 0.06
      }
      // Body angle to fighting stance
      character.mesh.rotation.y = ease * 0.35;
    }

    // Head stays level during dodge
    if (head) {
      head.rotation.x = -character.mesh.rotation.x * 0.6;
    }
  }
}
