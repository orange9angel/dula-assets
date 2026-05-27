import { AnimationBase, PoseMatrix } from 'dula-engine';

export class SitDown extends AnimationBase {
  constructor() {
    super('SitDown', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Lower body, bend knees
    let p = 0;
    if (t < 0.4) {
      p = t / 0.4;
    } else {
      p = 1;
    }
    const ease = p * (2 - p);

    // Body drops about 0.4 units + leans slightly forward
    pose.mesh = { y: -ease * 0.4, rx: ease * 0.15 };

    // Knees bend forward
    pose.leftHip = { rx: -ease * 0.9 };
    pose.rightHip = { rx: -ease * 0.9 };

    // Arms rest on knees or lap
    pose.rightShoulder = { rz: ease * 0.2, rx: -ease * 0.4 };
    pose.leftShoulder = { rz: -ease * 0.2, rx: -ease * 0.4 };

    return pose;
  }
}
