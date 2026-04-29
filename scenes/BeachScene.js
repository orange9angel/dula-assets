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
    const oceanGeo = new THREE.PlaneGeometry(100, 35, 32, 16);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x2196f3,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.1,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, 0.05, -22);
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
    this.sharkOrbitMode = false;
    this.sharkOrbitAngle = 0;
    this.sharkOrbitRadius = 4;
    this.sharkOrbitCenter = new THREE.Vector3(0, 0, -8);
    this.sharkOrbitSpeed = 1.8;

    // ---- Splash particles (for panic paddling) ----
    this.splashParticles = this._createSplashParticles();
    this.splashActive = false;
    this.splashTarget = null;

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

    // Animate shark - hidden until triggered
    if (this.shark) {
      if (this.sharkSwimAway) {
        // Shark swims away into the distance
        this.shark.position.x += this.sharkSpeed * delta * 2;
        this.shark.position.z -= this.sharkSpeed * delta * 0.5;
        this.shark.rotation.y = Math.atan2(2, -0.5);
        if (this.shark.position.x > 40) {
          this.shark.visible = false;
          this.sharkSwimAway = false;
        }
      } else if (this.sharkAppeared) {
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

        if (this.sharkOrbitMode) {
          // Orbit around target in tightening circles
          this.sharkOrbitAngle += this.sharkOrbitSpeed * delta;
          const radius = Math.max(1.5, this.sharkOrbitRadius - time * 0.15);
          this.shark.position.x = this.sharkOrbitCenter.x + Math.sin(this.sharkOrbitAngle) * radius;
          this.shark.position.z = this.sharkOrbitCenter.z + Math.cos(this.sharkOrbitAngle) * radius;
          // Face toward center (looking at victim)
          const dx = targetX - this.shark.position.x;
          const dz = targetZ - this.shark.position.z;
          this.shark.rotation.y = Math.atan2(dx, dz);
          // Aggressive body roll
          this.shark.rotation.z = Math.sin(time * 5) * 0.2;
        } else {
          // Direct chase
          const dx = targetX - this.shark.position.x;
          const dz = targetZ - this.shark.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > 0.5) {
            this.shark.position.x += (dx / dist) * this.sharkSpeed * delta;
            this.shark.position.z += (dz / dist) * this.sharkSpeed * delta;
          }
          this.shark.rotation.y = Math.atan2(dx, dz);
          this.shark.rotation.z = Math.sin(time * 3) * 0.1;
        }
      }
    }

    // Update splash particles
    this._updateSplashParticles(time, delta);

    // Update rescued character (fly away with takecopter)
    for (const char of this.characters) {
      if (char.mesh.userData.isRescued) {
        // Use a per-character rescue timer based on delta
        char.mesh.userData.rescueElapsed = (char.mesh.userData.rescueElapsed || 0) + delta;
        const elapsed = char.mesh.userData.rescueElapsed;
        if (elapsed < 3) {
          // Rise up
          char.mesh.position.y = (char.mesh.userData.rescueStartY || 0) + elapsed * 2.5;
          // Fly toward shore (positive Z is toward beach)
          char.mesh.position.z += delta * 4;
          // Tilt forward
          char.mesh.rotation.x = 0.2;
        }
      }
    }
  }

  showShark() {
    if (this.shark) {
      this.shark.visible = true;
      this.sharkAppeared = true;
      this.sharkOrbitMode = false;
    }
  }

  setSharkOrbitMode(centerX, centerZ, radius) {
    this.sharkOrbitMode = true;
    this.sharkOrbitCenter.set(centerX, 0.3, centerZ);
    this.sharkOrbitRadius = radius || 4;
    // Place shark behind and to the right of target for dramatic effect
    this.sharkOrbitAngle = Math.PI * 0.8; // start at ~144 degrees (behind-right)
    this.shark.position.x = centerX + Math.sin(this.sharkOrbitAngle) * this.sharkOrbitRadius;
    this.shark.position.z = centerZ + Math.cos(this.sharkOrbitAngle) * this.sharkOrbitRadius;
    this.shark.position.y = 0.3;
    // Ensure shark is visible
    if (this.shark) {
      this.shark.visible = true;
      this.sharkAppeared = true;
      // Shark positioned for orbit
    }
  }

  setSplashTarget(characterMesh) {
    this.splashTarget = characterMesh;
    this.splashActive = true;
  }

  stopSplash() {
    this.splashActive = false;
    if (this.splashParticles) {
      this.splashParticles.visible = false;
    }
  }

  rescueWithTakecopter(characterName) {
    // Stop shark chasing
    this.sharkOrbitMode = false;
    this.sharkAppeared = false;
    if (this.shark) {
      // Immediately move shark far away for still-shot visibility
      this.shark.position.x += 15;
      this.shark.position.z -= 8;
      this.sharkSwimAway = true;
    }
    this.stopSplash();

    // Find character and attach takecopter
    for (const char of this.characters) {
      if (char.name === characterName && char.attachTakeCopter) {
        char.attachTakeCopter();
        // Immediately lift character up for visibility in still shots
        char.mesh.position.y = 2.0;
        char.mesh.position.z += 2.0; // toward shore
        char.mesh.rotation.x = 0.2; // tilt forward
        char.mesh.userData.isRescued = true;
        char.mesh.userData.rescueStartY = char.mesh.position.y;
        // Character rescued and lifted
        break;
      }
    }
  }

  _createSplashParticles() {
    const group = new THREE.Group();
    // Larger, flatter particles for foot splash effect
    const particleGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < 50; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat.clone());
      p.userData = {
        baseX: (Math.random() - 0.5) * 0.8,
        baseZ: (Math.random() - 0.5) * 0.8,
        speedY: 1.5 + Math.random() * 2.5,
        speedX: (Math.random() - 0.5) * 1.5,
        speedZ: (Math.random() - 0.5) * 1.5,
        phase: Math.random() * Math.PI * 2,
        life: Math.random(),
        isFootSplash: i < 30, // First 30 particles are foot splash, rest are body bubbles
      };
      p.visible = false;
      group.add(p);
    }
    group.visible = false;
    this.scene.add(group);
    return group;
  }

  _updateSplashParticles(time, delta) {
    if (!this.splashActive || !this.splashTarget || !this.splashParticles) return;

    this.splashParticles.visible = true;
    const targetPos = this.splashTarget.position;

    for (const p of this.splashParticles.children) {
      const ud = p.userData;
      ud.life += delta * 4;
      if (ud.life > 1) ud.life = 0;

      const t = ud.life;
      
      if (ud.isFootSplash) {
        // Foot splash: burst upward from feet position with horizontal spread
        p.position.x = targetPos.x + ud.baseX + ud.speedX * t * 0.5;
        p.position.z = targetPos.z + ud.baseZ + ud.speedZ * t * 0.5;
        // Start at water surface level, burst upward then fall
        p.position.y = 0.05 + t * ud.speedY * 0.4 - t * t * 0.8;
        p.scale.setScalar(1.8 * (1 - t * 0.3));
        p.material.opacity = 0.9 * (1 - t);
      } else {
        // Body bubbles: smaller bubbles around upper body
        p.position.x = targetPos.x + ud.baseX * 0.6 + Math.sin(time * 8 + ud.phase) * 0.15;
        p.position.z = targetPos.z + ud.baseZ * 0.6 + Math.cos(time * 6 + ud.phase) * 0.15;
        p.position.y = targetPos.y - 0.2 + t * ud.speedY * 0.3;
        p.scale.setScalar(1.0 * (1 - t * 0.5));
        p.material.opacity = 0.6 * (1 - t);
      }
      p.visible = true;
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
