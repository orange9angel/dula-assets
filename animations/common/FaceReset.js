import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceReset — 表情重置
 * Smoothly returns all facial features to their neutral/base positions
 * Use this to clear a previous expression before applying a new one
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, round, tiny]
 *   note: Universal cleanup expression
 */
export class FaceReset extends AnimationBase {
  constructor() {
    super('FaceReset', 0.3);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'monster', 'round', 'tiny'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  getPoseMatrix(/* t */) {
    // In matrix mode, the controller lerps back to baseline automatically,
    // so returning a zero pose is sufficient to reset the expression.
    return PoseMatrix.zero();
  }
}
