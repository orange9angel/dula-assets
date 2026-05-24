import { AnimationBase } from 'dula-engine';

/**
 * DashForward — 前冲（战斗轴线版）
 * Aggressive forward lunge (KOF style dash-in)
 * 沿战斗轴线（X轴）突进，不覆盖角色朝向
 * Duration: 0.4s
 */
export class DashForward extends AnimationBase {
  constructor() {
    super('DashForward', 0.4);
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'slow', 'floating'],
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

    const dir = character.userData?.facingDir || 1;

    // Phase 1: Wind up (0-0.15) - coil back
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;
      // 微向后撤蓄力
      character.mesh.position.x -= dir * ease * 0.1;
      // Arms tuck
      rArm.rotation.z = rBaseZ - ease * 0.4;
      lArm.rotation.z = lBaseZ + ease * 0.4;
      // Legs coil
      if (rLeg) rLeg.rotation.x = ease * 0.3;
      if (lLeg) lLeg.rotation.x = -ease * 0.2;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.05;
      }
    }
    // Phase 2: DASH! (0.15-0.3) - explosive forward
    else if (t < 0.3) {
      const p = (t - 0.15) / 0.15;
      const ease = 1 - Math.pow(1 - p, 2);
      // 沿战斗轴线突进
      character.mesh.position.x += dir * ease * 0.6;
      // Arms trail behind
      rArm.rotation.z = (rBaseZ - 0.4) - ease * 0.3;
      rArm.rotation.x = -ease * 0.6;
      lArm.rotation.z = (lBaseZ + 0.4) + ease * 0.3;
      lArm.rotation.x = -ease * 0.6;
      // Legs in running pose
      if (rLeg) rLeg.rotation.x = 0.3 - ease * 0.8;
      if (lLeg) lLeg.rotation.x = -0.2 + ease * 0.6;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.05) + ease * 0.02;
      }
    }
    // Phase 3: Brake (0.3-1.0) - skid to fighting stance
    else {
      const p = (t - 0.3) / 0.7;
      const ease = p * p;
      // 保持在突进后的位置
      // End in fighting stance: right back, left forward
      rArm.rotation.z = (rBaseZ - 0.7) - ease * 0.2;
      rArm.rotation.x = -0.6 + ease * 0.1;
      lArm.rotation.z = (lBaseZ + 0.7) - ease * 0.2;
      lArm.rotation.x = -0.6 + ease * 0.6;
      if (rLeg) rLeg.rotation.x = -0.5 + ease * 0.5;
      if (lLeg) lLeg.rotation.x = 0.4 - ease * 0.4;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.03) - ease * 0.03;
      }
    }
  }
}
