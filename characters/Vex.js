import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Vex — 维克斯星人
 * 纤细的昆虫型外星人，深蓝色外骨骼，四只复眼，触角。
 * 身材矮小精悍 (~1.55m)，动作敏捷，背后有薄膜翅膀。
 * 与 Yusuke 完全兼容的 13 点关节结构。
 */
export class Vex extends CharacterBase {
  constructor() {
    super('Vex');
    this.boundingRadius = 0.45;
    this.archetypes = ['humanoid', 'fighter', 'athletic', 'alien', 'insect', 'agile'];
    this.trustedBodyAnimations = [
      'Walk', 'Run', 'LookAround',
      'LeftPunch', 'RightPunch', 'LeftRightPunchCombo',
      'Kick', 'SpinKick', 'JumpFlyingKick',
      'DragonPunch', 'RyuHurricaneKick', 'TatsumakiSenpuuKyaku',
      'Block', 'HitStagger', 'Dodge', 'DashForward',
      'Shrug', 'HandsOnHips', 'WaveHand',
      'FightingStance', 'Crouch', 'CrouchJump', 'FlyPose', 'FaceSurprised', 'FaceHappy',
    ];
    this.allowedBodyAnimations = new Set(this.trustedBodyAnimations);
  }

  build() {
    const toonGradient = this.createToonGradient();

    // 复眼六边形网格纹理
    const createCompoundEyeTexture = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#061126';
      ctx.fillRect(0, 0, size, size);

      const r = 10;
      const w = r * Math.sqrt(3);
      const h = r * 1.5;
      const cols = Math.ceil(size / w) + 1;
      const rows = Math.ceil(size / h) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * w + (row % 2) * (w / 2);
          const cy = row * h;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
          grad.addColorStop(0, '#66ffcc');
          grad.addColorStop(1, '#1a4a5a');
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = '#0a2a3a';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    };

    // Materials
    const shellMat = new THREE.MeshToonMaterial({ color: 0x1a3a6a, gradientMap: toonGradient });
    const shellLightMat = new THREE.MeshToonMaterial({ color: 0x2a5a9a, gradientMap: toonGradient });
    const shellDarkMat = new THREE.MeshToonMaterial({ color: 0x0f1f3f, gradientMap: toonGradient });
    const eyeTex = createCompoundEyeTexture();
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x113344,
      map: eyeTex,
      emissive: 0x44ffcc,
      emissiveMap: eyeTex,
      emissiveIntensity: 0.75,
      roughness: 0.35,
      metalness: 0.15,
    });
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff, transparent: true, opacity: 0.25, side: THREE.DoubleSide,
    });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x4a2a5a, gradientMap: toonGradient });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x44ffaa, transparent: true, opacity: 0.7 });
    const glowStrongMat = new THREE.MeshBasicMaterial({ color: 0x66ffcc, transparent: true, opacity: 0.85 });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.55;

    // Face — triangular insect head, non-humanoid
    const face = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 6), shellMat);
    face.position.set(0, 0.05, 0.05);
    face.rotation.x = -0.3;
    face.scale.set(1, 0.8, 0.9);
    face.castShadow = true;
    headGroup.add(face);

    // Large curved mandibles — enhanced, more prominent
    for (const side of [-1, 1]) {
      const mandibleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.06, -0.06, 0.18),
        new THREE.Vector3(side * 0.14, -0.16, 0.26),
        new THREE.Vector3(side * 0.12, -0.24, 0.32),
        new THREE.Vector3(side * 0.08, -0.28, 0.36),
      ]);
      const mandibleGeo = new THREE.TubeGeometry(mandibleCurve, 10, 0.018, 8, false);
      const mandible = new THREE.Mesh(mandibleGeo, shellDarkMat);
      headGroup.add(mandible);

      // Mandible inner serrated edge
      for (let s = 0; s < 4; s++) {
        const t = 0.4 + s * 0.15;
        const pt = mandibleCurve.getPoint(t);
        const tooth = new THREE.Mesh(
          new THREE.ConeGeometry(0.006, 0.025, 4),
          shellLightMat
        );
        tooth.position.copy(pt);
        tooth.position.x += side * 0.02;
        tooth.rotation.z = side * 0.8;
        headGroup.add(tooth);
      }
    }

    // Antennae — longer, more segmented
    for (const side of [-1, 1]) {
      const antennaRoot = new THREE.Group();
      antennaRoot.position.set(side * 0.08, 0.2, 0.02);
      antennaRoot.rotation.z = side * 0.4;
      antennaRoot.rotation.x = -0.3;
      headGroup.add(antennaRoot);

      const segLen = 0.12;
      let parentSeg = antennaRoot;
      for (let s = 0; s < 4; s++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004 - s * 0.0006, 0.003 - s * 0.0005, segLen, 6),
          shellLightMat
        );
        seg.position.y = segLen / 2;
        parentSeg.add(seg);

        // Joint sphere between segments
        const joint = new THREE.Mesh(
          new THREE.SphereGeometry(0.006 - s * 0.001, 6, 6),
          shellDarkMat
        );
        joint.position.y = segLen / 2;
        seg.add(joint);

        // Next segment attaches to joint
        const nextGroup = new THREE.Group();
        nextGroup.position.y = segLen / 2;
        nextGroup.rotation.z = side * 0.15;
        seg.add(nextGroup);
        parentSeg = nextGroup;
      }

      // Antenna tip glow
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), glowStrongMat);
      tip.position.y = 0;
      parentSeg.add(tip);
    }

    // Four eyes — compound-like, arranged in a diamond pattern
    this.addInsectEyes(headGroup, eyeMat);

    // Brow ridge
    const browRidge = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.012, 0.14, 4, 8),
      shellDarkMat
    );
    browRidge.position.set(0, 0.08, 0.2);
    browRidge.rotation.z = Math.PI / 2;
    headGroup.add(browRidge);

    // Split brow plates for common Face* animations. They read like insect
    // carapace plates instead of human eyebrows.
    const browGeo = new THREE.BoxGeometry(0.075, 0.01, 0.012);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, shellDarkMat);
      brow.position.set(side * 0.085, 0.12, 0.235);
      brow.rotation.z = side * -0.18;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    const eyelidGeo = new THREE.BoxGeometry(0.11, 0.008, 0.012);
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x061126, transparent: true, opacity: 0.42 });
    for (const side of [-1, 1]) {
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.position.set(side * 0.085, 0.035, 0.252);
      eyelid.rotation.z = side * 0.03;
      headGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;
    }

    // Mouth
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.008, 0.015),
      mouthMat
    );
    mouth.position.set(0, -0.12, 0.22);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.1, 16), shellMat);
    neck.position.y = 1.38;
    this.mesh.add(neck);

    // Torso — segmented exoskeleton look
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.42, 20), shellMat);
    torso.position.y = 1.12;
    torso.scale.z = 0.6;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Torso segments (horizontal ridges)
    for (let i = 0; i < 3; i++) {
      const segment = new THREE.Mesh(
        new THREE.TorusGeometry(0.17 - i * 0.01, 0.008, 6, 20),
        shellDarkMat
      );
      segment.rotation.x = Math.PI / 2;
      segment.position.set(0, 1.28 - i * 0.12, 0);
      this.mesh.add(segment);
    }

    // Chest glow
    const chestGlow = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), glowStrongMat);
    chestGlow.position.set(0, 1.2, 0.14);
    this.mesh.add(chestGlow);

    // Abdomen
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.28, 16), shellMat);
    abdomen.position.y = 0.77;
    abdomen.scale.z = 0.55;
    this.mesh.add(abdomen);

    // Stinger / tail — segmented, curved downward
    const stingerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.64, -0.06),
      new THREE.Vector3(0, 0.5, -0.14),
      new THREE.Vector3(0, 0.32, -0.18),
      new THREE.Vector3(0, 0.15, -0.14),
    ]);
    const stingerGeo = new THREE.TubeGeometry(stingerCurve, 12, 0.025, 8, false);
    const stinger = new THREE.Mesh(stingerGeo, shellDarkMat);
    this.mesh.add(stinger);

    // Stinger tip
    const stingerTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.012, 0.06, 6),
      shellLightMat
    );
    stingerTip.position.set(0, 0.12, -0.13);
    stingerTip.rotation.x = 0.4;
    this.mesh.add(stingerTip);

    // Stinger segment rings
    for (let s = 0; s < 4; s++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.028 - s * 0.003, 0.005, 6, 12),
        shellLightMat
      );
      ring.rotation.x = Math.PI / 2;
      const t = 0.2 + s * 0.2;
      const pt = stingerCurve.getPoint(t);
      ring.position.copy(pt);
      this.mesh.add(ring);
    }

    // Wings — larger, more iridescent with color shift
    this.wings = [];
    for (const side of [-1, 1]) {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 0.1, 1.35, -0.1);

      // Wing membrane — larger shape
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.lineTo(side * 0.5, 0.1);
      wingShape.lineTo(side * 0.65, 0.55);
      wingShape.lineTo(side * 0.55, 0.75);
      wingShape.lineTo(side * 0.25, 0.7);
      wingShape.lineTo(0, 0.35);
      wingShape.lineTo(0, 0);

      const wingGeo = new THREE.ShapeGeometry(wingShape);
      const wingIridMat = new THREE.MeshBasicMaterial({
        color: 0x88ccff, transparent: true, opacity: 0.22, side: THREE.DoubleSide,
      });
      const wing = new THREE.Mesh(wingGeo, wingIridMat);
      wingGroup.add(wing);

      // Secondary iridescent layer (color shift)
      const wingShiftMat = new THREE.MeshBasicMaterial({
        color: 0xaa66ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
      });
      const wingShift = new THREE.Mesh(wingGeo, wingShiftMat);
      wingShift.position.z = 0.002;
      wingShift.scale.set(0.95, 0.95, 1);
      wingGroup.add(wingShift);

      // Wing veins — more prominent
      const veinMat = new THREE.MeshBasicMaterial({ color: 0x66aadd, transparent: true, opacity: 0.4 });
      for (let v = 0; v < 5; v++) {
        const vein = new THREE.Mesh(
          new THREE.BoxGeometry(0.0025, 0.3 + v * 0.09, 0.002),
          veinMat
        );
        vein.position.set(side * (0.12 + v * 0.1), 0.22 + v * 0.06, 0);
        vein.rotation.z = side * (0.15 + v * 0.12);
        wingGroup.add(vein);
      }

      this.mesh.add(wingGroup);
      this.wings.push(wingGroup);
    }

    this.addArms(shellMat, shellDarkMat);
    this.addLegs(shellMat, shellDarkMat);
    this._captureFaceBaseState();
  }

  addInsectEyes(headGroup, eyeMat) {
    // Four eyes in diamond pattern — larger, more prominent
    const eyePositions = [
      [-0.085, 0.075, 0.2],   // upper left
      [0.085, 0.075, 0.2],    // upper right
      [-0.095, -0.035, 0.19], // lower left
      [0.095, -0.035, 0.19],  // lower right
    ];

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x88ffee,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const socketRimMat = new THREE.MeshToonMaterial({ color: 0x0a1a3a });

    for (let i = 0; i < 4; i++) {
      const [ex, ey, ez] = eyePositions[i];
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(ex, ey, ez);
      headGroup.add(eyeGroup);

      // Eye socket backing
      const socket = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        socketRimMat
      );
      socket.scale.set(1.2, 1.2, 0.55);
      eyeGroup.add(socket);

      // Compound eye dome with hex texture
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.056, 24, 24), eyeMat);
      eye.scale.set(1, 1, 0.52);
      eye.rotation.y = (ex > 0 ? -1 : 1) * 0.15;
      eyeGroup.add(eye);

      // Wireframe overlay for extra grid readability
      const wire = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 12), wireMat);
      wire.scale.set(1, 1, 0.54);
      wire.rotation.y = eye.rotation.y;
      eyeGroup.add(wire);

      // Raised socket rim
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.006, 6, 18),
        socketRimMat
      );
      rim.position.z = 0.015;
      rim.scale.set(1.25, 1.25, 1);
      eyeGroup.add(rim);

      if (i === 0) this.leftPupil = eye;
      if (i === 1) this.rightPupil = eye;
    }
  }

  addArms(shellMat, shellDarkMat) {
    const addArm = (sx, sy, sz, isRight) => {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(sx, sy, sz);
      shoulderGroup.rotation.set(0, 0, 0);

      const upperLen = 0.25;
      const lowerLen = 0.24;

      // Upper arm — thin, jointed
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, upperLen, 5, 12), shellMat);
      upperArm.position.y = -upperLen / 2;
      shoulderGroup.add(upperArm);

      // Arm segment ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.04, 0.005, 6, 12),
        shellDarkMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -upperLen / 2;
      shoulderGroup.add(ring);

      // Elbow Group
      const elbowGroup = new THREE.Group();
      elbowGroup.position.y = -upperLen - 0.01;
      shoulderGroup.add(elbowGroup);

      const elbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), shellDarkMat);
      elbowMesh.scale.set(1, 0.7, 0.85);
      elbowGroup.add(elbowMesh);

      // Elbow Twist Group
      const elbowTwistGroup = new THREE.Group();
      elbowGroup.add(elbowTwistGroup);

      // Forearm
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, lowerLen, 5, 12), shellMat);
      forearm.position.y = -lowerLen / 2 - 0.02;
      elbowTwistGroup.add(forearm);

      // Wrist Group
      const wristGroup = new THREE.Group();
      wristGroup.position.y = -lowerLen - 0.04;
      elbowTwistGroup.add(wristGroup);

      // Hand — small, clawed
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), shellDarkMat);
      hand.position.y = -0.02;
      hand.scale.set(1, 0.8, 1.05);
      wristGroup.add(hand);

      // Fingers — thin, sharp
      for (let f = 0; f < 3; f++) {
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.008, 0.05, 4, 8),
          shellMat
        );
        const fAngle = (f - 1) * 0.45;
        finger.position.set(Math.sin(fAngle) * 0.025, -0.06, Math.cos(fAngle) * 0.025);
        finger.rotation.x = fAngle;
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

    addArm(-0.22, 1.18, 0, false);
    addArm(0.22, 1.18, 0, true);
  }

  addLegs(shellMat, shellDarkMat) {
    for (const side of [-1, 1]) {
      const hipGroup = new THREE.Group();
      hipGroup.position.set(side * 0.09, 0.84, 0);

      // Thigh — jointed, backward-bending look
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.24, 5, 12), shellMat);
      thigh.position.y = -0.14;
      hipGroup.add(thigh);

      // Thigh joint ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.004, 6, 12),
        shellDarkMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.14;
      hipGroup.add(ring);

      // Knee Group
      const kneeGroup = new THREE.Group();
      kneeGroup.position.set(0, -0.3, 0.02);
      hipGroup.add(kneeGroup);

      const kneeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), shellDarkMat);
      kneeMesh.scale.set(1.05, 0.7, 0.55);
      kneeGroup.add(kneeMesh);

      // Shin
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.24, 5, 12), shellMat);
      shin.position.y = -0.15;
      shin.scale.set(1, 1, 0.8);
      kneeGroup.add(shin);

      // Ankle Group
      const ankleGroup = new THREE.Group();
      ankleGroup.position.y = -0.3;
      kneeGroup.add(ankleGroup);

      // Insect foot — pointed
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), shellDarkMat);
      foot.position.set(0, -0.06, 0.02);
      foot.scale.set(0.9, 0.4, 1.3);
      ankleGroup.add(foot);

      // Foot claw
      const claw = new THREE.Mesh(
        new THREE.ConeGeometry(0.012, 0.05, 6),
        shellDarkMat
      );
      claw.position.set(0, -0.06, 0.1);
      claw.rotation.x = -0.6;
      ankleGroup.add(claw);

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
    // Wing flutter when active
    if (this.wings) {
      const flutter = Math.sin(time * 15) * 0.15;
      for (const wing of this.wings) {
        wing.rotation.z = flutter * (wing.position.x > 0 ? 1 : -1);
      }
    }
  }
}
