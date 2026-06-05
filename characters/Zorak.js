import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Zorak — 泽拉克星人
 * 类人型外星人，深紫色皮肤，银白色短发，金色竖瞳。
 * 身材精瘦 (~1.75m)，外骨骼装甲覆盖肩部和前臂。
 * 与 Yusuke 完全兼容的 13 点关节结构。
 */
export class Zorak extends CharacterBase {
  constructor() {
    super('Zorak');
    this.boundingRadius = 0.55;
    this.archetypes = ['humanoid', 'fighter', 'athletic', 'alien'];
    this.trustedBodyAnimations = [
      'Walk', 'Run', 'LookAround',
      'LeftPunch', 'RightPunch', 'LeftRightPunchCombo',
      'Kick', 'SpinKick', 'JumpFlyingKick', 'GenocideCutter', 'GalaxyWhirl', 'HeadStomp',
      'DragonPunch', 'RyuHurricaneKick', 'TatsumakiSenpuuKyaku',
      'Block', 'HitStagger', 'Dodge', 'DashForward',
      'PointForward', 'CrossArms', 'FightingStance', 'Crouch', 'TurnAround',
      'Bow', 'ReachOut', 'Nod', 'FaceDetermined', 'CrouchJump',
    ];
    this.allowedBodyAnimations = new Set(this.trustedBodyAnimations);
  }

  build() {
    const toonGradient = this.createToonGradient();

    // Materials
    const skinMat = new THREE.MeshToonMaterial({ color: 0x6a3d8a, gradientMap: toonGradient });
    const skinDarkMat = new THREE.MeshToonMaterial({ color: 0x4a2a6a, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0xc8d0e0, gradientMap: toonGradient });
    const hairDarkMat = new THREE.MeshToonMaterial({ color: 0xa0a8b8, gradientMap: toonGradient });
    const armorMat = new THREE.MeshToonMaterial({ color: 0x2a3a4a, gradientMap: toonGradient });
    const armorLightMat = new THREE.MeshToonMaterial({ color: 0x4a6a8a, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0xffcc00, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0xcc2266, gradientMap: toonGradient });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3 });
    const veinMat = new THREE.MeshBasicMaterial({ color: 0x55aaff, transparent: true, opacity: 0.45 });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.75;

    // Face — elongated alien head, non-human proportions
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), skinMat);
    face.scale.set(0.75, 1.35, 0.9);
    face.castShadow = true;
    headGroup.add(face);

    // Chin — elongated and pointed
    const chin = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), skinMat);
    chin.position.set(0, -0.32, 0.08);
    chin.rotation.x = Math.PI;
    headGroup.add(chin);

    // Jawline ridges
    for (const side of [-1, 1]) {
      const ridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.1, 4, 8), skinDarkMat);
      ridge.position.set(side * 0.16, -0.12, 0.1);
      ridge.rotation.z = side * 0.3;
      headGroup.add(ridge);
    }

    // Ears — pointed alien ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 6), skinDarkMat);
      ear.position.set(side * 0.24, 0.05, -0.02);
      ear.rotation.z = side * -0.4;
      ear.rotation.x = -0.2;
      headGroup.add(ear);
    }

    // Head tendrils — fleshy sensory appendages instead of hair (10, longer)
    this.tendrils = [];
    for (let i = 0; i < 10; i++) {
      const t = (i / 9) * 2 - 1; // spread from -1 to 1
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(t * 0.14, 0.18, -0.05),
        new THREE.Vector3(t * 0.22, 0.32, -0.14),
        new THREE.Vector3(t * 0.18 + (Math.random() - 0.5) * 0.05, 0.48 + Math.random() * 0.12, -0.24),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 10, 0.011 - Math.abs(t) * 0.004, 6, false);
      const tendrilMesh = new THREE.Mesh(tubeGeo, skinDarkMat);
      headGroup.add(tendrilMesh);
      this.tendrils.push(tendrilMesh);
    }

    // Third eye — small, glowing, on forehead
    const thirdEyeGroup = new THREE.Group();
    thirdEyeGroup.position.set(0, 0.18, 0.24);
    const thirdEyeIris = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), irisMat);
    thirdEyeIris.scale.set(1, 1.1, 0.4);
    thirdEyeGroup.add(thirdEyeIris);
    const thirdEyePupil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.015, 6),
      pupilMat
    );
    thirdEyePupil.rotation.x = Math.PI / 2;
    thirdEyePupil.scale.set(1, 1, 0.3);
    thirdEyeGroup.add(thirdEyePupil);
    const thirdEyeGlow = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.25 }));
    thirdEyeGroup.add(thirdEyeGlow);
    headGroup.add(thirdEyeGroup);
    this.thirdEyeGlow = thirdEyeGlow;

    // Eyes — large golden vertical-slit pupils
    this.addAlienEyes(headGroup, irisMat, pupilMat);

    // Eyebrows — thin, arched
    const browGeo = new THREE.BoxGeometry(0.09, 0.012, 0.01);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairDarkMat);
      brow.position.set(side * 0.09, 0.14, 0.26);
      brow.rotation.z = side * 0.15;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Eyelids
    const eyelidGeo = new THREE.BoxGeometry(0.075, 0.007, 0.012);
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x3a2060, transparent: true, opacity: 0.35 });
    for (const side of [-1, 1]) {
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.position.set(side * 0.09, 0.085, 0.265);
      headGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;
    }

    // Breathing slits — no nose, just vertical slits
    for (const side of [-1, 1]) {
      const slit = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.04, 0.005),
        skinDarkMat
      );
      slit.position.set(side * 0.03, -0.02, 0.26);
      headGroup.add(slit);
    }

    // Mouth — elastic alien lip membrane. Kept intentionally non-human, but
    // flatter than the old sphere lips so speech reads as articulation.
    const mouthRoot = new THREE.Group();
    mouthRoot.position.set(0, -0.105, 0.292);
    headGroup.add(mouthRoot);

    const mouthCavity = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 20, 12),
      new THREE.MeshBasicMaterial({ color: 0x14030e })
    );
    mouthCavity.scale.set(0.72, 0.10, 0.18);
    mouthCavity.position.set(0, -0.002, 0);
    mouthRoot.add(mouthCavity);

    const lipGeo = new THREE.CapsuleGeometry(0.006, 0.07, 4, 12);
    const upperLip = new THREE.Mesh(lipGeo, mouthMat);
    upperLip.rotation.z = Math.PI / 2;
    upperLip.scale.set(0.65, 0.82, 0.45);
    upperLip.position.set(0, 0.014, 0.008);
    mouthRoot.add(upperLip);

    const jawPivot = new THREE.Group();
    jawPivot.position.set(0, -0.014, 0.008);
    mouthRoot.add(jawPivot);

    const lowerLip = new THREE.Mesh(lipGeo.clone(), mouthMat);
    lowerLip.rotation.z = Math.PI / 2;
    lowerLip.scale.set(0.72, 0.82, 0.45);
    jawPivot.add(lowerLip);

    const mouthCorners = [];
    for (const side of [-1, 1]) {
      const corner = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 8), mouthMat);
      corner.position.set(side * 0.043, -0.001, 0.008);
      corner.scale.set(0.6, 0.85, 0.4);
      mouthRoot.add(corner);
      mouthCorners.push(corner);
    }

    this.mouth = jawPivot; // animate the jaw pivot
    this.mouthBaseRotationX = 0;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;
    this.mouthRoot = mouthRoot;
    this.upperLip = upperLip;
    this.lowerLip = lowerLip;
    this.mouthCavity = mouthCavity;
    this.mouthCorners = mouthCorners;
    this.zorakMouthBase = {
      jawPos: jawPivot.position.clone(),
      jawRotX: jawPivot.rotation.x,
      upperPos: upperLip.position.clone(),
      upperScale: upperLip.scale.clone(),
      lowerScale: lowerLip.scale.clone(),
      cavityPos: mouthCavity.position.clone(),
      cavityScale: mouthCavity.scale.clone(),
      cornerPositions: mouthCorners.map((corner) => corner.position.clone()),
      cornerScales: mouthCorners.map((corner) => corner.scale.clone()),
    };

    // Forehead ridge — alien feature
    const foreheadRidge = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, 0.15, 4, 8),
      skinDarkMat
    );
    foreheadRidge.position.set(0, 0.16, 0.22);
    foreheadRidge.rotation.z = Math.PI / 2;
    headGroup.add(foreheadRidge);

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.22, 16), skinMat);
    neck.position.y = 1.60;
    this.mesh.add(neck);

    // Torso — fitted alien uniform, dark blue-grey
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.18, 0.5, 20), armorMat);
    torso.position.y = 1.24;
    torso.scale.z = 0.65;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Chest plate — light armor
    const chestPlate = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), armorLightMat);
    chestPlate.position.set(0, 1.34, 0.08);
    chestPlate.scale.set(1.1, 0.5, 0.4);
    this.mesh.add(chestPlate);

    // Chest glow core
    const chestGlow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowMat);
    chestGlow.position.set(0, 1.34, 0.18);
    this.mesh.add(chestGlow);

    // Abdomen
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.3, 16), armorMat);
    abdomen.position.y = 0.84;
    abdomen.scale.z = 0.6;
    this.mesh.add(abdomen);

    // Glowing energy veins — thin emissive lines on torso
    this.veins = [];
    const veinPositions = [
      { x: 0.08, y: 1.10, z: 0.14, ry: 0.2, rz: 0.1 },
      { x: -0.08, y: 1.10, z: 0.14, ry: -0.2, rz: -0.1 },
      { x: 0.10, y: 0.95, z: 0.12, ry: 0.15, rz: 0.05 },
      { x: -0.10, y: 0.95, z: 0.12, ry: -0.15, rz: -0.05 },
      { x: 0.06, y: 1.22, z: 0.13, ry: 0.25, rz: 0.15 },
      { x: -0.06, y: 1.22, z: 0.13, ry: -0.25, rz: -0.15 },
    ];
    for (const v of veinPositions) {
      const vein = new THREE.Mesh(new THREE.CapsuleGeometry(0.004, 0.10, 4, 6), veinMat);
      vein.position.set(v.x, v.y, v.z);
      vein.rotation.y = v.ry;
      vein.rotation.z = v.rz;
      this.mesh.add(vein);
      this.veins.push(vein);
    }

    // Shoulder armor — pronounced spiky exoskeletal plates
    for (const side of [-1, 1]) {
      const shoulderArmor = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 12, 12),
        armorLightMat
      );
      shoulderArmor.position.set(side * 0.32, 1.50, 0);
      shoulderArmor.scale.set(1.1, 0.9, 1.0);
      this.mesh.add(shoulderArmor);

      // Spikes
      for (let s = 0; s < 3; s++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.08, 6), armorLightMat);
        const angle = (s / 2) * Math.PI * 0.6 - Math.PI * 0.3;
        spike.position.set(
          side * (0.38 + Math.cos(angle) * 0.04),
          1.52 + Math.sin(angle) * 0.04,
          Math.sin(angle) * 0.06
        );
        spike.rotation.z = side * -0.6;
        spike.rotation.x = Math.sin(angle) * 0.4;
        this.mesh.add(spike);
      }
    }

    this.addArms(skinMat, armorMat, armorLightMat);
    this.addLegs(armorMat, armorLightMat);
    this._captureFaceBaseState();
  }

  addAlienEyes(headGroup, irisMat, pupilMat) {
    for (const side of [-1, 1]) {
      // Eye white — slightly larger, almond shape
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 16, 16),
        new THREE.MeshToonMaterial({ color: 0xf0f0e0 })
      );
      eye.position.set(side * 0.09, 0.05, 0.25);
      eye.scale.set(1.15, 1.25, 0.45);
      headGroup.add(eye);

      // Iris — golden
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 14), irisMat);
      iris.position.set(side * 0.09, 0.045, 0.285);
      iris.scale.set(1.0, 1.2, 0.35);
      headGroup.add(iris);

      // Pupil — vertical slit
      const pupil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6),
        pupilMat
      );
      pupil.position.set(side * 0.09, 0.045, 0.305);
      pupil.rotation.x = Math.PI / 2;
      pupil.scale.set(1, 1, 0.3);
      headGroup.add(pupil);
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;

      // Eye shine
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      shine.position.set(side * 0.075, 0.065, 0.31);
      headGroup.add(shine);
    }
  }

  addArms(skinMat, armorMat, armorLightMat) {
    const addArm = (sx, sy, sz, isRight) => {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(sx, sy, sz);
      shoulderGroup.rotation.set(0, 0, 0);

      const upperLen = 0.28;
      const lowerLen = 0.26;

      // Upper arm
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, upperLen, 5, 12), skinMat);
      upperArm.position.y = -upperLen / 2;
      shoulderGroup.add(upperArm);

      // Forearm armor plate
      const forearmArmor = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.048, upperLen * 0.6, 5, 12),
        armorLightMat
      );
      forearmArmor.position.y = -upperLen / 2;
      shoulderGroup.add(forearmArmor);

      // Elbow Group
      const elbowGroup = new THREE.Group();
      elbowGroup.position.y = -upperLen - 0.01;
      shoulderGroup.add(elbowGroup);

      const elbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), skinMat);
      elbowMesh.scale.set(1, 0.7, 0.85);
      elbowGroup.add(elbowMesh);

      // Elbow Twist Group
      const elbowTwistGroup = new THREE.Group();
      elbowGroup.add(elbowTwistGroup);

      // Forearm
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, lowerLen, 5, 12), skinMat);
      forearm.position.y = -lowerLen / 2 - 0.02;
      elbowTwistGroup.add(forearm);

      // Wrist Group
      const wristGroup = new THREE.Group();
      wristGroup.position.y = -lowerLen - 0.04;
      elbowTwistGroup.add(wristGroup);

      // Hand — 3-fingered alien hand
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skinMat);
      hand.position.y = -0.03;
      hand.scale.set(1, 0.85, 1.1);
      wristGroup.add(hand);

      // Fingers
      for (let f = 0; f < 3; f++) {
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.012, 0.06, 4, 8),
          skinMat
        );
        const fAngle = (f - 1) * 0.35;
        finger.position.set(Math.sin(fAngle) * 0.03, -0.07, Math.cos(fAngle) * 0.03);
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

    addArm(-0.26, 1.3, 0, false);
    addArm(0.26, 1.3, 0, true);
  }

  addLegs(armorMat, armorLightMat) {
    for (const side of [-1, 1]) {
      const hipGroup = new THREE.Group();
      hipGroup.position.set(side * 0.11, 0.96, 0);

      // Thigh
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 5, 12), armorMat);
      thigh.position.y = -0.16;
      hipGroup.add(thigh);

      // Thigh armor stripe
      const thighStripe = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.035, 0.2, 4, 8),
        armorLightMat
      );
      thighStripe.position.set(0, -0.16, 0.04);
      hipGroup.add(thighStripe);

      // Knee Group
      const kneeGroup = new THREE.Group();
      kneeGroup.position.set(0, -0.34, 0.03);
      hipGroup.add(kneeGroup);

      const kneeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), armorLightMat);
      kneeMesh.scale.set(1.05, 0.7, 0.55);
      kneeGroup.add(kneeMesh);

      // Shin
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.28, 5, 12), armorMat);
      shin.position.y = -0.18;
      shin.scale.set(1, 1, 0.85);
      kneeGroup.add(shin);

      // Ankle Group
      const ankleGroup = new THREE.Group();
      ankleGroup.position.y = -0.34;
      kneeGroup.add(ankleGroup);

      // Alien boots — sleek, pointed
      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), armorLightMat);
      boot.position.set(0, -0.08, 0.02);
      boot.scale.set(1, 0.5, 1.5);
      ankleGroup.add(boot);

      // Boot sole
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.16), armorMat);
      sole.position.set(0, -0.12, 0.02);
      ankleGroup.add(sole);

      // Toe point
      const toe = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 6), armorLightMat);
      toe.position.set(0, -0.08, 0.1);
      toe.rotation.x = -Math.PI / 2;
      toe.scale.set(1, 0.6, 1);
      ankleGroup.add(toe);

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

  animateMouth(time, delta = 1 / 30) {
    if (!this.mouthRoot || !this.zorakMouthBase) {
      super.animateMouth(time, delta);
      return;
    }

    const target = this.getCurrentMouthShape(time);

    if (!this._zorakMouthState) {
      this._zorakMouthState = { lipHeight: 0.25, lipWidth: 0.8, jawOpen: 0 };
    }

    const response = 1 - Math.exp(-Math.max(delta, 1 / 60) * 18);
    this._zorakMouthState.lipHeight += (target.lipHeight - this._zorakMouthState.lipHeight) * response;
    this._zorakMouthState.lipWidth += (target.lipWidth - this._zorakMouthState.lipWidth) * response;
    this._zorakMouthState.jawOpen += (target.jawOpen - this._zorakMouthState.jawOpen) * response;

    const state = this._zorakMouthState;
    const tensionScale = 1 - (this._faceTension || 0) * 0.18;
    const jawOpen = Math.max(0, state.jawOpen * tensionScale);
    const speechPulse = Math.sin(time * 17) * 0.003 * Math.min(1, jawOpen * 2.5);
    const opening = this._clamp(0.004, 0.038, 0.004 + jawOpen * 0.045 + state.lipHeight * 0.004 + speechPulse);
    const widthScale = this._clamp(0.58, 1.34, 0.88 + (state.lipWidth - 1) * 0.32 - jawOpen * 0.06);
    const roundedViseme = state.lipWidth < 0.8;
    const base = this.zorakMouthBase;

    this.mouthRoot.visible = true;

    this.upperLip.position.copy(base.upperPos);
    this.upperLip.position.y += opening * 0.14;
    this.upperLip.scale.set(
      base.upperScale.x * (0.92 + state.lipHeight * 0.08),
      base.upperScale.y * widthScale,
      base.upperScale.z * (roundedViseme ? 1.18 : 1.0)
    );

    this.mouth.position.copy(base.jawPos);
    this.mouth.position.y -= opening * 0.55;
    this.mouth.position.z += opening * 0.08;
    this.mouth.rotation.x = base.jawRotX - jawOpen * 0.10;
    this.lowerLip.scale.set(
      base.lowerScale.x * (0.96 + state.lipHeight * 0.10),
      base.lowerScale.y * widthScale,
      base.lowerScale.z * (roundedViseme ? 1.16 : 1.0)
    );

    this.mouthCavity.position.copy(base.cavityPos);
    this.mouthCavity.position.y -= opening * 0.38;
    this.mouthCavity.scale.set(
      base.cavityScale.x * widthScale * 0.95,
      base.cavityScale.y * (1.0 + opening * 12),
      base.cavityScale.z * (roundedViseme ? 1.24 : 1.02)
    );

    for (let i = 0; i < this.mouthCorners.length; i++) {
      const corner = this.mouthCorners[i];
      const side = i === 0 ? -1 : 1;
      corner.position.copy(base.cornerPositions[i]);
      corner.position.x = side * 0.043 * widthScale;
      corner.position.y -= opening * 0.16;
      corner.scale.copy(base.cornerScales[i]);
      corner.scale.x *= roundedViseme ? 0.75 : 1.0;
      corner.scale.y *= 1.0 + opening * 2.2;
    }
  }

  stopSpeaking() {
    super.stopSpeaking();
    if (!this.zorakMouthBase || !this.upperLip || !this.lowerLip || !this.mouthCavity) return;

    const base = this.zorakMouthBase;
    this.mouth.position.copy(base.jawPos);
    this.mouth.rotation.x = base.jawRotX;
    this.upperLip.position.copy(base.upperPos);
    this.upperLip.scale.copy(base.upperScale);
    this.lowerLip.scale.copy(base.lowerScale);
    this.mouthCavity.position.copy(base.cavityPos);
    this.mouthCavity.scale.copy(base.cavityScale);
    for (let i = 0; i < this.mouthCorners.length; i++) {
      this.mouthCorners[i].position.copy(base.cornerPositions[i]);
      this.mouthCorners[i].scale.copy(base.cornerScales[i]);
    }
    this._zorakMouthState = null;
  }

  _clamp(min, max, value) {
    return Math.max(min, Math.min(max, value));
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
    // Subtle idle — chest glow pulse
    // Tendril glow pulse
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
    if (this.tendrils) {
      for (let i = 0; i < this.tendrils.length; i++) {
        const t = this.tendrils[i];
        const phase = i * 0.6;
        const p = 0.5 + 0.5 * Math.sin(time * 2.5 + phase);
        t.material.emissive = new THREE.Color(0x3a2060);
        t.material.emissiveIntensity = p * 0.35;
      }
    }
    // Third eye glow pulse
    if (this.thirdEyeGlow) {
      this.thirdEyeGlow.material.opacity = 0.15 + pulse * 0.25;
    }
    // Energy veins pulse
    if (this.veins) {
      for (let i = 0; i < this.veins.length; i++) {
        const v = this.veins[i];
        const phase = i * 0.9;
        const p = 0.5 + 0.5 * Math.sin(time * 3.0 + phase);
        v.material.opacity = 0.2 + p * 0.35;
      }
    }
  }
}
