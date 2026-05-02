import { AnimationBase } from 'dula-engine';

/**
 * DrawSword — 拔剑动作
 * She-Ra 将力量之剑从腰间拔出，举向天空
 */
export class DrawSword extends AnimationBase {
  constructor() {
    super('DrawSword', 1.5);
  }

  update(t, character) {
    const rArm = character.rightArm;
    if (!rArm) return;

    const baseZ = character.rightArmBaseZ || rArm.rotation.z;

    // Phase 1: Draw (0-0.4) — arm moves from side to front
    // Phase 2: Raise (0.4-0.7) — arm raises sword up
    // Phase 3: Hold (0.7-1.0) — hold pose with slight vibration

    if (t < 0.4) {
      const p = t / 0.4;
      rArm.rotation.z = baseZ - p * 1.2;
      rArm.rotation.x = -p * 0.8;
    } else if (t < 0.7) {
      const p = (t - 0.4) / 0.3;
      rArm.rotation.z = baseZ - 1.2 - p * 0.3;
      rArm.rotation.x = -0.8 - p * 1.5;
    } else {
      const p = (t - 0.7) / 0.3;
      rArm.rotation.z = baseZ - 1.5 + Math.sin(p * Math.PI * 2) * 0.05;
      rArm.rotation.x = -2.3 + Math.sin(p * Math.PI * 3) * 0.03;
    }

    // Ensure sword is visible
    if (character.attachSword) character.attachSword();
  }
}
