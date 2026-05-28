import { AnimationBase, PoseMatrix } from 'dula-engine';

export class Walk extends AnimationBase {
  constructor() {
    super('Walk', 1.0);
    this.usePoseMatrix = true;
  }

  getPoseMatrix(t) {
    const pose = new PoseMatrix();
    const freq = Math.PI * 4;
    const legSwing = Math.sin(t * freq);
    const armSwing = Math.sin(t * freq + Math.PI);

    // alternating leg swing with knee bend
    pose.leftHip = { rx: legSwing * 0.5, rz: legSwing * 0.05 };
    pose.leftKnee = { rx: legSwing > 0 ? legSwing * 0.4 : 0.1 };
    pose.leftAnkle = { rx: legSwing > 0 ? -legSwing * 0.2 : 0 };

    pose.rightHip = { rx: -legSwing * 0.5, rz: -legSwing * 0.05 };
    pose.rightKnee = { rx: -legSwing > 0 ? -legSwing * 0.4 : 0.1 };
    pose.rightAnkle = { rx: -legSwing > 0 ? legSwing * 0.2 : 0 };

    // body bob + slight forward lean
    pose.mesh = {
      y: Math.abs(Math.sin(t * freq)) * 0.04,
      rx: 0.03,
    };

    // arm swing opposite to legs with more natural range
    pose.rightShoulder = { rz: armSwing * 0.25, rx: -0.1 };
    pose.rightElbow = { rx: -0.3 };
    pose.leftShoulder = { rz: -armSwing * 0.25, rx: -0.1 };
    pose.leftElbow = { rx: -0.3 };

    // subtle hip twist for natural gait
    pose.mesh.ry = armSwing * 0.04;

    return pose;
  }
}
