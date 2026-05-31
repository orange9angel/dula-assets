import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generateHook } from './PoseGenerator.js';

/**
 * RightHook — 右勾拳
 * 使用参数化生成器
 */
export class RightHook extends AnimationBase {
  constructor() {
    super('RightHook', 0.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateHook({ hand: 'right', power: 0.9, swingAngle: 140 });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
