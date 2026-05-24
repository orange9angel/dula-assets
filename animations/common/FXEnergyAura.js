import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXEnergyAura — 能量气场
 * Character glows with fighting energy (KOF power-up / DBZ aura style)
 * Colored aura pulsing around the body
 * Duration: 2.0s (loopable for sustained aura)
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Use before special moves or during power-up sequences
 */
export class FXEnergyAura extends AnimationBase {
  constructor() {
    super('FXEnergyAura', 2.0);
    this.tags = {
      requires: ['mesh'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    if (!mesh) return;

    let fxGroup = character.effectGroups?.energyAura;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'energyAura';

      // Main aura shell — large transparent ellipsoid
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0x44aaff, transparent: true, opacity: 0.12,
        depthWrite: false, side: THREE.DoubleSide,
      });
      const aura = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), auraMat);
      aura.scale.set(0.9, 1.6, 0.7);
      aura.position.y = 0.9;
      fxGroup.add(aura);
      fxGroup.userData.aura = aura;

      // Inner glow — tighter, brighter
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x88ccff, transparent: true, opacity: 0.08,
        depthWrite: false, side: THREE.DoubleSide,
      });
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), innerMat);
      inner.scale.set(0.85, 1.5, 0.65);
      inner.position.y = 0.9;
      fxGroup.add(inner);
      fxGroup.userData.inner = inner;

      // Rings rotating around body
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xaaddff, transparent: true, opacity: 0.2,
        depthWrite: false, side: THREE.DoubleSide,
      });
      const rings = [];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.35 + i * 0.12, 0.008, 6, 32),
          ringMat.clone()
        );
        ring.position.y = 0.6 + i * 0.35;
        ring.rotation.x = Math.PI / 2 + i * 0.2;
        ring.userData.baseRotZ = i * 0.7;
        fxGroup.add(ring);
        rings.push(ring);
      }
      fxGroup.userData.rings = rings;

      // Energy particles floating up
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0xaaddff, transparent: true, opacity: 0.5, depthWrite: false,
      });
      const particles = [];
      for (let i = 0; i < 12; i++) {
        const p = new THREE.Mesh(
          new THREE.SphereGeometry(0.015 + (i % 3) * 0.005, 4, 4),
          particleMat.clone()
        );
        const a = (i / 12) * Math.PI * 2;
        p.position.set(
          Math.cos(a) * (0.3 + (i % 2) * 0.15),
          0.3 + (i % 6) * 0.2,
          Math.sin(a) * 0.15
        );
        p.userData.baseY = p.position.y;
        p.userData.speed = 0.8 + Math.random() * 1.2;
        p.userData.offset = Math.random() * Math.PI * 2;
        fxGroup.add(p);
        particles.push(p);
      }
      fxGroup.userData.particles = particles;

      fxGroup.position.set(0, 0, 0);
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.energyAura = fxGroup;
    }

    fxGroup.visible = true;
    const aura = fxGroup.userData.aura;
    const inner = fxGroup.userData.inner;
    const rings = fxGroup.userData.rings;
    const particles = fxGroup.userData.particles;

    // Fade in during first 20%
    const intensity = t < 0.2 ? t / 0.2 : 1;

    // Aura pulse
    const pulse = 0.9 + Math.sin(t * Math.PI * 4) * 0.12;
    aura.scale.set(0.9 * pulse, 1.6 * pulse, 0.7 * pulse);
    aura.material.opacity = 0.12 * intensity + Math.sin(t * Math.PI * 3) * 0.03;

    inner.scale.set(0.85 * pulse, 1.5 * pulse, 0.65 * pulse);
    inner.material.opacity = 0.08 * intensity;

    // Rings rotate
    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i];
      ring.rotation.z = ring.userData.baseRotZ + t * (1.5 + i * 0.5);
      ring.material.opacity = (0.15 + Math.sin(t * 3 + i) * 0.05) * intensity;
    }

    // Particles float up and fade
    for (const p of particles) {
      const py = (p.userData.baseY + t * p.userData.speed * 0.4) % 1.5;
      p.position.y = py;
      const fade = Math.sin((py / 1.5) * Math.PI);
      p.material.opacity = fade * 0.5 * intensity;
      p.position.x += Math.sin(t * 4 + p.userData.offset) * 0.002;
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
