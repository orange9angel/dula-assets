import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Swim extends AnimationBase {
  constructor() {
    super('Swim', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Crawl stroke - arms reach high out of water then pull
    const cycle = t * Math.PI * 2;

    // Arm reaches forward/up out of water, then pulls back under
    pose.rightShoulder = {
      rz: Math.sin(cycle) * 0.7,
      rx: Math.cos(cycle) * 0.8 - 0.2,
    };

    // Opposite phase
    pose.leftShoulder = {
      rz: Math.sin(cycle + Math.PI) * 0.7,
      rx: Math.cos(cycle + Math.PI) * 0.8 - 0.2,
    };

    // Body bobs with breathing + slight body roll
    pose.mesh = { y: Math.sin(cycle * 2) * 0.05, rz: Math.sin(cycle) * 0.06 };

    return pose;
  }
}
