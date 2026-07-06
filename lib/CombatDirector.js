import * as THREE from 'three';
import { AnimationRegistry, CameraMoveRegistry } from 'dula-engine';
import { ProjectileSystem } from 'dula-engine';
import { SpiritGunProjectile } from '../projectiles/SpiritGunProjectile.js';
import { LaserBeam, TracerTrail } from 'dula-engine/lib/LaserBeam.js';
import { HitExplosion, Shockwave, ScreenFlash } from 'dula-engine/lib/HitExplosion.js';
import { AudioSyncScheduler } from 'dula-engine/lib/AudioSyncScheduler.js';

function canCharacterUseAnimation(character, animName) {
  return !character?.canPlayAnimationName || character.canPlayAnimationName(animName);
}

/**
 * 把 weapon 输入归一化成对象。
 */
function normalizeWeapon(weapon) {
  if (!weapon) return null;
  if (typeof weapon === 'string') {
    return { show: weapon, attach: 'rightHand', hide: true, hideAfter: 0 };
  }
  return {
    show: weapon.show || null,
    attach: weapon.attach || 'rightHand',
    hide: weapon.hide !== false,
    hideAfter: weapon.hideAfter || 0,
  };
}

/**
 * CombatDirector —— 格斗战斗导演
 *
 * 职责：
 * 1. 管理战斗轴线（Battle Line）：确保双方始终侧向相对（左右站位）
 * 2. 编排招式序列（Combo Sequencer）：自动衔接攻击→命中→受击→恢复
 * 3. 命中判定与同步（Hit Sync）：在正确时机触发 SFX + Hitstop + 受击动画
 * 4. 摄像机导演（Fight Camera）：低角度侧拍、冲击特写
 *
 * 设计原则：Storyboard 负责"时间线"，CombatDirector 负责"格斗逻辑"。
 */

// 预定义的格斗连段模板（KOF97 风格）
// camera 字段支持: 'FightSide' | 'FightImpact' | 'FightWide' | 'FightDramatic' | 'FightFollow'
export const COMBO_TEMPLATES = {
  // ========== 基础连段 ==========
  // 轻拳→轻拳→重拳
  jab_cross_hook: [
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'ComboPunch', hitFrame: 0.9, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 前冲→重拳
  dash_punch: [
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
  ],
  // 三连踢
  triple_kick: [
    { anim: 'Kick', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Kick', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'SpinKick', hitFrame: 0.4, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 上勾拳→跳击
  uppercut_jump: [
    { anim: 'Uppercut', hitFrame: 0.35, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.25, camera: 'FightDramatic' },
    { anim: 'JumpAttack', hitFrame: 0.5, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],

  // ========== 幽游白书专属 ==========
  // 灵剑斩
  spirit_sword_combo: [
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 灵丸
  spirit_gun: [
    { anim: 'SpiritGunCharge', hitFrame: null, camera: 'FightDramatic' },
    { anim: 'SpiritGunFire', hitFrame: 0.15, sfx: 'energy_blast', reaction: 'HitStagger', hitstop: 0.1, shake: 0.3, camera: 'FightImpact' },
  ],

  // ========== 防御/闪避 ==========
  block_counter: [
    { anim: 'Block', hitFrame: null, camera: 'FightSide' },
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
  ],
  dodge_counter: [
    { anim: 'Dodge', hitFrame: null, camera: 'FightFollow' },
    { anim: 'Kick', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
  ],

  // ========== 扩展连段 ==========
  // 重拳→上勾拳→跳击（高伤害连段）
  heavy_combo: [
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Uppercut', hitFrame: 0.35, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.25, camera: 'FightDramatic' },
    { anim: 'JumpAttack', hitFrame: 0.5, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 前冲→回旋踢（突进连段）
  dash_spinkick: [
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'SpinKick', hitFrame: 0.4, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 滑步侧闪→反手拳（出其不意）
  weave_backfist: [
    { anim: 'WeaveStep', hitFrame: null, camera: 'FightFollow' },
    { anim: 'BackFist', hitFrame: 0.22, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.08, shake: 0.22, camera: 'FightImpact' },
  ],
  // 龙卷旋风脚（经典对空/突进）
  hurricane_kick: [
    { anim: 'HurricaneKick', hitFrame: 0.42, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.4, camera: 'FightImpact' },
  ],
  // 升龙拳（对空反击）
  dragon_punch: [
    { anim: 'DragonPunch', hitFrame: 0.28, sfx: 'punch_heavy', reaction: 'Knockdown', hitstop: 0.14, shake: 0.42, camera: 'FightDramatic' },
  ],
  // 反击架势→扫堂腿（下段攻击）
  counter_sweep: [
    { anim: 'CounterStance', hitFrame: null, camera: 'FightSide' },
    { anim: 'SweepKick', hitFrame: 0.32, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 膝击（近身投技风格）
  knee_strike: [
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'KneeStrike', hitFrame: 0.22, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.1, shake: 0.28, camera: 'FightImpact' },
  ],
  // 拳击步伐→街机回旋踢（读招后反打）
  guard_spin_counter: [
    { anim: 'BoxerGuardHop', hitFrame: null, camera: 'FightFollow' },
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'ArcadeSpinKick', hitFrame: 0.56, sfx: 'spin_kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.4, camera: 'FightImpact' },
  ],
  // 单发街机回旋踢
  arcade_spinkick: [
    { anim: 'ArcadeSpinKick', hitFrame: 0.56, sfx: 'spin_kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.4, camera: 'FightImpact' },
  ],
  // 起跳飞踢（单发强打击）
  flying_kick: [
    { anim: 'JumpFlyingKick', hitFrame: 0.82, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.38, camera: 'FightImpact' },
  ],
  // 空中龙卷旋风脚（街霸经典对空连击）
  air_tatsumaki: [
    { anim: 'AirTatsumaki', hitFrame: 0.38, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.42, camera: 'FightImpact' },
  ],
  // 轻拳→轻拳→前踢→重拳（经典4连段）
  classic_4hit: [
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Punch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Kick', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'ComboPunch', hitFrame: 0.9, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 灵剑斩×3（桑原终极连段）
  spirit_sword_3x: [
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'SpiritSwordSwing', hitFrame: 0.3, sfx: 'sword_slash', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 灵丸连射（幽助快速射击）
  spirit_gun_rapid: [
    { anim: 'SpiritGunFire', hitFrame: 0.15, sfx: 'energy_blast', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'SpiritGunFire', hitFrame: 0.15, sfx: 'energy_blast', reaction: 'HitStagger', hitstop: 0.08, shake: 0.2, camera: 'FightImpact' },
    { anim: 'SpiritGunFire', hitFrame: 0.15, sfx: 'energy_blast', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // === 新增KOF97风格动作 ===
  // 战斧劈腿（ overhead 重击）
  axe_kick_combo: [
    { anim: 'AxeKick', hitFrame: 0.45, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.42, camera: 'FightImpact' },
  ],
  // 飞膝撞（突进投技风格）
  flying_knee_combo: [
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'FlyingKnee', hitFrame: 0.3, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.38, camera: 'FightImpact' },
  ],
  // 旋风脚（红丸式旋转多段）
  tatsumaki_combo: [
    { anim: 'TatsumakiSenpuuKyaku', hitFrame: 0.4, sfx: 'spin_kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.45, camera: 'FightImpact' },
  ],
  // 腾空下砸（摔角风格）
  ground_slam_combo: [
    { anim: 'GroundSlam', hitFrame: 0.55, sfx: 'impact_thud', reaction: 'Knockdown', hitstop: 0.16, shake: 0.5, camera: 'FightDramatic' },
  ],
  // 高空斜踢（跳到3人高度斜下踢）
  skydive_combo: [
    { anim: 'SkyDiveKick', hitFrame: 0.5, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.45, camera: 'FightDramatic' },
  ],
  // 地上滚3圈再出拳（搞笑+实用）
  roll_punch_combo: [
    { anim: 'RollPunch', hitFrame: 0.75, sfx: 'punch_heavy', reaction: 'Knockdown', hitstop: 0.14, shake: 0.4, camera: 'FightImpact' },
  ],
  // 踩头（巴洛克式）
  head_stomp_combo: [
    { anim: 'HeadStomp', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.42, camera: 'FightImpact' },
  ],
  // 飞膝砸（摔角）
  knee_drop_combo: [
    { anim: 'KneeDrop', hitFrame: 0.55, sfx: 'impact_thud', reaction: 'Knockdown', hitstop: 0.16, shake: 0.48, camera: 'FightDramatic' },
  ],
  // 滚雷（拉尔夫式连续翻滚）
  rolling_thunder_combo: [
    { anim: 'RollingThunder', hitFrame: 0.5, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.45, camera: 'FightFollow' },
  ],
  // 银河旋风（克拉克式旋转投掷）
  galaxy_whirl_combo: [
    { anim: 'GalaxyWhirl', hitFrame: 0.6, sfx: 'impact_thud', reaction: 'Knockdown', hitstop: 0.16, shake: 0.5, camera: 'FightDramatic' },
  ],
  // 闪电球（红丸式雷电）
  blitz_ball_combo: [
    { anim: 'BlitzBall', hitFrame: 0.35, sfx: 'energy_blast', reaction: 'HitStagger', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 灭族切割（卢卡尔式上切）
  genocide_cutter_combo: [
    { anim: 'GenocideCutter', hitFrame: 0.35, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.14, shake: 0.45, camera: 'FightDramatic' },
  ],
  // 组合拳→上勾拳（近身压制）
  pressure_combo:[
    { anim: 'ComboPunch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'HitStagger', hitstop: 0.06, shake: 0.15, camera: 'FightImpact' },
    { anim: 'Uppercut', hitFrame: 0.35, sfx: 'punch_hit', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightDramatic' },
  ],
  // 闪避→前冲→回旋踢（机动连段）
  mobility_combo: [
    { anim: 'Dodge', hitFrame: null, camera: 'FightFollow' },
    { anim: 'DashForward', hitFrame: null, camera: 'FightFollow' },
    { anim: 'SpinKick', hitFrame: 0.4, sfx: 'kick_impact', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
  // 防御→闪避→反击（完美防御连段）
  perfect_defense: [
    { anim: 'Block', hitFrame: null, camera: 'FightSide' },
    { anim: 'Dodge', hitFrame: null, camera: 'FightFollow' },
    { anim: 'ComboPunch', hitFrame: 0.25, sfx: 'punch_hit', reaction: 'Knockdown', hitstop: 0.12, shake: 0.35, camera: 'FightImpact' },
  ],
};

// 各动画的命中帧数据（相对于动画开始的时间，秒）
export const ATTACK_HIT_FRAMES = {
  Punch: 0.25,
  LeftPunch: 0.22,
  RightPunch: 0.22,
  LeftRightPunchCombo: 0.20,
  ComboPunch: 0.25, // 第一hit
  Kick: 0.35,
  Uppercut: 0.35,
  SpinKick: 0.4,
  ArcadeSpinKick: 0.56,
  JumpAttack: 0.5,
  JumpFlyingKick: 0.82,
  DashForward: null, // 无命中，纯位移
  BoxerGuardHop: null,
  SpiritSwordSwing: 0.3,
  SpiritGunFire: 0.15,
  Block: null,
  Dodge: null,
  FightingStance: null,
  WeaveStep: null,
  AirTatsumaki: 0.38,
  HurricaneKick: 0.42,
  DragonPunch: 0.28,
  BackFist: 0.22,
  CounterStance: null,
  SweepKick: 0.32,
  KneeStrike: 0.22,
  AxeKick: 0.45,
  FlyingKnee: 0.3,
  TatsumakiSenpuuKyaku: 0.4,
  GroundSlam: 0.55,
  SkyDiveKick: 0.5,
  RollPunch: 0.75,
  HeadStomp: 0.35,
  KneeDrop: 0.55,
  RollingThunder: 0.5,
  GalaxyWhirl: 0.6,
  BlitzBall: 0.35,
  GenocideCutter: 0.35,
};

// 各动画的默认受击反应
export const DEFAULT_REACTIONS = {
  Punch: 'HitStagger',
  LeftPunch: 'HitStagger',
  RightPunch: 'HitStagger',
  LeftRightPunchCombo: 'HitStagger',
  ComboPunch: 'HitStagger',
  Kick: 'HitStagger',
  Uppercut: 'HitStagger',
  SpinKick: 'Knockdown',
  ArcadeSpinKick: 'Knockdown',
  JumpAttack: 'Knockdown',
  JumpFlyingKick: 'Knockdown',
  HurricaneKick: 'Knockdown',
  DragonPunch: 'Knockdown',
  BackFist: 'HitStagger',
  AirTatsumaki: 'Knockdown',
  SweepKick: 'Knockdown',
  KneeStrike: 'HitStagger',
  AxeKick: 'Knockdown',
  FlyingKnee: 'Knockdown',
  TatsumakiSenpuuKyaku: 'Knockdown',
  GroundSlam: 'Knockdown',
  SkyDiveKick: 'Knockdown',
  RollPunch: 'Knockdown',
  HeadStomp: 'Knockdown',
  KneeDrop: 'Knockdown',
  RollingThunder: 'Knockdown',
  GalaxyWhirl: 'Knockdown',
  BlitzBall: 'HitStagger',
  GenocideCutter: 'Knockdown',
  SpiritSwordSwing: 'HitStagger',
  SpiritGunFire: 'HitStagger',
};

// 各动画的默认 SFX
export const DEFAULT_SFX = {
  Punch: 'punch_hit',
  LeftPunch: 'punch_hit',
  RightPunch: 'punch_hit',
  LeftRightPunchCombo: 'punch_hit',
  ComboPunch: 'punch_hit',
  Kick: 'kick_impact',
  Uppercut: 'punch_hit',
  SpinKick: 'kick_impact',
  ArcadeSpinKick: 'spin_kick_impact',
  JumpAttack: 'kick_impact',
  JumpFlyingKick: 'kick_impact',
  DashForward: 'dash_whoosh',
  BoxerGuardHop: 'guard_hop',
  WeaveStep: 'dash_whoosh',
  HurricaneKick: 'kick_impact',
  DragonPunch: 'punch_heavy',
  BackFist: 'punch_hit',
  CounterStance: 'guard_hop',
  AirTatsumaki: 'kick_impact',
  SweepKick: 'kick_impact',
  KneeStrike: 'kick_impact',
  AxeKick: 'kick_impact',
  FlyingKnee: 'kick_impact',
  TatsumakiSenpuuKyaku: 'spin_kick_impact',
  GroundSlam: 'impact_thud',
  SkyDiveKick: 'kick_impact',
  RollPunch: 'punch_heavy',
  HeadStomp: 'kick_impact',
  KneeDrop: 'impact_thud',
  RollingThunder: 'kick_impact',
  GalaxyWhirl: 'impact_thud',
  BlitzBall: 'energy_blast',
  GenocideCutter: 'kick_impact',
  SpiritSwordSwing: 'sword_slash',
  SpiritGunFire: 'energy_blast',
  Block: 'impact_thud',
  Dodge: 'dash_whoosh',
};

export const ATTACK_PROFILES = {
  Punch: { type: 'melee', range: 1.05, impactHeight: 1.15, hitRadius: 0.35 },
  LeftPunch: { type: 'melee', range: 1.1, impactHeight: 1.2, hitRadius: 0.35 },
  RightPunch: { type: 'melee', range: 1.1, impactHeight: 1.2, hitRadius: 0.35 },
  LeftRightPunchCombo: { type: 'melee', range: 1.1, impactHeight: 1.2, hitRadius: 0.4 },
  ComboPunch: { type: 'melee', range: 1.05, impactHeight: 1.15, hitRadius: 0.4 },
  Kick: { type: 'melee', range: 1.25, impactHeight: 1.05, hitRadius: 0.4 },
  Uppercut: { type: 'melee', range: 0.95, impactHeight: 1.25, hitRadius: 0.35 },
  SpinKick: { type: 'melee', range: 1.35, impactHeight: 1.15, hitRadius: 0.45 },
  ArcadeSpinKick: { type: 'melee', range: 1.58, impactHeight: 1.28, hitRadius: 0.52 },
  JumpAttack: { type: 'melee', range: 1.25, impactHeight: 1.35, hitRadius: 0.45 },
  JumpFlyingKick: { type: 'melee', range: 1.65, impactHeight: 1.55, hitRadius: 0.54 },
  HurricaneKick: { type: 'melee', range: 1.75, impactHeight: 1.35, hitRadius: 0.55 },
  DragonPunch: { type: 'melee', range: 1.15, impactHeight: 1.45, hitRadius: 0.4 },
  BackFist: { type: 'melee', range: 1.35, impactHeight: 1.2, hitRadius: 0.42 },
  SweepKick: { type: 'melee', range: 1.45, impactHeight: 0.55, hitRadius: 0.5 },
  KneeStrike: { type: 'melee', range: 0.95, impactHeight: 1.05, hitRadius: 0.35 },
  AirTatsumaki: { type: 'melee', range: 1.85, impactHeight: 1.45, hitRadius: 0.58 },
  AxeKick: { type: 'melee', range: 1.35, impactHeight: 1.55, hitRadius: 0.45 },
  FlyingKnee: { type: 'melee', range: 1.25, impactHeight: 1.15, hitRadius: 0.4 },
  TatsumakiSenpuuKyaku: { type: 'melee', range: 1.95, impactHeight: 1.35, hitRadius: 0.55 },
  GroundSlam: { type: 'melee', range: 1.15, impactHeight: 0.85, hitRadius: 0.5 },
  SkyDiveKick: { type: 'melee', range: 1.75, impactHeight: 1.45, hitRadius: 0.52 },
  RollPunch: { type: 'melee', range: 1.05, impactHeight: 0.85, hitRadius: 0.4 },
  HeadStomp: { type: 'melee', range: 1.15, impactHeight: 1.25, hitRadius: 0.45 },
  KneeDrop: { type: 'melee', range: 1.05, impactHeight: 0.75, hitRadius: 0.42 },
  RollingThunder: { type: 'melee', range: 2.25, impactHeight: 0.85, hitRadius: 0.55 },
  GalaxyWhirl: { type: 'melee', range: 1.35, impactHeight: 1.15, hitRadius: 0.48 },
  BlitzBall: { type: 'projectile', range: 8, impactHeight: 1.1, hitRadius: 0.45, volume: 'energyBlast', projectileRadius: 0.2, speed: 18 },
  GenocideCutter: { type: 'melee', range: 1.65, impactHeight: 1.55, hitRadius: 0.5 },
  SpiritSwordSwing: { type: 'melee', range: 2.05, impactHeight: 1.25, hitRadius: 0.55, volume: 'spiritSword' },
  SpiritGunFire: { type: 'projectile', range: 12, impactHeight: 1.1, hitRadius: 0.45, volume: 'spiritGun', projectileRadius: 0.25, speed: 25 },
  CrouchPlasmaRifle: { type: 'projectile', range: 12, impactHeight: 0.85, hitRadius: 0.45, volume: 'spiritGun', projectileRadius: 0.25, speed: 25 },
};

export class CombatDirector {
  constructor(storyboard) {
    this.sb = storyboard;
    this.fighters = new Map(); // name -> { side: 'left'|'right', opponent: name }
    this.battleLine = new THREE.Vector3(1, 0, 0); // X轴为战斗方向
    this.combos = []; // 已编排的连段
    this.hitEvents = []; // 预计算的命中事件
    this.contactApproaches = []; // runtime contact solvers before melee hit frames
    this.cameraOverrides = []; // { startTime, endTime, cameraType, options }
    this.autoCameraEnabled = true; // 是否自动安排格斗相机
    this.projectileSystem = new ProjectileSystem(); // 弹道系统
    this.worldEffects = []; // hit sparks and contact effects in world space
    this.weaponEvents = []; // weapon show/hide events during combos
    this.activeEffects = []; // LaserBeam, HitExplosion, Shockwave 等活跃效果
    this.audioSync = new AudioSyncScheduler(); // 音画同步调度器
  }

  /**
   * 设置相机覆盖（编剧手动 Camera 标签优先）
   */
  setCameraOverride(startTime, endTime, cameraType, options = {}) {
    this.cameraOverrides.push({ startTime, endTime, cameraType, options });
  }

  /**
   * 检查指定时间是否有相机覆盖
   */
  _hasCameraOverride(t, duration) {
    for (const ov of this.cameraOverrides) {
      if (t < ov.endTime && t + duration > ov.startTime) {
        return true;
      }
    }
    return false;
  }

  /**
   * 初始化战斗站位
   * @param {string} charA - 左侧角色
   * @param {string} charB - 右侧角色
   * @param {number} centerX - 战斗中心X坐标
   * @param {number} centerZ - 战斗中心Z坐标
   * @param {number} distance - 双方初始距离（默认4）
   */
  setupBattleLine(charA, charB, centerX = 0, centerZ = 0, distance = 4) {
    const charAObj = this.sb.characters.get(charA);
    const charBObj = this.sb.characters.get(charB);
    if (!charAObj || !charBObj) {
      console.warn(`[CombatDirector] Characters not found: ${charA}, ${charB}`);
      return;
    }

    // A在左（-X），面向右（+X）
    charAObj.setPosition(centerX - distance / 2, 0.01, centerZ);
    charAObj.mesh.rotation.y = Math.PI / 2;
    if (!charAObj.mesh.userData) charAObj.mesh.userData = {};
    charAObj.userData = charAObj.mesh.userData;
    charAObj.mesh.userData.facingDir = 1;
    charAObj.mesh.userData.inCombat = true;
    charAObj.mesh.userData.combatSide = 'left';

    // B在右（+X），面向左（-X）
    charBObj.setPosition(centerX + distance / 2, 0.01, centerZ);
    charBObj.mesh.rotation.y = -Math.PI / 2;
    if (!charBObj.mesh.userData) charBObj.mesh.userData = {};
    charBObj.userData = charBObj.mesh.userData;
    charBObj.mesh.userData.facingDir = -1;
    charBObj.mesh.userData.inCombat = true;
    charBObj.mesh.userData.combatSide = 'right';

    this.fighters.set(charA, { side: 'left', opponent: charB });
    this.fighters.set(charB, { side: 'right', opponent: charA });

    // Enter fighting stance immediately (set arm rotation directly)
    // Arm model: lookAt + rotateX(-PI/2)
    // rotation.x < 0 = arm forward/up (punch direction)
    // rotation.x > 0 = arm backward
    // rotation.z controls side spread
    const setBoxingStance = (char) => {
      if (char.rightArm) {
        // Right hand up guarding face, close to body
        char.rightArm.rotation.z = (char.rightArmBaseZ || 0) - 0.1;
        char.rightArm.rotation.x = -0.9; // forward/up toward face
      }
      if (char.leftArm) {
        // Left hand up guarding face, close to body
        char.leftArm.rotation.z = (char.leftArmBaseZ || 0) + 0.1;
        char.leftArm.rotation.x = -0.8; // forward/up toward face
      }
      // Legs: boxing stance - one foot forward, one back
      if (char.rightLeg) char.rightLeg.rotation.x = -0.15; // right foot back
      if (char.leftLeg) char.leftLeg.rotation.x = 0.15;   // left foot forward
    };
    setBoxingStance(charAObj);
    setBoxingStance(charBObj);

    console.log(`[CombatDirector] Battle line set: ${charA}(left) vs ${charB}(right) at x=${centerX}, z=${centerZ}`);
  }

  /**
   * 获取角色面向方向（1=右，-1=左）
   */
  getFacingDir(characterName) {
    const char = this.sb.characters.get(characterName);
    if (!char) return 1;
    return char.userData?.facingDir ?? char.mesh?.userData?.facingDir ?? 1;
  }

  /**
   * 获取角色的对手
   */
  getOpponent(characterName) {
    const info = this.fighters.get(characterName);
    return info ? info.opponent : null;
  }

  /**
   * 编排一段连击
   * @param {string} attacker - 攻击者名字
   * @param {string} defender - 防御者名字
   * @param {string|Array} sequence - 连段模板名或自定义数组
   * @param {number} startTime - 开始时间
   * @returns {number} 连段总时长
   */
  scheduleCombo(attacker, defender, sequence, startTime, options = {}) {
    const moves = typeof sequence === 'string' ? COMBO_TEMPLATES[sequence] : sequence;
    if (!moves || moves.length === 0) {
      console.warn(`[CombatDirector] Unknown combo sequence: ${sequence}`);
      return 0;
    }

    const attackerChar = this.sb.characters.get(attacker);
    const defenderChar = this.sb.characters.get(defender);
    if (!attackerChar || !defenderChar) {
      console.warn(`[CombatDirector] Characters not found for combo`);
      return 0;
    }

    let t = startTime;
    let totalDuration = 0;

    for (const move of moves) {
      const AnimClass = AnimationRegistry[move.anim];
      if (!AnimClass) {
        console.warn(`[CombatDirector] Animation not found: ${move.anim}`);
        continue;
      }
      if (!canCharacterUseAnimation(attackerChar, move.anim)) {
        console.warn(`[CombatDirector] ${attacker} cannot use "${move.anim}"; skipped.`);
        continue;
      }

      const inst = new AnimClass();
      const animDuration = inst.duration;
      const hitFrame = move.hitFrame !== undefined ? move.hitFrame : ATTACK_HIT_FRAMES[move.anim];
      const hitTime = hitFrame !== null && hitFrame !== undefined ? t + hitFrame : null;
      const profile = this._getAttackProfile(move.anim, move);

      if (hitTime !== null && profile.type === 'melee') {
        this._scheduleContactApproach(attackerChar, defenderChar, attacker, defender, profile, t, hitTime);
      }

      // 播放攻击动画
      attackerChar.playAnimation(AnimClass, t);

      // 自动安排格斗相机（除非被覆盖或全局禁用）
      if (this.autoCameraEnabled && !this._hasCameraOverride(t, animDuration)) {
        const cameraType = move.camera || this._getDefaultCamera(move.anim);
        if (cameraType && this.sb.playCameraMove) {
          const CameraClass = this._getCameraClass(cameraType);
          if (CameraClass) {
            const camOptions = this._buildCameraOptions(cameraType, attacker, defender, move);
            this.sb.playCameraMove(CameraClass, t, animDuration, camOptions);
          }
        }
      }

      // 记录命中事件
      if (hitFrame !== null && hitFrame !== undefined) {
        this.hitEvents.push({
          time: hitTime,
          attacker,
          defender,
          anim: move.anim,
          sfx: move.sfx || DEFAULT_SFX[move.anim],
          reaction: move.reaction || DEFAULT_REACTIONS[move.anim] || 'HitStagger',
          hitstop: move.hitstop || 0.08,
          shake: move.shake || 0.2,
          profile,
          hitPoint: null,
          preContactDistance: null,
          preContactGap: null,
          contactDistance: null,
          contactGap: null,
          hitVolume: null,
          visualHitVolume: null,
          projectilePath: null,
          projectileFired: false,
          correctedAtHit: false,
          triggered: false,
        });
      }

      // 武器显示/隐藏事件
      const weaponConfig = normalizeWeapon(move.weapon);
      if (weaponConfig) {
        if (weaponConfig.show) {
          this.weaponEvents.push({
            time: t,
            type: 'show',
            character: attacker,
            config: weaponConfig,
            triggered: false,
          });
        }
        if (weaponConfig.hide) {
          this.weaponEvents.push({
            time: t + animDuration + weaponConfig.hideAfter,
            type: 'hide',
            character: attacker,
            triggered: false,
          });
        }
      }

      t += animDuration;
      totalDuration += animDuration;
    }

    // 连段结束后自动进入 FightingStance（或组件指定的 idleAction）
    const FightingStance = AnimationRegistry['FightingStance'];
    if (FightingStance) {
      const idleAction = options.idleAction || 'FightingStance';
      const IdleClass = AnimationRegistry[idleAction] || FightingStance;
      attackerChar.playAnimation(IdleClass, t);
    }

    const sequenceLabel = typeof sequence === 'string' ? sequence : moves.map(m => m.anim).join(', ');
    console.log(`[CombatDirector] Scheduled combo "${sequenceLabel}" for ${attacker} vs ${defender}, start=${startTime.toFixed(2)}s, duration=${totalDuration.toFixed(2)}s`);
    return totalDuration;
  }

  /**
   * 编排单个攻击动作（带自动命中）
   */
  scheduleAttack(attacker, defender, animName, startTime, options = {}) {
    const AnimClass = AnimationRegistry[animName];
    if (!AnimClass) {
      console.warn(`[CombatDirector] Animation not found: ${animName}`);
      return 0;
    }

    const attackerChar = this.sb.characters.get(attacker);
    if (!attackerChar) {
      console.warn(`[CombatDirector] Attacker not found: ${attacker}`);
      return 0;
    }
    if (!canCharacterUseAnimation(attackerChar, animName)) {
      console.warn(`[CombatDirector] ${attacker} cannot use "${animName}"; skipped.`);
      return 0;
    }

    const inst = new AnimClass(options);
    const optionDuration = Number(options.duration);
    const animDuration = Number.isFinite(optionDuration) && optionDuration > 0 ? optionDuration : inst.duration;
    const hitFrame = options.hitFrame !== undefined ? options.hitFrame : ATTACK_HIT_FRAMES[animName];
    const hitTime = hitFrame !== null && hitFrame !== undefined ? startTime + hitFrame : null;
    const profile = this._getAttackProfile(animName, options);
    const defenderChar = this.sb.characters.get(defender);
    if (hitTime !== null && profile.type === 'melee' && defenderChar) {
      this._scheduleContactApproach(attackerChar, defenderChar, attacker, defender, profile, startTime, hitTime);
    }

    attackerChar.playAnimation(AnimClass, startTime, animDuration, options);

    // 武器显示/隐藏事件
    const weaponConfig = normalizeWeapon(options.weapon);
    if (weaponConfig) {
      if (weaponConfig.show) {
        this.weaponEvents.push({
          time: startTime,
          type: 'show',
          character: attacker,
          config: weaponConfig,
          triggered: false,
        });
      }
      if (weaponConfig.hide) {
        this.weaponEvents.push({
          time: startTime + animDuration + weaponConfig.hideAfter,
          type: 'hide',
          character: attacker,
          triggered: false,
        });
      }
    }

    // 自动命中
    if (hitFrame !== null && hitFrame !== undefined) {
      this.hitEvents.push({
        time: hitTime,
        attacker,
        defender,
        anim: animName,
        sfx: options.sfx || DEFAULT_SFX[animName],
        reaction: options.reaction || DEFAULT_REACTIONS[animName] || 'HitStagger',
        hitstop: options.hitstop || 0.08,
        shake: options.shake || 0.2,
        profile,
        hitPoint: null,
        preContactDistance: null,
        preContactGap: null,
        contactDistance: null,
        contactGap: null,
        hitVolume: null,
        visualHitVolume: null,
        projectilePath: null,
        projectileFired: false,
        correctedAtHit: false,
        triggered: false,
      });
    }

    // 攻击结束后自动进入 FightingStance
    const FightingStance = AnimationRegistry['FightingStance'];
    if (FightingStance && !options.noStance) {
      // 如果指定了 idleAction，则使用该动作代替 FightingStance
      const idleAction = options.idleAction || 'FightingStance';
      const IdleClass = AnimationRegistry[idleAction] || FightingStance;
      attackerChar.playAnimation(IdleClass, startTime + animDuration);
    }

    return animDuration;
  }

  /**
   * 编排受击反应（手动触发）
   */
  scheduleReaction(characterName, reactionAnim, startTime, options = {}) {
    const char = this.sb.characters.get(characterName);
    if (!char) return;

    const AnimClass = AnimationRegistry[reactionAnim];
    if (!AnimClass) return;

    char.playAnimation(AnimClass, startTime);

    // 受击结束后自动进入 FightingStance
    const inst = new AnimClass();
    const FightingStance = AnimationRegistry['FightingStance'];
    if (FightingStance && !options.noStance) {
      char.playAnimation(FightingStance, startTime + inst.duration);
    }
  }

  /**
   * 更新：检查并触发命中事件
   * 在 Storyboard.update() 中每帧调用
   */
  update(time) {
    this._updateContactApproaches(time);

    for (const ev of this.hitEvents) {
      if (ev.triggered) continue;
      if (time >= ev.time && time < ev.time + 0.05) {
        ev.triggered = true;
        this._triggerHit(ev, time);
      }
    }

    for (const ev of this.weaponEvents) {
      if (ev.triggered) continue;
      if (time >= ev.time && time < ev.time + 0.05) {
        ev.triggered = true;
        this._triggerWeaponEvent(ev);
      }
    }

    this._updateWorldEffects(time);
    this._updateActiveEffects(time);
  }

  /**
   * 内部：执行命中逻辑
   */
  _triggerHit(ev, currentTime) {
    const attacker = this.sb.characters.get(ev.attacker);
    const defender = this.sb.characters.get(ev.defender);
    if (!defender) return;

    ev.triggerTime = currentTime;
    const profile = ev.profile || this._getAttackProfile(ev.anim);
    const scene = this.sb.currentScene?.scene;
    const camera = (typeof window !== 'undefined' && window.__dulaCamera) ? window.__dulaCamera : null;

    if (attacker) {
      this._orientFighters(attacker, defender);

      if (profile.type === 'projectile') {
        this._fireSpiritGunProjectile(ev, attacker, defender, currentTime, profile);
      }

      const preContact = this._measureContact(attacker, defender, profile);
      ev.preContactDistance = preContact.distance;
      ev.preContactGap = preContact.gap;

      if (profile.type === 'melee' && preContact.gap > 0.35) {
        this._snapMeleeContact(attacker, defender, profile);
        ev.correctedAtHit = true;
      }

      const contact = this._measureContact(attacker, defender, profile);
      ev.contactDistance = contact.distance;
      ev.contactGap = contact.gap;
      const hitPoint = this._computeHitPoint(attacker, defender, profile);
      ev.hitPoint = hitPoint.toArray();
      ev.hitVolume = this._serializeVolume(contact.volume || preContact.volume || this._getAttackVolume(attacker, defender, profile));
      ev.visualHitVolume = this._serializeVolume(this._getVisualEffectVolume(attacker, profile));

      // ── 新特效系统 ──
      if (scene) {
        // 1. 弹道光束（projectile）
        if (profile.type === 'projectile') {
          const muzzlePos = attacker.getMuzzleWorldPosition?.() || this._getFallbackMuzzle(attacker, profile);
          const beam = new LaserBeam({
            start: muzzlePos,
            end: hitPoint,
            color: 0x00ff88,
            duration: 0.12,
            width: 0.03,
            glowWidth: 0.1,
          });
          beam.addTo(scene);
          this.activeEffects.push({ type: 'laserBeam', instance: beam, startTime: currentTime });
        }

        // 2. 命中爆炸
        const isProjectile = profile.type === 'projectile';
        const explosion = new HitExplosion({
          position: hitPoint,
          color: isProjectile ? 0x88ccff : 0xffaa33,
          coreColor: 0xffffff,
          duration: isProjectile ? 0.3 : 0.35,
          maxRadius: isProjectile ? 0.5 : 0.35,
          sparkCount: isProjectile ? 16 : 10,
        });
        explosion.addTo(scene);
        this.activeEffects.push({ type: 'explosion', instance: explosion, startTime: currentTime });

        // 3. 地面冲击波
        const shockwave = new Shockwave({
          position: hitPoint.clone().setY(0.02),
          color: isProjectile ? 0x66bbff : 0xffaa88,
          duration: 0.5,
          maxRadius: isProjectile ? 2.5 : 1.5,
        });
        shockwave.addTo(scene);
        this.activeEffects.push({ type: 'shockwave', instance: shockwave, startTime: currentTime });

        // 4. 屏幕白闪（强烈命中时）
        if (camera && ev.shake > 0.3) {
          const flash = new ScreenFlash({
            camera,
            color: isProjectile ? 0xaaccff : 0xffffff,
            duration: 0.06,
            intensity: Math.min(0.8, ev.shake * 1.2),
          });
          this.activeEffects.push({ type: 'screenFlash', instance: flash, startTime: currentTime });
        }
      }

      // 5. 旧火花效果（保留兼容）
      this._createWorldHitSpark(hitPoint, currentTime, ev);

      // 6. ── NEW: 触发夸张效果 ──
      this._triggerExaggeration(ev.attacker, ev.defender, profile, hitPoint);
    }

    // ── 音画同步记录 ──
    this.audioSync.schedule({
      time: currentTime,
      type: ev.sfx || DEFAULT_SFX[ev.anim] || 'hit',
      source: `${ev.attacker}->${ev.defender}:${ev.anim}`,
      volume: 1.0,
      params: {
        hitstop: ev.hitstop,
        shake: ev.shake,
        profile: profile.type,
      },
    });

    // 1. 播放受击动画
    const ReactionAnim = AnimationRegistry[ev.reaction];
    if (ReactionAnim) {
      defender.playAnimation(ReactionAnim, currentTime);

      // 受击结束后自动进入 FightingStance
      const inst = new ReactionAnim();
      const FightingStance = AnimationRegistry['FightingStance'];
      if (FightingStance) {
        defender.playAnimation(FightingStance, currentTime + inst.duration);
      }
    }

    // 2. 触发 Hitstop
    if (this.sb.hitstopManager && ev.hitstop > 0) {
      this.sb.hitstopManager.trigger(currentTime, ev.hitstop, ev.shake, true);
    }

    console.log(`[CombatDirector] HIT! ${ev.attacker} -> ${ev.defender} with ${ev.anim} at t=${currentTime.toFixed(3)}s`);
  }

  /**
   * 内部：触发武器显示/隐藏事件
   */
  _triggerWeaponEvent(ev) {
    const char = this.sb.characters.get(ev.character);
    if (!char) return;
    if (ev.type === 'show') {
      // 角色需提供 weaponMeshes 字典或 onWeaponShow 回调
      if (char.onWeaponShow) {
        char.onWeaponShow(ev.config);
      } else if (char.weaponMeshes && ev.config.show) {
        const mesh = char.weaponMeshes[ev.config.show];
        if (mesh) {
          char.showWeapon(mesh.clone(), ev.config.attach);
        } else {
          console.warn(`[CombatDirector] Weapon mesh not found: ${ev.config.show} for ${ev.character}`);
        }
      }
    } else if (ev.type === 'hide') {
      if (char.hideWeapon) char.hideWeapon();
    }
  }

  /**
   * 触发夸张效果（与 ExaggerationSystem 联动）
   */
  _triggerExaggeration(attacker, defender, profile, hitPoint) {
    const defenderChar = this.sb.characters.get(defender);
    if (defenderChar && defenderChar.exaggerationSystem) {
      defenderChar.exaggerationSystem.onHit(attacker, defender, profile, hitPoint);
    }
  }

  _getAttackProfile(animName, override = {}) {
    const base = ATTACK_PROFILES[animName] || { type: 'melee', range: 1.0, impactHeight: 1.1, hitRadius: 0.35 };
    return {
      ...base,
      range: override.range ?? base.range,
      impactHeight: override.impactHeight ?? base.impactHeight,
      hitRadius: override.hitRadius ?? base.hitRadius,
      projectileRadius: override.projectileRadius ?? base.projectileRadius,
      speed: override.speed ?? base.speed,
    };
  }

  _ensureSharedUserData(character) {
    if (!character?.mesh) return {};
    if (!character.mesh.userData) character.mesh.userData = {};
    character.userData = character.mesh.userData;
    return character.userData;
  }

  _orientFighters(attacker, defender) {
    if (!attacker?.mesh || !defender?.mesh) return;

    const dx = defender.mesh.position.x - attacker.mesh.position.x;
    const dz = defender.mesh.position.z - attacker.mesh.position.z;
    const attackerFacing = dx >= 0 ? 1 : -1;
    const defenderFacing = -attackerFacing;

    attacker.mesh.rotation.y = Math.atan2(dx, dz);
    defender.mesh.rotation.y = Math.atan2(-dx, -dz);

    // Head tracking: both fighters look at each other
    if (attacker.headGroup) {
      attacker.headGroup.rotation.y = 0;
      attacker.headGroup.rotation.x = 0.05; // slight downward tilt toward opponent
    }
    if (defender.headGroup) {
      defender.headGroup.rotation.y = 0;
      defender.headGroup.rotation.x = 0.05;
    }

    this._ensureSharedUserData(attacker).facingDir = attackerFacing;
    this._ensureSharedUserData(defender).facingDir = defenderFacing;
    this._ensureSharedUserData(attacker).inCombat = true;
    this._ensureSharedUserData(defender).inCombat = true;
  }

  _scheduleContactApproach(attackerChar, defenderChar, attackerName, defenderName, profile, startTime, hitTime) {
    if (!attackerChar?.mesh || !defenderChar?.mesh || hitTime <= startTime) return;

    this._orientFighters(attackerChar, defenderChar);

    const currentDistance = this._horizontalDistance(attackerChar.mesh.position, defenderChar.mesh.position);
    const needsApproach = currentDistance > profile.range + 0.15;
    const lateralGap = Math.abs(attackerChar.mesh.position.z - defenderChar.mesh.position.z);
    const needsLineup = lateralGap > 0.25;

    if (!needsApproach && !needsLineup) return;

    this._cancelOverlappingRootMoves(attackerChar, startTime, hitTime);

    this.contactApproaches.push({
      attacker: attackerName,
      defender: defenderName,
      profile,
      startTime,
      hitTime,
      arriveTime: Math.max(startTime, hitTime - (profile.contactHold ?? 0.12)),
      fromPos: null,
      done: false,
    });

    console.log(
      `[CombatDirector] Contact approach ${attackerName}->${defenderName}: ` +
      `dist=${currentDistance.toFixed(2)} range=${profile.range.toFixed(2)} ` +
      `t=${startTime.toFixed(2)}-${hitTime.toFixed(2)}`
    );
  }

  _updateContactApproaches(time) {
    for (const approach of this.contactApproaches) {
      if (approach.done || time < approach.startTime) continue;

      const attackerChar = this.sb.characters.get(approach.attacker);
      const defenderChar = this.sb.characters.get(approach.defender);
      if (!attackerChar?.mesh || !defenderChar?.mesh) {
        approach.done = true;
        continue;
      }

      if (!approach.fromPos) {
        approach.fromPos = attackerChar.mesh.position.clone();
        this._cancelOverlappingRootMoves(attackerChar, time, approach.hitTime);
      }

      const duration = Math.max(0.001, approach.arriveTime - approach.startTime);
      const raw = time >= approach.arriveTime
        ? 1
        : Math.max(0, Math.min(1, (time - approach.startTime) / duration));
      const ease = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;
      const target = this._computeMeleeStandPosition(attackerChar, defenderChar, approach.profile);

      attackerChar.mesh.position.x = approach.fromPos.x + (target.x - approach.fromPos.x) * ease;
      attackerChar.mesh.position.z = approach.fromPos.z + (target.z - approach.fromPos.z) * ease;

      this._orientFighters(attackerChar, defenderChar);

      if (time >= approach.hitTime) {
        approach.done = true;
      }
    }
  }

  _cancelOverlappingRootMoves(character, startTime, endTime) {
    if (!character?.moves) return;
    for (const move of character.moves) {
      if (move.completed) continue;
      if (move.endTime <= startTime || move.startTime >= endTime) continue;
      if (move.startTime < startTime && move.endTime > startTime) {
        move.endTime = startTime;
        move.completed = true;
      } else if (move.startTime >= startTime && move.startTime < endTime) {
        move.endTime = move.startTime;
        move.completed = true;
      }
    }
  }

  _computeMeleeStandPosition(attackerChar, defenderChar, profile) {
    const attackerPos = attackerChar.mesh.position;
    const defenderPos = defenderChar.mesh.position;
    const dir = new THREE.Vector3(
      defenderPos.x - attackerPos.x,
      0,
      defenderPos.z - attackerPos.z
    );
    if (dir.lengthSq() < 0.0001) {
      const facingDir = this.getFacingDir(attackerChar.name);
      dir.set(facingDir, 0, 0);
    }
    dir.normalize();
    return defenderPos.clone().addScaledVector(dir, -profile.range);
  }

  _snapMeleeContact(attackerChar, defenderChar, profile) {
    const target = this._computeMeleeStandPosition(attackerChar, defenderChar, profile);
    attackerChar.mesh.position.x = target.x;
    attackerChar.mesh.position.z = target.z;
    this._orientFighters(attackerChar, defenderChar);
  }

  _horizontalDistance(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  _measureContact(attackerChar, defenderChar, profile) {
    if (!attackerChar?.mesh || !defenderChar?.mesh) {
      return { distance: null, gap: null };
    }
    const volume = this._getAttackVolume(attackerChar, defenderChar, profile);
    if (volume) {
      return this._measureVolumeContact(volume, defenderChar, profile);
    }
    const distance = this._horizontalDistance(attackerChar.mesh.position, defenderChar.mesh.position);
    return {
      distance,
      gap: Math.max(0, distance - profile.range),
    };
  }

  _computeHitPoint(attackerChar, defenderChar, profile) {
    const volume = this._getAttackVolume(attackerChar, defenderChar, profile);
    if (volume) {
      const target = this._getHurtCenter(defenderChar, profile);
      const closest = this._closestPointOnSegment(target, volume.start, volume.end);
      if (profile.type === 'projectile') return target;
      return closest.lerp(target, 0.35);
    }

    if (profile.type === 'projectile') {
      const hitPoint = defenderChar.mesh.position.clone();
      hitPoint.y += profile.impactHeight ?? 1.1;
      return hitPoint;
    }

    const attackerPos = attackerChar.mesh.position.clone();
    const defenderPos = defenderChar.mesh.position.clone();
    attackerPos.y += profile.impactHeight ?? 1.1;
    defenderPos.y += profile.impactHeight ?? 1.1;
    return attackerPos.lerp(defenderPos, 0.65);
  }

  _getAttackVolume(attackerChar, defenderChar, profile) {
    if (!attackerChar?.mesh) return null;

    if (profile.volume === 'spiritSword') {
      return attackerChar.getSpiritSwordVolume?.() || null;
    }

    if (profile.volume === 'spiritGun') {
      const start = attackerChar.getSpiritGunMuzzleWorldPosition?.() || this._getFallbackMuzzle(attackerChar, profile);
      const end = this._getHurtCenter(defenderChar, profile);
      return {
        type: 'capsule',
        source: 'SpiritGunProjectilePath',
        start,
        end,
        radius: profile.projectileRadius ?? 0.25,
        length: start.distanceTo(end),
      };
    }

    return null;
  }

  _getVisualEffectVolume(attackerChar, profile) {
    if (!attackerChar?.mesh) return null;
    if (profile.volume === 'spiritGun') {
      return attackerChar.getSpiritGunBeamVolume?.() || null;
    }
    if (profile.volume === 'spiritSword') {
      return attackerChar.getSpiritSwordVolume?.() || null;
    }
    return null;
  }

  _measureVolumeContact(volume, defenderChar, profile) {
    if (!volume?.start || !volume?.end || !defenderChar?.mesh) {
      return { distance: null, gap: null, volume: null };
    }

    const center = this._getHurtCenter(defenderChar, profile);
    const closest = this._closestPointOnSegment(center, volume.start, volume.end);
    const distance = closest.distanceTo(center);
    const defenderRadius = defenderChar.boundingRadius ?? 0.5;
    const volumeRadius = volume.radius ?? profile.hitRadius ?? 0.35;

    return {
      distance,
      gap: Math.max(0, distance - defenderRadius - volumeRadius),
      volume,
    };
  }

  _closestPointOnSegment(point, start, end) {
    const segment = new THREE.Vector3().subVectors(end, start);
    const lenSq = segment.lengthSq();
    if (lenSq < 0.000001) return start.clone();

    const t = Math.max(0, Math.min(1, new THREE.Vector3().subVectors(point, start).dot(segment) / lenSq));
    return start.clone().addScaledVector(segment, t);
  }

  _getHurtCenter(character, profile) {
    const center = character.mesh.position.clone();
    center.y += profile.impactHeight ?? 1.1;
    return center;
  }

  _getFallbackMuzzle(character, profile) {
    const pos = character.mesh.position.clone();
    pos.y += profile.impactHeight ?? 1.1;
    return pos;
  }

  _serializeVolume(volume) {
    if (!volume) return null;
    return {
      type: volume.type || 'capsule',
      source: volume.source || null,
      start: volume.start?.toArray?.() || null,
      end: volume.end?.toArray?.() || null,
      radius: volume.radius ?? null,
      length: volume.length ?? (volume.start && volume.end ? volume.start.distanceTo(volume.end) : null),
    };
  }

  _createWorldHitSpark(hitPoint, startTime, ev) {
    const scene = this.sb.currentScene?.scene;
    if (!scene || !hitPoint) return;

    const isProjectile = ev.profile?.type === 'projectile';
    const group = new THREE.Group();
    group.name = `hitSpark_${ev.attacker}_${ev.defender}`;
    group.position.copy(hitPoint);

    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(isProjectile ? 0.24 : 0.18, 12, 12),
      new THREE.MeshBasicMaterial({
        color: isProjectile ? 0x88ccff : 0xffffff,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
    );
    group.add(flash);

    const sparkGeo = new THREE.CylinderGeometry(0.006, 0.002, 0.34, 4);
    for (let i = 0; i < 10; i++) {
      const spark = new THREE.Mesh(
        sparkGeo,
        new THREE.MeshBasicMaterial({
          color: isProjectile ? (i % 2 === 0 ? 0xd8f6ff : 0x66bbff) : (i % 2 === 0 ? 0xfff4aa : 0xffaa33),
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        })
      );
      const angle = (i / 10) * Math.PI * 2;
      spark.rotation.z = Math.PI / 2;
      spark.rotation.y = angle;
      spark.position.x = Math.cos(angle) * 0.05;
      spark.position.y = Math.sin(angle) * 0.05;
      spark.userData.angle = angle;
      group.add(spark);
    }

    scene.add(group);
    this.worldEffects.push({ group, startTime, duration: 0.22, flash });
  }

  _updateActiveEffects(time) {
    const delta = 0.016; // 假设 60fps
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      const done = effect.instance.update(delta);
      if (done) {
        this.activeEffects.splice(i, 1);
      }
    }
  }

  _updateWorldEffects(time) {
    const scene = this.sb.currentScene?.scene;
    if (!scene) return;

    for (let i = this.worldEffects.length - 1; i >= 0; i--) {
      const effect = this.worldEffects[i];
      const age = time - effect.startTime;
      if (age >= effect.duration) {
        scene.remove(effect.group);
        effect.group.traverse((obj) => {
          obj.geometry?.dispose?.();
          obj.material?.dispose?.();
        });
        this.worldEffects.splice(i, 1);
        continue;
      }

      const p = Math.max(0, age / effect.duration);
      const fade = 1 - p;
      effect.group.scale.setScalar(1 + p * 1.8);
      effect.group.traverse((obj) => {
        if (obj.material?.opacity !== undefined) {
          obj.material.opacity = fade * 0.9;
        }
      });
    }
  }

  _fireSpiritGunProjectile(ev, attackerChar, defenderChar, fireTime, profile) {
    if (ev.projectileFired || ev.anim !== 'SpiritGunFire' || !SpiritGunProjectile) return null;

    const fromPos = attackerChar.getSpiritGunMuzzleWorldPosition?.() || this._getFallbackMuzzle(attackerChar, profile);
    const toPos = this._getHurtCenter(defenderChar, profile);
    const projectile = new SpiritGunProjectile({
      startTime: fireTime,
      fromPos,
      toPos,
      attacker: ev.attacker,
      defender: ev.defender,
      speed: profile.speed ?? 25,
      onHit: (p, hitTime) => {
        ev.projectileHitTime = hitTime;
        ev.projectileImpactPoint = p.toPos.toArray();
      },
    });

    ev.projectileFired = true;
    ev.projectilePath = {
      start: fromPos.toArray(),
      end: toPos.toArray(),
      radius: profile.projectileRadius ?? 0.25,
      speed: projectile.speed,
      distance: projectile.distance,
      startTime: fireTime,
      endTime: projectile.endTime,
    };

    this.projectileSystem.fire(projectile, this.sb.currentScene?.scene);
    console.log(`[CombatDirector] SpiritGun projectile fired: ${ev.attacker} -> ${ev.defender} at t=${fireTime.toFixed(3)}s`);
    return projectile;
  }

  /**
   * 清理所有事件
   */
  clear() {
    // 清理夸张效果系统
    for (const [name, char] of this.sb.characters) {
      if (char.exaggerationSystem) {
        char.exaggerationSystem.clear();
      }
    }

    this.hitEvents = [];
    this.combos = [];
    this.contactApproaches = [];
    this.weaponEvents = [];
    this.fighters.clear();

    // 清理 worldEffects
    for (const effect of this.worldEffects) {
      this.sb.currentScene?.scene?.remove(effect.group);
    }
    this.worldEffects = [];

    // 清理 activeEffects（LaserBeam, HitExplosion, Shockwave, ScreenFlash）
    for (const effect of this.activeEffects) {
      effect.instance.dispose?.();
    }
    this.activeEffects = [];

    // 清理弹道系统
    if (this.projectileSystem) {
      this.projectileSystem.clear(this.sb.currentScene?.scene);
    }

    // 清理音频同步记录
    if (this.audioSync) {
      this.audioSync.clear();
    }
  }

  /**
   * 根据动画类型获取默认相机
   */
  _getDefaultCamera(animName) {
    const cameraMap = {
      Punch: 'FightImpact',
      LeftPunch: 'FightImpact',
      RightPunch: 'FightImpact',
      LeftRightPunchCombo: 'FightImpact',
      ComboPunch: 'FightImpact',
      Kick: 'FightImpact',
      Uppercut: 'FightDramatic',
      SpinKick: 'FightImpact',
      ArcadeSpinKick: 'FightImpact',
      JumpAttack: 'FightImpact',
      JumpFlyingKick: 'FightImpact',
      DashForward: 'FightFollow',
      Dodge: 'FightFollow',
      BoxerGuardHop: 'FightFollow',
      WeaveStep: 'FightFollow',
      HurricaneKick: 'FightImpact',
      DragonPunch: 'FightDramatic',
      BackFist: 'FightImpact',
      CounterStance: 'FightSide',
      SweepKick: 'FightImpact',
      KneeStrike: 'FightImpact',
      AirTatsumaki: 'FightImpact',
      Block: 'FightSide',
      SpiritSwordSwing: 'FightImpact',
      SpiritGunCharge: 'FightDramatic',
      SpiritGunFire: 'FightImpact',
      FightingStance: 'FightSide',
      HitStagger: 'FightImpact',
      Knockdown: 'FightWide',
      GetUp: 'FightSide',
    };
    return cameraMap[animName] || 'FightSide';
  }

  /**
   * 获取相机类
   */
  _getCameraClass(cameraType) {
    return CameraMoveRegistry[cameraType] || null;
  }

  /**
   * 构建相机参数
   */
  _buildCameraOptions(cameraType, attacker, defender, move) {
    const baseOptions = {
      characterA: attacker,
      characterB: defender,
      attacker: attacker,
      defender: defender,
      character: attacker,
      characterName: attacker,
    };

    switch (cameraType) {
      case 'FightImpact':
        return {
          ...baseOptions,
          attacker,
          defender,
          hitTime: move.hitFrame ? (move.hitFrame / (move.hitFrame + 0.1)) : 0.5,
          shakeIntensity: move.shake ? move.shake * 0.5 : 0.1,
        };
      case 'FightDramatic':
        return {
          ...baseOptions,
          character: attacker,
        };
      case 'FightFollow':
        return {
          ...baseOptions,
          characterA: attacker,
          characterB: defender,
        };
      case 'FightWide':
        return {
          ...baseOptions,
          characterA: attacker,
          characterB: defender,
        };
      case 'FightSide':
      default:
        return {
          ...baseOptions,
          characterA: attacker,
          characterB: defender,
        };
    }
  }

  /**
   * 导出音频时间线 manifest（供 Python 后处理合成）
   */
  exportAudioManifest() {
    return this.audioSync ? this.audioSync.exportManifest() : null;
  }

  /**
   * 计算格斗摄像机位置（兼容旧 API）
   * @param {string} viewType - 'side' | 'lowAngle' | 'impact' | 'wide'
   * @param {string} focus - 焦点角色
   */
  computeCamera(viewType, focus, options = {}) {
    const focusChar = this.sb.characters.get(focus);
    if (!focusChar) return null;

    const pos = focusChar.mesh.position;
    const opponent = this.getOpponent(focus);
    const oppChar = opponent ? this.sb.characters.get(opponent) : null;
    const oppPos = oppChar ? oppChar.mesh.position : null;

    switch (viewType) {
      case 'side': {
        const side = focusChar.userData?.facingDir === 1 ? -1 : 1;
        const dist = options.distance || 6;
        const height = options.height || 2.5;
        const cameraPos = new THREE.Vector3(pos.x + side * dist, height, 4);
        const lookAt = oppPos
          ? new THREE.Vector3((pos.x + oppPos.x) / 2, 1.2, 0)
          : new THREE.Vector3(pos.x, 1.2, 0);
        return { position: cameraPos, lookAt };
      }
      case 'lowAngle': {
        const side = focusChar.userData?.facingDir === 1 ? -1 : 1;
        const dist = options.distance || 4;
        const height = options.height || 0.8;
        const cameraPos = new THREE.Vector3(pos.x + side * dist, height, 3);
        const lookAt = new THREE.Vector3(pos.x, 1.5, 0);
        return { position: cameraPos, lookAt };
      }
      case 'impact': {
        const side = focusChar.userData?.facingDir === 1 ? -1 : 1;
        const dist = options.distance || 2.5;
        const height = options.height || 1.8;
        const cameraPos = new THREE.Vector3(pos.x + side * dist, height, 2);
        const lookAt = oppPos
          ? new THREE.Vector3(oppPos.x, 1.2, 0)
          : new THREE.Vector3(pos.x, 1.2, 0);
        return { position: cameraPos, lookAt };
      }
      case 'wide': {
        const centerX = oppPos ? (pos.x + oppPos.x) / 2 : pos.x;
        const height = options.height || 3.5;
        const dist = options.distance || 8;
        const cameraPos = new THREE.Vector3(centerX, height, dist);
        const lookAt = new THREE.Vector3(centerX, 1.2, 0);
        return { position: cameraPos, lookAt };
      }
      default:
        return null;
    }
  }
}
