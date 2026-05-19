import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Shadow Weaver (暗影编织者) — Hordak's sorceress advisor
 * 神秘的女巫师，身穿深色长袍，面部被面具遮挡
 * 红色魔法光芒从面具眼孔中透出
 */
export class ShadowWeaver extends CharacterBase {
  constructor() {
    super('ShadowWeaver');
    this.boundingRadius = 0.55;
  }

  build() {
    const toonGradient = (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 4; canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 4, 0);
      g.addColorStop(0, '#666'); g.addColorStop(0.4, '#888'); g.addColorStop(0.7, '#aaa'); g.addColorStop(1, '#ccc');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 1);
      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      return tex;
    })();

    const robeMat = new THREE.MeshToonMaterial({ color: 0x1a0a2e, gradientMap: toonGradient });
    const darkRobeMat = new THREE.MeshToonMaterial({ color: 0x0d0518, gradientMap: toonGradient });
    const maskMat = new THREE.MeshToonMaterial({ color: 0x2a1a3e, gradientMap: toonGradient });
    const redGlowMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const hoodMat = new THREE.MeshToonMaterial({ color: 0x150820, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.85;

    // Hood (large, shadowed)
    const hoodGeo = new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.85);
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 0.05, -0.08);
    hood.scale.set(1.1, 1.08, 0.82);
    headGroup.add(hood);

    // Mask face (angular, featureless)
    const maskFaceGeo = new THREE.SphereGeometry(0.24, 32, 32);
    const maskFace = new THREE.Mesh(maskFaceGeo, maskMat);
    maskFace.position.z = 0.16;
    maskFace.scale.set(0.9, 1.1, 0.85);
    maskFace.castShadow = true;
    headGroup.add(maskFace);

    // Mask eye holes (glowing red)
    for (const side of [-1, 1]) {
      const eyeHoleGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const eyeHole = new THREE.Mesh(eyeHoleGeo, redGlowMat);
      eyeHole.position.set(side * 0.08, 0.04, 0.36);
      eyeHole.scale.set(1, 0.7, 0.5);
      headGroup.add(eyeHole);

      // Inner glow core
      const coreGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: 0xff6688 }));
      core.position.set(side * 0.08, 0.04, 0.39);
      headGroup.add(core);
    }

    // Mask mouth (thin slit)
    const mouthSlitGeo = new THREE.BoxGeometry(0.08, 0.008, 0.02);
    const mouthSlit = new THREE.Mesh(mouthSlitGeo, redGlowMat);
    mouthSlit.position.set(0, -0.1, 0.36);
    headGroup.add(mouthSlit);

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.12, 16);
    const neck = new THREE.Mesh(neckGeo, darkRobeMat);
    neck.position.y = 1.68;
    this.mesh.add(neck);

    // ========== BODY / ROBE ==========
    // Flowing robe body
    const robeBodyGeo = new THREE.CylinderGeometry(0.2, 0.45, 0.9, 16);
    const robeBody = new THREE.Mesh(robeBodyGeo, robeMat);
    robeBody.position.y = 1.2;
    robeBody.castShadow = true;
    this.mesh.add(robeBody);

    // Robe collar (high, dramatic)
    const collarGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.15, 16, 1, true);
    const collar = new THREE.Mesh(collarGeo, darkRobeMat);
    collar.position.y = 1.65;
    this.mesh.add(collar);

    // Shoulder pads (pointed)
    for (const side of [-1, 1]) {
      const padGeo = new THREE.ConeGeometry(0.1, 0.2, 4);
      const pad = new THREE.Mesh(padGeo, darkRobeMat);
      pad.position.set(side * 0.28, 1.55, 0);
      pad.rotation.z = side * 0.5;
      this.mesh.add(pad);
    }

    // Magic amulet (chest)
    const amuletGeo = new THREE.OctahedronGeometry(0.06, 0);
    const amulet = new THREE.Mesh(amuletGeo, redGlowMat);
    amulet.position.set(0, 1.35, 0.22);
    this.mesh.add(amulet);
    this.amulet = amulet;

    // Amulet glow
    const amuletGlowGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const amuletGlow = new THREE.Mesh(amuletGlowGeo, new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.15 }));
    amuletGlow.position.set(0, 1.35, 0.22);
    this.mesh.add(amuletGlow);
    this.amuletGlow = amuletGlow;

    // ========== ARMS (in sleeves) ==========
    const handGeo = new THREE.SphereGeometry(0.05, 16, 16);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.1);
      const sleeveMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, capLen, 4, 16), robeMat);
      sleeveMesh.position.y = -len / 2;
      group.add(sleeveMesh);

      // Hand (pale, bony)
      const handMesh = new THREE.Mesh(handGeo, new THREE.MeshToonMaterial({ color: 0xcccccc, gradientMap: toonGradient }));
      handMesh.position.y = -len;
      group.add(handMesh);

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

    addArm(-0.3, 1.5, 0, -0.4, 0.9, 0, false);
    addArm(0.3, 1.5, 0, 0.4, 0.9, 0, true);

    // ========== ROBE BOTTOM / LEGS (hidden) ==========
    const robeBottomGeo = new THREE.ConeGeometry(0.48, 0.8, 16);
    const robeBottom = new THREE.Mesh(robeBottomGeo, robeMat);
    robeBottom.position.y = 0.4;
    this.mesh.add(robeBottom);

    // ========== MAGIC STAFF (prop) ==========
    this.staffGroup = new THREE.Group();
    this.staffGroup.visible = false;

    const staffShaftGeo = new THREE.CylinderGeometry(0.015, 0.02, 1.6, 8);
    const staffShaft = new THREE.Mesh(staffShaftGeo, darkRobeMat);
    staffShaft.position.y = 0.8;
    this.staffGroup.add(staffShaft);

    // Staff head (crystal orb)
    const orbGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const orb = new THREE.Mesh(orbGeo, new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.7 }));
    orb.position.y = 1.65;
    this.staffGroup.add(orb);
    this.orb = orb;

    // Orb glow
    const orbGlowGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const orbGlow = new THREE.Mesh(orbGlowGeo, new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.12 }));
    orbGlow.position.y = 1.65;
    this.staffGroup.add(orbGlow);
    this.orbGlow = orbGlow;

    // Staff position in right hand
    this.staffGroup.position.set(0.4, 0.9, 0.15);
    this.mesh.add(this.staffGroup);

    // ========== FLOATING MAGIC PARTICLES ==========
    this.magicParticles = [];
    const particleColors = [0xff0044, 0x8800ff, 0x4400aa];
    for (let i = 0; i < 12; i++) {
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      const size = 0.015 + Math.random() * 0.025;
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(size, 6, 6),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 + Math.random() * 0.3 })
      );
      const px = (Math.random() - 0.5) * 0.8;
      const py = 0.5 + Math.random() * 1.2;
      const pz = (Math.random() - 0.5) * 0.6;
      particle.position.set(px, py, pz);
      this.mesh.add(particle);
      this.magicParticles.push({
        mesh: particle,
        basePos: { x: px, y: py, z: pz },
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
  }

  attachStaff() {
    if (this.staffGroup) this.staffGroup.visible = true;
  }

  detachStaff() {
    if (this.staffGroup) this.staffGroup.visible = false;
  }

  update(time, delta) {
    super.update(time, delta);

    // Amulet pulse
    if (this.amuletGlow) {
      const pulse = 0.12 + Math.sin(time * 2.5) * 0.06;
      this.amuletGlow.material.opacity = pulse;
      this.amuletGlow.scale.setScalar(1 + Math.sin(time * 2.5) * 0.15);
    }

    // Orb pulse (if staff visible)
    if (this.staffGroup?.visible && this.orbGlow) {
      const orbPulse = 0.1 + Math.sin(time * 3) * 0.05;
      this.orbGlow.material.opacity = orbPulse;
      this.orbGlow.scale.setScalar(1 + Math.sin(time * 3) * 0.2);
      if (this.orb) {
        this.orb.material.opacity = 0.6 + Math.sin(time * 3) * 0.15;
      }
    }

    // Magic particles orbit
    if (this.magicParticles) {
      for (const p of this.magicParticles) {
        p.mesh.position.y = p.basePos.y + Math.sin(time * p.speed + p.phase) * 0.15;
        p.mesh.position.x = p.basePos.x + Math.cos(time * p.speed * 0.7 + p.phase) * 0.1;
        p.mesh.position.z = p.basePos.z + Math.sin(time * p.speed * 0.5 + p.phase) * 0.08;
        p.mesh.material.opacity = 0.3 + Math.sin(time * 3 + p.phase) * 0.25;
      }
    }

    // Hood subtle sway
    if (this.headGroup) {
      this.headGroup.rotation.z = Math.sin(time * 0.5) * 0.02;
    }
  }
}
