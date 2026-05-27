import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * JumpFlyingKick - airborne thrust kick driven by the 13-point pose matrix.
 *
 * Phases:
 *   0.00-0.16 crouch and coil
 *   0.16-0.36 high vertical takeoff
 *   0.36-0.50 apex and knee chamber
 *   0.50-0.72 diagonal diving kick / impact
 *   0.72-0.88 follow-through descent
 *   0.88-1.00 landing recovery
 */
export class JumpFlyingKick extends AnimationBase {
  constructor() {
    super('JumpFlyingKick', 1.25);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    if (t < 0.16) {
      const p = t / 0.16;
      const ease = p * p;

      pose.mesh = { y: -ease * 0.22, x: -ease * 0.08, rx: ease * 0.24 };
      pose.headGroup = { rx: ease * 0.1 };

      pose.rightShoulder = { rz: -ease * 0.65, rx: -ease * 0.55 };
      pose.rightElbow = { rx: -ease * 0.75 };
      pose.leftShoulder = { rz: ease * 0.65, rx: -ease * 0.55 };
      pose.leftElbow = { rx: -ease * 0.75 };

      pose.rightHip = { rx: ease * 0.72 };
      pose.rightKnee = { rx: ease * 0.95 };
      pose.rightAnkle = { rx: -ease * 0.18 };
      pose.leftHip = { rx: ease * 0.6 };
      pose.leftKnee = { rx: ease * 0.9 };
      pose.leftAnkle = { rx: -ease * 0.14 };
    } else if (t < 0.36) {
      const p = (t - 0.16) / 0.2;
      const ease = 1 - Math.pow(1 - p, 3);
      const lift = 1.95 * ease;

      pose.mesh = { y: -0.22 + lift, x: -0.08 + ease * 0.14, rx: 0.24 - ease * 0.38, rz: -ease * 0.04 };
      pose.headGroup = { rx: 0.1 - ease * 0.15 };

      pose.rightShoulder = { rz: -0.65 - ease * 0.35, rx: -0.55 - ease * 0.3 };
      pose.rightElbow = { rx: -0.75 - ease * 0.35 };
      pose.leftShoulder = { rz: 0.65 + ease * 0.35, rx: -0.55 - ease * 0.2 };
      pose.leftElbow = { rx: -0.75 - ease * 0.25 };

      pose.rightHip = { rx: 0.72 - ease * 1.25 };
      pose.rightKnee = { rx: 0.95 + ease * 0.75 };
      pose.rightAnkle = { rx: -0.18 - ease * 0.18 };
      pose.leftHip = { rx: 0.6 - ease * 0.25 };
      pose.leftKnee = { rx: 0.9 + ease * 0.35 };
      pose.leftAnkle = { rx: -0.14 - ease * 0.14 };
    } else if (t < 0.5) {
      const p = (t - 0.36) / 0.14;
      const ease = p * p;

      pose.mesh = { y: 1.73 + Math.sin(p * Math.PI) * 0.34, x: 0.06 + ease * 0.18, rx: -0.14 - ease * 0.34, rz: -0.04 + ease * 0.16 };
      pose.headGroup = { rx: -0.05 + ease * 0.04 };

      pose.rightShoulder = { rz: -1.0 + ease * 0.35, rx: -0.85 + ease * 0.15 };
      pose.rightElbow = { rx: -1.1 + ease * 0.25 };
      pose.leftShoulder = { rz: 1.0 - ease * 0.3, rx: -0.75 + ease * 0.12 };
      pose.leftElbow = { rx: -1.0 + ease * 0.2 };

      pose.rightHip = { rx: -0.53 - ease * 0.78 };
      pose.rightKnee = { rx: 1.7 - ease * 0.75 };
      pose.rightAnkle = { rx: -0.36 - ease * 0.22 };
      pose.leftHip = { rx: 0.35 + ease * 0.65 };
      pose.leftKnee = { rx: 1.25 - ease * 0.05 };
      pose.leftAnkle = { rx: -0.28 + ease * 0.08 };
    } else if (t < 0.72) {
      const p = (t - 0.5) / 0.22;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = { y: 2.02 - ease * 1.02, x: 0.24 + ease * 0.68, rx: -0.48 - ease * 0.46, rz: 0.12 + ease * 0.46 };
      pose.headGroup = { rx: -0.01 + ease * 0.07 };

      pose.rightShoulder = { rz: -0.65 + ease * 0.35, rx: -0.7 + ease * 0.45 };
      pose.rightElbow = { rx: -0.85 + ease * 0.35 };
      pose.leftShoulder = { rz: 0.7 - ease * 0.35, rx: -0.63 + ease * 0.32 };
      pose.leftElbow = { rx: -0.8 + ease * 0.28 };

      pose.rightHip = { rx: -1.35 + ease * 0.88 };
      pose.rightKnee = { rx: 0.92 - ease * 0.92 };
      pose.rightAnkle = { rx: -0.62 - ease * 0.28 };
      pose.leftHip = { rx: 1.08 - ease * 0.2 };
      pose.leftKnee = { rx: 1.26 - ease * 0.38 };
      pose.leftAnkle = { rx: -0.2 + ease * 0.08 };
    } else if (t < 0.88) {
      const p = (t - 0.72) / 0.16;
      const ease = p * p;

      pose.mesh = { y: 1.0 - ease * 0.82, x: 0.92 - ease * 0.36, rx: -0.94 + ease * 0.92, rz: 0.58 - ease * 0.5 };
      pose.headGroup = { rx: 0.06 - ease * 0.06 };

      pose.rightShoulder = { rz: -0.4 - ease * 0.25, rx: -0.35 - ease * 0.15 };
      pose.rightElbow = { rx: -0.6 + ease * 0.15 };
      pose.leftShoulder = { rz: 0.45 + ease * 0.15, rx: -0.38 - ease * 0.1 };
      pose.leftElbow = { rx: -0.6 + ease * 0.18 };

      pose.rightHip = { rx: -0.59 - ease * 0.08 };
      pose.rightKnee = { rx: 0.05 + ease * 0.95 };
      pose.rightAnkle = { rx: -0.83 + ease * 0.55 };
      pose.leftHip = { rx: 0.8 - ease * 0.6 };
      pose.leftKnee = { rx: 0.85 - ease * 0.5 };
      pose.leftAnkle = { rx: -0.12 + ease * 0.06 };
    } else {
      const p = (t - 0.88) / 0.12;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = { y: 0.18 - ease * 0.24, x: 0.5 * (1 - ease), rx: 0.02 - ease * 0.02 };
      pose.headGroup = { rx: ease * 0.02 };

      pose.rightShoulder = { rz: -0.65 - ease * 0.15, rx: -0.6 + ease * 0.05 };
      pose.rightElbow = { rx: -0.5 - ease * 0.15 };
      pose.leftShoulder = { rz: 0.62 - ease * 0.12, rx: -0.55 + ease * 0.1 };
      pose.leftElbow = { rx: -0.45 - ease * 0.1 };

      pose.rightHip = { rx: -0.67 + ease * 0.87 };
      pose.rightKnee = { rx: 1.0 - ease * 0.82 };
      pose.rightAnkle = { rx: -0.2 + ease * 0.08 };
      pose.leftHip = { rx: 0.17 + ease * 0.06 };
      pose.leftKnee = { rx: 0.3 - ease * 0.1 };
      pose.leftAnkle = { rx: -0.08 + ease * 0.04 };
    }

    return pose;
  }
}
