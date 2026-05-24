import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXChargeGlow — 蓄力光芒
 * Energy gathering at hands / body before a special move (KOF charge / DBZ style)
 * Bright light that intensifies, with particles being sucked inward
 * Duration: 1.5s (matches typical charge animation)
 *
 * Tags:
 *   requires: [mesh, rightArm]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Use with SpiritGunCharge, Uppercut windup, or any power-up
 */
export class FXChargeGlow extends AnimationBase {
  constructor() {
    super('FXChargeGlow', 1.5);
    this.tags = {
      requires: ['mesh', 'rightArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    const rArm = character.rightArm;
    if (!mesh || !rArm) return;

    let fxGroup = character.effectGroups?.chargeGlow;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'chargeGlow';

      // Central glow orb
      const orbMat = new THREE.MeshBasicMaterial({
        color: 0xaaddff, transparent: true, opacity: 0.5, depthWrite: false,
      });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), orbMat);
      fxGroup.add(orb);
      fxGroup.userData.orb = orb;

      // Outer glow
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x4488ff, transparent: true, opacity: 0.2, depthWrite: false,
      });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), glowMat);
      fxGroup.add(glow);
      fxGroup.userData.glow = glow;

      // Suction particles (small dots swirling inward)
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false,
      });
      const particles = [];
      for (let i = 0; i < 10; i++) {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.012, 4, 4),
          particleMat.clone()
        );
        const angle = (i / 10) * Math.PI * 2;
        p.userData.angle = angle;
        p.userData.radius = 0.4 + Math.random() * 0.3;
        p.userData.speed = 1.5 + Math.random() * 2;
        fxGroup.add(p);
        particles.push(p);
      }
      fxGroup.userData.particles = particles;

      // Attach to right hand
      fxGroup.position.set(0, -0.5, 0);
      rArm.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.chargeGlow = fxGroup;
    }

    fxGroup.visible = true;
    const orb = fxGroup.userData.orb;
    const glow = fxGroup.userData.glow;
    const particles = fxGroup.userData.particles;

    // Intensity builds up
    const intensity = t < 0.3 ? t / 0.3 : 1;
    const pulse = 0.85 + Math.sin(t * Math.PI * 6) * 0.15;

    // Orb brightens and grows
    orb.scale.setScalar(pulse * (1 + intensity * 0.5));
    orb.material.opacity = 0.5 * intensity + Math.sin(t * Math.PI * 8) * 0.1;

    // Glow expands
    glow.scale.setScalar(1 + intensity * pulse);
    glow.material.opacity = 0.2 * intensity;

    // Particles spiral inward
    for (const p of particles) {
      const spiralT = (t * p.userData.speed + p.userData.angle) % 1;
      const r = p.userData.radius * (1 - spiralT * 0.7);
      const angle = p.userData.angle + spiralT * Math.PI * 4;
      p.position.x = Math.cos(angle) * r;
      p.position.y = Math.sin(spiralT * Math.PI * 2) * 0.1;
      p.position.z = Math.sin(angle) * r;
      p.material.opacity = (1 - spiralT) * 0.6 * intensity;
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
