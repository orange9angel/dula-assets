import * as THREE from 'three';
import { TransitionBase } from 'dula-engine';

/**
 * ZoomBlur - Radial zoom blur transition (speed lines effect).
 * Options: duration, color, center (x,y normalized 0..1), intensity
 */
export class ZoomBlur extends TransitionBase {
  constructor(options = {}) {
    super(options);
    this.centerX = options.center?.[0] ?? 0.5;
    this.centerY = options.center?.[1] ?? 0.5;
    this.intensity = options.intensity ?? 1.0;
  }

  createOverlayMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0.0 },
        uCenter: { value: new THREE.Vector2(this.centerX, this.centerY) },
        uIntensity: { value: this.intensity },
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
        uniform vec2 uCenter;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          vec2 dir = vUv - uCenter;
          float dist = length(dir);

          // Speed lines radiating from center
          float angle = atan(dir.y, dir.x);
          float lines = sin(angle * 20.0 + dist * 30.0) * 0.5 + 0.5;

          // Progress: 0..0.5 = build up, 0.5..1 = fade out
          float alpha;
          if (uProgress < 0.5) {
            float t = uProgress * 2.0;
            alpha = lines * t * uIntensity;
          } else {
            float t = (uProgress - 0.5) * 2.0;
            alpha = lines * (1.0 - t) * uIntensity;
          }

          // White speed lines
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.7);
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }
}
