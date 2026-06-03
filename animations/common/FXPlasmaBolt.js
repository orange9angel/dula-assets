import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXPlasmaBolt — 等离子能量弹
 * A concentrated ball of plasma energy that charges up and fires.
 * Used for ranged alien attacks or energy weapon charging.
 * Duration: 1.2s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [alien, crystal, humanoid]
 *   note: Use before projectile attacks or energy-based special moves
 */
export class FXPlasmaBolt extends AnimationBase {
  constructor() {
    super('FXPlasmaBolt', 1.2);
    this.tags = {
      requires: ['mesh'],
      suits: ['alien', 'crystal', 'humanoid'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    if (!mesh) return;

    let fxGroup = character.effectGroups?.plasmaBolt;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'plasmaBolt';

      // Main plasma ball
      const plasmaMat = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const plasma = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        plasmaMat
      );
      plasma.position.set(0.4, 1.2, 0.3);
      fxGroup.add(plasma);
      fxGroup.userData.plasma = plasma;

      // Inner core
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        coreMat
      );
      core.position.set(0.4, 1.2, 0.3);
      fxGroup.add(core);
      fxGroup.userData.core = core;

      // Energy arcs (thin lines orbiting)
      const arcs = [];
      for (let i = 0; i < 6; i++) {
        const arc = new THREE.Mesh(
          new THREE.TorusGeometry(0.12 + i * 0.02, 0.003, 4, 16),
          new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );
        arc.position.set(0.4, 1.2, 0.3);
        arc.userData.baseRotX = Math.random() * Math.PI;
        arc.userData.baseRotY = Math.random() * Math.PI;
        arc.userData.speed = 3 + Math.random() * 4;
        fxGroup.add(arc);
        arcs.push(arc);
      }
      fxGroup.userData.arcs = arcs;

      // Charge particles
      const particles = [];
      for (let i = 0; i < 12; i++) {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.008, 4, 4),
          new THREE.MeshBasicMaterial({
            color: 0xff8844,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );
        p.userData.angle = (i / 12) * Math.PI * 2;
        p.userData.radius = 0.2 + Math.random() * 0.15;
        p.userData.speed = 2 + Math.random() * 3;
        fxGroup.add(p);
        particles.push(p);
      }
      fxGroup.userData.particles = particles;

      mesh.add(fxGroup);
      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.plasmaBolt = fxGroup;
    }

    fxGroup.visible = true;
    const plasma = fxGroup.userData.plasma;
    const core = fxGroup.userData.core;
    const arcs = fxGroup.userData.arcs;
    const particles = fxGroup.userData.particles;

    // Phase 1: Charge up (0-0.6)
    // Phase 2: Fire burst (0.6-0.8)
    // Phase 3: Fade (0.8-1.0)
    const chargePhase = Math.min(1, t / 0.6);
    const firePhase = t > 0.6 ? Math.min(1, (t - 0.6) / 0.2) : 0;
    const fadePhase = t > 0.8 ? Math.min(1, (t - 0.8) / 0.3) : 0;

    // Plasma ball grows and pulses during charge
    const chargePulse = 0.8 + Math.sin(t * 15) * 0.2 * chargePhase;
    plasma.scale.setScalar(chargePulse);
    plasma.material.opacity = chargePhase * 0.5 + firePhase * 0.3;

    // Core brightens
    core.scale.setScalar(0.5 + chargePhase * 0.5 + firePhase * 0.8);
    core.material.opacity = chargePhase * 0.7 + firePhase * 0.9;

    // Fire burst — plasma shoots forward
    if (firePhase > 0) {
      plasma.position.set(0.4 + firePhase * 3, 1.2, 0.3);
      core.position.set(0.4 + firePhase * 3, 1.2, 0.3);
      plasma.scale.setScalar(1.5 + firePhase * 2);
      plasma.material.color.setHex(0xffaa00);
    } else {
      plasma.position.set(0.4, 1.2, 0.3);
      core.position.set(0.4, 1.2, 0.3);
      plasma.material.color.setHex(0xff4400);
    }

    // Arcs spin faster as charge builds
    for (const arc of arcs) {
      arc.rotation.x = arc.userData.baseRotX + t * arc.userData.speed * (1 + chargePhase * 2);
      arc.rotation.y = arc.userData.baseRotY + t * arc.userData.speed * 0.7;
      arc.material.opacity = chargePhase * 0.4 * (1 - fadePhase);
      if (firePhase > 0) {
        arc.position.set(0.4 + firePhase * 3, 1.2, 0.3);
        arc.scale.setScalar(1 + firePhase * 3);
      } else {
        arc.position.set(0.4, 1.2, 0.3);
        arc.scale.setScalar(1);
      }
    }

    // Particles spiral inward during charge, then explode outward
    for (const p of particles) {
      const spiralT = t * p.userData.speed;
      const radius = firePhase > 0
        ? 0.1 + firePhase * 4
        : 0.3 - chargePhase * 0.15;
      p.position.set(
        0.4 + Math.cos(p.userData.angle + spiralT) * radius + (firePhase > 0 ? firePhase * 3 : 0),
        1.2 + Math.sin(spiralT * 0.5) * 0.1,
        0.3 + Math.sin(p.userData.angle + spiralT) * radius
      );
      p.material.opacity = (chargePhase * 0.6 + firePhase * 0.8) * (1 - fadePhase);
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
      // Reset positions
      plasma.position.set(0.4, 1.2, 0.3);
      core.position.set(0.4, 1.2, 0.3);
      for (const arc of arcs) arc.position.set(0.4, 1.2, 0.3);
    }
  }
}
