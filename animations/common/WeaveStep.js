import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * WeaveStep — 拳击滑步/侧闪（参考街霸Dudley、KOF坂崎良）
 *
 * 上身侧闪+下身滑步的经典拳击防守动作。
 * 上身向一侧倾斜闪避，同时下身快速滑步调整位置。
 */
export class WeaveStep extends AnimationBase {
  constructor() {
    super('WeaveStep', 0.55);
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

    // Phase 1: Dip & weave (0-0.22) - 下蹲侧闪
    if (t < 0.22) {
      const p = t / 0.22;
      const ease = p * p;

      // 身体：下沉+侧倾（向左侧闪）
      pose.mesh = {
        y: -ease * 0.18,
        x: -ease * 0.25,
        rz: ease * 0.22,
        rx: ease * 0.08,
      };

      // 头部：向闪避方向倾斜保持视线
      pose.headGroup = {
        rx: ease * 0.12,
        ry: -ease * 0.18,
        rz: -ease * 0.1,
      };

      // 右臂：收紧护脸
      pose.rightShoulder = { rz: -0.85 * ease, rx: -0.6 * ease };
      pose.rightElbow = { rx: -1.05 * ease };
      pose.rightWrist = { rz: -0.12 * ease };

      // 左臂：护肋
      pose.leftShoulder = { rz: 0.75 * ease, rx: -0.5 * ease };
      pose.leftElbow = { rx: -0.9 * ease };
      pose.leftWrist = { rz: 0.1 * ease };

      // 右腿：屈膝下沉
      pose.rightHip = { rx: 0.25 * ease };
      pose.rightKnee = { rx: 0.45 * ease };
      pose.rightAnkle = { rx: -0.12 * ease };

      // 左腿：蹬地准备
      pose.leftHip = { rx: 0.1 * ease };
      pose.leftKnee = { rx: 0.3 * ease };
      pose.leftAnkle = { rx: -0.08 * ease };
    }
    // Phase 2: Hold low (0.22-0.38) - 低位保持
    else if (t < 0.38) {
      const p = (t - 0.22) / 0.16;
      const breathe = Math.sin(p * Math.PI) * 0.015;

      pose.mesh = {
        y: -0.18 + breathe,
        x: -0.25,
        rz: 0.22,
        rx: 0.08,
      };

      pose.headGroup = {
        rx: 0.12 + breathe * 0.5,
        ry: -0.18,
        rz: -0.1,
      };

      pose.rightShoulder = { rz: -0.85, rx: -0.6 };
      pose.rightElbow = { rx: -1.05 };
      pose.rightWrist = { rz: -0.12 };

      pose.leftShoulder = { rz: 0.75, rx: -0.5 };
      pose.leftElbow = { rx: -0.9 };
      pose.leftWrist = { rz: 0.1 };

      pose.rightHip = { rx: 0.25 };
      pose.rightKnee = { rx: 0.45 };
      pose.rightAnkle = { rx: -0.12 };

      pose.leftHip = { rx: 0.1 };
      pose.leftKnee = { rx: 0.3 };
      pose.leftAnkle = { rx: -0.08 };
    }
    // Phase 3: Snap back (0.38-1.0) - 弹回站姿
    else {
      const p = (t - 0.38) / 0.62;
      const ease = 1 - Math.pow(1 - p, 2);

      pose.mesh = {
        y: -0.18 * (1 - ease),
        x: -0.25 * (1 - ease),
        rz: 0.22 * (1 - ease),
        rx: 0.08 * (1 - ease),
      };

      pose.headGroup = {
        rx: 0.12 * (1 - ease),
        ry: -0.18 * (1 - ease),
        rz: -0.1 * (1 - ease),
      };

      pose.rightShoulder = { rz: -0.85 + ease * 0.85, rx: -0.6 + ease * 0.6 };
      pose.rightElbow = { rx: -1.05 + ease * 1.05 };
      pose.rightWrist = { rz: -0.12 + ease * 0.12 };

      pose.leftShoulder = { rz: 0.75 - ease * 0.75, rx: -0.5 + ease * 0.5 };
      pose.leftElbow = { rx: -0.9 + ease * 0.9 };
      pose.leftWrist = { rz: 0.1 - ease * 0.1 };

      pose.rightHip = { rx: 0.25 - ease * 0.25 };
      pose.rightKnee = { rx: 0.45 - ease * 0.45 };
      pose.rightAnkle = { rx: -0.12 + ease * 0.12 };

      pose.leftHip = { rx: 0.1 - ease * 0.1 };
      pose.leftKnee = { rx: 0.3 - ease * 0.3 };
      pose.leftAnkle = { rx: -0.08 + ease * 0.08 };
    }

    return pose;
  }
}
