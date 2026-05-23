import { VoiceBase } from 'dula-engine';

/**
 * Kuwabara Voice —— 桑原和真配音
 * 热血、豪爽、大嗓门，语速快，音调偏高，音量更大
 */
export default new VoiceBase({
  name: 'Kuwabara',
  voice: 'zh-CN-YunxiNeural', // 少年音，热血豪爽
  rate: '+10%',
  pitch: '+5Hz',
  volume: '+10%',
});
