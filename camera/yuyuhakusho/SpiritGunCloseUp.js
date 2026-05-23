import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * SpiritGunCloseUp — close-up of Yusuke's face and hand as he charges the Spirit Gun.
 * Camera starts slightly below eye level and slowly pushes in.
 * Slight side angle to show the finger pointing forward.
 * Focus on the character's right hand.
 */
export class SpiritGunCloseUp extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.5 });
    this.characterName = options.characterName ?? 'Yusuke';
    this.startDistance = options.startDistance ?? 2.2;
    this.endDistance = options.endDistance ?? 1.0;
    this.heightOffset = options.heightOffset ?? 0.05;
    this.sideAngle = (options.sideAngle ?? 25) * (Math.PI / 180);
  }

  start(camera, target) {
    super.start(camera, target);
    this._lockTarget(target);
    this._computePositions();
    camera.position.copy(this.startPos);
  }

  update(camera, target, progress) {
    if (!this.lookAtPos) {
      this._lockTarget(target);
      this._computePositions();
    }
    const t = progress;
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);
    camera.position.copy(desiredPos);
    camera.lookAt(this.lookAtPos);
  }

  _lockTarget(target) {
    this.lookAtPos = target.position.clone().add(new THREE.Vector3(0, this.heightOffset, 0));
  }

  _computePositions() {
    const forward = new THREE.Vector3(0, 0, 1);
    const side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const camDir = forward.clone().multiplyScalar(Math.cos(this.sideAngle))
      .add(side.clone().multiplyScalar(Math.sin(this.sideAngle)));

    this.startPos = this.lookAtPos.clone().add(camDir.multiplyScalar(this.startDistance));
    this.startPos.y = this.lookAtPos.y - 0.15;

    this.endPos = this.lookAtPos.clone().add(camDir.normalize().multiplyScalar(this.endDistance));
    this.endPos.y = this.lookAtPos.y + 0.05;
  }
}
