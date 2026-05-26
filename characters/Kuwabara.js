import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Kuwabara (桑原和真) — Yu Yu Hakusho
 * Yusuke's rival-turned-ally. Tall, loud, earnest, with a massive pompadour
 * and the signature Spirit Sword — a glowing orange energy blade.
 *
 * Visual design:
 *   - Blue school uniform (gakuran): navy jacket + pants
 *   - Signature very tall pompadour / orange-blonde hair
 *   - Brown eyes, earnest expression
 *   - White undershirt
 *   - Red armband
 *   - Spirit Sword: glowing orange energy sword from right hand
 *   - Taller than Yusuke (~1.83m), bulkier build
 *   - More upright posture
 */
export class Kuwabara extends CharacterBase {
  constructor() {
    super('Kuwabara');
    this.boundingRadius = 0.58;
    this.archetypes = ['humanoid', 'fighter', 'athletic', 'delinquent'];
  }

  build() {
    const toonGradient = this.createToonGradient();

    // Materials
    const skinMat = new THREE.MeshToonMaterial({ color: 0xf0c8a0, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0xd4883a, gradientMap: toonGradient }); // orange-blonde
    const hairDarkMat = new THREE.MeshToonMaterial({ color: 0xa86028, gradientMap: toonGradient });
    const uniformMat = new THREE.MeshToonMaterial({ color: 0x1a2a4a, gradientMap: toonGradient }); // navy gakuran
    const uniformDarkMat = new THREE.MeshToonMaterial({ color: 0x0f1a30, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf5f5f5, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const irisMat = new THREE.MeshToonMaterial({ color: 0x5a3a1a, gradientMap: toonGradient }); // brown eyes
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x8a3a40, gradientMap: toonGradient });
    const armbandMat = new THREE.MeshToonMaterial({ color: 0xb82020, gradientMap: toonGradient }); // red armband
    const buttonMat = new THREE.MeshToonMaterial({ color: 0xc0a060, gradientMap: toonGradient }); // gold buttons

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.85; // taller than average

    // Face — slightly broader, earnest look
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.29, 32, 32), skinMat);
    face.scale.set(0.95, 1.12, 0.96);
    face.castShadow = true;
    headGroup.add(face);

    // Chin — square, strong jaw
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skinMat);
    chin.position.set(0, -0.24, 0.13);
    chin.scale.set(0.9, 0.78, 0.92);
    headGroup.add(chin);

    // Jawline definition
    for (const side of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), skinMat);
      jaw.position.set(side * 0.19, -0.16, 0.09);
      jaw.scale.set(0.65, 0.85, 0.75);
      headGroup.add(jaw);
    }

    // Ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), skinMat);
      ear.position.set(side * 0.27, 0.02, 0.02);
      ear.scale.set(0.48, 0.88, 0.52);
      headGroup.add(ear);
    }

    // ========== HAIR — THE TALL POMPADOUR ==========
    // Hair cap base
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hairCap.position.set(0, 0.12, -0.02);
    hairCap.scale.set(1.05, 0.95, 0.92);
    headGroup.add(hairCap);

    // Back hair — short, swept back
    const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.3, 6, 12), hairMat);
    backHair.position.set(0, -0.08, -0.22);
    backHair.rotation.x = 0.35;
    backHair.scale.set(1.15, 1, 0.7);
    headGroup.add(backHair);
    this.backHair = backHair;

    // Sideburns
    for (const side of [-1, 1]) {
      const sideburn = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.22, 4, 8), hairDarkMat);
      sideburn.position.set(side * 0.28, -0.05, 0.08);
      sideburn.rotation.z = side * 0.15;
      sideburn.rotation.x = 0.2;
      headGroup.add(sideburn);
    }

    // ===== POMPADOUR — Kuwabara's most distinctive feature =====
    // Main tall pompadour volume — a large swept-back cone shape
    const pompadourMain = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 12), hairMat);
    pompadourMain.position.set(0, 0.52, 0.08);
    pompadourMain.rotation.x = -0.35;
    pompadourMain.scale.set(1.1, 1, 0.85);
    headGroup.add(pompadourMain);
    this.pompadourMain = pompadourMain;

    // Secondary pompadour layer for volume
    const pompadourSecond = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.42, 10), hairMat);
    pompadourSecond.position.set(0, 0.48, 0.12);
    pompadourSecond.rotation.x = -0.25;
    pompadourSecond.scale.set(1.15, 1, 0.9);
    headGroup.add(pompadourSecond);
    this.pompadourSecond = pompadourSecond;

    // Front sweep — the iconic tall front curl
    const frontSweep = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.35, 6, 10), hairMat);
    frontSweep.position.set(0, 0.58, 0.22);
    frontSweep.rotation.x = -0.6;
    frontSweep.scale.set(1.2, 1, 0.7);
    headGroup.add(frontSweep);
    this.frontSweep = frontSweep;

    // Pompadour detail spikes — add texture/volume to the tall hair
    for (let i = 0; i < 7; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.2 + Math.random() * 0.1, 4), hairDarkMat);
      const angle = -Math.PI * 0.6 + (i / 6) * Math.PI * 1.2;
      spike.position.set(
        Math.cos(angle) * 0.18,
        0.45 + Math.sin(i * 0.9) * 0.04,
        Math.sin(angle) * 0.12 + 0.05
      );
      spike.rotation.x = -0.4;
      spike.rotation.z = -angle * 0.3;
      headGroup.add(spike);
    }

    // Top ridge of the pompadour
    const topRidge = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.3, 4, 8), hairMat);
    topRidge.position.set(0, 0.68, 0.02);
    topRidge.rotation.x = -0.5;
    topRidge.scale.set(1.3, 1, 0.6);
    headGroup.add(topRidge);
    this.topRidge = topRidge;

    // ========== EYES — Brown, earnest, slightly large ==========
    const eyeGeo = new THREE.SphereGeometry(0.075, 16, 16);
    for (const side of [-1, 1]) {
      // Eye white
      const eye = new THREE.Mesh(eyeGeo, whiteMat);
      eye.position.set(side * 0.11, 0.04, 0.27);
      eye.scale.set(1.15, 1.3, 0.5);
      headGroup.add(eye);

      // Iris — brown
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.046, 14, 14), irisMat);
      iris.position.set(side * 0.11, 0.035, 0.305);
      iris.scale.set(1.05, 1.25, 0.45);
      headGroup.add(iris);

      // Pupil
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), blackMat);
      pupil.position.set(side * 0.11, 0.032, 0.328);
      pupil.scale.set(0.95, 1.25, 0.38);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      // Eye shine
      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), whiteMat);
      shine1.position.set(side * 0.095, 0.06, 0.335);
      headGroup.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), whiteMat);
      shine2.position.set(side * 0.12, 0.048, 0.333);
      headGroup.add(shine2);

      // Eyelid shadow
      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.078, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.2 })
      );
      lidShadow.position.set(side * 0.11, 0.07, 0.275);
      lidShadow.scale.set(1.25, 0.35, 0.52);
      headGroup.add(lidShadow);
    }

    // Eyebrows — thick, straight, earnest (not angry, just honest)
    const browGeo = new THREE.BoxGeometry(0.11, 0.018, 0.014);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairDarkMat);
      brow.position.set(side * 0.11, 0.16, 0.28);
      brow.rotation.z = side * -0.08; // very slight tilt
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Eyelids — thin boxes above each eye
    const eyelidGeo = new THREE.BoxGeometry(0.09, 0.008, 0.015);
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x2c170d, transparent: true, opacity: 0.3 });
    for (const side of [-1, 1]) {
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.position.set(side * 0.11, 0.09, 0.285);
      headGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;
    }

    // Nose — straightforward, slightly broad
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.065, 5), skinMat);
    nose.position.set(0, -0.04, 0.3);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Mouth — earnest, slightly open when neutral (Kuwabara is expressive)
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.05, -0.13, 0.29),
      new THREE.Vector3(0, -0.135, 0.305),
      new THREE.Vector3(0.05, -0.13, 0.29)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.005, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.15, 16), skinMat);
    neck.position.y = 1.62;
    this.mesh.add(neck);

    // ========== BODY — Tall, Bulkier Build ==========
    // Torso — broader than Yusuke, more rectangular
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.23, 0.58, 20), uniformMat);
    torso.position.y = 1.3;
    torso.scale.z = 0.72;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Chest — bulkier
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), uniformMat);
    chest.position.set(0, 1.42, 0.1);
    chest.scale.set(1.15, 0.65, 0.55);
    this.mesh.add(chest);

    // White undershirt (visible at collar)
    const undershirt = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.12, 16), whiteMat);
    undershirt.position.set(0, 1.58, 0.05);
    undershirt.scale.z = 0.7;
    this.mesh.add(undershirt);

    // Gakuran collar — standing collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 28), uniformDarkMat);
    collar.position.set(0, 1.55, 0.02);
    collar.scale.z = 0.68;
    collar.rotation.x = Math.PI / 2;
    this.mesh.add(collar);

    // Collar flaps
    for (const side of [-1, 1]) {
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.025), uniformDarkMat);
      flap.position.set(side * 0.1, 1.5, 0.14);
      flap.rotation.x = -0.15;
      flap.rotation.z = side * 0.1;
      this.mesh.add(flap);
    }

    // Gold buttons down the front
    for (let i = 0; i < 3; i++) {
      const button = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), buttonMat);
      button.position.set(0, 1.42 - i * 0.16, 0.2);
      button.scale.set(1, 1, 0.6);
      this.mesh.add(button);
    }

    // Lower abdomen
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.38, 16), uniformDarkMat);
    abdomen.position.y = 0.9;
    abdomen.scale.z = 0.68;
    this.mesh.add(abdomen);

    // Belt
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 8, 28), uniformDarkMat);
    belt.position.y = 0.98;
    belt.scale.z = 0.7;
    belt.rotation.x = Math.PI / 2;
    this.mesh.add(belt);

    // ========== ARMS ==========
    this.addArms(skinMat, uniformMat, uniformDarkMat, armbandMat);

    // ========== LEGS ==========
    this.addLegs(uniformMat, uniformDarkMat);

    // ========== SPIRIT SWORD ==========
    this.addSpiritSword();
    this._captureFaceBaseState();
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

  addArms(skinMat, uniformMat, uniformDarkMat, armbandMat) {
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const upperLen = len * 0.45;
      const lowerLen = len * 0.4;

      // Upper arm — slightly thicker for bulkier build
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, upperLen, 5, 12), uniformMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      // Elbow
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), uniformDarkMat);
      elbow.position.y = -upperLen - 0.012;
      elbow.scale.set(1, 0.75, 0.9);
      group.add(elbow);

      // Forearm — uniform sleeve
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, lowerLen, 5, 12), uniformMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.035;
      forearm.scale.set(1.05, 1, 0.92);
      group.add(forearm);

      // Red armband on left arm (Kuwabara's signature)
      if (!isRight) {
        const armband = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.015, 8, 14), armbandMat);
        armband.position.y = -upperLen - 0.08;
        armband.rotation.x = Math.PI / 2;
        group.add(armband);
      }

      // Wrist
      const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.009, 8, 14), uniformDarkMat);
      wrist.position.y = -len + 0.08;
      wrist.rotation.x = Math.PI / 2;
      group.add(wrist);

      // Hand — slightly larger
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), skinMat);
      hand.position.y = -len;
      hand.scale.set(1, 0.92, 1.08);
      group.add(hand);

      // Knuckles hint
      const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.02, 0.03), skinMat);
      knuckle.position.set(0, -len - 0.005, 0.035);
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

    // Arms — slightly wider stance for bulkier build
    addArm(-0.3, 1.38, 0, -0.42, 0.78, 0.03, false);
    addArm(0.3, 1.38, 0, 0.42, 0.78, 0.03, true);
  }

  addLegs(uniformMat, uniformDarkMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.13, 0.68, 0);

      // Thigh — slightly thicker
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.32, 5, 12), uniformMat);
      thigh.position.y = -0.18;
      legGroup.add(thigh);

      // Knee
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), uniformDarkMat);
      knee.position.set(0, -0.37, 0.04);
      knee.scale.set(1.1, 0.75, 0.62);
      legGroup.add(knee);

      // Shin
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.32, 5, 12), uniformMat);
      shin.position.y = -0.56;
      shin.scale.set(1, 1, 0.9);
      legGroup.add(shin);

      // Ankle
      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 14), uniformDarkMat);
      ankle.position.y = -0.74;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      // Shoe — school loafers style
      const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), uniformDarkMat);
      shoe.position.set(0, -0.82, 0.06);
      shoe.scale.set(1, 0.55, 1.55);
      legGroup.add(shoe);

      // Shoe sole
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.16), uniformDarkMat);
      sole.position.set(0, -0.87, 0.06);
      legGroup.add(sole);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addSpiritSword() {
    // Spirit Sword — glowing orange energy blade extending from right hand
    // Multi-layer energy effect for pure energy look
    this.spiritSwordGroup = new THREE.Group();
    this.spiritSwordGlowIntensity = 1.0;

    // === CORE BLADE ===
    // Bright orange/yellow cylinder with emissive look — the hottest center
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const bladeCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.032, 1.15, 10),
      coreMat
    );
    bladeCore.rotation.x = Math.PI / 2;
    bladeCore.position.z = 0.6;
    this.spiritSwordGroup.add(bladeCore);
    this.spiritSwordCore = bladeCore;

    // === INNER GLOW ===
    // Slightly larger transparent orange cylinder — the main energy body
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const innerGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.055, 1.25, 10),
      innerGlowMat
    );
    innerGlow.rotation.x = Math.PI / 2;
    innerGlow.position.z = 0.6;
    this.spiritSwordGroup.add(innerGlow);
    this.spiritSwordInnerGlow = innerGlow;

    // === OUTER AURA ===
    // Even larger transparent cylinder that pulses — the energy radiance
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const aura = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.095, 1.4, 10),
      auraMat
    );
    aura.rotation.x = Math.PI / 2;
    aura.position.z = 0.6;
    this.spiritSwordGroup.add(aura);
    this.spiritSwordAura = aura;

    // === TIP FLARE ===
    // Bright tip to show energy concentration at the sword point
    const tipMat = new THREE.MeshBasicMaterial({
      color: 0xffcc66,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    const tipFlare = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      tipMat
    );
    tipFlare.position.z = 1.25;
    this.spiritSwordGroup.add(tipFlare);
    this.spiritSwordTip = tipFlare;

    // === ENERGY PARTICLES ===
    // Small spheres along the blade that float upward
    this.spiritSwordParticles = [];
    const particleColors = [0xff6600, 0xff8800, 0xffaa44, 0xffcc66];
    for (let i = 0; i < 14; i++) {
      const color = particleColors[i % particleColors.length];
      const particleMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      });
      const size = 0.012 + Math.random() * 0.018;
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(size, 6, 6),
        particleMat
      );
      // Distribute along blade length with some randomness
      const zBase = 0.15 + (i / 13) * 1.05;
      particle.position.set(
        (Math.random() - 0.5) * 0.07,
        (Math.random() - 0.5) * 0.07,
        zBase
      );
      particle.userData.baseZ = zBase;
      particle.userData.speed = 1.5 + Math.random() * 2.5;
      particle.userData.offset = Math.random() * Math.PI * 2;
      particle.userData.driftX = (Math.random() - 0.5) * 0.015;
      particle.userData.driftY = (Math.random() - 0.5) * 0.015;
      particle.userData.size = size;
      this.spiritSwordGroup.add(particle);
      this.spiritSwordParticles.push(particle);
    }

    // === ENERGY SPARKS ===
    // Tiny fast-moving sparks near the hilt
    this.spiritSwordSparks = [];
    for (let i = 0; i < 6; i++) {
      const sparkMat = new THREE.MeshBasicMaterial({
        color: 0xffdd88,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.008 + Math.random() * 0.008, 4, 4),
        sparkMat
      );
      spark.position.set(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        0.05 + Math.random() * 0.15
      );
      spark.userData.offset = Math.random() * Math.PI * 2;
      spark.userData.speed = 4 + Math.random() * 4;
      this.spiritSwordGroup.add(spark);
      this.spiritSwordSparks.push(spark);
    }

    // Attach to right hand
    this.spiritSwordGroup.position.set(0, -this.rightArmLength || -0.6, 0);
    this.spiritSwordGroup.visible = false; // hidden by default
    if (this.rightArm) {
      this.rightArm.add(this.spiritSwordGroup);
    } else {
      // Will be attached later if rightArm not yet created
      this._pendingSwordAttach = true;
    }
  }

  showSpiritSword() {
    if (this.spiritSwordGroup) {
      this.spiritSwordGroup.visible = true;
      this._alignSpiritSwordToCombatFacing();
    }
  }

  hideSpiritSword() {
    if (this.spiritSwordGroup) {
      this.spiritSwordGroup.visible = false;
    }
  }

  setSpiritSwordGlow(intensity) {
    // Clamp intensity to 0-1 range
    this.spiritSwordGlowIntensity = Math.max(0, Math.min(1, intensity));
    if (!this.spiritSwordGroup) return;

    const g = this.spiritSwordGlowIntensity;

    // Core blade opacity
    if (this.spiritSwordCore) {
      this.spiritSwordCore.material.opacity = 0.3 + g * 0.65;
    }
    // Inner glow opacity
    if (this.spiritSwordInnerGlow) {
      this.spiritSwordInnerGlow.material.opacity = g * 0.6;
      this.spiritSwordInnerGlow.visible = g > 0.05;
    }
    // Outer aura opacity
    if (this.spiritSwordAura) {
      this.spiritSwordAura.material.opacity = g * 0.3;
      this.spiritSwordAura.visible = g > 0.05;
    }
    // Tip flare
    if (this.spiritSwordTip) {
      this.spiritSwordTip.material.opacity = g * 0.5;
      this.spiritSwordTip.visible = g > 0.05;
    }
    // Particles
    for (const p of this.spiritSwordParticles || []) {
      p.material.opacity = g * 0.7;
      p.visible = g > 0.05;
    }
    // Sparks
    for (const s of this.spiritSwordSparks || []) {
      s.material.opacity = g * 0.9;
      s.visible = g > 0.05;
    }
  }

  setSpiritSwordLength(t) {
    // t from 0 to 1: sword grows from nothing to full length
    const scale = Math.max(0.01, Math.min(1, t)) * 1.75;
    if (!this.spiritSwordGroup) return;
    // Scale the entire sword group along Z (blade direction)
    this.spiritSwordGroup.scale.set(1, 1, scale);
    this._alignSpiritSwordToCombatFacing();
  }

  _alignSpiritSwordToCombatFacing() {
    if (!this.spiritSwordGroup || !this.rightArm) return;

    const facingDir = this.userData?.facingDir ?? this.mesh?.userData?.facingDir ?? 1;
    const worldDir = new THREE.Vector3(facingDir >= 0 ? 1 : -1, 0, 0);
    const localBladeAxis = new THREE.Vector3(0, 0, 1);
    const targetWorldQuat = new THREE.Quaternion().setFromUnitVectors(localBladeAxis, worldDir);
    const parentWorldQuat = new THREE.Quaternion();

    this.rightArm.updateWorldMatrix(true, false);
    this.rightArm.getWorldQuaternion(parentWorldQuat);
    this.spiritSwordGroup.quaternion.copy(parentWorldQuat.invert().multiply(targetWorldQuat));
  }

  getSpiritSwordVolume() {
    if (!this.spiritSwordGroup || !this.spiritSwordGroup.visible) return null;

    this._alignSpiritSwordToCombatFacing();

    this.spiritSwordGroup.updateWorldMatrix(true, false);
    const start = new THREE.Vector3(0, 0, 0.06).applyMatrix4(this.spiritSwordGroup.matrixWorld);
    const end = new THREE.Vector3(0, 0, 1.25).applyMatrix4(this.spiritSwordGroup.matrixWorld);
    const scale = new THREE.Vector3();
    this.spiritSwordGroup.getWorldScale(scale);
    const radialScale = Math.max(scale.x, scale.y);

    return {
      type: 'capsule',
      source: 'SpiritSword',
      start,
      end,
      radius: 0.13 * radialScale,
      length: start.distanceTo(end),
    };
  }

  setBattleStance(active = true) {
    if (!active) {
      if (this.leftArm) this.leftArm.rotation.z = this.leftArmBaseZ || 0;
      if (this.rightArm) this.rightArm.rotation.z = this.rightArmBaseZ || 0;
      if (this.leftArm) this.leftArm.rotation.x = 0;
      if (this.rightArm) this.rightArm.rotation.x = 0;
      this.hideSpiritSword();
      return;
    }
    // Right arm forward with Spirit Sword
    if (this.rightArm) {
      this.rightArm.rotation.z = (this.rightArmBaseZ || 0) - 0.5;
      this.rightArm.rotation.x = -0.3;
    }
    if (this.leftArm) {
      this.leftArm.rotation.z = (this.leftArmBaseZ || 0) + 0.35;
      this.leftArm.rotation.x = -0.1;
    }
    this.showSpiritSword();
  }

  update(time, delta) {
    super.update(time, delta);
    const dt = delta || 0;

    // Pompadour hair sway — the tall hair moves slightly with momentum
    if (this.pompadourMain) {
      this.pompadourMain.rotation.z = Math.sin(time * 1.2) * 0.015;
      this.pompadourMain.rotation.x = -0.35 + Math.sin(time * 0.9) * 0.01;
    }
    if (this.pompadourSecond) {
      this.pompadourSecond.rotation.z = Math.sin(time * 1.2 + 0.3) * 0.012;
    }
    if (this.frontSweep) {
      this.frontSweep.rotation.z = Math.sin(time * 1.5) * 0.02;
      this.frontSweep.rotation.x = -0.6 + Math.sin(time * 1.1) * 0.015;
    }
    if (this.topRidge) {
      this.topRidge.rotation.z = Math.sin(time * 1.3 + 0.5) * 0.018;
    }
    if (this.backHair) {
      this.backHair.rotation.z = Math.sin(time * 1.4) * 0.02;
      this.backHair.rotation.x = 0.35 + Math.sin(time * 1.0) * 0.015;
    }

    // Spirit Sword energy animation
    if (this.spiritSwordGroup && this.spiritSwordGroup.visible) {
      this._alignSpiritSwordToCombatFacing();
      const g = this.spiritSwordGlowIntensity || 1;
      const flicker = 0.9 + Math.random() * 0.2; // subtle energy flicker

      // === CORE BLADE FLICKER ===
      // Slight opacity and scale jitter for raw energy feel
      if (this.spiritSwordCore) {
        this.spiritSwordCore.material.opacity = (0.85 + Math.sin(time * 8) * 0.08) * g * flicker;
        this.spiritSwordCore.scale.set(
          1 + Math.sin(time * 12) * 0.03,
          1,
          1 + Math.cos(time * 10) * 0.02
        );
      }

      // === INNER GLOW PULSE ===
      if (this.spiritSwordInnerGlow) {
        this.spiritSwordInnerGlow.material.opacity = (0.45 + Math.sin(time * 5) * 0.1) * g;
        this.spiritSwordInnerGlow.scale.set(
          1 + Math.sin(time * 4) * 0.06,
          1,
          1 + Math.cos(time * 3.5) * 0.04
        );
      }

      // === OUTER AURA PULSE ===
      // Stronger, slower pulse for the radiance
      if (this.spiritSwordAura) {
        const auraPulse = 0.18 + Math.sin(time * 3) * 0.1;
        this.spiritSwordAura.material.opacity = auraPulse * g;
        this.spiritSwordAura.scale.set(
          1 + Math.sin(time * 2.5) * 0.15,
          1,
          1 + Math.cos(time * 2) * 0.08
        );
      }

      // === TIP FLARE PULSE ===
      if (this.spiritSwordTip) {
        this.spiritSwordTip.material.opacity = (0.35 + Math.sin(time * 6) * 0.12) * g;
        const tipScale = 1 + Math.sin(time * 5) * 0.2;
        this.spiritSwordTip.scale.set(tipScale, tipScale, tipScale);
      }

      // === ENERGY PARTICLES FLOATING UPWARD ===
      // Particles drift up the blade, reset when they reach the tip
      if (this.spiritSwordParticles) {
        for (const p of this.spiritSwordParticles) {
          const t = time * p.userData.speed + p.userData.offset;
          // Float upward along Z (blade direction)
          const floatZ = ((t * 0.08) % 1.1);
          p.position.z = 0.12 + floatZ * 1.1;
          // Spiral drift around the blade
          const spiralAngle = t * 2 + p.userData.offset;
          const radius = 0.025 + Math.sin(t * 3) * 0.015;
          p.position.x = Math.cos(spiralAngle) * radius + p.userData.driftX;
          p.position.y = Math.sin(spiralAngle) * radius + p.userData.driftY;
          // Fade near tip and base
          const normalizedPos = floatZ;
          const fade = Math.sin(normalizedPos * Math.PI); // brightest in middle
          p.material.opacity = (0.2 + fade * 0.6) * g;
          // Scale pulse
          const scalePulse = 1 + Math.sin(t * 4) * 0.3;
          p.scale.setScalar(scalePulse);
        }
      }

      // === ENERGY SPARKS ===
      // Fast flickering sparks near the hilt
      if (this.spiritSwordSparks) {
        for (const s of this.spiritSwordSparks) {
          const t = time * s.userData.speed + s.userData.offset;
          s.position.x = Math.sin(t * 3) * 0.04;
          s.position.y = Math.cos(t * 2.5) * 0.04;
          s.position.z = 0.05 + Math.abs(Math.sin(t * 2)) * 0.12;
          s.material.opacity = (0.4 + Math.sin(t * 8) * 0.4) * g;
          const sparkScale = 0.7 + Math.sin(t * 10) * 0.5;
          s.scale.setScalar(Math.max(0.1, sparkScale));
        }
      }
    }

    // Late attach Spirit Sword if rightArm wasn't ready during build
    if (this._pendingSwordAttach && this.rightArm) {
      this.spiritSwordGroup.position.set(0, -this.rightArmLength, 0);
      this.rightArm.add(this.spiritSwordGroup);
      this._pendingSwordAttach = false;
    }
  }
}
