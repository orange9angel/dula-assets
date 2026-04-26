import { AnimationBase } from 'dula-engine';

/**
 * TandemFlight — 星仔带小月双人飞行
 * Xingzai uses jet pack, Xiaoyue rides on his back
 * Both characters move together through the starry sky
 */
export class TandemFlight extends AnimationBase {
  constructor() {
    super('TandemFlight', 3.0);
  }

  update(t, character) {
    // This animation is applied to Xingzai, but affects both characters
    // The Storyboard should position Xiaoyue relative to Xingzai

    const lArm = character.leftArm;
    const rArm = character.rightArm;
    const lLeg = character.leftLeg;
    const rLeg = character.rightLeg;
    if (!lArm || !rArm) return;

    // Xingzai: streamlined jet pilot pose
    if (character.mesh) {
      // Lean forward 50 degrees
      character.mesh.rotation.x = 0.9 + Math.sin(t * Math.PI * 2) * 0.04;
      // Flying height with gentle bob
      character.mesh.position.y = character.baseY + Math.sin(t * Math.PI * 2.5) * 0.1;
    }

    // Arms: swept WAY back (holding Xiaoyue's legs)
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;
    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    lArm.rotation.z = lBaseZ + 2.8;
    lArm.rotation.x = -0.3;
    rArm.rotation.z = rBaseZ - 2.8;
    rArm.rotation.x = -0.3;

    // Legs: straight back like a torpedo
    if (lLeg) lLeg.rotation.x = 0.7 + Math.sin(t * Math.PI * 3) * 0.05;
    if (rLeg) rLeg.rotation.x = 0.65 + Math.sin(t * Math.PI * 3 + 0.2) * 0.05;

    // Head: looking forward, slightly down
    if (character.headGroup) {
      character.headGroup.rotation.x = -0.4 + Math.sin(t * Math.PI * 2) * 0.02;
    }

    // Jet pack: full power
    if (character.jetPack) {
      character.attachJetPack();
      character.setJetPackFlames?.(true);
    }

    // Hide takeCopter
    if (character.takeCopter) {
      character.detachTakeCopter();
    }
  }
}
