import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * Close-up shot on a character's face.
 * Locks target position at start() — no per-frame recomputation to avoid jitter.
 *
 * Anti-clipping enhancements:
 * - distance is clamped to at least (target bounding radius + head margin)
 * - final camera position is pushed out of any character's bounding sphere
 * - start position is also pushed out so interpolation does not begin inside a character
 */
export class CloseUp extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.characterName = options.characterName ?? options.target ?? 'Nobita';
    this.distance = options.distance ?? 1.8;
    this.heightOffset = options.heightOffset ?? 0.1;
    this.sideAngle = (options.sideAngle ?? 0) * (Math.PI / 180);
    this.minMargin = options.minMargin ?? 0.35; // extra safety beyond bounding radius
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
    if (!this.endPos || !this.lookAtPos) return;
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);
    // Clamp camera above ground
    desiredPos.y = Math.max(0.5, desiredPos.y);
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

    // Enforce minimum safe distance based on character size
    const boundingRadius = char.boundingRadius || 0.5;
    const minDistance = Math.max(boundingRadius * 0.6 + this.minMargin, 1.5);
    const safeDistance = Math.max(this.distance, minDistance);

    this.endPos = this.lookAtPos.clone().add(camDir.multiplyScalar(safeDistance));
    this.endPos.y = this.lookAtPos.y + 0.05;

    if (!this.startPos) {
      this.startPos = camera.position.clone();
    }

    // Anti-clipping: push start/end camera positions out of all character bounding spheres
    this._resolveCharacterCollisions(context);
  }

  _resolveCharacterCollisions(context) {
    if (!context || !context.characters) return;
    const chars = Array.from(context.characters.values()).filter((c) => c && c.mesh && c.mesh.visible !== false);

    for (const c of chars) {
      const radius = c.boundingRadius || 0.5;
      const center = new THREE.Vector3();
      c.mesh.getWorldPosition(center);
      center.y += radius; // approximate torso/head center

      // Push end position out
      const toEnd = new THREE.Vector3().subVectors(this.endPos, center);
      const distEnd = toEnd.length();
      const minDistEnd = radius + this.minMargin;
      if (distEnd < minDistEnd && distEnd > 0.001) {
        toEnd.normalize().multiplyScalar(minDistEnd);
        this.endPos.copy(center).add(toEnd);
      }

      // Push start position out so the interpolation path does not begin inside a character
      const toStart = new THREE.Vector3().subVectors(this.startPos, center);
      const distStart = toStart.length();
      const minDistStart = radius + this.minMargin;
      if (distStart < minDistStart && distStart > 0.001) {
        toStart.normalize().multiplyScalar(minDistStart);
        this.startPos.copy(center).add(toStart);
      }
    }
  }
}
