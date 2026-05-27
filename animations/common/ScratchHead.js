import { AnimationBase, PoseMatrix } from 'dula-engine';

export class ScratchHead extends AnimationBase {
  constructor() {
    super('ScratchHead', 1.2);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Reach up -> scratch (small oscillation) -> lower
    if (t < 0.25) {
      const p = t / 0.25;
      pose.rightShoulder = { rz: p * p * 0.9, rx: -p * p * 1.0 };
    } else if (t < 0.75) {
      const p = (t - 0.25) / 0.5;
      pose.rightShoulder = {
        rz: 0.9 + Math.sin(p * Math.PI * 6) * 0.08,
        rx: -1.0 + Math.sin(p * Math.PI * 4) * 0.05,
      };
      // Head tilts slightly toward scratching hand
      pose.headGroup = { rz: Math.sin(p * Math.PI * 6) * 0.05 };
    } else {
      const p = (t - 0.75) / 0.25;
      pose.rightShoulder = {
        rz: 0.9 * (1 - p) * (1 - p),
        rx: -1.0 * (1 - p) * (1 - p),
      };
      pose.headGroup = { rz: 0 };
    }

    return pose;
  }
}
