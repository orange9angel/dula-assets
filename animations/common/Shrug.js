import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Shrug extends AnimationBase {
  constructor() {
    super('Shrug', 0.8);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Shrug up -> hold -> down
    let p = 0;
    if (t < 0.3) {
      p = t / 0.3;
    } else if (t < 0.6) {
      p = 1;
    } else {
      p = 1 - (t - 0.6) / 0.4;
    }
    const ease = Math.sin(p * Math.PI * 0.5);

    // Shoulders come up (arms rotate inward and up)
    pose.rightShoulder = { rz: -ease * 0.3, rx: -ease * 0.2 };
    pose.leftShoulder = { rz: ease * 0.3, rx: -ease * 0.2 };

    // Head tilts in confusion
    pose.headGroup = { rz: ease * 0.1, rx: ease * 0.1 };

    return pose;
  }
}
