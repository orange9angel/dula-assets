import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Celebrate extends AnimationBase {
  constructor() {
    super('Celebrate', 1.2);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    // Arms up with bounce
    const bounce = Math.abs(Math.sin(t * Math.PI * 4)) * 0.1;

    // Quick raise then celebratory pump
    let raise = 1;
    if (t < 0.15) {
      raise = t / 0.15;
    }
    const ease = raise * (2 - raise);

    const rArmZ = ease * 1.2 + bounce;
    const lArmZ = -ease * 1.2 - bounce;
    const rArmX = -ease * 0.3;
    const lArmX = -ease * 0.3;

    const pose = new PoseMatrix();
    pose.mesh = { y: bounce };
    pose.rightShoulder = { rx: rArmX, rz: rArmZ };
    pose.leftShoulder = { rx: lArmX, rz: lArmZ };
    pose.headGroup = { rx: -ease * 0.2 };
    return pose;
  }
}
