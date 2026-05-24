import { AnimationBase } from 'dula-engine';

/**
 * JumpAttack — 跳击
 * Jumping attack (KOF style jump-in / aerial attack)
 * Leap up then dive down with strike
 * Duration: 1.0s
 */
/**
 * JumpAttack — 跳击
 * Jumping attack (KOF style jump-in / aerial attack)
 *
 * Tags:
 *   requires: [rightArm, leftArm, rightLeg, leftLeg]
 *   suits: [humanoid, fighter, athletic, agile]
 *   notSuits: [round, tiny, quadruped, slow, floating]
 *   note: Requires jumping capability — not for heavy or floating characters
 */
export class JumpAttack extends AnimationBase {
  constructor() {
    super('JumpAttack', 1.0);
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const rLeg = character.rightLeg;
    const lLeg = character.leftLeg;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Crouch (0-0.15) - wind up jump
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.12;
      }
      // Arms wind back
      rArm.rotation.z = rBaseZ - ease * 0.6;
      rArm.rotation.x = rBaseX + ease * 0.3;
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.4;
        lArm.rotation.x = ease * 0.2;
      }
      // Legs coil
      if (rLeg) rLeg.rotation.x = ease * 0.4;
      if (lLeg) lLeg.rotation.x = ease * 0.3;
      character.mesh.rotation.x = ease * 0.1;
    }
    // Phase 2: Leap (0.15-0.4) - jump up
    else if (t < 0.4) {
      const p = (t - 0.15) / 0.25;
      const ease = 1 - Math.pow(1 - p, 2);
      // Arc up
      const jumpHeight = Math.sin(p * Math.PI * 0.6) * 0.6;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.12) + jumpHeight;
      }
      // Arms prepare strike
      rArm.rotation.z = (rBaseZ - 0.6) + ease * 0.3;
      rArm.rotation.x = (rBaseX + 0.3) - ease * 0.8;
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.4) - ease * 0.2;
        lArm.rotation.x = 0.2 - ease * 0.4;
      }
      // Legs extend
      if (rLeg) rLeg.rotation.x = 0.4 - ease * 0.6;
      if (lLeg) lLeg.rotation.x = 0.3 - ease * 0.5;
      // Lean forward in air
      character.mesh.rotation.x = 0.1 + ease * 0.2;
    }
    // Phase 3: STRIKE (0.4-0.6) - apex attack
    else if (t < 0.6) {
      const p = (t - 0.4) / 0.2;
      const ease = 1 - Math.pow(1 - p, 2);
      // Start descent
      const fallProgress = p;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY + 0.48) - fallProgress * 0.3;
      }
      // Arm strikes down
      rArm.rotation.z = (rBaseZ - 0.3) - ease * 0.5;
      rArm.rotation.x = (rBaseX - 0.5) - ease * 1.0;
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.2) + ease * 0.3;
        lArm.rotation.x = -0.2 - ease * 0.3;
      }
      // Legs tuck
      if (rLeg) rLeg.rotation.x = -0.2 + ease * 0.3;
      if (lLeg) lLeg.rotation.x = -0.2 + ease * 0.2;
      // Dive angle
      character.mesh.rotation.x = 0.3 + ease * 0.3;
    }
    // Phase 4: Land (0.6-0.8) - impact and crouch
    else if (t < 0.8) {
      const p = (t - 0.6) / 0.2;
      const ease = p * p;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY + 0.18) - ease * 0.2;
      }
      // Arm recoil from impact
      rArm.rotation.z = (rBaseZ - 0.8) + ease * 0.5;
      rArm.rotation.x = (rBaseX - 1.5) + ease * 1.0;
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.5) - ease * 0.3;
        lArm.rotation.x = -0.5 + ease * 0.3;
      }
      // Legs absorb impact
      if (rLeg) rLeg.rotation.x = 0.1 + ease * 0.2;
      if (lLeg) lLeg.rotation.x = 0.0 + ease * 0.2;
      character.mesh.rotation.x = 0.6 - ease * 0.5;
    }
    // Phase 5: Recover (0.8-1.0)
    else {
      const p = (t - 0.8) / 0.2;
      const ease = p * p;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.02) + ease * 0.02;
      }
      rArm.rotation.z = (rBaseZ - 0.3) + ease * 0.3;
      rArm.rotation.x = (rBaseX - 0.5) + ease * 0.5;
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.2) - ease * 0.2;
        lArm.rotation.x = -0.2 + ease * 0.2;
      }
      if (rLeg) rLeg.rotation.x = 0.3 - ease * 0.3;
      if (lLeg) lLeg.rotation.x = 0.2 - ease * 0.2;
      character.mesh.rotation.x = 0.1 - ease * 0.1;
    }
  }
}
