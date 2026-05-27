import { AnimationBase, PoseMatrix } from 'dula-engine';

export class FlailArms extends AnimationBase {
  constructor() {
    super('FlailArms', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Chaotic arm waving
    const rAngle = Math.sin(t * Math.PI * 8) * 0.7;
    const lAngle = Math.sin(t * Math.PI * 8 + 1.5) * 0.7;

    pose.rightShoulder = { rz: rAngle, rx: Math.sin(t * Math.PI * 6) * 0.4 };
    pose.leftShoulder = { rz: lAngle, rx: Math.sin(t * Math.PI * 6 + 2) * 0.4 };

    // Body shakes
    pose.mesh = { rz: Math.sin(t * Math.PI * 10) * 0.06 };

    return pose;
  }
}
