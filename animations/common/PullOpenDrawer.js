import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * PullOpenDrawer — 角色伸手拉抽屉的动作
 * 身体前倾，手臂前伸，模拟抓住抽屉把手向外拉
 */
export class PullOpenDrawer extends AnimationBase {
  constructor() {
    super('PullOpenDrawer', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    // Phase 1: reach forward (0~0.3)
    // Phase 2: pull back (0.3~0.7)
    // Phase 3: return to neutral (0.7~1.0)

    let reach = 0;
    let pull = 0;
    let recover = 0;

    if (t < 0.3) {
      reach = t / 0.3;
    } else if (t < 0.7) {
      reach = 1;
      pull = (t - 0.3) / 0.4;
    } else {
      recover = (t - 0.7) / 0.3;
    }

    const reachEase = reach * (2 - reach); // easeOutQuad
    const pullEase = pull * (2 - pull);    // easeOutQuad
    const recoverEase = recover * recover;  // easeInQuad

    // Body leans forward then back
    const meshRx = reachEase * 0.25 - pullEase * 0.15 - recoverEase * 0.1;

    // Right arm reaches forward then pulls back
    const reachRot = -reachEase * 1.2;
    const pullRot = pullEase * 0.3;
    const recoverRot = recoverEase * (-1.2 + 0.3);
    const rArmX = reachRot + pullRot + recoverRot;
    const rArmZ = -reachEase * 0.3;

    // Left arm mirrors (slightly less pronounced)
    const lReachRot = -reachEase * 1.0;
    const lPullRot = pullEase * 0.2;
    const lRecoverRot = recoverEase * (-1.0 + 0.2);
    const lArmX = lReachRot + lPullRot + lRecoverRot;
    const lArmZ = reachEase * 0.3;

    const pose = new PoseMatrix();
    pose.mesh = { rx: meshRx };
    pose.rightShoulder = { rx: rArmX, rz: rArmZ };
    pose.leftShoulder = { rx: lArmX, rz: lArmZ };
    return pose;
  }
}
