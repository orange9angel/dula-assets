import { AnimationBase, PoseMatrix } from 'dula-engine';

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function numberOption(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function depthFromOptions(options) {
  const preset = String(options.level || options.height || '').toLowerCase();
  if (preset === 'shallow' || preset === 'high') return 0.16;
  if (preset === 'mid' || preset === 'medium') return 0.28;
  if (preset === 'low' || preset === 'deep') return 0.42;

  return numberOption(options.depth ?? options.amount ?? options.lower, 0.28);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Crouch - configurable low stance.
 *
 * Story examples:
 *   {Klaw}{Crouch|depth=0.35|duration=2}
 *   {Vex}{Crouch|level=deep|arms=balance}
 *   {Rex}{Crouch|depth=0.18|lean=0.05|arms=none}
 */
export class Crouch extends AnimationBase {
  constructor(options = {}) {
    super('Crouch', Math.max(0.2, numberOption(options.duration, 1.0)));
    this.usePoseMatrix = true;
    this.depth = clamp(0.04, 0.52, depthFromOptions(options));
    this.lean = clamp(-0.05, 0.35, numberOption(options.lean, 0.1));
    this.enterSeconds = clamp(0.05, 0.8, numberOption(options.enter, options.enterTime ?? 0.22));
    this.arms = String(options.arms || 'guard').toLowerCase();
    this.tags = {
      requires: ['rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'alien'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.5,
      maxHeight: 4.0,
    };
  }

  getPoseMatrix(t, elapsed = 0, duration = this.duration) {
    const pose = new PoseMatrix();
    const activeDuration = Math.max(0.01, duration || this.duration);
    const enterFraction = clamp(0.04, 0.75, this.enterSeconds / activeDuration);
    const enter = t < enterFraction ? easeOutCubic(t / enterFraction) : 1;
    const breathe = Math.sin(elapsed * Math.PI * 2.2) * 0.012 * enter;
    const depth = this.depth * enter;
    const bend = clamp(0, 1.15, depth / 0.45);

    pose.mesh = {
      y: -depth + breathe,
      rx: this.lean * enter,
    };

    pose.headGroup = {
      rx: -this.lean * 0.55 * enter,
    };

    // Squat pose: hips go BACK (negative rx), knees bend FORWARD (positive rx)
    // This creates a true squat where the body lowers straight down
    pose.rightHip = { rx: -0.35 * bend };
    pose.leftHip = { rx: -0.35 * bend };
    pose.rightKnee = { rx: 1.1 * bend };
    pose.leftKnee = { rx: 1.1 * bend };
    pose.rightAnkle = { rx: -0.55 * bend };
    pose.leftAnkle = { rx: -0.55 * bend };

    if (this.arms === 'guard') {
      pose.rightShoulder = { rz: -0.5 * enter, rx: -0.45 * enter };
      pose.leftShoulder = { rz: 0.5 * enter, rx: -0.45 * enter };
      pose.rightElbow = { rx: -0.7 * enter };
      pose.leftElbow = { rx: -0.7 * enter };
    } else if (this.arms === 'balance') {
      pose.rightShoulder = { rz: -0.35 * enter, rx: -0.25 * enter };
      pose.leftShoulder = { rz: 0.35 * enter, rx: -0.25 * enter };
      pose.rightElbow = { rx: -0.35 * enter };
      pose.leftElbow = { rx: -0.35 * enter };
    }

    return pose;
  }
}
