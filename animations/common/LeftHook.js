import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generateHook } from './PoseGenerator.js';

/**
 * LeftHook — 左勾拳
 * 使用参数化生成器
 */
export class LeftHook extends AnimationBase {
  constructor() {
    super('LeftHook', 0.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateHook({ hand: 'left', power: 0.85, swingAngle: 130 });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
