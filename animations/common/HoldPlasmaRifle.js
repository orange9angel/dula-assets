import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * HoldPlasmaRifle — 持续举枪瞄准姿势
 * 用于射击战斗中的待机/瞄准状态，带有呼吸微动和枪口轻微晃动
 * 比 FightingStance 更适合远程射击战斗
 */
export class HoldPlasmaRifle extends AnimationBase {
  constructor() {
    super('HoldPlasmaRifle', 1.5); // 循环周期1.5秒
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['rightArm', 'leftArm'],
      suits: ['humanoid', 'fighter', 'vehicle'],
      notSuits: ['round', 'tiny'],
      minHeight: 0.8,
      maxHeight: 2.5,
    };
  }

  getPoseMatrix(t) {
    const pm = new PoseMatrix();
    
    // 呼吸周期：1.5秒
    const breathCycle = (t % 1.5) / 1.5;
    const breathPhase = breathCycle * Math.PI * 2;
    
    // 枪口轻微晃动（模拟瞄准时的自然抖动）
    const swayX = Math.sin(breathPhase * 0.7) * 0.02;  // 左右微晃
    const swayY = Math.cos(breathPhase * 0.5) * 0.015; // 上下微晃
    const swayZ = Math.sin(breathPhase * 1.3) * 0.01;  // 轻微旋转
    
    // 呼吸导致的身体起伏
    const torsoBob = Math.sin(breathPhase) * 0.03;
    
    // 右臂：举枪姿势（枪托抵肩，手臂高举）
    pm.rightShoulder = {
      rx: -1.2 + swayY,  // 大幅上举（约70度）
      ry: swayX,         // 左右微调
      rz: -0.3 + swayZ,  // 明显内收
      py: torsoBob * 0.5
    };
    
    // 左臂：辅助扶枪/握护木
    pm.leftShoulder = {
      rx: -1.0 + swayY * 0.8,  // 同步上举
      ry: -swayX * 0.5,
      rz: 0.4 + swayZ * 0.5,   // 外展扶枪
      py: torsoBob * 0.5
    };
    
    // 头部：随枪口大幅微调
    pm.headGroup = {
      rx: swayY * 1.0,
      ry: swayX * 0.6,
      rz: 0
    };
    
    // 躯干：明显呼吸起伏
    pm.mesh = {
      py: torsoBob * 2,
      ry: swayX * 0.4
    };
    
    // 腿部：微蹲/稳定站姿
    pm.rightHip = {
      rx: -0.1 + torsoBob * 0.3
    };
    pm.leftHip = {
      rx: 0.1 + torsoBob * 0.3
    };
    
    return pm;
  }
}
