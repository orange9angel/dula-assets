import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * BoxerGuardHop - defensive boxing hop with high guard.
 *
 * Uses the 13-point pose matrix for guard arms, crouched knees, and two quick
 * backward hops. The root x offset assumes the left-side fighter hops back.
 */
export class BoxerGuardHop extends AnimationBase {
  constructor() {
    super('BoxerGuardHop', 0.9);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'defensive'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    const guard = Math.min(1, t / 0.14);
    const guardEase = 1 - Math.pow(1 - guard, 3);
    const hopWave = Math.sin(Math.min(1, t / 0.68) * Math.PI * 2.0);
    const quickBounce = Math.max(0, hopWave) * 0.12;

    let back = 0;
    if (t < 0.2) {
      const p = t / 0.2;
      back = -0.2 * (1 - Math.pow(1 - p, 2));
    } else if (t < 0.46) {
      const p = (t - 0.2) / 0.26;
      back = -0.2 - 0.28 * Math.sin(p * Math.PI * 0.5);
    } else if (t < 0.72) {
      const p = (t - 0.46) / 0.26;
      back = -0.48 + 0.18 * p;
    } else {
      const p = (t - 0.72) / 0.28;
      back = -0.3 * (1 - p);
    }

    pose.mesh = {
      x: back,
      y: quickBounce - 0.06 * guardEase,
      rx: -0.16 * guardEase,
      rz: Math.sin(t * Math.PI * 5) * 0.025,
    };
    pose.headGroup = { rx: 0.08 * guardEase };

    pose.rightShoulder = { rz: -0.95 * guardEase, rx: -0.82 * guardEase };
    pose.rightElbow = { rx: -1.15 * guardEase };
    pose.rightWrist = { rz: -0.18 * guardEase };
    pose.leftShoulder = { rz: 0.92 * guardEase, rx: -0.88 * guardEase };
    pose.leftElbow = { rx: -1.08 * guardEase };
    pose.leftWrist = { rz: 0.16 * guardEase };

    const knee = 0.34 * guardEase + quickBounce * 1.2;
    pose.rightHip = { rx: 0.2 * guardEase };
    pose.rightKnee = { rx: knee };
    pose.rightAnkle = { rx: -0.12 * guardEase };
    pose.leftHip = { rx: 0.16 * guardEase };
    pose.leftKnee = { rx: knee * 0.92 };
    pose.leftAnkle = { rx: -0.1 * guardEase };

    return pose;
  }
}
