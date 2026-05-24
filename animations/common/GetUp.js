import { AnimationBase } from 'dula-engine';

/**
 * GetUp — 起身
 * Rising from knockdown (KOF style quick rise)
 * Rolls to side, pushes up, returns to stance
 * Duration: 0.8s
 */
/**
 * GetUp — 起身
 * Rising from knockdown (KOF style quick rise)
 *
 * Tags:
 *   requires: [rightArm, leftArm, rightLeg, leftLeg]
 *   suits: [humanoid, fighter, athletic, monster]
 *   notSuits: [tiny, floating]
 *   note: Paired with Knockdown — use on same character
 */
export class GetUp extends AnimationBase {
  constructor() {
    super('GetUp', 0.8);
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: ['tiny', 'floating'],
      minHeight: 0.5,
      maxHeight: 3.5,
    };
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const rLeg = character.rightLeg;
    const lLeg = character.leftLeg;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Roll (0-0.2) - roll to side from back
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;
      character.mesh.rotation.x = -1.7 + ease * 1.0; // from flat to ~-0.7
      character.mesh.rotation.z = ease * 0.3; // roll to side
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.3) + ease * 0.15;
      }
      if (rArm) {
        rArm.rotation.z = (rBaseZ + 1.1) - ease * 0.6;
        rArm.rotation.x = ease * 0.5;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ - 1.1) + ease * 0.6;
        lArm.rotation.x = ease * 0.5;
      }
      if (rLeg) rLeg.rotation.x = -0.6 + ease * 0.3;
      if (lLeg) lLeg.rotation.x = -0.5 + ease * 0.3;
    }
    // Phase 2: Push up (0.2-0.5) - hands to ground, push up
    else if (t < 0.5) {
      const p = (t - 0.2) / 0.3;
      const ease = 1 - Math.pow(1 - p, 2);
      character.mesh.rotation.x = -0.7 + ease * 0.7; // to upright
      character.mesh.rotation.z = 0.3 - ease * 0.3;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.15) + ease * 0.2;
      }
      character.mesh.position.z = -0.5 + ease * 0.3;
      if (rArm) {
        rArm.rotation.z = (rBaseZ + 0.5) - ease * 0.5;
        rArm.rotation.x = 0.5 - ease * 0.5;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ - 0.5) + ease * 0.5;
        lArm.rotation.x = 0.5 - ease * 0.5;
      }
      if (rLeg) rLeg.rotation.x = -0.3 + ease * 0.3;
      if (lLeg) lLeg.rotation.x = -0.2 + ease * 0.2;
    }
    // Phase 3: Crouch (0.5-0.7) - low stance before standing
    else if (t < 0.7) {
      const p = (t - 0.5) / 0.2;
      const ease = p * p;
      character.mesh.rotation.x = ease * 0.05;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY + 0.05) - ease * 0.08;
      }
      character.mesh.position.z = -0.2 + ease * 0.1;
      if (rArm) {
        rArm.rotation.z = rBaseZ + ease * 0.2;
        rArm.rotation.x = -ease * 0.2;
      }
      if (lArm) {
        lArm.rotation.z = lBaseZ - ease * 0.2;
        lArm.rotation.x = -ease * 0.2;
      }
      if (rLeg) rLeg.rotation.x = ease * 0.4;
      if (lLeg) lLeg.rotation.x = ease * 0.3;
    }
    // Phase 4: Stand (0.7-1.0) - return to fighting stance
    else {
      const p = (t - 0.7) / 0.3;
      const ease = p * p;
      character.mesh.rotation.x = 0.05 + ease * 0.03;  // → 0.08
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.03) - ease * 0.03; // → baseY - 0.06
      }
      character.mesh.position.z = -0.1 + ease * 0.1;   // → 0
      // Fighting stance: right back guard, left forward
      if (rArm) {
        rArm.rotation.z = (rBaseZ + 0.2) - ease * 1.1; // → rBaseZ - 0.9
        rArm.rotation.x = -0.2 - ease * 0.5;           // → -0.7
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ - 0.2) + ease * 0.7; // → lBaseZ + 0.5
        lArm.rotation.x = -0.2 - ease * 0.2;           // → -0.4
      }
      if (rLeg) rLeg.rotation.x = 0.4 - ease * 0.15;   // → 0.25
      if (lLeg) lLeg.rotation.x = 0.3 - ease * 0.1;    // → 0.2
      character.mesh.rotation.y = ease * 0.35;
    }
  }
}
