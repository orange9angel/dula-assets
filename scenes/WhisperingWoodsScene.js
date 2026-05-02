import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * WhisperingWoodsScene — 低语森林（希瑞的秘密据点）
 * 茂密的魔法森林，发光的植物，古老的遗迹
 * 神秘、宁静、充满魔力的氛围
 */
export class WhisperingWoodsScene extends SceneBase {
  constructor() {
    super('WhisperingWoodsScene');
    this.fireflies = [];
    this.leaves = [];
    this.mushrooms = [];
  }

  build() {
    super.build();

    // Mystical forest atmosphere
    this.scene.background = new THREE.Color(0x1a2e1a);
    this.scene.fog = new THREE.Fog(0x1a2e1a, 8, 35);

    // Override lights for forest mood
    this.scene.children.filter(c => c.isLight).forEach(l => this.scene.remove(l));

    // Dim green ambient
    const ambient = new THREE.AmbientLight(0x2d5a2d, 0.5);
    this.scene.add(ambient);

    // Dappled sunlight through canopy
    const sunLight = new THREE.DirectionalLight(0x88ff88, 0.4);
    sunLight.position.set(5, 20, 5);
    sunLight.castShadow = true;
    this.scene.add(sunLight);

    // Magical blue underglow
    const magicLight = new THREE.DirectionalLight(0x4488ff, 0.2);
    magicLight.position.set(-5, 2, -5);
    this.scene.add(magicLight);

    // ---- Ground (forest floor) ----
    const groundGeo = new THREE.PlaneGeometry(80, 80, 16, 16);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getZ(i);
      posAttr.setZ(i, z + (Math.random() - 0.5) * 0.3);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d5c3d, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // ---- Trees (dense, ancient) ----
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const leavesMats = [
      new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.8 }),
    ];

    const treePositions = [
      [-8, 0, -8], [8, 0, -8], [-12, 0, 5], [12, 0, 5],
      [-5, 0, -15], [5, 0, -15], [-15, 0, -5], [15, 0, -5],
      [0, 0, -20], [-20, 0, 0], [20, 0, 0], [0, 0, 15],
      [-10, 0, 12], [10, 0, 12], [-18, 0, -12], [18, 0, -12],
    ];

    for (let i = 0; i < treePositions.length; i++) {
      const [x, y, z] = treePositions[i];
      const scale = 1.0 + Math.random() * 0.8;

      // Thick trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 3 * scale, 12), trunkMat);
      trunk.position.set(x, y + 1.5 * scale, z);
      trunk.castShadow = true;
      this.scene.add(trunk);

      // Multiple leaf clusters for dense canopy
      for (let j = 0; j < 3; j++) {
        const leavesMat = leavesMats[(i + j) % 3];
        const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.5 * scale + j * 0.3, 12, 12), leavesMat);
        leaves.position.set(x + (Math.random() - 0.5) * scale, y + 3.5 * scale + j * 0.8, z + (Math.random() - 0.5) * scale);
        leaves.castShadow = true;
        this.scene.add(leaves);
        this.leaves.push({ mesh: leaves, baseRotY: Math.random() * Math.PI * 2, speed: 0.2 + Math.random() * 0.3 });
      }

      // Roots
      for (let r = 0; r < 3; r++) {
        const rootAngle = (r / 3) * Math.PI * 2 + Math.random() * 0.5;
        const root = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.5, 6), trunkMat);
        root.position.set(x + Math.cos(rootAngle) * 0.5, 0.2, z + Math.sin(rootAngle) * 0.5);
        root.rotation.z = Math.cos(rootAngle) * 0.4;
        root.rotation.x = Math.sin(rootAngle) * 0.4;
        this.scene.add(root);
      }
    }

    // ---- Glowing Mushrooms ----
    const mushroomColors = [0x00ff88, 0x88ff00, 0x00ffff, 0xff88ff];
    for (let i = 0; i < 20; i++) {
      const mx = (Math.random() - 0.5) * 30;
      const mz = (Math.random() - 0.5) * 30;
      const color = mushroomColors[Math.floor(Math.random() * mushroomColors.length)];

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
      stem.position.set(mx, 0.075, mz);
      this.scene.add(stem);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.9,
      }));
      cap.position.set(mx, 0.15, mz);
      this.scene.add(cap);

      this.mushrooms.push({ mesh: cap, baseScale: 1, phase: Math.random() * Math.PI * 2, color });
    }

    // ---- Ancient Ruins (stone pillars) ----
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.8 });
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.9 });
    const ruinPositions = [[-4, -4], [4, -4], [-4, 4], [4, 4]];
    for (const [rx, rz] of ruinPositions) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 3, 8), stoneMat);
      pillar.position.set(rx, 1.5, rz);
      pillar.castShadow = true;
      this.scene.add(pillar);

      // Moss on pillar
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), mossMat);
      moss.position.set(rx + 0.2, 1, rz + 0.1);
      moss.scale.set(1, 0.6, 0.8);
      this.scene.add(moss);

      // Broken top
      const brokenTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), stoneMat);
      brokenTop.position.set(rx + 0.1, 3.1, rz - 0.05);
      brokenTop.rotation.z = 0.2;
      this.scene.add(brokenTop);
    }

    // ---- Fallen Log (seating) ----
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3, 12), trunkMat);
    log.position.set(0, 0.3, 3);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = 0.3;
    log.castShadow = true;
    this.scene.add(log);

    // ---- Fireflies ----
    const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.8 });
    this.fireflies = [];
    for (let i = 0; i < 30; i++) {
      const firefly = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), fireflyMat.clone());
      const fx = (Math.random() - 0.5) * 25;
      const fy = 0.5 + Math.random() * 4;
      const fz = (Math.random() - 0.5) * 25;
      firefly.position.set(fx, fy, fz);
      this.scene.add(firefly);
      this.fireflies.push({
        mesh: firefly,
        basePos: { x: fx, y: fy, z: fz },
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.5,
        radius: 1 + Math.random() * 3,
      });
    }

    // ---- Small Stream ----
    const streamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-15, 0.02, -10),
      new THREE.Vector3(-8, 0.02, -5),
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(8, 0.02, 5),
      new THREE.Vector3(15, 0.02, 10),
    ]);
    const streamGeo = new THREE.TubeGeometry(streamCurve, 30, 0.8, 4, false);
    const streamMat = new THREE.MeshStandardMaterial({ color: 0x4488aa, transparent: true, opacity: 0.6, roughness: 0.1 });
    const stream = new THREE.Mesh(streamGeo, streamMat);
    stream.scale.y = 0.02;
    this.scene.add(stream);

    return this.scene;
  }

  update(time, delta) {
    super.update(time, delta);

    // Fireflies orbit and blink
    for (const ff of this.fireflies) {
      const angle = time * ff.speed * 0.3 + ff.phase;
      ff.mesh.position.x = ff.basePos.x + Math.cos(angle) * ff.radius;
      ff.mesh.position.z = ff.basePos.z + Math.sin(angle) * ff.radius;
      ff.mesh.position.y = ff.basePos.y + Math.sin(time * ff.speed + ff.phase) * 0.3;
      ff.mesh.material.opacity = 0.4 + Math.sin(time * 3 + ff.phase) * 0.4;
    }

    // Leaves sway
    for (const leaf of this.leaves) {
      leaf.mesh.rotation.y = leaf.baseRotY + Math.sin(time * leaf.speed) * 0.05;
    }

    // Mushrooms pulse
    for (const mush of this.mushrooms) {
      const pulse = 0.5 + Math.sin(time * 2 + mush.phase) * 0.3;
      mush.mesh.material.emissiveIntensity = pulse;
      mush.mesh.scale.setScalar(1 + Math.sin(time * 1.5 + mush.phase) * 0.1);
    }
  }
}
