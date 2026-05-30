import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * TatsumakiSenpukyaku — 龙卷旋风脚（经典街霸隆版本）
 *
 * 核心姿态（13点关节精确控制）：
 * - 左脚垂直支撑（旋转轴心），leftHip/leftKnee/leftAnkle 近乎伸直
 * - 右腿水平伸直旋转（像直升机螺旋桨一样横扫），rightHip.rz 控制水平角度
 * - 上半身前倾保持平衡，双臂展开
 * - 以左脚为轴原地高速旋转 2-3 圈
 *
 * 关节控制明细：
 *   mesh(整体位移/旋转) — 控制起跳高度和绕Y轴旋转
 *   headGroup — 头部稳定
 *   rightShoulder/leftShoulder — 双臂展开平衡
 *   rightHip/leftHip — 右腿水平甩出，左腿垂直支撑
 *   rightKnee/leftKnee — 右腿伸直，左腿微屈
 *   rightAnkle/leftAnkle — 脚背绷直
 */
export class TatsumakiSenpukyaku extends AnimationBase {
  constructor() {
    super('TatsumakiSenpukyaku', 1.2);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // === Phase 1: 深蹲蓄力 (0-0.12) ===
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      // 整体：下蹲，重心移向左脚
      pose.mesh = {
        y: -ease * 0.35,
        x: ease * 0.08,
        rx: ease * 0.1,
      };

      // 头部：低头蓄力
      pose.headGroup = { rx: ease * 0.2 };

      // 双臂：收紧胸前
      pose.rightShoulder = { rz: -ease * 0.6, rx: -ease * 0.3 };
      pose.rightElbow = { rx: -ease * 0.5 };
      pose.leftShoulder = { rz: ease * 0.6, rx: -ease * 0.3 };
      pose.leftElbow = { rx: -ease * 0.5 };

      // 左腿(支撑脚)：深蹲蓄力
      pose.leftHip = { rx: ease * 0.8, rz: ease * 0.1 };
      pose.leftKnee = { rx: ease * 1.3 };
      pose.leftAnkle = { rx: -ease * 0.25 };

      // 右腿(旋转脚)：屈膝提起
      pose.rightHip = { rx: -ease * 0.6, rz: -ease * 0.3 };
      pose.rightKnee = { rx: ease * 1.1 };
      pose.rightAnkle = { rx: ease * 0.15 };
    }

    // === Phase 2: 起跳+甩腿+开始旋转 (0.12-0.30) ===
    else if (t < 0.30) {
      const p = (t - 0.12) / 0.18;
      const ease = 1 - Math.pow(1 - p, 2);

      // 整体：起跳，上身前倾，开始绕Y轴旋转
      pose.mesh = {
        y: -0.35 + ease * 0.55,
        x: 0.08 - ease * 0.03,
        rx: 0.1 - ease * 0.3,   // 上身前倾
        ry: -ease * 2.0,         // 开始旋转
        rz: ease * 0.08,
      };

      // 头部：保持平视
      pose.headGroup = { rx: 0.2 - ease * 0.15, ry: ease * 0.15 };

      // 双臂：展开保持平衡
      pose.rightShoulder = { rz: -0.6 - ease * 0.7, rx: -0.3 + ease * 0.2 };
      pose.rightElbow = { rx: -0.5 + ease * 0.3 };
      pose.leftShoulder = { rz: 0.6 + ease * 0.7, rx: -0.3 + ease * 0.2 };
      pose.leftElbow = { rx: -0.5 + ease * 0.3 };

      // 左腿(支撑脚)：逐渐伸直成为旋转轴
      pose.leftHip = { rx: 0.8 - ease * 1.0, rz: 0.1 - ease * 0.08 };
      pose.leftKnee = { rx: 1.3 - ease * 1.1 };
      pose.leftAnkle = { rx: -0.25 + ease * 0.15 };

      // 右腿(旋转脚)：水平甩出！
      // rx: 大腿后抬使腿水平, rz: 大腿外展使腿横向伸直
      pose.rightHip = {
        rx: -0.6 - ease * 0.5,    // 大腿向后抬起
        rz: -0.3 - ease * 1.3,    // 大腿外展 → 腿水平伸直
      };
      pose.rightKnee = { rx: 1.1 - ease * 1.2 };  // 膝盖伸直
      pose.rightAnkle = { rx: 0.15 - ease * 0.2 }; // 脚背绷直
    }

    // === Phase 3: 高速旋转踢击 (0.30-0.70) —— 核心阶段 ===
    else if (t < 0.70) {
      const p = (t - 0.30) / 0.4;
      // 旋转 3 圈 = 6π 弧度
      const totalSpin = 6 * Math.PI;
      const currentSpin = totalSpin * p;
      const wobble = Math.sin(currentSpin * 3) * 0.04;

      // 整体：低空悬浮，以左脚为轴高速旋转
      pose.mesh = {
        y: 0.2 + wobble,
        x: 0.05,
        rx: -0.2 + wobble,
        ry: -2.0 - currentSpin,  // 持续旋转！
        rz: 0.08 + Math.cos(currentSpin) * 0.03,
      };

      // 头部：相对稳定
      pose.headGroup = {
        rx: 0.05 + wobble,
        ry: Math.sin(currentSpin * 0.5) * 0.1,
      };

      // 双臂：展开保持平衡
      pose.rightShoulder = {
        rz: -1.3 + Math.sin(currentSpin) * 0.1,
        rx: -0.1 + Math.cos(currentSpin) * 0.05,
      };
      pose.rightElbow = { rx: -0.2 + Math.sin(currentSpin) * 0.08 };
      pose.leftShoulder = {
        rz: 1.3 + Math.sin(currentSpin + Math.PI) * 0.1,
        rx: -0.1 + Math.cos(currentSpin + Math.PI) * 0.05,
      };
      pose.leftElbow = { rx: -0.2 + Math.sin(currentSpin + Math.PI) * 0.08 };

      // 左腿(支撑脚)：近乎垂直伸直，作为旋转轴心
      pose.leftHip = {
        rx: -0.2 + wobble,
        rz: 0.02 + Math.cos(currentSpin) * 0.02,
      };
      pose.leftKnee = { rx: 0.2 + wobble };
      pose.leftAnkle = { rx: -0.1 + Math.cos(currentSpin) * 0.03 };

      // 右腿(旋转脚)：水平伸直，像螺旋桨一样横扫！
      // rx ≈ -1.1 (大腿向后约63°，使小腿接近水平)
      // rz ≈ -1.6 (大腿外展约92°，腿横向伸直)
      pose.rightHip = {
        rx: -1.1 + Math.sin(currentSpin) * 0.05,
        rz: -1.6 + Math.sin(currentSpin * 2) * 0.15,
      };
      pose.rightKnee = { rx: -0.1 + Math.sin(currentSpin) * 0.03 };
      pose.rightAnkle = { rx: -0.05 + Math.cos(currentSpin) * 0.05 };
    }

    // === Phase 4: 减速收腿 (0.70-0.88) ===
    else if (t < 0.88) {
      const p = (t - 0.70) / 0.18;
      const ease = p * p;
      const remainingSpin = (1 - ease) * 0.8;

      // 整体：开始下落
      pose.mesh = {
        y: 0.2 - ease * 0.45,
        x: 0.05 - ease * 0.02,
        rx: -0.2 + ease * 0.2,
        ry: -2.0 - 6 * Math.PI + remainingSpin,
        rz: 0.08 - ease * 0.08,
      };

      pose.headGroup = { rx: 0.05 + ease * 0.1, ry: 0 };

      // 双臂：逐渐收回
      pose.rightShoulder = { rz: -1.3 + ease * 0.7, rx: -0.1 - ease * 0.15 };
      pose.rightElbow = { rx: -0.2 - ease * 0.25 };
      pose.leftShoulder = { rz: 1.3 - ease * 0.7, rx: -0.1 - ease * 0.15 };
      pose.leftElbow = { rx: -0.2 - ease * 0.25 };

      // 左腿(支撑脚)：准备落地
      pose.leftHip = { rx: -0.2 + ease * 0.5, rz: 0.02 - ease * 0.02 };
      pose.leftKnee = { rx: 0.2 + ease * 0.6 };
      pose.leftAnkle = { rx: -0.1 + ease * 0.1 };

      // 右腿(旋转脚)：收回
      pose.rightHip = { rx: -1.1 + ease * 0.8, rz: -1.6 + ease * 1.1 };
      pose.rightKnee = { rx: -0.1 + ease * 0.7 };
      pose.rightAnkle = { rx: -0.05 + ease * 0.15 };
    }

    // === Phase 5: 落地恢复 (0.88-1.0) ===
    else {
      const p = (t - 0.88) / 0.12;
      const ease = 1 - Math.pow(1 - p, 2);
      const bounce = Math.sin(p * Math.PI) * 0.04;

      // 整体：落地，微弹
      pose.mesh = {
        y: -0.25 + bounce + ease * 0.2,
        x: 0.03 * (1 - ease),
        rx: 0 - ease * 0.02,
        ry: (-2.0 - 6 * Math.PI) * (1 - ease),
        rz: 0,
      };

      pose.headGroup = { rx: 0.15 * (1 - ease), ry: 0 };

      // 双臂：回到格斗架势
      pose.rightShoulder = { rz: -0.6 - ease * 0.2, rx: -0.25 - ease * 0.2 };
      pose.rightElbow = { rx: -0.45 - ease * 0.35 };
      pose.leftShoulder = { rz: 0.6 + ease * 0.2, rx: -0.25 - ease * 0.2 };
      pose.leftElbow = { rx: -0.45 - ease * 0.35 };

      // 双腿：恢复站立
      pose.leftHip = { rx: 0.3 - ease * 0.3, rz: 0 };
      pose.leftKnee = { rx: 0.8 - ease * 0.55 };
      pose.leftAnkle = { rx: 0 - ease * 0.05 };

      pose.rightHip = { rx: -0.3 + ease * 0.3, rz: -0.5 + ease * 0.5 };
      pose.rightKnee = { rx: 0.6 - ease * 0.35 };
      pose.rightAnkle = { rx: 0.1 - ease * 0.1 };
    }

    return pose;
  }
}
