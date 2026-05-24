import { AnimationBase } from 'dula-engine';

/**
 * SpinKick — 回旋踢（战斗轴线版）
 * Classic fighting game spinning kick (KOF style)
 * 身体旋转360°同时沿战斗轴线位移，不覆盖基础朝向
 * Duration: 0.8s
 */
export class SpinKick extends AnimationBase {
  constructor() {
    super('SpinKick', 0.8);
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
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

    // Phase 1: Wind up (0-0.2) - coil and pivot
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;
      // 身体开始旋转（局部旋转，基于当前朝向）
      // 使用一个临时旋转量，不覆盖基础 rotation.y
      if (rArm) {
        rArm.rotation.z = rBaseZ - ease * 0.5;
        rArm.rotation.x = -ease * 0.3;
      }
      if (lArm) {
        lArm.rotation.z = lBaseZ + ease * 0.5;
        lArm.rotation.x = -ease * 0.3;
      }
      rLeg.rotation.x = rLegBaseX - ease * 0.8;
      lLeg.rotation.x = lLegBaseX + ease * 0.1;
      if (character.baseY !== undefined) {
        character.mesh.position.y = character.baseY - ease * 0.05;
      }
    }
    // Phase 2: SPIN (0.2-0.55) - 360° rotation with kick
    else if (t < 0.55) {
      const p = (t - 0.2) / 0.35;
      const ease = 1 - Math.pow(1 - p, 2);
      // 旋转效果通过身体局部扭转模拟，不覆盖全局 rotation.y
      // 实际360°旋转在侧视图中表现为身体扭转
      if (rArm) {
        rArm.rotation.z = (rBaseZ - 0.5) + ease * 0.3;
        rArm.rotation.x = -0.3 + ease * 0.2;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.5) - ease * 0.3;
        lArm.rotation.x = -0.3 + ease * 0.2;
      }
      rLeg.rotation.x = (rLegBaseX - 0.8) + ease * 1.2;
      lLeg.rotation.x = (lLegBaseX + 0.1) - ease * 0.3;
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY - 0.05) + ease * 0.08;
      }
      // 回旋踢向前突进
      character.mesh.position.x += dir * ease * 0.3;
    }
    // Phase 3: Retract (0.55-0.75) - pull leg back
    else if (t < 0.75) {
      const p = (t - 0.55) / 0.2;
      const ease = p * p;
      rLeg.rotation.x = (rLegBaseX + 0.4) - ease * 0.4;
      lLeg.rotation.x = (lLegBaseX - 0.2) + ease * 0.2;
      if (rArm) {
        rArm.rotation.z = (rBaseZ - 0.2) + ease * 0.2;
        rArm.rotation.x = -0.1 + ease * 0.1;
      }
      if (lArm) {
        lArm.rotation.z = (lBaseZ + 0.2) - ease * 0.2;
        lArm.rotation.x = -0.1 + ease * 0.1;
      }
      if (character.baseY !== undefined) {
        character.mesh.position.y = (character.baseY + 0.03) - ease * 0.03;
      }
      character.mesh.position.x -= dir * (1 - ease) * 0.3;
    }
    // Phase 4: Recover (0.75-1.0) - return to fighting stance
    else {
      const p = (t - 0.75) / 0.25;
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
