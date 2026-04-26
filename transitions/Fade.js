import * as THREE from 'three';
import { TransitionBase } from 'dula-engine';

/**
 * Fade - Simple fade to black and back.
 * Options: color (hex), duration (seconds)
 */
export class Fade extends TransitionBase {
  constructor(options = {}) {
    super(options);
    this.fadeColor = options.color ?? 0x000000;
  }

  createOverlayMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0.0 },
        uColor: { value: new THREE.Color(this.fadeColor) },
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
        varying vec2 vUv;
        void main() {
          // Fade in then out: sin(0..PI) shape
          float alpha = sin(uProgress * 3.14159265);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }
}
