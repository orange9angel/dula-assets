import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * FightSide — 格斗侧面镜头
 * KOF97 风格的低角度侧面拍摄，始终能看到战斗双方
 * 相机位于战斗轴线侧面，自动追踪角色位置
 */
export class FightSide extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 0.3 });
    this.characterA = options.characterA ?? 'Yusuke';
    this.characterB = options.characterB ?? 'Kuwabara';
    this.distance = options.distance ?? 7;
    this.height = options.height ?? 2.2;
    this.side = options.side ?? 'auto'; // 'auto', 'left', 'right'
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
    this._computeTarget(context);
    if (!this.endPos) this.endPos = new THREE.Vector3(0, this.height, this.distance);
    if (!this.lookAtPos) this.lookAtPos = new THREE.Vector3(0, 1.3, 0);
    // Snapshot endPos at start to prevent wobble during interpolation
    this._snapshotEndPos = this.endPos.clone();
    this._snapshotLookAt = this.lookAtPos.clone();
  }

  update(t, camera, context) {
    // Use snapshotted endPos for stable interpolation (no wobble)

    if (!this._snapshotEndPos || !this._snapshotLookAt) return;
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this._snapshotEndPos, eased);
    // Clamp camera above ground
    desiredPos.y = Math.max(0.8, desiredPos.y);
    camera.position.copy(desiredPos);
    camera.lookAt(this._snapshotLookAt);
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
      mid = new THREE.Vector3(0, 0, 0);
    }

    // 确定相机在哪一侧
    let camSide = this.side;
    if (camSide === 'auto') {
      // 自动选择：相机在战斗轴线的 Z+ 侧（观众视角）
      camSide = 'front';
    }

    // 相机位置：在战斗轴线侧面，稍微偏后
    this.endPos = new THREE.Vector3(
      mid.x,
      this.height,
      this.distance
    );

    // 看向战斗中心，略向上
    this.lookAtPos = mid.clone().add(new THREE.Vector3(0, 1.3, 0));
  }
}
