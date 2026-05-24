import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Ultraman (初代奥特曼) — 40米高的宇宙英雄
 * 经典银色身躯 + 红色条纹，发光的椭圆形双眼
 * 头冠（Crest），彩色计时器（Color Timer）
 * 比例：奥特曼身高约40米，人类角色应该像蚂蚁一样小
 */
export class Ultraman extends CharacterBase {
  constructor() {
    super('Ultraman');
    this.boundingRadius = 2.0;
    this.archetypes = ['humanoid', 'fighter', 'athletic', 'giant'];
  }

  build() {
    const toonGradient = (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 4; canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 4, 0);
      g.addColorStop(0, '#aaa'); g.addColorStop(0.4, '#ccc'); g.addColorStop(0.7, '#eee'); g.addColorStop(1, '#fff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 1);
      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      return tex;
    })();

    // Classic Ultraman colors
    const silverMat = new THREE.MeshToonMaterial({ color: 0xc0c0c0, gradientMap: toonGradient });
    const redMat = new THREE.MeshToonMaterial({ color: 0xd32f2f, gradientMap: toonGradient });
    const glowEyeMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    const timerBlueMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    const timerRedMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 6.5;

    // Main head (silver, slightly elongated)
    const headGeo = new THREE.SphereGeometry(0.9, 32, 32);
    const head = new THREE.Mesh(headGeo, silverMat);
    head.scale.set(1.0, 1.3, 0.95);
    head.castShadow = true;
    headGroup.add(head);

    // Classic Ultraman crest (red fin on top)
    const crestGeo = new THREE.BoxGeometry(0.15, 0.8, 1.2);
    const crest = new THREE.Mesh(crestGeo, redMat);
    crest.position.set(0, 1.0, -0.15);
    crest.rotation.x = 0.15;
    headGroup.add(crest);

    // Side crests (smaller fins)
    for (const side of [-1, 1]) {
      const sideCrestGeo = new THREE.BoxGeometry(0.1, 0.5, 0.8);
      const sideCrest = new THREE.Mesh(sideCrestGeo, redMat);
      sideCrest.position.set(side * 0.75, 0.7, -0.2);
      sideCrest.rotation.z = side * 0.4;
      headGroup.add(sideCrest);
    }

    // Eyes (large oval, glowing yellow)
    const eyeGeo = new THREE.SphereGeometry(0.25, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, glowEyeMat);
      eye.position.set(side * 0.35, 0.15, 0.7);
      eye.scale.set(1.0, 1.6, 0.4);
      headGroup.add(eye);

      // Eye glow halo
      const haloGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.15 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(side * 0.35, 0.15, 0.7);
      halo.scale.set(1.0, 1.6, 0.4);
      headGroup.add(halo);
    }

    // Mouth (small, silver line)
    const mouthGeo = new THREE.BoxGeometry(0.2, 0.03, 0.05);
    const mouth = new THREE.Mesh(mouthGeo, silverMat);
    mouth.position.set(0, -0.4, 0.85);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.4, 16);
    const neck = new THREE.Mesh(neckGeo, silverMat);
    neck.position.y = 5.9;
    this.mesh.add(neck);

    // ========== BODY ==========
    // Torso (silver with red pattern - classic Ultraman chest design)
    const torsoGeo = new THREE.CylinderGeometry(0.9, 0.7, 2.0, 16);
    const torso = new THREE.Mesh(torsoGeo, silverMat);
    torso.position.y = 4.8;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Red chest stripes (classic V-shape + vertical)
    const chestVGeo = new THREE.ConeGeometry(0.8, 1.2, 3);
    const chestV = new THREE.Mesh(chestVGeo, redMat);
    chestV.position.set(0, 5.2, 0.55);
    chestV.rotation.x = Math.PI;
    chestV.scale.z = 0.15;
    this.mesh.add(chestV);

    // Vertical red stripe down center
    const centerStripeGeo = new THREE.BoxGeometry(0.15, 1.8, 0.1);
    const centerStripe = new THREE.Mesh(centerStripeGeo, redMat);
    centerStripe.position.set(0, 4.8, 0.65);
    this.mesh.add(centerStripe);

    // Red stripes on sides
    for (const side of [-1, 1]) {
      const sideStripeGeo = new THREE.BoxGeometry(0.12, 1.5, 0.08);
      const sideStripe = new THREE.Mesh(sideStripeGeo, redMat);
      sideStripe.position.set(side * 0.7, 4.8, 0.6);
      this.mesh.add(sideStripe);
    }

    // Color Timer (chest - blue when healthy)
    const timerGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16);
    this.timerMesh = new THREE.Mesh(timerGeo, timerBlueMat);
    this.timerMesh.position.set(0, 4.8, 0.72);
    this.timerMesh.rotation.x = Math.PI / 2;
    this.mesh.add(this.timerMesh);

    // Timer glow
    const timerGlowGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const timerGlowMat = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.2 });
    this.timerGlow = new THREE.Mesh(timerGlowGeo, timerGlowMat);
    this.timerGlow.position.set(0, 4.8, 0.72);
    this.mesh.add(this.timerGlow);

    // ========== ARMS ==========
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.3);

      // Upper arm (silver)
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, capLen * 0.45, 4, 16), silverMat);
      upperArm.position.y = -capLen * 0.22;
      group.add(upperArm);

      // Red armband
      const bandGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 16);
      const band = new THREE.Mesh(bandGeo, redMat);
      band.position.y = -capLen * 0.45;
      band.rotation.x = Math.PI / 2;
      group.add(band);

      // Lower arm (silver)
      const lowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, capLen * 0.45, 4, 16), silverMat);
      lowerArm.position.y = -capLen * 0.68;
      group.add(lowerArm);

      // Hand (silver)
      const handGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const hand = new THREE.Mesh(handGeo, silverMat);
      hand.position.y = -len;
      group.add(hand);

      this.mesh.add(group);
      if (isRight) {
        this.rightArm = group;
        this.rightArmLength = len;
        this.rightArmBaseZ = group.rotation.z;
      } else {
        this.leftArm = group;
        this.leftArmBaseZ = group.rotation.z;
      }
    };

    addArm(-1.0, 5.5, 0, -1.4, 2.8, 0, false);
    addArm(1.0, 5.5, 0, 1.4, 2.8, 0, true);

    // ========== LEGS ==========
    const addLeg = (side) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.45, 2.8, 0);

      // Thigh (silver with red stripe)
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.2, 4, 16), silverMat);
      thigh.position.y = -0.6;
      legGroup.add(thigh);

      // Red thigh stripe
      const thighStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.8, 0.05),
        redMat
      );
      thighStripe.position.set(side * 0.15, -0.6, 0.22);
      legGroup.add(thighStripe);

      // Shin (silver)
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 1.2, 4, 16), silverMat);
      shin.position.y = -1.8;
      legGroup.add(shin);

      // Red boot top
      const bootTopGeo = new THREE.TorusGeometry(0.3, 0.04, 8, 16);
      const bootTop = new THREE.Mesh(bootTopGeo, redMat);
      bootTop.position.y = -2.4;
      bootTop.rotation.x = Math.PI / 2;
      legGroup.add(bootTop);

      // Boot (silver)
      const bootGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const boot = new THREE.Mesh(bootGeo, silverMat);
      boot.position.set(0, -2.7, 0.08);
      boot.scale.set(1, 0.7, 1.4);
      legGroup.add(boot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    };

    addLeg(-1);
    addLeg(1);

    // ========== BODY GLOW EFFECT ==========
    const bodyGlowGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const bodyGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.03 });
    this.bodyGlow = new THREE.Mesh(bodyGlowGeo, bodyGlowMat);
    this.bodyGlow.position.y = 4.5;
    this.mesh.add(this.bodyGlow);
  }

  setTimerColor(isRed) {
    if (this.timerMesh) {
      this.timerMesh.material.color.setHex(isRed ? 0xff0000 : 0x00aaff);
    }
    if (this.timerGlow) {
      this.timerGlow.material.color.setHex(isRed ? 0xff0000 : 0x00aaff);
    }
  }

  update(time, delta) {
    super.update(time, delta);
    // Timer pulse
    if (this.timerGlow) {
      const pulse = 0.15 + Math.sin(time * 4) * 0.08;
      this.timerGlow.material.opacity = pulse;
      this.timerGlow.scale.setScalar(1 + Math.sin(time * 4) * 0.2);
    }
    // Body glow pulse
    if (this.bodyGlow) {
      this.bodyGlow.material.opacity = 0.02 + Math.sin(time * 2) * 0.015;
    }
  }
}
