import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * TornadoKick — 龙卷风腿
 * 原地垂直旋转升空，双腿交替连环踢
 * 参考：街霸 Chun-Li Spinning Bird Kick 垂直版
 */
export class TornadoKick extends AnimationBase {
  constructor() {
    super('TornadoKick', 1.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightLeg', 'leftLeg', 'rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'agile'],
      notSuits: ['round', 'tiny', 'quadruped', 'slow'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Crouch (0-0.12) - 深蹲蓄力
    if (t < 0.12) {
      const p = t / 0.12;
      const ease = p * p;

      pose.mesh = { y: -ease * 0.4 };

      pose.rightHip = { rx: ease * 0.5 };
      pose.rightKnee = { rx: ease * 1.3 };
      pose.leftHip = { rx: ease * 0.5 };
      pose.leftKnee = { rx: ease * 1.3 };

      pose.rightShoulder = { rz: -ease * 0.8 };
      pose.leftShoulder = { rz: ease * 0.8 };
    }
    // Phase 2: Launch + spin (0.12-0.40) - 起跳垂直旋转
    else if (t < 0.40) {
      const p = (t - 0.12) / 0.28;
      const ease = 1 - Math.pow(1 - p, 2);

      // 垂直升空 3m + 快速旋转
      pose.mesh = {
        y: -0.4 + ease * 3.0,
        ry: ease * 18.8, // 3圈
      };

      // 双腿交替展开（剪刀式）
      const legCycle = Math.sin(p * Math.PI * 6) * ease;
      pose.rightHip = { rx: 0.5 + legCycle * 1.5, rz: legCycle * 0.3 };
      pose.rightKnee = { rx: 1.3 - Math.abs(legCycle) * 0.8 };
      pose.leftHip = { rx: 0.5 - legCycle * 1.5, rz: -legCycle * 0.3 };
      pose.leftKnee = { rx: 1.3 - Math.abs(legCycle) * 0.8 };

      // 手臂张开保持平衡
      pose.rightShoulder = { rz: -0.8 - ease * 0.3, rx: -ease * 0.5 };
      pose.leftShoulder = { rz: 0.8 + ease * 0.3, rx: -ease * 0.5 };
    }
    // Phase 3: Peak tornado (0.40-0.65) - 顶点持续旋转踢
    else if (t < 0.65) {
      const p = (t - 0.40) / 0.25;
      const hold = 1 - p * 0.1;

      pose.mesh = {
        y: 2.6 * hold,
        ry: 18.8 + p * 12.5, // 再转2圈
      };

      // 双腿高速交替踢
      const legCycle = Math.sin(p * Math.PI * 8);
      pose.rightHip = { rx: 0.5 + legCycle * 1.8, rz: legCycle * 0.4 };
      pose.rightKnee = { rx: 0.5 - Math.abs(legCycle) * 0.3 };
      pose.leftHip = { rx: 0.5 - legCycle * 1.8, rz: -legCycle * 0.4 };
      pose.leftKnee = { rx: 0.5 - Math.abs(legCycle) * 0.3 };

      pose.rightShoulder = { rz: -1.1, rx: -0.5 };
      pose.leftShoulder = { rz: 1.1, rx: -0.5 };
    }
    // Phase 4: Descend (0.65-0.90) - 下降收腿
    else if (t < 0.90) {
      const p = (t - 0.65) / 0.25;
      const ease = p * p;

      pose.mesh = {
        y: 2.34 - ease * 2.34,
        ry: 31.3 - ease * 30.8,
      };

      // 双腿收回
      pose.rightHip = { rx: 0.5 - ease * 0.3, rz: ease * 0.1 };
      pose.rightKnee = { rx: 0.5 + ease * 0.5 };
      pose.leftHip = { rx: 0.5 - ease * 0.3, rz: -ease * 0.1 };
      pose.leftKnee = { rx: 0.5 + ease * 0.5 };

      pose.rightShoulder = { rz: -1.1 + ease * 0.6, rx: -0.5 + ease * 0.3 };
      pose.leftShoulder = { rz: 1.1 - ease * 0.6, rx: -0.5 + ease * 0.3 };
    }
    // Phase 5: Land (0.90-1.0) - 落地恢复
    else {
      const p = (t - 0.90) / 0.10;
      const ease = p * p;

      pose.mesh = { ry: 0.5 - ease * 0.5 };

      pose.rightHip = { rx: ease * 0.2 };
      pose.rightKnee = { rx: ease * 0.15 };
      pose.leftHip = { rx: ease * 0.2 };
      pose.leftKnee = { rx: ease * 0.15 };

      pose.rightShoulder = { rz: -ease * 0.9, rx: -ease * 0.7 };
      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.4 };
    }

    return pose;
  }
}
