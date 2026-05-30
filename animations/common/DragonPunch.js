import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * DragonPunch — 升龙拳（街霸 Shoryuken）
 *
 * 下蹲蓄力 → 单脚蹬地垂直升空 → 右拳螺旋上勾 → 左拳护脸 → 顶点后仰 → 下落恢复
 */
export class DragonPunch extends AnimationBase {
  constructor() {
    super('DragonPunch', 1.2);
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

    // ===== Phase 1: Crouch charge (0-0.15) =====
    if (t < 0.15) {
      const p = t / 0.15;
      const e = p * p;

      pose.mesh = {
        y: -e * 0.5,
        rx: e * 0.15,
      };

      pose.headGroup = { rx: e * 0.2 };

      // 右手：收在腰间蓄力，稍微向后预摆
      pose.rightShoulder = {
        rx: -e * 0.5,    // 向后预摆，为上升做准备
        rz: -e * 0.3,
      };
      pose.rightElbow = {
        rx: e * 1.5,
      };
      pose.rightWrist = {
        rz: -e * 0.2,
      };

      // 左手：弯曲护脸
      pose.leftShoulder = {
        rx: -e * 0.8,
        rz: e * 0.4,
      };
      pose.leftElbow = {
        rx: -e * 1.2,
      };
      pose.leftWrist = {
        rz: e * 0.2,
      };

      // 右腿：深蹲弯曲
      pose.rightHip = {
        rx: e * 1.0,
        rz: e * 0.1,
      };
      pose.rightKnee = {
        rx: e * 1.5,
      };
      pose.rightAnkle = {
        rx: -e * 0.4,
      };

      // 左腿：后撤弯曲
      pose.leftHip = {
        rx: e * 0.8,
        rz: -e * 0.2,
      };
      pose.leftKnee = {
        rx: e * 1.2,
      };
      pose.leftAnkle = {
        rx: -e * 0.3,
      };
    }

    // ===== Phase 2: EXPLODE UP (0.15-0.40) =====
    else if (t < 0.40) {
      const p = (t - 0.15) / 0.25;
      // 线性 + 轻微缓入缓出，让变化更均匀
      const e = p * p * (3 - 2 * p);

      // 身体：垂直跳起，微后仰（不要过度后仰导致手臂看起来张开）
      pose.mesh = {
        y: -0.5 + e * 3.5,
        rx: 0.15 - e * 0.3,   // 减少后仰
      };

      pose.headGroup = {
        rx: 0.2 - e * 0.4,
      };

      // === 右手：垂直上勾！ ===
      // 基线 rx=-0.739 (手臂向前下方)
      // 目标 world space: 垂直向上 (0, 1, 0)
      // 需要 offset 使总 rx ≈ -2.4 (约-138°)，同时 rz 内收
      // 加速：让手臂在 e=0.5 时就接近垂直
      pose.rightShoulder = {
        rx: 0.3 - e * 3.0,    // 终点: -2.7 rad，更快达到垂直向上
        rz: -0.3 - e * 0.6,   // 适度内收
      };
      pose.rightElbow = {
        rx: 1.5 - e * 1.5,    // 从弯曲到伸直
      };
      pose.rightWrist = {
        rz: -0.2 + e * 0.2,
      };

      // === 左手：护脸！ ===
      // 基线 rx=-0.739 (手臂向前下方)
      // 目标 world space: 抬高向内护在脸前
      pose.leftShoulder = {
        rx: -0.8 - e * 1.2,   // 终点: -2.0，更快抬高护脸
        rz: 0.4 + e * 0.6,    // 强向内收，护脸
      };
      pose.leftElbow = {
        rx: -1.2 + e * 0.5,   // 保持弯曲
      };
      pose.leftWrist = {
        rz: 0.2 + e * 0.3,    // 手腕向内
      };

      // === 右腿：垂直蹬直！ ===
      // 基线 rx=0 (腿垂直向下)
      // 目标 world space: 保持垂直向下
      pose.rightHip = {
        rx: 1.0 - e * 1.0,    // 终点: 0，保持垂直
        rz: 0.1 - e * 0.1,
      };
      pose.rightKnee = {
        rx: 1.5 - e * 1.5,    // 从弯曲到伸直
      };
      pose.rightAnkle = {
        rx: -0.4 + e * 0.4,   // 脚绷直
      };

      // === 左腿：弯曲 tuck ===
      pose.leftHip = {
        rx: 0.8 - e * 1.6,    // 大腿抬起
        rz: -0.2 + e * 0.3,
      };
      pose.leftKnee = {
        rx: 1.2 - e * 0.4,    // 保持弯曲
      };
      pose.leftAnkle = {
        rx: -0.3 + e * 0.3,
      };
    }

    // ===== Phase 3: PEAK (0.40-0.65) =====
    else if (t < 0.65) {
      const p = (t - 0.40) / 0.25;
      const hover = Math.sin(p * Math.PI) * 0.1;

      pose.mesh = {
        y: 3.0 + hover,
        rx: -0.15,
      };

      pose.headGroup = { rx: -0.2 };

      // 右手：保持垂直上勾
      pose.rightShoulder = { rx: -2.4, rz: -1.1 };
      pose.rightElbow = { rx: 0 };
      pose.rightWrist = { rz: 0 };

      // 左手：保持护脸
      pose.leftShoulder = { rx: -1.7, rz: 1.0 };
      pose.leftElbow = { rx: -0.7 };
      pose.leftWrist = { rz: 0.5 };

      // 右腿：保持垂直蹬直
      pose.rightHip = { rx: 0, rz: 0 };
      pose.rightKnee = { rx: 0 };
      pose.rightAnkle = { rx: 0 };

      // 左腿：保持弯曲 tuck
      pose.leftHip = { rx: -0.8, rz: 0.1 };
      pose.leftKnee = { rx: 0.8 };
      pose.leftAnkle = { rx: 0 };
    }

    // ===== Phase 4: Fall (0.65-0.90) =====
    else if (t < 0.90) {
      const p = (t - 0.65) / 0.25;
      const e = p * p;

      pose.mesh = {
        y: 3.0 - e * 3.2,
        rx: -0.15 + e * 0.15,
      };

      pose.headGroup = { rx: -0.2 + e * 0.2 };

      // 右手：从头顶收回，起始值与 PEAK 结束匹配
      pose.rightShoulder = {
        rx: -2.4 + e * 2.2,   // 从 -2.4 到 -0.2
        rz: -0.9 + e * 0.8,   // 从 -0.9 到 -0.1
      };
      pose.rightElbow = { rx: e * 0.5 };
      pose.rightWrist = { rz: -e * 0.1 };

      // 左手：从护脸收回，起始值与 PEAK 结束匹配
      pose.leftShoulder = {
        rx: -1.7 + e * 1.4,   // 从 -1.7 到 -0.3
        rz: 1.0 - e * 0.8,    // 从 1.0 到 0.2
      };
      pose.leftElbow = { rx: -0.7 + e * 0.3 };
      pose.leftWrist = { rz: 0.5 - e * 0.4 };

      // 右腿：准备落地，起始值与 PEAK 结束匹配
      pose.rightHip = { rx: e * 0.1, rz: e * 0.1 };
      pose.rightKnee = { rx: e * 0.5 };
      pose.rightAnkle = { rx: -0.2 + e * 0.1 };

      // 左腿：准备落地，起始值与 PEAK 结束匹配
      pose.leftHip = { rx: -0.8 + e * 0.7, rz: 0.1 - e * 0.1 };
      pose.leftKnee = { rx: 0.8 - e * 0.2 };
      pose.leftAnkle = { rx: -0.1 + e * 0.05 };
    }

    // ===== Phase 5: Landing recovery (0.90-1.0) =====
    else {
      const p = (t - 0.90) / 0.10;
      const e = 1 - Math.pow(1 - p, 2);
      const bounce = Math.sin(p * Math.PI) * 0.05;

      pose.mesh = {
        y: -0.2 + bounce + e * 0.2,
        rx: 0,
      };

      pose.headGroup = { rx: 0 };

      // 双臂：恢复格斗抱架（接近 FightingStance 的姿势）
      pose.rightShoulder = { rx: -0.2 - e * 0.5, rz: -0.2 - e * 0.7 };
      pose.rightElbow = { rx: -0.5 - e * 0.6 };
      pose.rightWrist = { rz: -0.1 };

      pose.leftShoulder = { rx: -0.3 - e * 0.3, rz: 0.2 + e * 0.6 };
      pose.leftElbow = { rx: -0.4 - e * 0.6 };
      pose.leftWrist = { rz: 0.1 };

      // 双腿：微弯缓冲 → 站立
      pose.rightHip = { rx: -0.1 + e * 0.1, rz: 0.1 - e * 0.1 };
      pose.rightKnee = { rx: 0.5 - e * 0.3 };
      pose.rightAnkle = { rx: -0.1 + e * 0.05 };

      pose.leftHip = { rx: -0.1 + e * 0.1, rz: 0 };
      pose.leftKnee = { rx: 0.8 - e * 0.5 };
      pose.leftAnkle = { rx: -0.05 + e * 0.05 };
    }

    return pose;
  }
}
