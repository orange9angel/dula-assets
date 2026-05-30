import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXSmokeCloud — 烟雾云（搞笑逃跑用）
 * 角色脚底冒出的灰白烟雾，表示惊慌失措的逃跑
 * Duration: 1.5s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Use with Run, DashForward, or flee scenes
 */
export class FXSmokeCloud extends AnimationBase {
  constructor() {
    super('FXSmokeCloud', 1.5);
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

    let fxGroup = character.effectGroups?.smokeCloud;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'smokeCloud';

      // 多个烟雾球体
      const smokeMat = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa, transparent: true, opacity: 0.35, depthWrite: false,
      });
      const puffs = [];
      for (let i = 0; i < 10; i++) {
        const size = 0.1 + Math.random() * 0.15;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), smokeMat.clone());
        const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
        puff.userData.angle = angle;
        puff.userData.speed = 0.8 + Math.random() * 2.0;
        puff.userData.rise = 0.5 + Math.random() * 0.8;
        puff.userData.offset = Math.random() * 0.3;
        fxGroup.add(puff);
        puffs.push(puff);
      }
      fxGroup.userData.puffs = puffs;

      fxGroup.position.set(0, 0.05, 0);
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.smokeCloud = fxGroup;
    }

    fxGroup.visible = true;
    const puffs = fxGroup.userData.puffs;

    // 烟雾持续扩散、上升、淡出
    for (const puff of puffs) {
      const pt = Math.max(0, Math.min(1, (t - puff.userData.offset) / (1 - puff.userData.offset)));
      const progress = pt * puff.userData.speed;
      const clampedProgress = Math.min(1, progress);
      
      const fade = clampedProgress < 0.2 
        ? clampedProgress / 0.2 
        : 1 - (clampedProgress - 0.2) / 0.8;

      const dist = clampedProgress * 0.5;
      puff.position.x = Math.cos(puff.userData.angle) * dist;
      puff.position.z = Math.sin(puff.userData.angle) * dist;
      puff.position.y = clampedProgress * puff.userData.rise * 0.4;

      puff.scale.setScalar(1 + clampedProgress * 3);
      puff.material.opacity = Math.max(0, fade * 0.3);
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
