import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * HundredCrackFist — 百裂拳（北斗神拳）
 * 极速连续直拳，双臂交替模糊出击
 */
export class HundredCrackFist extends AnimationBase {
  constructor() {
    super('HundredCrackFist', 1.5);
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
    const speed = 18; // 极速
    const punch = Math.sin(t * speed);
    const punch2 = Math.sin(t * speed + Math.PI * 0.7);

    // 身体微震
    pose.mesh = { x: Math.sin(t*speed*2)*0.05, ry: Math.sin(t*speed)*0.1 };

    // 右臂极速伸缩
    pose.rightShoulder = { rx: -0.8 + punch*0.6, rz: -0.3 + punch*0.4 };
    pose.rightElbow = { rx: -0.5 + Math.abs(punch)*1.2 };
    pose.rightWrist = { rz: punch*0.3 };

    // 左臂极速伸缩（相位差）
    pose.leftShoulder = { rx: -0.8 + punch2*0.6, rz: 0.3 - punch2*0.4 };
    pose.leftElbow = { rx: -0.5 + Math.abs(punch2)*1.2 };
    pose.leftWrist = { rz: -punch2*0.3 };

    // 马步扎稳
    pose.rightHip = { rx: 0.4 };
    pose.rightKnee = { rx: 0.8 };
    pose.leftHip = { rx: 0.4 };
    pose.leftKnee = { rx: 0.8 };

    // 头部锁定目标
    pose.headGroup = { ry: 0.1 };

    return pose;
  }
}
