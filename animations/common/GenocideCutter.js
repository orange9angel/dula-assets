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
 * GenocideCutter - in-place rising cutter kick.
 *
 * The old version used very large root offsets and did not settle cleanly.
 * This keeps the action vertical, readable, and back at zero pose by the end.
 */
export class GenocideCutter extends AnimationBase {
  constructor() {
    super('GenocideCutter', 1.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'alien'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const p = clamp01(t);

    if (p < 0.16) {
      const e = easeOutCubic(p / 0.16);
      pose.mesh = { y: lerp(0, -0.12, e), rx: lerp(0, 0.08, e), ry: lerp(0, -0.22, e) };
      pose.leftHip = { rx: 0.22 * e, rz: -0.08 * e };
      pose.leftKnee = { rx: 0.45 * e };
      pose.leftAnkle = { rx: -0.2 * e };
      pose.rightHip = { rx: -0.45 * e, rz: 0.18 * e };
      pose.rightKnee = { rx: 0.82 * e };
      pose.rightAnkle = { rx: -0.22 * e };
      pose.rightShoulder = { rx: -0.18 * e, rz: -0.55 * e };
      pose.leftShoulder = { rx: -0.1 * e, rz: 0.42 * e };
    } else if (p < 0.42) {
      const e = easeOutCubic((p - 0.16) / 0.26);
      const y = lerp(-0.12, 0.72, e);
      pose.mesh = { y, rx: lerp(0.08, -0.16, e), ry: lerp(-0.22, 0.28, e) };
      pose.leftHip = { rx: lerp(0.22, 0.12, e), rz: -0.08 };
      pose.leftKnee = { rx: lerp(0.45, 0.18, e) };
      pose.leftAnkle = { rx: lerp(-0.2, 0.04, e) };
      pose.rightHip = { rx: lerp(-0.45, -1.38, e), rz: lerp(0.18, 0.36, e) };
      pose.rightKnee = { rx: lerp(0.82, 0.08, e) };
      pose.rightAnkle = { rx: lerp(-0.22, 0.34, e) };
      pose.rightShoulder = { rx: lerp(-0.18, -0.7, e), rz: lerp(-0.55, -0.32, e) };
      pose.leftShoulder = { rx: lerp(-0.1, 0.15, e), rz: lerp(0.42, 0.62, e) };
      pose.headGroup = { rx: -0.08 * e, ry: 0.12 * e };
    } else if (p < 0.58) {
      const e = easeInOutQuad((p - 0.42) / 0.16);
      pose.mesh = { y: lerp(0.72, 0.58, e), rx: lerp(-0.16, -0.08, e), ry: lerp(0.28, 0.18, e) };
      pose.leftHip = { rx: 0.1, rz: -0.06 };
      pose.leftKnee = { rx: 0.12 };
      pose.leftAnkle = { rx: 0.02 };
      pose.rightHip = { rx: lerp(-1.38, -1.05, e), rz: lerp(0.36, 0.24, e) };
      pose.rightKnee = { rx: lerp(0.08, 0.18, e) };
      pose.rightAnkle = { rx: lerp(0.34, 0.2, e) };
      pose.rightShoulder = { rx: -0.62, rz: -0.28 };
      pose.leftShoulder = { rx: 0.1, rz: 0.58 };
    } else if (p < 0.76) {
      const e = easeInOutQuad((p - 0.58) / 0.18);
      pose.mesh = { y: lerp(0.58, -0.08, e), rx: lerp(-0.08, 0.08, e), ry: lerp(0.18, 0.04, e) };
      pose.leftHip = { rx: lerp(0.1, 0.28, e), rz: lerp(-0.06, 0, e) };
      pose.leftKnee = { rx: lerp(0.12, 0.52, e) };
      pose.leftAnkle = { rx: lerp(0.02, -0.22, e) };
      pose.rightHip = { rx: lerp(-1.05, -0.18, e), rz: lerp(0.24, 0.02, e) };
      pose.rightKnee = { rx: lerp(0.18, 0.52, e) };
      pose.rightAnkle = { rx: lerp(0.2, -0.18, e) };
      pose.rightShoulder = { rx: lerp(-0.62, -0.16, e), rz: lerp(-0.28, -0.2, e) };
      pose.leftShoulder = { rx: lerp(0.1, -0.08, e), rz: lerp(0.58, 0.2, e) };
    } else {
      const e = easeInOutQuad((p - 0.76) / 0.24);
      pose.mesh = { y: lerp(-0.08, 0, e), rx: lerp(0.08, 0, e), ry: lerp(0.04, 0, e) };
      pose.leftHip = { rx: lerp(0.28, 0, e), rz: 0 };
      pose.leftKnee = { rx: lerp(0.52, 0, e) };
      pose.leftAnkle = { rx: lerp(-0.22, 0, e) };
      pose.rightHip = { rx: lerp(-0.18, 0, e), rz: lerp(0.02, 0, e) };
      pose.rightKnee = { rx: lerp(0.52, 0, e) };
      pose.rightAnkle = { rx: lerp(-0.18, 0, e) };
      pose.rightShoulder = { rx: lerp(-0.16, 0, e), rz: lerp(-0.2, 0, e) };
      pose.leftShoulder = { rx: lerp(-0.08, 0, e), rz: lerp(0.2, 0, e) };
      pose.headGroup = { rx: 0, ry: 0 };
    }

    return pose;
  }
}
