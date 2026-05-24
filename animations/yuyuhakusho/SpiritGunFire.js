import { AnimationBase } from 'dula-engine';

/**
 * SpiritGunFire — 霊丸発射（战斗轴线版）
 * Firing the Spirit Gun
 * 沿战斗轴线发射，不覆盖角色朝向
 * Duration: 0.6s
 */
export class SpiritGunFire extends AnimationBase {
  constructor() {
    super('SpiritGunFire', 0.6);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const head = character.headGroup;
    if (!rArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const rBaseX = character.rightArmBaseX || 0;

    const dir = character.userData?.facingDir || 1;

    // Reset at t=0 - start from charged position
    if (t === 0) {
      rArm.rotation.z = rBaseZ - 1.3;
      rArm.rotation.x = rBaseX - 0.2;
      if (head) head.rotation.y = -0.15;
      if (character.showSpiritGunOrb) character.showSpiritGunOrb();
      if (character.setSpiritGunIntensity) character.setSpiritGunIntensity(1.0);
      if (character.hideSpiritGunBeam) character.hideSpiritGunBeam();
      if (character.setSpiritGunBeamExtend) character.setSpiritGunBeamExtend(0);
      return;
    }

    // Phase 1: Thrust forward (0-0.1) - arm snaps forward FAST
    if (t < 0.1) {
      const p = t / 0.1;
      const ease = p * p;
      rArm.rotation.z = (rBaseZ - 1.3) + ease * 0.5;
      rArm.rotation.x = (rBaseX - 0.2) - ease * 1.3;
      if (character.setSpiritGunIntensity) character.setSpiritGunIntensity(1.0);
      // 发射时微后坐
      character.mesh.position.x -= dir * ease * 0.05;
    }
    // Phase 2: FIRE! - hide orb, show beam shooting out (0.1-0.25)
    else if (t < 0.25) {
      const p = (t - 0.1) / 0.15;
      const ease = 1 - Math.pow(1 - p, 2);
      rArm.rotation.z = rBaseZ - 0.8;
      rArm.rotation.x = rBaseX - 1.5 + p * 0.3;
      if (character.hideSpiritGunOrb) character.hideSpiritGunOrb();
      if (character.showSpiritGunBeam) character.showSpiritGunBeam();
      if (character.setSpiritGunBeamExtend) character.setSpiritGunBeamExtend(ease);
    }
    // Phase 3: Beam sustained at full length (0.25-0.4)
    else if (t < 0.4) {
      const p = (t - 0.25) / 0.15;
      rArm.rotation.z = rBaseZ - 0.8 + p * 0.2;
      rArm.rotation.x = rBaseX - 1.2 + p * 0.3;
      if (character.showSpiritGunBeam) character.showSpiritGunBeam();
      if (character.setSpiritGunBeamExtend) character.setSpiritGunBeamExtend(1.0);
    }
    // Phase 4: Recoil + beam retracts (0.4-0.5)
    else if (t < 0.5) {
      const p = (t - 0.4) / 0.1;
      const easeRecoil = 1 - Math.pow(1 - p, 2);
      rArm.rotation.z = rBaseZ - 0.6 + easeRecoil * 0.2;
      rArm.rotation.x = rBaseX - 0.9 + easeRecoil * 0.5;
      if (character.showSpiritGunBeam) character.showSpiritGunBeam();
      if (character.setSpiritGunBeamExtend) character.setSpiritGunBeamExtend(1.0 - easeRecoil);
    }
    // Phase 5: Recover (0.5-1.0) - return to fighting stance
    else {
      const p = (t - 0.5) / 0.5;
      const easeRecover = p * p;
      // Fighting stance: right arm back guard, left forward
      rArm.rotation.z = (rBaseZ - 0.4) - easeRecover * 0.5;
      rArm.rotation.x = (rBaseX - 0.4) - easeRecover * 0.3;
      if (character.hideSpiritGunBeam) character.hideSpiritGunBeam();
      if (character.setSpiritGunBeamExtend) character.setSpiritGunBeamExtend(0);
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - easeRecover * 0.06;
      }
      // 后坐恢复
      character.mesh.position.x += dir * (1 - easeRecover) * 0.05;
    }

    // Head follows the action
    if (head) {
      head.rotation.y = -0.15;
    }
  }
}
