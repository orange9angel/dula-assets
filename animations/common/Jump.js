import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Jump extends AnimationBase {
  constructor() {
    super('Jump', 0.6);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const y = Math.sin(t * Math.PI) * 0.5;
    pose.mesh = { y };
    return pose;
  }
}
