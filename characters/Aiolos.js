import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Aiolos (Sagittarius Gold Saint)
 * Procedural toon mesh: golden armor, large wings, bow, deep red cape.
 * Taller and more imposing than bronze saints.
 */
export class Aiolos extends CharacterBase {
  constructor() {
    super('Aiolos');
    this.boundingRadius = 0.72;
    this._cosmosActive = true;
  }

  build() {
    const toonGradient = this.createToonGradient();

    const skinMat = new THREE.MeshToonMaterial({ color: 0xe0c0a0, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x3a2818, gradientMap: toonGradient });
    const hairDarkMat = new THREE.MeshToonMaterial({ color: 0x1a1208, gradientMap: toonGradient });
    const goldMat = new THREE.MeshToonMaterial({
      color: 0xd4af37,
      gradientMap: toonGradient,
      emissive: 0x4a3500,
      emissiveIntensity: 0.12,
    });
    const goldDarkMat = new THREE.MeshToonMaterial({
      color: 0x9a7a20,
      gradientMap: toonGradient,
      emissive: 0x2a1e00,
      emissiveIntensity: 0.06,
    });
    const goldBrightMat = new THREE.MeshToonMaterial({
      color: 0xf0d060,
      gradientMap: toonGradient,
      emissive: 0x6a5000,
      emissiveIntensity: 0.15,
    });
    const capeMat = new THREE.MeshToonMaterial({
      color: 0x5a0a10,
      gradientMap: toonGradient,
      side: THREE.DoubleSide,
    });
    const capeDarkMat = new THREE.MeshToonMaterial({
      color: 0x2a0508,
      gradientMap: toonGradient,
      side: THREE.DoubleSide,
    });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf0f0f0, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x0a0a12, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0x4a6a3a, gradientMap: toonGradient });

    // Scale factor: taller than Seiya
    const S = 1.15;
    this.mesh.scale.set(S, S, S);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.82;

    const face = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), skinMat);
    face.scale.set(0.96, 1.12, 0.9);
    face.castShadow = true;
    headGroup.add(face);

    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), skinMat);
    chin.position.set(0, -0.2, 0.11);
    chin.scale.set(0.9, 0.72, 0.85);
    headGroup.add(chin);

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), skinMat);
      ear.position.set(side * 0.28, 0.02, 0.02);
      ear.scale.set(0.5, 0.9, 0.55);
      headGroup.add(ear);
    }

    // Hair - longer, more mature
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62),
      hairMat
    );
    hairCap.position.set(0, 0.08, -0.04);
    hairCap.scale.set(1.05, 0.95, 0.92);
    headGroup.add(hairCap);

    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.6, 6, 16), hairMat);
    backHair.position.set(0, -0.25, -0.24);
    backHair.rotation.x = 0.35;
    backHair.scale.set(1.3, 1, 0.7);
    headGroup.add(backHair);
    this.backHair = backHair;

    // Bangs - swept back, mature style
    const bangSpecs = [
      [-0.2, 0.24, 0.26, 0.35, 0.42],
      [-0.1, 0.28, 0.3, 0.1, 0.48],
      [0.0, 0.3, 0.31, -0.1, 0.52],
      [0.1, 0.28, 0.3, -0.3, 0.48],
      [0.2, 0.24, 0.26, -0.5, 0.42],
      [-0.26, 0.18, 0.18, 0.55, 0.36],
      [0.26, 0.18, 0.18, -0.55, 0.36],
    ];
    for (const [x, y, z, rz, h] of bangSpecs) {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.05, h, 4), hairMat);
      bang.position.set(x, y, z);
      bang.rotation.x = -0.5;
      bang.rotation.z = Math.PI + rz;
      bang.scale.set(0.85, 1.0, 0.6);
      headGroup.add(bang);
    }

    // Top spikes
    for (let i = 0; i < 9; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.28, 4), hairDarkMat);
      const angle = -Math.PI * 0.85 + (i / 8) * Math.PI * 1.7;
      spike.position.set(Math.cos(angle) * 0.26, 0.28 + Math.sin(i * 0.7) * 0.03, Math.sin(angle) * 0.12 - 0.03);
      spike.rotation.z = -angle * 0.45;
      spike.rotation.x = -0.4;
      headGroup.add(spike);
    }

    this.addHelmet(headGroup, goldMat, goldBrightMat);
    this.addEyes(headGroup, whiteMat, irisMat, blackMat);

    const browGeo = new THREE.BoxGeometry(0.11, 0.016, 0.014);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairDarkMat);
      brow.position.set(side * 0.1, 0.155, 0.272);
      brow.rotation.z = side * -0.15;
      headGroup.add(brow);
    }

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 5), skinMat);
    nose.position.set(0, -0.025, 0.295);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Serious mouth - thin line, no animation
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.035, -0.11, 0.29),
      new THREE.Vector3(0, -0.12, 0.305),
      new THREE.Vector3(0.035, -0.11, 0.29)
    );
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x6a2228, gradientMap: toonGradient });
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.004, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // Body
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.12, 16), skinMat);
    neck.position.y = 1.59;
    this.mesh.add(neck);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 0.66, 24), capeMat);
    torso.position.y = 1.26;
    torso.scale.z = 0.72;
    torso.castShadow = true;
    this.mesh.add(torso);

    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.27, 0.36, 18), capeDarkMat);
    abdomen.position.y = 0.9;
    abdomen.scale.z = 0.68;
    this.mesh.add(abdomen);

    this.addChestArmor(goldMat, goldDarkMat, goldBrightMat);
    this.addWaistArmor(goldMat, goldDarkMat, goldBrightMat);
    this.addShoulders(goldMat, goldDarkMat, goldBrightMat);
    this.addArms(skinMat, goldMat, goldDarkMat, goldBrightMat);
    this.addLegs(capeMat, goldMat, goldDarkMat, goldBrightMat);
    this.addCape();
    this.addWings(goldMat, goldBrightMat);
    this.addBow(goldMat, goldBrightMat);
    this.addCosmosAura();
  }

  createToonGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 1;
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

  addHelmet(headGroup, goldMat, goldBrightMat) {
    // Crown band
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.04), goldMat);
    band.position.set(0, 0.24, 0.26);
    band.rotation.x = -0.1;
    headGroup.add(band);

    // Center crest - winged
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 4), goldBrightMat);
    crest.position.set(0, 0.36, 0.25);
    crest.rotation.z = Math.PI;
    crest.scale.set(0.8, 1.0, 0.5);
    headGroup.add(crest);

    // Side wings on helmet
    for (const side of [-1, 1]) {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 0.28, 0.28, 0.22);
      wingGroup.rotation.z = side * -0.3;
      for (let i = 0; i < 4; i++) {
        const feather = this.createFeatherShape(i < 2 ? goldBrightMat : goldMat, 0.2 - i * 0.02, 0.06);
        feather.position.set(side * (0.05 + i * 0.025), 0.02 - i * 0.018, 0);
        feather.rotation.z = side * (0.9 + i * 0.18);
        feather.scale.x = side;
        wingGroup.add(feather);
      }
      headGroup.add(wingGroup);
    }

    // Cheek guards
    for (const side of [-1, 1]) {
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.035), goldMat);
      guard.position.set(side * 0.25, 0.02, 0.21);
      guard.rotation.z = side * 0.1;
      guard.rotation.x = -0.06;
      headGroup.add(guard);
    }
  }

  addEyes(headGroup, whiteMat, irisMat, blackMat) {
    const eyeGeo = new THREE.SphereGeometry(0.075, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, whiteMat);
      eye.position.set(side * 0.105, 0.055, 0.268);
      eye.scale.set(1.2, 1.28, 0.5);
      headGroup.add(eye);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.046, 14, 14), irisMat);
      iris.position.set(side * 0.105, 0.05, 0.308);
      iris.scale.set(1.05, 1.22, 0.45);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), blackMat);
      pupil.position.set(side * 0.105, 0.047, 0.333);
      pupil.scale.set(0.95, 1.22, 0.38);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), whiteMat);
      shine1.position.set(side * 0.09, 0.077, 0.341);
      headGroup.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), whiteMat);
      shine2.position.set(side * 0.115, 0.063, 0.338);
      headGroup.add(shine2);

      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.078, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x1a1208, transparent: true, opacity: 0.3 })
      );
      lidShadow.position.set(side * 0.105, 0.08, 0.271);
      lidShadow.scale.set(1.25, 0.35, 0.55);
      headGroup.add(lidShadow);
    }
  }

  addChestArmor(goldMat, goldDarkMat, goldBrightMat) {
    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0;
    this.chestArmor = chestGroup;

    const upper = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), goldMat);
    upper.position.set(0, 1.41, 0.2);
    upper.scale.set(1.3, 0.72, 0.32);
    chestGroup.add(upper);

    for (const side of [-1, 1]) {
      const breast = new THREE.Mesh(new THREE.SphereGeometry(0.155, 20, 14), goldMat);
      breast.position.set(side * 0.13, 1.34, 0.225);
      breast.scale.set(1.05, 0.95, 0.35);
      chestGroup.add(breast);

      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.02), goldBrightMat);
      edge.position.set(side * 0.13, 1.45, 0.285);
      edge.rotation.z = side * -0.24;
      chestGroup.add(edge);
    }

    const centerPlate = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 5), goldDarkMat);
    centerPlate.position.set(0, 1.18, 0.245);
    centerPlate.rotation.z = Math.PI;
    centerPlate.scale.set(0.9, 1, 0.35);
    chestGroup.add(centerPlate);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.028, 8, 32), goldBrightMat);
    collar.position.set(0, 1.54, 0.04);
    collar.scale.z = 0.68;
    collar.rotation.x = Math.PI / 2;
    chestGroup.add(collar);

    const throatGuard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.055), goldMat);
    throatGuard.position.set(0, 1.5, 0.17);
    throatGuard.rotation.x = -0.2;
    chestGroup.add(throatGuard);

    // Sagittarius star emblem
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), goldBrightMat);
    star.position.set(0, 1.36, 0.325);
    star.scale.set(1.3, 1.0, 0.25);
    chestGroup.add(star);

    this.mesh.add(chestGroup);
  }

  addWaistArmor(goldMat, goldDarkMat, goldBrightMat) {
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.035, 8, 32), goldBrightMat);
    belt.position.y = 0.98;
    belt.scale.z = 0.72;
    belt.rotation.x = Math.PI / 2;
    this.mesh.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.045), goldDarkMat);
    buckle.position.set(0, 0.99, 0.23);
    buckle.rotation.x = -0.1;
    this.mesh.add(buckle);

    for (const side of [-1, 0, 1]) {
      const panel = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 4), goldMat);
      panel.position.set(side * 0.16, 0.82, 0.14 - Math.abs(side) * 0.04);
      panel.rotation.z = Math.PI;
      panel.rotation.y = side * -0.12;
      panel.scale.set(0.8, 1, 0.3);
      this.mesh.add(panel);
    }
  }

  addShoulders(goldMat, goldDarkMat, goldBrightMat) {
    for (const side of [-1, 1]) {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.35, 1.44, 0.0);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 12), goldMat);
      dome.scale.set(1.4, 0.62, 1.0);
      dome.rotation.z = side * 0.08;
      dome.castShadow = true;
      shoulderGroup.add(dome);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 24), goldBrightMat);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1.3, 0.75, 0.55);
      shoulderGroup.add(rim);

      const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.1), goldDarkMat);
      rearPlate.position.set(side * 0.04, -0.05, -0.12);
      rearPlate.rotation.y = side * 0.18;
      shoulderGroup.add(rearPlate);

      for (let i = 0; i < 3; i++) {
        const wing = this.createFeatherShape(goldBrightMat, 0.24 - i * 0.04, 0.09);
        wing.position.set(side * (0.15 + i * 0.05), 0.0 - i * 0.025, 0.02 - i * 0.015);
        wing.rotation.z = side * (1.12 + i * 0.12);
        wing.rotation.y = side * 0.18;
        wing.scale.x = side;
        shoulderGroup.add(wing);
      }

      this.mesh.add(shoulderGroup);
      if (side === -1) this.leftShoulderArmor = shoulderGroup;
      else this.rightShoulderArmor = shoulderGroup;
    }
  }

  addArms(skinMat, goldMat, goldDarkMat, goldBrightMat) {
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const upperLen = len * 0.43;
      const lowerLen = len * 0.38;

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, upperLen, 5, 14), goldMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), goldDarkMat);
      elbow.position.y = -upperLen - 0.015;
      elbow.scale.set(1, 0.75, 0.9);
      group.add(elbow);

      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, lowerLen, 5, 14), goldMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.04;
      forearm.scale.set(1.12, 1, 0.92);
      group.add(forearm);

      const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 16), goldBrightMat);
      wrist.position.y = -len + 0.08;
      wrist.rotation.x = Math.PI / 2;
      group.add(wrist);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), skinMat);
      hand.position.y = -len;
      hand.scale.set(1, 0.92, 1.08);
      group.add(hand);

      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.022, 0.035), goldBrightMat);
      knuckle.position.set(0, -len - 0.006, 0.035);
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

    addArm(-0.33, 1.36, 0, -0.46, 0.78, 0.03, false);
    addArm(0.33, 1.36, 0, 0.46, 0.78, 0.03, true);
  }

  addLegs(suitMat, goldMat, goldDarkMat, goldBrightMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.14, 0.68, 0);

      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.34, 5, 14), suitMat);
      thigh.position.y = -0.18;
      legGroup.add(thigh);

      const thighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.21, 0.05), goldMat);
      thighPlate.position.set(0, -0.18, 0.08);
      thighPlate.rotation.x = -0.1;
      legGroup.add(thighPlate);

      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), goldBrightMat);
      knee.position.set(0, -0.4, 0.05);
      knee.scale.set(1.1, 0.74, 0.62);
      legGroup.add(knee);

      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.34, 5, 14), goldMat);
      shin.position.y = -0.6;
      shin.scale.set(1, 1, 0.9);
      legGroup.add(shin);

      const shinRidge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.29, 0.028), goldDarkMat);
      shinRidge.position.set(0, -0.6, 0.085);
      legGroup.add(shinRidge);

      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.013, 8, 16), goldBrightMat);
      ankle.position.y = -0.78;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), goldDarkMat);
      boot.position.set(0, -0.86, 0.06);
      boot.scale.set(1, 0.55, 1.55);
      legGroup.add(boot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addCape() {
    const capeMat = new THREE.MeshToonMaterial({
      color: 0x4a0a10,
      gradientMap: this.createToonGradient(),
      side: THREE.DoubleSide,
    });
    const capeDarkMat = new THREE.MeshToonMaterial({
      color: 0x240508,
      gradientMap: this.createToonGradient(),
      side: THREE.DoubleSide,
    });

    this.capeGroup = new THREE.Group();
    this.capeGroup.position.set(0, 1.48, -0.18);

    this.capeSegments = [];
    const segmentCount = 6;
    const capeWidth = 0.8;
    const segmentHeight = 0.24;

    for (let i = 0; i < segmentCount; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.y = -i * segmentHeight;

      const w = capeWidth * (1 - i * 0.06);
      const seg = new THREE.Mesh(
        new THREE.PlaneGeometry(w, segmentHeight, 3, 1),
        i < 2 ? capeMat : capeDarkMat
      );
      seg.position.y = -segmentHeight * 0.5;
      segGroup.add(seg);

      this.capeGroup.add(segGroup);
      this.capeSegments.push(segGroup);
    }

    const claspMat = new THREE.MeshToonMaterial({
      color: 0xc4a030,
      gradientMap: this.createToonGradient(),
    });
    for (const side of [-1, 1]) {
      const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), claspMat);
      clasp.position.set(side * 0.28, 0, 0.02);
      this.capeGroup.add(clasp);
    }

    this.mesh.add(this.capeGroup);
  }

  addWings(goldMat, goldBrightMat) {
    this.wingsGroup = new THREE.Group();
    this.wingsGroup.position.set(0, 1.55, -0.25);

    for (const side of [-1, 1]) {
      const wing = new THREE.Group();
      wing.position.set(side * 0.15, 0, 0);
      wing.rotation.z = side * 0.3;

      // Main wing feathers
      for (let i = 0; i < 5; i++) {
        const feather = this.createFeatherShape(
          i < 2 ? goldBrightMat : goldMat,
          0.55 - i * 0.06,
          0.12 - i * 0.015
        );
        feather.position.set(side * (0.08 + i * 0.08), -i * 0.08, -i * 0.02);
        feather.rotation.z = side * (0.5 + i * 0.15);
        feather.scale.x = side;
        wing.add(feather);
      }

      this.wingsGroup.add(wing);
      if (side === -1) this.leftWing = wing;
      else this.rightWing = wing;
    }

    this.mesh.add(this.wingsGroup);
  }

  addBow(goldMat, goldBrightMat) {
    this.bowGroup = new THREE.Group();
    this.bowGroup.position.set(0.5, 1.1, 0.15);
    this.bowGroup.rotation.z = -0.4;
    this.bowGroup.rotation.y = 0.3;

    // Bow arc
    const bowCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(0.25, 0, 0),
      new THREE.Vector3(0, -0.4, 0)
    );
    const bowGeo = new THREE.TubeGeometry(bowCurve, 16, 0.018, 8, false);
    const bow = new THREE.Mesh(bowGeo, goldMat);
    this.bowGroup.add(bow);

    // Bowstring
    const stringGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(-0.05, 0, 0),
      new THREE.Vector3(0, -0.4, 0),
    ]);
    const stringMat = new THREE.LineBasicMaterial({ color: 0xc0c0c0, transparent: true, opacity: 0.6 });
    const bowstring = new THREE.Line(stringGeo, stringMat);
    this.bowGroup.add(bowstring);

    // Arrow
    const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 6), goldBrightMat);
    arrowShaft.rotation.z = Math.PI / 2;
    arrowShaft.position.set(-0.1, 0, 0);
    this.bowGroup.add(arrowShaft);

    const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 4), goldBrightMat);
    arrowHead.rotation.z = -Math.PI / 2;
    arrowHead.position.set(0.28, 0, 0);
    this.bowGroup.add(arrowHead);

    this.bowGroup.visible = false;
    this.mesh.add(this.bowGroup);
  }

  addCosmosAura() {
    this.cosmosGroup = new THREE.Group();
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffee88,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.78, 24, 18), auraMat);
    aura.position.y = 1.0;
    aura.scale.set(0.85, 1.6, 0.62);
    this.cosmosGroup.add(aura);
    this.cosmosAura = aura;

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38 + i * 0.11, 0.007, 8, 48), ringMat.clone());
      ring.position.y = 0.85 + i * 0.3;
      ring.rotation.x = Math.PI / 2 + i * 0.16;
      ring.rotation.z = i * 0.7;
      this.cosmosGroup.add(ring);
      if (!this.cosmosRings) this.cosmosRings = [];
      this.cosmosRings.push(ring);
    }

    for (let i = 0; i < 12; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.012 + (i % 3) * 0.003, 8, 8), ringMat.clone());
      const a = (i / 12) * Math.PI * 2;
      star.position.set(Math.cos(a) * (0.4 + (i % 2) * 0.18), 0.58 + (i % 5) * 0.24, Math.sin(a) * 0.2);
      star.userData.baseY = star.position.y;
      this.cosmosGroup.add(star);
      if (!this.cosmosStars) this.cosmosStars = [];
      this.cosmosStars.push(star);
    }

    this.mesh.add(this.cosmosGroup);
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

  showBow() {
    if (this.bowGroup) this.bowGroup.visible = true;
  }

  hideBow() {
    if (this.bowGroup) this.bowGroup.visible = false;
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
      this.rightArm.rotation.z = (this.rightArmBaseZ || 0) - 0.62;
      this.rightArm.rotation.x = -0.18;
    }
    if (this.leftArm) {
      this.leftArm.rotation.z = (this.leftArmBaseZ || 0) + 0.42;
      this.leftArm.rotation.x = -0.1;
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
        const windStrength = 0.06 + i * 0.012;
        const windFreq = 1.8 + i * 0.25;
        seg.rotation.z = Math.sin(time * windFreq + i * 0.5) * windStrength;
        seg.rotation.x = Math.sin(time * windFreq * 0.7 + i * 0.3) * windStrength * 0.5;
      }
    }

    // Wing animation
    if (this.leftWing) {
      this.leftWing.rotation.z = 0.3 + Math.sin(time * 0.8) * 0.08;
    }
    if (this.rightWing) {
      this.rightWing.rotation.z = -0.3 - Math.sin(time * 0.8) * 0.08;
    }

    if (this.leftShoulderArmor) this.leftShoulderArmor.rotation.z = Math.sin(time * 1.6) * 0.015;
    if (this.rightShoulderArmor) this.rightShoulderArmor.rotation.z = -Math.sin(time * 1.6) * 0.015;

    if (this.cosmosAura) {
      const pulse = 0.09 + Math.sin(time * 3.2) * 0.035;
      this.cosmosAura.material.opacity = this._cosmosActive ? pulse : 0;
      this.cosmosAura.scale.set(0.85 + Math.sin(time * 2.6) * 0.03, 1.6 + Math.sin(time * 2.1) * 0.06, 0.62);
    }

    if (this.cosmosRings) {
      for (let i = 0; i < this.cosmosRings.length; i++) {
        const ring = this.cosmosRings[i];
        ring.rotation.z += dt * (0.5 + i * 0.18);
        ring.material.opacity = this._cosmosActive ? 0.22 + Math.sin(time * 2.4 + i) * 0.08 : 0;
      }
    }

    if (this.cosmosStars) {
      for (let i = 0; i < this.cosmosStars.length; i++) {
        const star = this.cosmosStars[i];
        star.material.opacity = this._cosmosActive ? 0.25 + Math.abs(Math.sin(time * 4 + i)) * 0.55 : 0;
        star.position.y = star.userData.baseY + Math.sin(time * 1.7 + i) * 0.01;
      }
    }
  }
}
