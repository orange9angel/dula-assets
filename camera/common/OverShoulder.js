import * as THREE from 'three';
import { CameraMoveBase, CameraCollisionGuard } from 'dula-engine';

/**
 * Over-the-shoulder shot: camera sits behind one character's shoulder,
 * looking at another character. Creates a cinematic dialogue feel.
 *
 * Anti-clipping enhancements:
 * - target == shooter is detected and automatically remapped to a different shooter
 * - camera is kept outside both characters' bounding spheres
 * - minimum distance to the target is enforced
 */
export class OverShoulder extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    // Support both naming conventions:
    // - legacy: subject (who we're looking at) / over (whose shoulder we're over)
    // - story DSL: target (who we're looking at) / shooter (whose shoulder we're over)
    this.subject = options.subject ?? options.target ?? 'Shizuka';
    this.over = options.over ?? options.shooter ?? 'Nobita';
    this.distance = options.distance ?? 2.5;
    this.shoulderOffset = options.shoulderOffset ?? 0.6;
    this.height = options.height ?? 1.8;
    this.lookAtHeight = options.lookAtHeight ?? 1.6;
    this.minMargin = options.minMargin ?? 0.35;
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
    this._validateRoles(context);
  }

  update(t, camera, context) {
    const overChar = context.characters.get(this.over);
    const subjectChar = context.characters.get(this.subject);
    if (!overChar || !subjectChar) return;

    const overPos = overChar.mesh.position.clone();
    const subjectPos = subjectChar.mesh.position.clone();

    // Direction from over-char to subject
    const dir = new THREE.Vector3().subVectors(subjectPos, overPos);
    if (dir.lengthSq() < 0.001) {
      // Fallback if characters are at the same position: look toward +Z
      dir.set(0, 0, 1);
    }
    dir.normalize();

    // Camera sits slightly behind and to the side of the over-char's shoulder
    const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(this.shoulderOffset);
    this.endPos = overPos.clone()
      .add(dir.multiplyScalar(-0.8)) // slightly behind
      .add(side)
      .add(new THREE.Vector3(0, this.height, 0));

    const lookAt = subjectPos.clone().add(new THREE.Vector3(0, this.lookAtHeight, 0));

    // Enforce minimum distance from subject's head/face
    const subjectRadius = subjectChar.boundingRadius || 0.5;
    const minSubjectDist = subjectRadius * 0.6 + this.minMargin;
    const toSubject = new THREE.Vector3().subVectors(this.endPos, subjectPos);
    toSubject.y = 0;
    const distToSubject = toSubject.length();
    if (distToSubject < minSubjectDist && distToSubject > 0.001) {
      toSubject.normalize().multiplyScalar(minSubjectDist);
      this.endPos.x = subjectPos.x + toSubject.x;
      this.endPos.z = subjectPos.z + toSubject.z;
    }

    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);
    // Clamp camera above ground
    desiredPos.y = Math.max(0.5, desiredPos.y);

    // Final anti-clipping pass: push camera out of all characters and scene geometry
    if (context) {
      CameraCollisionGuard.resolve(desiredPos, context, { margin: this.minMargin });
    }

    camera.position.copy(desiredPos);
    camera.lookAt(lookAt);
  }

  _validateRoles(context) {
    if (this.subject === this.over) {
      console.warn(`[OverShoulder] target and shooter are both "${this.subject}". ` +
        `This places the camera inside the character. Auto-remapping shooter.`);
      const others = Array.from(context.characters.keys()).filter((name) => name !== this.subject);
      if (others.length > 0) {
        this.over = others[0];
      } else {
        // No other character available: fall back to looking over the subject's shoulder at +Z
        this.over = this.subject;
      }
    }
  }

}
