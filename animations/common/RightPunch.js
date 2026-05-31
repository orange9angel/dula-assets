import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generatePunch } from './PoseGenerator.js';

/**
 * RightPunch — 右手直拳
 * 使用参数化生成器
 */
export class RightPunch extends AnimationBase {
  constructor() {
    super('RightPunch', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generatePunch({ hand: 'right', power: 0.75, height: 'head' });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
