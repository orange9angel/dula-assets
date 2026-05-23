import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Shiryu (Dragon Bronze Saint) - Adult Proportions v2
 * Tall muscular build (1.84m), smaller head (realistic 1:7.5 ratio),
 * long straight black hair, sharp composed eyes,
 * green undersuit, bronze Dragon cloth.
 */
export class Shiryu extends CharacterBase {
  constructor() {
    super('Shiryu');
    this.boundingRadius = 0.58;
    this._cosmosActive = false;
  }

  build() {
    const toonGradient = this.createToonGradient();

    const skinMat = new THREE.MeshToonMaterial({ color: 0xe0b888, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a, gradientMap: toonGradient });
    const hairDarkMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const suitMat = new THREE.MeshToonMaterial({ color: 0x1a5e2e, gradientMap: toonGradient });
    const suitDarkMat = new THREE.MeshToonMaterial({ color: 0x0d3016, gradientMap: toonGradient });
    const bronzeMat = new THREE.MeshToonMaterial({
      color: 0x6a8a5a, gradientMap: toonGradient,
      emissive: 0x1a2a10, emissiveIntensity: 0.06,
    });
    const bronzeDarkMat = new THREE.MeshToonMaterial({ color: 0x3a5a2a, gradientMap: toonGradient });
    const goldMat = new THREE.MeshToonMaterial({
      color: 0xc4a840, gradientMap: toonGradient,
      emissive: 0x3a2800, emissiveIntensity: 0.08,
    });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf0f0f0, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x080808, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0x2a4a2a, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x7a2830, gradientMap: toonGradient });

    // ========== HEAD GROUP - SMALLER, MORE REALISTIC ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 3.2; // Tall adult, head at 3.2m

    // Face - smaller, more angular, longer (adult Asian features)
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), skinMat);
    face.scale.set(0.92, 1.2, 0.95); // Taller, narrower face
    face.castShadow = true;
    headGroup.add(face);

    // Chin - stronger, more defined
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 16), skinMat);
    chin.position.set(0, -0.22, 0.11);
    chin.scale.set(0.88, 0.75, 0.88);
    headGroup.add(chin);

    for (const side of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), skinMat);
      jaw.position.set(side * 0.15, -0.15, 0.06);
      jaw.scale.set(0.6, 0.72, 0.68);
      headGroup.add(jaw);
    }

    // Ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), skinMat);
      ear.position.set(side * 0.20, 0.01, 0.02);
      ear.scale.set(0.42, 0.82, 0.48);
      headGroup.add(ear);
    }

    // Hair cap - smaller to match reduced head
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.255, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    hairCap.position.set(0, 0.06, -0.02);
    hairCap.scale.set(1.02, 0.92, 0.9);
    headGroup.add(hairCap);

    // Long back hair - Shiryu signature, flowing down back
    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.75, 6, 14), hairMat);
    backHair.position.set(0, -0.40, -0.18);
    backHair.rotation.x = 0.35;
    backHair.scale.set(1.2, 1, 0.6);
    headGroup.add(backHair);
    this.backHair = backHair;

    // Side hair strands - long, framing face
    for (const side of [-1, 1]) {
      const sideHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.55, 6, 10), hairMat);
      sideHair.position.set(side * 0.24, -0.18, 0.03);
      sideHair.rotation.z = side * 0.12;
      sideHair.scale.set(0.75, 1, 0.5);
      headGroup.add(sideHair);
    }

    // Bangs - straight, sharp, framing face
    const bangSpecs = [
      [-0.16, 0.18, 0.22, 0.3, 0.38],
      [-0.08, 0.22, 0.26, 0.1, 0.44],
      [0.0, 0.24, 0.27, -0.05, 0.48],
      [0.08, 0.22, 0.26, -0.2, 0.44],
      [0.16, 0.18, 0.22, -0.38, 0.38],
    ];
    for (const [x, y, z, rz, h] of bangSpecs) {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.038, h, 4), hairMat);
      bang.position.set(x, y, z);
      bang.rotation.x = -0.55;
      bang.rotation.z = Math.PI + rz;
      bang.scale.set(0.85, 1, 0.55);
      headGroup.add(bang);
    }

    // Dragon Helmet
    this.addHelmet(headGroup, bronzeMat, goldMat);
    this.addEyes(headGroup, whiteMat, irisMat, blackMat);

    // Eyebrows - straight, thick, calm
    const browGeo = new THREE.BoxGeometry(0.08, 0.011, 0.009);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairDarkMat);
      brow.position.set(side * 0.085, 0.12, 0.235);
      brow.rotation.z = side * -0.04;
      headGroup.add(brow);
    }

    // Nose - more prominent
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 5), skinMat);
    nose.position.set(0, -0.04, 0.255);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Mouth - calm, composed, thinner
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.032, -0.10, 0.25),
      new THREE.Vector3(0, -0.105, 0.265),
      new THREE.Vector3(0.032, -0.10, 0.25)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.003, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY - TALLER, MORE MUSCULAR ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 16), skinMat);
    neck.position.y = 3.12;
    this.mesh.add(neck);

    // Torso - broader, more muscular, taller
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.23, 0.55, 20), suitMat);
    torso.position.y = 2.55;
    torso.scale.z = 0.65;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Chest - broader
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), suitMat);
    chest.position.set(0, 2.65, 0.07);
    chest.scale.set(1.15, 0.55, 0.45);
    this.mesh.add(chest);

    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.20, 0.38, 16), suitDarkMat);
    abdomen.position.y = 2.05;
    abdomen.scale.z = 0.58;
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
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.025), bronzeMat);
    band.position.set(0, 0.20, 0.23);
    band.rotation.x = -0.1;
    headGroup.add(band);

    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 4), goldMat);
    crest.position.set(0, 0.30, 0.22);
    crest.rotation.z = Math.PI;
    crest.scale.set(0.7, 1, 0.4);
    headGroup.add(crest);

    const gem = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x44ff66 })
    );
    gem.position.set(0, 0.21, 0.25);
    gem.scale.set(1, 0.85, 0.3);
    headGroup.add(gem);

    for (const side of [-1, 1]) {
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.18, 0.022), bronzeMat);
      guard.position.set(side * 0.19, 0.02, 0.18);
      guard.rotation.z = side * 0.1;
      headGroup.add(guard);

      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.020, 0.14, 6), goldMat);
      horn.position.set(side * 0.22, 0.27, 0.12);
      horn.rotation.z = side * 0.45;
      horn.rotation.x = -0.25;
      headGroup.add(horn);
    }
  }

  addEyes(headGroup, whiteMat, irisMat, blackMat) {
    // SMALLER, MORE SLANTED EYES for adult look
    const eyeGeo = new THREE.SphereGeometry(0.055, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, whiteMat);
      eye.position.set(side * 0.085, 0.04, 0.225);
      eye.scale.set(1.2, 1.15, 0.45); // Less round, more almond-shaped
      headGroup.add(eye);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 14), irisMat);
      iris.position.set(side * 0.085, 0.035, 0.258);
      iris.scale.set(1.0, 1.1, 0.4);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.020, 10, 10), blackMat);
      pupil.position.set(side * 0.085, 0.032, 0.278);
      pupil.scale.set(0.9, 1.1, 0.32);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), whiteMat);
      shine1.position.set(side * 0.072, 0.058, 0.285);
      headGroup.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), whiteMat);
      shine2.position.set(side * 0.095, 0.046, 0.282);
      headGroup.add(shine2);

      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.060, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.22 })
      );
      lidShadow.position.set(side * 0.085, 0.062, 0.23);
      lidShadow.scale.set(1.2, 0.28, 0.45);
      headGroup.add(lidShadow);
    }
  }

  addChestArmor(bronzeMat, bronzeDarkMat, goldMat) {
    const chestGroup = new THREE.Group();
    this.chestArmor = chestGroup;

    const upper = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), bronzeMat);
    upper.position.set(0, 2.80, 0.17);
    upper.scale.set(1.2, 0.6, 0.25);
    chestGroup.add(upper);

    for (const side of [-1, 1]) {
      const breast = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), bronzeMat);
      breast.position.set(side * 0.10, 2.66, 0.19);
      breast.scale.set(1, 0.88, 0.26);
      chestGroup.add(breast);

      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.014), goldMat);
      edge.position.set(side * 0.10, 2.84, 0.25);
      edge.rotation.z = side * -0.22;
      chestGroup.add(edge);
    }

    const centerPlate = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.24, 5), bronzeDarkMat);
    centerPlate.position.set(0, 2.16, 0.21);
    centerPlate.rotation.z = Math.PI;
    centerPlate.scale.set(0.85, 1, 0.25);
    chestGroup.add(centerPlate);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.02, 8, 28), goldMat);
    collar.position.set(0, 3.04, 0.03);
    collar.scale.z = 0.6;
    collar.rotation.x = Math.PI / 2;
    chestGroup.add(collar);

    const throatGuard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.04), bronzeMat);
    throatGuard.position.set(0, 2.96, 0.15);
    throatGuard.rotation.x = -0.18;
    chestGroup.add(throatGuard);

    this.mesh.add(chestGroup);
  }

  addWaistArmor(bronzeMat, bronzeDarkMat, goldMat) {
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.026, 8, 28), goldMat);
    belt.position.y = 1.84;
    belt.scale.z = 0.65;
    belt.rotation.x = Math.PI / 2;
    this.mesh.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.075, 0.032), bronzeDarkMat);
    buckle.position.set(0, 1.86, 0.20);
    buckle.rotation.x = -0.1;
    this.mesh.add(buckle);

    for (const side of [-1, 0, 1]) {
      const panel = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.24, 4), bronzeMat);
      panel.position.set(side * 0.14, 1.52, 0.12 - Math.abs(side) * 0.03);
      panel.rotation.z = Math.PI;
      panel.rotation.y = side * -0.12;
      panel.scale.set(0.78, 1, 0.25);
      this.mesh.add(panel);
    }
  }

  addShoulders(bronzeMat, bronzeDarkMat, goldMat) {
    for (const side of [-1, 1]) {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.30, 2.90, 0);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), bronzeMat);
      dome.scale.set(1.35, 0.52, 0.9);
      dome.rotation.z = side * 0.08;
      dome.castShadow = true;
      shoulderGroup.add(dome);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.016, 8, 22), goldMat);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1.25, 0.65, 0.48);
      shoulderGroup.add(rim);

      for (let i = 0; i < 3; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.10 - i * 0.012, 4), goldMat);
        spike.position.set(side * (0.10 + i * 0.032), 0 - i * 0.016, 0.02);
        spike.rotation.z = side * (0.95 + i * 0.12);
        shoulderGroup.add(spike);
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

      // Hard-coded adult arm proportions (no dynamic scaling)
      const upperLen = 0.70;
      const lowerLen = 0.65;
      const armEnd = upperLen + lowerLen + 0.05;

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, upperLen, 5, 12), suitMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), bronzeDarkMat);
      elbow.position.y = -upperLen - 0.012;
      elbow.scale.set(1, 0.72, 0.88);
      group.add(elbow);

      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, lowerLen, 5, 12), bronzeMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.035;
      forearm.scale.set(1.1, 1, 0.9);
      group.add(forearm);

      const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.060, 0.009, 8, 14), goldMat);
      wrist.position.y = -armEnd + 0.02;
      wrist.rotation.x = Math.PI / 2;
      group.add(wrist);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinMat);
      hand.position.y = -armEnd;
      hand.scale.set(1, 0.9, 1.05);
      group.add(hand);

      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.016, 0.026), goldMat);
      knuckle.position.set(0, -armEnd - 0.005, 0.03);
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

    addArm(-0.28, 2.65, 0, -0.38, 0.90, 0.03, false);
    addArm(0.28, 2.65, 0, 0.38, 0.90, 0.03, true);
  }

  addLegs(suitMat, bronzeMat, bronzeDarkMat, goldMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.12, 1.75, 0);

      // Thigh - thicker, muscular, longer
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.65, 5, 12), suitMat);
      thigh.position.y = -0.35;
      legGroup.add(thigh);

      const thighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.055), bronzeMat);
      thighPlate.position.set(0, -0.35, 0.09);
      thighPlate.rotation.x = -0.1;
      legGroup.add(thighPlate);

      // Knee
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 10), goldMat);
      knee.position.set(0, -0.72, 0.05);
      knee.scale.set(1.1, 0.75, 0.62);
      legGroup.add(knee);

      // Shin - thinner than thigh, longer
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.65, 5, 12), bronzeMat);
      shin.position.y = -1.08;
      shin.scale.set(1, 1, 0.88);
      legGroup.add(shin);

      const shinRidge = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.45, 0.026), bronzeDarkMat);
      shinRidge.position.set(0, -1.08, 0.09);
      legGroup.add(shinRidge);

      // Ankle
      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.013, 8, 14), goldMat);
      ankle.position.y = -1.42;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      // Boot
      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), bronzeDarkMat);
      boot.position.set(0, -1.55, 0.06);
      boot.scale.set(1, 0.52, 1.55);
      legGroup.add(boot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addCosmosAura() {
    this.cosmosGroup = new THREE.Group();
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x5aff7a, transparent: true, opacity: 0.1,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.3,
      depthWrite: false,
    });

    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.70, 20, 16), auraMat);
    aura.position.y = 2.0;
    aura.scale.set(0.78, 1.55, 0.52);
    this.cosmosGroup.add(aura);
    this.cosmosAura = aura;

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32 + i * 0.085, 0.005, 8, 40), ringMat.clone());
      ring.position.y = 1.64 + i * 0.56;
      ring.rotation.x = Math.PI / 2 + i * 0.15;
      ring.rotation.z = i * 0.65;
      this.cosmosGroup.add(ring);
      if (!this.cosmosRings) this.cosmosRings = [];
      this.cosmosRings.push(ring);
    }

    for (let i = 0; i < 10; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.009 + (i % 3) * 0.002, 8, 8), ringMat.clone());
      const a = (i / 10) * Math.PI * 2;
      star.position.set(Math.cos(a) * (0.35 + (i % 2) * 0.14), 1.10 + (i % 5) * 0.44, Math.sin(a) * 0.16);
      star.userData.baseY = star.position.y;
      this.cosmosGroup.add(star);
      if (!this.cosmosStars) this.cosmosStars = [];
      this.cosmosStars.push(star);
    }

    this.mesh.add(this.cosmosGroup);
  }

  addCape() {
    const capeMat = new THREE.MeshToonMaterial({
      color: 0x1a3a1a, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });
    const capeDarkMat = new THREE.MeshToonMaterial({
      color: 0x0d1f0d, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });

    this.capeGroup = new THREE.Group();
    this.capeGroup.position.set(0, 2.96, -0.13);

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
      const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), claspMat);
      clasp.position.set(side * 0.22, 0, 0.02);
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

    if (this.cosmosAura) {
      const pulse = 0.08 + Math.sin(time * 3.2) * 0.03;
      this.cosmosAura.material.opacity = this._cosmosActive ? pulse : 0;
      this.cosmosAura.scale.set(0.78 + Math.sin(time * 2.6) * 0.025, 1.55 + Math.sin(time * 2.1) * 0.05, 0.52);
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
