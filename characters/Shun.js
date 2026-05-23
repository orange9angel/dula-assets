import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Shun (Andromeda Bronze Saint) - Adult Proportions
 * Slim graceful build, long green hair with braids, gentle compassionate eyes,
 * pink undersuit, silver-pink Andromeda cloth with chain accessories.
 */
export class Shun extends CharacterBase {
  constructor() {
    super('Shun');
    this.boundingRadius = 0.53;
    this._cosmosActive = true;
  }

  build() {
    const toonGradient = this.createToonGradient();

    const skinMat = new THREE.MeshToonMaterial({ color: 0xf0e0d0, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x3a8a3a, gradientMap: toonGradient });
    const hairDarkMat = new THREE.MeshToonMaterial({ color: 0x1a5a1a, gradientMap: toonGradient });
    const suitMat = new THREE.MeshToonMaterial({ color: 0x9a3a6a, gradientMap: toonGradient });
    const suitDarkMat = new THREE.MeshToonMaterial({ color: 0x5a1e3a, gradientMap: toonGradient });
    const armorMat = new THREE.MeshToonMaterial({
      color: 0xd0a0c0, gradientMap: toonGradient,
      emissive: 0x2a1a20, emissiveIntensity: 0.06,
    });
    const armorDarkMat = new THREE.MeshToonMaterial({ color: 0x9a6a7a, gradientMap: toonGradient });
    const goldMat = new THREE.MeshToonMaterial({
      color: 0xd4b040, gradientMap: toonGradient,
      emissive: 0x3a2800, emissiveIntensity: 0.08,
    });
    const chainMat = new THREE.MeshToonMaterial({
      color: 0xe0d8d0, gradientMap: toonGradient,
      emissive: 0x2a2018, emissiveIntensity: 0.04,
    });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf8f8f8, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0x4a7a4a, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x8a3a4a, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.76;

    // Face - softer, more delicate, gentle
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 32), skinMat);
    face.scale.set(0.92, 1.15, 0.92);
    face.castShadow = true;
    headGroup.add(face);

    // Chin - soft, rounded
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), skinMat);
    chin.position.set(0, -0.2, 0.11);
    chin.scale.set(0.88, 0.7, 0.85);
    headGroup.add(chin);

    for (const side of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), skinMat);
      jaw.position.set(side * 0.15, -0.13, 0.06);
      jaw.scale.set(0.6, 0.7, 0.65);
      headGroup.add(jaw);
    }

    // Ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), skinMat);
      ear.position.set(side * 0.24, 0.02, 0.02);
      ear.scale.set(0.45, 0.85, 0.5);
      headGroup.add(ear);
    }

    // Hair cap - green
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    hairCap.position.set(0, 0.08, -0.03);
    hairCap.scale.set(1.02, 0.92, 0.9);
    headGroup.add(hairCap);

    // Long green hair with braid hint
    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.6, 6, 14), hairMat);
    backHair.position.set(0, -0.32, -0.2);
    backHair.rotation.x = 0.35;
    backHair.scale.set(1.2, 1, 0.65);
    headGroup.add(backHair);
    this.backHair = backHair;

    // Side braids
    for (const side of [-1, 1]) {
      for (let j = 0; j < 3; j++) {
        const braidSeg = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), hairMat);
        braidSeg.position.set(side * 0.28, -0.08 - j * 0.1, 0.04);
        headGroup.add(braidSeg);
      }
    }

    // Soft bangs
    const bangSpecs = [
      [-0.18, 0.22, 0.24, 0.3, 0.4],
      [-0.08, 0.26, 0.28, 0.08, 0.46],
      [0.0, 0.28, 0.29, -0.05, 0.5],
      [0.08, 0.26, 0.28, -0.2, 0.46],
      [0.18, 0.22, 0.24, -0.38, 0.4],
    ];
    for (const [x, y, z, rz, h] of bangSpecs) {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.042, h, 4), hairMat);
      bang.position.set(x, y, z);
      bang.rotation.x = -0.55;
      bang.rotation.z = Math.PI + rz;
      bang.scale.set(0.85, 1, 0.55);
      headGroup.add(bang);
    }

    // Andromeda Helmet
    this.addHelmet(headGroup, armorMat, goldMat);
    this.addEyes(headGroup, whiteMat, irisMat, blackMat);

    // Eyebrows - gentle, curved
    const browGeo = new THREE.BoxGeometry(0.085, 0.011, 0.009);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairDarkMat);
      brow.position.set(side * 0.085, 0.13, 0.265);
      brow.rotation.z = side * 0.05;
      headGroup.add(brow);
    }

    // Nose - small, delicate
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 5), skinMat);
    nose.position.set(0, -0.03, 0.285);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Mouth - gentle smile
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.032, -0.108, 0.282),
      new THREE.Vector3(0, -0.115, 0.298),
      new THREE.Vector3(0.032, -0.105, 0.282)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.0035, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY - Slim Graceful Build ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.13, 16), skinMat);
    neck.position.y = 1.56;
    this.mesh.add(neck);

    // Torso - slim, graceful
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.52, 20), suitMat);
    torso.position.y = 1.24;
    torso.scale.z = 0.65;
    torso.castShadow = true;
    this.mesh.add(torso);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), suitMat);
    chest.position.set(0, 1.32, 0.06);
    chest.scale.set(1.08, 0.52, 0.42);
    this.mesh.add(chest);

    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.32, 16), suitDarkMat);
    abdomen.position.y = 0.82;
    abdomen.scale.z = 0.58;
    this.mesh.add(abdomen);

    this.addChestArmor(armorMat, armorDarkMat, goldMat);
    this.addWaistArmor(armorMat, armorDarkMat, goldMat);
    this.addShoulders(armorMat, armorDarkMat, goldMat);
    this.addArms(skinMat, suitMat, armorMat, armorDarkMat, goldMat);
    this.addLegs(suitMat, armorMat, armorDarkMat, goldMat);
    this.addChains(chainMat, goldMat);
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

  addHelmet(headGroup, armorMat, goldMat) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.085, 0.028), armorMat);
    band.position.set(0, 0.21, 0.25);
    band.rotation.x = -0.1;
    headGroup.add(band);

    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 4), goldMat);
    crest.position.set(0, 0.32, 0.24);
    crest.rotation.z = Math.PI;
    crest.scale.set(0.7, 1, 0.4);
    headGroup.add(crest);

    // Pink gem
    const gem = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffaadd })
    );
    gem.position.set(0, 0.22, 0.27);
    gem.scale.set(1, 0.85, 0.3);
    headGroup.add(gem);

    for (const side of [-1, 1]) {
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.19, 0.024), armorMat);
      guard.position.set(side * 0.2, 0.02, 0.19);
      guard.rotation.z = side * 0.1;
      headGroup.add(guard);
    }
  }

  addEyes(headGroup, whiteMat, irisMat, blackMat) {
    const eyeGeo = new THREE.SphereGeometry(0.068, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, whiteMat);
      eye.position.set(side * 0.09, 0.045, 0.255);
      eye.scale.set(1.15, 1.22, 0.48);
      headGroup.add(eye);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 14), irisMat);
      iris.position.set(side * 0.09, 0.04, 0.293);
      iris.scale.set(1.05, 1.18, 0.42);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.023, 10, 10), blackMat);
      pupil.position.set(side * 0.09, 0.037, 0.315);
      pupil.scale.set(0.95, 1.18, 0.35);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), whiteMat);
      shine1.position.set(side * 0.075, 0.065, 0.323);
      headGroup.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), whiteMat);
      shine2.position.set(side * 0.1, 0.053, 0.32);
      headGroup.add(shine2);

      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.18 })
      );
      lidShadow.position.set(side * 0.09, 0.068, 0.26);
      lidShadow.scale.set(1.2, 0.28, 0.45);
      headGroup.add(lidShadow);
    }
  }

  addChestArmor(armorMat, armorDarkMat, goldMat) {
    const chestGroup = new THREE.Group();
    this.chestArmor = chestGroup;

    const upper = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), armorMat);
    upper.position.set(0, 1.32, 0.17);
    upper.scale.set(1.15, 0.58, 0.24);
    chestGroup.add(upper);

    for (const side of [-1, 1]) {
      const breast = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), armorMat);
      breast.position.set(side * 0.1, 1.26, 0.19);
      breast.scale.set(1, 0.88, 0.26);
      chestGroup.add(breast);

      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.014), goldMat);
      edge.position.set(side * 0.1, 1.35, 0.25);
      edge.rotation.z = side * -0.2;
      chestGroup.add(edge);
    }

    const centerPlate = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.24, 5), armorDarkMat);
    centerPlate.position.set(0, 1.1, 0.21);
    centerPlate.rotation.z = Math.PI;
    centerPlate.scale.set(0.82, 1, 0.24);
    chestGroup.add(centerPlate);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 26), goldMat);
    collar.position.set(0, 1.44, 0.03);
    collar.scale.z = 0.6;
    collar.rotation.x = Math.PI / 2;
    chestGroup.add(collar);

    const throatGuard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.04), armorMat);
    throatGuard.position.set(0, 1.4, 0.15);
    throatGuard.rotation.x = -0.18;
    chestGroup.add(throatGuard);

    this.mesh.add(chestGroup);
  }

  addWaistArmor(armorMat, armorDarkMat, goldMat) {
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 8, 26), goldMat);
    belt.position.y = 0.93;
    belt.scale.z = 0.65;
    belt.rotation.x = Math.PI / 2;
    this.mesh.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.075, 0.032), armorDarkMat);
    buckle.position.set(0, 0.94, 0.2);
    buckle.rotation.x = -0.1;
    this.mesh.add(buckle);

    for (const side of [-1, 0, 1]) {
      const panel = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), armorMat);
      panel.position.set(side * 0.13, 0.77, 0.12 - Math.abs(side) * 0.03);
      panel.rotation.z = Math.PI;
      panel.rotation.y = side * -0.1;
      panel.scale.set(0.75, 1, 0.24);
      this.mesh.add(panel);
    }
  }

  addShoulders(armorMat, armorDarkMat, goldMat) {
    for (const side of [-1, 1]) {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.28, 1.36, 0);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), armorMat);
      dome.scale.set(1.3, 0.52, 0.88);
      dome.rotation.z = side * 0.08;
      dome.castShadow = true;
      shoulderGroup.add(dome);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.015, 8, 20), goldMat);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1.2, 0.62, 0.45);
      shoulderGroup.add(rim);

      this.mesh.add(shoulderGroup);
      if (side === -1) this.leftShoulderArmor = shoulderGroup;
      else this.rightShoulderArmor = shoulderGroup;
    }
  }

  addArms(skinMat, suitMat, armorMat, armorDarkMat, goldMat) {
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const upperLen = len * 0.45;
      const lowerLen = len * 0.4;

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, upperLen, 5, 12), suitMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), armorDarkMat);
      elbow.position.y = -upperLen - 0.01;
      elbow.scale.set(1, 0.72, 0.88);
      group.add(elbow);

      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, lowerLen, 5, 12), armorMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.03;
      forearm.scale.set(1.1, 1, 0.9);
      group.add(forearm);

      const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.009, 8, 14), goldMat);
      wrist.position.y = -len + 0.06;
      wrist.rotation.x = Math.PI / 2;
      group.add(wrist);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), skinMat);
      hand.position.y = -len;
      hand.scale.set(1, 0.9, 1.05);
      group.add(hand);

      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.016, 0.024), goldMat);
      knuckle.position.set(0, -len - 0.004, 0.028);
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

    addArm(-0.25, 1.28, 0, -0.36, 0.72, 0.03, false);
    addArm(0.25, 1.28, 0, 0.36, 0.72, 0.03, true);
  }

  addLegs(suitMat, armorMat, armorDarkMat, goldMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.11, 0.62, 0);

      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 5, 12), suitMat);
      thigh.position.y = -0.16;
      legGroup.add(thigh);

      const thighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.17, 0.038), armorMat);
      thighPlate.position.set(0, -0.16, 0.065);
      thighPlate.rotation.x = -0.1;
      legGroup.add(thighPlate);

      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), goldMat);
      knee.position.set(0, -0.34, 0.04);
      knee.scale.set(1.06, 0.7, 0.55);
      legGroup.add(knee);

      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.28, 5, 12), armorMat);
      shin.position.y = -0.52;
      shin.scale.set(1, 1, 0.85);
      legGroup.add(shin);

      const shinRidge = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.23, 0.02), armorDarkMat);
      shinRidge.position.set(0, -0.52, 0.075);
      legGroup.add(shinRidge);

      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 8, 14), goldMat);
      ankle.position.y = -0.68;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), armorDarkMat);
      boot.position.set(0, -0.76, 0.05);
      boot.scale.set(1, 0.5, 1.48);
      legGroup.add(boot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addChains(chainMat, goldMat) {
    this.chainGroups = [];
    for (const side of [-1, 1]) {
      const chainGroup = new THREE.Group();
      chainGroup.position.set(side * 0.32, 0.9, 0.05);

      for (let i = 0; i < 7; i++) {
        const link = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 12), chainMat);
        link.position.y = -i * 0.035;
        link.rotation.y = (i % 2) * Math.PI / 2;
        chainGroup.add(link);
      }

      this.mesh.add(chainGroup);
      this.chainGroups.push(chainGroup);
    }
  }

  addCosmosAura() {
    this.cosmosGroup = new THREE.Group();
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffaadd, transparent: true, opacity: 0.1,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.3,
      depthWrite: false,
    });

    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 16), auraMat);
    aura.position.y = 0.9;
    aura.scale.set(0.78, 1.48, 0.52);
    this.cosmosGroup.add(aura);
    this.cosmosAura = aura;

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3 + i * 0.08, 0.005, 8, 40), ringMat.clone());
      ring.position.y = 0.74 + i * 0.24;
      ring.rotation.x = Math.PI / 2 + i * 0.15;
      ring.rotation.z = i * 0.65;
      this.cosmosGroup.add(ring);
      if (!this.cosmosRings) this.cosmosRings = [];
      this.cosmosRings.push(ring);
    }

    for (let i = 0; i < 10; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.009 + (i % 3) * 0.002, 8, 8), ringMat.clone());
      const a = (i / 10) * Math.PI * 2;
      star.position.set(Math.cos(a) * (0.33 + (i % 2) * 0.13), 0.48 + (i % 5) * 0.18, Math.sin(a) * 0.15);
      star.userData.baseY = star.position.y;
      this.cosmosGroup.add(star);
      if (!this.cosmosStars) this.cosmosStars = [];
      this.cosmosStars.push(star);
    }

    this.mesh.add(this.cosmosGroup);
  }

  addCape() {
    const capeMat = new THREE.MeshToonMaterial({
      color: 0x3a1a3a, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });
    const capeDarkMat = new THREE.MeshToonMaterial({
      color: 0x1e0d1e, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });

    this.capeGroup = new THREE.Group();
    this.capeGroup.position.set(0, 1.38, -0.13);

    this.capeSegments = [];
    const segmentCount = 6;
    const capeWidth = 0.62;
    const segmentHeight = 0.18;

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

    const claspMat = new THREE.MeshToonMaterial({ color: 0xd4b040, gradientMap: this.createToonGradient() });
    for (const side of [-1, 1]) {
      const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), claspMat);
      clasp.position.set(side * 0.2, 0, 0.02);
      this.capeGroup.add(clasp);
    }

    this.mesh.add(this.capeGroup);
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
      this.backHair.rotation.x = 0.35 + Math.sin(time * 0.9) * 0.015;
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

    if (this.chainGroups) {
      for (let i = 0; i < this.chainGroups.length; i++) {
        const cg = this.chainGroups[i];
        cg.rotation.z = Math.sin(time * 2 + i) * 0.04;
        cg.rotation.x = Math.sin(time * 1.5 + i * 0.5) * 0.025;
      }
    }

    if (this.cosmosAura) {
      const pulse = 0.08 + Math.sin(time * 3.2) * 0.03;
      this.cosmosAura.material.opacity = this._cosmosActive ? pulse : 0;
      this.cosmosAura.scale.set(0.78 + Math.sin(time * 2.6) * 0.02, 1.48 + Math.sin(time * 2.1) * 0.04, 0.52);
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
