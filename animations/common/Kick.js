import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generateKick } from './PoseGenerator.js';

/**
 * Kick — 前踢
 * 使用参数化生成器
 */
export class Kick extends AnimationBase {
  constructor() {
    super('Kick', 0.6);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateKick({ leg: 'right', style: 'front', power: 0.85, height: 'mid' });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
