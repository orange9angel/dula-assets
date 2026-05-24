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
  }

  update(t, camera, context) {
    this._computeTarget(context);

    // 平滑追踪（lerp 而不是直接跳转）
    this.currentPos.lerp(this.endPos, this.smoothness);
    camera.position.copy(this.currentPos);
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

    // 目标位置
    this.endPos = new THREE.Vector3(
      mid.x,
      this.height,
      this.distance
    );

    this.lookAtPos = mid.clone().add(new THREE.Vector3(0, 1.3, 0));
  }
}
