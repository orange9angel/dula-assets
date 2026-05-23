import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * BackToBack — wide shot showing Yusuke and Kuwabara standing back-to-back.
 * Camera at medium height, slightly low angle for a hero shot.
 * Both characters visible, ready for battle.
 * Slight orbit for dramatic framing.
 */
export class BackToBack extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 2.0 });
    this.distance = options.distance ?? 6.0;
    this.height = options.height ?? 1.8;
    this.orbitAngle = (options.orbitAngle ?? 15) * (Math.PI / 180);
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
    this.lookAtPos = target.position.clone();
  }

  _computePositions() {
    const startAngle = -this.orbitAngle * 0.5;
    const endAngle = this.orbitAngle * 0.5;

    this.startPos = new THREE.Vector3(
      this.lookAtPos.x + this.distance * Math.sin(startAngle),
      this.lookAtPos.y + this.height,
      this.lookAtPos.z + this.distance * Math.cos(startAngle)
    );

    this.endPos = new THREE.Vector3(
      this.lookAtPos.x + this.distance * Math.sin(endAngle),
      this.lookAtPos.y + this.height,
      this.lookAtPos.z + this.distance * Math.cos(endAngle)
    );
  }
}
