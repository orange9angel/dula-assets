import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Think extends AnimationBase {
  constructor() {
    super('Think', 2.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Slow raise to chin
    let raise = 0;
    if (t < 0.2) {
      raise = t / 0.2;
    } else if (t < 0.9) {
      raise = 1;
    } else {
      raise = 1 - (t - 0.9) / 0.1;
    }
    const ease = raise < 0.5 ? 2 * raise * raise : -1 + (4 - 2 * raise) * raise;

    // Hand to chin
    pose.rightShoulder = { rz: ease * 0.5, rx: -ease * 0.9 };

    // Head tilts down thoughtfully
    pose.headGroup = {
      rx: ease * 0.2,
      ry: Math.sin(t * Math.PI * 0.5) * ease * 0.1,
    };

    return pose;
  }
}
