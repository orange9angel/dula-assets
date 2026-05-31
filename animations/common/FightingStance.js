import { AnimationBase, PoseMatrix } from 'dula-engine';
import { generateStance } from './PoseGenerator.js';

/**
 * FightingStance — 格斗站姿
 * 使用参数化生成器（带呼吸微动）
 */
export class FightingStance extends AnimationBase {
  constructor() {
    super('FightingStance', 2.0);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
    this._generator = generateStance({ lead: 'left' });
  }

  getPoseMatrix(t) {
    return this._generator(t);
  }
}
