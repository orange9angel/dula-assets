import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Walk extends AnimationBase {
  constructor() {
    super('Walk', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const freq = Math.PI * 4;

    // alternating leg swing
    pose.leftHip = { rx: Math.sin(t * freq) * 0.5 };
    pose.rightHip = { rx: Math.sin(t * freq + Math.PI) * 0.5 };

    // slight body bob
    pose.mesh = { y: Math.abs(Math.sin(t * freq)) * 0.05 };

    // slight arm swing opposite to legs
    pose.rightShoulder = { rz: Math.sin(t * freq + Math.PI) * 0.15 };
    pose.leftShoulder = { rz: Math.sin(t * freq) * 0.15 };

    return pose;
  }
}
