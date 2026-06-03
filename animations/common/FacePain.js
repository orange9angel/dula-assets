import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FacePain — 痛苦/受伤表情
 * Eyebrows pinch together and up, eyes squeeze shut, mouth grimaces
 * Perfect for hit reactions and damage
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Pairs well with HitStagger / Knockdown
 */
export class FacePain extends AnimationBase {
  constructor() {
    super('FacePain', 0.5);
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
    const ease = t < 0.2 ? t / 0.2 : 1;
    const pose = new PoseMatrix();

    // Eyebrows: pinch together and raise (pain furrow)
    pose.eyebrows = {
      left: { py: ease * 0.015, px: ease * 0.008, rz: -ease * 0.2 },
      right: { py: ease * 0.015, px: -ease * 0.008, rz: ease * 0.2 },
    };

    // Eyelids: squeeze shut
    pose.eyelids = {
      left: { visible: true, sy: -ease * 0.85 },
      right: { visible: true, sy: -ease * 0.85 },
    };

    // Mouth: grimace — open slightly, twisted
    pose.mouth = { tension: 0.5 };

    // Head: flinch back
    pose.headGroup = {
      rx: -ease * 0.1,
      rz: (Math.random() - 0.5) * ease * 0.05,
    };

    return pose;
  }
}
