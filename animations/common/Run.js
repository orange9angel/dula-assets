import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Run extends AnimationBase {
  constructor() {
    super('Run', 0.6);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const stride = 0.8;
    const freq = Math.PI * 6;

    pose.leftHip = { rx: Math.sin(t * freq) * stride };
    pose.rightHip = { rx: Math.sin(t * freq + Math.PI) * stride };

    // Body lean forward + larger bob
    pose.mesh = { rx: 0.15, y: Math.abs(Math.sin(t * freq)) * 0.08 };

    // Arms swing opposite to legs
    pose.rightShoulder = { rz: Math.sin(t * freq + Math.PI) * 0.4 };
    pose.leftShoulder = { rz: Math.sin(t * freq) * 0.4 };

    return pose;
  }
}
