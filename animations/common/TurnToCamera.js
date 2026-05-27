import { AnimationBase, PoseMatrix } from 'dula-engine';

export class TurnToCamera extends AnimationBase {
  constructor() {
    super('TurnToCamera', 0.3);
    this.usePoseMatrix = true;
    this.startRotationY = null;
  }

  getPoseMatrix(t) {
    // TurnToCamera needs to know the character's current rotation to compute
    // the offset. In matrix mode we store the start rotation and compute
    // the incremental offset each frame.
    // NOTE: This animation requires the character reference to work correctly.
    // For now, return a gradual rotation offset that the caller can adjust.
    const pose = new PoseMatrix();
    // Default: rotate toward camera (0 on Y axis) by interpolating
    // The actual offset should be computed relative to current rotation.
    // This simplified version assumes starting from a known offset.
    pose.mesh = { ry: 0 }; // placeholder — actual offset computed in update()
    return pose;
  }

  // Keep old update for compatibility since this animation needs character state
  update(t, character) {
    if (this.startRotationY === null) {
      this.startRotationY = character.mesh.rotation.y;
    }
    const targetY = 0; // face positive Z (camera)
    let diff = targetY - this.startRotationY;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    character.mesh.rotation.y = this.startRotationY + diff * t;
  }
}
