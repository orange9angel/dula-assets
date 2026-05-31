import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generateDodge } from './PoseGenerator.js';

/**
 * Dodge — 闪避
 * 使用参数化生成器
 */
export class Dodge extends AnimationBase {
  constructor() {
    super('Dodge', 0.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateDodge({ direction: 'left', power: 0.7 });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
