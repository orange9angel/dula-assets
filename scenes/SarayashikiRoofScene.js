import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * SarayashikiRoofScene — 皿屋敷中学屋顶场景
 * School rooftop with concrete floor, metal railing, chain-link fence
 * Sunset/dusk atmosphere with city silhouettes in background
 * Spiritual energy particles floating — iconic Yu Yu Hakusho setting
 */
export class SarayashikiRoofScene extends SceneBase {
  constructor() {
    super('SarayashikiRoofScene');
    this.spiritParticles = [];
    this.clouds = [];
  }

  build() {
    super.build();

    // Sunset sky background (warm orange-purple dusk)
    this.scene.background = new THREE.Color(0x6a3d5c);
    this.scene.fog = new THREE.Fog(0x8b5a6b, 30, 120);

    // Override default lights for sunset atmosphere
    this.lights.forEach(l => {
      if (l.isAmbientLight) {
        l.intensity = 0.5;
        l.color.setHex(0xffaa77);
      }
      if (l.isDirectionalLight) {
        l.intensity = 0.8;
        l.color.setHex(0xff8844);
        l.position.set(-30, 25, -40);
      }
    });

    // ---- Rooftop concrete floor ----
    const roofGeo = new THREE.PlaneGeometry(40, 30);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x999999,
      roughness: 0.85,
      metalness: 0.05,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = -Math.PI / 2;
    roof.receiveShadow = true;
    this.scene.add(roof);

    // Concrete seams (grid lines on roof)
    const seamMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.9 });
    for (let i = -3; i <= 3; i++) {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(40, 0.02, 0.08), seamMat);
      seam.position.set(0, 0.01, i * 4);
      this.scene.add(seam);
    }
    for (let i = -4; i <= 4; i++) {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 30), seamMat);
      seam.position.set(i * 4.5, 0.01, 0);
      this.scene.add(seam);
    }

    // ---- Metal railing (along edges) ----
    const railPostMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.4,
      metalness: 0.7,
    });
    const railBarMat = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.4,
      metalness: 0.7,
    });

    const railPositions = [
      { x: 0, z: -15, w: 40, d: 0, rot: 0 },      // back
      { x: 0, z: 15, w: 40, d: 0, rot: 0 },       // front
      { x: -20, z: 0, w: 0, d: 30, rot: Math.PI / 2 }, // left
      { x: 20, z: 0, w: 0, d: 30, rot: Math.PI / 2 },  // right
    ];

    for (const rp of railPositions) {
      const length = rp.w > 0 ? rp.w : rp.d;
      const postCount = Math.floor(length / 3) + 1;

      for (let i = 0; i < postCount; i++) {
        const t = i / (postCount - 1);
        const px = rp.x + (rp.w > 0 ? (t - 0.5) * rp.w : 0);
        const pz = rp.z + (rp.d > 0 ? (t - 0.5) * rp.d : 0);

        // Post
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8),
          railPostMat
        );
        post.position.set(px, 0.7, pz);
        post.castShadow = true;
        this.scene.add(post);
      }

      // Top rail
      const topRail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, length, 8),
        railBarMat
      );
      topRail.rotation.z = Math.PI / 2;
      if (rp.rot !== 0) topRail.rotation.z = 0;
      topRail.position.set(rp.x, 1.35, rp.z);
      this.scene.add(topRail);

      // Middle rail
      const midRail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, length, 8),
        railBarMat
      );
      midRail.rotation.z = Math.PI / 2;
      if (rp.rot !== 0) midRail.rotation.z = 0;
      midRail.position.set(rp.x, 0.8, rp.z);
      this.scene.add(midRail);
    }

    // ---- Chain-link fence (wire mesh planes along edges) ----
    const fenceMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.5,
      metalness: 0.6,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    for (const rp of railPositions) {
      const length = rp.w > 0 ? rp.w : rp.d;
      const fenceGeo = new THREE.PlaneGeometry(length, 1.2);
      const fence = new THREE.Mesh(fenceGeo, fenceMat);
      fence.position.set(rp.x, 0.7, rp.z);
      if (rp.rot !== 0) {
        fence.rotation.y = rp.rot;
      }
      this.scene.add(fence);
    }

    // ---- AC units on roof ----
    const acMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6, metalness: 0.3 });
    const acPositions = [
      [-14, -10], [-10, -10], [12, -8], [16, -8],
    ];
    for (const [ax, az] of acPositions) {
      const acGroup = new THREE.Group();

      // Main box
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.8), acMat);
      box.position.y = 0.6;
      box.castShadow = true;
      acGroup.add(box);

      // Fan grill on top
      const grill = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.5 })
      );
      grill.rotation.x = -Math.PI / 2;
      grill.position.y = 1.21;
      acGroup.add(grill);

      // Pipes
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5 })
      );
      pipe.position.set(0.9, 0.4, 0);
      pipe.rotation.z = -Math.PI / 4;
      acGroup.add(pipe);

      acGroup.position.set(ax, 0, az);
      this.scene.add(acGroup);
    }

    // ---- Water tower (iconic rooftop element) ----
    const towerGroup = new THREE.Group();
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.7, metalness: 0.3 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5, metalness: 0.6 });

    // Tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 2.5, 16), tankMat);
    tank.position.y = 4.5;
    tank.castShadow = true;
    towerGroup.add(tank);

    // Tank top dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), tankMat);
    dome.position.y = 5.75;
    towerGroup.add(dome);

    // Legs
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.5, 6), legMat);
      leg.position.set(Math.cos(angle) * 1.4, 1.75, Math.sin(angle) * 1.4);
      towerGroup.add(leg);
    }

    // Cross bracing
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), legMat);
      brace.rotation.z = Math.PI / 2;
      brace.rotation.y = angle;
      brace.position.set(Math.cos(angle) * 1.4, 1.5, Math.sin(angle) * 1.4);
      towerGroup.add(brace);
    }

    towerGroup.position.set(-16, 0, 10);
    this.scene.add(towerGroup);

    // ---- Vent pipes ----
    const ventMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.4 });
    const ventPositions = [
      { x: 8, z: 6, h: 1.5 },
      { x: 9, z: 6.5, h: 1.2 },
      { x: -6, z: 11, h: 2.0 },
    ];
    for (const v of ventPositions) {
      const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, v.h, 8), ventMat);
      vent.position.set(v.x, v.h / 2, v.z);
      vent.castShadow = true;
      this.scene.add(vent);

      // Vent cap
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.2, 8),
        ventMat
      );
      cap.position.set(v.x, v.h + 0.1, v.z);
      this.scene.add(cap);
    }

    // ---- City buildings in background (silhouettes against sunset) ----
    const cityColors = [0x3a2a3a, 0x2e1e2e, 0x352535, 0x2a1a2a];
    const buildingData = [
      [-35, -20, 4, 12, 5], [-28, -25, 5, 18, 4], [-22, -18, 3, 10, 3],
      [-15, -30, 6, 22, 5], [-8, -22, 4, 14, 4], [-2, -28, 5, 16, 5],
      [5, -20, 3, 11, 3], [12, -26, 6, 20, 5], [20, -22, 4, 15, 4],
      [28, -28, 5, 19, 5], [35, -20, 4, 13, 4],
      [-32, 20, 5, 15, 4], [-25, 25, 4, 12, 3], [-18, 18, 6, 18, 5],
      [-10, 22, 4, 14, 4], [-3, 28, 5, 20, 5], [8, 20, 3, 10, 3],
      [15, 25, 5, 16, 4], [22, 18, 4, 13, 4], [30, 22, 6, 17, 5],
    ];

    for (const [bx, bz, bw, bh, bd] of buildingData) {
      const color = cityColors[Math.floor(Math.random() * cityColors.length)];
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, bd),
        new THREE.MeshStandardMaterial({ color, roughness: 0.95 })
      );
      building.position.set(bx, bh / 2 - 3, bz);
      building.castShadow = false;
      this.scene.add(building);

      // Some windows with warm glow (sunset reflection)
      if (Math.random() > 0.4) {
        const winMat = new THREE.MeshBasicMaterial({
          color: 0xffaa66,
          transparent: true,
          opacity: 0.5,
        });
        const rows = Math.floor(bh / 3);
        const cols = Math.floor(bw / 1.5);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() > 0.5) {
              const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.8), winMat);
              win.position.set(
                bx - bw / 2 + 0.6 + c * 1.2,
                r * 2.5 + 1,
                bz + bd / 2 + 0.02
              );
              this.scene.add(win);
            }
          }
        }
      }
    }

    // ---- Distant sunset glow (hemisphere light) ----
    const sunsetGlow = new THREE.HemisphereLight(0xff7744, 0x4a2a3a, 0.5);
    this.scene.add(sunsetGlow);

    // ---- Point lights for warm rooftop illumination ----
    const roofLight = new THREE.PointLight(0xffaa66, 3, 25);
    roofLight.position.set(0, 8, 0);
    this.scene.add(roofLight);

    const backLight = new THREE.PointLight(0xff6644, 2, 30);
    backLight.position.set(-10, 6, -10);
    this.scene.add(backLight);

    // ---- Clouds (sunset colored) ----
    const cloudColors = [0xcc8899, 0xdd9988, 0xaa6677, 0xeeaa88];
    for (let i = 0; i < 8; i++) {
      const cloudGroup = new THREE.Group();
      const color = cloudColors[Math.floor(Math.random() * cloudColors.length)];
      const cloudMat = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.5 + Math.random() * 0.3,
        roughness: 1.0,
      });

      for (let j = 0; j < 4; j++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(2 + Math.random() * 3, 10, 10),
          cloudMat
        );
        puff.position.set(
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 4
        );
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 120,
        35 + Math.random() * 15,
        -40 - Math.random() * 40
      );
      this.scene.add(cloudGroup);
      this.clouds.push(cloudGroup);
    }

    // ---- Spiritual energy particles (floating, glowing orbs) ----
    const particleColors = [0x88ffaa, 0xaaffee, 0x88ddff, 0xccffdd];
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 35;
      particlePositions[i * 3 + 1] = 0.5 + Math.random() * 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      particleSizes[i] = 0.08 + Math.random() * 0.15;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0x88ffcc,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.spiritSystem = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.spiritSystem);

    // Store initial positions for animation
    this.spiritInitialPositions = particlePositions.slice();
    this.spiritPhaseOffsets = [];
    for (let i = 0; i < particleCount; i++) {
      this.spiritPhaseOffsets.push({
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      });
    }

    // ---- Small spirit orbs (larger, individual meshes for emphasis) ----
    const orbMat = new THREE.MeshBasicMaterial({
      color: 0x88ffcc,
      transparent: true,
      opacity: 0.4,
    });
    for (let i = 0; i < 8; i++) {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 8, 8), orbMat);
      orb.position.set(
        (Math.random() - 0.5) * 20,
        1 + Math.random() * 3,
        (Math.random() - 0.5) * 15
      );
      this.scene.add(orb);
      this.spiritParticles.push({
        mesh: orb,
        basePos: orb.position.clone(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
      });
    }

    // ---- Distant power lines (silhouettes) ----
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x2a1a1a, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 10, 6), lineMat);
      pole.position.set(-40 + i * 40, 2, -35);
      this.scene.add(pole);

      if (i < 2) {
        const wire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 40, 4),
          lineMat
        );
        wire.rotation.z = Math.PI / 2;
        wire.position.set(-20 + i * 40, 6.5, -35);
        this.scene.add(wire);
      }
    }

    return this.scene;
  }

  update(time, delta) {
    super.update(time, delta);

    // Animate spirit particle system (gentle floating drift)
    if (this.spiritSystem && this.spiritInitialPositions) {
      const positions = this.spiritSystem.geometry.attributes.position.array;
      for (let i = 0; i < this.spiritPhaseOffsets.length; i++) {
        const phase = this.spiritPhaseOffsets[i];
        const t = time * phase.speed;
        positions[i * 3] = this.spiritInitialPositions[i * 3] + Math.sin(t + phase.x) * 0.8;
        positions[i * 3 + 1] = this.spiritInitialPositions[i * 3 + 1] + Math.sin(t * 0.7 + phase.y) * 0.5;
        positions[i * 3 + 2] = this.spiritInitialPositions[i * 3 + 2] + Math.cos(t * 0.5 + phase.z) * 0.6;
      }
      this.spiritSystem.geometry.attributes.position.needsUpdate = true;

      // Pulsing opacity
      this.spiritSystem.material.opacity = 0.4 + Math.sin(time * 1.5) * 0.2;
    }

    // Animate individual spirit orbs
    for (const orb of this.spiritParticles) {
      const t = time * orb.speed;
      orb.mesh.position.x = orb.basePos.x + Math.sin(t + orb.phase) * 1.2;
      orb.mesh.position.y = orb.basePos.y + Math.sin(t * 0.8 + orb.phase) * 0.6;
      orb.mesh.position.z = orb.basePos.z + Math.cos(t * 0.6 + orb.phase) * 0.8;
    }

    // Slow cloud drift
    for (const cloud of this.clouds) {
      cloud.position.x += delta * 0.3;
      if (cloud.position.x > 80) cloud.position.x = -80;
    }
  }
}
