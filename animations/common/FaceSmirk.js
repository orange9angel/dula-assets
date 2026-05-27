import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceSmirk — 得意/坏笑表情
 * One eyebrow raised, one side of mouth curled up
 * Perfect for Yusuke-style delinquent attitude
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, fighter, delinquent, agile]
 *   note: Asymmetric expression — best on expressive humanoids
 */
export class FaceSmirk extends AnimationBase {
  constructor() {
    super('FaceSmirk', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'fighter', 'delinquent', 'agile'],
      notSuits: [],
      minHeight: 0.5,
      maxHeight: 3.0,
    };
  }

  getPoseMatrix(t) {
    const ease = t < 0.3 ? t / 0.3 : 1;
    const pose = new PoseMatrix();

    // Left eyebrow: raise (cocky)
    pose.eyebrows.left = {
      py: ease * 0.018,
      rz: -ease * 0.1,
    };

    // Right eyebrow: lower slightly (asymmetric)
    pose.eyebrows.right = {
      py: -ease * 0.005,
      rz: ease * 0.15,
    };

    // Eyelids: left eye slightly more open
    pose.eyelids.left = { visible: false };
    pose.eyelids.right = { visible: true, sy: -ease * 0.15 };

    // Mouth: one side up (smirk)
    pose.mouth = {
      sy: ease * 0.3,
      rz: -ease * 0.15,
      px: ease * 0.01,
    };

    // Head: slight tilt (confident)
    pose.headGroup = {
      rz: -ease * 0.06,
      rx: -ease * 0.03,
    };

    return pose;
  }
}
