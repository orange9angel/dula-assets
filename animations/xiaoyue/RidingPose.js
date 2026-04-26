import { AnimationBase } from 'dula-engine';

/**
 * RidingPose — Xiaoyue riding on Xingzai's back while flying
 * Arms wrapped around, legs tucked, excited expression
 */
export class RidingPose extends AnimationBase {
  constructor() {
    super('RidingPose', 2.0);
  }

  update(t, character) {
    const lArm = character.leftArm;
    const rArm = character.rightArm;
    const lLeg = character.leftLeg;
    const rLeg = character.rightLeg;
    if (!lArm || !rArm) return;

    // Body: lean forward with Xingzai
    if (character.mesh) {
      character.mesh.rotation.x = 0.7 + Math.sin(t * Math.PI * 2) * 0.03;
    }

    // Arms: wrapped around Xingzai's neck/body
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;
    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    lArm.rotation.z = lBaseZ + 1.3;
    lArm.rotation.x = -0.4;
    rArm.rotation.z = rBaseZ - 1.3;
    rArm.rotation.x = -0.4;

    // Legs: tucked back, dangling in wind
    if (lLeg) lLeg.rotation.x = 0.5 + Math.sin(t * Math.PI * 3) * 0.08;
    if (rLeg) rLeg.rotation.x = 0.4 + Math.sin(t * Math.PI * 3 + 0.3) * 0.08;

    // Head: looking forward with excitement
    if (character.headGroup) {
      character.headGroup.rotation.x = -0.3 + Math.sin(t * Math.PI * 2) * 0.05;
    }
  }
}
