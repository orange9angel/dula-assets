import { AnimationBase, PoseMatrix } from 'dula-engine';

function clamp01(t) {
  return Math.max(0, Math.min(1, t));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - clamp01(t), 3);
}

function easeInOutQuad(t) {
  const p = clamp01(t);
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

/**
 * GalaxyWhirl - in-place spinning throw pose.
 *
 * This version avoids root X travel and returns to zero rotation cleanly.
 */
export class GalaxyWhirl extends AnimationBase {
  constructor() {
    super('GalaxyWhirl', 2.0);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'alien'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const p = clamp01(t);

    if (p < 0.18) {
      const e = easeOutCubic(p / 0.18);
      pose.mesh = { y: lerp(0, -0.08, e), rx: lerp(0, 0.12, e), ry: lerp(0, -0.22, e) };
      pose.rightShoulder = { rx: -0.74 * e, rz: -0.46 * e };
      pose.rightElbow = { rx: -1.05 * e };
      pose.leftShoulder = { rx: -0.74 * e, rz: 0.46 * e };
      pose.leftElbow = { rx: -1.05 * e };
      pose.rightHip = { rx: 0.28 * e, rz: -0.08 * e };
      pose.rightKnee = { rx: 0.55 * e };
      pose.leftHip = { rx: 0.28 * e, rz: 0.08 * e };
      pose.leftKnee = { rx: 0.55 * e };
    } else if (p < 0.66) {
      const q = (p - 0.18) / 0.48;
      const spin = q * Math.PI * 4;
      const pulse = Math.sin(q * Math.PI);
      pose.mesh = {
        y: -0.08 + pulse * 0.08,
        rx: Math.sin(spin) * 0.16,
        rz: Math.cos(spin) * 0.08,
        ry: -0.22 + spin,
      };
      pose.rightShoulder = { rx: -0.82, rz: -0.52 };
      pose.rightElbow = { rx: -1.18 };
      pose.leftShoulder = { rx: -0.82, rz: 0.52 };
      pose.leftElbow = { rx: -1.18 };
      pose.rightHip = { rx: 0.34, rz: -0.09 };
      pose.rightKnee = { rx: 0.72 };
      pose.leftHip = { rx: 0.34, rz: 0.09 };
      pose.leftKnee = { rx: 0.72 };
      pose.headGroup = { ry: Math.sin(spin) * 0.12 };
    } else if (p < 0.82) {
      const e = easeOutCubic((p - 0.66) / 0.16);
      pose.mesh = { y: lerp(0, 0.06, e), rx: lerp(0, -0.18, e), ry: lerp(Math.PI * 4 - 0.22, Math.PI * 4 + 0.42, e) };
      pose.rightShoulder = { rx: lerp(-0.82, -1.45, e), rz: lerp(-0.52, -0.15, e) };
      pose.rightElbow = { rx: lerp(-1.18, -0.32, e) };
      pose.leftShoulder = { rx: lerp(-0.82, -1.45, e), rz: lerp(0.52, 0.15, e) };
      pose.leftElbow = { rx: lerp(-1.18, -0.32, e) };
      pose.rightHip = { rx: lerp(0.34, 0.18, e), rz: lerp(-0.09, 0, e) };
      pose.rightKnee = { rx: lerp(0.72, 0.3, e) };
      pose.leftHip = { rx: lerp(0.34, 0.18, e), rz: lerp(0.09, 0, e) };
      pose.leftKnee = { rx: lerp(0.72, 0.3, e) };
    } else {
      const e = easeInOutQuad((p - 0.82) / 0.18);
      pose.mesh = { y: lerp(0.06, 0, e), rx: lerp(-0.18, 0, e), rz: 0, ry: lerp(Math.PI * 4 + 0.42, 0, e) };
      pose.rightShoulder = { rx: lerp(-1.45, 0, e), rz: lerp(-0.15, 0, e) };
      pose.rightElbow = { rx: lerp(-0.32, 0, e) };
      pose.leftShoulder = { rx: lerp(-1.45, 0, e), rz: lerp(0.15, 0, e) };
      pose.leftElbow = { rx: lerp(-0.32, 0, e) };
      pose.rightHip = { rx: lerp(0.18, 0, e), rz: 0 };
      pose.rightKnee = { rx: lerp(0.3, 0, e) };
      pose.leftHip = { rx: lerp(0.18, 0, e), rz: 0 };
      pose.leftKnee = { rx: lerp(0.3, 0, e) };
      pose.headGroup = { ry: 0 };
    }

    return pose;
  }
}
