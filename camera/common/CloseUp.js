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

    const charDir = new THREE.Vector3(0, 0, 1);
    charDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), char.mesh.rotation.y + this.sideAngle);

    this.endPos = this.lookAtPos.clone().sub(charDir.multiplyScalar(this.distance));
    this.endPos.y = this.lookAtPos.y + 0.05;

    if (!this.startPos) {
      this.startPos = camera.position.clone();
    }
  }
}
