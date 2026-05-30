import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Hadoken — 波动拳（街霸肯/隆式）
 *
 * 动作：双手在腰侧形成能量球（一手托一手盖）→ 双手一起往前推出
 *
 * 实际 baseline（自然下垂）：
 * - rightShoulder: {rx: -0.739, ry: 1.245, rz: 0.712}
 * - leftShoulder:  {rx: -0.739, ry: -1.245, rz: -0.712}
 * - _applyPose: final = baseline + offset
 *
 * 方向：
 * - rx 负值 = 手臂向前（从自然下垂向前摆）
 * - rx 正值 = 手臂向后/向上
 * - 右手 rz 负值 = 向内收（到身体中心）
 * - 右手 rz 正值 = 向外展
 * - 左手 rz 正值 = 向内收（到身体中心）
 * - 左手 rz 负值 = 向外展
 *
 * 注意：getPoseMatrix(t) 的 t 是 progress (0-1)，不是实际时间
 */
export class Hadoken extends AnimationBase {
  constructor() {
    super('Hadoken', 2.0);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 分界（基于 progress 0-1）：
    // Phase 1: 0-0.30 (0-0.60s)  双手收到腰侧蓄力
    // Phase 2: 0.30-0.50 (0.60-1.00s)  双手前推
    // Phase 3: 0.50-0.75 (1.00-1.50s)  保持推出
    // Phase 4: 0.75-1.00 (1.50-2.00s)  恢复

    // ===== Phase 1: 双手收到腰侧蓄力 (t: 0-0.30) =====
    // 动作：双拳放在身体右侧腰间，形成蓄力姿势
    // 关键：身体侧转，双臂弯曲
    if (t < 0.30) {
      const p = t / 0.30;
      // 使用 ease-out-cubic：快速到达蓄力姿势，然后保持
      const e = 1 - Math.pow(1 - p, 3);

      // 身体微蹲，侧转
      pose.mesh = { y: -e * 0.15, ry: -e * 0.8 };

      // 右腿后撤（弓步）
      pose.rightHip = { rx: e * 0.4 };
      pose.rightKnee = { rx: e * 0.5 };
      pose.leftHip = { rx: -e * 0.2 };
      pose.leftKnee = { rx: e * 0.3 };

      // 右臂：弯曲，拳头在右腰间
      pose.rightShoulder = {
        ry: -e * 1.245,
        rx: e * 1.2,
        rz: -e * 0.5,
      };
      pose.rightElbow = { rx: -e * 1.5 };
      pose.rightWrist = { rx: -e * 0.3, rz: e * 0.2 };

      // 左臂：跨过身体，拳头也放在右腰间
      pose.leftShoulder = {
        ry: e * 1.245,
        rx: e * 1.2,
        rz: e * 1.8,
      };
      pose.leftElbow = { rx: -e * 1.5 };
      pose.leftWrist = { rx: -e * 0.3, rz: -e * 0.2 };

      // 头部看向双拳方向（右侧）
      pose.headGroup = { rx: e * 0.1, ry: -e * 0.8 };
    }

    // ===== Phase 2: 双手一起前推！发波！ (t: 0.30-0.50) =====
    else if (t < 0.50) {
      const p = (t - 0.30) / 0.20;
      const e = 1 - Math.pow(1 - p, 2);

      // 身体转回正面，前倾
      pose.mesh = { y: -0.5 + e * 0.5, ry: -1.4 + e * 1.4, x: e * 0.5 };

      // 腿蹬直
      pose.rightHip = { rx: 0.4 - e * 0.2 };
      pose.rightKnee = { rx: 0.5 - e * 0.3 };
      pose.leftHip = { rx: -0.2 + e * 0.2 };
      pose.leftKnee = { rx: 0.3 };

      // 右臂：从腰部姿势向前推出
      // 起始值 = Phase 1 结束值: rx=0.3, ry=-1.245, rz=-0.8
      // 结束值 = Phase 3 值: rx=-1.57, ry=0, rz=-1.2
      pose.rightShoulder = { rx: 0.3 - e * 1.87, ry: -1.245 + e * 1.245, rz: -0.8 - e * 0.4 };
      // 肘部从弯曲到伸直: 起始=-2.0, 结束=0
      pose.rightElbow = { rx: -2.0 + e * 2.0 };
      // 手腕逐渐回到中立（掌心朝前）
      pose.rightWrist = { rx: -0.8 + e * 0.8, rz: 0.3 - e * 0.3 };

      // 左臂：从腰部姿势向前推出
      // 起始值 = Phase 1 结束值: rx=0.3, ry=1.245, rz=0.8
      // 结束值 = Phase 3 值: rx=-1.57, ry=0, rz=1.2
      pose.leftShoulder = { rx: 0.3 - e * 1.87, ry: 1.245 - e * 1.245, rz: 0.8 + e * 0.4 };
      // 肘部从弯曲到伸直: 起始=-2.0, 结束=0
      pose.leftElbow = { rx: -2.0 + e * 2.0 };
      // 手腕逐渐回到中立
      pose.leftWrist = { rx: -0.8 + e * 0.8, rz: -0.3 + e * 0.3 };

      // 头部抬起看前方
      pose.headGroup = { rx: 0.1 - e * 0.1, ry: -0.8 + e * 0.8 };
    }

    // ===== Phase 3: 保持推出 (t: 0.50-0.75) =====
    else if (t < 0.75) {
      pose.mesh = { x: 0.5 };

      pose.rightHip = { rx: 0.2 };
      pose.rightKnee = { rx: 0.2 };
      pose.leftHip = { rx: 0.0 };
      pose.leftKnee = { rx: 0.3 };

      // 双臂并拢向前伸直推出
      pose.rightShoulder = { rx: -1.57, rz: -1.2 };
      pose.rightElbow = { rx: 0 };
      pose.rightWrist = { rx: 0, rz: 0 };

      pose.leftShoulder = { rx: -1.57, rz: 1.2 };
      pose.leftElbow = { rx: 0 };
      pose.leftWrist = { rx: 0, rz: 0 };

      pose.headGroup = { rx: 0.0, ry: 0.0 };
    }

    // ===== Phase 4: 恢复 (t: 0.75-1.00) =====
    // 恢复到 FightingStance 的姿势，避免跳变
    else {
      const p = (t - 0.75) / 0.25;
      const e = p * p;

      pose.mesh = { y: e * 0.05, x: 0.5 - e * 0.5 };

      pose.rightHip = { rx: 0.2 - e * 0.2 };
      pose.rightKnee = { rx: 0.2 - e * 0.2 };
      pose.leftHip = { rx: -e * 0.0 };
      pose.leftKnee = { rx: 0.3 - e * 0.3 };

      // FightingStance 的 offset 值（用于平滑过渡）
      // rightShoulder: rx=-0.7, rz=-0.9
      // leftShoulder: rx=-0.6, rz=0.8
      // 从 Phase 3 结束值过渡到 FightingStance 值
      pose.rightShoulder = { rx: -1.57 + e * 0.87, rz: -1.2 + e * 0.3 };
      pose.rightElbow = { rx: e * 0.3 };
      pose.rightWrist = { rx: e * 0.0 };

      pose.leftShoulder = { rx: -1.57 + e * 0.97, rz: 1.2 - e * 0.4 };
      pose.leftElbow = { rx: e * 0.3 };
      pose.leftWrist = { rx: e * 0.0 };

      pose.headGroup = { rx: -e * 0.0 };
    }

    return pose;
  }
}
