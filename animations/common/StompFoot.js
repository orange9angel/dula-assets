import { AnimationBase, PoseMatrix } from 'dula-engine';

export class StompFoot extends AnimationBase {
  constructor() {
    super('StompFoot', 0.5);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // lift then stomp
    const phase = Math.sin(t * Math.PI);
    pose.leftHip = { rx: -phase * 0.6 };

    // body bounces slightly
    pose.mesh = { y: phase * 0.03 };

    return pose;
  }
}
