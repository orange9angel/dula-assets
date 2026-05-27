import { AnimationBase, PoseMatrix } from 'dula-engine';

export class ShakeHead extends AnimationBase {
  constructor() {
    super('ShakeHead', 0.8);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    // Three shakes
    const shakes = Math.sin(t * Math.PI * 6);
    pose.headGroup = { ry: shakes * 0.35 };
    return pose;
  }
}
