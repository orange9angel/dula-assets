import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generatePunch } from './PoseGenerator.js';

/**
 * LeftPunch — 左手直拳
 * 使用参数化生成器
 */
export class LeftPunch extends AnimationBase {
  constructor() {
    super('LeftPunch', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generatePunch({ hand: 'left', power: 0.75, height: 'head' });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
