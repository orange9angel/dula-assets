import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * JumpIntoDrawer — 角色跳入抽屉的动作
 * 屈膝蓄力 → 起跳 → 空中收腿 → 缩小消失（模拟进入四次元空间）
 */
export class JumpIntoDrawer extends AnimationBase {
  constructor() {
    super('JumpIntoDrawer', 1.2);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    // Phase breakdown:
    // 0.0~0.2: crouch (蓄力)
    // 0.2~0.5: jump up and forward
    // 0.5~0.8: mid-air tuck
    // 0.8~1.0: shrink and disappear

    let crouch = 0;
    let jump = 0;
    let tuck = 0;
    let vanish = 0;

    if (t < 0.2) {
      crouch = t / 0.2;
    } else if (t < 0.5) {
      crouch = 1;
      jump = (t - 0.2) / 0.3;
    } else if (t < 0.8) {
      jump = 1;
      tuck = (t - 0.5) / 0.3;
    } else {
      tuck = 1;
      vanish = (t - 0.8) / 0.2;
    }

    const crouchEase = crouch * crouch; // easeIn
    const jumpEase = jump < 0.5 ? 2 * jump * jump : -1 + (4 - 2 * jump) * jump; // easeInOut
    const tuckEase = tuck * (2 - tuck); // easeOut
    const vanishEase = vanish * vanish; // easeIn

    // === BODY HEIGHT ===
    // Crouch: lower body
    // Jump: parabolic arc up
    // Tuck: stay up
    // Vanish: keep position but shrink
    const crouchY = -crouchEase * 0.25;
    const jumpY = jumpEase > 0 ? Math.sin(jumpEase * Math.PI) * 0.6 : 0;
    const tuckY = tuck > 0 ? 0.3 * (1 - tuckEase * 0.3) : 0;
    const vanishY = vanish > 0 ? 0.21 * (1 - vanishEase) : 0;

    const meshY = crouchY + jumpY + tuckY + vanishY;

    // === BODY ROTATION ===
    // Lean forward during jump
    const meshRx = jumpEase * 0.4 + tuckEase * 0.2;

    // === LEGS ===
    // Crouch: bend knees
    const kneeBend = crouchEase * 0.8;
    // Jump: legs extend then tuck
    const legExtend = jumpEase < 0.5 ? -jumpEase * 2 * 0.6 : -(1 - jumpEase) * 0.6;
    const legTuck = tuckEase * 1.0;

    const legRx = kneeBend + legExtend + legTuck;

    // === ARMS ===
    // Crouch: arms swing back
    const armSwingBack = crouchEase * 0.5;
    // Jump: arms fling up
    const armFling = jumpEase > 0 ? Math.sin(jumpEase * Math.PI) * 1.2 : 0;
    // Tuck: arms hug body
    const armTuck = tuckEase * 0.8;

    const rArmZ = armSwingBack - armFling + armTuck;
    const lArmZ = -armSwingBack + armFling - armTuck;

    // Arms reach forward during jump
    const rArmX = jumpEase * 0.6;
    const lArmX = jumpEase * 0.6;

    // === HEAD ===
    // Look down into drawer during jump
    const headRx = crouchEase * 0.2 + jumpEase * 0.3;

    // === SCALE (shrink into drawer) ===
    let sx = 0, sy = 0, sz = 0;
    if (vanish > 0) {
      const scale = 1 - vanishEase * 0.7;
      sx = scale - 1;
      sy = scale - 1;
      sz = scale - 1;
    }

    const pose = new PoseMatrix();
    pose.mesh = { y: meshY, rx: meshRx, sx, sy, sz };
    pose.rightHip = { rx: legRx };
    pose.leftHip = { rx: legRx };
    pose.rightShoulder = { rx: rArmX, rz: rArmZ };
    pose.leftShoulder = { rx: lArmX, rz: lArmZ };
    pose.headGroup = { rx: headRx };
    return pose;
  }
}
