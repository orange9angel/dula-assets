import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Yusuke Urameshi (浦饭幽助) - Yu Yu Hakusho Main Protagonist
 * Delinquent-turned-Spirit-Detective. Green school uniform (gakuran),
 * messy black spiky hair, sharp brown eyes, red armband, fingerless gloves.
 * Slightly slouched posture, lean athletic build (~1.72m).
 */
export class Yusuke extends CharacterBase {
  constructor() {
    super('Yusuke');
    this.boundingRadius = 0.55;
    this._spiritActive = true;
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
    const armbandMat = new THREE.MeshToonMaterial({ color: 0xcc1a1a, gradientMap: toonGradient });

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
    this.addArmband(armbandMat);
    this.addSpiritAura();
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
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const upperLen = len * 0.45;
      const lowerLen = len * 0.4;

      // Upper arm - gakuran sleeve
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, upperLen, 5, 12), uniformMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      // Elbow
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), skinMat);
      elbow.position.y = -upperLen - 0.01;
      elbow.scale.set(1, 0.7, 0.85);
      group.add(elbow);

      // Forearm - skin showing (sleeves rolled up or short sleeves)
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, lowerLen, 5, 12), skinMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.03;
      group.add(forearm);

      // Fingerless glove
      const glove = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, lowerLen * 0.45, 5, 12), gloveMat);
      glove.position.y = -upperLen - lowerLen * 0.72 - 0.03;
      group.add(glove);

      // Glove cuff
      const gloveCuff = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.008, 8, 14), gloveDarkMat);
      gloveCuff.position.y = -upperLen - lowerLen * 0.52 - 0.03;
      gloveCuff.rotation.x = Math.PI / 2;
      group.add(gloveCuff);

      // Hand
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinMat);
      hand.position.y = -len;
      hand.scale.set(1, 0.9, 1.05);
      group.add(hand);

      // Knuckles (slightly pronounced for fighter)
      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.015, 0.025), skinMat);
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

    addArm(-0.26, 1.28, 0, -0.38, 0.72, 0.03, false);
    addArm(0.26, 1.28, 0, 0.38, 0.72, 0.03, true);
  }

  addLegs(uniformMat, uniformDarkMat, shoeMat, shoeDarkMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.11, 0.62, 0);

      // Thigh - gakuran pants
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.28, 5, 12), uniformMat);
      thigh.position.y = -0.16;
      legGroup.add(thigh);

      // Knee
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), uniformDarkMat);
      knee.position.set(0, -0.34, 0.03);
      knee.scale.set(1.05, 0.7, 0.55);
      legGroup.add(knee);

      // Shin - pants continue down
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 5, 12), uniformMat);
      shin.position.y = -0.52;
      shin.scale.set(1, 1, 0.85);
      legGroup.add(shin);

      // Ankle
      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.01, 8, 14), uniformDarkMat);
      ankle.position.y = -0.68;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      // Sneaker - white, slightly bulky
      const sneaker = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), shoeMat);
      sneaker.position.set(0, -0.76, 0.04);
      sneaker.scale.set(1, 0.5, 1.45);
      legGroup.add(sneaker);

      // Sneaker sole
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.14), shoeDarkMat);
      sole.position.set(0, -0.8, 0.04);
      legGroup.add(sole);

      // Sneaker toe cap
      const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), shoeMat);
      toeCap.position.set(0, -0.76, 0.1);
      toeCap.scale.set(1, 0.6, 1.2);
      legGroup.add(toeCap);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addArmband(armbandMat) {
    // Red armband on left arm (Spirit Detective badge)
    const armband = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 14), armbandMat);
    armband.position.set(-0.26, 1.12, 0);
    armband.rotation.z = 0.15;
    this.mesh.add(armband);

    // Badge emblem (small gold circle)
    const badge = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 8, 8),
      new THREE.MeshToonMaterial({ color: 0xc4a030, gradientMap: this.createToonGradient() })
    );
    badge.position.set(-0.26, 1.12, 0.05);
    badge.scale.set(1, 1, 0.4);
    this.mesh.add(badge);
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

    // Hair sway - messy delinquent style
    if (this.backHair) {
      this.backHair.rotation.z = Math.sin(time * 1.6) * 0.03;
      this.backHair.rotation.x = 0.35 + Math.sin(time * 1.2) * 0.02;
    }

    // Subtle idle sway (slightly slouched)
    if (this.headGroup) {
      this.headGroup.rotation.x = Math.sin(time * 0.8) * 0.008;
      this.headGroup.rotation.y = Math.sin(time * 0.5) * 0.012;
    }

    // Spirit aura pulse
    if (this.spiritAura) {
      const pulse = 0.08 + Math.sin(time * 3.2) * 0.03;
      this.spiritAura.material.opacity = this._spiritActive ? pulse : 0;
      this.spiritAura.scale.set(0.8 + Math.sin(time * 2.6) * 0.025, 1.5 + Math.sin(time * 2.1) * 0.05, 0.55);
    }

    if (this.spiritRings) {
      for (let i = 0; i < this.spiritRings.length; i++) {
        const ring = this.spiritRings[i];
        ring.rotation.z += dt * (0.5 + i * 0.18);
        ring.material.opacity = this._spiritActive ? 0.2 + Math.sin(time * 2.4 + i) * 0.07 : 0;
      }
    }

    if (this.spiritStars) {
      for (let i = 0; i < this.spiritStars.length; i++) {
        const star = this.spiritStars[i];
        star.material.opacity = this._spiritActive ? 0.22 + Math.abs(Math.sin(time * 4 + i)) * 0.5 : 0;
        star.position.y = star.userData.baseY + Math.sin(time * 1.7 + i) * 0.008;
      }
    }
  }
}
