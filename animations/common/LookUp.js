import { AnimationBase, PoseMatrix } from 'dula-engine';

export class LookUp extends AnimationBase {
  constructor() {
    super('LookUp', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    const ease = t < 0.3 ? t / 0.3 : 1;
    const easeOut = ease * (2 - ease);

    // Head tilts back to look up
    pose.headGroup = { rx: -easeOut * 0.5 };

    // Body leans back slightly
    pose.mesh = { rx: -easeOut * 0.1 };

    return pose;
  }
}
