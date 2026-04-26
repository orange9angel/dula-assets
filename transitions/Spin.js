import * as THREE from 'three';
import { TransitionBase } from 'dula-engine';

/**
 * Spin - Spiral spin transition (like anime scene changes).
 * Options: duration, color, segments (number of spiral arms)
 */
export class SpinTransition extends TransitionBase {
  constructor(options = {}) {
    super(options);
    this.spinColor = options.color ?? 0x000000;
    this.segments = options.segments ?? 4;
  }

  createOverlayMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0.0 },
        uColor: { value: new THREE.Color(this.spinColor) },
        uSegments: { value: this.segments },
        uAspect: { value: 1.0 },
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
        uniform float uSegments;
        uniform float uAspect;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv - 0.5;
          uv.x *= uAspect;

          float angle = atan(uv.y, uv.x);
          float dist = length(uv);

          // Spiral pattern
          float spiral = sin(angle * uSegments + dist * 10.0 - uProgress * 20.0);

          // Progress: spiral sweeps across screen
          float sweep = uProgress * 3.0 - 0.5;
          float alpha = smoothstep(sweep - 0.3, sweep + 0.3, dist + spiral * 0.1);

          // Fade out in second half
          if (uProgress > 0.5) {
            alpha *= 1.0 - (uProgress - 0.5) * 2.0;
          }

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
    if (this.overlay && this.overlay.material.uniforms.uAspect) {
      this.overlay.material.uniforms.uAspect.value = size.width / size.height;
    }
  }
}
