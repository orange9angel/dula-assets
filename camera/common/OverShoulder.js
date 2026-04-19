import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * Over-the-shoulder shot: camera sits behind one character's shoulder,
 * looking at another character. Creates a cinematic dialogue feel.
 */
export class OverShoulder extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.subject = options.subject ?? 'Shizuka';   // who we're looking at
    this.over = options.over ?? 'Nobita';          // whose shoulder we're over
    this.distance = options.distance ?? 2.5;
    this.shoulderOffset = options.shoulderOffset ?? 0.6;
    this.height = options.height ?? 1.8;
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
  }

  update(t, camera, context) {
    const overChar = context.characters.get(this.over);
    const subjectChar = context.characters.get(this.subject);
    if (!overChar || !subjectChar) return;

    const overPos = overChar.mesh.position.clone();
    const subjectPos = subjectChar.mesh.position.clone();

    // Direction from over-char to subject
    const dir = new THREE.Vector3().subVectors(subjectPos, overPos).normalize();

    // Camera sits slightly behind and to the side of the over-char's shoulder
    const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(this.shoulderOffset);
    this.endPos = overPos.clone()
      .add(dir.multiplyScalar(-0.8)) // slightly behind
      .add(side)
      .add(new THREE.Vector3(0, this.height, 0));

    const lookAt = subjectPos.clone().add(new THREE.Vector3(0, 1.6, 0));

    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(this.startPos, this.endPos, eased);
    camera.lookAt(lookAt);
  }
}
