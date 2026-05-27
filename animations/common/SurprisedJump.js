import { AnimationBase, PoseMatrix } from 'dula-engine';

export class SurprisedJump extends AnimationBase {
  constructor() {
    super('SurprisedJump', 0.6);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Jump arc: quick up then down
    const y = Math.sin(t * Math.PI) * 0.4;
    pose.mesh = { y };

    // Arms fling up
    const fling = Math.sin(t * Math.PI);
    pose.rightShoulder = { rz: fling * 1.0 };
    pose.leftShoulder = { rz: -fling * 1.0 };

    // Head snaps back
    pose.headGroup = { rx: -Math.sin(t * Math.PI) * 0.25 };

    return pose;
  }
}
