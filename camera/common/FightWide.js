import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * FightWide — 格斗广角镜头
 * 展示战斗双方和周围环境，用于开场和连段间隙
 * 相机位于高处俯瞰，自动追踪角色移动
 */
export class FightWide extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 0.5 });
    this.characterA = options.characterA ?? 'Yusuke';
    this.characterB = options.characterB ?? 'Kuwabara';
    this.distance = options.distance ?? 8;
    this.height = options.height ?? 4;
    this.angle = (options.angle ?? 30) * (Math.PI / 180);
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
    this._computeTarget(context);
  }

  update(t, camera, context) {
    // 每帧追踪
    this._computeTarget(context);

    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);
    // Clamp camera above ground
    desiredPos.y = Math.max(1.0, desiredPos.y);
    camera.position.copy(desiredPos);
    camera.lookAt(this.lookAtPos);
  }

  _computeTarget(context) {
    const charA = context.characters.get(this.characterA);
    const charB = context.characters.get(this.characterB);

    let mid;
    let distAB = 0;
    if (charA && charB) {
      const posA = charA.mesh.position.clone();
      const posB = charB.mesh.position.clone();
      mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
      distAB = posA.distanceTo(posB);
    } else if (charA) {
      mid = charA.mesh.position.clone();
    } else if (charB) {
      mid = charB.mesh.position.clone();
    } else {
      return;
    }

    // 计算两人距离，动态调整相机距离
    const dynamicDist = Math.max(this.distance, distAB * 1.5 + 2);
    const dynamicHeight = Math.max(this.height, distAB * 0.5 + 2);

    // 相机位置：斜上方
    this.endPos = new THREE.Vector3(
      mid.x + Math.sin(this.angle) * dynamicDist,
      dynamicHeight,
      mid.z + Math.cos(this.angle) * dynamicDist
    );

    // 看向战斗中心
    this.lookAtPos = mid.clone().add(new THREE.Vector3(0, 1.2, 0));
  }
}
