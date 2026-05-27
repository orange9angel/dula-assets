import { AnimationBase, PoseMatrix } from 'dula-engine';

export class LookAround extends AnimationBase {
  constructor() {
    super('LookAround', 1.5);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Look left -> center -> right -> center
    let yaw = 0;
    if (t < 0.25) {
      const p = t / 0.25;
      yaw = -0.6 * p * p;
    } else if (t < 0.5) {
      const p = (t - 0.25) / 0.25;
      yaw = -0.6 * (1 - p) * (1 - p);
    } else if (t < 0.75) {
      const p = (t - 0.5) / 0.25;
      yaw = 0.6 * p * p;
    } else {
      const p = (t - 0.75) / 0.25;
      yaw = 0.6 * (1 - p) * (1 - p);
    }

    pose.headGroup = { ry: yaw };
    return pose;
  }
}
