import { AnimationBase, PoseMatrix } from 'dula-engine';

export class ReachOut extends AnimationBase {
  constructor() {
    super('ReachOut', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    const ease = t < 0.3 ? t / 0.3 : 1;
    const easeOut = ease * (2 - ease);

    // Right arm reaches forward/up
    pose.rightShoulder = { rz: easeOut * 0.2, rx: -easeOut * 1.2 };

    // Slight body lean
    pose.mesh = { rx: easeOut * 0.15 };

    return pose;
  }
}
