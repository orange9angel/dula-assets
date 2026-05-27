import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * SplashPaddle — 疯狂打水花（腿部高速踢水）
 * 用于水中恐慌逃命时脚底的溅射效果
 */
export class SplashPaddle extends AnimationBase {
  constructor() {
    super('SplashPaddle', 0.6);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const freq = Math.PI * 14; // 极快踢水

    // 腿部高速交替踢动（比 Run 更快更 frantic）
    pose.leftHip = { rx: Math.sin(t * freq) * 1.3 };
    pose.rightHip = { rx: Math.sin(t * freq + Math.PI) * 1.3 };

    // 身体剧烈上下颠簸（踩水）
    pose.mesh = { y: Math.abs(Math.sin(t * freq * 0.5)) * 0.2 };

    // 手臂慌乱划水
    pose.rightShoulder = {
      rz: Math.sin(t * freq * 0.7) * 0.5,
      rx: -0.3 + Math.sin(t * freq) * 0.3,
    };
    pose.leftShoulder = {
      rz: Math.sin(t * freq * 0.7 + Math.PI) * 0.5,
      rx: -0.3 + Math.sin(t * freq + Math.PI) * 0.3,
    };

    // 头部慌乱左右看
    pose.headGroup = {
      ry: Math.sin(t * freq * 0.3) * 0.25,
      rx: -0.1 + Math.sin(t * freq * 0.5) * 0.1,
    };

    return pose;
  }
}
