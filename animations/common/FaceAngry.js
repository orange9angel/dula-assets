import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceAngry — 愤怒表情
 * Eyebrows lower and angle inward, eyes narrow, mouth tightens
 * Works on any character with eyebrows + mouth
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, fighter]
 *   note: Gracefully skips missing eyebrow / eyelid parts
 */
export class FaceAngry extends AnimationBase {
  constructor() {
    super('FaceAngry', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'monster', 'fighter'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const ease = t < 0.3 ? t / 0.3 : 1; // quick settle

    // Eyebrows: lower and angle sharply inward (angry V-shape)
    pose.eyebrows = {
      left: { py: -ease * 0.030, rz: ease * 0.60 },
      right: { py: -ease * 0.030, rz: -ease * 0.60 },
    };

    // Eyelids: narrow eyes (squint)
    pose.eyelids = {
      left: { sy: -ease * 0.55, visible: true },
      right: { sy: -ease * 0.55, visible: true },
    };

    // Pupils: smaller (intense stare)
    pose.pupils = {
      left: { sx: -ease * 0.25, sy: -ease * 0.25, sz: -ease * 0.25 },
      right: { sx: -ease * 0.25, sy: -ease * 0.25, sz: -ease * 0.25 },
    };

    // Mouth: tight (tension shrinks the mouth during lip-sync)
    pose.mouth = { tension: ease * 0.75 };

    // Head: slight forward thrust (aggressive posture)
    pose.headGroup = { rx: ease * 0.08 };

    return pose;
  }
}
