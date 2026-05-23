import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * MonsterStomp — 怪兽踩踏震动镜头
 * 模拟地面震动的剧烈摇晃
 * 适配巨人比例
 */
export class MonsterStomp extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.5 });
    this.intensity = options.intensity ?? 0.5;
    this.basePos = new THREE.Vector3();
  }

  start(camera, context) {
    super.start(camera, context);
    this.basePos.copy(camera.position);
  }

  update(t, camera, context) {
    // Decaying shake
    const decay = 1 - t;
    const shakeX = (Math.random() - 0.5) * this.intensity * decay;
    const shakeY = (Math.random() - 0.5) * this.intensity * decay * 0.5;
    const shakeZ = (Math.random() - 0.5) * this.intensity * decay;
    camera.position.set(
      this.basePos.x + shakeX,
      this.basePos.y + shakeY,
      this.basePos.z + shakeZ
    );
  }

  end(camera, context) {
    super.end(camera, context);
    camera.position.copy(this.basePos);
  }
}
