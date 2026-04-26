import * as THREE from 'three';
import { TransitionBase } from 'dula-engine';

/**
 * Wipe - Directional wipe transition.
 * Options: duration, color, direction (left|right|up|down)
 */
export class Wipe extends TransitionBase {
  constructor(options = {}) {
    super(options);
    this.wipeColor = options.color ?? 0x000000;
    this.direction = options.direction ?? 'left';
  }

  createOverlayMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0.0 },
        uColor: { value: new THREE.Color(this.wipeColor) },
        uDirection: { value: this._dirVector() },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        uniform vec3 uColor;
        uniform vec2 uDirection;
        varying vec2 vUv;

        void main() {
          // Project UV onto wipe direction
          float proj = dot(vUv - 0.5, uDirection) + 0.5;

          // Wipe across: threshold moves from 0 to 1 then back
          float threshold;
          if (uProgress < 0.5) {
            float t = uProgress * 2.0;
            threshold = mix(-0.2, 1.2, TransitionBase.easeInQuad(t));
          } else {
            float t = (uProgress - 0.5) * 2.0;
            threshold = mix(1.2, -0.2, TransitionBase.easeOutQuad(t));
          }

          float alpha = smoothstep(threshold - 0.05, threshold + 0.05, proj);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }

  _dirVector() {
    switch (this.direction) {
      case 'right': return new THREE.Vector2(1, 0);
      case 'left': return new THREE.Vector2(-1, 0);
      case 'up': return new THREE.Vector2(0, 1);
      case 'down': return new THREE.Vector2(0, -1);
      default: return new THREE.Vector2(-1, 0);
    }
  }
}
