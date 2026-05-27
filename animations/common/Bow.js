import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Bow extends AnimationBase {
  constructor() {
    super('Bow', 1.2);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Bend forward 0~45% , hold 45~70%, return 70~100%
    let angle = 0;
    if (t < 0.45) {
      const p = t / 0.45;
      angle = p * p * 0.6; // ease in
    } else if (t < 0.7) {
      angle = 0.6;
    } else {
      const p = (t - 0.7) / 0.3;
      angle = 0.6 * (1 - p) * (1 - p); // ease out
    }

    // Body bends forward + slight forward offset to keep feet planted
    pose.mesh = { rx: angle, z: Math.sin(angle) * 0.35 };
    pose.headGroup = { rx: angle * 0.3 };

    return pose;
  }
}
