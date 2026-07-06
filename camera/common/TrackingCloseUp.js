import * as THREE from 'three';
import { CameraMoveBase, CameraCollisionGuard } from 'dula-engine';

function getNow() {
  if (typeof performance !== 'undefined' && performance.now) return performance.now();
  return Date.now();
}

/**
 * Tracking close-up: follows a moving character while maintaining a tight face shot.
 * Similar to FollowCharacter but much closer and focused on the head.
 */
export class TrackingCloseUp extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.characterName = options.characterName ?? options.target ?? 'Nobita';
    this.distance = options.distance ?? 2.8;
    this.heightOffset = options.heightOffset ?? 0.05;
    this.sideAngle = (options.sideAngle ?? 10) * (Math.PI / 180);
    // Low-pass smoothing for the head target so speaking nods / eye micro-movements
    // remain visible on the character without shaking the whole frame.
    this.smoothing = options.smoothing !== false;
    this.cutoff = options.cutoff ?? 8.0;
    this._lastTime = null;
    this._smoothedHeadPos = null;
  }

  update(t, camera, context) {
    const char = context.characters.get(this.characterName);
    if (!char) return;

    const headPos = new THREE.Vector3();
    if (char.headGroup) {
      char.headGroup.getWorldPosition(headPos);
    } else {
      headPos.copy(char.mesh.position).add(new THREE.Vector3(0, 1.9, 0));
    }

    // Smooth the target so high-frequency head motion (jitter) is filtered out
    // while slower acting (nods, CrossArms body sway) still comes through.
    if (this.smoothing) {
      const now = getNow();
      if (this._lastTime === null) {
        this._smoothedHeadPos = headPos.clone();
      } else {
        const dt = Math.min(0.1, (now - this._lastTime) / 1000);
        const alpha = 1 - Math.exp(-dt * this.cutoff);
        this._smoothedHeadPos.lerp(headPos, alpha);
      }
      this._lastTime = now;
    } else {
      this._smoothedHeadPos = headPos;
    }

    const lookAt = this._smoothedHeadPos.clone().add(new THREE.Vector3(0, this.heightOffset, 0));

    // Use yaw-only forward so body animations (CrossArms lean, hit reactions, etc.)
    // don't swing the camera around and cause visible jitter in close-ups.
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), char.mesh.rotation.y);
    const side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const camDir = forward.clone().multiplyScalar(Math.cos(this.sideAngle)).add(side.multiplyScalar(Math.sin(this.sideAngle)));

    const camPos = lookAt.clone().add(camDir.multiplyScalar(this.distance));
    camPos.y = Math.max(0.5, lookAt.y + 0.02);

    // Anti-clipping pass for moving characters / scene obstacles
    if (context) {
      CameraCollisionGuard.resolve(camPos, context, { margin: 0.35 });
    }

    camera.position.copy(camPos);
    camera.lookAt(lookAt);
  }
}
