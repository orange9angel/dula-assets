import { AnimationBase } from 'dula-engine';
import { generateStraightPunchCombo } from './PoseGenerator.js';

function positiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function positiveInteger(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.max(1, Math.round(n)) : fallback;
}

function parseOrder(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',');
  return ['left', 'right'];
}

/**
 * LeftRightPunchCombo — 左右直拳连击
 */
export class LeftRightPunchCombo extends AnimationBase {
  constructor(options = {}) {
    const duration = positiveNumber(options.duration, 2.0);
    const frequency = positiveNumber(options.frequency ?? options.rate ?? options.hz, 3.0);
    const defaultCount = Math.max(2, Math.round(duration * frequency));
    const count = positiveInteger(options.count ?? options.hits ?? options.punches, defaultCount);

    super('LeftRightPunchCombo', duration);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateStraightPunchCombo({
      order: parseOrder(options.order),
      count,
      power: positiveNumber(options.power, 0.75),
      height: options.height || 'head',
      guard: options.guard || 'natural',
      style: options.style || options.windup || 'compact',
    });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
