import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

export class SkyScene extends SceneBase {
  constructor() {
    super('SkyScene');
    this.clouds = [];
    this.birds = [];
    this.windLines = [];
  }

  build() {
    super.build();

    // ---- Sky gradient (using a large sphere) ----
    const skyGeo = new THREE.SphereGeometry(200, 32, 32);
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 4;
    skyCanvas.height = 128;
    const ctx = skyCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#1a73e8');   // deep blue top
    grad.addColorStop(0.4, '#4a9eff'); // mid blue
    grad.addColorStop(0.7, '#87ceeb'); // light blue
    grad.addColorStop(1, '#e0f0ff');   // near-horizon white-blue
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, 128);
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.magFilter = THREE.LinearFilter;
    skyTex.minFilter = THREE.LinearFilter;
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);

    // ---- Sun ----
    const sunGeo = new THREE.SphereGeometry(4, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffeeaa });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(40, 60, -80);
    this.scene.add(sun);

    // Sun glow (larger soft sphere)
    const glowGeo = new THREE.SphereGeometry(10, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.15 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(sun.position);
    this.scene.add(glow);

    // ---- Distant city skyline (low-poly buildings) ----
    const cityGroup = new THREE.Group();
    const buildingColors = [0x8899aa, 0x778899, 0x667788, 0x99aabb, 0x556677];
    for (let i = 0; i < 60; i++) {
      const w = 2 + Math.random() * 5;
      const d = 2 + Math.random() * 5;
      const h = 8 + Math.random() * 35;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
      );
      const angle = (i / 60) * Math.PI * 2;
      const radius = 70 + Math.random() * 30;
      building.position.set(
        Math.cos(angle) * radius,
        h / 2 - 5,
        Math.sin(angle) * radius
      );
      cityGroup.add(building);

      // Windows (emissive dots)
      if (Math.random() > 0.3) {
        const windowMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        for (let wy = 2; wy < h - 2; wy += 3) {
          for (let wx = -w / 2 + 0.8; wx < w / 2; wx += 1.2) {
            if (Math.random() > 0.4) {
              const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), windowMat);
              win.position.set(wx + building.position.x, wy + building.position.y - h / 2, building.position.z + d / 2 + 0.05);
              win.rotation.y = angle;
              cityGroup.add(win);
            }
          }
        }
      }
    }
    this.scene.add(cityGroup);
    this.cityGroup = cityGroup;

    // ---- Clouds (layered at different altitudes) ----
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, roughness: 1.0 });
    const cloudLayers = [
      { y: 15, count: 8, radius: 60, scale: 1.5, speed: 0.4 },
      { y: 25, count: 6, radius: 50, scale: 2.2, speed: 0.25 },
      { y: 35, count: 4, radius: 70, scale: 3.0, speed: 0.15 },
    ];
    for (const layer of cloudLayers) {
      for (let i = 0; i < layer.count; i++) {
        const cloudGroup = new THREE.Group();
        const angle = (i / layer.count) * Math.PI * 2 + Math.random() * 0.5;
        cloudGroup.position.set(
          Math.cos(angle) * layer.radius,
          layer.y + Math.random() * 5,
          Math.sin(angle) * layer.radius
        );
        const puffs = 4 + Math.floor(Math.random() * 4);
        for (let p = 0; p < puffs; p++) {
          const puff = new THREE.Mesh(
            new THREE.SphereGeometry((1.5 + Math.random() * 1.5) * layer.scale, 12, 12),
            cloudMat
          );
          puff.position.set((Math.random() - 0.5) * 4 * layer.scale, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 2.5);
          cloudGroup.add(puff);
        }
        this.scene.add(cloudGroup);
        this.clouds.push({ group: cloudGroup, speed: layer.speed, radius: layer.radius, angle });
      }
    }

    // ---- Birds (flocks) ----
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    for (let flock = 0; flock < 6; flock++) {
      const flockGroup = new THREE.Group();
      const fx = -40 + Math.random() * 80;
      const fy = 8 + Math.random() * 15;
      const fz = -30 + Math.random() * 40;
      flockGroup.position.set(fx, fy, fz);
      for (let b = 0; b < 3 + Math.floor(Math.random() * 5); b++) {
        const birdShape = new THREE.Shape();
        birdShape.moveTo(-0.1, 0);
        birdShape.quadraticCurveTo(-0.03, 0.05, 0, 0);
        birdShape.quadraticCurveTo(0.03, 0.05, 0.1, 0);
        const birdGeo = new THREE.ShapeGeometry(birdShape);
        const bird = new THREE.Mesh(birdGeo, birdMat);
        bird.position.set((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4);
        bird.rotation.x = -Math.PI / 2;
        flockGroup.add(bird);
      }
      this.scene.add(flockGroup);
      this.birds.push({
        group: flockGroup,
        speedX: 2 + Math.random() * 3,
        speedZ: (Math.random() - 0.5) * 1,
        baseY: fy,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ---- Wind lines (speed lines for flying effect) ----
    const windMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    for (let i = 0; i < 30; i++) {
      const lineGeo = new THREE.BoxGeometry(0.02, 0.02, 3 + Math.random() * 8);
      const line = new THREE.Mesh(lineGeo, windMat);
      line.position.set(
        -30 + Math.random() * 60,
        -5 + Math.random() * 30,
        -20 + Math.random() * 40
      );
      this.scene.add(line);
      this.windLines.push({ mesh: line, speed: 8 + Math.random() * 12 });
    }

    // ---- Ground (visible below) ----
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x5cb85c, roughness: 1.0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // ---- Low trees on ground (distant) ----
    const distTreeMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 });
    const distTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.3;
      const radius = 40 + Math.random() * 60;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8), distTrunkMat);
      trunk.position.set(tx, 0.75, tz);
      this.scene.add(trunk);
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), distTreeMat);
      leaves.position.set(tx, 2.2, tz);
      this.scene.add(leaves);
    }

    return this.scene;
  }

  update(time, delta) {
    super.update(time, delta);

    // Rotate clouds slowly around center
    for (const cloud of this.clouds) {
      cloud.angle += cloud.speed * delta * 0.02;
      cloud.group.position.x = Math.cos(cloud.angle) * cloud.radius;
      cloud.group.position.z = Math.sin(cloud.angle) * cloud.radius;
    }

    // Birds flying across
    for (const bird of this.birds) {
      bird.group.position.x += bird.speedX * delta;
      bird.group.position.z += bird.speedZ * delta;
      bird.group.position.y = bird.baseY + Math.sin(time * 2 + bird.phase) * 0.5;
      if (bird.group.position.x > 60) {
        bird.group.position.x = -60;
        bird.group.position.z = -30 + Math.random() * 60;
        bird.baseY = 8 + Math.random() * 15;
      }
    }

    // Wind lines streak past
    for (const line of this.windLines) {
      line.mesh.position.z += line.speed * delta;
      if (line.mesh.position.z > 30) {
        line.mesh.position.z = -30;
        line.mesh.position.x = -30 + Math.random() * 60;
        line.mesh.position.y = -5 + Math.random() * 30;
      }
    }
  }
}
