import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * Tracking close-up: follows a moving character while maintaining a tight face shot.
 * Similar to FollowCharacter but much closer and focused on the head.
 */
export class TrackingCloseUp extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.characterName = options.characterName ?? 'Nobita';
    this.distance = options.distance ?? 2.8;
    this.heightOffset = options.heightOffset ?? 0.05;
    this.sideAngle = (options.sideAngle ?? 10) * (Math.PI / 180);
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

    const lookAt = headPos.clone().add(new THREE.Vector3(0, this.heightOffset, 0));

    // Use world forward projected onto XZ plane so lookAt() tilts don't break framing
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(char.mesh.quaternion);
    forward.y = 0;
    if (forward.lengthSq() < 0.001) forward.set(0, 0, 1);
    forward.normalize();
    const side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const camDir = forward.clone().multiplyScalar(Math.cos(this.sideAngle)).add(side.multiplyScalar(Math.sin(this.sideAngle)));

    const camPos = lookAt.clone().sub(camDir.multiplyScalar(this.distance));
    camPos.y = lookAt.y + 0.02;

    camera.position.copy(camPos);
    camera.lookAt(lookAt);
  }
}
