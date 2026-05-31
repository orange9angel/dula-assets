import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generateDash } from './PoseGenerator.js';

/**
 * DashForward — 前冲
 * 使用参数化生成器
 */
export class DashForward extends AnimationBase {
  constructor() {
    super('DashForward', 0.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateDash({ power: 0.85 });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
