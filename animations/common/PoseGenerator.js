import { PoseMatrix } from 'dula-engine';

/**
 * PoseGenerator — 参数化格斗动画生成器
 *
 * 通过高-level参数自动生成 PoseMatrix，无需手动调每个关节。
 * 基于生物力学原理和格斗运动学，生成合理的关节旋转。
 */

// ============ 工具函数 ============

function easeInQuad(t) { return t * t; }
function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t) { return t * t * t; }
function easeOutBack(t) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

/**
 * 线性插值
 */
function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * 三阶贝塞尔插值
 */
function bezier3(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/**
 * 将角度限制在合理范围内
 */
function clampAngle(angle, min, max) { return Math.max(min, Math.min(max, angle)); }

// ============ 核心生成器 ============

/**
 * 生成直拳动画 (Jab / Cross)
 * @param {Object} opts
 * @param {string} opts.hand - 'left' | 'right'
 * @param {number} opts.power - 0~1 力度
 * @param {number} opts.duration - 动画时长(秒)
 * @param {string} opts.height - 'head' | 'chest' | 'stomach' | 'low'
 * @param {string} opts.guard - 'protect' | 'natural'，非出拳手是否护脸
 * @param {string} opts.style - 'windup' | 'compact' | 'direct'
 */
export function generatePunch(opts = {}) {
  const hand = opts.hand || 'left';
  const power = opts.power ?? 0.7;
  const duration = opts.duration || 1.5;
  const height = opts.height || 'head';
  const guard = opts.guard || 'protect';
  const style = opts.style || opts.windup || 'windup';
  const directPunch = style === 'direct' || style === 'straight' || opts.direct === true;
  const compactPunch = style === 'compact' || style === 'short' || style === 'snap' || opts.compact === true;
  const keepGuardNatural = guard === 'natural' || guard === 'down' || opts.keepInactiveDown === true;
  const isLeft = hand === 'left';
  const sign = isLeft ? 1 : -1;

  // manualRot baseline: shoulderGroup.rotation.set(0, 0, 0)
  // 上臂沿局部-Y方向，即垂直向下（自然下垂）
  // PoseMatrix.rx/rz 是在此基础上的偏移旋转（Euler顺序XYZ）
  // rx=0: 上臂垂直向下
  // rx=-π/2: 上臂水平向前（-Z）
  // rx=+π/2: 上臂水平向后（+Z）
  // rz=0: 不左右偏
  // rz=π/2: 上臂向右（+X）
  // rz=-π/2: 上臂向左（-X）

  return (t) => {
    const pose = new PoseMatrix();
    const p = t;

    let shoulderRx, shoulderRy, shoulderRz, elbowRx, elbowRz, bodyRy, bodyX;
    let guardShoulderRx, guardShoulderRz, guardElbowRx;

    // 时间分配（1.5秒）：
    // 0.00-0.30 (0-20%): 蓄力 → L形
    // 0.30-0.60 (20-40%): 保持蓄力
    // 0.60-0.75 (40-50%): 冲击
    // 0.75-1.05 (50-70%): 保持冲击
    // 1.05-1.50 (70-100%): 回收

    // 蓄力L形：上臂向左侧（-X）抬起，前臂向前（-Z）
    const CHARGE_SHOULDER_RX = -Math.PI / 2;  // 上臂水平
    const CHARGE_SHOULDER_RZ = -Math.PI / 2;  // 上臂向左（-X）
    const CHARGE_ELBOW_RX = -Math.PI / 2;     // 前臂相对于上臂弯曲90度，从向左转到向前

    const IMPACT_SHOULDER_RX = -Math.PI / 2;  // 上臂水平向前
    const IMPACT_SHOULDER_RZ = 0;             // 上臂不左右偏
    const IMPACT_ELBOW_RX = 0;                // 肘伸直，前臂沿上臂方向（向前）

    if (directPunch || compactPunch) {
      // 连击用紧凑出拳：可选短蓄力，不做完整 L 型侧向抬肘。
      const CHAMBER_SHOULDER_RX = compactPunch ? -0.45 : 0;
      const CHAMBER_SHOULDER_RZ = compactPunch ? (isLeft ? -0.16 : 0.16) : 0;
      const CHAMBER_ELBOW_RX = compactPunch ? -0.75 : 0;

      shoulderRy = 0;
      elbowRz = 0;
      guardShoulderRz = 0;
      guardShoulderRx = 0;
      guardElbowRx = 0;

      if (p < 0.18) {
        const e = easeOutCubic(p / 0.18);
        shoulderRx = lerp(0, CHAMBER_SHOULDER_RX, e);
        shoulderRz = lerp(0, CHAMBER_SHOULDER_RZ, e);
        elbowRx = lerp(0, CHAMBER_ELBOW_RX, e);
        bodyRy = isLeft ? lerp(0, -0.05 * power, e) : lerp(0, 0.05 * power, e);
        bodyX = isLeft ? lerp(0, -0.03 * power, e) : lerp(0, 0.03 * power, e);
      } else if (p < 0.42) {
        const e = easeOutBack((p - 0.18) / 0.24);
        shoulderRx = lerp(CHAMBER_SHOULDER_RX, IMPACT_SHOULDER_RX, e);
        shoulderRz = lerp(CHAMBER_SHOULDER_RZ, 0, e);
        elbowRx = lerp(CHAMBER_ELBOW_RX, 0, e);
        bodyRy = isLeft ? lerp(-0.05 * power, 0.16 * power, e) : lerp(0.05 * power, -0.16 * power, e);
        bodyX = isLeft ? lerp(-0.03 * power, 0.16 * power, e) : lerp(0.03 * power, -0.16 * power, e);
      } else if (p < 0.58) {
        shoulderRx = IMPACT_SHOULDER_RX;
        shoulderRz = 0;
        elbowRx = 0;
        bodyRy = isLeft ? 0.16 * power : -0.16 * power;
        bodyX = isLeft ? 0.16 * power : -0.16 * power;
      } else {
        const e = easeInOutQuad((p - 0.58) / 0.42);
        shoulderRx = lerp(IMPACT_SHOULDER_RX, 0, e);
        shoulderRz = 0;
        elbowRx = 0;
        bodyRy = lerp(isLeft ? 0.16 * power : -0.16 * power, 0, e);
        bodyX = lerp(isLeft ? 0.16 * power : -0.16 * power, 0, e);
      }
    } else if (p < 0.20) {
      // Phase 1: 蓄力 (0-20%)
      const e = easeOutCubic(p / 0.20);
      shoulderRx = lerp(0, CHARGE_SHOULDER_RX, e);
      shoulderRz = isLeft ? lerp(0, CHARGE_SHOULDER_RZ, e) : lerp(0, -CHARGE_SHOULDER_RZ, e);
      shoulderRy = 0;
      elbowRx = lerp(0, CHARGE_ELBOW_RX, e);
      elbowRz = 0;
      bodyRy = isLeft ? lerp(0, -0.15, e) : lerp(0, 0.15, e);
      bodyX = isLeft ? lerp(0, -0.08, e) : lerp(0, 0.08, e);
      guardShoulderRz = isLeft ? lerp(0, -0.5, e) : lerp(0, 0.5, e);
      guardShoulderRx = lerp(0, -1.3, e);
      guardElbowRx = lerp(-0.5, -1.5, e);
    } else if (p < 0.40) {
      // Phase 2: 保持蓄力 (20-40%)
      shoulderRx = CHARGE_SHOULDER_RX;
      shoulderRz = isLeft ? CHARGE_SHOULDER_RZ : -CHARGE_SHOULDER_RZ;
      shoulderRy = 0;
      elbowRx = CHARGE_ELBOW_RX;
      elbowRz = 0;
      bodyRy = isLeft ? -0.15 : 0.15;
      bodyX = isLeft ? -0.08 : 0.08;
      guardShoulderRz = isLeft ? -0.5 : 0.5;
      guardShoulderRx = -1.3;
      guardElbowRx = -1.5;
    } else if (p < 0.50) {
      // Phase 3: 冲击 (40-50%)
      const e = easeOutBack((p - 0.40) / 0.10);
      shoulderRx = lerp(CHARGE_SHOULDER_RX, IMPACT_SHOULDER_RX, e);
      shoulderRz = isLeft ? lerp(CHARGE_SHOULDER_RZ, IMPACT_SHOULDER_RZ, e) : lerp(-CHARGE_SHOULDER_RZ, IMPACT_SHOULDER_RZ, e);
      shoulderRy = 0;
      elbowRx = lerp(CHARGE_ELBOW_RX, IMPACT_ELBOW_RX, e);
      elbowRz = 0;
      bodyRy = isLeft ? lerp(-0.15, 0.25 * power, e) : lerp(0.15, -0.25 * power, e);
      bodyX = isLeft ? lerp(-0.08, 0.25 * power, e) : lerp(0.08, -0.25 * power, e);
      guardShoulderRz = isLeft ? -0.6 : 0.6;
      guardShoulderRx = -1.4;
      guardElbowRx = -1.8;
    } else if (p < 0.70) {
      // Phase 4: 保持冲击 (50-70%)
      shoulderRx = IMPACT_SHOULDER_RX;
      shoulderRz = IMPACT_SHOULDER_RZ;
      shoulderRy = 0;
      elbowRx = IMPACT_ELBOW_RX;
      elbowRz = 0;
      bodyRy = isLeft ? 0.25 * power : -0.25 * power;
      bodyX = isLeft ? 0.25 * power : -0.25 * power;
      guardShoulderRz = isLeft ? -0.6 : 0.6;
      guardShoulderRx = -1.4;
      guardElbowRx = -1.8;
    } else {
      // Phase 5: 回收 (70-100%)
      const e = easeInOutQuad((p - 0.70) / 0.30);
      shoulderRx = lerp(IMPACT_SHOULDER_RX, 0, e);
      shoulderRz = isLeft ? lerp(IMPACT_SHOULDER_RZ, 0, e) : lerp(IMPACT_SHOULDER_RZ, 0, e);
      shoulderRy = 0;
      elbowRx = lerp(IMPACT_ELBOW_RX, 0, e);
      elbowRz = 0;
      bodyRy = lerp(isLeft ? 0.25 * power : -0.25 * power, 0, e);
      bodyX = lerp(isLeft ? 0.25 * power : -0.25 * power, 0, e);
      guardShoulderRz = isLeft ? lerp(-0.6, -0.3, e) : lerp(0.6, 0.3, e);
      guardShoulderRx = lerp(-1.4, 0, e);
      guardElbowRx = lerp(-1.8, -0.6, e);
    }

    // 设置主动手
    if (isLeft) {
      pose.leftShoulder = { rx: shoulderRx, ry: shoulderRy, rz: shoulderRz };
      pose.leftElbow = { rx: elbowRx, rz: elbowRz };
      pose.rightShoulder = keepGuardNatural
        ? { rx: 0, ry: 0, rz: 0 }
        : { rz: guardShoulderRz, rx: guardShoulderRx };
      pose.rightElbow = keepGuardNatural ? { rx: 0, rz: 0 } : { rx: guardElbowRx };
    } else {
      pose.rightShoulder = { rx: shoulderRx, ry: shoulderRy, rz: shoulderRz };
      pose.rightElbow = { rx: elbowRx, rz: elbowRz };
      pose.leftShoulder = keepGuardNatural
        ? { rx: 0, ry: 0, rz: 0 }
        : { rz: guardShoulderRz, rx: guardShoulderRx };
      pose.leftElbow = keepGuardNatural ? { rx: 0, rz: 0 } : { rx: guardElbowRx };
    }

    // 身体
    pose.mesh = { x: bodyX, ry: bodyRy };
    pose.headGroup = { ry: bodyRy * 0.3 };

    return pose;
  };
}

/**
 * 生成勾拳动画 (Hook)
 * @param {Object} opts
 * @param {string} opts.hand - 'left' | 'right'
 * @param {number} opts.power - 0~1 力度
 * @param {number} opts.swingAngle - 挥臂角度(度), 默认120
 * @param {number} opts.duration - 动画时长
 */
export function generateHook(opts = {}) {
  const hand = opts.hand || 'left';
  const power = opts.power ?? 0.8;
  const swingAngle = (opts.swingAngle ?? 120) * Math.PI / 180;
  const isLeft = hand === 'left';
  const sign = isLeft ? 1 : -1;

  return (t) => {
    const pose = new PoseMatrix();
    const p = t;

    let shoulderRz, shoulderRx, elbowRx, bodyRy, bodyX;
    let guardShoulderRz, guardElbowRx;

    if (p < 0.15) {
      // Wind up: 向后外侧拉
      const e = easeInQuad(p / 0.15);
      shoulderRz = sign * 0.7 * e;
      shoulderRx = -0.5 * e;
      elbowRx = -1.5 * e;
      bodyRy = -sign * 0.2 * e;
      bodyX = -sign * 0.08 * e;
      guardShoulderRz = -sign * 0.6 * e;
      guardElbowRx = -0.9 * e;
    } else if (p < 0.35) {
      // Hook swing: 水平横挥
      const e = easeOutCubic((p - 0.15) / 0.2);
      const startRz = sign * 0.7;
      const endRz = -sign * swingAngle * power;
      shoulderRz = lerp(startRz, endRz, e);
      shoulderRx = lerp(-0.5, -0.8, e);
      elbowRx = lerp(-1.5, -0.8 * power, e);
      bodyRy = lerp(-sign * 0.2, sign * 0.4 * power, e);
      bodyX = lerp(-sign * 0.08, sign * 0.35 * power, e);
      guardShoulderRz = lerp(-sign * 0.6, -sign * 0.5, e);
      guardElbowRx = lerp(-0.9, -1.2, e);
    } else if (p < 0.45) {
      // Hold
      shoulderRz = -sign * swingAngle * power;
      shoulderRx = -0.8;
      elbowRx = -0.8 * power;
      bodyRy = sign * 0.4 * power;
      bodyX = sign * 0.35 * power;
      guardShoulderRz = -sign * 0.5;
      guardElbowRx = -1.2;
    } else {
      // Recovery
      const e = easeInOutQuad((p - 0.45) / 0.55);
      const startRz = -sign * swingAngle * power;
      shoulderRz = lerp(startRz, sign * 0.2, e);
      shoulderRx = lerp(-0.8, -0.3, e);
      elbowRx = lerp(-0.8 * power, -0.6, e);
      bodyRy = lerp(sign * 0.4 * power, 0, e);
      bodyX = lerp(sign * 0.35 * power, 0, e);
      guardShoulderRz = lerp(-sign * 0.5, -sign * 0.4, e);
      guardElbowRx = lerp(-1.2, -0.9, e);
    }

    if (isLeft) {
      pose.leftShoulder = { rz: shoulderRz, rx: shoulderRx };
      pose.leftElbow = { rx: elbowRx };
      pose.leftWrist = { rz: sign * 0.2 };
      pose.rightShoulder = { rz: guardShoulderRz, rx: -0.4 };
      pose.rightElbow = { rx: guardElbowRx };
    } else {
      pose.rightShoulder = { rz: shoulderRz, rx: shoulderRx };
      pose.rightElbow = { rx: elbowRx };
      pose.rightWrist = { rz: -sign * 0.2 };
      pose.leftShoulder = { rz: guardShoulderRz, rx: -0.4 };
      pose.leftElbow = { rx: guardElbowRx };
    }

    pose.mesh = { x: bodyX, ry: bodyRy };
    pose.headGroup = { ry: bodyRy * 0.4 };

    return pose;
  };
}

/**
 * 生成上勾拳动画 (Uppercut)
 * @param {Object} opts
 * @param {string} opts.hand - 'left' | 'right'
 * @param {number} opts.power - 0~1 力度
 * @param {number} opts.duration - 动画时长
 */
export function generateUppercut(opts = {}) {
  const hand = opts.hand || 'left';
  const power = opts.power ?? 0.85;
  const isLeft = hand === 'left';
  const sign = isLeft ? 1 : -1;

  return (t) => {
    const pose = new PoseMatrix();
    const p = t;

    let shoulderRz, shoulderRx, elbowRx, bodyY, bodyRy;
    let guardShoulderRz, guardElbowRx;

    if (p < 0.2) {
      // 下蹲蓄力
      const e = easeInQuad(p / 0.2);
      shoulderRz = sign * 0.3 * e;
      shoulderRx = -0.3 * e;
      elbowRx = -1.3 * e;
      bodyY = -0.1 * e;
      bodyRy = -sign * 0.1 * e;
      guardShoulderRz = -sign * 0.5 * e;
      guardElbowRx = -0.8 * e;
    } else if (p < 0.4) {
      // 爆发上勾
      const e = easeOutBack((p - 0.2) / 0.2);
      shoulderRz = lerp(sign * 0.3, -sign * 0.5 * power, e);
      shoulderRx = lerp(-0.3, -1.8 * power, e);
      elbowRx = lerp(-1.3, 0.3 * power, e);
      bodyY = lerp(-0.1, 0.15 * power, e);
      bodyRy = lerp(-sign * 0.1, sign * 0.2 * power, e);
      guardShoulderRz = lerp(-sign * 0.5, -sign * 0.6, e);
      guardElbowRx = lerp(-0.8, -1.0, e);
    } else if (p < 0.5) {
      // 顶点 hold
      shoulderRz = -sign * 0.5 * power;
      shoulderRx = -1.8 * power;
      elbowRx = 0.3 * power;
      bodyY = 0.15 * power;
      bodyRy = sign * 0.2 * power;
      guardShoulderRz = -sign * 0.6;
      guardElbowRx = -1.0;
    } else {
      // 回落
      const e = easeInOutQuad((p - 0.5) / 0.5);
      shoulderRz = lerp(-sign * 0.5 * power, sign * 0.1, e);
      shoulderRx = lerp(-1.8 * power, -0.3, e);
      elbowRx = lerp(0.3 * power, -0.5, e);
      bodyY = lerp(0.15 * power, 0, e);
      bodyRy = lerp(sign * 0.2 * power, 0, e);
      guardShoulderRz = lerp(-sign * 0.6, -sign * 0.4, e);
      guardElbowRx = lerp(-1.0, -0.8, e);
    }

    if (isLeft) {
      pose.leftShoulder = { rz: shoulderRz, rx: shoulderRx };
      pose.leftElbow = { rx: elbowRx };
      pose.rightShoulder = { rz: guardShoulderRz, rx: -0.4 };
      pose.rightElbow = { rx: guardElbowRx };
    } else {
      pose.rightShoulder = { rz: shoulderRz, rx: shoulderRx };
      pose.rightElbow = { rx: elbowRx };
      pose.leftShoulder = { rz: guardShoulderRz, rx: -0.4 };
      pose.leftElbow = { rx: guardElbowRx };
    }

    pose.mesh = { y: bodyY, ry: bodyRy };
    pose.headGroup = { rx: -0.2 * power, ry: bodyRy * 0.3 };

    return pose;
  };
}

/**
 * 生成踢腿动画 (Kick)
 * @param {Object} opts
 * @param {string} opts.leg - 'left' | 'right'
 * @param {string} opts.style - 'front' | 'roundhouse' | 'side' | 'axe'
 * @param {number} opts.power - 0~1 力度
 * @param {string} opts.height - 'high' | 'mid' | 'low'
 */
export function generateKick(opts = {}) {
  const leg = opts.leg || 'right';
  const style = opts.style || 'front';
  const power = opts.power ?? 0.8;
  const height = opts.height || 'mid';
  const isLeft = leg === 'left';
  const sign = isLeft ? 1 : -1;

  // 高度映射
  const heightKneeRx = { high: -1.6, mid: -1.2, low: -0.8 };
  const targetKneeRx = heightKneeRx[height] ?? -1.2;

  return (t) => {
    const pose = new PoseMatrix();
    const p = t;

    let hipRz, kneeRx, ankleRx, bodyRy, bodyX, bodyY;
    let guardArmRz, guardElbowRx;
    let armSwingRz;

    if (p < 0.2) {
      // 蓄力: 支撑腿屈膝, 踢腿后摆
      const e = easeInQuad(p / 0.2);
      hipRz = sign * 0.2 * e;
      kneeRx = -0.4 * e;
      ankleRx = 0.1 * e;
      bodyRy = -sign * 0.3 * e;
      bodyX = -sign * 0.05 * e;
      bodyY = -0.05 * e;
      guardArmRz = sign * 0.4 * e;
      guardElbowRx = -0.7 * e;
      armSwingRz = -sign * 0.5 * e;
    } else if (p < 0.4) {
      // 踢出
      const e = easeOutCubic((p - 0.2) / 0.2);

      if (style === 'front') {
        hipRz = lerp(sign * 0.2, sign * 0.1, e);
        kneeRx = lerp(-0.4, targetKneeRx * power, e);
        ankleRx = lerp(0.1, 0.3 * power, e);
        bodyRy = lerp(-sign * 0.3, sign * 0.1, e);
        bodyX = lerp(-sign * 0.05, sign * 0.2 * power, e);
      } else if (style === 'roundhouse') {
        hipRz = lerp(sign * 0.2, -sign * 0.8 * power, e);
        kneeRx = lerp(-0.4, targetKneeRx * power, e);
        ankleRx = lerp(0.1, -0.2 * power, e);
        bodyRy = lerp(-sign * 0.3, sign * 0.6 * power, e);
        bodyX = lerp(-sign * 0.05, sign * 0.1, e);
      } else if (style === 'side') {
        hipRz = lerp(sign * 0.2, sign * 0.9 * power, e);
        kneeRx = lerp(-0.4, targetKneeRx * 0.8 * power, e);
        ankleRx = lerp(0.1, 0.5 * power, e);
        bodyRy = lerp(-sign * 0.3, -sign * 0.3 * power, e);
        bodyX = lerp(-sign * 0.05, 0, e);
      } else { // axe
        hipRz = lerp(sign * 0.2, sign * 0.3, e);
        kneeRx = lerp(-0.4, -0.3 * power, e);
        ankleRx = lerp(0.1, 1.2 * power, e);
        bodyRy = lerp(-sign * 0.3, 0, e);
        bodyX = lerp(-sign * 0.05, sign * 0.1, e);
      }
      bodyY = lerp(-0.05, 0.05 * power, e);
      guardArmRz = lerp(sign * 0.4, sign * 0.6, e);
      guardElbowRx = lerp(-0.7, -1.0, e);
      armSwingRz = lerp(-sign * 0.5, sign * 0.8 * power, e);
    } else if (p < 0.5) {
      // Impact hold
      if (style === 'front') {
        hipRz = sign * 0.1;
        kneeRx = targetKneeRx * power;
        ankleRx = 0.3 * power;
        bodyRy = sign * 0.1;
        bodyX = sign * 0.2 * power;
      } else if (style === 'roundhouse') {
        hipRz = -sign * 0.8 * power;
        kneeRx = targetKneeRx * power;
        ankleRx = -0.2 * power;
        bodyRy = sign * 0.6 * power;
        bodyX = sign * 0.1;
      } else if (style === 'side') {
        hipRz = sign * 0.9 * power;
        kneeRx = targetKneeRx * 0.8 * power;
        ankleRx = 0.5 * power;
        bodyRy = -sign * 0.3 * power;
        bodyX = 0;
      } else {
        hipRz = sign * 0.3;
        kneeRx = -0.3 * power;
        ankleRx = 1.2 * power;
        bodyRy = 0;
        bodyX = sign * 0.1;
      }
      bodyY = 0.05 * power;
      guardArmRz = sign * 0.6;
      guardElbowRx = -1.0;
      armSwingRz = sign * 0.8 * power;
    } else {
      // Recovery
      const e = easeInOutQuad((p - 0.5) / 0.5);
      let startHipRz, startKneeRx, startAnkleRx, startBodyRy, startBodyX;

      if (style === 'front') {
        startHipRz = sign * 0.1;
        startKneeRx = targetKneeRx * power;
        startAnkleRx = 0.3 * power;
        startBodyRy = sign * 0.1;
        startBodyX = sign * 0.2 * power;
      } else if (style === 'roundhouse') {
        startHipRz = -sign * 0.8 * power;
        startKneeRx = targetKneeRx * power;
        startAnkleRx = -0.2 * power;
        startBodyRy = sign * 0.6 * power;
        startBodyX = sign * 0.1;
      } else if (style === 'side') {
        startHipRz = sign * 0.9 * power;
        startKneeRx = targetKneeRx * 0.8 * power;
        startAnkleRx = 0.5 * power;
        startBodyRy = -sign * 0.3 * power;
        startBodyX = 0;
      } else {
        startHipRz = sign * 0.3;
        startKneeRx = -0.3 * power;
        startAnkleRx = 1.2 * power;
        startBodyRy = 0;
        startBodyX = sign * 0.1;
      }

      hipRz = lerp(startHipRz, sign * 0.05, e);
      kneeRx = lerp(startKneeRx, -0.1, e);
      ankleRx = lerp(startAnkleRx, 0, e);
      bodyRy = lerp(startBodyRy, 0, e);
      bodyX = lerp(startBodyX, 0, e);
      bodyY = lerp(0.05 * power, 0, e);
      guardArmRz = lerp(sign * 0.6, sign * 0.3, e);
      guardElbowRx = lerp(-1.0, -0.7, e);
      armSwingRz = lerp(sign * 0.8 * power, 0, e);
    }

    // 设置踢腿
    if (isLeft) {
      pose.leftHip = { rz: hipRz };
      pose.leftKnee = { rx: kneeRx };
      pose.leftAnkle = { rx: ankleRx };
      // 支撑腿微屈
      pose.rightKnee = { rx: 0.15 };
    } else {
      pose.rightHip = { rz: hipRz };
      pose.rightKnee = { rx: kneeRx };
      pose.rightAnkle = { rx: ankleRx };
      pose.leftKnee = { rx: 0.15 };
    }

    // 手臂: 一手护脸, 一手平衡
    if (isLeft) {
      pose.rightShoulder = { rz: guardArmRz, rx: -0.3 };
      pose.rightElbow = { rx: guardElbowRx };
      pose.leftShoulder = { rz: armSwingRz };
      pose.leftElbow = { rx: -0.5 };
    } else {
      pose.leftShoulder = { rz: -guardArmRz, rx: -0.3 };
      pose.leftElbow = { rx: guardElbowRx };
      pose.rightShoulder = { rz: -armSwingRz };
      pose.rightElbow = { rx: -0.5 };
    }

    pose.mesh = { x: bodyX, y: bodyY, ry: bodyRy };
    pose.headGroup = { ry: bodyRy * 0.3 };

    return pose;
  };
}

/**
 * 生成格挡动画 (Block)
 * @param {Object} opts
 * @param {string} opts.height - 'high' | 'mid' | 'low'
 * @param {number} opts.duration - 动画时长
 */
export function generateBlock(opts = {}) {
  const height = opts.height || 'mid';
  const heightOffsets = { high: { armRx: -0.8, elbowRx: -1.4, bodyY: 0.05 }, mid: { armRx: -0.4, elbowRx: -1.2, bodyY: 0 }, low: { armRx: 0.1, elbowRx: -1.0, bodyY: -0.05 } };
  const h = heightOffsets[height] ?? heightOffsets.mid;

  return (t) => {
    const pose = new PoseMatrix();
    const p = t;

    let armRx, elbowRx, bodyY, guardRz;

    if (p < 0.15) {
      // 快速举臂
      const e = easeOutQuad(p / 0.15);
      armRx = lerp(0, h.armRx, e);
      elbowRx = lerp(-0.5, h.elbowRx, e);
      bodyY = lerp(0, h.bodyY, e);
      guardRz = lerp(0, 0.6, e);
    } else if (p < 0.7) {
      // Hold
      armRx = h.armRx;
      elbowRx = h.elbowRx;
      bodyY = h.bodyY;
      guardRz = 0.6;
    } else {
      // 放下
      const e = easeInOutQuad((p - 0.7) / 0.3);
      armRx = lerp(h.armRx, 0, e);
      elbowRx = lerp(h.elbowRx, -0.5, e);
      bodyY = lerp(h.bodyY, 0, e);
      guardRz = lerp(0.6, 0, e);
    }

    // 双臂格挡姿势
    pose.leftShoulder = { rx: armRx, rz: guardRz };
    pose.leftElbow = { rx: elbowRx };
    pose.rightShoulder = { rx: armRx, rz: -guardRz };
    pose.rightElbow = { rx: elbowRx };

    pose.mesh = { y: bodyY };

    return pose;
  };
}

/**
 * 生成闪避动画 (Dodge)
 * @param {Object} opts
 * @param {string} opts.direction - 'left' | 'right' | 'back' | 'duck'
 * @param {number} opts.power - 0~1 幅度
 */
export function generateDodge(opts = {}) {
  const direction = opts.direction || 'left';
  const power = opts.power ?? 0.7;

  return (t) => {
    const pose = new PoseMatrix();
    const p = t;

    let bodyX = 0, bodyY = 0, bodyRy = 0;
    let leanAngle = 0;

    if (p < 0.25) {
      const e = easeOutQuad(p / 0.25);
      if (direction === 'left') { bodyX = -0.4 * power * e; bodyRy = -0.5 * power * e; leanAngle = 0.3 * power * e; }
      else if (direction === 'right') { bodyX = 0.4 * power * e; bodyRy = 0.5 * power * e; leanAngle = -0.3 * power * e; }
      else if (direction === 'back') { bodyX = 0; bodyY = 0; bodyRy = 0; leanAngle = 0; }
      else { bodyY = -0.25 * power * e; leanAngle = 0.2 * power * e; }
    } else if (p < 0.5) {
      if (direction === 'left') { bodyX = -0.4 * power; bodyRy = -0.5 * power; leanAngle = 0.3 * power; }
      else if (direction === 'right') { bodyX = 0.4 * power; bodyRy = 0.5 * power; leanAngle = -0.3 * power; }
      else if (direction === 'back') { bodyX = 0; bodyY = 0; bodyRy = 0; leanAngle = 0; }
      else { bodyY = -0.25 * power; leanAngle = 0.2 * power; }
    } else {
      const e = easeInOutQuad((p - 0.5) / 0.5);
      if (direction === 'left') { bodyX = lerp(-0.4 * power, 0, e); bodyRy = lerp(-0.5 * power, 0, e); leanAngle = lerp(0.3 * power, 0, e); }
      else if (direction === 'right') { bodyX = lerp(0.4 * power, 0, e); bodyRy = lerp(0.5 * power, 0, e); leanAngle = lerp(-0.3 * power, 0, e); }
      else if (direction === 'back') { bodyX = 0; bodyY = 0; bodyRy = 0; leanAngle = 0; }
      else { bodyY = lerp(-0.25 * power, 0, e); leanAngle = lerp(0.2 * power, 0, e); }
    }

    pose.mesh = { x: bodyX, y: bodyY, ry: bodyRy, rz: leanAngle };

    // 手臂护脸
    pose.leftShoulder = { rz: 0.5, rx: -0.3 };
    pose.leftElbow = { rx: -1.0 };
    pose.rightShoulder = { rz: -0.5, rx: -0.3 };
    pose.rightElbow = { rx: -1.0 };

    pose.headGroup = { ry: bodyRy * 0.3 };

    return pose;
  };
}

/**
 * 生成前冲动画 (DashForward)
 * @param {Object} opts
 * @param {number} opts.power - 0~1 力度
 */
export function generateDash(opts = {}) {
  const power = opts.power ?? 0.8;

  return (t) => {
    const pose = new PoseMatrix();
    const p = t;

    let bodyZ = 0, bodyLean = 0;
    let leftArmRz = 0, rightArmRz = 0;
    let leftElbowRx = -0.5, rightElbowRx = -0.5;

    if (p < 0.2) {
      // 预备后坐
      const e = easeInQuad(p / 0.2);
      bodyZ = 0.1 * power * e;
      bodyLean = 0.2 * e;
      leftArmRz = 0.6 * e;
      rightArmRz = -0.6 * e;
    } else if (p < 0.4) {
      // 爆发前冲
      const e = easeOutCubic((p - 0.2) / 0.2);
      bodyZ = lerp(0.1 * power, -0.8 * power, e);
      bodyLean = lerp(0.2, -0.3 * power, e);
      leftArmRz = lerp(0.6, -0.8 * power, e);
      rightArmRz = lerp(-0.6, 0.8 * power, e);
      leftElbowRx = lerp(-0.5, -0.8, e);
      rightElbowRx = lerp(-0.5, -0.8, e);
    } else if (p < 0.6) {
      // 冲刺保持
      bodyZ = -0.8 * power;
      bodyLean = -0.3 * power;
      leftArmRz = -0.8 * power;
      rightArmRz = 0.8 * power;
      leftElbowRx = -0.8;
      rightElbowRx = -0.8;
    } else {
      // 减速恢复
      const e = easeInOutQuad((p - 0.6) / 0.4);
      bodyZ = lerp(-0.8 * power, 0, e);
      bodyLean = lerp(-0.3 * power, 0, e);
      leftArmRz = lerp(-0.8 * power, 0, e);
      rightArmRz = lerp(0.8 * power, 0, e);
      leftElbowRx = lerp(-0.8, -0.5, e);
      rightElbowRx = lerp(-0.8, -0.5, e);
    }

    pose.mesh = { z: bodyZ, rx: bodyLean };

    pose.leftShoulder = { rz: leftArmRz, rx: -0.3 };
    pose.leftElbow = { rx: leftElbowRx };
    pose.rightShoulder = { rz: rightArmRz, rx: -0.3 };
    pose.rightElbow = { rx: rightElbowRx };

    // 腿部交替
    const legPhase = p * Math.PI * 4;
    pose.leftHip = { rz: Math.sin(legPhase) * 0.2 * power };
    pose.leftKnee = { rx: Math.max(0, Math.sin(legPhase)) * 0.4 * power };
    pose.rightHip = { rz: Math.sin(legPhase + Math.PI) * 0.2 * power };
    pose.rightKnee = { rx: Math.max(0, Math.sin(legPhase + Math.PI)) * 0.4 * power };

    return pose;
  };
}

/**
 * 生成格斗站姿 (FightingStance)
 * @param {Object} opts
 * @param {string} opts.lead - 'left' | 'right' 前手
 * @param {number} opts.t - 时间(用于呼吸微动)
 */
export function generateStance(opts = {}) {
  const lead = opts.lead || 'left';
  const isLeftLead = lead === 'left';

  return (t) => {
    const pose = new PoseMatrix();

    // 呼吸微动
    const breath = Math.sin(t * 3) * 0.02;
    const sway = Math.sin(t * 1.5) * 0.03;

    // 身体侧向
    pose.mesh = { ry: isLeftLead ? 0.4 : -0.4, y: breath };

    // 前手: 略前伸, 护脸
    if (isLeftLead) {
      pose.leftShoulder = { rz: -0.3 + sway, rx: -0.4 };
      pose.leftElbow = { rx: -1.0 };
      pose.rightShoulder = { rz: -0.8 - sway, rx: -0.3 };
      pose.rightElbow = { rx: -1.2 };
    } else {
      pose.rightShoulder = { rz: 0.3 - sway, rx: -0.4 };
      pose.rightElbow = { rx: -1.0 };
      pose.leftShoulder = { rz: 0.8 + sway, rx: -0.3 };
      pose.leftElbow = { rx: -1.2 };
    }

    // 膝盖微屈
    pose.leftKnee = { rx: 0.15 + breath };
    pose.rightKnee = { rx: 0.15 + breath };

    pose.headGroup = { ry: isLeftLead ? -0.2 : 0.2 };

    return pose;
  };
}

/**
 * 生成连击拳动画 (Combo)
 * @param {Object} opts
 * @param {Array} opts.moves - 动作序列, 如 ['leftJab', 'rightCross', 'leftHook']
 * @param {number} opts.power - 0~1 力度
 */
export function generateCombo(opts = {}) {
  const moves = opts.moves || ['leftJab', 'rightCross', 'leftHook'];
  const power = opts.power ?? 0.75;

  // 预生成每个子动作的生成器
  const generators = moves.map(move => {
    if (move === 'leftJab') return generatePunch({ hand: 'left', power: power * 0.7, height: 'head' });
    if (move === 'rightJab') return generatePunch({ hand: 'right', power: power * 0.7, height: 'head' });
    if (move === 'leftCross') return generatePunch({ hand: 'left', power: power, height: 'head' });
    if (move === 'rightCross') return generatePunch({ hand: 'right', power: power, height: 'head' });
    if (move === 'leftHook') return generateHook({ hand: 'left', power: power });
    if (move === 'rightHook') return generateHook({ hand: 'right', power: power });
    if (move === 'leftUppercut') return generateUppercut({ hand: 'left', power: power });
    if (move === 'rightUppercut') return generateUppercut({ hand: 'right', power: power });
    return generatePunch({ hand: 'left', power });
  });

  const moveCount = moves.length;
  const segmentDuration = 1 / moveCount;

  return (t) => {
    const segmentIdx = Math.min(Math.floor(t / segmentDuration), moveCount - 1);
    const localT = (t - segmentIdx * segmentDuration) / segmentDuration;
    return generators[segmentIdx](localT);
  };
}

/**
 * 生成左右直拳连击。
 * @param {Object} opts
 * @param {Array<string>} opts.order - 出拳顺序, 如 ['left', 'right']
 * @param {number} opts.count - 总出拳次数
 * @param {number} opts.power - 0~1 力度
 * @param {string} opts.height - 'head' | 'chest' | 'stomach' | 'low'
 * @param {string} opts.guard - 'natural' 时非出拳手自然下垂
 * @param {string} opts.style - 'compact' 时每拳短蓄力后快速前出
 */
export function generateStraightPunchCombo(opts = {}) {
  const rawOrder = Array.isArray(opts.order) ? opts.order : ['left', 'right'];
  const order = rawOrder
    .map((hand) => String(hand).toLowerCase())
    .filter((hand) => hand === 'left' || hand === 'right');
  const hands = order.length > 0 ? order : ['left', 'right'];
  const requestedCount = Number(opts.count ?? opts.hits ?? opts.punches);
  const punchCount = Number.isFinite(requestedCount) && requestedCount > 0
    ? Math.max(1, Math.round(requestedCount))
    : hands.length;
  const power = opts.power ?? 0.75;
  const height = opts.height || 'head';
  const guard = opts.guard || 'natural';
  const style = opts.style || opts.windup || 'compact';

  const generators = Array.from({ length: punchCount }, (_, i) => {
    const hand = hands[i % hands.length];
    return generatePunch({ hand, power, height, guard, style });
  });
  const segmentDuration = 1 / generators.length;

  return (t) => {
    const clampedT = Math.max(0, Math.min(1, t));
    const segmentIdx = Math.min(Math.floor(clampedT / segmentDuration), generators.length - 1);
    const localT = (clampedT - segmentIdx * segmentDuration) / segmentDuration;
    return generators[segmentIdx](localT);
  };
}
