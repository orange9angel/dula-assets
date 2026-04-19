import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

export class ParkScene extends SceneBase {
  constructor() {
    super('ParkScene');
    this.clouds = [];
    this.birds = [];
  }

  build() {
    super.build();

    // Sky blue background
    this.scene.background = new THREE.Color(0x87ceeb);

    // ---- Ground (grass with slight unevenness) ----
    const groundGeo = new THREE.PlaneGeometry(80, 80, 8, 8);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getZ(i);
      posAttr.setZ(i, z + (Math.random() - 0.5) * 0.15);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x5cb85c, roughness: 1.0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // ---- Winding path ----
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xc4b9a3, roughness: 0.95 });
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-20, 0.02, 15),
      new THREE.Vector3(-8, 0.02, 8),
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(8, 0.02, -8),
      new THREE.Vector3(20, 0.02, -15),
    ]);
    const pathGeo = new THREE.TubeGeometry(pathCurve, 40, 1.2, 4, false);
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.scale.y = 0.02;
    pathMesh.receiveShadow = true;
    this.scene.add(pathMesh);

    // ---- Flower beds (scattered clusters) ----
    const flowerColors = [0xff4444, 0xffaa00, 0xff66cc, 0xaa66ff, 0xffff44];
    const flowerPositions = [
      [-6, 0, 6], [6, 0, 6], [-10, 0, -5], [10, 0, -5],
      [-4, 0, -10], [4, 0, -10], [0, 0, 12], [-14, 0, 2], [14, 0, 2],
    ];
    for (const [fx, fy, fz] of flowerPositions) {
      const bedGroup = new THREE.Group();
      bedGroup.position.set(fx, fy, fz);
      // Raised bed border
      const border = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 2.5), new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 }));
      border.position.y = 0.075;
      border.castShadow = true;
      bedGroup.add(border);
      // Soil
      const soil = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 2.3), new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 1.0 }));
      soil.position.y = 0.16;
      bedGroup.add(soil);
      // Flowers
      for (let i = 0; i < 6; i++) {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6), new THREE.MeshStandardMaterial({ color: 0x228b22 }));
        const sx = (Math.random() - 0.5) * 1.8;
        const sz = (Math.random() - 0.5) * 1.8;
        stem.position.set(sx, 0.32, sz);
        bedGroup.add(stem);
        const petalColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.6 }));
        flower.position.set(sx, 0.46, sz);
        bedGroup.add(flower);
      }
      this.scene.add(bedGroup);
    }

    // ---- Benches (along the path) ----
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4 });
    const benchPositions = [
      [-5, 0, 5, -0.6],
      [5, 0, -5, 2.2],
      [-12, 0, 0, 1.5],
      [12, 0, 3, -1.2],
    ];
    for (const [bx, by, bz, br] of benchPositions) {
      this.createBench(woodMat, metalMat, bx, by, bz, br);
    }

    // ---- Swing set ----
    const swingFrameMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.5, metalness: 0.4 });
    const swingGroup = new THREE.Group();
    swingGroup.position.set(-8, 0, -12);
    // A-frame legs
    for (const side of [-1, 1]) {
      const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5, 8), swingFrameMat);
      legA.position.set(side * 1.2, 1.5, -0.5);
      legA.rotation.x = 0.25;
      swingGroup.add(legA);
      const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5, 8), swingFrameMat);
      legB.position.set(side * 1.2, 1.5, 0.5);
      legB.rotation.x = -0.25;
      swingGroup.add(legB);
    }
    // Top bar
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.0, 8), swingFrameMat);
    topBar.rotation.z = Math.PI / 2;
    topBar.position.set(0, 3.0, 0);
    swingGroup.add(topBar);
    // Swing seat
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const swingSeat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.35), seatMat);
    swingSeat.position.set(0, 1.2, 0);
    swingGroup.add(swingSeat);
    // Chains
    for (const cx of [-0.35, 0.35]) {
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.8, 4), swingFrameMat);
      chain.position.set(cx, 2.1, 0);
      swingGroup.add(chain);
    }
    this.scene.add(swingGroup);

    // ---- Slide ----
    const slideGroup = new THREE.Group();
    slideGroup.position.set(10, 0, -10);
    const slideMat = new THREE.MeshStandardMaterial({ color: 0xcc4444, roughness: 0.5 });
    const slideCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.5, 0),
      new THREE.Vector3(0, 2.0, 1.5),
      new THREE.Vector3(0, 1.0, 3.0),
      new THREE.Vector3(0, 0.3, 4.5),
    ]);
    const slideGeo = new THREE.TubeGeometry(slideCurve, 20, 0.5, 4, false);
    const slideMesh = new THREE.Mesh(slideGeo, slideMat);
    slideMesh.castShadow = true;
    slideGroup.add(slideMesh);
    // Slide ladder
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.3 });
    for (let i = 0; i < 6; i++) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), ladderMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, 0.4 + i * 0.4, -0.3);
      slideGroup.add(rung);
    }
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 6), ladderMat);
      rail.position.set(side * 0.3, 1.7, -0.3);
      slideGroup.add(rail);
    }
    this.scene.add(slideGroup);

    // ---- Lamp posts ----
    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.4 });
    const lampGlowMat = new THREE.MeshStandardMaterial({ color: 0xffeeaa, emissive: 0xffeeaa, emissiveIntensity: 0.4 });
    for (const [lx, lz] of [[-3, 3], [3, -3], [-15, -8], [15, 8]]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.5, 8), lampPostMat);
      post.position.set(lx, 1.75, lz);
      post.castShadow = true;
      this.scene.add(post);
      const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lampGlowMat);
      lampHead.position.set(lx, 3.7, lz);
      this.scene.add(lampHead);
    }

    // ---- Trees (more variety and density) ----
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const leavesMats = [
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.8 }),
    ];

    const treePositions = [
      [-15, 0, -10], [15, 0, -10], [-18, 0, 8], [18, 0, 8],
      [-12, 0, -18], [12, 0, -18], [-20, 0, -3], [20, 0, -3],
      [-25, 0, -15], [25, 0, -15], [-22, 0, 12], [22, 0, 12],
      [-8, 0, -22], [8, 0, -22], [0, 0, -25], [-5, 0, 18], [5, 0, 18],
      [-30, 0, 0], [30, 0, 0], [-28, 0, -8], [28, 0, 8],
    ];

    for (let i = 0; i < treePositions.length; i++) {
      const [x, y, z] = treePositions[i];
      const scale = 0.7 + Math.random() * 0.6;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 1.8 * scale, 12), trunkMat);
      trunk.position.set(x, y + 0.9 * scale, z);
      trunk.castShadow = true;
      this.scene.add(trunk);

      const leavesMat = leavesMats[i % 3];
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.6 * scale, 16, 16), leavesMat);
      leaves.position.set(x, y + 2.8 * scale, z);
      leaves.castShadow = true;
      this.scene.add(leaves);
    }

    // ---- Bushes (low green spheres) ----
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.9 });
    for (let i = 0; i < 20; i++) {
      const bx = (Math.random() - 0.5) * 50;
      const bz = (Math.random() - 0.5) * 50;
      // Avoid path center roughly
      if (Math.abs(bx) < 2 && Math.abs(bz) < 2) continue;
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.4 + Math.random() * 0.5, 8, 8), bushMat);
      bush.position.set(bx, 0.3, bz);
      bush.scale.y = 0.6;
      bush.castShadow = true;
      this.scene.add(bush);
    }

    // ---- Fountain (center of park) ----
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, 0);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.6 });
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.3, 24), stoneMat);
    basin.position.y = 0.15;
    basin.castShadow = true;
    fountainGroup.add(basin);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.2, 12), stoneMat);
    pillar.position.y = 0.9;
    fountainGroup.add(pillar);
    const topBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 0.15, 16), stoneMat);
    topBasin.position.y = 1.5;
    fountainGroup.add(topBasin);
    // Water surface
    const waterGeo = new THREE.CircleGeometry(1.9, 24);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x44aaff, transparent: true, opacity: 0.6, roughness: 0.2 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.32;
    fountainGroup.add(water);
    this.scene.add(fountainGroup);

    // ---- Clouds (more variety) ----
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 1.0 });
    const cloudPositions = [
      [-10, 14, -20], [5, 16, -25], [15, 13, -15], [-8, 15, -18],
      [20, 17, -30], [-18, 14, -28], [0, 18, -35], [12, 15, -22],
    ];
    for (const [cx, cy, cz] of cloudPositions) {
      const cloudGroup = new THREE.Group();
      cloudGroup.position.set(cx, cy, cz);
      const puffs = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < puffs; i++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random() * 1.2, 12, 12), cloudMat);
        puff.position.set((Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 2);
        cloudGroup.add(puff);
      }
      this.scene.add(cloudGroup);
      this.clouds.push({ group: cloudGroup, speed: 0.3 + Math.random() * 0.5 });
    }

    // ---- Birds (simple V-shaped flocks) ----
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    for (let flock = 0; flock < 5; flock++) {
      const flockGroup = new THREE.Group();
      const fx = -30 + Math.random() * 60;
      const fy = 10 + Math.random() * 8;
      const fz = -20 + Math.random() * 20;
      flockGroup.position.set(fx, fy, fz);
      for (let b = 0; b < 3 + Math.floor(Math.random() * 4); b++) {
        const birdShape = new THREE.Shape();
        birdShape.moveTo(-0.12, 0);
        birdShape.quadraticCurveTo(-0.04, 0.06, 0, 0);
        birdShape.quadraticCurveTo(0.04, 0.06, 0.12, 0);
        const birdGeo = new THREE.ShapeGeometry(birdShape);
        const bird = new THREE.Mesh(birdGeo, birdMat);
        bird.position.set((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
        bird.rotation.x = -Math.PI / 2;
        flockGroup.add(bird);
      }
      this.scene.add(flockGroup);
      this.birds.push({ group: flockGroup, speedX: 1 + Math.random() * 2, speedZ: (Math.random() - 0.5) * 0.5, baseY: fy });
    }

    return this.scene;
  }

  createBench(woodMat, metalMat, x, y, z, rotationY = 0) {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(x, y, z);
    benchGroup.rotation.y = rotationY;

    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.6), woodMat);
    seat.position.set(0, 0.5, 0);
    seat.castShadow = true;
    benchGroup.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 0.1), woodMat);
    back.position.set(0, 0.9, -0.25);
    back.castShadow = true;
    benchGroup.add(back);

    for (const bx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.5), metalMat);
      leg.position.set(bx, 0.25, 0);
      benchGroup.add(leg);
    }

    this.scene.add(benchGroup);
  }

  setBallTrajectory(startTime, endTime, startPos, endPos, arcHeight = 0.5) {
    this.ballTrajectory = { startTime, endTime, startPos, endPos, arcHeight };
  }

  clearBallTrajectory() {
    this.ballTrajectory = null;
  }

  getCourtGeometry() {
    // Legacy compatibility for CourtDirector (no longer a tennis court)
    return {
      width: 20,
      length: 30,
      netZ: 0,
      baselineZ: 15,
      serviceLineZ: 7.5,
      singlesWidth: 10,
      doublesWidth: 14,
      groundY: 0.01,
    };
  }

  update(time, delta) {
    super.update(time, delta);

    // Animate clouds drifting
    for (const cloud of this.clouds) {
      cloud.group.position.x += cloud.speed * delta;
      if (cloud.group.position.x > 50) {
        cloud.group.position.x = -50;
      }
    }

    // Animate birds
    for (const bird of this.birds) {
      bird.group.position.x += bird.speedX * delta;
      bird.group.position.z += bird.speedZ * delta;
      bird.group.position.y = bird.baseY + Math.sin(time * 2 + bird.group.id) * 0.3;
      if (bird.group.position.x > 50) {
        bird.group.position.x = -50;
      }
    }
  }
}
