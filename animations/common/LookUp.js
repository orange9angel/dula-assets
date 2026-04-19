import { AnimationBase } from 'dula-engine';

export class LookUp extends AnimationBase {
  constructor() {
    super('LookUp', 1.0);
  }

  update(t, character) {
    const ease = t < 0.3 ? t / 0.3 : 1;
    const easeOut = ease * (2 - ease);

    // Head tilts back to look up
    if (character.headGroup) {
      character.headGroup.rotation.x = -easeOut * 0.5;
    }

    // Body leans back slightly
    character.mesh.rotation.x = -easeOut * 0.1;
  }
}
