import { AnimationBase } from 'dula-engine';

/**
 * Knockdown — 击倒
 * Getting knocked down (KOF style knockdown)
 * Body falls backward, then lies flat
 * Duration: 0.8s
 */
/**
 * Knockdown — 击倒
 * Getting knocked down (KOF style knockdown)
 *
 * Tags:
 *   requires: [rightArm, leftArm, rightLeg, leftLeg]
 *   suits: [humanoid, fighter, athletic, monster]
 *   notSuits: [tiny, floating]
 *   note: Requires full body rig for fall animation
 */
export class Knockdown extends AnimationBase {
  constructor() {
    super('Knockdown', 0.8);
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
    const head = character.headGroup;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Impact flinch (0-0.15)
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;
      character.mesh.rotation.x = -ease * 0.3;
      character.mesh.position.z = -ease * 0.1;
      if (rArm) {
        rArm.rotation.z = rBaseZ + ease * 0.3;
        rArm.rotation.x = ease * 0.3;
      }
      if (lArm) {
        lArm.rotation.z = lBaseZ - ease * 0.3;
        lArm.rotation.x = ease * 0.3;
      }
    }
    // Phase 2: Fall back (0.15-0.6) - arc backward to ground
    else if (t < 0.6) {
      const p = (t - 0.15) / 0.45;
      const ease = 1 - Math.pow(1 - p, 2);
      // Body falls backward (rotate X negative = lean back)
      character.mesh.rotation.x = -0.3 - ease * 1.4; // ends at ~-1.7 (near flat)
      // Arc trajectory: up then down
      const arc = Math.sin(p * Math.PI) * 0.15;
      character.mesh.position.z = -0.1 - ease * 0.4;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY + arc - ease * 0.3;
      }
      // Arms flail
      if (rArm) {
        rArm.rotation.z = (rBaseZ + 0.3) + ease * 0.8;
        rArm.rotation.x = 0.3 + ease * 0.5;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ - 0.3) - ease * 0.8;
        lArm.rotation.x = 0.3 + ease * 0.5;
      }
      // Legs lift
      if (rLeg) rLeg.rotation.x = -ease * 0.6;
      if (lLeg) lLeg.rotation.x = -ease * 0.5;
    }
    // Phase 3: Hit ground (0.6-0.75) - impact bounce
    else if (t < 0.75) {
      const p = (t - 0.6) / 0.15;
      const bounce = Math.sin(p * Math.PI) * 0.03;
      character.mesh.rotation.x = -1.7;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - 0.3 + bounce;
      }
      character.mesh.position.z = -0.5;
      if (rArm) rArm.rotation.z = rBaseZ + 1.1;
      if (lArm) lArm.rotation.z = lBaseZ - 1.1;
    }
    // Phase 4: Lie still (0.75-1.0)
    else {
      character.mesh.rotation.x = -1.7;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - 0.3;
      }
      character.mesh.position.z = -0.5;
      if (rArm) rArm.rotation.z = rBaseZ + 1.1;
      if (lArm) lArm.rotation.z = lBaseZ - 1.1;
    }

    // Head follows fall
    if (head) {
      if (t < 0.6) {
        head.rotation.x = ((t - 0.15) / 0.45) * 0.3;
      } else {
        head.rotation.x = 0.3;
      }
    }
  }
}
