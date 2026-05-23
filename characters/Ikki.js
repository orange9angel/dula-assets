import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Ikki (Phoenix Bronze Saint) - Adult Proportions
 * Tallest and most imposing build, wild spiky purple-black hair,
 * fierce sharp eyes, deep red undersuit, crimson-orange Phoenix cloth
 * with flame motifs and phoenix wing pauldrons.
 */
export class Ikki extends CharacterBase {
  constructor() {
    super('Ikki');
    this.boundingRadius = 0.6;
    this._cosmosActive = true;
  }

  build() {
    const toonGradient = this.createToonGradient();

    const skinMat = new THREE.MeshToonMaterial({ color: 0xe8c8a8, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x2a0a3a, gradientMap: toonGradient });
    const hairHighlightMat = new THREE.MeshToonMaterial({ color: 0x4a1a6a, gradientMap: toonGradient });
    const suitMat = new THREE.MeshToonMaterial({ color: 0x6a0a0a, gradientMap: toonGradient });
    const suitDarkMat = new THREE.MeshToonMaterial({ color: 0x3a0505, gradientMap: toonGradient });
    const armorMat = new THREE.MeshToonMaterial({
      color: 0xb03010, gradientMap: toonGradient,
      emissive: 0x3a0a00, emissiveIntensity: 0.1,
    });
    const armorDarkMat = new THREE.MeshToonMaterial({ color: 0x7a1a0a, gradientMap: toonGradient });
    const flameMat = new THREE.MeshToonMaterial({
      color: 0xff6600, gradientMap: toonGradient,
      emissive: 0x4a1a00, emissiveIntensity: 0.12,
    });
    const goldMat = new THREE.MeshToonMaterial({
      color: 0xc8a030, gradientMap: toonGradient,
      emissive: 0x2a1a00, emissiveIntensity: 0.06,
    });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf8f8f8, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0x8a2020, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x6a1a1a, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.82;

    // Face - sharp, fierce, angular
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.29, 32, 32), skinMat);
    face.scale.set(0.95, 1.22, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Chin - strong, pointed
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), skinMat);
    chin.position.set(0, -0.24, 0.14);
    chin.scale.set(0.92, 0.78, 0.9);
    headGroup.add(chin);

    for (const side of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), skinMat);
      jaw.position.set(side * 0.17, -0.16, 0.08);
      jaw.scale.set(0.65, 0.75, 0.72);
      headGroup.add(jaw);
    }

    // Ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), skinMat);
      ear.position.set(side * 0.26, 0.02, 0.02);
      ear.scale.set(0.48, 0.88, 0.52);
      headGroup.add(ear);
    }

    // Hair cap - purple-black
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    hairCap.position.set(0, 0.12, -0.03);
    hairCap.scale.set(1.05, 0.95, 0.92);
    headGroup.add(hairCap);

    // Wild spiky back hair
    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.4, 6, 14), hairMat);
    backHair.position.set(0, -0.12, -0.22);
    backHair.rotation.x = 0.35;
    backHair.scale.set(1.3, 1, 0.7);
    headGroup.add(backHair);
    this.backHair = backHair;

    // Wild side hair
    for (const side of [-1, 1]) {
      const sideHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.35, 6, 12), hairMat);
      sideHair.position.set(side * 0.3, -0.02, 0.06);
      sideHair.rotation.z = side * 0.35;
      sideHair.rotation.x = -0.2;
      sideHair.scale.set(0.9, 1, 0.6);
      headGroup.add(sideHair);
    }

    // Spiky bangs - wild, aggressive
    const bangSpecs = [
      [-0.2, 0.28, 0.27, 0.5, 0.45],
      [-0.1, 0.32, 0.32, 0.2, 0.52],
      [0.0, 0.34, 0.34, -0.05, 0.58],
      [0.1, 0.32, 0.32, -0.25, 0.52],
      [0.2, 0.28, 0.27, -0.45, 0.45],
      [-0.05, 0.3, 0.3, 0.6, 0.4],
      [0.05, 0.3, 0.3, -0.7, 0.4],
    ];
    for (const [x, y, z, rz, h] of bangSpecs) {
      const bang = new THREE.Mesh(new THREE.ConeGeometry(0.05, h, 4), hairMat);
      bang.position.set(x, y, z);
      bang.rotation.x = -0.6;
      bang.rotation.z = Math.PI + rz;
      bang.scale.set(0.9, 1, 0.6);
      headGroup.add(bang);
    }

    // Highlight spikes
    for (let i = 0; i < 3; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.2, 4), hairHighlightMat);
      spike.position.set((i - 1) * 0.1, 0.35, 0.28);
      spike.rotation.x = -0.5;
      spike.rotation.z = Math.PI + (i - 1) * 0.3;
      headGroup.add(spike);
    }

    // Phoenix Helmet
    this.addHelmet(headGroup, armorMat, flameMat, goldMat);
    this.addEyes(headGroup, whiteMat, irisMat, blackMat);

    // Eyebrows - thick, fierce
    const browGeo = new THREE.BoxGeometry(0.1, 0.014, 0.011);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairMat);
      brow.position.set(side * 0.1, 0.14, 0.275);
      brow.rotation.z = side * -0.1;
      headGroup.add(brow);
    }

    // Nose - strong
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 5), skinMat);
    nose.position.set(0, -0.03, 0.3);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Mouth - fierce, slight smirk
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.038, -0.118, 0.29),
      new THREE.Vector3(0, -0.125, 0.305),
      new THREE.Vector3(0.04, -0.115, 0.29)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.004, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY - Tall Imposing Build ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.15, 16), skinMat);
    neck.position.y = 1.62;
    this.mesh.add(neck);

    // Torso - broad, imposing
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.58, 20), suitMat);
    torso.position.y = 1.3;
    torso.scale.z = 0.72;
    torso.castShadow = true;
    this.mesh.add(torso);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), suitMat);
    chest.position.set(0, 1.4, 0.08);
    chest.scale.set(1.15, 0.58, 0.48);
    this.mesh.add(chest);

    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.19, 0.36, 16), suitDarkMat);
    abdomen.position.y = 0.88;
    abdomen.scale.z = 0.65;
    this.mesh.add(abdomen);

    this.addChestArmor(armorMat, armorDarkMat, flameMat);
    this.addWaistArmor(armorMat, armorDarkMat, flameMat);
    this.addShoulders(armorMat, armorDarkMat, flameMat, goldMat);
    this.addArms(skinMat, suitMat, armorMat, armorDarkMat, flameMat);
    this.addLegs(suitMat, armorMat, armorDarkMat, flameMat);
    this.addPhoenixTail();
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

  addHelmet(headGroup, armorMat, flameMat, goldMat) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.095, 0.03), armorMat);
    band.position.set(0, 0.24, 0.27);
    band.rotation.x = -0.1;
    headGroup.add(band);

    // Phoenix crest
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.22, 4), flameMat);
    crest.position.set(0, 0.36, 0.26);
    crest.rotation.z = Math.PI;
    crest.scale.set(0.75, 1, 0.45);
    headGroup.add(crest);

    // Flame gem
    const gem = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff4400 })
    );
    gem.position.set(0, 0.25, 0.29);
    gem.scale.set(1, 0.85, 0.3);
    headGroup.add(gem);

    for (const side of [-1, 1]) {
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.028), armorMat);
      guard.position.set(side * 0.22, 0.02, 0.21);
      guard.rotation.z = side * 0.1;
      headGroup.add(guard);

      // Phoenix wing on helmet
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.02), flameMat);
      wing.position.set(side * 0.27, 0.3, 0.19);
      wing.rotation.z = side * 0.55;
      wing.rotation.x = -0.2;
      headGroup.add(wing);
    }
  }

  addEyes(headGroup, whiteMat, irisMat, blackMat) {
    const eyeGeo = new THREE.SphereGeometry(0.075, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, whiteMat);
      eye.position.set(side * 0.105, 0.05, 0.27);
      eye.scale.set(1.18, 1.25, 0.5);
      headGroup.add(eye);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), irisMat);
      iris.position.set(side * 0.105, 0.045, 0.31);
      iris.scale.set(1.08, 1.2, 0.45);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), blackMat);
      pupil.position.set(side * 0.105, 0.042, 0.335);
      pupil.scale.set(0.98, 1.2, 0.38);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), whiteMat);
      shine1.position.set(side * 0.088, 0.072, 0.342);
      headGroup.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), whiteMat);
      shine2.position.set(side * 0.115, 0.058, 0.338);
      headGroup.add(shine2);

      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.078, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.22 })
      );
      lidShadow.position.set(side * 0.105, 0.078, 0.275);
      lidShadow.scale.set(1.25, 0.32, 0.5);
      headGroup.add(lidShadow);
    }
  }

  addChestArmor(armorMat, armorDarkMat, flameMat) {
    const chestGroup = new THREE.Group();
    this.chestArmor = chestGroup;

    const upper = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 14), armorMat);
    upper.position.set(0, 1.38, 0.2);
    upper.scale.set(1.25, 0.65, 0.28);
    chestGroup.add(upper);

    for (const side of [-1, 1]) {
      const breast = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), armorMat);
      breast.position.set(side * 0.12, 1.32, 0.22);
      breast.scale.set(1.05, 0.92, 0.3);
      chestGroup.add(breast);

      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.024, 0.016), flameMat);
      edge.position.set(side * 0.12, 1.42, 0.28);
      edge.rotation.z = side * -0.22;
      chestGroup.add(edge);
    }

    const centerPlate = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.28, 5), armorDarkMat);
    centerPlate.position.set(0, 1.14, 0.24);
    centerPlate.rotation.z = Math.PI;
    centerPlate.scale.set(0.88, 1, 0.28);
    chestGroup.add(centerPlate);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.024, 8, 30), flameMat);
    collar.position.set(0, 1.5, 0.04);
    collar.scale.z = 0.68;
    collar.rotation.x = Math.PI / 2;
    chestGroup.add(collar);

    const throatGuard = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.048), armorMat);
    throatGuard.position.set(0, 1.46, 0.18);
    throatGuard.rotation.x = -0.18;
    chestGroup.add(throatGuard);

    this.mesh.add(chestGroup);
  }

  addWaistArmor(armorMat, armorDarkMat, flameMat) {
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 30), flameMat);
    belt.position.y = 0.98;
    belt.scale.z = 0.72;
    belt.rotation.x = Math.PI / 2;
    this.mesh.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.038), armorDarkMat);
    buckle.position.set(0, 0.99, 0.22);
    buckle.rotation.x = -0.1;
    this.mesh.add(buckle);

    for (const side of [-1, 0, 1]) {
      const panel = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 4), armorMat);
      panel.position.set(side * 0.16, 0.82, 0.14 - Math.abs(side) * 0.035);
      panel.rotation.z = Math.PI;
      panel.rotation.y = side * -0.12;
      panel.scale.set(0.82, 1, 0.28);
      this.mesh.add(panel);
    }
  }

  addShoulders(armorMat, armorDarkMat, flameMat, goldMat) {
    for (const side of [-1, 1]) {
      const shoulderGroup = new THREE.Group();
      shoulderGroup.position.set(side * 0.34, 1.44, 0);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), armorMat);
      dome.scale.set(1.4, 0.58, 0.95);
      dome.rotation.z = side * 0.08;
      dome.castShadow = true;
      shoulderGroup.add(dome);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 24), flameMat);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1.3, 0.7, 0.5);
      shoulderGroup.add(rim);

      // Phoenix wing feathers
      for (let i = 0; i < 4; i++) {
        const feather = this.createFlameFeather(flameMat, 0.22 - i * 0.025, 0.08);
        feather.position.set(side * (0.14 + i * 0.045), 0 - i * 0.02, 0.02 - i * 0.012);
        feather.rotation.z = side * (1.1 + i * 0.1);
        feather.rotation.y = side * 0.15;
        feather.scale.x = side;
        shoulderGroup.add(feather);
      }

      this.mesh.add(shoulderGroup);
      if (side === -1) this.leftShoulderArmor = shoulderGroup;
      else this.rightShoulderArmor = shoulderGroup;
    }
  }

  addArms(skinMat, suitMat, armorMat, armorDarkMat, flameMat) {
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const upperLen = len * 0.45;
      const lowerLen = len * 0.4;

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, upperLen, 5, 12), suitMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), armorDarkMat);
      elbow.position.y = -upperLen - 0.012;
      elbow.scale.set(1, 0.72, 0.88);
      group.add(elbow);

      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, lowerLen, 5, 12), armorMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.035;
      forearm.scale.set(1.1, 1, 0.9);
      group.add(forearm);

      const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.011, 8, 14), flameMat);
      wrist.position.y = -len + 0.07;
      wrist.rotation.x = Math.PI / 2;
      group.add(wrist);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), skinMat);
      hand.position.y = -len;
      hand.scale.set(1, 0.9, 1.05);
      group.add(hand);

      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.028), flameMat);
      knuckle.position.set(0, -len - 0.005, 0.03);
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

    addArm(-0.3, 1.34, 0, -0.42, 0.76, 0.03, false);
    addArm(0.3, 1.34, 0, 0.42, 0.76, 0.03, true);
  }

  addLegs(suitMat, armorMat, armorDarkMat, flameMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.13, 0.68, 0);

      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.32, 5, 12), suitMat);
      thigh.position.y = -0.18;
      legGroup.add(thigh);

      const thighPlate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.045), armorMat);
      thighPlate.position.set(0, -0.18, 0.075);
      thighPlate.rotation.x = -0.1;
      legGroup.add(thighPlate);

      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), flameMat);
      knee.position.set(0, -0.38, 0.04);
      knee.scale.set(1.1, 0.74, 0.6);
      legGroup.add(knee);

      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.32, 5, 12), armorMat);
      shin.position.y = -0.58;
      shin.scale.set(1, 1, 0.9);
      legGroup.add(shin);

      const shinRidge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.27, 0.024), armorDarkMat);
      shinRidge.position.set(0, -0.58, 0.08);
      legGroup.add(shinRidge);

      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 14), flameMat);
      ankle.position.y = -0.75;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), armorDarkMat);
      boot.position.set(0, -0.84, 0.05);
      boot.scale.set(1, 0.54, 1.55);
      legGroup.add(boot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addPhoenixTail() {
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff4400, transparent: true, opacity: 0.3,
      depthWrite: false, side: THREE.DoubleSide,
    });

    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.85, -0.25);

    this.tailFeathers = [];
    for (let i = 0; i < 5; i++) {
      const feather = this.createFlameFeather(flameMat, 0.3 + i * 0.05, 0.1);
      feather.position.set((i - 2) * 0.08, -i * 0.08, 0);
      feather.rotation.z = (i - 2) * 0.15;
      feather.rotation.x = 0.3;
      this.tailGroup.add(feather);
      this.tailFeathers.push(feather);
    }

    this.mesh.add(this.tailGroup);
  }

  addCosmosAura() {
    this.cosmosGroup = new THREE.Group();
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff4400, transparent: true, opacity: 0.1,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00, transparent: true, opacity: 0.3,
      depthWrite: false,
    });

    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 16), auraMat);
    aura.position.y = 1.0;
    aura.scale.set(0.85, 1.55, 0.58);
    this.cosmosGroup.add(aura);
    this.cosmosAura = aura;

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35 + i * 0.1, 0.006, 8, 40), ringMat.clone());
      ring.position.y = 0.82 + i * 0.28;
      ring.rotation.x = Math.PI / 2 + i * 0.15;
      ring.rotation.z = i * 0.65;
      this.cosmosGroup.add(ring);
      if (!this.cosmosRings) this.cosmosRings = [];
      this.cosmosRings.push(ring);
    }

    for (let i = 0; i < 12; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.011 + (i % 3) * 0.003, 8, 8), ringMat.clone());
      const a = (i / 12) * Math.PI * 2;
      star.position.set(Math.cos(a) * (0.38 + (i % 2) * 0.15), 0.55 + (i % 5) * 0.22, Math.sin(a) * 0.18);
      star.userData.baseY = star.position.y;
      this.cosmosGroup.add(star);
      if (!this.cosmosStars) this.cosmosStars = [];
      this.cosmosStars.push(star);
    }

    this.mesh.add(this.cosmosGroup);
  }

  addCape() {
    const capeMat = new THREE.MeshToonMaterial({
      color: 0x2a0a0a, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });
    const capeDarkMat = new THREE.MeshToonMaterial({
      color: 0x1a0505, gradientMap: this.createToonGradient(), side: THREE.DoubleSide,
    });

    this.capeGroup = new THREE.Group();
    this.capeGroup.position.set(0, 1.44, -0.15);

    this.capeSegments = [];
    const segmentCount = 6;
    const capeWidth = 0.72;
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

    const claspMat = new THREE.MeshToonMaterial({ color: 0xff6600, gradientMap: this.createToonGradient() });
    for (const side of [-1, 1]) {
      const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), claspMat);
      clasp.position.set(side * 0.26, 0, 0.02);
      this.capeGroup.add(clasp);
    }

    this.mesh.add(this.capeGroup);
  }

  createFlameFeather(material, length, width) {
    const shape = new THREE.Shape();
    shape.moveTo(0, length * 0.5);
    shape.bezierCurveTo(width * 1.2, length * 0.2, width * 0.9, -length * 0.3, 0, -length * 0.55);
    shape.bezierCurveTo(-width * 0.6, -length * 0.2, -width * 0.45, length * 0.22, 0, length * 0.5);
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
      this.backHair.rotation.z = Math.sin(time * 1.5) * 0.03;
      this.backHair.rotation.x = 0.35 + Math.sin(time * 1.1) * 0.02;
    }

    if (this.capeSegments) {
      for (let i = 0; i < this.capeSegments.length; i++) {
        const seg = this.capeSegments[i];
        const windStrength = 0.08 + i * 0.015;
        const windFreq = 2.2 + i * 0.35;
        seg.rotation.z = Math.sin(time * windFreq + i * 0.5) * windStrength;
        seg.rotation.x = Math.sin(time * windFreq * 0.7 + i * 0.3) * windStrength * 0.5;
      }
    }

    if (this.leftShoulderArmor) this.leftShoulderArmor.rotation.z = Math.sin(time * 2.0) * 0.018;
    if (this.rightShoulderArmor) this.rightShoulderArmor.rotation.z = -Math.sin(time * 2.0) * 0.018;

    if (this.tailFeathers) {
      for (let i = 0; i < this.tailFeathers.length; i++) {
        const feather = this.tailFeathers[i];
        feather.rotation.z = (i - 2) * 0.15 + Math.sin(time * 2.5 + i * 0.3) * 0.05;
        feather.material.opacity = 0.25 + Math.sin(time * 3 + i) * 0.15;
      }
    }

    if (this.cosmosAura) {
      const pulse = 0.1 + Math.sin(time * 3.5) * 0.04;
      this.cosmosAura.material.opacity = this._cosmosActive ? pulse : 0;
      this.cosmosAura.scale.set(0.85 + Math.sin(time * 2.8) * 0.03, 1.55 + Math.sin(time * 2.3) * 0.06, 0.58);
    }

    if (this.cosmosRings) {
      for (let i = 0; i < this.cosmosRings.length; i++) {
        const ring = this.cosmosRings[i];
        ring.rotation.z += dt * (0.6 + i * 0.2);
        ring.material.opacity = this._cosmosActive ? 0.25 + Math.sin(time * 2.8 + i) * 0.08 : 0;
      }
    }

    if (this.cosmosStars) {
      for (let i = 0; i < this.cosmosStars.length; i++) {
        const star = this.cosmosStars[i];
        star.material.opacity = this._cosmosActive ? 0.25 + Math.abs(Math.sin(time * 4.5 + i)) * 0.55 : 0;
        star.position.y = star.userData.baseY + Math.sin(time * 2 + i) * 0.01;
      }
    }
  }
}
