import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * Two-shot: both characters in frame.
 * Camera is placed perpendicular to the line connecting the two characters.
 */
export class TwoShot extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.characterA = options.characterA ?? 'Nobita';
    this.characterB = options.characterB ?? 'Doraemon';
    this.distance = options.distance ?? 5.0;
    this.height = options.height ?? 2.2;
    this.bias = options.bias ?? 0; // shift camera left/right along the perpendicular
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
  }

  update(t, camera, context) {
    const charA = context.characters.get(this.characterA);
    const charB = context.characters.get(this.characterB);
    if (!charA || !charB) return;

    const posA = charA.mesh.position.clone();
    const posB = charB.mesh.position.clone();

    // Midpoint
    const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);

    // Perpendicular direction
    const line = new THREE.Vector3().subVectors(posB, posA);
    const perp = new THREE.Vector3(-line.z, 0, line.x).normalize();

    // Camera position
    this.endPos = mid.clone()
      .add(perp.multiplyScalar(this.distance))
      .add(new THREE.Vector3(this.bias, this.height, 0));

    const lookAt = mid.clone().add(new THREE.Vector3(0, 1.5, 0));

    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(this.startPos, this.endPos, eased);
    camera.lookAt(lookAt);
  }
}
