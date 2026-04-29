import { AnimationBase } from 'dula-engine';

/**
 * SplashPaddle — 疯狂打水花（腿部高速踢水）
 * 用于水中恐慌逃命时脚底的溅射效果
 */
export class SplashPaddle extends AnimationBase {
  constructor() {
    super('SplashPaddle', 0.6);
  }

  update(t, character) {
    const freq = Math.PI * 14; // 极快踢水

    // 腿部高速交替踢动（比 Run 更快更 frantic）
    if (character.leftLeg) {
      character.leftLeg.rotation.x = Math.sin(t * freq) * 1.3;
    }
    if (character.rightLeg) {
      character.rightLeg.rotation.x = Math.sin(t * freq + Math.PI) * 1.3;
    }

    // 身体剧烈上下颠簸（踩水）
    const baseY = character.baseY || 0;
    character.mesh.position.y = baseY + Math.abs(Math.sin(t * freq * 0.5)) * 0.2;

    // 手臂慌乱划水
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (rArm && lArm) {
      const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
      const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;
      rArm.rotation.z = rBaseZ + Math.sin(t * freq * 0.7) * 0.5;
      lArm.rotation.z = lBaseZ + Math.sin(t * freq * 0.7 + Math.PI) * 0.5;
      rArm.rotation.x = -0.3 + Math.sin(t * freq) * 0.3;
      lArm.rotation.x = -0.3 + Math.sin(t * freq + Math.PI) * 0.3;
    }

    // 头部慌乱左右看
    if (character.headGroup) {
      character.headGroup.rotation.y = Math.sin(t * freq * 0.3) * 0.25;
      character.headGroup.rotation.x = -0.1 + Math.sin(t * freq * 0.5) * 0.1;
    }
  }
}
