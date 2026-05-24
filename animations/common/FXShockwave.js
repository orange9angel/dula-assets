import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXShockwave — 冲击波
 * Ground ring expanding outward from impact (KOF heavy hit / slam effect)
 * White-blue ring that expands and fades
 * Duration: 0.5s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Use with Knockdown, heavy Kick, or landing from JumpAttack
 */
export class FXShockwave extends AnimationBase {
  constructor() {
    super('FXShockwave', 0.5);
    this.tags = {
      requires: ['mesh'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: ['floating'],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    if (!mesh) return;

    let fxGroup = character.effectGroups?.shockwave;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'shockwave';

      // Main ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.6,
        depthWrite: false, side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.1, 0.15, 32),
        ringMat
      );
      ring.rotation.x = -Math.PI / 2;
      fxGroup.add(ring);
      fxGroup.userData.ring = ring;

      // Secondary ring (slightly delayed, different color)
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x88ccff, transparent: true, opacity: 0.4,
        depthWrite: false, side: THREE.DoubleSide,
      });
      const ring2 = new THREE.Mesh(
        new THREE.RingGeometry(0.05, 0.1, 32),
        ring2Mat
      );
      ring2.rotation.x = -Math.PI / 2;
      fxGroup.add(ring2);
      fxGroup.userData.ring2 = ring2;

      fxGroup.position.set(0, 0.02, 0); // just above ground
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.shockwave = fxGroup;
    }

    fxGroup.visible = true;
    const ring = fxGroup.userData.ring;
    const ring2 = fxGroup.userData.ring2;

    const ease = 1 - Math.pow(1 - t, 2); // ease out

    // Ring expands
    const scale = 1 + ease * 8;
    ring.scale.set(scale, scale, 1);
    ring.material.opacity = 0.6 * (1 - t);

    // Secondary ring follows with delay
    const t2 = Math.max(0, t - 0.1) / 0.9;
    const ease2 = 1 - Math.pow(1 - t2, 2);
    const scale2 = 1 + ease2 * 10;
    ring2.scale.set(scale2, scale2, 1);
    ring2.material.opacity = 0.4 * (1 - t2);

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
