import { AnimationBase } from 'dula-engine';

function positiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * WormTunnel - low crawling motion for going under hurdles.
 *
 * DiscoWorm is built as a vertical stack of segments, so this animation
 * directly repositions those segments into a low horizontal wave.
 */
export class WormTunnel extends AnimationBase {
  constructor(options = {}) {
    const duration = positiveNumber(options.duration, 2.0);
    super('WormTunnel', duration);
    this.speed = positiveNumber(options.speed, 2.8);
    this.amplitude = positiveNumber(options.amplitude, 0.12);

    this.tags = {
      requires: [],
      suits: ['worm', 'serpent', 'round'],
      notSuits: ['humanoid', 'fighter', 'quadruped'],
      minHeight: 0,
      maxHeight: 1.5,
    };
  }

  update(t, character) {
    const segments = character.segments || [];
    if (!segments.length) return;

    if (!character._wormTunnelBaseSegments) {
      character._wormTunnelBaseSegments = segments.map((seg) => ({
        position: seg.position.clone(),
        rotation: seg.rotation.clone(),
      }));
      character._wormTunnelBaseY = character.baseY ?? character.mesh.position.y;
    }

    const phase = t * this.speed * Math.PI * 2;
    const center = (segments.length - 1) / 2;
    const baseY = character._wormTunnelBaseY ?? character.baseY ?? character.mesh.position.y;
    character.mesh.position.y = Math.max(0.08, baseY - 0.28 + Math.sin(phase * 1.4) * 0.025);

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segPhase = phase + i * 0.75;
      const offset = i - center;
      const wave = Math.sin(segPhase) * this.amplitude;

      seg.position.x = Math.sin(segPhase * 0.9) * 0.05;
      seg.position.y = 0.26 + Math.cos(segPhase * 1.2) * 0.035;
      seg.position.z = offset * 0.28 + wave;
      seg.rotation.x = Math.sin(segPhase) * 0.16;
      seg.rotation.y = Math.cos(segPhase * 0.8) * 0.22;
      seg.rotation.z = Math.sin(segPhase * 1.3) * 0.18;
    }

    const legCycle = Math.sin(phase * 1.8);
    for (const leg of character.legs || []) {
      leg.hip.rotation.x = 0.75 + legCycle * 0.22 * leg.side;
      leg.hip.rotation.z = -0.45 * leg.side;
      leg.knee.rotation.x = 0.55;
      leg.ankle.rotation.x = -0.18;
    }

    if (character.leftArm) character.leftArm.rotation.z = -0.65 + Math.sin(phase) * 0.18;
    if (character.rightArm) character.rightArm.rotation.z = 0.65 - Math.sin(phase) * 0.18;
  }
}
