import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXCrystalShards — 水晶碎片爆发
 * Crystal lifeform releases sharp crystal shards in a burst pattern.
 * Used for power-up, attack impact, or defensive stance.
 * Duration: 1.5s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [alien, crystal, monster]
 *   note: Use during special attacks or when crystal being takes damage
 */
export class FXCrystalShards extends AnimationBase {
  constructor() {
    super('FXCrystalShards', 1.5);
    this.tags = {
      requires: ['mesh'],
      suits: ['alien', 'crystal', 'monster'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    if (!mesh) return;

    let fxGroup = character.effectGroups?.crystalShards;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'crystalShards';

      // Create shard pool
      const shards = [];
      const colors = [0xff8844, 0xffaa66, 0xffcc88, 0xff6622];
      for (let i = 0; i < 20; i++) {
        const shard = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.02 + Math.random() * 0.03, 0),
          new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );
        shard.userData.angle = (i / 20) * Math.PI * 2 + Math.random() * 0.5;
        shard.userData.tilt = Math.random() * Math.PI;
        shard.userData.speed = 1.5 + Math.random() * 2.5;
        shard.userData.rotSpeed = (Math.random() - 0.5) * 10;
        shard.userData.delay = Math.random() * 0.15;
        fxGroup.add(shard);
        shards.push(shard);
      }
      fxGroup.userData.shards = shards;

      // Ground crack glow
      const crackGlow = new THREE.Mesh(
        new THREE.RingGeometry(0.1, 0.4, 8),
        new THREE.MeshBasicMaterial({
          color: 0xff8844,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      crackGlow.rotation.x = -Math.PI / 2;
      fxGroup.add(crackGlow);
      fxGroup.userData.crackGlow = crackGlow;

      mesh.add(fxGroup);
      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.crystalShards = fxGroup;
    }

    fxGroup.visible = true;
    const shards = fxGroup.userData.shards;
    const crackGlow = fxGroup.userData.crackGlow;

    // Crack glow expands then fades
    if (t < 0.3) {
      const expand = t / 0.3;
      crackGlow.scale.setScalar(1 + expand * 2);
      crackGlow.material.opacity = expand * 0.4;
    } else {
      crackGlow.material.opacity = Math.max(0, 0.4 - (t - 0.3) * 0.8);
    }

    // Shards burst outward
    for (const shard of shards) {
      const localT = Math.max(0, t - shard.userData.delay);
      if (localT <= 0) {
        shard.visible = false;
        continue;
      }
      shard.visible = true;

      const progress = Math.min(1, localT / 0.8);
      const distance = progress * shard.userData.speed * 0.5;
      const height = Math.sin(progress * Math.PI) * 0.8;

      shard.position.set(
        Math.cos(shard.userData.angle) * distance,
        height + 0.5,
        Math.sin(shard.userData.angle) * distance
      );
      shard.rotation.set(
        shard.userData.tilt + localT * shard.userData.rotSpeed,
        localT * shard.userData.rotSpeed * 0.7,
        0
      );

      // Fade in then out
      if (progress < 0.2) {
        shard.material.opacity = progress / 0.2 * 0.9;
      } else {
        shard.material.opacity = Math.max(0, 0.9 - (progress - 0.2) * 1.5);
      }
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
