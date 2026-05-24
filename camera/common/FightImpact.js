import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * FightImpact — 格斗冲击镜头
 * 跟随攻击者，在命中瞬间产生震动效果
 * 用于 Punch/Kick/SpiritSwordSwing 等打击动作
 */
export class FightImpact extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 0.5 });
    this.attacker = options.attacker ?? 'Yusuke';
    this.defender = options.defender ?? 'Kuwabara';
    this.distance = options.distance ?? 3.5;
    this.height = options.height ?? 1.8;
    this.shakeIntensity = options.shakeIntensity ?? 0.15;
    this.hitTime = options.hitTime ?? 0.5; // 命中时间点（0-1 相对进度）
  }

  start(camera, context) {
    super.start(camera, context);
    this.startPos = camera.position.clone();
    this._computeTarget(context);
  }

  update(t, camera, context) {
    // 追踪攻击者位置
    this._computeTarget(context);

    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    let desiredPos = new THREE.Vector3().lerpVectors(this.startPos, this.endPos, eased);

    // 命中瞬间震动
    const hitWindow = Math.abs(t - this.hitTime);
    if (hitWindow < 0.15) {
      const shakeDecay = 1 - hitWindow / 0.15;
      const i = this.shakeIntensity * shakeDecay;
      desiredPos.x += (Math.random() - 0.5) * i;
      desiredPos.y += (Math.random() - 0.5) * i;
      desiredPos.z += (Math.random() - 0.5) * i;
    }

    camera.position.copy(desiredPos);
    camera.lookAt(this.lookAtPos);
  }

  _computeTarget(context) {
    const attackerChar = context.characters.get(this.attacker);
    const defenderChar = context.characters.get(this.defender);
    if (!attackerChar) return;

    const attPos = attackerChar.mesh.position.clone();
    const defPos = defenderChar ? defenderChar.mesh.position.clone() : attPos.clone();

    // 相机在攻击者侧后方，朝向对手
    const dir = new THREE.Vector3().subVectors(defPos, attPos).normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(1.5);

    // 根据攻击者朝向确定相机侧
    const facingDir = attackerChar.userData?.facingDir || 1;
    const camSide = facingDir === 1 ? -1 : 1; // 相机在攻击者另一侧

    this.endPos = attPos.clone()
      .add(new THREE.Vector3(camSide * 2, this.height, 3))
      .add(side);

    // 看向两人中间偏下（打击点）
    const mid = new THREE.Vector3().addVectors(attPos, defPos).multiplyScalar(0.5);
    this.lookAtPos = mid.clone().add(new THREE.Vector3(0, 1.0, 0));
  }
}
