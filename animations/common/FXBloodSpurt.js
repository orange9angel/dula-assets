import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXBloodSpurt — 血液飞溅（风格化）
 * Stylized hit blood / energy spray for mature-rated fights
 * Dark red particles spraying from impact point
 * Duration: 0.4s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, monster]
 *   notSuits: [round, tiny, robot]
 *   note: Can be recolored to energy spray (blue/purple) for non-blood fights
 */
export class FXBloodSpurt extends AnimationBase {
  constructor() {
    super('FXBloodSpurt', 0.4);
    this.tags = {
      requires: ['mesh'],
      suits: ['humanoid', 'fighter', 'monster'],
      notSuits: ['round', 'tiny', 'robot'],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    if (!mesh) return;

    let fxGroup = character.effectGroups?.bloodSpurt;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'bloodSpurt';

      // Blood droplets
      const dropMat = new THREE.MeshBasicMaterial({
        color: 0x8a1a1a, transparent: true, opacity: 0.8, depthWrite: false,
      });
      const drops = [];
      for (let i = 0; i < 10; i++) {
        const drop = new THREE.Mesh(
          new THREE.SphereGeometry(0.015 + Math.random() * 0.02, 4, 4),
          dropMat.clone()
        );
        const angle = (Math.random() - 0.5) * Math.PI * 0.8;
        const elevation = Math.random() * Math.PI * 0.5;
        drop.userData.velocity = new THREE.Vector3(
          Math.sin(angle) * Math.cos(elevation) * (1 + Math.random()),
          Math.sin(elevation) * (1.5 + Math.random()),
          Math.cos(angle) * Math.cos(elevation) * (1 + Math.random())
        );
        drop.userData.gravity = 2.5;
        fxGroup.add(drop);
        drops.push(drop);
      }
      fxGroup.userData.drops = drops;

      // Blood splat on ground
      const splatMat = new THREE.MeshBasicMaterial({
        color: 0x6a0a0a, transparent: true, opacity: 0.5,
        depthWrite: false, side: THREE.DoubleSide,
      });
      const splat = new THREE.Mesh(
        new THREE.CircleGeometry(0.15, 8),
        splatMat
      );
      splat.rotation.x = -Math.PI / 2;
      splat.position.y = 0.01;
      splat.visible = false;
      fxGroup.add(splat);
      fxGroup.userData.splat = splat;

      fxGroup.position.set(0.2, 1.0, 0.1); // chest impact area
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.bloodSpurt = fxGroup;
    }

    fxGroup.visible = true;
    const drops = fxGroup.userData.drops;
    const splat = fxGroup.userData.splat;

    // Physics simulation for droplets
    for (const drop of drops) {
      const vx = drop.userData.velocity.x;
      const vy = drop.userData.velocity.y - drop.userData.gravity * t;
      const vz = drop.userData.velocity.z;

      drop.position.x = vx * t * 0.15;
      drop.position.y = Math.max(0, vy * t * 0.15);
      drop.position.z = vz * t * 0.15;

      // Fade out
      drop.material.opacity = Math.max(0, 0.8 - t * 1.5);
      drop.scale.setScalar(1 - t * 0.3);
    }

    // Splat appears when droplets hit ground
    if (t > 0.15) {
      splat.visible = true;
      splat.scale.setScalar(Math.min(1, (t - 0.15) * 3));
      splat.material.opacity = Math.max(0, 0.5 - (t - 0.15) * 0.8);
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
      splat.visible = false;
    }
  }
}
