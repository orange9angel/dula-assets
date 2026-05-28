import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * FightFollow — 格斗追踪镜头
 * 相机始终保持在战斗轴线的侧面，平滑追踪移动中的角色
 * 用于 DashForward、Dodge 等高速移动动作
 */
export class FightFollow extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 0.3 });
    this.characterA = options.characterA ?? 'Yusuke';
    this.characterB = options.characterB ?? 'Kuwabara';
    this.distance = options.distance ?? 6;
    this.height = options.height ?? 2.5;
    this.smoothness = options.smoothness ?? 0.15;
  }

  start(camera, context) {
    super.start(camera, context);
    this.currentPos = camera.position.clone();
    this._computeTarget(context);
    this._lastTargetPos = this.endPos.clone();
  }

  update(t, camera, context) {
    this._computeTarget(context);

    // Smooth follow with delta-time compensation to reduce wobble at 30fps
    const dtCompensatedSmooth = Math.min(0.5, this.smoothness * 2.0);
    this.currentPos.lerp(this.endPos, dtCompensatedSmooth);
    // Clamp camera above ground
    this.currentPos.y = Math.max(0.8, this.currentPos.y);
    camera.position.copy(this.currentPos);
    // Smooth lookAt to prevent jitter
    if (!this._smoothLookAt) this._smoothLookAt = this.lookAtPos.clone();
    this._smoothLookAt.lerp(this.lookAtPos, 0.3);
    camera.lookAt(this._smoothLookAt);
  }

  _computeTarget(context) {
    const charA = context.characters.get(this.characterA);
    const charB = context.characters.get(this.characterB);

    let mid;
    if (charA && charB) {
      const posA = charA.mesh.position.clone();
      const posB = charB.mesh.position.clone();
      mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
    } else if (charA) {
      mid = charA.mesh.position.clone();
    } else if (charB) {
      mid = charB.mesh.position.clone();
    } else {
      return;
    }

    // 目标位置
    this.endPos = new THREE.Vector3(
      mid.x,
      this.height,
      this.distance
    );

    this.lookAtPos = mid.clone().add(new THREE.Vector3(0, 1.3, 0));
  }
}
