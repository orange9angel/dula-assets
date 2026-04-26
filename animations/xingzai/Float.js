import { AnimationBase } from 'dula-engine';

/**
 * XingzaiFloat — 星仔喷气背包飞行姿态
 * 身体前倾流线型，手臂后摆像超人，腿部收起
 * 喷气背包喷出蓝色火焰，整体像星际快递员高速飞行
 */
export class XingzaiFloat extends AnimationBase {
  constructor() {
    super('XingzaiFloat', 2.0);
  }

  update(t, character) {
    const lArm = character.leftArm;
    const rArm = character.rightArm;
    const lLeg = character.leftLeg;
    const rLeg = character.rightLeg;
    if (!lArm || !rArm) return;

    // Body: lean forward aggressively (streamlined flying pose)
    if (character.mesh) {
      // Lean forward 45 degrees
      character.mesh.rotation.x = 0.8 + Math.sin(t * Math.PI * 2) * 0.05;
      // Bobbing while flying
      character.mesh.position.y = character.baseY + Math.sin(t * Math.PI * 3) * 0.08;
    }

    // Arms: swept back like a superhero / jet pilot
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;
    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    // Arms point backward, slightly spread
    lArm.rotation.z = lBaseZ + 2.5 + Math.sin(t * Math.PI * 2) * 0.1;
    lArm.rotation.x = -0.2;
    rArm.rotation.z = rBaseZ - 2.5 - Math.sin(t * Math.PI * 2) * 0.1;
    rArm.rotation.x = -0.2;

    // Legs: tucked back like swimming / flying
    if (lLeg) {
      lLeg.rotation.x = 0.6 + Math.sin(t * Math.PI * 2.5) * 0.1;
    }
    if (rLeg) {
      rLeg.rotation.x = 0.5 + Math.sin(t * Math.PI * 2.5 + 0.3) * 0.1;
    }

    // Head: looks forward and slightly up
    if (character.headGroup) {
      character.headGroup.rotation.x = -0.5 + Math.sin(t * Math.PI * 2) * 0.03;
    }

    // Jet pack: visible and glowing
    if (character.jetPack) {
      character.attachJetPack();
    }

    // TakeCopter: hidden (we use jet pack now)
    if (character.takeCopter) {
      character.detachTakeCopter();
    }
  }
}
