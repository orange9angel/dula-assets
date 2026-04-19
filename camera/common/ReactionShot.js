import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * Reaction shot: medium-close shot on a character's upper body/face,
 * typically used to show listener's reaction during dialogue.
 */
export class ReactionShot extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.characterName = options.characterName ?? 'Shizuka';
    this.distance = options.distance ?? 2.8;
    this.heightOffset = options.heightOffset ?? 0.0;
    this.sideAngle = (options.sideAngle ?? 15) * (Math.PI / 180);
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
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

    this.endPos = lookAt.clone().sub(charDir.multiplyScalar(this.distance));
    this.endPos.y = lookAt.y - 0.15; // slightly lower to capture upper body

    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(this.startPos, this.endPos, eased);
    camera.lookAt(lookAt);
  }
}
