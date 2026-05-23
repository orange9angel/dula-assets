import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * BeamFollow — 光线追踪镜头
 * 从侧面追踪斯派修姆光线的发射轨迹
 * 适配巨人比例
 */
export class BeamFollow extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 2.0 });
    this.targetPos = new THREE.Vector3(
      options.targetX ?? 0,
      options.targetY ?? 4.0,
      options.targetZ ?? 0
    );
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = new THREE.Vector3(
      this.targetPos.x - 8,
      this.targetPos.y + 2,
      this.targetPos.z + 6
    );
    this.endPos = new THREE.Vector3(
      this.targetPos.x + 4,
      this.targetPos.y + 1,
      this.targetPos.z + 8
    );
    camera.position.copy(this.startPos);
  }

  update(t, camera, context) {
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(this.startPos, this.endPos, eased);
    // Look slightly ahead of the target
    const lookTarget = this.targetPos.clone().add(new THREE.Vector3(8, 0, 0));
    camera.lookAt(lookTarget);
  }
}
