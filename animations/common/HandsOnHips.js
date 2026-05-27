import { AnimationBase, PoseMatrix } from 'dula-engine';

export class HandsOnHips extends AnimationBase {
  constructor() {
    super('HandsOnHips', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Move to hips and hold
    let p = 0;
    if (t < 0.3) {
      p = t / 0.3;
    } else if (t < 0.7) {
      p = 1;
    } else {
      p = 1 - (t - 0.7) / 0.3;
    }
    const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

    // Arms bent akimbo
    pose.rightShoulder = { rz: -ease * 0.5, rx: -ease * 0.3 };
    pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.3 };

    // Slight confident chest puff
    pose.mesh = { rx: -ease * 0.05 };

    return pose;
  }
}
