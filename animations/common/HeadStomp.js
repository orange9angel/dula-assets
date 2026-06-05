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
 * HeadStomp - compact jump, two-foot stomp, rebound, recovery.
 */
export class HeadStomp extends AnimationBase {
  constructor() {
    super('HeadStomp', 1.3);
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
      pose.mesh = { y: lerp(0, -0.14, e), rx: lerp(0, 0.12, e) };
      pose.rightHip = { rx: -0.2 * e, rz: 0.08 * e };
      pose.rightKnee = { rx: 0.65 * e };
      pose.rightAnkle = { rx: -0.25 * e };
      pose.leftHip = { rx: -0.2 * e, rz: -0.08 * e };
      pose.leftKnee = { rx: 0.65 * e };
      pose.leftAnkle = { rx: -0.25 * e };
      pose.rightShoulder = { rx: -0.42 * e, rz: -0.34 * e };
      pose.leftShoulder = { rx: -0.42 * e, rz: 0.34 * e };
    } else if (p < 0.36) {
      const e = easeOutCubic((p - 0.16) / 0.2);
      pose.mesh = { y: lerp(-0.14, 1.08, e), rx: lerp(0.12, -0.08, e) };
      pose.rightHip = { rx: lerp(-0.2, 0.22, e), rz: lerp(0.08, 0.16, e) };
      pose.rightKnee = { rx: lerp(0.65, 0.18, e) };
      pose.rightAnkle = { rx: lerp(-0.25, 0.18, e) };
      pose.leftHip = { rx: lerp(-0.2, 0.22, e), rz: lerp(-0.08, -0.16, e) };
      pose.leftKnee = { rx: lerp(0.65, 0.18, e) };
      pose.leftAnkle = { rx: lerp(-0.25, 0.18, e) };
      pose.rightShoulder = { rx: lerp(-0.42, -1.08, e), rz: lerp(-0.34, -0.18, e) };
      pose.leftShoulder = { rx: lerp(-0.42, -1.08, e), rz: lerp(0.34, 0.18, e) };
      pose.headGroup = { rx: -0.06 * e };
    } else if (p < 0.55) {
      const e = easeInOutQuad((p - 0.36) / 0.19);
      pose.mesh = { y: lerp(1.08, 0.18, e), rx: lerp(-0.08, 0.28, e) };
      pose.rightHip = { rx: lerp(0.22, 0.72, e), rz: lerp(0.16, 0.06, e) };
      pose.rightKnee = { rx: lerp(0.18, 0.04, e) };
      pose.rightAnkle = { rx: lerp(0.18, 0.42, e) };
      pose.leftHip = { rx: lerp(0.22, 0.72, e), rz: lerp(-0.16, -0.06, e) };
      pose.leftKnee = { rx: lerp(0.18, 0.04, e) };
      pose.leftAnkle = { rx: lerp(0.18, 0.42, e) };
      pose.rightShoulder = { rx: lerp(-1.08, -1.45, e), rz: lerp(-0.18, -0.12, e) };
      pose.leftShoulder = { rx: lerp(-1.08, -1.45, e), rz: lerp(0.18, 0.12, e) };
    } else if (p < 0.7) {
      const e = easeOutCubic((p - 0.55) / 0.15);
      pose.mesh = { y: lerp(0.18, 0.62, e), rx: lerp(0.28, -0.04, e) };
      pose.rightHip = { rx: lerp(0.72, 0.2, e), rz: lerp(0.06, 0.1, e) };
      pose.rightKnee = { rx: lerp(0.04, 0.34, e) };
      pose.rightAnkle = { rx: lerp(0.42, 0.08, e) };
      pose.leftHip = { rx: lerp(0.72, 0.2, e), rz: lerp(-0.06, -0.1, e) };
      pose.leftKnee = { rx: lerp(0.04, 0.34, e) };
      pose.leftAnkle = { rx: lerp(0.42, 0.08, e) };
      pose.rightShoulder = { rx: lerp(-1.45, -0.62, e), rz: lerp(-0.12, -0.24, e) };
      pose.leftShoulder = { rx: lerp(-1.45, -0.62, e), rz: lerp(0.12, 0.24, e) };
    } else {
      const e = easeInOutQuad((p - 0.7) / 0.3);
      pose.mesh = { y: lerp(0.62, 0, e), rx: lerp(-0.04, 0, e) };
      pose.rightHip = { rx: lerp(0.2, 0, e), rz: lerp(0.1, 0, e) };
      pose.rightKnee = { rx: lerp(0.34, 0, e) };
      pose.rightAnkle = { rx: lerp(0.08, 0, e) };
      pose.leftHip = { rx: lerp(0.2, 0, e), rz: lerp(-0.1, 0, e) };
      pose.leftKnee = { rx: lerp(0.34, 0, e) };
      pose.leftAnkle = { rx: lerp(0.08, 0, e) };
      pose.rightShoulder = { rx: lerp(-0.62, 0, e), rz: lerp(-0.24, 0, e) };
      pose.leftShoulder = { rx: lerp(-0.62, 0, e), rz: lerp(0.24, 0, e) };
      pose.headGroup = { rx: 0 };
    }

    return pose;
  }
}
