import { AnimationBase } from 'dula-engine';

/**
 * FXScreenShake — 屏幕震动
 * Camera shake triggered by character action (KOF heavy hit feel)
 * This animation doesn't spawn particles — it sets a shake flag
 * that the camera system reads
 * Duration: 0.4s
 *
 * Tags:
 *   requires: [mesh]
 *   suits: [humanoid, fighter, athletic, monster]
 *   note: Use with heavy hits, Knockdown, or earth-shaking moves
 */
export class FXScreenShake extends AnimationBase {
  constructor() {
    super('FXScreenShake', 0.4);
    this.tags = {
      requires: ['mesh'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    // Set shake intensity on the character mesh for the camera to pick up
    if (!character.mesh) return;

    // Decaying shake intensity
    const intensity = (1 - t) * 0.3;
    character.mesh.userData.screenShake = intensity;

    // Also add a subtle body vibration
    if (t < 0.5) {
      const vibrate = Math.sin(t * Math.PI * 30) * intensity * 0.02;
      character.mesh.position.y = (character.baseY || 0) + vibrate;
    }
  }
}
