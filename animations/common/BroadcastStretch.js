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

function makeKeyPose({
  arm = 'rest',
  stepSide = 0,
  stepAmount = 0,
  headPitch = 0,
  bodyPitch = 0,
  bodyLift = 0,
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
      x: stepSide * 0.015 * p,
      y: bodyLift,
      z: 0.045 * p,
      rx: bodyPitch,
      ry: 0,
      rz: -stepSide * 0.018 * p,
    },
  };

  if (arm === 'rest') {
    // 自然下垂：Zorak 的 armPivot 零位就是上臂向下；elbow.rx=0 让小臂顺着上臂。
    pose.rightShoulder = { rx: 0, ry: 0, rz: 0 };
    pose.leftShoulder = { rx: 0, ry: 0, rz: 0 };
    pose.rightElbow = { rx: 0, ry: 0, rz: 0 };
    pose.leftElbow = { rx: 0, ry: 0, rz: 0 };
  }

  if (arm === 'front') {
    // 前平举：手臂水平向前伸直
    pose.rightShoulder = { rx: -Math.PI / 2, ry: 0, rz: 0 };
    pose.leftShoulder = { rx: -Math.PI / 2, ry: 0, rz: 0 };
    pose.rightElbow = { rx: 0, ry: 0, rz: 0 };
    pose.leftElbow = { rx: 0, ry: 0, rz: 0 };
  } else if (arm === 'crossFront') {
    // 双手在胸前交叉 - 形成清晰的"X"形
    pose.rightClavicle = { rx: 0, ry: 0.30, rz: 0 };
    pose.leftClavicle = { rx: 0, ry: -0.30, rz: 0 };
    pose.rightShoulder = { rx: -1.45, ry: 0, rz: -1.00 };
    pose.leftShoulder = { rx: -1.45, ry: 0, rz: 1.00 };
    pose.rightElbow = { rx: 0.20, ry: 0, rz: 0 };
    pose.leftElbow = { rx: 0.20, ry: 0, rz: 0 };
    // 手腕微调，让手掌自然
    pose.rightWrist = { rx: 0, ry: 0, rz: -0.15 };
    pose.leftWrist = { rx: 0, ry: 0, rz: 0.15 };
  } else if (arm === 'sweepBack') {
    // 过渡姿势：从胸前交叉向侧上举打开的过程中
    // 手臂保持在身体前方，不绕到身后
    pose.rightShoulder = { rx: -1.05, ry: 0.10, rz: 0.75 };
    pose.leftShoulder = { rx: -1.05, ry: -0.10, rz: -0.75 };
    pose.rightElbow = { rx: 0, ry: 0, rz: 0 };
    pose.leftElbow = { rx: 0, ry: 0, rz: 0 };
    // 锁骨逐渐复位
    pose.rightClavicle = { rx: 0, ry: 0.15, rz: 0 };
    pose.leftClavicle = { rx: 0, ry: -0.15, rz: 0 };
  } else if (arm === 'sideUp') {
    // 侧上举：手臂从胸前交叉位置向上向侧打开
    pose.rightShoulder = { rx: -1.2, ry: 0, rz: 1.15 };
    pose.leftShoulder = { rx: -1.2, ry: 0, rz: -1.15 };
    pose.rightElbow = { rx: 0, ry: 0, rz: 0 };
    pose.leftElbow = { rx: 0, ry: 0, rz: 0 };
    // 锁骨复位，让过渡平滑
    pose.rightClavicle = { rx: 0, ry: 0, rz: 0 };
    pose.leftClavicle = { rx: 0, ry: 0, rz: 0 };
  }

  if (stepSide !== 0 && p > 0) {
    const hip = { rx: -0.34 * p, ry: 0, rz: -stepSide * 0.035 * p };
    const knee = { rx: 0.18 * p, ry: 0, rz: 0 };
    const ankle = { rx: -0.12 * p, ry: 0, rz: 0 };
    const rearToe = { rx: 0.2 * p, ry: 0, rz: 0 };
    if (stepSide < 0) {
      pose.leftHip = hip;
      pose.leftKnee = knee;
      pose.leftAnkle = ankle;
      pose.rightAnkle = rearToe;
    } else {
      pose.rightHip = hip;
      pose.rightKnee = knee;
      pose.rightAnkle = ankle;
      pose.leftAnkle = rearToe;
    }
  }

  return pose;
}

function mixKeyPoses(a, b, t) {
  const p = {};
  for (const joint of Object.keys(a)) {
    p[joint] = lerpJoint(a[joint], b[joint], t);
  }
  return p;
}

function toPoseMatrix(keyPose) {
  const pose = new PoseMatrix();
  for (const joint of Object.keys(keyPose)) {
    pose[joint] = keyPose[joint];
  }
  return pose;
}

/**
 * BroadcastStretch — 第八套广播体操第一节「伸展运动」.
 *
 * Structure: 8 beats x 4 groups.
 * 1: arms forward.
 * 2-3: step forward, sweep arms through side/back/down to side-up, head lifts.
 * 4: return to standing.
 * 5-8: repeat with the other foot.
 */
export class BroadcastStretch extends AnimationBase {
  constructor(options = {}) {
    const groups = clamp(1, 4, integerOption(options.groups ?? options.repeatGroups, DEFAULT_GROUPS));
    const beatSeconds = positiveNumber(options.beatSeconds ?? options.beatDuration, DEFAULT_BEAT_SECONDS);
    const defaultDuration = groups * BEATS_PER_GROUP * beatSeconds;

    super('BroadcastStretch', positiveNumber(options.duration, defaultDuration));
    this.usePoseMatrix = true;
    this.groups = groups;
    this.totalBeats = groups * BEATS_PER_GROUP;
    this.finish = String(options.finish || 'cross').toLowerCase();

    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'alien'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.8,
      maxHeight: 3.0,
    };
  }

  getPoseMatrix(t) {
    if (t <= 0) return toPoseMatrix(makeKeyPose());
    if (t >= 1) return toPoseMatrix(this._finishPose());

    const beat = clamp(0, this.totalBeats, t * this.totalBeats);
    const groupIndex = Math.min(this.groups - 1, Math.floor(beat / BEATS_PER_GROUP));
    const groupBeat = beat % BEATS_PER_GROUP;
    const side = groupBeat < 4 ? -1 : 1;
    const halfBeat = groupBeat < 4 ? groupBeat : groupBeat - 4;
    const finalHalf = groupIndex === this.groups - 1 && groupBeat >= 4;

    return toPoseMatrix(this._halfGroupPose(halfBeat, side, finalHalf));
  }

  _finishPose() {
    return this.finish === 'neutral'
      ? makeKeyPose()
      : makeKeyPose({ arm: 'crossFront' });
  }

  _halfGroupPose(halfBeat, side, finalHalf = false) {
    const rest = makeKeyPose();
    const armsForward = makeKeyPose({ arm: 'front' });
    const crossFront = makeKeyPose({ arm: 'crossFront' });
    const sweepBack = makeKeyPose({
      arm: 'sweepBack',
      stepSide: side,
      stepAmount: 0.58,
      headPitch: 0.16,
      bodyPitch: 0.04,
      bodyLift: -0.006,
    });
    const sideUp = makeKeyPose({
      arm: 'sideUp',
      stepSide: side,
      stepAmount: 1,
      headPitch: -0.28,
      bodyPitch: -0.05,
      bodyLift: 0.012,
    });
    const finish = finalHalf ? this._finishPose() : rest;

    // 每组8拍 = 左脚4拍 + 右脚4拍
    // 每4拍 = 前平举(拍1) → 体前交叉(拍2) → 侧后绕(拍3) → 侧上举+还原(拍4)
    // halfBeat: 0.0~4.0 对应每半组的4拍

    if (halfBeat < 1.0) {
      // 拍1: 预备，双手前平举 (rest → armsForward)
      return mixKeyPoses(rest, armsForward, easeInOut(halfBeat));
    }
    if (halfBeat < 2.0) {
      // 拍2: 体前交叉 (armsForward → crossFront)
      return mixKeyPoses(armsForward, crossFront, easeInOut(halfBeat - 1.0));
    }
    if (halfBeat < 3.0) {
      // 拍3: 从胸前交叉向上向侧打开
      // 使用 sweepBack 作为中间过渡，确保手臂始终保持在体前，不绕到身后
      const t3 = halfBeat - 2.0; // 0.0~1.0 within beat 3
      if (t3 < 0.5) {
        // 前半拍: 从交叉位置过渡到中间打开位置
        return mixKeyPoses(crossFront, sweepBack, easeInOut(t3 * 2));
      }
      // 后半拍: 从中间位置过渡到侧上举
      return mixKeyPoses(sweepBack, sideUp, easeInOut((t3 - 0.5) * 2));
    }
    // 拍4: 从侧上举还原 (sideUp → rest/finish)
    const t4 = halfBeat - 3.0; // 0.0~1.0 within beat 4
    if (t4 < 0.5) {
      // 前半拍: 保持侧上举
      return sideUp;
    }
    // 后半拍: 还原
    return mixKeyPoses(sideUp, finish, easeInOut((t4 - 0.5) * 2));
  }
}
