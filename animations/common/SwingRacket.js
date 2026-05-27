import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Realistic tennis racket swing animation.
 * Phases:
 *   0-15%  Ready / unit turn (shoulder rotation, racket take-back)
 *   15-35% Backswing (full coiling, racket drop)
 *   35-55% Forward swing / contact (explosive uncoil, snap)
 *   55-100% Follow-through (deceleration, balance recovery)
 *
 * Duration is tuned to ~0.8s so it feels athletic but readable.
 */
export class SwingRacket extends AnimationBase {
  constructor() {
    super('SwingRacket', 0.8);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    let bodyRy = 0;
    let armRx = 0;
    let armRz = 0;
    let leftArmRx = 0;
    let leftArmRz = 0;
    let bodyY = 0;

    if (t < 0.15) {
      // READY: slight unit turn, racket starts back
      const p = t / 0.15;
      const ease = p * p; // ease in
      bodyRy = 0.35 * ease;
      armRz = 0.25 * ease;
      armRx = -0.1 * ease;
      leftArmRz = -0.15 * ease;
      leftArmRx = 0.05 * ease;
      // Slight knee flex (athletic stance)
      bodyY = -0.04 * ease;
    } else if (t < 0.35) {
      // BACKSWING: full coil, racket way back and dropped
      const p = (t - 0.15) / 0.2;
      const ease = p * (2 - p); // ease out
      bodyRy = 0.35 + 0.45 * ease;
      armRz = 0.25 + 0.7 * ease; // racket back
      armRx = -0.1 - 0.35 * ease; // racket drop (pat-the-dog)
      leftArmRz = -0.15 - 0.25 * ease; // left arm extends for balance
      leftArmRx = 0.05 + 0.1 * ease;
      bodyY = -0.04 - 0.03 * ease; // lower center of gravity
    } else if (t < 0.55) {
      // FORWARD SWING / CONTACT: explosive uncoil
      const p = (t - 0.35) / 0.2;
      // Use a sharp ease-in for snap
      const snap = p * p;
      bodyRy = 0.8 - 1.0 * snap; // rotate through the ball
      armRz = 0.95 - 1.5 * snap; // snap forward
      armRx = -0.45 + 0.55 * snap; // racket comes up through contact
      leftArmRz = -0.4 + 0.3 * snap;
      leftArmRx = 0.15 - 0.1 * snap;
      // Contact pop: slight upward body on impact (peak at p ~ 0.5)
      const pop = Math.sin(p * Math.PI);
      bodyY = -0.07 + 0.1 * pop;
    } else {
      // FOLLOW-THROUGH: decelerate, recover balance
      const p = (t - 0.55) / 0.45;
      const ease = p * p; // quadratic ease in
      bodyRy = -0.2 + 0.2 * ease;
      armRz = -0.55 + 0.55 * ease;
      armRx = 0.1 - 0.1 * ease;
      leftArmRz = -0.1 + 0.1 * ease;
      leftArmRx = 0.05 - 0.05 * ease;
      bodyY = 0.03 - 0.03 * ease;
    }

    const pose = new PoseMatrix();
    pose.mesh = { y: bodyY, ry: bodyRy };
    pose.rightShoulder = { rx: armRx, rz: armRz };
    pose.leftShoulder = { rx: leftArmRx, rz: leftArmRz };
    return pose;
  }
}
