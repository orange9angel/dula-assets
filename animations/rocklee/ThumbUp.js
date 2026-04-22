import { AnimationBase } from 'dula-engine';

/**
 * ThumbUp —— 李洛克经典竖起大拇指，露出闪亮笑容
 * 热血、自信、充满青春气息
 */
export class ThumbUp extends AnimationBase {
  constructor() {
    super('ThumbUp', 1.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;
    const baseY = character.baseY || 0;

    // Ease out
    const p = t * (2 - t);

    // Right arm: thumb up pose
    rArm.rotation.x = -1.2 * p;
    rArm.rotation.z = rBaseZ - 0.3 * p;

    // Left arm: on hip
    lArm.rotation.x = -0.3 * p;
    lArm.rotation.z = lBaseZ + 0.5 * p;

    // Confident stance
    character.mesh.position.y = baseY + Math.abs(Math.sin(t * Math.PI * 3)) * 0.03;

    // Head tilt (youthful energy)
    if (character.headGroup) {
      character.headGroup.rotation.y = Math.sin(t * Math.PI * 2) * 0.08;
      character.headGroup.rotation.x = -0.1 * p;
    }
  }
}
