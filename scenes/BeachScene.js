import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * BeachScene — 海边沙滩场景
 *
 * 元素：沙滩、海水、海浪、椰子树、遮阳伞、沙滩球、海鸥、贝壳
 */
export class BeachScene extends SceneBase {
  constructor() {
    super('BeachScene');
    this.waves = [];
    this.seagulls = [];
    this.clouds = [];
  }

  build() {
    super.build();

    // Sky — bright tropical blue
    this.scene.background = new THREE.Color(0x4fc3f7);

    // ---- Sand (beach ground) ----
    const sandGeo = new THREE.PlaneGeometry(100, 60, 16, 16);
    const posAttr = sandGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getZ(i);
      posAttr.setZ(i, z + (Math.random() - 0.5) * 0.2);
    }
    sandGeo.computeVertexNormals();
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xe6c288, roughness: 1.0 });
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(0, 0, 0);
    sand.receiveShadow = true;
    this.scene.add(sand);

    // ---- Ocean (water plane) ----
    const oceanGeo = new THREE.PlaneGeometry(100, 40, 32, 16);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x2196f3,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.1,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, 0.05, -25);
    this.scene.add(ocean);

    // ---- Waves (white foam lines near shore) ----
    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      roughness: 0.3,
    });
    for (let i = 0; i < 5; i++) {
      const waveGeo = new THREE.PlaneGeometry(80 + Math.random() * 20, 0.8, 20, 1);
      const wave = new THREE.Mesh(waveGeo, foamMat);
      wave.rotation.x = -Math.PI / 2;
      wave.position.set(0, 0.08, -5 - i * 3.5);
      this.scene.add(wave);
      this.waves.push({ mesh: wave, baseZ: -5 - i * 3.5, speed: 0.3 + Math.random() * 0.3, phase: Math.random() * Math.PI * 2 });
    }

    // ---- Shoreline wet sand ----
    const wetSandGeo = new THREE.PlaneGeometry(100, 4);
    const wetSandMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c, roughness: 0.6 });
    const wetSand = new THREE.Mesh(wetSandGeo, wetSandMat);
    wetSand.rotation.x = -Math.PI / 2;
    wetSand.position.set(0, 0.03, -2);
    this.scene.add(wetSand);

    // ---- Palm trees ----
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7, side: THREE.DoubleSide });

    const palmPositions = [
      [-12, 0, -8], [12, 0, -6], [-18, 0, -12], [18, 0, -10],
      [-8, 0, -18], [8, 0, -16], [-22, 0, -5], [22, 0, -3],
    ];

    for (const [px, py, pz] of palmPositions) {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(px, py, pz);

      // Trunk (curved cylinder segments)
      const trunkHeight = 5 + Math.random() * 2;
      const segments = 6;
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const segH = trunkHeight / segments;
        const radius = 0.25 * (1 - t * 0.4);
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(radius * 0.9, radius, segH, 8),
          trunkMat
        );
        seg.position.set(Math.sin(t * 0.5) * 0.5, segH * i + segH / 2, 0);
        seg.castShadow = true;
        palmGroup.add(seg);
      }

      // Palm fronds (leaves)
      const frondCount = 7 + Math.floor(Math.random() * 3);
      for (let f = 0; f < frondCount; f++) {
        const angle = (f / frondCount) * Math.PI * 2;
        const frondLen = 2.5 + Math.random() * 1.5;
        const frondGroup = new THREE.Group();
        frondGroup.position.set(Math.sin(0.5) * 0.5, trunkHeight, 0);
        frondGroup.rotation.y = angle;
        frondGroup.rotation.z = -0.4 - Math.random() * 0.3;

        // Leaf blade
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.quadraticCurveTo(0.15, frondLen * 0.5, 0, frondLen);
        leafShape.quadraticCurveTo(-0.15, frondLen * 0.5, 0, 0);
        const leafGeo = new THREE.ShapeGeometry(leafShape);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.castShadow = true;
        frondGroup.add(leaf);
        palmGroup.add(frondGroup);
      }

      this.scene.add(palmGroup);
    }

    // ---- Beach umbrellas ----
    const umbrellaColors = [0xff5252, 0xffeb3b, 0x4caf50, 0x2196f3, 0xff9800];
    const umbrellaPositions = [
      [-6, 0, -8], [6, 0, -8], [-15, 0, -12], [15, 0, -12],
    ];
    for (let i = 0; i < umbrellaPositions.length; i++) {
      const [ux, uy, uz] = umbrellaPositions[i];
      const umbrellaGroup = new THREE.Group();
      umbrellaGroup.position.set(ux, uy, uz);

      // Pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      pole.position.y = 1.25;
      pole.castShadow = true;
      umbrellaGroup.add(pole);

      // Canopy (cone)
      const canopyMat = new THREE.MeshStandardMaterial({
        color: umbrellaColors[i % umbrellaColors.length],
        roughness: 0.6,
        side: THREE.DoubleSide,
      });
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.8, 8, 1, true), canopyMat);
      canopy.position.y = 2.5;
      canopy.castShadow = true;
      umbrellaGroup.add(canopy);

      this.scene.add(umbrellaGroup);
    }

    // ---- Beach balls ----
    const ballColors = [0xff0000, 0xffffff, 0x0000ff, 0xffff00];
    for (let i = 0; i < 3; i++) {
      const ballGroup = new THREE.Group();
      const bx = -4 + i * 4 + (Math.random() - 0.5) * 2;
      const bz = -8 + Math.random() * 4;
      ballGroup.position.set(bx, 0.35, bz);

      // Simple striped ball using multiple sphere segments
      for (let s = 0; s < 4; s++) {
        const ballSeg = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 12, 8, s * Math.PI / 2, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: ballColors[s], roughness: 0.4 })
        );
        ballGroup.add(ballSeg);
      }
      ballGroup.children[0].castShadow = true;
      this.scene.add(ballGroup);
    }

    // ---- Seashells (scattered on sand) ----
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xfff5e6, roughness: 0.5 });
    for (let i = 0; i < 15; i++) {
      const sx = (Math.random() - 0.5) * 40;
      const sz = 5 + Math.random() * 15;
      const shell = new THREE.Mesh(new THREE.ConeGeometry(0.08 + Math.random() * 0.06, 0.15, 5), shellMat);
      shell.position.set(sx, 0.05, sz);
      shell.rotation.z = Math.PI / 2;
      shell.rotation.y = Math.random() * Math.PI;
      this.scene.add(shell);
    }

    // ---- Rocks near shoreline ----
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.9 });
    for (let i = 0; i < 8; i++) {
      const rx = -35 + Math.random() * 70;
      const rz = -3 + Math.random() * 3;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0),
        rockMat
      );
      rock.position.set(rx, 0.2, rz);
      rock.scale.y = 0.6 + Math.random() * 0.4;
      rock.castShadow = true;
      this.scene.add(rock);
    }

    // ---- Clouds ----
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, roughness: 1.0 });
    const cloudPositions = [
      [-15, 16, -30], [8, 18, -35], [20, 15, -25], [-5, 17, -40],
      [25, 16, -35], [-20, 18, -30],
    ];
    for (const [cx, cy, cz] of cloudPositions) {
      const cloudGroup = new THREE.Group();
      cloudGroup.position.set(cx, cy, cz);
      const puffs = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < puffs; i++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random() * 1.5, 12, 12), cloudMat);
        puff.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 2);
        cloudGroup.add(puff);
      }
      this.scene.add(cloudGroup);
      this.clouds.push({ group: cloudGroup, speed: 0.2 + Math.random() * 0.3 });
    }

    // ---- Seagulls ----
    const seagullMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let flock = 0; flock < 4; flock++) {
      const flockGroup = new THREE.Group();
      const fx = -25 + Math.random() * 50;
      const fy = 12 + Math.random() * 6;
      const fz = -15 + Math.random() * 15;
      flockGroup.position.set(fx, fy, fz);

      for (let b = 0; b < 2 + Math.floor(Math.random() * 3); b++) {
        const wingShape = new THREE.Shape();
        wingShape.moveTo(-0.15, 0);
        wingShape.quadraticCurveTo(-0.05, 0.08, 0, 0.02);
        wingShape.quadraticCurveTo(0.05, 0.08, 0.15, 0);
        const wingGeo = new THREE.ShapeGeometry(wingShape);
        const seagull = new THREE.Mesh(wingGeo, seagullMat);
        seagull.position.set((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.5);
        seagull.rotation.x = -Math.PI / 2;
        flockGroup.add(seagull);
      }

      this.scene.add(flockGroup);
      this.seagulls.push({
        group: flockGroup,
        speedX: 1.5 + Math.random() * 1.5,
        speedZ: (Math.random() - 0.5) * 0.3,
        baseY: fy,
        circleRadius: 2 + Math.random() * 3,
        circleSpeed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ---- Shark (hidden initially, appears on Event:SharkAppear) ----
    this.shark = this._createShark();
    this.shark.position.set(15, 0.3, -12);
    this.shark.rotation.y = Math.PI / 2;
    this.shark.visible = false;
    this.scene.add(this.shark);
    this.sharkBaseZ = -18;
    this.sharkSpeed = 2.5;
    this.sharkAppeared = false;

    // ---- Sun (bright glow in sky) ----
    const sunGeo = new THREE.SphereGeometry(3, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(30, 35, -50);
    this.scene.add(sun);

    // Sun glow (larger transparent sphere)
    const glowGeo = new THREE.SphereGeometry(6, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfffde7, transparent: true, opacity: 0.15 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(sun.position);
    this.scene.add(glow);

    return this.scene;
  }

  _createShark() {
    const sharkGroup = new THREE.Group();
    const sharkMat = new THREE.MeshStandardMaterial({ color: 0x607d8b, roughness: 0.4 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xcddce5, roughness: 0.4 });

    // Body (elongated sphere)
    const bodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const body = new THREE.Mesh(bodyGeo, sharkMat);
    body.scale.set(2.2, 0.7, 0.65);
    sharkGroup.add(body);

    // Belly (lighter underside)
    const bellyGeo = new THREE.SphereGeometry(0.45, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.scale.set(2.0, 0.6, 0.6);
    belly.position.y = -0.05;
    sharkGroup.add(belly);

    // Head (pointed snout)
    const headGeo = new THREE.ConeGeometry(0.35, 0.8, 16);
    const head = new THREE.Mesh(headGeo, sharkMat);
    head.rotation.z = -Math.PI / 2;
    head.position.set(1.4, 0, 0);
    sharkGroup.add(head);

    // Dorsal fin
    const dorsalGeo = new THREE.ConeGeometry(0.25, 0.6, 8);
    const dorsal = new THREE.Mesh(dorsalGeo, sharkMat);
    dorsal.position.set(0.2, 0.5, 0);
    dorsal.rotation.x = 0.2;
    sharkGroup.add(dorsal);

    // Tail (two lobes)
    const tailGeo = new THREE.ConeGeometry(0.2, 0.7, 8);
    const tailUpper = new THREE.Mesh(tailGeo, sharkMat);
    tailUpper.position.set(-1.6, 0.15, 0);
    tailUpper.rotation.z = Math.PI / 2 + 0.3;
    sharkGroup.add(tailUpper);

    const tailLower = new THREE.Mesh(tailGeo, sharkMat);
    tailLower.position.set(-1.6, -0.1, 0);
    tailLower.rotation.z = Math.PI / 2 - 0.3;
    tailLower.scale.set(0.7, 0.7, 0.7);
    sharkGroup.add(tailLower);

    // Pectoral fins
    const finGeo = new THREE.ConeGeometry(0.12, 0.5, 8);
    const leftFin = new THREE.Mesh(finGeo, sharkMat);
    leftFin.position.set(0.3, -0.1, 0.4);
    leftFin.rotation.set(0.5, 0.3, 0.8);
    sharkGroup.add(leftFin);

    const rightFin = new THREE.Mesh(finGeo, sharkMat);
    rightFin.position.set(0.3, -0.1, -0.4);
    rightFin.rotation.set(-0.5, -0.3, 0.8);
    sharkGroup.add(rightFin);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.9, 0.1, 0.2);
    sharkGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.9, 0.1, -0.2);
    sharkGroup.add(rightEye);

    return sharkGroup;
  }

  update(time, delta) {
    super.update(time, delta);

    // Animate waves (move back and forth)
    for (const wave of this.waves) {
      wave.mesh.position.z = wave.baseZ + Math.sin(time * wave.speed + wave.phase) * 1.5;
      const opacity = 0.3 + Math.sin(time * wave.speed + wave.phase) * 0.2;
      wave.mesh.material.opacity = Math.max(0.1, opacity);
    }

    // Animate seagulls (circling flight)
    for (const gull of this.seagulls) {
      gull.group.position.x += gull.speedX * delta;
      gull.group.position.z += Math.sin(time * gull.circleSpeed + gull.phase) * gull.circleRadius * delta;
      gull.group.position.y = gull.baseY + Math.sin(time * 1.5 + gull.phase) * 0.5;
      if (gull.group.position.x > 60) {
        gull.group.position.x = -60;
      }
    }

    // Animate clouds drifting
    for (const cloud of this.clouds) {
      cloud.group.position.x += cloud.speed * delta;
      if (cloud.group.position.x > 50) {
        cloud.group.position.x = -50;
      }
    }

    // Animate shark - hidden until triggered, then chases Nobita
    if (this.shark && this.sharkAppeared) {
      // Find Nobita to chase
      let targetX = 0;
      let targetZ = -8;
      for (const char of this.characters) {
        if (char.name === 'Nobita') {
          targetX = char.mesh.position.x;
          targetZ = char.mesh.position.z;
          break;
        }
      }
      // Move shark toward Nobita
      const dx = targetX - this.shark.position.x;
      const dz = targetZ - this.shark.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0.5) {
        this.shark.position.x += (dx / dist) * this.sharkSpeed * delta;
        this.shark.position.z += (dz / dist) * this.sharkSpeed * delta;
      }
      // Face target
      this.shark.rotation.y = Math.atan2(dx, dz);
      // Body roll
      this.shark.rotation.z = Math.sin(time * 3) * 0.1;
    }
  }

  showShark() {
    if (this.shark) {
      this.shark.visible = true;
      this.sharkAppeared = true;
    }
  }

  getCourtGeometry() {
    return {
      width: 30,
      length: 40,
      groundY: 0.01,
    };
  }
}
