import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generateBlock } from './PoseGenerator.js';

/**
 * Block — 格挡
 * 使用参数化生成器
 */
export class Block extends AnimationBase {
  constructor() {
    super('Block', 0.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateBlock({ height: 'mid' });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
