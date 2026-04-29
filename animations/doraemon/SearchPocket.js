import { AnimationBase } from 'dula-engine';

/**
 * SearchPocket — 哆啦A梦翻口袋找道具
 * 右手伸进百宝袋掏东西，身体前倾，头低下看口袋
 */
export class SearchPocket extends AnimationBase {
  constructor() {
    super('SearchPocket', 2.0);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    if (!rArm || !lArm) return;

    const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
    const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

    // 右手伸进肚子口袋（向下前方伸）
    const reachPhase = Math.min(1, t * 2); // 0.5s 内伸进去
    rArm.rotation.z = rBaseZ + reachPhase * 1.2; // 向外张开
    rArm.rotation.x = -0.5 * reachPhase; // 向前伸

    // 左手辅助拉开口袋
    lArm.rotation.z = lBaseZ - 0.3 * reachPhase;
    lArm.rotation.x = -0.2 * reachPhase;

    // 身体前倾低头看口袋
    character.mesh.rotation.x = 0.15 * reachPhase;

    // 头部低头看口袋
    if (character.headGroup) {
      character.headGroup.rotation.x = 0.3 * reachPhase;
      // 左右张望（找东西）
      if (t > 0.5) {
        character.headGroup.rotation.y = Math.sin((t - 0.5) * Math.PI * 4) * 0.15;
      }
    }

    // 身体轻微焦急抖动
    if (t > 0.3) {
      const baseY = character.baseY || 0;
      character.mesh.position.y = baseY + Math.sin(t * Math.PI * 8) * 0.015;
    }
  }
}
