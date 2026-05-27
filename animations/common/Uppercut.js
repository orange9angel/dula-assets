import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * Uppercut — 上勾拳（13点矩阵控制版）
 *
 * 使用关节：rightShoulder, rightElbow, rightWrist, leftShoulder, leftElbow,
 *           headGroup, mesh
 */
export class Uppercut extends AnimationBase {
  constructor() {
    super('Uppercut', 0.7);
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

    // Phase 1: Dip (0-0.2) - 下蹲蓄力
    if (t < 0.2) {
      const p = t / 0.2;
      const ease = p * p;

      pose.rightShoulder = { rz: -ease * 0.5, rx: ease * 0.8 };
      pose.rightElbow = { rx: ease * 0.6 };
      pose.leftShoulder = { rz: ease * 0.3, rx: ease * 0.2 };
      pose.leftElbow = { rx: ease * 0.3 };

      pose.mesh = { y: -ease * 0.15, x: -ease * 0.05 };
      pose.headGroup = { rx: ease * 0.15 };
    }
    // Phase 2: EXPLODE UP (0.2-0.45) - 上勾拳爆发
    else if (t < 0.45) {
      const p = (t - 0.2) / 0.25;
      const ease = 1 - Math.pow(1 - p, 3);

      pose.rightShoulder = { rz: -0.5 + ease * 1.8, rx: 0.8 - ease * 2.0 };
      pose.rightElbow = { rx: 0.6 - ease * 1.8 };
      pose.leftShoulder = { rz: 0.3 - ease * 0.5, rx: 0.2 - ease * 0.3 };
      pose.leftElbow = { rx: 0.3 - ease * 0.5 };

      pose.mesh = { y: -0.15 + ease * 0.25, x: -0.05 + ease * 0.1 };
      pose.headGroup = { rx: 0.15 - ease * 0.3 };
    }
    // Phase 3: Peak hold (0.45-0.6) - 手臂在顶点
    else if (t < 0.6) {
      pose.rightShoulder = { rz: 1.3, rx: -1.2 };
      pose.rightElbow = { rx: -1.2 };
      pose.leftShoulder = { rz: -0.2, rx: -0.1 };
      pose.leftElbow = { rx: -0.2 };

      pose.mesh = { y: 0.1 };
      pose.headGroup = { rx: -0.15 };
    }
    // Phase 4: Recover (0.6-1.0) - 回到格斗站姿
    else {
      const p = (t - 0.6) / 0.4;
      const ease = p * p;

      pose.rightShoulder = { rz: 1.3 - ease * 2.2, rx: -1.2 + ease * 0.5 };
      pose.rightElbow = { rx: -1.2 + ease * 0.8 };
      pose.leftShoulder = { rz: -0.2 + ease * 0.7, rx: -0.1 + ease * 0.3 };
      pose.leftElbow = { rx: -0.2 + ease * 0.4 };

      pose.mesh = { y: 0.1 - ease * 0.16, x: 0.05 * (1 - ease) };
      pose.headGroup = { rx: -0.15 + ease * 0.15 };
    }

    return pose;
  }
}
