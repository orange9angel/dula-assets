import { AnimationBase } from 'dula-engine';

/**
 * Block — 格挡（战斗轴线版）
 * Defensive guard pose with leg bend (KOF style blocking)
 * 不覆盖角色朝向，保持侧向对敌
 * Duration: 0.8s
 */
export class Block extends AnimationBase {
  constructor() {
    super('Block', 0.8);
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'defensive'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.5,
      maxHeight: 3.0,
    };
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const rLeg = character.rightLeg;
    const lLeg = character.leftLeg;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseX = character.leftArmBaseX || 0;

    const p = t < 0.25 ? t / 0.25 : 1;
    const ease = 1 - Math.pow(1 - p, 2);

    // Right arm: crosses to center, forearm vertical
    rArm.rotation.z = rBaseZ - ease * 1.0;
    rArm.rotation.x = rBaseX - ease * 0.8;

    // Left arm: crosses over right, forming X guard
    lArm.rotation.z = lBaseZ + ease * 1.0;
    lArm.rotation.x = lBaseX - ease * 0.8;

    // Body braces - 微向前倾（沿战斗轴线）
    if (character.baseY !== undefined) {
      character.mesh.position.y = character.baseY - ease * 0.08;
    }

    // Slight lean forward into block
    character.mesh.rotation.x = ease * 0.1;

    // LEGS: bend knees for stable defensive stance
    if (rLeg) {
      rLeg.rotation.x = ease * 0.35;
    }
    if (lLeg) {
      lLeg.rotation.x = ease * 0.3;
    }

    // Hold phase: subtle vibration to show bracing for impact
    if (t >= 0.25) {
      const holdT = (t - 0.25) / 0.75;
      const vibration = Math.sin(holdT * Math.PI * 12) * 0.015;
      character.mesh.position.y = (character.baseY - 0.08) + vibration;
      rArm.rotation.z = (rBaseZ - 1.0) + vibration;
      lArm.rotation.z = (lBaseZ + 1.0) - vibration;
    }
  }
}
