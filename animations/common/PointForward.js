import { AnimationBase, PoseMatrix } from 'dula-engine';

export class PointForward extends AnimationBase {
  constructor() {
    super('PointForward', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Raise -> point -> hold -> lower
    let raise = 0;
    if (t < 0.2) {
      raise = t / 0.2;
    } else if (t < 0.7) {
      raise = 1;
    } else {
      raise = 1 - (t - 0.7) / 0.3;
    }
    const ease = raise * (2 - raise); // ease out

    pose.rightShoulder = { rz: ease * 0.6, rx: -ease * 0.8 };

    // Head follows the pointing direction slightly
    if (t > 0.2 && t < 0.7) {
      pose.headGroup = { ry: 0.15 * Math.sin((t - 0.2) * Math.PI * 2) };
    }

    return pose;
  }
}
