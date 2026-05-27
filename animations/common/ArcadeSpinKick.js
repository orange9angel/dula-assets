import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * ArcadeSpinKick - exaggerated arcade-style spinning roundhouse.
 *
 * This is intentionally more readable than a realistic kick: a visible crouch,
 * airborne twist, extended heel, then a heavy recovery.
 */
export class ArcadeSpinKick extends AnimationBase {
  constructor() {
    super('ArcadeSpinKick', 1.0);
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

      pose.mesh = { y: -0.1 * ease, x: -0.04 * ease, rx: 0.14 * ease, ry: -0.55 * ease };
      pose.headGroup = { rx: 0.08 * ease };

      pose.rightShoulder = { rz: -0.55 * ease, rx: -0.45 * ease };
      pose.rightElbow = { rx: -0.55 * ease };
      pose.leftShoulder = { rz: 0.5 * ease, rx: -0.38 * ease };
      pose.leftElbow = { rx: -0.5 * ease };

      pose.rightHip = { rx: 0.32 * ease };
      pose.rightKnee = { rx: 0.55 * ease };
      pose.leftHip = { rx: 0.28 * ease };
      pose.leftKnee = { rx: 0.48 * ease };
    } else if (t < 0.38) {
      const p = (t - 0.16) / 0.22;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = {
        y: -0.1 + Math.sin(p * Math.PI * 0.8) * 0.42,
        x: -0.04 + ease * 0.18,
        rx: 0.14 - ease * 0.2,
        ry: -0.55 + ease * 2.6,
        rz: -0.1 * ease,
      };
      pose.headGroup = { rx: 0.08 - ease * 0.1 };

      pose.rightShoulder = { rz: -0.55 + ease * 0.75, rx: -0.45 - ease * 0.2 };
      pose.rightElbow = { rx: -0.55 + ease * 0.15 };
      pose.leftShoulder = { rz: 0.5 - ease * 0.7, rx: -0.38 - ease * 0.16 };
      pose.leftElbow = { rx: -0.5 + ease * 0.12 };

      pose.rightHip = { rx: 0.32 - ease * 1.12 };
      pose.rightKnee = { rx: 0.55 + ease * 0.85 };
      pose.rightAnkle = { rx: -0.12 * ease };
      pose.leftHip = { rx: 0.28 + ease * 0.62 };
      pose.leftKnee = { rx: 0.48 + ease * 0.5 };
    } else if (t < 0.62) {
      const p = (t - 0.38) / 0.24;
      const ease = 1 - Math.pow(1 - p, 3);

      pose.mesh = {
        y: 0.22 - p * 0.1,
        x: 0.14 + ease * 0.34,
        rx: -0.06 - ease * 0.12,
        ry: 2.05 + ease * 2.55,
        rz: -0.1 + ease * 0.28,
      };
      pose.headGroup = { rx: -0.02 + ease * 0.04 };

      pose.rightShoulder = { rz: 0.2 - ease * 0.48, rx: -0.65 + ease * 0.15 };
      pose.rightElbow = { rx: -0.4 + ease * 0.12 };
      pose.leftShoulder = { rz: -0.2 + ease * 0.42, rx: -0.54 + ease * 0.18 };
      pose.leftElbow = { rx: -0.38 + ease * 0.12 };

      pose.rightHip = { rx: -0.8 + ease * 1.2, rz: -0.15 - ease * 0.38 };
      pose.rightKnee = { rx: 1.4 - ease * 1.38 };
      pose.rightAnkle = { rx: -0.12 - ease * 0.28 };
      pose.leftHip = { rx: 0.9 - ease * 0.38 };
      pose.leftKnee = { rx: 0.98 - ease * 0.32 };
      pose.leftAnkle = { rx: -0.08 + ease * 0.1 };
    } else if (t < 0.78) {
      const p = (t - 0.62) / 0.16;
      const ease = p * p;

      pose.mesh = {
        y: 0.12 - ease * 0.16,
        x: 0.48 - ease * 0.18,
        rx: -0.18 + ease * 0.18,
        ry: 4.6 + ease * 1.0,
        rz: 0.18 - ease * 0.18,
      };

      pose.rightHip = { rx: 0.4 - ease * 0.55, rz: -0.53 + ease * 0.42 };
      pose.rightKnee = { rx: 0.02 + ease * 0.85 };
      pose.rightAnkle = { rx: -0.4 + ease * 0.24 };
      pose.leftHip = { rx: 0.52 - ease * 0.3 };
      pose.leftKnee = { rx: 0.66 - ease * 0.3 };

      pose.rightShoulder = { rz: -0.28 - ease * 0.3, rx: -0.5 + ease * 0.25 };
      pose.leftShoulder = { rz: 0.22 + ease * 0.24, rx: -0.36 + ease * 0.16 };
    } else {
      const p = (t - 0.78) / 0.22;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = { y: -0.04 * ease, x: 0.3 * (1 - ease), ry: 5.6 * (1 - ease), rx: 0.03 * (1 - ease) };
      pose.headGroup = { rx: 0.03 * (1 - ease) };

      pose.rightShoulder = { rz: -0.58 - ease * 0.22, rx: -0.25 - ease * 0.35 };
      pose.rightElbow = { rx: -0.18 - ease * 0.32 };
      pose.leftShoulder = { rz: 0.46 - ease * 0.08, rx: -0.2 - ease * 0.28 };
      pose.leftElbow = { rx: -0.16 - ease * 0.26 };

      pose.rightHip = { rx: -0.15 + ease * 0.26 };
      pose.rightKnee = { rx: 0.87 - ease * 0.62 };
      pose.rightAnkle = { rx: -0.16 + ease * 0.1 };
      pose.leftHip = { rx: 0.22 + ease * 0.04 };
      pose.leftKnee = { rx: 0.36 - ease * 0.14 };
    }

    return pose;
  }
}
