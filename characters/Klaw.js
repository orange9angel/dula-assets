import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Klaw — 克劳星人
 * 强壮的爬虫类外星人，青绿色鳞片，红色复眼，头部有角质冠。
 * 身材魁梧 (~1.82m)，背部有脊刺，爪子锋利。
 * 与 Yusuke 完全兼容的 13 点关节结构。
 */
export class Klaw extends CharacterBase {
  constructor() {
    super('Klaw');
    this.boundingRadius = 0.6;
    this.archetypes = ['humanoid', 'fighter', 'athletic', 'alien', 'reptile'];
    this.trustedBodyAnimations = [
      'Walk', 'Run', 'LookAround',
      'LeftPunch', 'RightPunch', 'LeftRightPunchCombo',
      'Kick', 'SpinKick', 'JumpFlyingKick',
      'DragonPunch', 'RyuHurricaneKick', 'TatsumakiSenpuuKyaku',
      'Block', 'HitStagger', 'Dodge', 'DashForward',
      'CrossArms', 'SurprisedJump', 'ScratchHead', 'BroadcastChestExpansion',
      'FightingStance', 'Crouch', 'FaceSurprised', 'Run',
    ];
    this.allowedBodyAnimations = new Set(this.trustedBodyAnimations);
  }

  build() {
    const toonGradient = this.createToonGradient();

    // Materials
    const scaleMat = new THREE.MeshToonMaterial({ color: 0x2a8a6a, gradientMap: toonGradient });
    const scaleDarkMat = new THREE.MeshToonMaterial({ color: 0x1a5a4a, gradientMap: toonGradient });
    const scaleLightMat = new THREE.MeshToonMaterial({ color: 0x3aaa8a, gradientMap: toonGradient });
    const bellyMat = new THREE.MeshToonMaterial({ color: 0x4aaa7a, gradientMap: toonGradient });
    const crestMat = new THREE.MeshToonMaterial({ color: 0x8a3a2a, gradientMap: toonGradient });
    const eyeMat = new THREE.MeshToonMaterial({ color: 0xcc2222, gradientMap: toonGradient });
    const clawMat = new THREE.MeshToonMaterial({ color: 0x444444, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x6a2a3a, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.82;

    // Face — elongated reptilian snout, non-human
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), scaleMat);
    face.scale.set(0.85, 0.85, 1.25);
    face.castShadow = true;
    headGroup.add(face);

    // Extended snout — more crocodilian
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 6), scaleMat);
    snout.position.set(0, -0.1, 0.32);
    snout.rotation.x = -Math.PI / 2;
    snout.scale.set(1, 1.3, 0.7);
    headGroup.add(snout);

    // Lower jaw — separate hinged jaw, pronounced underbite
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.22), scaleDarkMat);
    jaw.position.set(0, -0.22, 0.26);
    headGroup.add(jaw);
    this.jaw = jaw;

    // Cheek ridges
    for (const side of [-1, 1]) {
      const ridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.12, 4, 8), scaleDarkMat);
      ridge.position.set(side * 0.2, -0.05, 0.1);
      ridge.rotation.z = side * 0.5;
      ridge.rotation.x = 0.3;
      headGroup.add(ridge);
    }

    // Crest — prominent jagged red horn-like structure on top of head
    for (let i = 0; i < 7; i++) {
      const crest = new THREE.Mesh(
        new THREE.ConeGeometry(0.035 - i * 0.003, 0.14 + i * 0.03 + (i % 2) * 0.04, 6),
        crestMat
      );
      const angle = (i / 6) * Math.PI * 0.7 - Math.PI * 0.35;
      crest.position.set(Math.sin(angle) * 0.1, 0.26 + i * 0.02, -0.06 - i * 0.015);
      crest.rotation.x = -0.4;
      crest.rotation.z = -angle * 0.7;
      headGroup.add(crest);
    }

    // Eyes — large red compound-like eyes
    this.addReptileEyes(headGroup, eyeMat);

    // Eyebrow ridges
    for (const side of [-1, 1]) {
      const browRidge = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.1, 4, 8), scaleDarkMat);
      browRidge.position.set(side * 0.14, 0.08, 0.2);
      browRidge.rotation.z = side * 0.3;
      headGroup.add(browRidge);
      if (side === -1) this.leftEyebrow = browRidge;
      else this.rightEyebrow = browRidge;
    }

    // Thin reptile eyelids so common Face* animations have visible control.
    const eyelidGeo = new THREE.BoxGeometry(0.095, 0.008, 0.012);
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x0d2f26, transparent: true, opacity: 0.45 });
    for (const side of [-1, 1]) {
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.position.set(side * 0.13, 0.035, 0.285);
      eyelid.rotation.z = side * 0.08;
      headGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;
    }

    // Nostril slits on top of snout
    for (const side of [-1, 1]) {
      const nostril = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.005, 0.015),
        scaleDarkMat
      );
      nostril.position.set(side * 0.04, 0.02, 0.38);
      headGroup.add(nostril);
    }

    // Heat-sensing pit on snout — small dark spot
    const heatPit = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 8, 8),
      new THREE.MeshToonMaterial({ color: 0x111111, gradientMap: toonGradient })
    );
    heatPit.position.set(0, -0.06, 0.44);
    heatPit.scale.set(1, 0.6, 0.4);
    headGroup.add(heatPit);

    // Mouth line
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.05, -0.14, 0.24),
      new THREE.Vector3(0, -0.13, 0.28),
      new THREE.Vector3(0.05, -0.14, 0.24)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 10, 0.004, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 16), scaleMat);
    neck.position.y = 1.6;
    this.mesh.add(neck);

    // Torso — broad, muscular
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.55, 20), scaleMat);
    torso.position.y = 1.28;
    torso.scale.z = 0.7;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Belly plate — lighter underbelly
    const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.4, 16), bellyMat);
    belly.position.set(0, 1.25, 0.06);
    belly.scale.z = 0.5;
    this.mesh.add(belly);

    // Chest definition
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), scaleLightMat);
    chest.position.set(0, 1.38, 0.08);
    chest.scale.set(1.1, 0.5, 0.45);
    this.mesh.add(chest);

    // Abdomen
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.19, 0.32, 16), scaleMat);
    abdomen.position.y = 0.85;
    abdomen.scale.z = 0.65;
    this.mesh.add(abdomen);

    // Back spines — larger, more numerous, with 3 rows
    for (let row = -1; row <= 1; row++) {
      for (let i = 0; i < 8; i++) {
        const spine = new THREE.Mesh(
          new THREE.ConeGeometry(0.025 - Math.abs(row) * 0.006, 0.12 + (i % 4) * 0.03 - Math.abs(row) * 0.02, 6),
          crestMat
        );
        spine.position.set(row * 0.08, 1.52 - i * 0.1, -0.2 - Math.abs(row) * 0.04);
        spine.rotation.x = -0.6 + Math.abs(row) * 0.2;
        spine.rotation.z = -row * 0.15;
        this.mesh.add(spine);
      }
    }

    // Tail — segmented reptilian tail with tip spike/glow
    const tailSegments = 5;
    let tailParent = this.mesh;
    let tailY = 0.72;
    let tailZ = -0.12;
    let tailRadius = 0.09;
    for (let t = 0; t < tailSegments; t++) {
      const segLen = 0.18 - t * 0.02;
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(tailRadius * 0.75, tailRadius, segLen, 12),
        scaleMat
      );
      seg.position.set(0, tailY - segLen / 2, tailZ);
      seg.rotation.x = -0.35 + t * 0.08;
      tailParent.add(seg);
      tailY -= segLen * 0.85;
      tailZ -= segLen * 0.5;
      tailRadius *= 0.7;
    }
    // Tail tip spike with glow
    const tailSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.14, 6),
      crestMat
    );
    tailSpike.position.set(0, tailY + 0.04, tailZ - 0.02);
    tailSpike.rotation.x = -0.2;
    this.mesh.add(tailSpike);

    const tailGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff5533 })
    );
    tailGlow.position.set(0, tailY - 0.02, tailZ - 0.06);
    this.mesh.add(tailGlow);

    this.addArms(scaleMat, scaleDarkMat, clawMat);
    this.addLegs(scaleMat, scaleDarkMat, clawMat);
    this._captureFaceBaseState();
  }

  addReptileEyes(headGroup, eyeMat) {
    for (const side of [-1, 1]) {
      // Eye socket
      const socket = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 16, 16),
        new THREE.MeshToonMaterial({ color: 0x1a4a3a })
      );
      socket.position.set(side * 0.13, 0.04, 0.2);
      socket.scale.set(1.2, 1.1, 0.6);
      headGroup.add(socket);

      // Eye — red, slit pupil
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), eyeMat);
      eye.position.set(side * 0.13, 0.04, 0.24);
      eye.scale.set(1.1, 1.15, 0.5);
      headGroup.add(eye);

      // Pupil — horizontal slit
      const pupil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.04, 6),
        new THREE.MeshToonMaterial({ color: 0x000000 })
      );
      pupil.position.set(side * 0.13, 0.04, 0.27);
      pupil.rotation.z = Math.PI / 2;
      pupil.scale.set(1, 1, 0.3);
      headGroup.add(pupil);
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;

      // Eye shine
      const shine = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffaaaa })
      );
      shine.position.set(side * 0.11, 0.06, 0.27);
      headGroup.add(shine);
    }
  }

  addArms(scaleMat, scaleDarkMat, clawMat) {
    const addArm = (sx, sy, sz, isRight) => {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(sx, sy, sz);
      shoulderGroup.rotation.set(0, 0, 0);

      const upperLen = 0.3;
      const lowerLen = 0.28;

      // Upper arm — muscular
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, upperLen, 5, 12), scaleMat);
      upperArm.position.y = -upperLen / 2;
      shoulderGroup.add(upperArm);

      // Shoulder spike
      const shoulderSpike = new THREE.Mesh(
        new THREE.ConeGeometry(0.02, 0.06, 6),
        scaleDarkMat
      );
      shoulderSpike.position.set(0, 0.02, -0.06);
      shoulderSpike.rotation.x = -0.8;
      shoulderGroup.add(shoulderSpike);

      // Elbow Group
      const elbowGroup = new THREE.Group();
      elbowGroup.position.y = -upperLen - 0.01;
      shoulderGroup.add(elbowGroup);

      const elbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), scaleDarkMat);
      elbowMesh.scale.set(1, 0.7, 0.85);
      elbowGroup.add(elbowMesh);

      // Elbow Twist Group
      const elbowTwistGroup = new THREE.Group();
      elbowGroup.add(elbowTwistGroup);

      // Forearm
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, lowerLen, 5, 12), scaleMat);
      forearm.position.y = -lowerLen / 2 - 0.02;
      elbowTwistGroup.add(forearm);

      // Wrist Group
      const wristGroup = new THREE.Group();
      wristGroup.position.y = -lowerLen - 0.04;
      elbowTwistGroup.add(wristGroup);

      // Hand — clawed
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 12), scaleDarkMat);
      hand.position.y = -0.03;
      hand.scale.set(1.1, 0.8, 1.15);
      wristGroup.add(hand);

      // Claws — prominent curved geometry
      for (let c = 0; c < 4; c++) {
        const claw = new THREE.Mesh(
          new THREE.ConeGeometry(0.016, 0.12, 6),
          clawMat
        );
        const cAngle = (c - 1.5) * 0.4;
        claw.position.set(Math.sin(cAngle) * 0.045, -0.1, Math.cos(cAngle) * 0.045);
        claw.rotation.x = cAngle;
        wristGroup.add(claw);
      }
      // Thumb claw
      const thumbClaw = new THREE.Mesh(
        new THREE.ConeGeometry(0.018, 0.1, 6),
        clawMat
      );
      thumbClaw.position.set(0.06, -0.08, 0.02);
      thumbClaw.rotation.z = -0.6;
      wristGroup.add(thumbClaw);

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

    addArm(-0.28, 1.34, 0, false);
    addArm(0.28, 1.34, 0, true);
  }

  addLegs(scaleMat, scaleDarkMat, clawMat) {
    for (const side of [-1, 1]) {
      const hipGroup = new THREE.Group();
      hipGroup.position.set(side * 0.12, 1.0, 0);

      // Thigh — thick, muscular
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.3, 5, 12), scaleMat);
      thigh.position.y = -0.17;
      hipGroup.add(thigh);

      // Thigh scale ridge
      const ridge = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.02, 0.2, 4, 8),
        scaleDarkMat
      );
      ridge.position.set(0, -0.17, 0.05);
      hipGroup.add(ridge);

      // Knee Group
      const kneeGroup = new THREE.Group();
      kneeGroup.position.set(0, -0.36, 0.03);
      hipGroup.add(kneeGroup);

      const kneeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), scaleDarkMat);
      kneeMesh.scale.set(1.05, 0.7, 0.55);
      kneeGroup.add(kneeMesh);

      // Shin
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.3, 5, 12), scaleMat);
      shin.position.y = -0.19;
      shin.scale.set(1, 1, 0.85);
      kneeGroup.add(shin);

      // Ankle Group
      const ankleGroup = new THREE.Group();
      ankleGroup.position.y = -0.36;
      kneeGroup.add(ankleGroup);

      // Reptile foot
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), scaleDarkMat);
      foot.position.set(0, -0.08, 0.03);
      foot.scale.set(1.1, 0.45, 1.4);
      ankleGroup.add(foot);

      // Foot claws — prominent curved geometry
      for (let c = 0; c < 3; c++) {
        const claw = new THREE.Mesh(
          new THREE.ConeGeometry(0.02, 0.1, 6),
          clawMat
        );
        const cAngle = (c - 1) * 0.5;
        claw.position.set(Math.sin(cAngle) * 0.05, -0.12, 0.12 + Math.cos(cAngle) * 0.03);
        claw.rotation.x = -0.6;
        ankleGroup.add(claw);
      }
      // Back dewclaw
      const dewClaw = new THREE.Mesh(
        new THREE.ConeGeometry(0.018, 0.07, 6),
        clawMat
      );
      dewClaw.position.set(0, -0.1, -0.06);
      dewClaw.rotation.x = 0.4;
      ankleGroup.add(dewClaw);

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
    // Jaw follows the same audio-weighted mouth shape as the lip-sync layer.
    if (this.isSpeaking && this.jaw) {
      const jawOpen = this._currentMouthShape?.jawOpen || 0;
      this.jaw.rotation.x = jawOpen * 0.28;
    } else if (this.jaw) {
      this.jaw.rotation.x = 0;
    }
  }
}
