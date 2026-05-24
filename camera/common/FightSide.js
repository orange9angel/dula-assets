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
  }

  update(t, camera, context) {
    // 每帧重新计算目标，追踪移动中的角色
    this._computeTarget(context);

    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);
    camera.position.copy(desiredPos);
    camera.lookAt(this.lookAtPos);
  }

  _computeTarget(context) {
    const charA = context.characters.get(this.characterA);
    const charB = context.characters.get(this.characterB);
    if (!charA || !charB) return;

    const posA = charA.mesh.position.clone();
    const posB = charB.mesh.position.clone();

    // 战斗中点
    const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);

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
