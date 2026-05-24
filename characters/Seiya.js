import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Seiya (Pegasus Bronze Saint) - Adult Proportions
 * Lean athletic build, spiky brown hair, determined sharp eyes,
 * red undersuit, bronze Pegasus cloth with winged helmet and chest plate.
 */
export class Seiya extends CharacterBase {
  constructor() {
    super('Seiya');
    this.boundingRadius = 0.55;
    this._cosmosActive = true;
    this.archetypes = ['humanoid', 'fighter', 'athletic'];
  }

  build() {
    const toonGradient = this.createToonGradient();

    // Materials
    const skinMat = new THREE.MeshToonMaterial({ color: 0xe8b890, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x5a3010, gradientMap: toonGradient });
    const hairDarkMat = new THREE.MeshToonMaterial({ color: 0x3a1e08, gradientMap: toonGradient });
    const suitMat = new THREE.MeshToonMaterial({ color: 0x9a1a2a, gradientMap: toonGradient });
    const suitDarkMat = new THREE.MeshToonMaterial({ color: 0x5a0e18, gradientMap: toonGradient });
    const bronzeMat = new THREE.MeshToonMaterial({
      color: 0xc89430, gradientMap: toonGradient,
      emissive: 0x3a2200, emissiveIntensity: 0.08,
    });
    const bronzeDarkMat = new THREE.MeshToonMaterial({ color: 0x8a6420, gradientMap: toonGradient });
    const goldMat = new THREE.MeshToonMaterial({
      color: 0xe0b840, gradientMap: toonGradient,
      emissive: 0x5a3a00, emissiveIntensity: 0.1,
    });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf5f5f5, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0x5a3a1a, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x8a3a40, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.78;

    // Face - sharper, more angular jaw for Seiya
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), skinMat);
    face.scale.set(0.92, 1.15, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Chin - pointed, determined
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), skinMat);
    chin.position.set(0, -0.22, 0.12);
    chin.scale.set(0.85, 0.75, 0.9);
    headGroup.add(chin);

    // Jawline definition
    for (const side of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), skinMat);
      jaw.position.set(side * 0.18, -0.15, 0.08);
      jaw.scale.set(0.6, 0.8, 0.7);
      headGroup.add(jaw);
    }

    // Ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), skinMat);
      ear.position.set(side * 0.26, 0.02, 0.02);
      ear.scale.set(0.45, 0.85, 0.5);
      headGroup.add(ear);
    }

    // Hair cap
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hairCap.position.set(0, 0.1, -0.03);
    hairCap.scale.set(1.02, 0.92, 0.9);
    headGroup.add(hairCap);

    // Back hair - short spiky
    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.35, 6, 12), hairMat);
    backHair.position.set(0, -0.1, -0.2);
    backHair.rotation.x = 0.3;
    backHair.scale.set(1.1, 1, 0.65);
    headGroup.add(backHair);
    this.backHair = backHair;

    // Seiya's signature spiky bangs - wild and sharp
    const bangSpecs = [
      [-0.2, 0.24, 0.26, 0.5, 0.45],
      [-0.1, 0.28, 0.3, 0.2, 0.52],
      [0.0, 0.3, 0.31, -0.05, 0.55],
      [0.1, 0.28, 0.3, -0.3, 0.52],
      [0.2, 0.24, 0.26, -0.55, 0.45],
      [-0.25, 0.18, 0.18, 0.7, 0.38],
      [0.25, 0.18, 0.18, -0.7, 0.38],
    ];
    for (const [x, y, z, rz, h] of bangSpecs) {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.045, h, 4), hairMat);
      bang.position.set(x, y, z);
      bang.rotation.x = -0.6;
      bang.rotation.z = Math.PI + rz;
      bang.scale.set(0.9, 1, 0.55);
      headGroup.add(bang);
    }

    // Top spikes - Seiya's wild hair
    for (let i = 0; i < 10; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.3, 4), hairDarkMat);
      const angle = -Math.PI * 0.9 + (i / 9) * Math.PI * 1.8;
      spike.position.set(
        Math.cos(angle) * 0.24,
        0.32 + Math.sin(i * 0.8) * 0.03,
        Math.sin(angle) * 0.1 - 0.02
      );
      spike.rotation.z = -angle * 0.5;
      spike.rotation.x = -0.45;
      headGroup.add(spike);
    }

    // Pegasus Helmet
    this.addHelmet(headGroup, bronzeMat, goldMat);

    // Eyes - sharp, determined
    this.addEyes(headGroup, whiteMat, irisMat, blackMat);

    // Eyebrows - thick, angled (determined expression)
    const browGeo = new THREE.BoxGeometry(0.1, 0.015, 0.012);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairDarkMat);
      brow.position.set(side * 0.1, 0.14, 0.27);
      brow.rotation.z = side * -0.25;
      headGroup.add(brow);
    }

    // Nose - sharp
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.06, 5), skinMat);
    nose.position.set(0, -0.03, 0.29);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Mouth - confident slight smirk
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.04, -0.11, 0.285),
      new THREE.Vector3(0, -0.12, 0.3),
      new THREE.Vector3(0.045, -0.105, 0.285)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.004, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY - Adult Athletic Build ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.14, 16), skinMat);
    neck.position.y = 1.58;
    this.mesh.add(neck);

    // Torso - lean athletic, V-shape
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.55, 20), suitMat);
    torso.position.y = 1.28;
    torso.scale.z = 0.7;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Chest muscles definition
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), suitMat);
    chest.position.set(0, 1.38, 0.08);
    chest.scale.set(1.1, 0.6, 0.5);
    this.mesh.add(chest);

    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.35, 16), suitDarkMat);
    abdomen.position.y = 0.88;
    abdomen.scale.z = 0.65;
    this.mesh.add(abdomen);

    this.addChestArmor(bronzeMat, bronzeDarkMat, goldMat);
    this.addWaistArmor(bronzeMat, bronzeDarkMat, goldMat);
    this.addShoulders(bronzeMat, bronzeDarkMat, goldMat);
    this.addArms(skinMat, suitMat, bronzeMat, bronzeDarkMat, goldMat);
    this.addLegs(suitMat, bronzeMat, bronzeDarkMat, goldMat);
    this.addCape();
    this.addCosmosAura();
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

  addHelmet(headGroup, bronzeMat, goldMat) {
    // Headband with wing motif
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.032), bronzeMat);
    band.position.set(0, 0.22, 0.26);
    band.rotation.x = -0.1;
    headGroup.add(band);

    // Center crest - pegasus wing shape
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.2, 4), goldMat);
    crest.position.set(0, 0.33, 0.25);
    crest.rotation.z = Math.PI;
    crest.scale.set(0.7, 1, 0.4);
    headGroup.add(crest);

    // Blue gem
    const gem = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x44aaff })
    );
    gem.position.set(0, 0.23, 0.28);
    gem.scale.set(1, 0.85, 0.3);
    headGroup.add(gem);

    for (const side of [-1, 1]) {
      // Cheek guards
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.028), bronzeMat);
      guard.position.set(side * 0.22, 0.02, 0.2);
      guard.rotation.z = side * 0.1;
      headGroup.add(guard);

      // Pegasus wing on helmet
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 0.24, 0.22, 0.2);
      wingGroup.rotation.z = side * -0.3;
      for (let i = 0; i < 3; i++) {
        const feather = this.createFeatherShape(i === 0 ? goldMat : bronzeMat, 0.14 - i * 0.02, 0.045);
        feather.position.set(side * (0.04 + i * 0.025), 0.02 - i * 0.02, 0);
        feather.rotation.z = side * (0.8 + i * 0.2);
        feather.scale.x = side;
        wingGroup.add(feather);
      }
      headGroup.add(wingGroup);
    }
  }

  addEyes(headGroup, whiteMat, irisMat, blackMat) {
    const eyeGeo = new THREE.SphereGeometry(0.072, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, whiteMat);
      eye.position.set(side * 0.1, 0.05, 0.26);
      eye.scale.set(1.15, 1.25, 0.48);
      headGroup.add(eye);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 14), irisMat);
      iris.position.set(side * 0.1, 0.045, 0.298);
      iris.scale.set(1.05, 1.2, 0.42);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), blackMat);
      pupil.position.set(side * 0.1, 0.042, 0.322);
      pupil.scale.set(0.95, 1.2, 0.35);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), whiteMat);
      shine1.position.set(side * 0.085, 0.07, 0.33);
      headGroup.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), whiteMat);
      shine2.position.set(side * 0.11, 0.058, 0.328);
      headGroup.add(shine2);

      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.25 })
      );
      lidShadow.position.set(side * 0.1, 0.075, 0.265);
      lidShadow.scale.set(1.2, 0.32, 0.5);
      headGroup.add(lidShadow);
    }
  }

  addChestArmor(bronzeMat, bronzeDarkMat, goldMat) {
    const chestGroup = new THREE.Group();
    this.chestArmor = chestGroup;

    // Main chest plate - Pegasus shape
    const upper = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), bronzeMat);
    upper.position.set(0, 1.36, 0.18);
    upper.scale.set(1.2, 0.65, 0.28);
    chestGroup.add(upper);

    for (const side of [-1, 1]) {
      const breast = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), bronzeMat);
      breast.position.set(side * 0.11, 1.3, 0.2);
      breast.scale.set(1, 0.9, 0.3);
      chestGroup.add(breast);

      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.024, 0.016), goldMat);
      edge.position.set(side * 0.11, 1.4, 0.26);
      edge.rotation.z = side * -0.22;
      chestGroup.add(edge);
    }

    // Center V-plate
    const centerPlate = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.26, 5), bronzeDarkMat);
    centerPlate.position.set(0, 1.14, 0.22);
    centerPlate.rotation.z = Math.PI;
    centerPlate.scale.set(0.85, 1, 0.28);
    chestGroup.add(centerPlate);

    // Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 8, 28), goldMat);
    collar.position.set(0, 1.48, 0.03);
    collar.scale.z = 0.65;
    collar.rotation.x = Math.PI / 2;
    chestGroup.add(collar);

    // Throat guard
    const throatGuard = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.045), bronzeMat);
    throatGuard.position.set(0, 1.45, 0.16);
    throatGuard.rotation.x = -0.18;
    chestGroup.add(throatGuard);

    this.mesh.add(chestGroup);
  }

  addWaistArmor(bronzeMat, bronzeDarkMat, goldMat) {
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.028, 8, 28), goldMat);
    belt.position.y = 0.96;
    belt.scale.z = 0.68;
    belt.rotation.x = Math.PI / 2;
    this.mesh.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.035), bronzeDarkMat);
    buckle.position.set(0, 0.97, 0.21);
    buckle.rotation.x = -0.1;
    this.mesh.add(buckle);

    for (const side of [-1, 0, 1]) {
      const panel = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.24, 4), bronzeMat);
      panel.position.set(side * 0.14, 0.8, 0.12 - Math.abs(side) * 0.03);
      panel.rotation.z = Math.PI;
      panel.rotation.y = side * -0.1;
      panel.scale.set(0.75, 1, 0.26);
      this.mesh.add(panel);
    }
  }

  addShoulders(bronzeMat, bronzeDarkMat, goldMat) {
    for (const side of [-1, 1]) {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.3, 1.4, 0);

      // Dome
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), bronzeMat);
      dome.scale.set(1.3, 0.55, 0.9);
      dome.rotation.z = side * 0.08;
      dome.castShadow = true;
      shoulderGroup.add(dome);

      // Rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.016, 8, 22), goldMat);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1.2, 0.68, 0.48);
      shoulderGroup.add(rim);

      // Wing-shaped shoulder extension
      for (let i = 0; i < 3; i++) {
        const wing = this.createFeatherShape(goldMat, 0.2 - i * 0.03, 0.07);
        wing.position.set(side * (0.12 + i * 0.04), 0 - i * 0.02, 0.02 - i * 0.012);
        wing.rotation.z = side * (1.0 + i * 0.1);
        wing.rotation.y = side * 0.15;
        wing.scale.x = side;
        shoulderGroup.add(wing);
      }

      this.mesh.add(shoulderGroup);
      if (side === -1) this.leftShoulderArmor = shoulderGroup;
      else this.rightShoulderArmor = shoulderGroup;
    }
  }

  addArms(skinMat, suitMat, bronzeMat, bronzeDarkMat, goldMat) {
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const upperLen = len * 0.45;
      const lowerLen = len * 0.4;

      // Upper arm - lean muscle
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, upperLen, 5, 12), suitMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      // Elbow
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), bronzeDarkMat);
      elbow.position.y = -upperLen - 0.012;
      elbow.scale.set(1, 0.72, 0.88);
      group.add(elbow);

      // Forearm - slightly thicker for glove
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, lowerLen, 5, 12), bronzeMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.035;
      forearm.scale.set(1.1, 1, 0.9);
      group.add(forearm);

      // Wrist ring
      const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 14), goldMat);
      wrist.position.y = -len + 0.07;
      wrist.rotation.x = Math.PI / 2;
      group.add(wrist);

      // Hand
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 12), skinMat);
      hand.position.y = -len;
      hand.scale.set(1, 0.9, 1.05);
      group.add(hand);

      // Knuckles
      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.028), goldMat);
      knuckle.position.set(0, -len - 0.005, 0.032);
      group.add(knuckle);

      this.mesh.add(group);
      if (isRight) {
        this.rightArm = group;
        this.rightArmLength = len;
        this.rightArmBaseZ = group.rotation.z;
      } else {
        this.leftArm = group;
        this.leftArmLength = len;
        this.leftArmBaseZ = group.rotation.z;
      }
    };

    addArm(-0.28, 1.32, 0, -0.4, 0.76, 0.03, false);
    addArm(0.28, 1.32, 0, 0.4, 0.76, 0.03, true);
  }

  addLegs(suitMat, bronzeMat, bronzeDarkMat, goldMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.12, 0.66, 0);

      // Thigh - athletic
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.3, 5, 12), suitMat);
      thigh.position.y = -0.17;
      legGroup.add(thigh);

      // Thigh plate
      const thighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.18, 0.04), bronzeMat);
      thighPlate.position.set(0, -0.17, 0.07);
      thighPlate.rotation.x = -0.1;
      legGroup.add(thighPlate);

      // Knee
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), goldMat);
      knee.position.set(0, -0.36, 0.04);
      knee.scale.set(1.08, 0.72, 0.58);
      legGroup.add(knee);

      // Shin
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.3, 5, 12), bronzeMat);
      shin.position.y = -0.55;
      shin.scale.set(1, 1, 0.88);
      legGroup.add(shin);

      // Shin ridge
      const shinRidge = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.25, 0.022), bronzeDarkMat);
      shinRidge.position.set(0, -0.55, 0.075);
      legGroup.add(shinRidge);

      // Ankle
      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.011, 8, 14), goldMat);
      ankle.position.y = -0.72;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      // Boot
      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), bronzeDarkMat);
      boot.position.set(0, -0.8, 0.05);
      boot.scale.set(1, 0.52, 1.5);
      legGroup.add(boot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addCosmosAura() {
    this.cosmosGroup = new THREE.Group();
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x67d7ff, transparent: true, opacity: 0.1,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.3,
      depthWrite: false,
    });

    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 16), auraMat);
    aura.position.y = 0.95;
    aura.scale.set(0.8, 1.5, 0.55);
    this.cosmosGroup.add(aura);
    this.cosmosAura = aura;

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33 + i * 0.09, 0.005, 8, 40), ringMat.clone());
      ring.position.y = 0.78 + i * 0.26;
      ring.rotation.x = Math.PI / 2 + i * 0.15;
      ring.rotation.z = i * 0.65;
      this.cosmosGroup.add(ring);
      if (!this.cosmosRings) this.cosmosRings = [];
      this.cosmosRings.push(ring);
    }

    for (let i = 0; i < 10; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.01 + (i % 3) * 0.002, 8, 8), ringMat.clone());
      const a = (i / 10) * Math.PI * 2;
      star.position.set(Math.cos(a) * (0.36 + (i % 2) * 0.14), 0.52 + (i % 5) * 0.2, Math.sin(a) * 0.16);
      star.userData.baseY = star.position.y;
      this.cosmosGroup.add(star);
      if (!this.cosmosStars) this.cosmosStars = [];
      this.cosmosStars.push(star);
    }

    this.mesh.add(this.cosmosGroup);
  }

  addCape() {
    const capeMat = new THREE.MeshToonMaterial({
      color: 0x7a121a, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });
    const capeDarkMat = new THREE.MeshToonMaterial({
      color: 0x3e0a0e, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });

    this.capeGroup = new THREE.Group();
    this.capeGroup.position.set(0, 1.42, -0.14);

    this.capeSegments = [];
    const segmentCount = 6;
    const capeWidth = 0.68;
    const segmentHeight = 0.2;

    for (let i = 0; i < segmentCount; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.y = -i * segmentHeight;

      const w = capeWidth * (1 - i * 0.055);
      const seg = new THREE.Mesh(
        new THREE.PlaneGeometry(w, segmentHeight, 3, 1),
        i < 2 ? capeMat : capeDarkMat
      );
      seg.position.y = -segmentHeight * 0.5;
      segGroup.add(seg);

      this.capeGroup.add(segGroup);
      this.capeSegments.push(segGroup);
    }

    const claspMat = new THREE.MeshToonMaterial({ color: 0xc4a030, gradientMap: this.createToonGradient() });
    for (const side of [-1, 1]) {
      const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), claspMat);
      clasp.position.set(side * 0.24, 0, 0.02);
      this.capeGroup.add(clasp);
    }

    this.mesh.add(this.capeGroup);
  }

  createFeatherShape(material, length, width) {
    const shape = new THREE.Shape();
    shape.moveTo(0, length * 0.5);
    shape.bezierCurveTo(width, length * 0.25, width * 0.78, -length * 0.25, 0, -length * 0.52);
    shape.bezierCurveTo(-width * 0.52, -length * 0.18, -width * 0.42, length * 0.26, 0, length * 0.5);
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
    mesh.material.side = THREE.DoubleSide;
    return mesh;
  }

  showCosmos() {
    this._cosmosActive = true;
    if (this.cosmosGroup) this.cosmosGroup.visible = true;
  }

  hideCosmos() {
    this._cosmosActive = false;
    if (this.cosmosGroup) this.cosmosGroup.visible = false;
  }

  setBattleStance(active = true) {
    if (!active) {
      if (this.leftArm) this.leftArm.rotation.z = this.leftArmBaseZ || 0;
      if (this.rightArm) this.rightArm.rotation.z = this.rightArmBaseZ || 0;
      if (this.leftArm) this.leftArm.rotation.x = 0;
      if (this.rightArm) this.rightArm.rotation.x = 0;
      return;
    }
    if (this.rightArm) {
      this.rightArm.rotation.z = (this.rightArmBaseZ || 0) - 0.6;
      this.rightArm.rotation.x = -0.15;
    }
    if (this.leftArm) {
      this.leftArm.rotation.z = (this.leftArmBaseZ || 0) + 0.4;
      this.leftArm.rotation.x = -0.08;
    }
  }

  update(time, delta) {
    super.update(time, delta);
    const dt = delta || 0;

    if (this.backHair) {
      this.backHair.rotation.z = Math.sin(time * 1.4) * 0.025;
      this.backHair.rotation.x = 0.3 + Math.sin(time * 1.1) * 0.018;
    }

    if (this.capeSegments) {
      for (let i = 0; i < this.capeSegments.length; i++) {
        const seg = this.capeSegments[i];
        const windStrength = 0.07 + i * 0.012;
        const windFreq = 2.0 + i * 0.3;
        seg.rotation.z = Math.sin(time * windFreq + i * 0.5) * windStrength;
        seg.rotation.x = Math.sin(time * windFreq * 0.7 + i * 0.3) * windStrength * 0.5;
      }
    }

    if (this.leftShoulderArmor) this.leftShoulderArmor.rotation.z = Math.sin(time * 1.8) * 0.016;
    if (this.rightShoulderArmor) this.rightShoulderArmor.rotation.z = -Math.sin(time * 1.8) * 0.016;

    if (this.cosmosAura) {
      const pulse = 0.08 + Math.sin(time * 3.2) * 0.03;
      this.cosmosAura.material.opacity = this._cosmosActive ? pulse : 0;
      this.cosmosAura.scale.set(0.8 + Math.sin(time * 2.6) * 0.025, 1.5 + Math.sin(time * 2.1) * 0.05, 0.55);
    }

    if (this.cosmosRings) {
      for (let i = 0; i < this.cosmosRings.length; i++) {
        const ring = this.cosmosRings[i];
        ring.rotation.z += dt * (0.5 + i * 0.18);
        ring.material.opacity = this._cosmosActive ? 0.2 + Math.sin(time * 2.4 + i) * 0.07 : 0;
      }
    }

    if (this.cosmosStars) {
      for (let i = 0; i < this.cosmosStars.length; i++) {
        const star = this.cosmosStars[i];
        star.material.opacity = this._cosmosActive ? 0.22 + Math.abs(Math.sin(time * 4 + i)) * 0.5 : 0;
        star.position.y = star.userData.baseY + Math.sin(time * 1.7 + i) * 0.008;
      }
    }
  }
}
