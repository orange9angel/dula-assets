import { AnimationBase, PoseMatrix } from 'dula-engine';

function positiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function firstNumber(options, keys, fallback) {
  for (const key of keys) {
    if (options[key] !== undefined) return positiveNumber(options[key], fallback);
  }
  return fallback;
}

function legLiftValue(value, fallback) {
  if (typeof value === 'string') {
    const named = { low: 0.16, mid: 0.28, medium: 0.28, high: 0.42 };
    if (named[value] !== undefined) return named[value];
  }
  return positiveNumber(value, fallback);
}

export class Walk extends AnimationBase {
  constructor(options = {}) {
    super('Walk', positiveNumber(options.duration, 1.0));
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this.stepFrequency = firstNumber(
      options,
      ['frequency', 'cadence', 'stepFrequency', 'stepsPerSecond'],
      1.9
    );
    this.stride = firstNumber(options, ['stride', 'strideLength', 'legSwing'], 0.42);
    this.legLift = legLiftValue(
      options.legLift ?? options.liftHeight ?? options.kneeLift ?? options.height,
      0.28
    );
    this.armSwing = firstNumber(options, ['armSwing', 'armPower'], 0.28);
    this.bodyBob = firstNumber(options, ['bodyBob', 'bob', 'bounce'], 0.035);
    this.lean = firstNumber(options, ['lean', 'forwardLean'], 0.035);
  }

  getPoseMatrix(t, elapsed = t * this.duration) {
    const pose = new PoseMatrix();
    const phase = elapsed * Math.PI * this.stepFrequency;
    const gait = Math.sin(phase);
    const leftForward = Math.max(0, gait);
    const rightForward = Math.max(0, -gait);
    const footfall = Math.abs(gait);

    // In this rig negative hip rx swings the leg visually forward.
    pose.leftHip = { rx: -gait * this.stride, rz: gait * 0.04 };
    pose.leftKnee = { rx: leftForward * this.legLift + (1 - leftForward) * 0.08 };
    pose.leftAnkle = { rx: -leftForward * 0.18 };

    pose.rightHip = { rx: gait * this.stride, rz: -gait * 0.04 };
    pose.rightKnee = { rx: rightForward * this.legLift + (1 - rightForward) * 0.08 };
    pose.rightAnkle = { rx: -rightForward * 0.18 };

    // body bob + slight forward lean
    pose.mesh = {
      y: footfall * this.bodyBob,
      rx: this.lean,
    };

    // Cross-body gait: left leg forward pairs with right arm forward.
    pose.rightShoulder = { rx: -gait * this.armSwing, rz: -0.05 };
    pose.rightElbow = { rx: -0.25 - footfall * 0.1 };
    pose.leftShoulder = { rx: gait * this.armSwing, rz: 0.05 };
    pose.leftElbow = { rx: -0.25 - footfall * 0.1 };

    // subtle hip twist for natural gait
    pose.mesh.ry = -gait * 0.035;

    return pose;
  }
}
