import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * SpiritGunCloseUp — close-up of Yusuke's hand as he charges the Spirit Gun.
 * Camera focuses on the right hand/fingertip where the energy orb appears.
 * Low angle side view to clearly show the glowing orb.
 */
export class SpiritGunCloseUp extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 2.0 });
    this.characterName = options.characterName ?? options.target ?? 'Yusuke';
    this.startDistance = options.startDistance ?? 2.5;
    this.endDistance = options.endDistance ?? 1.3;
    this.heightOffset = options.heightOffset ?? 0.0;
    this.sideAngle = (options.sideAngle ?? 35) * (Math.PI / 180);
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

    // Target the right hand position (where the spirit gun orb appears)
    const handPos = new THREE.Vector3();
    if (char.rightArm) {
      // Get the end of the right arm (hand position)
      const armLen = char.rightArmLength || 0.6;
      handPos.set(0, -armLen, 0);
      handPos.applyMatrix4(char.rightArm.matrixWorld);
    } else {
      // Fallback to chest height
      handPos.copy(char.mesh.position).add(new THREE.Vector3(0, 1.2, 0));
    }

    // Look at the hand, slightly above it to see the orb
    this.lookAtPos = handPos.clone().add(new THREE.Vector3(0, 0.05, 0));

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(char.mesh.quaternion);
    forward.y = 0;
    if (forward.lengthSq() < 0.001) forward.set(0, 0, 1);
    forward.normalize();

    const side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const camDir = forward.clone().multiplyScalar(Math.cos(this.sideAngle))
      .add(side.multiplyScalar(Math.sin(this.sideAngle)));

    this.endPos = this.lookAtPos.clone().add(camDir.clone().multiplyScalar(this.endDistance));
    this.endPos.y = this.lookAtPos.y + 0.3;

    this.startPos = this.lookAtPos.clone().add(camDir.clone().multiplyScalar(this.startDistance));
    this.startPos.y = this.lookAtPos.y + 0.2;
  }
}
