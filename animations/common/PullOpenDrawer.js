import { AnimationBase } from 'dula-engine';

/**
 * PullOpenDrawer — 角色伸手拉抽屉的动作
 * 身体前倾，手臂前伸，模拟抓住抽屉把手向外拉
 */
export class PullOpenDrawer extends AnimationBase {
  constructor() {
    super('PullOpenDrawer', 1.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const baseY = character.baseY || 0;

    // Phase 1: reach forward (0~0.3)
    // Phase 2: pull back (0.3~0.7)
    // Phase 3: return to neutral (0.7~1.0)

    let reach = 0;
    let pull = 0;
    let recover = 0;

    if (t < 0.3) {
      reach = t / 0.3;
    } else if (t < 0.7) {
      reach = 1;
      pull = (t - 0.3) / 0.4;
    } else {
      recover = (t - 0.7) / 0.3;
    }

    const reachEase = reach * (2 - reach); // easeOutQuad
    const pullEase = pull * (2 - pull);    // easeOutQuad
    const recoverEase = recover * recover;  // easeInQuad

    // Body leans forward then back
    character.mesh.rotation.x = reachEase * 0.25 - pullEase * 0.15 - recoverEase * 0.1;

    // Right arm reaches forward then pulls back
    if (rArm) {
      const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
      // Reach: arm extends forward (rotation.x negative = forward)
      const reachRot = -reachEase * 1.2;
      // Pull: arm bends back slightly
      const pullRot = pullEase * 0.3;
      // Recover
      const recoverRot = recoverEase * (rBaseZ - (-1.2 + 0.3));
      rArm.rotation.x = reachRot + pullRot + recoverRot;
      rArm.rotation.z = rBaseZ - reachEase * 0.3;
    }

    // Left arm mirrors (slightly less pronounced)
    if (lArm) {
      const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;
      const reachRot = -reachEase * 1.0;
      const pullRot = pullEase * 0.2;
      const recoverRot = recoverEase * (lBaseZ - (-1.0 + 0.2));
      lArm.rotation.x = reachRot + pullRot + recoverRot;
      lArm.rotation.z = lBaseZ + reachEase * 0.3;
    }

    // Slight body shift forward then back
    character.mesh.position.z = baseY === 0 ? baseY : baseY; // preserve baseY
    // Actually shift z forward during reach
    const zShift = reachEase * 0.15 - pullEase * 0.1 - recoverEase * 0.05;
    // We can't easily shift z without interfering with moves, so skip position change
  }
}
