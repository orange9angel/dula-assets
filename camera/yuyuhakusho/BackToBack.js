import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * BackToBack — wide shot showing Yusuke and Kuwabara standing back-to-back.
 * Camera at medium height, slightly low angle for hero shot.
 */
export class BackToBack extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 2.0 });
    this.characterA = options.characterA ?? 'Yusuke';
    this.characterB = options.characterB ?? 'Kuwabara';
    this.distance = options.distance ?? 6.0;
    this.height = options.height ?? 1.8;
  }

  start(camera, context) {
    super.start(camera, context);
    this._computeTarget(context);
    this._targetComputed = true;
  }

  update(t, camera, context) {
    if (!this._targetComputed) {
      this._computeTarget(context);
      this._targetComputed = true;
    }
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);
    camera.position.copy(desiredPos);
    camera.lookAt(this.lookAtPos);
  }

  _computeTarget(context) {
    const charA = context.characters.get(this.characterA);
    const charB = context.characters.get(this.characterB);

    const posA = charA ? charA.mesh.position.clone() : new THREE.Vector3(-1.5, 0, 0);
    const posB = charB ? charB.mesh.position.clone() : new THREE.Vector3(1.5, 0, 0);

    this.lookAtPos = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
    this.lookAtPos.y = 1.2;

    const centerDir = new THREE.Vector3().subVectors(posB, posA).normalize();
    const side = new THREE.Vector3().crossVectors(centerDir, new THREE.Vector3(0, 1, 0)).normalize();

    this.startPos = this.lookAtPos.clone().add(side.clone().multiplyScalar(this.distance));
    this.startPos.y = this.height;

    this.endPos = this.lookAtPos.clone().add(side.clone().multiplyScalar(this.distance * 0.9));
    this.endPos.y = this.height + 0.2;
  }
}
