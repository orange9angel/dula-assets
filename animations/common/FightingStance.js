import { AnimationBase } from 'dula-engine';

/**
 * FightingStance — 战斗待机姿态（战斗轴线版）
 * 通用格斗游戏起手式，作为攻击之间的衔接姿态
 * 双臂一前一后，身体微蹲，重心下沉
 * 不覆盖角色朝向
 * Duration: 0.5s (快速进入，可循环保持)
 */
export class FightingStance extends AnimationBase {
  constructor() {
    super('FightingStance', 0.5);
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
    const rLeg = character.rightLeg;
    const lLeg = character.leftLeg;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseZ = character.leftArmBaseZ || 0;
    const lBaseX = character.leftArmBaseX || 0;

    // Quick enter (0-0.3): snap to stance
    const p = t < 0.6 ? t / 0.6 : 1;
    const ease = 1 - Math.pow(1 - p, 2);

    // Right arm: fist up guarding face (rear guard)
    rArm.rotation.z = rBaseZ - ease * 0.15;
    rArm.rotation.x = rBaseX - ease * 1.3;

    // Left arm: fist up guarding face (lead guard)
    lArm.rotation.z = lBaseZ + ease * 0.1;
    lArm.rotation.x = lBaseX - ease * 1.2;

    // Slight crouch - stable base
    if (character.baseY !== undefined) {
      character.mesh.position.y = character.baseY - ease * 0.06;
    }

    // 不覆盖 rotation.y，保持侧向对敌
    // 身体角度由初始化时的 setupBattleLine 决定

    // Slight forward lean
    character.mesh.rotation.x = ease * 0.08;

    // Legs: slight bend for readiness
    if (rLeg) rLeg.rotation.x = ease * 0.25;
    if (lLeg) lLeg.rotation.x = ease * 0.2;

    // Hold phase: subtle breathing motion
    if (t >= 0.6) {
      const breath = Math.sin((t - 0.6) * Math.PI * 3) * 0.015;
      character.mesh.position.y = (character.baseY - 0.06) + breath;
      rArm.rotation.z = (rBaseZ - 0.9) + breath * 0.5;
      lArm.rotation.z = (lBaseZ + 0.5) - breath * 0.5;
    }
  }
}
