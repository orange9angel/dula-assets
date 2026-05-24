import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXDustKick — 地面扬尘
 * Dust cloud when dashing / landing / stomping (KOF style)
 * Brown-grey particles puffing from feet
 * Duration: 0.6s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Use with DashForward, Kick, JumpAttack landing
 */
export class FXDustKick extends AnimationBase {
  constructor() {
    super('FXDustKick', 0.6);
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

    let fxGroup = character.effectGroups?.dustKick;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'dustKick';

      // Dust puffs — multiple spheres
      const dustMat = new THREE.MeshBasicMaterial({
        color: 0x887766, transparent: true, opacity: 0.4, depthWrite: false,
      });
      const puffs = [];
      for (let i = 0; i < 6; i++) {
        const size = 0.08 + Math.random() * 0.1;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), dustMat.clone());
        const angle = (i / 6) * Math.PI * 2;
        puff.userData.angle = angle;
        puff.userData.speed = 0.5 + Math.random() * 1.5;
        puff.userData.rise = 0.3 + Math.random() * 0.5;
        fxGroup.add(puff);
        puffs.push(puff);
      }
      fxGroup.userData.puffs = puffs;

      fxGroup.position.set(0, 0.05, 0); // at feet level
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.dustKick = fxGroup;
    }

    fxGroup.visible = true;
    const puffs = fxGroup.userData.puffs;

    // Dust expands outward and rises, then fades
    for (const puff of puffs) {
      const progress = Math.min(1, t * puff.userData.speed);
      const fade = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;

      const dist = progress * 0.3;
      puff.position.x = Math.cos(puff.userData.angle) * dist;
      puff.position.z = Math.sin(puff.userData.angle) * dist;
      puff.position.y = progress * puff.userData.rise * 0.3;

      puff.scale.setScalar(1 + progress * 2);
      puff.material.opacity = Math.max(0, fade * 0.35);
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
