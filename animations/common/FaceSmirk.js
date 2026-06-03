import { AnimationBase, PoseMatrix } from 'dula-engine';

/**
 * FaceSmirk — 得意/坏笑表情
 * One eyebrow raised, one side of mouth curled up
 * Perfect for Yusuke-style delinquent attitude
 *
 * Tags:
 *   requires: [headGroup]
 *   suits: [humanoid, fighter, delinquent, agile]
 *   note: Asymmetric expression — best on expressive humanoids
 */
export class FaceSmirk extends AnimationBase {
  constructor() {
    super('FaceSmirk', 0.4);
    this.usePoseMatrix = true;
    this.tags = {
      requires: ['headGroup'],
      suits: ['humanoid', 'fighter', 'delinquent', 'agile'],
      notSuits: [],
      minHeight: 0.5,
      maxHeight: 3.0,
    };
  }

  getPoseMatrix(t) {
    const ease = t < 0.3 ? t / 0.3 : 1;
    const pose = new PoseMatrix();

    // Eyebrows: left raised (cocky), right lowered (asymmetric)
    pose.eyebrows = {
      left: { py: ease * 0.018, rz: -ease * 0.1 },
      right: { py: -ease * 0.005, rz: ease * 0.15 },
    };

    // Eyelids: left eye slightly more open
    pose.eyelids = {
      left: { visible: false },
      right: { visible: true, sy: -ease * 0.15 },
    };

    // Mouth: one side up (smirk)
    // 注意：mouth 是 TubeGeometry，rz 旋转会绕自身中心转导致"飞嘴"
    // 用 sx 不对称缩放 + py 微移来模拟歪嘴
    pose.mouth = { tension: 0.3 };

    // Head: slight tilt (confident)
    pose.headGroup = {
      rz: -ease * 0.06,
      rx: -ease * 0.03,
    };

    return pose;
  }
}
