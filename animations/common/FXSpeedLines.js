import { AnimationBase } from 'dula-engine';
import * as THREE from 'three';

/**
 * FXSpeedLines — 速度线
 * Radial streaks indicating fast movement (anime / KOF dash effect)
 * White lines radiating from character center
 * Duration: 0.3s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, athletic, agile]
 *   note: Use with DashForward, Dodge, or any fast movement
 */
export class FXSpeedLines extends AnimationBase {
  constructor() {
    super('FXSpeedLines', 0.3);
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

    let fxGroup = character.effectGroups?.speedLines;
    if (!fxGroup) {
      fxGroup = new THREE.Group();
      fxGroup.name = 'speedLines';

      const lineMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false,
      });
      const lines = [];
      for (let i = 0; i < 16; i++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.01, 0.01, 0.8),
          lineMat.clone()
        );
        const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const radius = 0.5 + Math.random() * 0.5;
        line.position.set(
          Math.cos(angle) * radius,
          0.8 + Math.random() * 0.8,
          Math.sin(angle) * radius
        );
        line.lookAt(0, 0.8, 0);
        line.userData.angle = angle;
        line.userData.radius = radius;
        fxGroup.add(line);
        lines.push(line);
      }
      fxGroup.userData.lines = lines;

      fxGroup.position.set(0, 0, 0);
      mesh.add(fxGroup);

      if (!character.effectGroups) character.effectGroups = {};
      character.effectGroups.speedLines = fxGroup;
    }

    fxGroup.visible = true;
    const lines = fxGroup.userData.lines;

    // Speed lines streak outward then fade
    const ease = t < 0.5 ? t / 0.5 : 1;
    const fade = t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5;

    for (const line of lines) {
      const r = line.userData.radius + ease * 1.5;
      line.position.x = Math.cos(line.userData.angle) * r;
      line.position.z = Math.sin(line.userData.angle) * r;
      line.scale.z = 1 + ease * 2;
      line.material.opacity = fade * 0.5;
    }

    if (t >= 0.99) {
      fxGroup.visible = false;
    }
  }
}
