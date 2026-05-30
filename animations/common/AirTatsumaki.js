import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * AirTatsumaki — 空中龙卷（直升机旋转踢）
 *
 * 原创格斗招式：身体水平横躺像直升机，高速旋转中双腿分工明确
 * - 起跳后身体前倾水平（像超人飞行姿态）
 * - 身体绕垂直轴高速旋转
 * - 右腿竖直向上伸直，作为旋转主轴（像直升机尾桨）
 * - 左腿水平伸直横扫，作为攻击刃（像主旋翼）
 * - 双臂收紧护胸
 */
export class AirTatsumaki extends AnimationBase {
  constructor() {
    super('AirTatsumaki', 1.6);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const PI = Math.PI;

    // ===== Phase 1: Crouch charge (0-0.10) =====
    if (t < 0.10) {
      const p = t / 0.10;
      const e = p * p;

      pose.mesh = { y: -e * 0.30, ry: -e * 0.4 };
      pose.headGroup = { rx: e * 0.3 };

      // 右腿向后抬起蓄力
      pose.rightHip = { rx: -e * 0.6, rz: e * 0.4 };
      pose.rightKnee = { rx: e * 1.6 };
      pose.rightAnkle = { rx: -e * 0.6 };

      // 左腿深弯曲支撑
      pose.leftHip = { rx: e * 0.8 };
      pose.leftKnee = { rx: e * 1.4 };
      pose.leftAnkle = { rx: -e * 0.5 };

      // 双臂抱架
      pose.rightShoulder = { rz: -e * 1.4, rx: -e * 0.8 };
      pose.rightElbow = { rx: -e * 1.6 };
      pose.leftShoulder = { rz: e * 1.2, rx: -e * 0.6 };
      pose.leftElbow = { rx: -e * 1.4 };
    }

    // ===== Phase 2: LAUNCH (0.10-0.22) =====
    else if (t < 0.22) {
      const p = (t - 0.10) / 0.12;
      const e = 1 - Math.pow(1 - p, 3);

      // 起跳：高度快速上升，身体开始前倾水平化
      pose.mesh = {
        y: -0.30 + e * 1.4,
        ry: -0.4 + e * 0.4,
        rx: e * 1.45,  // 身体前倾接近水平
      };

      // 头 compensating
      pose.headGroup = { rx: 0.3 - e * 1.1 };

      // 右腿：向后上方甩，准备竖直向上
      pose.rightHip = { rx: -0.6 - e * 1.8, rz: 0.4 - e * 0.4 };
      pose.rightKnee = { rx: 1.6 - e * 1.6 };
      pose.rightAnkle = { rx: -0.6 + e * 0.6 };

      // 左腿：向后上方甩，准备水平横扫
      pose.leftHip = { rx: 0.8 - e * 1.8, rz: -e * 0.8 };
      pose.leftKnee = { rx: 1.4 - e * 1.4 };
      pose.leftAnkle = { rx: -0.5 + e * 0.5 };

      // 双臂收紧
      pose.rightShoulder = { rz: -1.4 + e * 0.6, rx: -0.8 + e * 0.4 };
      pose.rightElbow = { rx: -1.6 + e * 1.0 };
      pose.leftShoulder = { rz: 1.2 - e * 0.8, rx: -0.6 + e * 0.4 };
      pose.leftElbow = { rx: -1.4 + e * 0.9 };
    }

    // ===== Phase 3: HELICOPTER SPIN (0.22-0.70) =====
    // 核心：身体水平前倾，右腿竖直向上（主轴），左腿水平横扫（刃）
    else if (t < 0.70) {
      const p = (t - 0.22) / 0.48;
      const spinE = p < 0.15 ? p / 0.15 : 1;

      const totalSpins = 7 * PI;
      const currentSpin = totalSpins * p;

      // 身体：水平前倾 + 高速旋转
      pose.mesh = {
        y: 1.10 + Math.sin(p * PI * 2) * 0.15,
        x: Math.sin(p * PI) * 0.6,
        rx: 1.45 + spinE * 0.15,  // 身体接近水平（rx ≈ 1.57 = 90度前倾）
        ry: currentSpin,
      };

      // 头 compensating
      pose.headGroup = {
        rx: -0.85 + Math.sin(currentSpin) * 0.05,
        ry: Math.sin(currentSpin * 0.5) * 0.1,
      };

      // === 右腿（主轴腿）：始终竖直向上 ===
      // 身体前倾 rx≈1.57 时，原来的 Y 轴（上）变成了世界的前方
      // 要让腿竖直向上（指向天空），需要 rx ≈ -1.57（与身体前倾相反）
      pose.rightHip = {
        rx: -1.57, // 竖直向上，固定不动
        rz: 0,
      };
      pose.rightKnee = { rx: 0 }; // 完全伸直
      pose.rightAnkle = { rx: 0 };

      // === 左腿（攻击刃）：始终水平，rz 随旋转变化形成圆形横扫 ===
      // 身体前倾时，rx ≈ 0 让腿与身体水平线对齐
      // rz 大幅变化让腿在水平面做圆形横扫
      const sweepAngle = currentSpin;
      pose.leftHip = {
        rx: 0, // 与身体水平线对齐
        rz: Math.sin(sweepAngle) * 1.2, // 大幅水平面圆形横扫
      };
      pose.leftKnee = { rx: 0 }; // 完全伸直
      pose.leftAnkle = { rx: 0 };

      // === 双臂：收紧护胸 ===
      pose.rightShoulder = {
        rz: -0.8 + Math.sin(currentSpin) * 0.1,
        rx: -0.4,
      };
      pose.rightElbow = { rx: -0.6 };
      pose.leftShoulder = {
        rz: 0.4 + Math.sin(currentSpin + PI) * 0.1,
        rx: -0.4,
      };
      pose.leftElbow = { rx: -0.5 };
    }

    // ===== Phase 4: PEAK HOLD (0.70-0.78) =====
    else if (t < 0.78) {
      const p = (t - 0.70) / 0.08;
      const e = Math.sin(p * PI * 0.5);

      const finalSpin = 7 * PI;

      pose.mesh = {
        y: 1.10 - e * 0.15,
        x: Math.sin(p * PI * 0.5) * 0.3,
        rx: 1.60 - e * 0.3,
        ry: finalSpin + e * PI * 0.3,
      };

      pose.headGroup = { rx: -0.85 + e * 0.4 };

      // 右腿开始微收
      pose.rightHip = { rx: -1.57 + e * 0.3, rz: 0 };
      pose.rightKnee = { rx: e * 0.3 };
      pose.rightAnkle = { rx: 0 };

      // 左腿开始微收
      pose.leftHip = { rx: e * 0.2, rz: Math.sin(finalSpin) * 1.2 + e * 0.3 };
      pose.leftKnee = { rx: e * 0.3 };
      pose.leftAnkle = { rx: 0 };

      // 双臂
      pose.rightShoulder = { rz: -0.8 + e * 0.3, rx: -0.4 };
      pose.rightElbow = { rx: -0.6 + e * 0.3 };
      pose.leftShoulder = { rz: 0.4 - e * 0.2, rx: -0.4 };
      pose.leftElbow = { rx: -0.5 + e * 0.3 };
    }

    // ===== Phase 5: DESCEND (0.78-0.90) =====
    else if (t < 0.90) {
      const p = (t - 0.78) / 0.12;
      const e = p * p;

      pose.mesh = {
        y: 0.95 - e * 1.15,
        x: 0.3 - e * 0.3,
        rx: 1.55 - e * 1.55,
        ry: 7.3 * PI - e * 7.3 * PI,
      };

      pose.headGroup = { rx: -0.5 + e * 0.5 };

      // 右腿：从竖直→落地支撑
      pose.rightHip = { rx: -1.27 + e * 1.47, rz: e * 0.2 };
      pose.rightKnee = { rx: 0.3 + e * 0.8 };
      pose.rightAnkle = { rx: -e * 0.4 };

      // 左腿：从水平→落地
      pose.leftHip = { rx: e * 0.7, rz: Math.sin(7.3 * PI) * 1.2 - e * 0.7 };
      pose.leftKnee = { rx: 0.3 + e * 0.7 };
      pose.leftAnkle = { rx: -e * 0.3 };

      // 双臂展开平衡
      pose.rightShoulder = { rz: -0.5 + e * 0.8, rx: -0.4 + e * 0.2 };
      pose.rightElbow = { rx: -0.3 + e * 0.2 };
      pose.leftShoulder = { rz: 0.2 - e * 0.5, rx: -0.4 + e * 0.2 };
      pose.leftElbow = { rx: -0.2 + e * 0.2 };
    }

    // ===== Phase 6: LAND BUFFER (0.90-0.96) =====
    else if (t < 0.96) {
      const p = (t - 0.90) / 0.06;
      const e = p * p;
      const bounce = Math.sin(p * PI) * 0.06;

      pose.mesh = {
        y: -0.20 + e * 0.20 + bounce,
        rx: 0,
        ry: 0,
      };

      // 双腿微弯缓冲
      pose.rightHip = { rx: 0.2 + e * 0.3, rz: 0.2 - e * 0.2 };
      pose.rightKnee = { rx: 1.1 - e * 0.7 };
      pose.rightAnkle = { rx: -0.4 + e * 0.3 };

      pose.leftHip = { rx: 0.5 + e * 0.1, rz: 0 };
      pose.leftKnee = { rx: 1.0 - e * 0.6 };
      pose.leftAnkle = { rx: -0.3 + e * 0.2 };

      // 双臂
      pose.rightShoulder = { rz: 0.3 - e * 0.5, rx: -0.2 };
      pose.rightElbow = { rx: -0.1 };
      pose.leftShoulder = { rz: -0.3 + e * 0.5, rx: -0.2 };
      pose.leftElbow = { rx: -0.1 };
    }

    // ===== Phase 7: RECOVER (0.96-1.0) =====
    else {
      const p = (t - 0.96) / 0.04;
      const e = 1 - Math.pow(1 - p, 2);

      pose.mesh = { y: 0.02 * Math.sin(p * Math.PI), rx: 0 };

      // 恢复格斗站姿
      pose.rightHip = { rx: 0.5 - e * 0.5, rz: 0 };
      pose.rightKnee = { rx: 0.4 - e * 0.4 };
      pose.rightAnkle = { rx: -0.1 };

      pose.leftHip = { rx: 0.6 - e * 0.6, rz: 0 };
      pose.leftKnee = { rx: 0.4 - e * 0.4 };
      pose.leftAnkle = { rx: -0.1 };

      // 双臂恢复抱架
      pose.rightShoulder = { rz: -0.2 - e * 0.7, rx: -e * 0.6 };
      pose.rightElbow = { rx: -e * 0.5 };
      pose.leftShoulder = { rz: 0.2 + e * 0.5, rx: -e * 0.5 };
      pose.leftElbow = { rx: -e * 0.4 };
    }

    return pose;
  }
}
