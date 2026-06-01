import { AnimationBase, PoseMatrix } from 'dula-engine';

function positiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function clamp01(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(1, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInQuad(t) {
  return t * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function heightValue(value, fallback) {
  if (typeof value === 'string') {
    const named = { low: 0.9, mid: 1.28, medium: 1.28, high: 1.55 };
    if (named[value] !== undefined) return named[value];
  }
  return positiveNumber(value, fallback);
}

/**
 * Kick — 前踢
 */
export class Kick extends AnimationBase {
  constructor(options = {}) {
    super('Kick', positiveNumber(options.duration, 0.72));
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };

    this.leg = options.leg === 'left' ? 'left' : 'right';
    this.power = clamp01(options.power ?? 0.85, 0.85);
    this.height = heightValue(options.height ?? options.kickHeight, 1.28);
    this.chamber = positiveNumber(options.chamber, 0.72);
    this.extension = positiveNumber(options.extension, 0.08);
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const p = Math.max(0, Math.min(1, t));
    const isLeft = this.leg === 'left';
    const side = isLeft ? -1 : 1;

    let hipRx = 0;
    let hipRz = 0;
    let kneeRx = 0;
    let ankleRx = 0;
    let supportKneeRx = 0;
    let bodyRx = 0;
    let bodyRy = 0;
    let bodyX = 0;
    let bodyY = 0;
    let guard = 0;
    let counterSwing = 0;

    const chamberHip = -this.chamber;
    const chamberKnee = 1.25 * this.power;
    const impactHip = -this.height * this.power;
    const impactKnee = this.extension;
    const impactAnkle = -0.28 - 0.22 * this.power;

    if (p < 0.24) {
      const e = easeInQuad(p / 0.24);
      hipRx = lerp(0, chamberHip, e);
      hipRz = lerp(0, side * 0.08, e);
      kneeRx = lerp(0, chamberKnee, e);
      ankleRx = lerp(0, -0.22, e);
      supportKneeRx = lerp(0, 0.2, e);
      bodyRx = lerp(0, -0.08, e);
      bodyRy = lerp(0, -side * 0.12, e);
      bodyX = lerp(0, -side * 0.04, e);
      bodyY = lerp(0, -0.03, e);
      guard = e;
      counterSwing = -0.2 * e;
    } else if (p < 0.48) {
      const e = easeOutCubic((p - 0.24) / 0.24);
      hipRx = lerp(chamberHip, impactHip, e);
      hipRz = lerp(side * 0.08, side * 0.03, e);
      kneeRx = lerp(chamberKnee, impactKnee, e);
      ankleRx = lerp(-0.22, impactAnkle, e);
      supportKneeRx = lerp(0.2, 0.28, e);
      bodyRx = lerp(-0.08, -0.22, e);
      bodyRy = lerp(-side * 0.12, side * 0.08, e);
      bodyX = lerp(-side * 0.04, -side * 0.12, e);
      bodyY = lerp(-0.03, 0.04, e);
      guard = 1;
      counterSwing = lerp(-0.2, 0.26, e);
    } else if (p < 0.62) {
      hipRx = impactHip;
      hipRz = side * 0.03;
      kneeRx = impactKnee;
      ankleRx = impactAnkle;
      supportKneeRx = 0.28;
      bodyRx = -0.22;
      bodyRy = side * 0.08;
      bodyX = -side * 0.12;
      bodyY = 0.04;
      guard = 1;
      counterSwing = 0.26;
    } else {
      const e = easeInOutQuad((p - 0.62) / 0.38);
      hipRx = lerp(impactHip, 0, e);
      hipRz = lerp(side * 0.03, 0, e);
      kneeRx = lerp(impactKnee, 0, e);
      ankleRx = lerp(impactAnkle, 0, e);
      supportKneeRx = lerp(0.28, 0, e);
      bodyRx = lerp(-0.22, 0, e);
      bodyRy = lerp(side * 0.08, 0, e);
      bodyX = lerp(-side * 0.12, 0, e);
      bodyY = lerp(0.04, 0, e);
      guard = lerp(1, 0, e);
      counterSwing = lerp(0.26, 0, e);
    }

    const activeHip = { rx: hipRx, rz: hipRz };
    const activeKnee = { rx: kneeRx };
    const activeAnkle = { rx: ankleRx };
    const supportKnee = { rx: supportKneeRx };

    if (isLeft) {
      pose.leftHip = activeHip;
      pose.leftKnee = activeKnee;
      pose.leftAnkle = activeAnkle;
      pose.rightKnee = supportKnee;
      pose.rightShoulder = { rx: -0.72 * guard, rz: -0.24 * guard };
      pose.rightElbow = { rx: -0.75 * guard };
      pose.leftShoulder = { rx: counterSwing, rz: 0.12 * guard };
      pose.leftElbow = { rx: -0.28 * guard };
    } else {
      pose.rightHip = activeHip;
      pose.rightKnee = activeKnee;
      pose.rightAnkle = activeAnkle;
      pose.leftKnee = supportKnee;
      pose.leftShoulder = { rx: -0.72 * guard, rz: 0.24 * guard };
      pose.leftElbow = { rx: -0.75 * guard };
      pose.rightShoulder = { rx: counterSwing, rz: -0.12 * guard };
      pose.rightElbow = { rx: -0.28 * guard };
    }

    pose.mesh = { x: bodyX, y: bodyY, rx: bodyRx, ry: bodyRy };
    pose.headGroup = { rx: -bodyRx * 0.35, ry: bodyRy * 0.25 };

    return pose;
  }
}
