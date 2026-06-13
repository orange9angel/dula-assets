import { AnimationBase } from 'dula-engine';

/**
 * Chat — 无声闲聊口型动画
 * 让角色的嘴巴周期性开合，模拟正在小声说话/聊天的效果。
 * 没有实际音频，仅用于背景角色的视觉活跃。
 *
 * Tags:
 *   requires: [mouth]
 *   suits: [humanoid, monster, round, tiny]
 *   note: 无声 lip-sync，适合采访场景的背景角色
 */
export class Chat extends AnimationBase {
  constructor() {
    super('Chat', 1.0);
    this.usePoseMatrix = false;
    this.tags = {
      requires: [],
      suits: ['humanoid', 'monster', 'round', 'tiny'],
      notSuits: [],
      minHeight: 0.3,
      maxHeight: 4.0,
    };
  }

  update(t, character) {
    if (!character.mouth) return;

    // 使用不规则的正弦波组合模拟自然闲聊口型
    const time = t * Math.PI * 2;
    const factor = Math.abs(Math.sin(time * 3)) * 0.6 + Math.abs(Math.sin(time * 5.7)) * 0.3 + 0.1;

    // 嘴巴垂直方向的开合（模拟说话）
    const scaleY = 1.0 + factor * 0.5;
    const scaleX = 1.0 + factor * 0.15;

    character.mouth.scale.y = (character.mouthBaseScaleY || 1) * scaleY;
    character.mouth.scale.x = (character.mouthBaseScaleX || 1) * scaleX;
  }
}
