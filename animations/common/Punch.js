import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generatePunch } from './PoseGenerator.js';

/**
 * Punch — 通用直拳（右拳为主）
 * 使用参数化生成器
 */
export class Punch extends AnimationBase {
  constructor() {
    super('Punch', 0.45);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generatePunch({ hand: 'right', power: 0.9, height: 'chest' });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
