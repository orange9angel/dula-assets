import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';
import { parseVecOption } from '../utils.js';

/**
 * Orbit around a character's current position.
 * The camera rotates around the character in real-time.
 */
export class OrbitCharacter extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 3.0 });
    this.characterName = options.characterName ?? 'Nobita';
    this.radius = options.radius ?? 5;
    this.startAngle = options.startAngle ?? 0;
    this.endAngle = options.endAngle ?? Math.PI * 2;
    this.height = options.height ?? 2;
    this.lookAtOffset = parseVecOption(options.lookAtOffset, new THREE.Vector3(0, 1.0, 0));
  }

  update(t, camera, context) {
    const char = context.characters.get(this.characterName);
    if (!char) return;

    const pos = char.mesh.position;
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const angle = this.startAngle + (this.endAngle - this.startAngle) * eased;

    const centerX = pos.x;
    const centerY = pos.y + this.lookAtOffset.y;
    const centerZ = pos.z;

    camera.position.set(
      centerX + Math.cos(angle) * this.radius,
      centerY + this.height,
      centerZ + Math.sin(angle) * this.radius
    );
    camera.lookAt(centerX, centerY, centerZ);
  }
}
