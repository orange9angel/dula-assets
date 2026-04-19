import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * Close-up shot on a character's face.
 * Places camera near the character's head height, looking at the face.
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
  }

  update(t, camera, context) {
    this._computeTarget(camera, context);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(this.startPos, this.endPos, eased);
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
    // side offset
    const side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const camDir = forward.clone().multiplyScalar(Math.cos(this.sideAngle)).add(side.multiplyScalar(Math.sin(this.sideAngle)));

    this.endPos = this.lookAtPos.clone().sub(camDir.multiplyScalar(this.distance));
    this.endPos.y = this.lookAtPos.y + 0.05;

    if (!this.startPos) {
      this.startPos = camera.position.clone();
    }
  }
}
