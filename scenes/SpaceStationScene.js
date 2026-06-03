import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * SpaceStationScene — 星际空间站内部
 * 金属走廊，全息显示屏，圆形舷窗可以看到星空。
 * 冷色调照明，科幻氛围。
 */
export class SpaceStationScene extends SceneBase {
  constructor() {
    super('SpaceStationScene');
    this.holograms = [];
    this.stars = [];
  }

  build() {
    super.build();

    // Deep space background through windows
    this.scene.background = new THREE.Color(0x151525);

    // Override default lights — cool sci-fi lighting, much brighter
    this.lights.forEach(l => {
      if (l.isAmbientLight) {
        l.intensity = 0.8;
        l.color.setHex(0x3a4a5a);
      }
      if (l.isDirectionalLight) {
        l.intensity = 1.0;
        l.color.setHex(0xccddee);
        l.position.set(5, 15, 8);
      }
    });

    // Additional fill light from below (console glow)
    const fillLight = new THREE.PointLight(0x44aaff, 0.5, 15);
    fillLight.position.set(0, 0.5, 0);
    this.scene.add(fillLight);

    // ---- Floor — metallic grating ----
    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 256; floorCanvas.height = 256;
    const fCtx = floorCanvas.getContext('2d');
    fCtx.fillStyle = '#1a1a2a';
    fCtx.fillRect(0, 0, 256, 256);
    // Grating lines
    fCtx.strokeStyle = '#2a3a4a';
    fCtx.lineWidth = 2;
    for (let i = 0; i < 256; i += 16) {
      fCtx.beginPath();
      fCtx.moveTo(i, 0); fCtx.lineTo(i, 256);
      fCtx.stroke();
      fCtx.beginPath();
      fCtx.moveTo(0, i); fCtx.lineTo(256, i);
      fCtx.stroke();
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(8, 6);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      color: 0x1a1a2a,
      roughness: 0.6,
      metalness: 0.4,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // ---- Ceiling ----
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 20),
      new THREE.MeshStandardMaterial({ color: 0x151520, roughness: 0.7, metalness: 0.3 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5;
    this.scene.add(ceiling);

    // ---- Walls — metallic panels ----
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e1e2e, roughness: 0.5, metalness: 0.5 });
    const wallLightMat = new THREE.MeshStandardMaterial({ color: 0x2a3a4a, roughness: 0.4, metalness: 0.6 });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 5, 0.3), wallMat);
    backWall.position.set(0, 2.5, -10);
    this.scene.add(backWall);

    // Side walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 20), wallMat);
    leftWall.position.set(-15, 2.5, 0);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 20), wallMat);
    rightWall.position.set(15, 2.5, 0);
    this.scene.add(rightWall);

    // ---- Wall panels / details ----
    for (let i = -3; i <= 3; i++) {
      // Panel indentations on back wall
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3.5, 0.05),
        wallLightMat
      );
      panel.position.set(i * 4, 2.5, -9.82);
      this.scene.add(panel);
    }

    // ---- Circular windows (portholes) ----
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x3a4a5a, roughness: 0.3, metalness: 0.8 });
    const windowGlassMat = new THREE.MeshBasicMaterial({ color: 0x050510, side: THREE.DoubleSide });

    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const wx = side * 14.85;
        const wy = 2.5 + (i - 1) * 2;

        // Frame
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 12, 24), windowFrameMat);
        frame.position.set(wx, wy, -2 + i * 3);
        frame.rotation.y = side * Math.PI / 2;
        this.scene.add(frame);

        // Glass
        const glass = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), windowGlassMat);
        glass.position.set(wx, wy, -2 + i * 3);
        glass.rotation.y = side * Math.PI / 2;
        this.scene.add(glass);

        // Stars visible through window
        const starGroup = new THREE.Group();
        for (let s = 0; s < 20; s++) {
          const star = new THREE.Mesh(
            new THREE.SphereGeometry(0.01 + Math.random() * 0.015, 4, 4),
            new THREE.MeshBasicMaterial({
              color: Math.random() > 0.7 ? 0xffddaa : 0xffffff,
              transparent: true,
              opacity: 0.5 + Math.random() * 0.5,
            })
          );
          star.position.set(
            (Math.random() - 0.5) * 1.2,
            (Math.random() - 0.5) * 1.2,
            0.02
          );
          starGroup.add(star);
        }
        starGroup.position.set(wx + side * 0.05, wy, -2 + i * 3);
        starGroup.rotation.y = side * Math.PI / 2;
        this.scene.add(starGroup);
        this.stars.push(starGroup);
      }
    }

    // ---- Holographic displays ----
    const holoMat = new THREE.MeshBasicMaterial({
      color: 0x44aaff, transparent: true, opacity: 0.15, side: THREE.DoubleSide,
    });

    for (let i = 0; i < 2; i++) {
      const holoGroup = new THREE.Group();

      // Hologram base projector
      const projector = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 0.05, 12),
        new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.8, roughness: 0.2 })
      );
      projector.position.y = 0.025;
      holoGroup.add(projector);

      // Holographic screen
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.8),
        holoMat.clone()
      );
      screen.position.set(0, 1.2, 0);
      holoGroup.add(screen);

      // Hologram data lines
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.3 });
      for (let l = 0; l < 5; l++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.8 - l * 0.1, 0.008, 0.002),
          lineMat
        );
        line.position.set(0, 1.0 + l * 0.1, 0);
        holoGroup.add(line);
      }

      holoGroup.position.set(-4 + i * 8, 0, -6);
      this.scene.add(holoGroup);
      this.holograms.push(holoGroup);
    }

    // ---- Ceiling lights — linear fluorescent strips ----
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xaaccff, transparent: true, opacity: 0.6 });
    for (let i = -2; i <= 2; i++) {
      const lightStrip = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.04, 0.15),
        lightMat
      );
      lightStrip.position.set(i * 5, 4.95, 0);
      this.scene.add(lightStrip);

      // Actual point light
      const pl = new THREE.PointLight(0x88aaff, 1.5, 12);
      pl.position.set(i * 5, 4.5, 0);
      this.scene.add(pl);
    }

    // ---- Console / control panels ----
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.4, metalness: 0.6 });
    const buttonMat = new THREE.MeshBasicMaterial({ color: 0x44ff88 });
    const buttonRedMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });

    for (const side of [-1, 1]) {
      const console = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.6), consoleMat);
      console.position.set(side * 3, 0.5, -8);
      this.scene.add(console);

      // Console top — angled
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.05, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.3, metalness: 0.7 })
      );
      top.position.set(side * 3, 1.0, -8.05);
      top.rotation.x = -0.2;
      this.scene.add(top);

      // Buttons
      for (let b = 0; b < 6; b++) {
        const btn = new THREE.Mesh(
          new THREE.SphereGeometry(0.025, 8, 8),
          b % 2 === 0 ? buttonMat : buttonRedMat
        );
        btn.position.set(side * (2.5 + (b % 3) * 0.25), 1.05, -8.2 + Math.floor(b / 3) * 0.15);
        this.scene.add(btn);
      }
    }

    // ---- Pipes and conduits on ceiling ----
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.5, metalness: 0.7 });
    for (let i = 0; i < 4; i++) {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04 + i * 0.01, 0.04 + i * 0.01, 20, 8),
        pipeMat
      );
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0, 4.7, -6 + i * 1.5);
      this.scene.add(pipe);
    }

    // ---- Floor edge strips (glowing safety lines) ----
    const safetyMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.4 });
    for (const side of [-1, 1]) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.02, 20),
        safetyMat
      );
      strip.position.set(side * 14.5, 0.01, 0);
      this.scene.add(strip);
    }

    return this.scene;
  }

  update(time, delta) {
    super.update(time, delta);

    // Hologram flicker
    for (const holo of this.holograms) {
      const screen = holo.children[1];
      if (screen && screen.material) {
        screen.material.opacity = 0.1 + Math.sin(time * 3 + holo.position.x) * 0.05;
      }
    }

    // Stars twinkle
    for (const starGroup of this.stars) {
      for (const star of starGroup.children) {
        if (star.material) {
          star.material.opacity = 0.3 + Math.sin(time * 2 + star.position.x * 10) * 0.3;
        }
      }
    }
  }
}
