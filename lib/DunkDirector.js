import * as THREE from 'three';

/**
 * DunkDirector — 扣篮轨迹计算导演
 *
 * 职责：
 * 1. 根据角色起始位置和篮筐位置计算扣篮飞行轨迹
 * 2. 分解为：助跑 → 起跳 → 空中飞行 → 扣篮释放 → 落地
 * 3. 输出角色路径、篮球路径、手臂动画时间轴
 */

const PLAYER_META = {
  Doraemon: { height: 1.8, armReach: 2.3, jumpMultiplier: 1.0 },
  Nobita: { height: 1.6, armReach: 2.1, jumpMultiplier: 0.9 },
  Shizuka: { height: 1.45, armReach: 1.9, jumpMultiplier: 0.85 },
  RockLee: { height: 1.6, armReach: 2.2, jumpMultiplier: 1.3 },
};

export class DunkDirector {
  constructor(courtGeometry) {
    this.geom = courtGeometry;
  }

  getPlayerMeta(role) {
    return PLAYER_META[role] || { height: 1.6, armReach: 2.1, jumpMultiplier: 1.0 };
  }

  /**
   * 计算扣篮完整轨迹
   *
   * @param {string} character - 角色名
   * @param {{x,y,z}} startPos - 起始位置
   * @param {THREE.Vector3} hoopPos - 篮筐位置
   * @param {Object} options
   * @param {number} options.jumpHeight - 最大跳跃高度（默认 4.0）
   * @param {number} options.hangTime - 空中悬停时间（默认 1.5）
   * @param {number} options.approachAngle - 接近角度（度，默认 0=正面）
   * @param {number} options.runUpDistance - 助跑距离（默认 4.0）
   * @param {number} options.releaseHeight - 释放高度（默认篮筐高度+0.3）
   * @returns {Object|null} 轨迹数据
   */
  computeDunkTrajectory(character, startPos, hoopPos, options = {}) {
    const meta = this.getPlayerMeta(character);
    const jumpHeight = options.jumpHeight !== undefined ? options.jumpHeight : 4.0;
    const hangTime = options.hangTime !== undefined ? options.hangTime : 1.5;
    const approachAngle = (options.approachAngle || 0) * (Math.PI / 180);
    const runUpDistance = options.runUpDistance !== undefined ? options.runUpDistance : 4.0;
    const releaseHeight = options.releaseHeight !== undefined ? options.releaseHeight : hoopPos.y + 0.3;

    // Direction from start to hoop (horizontal only)
    const dx = hoopPos.x - startPos.x;
    const dz = hoopPos.z - startPos.z;
    const horizontalDist = Math.sqrt(dx * dx + dz * dz);
    const dirX = dx / horizontalDist;
    const dirZ = dz / horizontalDist;

    // Run-up start position (back away from hoop)
    const runUpX = startPos.x - dirX * runUpDistance;
    const runUpZ = startPos.z - dirZ * runUpDistance;

    // Take-off point (slightly before hoop, with approach angle offset)
    const takeOffDist = 1.5;
    const angleOffsetX = Math.sin(approachAngle) * takeOffDist;
    const takeOffX = hoopPos.x - dirX * takeOffDist + angleOffsetX;
    const takeOffZ = hoopPos.z - dirZ * takeOffDist;

    // Timing calculations
    const runUpSpeed = 4.0; // units/sec
    const runUpDuration = runUpDistance / runUpSpeed;

    // Jump physics: parabolic arc
    // y(t) = y0 + v0*t - 0.5*g*t^2
    // At peak: t_peak = v0/g, y_peak = y0 + v0^2/(2g)
    // Total air time = 2*t_peak (up and down to same height)
    // But we want to reach releaseHeight at hoop
    const g = 9.8;
    const y0 = startPos.y;
    const yPeak = y0 + jumpHeight;
    const v0 = Math.sqrt(2 * g * (yPeak - y0));
    const tPeak = v0 / g;

    // Time to reach release height on descent
    // y_release = yPeak - 0.5*g*(t - tPeak)^2
    // => t_release = tPeak + sqrt(2*(yPeak - y_release)/g)
    const tRelease = tPeak + Math.sqrt(Math.max(0, 2 * (yPeak - releaseHeight) / g));

    // Total air time (land at ground)
    const tLand = tPeak + Math.sqrt(2 * yPeak / g);

    // Hang time extension (slow-mo at peak)
    const hangExtension = hangTime;

    // Character path (array of {x, y, z, time})
    const characterPath = [];
    const steps = 20;

    // Run-up phase
    for (let i = 0; i <= 5; i++) {
      const t = (i / 5) * runUpDuration;
      const x = runUpX + (takeOffX - runUpX) * (i / 5);
      const z = runUpZ + (takeOffZ - runUpZ) * (i / 5);
      characterPath.push({ x, y: y0, z, time: t });
    }

    // Jump phase (up to release)
    const jumpStartTime = runUpDuration;
    const jumpSteps = 10;
    for (let i = 0; i <= jumpSteps; i++) {
      const t = (i / jumpSteps) * tRelease;
      const jumpT = jumpStartTime + t;
      const progress = i / jumpSteps;

      // Horizontal lerp from take-off to hoop
      const x = takeOffX + (hoopPos.x - takeOffX) * progress;
      const z = takeOffZ + (hoopPos.z - takeOffZ) * progress;

      // Vertical parabola
      let y;
      if (t <= tPeak) {
        y = y0 + v0 * t - 0.5 * g * t * t;
      } else {
        const tDescent = t - tPeak;
        y = yPeak - 0.5 * g * tDescent * tDescent;
      }

      characterPath.push({ x, y: Math.max(y0, y), z, time: jumpT });
    }

    // Hang phase (if any)
    const hangStartTime = jumpStartTime + tRelease;
    const hangEndTime = hangStartTime + hangExtension;
    if (hangExtension > 0.1) {
      characterPath.push({
        x: hoopPos.x,
        y: releaseHeight,
        z: hoopPos.z,
        time: hangStartTime + hangExtension * 0.5,
      });
    }

    // Descent / land
    const landStartTime = hangEndTime;
    const landSteps = 5;
    for (let i = 1; i <= landSteps; i++) {
      const t = (i / landSteps) * (tLand - tRelease);
      const landT = landStartTime + t;
      const progress = i / landSteps;

      // Land slightly past hoop
      const landX = hoopPos.x + dirX * 1.5 * progress;
      const landZ = hoopPos.z + dirZ * 1.5 * progress;

      const tDescent = tRelease + t;
      const y = yPeak - 0.5 * g * (tDescent - tPeak) * (tDescent - tPeak);

      characterPath.push({ x: landX, y: Math.max(y0, y), z: landZ, time: landT });
    }

    // Ball path (released at release point, falls through hoop)
    const ballPath = [];
    const ballReleaseTime = hangStartTime;
    const ballSteps = 8;
    for (let i = 0; i <= ballSteps; i++) {
      const t = (i / ballSteps) * 0.6; // ball falls in 0.6s
      const ballT = ballReleaseTime + t;
      const y = releaseHeight - 0.5 * g * t * t;
      ballPath.push({
        x: hoopPos.x,
        y: Math.max(hoopPos.y - 0.5, y),
        z: hoopPos.z,
        time: ballT,
      });
    }

    // Arm animation schedule
    const armSchedule = [
      {
        startTime: hangStartTime - 0.3,
        endTime: hangStartTime + 0.5,
        armAngleX: -Math.PI * 0.7, // arm raised high
        armAngleZ: 0,
      },
    ];

    const totalDuration = landStartTime + (tLand - tRelease);

    return {
      characterPath,
      ballPath,
      armSchedule,
      timings: {
        runUpEnd: runUpDuration,
        jumpStart: jumpStartTime,
        releaseTime: ballReleaseTime,
        hangStart: hangStartTime,
        hangEnd: hangEndTime,
        landTime: landStartTime + (tLand - tRelease),
      },
      totalDuration,
    };
  }
}
