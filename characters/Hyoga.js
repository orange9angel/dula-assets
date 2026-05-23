import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Hyoga (Cygnus Bronze Saint) - Adult Proportions v2
 * Tall slim elegant build (1.82m), smaller head (realistic ratio),
 * swept blonde hair, cool sharp blue eyes,
 * blue undersuit, silver-white Cygnus cloth with swan motifs.
 */
export class Hyoga extends CharacterBase {
  constructor() {
    super('Hyoga');
    this.boundingRadius = 0.55;
    this._cosmosActive = false;
  }

  build() {
    const toonGradient = this.createToonGradient();

    const skinMat = new THREE.MeshToonMaterial({ color: 0xf0d8c8, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0xe8d870, gradientMap: toonGradient });
    const hairDarkMat = new THREE.MeshToonMaterial({ color: 0xb8a840, gradientMap: toonGradient });
    const suitMat = new THREE.MeshToonMaterial({ color: 0x1a3a7a, gradientMap: toonGradient });
    const suitDarkMat = new THREE.MeshToonMaterial({ color: 0x0d1f4a, gradientMap: toonGradient });
    const silverMat = new THREE.MeshToonMaterial({
      color: 0xd0e0f0, gradientMap: toonGradient,
      emissive: 0x1a2a3a, emissiveIntensity: 0.1,
    });
    const silverDarkMat = new THREE.MeshToonMaterial({ color: 0x90a0b0, gradientMap: toonGradient });
    const iceMat = new THREE.MeshToonMaterial({
      color: 0xe8f4ff, gradientMap: toonGradient,
      emissive: 0x4a6a8a, emissiveIntensity: 0.12,
    });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf8f8ff, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0x3a5a9a, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x7a2830, gradientMap: toonGradient });

    // ========== HEAD GROUP - SMALLER, MORE REALISTIC ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 3.1; // Tall adult height

    // Face - smaller, elegant, slightly longer (Slavic features)
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.23, 32, 32), skinMat);
    face.scale.set(0.9, 1.22, 0.92); // Taller, refined face
    face.castShadow = true;
    headGroup.add(face);

    // Chin - refined, strong
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), skinMat);
    chin.position.set(0, -0.20, 0.11);
    chin.scale.set(0.85, 0.72, 0.85);
    headGroup.add(chin);

    for (const side of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), skinMat);
      jaw.position.set(side * 0.14, -0.13, 0.06);
      jaw.scale.set(0.58, 0.7, 0.65);
      headGroup.add(jaw);
    }

    // Ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), skinMat);
      ear.position.set(side * 0.19, 0.01, 0.02);
      ear.scale.set(0.42, 0.8, 0.48);
      headGroup.add(ear);
    }

    // Hair cap - blonde, smaller
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.245, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    hairCap.position.set(0, 0.08, -0.02);
    hairCap.scale.set(1.02, 0.92, 0.9);
    headGroup.add(hairCap);

    // Swept back blonde hair
    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.55, 6, 12), hairMat);
    backHair.position.set(0, -0.30, -0.18);
    backHair.rotation.x = 0.3;
    backHair.scale.set(1.15, 1, 0.6);
    headGroup.add(backHair);
    this.backHair = backHair;

    // Side swept hair
    for (const side of [-1, 1]) {
      const sideHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.28, 6, 10), hairMat);
      sideHair.position.set(side * 0.23, -0.08, 0.05);
      sideHair.rotation.z = side * 0.18;
      sideHair.rotation.x = -0.15;
      sideHair.scale.set(0.82, 1, 0.5);
      headGroup.add(sideHair);
    }

    // Bangs - swept to side, elegant
    const bangSpecs = [
      [-0.15, 0.20, 0.23, 0.42, 0.38],
      [-0.07, 0.24, 0.27, 0.12, 0.44],
      [0.01, 0.26, 0.28, -0.08, 0.48],
      [0.10, 0.24, 0.26, -0.32, 0.44],
      [0.17, 0.20, 0.23, -0.55, 0.38],
    ];
    for (const [x, y, z, rz, h] of bangSpecs) {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.038, h, 4), hairMat);
      bang.position.set(x, y, z);
      bang.rotation.x = -0.55;
      bang.rotation.z = Math.PI + rz;
      bang.scale.set(0.85, 1, 0.55);
      headGroup.add(bang);
    }

    // Cygnus Helmet
    this.addHelmet(headGroup, silverMat, iceMat);
    this.addEyes(headGroup, whiteMat, irisMat, blackMat);

    // Eyebrows - thin, cool, arched
    const browGeo = new THREE.BoxGeometry(0.075, 0.010, 0.008);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairDarkMat);
      brow.position.set(side * 0.08, 0.115, 0.238);
      brow.rotation.z = side * -0.06;
      headGroup.add(brow);
    }

    // Nose - refined, prominent
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.048, 5), skinMat);
    nose.position.set(0, -0.04, 0.255);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Mouth - cool, slight frown, thinner
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.028, -0.098, 0.255),
      new THREE.Vector3(0, -0.104, 0.27),
      new THREE.Vector3(0.028, -0.098, 0.255)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.003, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY - SLIM ELEGANT BUILD ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.058, 0.08, 16), skinMat);
    neck.position.y = 3.02;
    this.mesh.add(neck);

    // Torso - slim, elegant, taller
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.19, 0.52, 20), suitMat);
    torso.position.y = 2.42;
    torso.scale.z = 0.62;
    torso.castShadow = true;
    this.mesh.add(torso);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), suitMat);
    chest.position.set(0, 2.55, 0.06);
    chest.scale.set(1.1, 0.52, 0.42);
    this.mesh.add(chest);

    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.17, 0.34, 16), suitDarkMat);
    abdomen.position.y = 1.55;
    abdomen.scale.z = 0.55;
    this.mesh.add(abdomen);

    this.addChestArmor(silverMat, silverDarkMat, iceMat);
    this.addWaistArmor(silverMat, silverDarkMat, iceMat);
    this.addShoulders(silverMat, silverDarkMat, iceMat);
    this.addArms(skinMat, suitMat, silverMat, silverDarkMat, iceMat);
    this.addLegs(suitMat, silverMat, silverDarkMat, iceMat);
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

  addHelmet(headGroup, silverMat, iceMat) {
    // Low-profile forehead band
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.022), silverMat);
    band.position.set(0, 0.18, 0.23);
    band.rotation.x = -0.1;
    headGroup.add(band);

    // Small flat crest - swan diamond shape, low height
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), iceMat);
    crest.position.set(0, 0.22, 0.23);
    crest.rotation.z = Math.PI;
    crest.scale.set(0.8, 0.6, 0.35);
    headGroup.add(crest);

    // Small gem
    const gem = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xaaddff })
    );
    gem.position.set(0, 0.19, 0.25);
    gem.scale.set(1, 0.8, 0.3);
    headGroup.add(gem);

    for (const side of [-1, 1]) {
      // Side guard - minimal
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.015), silverMat);
      guard.position.set(side * 0.17, 0.02, 0.18);
      guard.rotation.z = side * 0.06;
      headGroup.add(guard);

      // Swan wing - flat, swept back
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.04), iceMat);
      wing.position.set(side * 0.24, 0.20, 0.13);
      wing.rotation.z = side * 0.2;
      wing.rotation.y = side * 0.2;
      headGroup.add(wing);
    }
  }

  addEyes(headGroup, whiteMat, irisMat, blackMat) {
    // SMALLER, MORE ALMOND-SHAPED for adult look
    const eyeGeo = new THREE.SphereGeometry(0.052, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, whiteMat);
      eye.position.set(side * 0.082, 0.035, 0.225);
      eye.scale.set(1.15, 1.18, 0.45); // Less round
      headGroup.add(eye);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.033, 14, 14), irisMat);
      iris.position.set(side * 0.082, 0.03, 0.258);
      iris.scale.set(1.0, 1.12, 0.4);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), blackMat);
      pupil.position.set(side * 0.082, 0.027, 0.278);
      pupil.scale.set(0.9, 1.12, 0.32);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), whiteMat);
      shine1.position.set(side * 0.068, 0.055, 0.285);
      headGroup.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), whiteMat);
      shine2.position.set(side * 0.09, 0.044, 0.282);
      headGroup.add(shine2);

      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.058, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.2 })
      );
      lidShadow.position.set(side * 0.082, 0.06, 0.23);
      lidShadow.scale.set(1.15, 0.26, 0.42);
      headGroup.add(lidShadow);
    }
  }

  addChestArmor(silverMat, silverDarkMat, iceMat) {
    const chestGroup = new THREE.Group();
    this.chestArmor = chestGroup;

    const upper = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), silverMat);
    upper.position.set(0, 2.66, 0.16);
    upper.scale.set(1.15, 0.58, 0.24);
    chestGroup.add(upper);

    for (const side of [-1, 1]) {
      const breast = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), silverMat);
      breast.position.set(side * 0.10, 2.52, 0.18);
      breast.scale.set(1, 0.88, 0.26);
      chestGroup.add(breast);

      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.014), iceMat);
      edge.position.set(side * 0.10, 2.70, 0.24);
      edge.rotation.z = side * -0.22;
      chestGroup.add(edge);
    }

    const centerPlate = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.24, 5), silverDarkMat);
    centerPlate.position.set(0, 2.16, 0.20);
    centerPlate.rotation.z = Math.PI;
    centerPlate.scale.set(0.82, 1, 0.24);
    chestGroup.add(centerPlate);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 26), iceMat);
    collar.position.set(0, 2.90, 0.03);
    collar.scale.z = 0.58;
    collar.rotation.x = Math.PI / 2;
    chestGroup.add(collar);

    const throatGuard = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.038), silverMat);
    throatGuard.position.set(0, 2.82, 0.14);
    throatGuard.rotation.x = -0.18;
    chestGroup.add(throatGuard);

    this.mesh.add(chestGroup);
  }

  addWaistArmor(silverMat, silverDarkMat, iceMat) {
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.024, 8, 26), iceMat);
    belt.position.y = 1.80;
    belt.scale.z = 0.62;
    belt.rotation.x = Math.PI / 2;
    this.mesh.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.07, 0.03), silverDarkMat);
    buckle.position.set(0, 1.82, 0.19);
    buckle.rotation.x = -0.1;
    this.mesh.add(buckle);

    for (const side of [-1, 0, 1]) {
      const panel = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 4), silverMat);
      panel.position.set(side * 0.13, 1.50, 0.12 - Math.abs(side) * 0.03);
      panel.rotation.z = Math.PI;
      panel.rotation.y = side * -0.12;
      panel.scale.set(0.75, 1, 0.24);
      this.mesh.add(panel);
    }
  }

  addShoulders(silverMat, silverDarkMat, iceMat) {
    for (const side of [-1, 1]) {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.28, 2.76, 0);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), silverMat);
      dome.scale.set(1.3, 0.5, 0.88);
      dome.rotation.z = side * 0.08;
      dome.castShadow = true;
      shoulderGroup.add(dome);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 22), iceMat);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1.2, 0.62, 0.45);
      shoulderGroup.add(rim);

      for (let i = 0; i < 3; i++) {
        const feather = this.createFeatherShape(iceMat, 0.18 - i * 0.025, 0.065);
        feather.position.set(side * (0.11 + i * 0.038), 0 - i * 0.018, 0.02 - i * 0.01);
        feather.rotation.z = side * (1.0 + i * 0.12);
        feather.rotation.y = side * 0.15;
        feather.scale.x = side;
        shoulderGroup.add(feather);
      }

      this.mesh.add(shoulderGroup);
      if (side === -1) this.leftShoulderArmor = shoulderGroup;
      else this.rightShoulderArmor = shoulderGroup;
    }
  }

  addArms(skinMat, suitMat, silverMat, silverDarkMat, iceMat) {
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      // Hard-coded adult arm proportions (no dynamic scaling)
      const upperLen = 0.68;
      const lowerLen = 0.63;
      const armEnd = upperLen + lowerLen + 0.05;

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, upperLen, 5, 12), suitMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), silverDarkMat);
      elbow.position.y = -upperLen - 0.012;
      elbow.scale.set(1, 0.72, 0.88);
      group.add(elbow);

      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, lowerLen, 5, 12), silverMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.035;
      forearm.scale.set(1.1, 1, 0.9);
      group.add(forearm);

      const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.009, 8, 14), iceMat);
      wrist.position.y = -armEnd + 0.02;
      wrist.rotation.x = Math.PI / 2;
      group.add(wrist);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skinMat);
      hand.position.y = -armEnd;
      hand.scale.set(1, 0.9, 1.05);
      group.add(hand);

      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.015, 0.024), iceMat);
      knuckle.position.set(0, -armEnd - 0.005, 0.028);
      group.add(knuckle);

      this.mesh.add(group);
      if (isRight) {
        this.rightArm = group;
        this.rightArmLength = upperLen + lowerLen;
        this.rightArmBaseZ = group.rotation.z;
      } else {
        this.leftArm = group;
        this.leftArmLength = upperLen + lowerLen;
        this.leftArmBaseZ = group.rotation.z;
      }
    };

    addArm(-0.25, 2.55, 0, -0.36, 0.85, 0.03, false);
    addArm(0.25, 2.55, 0, 0.36, 0.85, 0.03, true);
  }

  addLegs(suitMat, silverMat, silverDarkMat, iceMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.11, 1.65, 0);

      // Thigh - thicker, longer
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.62, 5, 12), suitMat);
      thigh.position.y = -0.33;
      legGroup.add(thigh);

      const thighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.30, 0.05), silverMat);
      thighPlate.position.set(0, -0.33, 0.08);
      thighPlate.rotation.x = -0.1;
      legGroup.add(thighPlate);

      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), iceMat);
      knee.position.set(0, -0.68, 0.04);
      knee.scale.set(1.06, 0.7, 0.55);
      legGroup.add(knee);

      // Shin - thinner than thigh, longer
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.62, 5, 12), silverMat);
      shin.position.y = -1.02;
      shin.scale.set(1, 1, 0.85);
      legGroup.add(shin);

      const shinRidge = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.42, 0.022), silverDarkMat);
      shinRidge.position.set(0, -1.02, 0.085);
      legGroup.add(shinRidge);

      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.011, 8, 14), iceMat);
      ankle.position.y = -1.35;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), silverDarkMat);
      boot.position.set(0, -1.48, 0.05);
      boot.scale.set(1, 0.48, 1.45);
      legGroup.add(boot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addCosmosAura() {
    this.cosmosGroup = new THREE.Group();
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.1,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.3,
      depthWrite: false,
    });

    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 16), auraMat);
    aura.position.y = 1.84;
    aura.scale.set(0.75, 1.5, 0.5);
    this.cosmosGroup.add(aura);
    this.cosmosAura = aura;

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3 + i * 0.08, 0.005, 8, 40), ringMat.clone());
      ring.position.y = 1.52 + i * 0.52;
      ring.rotation.x = Math.PI / 2 + i * 0.15;
      ring.rotation.z = i * 0.65;
      this.cosmosGroup.add(ring);
      if (!this.cosmosRings) this.cosmosRings = [];
      this.cosmosRings.push(ring);
    }

    for (let i = 0; i < 10; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.009 + (i % 3) * 0.002, 8, 8), ringMat.clone());
      const a = (i / 10) * Math.PI * 2;
      star.position.set(Math.cos(a) * (0.33 + (i % 2) * 0.13), 1.0 + (i % 5) * 0.4, Math.sin(a) * 0.14);
      star.userData.baseY = star.position.y;
      this.cosmosGroup.add(star);
      if (!this.cosmosStars) this.cosmosStars = [];
      this.cosmosStars.push(star);
    }

    this.mesh.add(this.cosmosGroup);
  }

  addCape() {
    const capeMat = new THREE.MeshToonMaterial({
      color: 0x1a2a4a, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });
    const capeDarkMat = new THREE.MeshToonMaterial({
      color: 0x0d1528, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });

    this.capeGroup = new THREE.Group();
    this.capeGroup.position.set(0, 2.80, -0.13);

    this.capeSegments = [];
    const segmentCount = 6;
    const capeWidth = 0.65;
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

    const claspMat = new THREE.MeshToonMaterial({ color: 0xc8d8e8, gradientMap: this.createToonGradient() });
    for (const side of [-1, 1]) {
      const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), claspMat);
      clasp.position.set(side * 0.22, 0, 0.02);
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
      this.backHair.rotation.z = Math.sin(time * 1.2) * 0.02;
      this.backHair.rotation.x = 0.3 + Math.sin(time * 0.9) * 0.015;
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
      this.cosmosAura.scale.set(0.75 + Math.sin(time * 2.6) * 0.02, 1.5 + Math.sin(time * 2.1) * 0.05, 0.5);
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
