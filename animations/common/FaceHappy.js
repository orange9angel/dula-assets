import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceHappy — 开心/微笑表情
 * Eyebrows raise slightly, eyes open wide, mouth curves up
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, monster, round, tiny]
 *   note: Universal positive expression
 */
export class FaceHappy extends AnimationBase {
  constructor() {
    super('FaceHappy', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'monster', 'round', 'tiny'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const ease = t < 0.3 ? t / 0.3 : 1;

    // Eyebrows: raise clearly (friendly arch)
    pose.eyebrows = {
      left: { py: ease * 0.025, rz: -ease * 0.30 },
      right: { py: ease * 0.025, rz: ease * 0.30 },
    };

    // Eyelids: wide open (bright eyes)
    pose.eyelids = {
      left: { visible: false, sy: 0 },
      right: { visible: false, sy: 0 },
    };

    // Mouth: big smile — wider and slightly taller when not speaking
    pose.mouth = { tension: 0.0, sx: ease * 0.25, sy: ease * 0.15 };

    // Head: slight tilt up (cheerful)
    pose.headGroup = { rx: -ease * 0.05 };

    return pose;
  }
}
