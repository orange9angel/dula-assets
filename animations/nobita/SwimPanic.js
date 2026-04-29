import { AnimationBase } from 'dula-engine';

/**
 * SwimPanic — 恐慌游泳（基于 crawl stroke 加速版）
 * 头保持在水面上，手臂疯狂划水，身体剧烈起伏
 */
export class SwimPanic extends AnimationBase {
  constructor() {
    super('SwimPanic', 1.0);
  }

  update(t, character) {
    const cycle = t * Math.PI * 3; // 比正常 Swim 快 1.5 倍

    // Crawl stroke — 手臂疯狂交替
    if (character.rightArm) {
      const baseZ = character.rightArmBaseZ || character.rightArm.rotation.z;
      character.rightArm.rotation.z = baseZ + Math.sin(cycle) * 0.9;
      character.rightArm.rotation.x = Math.cos(cycle) * 1.0 - 0.3;
    }
    if (character.leftArm) {
      const baseZ = character.leftArmBaseZ || character.leftArm.rotation.z;
      character.leftArm.rotation.z = baseZ + Math.sin(cycle + Math.PI) * 0.9;
      character.leftArm.rotation.x = Math.cos(cycle + Math.PI) * 1.0 - 0.3;
    }

    // 身体剧烈上下颠簸（喘气/惊慌）
    const baseY = character.baseY || 0;
    character.mesh.position.y = baseY + Math.sin(cycle * 2) * 0.08;

    // 身体大幅滚动
    character.mesh.rotation.z = Math.sin(cycle) * 0.12;

    // 头部慌乱左右张望
    if (character.headGroup) {
      character.headGroup.rotation.y = Math.sin(t * Math.PI * 5) * 0.2;
      // 头尽量抬高保持在水面上
      character.headGroup.rotation.x = -0.15 + Math.sin(cycle * 2) * 0.05;
    }
  }
}
