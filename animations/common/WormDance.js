import { AnimationBase, PoseMatrix } from 'dula-engine';

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function positiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function easeInOut(t) {
  const p = clamp(0, 1, t);
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

/**
 * WormDance — 迪斯科舞王毛毛虫劲爆舞蹈 v4.0
 * 
 * 真正带关节的动画：
 * - 4条腿：hip → knee → ankle，像人一样走路跳舞
 * - 2只手：shoulder → elbow → wrist，摇摆挥舞
 * - 搞笑表情：眉毛、嘴巴、瞳孔都会动
 * - 超大扭动幅度！
 */
export class WormDance extends AnimationBase {
  constructor(options = {}) {
    const bpm = positiveNumber(options.bpm ?? options.tempo, 128);
    const beats = positiveNumber(options.beats ?? options.beatCount, 96);
    const beatDuration = 60 / bpm;
    const defaultDuration = beats * beatDuration;

    super('WormDance', positiveNumber(options.duration, defaultDuration));
    this.usePoseMatrix = true;
    this.bpm = bpm;
    this.beatDuration = beatDuration;
    this.totalBeats = beats;
    this.segmentCount = options.segmentCount || 6;

    this.tags = {
      requires: [],
      suits: ['worm', 'serpent', 'round'],
      notSuits: ['humanoid', 'fighter', 'quadruped'],
      minHeight: 0,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t, elapsed, duration, time) {
    const pose = new PoseMatrix();
    const beat = t * this.totalBeats;
    const beatIndex = Math.floor(beat);
    const beatPhase = beat % 1;
    const danceStep = beatIndex % 8;

    const energy = this._energyCurve(beatPhase);
    const bounce = this._bounceCurve(beatPhase);

    // 整体弹跳
    pose.mesh = {
      x: Math.sin(beat * Math.PI * 0.5) * 0.05 * energy,
      y: bounce * 0.1,
      z: 0,
      rx: 0,
      ry: Math.sin(beat * 0.25) * 0.15 * energy,
      rz: 0,
    };

    // 腿动画（真正走路！）
    this._animateLegs(pose, beat, beatPhase, danceStep, energy, bounce);
    // 手动画（摇摆挥舞！）
    this._animateArms(pose, beat, beatPhase, danceStep, energy, bounce);
    // 身体扭动
    this._animateBody(pose, beat, beatPhase, danceStep, energy, bounce);
    // 搞笑表情
    this._animateFace(pose, beat, beatPhase, danceStep, energy);

    return pose;
  }

  _energyCurve(phase) {
    if (phase < 0.1) return phase / 0.1;
    return Math.exp(-(phase - 0.1) * 4);
  }

  _bounceCurve(phase) {
    return Math.max(0, Math.sin(phase * Math.PI));
  }

  // ===== 腿动画：真正走路跳舞！ =====
  _animateLegs(pose, beat, beatPhase, danceStep, energy, bounce) {
    // 4条腿的配置：左前、右前、左后、右后
    const legs = [
      { hip: 'leftLeg',  knee: 'leftKnee',  ankle: 'leftAnkle',  side: -1, front: true },
      { hip: 'rightLeg', knee: 'rightKnee', ankle: 'rightAnkle', side: 1,  front: true },
      { hip: 'leftLeg2',  knee: 'leftKnee2',  ankle: 'leftAnkle2',  side: -1, front: false },
      { hip: 'rightLeg2', knee: 'rightKnee2', ankle: 'rightAnkle2', side: 1,  front: false },
    ];

    for (let i = 0; i < 4; i++) {
      const leg = legs[i];
      let hipRx = 0, hipRy = 0, hipRz = 0;
      let kneeRx = 0;
      let ankleRx = 0;

      switch (danceStep) {
        case 0: // 波浪 — 轻轻踏步
          const stepT = (beat * 2 + i * 0.5) % 2;
          if (stepT < 1) {
            // 抬腿
            hipRx = Math.sin(stepT * Math.PI) * 0.4 * leg.side * energy;
            kneeRx = -Math.sin(stepT * Math.PI) * 0.3 * energy;
          } else {
            // 落地
            hipRx = 0;
            kneeRx = 0;
          }
          break;

        case 1: // 弹簧弹跳 — 屈膝准备+弹起
          if (beatPhase < 0.3) {
            // 下蹲屈膝
            hipRx = 0.2 * (leg.front ? 1 : -1);
            kneeRx = 0.5;
          } else if (beatPhase < 0.6) {
            // 弹起
            hipRx = -0.3 * (leg.front ? 1 : -1);
            kneeRx = -0.2;
          } else {
            // 落地
            hipRx = 0.1;
            kneeRx = 0.1;
          }
          break;

        case 2: // 甩头 — 腿钉住但微微弯曲
          hipRx = Math.sin(beatPhase * Math.PI) * 0.1 * leg.side * energy;
          kneeRx = 0.1 + Math.sin(beatPhase * Math.PI) * 0.1 * energy;
          break;

        case 3: // 旋转 — 小步移动像跳舞
          const spinT = (beat + i * 0.25) % 1;
          hipRx = Math.sin(spinT * Math.PI * 2) * 0.3 * leg.side * energy;
          hipRy = Math.cos(spinT * Math.PI * 2) * 0.15 * (leg.front ? 1 : -1) * energy;
          kneeRx = Math.abs(Math.sin(spinT * Math.PI * 2)) * 0.25 * energy;
          break;

        case 4: // 扭屁股 — 腿用力蹬地！
          const buttT = beat * 4 + i;
          // 前后交替用力
          hipRx = Math.sin(buttT) * 0.35 * leg.side * energy;
          hipRz = Math.cos(buttT * 0.5) * 0.15 * energy;
          kneeRx = 0.15 + Math.abs(Math.sin(buttT)) * 0.2 * energy;
          // 脚掌贴地
          ankleRx = -hipRx * 0.3;
          break;

        case 5: // 左右摇摆 — 像螃蟹横着走
          const swayT = (beat * 0.5 + i * 0.25) % 1;
          hipRz = Math.sin(swayT * Math.PI * 2) * 0.25 * leg.side * energy;
          hipRx = Math.sin(swayT * Math.PI * 2) * 0.15 * (leg.front ? 1 : -1) * energy;
          kneeRx = Math.abs(Math.sin(swayT * Math.PI)) * 0.2 * energy;
          break;

        case 6: // 前后蠕动 — 弓步
          const lungeT = (beat * 0.5 + (leg.front ? 0 : 0.5)) % 1;
          hipRx = Math.sin(lungeT * Math.PI) * 0.5 * (leg.front ? -1 : 1) * energy;
          kneeRx = Math.abs(Math.sin(lungeT * Math.PI)) * 0.4 * energy;
          ankleRx = -hipRx * 0.5;
          break;

        case 7: // 全身抖动 — 快速踏步
          const shakeT = beat * 8 + i;
          hipRx = Math.sin(shakeT) * 0.15 * leg.side * energy;
          kneeRx = 0.1 + Math.abs(Math.sin(shakeT * 2)) * 0.15 * energy;
          ankleRx = Math.sin(shakeT * 2) * 0.1 * energy;
          break;
      }

      pose[leg.hip] = { rx: hipRx, ry: hipRy, rz: hipRz };
      pose[leg.knee] = { rx: kneeRx };
      pose[leg.ankle] = { rx: ankleRx };
    }
  }

  // ===== 手动画：摇摆挥舞！ =====
  _animateArms(pose, beat, beatPhase, danceStep, energy, bounce) {
    const arms = [
      { shoulder: 'rightShoulder', elbow: 'rightElbow', wrist: 'rightWrist', side: 1 },
      { shoulder: 'leftShoulder', elbow: 'leftElbow', wrist: 'leftWrist', side: -1 },
    ];

    for (let i = 0; i < 2; i++) {
      const arm = arms[i];
      let shoulderRx = 0, shoulderRy = 0, shoulderRz = 0;
      let elbowRx = 0, elbowRy = 0;
      let wristRx = 0, wristRy = 0;

      switch (danceStep) {
        case 0: // 波浪 — 轻轻摆动
          shoulderRx = Math.sin(beat * Math.PI * 2 + i * Math.PI) * 0.3 * energy;
          shoulderRz = arm.side * 0.2 + Math.sin(beat * Math.PI * 2 + i * Math.PI) * 0.15 * energy;
          elbowRx = -Math.abs(Math.sin(beat * Math.PI * 2 + i * Math.PI)) * 0.2 * energy;
          break;

        case 1: // 弹簧弹跳 — 向上挥舞
          shoulderRx = -bounce * 0.8;
          shoulderRz = arm.side * 0.3;
          elbowRx = -bounce * 0.5;
          wristRy = Math.sin(beat * Math.PI * 4) * 0.3 * energy;
          break;

        case 2: // 甩头 — 配合甩动
          shoulderRx = Math.sin(beatPhase * Math.PI + i * 0.5) * 0.6 * (i === 0 ? 1 : -1) * energy;
          shoulderRy = Math.sin(beatPhase * Math.PI) * 0.3 * energy;
          elbowRx = -Math.abs(Math.sin(beatPhase * Math.PI)) * 0.4 * energy;
          wristRx = Math.sin(beatPhase * Math.PI * 2) * 0.3 * energy;
          break;

        case 3: // 旋转 — 像风车
          const spinAngle = beat * Math.PI * 2 + i * Math.PI;
          shoulderRx = Math.sin(spinAngle) * 0.7 * energy;
          shoulderRy = Math.cos(spinAngle) * 0.4 * energy;
          shoulderRz = arm.side * 0.3;
          elbowRx = -0.3 - Math.abs(Math.sin(spinAngle)) * 0.3 * energy;
          break;

        case 4: // 扭屁股 — 上下疯狂挥舞！
          const waveT = beat * 4 + i * Math.PI;
          shoulderRx = Math.sin(waveT) * 1.0 * energy;
          shoulderRz = arm.side * (0.3 + Math.sin(waveT * 0.5) * 0.2 * energy);
          elbowRx = -0.4 - Math.abs(Math.sin(waveT)) * 0.4 * energy;
          wristRy = Math.sin(waveT * 2) * 0.5 * energy;
          // 手掌翻转
          wristRx = Math.sin(waveT * 1.5) * 0.3 * energy;
          break;

        case 5: // 左右摇摆 — 像啦啦队
          const cheerT = beat * Math.PI * 2 + i * 0.3;
          shoulderRx = Math.sin(cheerT) * 0.4 * energy;
          shoulderRz = arm.side * (0.4 + Math.sin(cheerT + Math.PI * (i % 2)) * 0.3 * energy);
          elbowRx = -0.5 - Math.abs(Math.sin(cheerT)) * 0.2 * energy;
          wristRy = Math.sin(cheerT * 2) * 0.4 * energy;
          break;

        case 6: // 前后蠕动 — 前后摆动
          shoulderRx = Math.sin(beat * Math.PI * 2 + i * 0.5) * 0.5 * energy;
          shoulderRy = Math.cos(beat * Math.PI * 2 + i * 0.3) * 0.3 * energy;
          elbowRx = -0.3 - Math.abs(Math.sin(beat * Math.PI * 2 + i * 0.5)) * 0.2 * energy;
          wristRx = Math.sin(beat * Math.PI * 2 + i) * 0.2 * energy;
          break;

        case 7: // 全身抖动 — 疯狂挥舞！
          const crazyT = beat * 10 + i * 2;
          shoulderRx = Math.sin(crazyT) * 1.2 * energy;
          shoulderRz = arm.side * (0.2 + Math.sin(crazyT * 0.7) * 0.3 * energy);
          shoulderRy = Math.cos(crazyT * 0.8) * 0.5 * energy;
          elbowRx = -0.4 - Math.abs(Math.sin(crazyT)) * 0.5 * energy;
          wristRx = Math.sin(crazyT * 1.5) * 0.6 * energy;
          wristRy = Math.cos(crazyT * 1.3) * 0.4 * energy;
          break;
      }

      pose[arm.shoulder] = { rx: shoulderRx, ry: shoulderRy, rz: shoulderRz };
      pose[arm.elbow] = { rx: elbowRx, ry: elbowRy };
      pose[arm.wrist] = { rx: wristRx, ry: wristRy };
    }
  }

  // ===== 身体扭动 =====
  _animateBody(pose, beat, beatPhase, danceStep, energy, bounce) {
    switch (danceStep) {
      case 0:
        this._waveWiggle(pose, beat, energy);
        break;
      case 1:
        this._springBounce(pose, beatPhase, energy, bounce);
        break;
      case 2:
        this._headWhip(pose, beat, beatPhase, energy);
        break;
      case 3:
        this._spiralSpin(pose, beat, beatPhase, energy);
        break;
      case 4:
        this._buttShake(pose, beat, beatPhase, energy);
        break;
      case 5:
        this._sideSway(pose, beat, beatPhase, energy);
        break;
      case 6:
        this._forwardBack(pose, beat, beatPhase, energy);
        break;
      case 7:
        this._fullBodyShake(pose, beat, beatPhase, energy);
        break;
    }
  }

  _waveWiggle(pose, beat, energy) {
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      const phase = beat * 2.5 - t * 2.0;
      const amp = 0.3 * (1 - t * 0.15);
      pose[`segment${i}`] = {
        rx: Math.sin(phase) * amp,
        ry: Math.cos(phase * 0.7) * amp * 0.4,
        rz: Math.sin(phase * 1.3) * amp * 0.25,
      };
    }
  }

  _springBounce(pose, beatPhase, energy, bounce) {
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      pose[`segment${i}`] = {
        rx: Math.sin(beatPhase * Math.PI * 2 + i * 0.6) * 0.15 * energy,
        ry: 0,
        rz: Math.sin(beatPhase * Math.PI * 4 + i * 0.9) * 0.12 * energy,
      };
    }
  }

  _headWhip(pose, beat, beatPhase, energy) {
    const headWhip = Math.sin(beatPhase * Math.PI) * 0.7 * energy;
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      const followDelay = (1 - t) * 0.3;
      const localPhase = Math.max(0, Math.min(1, beatPhase - followDelay));
      const localEnergy = Math.sin(localPhase * Math.PI);
      if (i === this.segmentCount - 1) {
        pose[`segment${i}`] = {
          rx: headWhip * 0.35,
          ry: Math.sin(beat * 0.5) * 0.6 * energy,
          rz: headWhip,
        };
      } else {
        const followFactor = Math.pow(t, 1.2);
        pose[`segment${i}`] = {
          rx: Math.sin(localPhase * Math.PI * 2) * 0.2 * localEnergy * followFactor,
          ry: Math.sin(beat * 0.5 - followDelay * 3) * 0.4 * localEnergy * followFactor,
          rz: headWhip * followFactor * 0.6 * localEnergy,
        };
      }
    }
  }

  _spiralSpin(pose, beat, beatPhase, energy) {
    const spinPhase = beatPhase * Math.PI * 2;
    const spinAmount = energy * 0.7;
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      const spiralPhase = spinPhase + t * 2.5;
      pose[`segment${i}`] = {
        rx: Math.sin(spiralPhase) * spinAmount * (1 - t * 0.2),
        ry: Math.cos(spiralPhase * 0.8) * spinAmount * 0.6,
        rz: Math.sin(spiralPhase * 1.2) * spinAmount * 0.5 * (1 + t * 0.4),
      };
    }
  }

  _buttShake(pose, beat, beatPhase, energy) {
    const buttShakeX = Math.sin(beat * Math.PI * 4) * 0.9 * energy;
    const buttShakeZ = Math.cos(beat * Math.PI * 4) * 0.7 * energy;
    const buttShakeY = Math.abs(Math.sin(beat * Math.PI * 4)) * 0.1 * energy;
    const buttWiggle = Math.sin(beat * Math.PI * 6) * 0.5 * energy;
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      const buttFactor = Math.pow(1 - t, 1.2);
      const bodyFactor = Math.pow(t, 0.7);
      const sx = buttShakeX * buttFactor + Math.sin(beat * Math.PI * 3 + i * 0.5) * 0.15 * bodyFactor;
      const sz = buttShakeZ * buttFactor * 0.9 + buttWiggle * buttFactor;
      const sy = buttShakeY * buttFactor;
      const counterTwist = Math.sin(beat * Math.PI * 3 + i * 0.9) * 0.25 * bodyFactor;
      pose[`segment${i}`] = {
        rx: sx + counterTwist,
        ry: Math.sin(beat * Math.PI * 4 + i * 0.6) * 0.3 * energy * buttFactor,
        rz: sz + counterTwist * 0.7,
      };
      if (!pose[`segment${i}`].y) pose[`segment${i}`].y = 0;
      pose[`segment${i}`].y += sy;
    }
    pose.mesh.x = Math.sin(beat * Math.PI * 2) * 0.06 * energy;
    pose.mesh.rz = Math.sin(beat * Math.PI * 4) * 0.08 * energy;
  }

  _sideSway(pose, beat, beatPhase, energy) {
    const swayAmp = 0.5 * energy;
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      const phase = beat * Math.PI * 2 + i * 0.3;
      const amp = swayAmp * (0.5 + 0.5 * t);
      pose[`segment${i}`] = {
        rx: Math.sin(phase) * amp,
        ry: Math.cos(phase * 0.5) * amp * 0.35,
        rz: Math.sin(phase * 1.5) * amp * 0.45,
      };
    }
    pose.mesh.x = Math.sin(beat * Math.PI) * 0.08 * energy;
    pose.mesh.rz = Math.sin(beat * Math.PI) * 0.12 * energy;
  }

  _forwardBack(pose, beat, beatPhase, energy) {
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      const phase = beat * Math.PI * 2 + t * 1.5;
      const amp = 0.3 * energy;
      pose[`segment${i}`] = {
        rx: Math.sin(phase) * amp * (1 + t * 0.3),
        ry: Math.cos(phase * 0.6) * amp * 0.25,
        rz: Math.sin(phase * 1.2 + t) * amp * 0.35,
      };
      if (!pose[`segment${i}`].z) pose[`segment${i}`].z = 0;
      pose[`segment${i}`].z += Math.sin(phase) * 0.025 * energy;
    }
    pose.mesh.z = Math.sin(beat * Math.PI) * 0.04 * energy;
  }

  _fullBodyShake(pose, beat, beatPhase, energy) {
    const shakeFreq = 8;
    const shakeAmp = 0.18 * energy;
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / (this.segmentCount - 1);
      const phase = beat * Math.PI * shakeFreq + i * 0.7;
      pose[`segment${i}`] = {
        rx: Math.sin(phase) * shakeAmp * (1 - t * 0.15),
        ry: Math.cos(phase * 1.3) * shakeAmp * 0.7,
        rz: Math.sin(phase * 0.9 + t) * shakeAmp * 0.6,
      };
      if (!pose[`segment${i}`].y) pose[`segment${i}`].y = 0;
      pose[`segment${i}`].y += Math.abs(Math.sin(phase * 2)) * 0.018 * energy;
    }
    pose.mesh.y = Math.abs(Math.sin(beat * Math.PI * shakeFreq * 0.5)) * 0.05 * energy;
    pose.mesh.rx = Math.sin(beat * Math.PI * shakeFreq) * 0.06 * energy;
  }

  // ===== 搞笑表情 =====
  _animateFace(pose, beat, beatPhase, danceStep, energy) {
    switch (danceStep) {
      case 0: // 波浪 — 开心微笑
        pose.mouth = { sx: 0, sy: 0.2, sz: 0, rx: 0, ry: 0, rz: 0 };
        pose.eyebrows = {
          left: { py: 0.02, pz: 0, rz: -0.1 },
          right: { py: 0.02, pz: 0, rz: 0.1 },
        };
        pose.pupils = {
          left: { sx: 0, sy: 0, sz: 0, px: 0, py: 0 },
          right: { sx: 0, sy: 0, sz: 0, px: 0, py: 0 },
        };
        break;

      case 1: // 弹跳 — 惊讶张嘴
        pose.mouth = { sx: 0.1, sy: 0.5, sz: 0.1, rx: 0, ry: 0, rz: 0 };
        pose.eyebrows = {
          left: { py: 0.04, pz: 0, rz: -0.2 },
          right: { py: 0.04, pz: 0, rz: 0.2 },
        };
        pose.pupils = {
          left: { sx: -0.1, sy: -0.1, sz: 0, px: 0, py: 0.01 },
          right: { sx: -0.1, sy: -0.1, sz: 0, px: 0, py: 0.01 },
        };
        break;

      case 2: // 甩头 — 专注眯眼
        pose.mouth = { sx: 0, sy: -0.1, sz: 0, rx: 0, ry: 0, rz: 0 };
        pose.eyebrows = {
          left: { py: -0.01, pz: 0, rz: 0.1 },
          right: { py: -0.01, pz: 0, rz: -0.1 },
        };
        pose.pupils = {
          left: { sx: 0, sy: 0, sz: 0, px: 0.01, py: 0 },
          right: { sx: 0, sy: 0, sz: 0, px: -0.01, py: 0 },
        };
        break;

      case 3: // 旋转 — 晕眩眼
        pose.mouth = { sx: 0, sy: 0.1, sz: 0, rx: 0, ry: 0, rz: Math.sin(beat * 10) * 0.1 };
        pose.eyebrows = {
          left: { py: 0.01, pz: 0, rz: Math.sin(beat * 5) * 0.15 },
          right: { py: 0.01, pz: 0, rz: Math.cos(beat * 5) * 0.15 },
        };
        pose.pupils = {
          left: { sx: 0, sy: 0, sz: 0, px: Math.sin(beat * 8) * 0.015, py: Math.cos(beat * 8) * 0.01 },
          right: { sx: 0, sy: 0, sz: 0, px: Math.cos(beat * 8) * 0.015, py: Math.sin(beat * 8) * 0.01 },
        };
        break;

      case 4: // 扭屁股 — 最搞笑！吐舌头+斗鸡眼
        pose.mouth = { sx: 0.15, sy: 0.3, sz: 0.1, rx: 0, ry: 0, rz: Math.sin(beat * 8) * 0.15 };
        pose.eyebrows = {
          left: { py: 0.05, pz: 0, rz: -0.3 },
          right: { py: 0.05, pz: 0, rz: 0.3 },
        };
        // 斗鸡眼效果
        pose.pupils = {
          left: { sx: 0.1, sy: 0.1, sz: 0, px: 0.02, py: 0.01 },
          right: { sx: 0.1, sy: 0.1, sz: 0, px: -0.02, py: 0.01 },
        };
        break;

      case 5: // 摇摆 — 酷酷的表情
        pose.mouth = { sx: -0.05, sy: 0, sz: 0, rx: 0, ry: 0, rz: Math.sin(beat * 2) * 0.05 };
        pose.eyebrows = {
          left: { py: 0, pz: 0, rz: -0.05 },
          right: { py: 0, pz: 0, rz: 0.05 },
        };
        pose.pupils = {
          left: { sx: 0, sy: 0, sz: 0, px: 0, py: 0 },
          right: { sx: 0, sy: 0, sz: 0, px: 0, py: 0 },
        };
        break;

      case 6: // 蠕动 — 滑稽脸
        pose.mouth = { sx: 0, sy: 0.15, sz: 0, rx: 0, ry: 0, rz: Math.sin(beat * 3) * 0.1 };
        pose.eyebrows = {
          left: { py: Math.sin(beat * 4) * 0.02, pz: 0, rz: Math.sin(beat * 3) * 0.1 },
          right: { py: Math.cos(beat * 4) * 0.02, pz: 0, rz: Math.cos(beat * 3) * 0.1 },
        };
        pose.pupils = {
          left: { sx: 0, sy: 0, sz: 0, px: 0, py: 0 },
          right: { sx: 0, sy: 0, sz: 0, px: 0, py: 0 },
        };
        break;

      case 7: // 抖动 — 疯狂表情！
        const crazyFace = Math.sin(beat * 12);
        pose.mouth = { sx: 0.1, sy: 0.4, sz: 0.1, rx: 0, ry: 0, rz: crazyFace * 0.2 };
        pose.eyebrows = {
          left: { py: crazyFace * 0.03, pz: 0, rz: -0.2 + crazyFace * 0.2 },
          right: { py: -crazyFace * 0.03, pz: 0, rz: 0.2 + crazyFace * 0.2 },
        };
        pose.pupils = {
          left: { sx: crazyFace * 0.1, sy: crazyFace * 0.1, sz: 0, px: crazyFace * 0.01, py: 0 },
          right: { sx: -crazyFace * 0.1, sy: -crazyFace * 0.1, sz: 0, px: -crazyFace * 0.01, py: 0 },
        };
        break;
    }
  }
}
