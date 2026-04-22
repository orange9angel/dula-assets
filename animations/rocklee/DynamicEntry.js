import { AnimationBase } from 'dula-engine';

/**
 * DynamicEntry —— 李洛克招牌体术「木叶旋风/表莲华」起手势
 * 快速冲刺姿态，双臂后摆，身体前倾，充满爆发力
 */
export class DynamicEntry extends AnimationBase {
  constructor() {
    super('DynamicEntry', 0.8);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const leftLeg = character.leftLeg;
    const rightLeg = character.rightLeg;
    if (!rArm || !lArm || !leftLeg || !rightLeg) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;
    const baseY = character.baseY || 0;

    // Ease in for explosive start
    let p = t < 0.3 ? t / 0.3 : 1;
    p = p * (2 - p); // easeOutQuad

    // Body lean forward (running stance)
    character.mesh.rotation.x = 0.35 * p;

    // Arms swept back like a sprinter
    rArm.rotation.x = -0.8 * p;
    rArm.rotation.z = rBaseZ + 0.4 * p;
    lArm.rotation.x = -0.6 * p;
    lArm.rotation.z = lBaseZ - 0.3 * p;

    // Legs in running pose
    leftLeg.rotation.x = 0.4 * p;
    rightLeg.rotation.x = -0.3 * p;

    // Slight bounce
    character.mesh.position.y = baseY + Math.abs(Math.sin(t * Math.PI * 6)) * 0.04 * p;

    // Head stays level
    if (character.headGroup) {
      character.headGroup.rotation.x = -0.25 * p;
    }
  }
}
