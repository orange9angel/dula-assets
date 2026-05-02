import { AnimationBase } from 'dula-engine';

/**
 * SwordSlash — 挥剑斩击
 * She-Ra 挥舞力量之剑，一道有力的斩击弧线
 */
export class SwordSlash extends AnimationBase {
  constructor() {
    super('SwordSlash', 1.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    if (!rArm) return;

    const baseZ = character.rightArmBaseZ || rArm.rotation.z;

    // Wind up (0-0.3) → Slash (0.3-0.6) → Recovery (0.6-1.0)
    if (t < 0.3) {
      const p = t / 0.3;
      rArm.rotation.z = baseZ - 0.3 - p * 1.0;
      rArm.rotation.x = -0.2 - p * 0.5;
    } else if (t < 0.6) {
      const p = (t - 0.3) / 0.3;
      // Fast slash across
      rArm.rotation.z = baseZ - 1.3 + p * 2.0;
      rArm.rotation.x = -0.7 + p * 0.3;
      // Body twist with slash
      character.mesh.rotation.y = -0.3 + p * 0.6;
    } else {
      const p = (t - 0.6) / 0.4;
      rArm.rotation.z = baseZ + 0.7 - p * 0.5;
      rArm.rotation.x = -0.4 - p * 0.2;
      character.mesh.rotation.y = 0.3 - p * 0.3;
    }

    if (character.attachSword) character.attachSword();
  }
}
