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
    this.distance = options.distance ?? 1.5;
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

    const charDir = new THREE.Vector3(0, 0, 1);
    charDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), char.mesh.rotation.y + this.sideAngle);

    const camPos = lookAt.clone().sub(charDir.multiplyScalar(this.distance));
    camPos.y = lookAt.y + 0.02;

    camera.position.copy(camPos);
    camera.lookAt(lookAt);
  }
}
