import { AnimationBase } from 'dula-engine';

export class ShadowSpell extends AnimationBase {
  constructor() {
    super('ShadowSpell', 2.4);
  }

  update(t, character) {
    if (character.attachStaff) {
      character.attachStaff();
    } else if (character.staffGroup) {
      character.staffGroup.visible = true;
    }

    const easeInOut = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const hold = t < 0.82 ? 1 : Math.max(0, 1 - (t - 0.82) / 0.18);
    const cast = easeInOut * hold;
    const pulse = 0.65 + Math.sin(t * Math.PI * 8) * 0.35;

    if (character.rightArm) {
      const baseZ = character.rightArmBaseZ || character.rightArm.rotation.z;
      character.rightArm.rotation.x = -1.1 * cast;
      character.rightArm.rotation.z = baseZ + 0.75 * cast;
    }

    if (character.leftArm) {
      const baseZ = character.leftArmBaseZ || character.leftArm.rotation.z;
      character.leftArm.rotation.x = -0.8 * cast;
      character.leftArm.rotation.z = baseZ - 0.55 * cast;
    }

    if (character.headGroup) {
      character.headGroup.rotation.x = -0.16 * cast;
      character.headGroup.rotation.y = Math.sin(t * Math.PI * 2) * 0.12 * cast;
    }

    if (character.amuletGlow?.material) {
      character.amuletGlow.material.opacity = 0.18 + 0.24 * cast * pulse;
      character.amuletGlow.scale.setScalar(1 + 0.55 * cast * pulse);
    }

    if (character.orbGlow?.material) {
      character.orbGlow.material.opacity = 0.16 + 0.32 * cast * pulse;
      character.orbGlow.scale.setScalar(1 + 0.75 * cast * pulse);
    }

    if (character.orb?.material) {
      character.orb.material.opacity = 0.7 + 0.25 * cast * pulse;
    }

    if (character.magicParticles) {
      for (const particle of character.magicParticles) {
        particle.mesh.scale.setScalar(1 + cast * (0.9 + pulse * 0.5));
        if (particle.mesh.material) {
          particle.mesh.material.opacity = 0.45 + 0.45 * cast * pulse;
        }
      }
    }
  }
}
