import * as THREE from 'three';
import { TransitionBase } from 'dula-engine';

/**
 * Iris - Circular iris wipe (like old cartoons).
 * Options: duration, color, center (x,y normalized 0..1)
 */
export class Iris extends TransitionBase {
  constructor(options = {}) {
    super(options);
    this.irisColor = options.color ?? 0x000000;
    this.centerX = options.center?.[0] ?? 0.5;
    this.centerY = options.center?.[1] ?? 0.5;
  }

  createOverlayMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0.0 },
        uColor: { value: new THREE.Color(this.irisColor) },
        uCenter: { value: new THREE.Vector2(this.centerX, this.centerY) },
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
        uniform vec2 uCenter;
        uniform float uAspect;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          uv.x *= uAspect;
          vec2 center = uCenter;
          center.x *= uAspect;

          float dist = distance(uv, center);

          // Iris close then open: progress 0..0.5 = close, 0.5..1 = open
          float radius;
          if (uProgress < 0.5) {
            // Closing: radius goes from large to 0 (ease-in: t*t)
            float t = uProgress * 2.0;
            t = t * t;
            radius = mix(1.5, 0.0, t);
          } else {
            // Opening: radius goes from 0 to large (ease-out: 1-(1-t)^2)
            float t = (uProgress - 0.5) * 2.0;
            t = 1.0 - (1.0 - t) * (1.0 - t);
            radius = mix(0.0, 1.5, t);
          }

          float alpha = smoothstep(radius - 0.02, radius + 0.02, dist);
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
    // Update aspect ratio from renderer
    const size = renderer.getSize(new THREE.Vector2());
    if (this.overlay && this.overlay.material.uniforms.uAspect) {
      this.overlay.material.uniforms.uAspect.value = size.width / size.height;
    }
  }
}
