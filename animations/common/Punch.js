import { AnimationBase } from 'dula-engine';

/**
 * Punch — 直拳（增强版）
 * Classic fighting game straight punch (KOF style)
 * Right arm thrusts forward in a sharp jab, body twists for power
 * Increased lunge and impact feel
 * Duration: 0.5s for snappy fighting game feel
 *
 * Tags:
 *   requires: [rightArm, leftArm]
 *   suits: [humanoid, fighter, athletic]
 *   notSuits: [round, tiny, quadruped]
 */
export class Punch extends AnimationBase {
  constructor() {
    super('Punch', 0.5);
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const head = character.headGroup;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Wind up (0-0.15) - pull right arm back, left arm guards
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;
      rArm.rotation.z = rBaseZ - ease * 0.9; // pull back more
      rArm.rotation.x = rBaseX - ease * 0.6;
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.5; // guard up
        lArm.rotation.x = -ease * 0.3;
      }
      // Body twist back
      character.mesh.rotation.y = -ease * 0.3;
      // Slight crouch
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
    }
    // Phase 2: PUNCH! (0.15-0.35) - explosive forward thrust
    else if (t < 0.35) {
      const p = (t - 0.15) / 0.2;
      const ease = 1 - Math.pow(1 - p, 3); // sharp ease-out
      rArm.rotation.z = (rBaseZ - 0.9) + ease * 1.5; // thrust forward more
      rArm.rotation.x = (rBaseX - 0.6) - ease * 1.4; // arm extends forward
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.5) - ease * 0.2;
        lArm.rotation.x = -0.3 + ease * 0.1;
      }
      // Body twist into punch
      character.mesh.rotation.y = -0.3 + ease * 0.6;
      // Lunge forward MORE
      character.mesh.position.z = ease * 0.35;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - 0.06 + ease * 0.06;
      }
    }
    // Phase 3: Recovery (0.35-1.0) - snap back to guard
    else {
      const p = (t - 0.35) / 0.65;
      const ease = p * p; // ease-in
      rArm.rotation.z = (rBaseZ + 0.6) - ease * 0.6;
      rArm.rotation.x = (rBaseX - 2.0) + ease * 2.0;
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.3) - ease * 0.3;
        lArm.rotation.x = -0.2 + ease * 0.2;
      }
      character.mesh.rotation.y = 0.3 - ease * 0.3;
      character.mesh.position.z = 0.35 - ease * 0.35;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY;
      }
    }

    // Head tracks the punch direction
    if (head) {
      head.rotation.y = character.mesh.rotation.y * 0.5;
    }
  }
}
