import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXHitSpark — 打击火花
 * Classic fighting game hit spark (KOF / Street Fighter style)
 * White-yellow flash burst at impact point, fading quickly
 * Duration: 0.25s (snappy impact feel)
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Spawns at character position — use when attack connects
 */
export class FXHitSpark extends AnimationBase {
  constructor() {
    super('FXHitSpark', 0.25);
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

    // Get or create the effect group
    let fxGroup = character.effectGroups?.hitSpark;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'hitSpark';

      // Core flash — bright white sphere
      const flashMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 1, depthWrite: false,
      });
      const flash = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), flashMat);
      fxGroup.add(flash);
      fxGroup.userData.flash = flash;

      // Sparks — small lines radiating outward
      const sparkGeo = new THREE.CylinderGeometry(0.005, 0.002, 0.2, 4);
      const sparkMat = new THREE.MeshBasicMaterial({
        color: 0xffcc44, transparent: true, opacity: 0.9, depthWrite: false,
      });
      const sparks = [];
      for (let i = 0; i < 8; i++) {
        const spark = new THREE.Mesh(sparkGeo, sparkMat.clone());
        const angle = (i / 8) * Math.PI * 2;
        spark.rotation.z = Math.PI / 2;
        spark.rotation.y = angle;
        spark.userData.angle = angle;
        spark.userData.speed = 2 + Math.random() * 3;
        fxGroup.add(spark);
        sparks.push(spark);
      }
      fxGroup.userData.sparks = sparks;

      // Attach to character
      fxGroup.position.set(0.3, 1.2, 0.2); // chest/impact area
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.hitSpark = fxGroup;
    }

    fxGroup.visible = true;
    const flash = fxGroup.userData.flash;
    const sparks = fxGroup.userData.sparks;

    // Phase 1: FLASH (0-0.3) — intense burst
    if (t < 0.3) {
      const p = t / 0.3;
      const ease = 1 - Math.pow(1 - p, 2);
      // Flash expands rapidly
      flash.scale.setScalar(1 + ease * 2);
      flash.material.opacity = 1 - ease * 0.3;
      // Sparks shoot outward
      for (const spark of sparks) {
        const dist = ease * spark.userData.speed * 0.15;
        spark.position.x = Math.cos(spark.userData.angle) * dist;
        spark.position.y = Math.sin(spark.userData.angle) * dist;
        spark.scale.y = 1 + ease * 0.5;
      }
    }
    // Phase 2: Fade (0.3-1.0) — quick dissolve
    else {
      const p = (t - 0.3) / 0.7;
      const fade = 1 - p;
      flash.scale.setScalar(3 * fade + 0.1);
      flash.material.opacity = fade * 0.7;
      for (const spark of sparks) {
        spark.material.opacity = fade * 0.9;
        spark.scale.y = 1.5 * fade;
      }
    }

    // Hide when done
    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
