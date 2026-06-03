import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXBioluminescentPulse — 生物荧光脉冲
 * Alien creature emits waves of bioluminescent light that ripple outward.
 * Used for communication, intimidation, or environmental interaction.
 * Duration: 2.0s (loopable)
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [alien, insect, reptile, crystal]
 *   note: Use when alien reacts emotionally or uses special abilities
 */
export class FXBioluminescentPulse extends AnimationBase {
  constructor() {
    super('FXBioluminescentPulse', 2.0);
    this.tags = {
      requires: ['mesh'],
      suits: ['alien', 'insect', 'reptile', 'crystal'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    if (!mesh) return;

    let fxGroup = character.effectGroups?.bioPulse;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'bioPulse';

      // Expanding rings
      const rings = [];
      const colors = [0x44ffaa, 0x66ffcc, 0x88ffee];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.2, 0.25, 32),
          new THREE.MeshBasicMaterial({
            color: colors[i],
            transparent: true,
            opacity: 0,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.userData.delay = i * 0.3;
        fxGroup.add(ring);
        rings.push(ring);
      }
      fxGroup.userData.rings = rings;

      // Floating spore particles
      const spores = [];
      for (let i = 0; i < 16; i++) {
        const spore = new THREE.Mesh(
          new THREE.SphereGeometry(0.012 + Math.random() * 0.008, 6, 6),
          new THREE.MeshBasicMaterial({
            color: 0x66ffaa,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );
        const angle = (i / 16) * Math.PI * 2;
        spore.userData.baseAngle = angle;
        spore.userData.radius = 0.15 + Math.random() * 0.2;
        spore.userData.height = 0.3 + Math.random() * 1.0;
        spore.userData.speed = 0.5 + Math.random() * 0.5;
        spore.userData.phase = Math.random() * Math.PI * 2;
        fxGroup.add(spore);
        spores.push(spore);
      }
      fxGroup.userData.spores = spores;

      // Body glow overlay
      const bodyGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 12),
        new THREE.MeshBasicMaterial({
          color: 0x44ffaa,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      bodyGlow.position.y = 0.8;
      bodyGlow.scale.set(1, 1.6, 0.7);
      fxGroup.add(bodyGlow);
      fxGroup.userData.bodyGlow = bodyGlow;

      mesh.add(fxGroup);
      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.bioPulse = fxGroup;
    }

    fxGroup.visible = true;
    const rings = fxGroup.userData.rings;
    const spores = fxGroup.userData.spores;
    const bodyGlow = fxGroup.userData.bodyGlow;

    // Body glow pulses
    const intensity = t < 0.2 ? t / 0.2 : (t > 0.8 ? (1 - t) / 0.2 : 1);
    bodyGlow.material.opacity = intensity * 0.15;
    const pulse = 1 + Math.sin(t * Math.PI * 3) * 0.1;
    bodyGlow.scale.set(1 * pulse, 1.6 * pulse, 0.7 * pulse);

    // Rings expand outward with staggered delays
    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i];
      const localT = Math.max(0, t - ring.userData.delay);
      if (localT <= 0) {
        ring.visible = false;
        continue;
      }
      ring.visible = true;
      const progress = Math.min(1, localT / 1.2);
      const scale = 1 + progress * 4;
      ring.scale.set(scale, scale, 1);
      ring.material.opacity = Math.max(0, 0.5 * (1 - progress) * intensity);
    }

    // Spores float upward and drift
    for (const spore of spores) {
      const drift = Math.sin(t * spore.userData.speed * 2 + spore.userData.phase) * 0.1;
      spore.position.set(
        Math.cos(spore.userData.baseAngle) * spore.userData.radius + drift,
        spore.userData.height + t * 0.3,
        Math.sin(spore.userData.baseAngle) * spore.userData.radius + drift * 0.5
      );
      const sporeFade = Math.sin((spore.userData.height / 1.5) * Math.PI) * intensity;
      spore.material.opacity = Math.max(0, sporeFade * 0.6);
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
