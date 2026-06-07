import { AnimationBase, PoseMatrix } from 'dula-engine';

const DEFAULT_GROUPS = 4;
const BEATS_PER_GROUP = 8;
const DEFAULT_BEAT_SECONDS = 0.95;

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function positiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function integerOption(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function easeInOut(t) {
  const p = clamp(0, 1, t);
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpJoint(a = {}, b = {}, t) {
  const out = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    out[key] = lerp(a[key] ?? 0, b[key] ?? 0, t);
  }
  return out;
}

function mixKeyPoses(a, b, t) {
  const pose = {};
  for (const joint of Object.keys(a)) {
    pose[joint] = lerpJoint(a[joint], b[joint], t);
  }
  return pose;
}

function toPoseMatrix(keyPose) {
  const pose = new PoseMatrix();
  for (const joint of Object.keys(keyPose)) {
    pose[joint] = keyPose[joint];
  }
  return pose;
}

function basePose({
  arm = 'rest',
  stepSide = 0,
  stepAmount = 0,
  bodyPitch = 0,
  headPitch = 0,
  lift = 0,
} = {}) {
  const p = clamp(0, 1, stepAmount);
  const pose = {
    headGroup: { rx: headPitch, ry: 0, rz: 0 },
    rightClavicle: { rx: 0, ry: 0, rz: 0 },
    leftClavicle: { rx: 0, ry: 0, rz: 0 },
    rightShoulder: { rx: 0, ry: 0, rz: 0 },
    rightElbow: { rx: 0, ry: 0, rz: 0 },
    rightWrist: { rx: 0, ry: 0, rz: 0 },
    leftShoulder: { rx: 0, ry: 0, rz: 0 },
    leftElbow: { rx: 0, ry: 0, rz: 0 },
    leftWrist: { rx: 0, ry: 0, rz: 0 },
    rightHip: { rx: 0, ry: 0, rz: 0 },
    rightKnee: { rx: 0, ry: 0, rz: 0 },
    rightAnkle: { rx: 0, ry: 0, rz: 0 },
    leftHip: { rx: 0, ry: 0, rz: 0 },
    leftKnee: { rx: 0, ry: 0, rz: 0 },
    leftAnkle: { rx: 0, ry: 0, rz: 0 },
    mesh: {
      x: stepSide * 0.012 * p,
      y: lift,
      z: 0.032 * p,
      rx: bodyPitch,
      ry: 0,
      rz: -stepSide * 0.012 * p,
    },
  };

  if (arm === 'front') {
    pose.rightShoulder = { rx: -Math.PI / 2, ry: 0, rz: 0 };
    pose.leftShoulder = { rx: -Math.PI / 2, ry: 0, rz: 0 };
  } else if (arm === 'crossFront') {
    pose.rightClavicle = { rx: 0, ry: 0.30, rz: 0 };
    pose.leftClavicle = { rx: 0, ry: -0.30, rz: 0 };
    pose.rightShoulder = { rx: -1.45, ry: 0, rz: -1.00 };
    pose.leftShoulder = { rx: -1.45, ry: 0, rz: 1.00 };
    pose.rightElbow = { rx: 0.20, ry: 0, rz: 0 };
    pose.leftElbow = { rx: 0.20, ry: 0, rz: 0 };
    pose.rightWrist = { rx: 0, ry: 0, rz: -0.15 };
    pose.leftWrist = { rx: 0, ry: 0, rz: 0.15 };
  } else if (arm === 'openChest') {
    pose.rightClavicle = { rx: 0, ry: 0.08, rz: 0 };
    pose.leftClavicle = { rx: 0, ry: -0.08, rz: 0 };
    pose.rightShoulder = { rx: -1.08, ry: 0.08, rz: 0.82 };
    pose.leftShoulder = { rx: -1.08, ry: -0.08, rz: -0.82 };
    pose.rightElbow = { rx: 0.16, ry: 0, rz: 0 };
    pose.leftElbow = { rx: 0.16, ry: 0, rz: 0 };
    pose.rightWrist = { rx: 0, ry: 0, rz: 0.06 };
    pose.leftWrist = { rx: 0, ry: 0, rz: -0.06 };
  } else if (arm === 'wideOpen') {
    pose.rightShoulder = { rx: -1.15, ry: 0, rz: 1.12 };
    pose.leftShoulder = { rx: -1.15, ry: 0, rz: -1.12 };
    pose.rightElbow = { rx: 0.05, ry: 0, rz: 0 };
    pose.leftElbow = { rx: 0.05, ry: 0, rz: 0 };
  }

  if (stepSide !== 0 && p > 0) {
    const hip = { rx: -0.22 * p, ry: 0, rz: -stepSide * 0.025 * p };
    const knee = { rx: 0.16 * p, ry: 0, rz: 0 };
    const ankle = { rx: -0.10 * p, ry: 0, rz: 0 };
    if (stepSide < 0) {
      pose.leftHip = hip;
      pose.leftKnee = knee;
      pose.leftAnkle = ankle;
    } else {
      pose.rightHip = hip;
      pose.rightKnee = knee;
      pose.rightAnkle = ankle;
    }
  }

  return pose;
}

/**
 * BroadcastChestExpansion — 广播体操第二节「扩胸运动」.
 *
 * 4 groups x 8 beats. Each half group crosses arms in front of the chest,
 * opens the chest twice, then returns while alternating the stepping foot.
 */
export class BroadcastChestExpansion extends AnimationBase {
  constructor(options = {}) {
    const groups = clamp(1, 4, integerOption(options.groups ?? options.repeatGroups, DEFAULT_GROUPS));
    const beatSeconds = positiveNumber(options.beatSeconds ?? options.beatDuration, DEFAULT_BEAT_SECONDS);
    const defaultDuration = groups * BEATS_PER_GROUP * beatSeconds;

    super('BroadcastChestExpansion', positiveNumber(options.duration, defaultDuration));
    this.usePoseMatrix = true;
    this.groups = groups;
    this.totalBeats = groups * BEATS_PER_GROUP;
    this.finish = String(options.finish || 'neutral').toLowerCase();

    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'alien'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.8,
      maxHeight: 3.0,
    };
  }

  getPoseMatrix(t) {
    if (t <= 0) return toPoseMatrix(basePose());
    if (t >= 1) return toPoseMatrix(this._finishPose());

    const beat = clamp(0, this.totalBeats, t * this.totalBeats);
    const groupBeat = beat % BEATS_PER_GROUP;
    const side = groupBeat < 4 ? -1 : 1;
    const halfBeat = groupBeat < 4 ? groupBeat : groupBeat - 4;
    const groupIndex = Math.min(this.groups - 1, Math.floor(beat / BEATS_PER_GROUP));
    const finalHalf = groupIndex === this.groups - 1 && groupBeat >= 4;

    return toPoseMatrix(this._halfGroupPose(halfBeat, side, finalHalf));
  }

  _finishPose() {
    if (this.finish === 'front') return basePose({ arm: 'front' });
    if (this.finish === 'cross') return basePose({ arm: 'crossFront' });
    return basePose();
  }

  _halfGroupPose(halfBeat, side, finalHalf = false) {
    const rest = basePose();
    const front = basePose({ arm: 'front' });
    const cross = basePose({ arm: 'crossFront', stepSide: side, stepAmount: 0.45, lift: -0.002 });
    const open = basePose({
      arm: 'openChest',
      stepSide: side,
      stepAmount: 0.75,
      headPitch: -0.08,
      bodyPitch: -0.025,
      lift: 0.006,
    });
    const wide = basePose({
      arm: 'wideOpen',
      stepSide: side,
      stepAmount: 1,
      headPitch: -0.12,
      bodyPitch: -0.035,
      lift: 0.010,
    });
    const finish = finalHalf ? this._finishPose() : rest;

    if (halfBeat < 0.5) {
      return mixKeyPoses(rest, front, easeInOut(halfBeat * 2));
    }
    if (halfBeat < 1.0) {
      return mixKeyPoses(front, cross, easeInOut((halfBeat - 0.5) * 2));
    }
    if (halfBeat < 1.5) {
      return mixKeyPoses(cross, open, easeInOut((halfBeat - 1.0) * 2));
    }
    if (halfBeat < 2.0) {
      return mixKeyPoses(open, cross, easeInOut((halfBeat - 1.5) * 2));
    }
    if (halfBeat < 2.65) {
      return mixKeyPoses(cross, wide, easeInOut((halfBeat - 2.0) / 0.65));
    }
    if (halfBeat < 3.25) {
      return mixKeyPoses(wide, open, easeInOut((halfBeat - 2.65) / 0.60));
    }
    return mixKeyPoses(open, finish, easeInOut((halfBeat - 3.25) / 0.75));
  }
}
