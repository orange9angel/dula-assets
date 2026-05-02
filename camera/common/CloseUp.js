import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * Close-up shot on a character's face.
 * Locks target position at start() — no per-frame recomputation to avoid jitter.
 */
export class CloseUp extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.characterName = options.characterName ?? 'Nobita';
    this.distance = options.distance ?? 1.8;
    this.heightOffset = options.heightOffset ?? 0.1;
    this.sideAngle = (options.sideAngle ?? 0) * (Math.PI / 180);
  }

  start(camera, context) {
    super.start(camera, context);
    this._computeTarget(camera, context);
    this._targetComputed = true;
  }

  update(t, camera, context) {
    if (!this._targetComputed) {
      this._computeTarget(camera, context);
      this._targetComputed = true;
    }
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);
    camera.position.copy(desiredPos);
    camera.lookAt(this.lookAtPos);
  }

  _computeTarget(camera, context) {
    const char = context.characters.get(this.characterName);
    if (!char) return;

    const headPos = new THREE.Vector3();
    if (char.headGroup) {
      char.headGroup.getWorldPosition(headPos);
    } else {
      headPos.copy(char.mesh.position).add(new THREE.Vector3(0, 1.9, 0));
    }

    this.lookAtPos = headPos.clone().add(new THREE.Vector3(0, this.heightOffset, 0));

    // Use world forward projected onto XZ plane so lookAt() tilts don't break framing
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(char.mesh.quaternion);
    forward.y = 0;
    if (forward.lengthSq() < 0.001) forward.set(0, 0, 1);
    forward.normalize();
    
    const side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const camDir = forward.clone().multiplyScalar(Math.cos(this.sideAngle))
      .add(side.multiplyScalar(Math.sin(this.sideAngle)));

    this.endPos = this.lookAtPos.clone().add(camDir.multiplyScalar(this.distance));
    this.endPos.y = this.lookAtPos.y + 0.05;

    if (!this.startPos) {
      this.startPos = camera.position.clone();
    }
  }
}
