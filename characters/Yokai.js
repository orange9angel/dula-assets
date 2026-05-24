import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Yokai (妖怪) — Yu Yu Hakusho
 * A low-level demon/spirit monster antagonist. Classic Japanese yokai design:
 * dark purple/indigo shadowy body, glowing red eyes, hunched menacing posture,
 * clawed hands, small horns, pointed ears, and a shadowy aura.
 * ~1.6m tall (shorter than Yusuke).
 */
export class Yokai extends CharacterBase {
  constructor() {
    super('Yokai');
    this.boundingRadius = 0.5;
    this._auraActive = true;
    this.archetypes = ['humanoid', 'monster', 'slow'];
  }

  build() {
    const toonGradient = this.createToonGradient();

    // Materials
    const bodyMat = new THREE.MeshToonMaterial({ color: 0x3a1a5a, gradientMap: toonGradient });
    const bodyDarkMat = new THREE.MeshToonMaterial({ color: 0x2a1040, gradientMap: toonGradient });
    const bodyShadowMat = new THREE.MeshToonMaterial({ color: 0x1a0830, gradientMap: toonGradient });
    const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const eyeCoreMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    const clawMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a, gradientMap: toonGradient });
    const hornMat = new THREE.MeshToonMaterial({ color: 0x2a1040, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x8a0a20, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.58;

    // Face — slightly gaunt, angular
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), bodyMat);
    face.scale.set(0.88, 1.1, 0.92);
    face.castShadow = true;
    headGroup.add(face);

    // Chin — pointed
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), bodyDarkMat);
    chin.position.set(0, -0.2, 0.1);
    chin.scale.set(0.75, 0.7, 0.85);
    headGroup.add(chin);

    // Jawline — sharp
    for (const side of [-1, 1]) {
      const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), bodyDarkMat);
      jaw.position.set(side * 0.16, -0.13, 0.06);
      jaw.scale.set(0.55, 0.75, 0.65);
      headGroup.add(jaw);
    }

    // Pointed ears
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 6), bodyDarkMat);
      ear.position.set(side * 0.24, 0.06, 0.0);
      ear.rotation.z = side * -0.3;
      ear.rotation.x = -0.1;
      headGroup.add(ear);
    }

    // Small horns
    for (const side of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 6), hornMat);
      horn.position.set(side * 0.12, 0.3, 0.02);
      horn.rotation.z = side * -0.25;
      horn.rotation.x = -0.2;
      headGroup.add(horn);
    }

    // Glowing red eyes — slanted, menacing
    const eyeGeo = new THREE.SphereGeometry(0.055, 16, 16);
    for (const side of [-1, 1]) {
      // Eye socket (dark background)
      const socket = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        bodyShadowMat
      );
      socket.position.set(side * 0.09, 0.04, 0.22);
      socket.scale.set(1.2, 0.85, 0.55);
      headGroup.add(socket);

      // Eye glow
      const eye = new THREE.Mesh(eyeGeo, eyeGlowMat);
      eye.position.set(side * 0.09, 0.04, 0.235);
      eye.scale.set(1.1, 0.75, 0.42);
      headGroup.add(eye);

      // Pupil (bright core)
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), eyeCoreMat);
      pupil.position.set(side * 0.09, 0.04, 0.258);
      pupil.scale.set(0.9, 0.7, 0.35);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      // Eyelid shadow — slanted, angry look
      const lidShadow = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.4 })
      );
      lidShadow.position.set(side * 0.09, 0.075, 0.22);
      lidShadow.scale.set(1.3, 0.35, 0.5);
      lidShadow.rotation.z = side * -0.3;
      headGroup.add(lidShadow);

      // Lower lid shadow
      const lowerLid = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.3 })
      );
      lowerLid.position.set(side * 0.09, 0.01, 0.22);
      lowerLid.scale.set(1.2, 0.3, 0.5);
      lowerLid.rotation.z = side * 0.2;
      headGroup.add(lowerLid);
    }

    // Eyebrows — sharp, angled down (angry/menacing)
    const browGeo = new THREE.BoxGeometry(0.09, 0.012, 0.01);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, bodyShadowMat);
      brow.position.set(side * 0.09, 0.12, 0.24);
      brow.rotation.z = side * -0.4;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Eyelids — thin boxes above each eye
    const eyelidGeo = new THREE.BoxGeometry(0.08, 0.006, 0.012);
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.4 });
    for (const side of [-1, 1]) {
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.position.set(side * 0.09, 0.085, 0.24);
      headGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;
    }

    // Nose — sharp, small
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.05, 5), bodyDarkMat);
    nose.position.set(0, -0.03, 0.26);
    nose.rotation.x = -Math.PI / 2;
    headGroup.add(nose);

    // Mouth — jagged, menacing grin
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.05, -0.1, 0.255),
      new THREE.Vector3(0, -0.09, 0.265),
      new THREE.Vector3(0.05, -0.1, 0.255)
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 12, 0.004, 8, false), mouthMat);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY — Hunched, Shadowy ==========
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 16), bodyDarkMat);
    neck.position.y = 1.42;
    this.mesh.add(neck);

    // Torso — hunched forward, slightly stooped
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.48, 20), bodyMat);
    torso.position.y = 1.14;
    torso.scale.z = 0.72;
    torso.rotation.x = 0.12; // hunched forward
    torso.castShadow = true;
    this.mesh.add(torso);

    // Chest — slight definition
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), bodyMat);
    chest.position.set(0, 1.24, 0.08);
    chest.scale.set(1.05, 0.55, 0.48);
    this.mesh.add(chest);

    // Abdomen
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.3, 16), bodyDarkMat);
    abdomen.position.y = 0.78;
    abdomen.scale.z = 0.62;
    this.mesh.add(abdomen);

    // Shoulder spikes — bony protrusions
    for (const side of [-1, 1]) {
      const shoulderSpike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 6), bodyShadowMat);
      shoulderSpike.position.set(side * 0.26, 1.36, 0.02);
      shoulderSpike.rotation.z = side * -0.5;
      shoulderSpike.rotation.x = -0.3;
      this.mesh.add(shoulderSpike);
    }

    this.addArms(bodyMat, bodyDarkMat, clawMat);
    this.addLegs(bodyMat, bodyDarkMat);
    this.addShadowAura();
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

  addArms(bodyMat, bodyDarkMat, clawMat) {
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const upperLen = len * 0.45;
      const lowerLen = len * 0.4;

      // Upper arm — wiry, lean muscle
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, upperLen, 5, 12), bodyMat);
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      // Elbow — bony
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), bodyDarkMat);
      elbow.position.y = -upperLen - 0.01;
      elbow.scale.set(1, 0.68, 0.82);
      group.add(elbow);

      // Forearm — slightly thicker
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, lowerLen, 5, 12), bodyDarkMat);
      forearm.position.y = -upperLen - lowerLen / 2 - 0.03;
      group.add(forearm);

      // Hand — claw-like
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), bodyMat);
      hand.position.y = -len;
      hand.scale.set(1, 0.85, 1.1);
      group.add(hand);

      // Claws — 3 sharp claws per hand
      for (let i = 0; i < 3; i++) {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.06, 4), clawMat);
        const clawX = (i - 1) * 0.018;
        claw.position.set(clawX, -len - 0.02, 0.045);
        claw.rotation.x = -Math.PI / 2 + 0.2;
        group.add(claw);
      }

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

    // Arms — slightly forward, menacing reach
    addArm(-0.24, 1.22, 0.05, -0.36, 0.68, 0.08, false);
    addArm(0.24, 1.22, 0.05, 0.36, 0.68, 0.08, true);
  }

  addLegs(bodyMat, bodyDarkMat) {
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.1, 0.58, 0);

      // Thigh — lean
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.26, 5, 12), bodyMat);
      thigh.position.y = -0.15;
      legGroup.add(thigh);

      // Knee — bony
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), bodyDarkMat);
      knee.position.set(0, -0.32, 0.03);
      knee.scale.set(1.02, 0.68, 0.52);
      legGroup.add(knee);

      // Shin
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.26, 5, 12), bodyDarkMat);
      shin.position.y = -0.48;
      shin.scale.set(1, 1, 0.82);
      legGroup.add(shin);

      // Ankle
      const ankle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.009, 8, 14), bodyMat);
      ankle.position.y = -0.62;
      ankle.rotation.x = Math.PI / 2;
      legGroup.add(ankle);

      // Foot — clawed
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), bodyMat);
      foot.position.set(0, -0.68, 0.04);
      foot.scale.set(1, 0.48, 1.4);
      legGroup.add(foot);

      // Toe claws
      for (let i = 0; i < 2; i++) {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.04, 4), bodyDarkMat);
        const clawX = (i === 0 ? -0.02 : 0.02);
        claw.position.set(clawX, -0.68, 0.12);
        claw.rotation.x = -Math.PI / 2 + 0.15;
        legGroup.add(claw);
      }

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  addShadowAura() {
    this.auraGroup = new THREE.Group();

    // Main dark purple mist sphere
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x3a1a5a,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 16), auraMat);
    aura.position.y = 0.85;
    aura.scale.set(0.85, 1.4, 0.55);
    this.auraGroup.add(aura);
    this.shadowAura = aura;

    // Dark mist particles
    const mistMat = new THREE.MeshBasicMaterial({
      color: 0x2a1040,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    this.mistParticles = [];
    for (let i = 0; i < 12; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.02 + (i % 4) * 0.008, 6, 6),
        mistMat.clone()
      );
      const a = (i / 12) * Math.PI * 2;
      const r = 0.32 + (i % 3) * 0.1;
      particle.position.set(
        Math.cos(a) * r,
        0.45 + (i % 6) * 0.18,
        Math.sin(a) * r * 0.4
      );
      particle.userData.basePos = particle.position.clone();
      particle.userData.speed = 1 + Math.random() * 2;
      particle.userData.offset = Math.random() * Math.PI * 2;
      this.auraGroup.add(particle);
      this.mistParticles.push(particle);
    }

    // Faint dark rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1a0830,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });
    this.auraRings = [];
    for (let i = 0; i < 2; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.3 + i * 0.1, 0.006, 8, 36),
        ringMat.clone()
      );
      ring.position.y = 0.65 + i * 0.3;
      ring.rotation.x = Math.PI / 2 + i * 0.2;
      this.auraGroup.add(ring);
      this.auraRings.push(ring);
    }

    this.mesh.add(this.auraGroup);
  }

  showAura() {
    this._auraActive = true;
    if (this.auraGroup) this.auraGroup.visible = true;
  }

  hideAura() {
    this._auraActive = false;
    if (this.auraGroup) this.auraGroup.visible = false;
  }

  setBattleStance(active = true) {
    if (!active) {
      if (this.leftArm) this.leftArm.rotation.z = this.leftArmBaseZ || 0;
      if (this.rightArm) this.rightArm.rotation.z = this.rightArmBaseZ || 0;
      if (this.leftArm) this.leftArm.rotation.x = 0;
      if (this.rightArm) this.rightArm.rotation.x = 0;
      return;
    }
    // Arms raised, claws ready
    if (this.rightArm) {
      this.rightArm.rotation.z = (this.rightArmBaseZ || 0) - 0.7;
      this.rightArm.rotation.x = -0.25;
    }
    if (this.leftArm) {
      this.leftArm.rotation.z = (this.leftArmBaseZ || 0) + 0.7;
      this.leftArm.rotation.x = -0.25;
    }
  }

  update(time, delta) {
    super.update(time, delta);
    const dt = delta || 0;

    // Shadow aura pulse
    if (this.shadowAura) {
      const pulse = 0.08 + Math.sin(time * 2.8) * 0.035;
      this.shadowAura.material.opacity = this._auraActive ? pulse : 0;
      this.shadowAura.scale.set(
        0.85 + Math.sin(time * 2.2) * 0.04,
        1.4 + Math.sin(time * 1.8) * 0.06,
        0.55
      );
    }

    // Mist particles drift
    if (this.mistParticles) {
      for (const p of this.mistParticles) {
        const t = time * p.userData.speed + p.userData.offset;
        p.position.x = p.userData.basePos.x + Math.sin(t) * 0.03;
        p.position.y = p.userData.basePos.y + Math.cos(t * 0.6) * 0.04;
        p.material.opacity = this._auraActive ? 0.1 + Math.abs(Math.sin(t * 1.5)) * 0.15 : 0;
      }
    }

    // Aura rings rotate slowly
    if (this.auraRings) {
      for (let i = 0; i < this.auraRings.length; i++) {
        const ring = this.auraRings[i];
        ring.rotation.z += dt * (0.3 + i * 0.15);
        ring.material.opacity = this._auraActive ? 0.1 + Math.sin(time * 2.0 + i) * 0.05 : 0;
      }
    }

    // Eye glow flicker
    if (this.leftPupil && this.rightPupil) {
      const flicker = 1.0 + Math.sin(time * 8.0) * 0.08 + Math.sin(time * 13.0) * 0.04;
      this.leftPupil.scale.set(0.9 * flicker, 0.7 * flicker, 0.35);
      this.rightPupil.scale.set(0.9 * flicker, 0.7 * flicker, 0.35);
    }

    // Slight idle tremble — menacing
    if (this.mesh) {
      this.mesh.position.y = this.baseY + Math.sin(time * 6.0) * 0.003;
    }

    // Head slight twitch
    if (this.headGroup) {
      this.headGroup.rotation.x = Math.sin(time * 1.2) * 0.015 + Math.sin(time * 5.5) * 0.008;
      this.headGroup.rotation.y = Math.sin(time * 0.9) * 0.02;
    }

    // Arms slight idle sway (unnatural, twitchy)
    if (this.leftArm) {
      this.leftArm.rotation.z = (this.leftArmBaseZ || 0) + Math.sin(time * 1.5) * 0.02 + Math.sin(time * 4.0) * 0.01;
    }
    if (this.rightArm) {
      this.rightArm.rotation.z = (this.rightArmBaseZ || 0) - Math.sin(time * 1.5) * 0.02 - Math.sin(time * 4.0) * 0.01;
    }
  }
}
