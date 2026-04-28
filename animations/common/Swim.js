import { AnimationBase } from 'dula-engine';

export class Swim extends AnimationBase {
  constructor() {
    super('Swim', 1.0);
  }

  update(t, character) {
    // Crawl stroke - arms reach high out of water then pull
    const cycle = t * Math.PI * 2;
    
    if (character.rightArm) {
      const baseZ = character.rightArmBaseZ || character.rightArm.rotation.z;
      // Arm reaches forward/up out of water, then pulls back under
      character.rightArm.rotation.z = baseZ + Math.sin(cycle) * 0.7;
      character.rightArm.rotation.x = Math.cos(cycle) * 0.8 - 0.2;
    }
    if (character.leftArm) {
      const baseZ = character.leftArmBaseZ || character.leftArm.rotation.z;
      // Opposite phase
      character.leftArm.rotation.z = baseZ + Math.sin(cycle + Math.PI) * 0.7;
      character.leftArm.rotation.x = Math.cos(cycle + Math.PI) * 0.8 - 0.2;
    }

    // Body bobs with breathing
    character.mesh.position.y = (character.baseY || 0) + Math.sin(cycle * 2) * 0.05;

    // Slight body roll
    character.mesh.rotation.z = Math.sin(cycle) * 0.06;
  }
}
