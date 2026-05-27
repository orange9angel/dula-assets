import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceDetermined — 坚定/决意表情
 * Eyebrows level and focused, eyes sharp, mouth firm line
 * Perfect for pre-fight or resolve moments
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Battle-ready expression
 */
export class FaceDetermined extends AnimationBase {
  constructor() {
    super('FaceDetermined', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const ease = t < 0.3 ? t / 0.3 : 1;

    // Eyebrows: level, slightly lowered (intense focus)
    pose.eyebrows = {
      left: { py: -ease * 0.008, rz: 0 },
      right: { py: -ease * 0.008, rz: 0 },
    };

    // Eyelids: slight squint (sharp focus)
    pose.eyelids = {
      left: { sy: -ease * 0.25, visible: true },
      right: { sy: -ease * 0.25, visible: true },
    };

    // Pupils: focused forward (reset any drift)
    pose.pupils = {
      left: { px: 0 },
      right: { px: 0 },
    };

    // Mouth: firm straight line (grit)
    pose.mouth = { sy: -ease * 0.7, rz: 0 };

    // Head: slight forward (locked in)
    pose.headGroup = { rx: ease * 0.05, ry: 0 };

    return pose;
  }
}
