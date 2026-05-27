import { AnimationBase, PoseMatrix } from 'dula-engine';

export class WaveUp extends AnimationBase {
  constructor() {
    super('WaveUp', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    // Wave high above head
    const angle = Math.sin(t * Math.PI * 5) * 0.35;
    const rArmZ = angle;
    const rArmX = -1.0 + Math.sin(t * Math.PI * 3) * 0.1;

    const pose = new PoseMatrix();
    pose.rightShoulder = { rx: rArmX, rz: rArmZ };
    pose.headGroup = { rx: -0.25 };
    return pose;
  }
}
