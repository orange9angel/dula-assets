import { AnimationBase, PoseMatrix } from 'dula-engine';

export class WaveHand extends AnimationBase {
  constructor() {
    super('WaveHand', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const angle = Math.sin(t * Math.PI * 4) * 0.5;
    pose.rightShoulder = { rz: angle };
    return pose;
  }
}
