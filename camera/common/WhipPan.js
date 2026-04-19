import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';
import { parseVecOption } from '../utils.js';

/**
 * Whip pan: rapid camera swing from one target to another.
 * Creates a jarring / surprised / transitional effect.
 */
export class WhipPan extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 0.4 });
    this.fromTarget = parseVecOption(options.fromTarget, new THREE.Vector3(0, 1.5, 0));
    this.toTarget = parseVecOption(options.toTarget, new THREE.Vector3(5, 1.5, 0));
    this.distance = options.distance ?? 4;
    this.height = options.height ?? 2.0;
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
  }

  update(t, camera, context) {
    // Fast ease-in-out cubic for whip effect
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const fromPos = this.fromTarget.clone().add(new THREE.Vector3(0, 0, this.distance));
    const toPos = this.toTarget.clone().add(new THREE.Vector3(0, 0, this.distance));

    const currentPos = new THREE.Vector3().lerpVectors(fromPos, toPos, eased);
    currentPos.y = this.height;

    camera.position.copy(currentPos);

    const currentLook = new THREE.Vector3().lerpVectors(this.fromTarget, this.toTarget, eased);
    camera.lookAt(currentLook);
  }
}
