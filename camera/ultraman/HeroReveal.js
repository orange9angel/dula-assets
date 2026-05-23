import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * HeroReveal — 英雄 reveal 镜头
 * 从低角度缓缓上摇，揭示奥特曼的伟岸身姿
 * 适配40米巨人比例（角色约6.5单位高）
 */
export class HeroReveal extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 2.5 });
    this.targetPos = new THREE.Vector3(
      options.targetX ?? 0,
      options.targetY ?? 4.0,
      options.targetZ ?? 0
    );
    this.startDistance = options.startDistance ?? 15;
    this.endDistance = options.endDistance ?? 8;
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = new THREE.Vector3(
      this.targetPos.x + this.startDistance * 0.3,
      this.targetPos.y - 3.0,
      this.targetPos.z + this.startDistance
    );
    this.endPos = new THREE.Vector3(
      this.targetPos.x + this.endDistance * 0.2,
      this.targetPos.y + 1.0,
      this.targetPos.z + this.endDistance
    );
    camera.position.copy(this.startPos);
  }

  update(t, camera, context) {
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(this.startPos, this.endPos, eased);
    camera.lookAt(this.targetPos);
  }
}
