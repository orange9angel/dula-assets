import { AnimationBase } from 'dula-engine';

/**
 * UltraBeam — 斯派修姆光线发射
 * 双臂交叉成十字，发射致命光线
 * 适配新Ultraman比例
 */
export class UltraBeam extends AnimationBase {
  constructor() {
    super('UltraBeam', 2.5);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || 0;
    const lBaseZ = character.leftArmBaseZ || 0;

    // Phase 1: Raise arms (0-0.3)
    if (t < 0.3) {
      const p = t / 0.3;
      rArm.rotation.z = rBaseZ - p * 1.4;
      rArm.rotation.x = -p * 0.3;
      lArm.rotation.z = lBaseZ + p * 1.4;
      lArm.rotation.x = -p * 0.3;
    }
    // Phase 2: Cross arms (0.3-0.5)
    else if (t < 0.5) {
      const p = (t - 0.3) / 0.2;
      rArm.rotation.z = rBaseZ - 1.4 + p * 0.2;
      rArm.rotation.x = -0.3;
      lArm.rotation.z = lBaseZ + 1.4 - p * 0.2;
      lArm.rotation.x = -0.3;
      // Slight body turn
      character.mesh.rotation.y = p * 0.1;
    }
    // Phase 3: Hold beam pose + glow (0.5-0.9)
    else if (t < 0.9) {
      const p = (t - 0.5) / 0.4;
      rArm.rotation.z = rBaseZ - 1.2;
      lArm.rotation.z = lBaseZ + 1.2;
      // Body glow intensifies
      if (character.bodyGlow) {
        character.bodyGlow.material.opacity = 0.1 + p * 0.25;
        character.bodyGlow.scale.setScalar(1 + p * 0.5);
      }
      // Timer flashes rapidly
      if (character.timerGlow) {
        character.timerGlow.material.opacity = 0.3 + Math.sin(p * Math.PI * 12) * 0.25;
      }
    }
    // Phase 4: Release / relax (0.9-1.0)
    else {
      const p = (t - 0.9) / 0.1;
      rArm.rotation.z = rBaseZ - 1.2 + p * 1.2;
      lArm.rotation.z = lBaseZ + 1.2 - p * 1.2;
      if (character.bodyGlow) {
        character.bodyGlow.material.opacity = 0.35 - p * 0.3;
        character.bodyGlow.scale.setScalar(1.5 - p * 0.5);
      }
    }
  }
}
