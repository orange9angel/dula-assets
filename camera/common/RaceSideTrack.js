import * as THREE from 'three';
import { CameraMoveBase } from 'dula-engine';

/**
 * RaceSideTrack — 跨栏/赛跑侧面跟踪相机
 *
 * 从侧面同时跟踪多名选手的比赛，相机根据领跑者位置平行移动，
 * 保持跑道和选手始终在画面中。
 *
 * 参数：
 *   sideX: 相机在跑道侧面的 X 位置（默认 12，跑道右侧）
 *   height: 相机高度（默认 3.5）
 *   lookAtY: 看向的高度（默认 1.2）
 *   leadZ: 领跑者的初始 Z 位置（默认 -50）
 *   trackWidth: 需要框住的跑道宽度（默认 8）
 *   frameDepth: 需要框住的前后比赛纵深（默认 28）
 *   leaderBias: 画面中心偏向领跑者的比例，0.5=队伍中点（默认 0.58）
 *   fov: 视野角度（默认 60，用于计算相机距离）
 */
export class RaceSideTrack extends CameraMoveBase {
  constructor(options = {}) {
    super({ duration: options.duration ?? 1.0 });
    this.sideX = options.sideX ?? 12;
    this.height = options.height ?? 3.5;
    this.lookAtY = options.lookAtY ?? 1.2;
    this.leadZ = options.leadZ ?? -50;
    this.trackWidth = options.trackWidth ?? 8;
    this.frameDepth = options.frameDepth ?? options.trackDepth ?? 28;
    this.leaderBias = options.leaderBias ?? 0.58;
    this.fov = options.fov ?? 60;
    this.racers = String(options.racers || 'Zorak,Klaw,Vex,Rex,DiscoWorm')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
  }

  start(camera, context) {
    super.start(camera, context);
    if (camera && typeof camera.fov === 'number') {
      camera.fov = this.fov;
      if (typeof camera.updateProjectionMatrix === 'function') {
        camera.updateProjectionMatrix();
      }
    }
    const fovRad = (this.fov * Math.PI) / 180;
    const minDistance = (this.trackWidth / 2) / Math.tan(fovRad / 2);
    const aspect = camera && typeof camera.aspect === 'number' ? camera.aspect : 16 / 9;
    const horizontalScale = Math.tan(fovRad / 2) * aspect;
    const minFrameDepthDistance = (this.frameDepth / 2) / Math.max(0.001, horizontalScale);
    this.sideSign = this.sideX < 0 ? -1 : 1;
    this.actualSideX = Math.max(Math.abs(this.sideX), minDistance + 2, minFrameDepthDistance + 2);
  }

  update(t, camera, context) {
    let leadZ = this.leadZ;
    let minZ = Infinity;
    let maxZ = -Infinity;

    const chars = context && context.characters ? context.characters : null;
    if (chars) {
      try {
        const values = typeof chars.values === 'function' ? Array.from(chars.values()) : Object.values(chars);
        for (const char of values) {
          if (this.racers.length && char.name && !this.racers.includes(char.name)) continue;
          if (char && char.mesh && char.mesh.position && typeof char.mesh.position.z === 'number') {
            const x = char.mesh.position.x;
            const z = char.mesh.position.z;
            const onTrack = Math.abs(x) <= this.trackWidth / 2 + 1.2 && z >= -60 && z <= 70;
            if (onTrack) {
              minZ = Math.min(minZ, z);
              maxZ = Math.max(maxZ, z);
            }
            if (char.mesh.position.z > leadZ) {
              leadZ = char.mesh.position.z;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    let focusZ = leadZ;
    if (Number.isFinite(minZ) && Number.isFinite(maxZ)) {
      const span = maxZ - minZ;
      focusZ = minZ + span * this.leaderBias;
    }

    camera.position.set(this.sideSign * this.actualSideX, this.height, focusZ);
    camera.lookAt(0, this.lookAtY, focusZ);
  }
}
