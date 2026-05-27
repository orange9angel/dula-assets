import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Tremble extends AnimationBase {
  constructor() {
    super('Tremble', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const intensity = 0.03;
    const freq = 25;

    // Random-ish trembling using multiple sine waves
    const x = Math.sin(t * freq) * intensity + Math.sin(t * freq * 1.7) * intensity * 0.5;
    const y = Math.sin(t * freq * 1.3) * intensity * 0.7;
    const z = Math.sin(t * freq * 0.9) * intensity;

    // Slight rotation tremble
    const rz = Math.sin(t * freq * 1.1) * 0.02;

    // Arms hug self slightly (offset from baseline)
    const rArmZ = -0.15 + Math.sin(t * freq) * 0.03;
    const lArmZ = 0.15 + Math.sin(t * freq * 1.2) * 0.03;

    const pose = new PoseMatrix();
    pose.mesh = { x, y, z, rz };
    pose.rightShoulder = { rz: rArmZ };
    pose.leftShoulder = { rz: lArmZ };
    return pose;
  }
}
