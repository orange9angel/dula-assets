import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * CityScene — 现代城市街道场景
 * 高楼大厦、柏油马路、路灯、车辆
 * 用于奥特曼vs怪兽的城市战斗
 */
export class CityScene extends SceneBase {
  constructor() {
    super('CityScene');
    this.clouds = [];
    this.smokeParticles = [];
  }

  build() {
    super.build();

    // Sky blue background
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    // ---- Ground (asphalt road) ----
    const roadGeo = new THREE.PlaneGeometry(200, 200);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    this.scene.add(road);

    // Road markings (white lines)
    const lineGeo = new THREE.PlaneGeometry(0.3, 200);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (const x of [-3, 3]) {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.01, 0);
      this.scene.add(line);
    }

    // ---- Sidewalks ----
    const sidewalkGeo = new THREE.BoxGeometry(200, 0.15, 8);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8 });
    for (const z of [-15, 15]) {
      const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      sidewalk.position.set(0, 0.075, z);
      sidewalk.receiveShadow = true;
      this.scene.add(sidewalk);
    }

    // ---- Buildings (skyscrapers) ----
    const buildingColors = [0x8899aa, 0x778899, 0x99aabb, 0x667788, 0x8899cc];
    const buildingPositions = [
      [-20, -25], [-12, -30], [-5, -22], [8, -28], [18, -24],
      [-25, 20], [-15, 25], [-8, 18], [5, 22], [15, 28], [22, 20],
      [-30, -10], [-28, 5], [28, -5], [30, 10],
    ];
    
    for (const [bx, bz] of buildingPositions) {
      const width = 4 + Math.random() * 6;
      const depth = 4 + Math.random() * 6;
      const height = 15 + Math.random() * 35;
      
      const buildingGeo = new THREE.BoxGeometry(width, height, depth);
      const buildingMat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        roughness: 0.6
      });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.set(bx, height / 2, bz);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      // Windows (glowing rectangles)
      const windowRows = Math.floor(height / 3);
      const windowCols = Math.floor(width / 2);
      for (let r = 0; r < windowRows; r++) {
        for (let c = 0; c < windowCols; c++) {
          if (Math.random() > 0.3) { // Some windows lit
            const winGeo = new THREE.PlaneGeometry(0.8, 1.2);
            const winMat = new THREE.MeshBasicMaterial({ 
              color: Math.random() > 0.5 ? 0xffffcc : 0x333333,
              transparent: true,
              opacity: 0.8
            });
            const win = new THREE.Mesh(winGeo, winMat);
            win.position.set(
              bx - width/2 + 1 + c * 1.5,
              2 + r * 3,
              bz + depth/2 + 0.01
            );
            this.scene.add(win);
          }
        }
      }
    }

    // ---- Street lamps ----
    for (let i = -8; i <= 8; i++) {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(i * 12, 0, -12);
      
      // Pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      );
      pole.position.y = 3;
      lampGroup.add(pole);
      
      // Light
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffcc })
      );
      light.position.y = 6;
      lampGroup.add(light);
      
      this.scene.add(lampGroup);
    }

    // ---- Cars (tiny, for scale) ----
    const carColors = [0xff0000, 0x0000ff, 0xffffff, 0x000000];
    for (let i = 0; i < 6; i++) {
      const carGroup = new THREE.Group();
      const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.8, 3.5),
        new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length] })
      );
      carBody.position.y = 0.4;
      carGroup.add(carBody);
      
      // Wheels
      for (const wx of [-0.8, 0.8]) {
        for (const wz of [-1.2, 1.2]) {
          const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.2, 8),
            new THREE.MeshStandardMaterial({ color: 0x111111 })
          );
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.25, wz);
          carGroup.add(wheel);
        }
      }
      
      carGroup.position.set((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 40);
      this.scene.add(carGroup);
    }

    // ---- Clouds ----
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 6; i++) {
      const cloudGroup = new THREE.Group();
      for (let j = 0; j < 4; j++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(2 + Math.random() * 3, 8, 8),
          cloudMat
        );
        puff.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 4);
        cloudGroup.add(puff);
      }
      cloudGroup.position.set((Math.random() - 0.5) * 100, 40 + Math.random() * 15, -30 - Math.random() * 50);
      this.scene.add(cloudGroup);
      this.clouds.push(cloudGroup);
    }

    // ---- Directional light (sun) ----
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(50, 80, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    this.scene.add(sunLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
  }

  update(time, delta) {
    // Cloud drift
    for (const cloud of this.clouds) {
      cloud.position.x += delta * 0.5;
      if (cloud.position.x > 80) cloud.position.x = -80;
    }
  }
}
