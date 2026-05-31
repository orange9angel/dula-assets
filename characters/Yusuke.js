import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Yusuke Urameshi (浦饭幽助) - Yu Yu Hakusho Main Protagonist
 * Delinquent-turned-Spirit-Detective. Green school uniform (gakuran),
 * messy black spiky hair, sharp brown eyes, fingerless gloves.
 * Slightly slouched posture, lean athletic build (~1.72m).
 */
export class Yusuke extends CharacterBase {
  constructor() {
    super('Yusuke');
    this.boundingRadius = 0.55;
    this._spiritActive = true;
    this.archetypes = ['humanoid', 'fighter', 'athletic', 'delinquent'];
  }

  build() {
    const toonGradient = this.createToonGradient();

    // Materials
    const skinMat = new THREE.MeshToonMaterial({ color: 0xe8b890, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a, gradientMap: toonGradient });
    const hairDarkMat = new THREE.MeshToonMaterial({ color: 0x0d0d0d, gradientMap: toonGradient });
    const uniformMat = new THREE.MeshToonMaterial({ color: 0x2a5a3a, gradientMap: toonGradient });
    const uniformDarkMat = new THREE.MeshToonMaterial({ color: 0x1a3a24, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf5f5f5, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0x5a3a1a, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x8a3a40, gradientMap: toonGradient });
    const gloveMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a, gradientMap: toonGradient });
    const gloveDarkMat = new THREE.MeshToonMaterial({ color: 0x0d0d0d, gradientMap: toonGradient });
    const shoeMat = new THREE.MeshToonMaterial({ color: 0xf0f0f0, gradientMap: toonGradient });
    const shoeDarkMat = new THREE.MeshToonMaterial({ color: 0x8a8a8a, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.72;

    // Face - slightly angular, youthful delinquent
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 32), skinMat);
    face.scale.set(0.9, 1.12, 0.94);
    face.castShadow = true;
    headGroup.add(face);

    // Chin
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), skinMat);
    chin.position.set(0, -0.2, 0.11);
    chin.scale.set(0.82, 0.72, 0.88);
    headGroup.add(chin);

    // Jawline
    for (const side of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), skinMat);
      jaw.position.set(side * 0.17, -0.14, 0.07);
      jaw.scale.set(0.6, 0.8, 0.7);
      headGroup.add(jaw);
    }

    // Ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), skinMat);
      ear.position.set(side * 0.25, 0.02, 0.01);
      ear.scale.set(0.45, 0.85, 0.5);
      headGroup.add(ear);
    }

    // Hair cap - messy, shorter than Seiya
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hairCap.position.set(0, 0.08, -0.02);
    hairCap.scale.set(1.0, 0.88, 0.88);
    headGroup.add(hairCap);

    // Back hair - short, messy spikes
    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.28, 6, 12), hairMat);
    backHair.position.set(0, -0.08, -0.18);
    backHair.rotation.x = 0.35;
    backHair.scale.set(1.15, 1, 0.6);
    headGroup.add(backHair);
    this.backHair = backHair;

    // Sideburns
    for (const side of [-1, 1]) {
      const sideburn = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.12, 4, 8), hairDarkMat);
      sideburn.position.set(side * 0.22, -0.06, 0.1);
      sideburn.rotation.z = side * 0.15;
      headGroup.add(sideburn);
    }

    // Yusuke's messy bangs - shorter, more chaotic than Seiya
    const bangSpecs = [
      [-0.18, 0.22, 0.25, 0.55, 0.42],
      [-0.08, 0.26, 0.29, 0.25, 0.48],
      [0.0, 0.28, 0.3, -0.1, 0.5],
      [0.08, 0.26, 0.29, -0.35, 0.48],
      [0.18, 0.22, 0.25, -0.6, 0.42],
      [-0.22, 0.16, 0.16, 0.8, 0.35],
      [0.22, 0.16, 0.16, -0.8, 0.35],
      [-0.12, 0.2, 0.22, 0.4, 0.38],
      [0.12, 0.2, 0.22, -0.4, 0.38],
    ];
    for (const [x, y, z, rz, h] of bangSpecs) {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.04, h, 4), hairMat);
      bang.position.set(x, y, z);
      bang.rotation.x = -0.55;
      bang.rotation.z = Math.PI + rz;
      bang.scale.set(0.9, 1, 0.5);
      headGroup.add(bang);
    }

    // Top spikes - messy/delinquent style, shorter and wilder
    for (let i = 0; i < 12; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22 + (i % 3) * 0.025, 4), hairDarkMat);
      const angle = -Math.PI * 0.95 + (i / 11) * Math.PI * 1.9;
      spike.position.set(
        Math.cos(angle) * 0.22,
        0.28 + Math.sin(i * 1.1) * 0.025,
        Math.sin(angle) * 0.09 - 0.02
      );
      spike.rotation.z = -angle * 0.6;
      spike.rotation.x = -0.5 + (i % 2) * 0.1;
      headGroup.add(spike);
    }

    // Eyes - sharp, determined, slightly narrowed (delinquent look)
    this.addEyes(headGroup, whiteMat, irisMat, blackMat);

    // Eyebrows - thick, slightly angled down (tough expression)
    const browGeo = new THREE.BoxGeometry(0.1, 0.015, 0.012);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairDarkMat);
      brow.position.set(side * 0.1, 0.13, 0.26);
      brow.rotation.z = side * -0.2;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Eyelids - thin boxes above each eye
    const eyelidGeo = new THREE.BoxGeometry(0.08, 0.008, 0.015);
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.35 });
    for (const side of [-1, 1]) {
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.position.set(side * 0.095, 0.075, 0.265);
      headGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;
    }

    // Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.055, 5), skinMat);
    nose.position.set(0, -0.03, 0.28);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Mouth - confident, slight smirk
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.04, -0.1, 0.275),
      new THREE.Vector3(0, -0.11, 0.29),
      new THREE.Vector3(0.045, -0.095, 0.275)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.004, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY - Lean Athletic Build ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 16), skinMat);
    neck.position.y = 1.52;
    this.mesh.add(neck);

    // Torso - gakuran jacket, slightly slouched
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 0.5, 20), uniformMat);
    torso.position.y = 1.22;
    torso.scale.z = 0.68;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Chest - slight definition under uniform
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), uniformMat);
    chest.position.set(0, 1.32, 0.07);
    chest.scale.set(1.08, 0.55, 0.45);
    this.mesh.add(chest);

    // Abdomen
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.17, 0.32, 16), uniformDarkMat);
    abdomen.position.y = 0.82;
    abdomen.scale.z = 0.62;
    this.mesh.add(abdomen);

    // White undershirt visible at collar
    const undershirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.06, 12),
      whiteMat
    );
    undershirt.position.set(0, 1.48, 0.04);
    undershirt.rotation.x = -0.15;
    this.mesh.add(undershirt);

    // Jacket collar (gakuran style - standing collar)
    for (const side of [-1, 1]) {
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.025), uniformDarkMat);
      collar.position.set(side * 0.08, 1.48, 0.08);
      collar.rotation.z = side * 0.12;
      collar.rotation.x = -0.1;
      this.mesh.add(collar);
    }

    // Jacket buttons (gold)
    for (let i = 0; i < 3; i++) {
      const button = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 8, 8),
        new THREE.MeshToonMaterial({ color: 0xc4a030, gradientMap: toonGradient })
      );
      button.position.set(0, 1.35 - i * 0.12, 0.16);
      button.scale.set(1, 1, 0.5);
      this.mesh.add(button);
    }

    this.addArms(skinMat, uniformMat, gloveMat, gloveDarkMat);
    this.addLegs(uniformMat, uniformDarkMat, shoeMat, shoeDarkMat);
    this.addSpiritAura();
    this.addSpiritGunEffects();
    this._captureFaceBaseState();
  }

  addSpiritGunEffects() {
    // Spirit Gun Orb — blue/white glowing energy ball at right hand fingertip
    this.spiritGunOrb = new THREE.Group();

    // Core: small bright blue emissive sphere
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xaaddff });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), coreMat);
    this.spiritGunOrb.add(core);
    this.spiritGunOrbCore = core;

    // Glow: larger transparent blue sphere
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff, transparent: true, opacity: 0.45, depthWrite: false,
    });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), glowMat);
    this.spiritGunOrb.add(glow);
    this.spiritGunOrbGlow = glow;

    // Outer ring: rotating torus
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 8, 24), ringMat);
    ring.rotation.x = Math.PI / 2;
    this.spiritGunOrb.add(ring);
    this.spiritGunOrbRing = ring;

    this.spiritGunOrb.visible = false;
    // Attach orb to right hand so it follows arm movement
    if (this.rightArm) {
      this.spiritGunOrb.position.set(0, -this.rightArmLength, 0);
      this.rightArm.add(this.spiritGunOrb);
    } else {
      this._pendingOrbAttach = true;
    }

    // Spirit Gun Beam — long thin cylindrical beam
    this.spiritGunBeam = new THREE.Group();

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff, transparent: true, opacity: 0.6, depthWrite: false,
    });
    // Cylinder along Y axis (arm direction), extending forward from hand
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 20, 12), beamMat);
    beam.position.y = -10; // extend in -Y direction (away from hand)
    this.spiritGunBeam.add(beam);
    this.spiritGunBeamMesh = beam;

    // Beam core (brighter inner cylinder)
    const beamCoreMat = new THREE.MeshBasicMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.8, depthWrite: false,
    });
    const beamCore = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 20, 12), beamCoreMat);
    beamCore.position.y = -10;
    this.spiritGunBeam.add(beamCore);
    this.spiritGunBeamCore = beamCore;

    this.spiritGunBeam.visible = false;
    // Attach beam to right hand so it follows arm rotation naturally
    if (this.rightArm) {
      this.spiritGunBeam.position.set(0, -this.rightArmLength, 0);
      this.rightArm.add(this.spiritGunBeam);
    } else {
      this._pendingBeamAttach = true;
    }

    this._spiritGunOrbVisible = false;
    this._spiritGunBeamVisible = false;
    this._spiritGunIntensity = 0;
  }

  showSpiritGunOrb() {
    this._spiritGunOrbVisible = true;
    if (this.spiritGunOrb) this.spiritGunOrb.visible = true;
  }

  hideSpiritGunOrb() {
    this._spiritGunOrbVisible = false;
    if (this.spiritGunOrb) this.spiritGunOrb.visible = false;
  }

  showSpiritGunBeam() {
    this._spiritGunBeamVisible = true;
    if (this.spiritGunBeam) this.spiritGunBeam.visible = true;
  }

  hideSpiritGunBeam() {
    this._spiritGunBeamVisible = false;
    if (this.spiritGunBeam) this.spiritGunBeam.visible = false;
  }

  setSpiritGunIntensity(t) {
    this._spiritGunIntensity = Math.max(0, Math.min(1, t));
    if (this.spiritGunOrb) {
      const s = 0.5 + this._spiritGunIntensity * 1.5;
      this.spiritGunOrb.scale.setScalar(s);
      if (this.spiritGunOrbGlow) {
        this.spiritGunOrbGlow.material.opacity = 0.2 + this._spiritGunIntensity * 0.4;
      }
      if (this.spiritGunOrbRing) {
        this.spiritGunOrbRing.material.opacity = 0.15 + this._spiritGunIntensity * 0.4;
      }
    }
  }

  setSpiritGunBeamExtend(t) {
    this._spiritGunBeamExtend = Math.max(0, Math.min(1, t));
  }

  getSpiritGunMuzzleWorldPosition() {
    const source = this.spiritGunBeam || this.spiritGunOrb || this.rightArm;
    const pos = new THREE.Vector3();

    if (source) {
      source.updateWorldMatrix(true, false);
      source.getWorldPosition(pos);
      return pos;
    }

    pos.copy(this.mesh.position);
    pos.y += 1.15;
    return pos;
  }

  getSpiritGunBeamVolume() {
    if (!this.spiritGunBeam || !this.spiritGunBeam.visible) return null;

    this.spiritGunBeam.updateWorldMatrix(true, false);
    const extend = Math.max(0.01, this._spiritGunBeamExtend ?? 1);
    const start = new THREE.Vector3(0, 0, 0).applyMatrix4(this.spiritGunBeam.matrixWorld);
    const end = new THREE.Vector3(0, -20 * extend, 0).applyMatrix4(this.spiritGunBeam.matrixWorld);
    const scale = new THREE.Vector3();
    this.spiritGunBeam.getWorldScale(scale);
    const radialScale = Math.max(scale.x, scale.z);

    return {
      type: 'capsule',
      source: 'SpiritGunBeam',
      start,
      end,
      radius: 0.16 * radialScale,
      length: start.distanceTo(end),
    };
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

  addEyes(headGroup, whiteMat, irisMat, blackMat) {
    const eyeGeo = new THREE.SphereGeometry(0.068, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, whiteMat);
      eye.position.set(side * 0.095, 0.045, 0.25);
      eye.scale.set(1.1, 1.2, 0.46);
      headGroup.add(eye);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 14), irisMat);
      iris.position.set(side * 0.095, 0.04, 0.288);
      iris.scale.set(1.0, 1.15, 0.4);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), blackMat);
      pupil.position.set(side * 0.095, 0.038, 0.31);
      pupil.scale.set(0.9, 1.15, 0.32);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), whiteMat);
      shine1.position.set(side * 0.08, 0.065, 0.318);
      headGroup.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), whiteMat);
      shine2.position.set(side * 0.105, 0.053, 0.316);
      headGroup.add(shine2);

      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.072, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.25 })
      );
      lidShadow.position.set(side * 0.095, 0.07, 0.255);
      lidShadow.scale.set(1.15, 0.3, 0.48);
      headGroup.add(lidShadow);
    }
  }

  addArms(skinMat, uniformMat, gloveMat, gloveDarkMat) {
    const addArm = (sx, sy, sz, hx, hy, hz, isRight, extraRotY = 0, manualRot = false) => {
      // ── Shoulder Group (上臂根) ──
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(sx, sy, sz);

      if (manualRot) {
        // 手动设置rotation：上臂初始垂直向下（自然下垂）
        // 默认upperArm沿-Y方向，rotation.set(0,0,0)即为垂直向下
        shoulderGroup.rotation.set(0, 0, 0);
      } else {
        shoulderGroup.lookAt(hx, hy, hz);
        shoulderGroup.rotateX(-Math.PI / 2);
        if (extraRotY !== 0) shoulderGroup.rotateY(extraRotY);
      }

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const upperLen = len * 0.45;
      const lowerLen = len * 0.4;

      // Upper arm - gakuran sleeve
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, upperLen, 5, 12), uniformMat);
      upperArm.position.y = -upperLen / 2;
      shoulderGroup.add(upperArm);

      // ── Elbow Group (肘关节 pivot) ──
      // elbowGroup 控制 rx/rz（弯曲）
      const elbowGroup = new THREE.Group();
      elbowGroup.position.y = -upperLen - 0.01;
      shoulderGroup.add(elbowGroup);

      // Elbow visual
      const elbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), skinMat);
      elbowMesh.scale.set(1, 0.7, 0.85);
      elbowGroup.add(elbowMesh);

      // ── Elbow Twist Group (肘部扭转 pivot) ──
      // elbowTwistGroup 控制 ry（在水平面内旋转前臂）
      const elbowTwistGroup = new THREE.Group();
      elbowGroup.add(elbowTwistGroup);

      // Forearm - skin showing
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, lowerLen, 5, 12), skinMat);
      forearm.position.y = -lowerLen / 2 - 0.02;
      elbowTwistGroup.add(forearm);

      // ── Wrist Group (腕关节 pivot) ──
      const wristGroup = new THREE.Group();
      wristGroup.position.y = -lowerLen - 0.04;
      elbowTwistGroup.add(wristGroup);

      // Fingerless glove
      const glove = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, lowerLen * 0.45, 5, 12), gloveMat);
      glove.position.y = -lowerLen * 0.22 - 0.01;
      wristGroup.add(glove);

      // Glove cuff
      const gloveCuff = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.008, 8, 14), gloveDarkMat);
      gloveCuff.position.y = -lowerLen * 0.02;
      gloveCuff.rotation.x = Math.PI / 2;
      wristGroup.add(gloveCuff);

      // Hand
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinMat);
      hand.position.y = -lowerLen * 0.55;
      hand.scale.set(1, 0.9, 1.05);
      wristGroup.add(hand);

      // Knuckles
      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.015, 0.025), skinMat);
      knuckle.position.set(0, -lowerLen * 0.55 - 0.005, 0.03);
      wristGroup.add(knuckle);

      this.mesh.add(shoulderGroup);
      if (isRight) {
        this.rightArm = shoulderGroup;
        this.rightElbow = elbowGroup;
        this.rightElbowTwist = elbowTwistGroup;
        this.rightWrist = wristGroup;
        this.rightArmLength = len;
        this.rightArmBaseZ = shoulderGroup.rotation.z;
      } else {
        this.leftArm = shoulderGroup;
        this.leftElbow = elbowGroup;
        this.leftElbowTwist = elbowTwistGroup;
        this.leftWrist = wristGroup;
        this.leftArmLength = len;
        this.leftArmBaseZ = shoulderGroup.rotation.z;
      }
    };

    // Both arms use the same manual neutral basis for pose-matrix punches.
    // The target points are only used to derive equal chain lengths.
    addArm(-0.26, 1.28, 0, -0.83, 1.28, 0, false, 0, true);
    addArm(0.26, 1.28, 0, 0.83, 1.28, 0, true, 0, true);
  }

  addLegs(uniformMat, uniformDarkMat, shoeMat, shoeDarkMat) {
    for (const side of [-1, 1]) {
      // ── Hip Group (髋/大腿根) ──
      // 调整 hip 高度使脚(sole)在 y=0 处接触地面
      // 原 hip 0.62, 链长: thigh(0.16) + knee(0.34) + ankle(0.34) + sole(0.12) = 0.96
      // 新 hip: 0.96, 这样 sole 在 y=0
      const hipGroup = new THREE.Group();
      hipGroup.position.set(side * 0.11, 0.96, 0);

      // Thigh - gakuran pants
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.28, 5, 12), uniformMat);
      thigh.position.y = -0.16;
      hipGroup.add(thigh);

      // ── Knee Group (膝关节 pivot) ──
      const kneeGroup = new THREE.Group();
      kneeGroup.position.set(0, -0.34, 0.03);
      hipGroup.add(kneeGroup);

      // Knee visual
      const kneeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), uniformDarkMat);
      kneeMesh.scale.set(1.05, 0.7, 0.55);
      kneeGroup.add(kneeMesh);

      // Shin - pants continue down
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 5, 12), uniformMat);
      shin.position.y = -0.18;
      shin.scale.set(1, 1, 0.85);
      kneeGroup.add(shin);

      // ── Ankle Group (踝关节 pivot) ──
      const ankleGroup = new THREE.Group();
      ankleGroup.position.y = -0.34;
      kneeGroup.add(ankleGroup);

      // Ankle visual
      const ankleMesh = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 8, 14), uniformDarkMat);
      ankleMesh.rotation.x = Math.PI / 2;
      ankleGroup.add(ankleMesh);

      // Sneaker
      const sneaker = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), shoeMat);
      sneaker.position.set(0, -0.08, 0.01);
      sneaker.scale.set(1, 0.5, 1.45);
      ankleGroup.add(sneaker);

      // Sneaker sole
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.14), shoeDarkMat);
      sole.position.set(0, -0.12, 0.01);
      ankleGroup.add(sole);

      // Sneaker toe cap
      const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), shoeMat);
      toeCap.position.set(0, -0.08, 0.07);
      toeCap.scale.set(1, 0.6, 1.2);
      ankleGroup.add(toeCap);

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

  addSpiritAura() {
    this.spiritGroup = new THREE.Group();
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x44aaff, transparent: true, opacity: 0.1,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.3,
      depthWrite: false,
    });

    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 16), auraMat);
    aura.position.y = 0.9;
    aura.scale.set(0.8, 1.5, 0.55);
    this.spiritGroup.add(aura);
    this.spiritAura = aura;

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33 + i * 0.09, 0.005, 8, 40), ringMat.clone());
      ring.position.y = 0.72 + i * 0.26;
      ring.rotation.x = Math.PI / 2 + i * 0.15;
      ring.rotation.z = i * 0.65;
      this.spiritGroup.add(ring);
      if (!this.spiritRings) this.spiritRings = [];
      this.spiritRings.push(ring);
    }

    for (let i = 0; i < 10; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.01 + (i % 3) * 0.002, 8, 8), ringMat.clone());
      const a = (i / 10) * Math.PI * 2;
      star.position.set(Math.cos(a) * (0.36 + (i % 2) * 0.14), 0.48 + (i % 5) * 0.2, Math.sin(a) * 0.16);
      star.userData.baseY = star.position.y;
      this.spiritGroup.add(star);
      if (!this.spiritStars) this.spiritStars = [];
      this.spiritStars.push(star);
    }

    this.mesh.add(this.spiritGroup);
  }

  showSpiritAura() {
    this._spiritActive = true;
    if (this.spiritGroup) this.spiritGroup.visible = true;
  }

  hideSpiritAura() {
    this._spiritActive = false;
    if (this.spiritGroup) this.spiritGroup.visible = false;
  }

  setBattleStance(active = true) {
    if (!active) {
      if (this.leftArm) this.leftArm.rotation.z = this.leftArmBaseZ || 0;
      if (this.rightArm) this.rightArm.rotation.z = this.rightArmBaseZ || 0;
      if (this.leftArm) this.leftArm.rotation.x = 0;
      if (this.rightArm) this.rightArm.rotation.x = 0;
      return;
    }
    // Boxing stance: hands up guarding face, body angled
    if (this.rightArm) {
      // Right hand forward, guarding face
      this.rightArm.rotation.z = (this.rightArmBaseZ || 0) - 0.2;
      this.rightArm.rotation.x = -1.4; // raised up
    }
    if (this.leftArm) {
      // Left hand back, guarding face
      this.leftArm.rotation.z = (this.leftArmBaseZ || 0) + 0.1;
      this.leftArm.rotation.x = -1.3; // raised up
    }
  }

  update(time, delta) {
    super.update(time, delta);
    const dt = delta || 0;

    // Hair sway - messy delinquent style
    if (this.backHair) {
      this.backHair.rotation.z = Math.sin(time * 1.6) * 0.03;
      this.backHair.rotation.x = 0.35 + Math.sin(time * 1.2) * 0.02;
    }

    // No idle sway — static head for clean motion demo
    // Spirit aura fully disabled for motion demo clarity
    if (this.spiritGroup) {
      this.spiritGroup.visible = false;
    }

    // Late attach Spirit Gun orb if rightArm wasn't ready during build
    if (this._pendingOrbAttach && this.rightArm) {
      this.spiritGunOrb.position.set(0, -this.rightArmLength, 0);
      this.rightArm.add(this.spiritGunOrb);
      this._pendingOrbAttach = false;
    }

    // Late attach Spirit Gun beam if rightArm wasn't ready during build
    if (this._pendingBeamAttach && this.rightArm) {
      this.spiritGunBeam.position.set(0, -this.rightArmLength, 0);
      this.rightArm.add(this.spiritGunBeam);
      this._pendingBeamAttach = false;
    }

    // Animate Spirit Gun orb rotation and pulse when visible
    if (this._spiritGunOrbVisible && this.spiritGunOrb) {
      if (this.spiritGunOrbRing) {
        this.spiritGunOrbRing.rotation.z += dt * 3;
        this.spiritGunOrbRing.rotation.x = Math.PI / 2 + Math.sin(time * 2) * 0.2;
      }
      if (this.spiritGunOrbGlow) {
        const pulse = 0.9 + Math.sin(time * 6) * 0.1;
        this.spiritGunOrbGlow.scale.setScalar(pulse);
      }
    }

    // Animate Spirit Gun beam: flicker + extend animation
    if (this._spiritGunBeamVisible && this.spiritGunBeam) {
      const flicker = 0.85 + Math.sin(time * 20) * 0.1 + Math.sin(time * 47) * 0.05;
      // Beam extends from 0 to full length over time (scale Y since beam extends along Y axis)
      const extendProgress = this._spiritGunBeamExtend || 1.0;
      if (this.spiritGunBeamMesh) {
        this.spiritGunBeamMesh.material.opacity = 0.5 * flicker;
        this.spiritGunBeamMesh.scale.set(flicker, extendProgress, flicker);
      }
      if (this.spiritGunBeamCore) {
        this.spiritGunBeamCore.material.opacity = 0.7 * flicker;
        this.spiritGunBeamCore.scale.set(1, extendProgress, 1);
      }
    }
  }
}
