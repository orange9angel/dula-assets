import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Xingzai (星仔) — 星际快递员
 * 圆滚滚的蓝色身体，星星形状的眼睛，头上有信号天线
 */
export class Xingzai extends CharacterBase {
  constructor() {
    super('Xingzai');
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

    const bodyMat = new THREE.MeshToonMaterial({ color: 0x4a90d9, gradientMap: toonGradient });
    const bellyMat = new THREE.MeshToonMaterial({ color: 0xe8f4f8, gradientMap: toonGradient });
    const eyeMat = new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x1a1a3a, gradientMap: toonGradient });
    const antennaMat = new THREE.MeshToonMaterial({ color: 0xff6b6b, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });

    // Head group
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.5;

    // Main head (slightly squashed sphere)
    const headGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.scale.y = 0.9;
    head.castShadow = true;
    headGroup.add(head);

    // Star-shaped eyes (5-pointed star geometry)
    const createStar = (outerR, innerR, points) => {
      const shape = new THREE.Shape();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
      return geo;
    };

    const starGeo = createStar(0.12, 0.05, 5);

    // Left star eye
    const leftEye = new THREE.Mesh(starGeo, eyeMat);
    leftEye.position.set(-0.22, 0.15, 0.55);
    leftEye.rotation.x = -0.1;
    headGroup.add(leftEye);

    // Right star eye
    const rightEye = new THREE.Mesh(starGeo, eyeMat);
    rightEye.position.set(0.22, 0.15, 0.55);
    rightEye.rotation.x = -0.1;
    headGroup.add(rightEye);

    // Pupils (small dark dots in center of stars)
    const pupilGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.22, 0.15, 0.6);
    leftPupil.userData.baseX = leftPupil.position.x;
    headGroup.add(leftPupil);
    this.leftPupil = leftPupil;

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.22, 0.15, 0.6);
    rightPupil.userData.baseX = rightPupil.position.x;
    headGroup.add(rightPupil);
    this.rightPupil = rightPupil;

    // Mouth (small smile)
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.08, -0.15, 0.55),
      new THREE.Vector3(0, -0.2, 0.58),
      new THREE.Vector3(0.08, -0.15, 0.55)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 8, 0.008, 8, false);
    const smile = new THREE.Mesh(smileGeo, pupilMat);
    headGroup.add(smile);
    this.mouth = smile;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    // Antenna (on top of head)
    const antennaGroup = new THREE.Group();
    antennaGroup.position.y = 0.6;

    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const stem = new THREE.Mesh(stemGeo, antennaMat);
    stem.position.y = 0.15;
    antennaGroup.add(stem);

    // Glowing ball on antenna tip
    const ballGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const ball = new THREE.Mesh(ballGeo, new THREE.MeshBasicMaterial({ color: 0xff6b6b }));
    ball.position.y = 0.32;
    antennaGroup.add(ball);

    // Glow ring around ball
    const glowGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({
      color: 0xff9999, transparent: true, opacity: 0.3
    }));
    glow.position.y = 0.32;
    antennaGroup.add(glow);

    headGroup.add(antennaGroup);
    this.antennaBall = ball;
    this.antennaGlow = glow;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // Body (round)
    const bodyGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    body.scale.y = 1.05;
    body.castShadow = true;
    this.mesh.add(body);

    // Belly (lighter patch)
    const bellyGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, 0.6, 0.35);
    belly.scale.set(1, 0.9, 0.5);
    this.mesh.add(belly);

    // Package badge on belly (small box icon)
    const badgeGeo = new THREE.BoxGeometry(0.15, 0.12, 0.02);
    const badge = new THREE.Mesh(badgeGeo, new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient }));
    badge.position.set(0, 0.65, 0.52);
    this.mesh.add(badge);

    // Arms
    const handGeo = new THREE.SphereGeometry(0.12, 16, 16);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.2);
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, capLen, 4, 16), bodyMat);
      armMesh.position.y = -len / 2;
      group.add(armMesh);

      const handMesh = new THREE.Mesh(handGeo, whiteMat);
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

    addArm(-0.4, 1.0, 0, -0.75, 0.65, 0, false);
    addArm(0.4, 1.0, 0, 0.75, 0.65, 0, true);

    // Legs + Feet
    const legGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.4, 16);
    const footGeo = new THREE.SphereGeometry(0.18, 32, 32);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.22, 0.5, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, bodyMat);
    leftLegMesh.position.y = -0.2;
    leftLegGroup.add(leftLegMesh);
    const leftFoot = new THREE.Mesh(footGeo, whiteMat);
    leftFoot.position.set(0, -0.4, 0.05);
    leftFoot.scale.set(1, 0.6, 1.3);
    leftLegGroup.add(leftFoot);
    this.mesh.add(leftLegGroup);
    this.leftLeg = leftLegGroup;

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.22, 0.5, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, bodyMat);
    rightLegMesh.position.y = -0.2;
    rightLegGroup.add(rightLegMesh);
    const rightFoot = new THREE.Mesh(footGeo, whiteMat);
    rightFoot.position.set(0, -0.4, 0.05);
    rightFoot.scale.set(1, 0.6, 1.3);
    rightLegGroup.add(rightFoot);
    this.mesh.add(rightLegGroup);
    this.rightLeg = rightLegGroup;

    // Jet pack (hidden by default, for flying scenes)
    this.jetPack = this.createJetPack();
    this.jetPack.visible = false;
    this.mesh.add(this.jetPack);

    // TakeCopter (bamboo propeller, hidden by default)
    this.takeCopter = this.createTakeCopter();
    this.takeCopter.visible = false;
    this.mesh.add(this.takeCopter);
  }

  createJetPack() {
    const group = new THREE.Group();
    group.position.set(0, 0.8, -0.45);

    const packMat = new THREE.MeshToonMaterial({ color: 0x666688 });
    const metalMat = new THREE.MeshToonMaterial({ color: 0x9999aa });

    // Main pack body (aerodynamic, rounded)
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.25), packMat);
    group.add(pack);

    // Pack detail lines
    const detail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.26), metalMat);
    detail.position.y = 0.1;
    group.add(detail);

    // Two thrusters with flame cones
    for (let side of [-1, 1]) {
      // Thruster body
      const thruster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.25, 12),
        metalMat
      );
      thruster.position.set(side * 0.16, -0.28, 0);
      group.add(thruster);

      // Nozzle ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.02, 8, 16),
        new THREE.MeshToonMaterial({ color: 0x444466 })
      );
      ring.position.set(side * 0.16, -0.42, 0);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // Flame cone (hidden by default, shown when flying)
      const flameGeo = new THREE.ConeGeometry(0.08, 0.4, 8);
      flameGeo.translate(0, -0.2, 0);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0x00ddff,
        transparent: true,
        opacity: 0.7,
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(side * 0.16, -0.42, 0);
      flame.name = 'flame';
      group.add(flame);

      // Inner flame (hotter, whiter)
      const innerFlameGeo = new THREE.ConeGeometry(0.04, 0.25, 8);
      innerFlameGeo.translate(0, -0.125, 0);
      const innerFlameMat = new THREE.MeshBasicMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.9,
      });
      const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
      innerFlame.position.set(side * 0.16, -0.42, 0);
      innerFlame.name = 'innerFlame';
      group.add(innerFlame);
    }

    return group;
  }

  attachJetPack() {
    if (this.jetPack) this.jetPack.visible = true;
  }

  detachJetPack() {
    if (this.jetPack) this.jetPack.visible = false;
  }

  setJetPackFlames(active) {
    if (!this.jetPack) return;
    this.jetPack.traverse((child) => {
      if (child.name === 'flame' || child.name === 'innerFlame') {
        child.visible = active;
      }
    });
  }

  createTakeCopter() {
    const group = new THREE.Group();
    group.position.set(0, 2.05, 0.15); // Slightly above and in front of head, clear of antenna

    const shaftMat = new THREE.MeshToonMaterial({ color: 0x8B4513 });
    const bladeMat = new THREE.MeshToonMaterial({ color: 0xFFD700 });

    // Central shaft (thicker, taller)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), shaftMat);
    shaft.position.y = 0.1;
    group.add(shaft);

    // Propeller hub
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), shaftMat);
    hub.position.y = 0.22;
    group.add(hub);

    // Two blades (cross shape, larger and thicker)
    const bladeGeo = new THREE.BoxGeometry(0.9, 0.03, 0.12);
    const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
    blade1.position.y = 0.22;
    group.add(blade1);

    const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
    blade2.position.y = 0.22;
    blade2.rotation.y = Math.PI / 2;
    group.add(blade2);

    // Blade tips (glowing yellow spheres for visibility)
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    for (const side of [-1, 1]) {
      const tip1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), tipMat);
      tip1.position.set(side * 0.45, 0.22, 0);
      group.add(tip1);

      const tip2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), tipMat);
      tip2.position.set(0, 0.22, side * 0.45);
      group.add(tip2);
    }

    return group;
  }

  attachTakeCopter() {
    if (this.takeCopter) this.takeCopter.visible = true;
  }

  detachTakeCopter() {
    if (this.takeCopter) this.takeCopter.visible = false;
  }

  update(time, delta) {
    super.update(time, delta);
    // Antenna glow pulse
    if (this.antennaGlow) {
      this.antennaGlow.scale.setScalar(1 + Math.sin(time * 3) * 0.2);
      this.antennaGlow.material.opacity = 0.2 + Math.sin(time * 3) * 0.15;
    }
    // TakeCopter spin
    if (this.takeCopter?.visible) {
      this.takeCopter.rotation.y += 15 * delta;
    }
    // Jet pack flame flicker
    if (this.jetPack?.visible) {
      this.jetPack.traverse((child) => {
        if (child.name === 'flame') {
          child.scale.y = 1 + Math.sin(time * 20) * 0.3 + Math.random() * 0.2;
          child.material.opacity = 0.5 + Math.sin(time * 15) * 0.2;
        }
        if (child.name === 'innerFlame') {
          child.scale.y = 1 + Math.sin(time * 25) * 0.2 + Math.random() * 0.15;
        }
      });
    }
  }
}
