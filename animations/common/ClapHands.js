import { AnimationBase, PoseMatrix } from 'dula-engine';

export class ClapHands extends AnimationBase {
  constructor() {
    super('ClapHands', 0.8);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Raise arms to chest height first 20%
    let raise = 0;
    if (t < 0.2) {
      raise = t / 0.2;
    } else if (t < 0.8) {
      raise = 1;
    } else {
      raise = 1 - (t - 0.8) / 0.2;
    }
    const ease = raise < 0.5 ? 2 * raise * raise : -1 + (4 - 2 * raise) * raise;

    // Arms raised in front
    let rRz = ease * 0.4;
    let lRz = -ease * 0.4;
    const rRx = -ease * 0.6;
    const lRx = -ease * 0.6;

    // Clapping motion during 20%~80%
    if (t >= 0.2 && t < 0.8) {
      const p = (t - 0.2) / 0.6;
      const clap = Math.abs(Math.sin(p * Math.PI * 6)) * 0.15;
      rRz = 0.4 + clap;
    }

    pose.rightShoulder = { rz: rRz, rx: rRx };
    pose.leftShoulder = { rz: lRz, rx: lRx };

    return pose;
  }
}
