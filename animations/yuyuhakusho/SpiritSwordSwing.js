import { AnimationBase } from 'dula-engine';

/**
 * SpiritSwordSwing — 霊剣斬り（战斗轴线版）
 * Kuwabara swinging the Spirit Sword
 * 沿战斗轴线挥斩，不覆盖角色朝向
 * Duration: 0.7s
 */
export class SpiritSwordSwing extends AnimationBase {
  constructor() {
    super('SpiritSwordSwing', 0.7);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    const dir = character.userData?.facingDir || 1;

    // Reset at t=0 - start from drawn position
    if (t === 0) {
      rArm.rotation.z = rBaseZ - 1.1;
      rArm.rotation.x = rBaseX - 0.3;
      if (lArm) lArm.rotation.z = lBaseZ + 0.2;
      if (character.showSpiritSword) character.showSpiritSword();
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.0);
      if (character.setSpiritSwordLength) character.setSpiritSwordLength(1.0);
      return;
    }

    // Phase 1: Wind up (0-0.15) - quick pull back
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;
      rArm.rotation.z = (rBaseZ - 1.1) - ease * 0.5;
      rArm.rotation.x = (rBaseX - 0.3) - ease * 0.4;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.2) + ease * 0.3;
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.0 + ease * 0.5);
      // 微撤步蓄力
      character.mesh.position.x -= dir * ease * 0.05;
    }
    // Phase 2: SLASH! (0.15-0.4) - explosive horizontal slash
    else if (t < 0.4) {
      const p = (t - 0.15) / 0.25;
      const ease = 1 - Math.pow(1 - p, 2);
      rArm.rotation.z = (rBaseZ - 1.6) + ease * 2.2;
      rArm.rotation.x = (rBaseX - 0.7) + ease * 0.6;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.5) - ease * 0.4;
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.5);
      // 挥斩时微向前
      character.mesh.position.x += dir * ease * 0.15;
    }
    // Phase 3: Follow through (0.4-0.6)
    else if (t < 0.6) {
      const p = (t - 0.4) / 0.2;
      const ease = 1 - Math.pow(1 - p, 3);
      rArm.rotation.z = (rBaseZ + 0.6) + ease * 0.2;
      rArm.rotation.x = (rBaseX - 0.1) + ease * 0.2;
      if (lArm) lArm.rotation.z = (lBaseZ + 0.1) - ease * 0.1;
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(1.2 - ease * 0.4);
    }
    // Phase 4: Recover (0.6-1.0) - return to fighting stance
    else {
      const p = (t - 0.6) / 0.4;
      const ease = p * p;
      // Fighting stance: right arm back guard, left forward
      rArm.rotation.z = (rBaseZ + 0.8) - ease * 1.7;
      rArm.rotation.x = (rBaseX + 0.1) - ease * 0.8;
      if (lArm) lArm.rotation.z = lBaseZ + ease * 0.5;
      if (character.setSpiritSwordGlow) character.setSpiritSwordGlow(0.8 - ease * 0.8);
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.06;
      }
      // 回到原位
      character.mesh.position.x -= dir * (1 - ease) * 0.1;
    }
  }
}
