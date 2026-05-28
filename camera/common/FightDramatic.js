import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * FightDramatic — 格斗戏剧性低角度镜头
 * 极低的仰拍角度，强调角色的气势和力量感
 * 用于大招蓄力、变身、决胜时刻
 */
export class FightDramatic extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.character = options.character ?? 'Yusuke';
    this.distance = options.distance ?? 3;
    this.height = options.height ?? 0.5;
    this.side = options.side ?? 'auto'; // 'auto', 'left', 'right'
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
    this._computeTarget(context);
  }

  update(t, camera, context) {
    this._computeTarget(context);

    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);
    // Clamp camera above ground
    desiredPos.y = Math.max(0.4, desiredPos.y);
    camera.position.copy(desiredPos);
    camera.lookAt(this.lookAtPos);
  }

  _computeTarget(context) {
    const char = context.characters.get(this.character);
    if (!char) return;

    const pos = char.mesh.position.clone();
    const facingDir = char.userData?.facingDir || 1;

    // 确定相机在哪一侧
    let camSide = this.side;
    if (camSide === 'auto') {
      camSide = facingDir === 1 ? -1 : 1;
    } else if (camSide === 'left') {
      camSide = -1;
    } else if (camSide === 'right') {
      camSide = 1;
    }

    // 极低角度，在角色侧前方
    this.endPos = new THREE.Vector3(
      pos.x + camSide * this.distance,
      this.height,
      pos.z + 2
    );

    // 看向角色胸部以上
    this.lookAtPos = pos.clone().add(new THREE.Vector3(0, 1.6, 0));
  }
}
