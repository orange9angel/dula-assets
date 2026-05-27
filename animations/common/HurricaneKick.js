import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * HurricaneKick — 龙卷旋风脚（参考街霸隆的Tatsumaki Senpukyaku）
 *
 * 身体水平旋转，双腿交替踢出，整个人在空中横向移动。
 * 这是街霸最具代表性的动作之一。
 */
export class HurricaneKick extends AnimationBase {
  constructor() {
    super('HurricaneKick', 1.1);
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

    // Phase 1: Crouch & coil (0-0.14) - 下蹲蓄力
    if (t < 0.14) {
      const p = t / 0.14;
      const ease = p * p;

      pose.mesh = {
        y: -ease * 0.25,
        x: -ease * 0.08,
        rx: ease * 0.2,
      };

      pose.headGroup = { rx: ease * 0.1 };

      // 双臂：收紧胸前
      pose.rightShoulder = { rz: -ease * 0.6, rx: -ease * 0.5 };
      pose.rightElbow = { rx: -ease * 0.8 };
      pose.leftShoulder = { rz: ease * 0.6, rx: -ease * 0.5 };
      pose.leftElbow = { rx: -ease * 0.8 };

      // 双腿：深蹲
      pose.rightHip = { rx: ease * 0.6 };
      pose.rightKnee = { rx: ease * 1.1 };
      pose.rightAnkle = { rx: -ease * 0.2 };
      pose.leftHip = { rx: ease * 0.5 };
      pose.leftKnee = { rx: ease * 1.0 };
      pose.leftAnkle = { rx: -ease * 0.18 };
    }
    // Phase 2: LAUNCH & SPIN (0.14-0.35) - 起跳+开始旋转
    else if (t < 0.35) {
      const p = (t - 0.14) / 0.21;
      const ease = 1 - Math.pow(1 - p, 2);
      const lift = 0.85 * ease;

      // 身体：起跳+水平化+开始旋转
      pose.mesh = {
        y: -0.25 + lift,
        x: -0.08 + ease * 0.35,
        rx: 0.2 - ease * 0.5,
        ry: -ease * 1.8,
        rz: -ease * 0.15,
      };

      pose.headGroup = { rx: 0.1 - ease * 0.25, ry: ease * 0.3 };

      // 双臂：展开保持平衡
      pose.rightShoulder = { rz: -0.6 - ease * 0.4, rx: -0.5 + ease * 0.2 };
      pose.rightElbow = { rx: -0.8 + ease * 0.3 };
      pose.leftShoulder = { rz: 0.6 + ease * 0.4, rx: -0.5 + ease * 0.2 };
      pose.leftElbow = { rx: -0.8 + ease * 0.3 };

      // 右腿：开始伸直踢出
      pose.rightHip = { rx: 0.6 - ease * 1.4, rz: -ease * 0.35 };
      pose.rightKnee = { rx: 1.1 - ease * 0.7 };
      pose.rightAnkle = { rx: -0.2 - ease * 0.15 };

      // 左腿：收膝
      pose.leftHip = { rx: 0.5 - ease * 0.9 };
      pose.leftKnee = { rx: 1.0 + ease * 0.4 };
      pose.leftAnkle = { rx: -0.18 - ease * 0.1 };
    }
    // Phase 3: MID-SPIN (0.35-0.62) - 空中连续旋转踢
    else if (t < 0.62) {
      const p = (t - 0.35) / 0.27;
      const ease = p * p;
      const spinPhase = p * Math.PI * 2;

      // 身体：水平旋转，横向移动
      pose.mesh = {
        y: 0.6 + Math.sin(spinPhase) * 0.08,
        x: 0.27 + ease * 0.55,
        rx: -0.3 + Math.sin(spinPhase) * 0.05,
        ry: -1.8 - ease * 2.8,
        rz: -0.15 + Math.sin(spinPhase * 2) * 0.08,
      };

      pose.headGroup = {
        rx: -0.15 + Math.sin(spinPhase) * 0.06,
        ry: 0.3 + Math.sin(spinPhase) * 0.1,
      };

      // 双臂：随旋转摆动
      pose.rightShoulder = {
        rz: -1.0 + Math.sin(spinPhase) * 0.3,
        rx: -0.3 + Math.cos(spinPhase) * 0.1,
      };
      pose.rightElbow = { rx: -0.5 + Math.sin(spinPhase) * 0.2 };
      pose.leftShoulder = {
        rz: 1.0 + Math.sin(spinPhase + Math.PI) * 0.3,
        rx: -0.3 + Math.cos(spinPhase + Math.PI) * 0.1,
      };
      pose.leftElbow = { rx: -0.5 + Math.sin(spinPhase + Math.PI) * 0.2 };

      // 双腿：交替踢出（剪刀腿）
      const legCycle = Math.sin(spinPhase * 2);
      pose.rightHip = { rx: -0.8 + legCycle * 0.5, rz: -0.35 + legCycle * 0.15 };
      pose.rightKnee = { rx: 0.4 - legCycle * 0.3 };
      pose.rightAnkle = { rx: -0.35 + legCycle * 0.1 };

      pose.leftHip = { rx: -0.4 - legCycle * 0.5, rz: legCycle * 0.1 };
      pose.leftKnee = { rx: 1.4 + legCycle * 0.2 };
      pose.leftAnkle = { rx: -0.28 - legCycle * 0.05 };
    }
    // Phase 4: DESCEND (0.62-0.82) - 下落
    else if (t < 0.82) {
      const p = (t - 0.62) / 0.2;
      const ease = p * p;

      pose.mesh = {
        y: 0.6 - ease * 0.7,
        x: 0.82 - ease * 0.25,
        rx: -0.3 + ease * 0.35,
        ry: -4.6 + ease * 1.2,
        rz: -0.15 + ease * 0.15,
      };

      pose.headGroup = { rx: -0.15 + ease * 0.2, ry: 0.3 - ease * 0.3 };

      pose.rightShoulder = { rz: -1.0 + ease * 0.5, rx: -0.3 + ease * 0.2 };
      pose.rightElbow = { rx: -0.5 + ease * 0.3 };
      pose.leftShoulder = { rz: 1.0 - ease * 0.5, rx: -0.3 + ease * 0.2 };
      pose.leftElbow = { rx: -0.5 + ease * 0.3 };

      pose.rightHip = { rx: -0.8 + ease * 0.7, rz: -0.35 + ease * 0.2 };
      pose.rightKnee = { rx: 0.4 + ease * 0.4 };
      pose.rightAnkle = { rx: -0.35 + ease * 0.2 };

      pose.leftHip = { rx: -0.4 + ease * 0.5 };
      pose.leftKnee = { rx: 1.4 - ease * 0.8 };
      pose.leftAnkle = { rx: -0.28 + ease * 0.15 };
    }
    // Phase 5: Landing recovery (0.82-1.0)
    else {
      const p = (t - 0.82) / 0.18;
      const ease = 1 - Math.pow(1 - p, 2);
      const bounce = Math.sin(p * Math.PI) * 0.04;

      pose.mesh = {
        y: -0.1 + bounce + ease * 0.02,
        x: 0.57 * (1 - ease),
        rx: 0.05 - ease * 0.05,
        ry: -3.4 * (1 - ease),
        rz: 0,
      };

      pose.headGroup = { rx: 0.05 * (1 - ease), ry: 0 };

      pose.rightShoulder = { rz: -0.5 - ease * 0.35, rx: -0.1 - ease * 0.45 };
      pose.rightElbow = { rx: -0.2 - ease * 0.65 };
      pose.leftShoulder = { rz: 0.5 + ease * 0.15, rx: -0.1 - ease * 0.35 };
      pose.leftElbow = { rx: -0.2 - ease * 0.55 };

      pose.rightHip = { rx: -0.1 + ease * 0.1 };
      pose.rightKnee = { rx: 0.8 - ease * 0.5 };
      pose.rightAnkle = { rx: -0.15 + ease * 0.05 };

      pose.leftHip = { rx: 0.1 - ease * 0.02 };
      pose.leftKnee = { rx: 0.6 - ease * 0.35 };
      pose.leftAnkle = { rx: -0.13 + ease * 0.03 };
    }

    return pose;
  }
}
