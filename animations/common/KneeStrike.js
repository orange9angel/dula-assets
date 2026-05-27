import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * KneeStrike — 膝击（参考KOF克拉克、街霸Cammy）
 *
 * 抓住对手后提膝猛击，或独立膝击。
 * 近身强力打击，通常配合手臂拉拽动作。
 */
export class KneeStrike extends AnimationBase {
  constructor() {
    super('KneeStrike', 0.5);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'],
      suits: ['humanoid', 'fighter', 'athletic'],
      notSuits: ['round', 'tiny', 'quadruped', 'floating'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();

    // Phase 1: Grab & chamber (0-0.15) - 抓握+提膝
    if (t < 0.15) {
      const p = t / 0.15;
      const ease = p * p;

      // 身体：前倾+微升
      pose.mesh = {
        y: ease * 0.05,
        x: ease * 0.1,
        rx: ease * 0.15,
      };

      pose.headGroup = { rx: ease * 0.08, ry: -ease * 0.05 };

      // 双臂：前伸抓握
      pose.rightShoulder = { rz: -ease * 0.6, rx: -ease * 0.8 };
      pose.rightElbow = { rx: -ease * 0.9 };
      pose.rightWrist = { rz: -ease * 0.2 };

      pose.leftShoulder = { rz: ease * 0.5, rx: -ease * 0.7 };
      pose.leftElbow = { rx: -ease * 0.8 };
      pose.leftWrist = { rz: ease * 0.15 };

      // 右腿：提膝蓄力
      pose.rightHip = { rx: -ease * 1.1 };
      pose.rightKnee = { rx: ease * 1.4 };
      pose.rightAnkle = { rx: -ease * 0.35 };

      // 左腿：支撑微屈
      pose.leftHip = { rx: ease * 0.15 };
      pose.leftKnee = { rx: ease * 0.25 };
      pose.leftAnkle = { rx: -ease * 0.08 };
    }
    // Phase 2: KNEE! (0.15-0.3) - 膝击爆发
    else if (t < 0.3) {
      const p = (t - 0.15) / 0.15;
      const ease = 1 - Math.pow(1 - p, 3);

      // 身体：突进+上提
      pose.mesh = {
        y: 0.05 + ease * 0.12,
        x: 0.1 + ease * 0.15,
        rx: 0.15 + ease * 0.1,
      };

      pose.headGroup = { rx: 0.08 + ease * 0.05, ry: -0.05 + ease * 0.03 };

      // 双臂：拉拽收紧
      pose.rightShoulder = { rz: -0.6 + ease * 0.2, rx: -0.8 - ease * 0.2 };
      pose.rightElbow = { rx: -0.9 - ease * 0.2 };
      pose.rightWrist = { rz: -0.2 + ease * 0.1 };

      pose.leftShoulder = { rz: 0.5 - ease * 0.1, rx: -0.7 - ease * 0.2 };
      pose.leftElbow = { rx: -0.8 - ease * 0.2 };
      pose.leftWrist = { rz: 0.15 - ease * 0.05 };

      // 右腿：膝击顶出！
      pose.rightHip = { rx: -1.1 + ease * 0.4 };
      pose.rightKnee = { rx: 1.4 - ease * 0.6 };
      pose.rightAnkle = { rx: -0.35 + ease * 0.15 };

      // 左腿：蹬直支撑
      pose.leftHip = { rx: 0.15 + ease * 0.1 };
      pose.leftKnee = { rx: 0.25 + ease * 0.1 };
      pose.leftAnkle = { rx: -0.08 - ease * 0.05 };
    }
    // Phase 3: Hold (0.3-0.4) - 顶点保持
    else if (t < 0.4) {
      const p = (t - 0.3) / 0.1;
      const breathe = Math.sin(p * Math.PI) * 0.015;

      pose.mesh = {
        y: 0.17 + breathe,
        x: 0.25,
        rx: 0.25,
      };

      pose.headGroup = { rx: 0.13 + breathe * 0.3, ry: -0.02 };

      pose.rightShoulder = { rz: -0.4, rx: -1.0 };
      pose.rightElbow = { rx: -1.1 };
      pose.rightWrist = { rz: -0.1 };

      pose.leftShoulder = { rz: 0.4, rx: -0.9 };
      pose.leftElbow = { rx: -1.0 };
      pose.leftWrist = { rz: 0.1 };

      pose.rightHip = { rx: -0.7 };
      pose.rightKnee = { rx: 0.8 };
      pose.rightAnkle = { rx: -0.2 };

      pose.leftHip = { rx: 0.25 };
      pose.leftKnee = { rx: 0.35 };
      pose.leftAnkle = { rx: -0.13 };
    }
    // Phase 4: Recover (0.4-1.0) - 回位
    else {
      const p = (t - 0.4) / 0.6;
      const ease = p * p;

      pose.mesh = {
        y: 0.17 - ease * 0.17,
        x: 0.25 * (1 - ease),
        rx: 0.25 - ease * 0.25,
      };

      pose.headGroup = { rx: 0.13 * (1 - ease), ry: -0.02 * (1 - ease) };

      pose.rightShoulder = { rz: -0.4 + ease * 0.4, rx: -1.0 + ease * 1.0 };
      pose.rightElbow = { rx: -1.1 + ease * 1.1 };
      pose.rightWrist = { rz: -0.1 + ease * 0.1 };

      pose.leftShoulder = { rz: 0.4 - ease * 0.4, rx: -0.9 + ease * 0.9 };
      pose.leftElbow = { rx: -1.0 + ease * 1.0 };
      pose.leftWrist = { rz: 0.1 - ease * 0.1 };

      pose.rightHip = { rx: -0.7 + ease * 0.7 };
      pose.rightKnee = { rx: 0.8 - ease * 0.8 };
      pose.rightAnkle = { rx: -0.2 + ease * 0.2 };

      pose.leftHip = { rx: 0.25 - ease * 0.25 };
      pose.leftKnee = { rx: 0.35 - ease * 0.35 };
      pose.leftAnkle = { rx: -0.13 + ease * 0.13 };
    }

    return pose;
  }
}
