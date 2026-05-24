import { AnimationBase } from 'dula-engine';

/**
 * Uppercut — 上勾拳
 * Classic fighting game uppercut (KOF / Street Fighter style)
 * Powerful upward punch, body dips then explodes upward
 * Duration: 0.7s
 */
/**
 * Uppercut — 上勾拳
 * Classic fighting game uppercut (KOF / Street Fighter style)
 *
 * Tags:
 *   requires: [rightArm, leftArm]
 *   suits: [humanoid, fighter, athletic]
 *   notSuits: [round, tiny, quadruped]
 */
export class Uppercut extends AnimationBase {
  constructor() {
    super('Uppercut', 0.7);
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

    // Phase 1: Dip (0-0.2) - crouch down, wind up
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;
      rArm.rotation.z = rBaseZ - ease * 0.5; // arm tucks in
      rArm.rotation.x = rBaseX + ease * 0.8; // arm pulls back/down
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.3;
        lArm.rotation.x = ease * 0.2;
      }
      // Deep crouch
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.15;
      }
      // Body coils
      character.mesh.rotation.y = -ease * 0.2;
      character.mesh.rotation.z = ease * 0.05;
    }
    // Phase 2: EXPLODE UP (0.2-0.45) - uppercut launches
    else if (t < 0.45) {
      const p = (t - 0.2) / 0.25;
      const ease = 1 - Math.pow(1 - p, 3);
      // Arm sweeps upward in arc
      rArm.rotation.z = (rBaseZ - 0.5) + ease * 1.8; // arm rises
      rArm.rotation.x = (rBaseX + 0.8) - ease * 2.0; // arm thrusts up
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.3) - ease * 0.5;
        lArm.rotation.x = 0.2 - ease * 0.3;
      }
      // Body rises with punch
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.15) + ease * 0.25;
      }
      // Body untwists
      character.mesh.rotation.y = -0.2 + ease * 0.4;
      character.mesh.rotation.z = 0.05 - ease * 0.1;
    }
    // Phase 3: Peak hold (0.45-0.6) - arm at apex
    else if (t < 0.6) {
      const p = (t - 0.45) / 0.15;
      rArm.rotation.z = rBaseZ + 1.3;
      rArm.rotation.x = rBaseX - 1.2;
      if (lArm) {
        lArm.rotation.z = lBaseZ - 0.2;
        lArm.rotation.x = -0.1;
      }
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY + 0.1;
      }
      character.mesh.rotation.y = 0.2;
    }
    // Phase 4: Recover (0.6-1.0) - return to fighting stance
    else {
      const p = (t - 0.6) / 0.4;
      const ease = p * p;
      // Fighting stance: right back guard, left forward
      rArm.rotation.z = (rBaseZ + 1.3) - ease * 2.2;   // → rBaseZ - 0.9
      rArm.rotation.x = (rBaseX - 1.2) + ease * 0.5;   // → rBaseX - 0.7
      if (lArm) {
        lArm.rotation.z = (lBaseZ - 0.2) + ease * 0.7; // → lBaseZ + 0.5
        lArm.rotation.x = -0.1 + ease * 0.3;           // → 0.2 (near -0.4)
      }
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY + 0.1) - ease * 0.16; // → baseY - 0.06
      }
      character.mesh.rotation.y = 0.2 + ease * 0.15;   // → 0.35
      character.mesh.rotation.z = -0.05 + ease * 0.05; // → 0
    }

    // Head tilts with the motion
    if (head) {
      if (t < 0.2) {
        head.rotation.x = (t / 0.2) * 0.15;
      } else if (t < 0.45) {
        head.rotation.x = 0.15 - ((t - 0.2) / 0.25) * 0.3;
      } else {
        head.rotation.x = -0.15 + ((t - 0.45) / 0.55) * 0.15;
      }
    }
  }
}
