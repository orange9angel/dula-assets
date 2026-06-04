import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * AlienPlanetScene — 外星行星地表
 * 紫红色的天空，奇异的岩石构造，发光的植物，双太阳。
 * 远处有环形山和巨大的蘑菇状树木。
 */
export class AlienPlanetScene extends SceneBase {
  constructor() {
    super('AlienPlanetScene');
    this.plants = [];
    this.particles = [];
    this.clouds = [];
  }

  build() {
    super.build();

    // Alien sky — purple-pink atmosphere
    this.scene.background = new THREE.Color(0x3a1a4a);
    this.scene.fog = new THREE.Fog(0x4a2a5a, 20, 100);

    // Override default lights — alien twin suns
    this.lights.forEach(l => {
      if (l.isAmbientLight) {
        l.intensity = 0.4;
        l.color.setHex(0x6a3a5a);
      }
      if (l.isDirectionalLight) {
        l.intensity = 0.7;
        l.color.setHex(0xffaa77);
        l.position.set(20, 30, -20);
      }
    });

    // Second sun — cooler blue-white
    const sun2 = new THREE.DirectionalLight(0x88aaff, 0.4);
    sun2.position.set(-15, 25, 15);
    this.scene.add(sun2);

    // ---- Ground — alien soil, purple-brown ----
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512; groundCanvas.height = 512;
    const gCtx = groundCanvas.getContext('2d');
    gCtx.fillStyle = '#3a1a3a';
    gCtx.fillRect(0, 0, 512, 512);
    // Noise texture
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 2;
      const shade = Math.random();
      gCtx.fillStyle = shade > 0.5 ? '#4a2a4a' : '#2a1a2a';
      gCtx.beginPath();
      gCtx.arc(x, y, r, 0, Math.PI * 2);
      gCtx.fill();
    }
    const groundTex = new THREE.CanvasTexture(groundCanvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(10, 10);

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      color: 0x3a1a3a,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // ---- Twin suns in sky ----
    const sun1Mat = new THREE.MeshBasicMaterial({ color: 0xffcc66 });
    const sun1 = new THREE.Mesh(new THREE.SphereGeometry(4, 24, 24), sun1Mat);
    sun1.position.set(40, 50, -60);
    this.scene.add(sun1);

    const sun1Glow = new THREE.Mesh(
      new THREE.SphereGeometry(10, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.1 })
    );
    sun1Glow.position.copy(sun1.position);
    this.scene.add(sun1Glow);

    const sun2Mesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xaaccff })
    );
    sun2Mesh.position.set(-30, 45, -50);
    this.scene.add(sun2Mesh);

    const sun2Glow = new THREE.Mesh(
      new THREE.SphereGeometry(6, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xaaccff, transparent: true, opacity: 0.08 })
    );
    sun2Glow.position.copy(sun2Mesh.position);
    this.scene.add(sun2Glow);

    // ---- Alien rocks — strange formations ----
    const rockColors = [0x4a3a5a, 0x3a2a4a, 0x5a4a6a, 0x2a1a3a];
    for (let i = 0; i < 25; i++) {
      const rockGroup = new THREE.Group();
      const color = rockColors[Math.floor(Math.random() * rockColors.length)];
      const rockMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });

      // Main rock body
      const h = 1 + Math.random() * 4;
      const rock = new THREE.Mesh(
        new THREE.ConeGeometry(0.5 + Math.random() * 1.5, h, 6 + Math.floor(Math.random() * 4)),
        rockMat
      );
      rock.position.y = h / 2;
      rock.rotation.y = Math.random() * Math.PI * 2;
      rock.rotation.z = (Math.random() - 0.5) * 0.3;
      rockGroup.add(rock);

      // Smaller secondary rocks
      for (let j = 0; j < 2; j++) {
        const small = new THREE.Mesh(
          new THREE.SphereGeometry(0.2 + Math.random() * 0.4, 8, 8),
          rockMat
        );
        small.position.set(
          (Math.random() - 0.5) * 2,
          0.2 + Math.random() * 0.5,
          (Math.random() - 0.5) * 2
        );
        small.scale.y = 0.6 + Math.random() * 0.4;
        rockGroup.add(small);
      }

      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 40;
      rockGroup.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      this.scene.add(rockGroup);
    }

    // ---- Giant mushroom trees ----
    for (let i = 0; i < 8; i++) {
      const treeGroup = new THREE.Group();
      const stemColor = new THREE.MeshStandardMaterial({
        color: 0x6a4a3a, roughness: 0.8,
      });
      const capColor = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0x8a3a6a : 0x3a6a8a,
        roughness: 0.7,
      });

      // Stem
      const stemH = 3 + Math.random() * 5;
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.25, stemH, 8),
        stemColor
      );
      stem.position.y = stemH / 2;
      treeGroup.add(stem);

      // Cap
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(1.5 + Math.random(), 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
        capColor
      );
      cap.position.y = stemH;
      cap.scale.y = 0.4;
      treeGroup.add(cap);

      // Glowing spots on cap
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x44ffaa, transparent: true, opacity: 0.4,
      });
      for (let s = 0; s < 5; s++) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), glowMat);
        const sa = Math.random() * Math.PI * 2;
        const sr = Math.random() * 1.0;
        spot.position.set(Math.cos(sa) * sr, stemH + 0.1, Math.sin(sa) * sr);
        treeGroup.add(spot);
      }

      const angle = Math.random() * Math.PI * 2;
      const radius = 12 + Math.random() * 35;
      treeGroup.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      this.scene.add(treeGroup);
    }

    // ---- Glowing alien plants ----
    const plantColors = [0x44ff88, 0xff44aa, 0x44aaff, 0xffaa44];
    for (let i = 0; i < 30; i++) {
      const plantGroup = new THREE.Group();
      const color = plantColors[Math.floor(Math.random() * plantColors.length)];
      const glowMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.5,
      });

      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 0.5 + Math.random() * 0.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x2a3a2a, roughness: 0.9 })
      );
      stem.position.y = 0.25;
      plantGroup.add(stem);

      // Glowing bulb/flower
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 8, 8),
        glowMat
      );
      bulb.position.y = 0.5 + Math.random() * 0.4;
      plantGroup.add(bulb);

      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 25;
      plantGroup.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      this.scene.add(plantGroup);
      this.plants.push({ group: plantGroup, bulb, baseOpacity: 0.5, phase: Math.random() * Math.PI * 2 });
    }

    // ---- Floating spore particles ----
    const sporeMat = new THREE.MeshBasicMaterial({
      color: 0x88ffaa, transparent: true, opacity: 0.3,
    });
    for (let i = 0; i < 50; i++) {
      const spore = new THREE.Mesh(new THREE.SphereGeometry(0.02 + Math.random() * 0.02, 4, 4), sporeMat.clone());
      spore.position.set(
        (Math.random() - 0.5) * 60,
        0.5 + Math.random() * 8,
        (Math.random() - 0.5) * 60
      );
      this.scene.add(spore);
      this.particles.push({
        mesh: spore,
        speedY: 0.1 + Math.random() * 0.3,
        driftX: (Math.random() - 0.5) * 0.2,
        driftZ: (Math.random() - 0.5) * 0.2,
        baseY: spore.position.y,
      });
    }

    // ---- Alien clouds — swirling, colored ----
    const cloudColors = [0x6a3a5a, 0x5a3a6a, 0x4a2a5a];
    for (let i = 0; i < 10; i++) {
      const cloudGroup = new THREE.Group();
      const color = cloudColors[Math.floor(Math.random() * cloudColors.length)];
      const cloudMat = new THREE.MeshStandardMaterial({
        color, transparent: true, opacity: 0.3 + Math.random() * 0.2, roughness: 1.0,
      });

      for (let p = 0; p < 4; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(2 + Math.random() * 3, 10, 10),
          cloudMat
        );
        puff.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 4
        );
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 100,
        20 + Math.random() * 15,
        -30 - Math.random() * 40
      );
      this.scene.add(cloudGroup);
      this.clouds.push({ group: cloudGroup, speed: 0.5 + Math.random() * 1 });
    }

    // ---- Distant ringed planet ----
    const planetGroup = new THREE.Group();
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(8, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x6a4a8a })
    );
    planetGroup.add(planet);

    // Ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(10, 14, 32),
      new THREE.MeshBasicMaterial({
        color: 0x8a7aaa, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = 0.3;
    planetGroup.add(ring);

    planetGroup.position.set(-50, 35, -80);
    this.scene.add(planetGroup);

    // ---- Craters on ground ----
    const craterMat = new THREE.MeshStandardMaterial({ color: 0x2a1a2a, roughness: 1.0 });
    for (let i = 0; i < 8; i++) {
      const crater = new THREE.Mesh(
        new THREE.RingGeometry(0.5 + Math.random() * 1.5, 0.6 + Math.random() * 1.5, 16),
        craterMat
      );
      crater.rotation.x = -Math.PI / 2;
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 40;
      crater.position.set(Math.cos(angle) * radius, 0.01, Math.sin(angle) * radius);
      this.scene.add(crater);
    }

    // ---- Story rock — large boulder for Rex to hide behind ----
    // Positioned BETWEEN the camera (z~5) and Rex (z~-4) so it blocks the view
    const storyRockGroup = new THREE.Group();
    const storyRockMat = new THREE.MeshStandardMaterial({ color: 0x3a2a4a, roughness: 0.95 });
    // Main boulder — taller to fully hide a crouching character (~2m tall)
    const mainBoulder = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 4.5, 7),
      storyRockMat
    );
    mainBoulder.position.y = 2.0;
    mainBoulder.rotation.y = 0.3;
    mainBoulder.rotation.z = 0.15;
    storyRockGroup.add(mainBoulder);
    // Secondary rocks for natural look
    for (let j = 0; j < 3; j++) {
      const small = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + Math.random() * 0.7, 8, 8),
        storyRockMat
      );
      small.position.set(
        (Math.random() - 0.5) * 3.0,
        0.3 + Math.random() * 0.8,
        (Math.random() - 0.5) * 3.0
      );
      small.scale.y = 0.5 + Math.random() * 0.4;
      storyRockGroup.add(small);
    }
    // Position: between camera and Rex. Camera at z~5, Rex at z~-4.
    // Rock at z=-2.5, x=-0.5 — Rex at (0.5, -4) hides behind it from most angles
    storyRockGroup.position.set(-0.5, 0, -2.5);
    this.scene.add(storyRockGroup);

    return this.scene;
  }

  update(time, delta) {
    super.update(time, delta);

    // Plant glow pulse
    for (const plant of this.plants) {
      const pulse = 0.3 + Math.sin(time * 2 + plant.phase) * 0.2;
      plant.bulb.material.opacity = pulse;
    }

    // Spore drift
    for (const p of this.particles) {
      p.mesh.position.y += p.speedY * delta;
      p.mesh.position.x += p.driftX * delta;
      p.mesh.position.z += p.driftZ * delta;
      if (p.mesh.position.y > p.baseY + 3) {
        p.mesh.position.y = p.baseY;
        p.mesh.position.x += (Math.random() - 0.5) * 5;
        p.mesh.position.z += (Math.random() - 0.5) * 5;
      }
      p.mesh.material.opacity = 0.15 + Math.sin(time * 3 + p.mesh.position.x) * 0.15;
    }

    // Cloud drift
    for (const cloud of this.clouds) {
      cloud.group.position.x += cloud.speed * delta;
      if (cloud.group.position.x > 60) {
        cloud.group.position.x = -60;
      }
    }
  }
}
