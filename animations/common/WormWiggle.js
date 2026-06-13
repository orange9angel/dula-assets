import { AnimationBase, PoseMatrix } from 'dula-engine';

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function positiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * WormWiggle — 蠕虫基础扭动
 * 简单的正弦波蠕动，适合 idle 或过渡
 */
export class WormWiggle extends AnimationBase {
  constructor(options = {}) {
    const duration = positiveNumber(options.duration, 2.0);
    super('WormWiggle', duration);
    this.usePoseMatrix = true;
    this.segmentCount = options.segmentCount || 5;
    this.speed = positiveNumber(options.speed, 3.0);
    this.amplitude = positiveNumber(options.amplitude, 0.15);

    this.tags = {
      requires: [],
      suits: ['worm', 'serpent', 'round'],
      notSuits: ['humanoid', 'fighter', 'quadruped'],
      minHeight: 0,
      maxHeight: 1.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const phase = t * this.speed * Math.PI * 2;

    for (let i = 0; i < this.segmentCount; i++) {
      const segPhase = phase + i * 0.6;
      const tFactor = i / (this.segmentCount - 1);
      const amp = this.amplitude * (0.7 + 0.3 * tFactor);

      pose[`segment${i}`] = {
        rx: Math.sin(segPhase) * amp,
        ry: Math.cos(segPhase * 0.7) * amp * 0.4,
        rz: Math.sin(segPhase * 1.3) * amp * 0.3,
      };
    }

    return pose;
  }
}
