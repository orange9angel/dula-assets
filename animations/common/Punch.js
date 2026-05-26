import { AnimationBase } from 'dula-engine';

/**
 * Punch — 直拳（战斗轴线版）
 * Classic fighting game straight punch (KOF style)
 * 沿战斗轴线（X轴）出拳，不覆盖角色朝向
 * Duration: 0.5s
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

    // 获取面向方向：1=向右（攻击右侧对手），-1=向左（攻击左侧对手）
    const dir = character.userData?.facingDir || 1;

    // Phase 1: Wind up (0-0.15) - pull right arm back, left arm guards
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;
      rArm.rotation.z = rBaseZ - ease * 0.9;
      rArm.rotation.x = rBaseX - ease * 0.6;
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.5;
        lArm.rotation.x = -ease * 0.3;
      }
      // 身体扭转蓄力（绕Y轴局部旋转，不覆盖全局朝向）
      // 使用 mesh.rotation.y 的偏移量，但基于初始朝向
      // 注意：这里不修改 rotation.y，只通过局部旋转模拟
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
    }
    // Phase 2: PUNCH! (0.15-0.35) - explosive forward thrust
    else if (t < 0.35) {
      const p = (t - 0.15) / 0.2;
      const ease = 1 - Math.pow(1 - p, 3);
      rArm.rotation.z = (rBaseZ - 0.9) + ease * 1.5;
      rArm.rotation.x = (rBaseX - 0.6) - ease * 1.4;
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.5) - ease * 0.2;
        lArm.rotation.x = -0.3 + ease * 0.1;
      }
      // 沿战斗轴线（X轴）突进
      character.mesh.position.x += dir * ease * 0.35;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - 0.06 + ease * 0.06;
      }
    }
    // Phase 3: Recovery (0.35-1.0) - recover to fighting stance
    else {
      const p = (t - 0.35) / 0.65;
      const ease = p * p;
      // Fighting stance: right arm back guard, left forward
      rArm.rotation.z = (rBaseZ + 0.6) - ease * 1.5;
      rArm.rotation.x = (rBaseX - 2.0) + ease * 1.3;
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.3) - ease * 0.2;
        lArm.rotation.x = -0.2 + ease * 0.2;
      }
      // 回到原位
      character.mesh.position.x -= dir * (1 - ease) * 0.35;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
    }

    // Head tracks the punch direction — lean into the punch
    if (head) {
      if (t < 0.15) {
        // Wind up: head pulls back slightly
        head.rotation.y = -dir * 0.05;
        head.rotation.x = 0.02;
      } else if (t < 0.35) {
        // Punch: head leans forward to track target
        const p = (t - 0.15) / 0.2;
        head.rotation.y = dir * 0.08 * p;
        head.rotation.x = 0.05 + 0.05 * p;
      } else {
        // Recovery: return to neutral
        const p = (t - 0.35) / 0.65;
        head.rotation.y = dir * 0.08 * (1 - p);
        head.rotation.x = 0.1 * (1 - p);
      }
    }
  }
}
