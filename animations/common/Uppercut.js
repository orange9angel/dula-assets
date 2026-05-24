import { AnimationBase } from 'dula-engine';

/**
 * Uppercut — 上勾拳（战斗轴线版）
 * Classic fighting game uppercut (KOF / Street Fighter style)
 * 不覆盖角色朝向，位移沿战斗轴线
 * Duration: 0.7s
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

    const dir = character.userData?.facingDir || 1;

    // Phase 1: Dip (0-0.2) - crouch down, wind up
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;
      rArm.rotation.z = rBaseZ - ease * 0.5;
      rArm.rotation.x = rBaseX + ease * 0.8;
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.3;
        lArm.rotation.x = ease * 0.2;
      }
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.15;
      }
      // 微撤步蓄力
      character.mesh.position.x -= dir * ease * 0.05;
    }
    // Phase 2: EXPLODE UP (0.2-0.45) - uppercut launches
    else if (t < 0.45) {
      const p = (t - 0.2) / 0.25;
      const ease = 1 - Math.pow(1 - p, 3);
      rArm.rotation.z = (rBaseZ - 0.5) + ease * 1.8;
      rArm.rotation.x = (rBaseX + 0.8) - ease * 2.0;
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.3) - ease * 0.5;
        lArm.rotation.x = 0.2 - ease * 0.3;
      }
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.15) + ease * 0.25;
      }
      // 上勾拳微向前
      character.mesh.position.x += dir * ease * 0.1;
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
    }
    // Phase 4: Recover (0.6-1.0) - return to fighting stance
    else {
      const p = (t - 0.6) / 0.4;
      const ease = p * p;
      rArm.rotation.z = (rBaseZ + 1.3) - ease * 2.2;
      rArm.rotation.x = (rBaseX - 1.2) + ease * 0.5;
      if (lArm) {
        lArm.rotation.z = (lBaseZ - 0.2) + ease * 0.7;
        lArm.rotation.x = -0.1 + ease * 0.3;
      }
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY + 0.1) - ease * 0.16;
      }
      // 回到原位
      character.mesh.position.x -= dir * (1 - ease) * 0.05;
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
