import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXAfterImage — 残影
 * Ghostly afterimages trailing fast movement (KOF dash / anime speed effect)
 * Semi-transparent copies of character that fade out
 * Duration: 0.5s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, athletic, agile]
 *   note: Use with DashForward, Dodge, or teleport moves
 */
export class FXAfterImage extends AnimationBase {
  constructor() {
    super('FXAfterImage', 0.5);
    this.tags = {
      requires: ['mesh'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    const mesh = character.mesh;
    if (!mesh) return;

    let fxGroup = character.effectGroups?.afterImage;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'afterImage';

      // Create ghost copies — simple colored silhouettes
      const ghosts = [];
      for (let i = 0; i < 3; i++) {
        const ghostMat = new THREE.MeshBasicMaterial({
          color: 0x88ccff, transparent: true, opacity: 0.15,
          depthWrite: false,
        });
        // Placeholder sphere — in real use this would clone character mesh
        const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), ghostMat);
        ghost.position.set(-(i + 1) * 0.2, 0.9, 0);
        ghost.scale.set(0.8, 1.6, 0.6);
        ghost.userData.index = i;
        fxGroup.add(ghost);
        ghosts.push(ghost);
      }
      fxGroup.userData.ghosts = ghosts;

      fxGroup.position.set(0, 0, 0);
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.afterImage = fxGroup;
    }

    fxGroup.visible = true;
    const ghosts = fxGroup.userData.ghosts;

    // Ghosts fade out sequentially
    for (const ghost of ghosts) {
      const delay = ghost.userData.index * 0.1;
      const gt = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
      ghost.material.opacity = 0.2 * (1 - gt);
      ghost.scale.setScalar(0.8 + gt * 0.1);
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
