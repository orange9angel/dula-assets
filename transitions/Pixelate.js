import * as THREE from 'three';
import { TransitionBase } from 'dula-engine';

/**
 * Pixelate - Retro pixel dissolve transition.
 * Options: duration, color, blockSize (1..50)
 */
export class Pixelate extends TransitionBase {
  constructor(options = {}) {
    super(options);
    this.blockSize = options.blockSize ?? 20.0;
    this.pixelColor = options.color ?? 0x000000;
  }

  createOverlayMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0.0 },
        uColor: { value: new THREE.Color(this.pixelColor) },
        uBlockSize: { value: this.blockSize },
        uResolution: { value: new THREE.Vector2(1920, 1080) },
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
        uniform float uBlockSize;
        uniform vec2 uResolution;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
          vec2 blockUv = floor(vUv * uResolution / uBlockSize) / (uResolution / uBlockSize);
          float r = random(blockUv);

          // Progress: blocks appear randomly based on threshold
          float threshold;
          if (uProgress < 0.5) {
            threshold = uProgress * 2.0;
          } else {
            threshold = (1.0 - uProgress) * 2.0;
          }

          float alpha = smoothstep(threshold - 0.1, threshold + 0.1, r);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }

  start(renderer, camera, context) {
    super.start(renderer, camera, context);
    const size = renderer.getSize(new THREE.Vector2());
    if (this.overlay && this.overlay.material.uniforms.uResolution) {
      this.overlay.material.uniforms.uResolution.value.set(size.width, size.height);
    }
  }
}
