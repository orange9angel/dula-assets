import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Nod extends AnimationBase {
  constructor() {
    super('Nod', 0.5);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const angle = Math.sin(t * Math.PI) * 0.15;
    pose.headGroup = { rx: angle };
    return pose;
  }
}
