import { AnimationBase, PoseMatrix } from 'dula-engine';

export class SwayBody extends AnimationBase {
  constructor() {
    super('SwayBody', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    pose.mesh = { rz: Math.sin(t * Math.PI * 4) * 0.12 };

    return pose;
  }
}
