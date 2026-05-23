import { AnimationBase } from 'dula-engine';

/**
 * FlyAway — 飞向宇宙
 * 双臂前伸，身体前倾，缓缓升空
 * 适配新Ultraman比例
 */
export class FlyAway extends AnimationBase {
  constructor() {
    super('FlyAway', 3.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Prepare (0-0.2)
    if (t < 0.2) {
      const p = t / 0.2;
      rArm.rotation.z = rBaseZ - p * 0.3;
      lArm.rotation.z = lBaseZ + p * 0.3;
    }
    // Phase 2: Arms forward + lean (0.2-0.5)
    else if (t < 0.5) {
      const p = (t - 0.2) / 0.3;
      rArm.rotation.z = rBaseZ - 0.3 - p * 0.5;
      rArm.rotation.x = -p * 1.8;
      lArm.rotation.z = lBaseZ + 0.3 + p * 0.5;
      lArm.rotation.x = -p * 1.8;
      // Body leans forward
      character.mesh.rotation.x = p * 0.8;
    }
    // Phase 3: Ascend (0.5-1.0)
    else {
      const p = (t - 0.5) / 0.5;
      rArm.rotation.x = -1.8;
      lArm.rotation.x = -1.8;
      character.mesh.rotation.x = 0.8;
      // Rise up into sky
      const baseY = character.baseY !== undefined ? character.baseY : 0;
      character.mesh.position.y = baseY + p * 30;
      // Glow intensifies
      if (character.bodyGlow) {
        character.bodyGlow.material.opacity = 0.08 + p * 0.3;
        character.bodyGlow.scale.setScalar(1 + p * 1.0);
      }
    }
  }
}
