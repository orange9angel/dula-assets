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
    const named = { low: 0.45, mid: 0.75, medium: 0.75, high: 1.05 };
    if (named[value] !== undefined) return named[value];
  }
  return positiveNumber(value, fallback);
}

export class Run extends AnimationBase {
  constructor(options = {}) {
    super('Run', positiveNumber(options.duration, 1.0));
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };

    // frequency/cadence is footfalls per second. One full left-right gait cycle
    // therefore spans two steps.
    this.stepFrequency = firstNumber(
      options,
      ['frequency', 'cadence', 'stepFrequency', 'stepsPerSecond'],
      3.4
    );
    this.legLift = legLiftValue(
      options.legLift ?? options.liftHeight ?? options.kneeLift ?? options.height,
      0.78
    );
    this.stride = firstNumber(options, ['stride', 'strideLength', 'legSwing'], 0.72);
    this.armSwing = firstNumber(options, ['armSwing', 'armPower'], 0.8);
    this.bodyBob = firstNumber(options, ['bodyBob', 'bob', 'bounce'], 0.06);
    this.lean = firstNumber(options, ['lean', 'forwardLean'], 0.16);
  }

  getPoseMatrix(t, elapsed = t * this.duration) {
    const pose = new PoseMatrix();
    const phase = elapsed * Math.PI * this.stepFrequency;
    const gait = Math.sin(phase);
    const leftForward = Math.max(0, gait);
    const rightForward = Math.max(0, -gait);
    const footfall = Math.abs(gait);

    // In this rig negative hip rx swings the leg visually forward.
    pose.leftHip = { rx: -gait * this.stride, rz: gait * 0.05 };
    pose.rightHip = { rx: gait * this.stride, rz: -gait * 0.05 };

    pose.leftKnee = { rx: leftForward * this.legLift + (1 - leftForward) * 0.12 };
    pose.rightKnee = { rx: rightForward * this.legLift + (1 - rightForward) * 0.12 };
    pose.leftAnkle = { rx: -leftForward * 0.32 };
    pose.rightAnkle = { rx: -rightForward * 0.32 };

    pose.mesh = {
      rx: this.lean,
      y: footfall * this.bodyBob,
    };

    // Cross-body gait: left leg forward pairs with right arm forward, and
    // right leg forward pairs with left arm forward.
    pose.rightShoulder = { rx: -gait * this.armSwing, rz: -0.08 };
    pose.leftShoulder = { rx: gait * this.armSwing, rz: 0.08 };
    pose.rightElbow = { rx: -0.55 - footfall * 0.2 };
    pose.leftElbow = { rx: -0.55 - footfall * 0.2 };

    return pose;
  }
}
