import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * FrightZoneScene — 恐惧地带（霍达克的军团基地）
 * 黑暗工业风，金属结构，红色警报灯，烟雾
 * 压抑、紧张、邪恶的氛围
 */
export class FrightZoneScene extends SceneBase {
  constructor() {
    super('FrightZoneScene');
    this.lights = [];
    this.smokeParticles = [];
  }

  build() {
    super.build();

    // Dark, oppressive atmosphere
    this.scene.background = new THREE.Color(0x1a0a0a);
    this.scene.fog = new THREE.Fog(0x1a0a0a, 10, 50);

    // Override default lights with darker ones
    this.scene.children.filter(c => c.isLight).forEach(l => this.scene.remove(l));
    this.lights = []; // Clear inherited light array to avoid undefined mesh access in update

    // Dim ambient
    const ambient = new THREE.AmbientLight(0x331111, 0.4);
    this.scene.add(ambient);

    // Red directional (evil light)
    const redDir = new THREE.DirectionalLight(0xff2222, 0.6);
    redDir.position.set(10, 15, 5);
    redDir.castShadow = true;
    this.scene.add(redDir);

    // Blue rim light (cold industrial)
    const blueRim = new THREE.DirectionalLight(0x2244ff, 0.3);
    blueRim.position.set(-10, 5, -10);
    this.scene.add(blueRim);

    // ---- Ground (metal grating) ----
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.7, metalness: 0.5 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Grating lines
    const grateMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.6 });
    for (let i = -10; i <= 10; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(60, 0.02, 0.08), grateMat);
      line.position.set(0, 0.01, i * 2);
      this.scene.add(line);
    }

    // ---- Industrial Walls ----
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6, metalness: 0.4 });
    const rustMat = new THREE.MeshStandardMaterial({ color: 0x5d3a1a, roughness: 0.9 });

    // Back wall with pipes
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 1), wallMat);
    backWall.position.set(0, 5, -15);
    backWall.castShadow = true;
    this.scene.add(backWall);

    // Side walls
    for (const side of [-1, 1]) {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 30), wallMat);
      sideWall.position.set(side * 15, 5, 0);
      sideWall.castShadow = true;
      this.scene.add(sideWall);
    }

    // ---- Pipes (industrial detail) ----
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.5, metalness: 0.6 });
    for (let i = 0; i < 8; i++) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 20, 8), pipeMat);
      pipe.position.set(-10 + i * 3, 7 + Math.random() * 2, -14);
      pipe.rotation.z = Math.PI / 2;
      this.scene.add(pipe);

      // Pipe joints
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), pipeMat);
      joint.position.set(-10 + i * 3, 7 + Math.random() * 2, -14);
      this.scene.add(joint);
    }

    // ---- Horde Emblem (large, back wall) ----
    const emblemMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.4, metalness: 0.5, emissive: 0x440000, emissiveIntensity: 0.3 });
    const emblem = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.2), emblemMat);
    emblem.position.set(0, 6, -14.3);
    this.scene.add(emblem);

    // ---- Control Panels ----
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.3 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 });
    const screenPositions = [[-8, 2, -8], [8, 2, -8], [-5, 2, 5], [5, 2, 5]];
    for (const [px, py, pz] of screenPositions) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.5), panelMat);
      panel.position.set(px, py, pz);
      this.scene.add(panel);

      const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), screenMat);
      screen.position.set(px, py + 0.1, pz + 0.26);
      this.scene.add(screen);

      // Blinking lights
      for (let i = 0; i < 4; i++) {
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xff0000 : 0xffff00 }));
        light.position.set(px - 0.6 + i * 0.4, py - 0.4, pz + 0.26);
        this.scene.add(light);
        this.lights.push({ mesh: light, phase: Math.random() * Math.PI * 2, color: i % 2 === 0 ? 0xff0000 : 0xffff00 });
      }
    }

    // ---- Horde Troop Platforms ----
    for (const side of [-1, 1]) {
      const platform = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 3), wallMat);
      platform.position.set(side * 10, 1, -5);
      this.scene.add(platform);

      // Railings
      for (let i = 0; i < 3; i++) {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 4), pipeMat);
        rail.position.set(side * 10 + (i - 1) * 1.5, 1.5, -5 + 1.4);
        this.scene.add(rail);
      }
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(4, 0.04, 0.04), pipeMat);
      topRail.position.set(side * 10, 2, -5 + 1.4);
      this.scene.add(topRail);
    }

    // ---- Smoke/Vent effects ----
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.2 });
    this.smokeParticles = [];
    for (let i = 0; i < 15; i++) {
      const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 6, 6), smokeMat);
      const sx = (Math.random() - 0.5) * 20;
      const sz = -10 + Math.random() * 10;
      smoke.position.set(sx, 0.5, sz);
      this.scene.add(smoke);
      this.smokeParticles.push({ mesh: smoke, baseX: sx, baseZ: sz, speed: 0.3 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2 });
    }

    // ---- Red Alert Lights (rotating) ----
    this.alertLights = [];
    for (const [lx, lz] of [[-12, -12], [12, -12], [0, -14]]) {
      const lightBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.5, 8), pipeMat);
      lightBase.position.set(lx, 0.25, lz);
      this.scene.add(lightBase);

      const lightHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      lightHead.position.set(lx, 0.6, lz);
      this.scene.add(lightHead);

      // Point light for actual illumination
      const pointLight = new THREE.PointLight(0xff0000, 0.5, 10);
      pointLight.position.set(lx, 0.6, lz);
      this.scene.add(pointLight);

      this.alertLights.push({ mesh: lightHead, light: pointLight, phase: Math.random() * Math.PI * 2 });
    }

    return this.scene;
  }

  update(time, delta) {
    super.update(time, delta);

    // Blinking panel lights
    for (const light of this.lights) {
      const blink = Math.sin(time * 4 + light.phase) > 0 ? 1 : 0.3;
      light.mesh.material.opacity = blink;
    }

    // Smoke drift
    for (const smoke of this.smokeParticles) {
      smoke.mesh.position.y = 0.5 + Math.sin(time * smoke.speed + smoke.phase) * 0.3 + (time * smoke.speed * 0.1) % 3;
      smoke.mesh.position.x = smoke.baseX + Math.sin(time * 0.5 + smoke.phase) * 0.5;
      smoke.mesh.material.opacity = 0.1 + Math.sin(time + smoke.phase) * 0.05;
    }

    // Alert lights rotate
    for (const alert of this.alertLights) {
      alert.mesh.position.x = alert.light.position.x + Math.sin(time * 3 + alert.phase) * 0.3;
      alert.light.intensity = 0.3 + Math.sin(time * 5 + alert.phase) * 0.3;
    }
  }
}
