import { AnimationBase } from 'dula-engine';

/**
 * Kick — 前踢（战斗轴线版）
 * Classic fighting game front kick (KOF style)
 * 沿战斗轴线（X轴）踢击，不覆盖角色朝向
 * Duration: 0.6s
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

    const dir = character.userData?.facingDir || 1;

    // Phase 1: Chamber (0-0.25) - lift knee, balance on left leg
    if (t < 0.25) {
      const p = t / 0.25;
      const ease = p * p;
      rLeg.rotation.x = rLegBaseX - ease * 1.2;
      lLeg.rotation.x = lLegBaseX + ease * 0.1;
      if (rArm) {
        rArm.rotation.z = rBaseZ - ease * 0.6;
        rArm.rotation.x = -ease * 0.4;
      }
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.6;
        lArm.rotation.x = -ease * 0.4;
      }
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY + ease * 0.03;
      }
    }
    // Phase 2: KICK! (0.25-0.45) - leg extends sharply
    else if (t < 0.45) {
      const p = (t - 0.25) / 0.2;
      const ease = 1 - Math.pow(1 - p, 2);
      rLeg.rotation.x = (rLegBaseX - 1.2) + ease * 1.0;
      lLeg.rotation.x = lLegBaseX + 0.1;
      if (rArm) {
        rArm.rotation.z = (rBaseZ - 0.6) + ease * 0.3;
        rArm.rotation.x = -0.4 + ease * 0.2;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.6) - ease * 0.3;
        lArm.rotation.x = -0.4 + ease * 0.2;
      }
      // 沿战斗轴线突进
      character.mesh.position.x += dir * ease * 0.2;
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
      character.mesh.position.x -= dir * (1 - ease) * 0.2;
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
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
    }
  }
}
