import { AnimationBase } from 'dula-engine';

/**
 * HitStagger — 受击踉跄（增强版）
 * Reaction to taking a hit (KOF style hitstun)
 * Body flinches back with larger knockback, head snaps, then recovers
 * Duration: 0.6s
 *
 * Tags:
 *   requires: [rightArm, leftArm]
 *   suits: [humanoid, fighter, athletic, monster]
 *   notSuits: [tiny]
 */
export class HitStagger extends AnimationBase {
  constructor() {
    super('HitStagger', 0.6);
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: ['tiny'],
      minHeight: 0.5,
      maxHeight: 3.5,
    };
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const head = character.headGroup;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: IMPACT (0-0.15) - violent flinch with large knockback
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = 1 - Math.pow(1 - p, 3);
      // BIGGER knock back
      character.mesh.position.z = -ease * 0.5;
      // Body reels with more rotation
      character.mesh.rotation.y = ease * 0.4;
      character.mesh.rotation.z = ease * 0.15;
      // Arms flail from impact
      rArm.rotation.z = rBaseZ + ease * 0.6;
      rArm.rotation.x = ease * 0.5;
      lArm.rotation.z = lBaseZ - ease * 0.6;
      lArm.rotation.x = ease * 0.4;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY + ease * 0.05;
      }
    }
    // Phase 2: Stagger (0.15-0.35) - hold stunned pose with wobble
    else if (t < 0.35) {
      const p = (t - 0.15) / 0.2;
      // Slight wobble while stunned
      character.mesh.position.z = -0.5 + Math.sin(p * Math.PI * 4) * 0.03;
      character.mesh.rotation.y = 0.4 + Math.sin(p * Math.PI * 3) * 0.06;
      rArm.rotation.z = rBaseZ + 0.6 + Math.sin(p * Math.PI * 5) * 0.06;
      lArm.rotation.z = lBaseZ - 0.6 + Math.sin(p * Math.PI * 5 + 1) * 0.06;
    }
    // Phase 3: Recover (0.35-1.0) - shake it off
    else {
      const p = (t - 0.35) / 0.65;
      const ease = p * p;
      character.mesh.position.z = -0.5 + ease * 0.5;
      character.mesh.rotation.y = 0.4 - ease * 0.4;
      character.mesh.rotation.z = 0.15 - ease * 0.15;
      rArm.rotation.z = (rBaseZ + 0.6) - ease * 0.6;
      rArm.rotation.x = 0.5 - ease * 0.5;
      lArm.rotation.z = (lBaseZ - 0.6) + ease * 0.6;
      lArm.rotation.x = 0.4 - ease * 0.4;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY + 0.05) - ease * 0.05;
      }
    }

    // Head snaps back on impact
    if (head) {
      if (t < 0.15) {
        head.rotation.x = (t / 0.15) * 0.3;
        head.rotation.y = (t / 0.15) * 0.15;
      } else if (t < 0.35) {
        head.rotation.x = 0.3 - ((t - 0.15) / 0.2) * 0.08;
      } else {
        head.rotation.x = 0.22 - ((t - 0.35) / 0.65) * 0.22;
        head.rotation.y = 0.15 - ((t - 0.35) / 0.65) * 0.15;
      }
    }
  }
}
