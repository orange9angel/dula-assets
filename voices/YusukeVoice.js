import { VoiceBase } from 'dula-engine';

/**
 * Yusuke Urameshi Voice —— 浦饭幽助配音
 * 不良少年，略带痞气的英雄音，语速稍快，音调偏低
 */
export default new VoiceBase({
  name: 'Yusuke',
  voice: 'zh-CN-YunxiNeural', // 少年音，带点痞气
  rate: '+5%',
  pitch: '-5Hz',
  volume: '0%',
});
