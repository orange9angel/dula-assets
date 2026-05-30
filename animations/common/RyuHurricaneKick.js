import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * RyuHurricaneKick — 隆式龙卷旋风脚（经典街霸版）
 *
 * 还原街霸 Ryu 的 Tatsumaki Senpūkyaku：
 * - 起跳后身体基本直立，微向前倾
 * - 左腿始终垂直向下，作为旋转轴心（像陀螺的中心轴）
 * - 右腿始终水平向前伸直，做圆形横扫（像直升机螺旋桨）
 * - 身体绕垂直轴高速旋转（像陀螺）
 * - 落地恢复格斗站姿
 *
 * 关键坐标系理解：
 * - baseline 时腿垂直向下 (rx=0)
 * - rx=-1.57: 腿水平向前（向前踢90°）
 * - rx=1.57: 腿水平向后（向后踢90°）
 */
export class RyuHurricaneKick extends AnimationBase {
  constructor() {
    super('RyuHurricaneKick', 1.6);
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

      pose.mesh = { y: -e * 0.30 };
      pose.headGroup = { rx: e * 0.2 };

      // 右腿向后抬起蓄力（准备水平踢出）
      pose.rightHip = { rx: -e * 0.5, rz: e * 0.3 };
      pose.rightKnee = { rx: e * 1.4 };
      pose.rightAnkle = { rx: -e * 0.5 };

      // 左腿深弯曲支撑（轴心腿）
      pose.leftHip = { rx: e * 0.7 };
      pose.leftKnee = { rx: e * 1.3 };
      pose.leftAnkle = { rx: -e * 0.4 };

      // 双臂抱架
      pose.rightShoulder = { rz: -e * 1.2, rx: -e * 0.6 };
      pose.rightElbow = { rx: -e * 1.4 };
      pose.leftShoulder = { rz: e * 1.0, rx: -e * 0.5 };
      pose.leftElbow = { rx: -e * 1.2 };
    }

    // ===== Phase 2: LAUNCH (0.10-0.22) =====
    else if (t < 0.22) {
      const p = (t - 0.10) / 0.12;
      const e = 1 - Math.pow(1 - p, 3);

      pose.mesh = {
        y: -0.30 + e * 1.5,
        rx: e * 0.3,
      };

      pose.headGroup = { rx: 0.2 - e * 0.5 };

      // 右腿：向后上方甩，准备进入水平位置（攻击腿）
      pose.rightHip = { rx: -0.5 - e * 1.0, rz: 0.3 - e * 0.3 };
      pose.rightKnee = { rx: 1.4 - e * 1.4 };
      pose.rightAnkle = { rx: -0.5 + e * 0.5 };

      // 左腿：保持垂直支撑（轴心腿），微收
      pose.leftHip = { rx: 0.7 - e * 0.7, rz: -e * 0.3 };
      pose.leftKnee = { rx: 1.3 - e * 1.3 };
      pose.leftAnkle = { rx: -0.4 + e * 0.4 };

      // 双臂收紧
      pose.rightShoulder = { rz: -1.2 + e * 0.4, rx: -0.6 + e * 0.3 };
      pose.rightElbow = { rx: -1.4 + e * 0.8 };
      pose.leftShoulder = { rz: 1.0 - e * 0.6, rx: -0.5 + e * 0.3 };
      pose.leftElbow = { rx: -1.2 + e * 0.7 };
    }

    // ===== Phase 3: TATSUMAKI SPIN (0.22-0.70) =====
    // 核心：左腿始终垂直向下（轴心），右腿始终水平向前横扫（攻击）
    else if (t < 0.70) {
      const p = (t - 0.22) / 0.48;
      const spinE = p < 0.15 ? p / 0.15 : 1;

      const totalSpins = 7 * PI;
      const currentSpin = totalSpins * p;

      // 身体：起跳高度，微前倾，高速旋转
      pose.mesh = {
        y: 1.20 + Math.sin(p * PI * 2) * 0.12,
        x: Math.sin(p * PI) * 0.5,
        rx: 0.3 + spinE * 0.15,
        ry: currentSpin,
      };

      // 头：保持朝前
      pose.headGroup = {
        rx: -0.3 + Math.sin(currentSpin) * 0.03,
        ry: Math.sin(currentSpin * 0.5) * 0.08,
      };

      // === 左腿（轴心腿）：始终垂直向下，作为旋转中心 ===
      // rx = 0 保持 baseline 的垂直向下
      // 身体在旋转(ry)，左腿会随身体一起转，但始终在身体下方
      pose.leftHip = {
        rx: 0,       // 垂直向下（baseline）
        rz: 0.15,    // 微微外展稳定
      };
      pose.leftKnee = { rx: 0 };   // 完全伸直
      pose.leftAnkle = { rx: 0 };  // 脚 flat

      // === 右腿（攻击腿）：始终水平向前，做圆形横扫 ===
      // rx = -1.57 让腿水平向前（从垂直向下向前转90°）
      // 身体在旋转(ry)，右腿随身体一起转，在水平面内做圆形横扫
      // 这就像直升机螺旋桨：桨叶始终水平，但随机身旋转
      pose.rightHip = {
        rx: -1.57,                   // 水平向前（从垂直向下转90°）
        rz: 0.3,                     // 微微外展
      };
      pose.rightKnee = { rx: 0 };   // 完全伸直
      pose.rightAnkle = { rx: 0 };  // 脚背绷直

      // === 双臂：护胸平衡 ===
      pose.rightShoulder = {
        rz: -0.8 + Math.sin(currentSpin) * 0.15,
        rx: -0.3,
      };
      pose.rightElbow = { rx: -0.8 };
      pose.leftShoulder = {
        rz: 0.6 + Math.sin(currentSpin + PI) * 0.15,
        rx: -0.3,
      };
      pose.leftElbow = { rx: -0.7 };
    }

    // ===== Phase 4: PEAK HOLD (0.70-0.78) =====
    else if (t < 0.78) {
      const p = (t - 0.70) / 0.08;
      const e = Math.sin(p * PI * 0.5);

      const finalSpin = 7 * PI;

      pose.mesh = {
        y: 1.20 - e * 0.15,
        x: Math.sin(p * PI * 0.5) * 0.25,
        rx: 0.45 - e * 0.1,
        ry: finalSpin + e * PI * 0.2,
      };

      pose.headGroup = { rx: -0.3 + e * 0.2 };

      // 右腿（攻击腿）：从水平→微收
      pose.rightHip = { rx: -1.57 + e * 0.4, rz: 0.1 };
      pose.rightKnee = { rx: e * 0.2 };
      pose.rightAnkle = { rx: 0 };

      // 左腿（轴心腿）：保持垂直→微收
      pose.leftHip = { rx: e * 0.3, rz: 0.15 - e * 0.1 };
      pose.leftKnee = { rx: e * 0.2 };
      pose.leftAnkle = { rx: 0 };

      // 双臂
      pose.rightShoulder = { rz: -0.8 + e * 0.2, rx: -0.3 };
      pose.rightElbow = { rx: -0.8 + e * 0.2 };
      pose.leftShoulder = { rz: 0.6 - e * 0.1, rx: -0.3 };
      pose.leftElbow = { rx: -0.7 + e * 0.2 };
    }

    // ===== Phase 5: DESCEND (0.78-0.90) =====
    else if (t < 0.90) {
      const p = (t - 0.78) / 0.12;
      const e = p * p;

      pose.mesh = {
        y: 1.05 - e * 1.25,
        x: 0.25 - e * 0.25,
        rx: 0.35 - e * 0.35,
        ry: 7.2 * PI - e * 7.2 * PI,
      };

      pose.headGroup = { rx: -0.1 + e * 0.1 };

      // 右腿（攻击腿）：从水平→落地支撑
      pose.rightHip = { rx: -1.17 + e * 1.17, rz: 0.1 - e * 0.1 };
      pose.rightKnee = { rx: e * 0.8 };
      pose.rightAnkle = { rx: -e * 0.3 };

      // 左腿（轴心腿）：从垂直→落地
      pose.leftHip = { rx: e * 0.5, rz: 0.05 + e * 0.05 };
      pose.leftKnee = { rx: e * 0.8 };
      pose.leftAnkle = { rx: -e * 0.3 };

      // 双臂展开平衡
      pose.rightShoulder = { rz: -0.6 + e * 0.6, rx: -0.3 + e * 0.2 };
      pose.rightElbow = { rx: -0.6 + e * 0.3 };
      pose.leftShoulder = { rz: 0.5 - e * 0.4, rx: -0.3 + e * 0.2 };
      pose.leftElbow = { rx: -0.5 + e * 0.2 };
    }

    // ===== Phase 6: LAND BUFFER (0.90-0.96) =====
    else if (t < 0.96) {
      const p = (t - 0.90) / 0.06;
      const e = p * p;
      const bounce = Math.sin(p * PI) * 0.05;

      pose.mesh = {
        y: -0.20 + e * 0.20 + bounce,
        ry: 0,
      };

      // 双腿微弯缓冲
      pose.rightHip = { rx: 0.2 + e * 0.3, rz: 0 };
      pose.rightKnee = { rx: 0.8 - e * 0.4 };
      pose.rightAnkle = { rx: -0.3 + e * 0.2 };

      pose.leftHip = { rx: 0.5 - e * 0.2, rz: 0 };
      pose.leftKnee = { rx: 0.8 - e * 0.4 };
      pose.leftAnkle = { rx: -0.3 + e * 0.2 };

      // 双臂
      pose.rightShoulder = { rz: 0.0 - e * 0.3, rx: -0.1 };
      pose.rightElbow = { rx: -0.3 + e * 0.1 };
      pose.leftShoulder = { rz: 0.1 + e * 0.2, rx: -0.1 };
      pose.leftElbow = { rx: -0.3 + e * 0.1 };
    }

    // ===== Phase 7: RECOVER (0.96-1.0) =====
    else {
      const p = (t - 0.96) / 0.04;
      const e = 1 - Math.pow(1 - p, 2);

      pose.mesh = { y: 0.02 * Math.sin(p * Math.PI) };

      // 恢复格斗站姿
      pose.rightHip = { rx: 0.5 - e * 0.5, rz: 0 };
      pose.rightKnee = { rx: 0.4 - e * 0.4 };
      pose.rightAnkle = { rx: -0.1 };

      pose.leftHip = { rx: 0.3 - e * 0.3, rz: 0 };
      pose.leftKnee = { rx: 0.5 - e * 0.5 };
      pose.leftAnkle = { rx: -0.1 };

      // 双臂恢复抱架
      pose.rightShoulder = { rz: -0.3 - e * 0.6, rx: -e * 0.5 };
      pose.rightElbow = { rx: -0.2 - e * 0.3 };
      pose.leftShoulder = { rz: 0.3 + e * 0.4, rx: -e * 0.4 };
      pose.leftElbow = { rx: -0.2 - e * 0.2 };
    }

    return pose;
  }
}
