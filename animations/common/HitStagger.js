import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * HitStagger — 受击踉跄（13点矩阵控制版）
 *
 * 使用关节：rightShoulder, rightElbow, leftShoulder, leftElbow,
 *           headGroup, mesh
 */
export class HitStagger extends AnimationBase {
  constructor() {
    super('HitStagger', 0.6);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'athletic', 'monster'],
      notSuits: ['tiny'],
      minHeight: 0.5,
      maxHeight: 3.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: IMPACT (0-0.15) - 剧烈受击
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = 1 - Math.pow(1 - p, 3);

      // 被击退
      pose.mesh = { x: -ease * 0.5, z: ease * 0.15, y: ease * 0.05 };

      // 双臂受冲击甩动
      pose.rightShoulder = { rz: ease * 0.6, rx: ease * 0.5 };
      pose.rightElbow = { rx: ease * 0.3 };
      pose.leftShoulder = { rz: -ease * 0.6, rx: ease * 0.4 };
      pose.leftElbow = { rx: ease * 0.3 };

      // 头后仰
      pose.headGroup = { rx: ease * 0.3, ry: -ease * 0.2 };
    }
    // Phase 2: Stagger (0.15-0.35) - 踉跄摇晃
    else if (t < 0.35) {
      const p = (t - 0.15) / 0.2;
      const wobble = Math.sin(p * Math.PI * 4) * 0.03;
      const wobbleArm = Math.sin(p * Math.PI * 5) * 0.06;

      pose.mesh = { x: -0.5 + wobble, z: 0.15 + Math.sin(p * Math.PI * 3) * 0.06 };

      pose.rightShoulder = { rz: 0.6 + wobbleArm };
      pose.leftShoulder = { rz: -0.6 + wobbleArm };

      pose.headGroup = { rx: 0.3 - p * 0.08, ry: -0.2 + p * 0.35 };
    }
    // Phase 3: Recover (0.35-1.0) - 恢复站姿
    else {
      const p = (t - 0.35) / 0.65;
      const ease = p * p;

      pose.mesh = { x: -0.5 * (1 - ease), z: 0.15 - ease * 0.15, y: 0.05 - ease * 0.11 };

      pose.rightShoulder = { rz: 0.6 - ease * 1.5, rx: 0.5 - ease * 0.5 };
      pose.rightElbow = { rx: 0.3 - ease * 0.3 };
      pose.leftShoulder = { rz: -0.6 + ease * 1.1, rx: 0.4 - ease * 0.4 };
      pose.leftElbow = { rx: 0.3 - ease * 0.3 };

      pose.headGroup = { rx: 0.22 * (1 - ease), ry: 0.15 * (1 - ease) };
    }

    return pose;
  }
}
