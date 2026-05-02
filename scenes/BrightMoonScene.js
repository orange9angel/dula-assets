import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * BrightMoonScene — 明月城堡（希瑞的反抗军基地）
 * 白色大理石城堡，金色装饰，魔法水晶，花园
 * 明亮、庄严、充满希望的氛围
 */
export class BrightMoonScene extends SceneBase {
  constructor() {
    super('BrightMoonScene');
    this.crystals = [];
    this.banners = [];
  }

  build() {
    super.build();

    // Sky — bright, magical
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 30, 80);

    // ---- Ground (marble courtyard) ----
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Marble pattern lines
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.3 });
    for (let i = -5; i <= 5; i++) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(60, 0.01, 0.05), lineMat);
      line.position.set(0, 0.005, i * 3);
      this.scene.add(line);
      const line2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 60), lineMat);
      line2.position.set(i * 3, 0.005, 0);
      this.scene.add(line2);
    }

    // ---- Castle Walls ----
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.4 });
    const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6 });

    // Main castle structure (back)
    const castleBase = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 8), wallMat);
    castleBase.position.set(0, 6, -15);
    castleBase.castShadow = true;
    castleBase.receiveShadow = true;
    this.scene.add(castleBase);

    // Castle towers (4 corners)
    const towerPositions = [[-8, -15], [8, -15], [-8, -11], [8, -11]];
    for (const [tx, tz] of towerPositions) {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 16, 16), wallMat);
      tower.position.set(tx, 8, tz);
      tower.castShadow = true;
      this.scene.add(tower);

      // Tower roof (blue cone)
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 16), new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.5 }));
      roof.position.set(tx, 17.5, tz);
      this.scene.add(roof);

      // Gold trim on tower
      const trim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.05, 8, 32), goldTrimMat);
      trim.position.set(tx, 14, tz);
      trim.rotation.x = Math.PI / 2;
      this.scene.add(trim);
    }

    // Main gate (arched)
    const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 1), wallMat);
    gateFrame.position.set(0, 4, -11.5);
    this.scene.add(gateFrame);

    const gateArch = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1, 16, 1, false, 0, Math.PI), wallMat);
    gateArch.position.set(0, 8, -11.5);
    gateArch.rotation.z = Math.PI / 2;
    this.scene.add(gateArch);

    // Gate doors (golden, open)
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.7 });
    for (const side of [-1, 1]) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(2.5, 6, 0.15), doorMat);
      door.position.set(side * 1.5, 3, -11.2);
      door.rotation.y = side * 0.4;
      this.scene.add(door);
    }

    // ---- Crystal Pillars (magical) ----
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      emissive: 0x4488ff,
      emissiveIntensity: 0.3,
    });
    const crystalPositions = [[-6, -6], [6, -6], [-6, 6], [6, 6], [0, 0]];
    for (const [cx, cz] of crystalPositions) {
      const crystal = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.5, 6), crystalMat);
      crystal.position.set(cx, 1.25, cz);
      crystal.castShadow = true;
      this.scene.add(crystal);
      this.crystals.push({ mesh: crystal, baseY: 1.25, phase: Math.random() * Math.PI * 2 });

      // Crystal base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.2, 8), goldTrimMat);
      base.position.set(cx, 0.1, cz);
      this.scene.add(base);
    }

    // ---- Garden (flower beds) ----
    const flowerColors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0x00ced1];
    const gardenPositions = [[-10, 10], [10, 10], [-10, -10], [10, -10]];
    for (const [gx, gz] of gardenPositions) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 3), new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 1.0 }));
      bed.position.set(gx, 0.1, gz);
      this.scene.add(bed);

      for (let i = 0; i < 8; i++) {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0x228b22 }));
        const fx = gx + (Math.random() - 0.5) * 2.5;
        const fz = gz + (Math.random() - 0.5) * 2.5;
        stem.position.set(fx, 0.35, fz);
        this.scene.add(stem);

        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 8, 8), new THREE.MeshStandardMaterial({ color: flowerColors[Math.floor(Math.random() * flowerColors.length)] }));
        flower.position.set(fx, 0.52, fz);
        this.scene.add(flower);
      }
    }

    // ---- Banners (rebel alliance flags) ----
    const bannerMat = new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.8, side: THREE.DoubleSide });
    const bannerPositions = [[-5, 8, -11], [5, 8, -11], [-12, 6, -8], [12, 6, -8]];
    for (const [bx, by, bz] of bannerPositions) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3, 8), goldTrimMat);
      pole.position.set(bx, by, bz);
      this.scene.add(pole);

      const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), bannerMat);
      banner.position.set(bx + 0.4, by - 0.3, bz);
      this.scene.add(banner);
      this.banners.push({ mesh: banner, baseX: bx + 0.4, phase: Math.random() * Math.PI * 2 });
    }

    // ---- Throne (center back) ----
    const throneBase = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 1.5), goldTrimMat);
    throneBase.position.set(0, 0.5, -10);
    this.scene.add(throneBase);

    const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x4a148c, roughness: 0.8 }));
    throneSeat.position.set(0, 1.1, -10);
    this.scene.add(throneSeat);

    const throneBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.5, 0.15), goldTrimMat);
    throneBack.position.set(0, 2.3, -10.7);
    this.scene.add(throneBack);

    // ---- Floating lights (magic motes) ----
    const moteMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.6 });
    this.motes = [];
    for (let i = 0; i < 20; i++) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), moteMat);
      const mx = (Math.random() - 0.5) * 20;
      const my = 1 + Math.random() * 5;
      const mz = (Math.random() - 0.5) * 20;
      mote.position.set(mx, my, mz);
      this.scene.add(mote);
      this.motes.push({ mesh: mote, basePos: { x: mx, y: my, z: mz }, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() });
    }

    return this.scene;
  }

  update(time, delta) {
    super.update(time, delta);

    // Crystal glow pulse
    for (const crystal of this.crystals) {
      const pulse = 0.3 + Math.sin(time * 2 + crystal.phase) * 0.15;
      crystal.mesh.material.emissiveIntensity = pulse;
      crystal.mesh.position.y = crystal.baseY + Math.sin(time * 1.5 + crystal.phase) * 0.05;
    }

    // Banner sway
    for (const banner of this.banners) {
      banner.mesh.rotation.y = Math.sin(time * 1.5 + banner.phase) * 0.15;
    }

    // Motes drift
    for (const mote of this.motes) {
      mote.mesh.position.y = mote.basePos.y + Math.sin(time * mote.speed + mote.phase) * 0.3;
      mote.mesh.position.x = mote.basePos.x + Math.cos(time * mote.speed * 0.7 + mote.phase) * 0.2;
    }
  }
}
