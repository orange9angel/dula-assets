import { AnimationBase } from 'dula-engine';

/**
 * HeroLanding — 英雄登场落地
 * 从天而降，单膝跪地，缓缓站起
 * 适配新Ultraman比例（身高约6.5单位）
 */
export class HeroLanding extends AnimationBase {
  constructor() {
    super('HeroLanding', 2.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const rLeg = character.rightLeg;
    const lLeg = character.leftLeg;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Fall from sky (0-0.3)
    if (t < 0.3) {
      const p = t / 0.3;
      character.mesh.position.y = 20 - p * 14; // Start high, fall to 6
      // Arms spread for balance
      if (rArm) rArm.rotation.z = rBaseZ - 0.8 * (1 - p);
      if (lArm) lArm.rotation.z = lBaseZ + 0.8 * (1 - p);
      // Body glow intensifies during fall
      if (character.bodyGlow) {
        character.bodyGlow.material.opacity = 0.1 + p * 0.2;
      }
    }
    // Phase 2: Impact / kneel (0.3-0.5)
    else if (t < 0.5) {
      const p = (t - 0.3) / 0.2;
      character.mesh.position.y = 6 - p * 1.5; // Kneel down
      // Right knee down
      if (rLeg) rLeg.rotation.x = p * 1.5;
      // Left leg bent
      if (lLeg) lLeg.rotation.x = -p * 0.3;
      // Fist to ground
      if (rArm) {
        rArm.rotation.z = rBaseZ;
        rArm.rotation.x = -p * 1.5;
      }
      if (lArm) {
        lArm.rotation.z = lBaseZ;
        lArm.rotation.x = -p * 0.5;
      }
      // Head down
      if (character.headGroup) character.headGroup.rotation.x = p * 0.3;
      // Impact dust effect
      if (character.bodyGlow) {
        character.bodyGlow.material.opacity = 0.25 + p * 0.1;
      }
    }
    // Phase 3: Rise to hero pose (0.5-1.0)
    else {
      const p = (t - 0.5) / 0.5;
      character.mesh.position.y = 4.5 + p * 2.0; // Rise to standing
      // Stand up
      if (rLeg) rLeg.rotation.x = 1.5 * (1 - p);
      if (lLeg) lLeg.rotation.x = -0.3 * (1 - p);
      // Arms to sides then hero pose
      if (rArm) {
        rArm.rotation.x = -1.5 * (1 - p);
        rArm.rotation.z = rBaseZ - p * 0.3;
      }
      if (lArm) {
        lArm.rotation.x = -0.5 * (1 - p);
        lArm.rotation.z = lBaseZ + p * 0.3;
      }
      // Head rises
      if (character.headGroup) character.headGroup.rotation.x = 0.3 * (1 - p);
      // Glow settles
      if (character.bodyGlow) {
        character.bodyGlow.material.opacity = 0.08;
      }
    }
  }
}
