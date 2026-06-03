import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Rex — 雷克斯星人
 * 硅基晶体生命体，橙色琥珀色晶体皮肤，体内有发光能量脉络。
 * 身材高大 (~1.9m)，头部是菱形晶体，无传统五官，通过身体发光交流。
 * 四肢粗壮如岩石柱，关节处有外露的能量核心。
 * 与 Yusuke 完全兼容的 13 点关节结构。
 */
export class Rex extends CharacterBase {
  constructor() {
    super('Rex');
    this.boundingRadius = 0.6;
    this.archetypes = ['humanoid', 'fighter', 'athletic', 'alien', 'crystal'];
    this.trustedBodyAnimations = [
      'Walk', 'Run', 'LookAround',
      'LeftPunch', 'RightPunch', 'LeftRightPunchCombo',
      'Kick', 'SpinKick', 'JumpFlyingKick',
      'DragonPunch', 'RyuHurricaneKick', 'TatsumakiSenpuuKyaku',
      'Block', 'HitStagger', 'Dodge', 'DashForward',
      'CrossArms', 'FightingStance', 'Crouch',
      'PointForward', 'Nod', 'FaceDetermined',
      'HandsOnHips', 'WaveHand', 'Think',
    ];
    this.allowedBodyAnimations = new Set(this.trustedBodyAnimations);
  }

  build() {
    const toonGradient = this.createToonGradient();

    // Materials — crystal/rock textures
    const crystalMat = new THREE.MeshToonMaterial({ color: 0xd4883a, gradientMap: toonGradient });
    const crystalDarkMat = new THREE.MeshToonMaterial({ color: 0xa06020, gradientMap: toonGradient });
    const crystalLightMat = new THREE.MeshToonMaterial({ color: 0xf0a860, gradientMap: toonGradient });
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.6 });
    const coreBrightMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.8 });
    const veinMat = new THREE.MeshBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0.4 });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.9;

    // Main crystal head — diamond/octahedron shape
    const headCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 1),
      crystalMat
    );
    headCrystal.scale.set(0.9, 1.3, 0.85);
    headCrystal.castShadow = true;
    headGroup.add(headCrystal);

    // Crystal facets (overlapping smaller crystals for detail)
    for (let i = 0; i < 6; i++) {
      const facet = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.06, 0),
        crystalLightMat
      );
      const angle = (i / 6) * Math.PI * 2;
      facet.position.set(
        Math.cos(angle) * 0.12,
        0.05 + Math.sin(i * 1.3) * 0.08,
        Math.sin(angle) * 0.1
      );
      facet.rotation.set(Math.random(), Math.random(), Math.random());
      headGroup.add(facet);
    }

    // Eye cores — glowing orange slits (no pupils, just energy)
    this.eyeCores = [];
    for (const side of [-1, 1]) {
      // Eye socket — recessed dark crystal
      const socket = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        crystalDarkMat
      );
      socket.position.set(side * 0.1, 0.08, 0.18);
      socket.scale.set(1.2, 0.6, 0.5);
      headGroup.add(socket);

      // Glowing core
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        coreMat.clone()
      );
      core.position.set(side * 0.1, 0.08, 0.21);
      core.scale.set(1.5, 0.4, 0.3);
      headGroup.add(core);
      this.eyeCores.push(core);
      if (side === -1) this.leftPupil = core;
      else this.rightPupil = core;

      // Brow ridge — crystal overhang
      const brow = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.1, 4),
        crystalMat
      );
      brow.position.set(side * 0.1, 0.16, 0.15);
      brow.rotation.x = -0.5;
      brow.rotation.z = side * 0.2;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;

      // Energy shutter eyelid. This gives blink/squint animations something
      // visible to manipulate while keeping Rex non-organic.
      const eyelid = new THREE.Mesh(
        new THREE.BoxGeometry(0.095, 0.008, 0.012),
        crystalDarkMat
      );
      eyelid.position.set(side * 0.1, 0.075, 0.235);
      eyelid.rotation.z = side * 0.08;
      headGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;
    }

    // Mouth — horizontal glowing slit
    const mouthGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.015, 0.01),
      coreBrightMat.clone()
    );
    mouthGlow.position.set(0, -0.12, 0.2);
    headGroup.add(mouthGlow);
    this.mouth = mouthGlow;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    // Chin crystal
    const chin = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.08, 0),
      crystalDarkMat
    );
    chin.position.set(0, -0.25, 0.1);
    chin.scale.set(0.8, 0.6, 0.7);
    headGroup.add(chin);

    // Side crystals (like ears but angular)
    for (const side of [-1, 1]) {
      const earCrystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.06, 0),
        crystalLightMat
      );
      earCrystal.position.set(side * 0.22, 0.05, -0.05);
      earCrystal.rotation.z = side * 0.5;
      headGroup.add(earCrystal);
    }

    // Top crest crystal
    const crest = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.15, 4),
      crystalLightMat
    );
    crest.position.set(0, 0.32, -0.05);
    crest.rotation.x = -0.3;
    headGroup.add(crest);

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY ==========
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.15, 8),
      crystalDarkMat
    );
    neck.position.y = 1.68;
    this.mesh.add(neck);

    // Torso — broad crystal pillar
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.24, 0.6, 8),
      crystalMat
    );
    torso.position.y = 1.3;
    torso.scale.z = 0.7;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Chest core — large glowing crystal
    const chestCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.08, 1),
      coreBrightMat.clone()
    );
    chestCore.position.set(0, 1.4, 0.18);
    chestCore.scale.set(1, 1.2, 0.5);
    this.mesh.add(chestCore);
    this.chestCore = chestCore;

    // Energy veins on torso
    this.veins = [];
    for (let i = 0; i < 4; i++) {
      const vein = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.25, 0.01),
        veinMat.clone()
      );
      const side = i < 2 ? -1 : 1;
      vein.position.set(side * (0.1 + (i % 2) * 0.08), 1.25 + (i % 2) * 0.1, 0.2);
      vein.rotation.z = side * 0.1;
      this.mesh.add(vein);
      this.veins.push(vein);
    }

    // Abdomen
    const abdomen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.2, 0.35, 8),
      crystalMat
    );
    abdomen.position.y = 0.82;
    abdomen.scale.z = 0.65;
    this.mesh.add(abdomen);

    // Abdomen core
    const absCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      coreMat.clone()
    );
    absCore.position.set(0, 0.82, 0.15);
    this.mesh.add(absCore);

    // Shoulder crystals
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.1, 0),
        crystalLightMat
      );
      shoulder.position.set(side * 0.32, 1.58, 0);
      shoulder.scale.set(1.2, 0.8, 1);
      this.mesh.add(shoulder);
    }

    this.addArms(crystalMat, crystalDarkMat, coreMat);
    this.addLegs(crystalMat, crystalDarkMat, coreMat);
    this._captureFaceBaseState();
  }

  addArms(crystalMat, crystalDarkMat, coreMat) {
    const addArm = (sx, sy, sz, isRight) => {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(sx, sy, sz);

      const upperLen = 0.32;
      const lowerLen = 0.28;

      // Upper arm — thick crystal column
      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.05, upperLen, 8),
        crystalMat
      );
      upperArm.position.y = -upperLen / 2;
      shoulderGroup.add(upperArm);

      // Arm ridge detail
      const ridge = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, upperLen * 0.6, 0.015),
        crystalDarkMat
      );
      ridge.position.set(0, -upperLen / 2, 0.05);
      shoulderGroup.add(ridge);

      // Elbow core
      const elbowGroup = new THREE.Group();
      elbowGroup.position.y = -upperLen - 0.01;
      shoulderGroup.add(elbowGroup);

      const elbowCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        coreMat.clone()
      );
      elbowCore.scale.set(1, 0.7, 0.85);
      elbowGroup.add(elbowCore);

      // Elbow Twist Group
      const elbowTwistGroup = new THREE.Group();
      elbowGroup.add(elbowTwistGroup);

      // Forearm
      const forearm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.045, lowerLen, 8),
        crystalMat
      );
      forearm.position.y = -lowerLen / 2 - 0.02;
      elbowTwistGroup.add(forearm);

      // Wrist Group
      const wristGroup = new THREE.Group();
      wristGroup.position.y = -lowerLen - 0.04;
      elbowTwistGroup.add(wristGroup);

      // Hand — blocky crystal fist
      const hand = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        crystalDarkMat
      );
      hand.position.y = -0.04;
      wristGroup.add(hand);

      // Finger crystals
      for (let f = 0; f < 3; f++) {
        const finger = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.06, 0.025),
          crystalMat
        );
        const fAngle = (f - 1) * 0.4;
        finger.position.set(Math.sin(fAngle) * 0.03, -0.1, Math.cos(fAngle) * 0.03);
        wristGroup.add(finger);
      }

      this.mesh.add(shoulderGroup);
      if (isRight) {
        this.rightArm = shoulderGroup;
        this.rightElbow = elbowGroup;
        this.rightElbowTwist = elbowTwistGroup;
        this.rightWrist = wristGroup;
        this.rightArmLength = upperLen + lowerLen;
        this.rightArmBaseZ = 0;
      } else {
        this.leftArm = shoulderGroup;
        this.leftElbow = elbowGroup;
        this.leftElbowTwist = elbowTwistGroup;
        this.leftWrist = wristGroup;
        this.leftArmLength = upperLen + lowerLen;
        this.leftArmBaseZ = 0;
      }
    };

    addArm(-0.28, 1.38, 0, false);
    addArm(0.28, 1.38, 0, true);
  }

  addLegs(crystalMat, crystalDarkMat, coreMat) {
    for (const side of [-1, 1]) {
      const hipGroup = new THREE.Group();
      hipGroup.position.set(side * 0.12, 1.02, 0);

      // Thigh — thick crystal pillar
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.06, 0.32, 8),
        crystalMat
      );
      thigh.position.y = -0.18;
      hipGroup.add(thigh);

      // Knee core
      const kneeGroup = new THREE.Group();
      kneeGroup.position.set(0, -0.36, 0.03);
      hipGroup.add(kneeGroup);

      const kneeCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 8, 8),
        coreMat.clone()
      );
      kneeCore.scale.set(1.05, 0.7, 0.55);
      kneeGroup.add(kneeCore);

      // Shin
      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.05, 0.3, 8),
        crystalMat
      );
      shin.position.y = -0.19;
      shin.scale.set(1, 1, 0.85);
      kneeGroup.add(shin);

      // Ankle Group
      const ankleGroup = new THREE.Group();
      ankleGroup.position.y = -0.36;
      kneeGroup.add(ankleGroup);

      // Foot — blocky crystal
      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.06, 0.16),
        crystalDarkMat
      );
      foot.position.set(0, -0.06, 0.03);
      ankleGroup.add(foot);

      // Toe crystals
      for (let t = 0; t < 3; t++) {
        const toe = new THREE.Mesh(
          new THREE.ConeGeometry(0.015, 0.05, 4),
          crystalMat
        );
        const tAngle = (t - 1) * 0.3;
        toe.position.set(Math.sin(tAngle) * 0.025, -0.06, 0.1);
        toe.rotation.x = -Math.PI / 2;
        ankleGroup.add(toe);
      }

      this.mesh.add(hipGroup);
      if (side === -1) {
        this.leftLeg = hipGroup;
        this.leftKnee = kneeGroup;
        this.leftAnkle = ankleGroup;
      } else {
        this.rightLeg = hipGroup;
        this.rightKnee = kneeGroup;
        this.rightAnkle = ankleGroup;
      }
    }
  }

  createToonGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 4; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 4, 0);
    g.addColorStop(0, '#2a2a2a');
    g.addColorStop(0.45, '#707070');
    g.addColorStop(0.55, '#c0c0c0');
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  update(time, delta) {
    super.update(time, delta);
    // Crystal glow pulse
    const pulse = 0.5 + Math.sin(time * 3) * 0.3;
    if (this.chestCore) {
      this.chestCore.material.opacity = 0.5 + pulse * 0.3;
    }
    for (const eye of this.eyeCores) {
      eye.material.opacity = 0.4 + pulse * 0.4;
    }
    for (const vein of this.veins) {
      vein.material.opacity = 0.2 + Math.sin(time * 4 + vein.position.x * 10) * 0.15;
    }
  }
}
