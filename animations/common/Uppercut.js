import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generateUppercut } from './PoseGenerator.js';

/**
 * Uppercut — 上勾拳
 * 使用参数化生成器
 */
export class Uppercut extends AnimationBase {
  constructor() {
    super('Uppercut', 0.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateUppercut({ hand: 'right', power: 0.9 });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
