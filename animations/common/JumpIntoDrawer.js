import { AnimationBase } from 'dula-engine';

/**
 * JumpIntoDrawer — 角色跳入抽屉的动作
 * 屈膝蓄力 → 起跳 → 空中收腿 → 缩小消失（模拟进入四次元空间）
 */
export class JumpIntoDrawer extends AnimationBase {
  constructor() {
    super('JumpIntoDrawer', 1.2);
  }

  update(t, character) {
    const rArm = character.rightArm;
    const lArm = character.leftArm;
    const leftLeg = character.leftLeg;
    const rightLeg = character.rightLeg;
    const baseY = character.baseY || 0;

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

    character.mesh.position.y = baseY + crouchY + jumpY + tuckY + vanishY;

    // === BODY ROTATION ===
    // Lean forward during jump
    character.mesh.rotation.x = jumpEase * 0.4 + tuckEase * 0.2;

    // === LEGS ===
    if (leftLeg && rightLeg) {
      // Crouch: bend knees
      const kneeBend = crouchEase * 0.8;
      // Jump: legs extend then tuck
      const legExtend = jumpEase < 0.5 ? -jumpEase * 2 * 0.6 : -(1 - jumpEase) * 0.6;
      const legTuck = tuckEase * 1.0;

      leftLeg.rotation.x = kneeBend + legExtend + legTuck;
      rightLeg.rotation.x = kneeBend + legExtend + legTuck;
    }

    // === ARMS ===
    if (rArm && lArm) {
      const rBaseZ = character.rightArmBaseZ || rArm.rotation.z;
      const lBaseZ = character.leftArmBaseZ || lArm.rotation.z;

      // Crouch: arms swing back
      const armSwingBack = crouchEase * 0.5;
      // Jump: arms fling up
      const armFling = jumpEase > 0 ? Math.sin(jumpEase * Math.PI) * 1.2 : 0;
      // Tuck: arms hug body
      const armTuck = tuckEase * 0.8;

      rArm.rotation.z = rBaseZ + armSwingBack - armFling + armTuck;
      lArm.rotation.z = lBaseZ - armSwingBack + armFling - armTuck;

      // Arms reach forward during jump
      rArm.rotation.x = jumpEase * 0.6;
      lArm.rotation.x = jumpEase * 0.6;
    }

    // === HEAD ===
    if (character.headGroup) {
      // Look down into drawer during jump
      character.headGroup.rotation.x = crouchEase * 0.2 + jumpEase * 0.3;
    }

    // === SCALE (shrink into drawer) ===
    if (vanish > 0) {
      const scale = 1 - vanishEase * 0.7;
      character.mesh.scale.setScalar(scale);
    } else {
      character.mesh.scale.setScalar(1);
    }
  }
}
