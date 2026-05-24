import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXTrailSwipe — 武器/拳脚拖尾
 * Motion trail following a punch, kick, or sword swing (KOF / anime style)
 * Colored arc that traces the attack path
 * Duration: 0.5s
 *
 * Tags:
 *   requires: [mesh, rightArm]
 *   suits: [humanoid, fighter, athletic]
 *   note: Use with Punch, Kick, SwordSlash, SpiritSwordSwing
 */
export class FXTrailSwipe extends AnimationBase {
  constructor() {
    super('FXTrailSwipe', 0.5);
    this.tags = {
      requires: ['mesh', 'rightArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    const rArm = character.rightArm;
    if (!mesh || !rArm) return;

    let fxGroup = character.effectGroups?.trailSwipe;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'trailSwipe';

      // Arc trail — curved plane
      const trailMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.5,
        depthWrite: false, side: THREE.DoubleSide,
      });

      // Create a curved trail using multiple segments
      const segments = [];
      for (let i = 0; i < 5; i++) {
        const seg = new THREE.Mesh(
          new THREE.PlaneGeometry(0.15, 0.4),
          trailMat.clone()
        );
        seg.userData.index = i;
        fxGroup.add(seg);
        segments.push(seg);
      }
      fxGroup.userData.segments = segments;

      fxGroup.position.set(0, 1.0, 0.3);
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.trailSwipe = fxGroup;
    }

    fxGroup.visible = true;
    const segments = fxGroup.userData.segments;

    // Trail appears during strike phase (0-0.4), fades after
    const active = t < 0.4 ? t / 0.4 : 1 - (t - 0.4) / 0.6;
    const fade = t < 0.4 ? 1 : 1 - (t - 0.4) / 0.6;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      // Arc from upper right to lower left (punch trajectory)
      const arcT = i / (segments.length - 1);
      const angle = arcT * Math.PI * 0.6 - 0.3;
      seg.position.x = Math.sin(angle) * 0.5 * active;
      seg.position.y = Math.cos(angle) * 0.3 * active;
      seg.position.z = 0.2 + arcT * 0.2;
      seg.rotation.z = -angle;
      seg.material.opacity = fade * 0.4 * (1 - Math.abs(arcT - 0.5));
      seg.scale.x = active;
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
