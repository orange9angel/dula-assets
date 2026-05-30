import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

/**
 * DestroyedCityScene — 被怪兽摧毁的城市废墟
 * 倒塌的高楼大厦、燃烧的火焰、浓烟、瓦砾、弹坑
 * 用于奥特曼vs怪兽战斗后的战场
 */
export class DestroyedCityScene extends SceneBase {
  constructor() {
    super('DestroyedCityScene');
    this.smokeParticles = [];
    this.fires = [];
  }

  build() {
    super.build();

    // Dark smoky sky (orange-tinted from fires)
    this.scene.background = new THREE.Color(0x554433);
    this.scene.fog = new THREE.Fog(0x554433, 15, 80);

    // ---- Ground (cracked asphalt with debris) ----
    const groundGeo = new THREE.PlaneGeometry(200, 200, 8, 8);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // ---- Rubble / debris (concrete chunks) ----
    const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
    for (let i = 0; i < 50; i++) {
      const size = 0.3 + Math.random() * 1.5;
      const rubble = new THREE.Mesh(
        new THREE.BoxGeometry(size, size * 0.5, size * 0.8),
        rubbleMat
      );
      rubble.position.set(
        (Math.random() - 0.5) * 60,
        size * 0.25,
        (Math.random() - 0.5) * 60
      );
      rubble.rotation.set(
        Math.random() * 0.8,
        Math.random() * Math.PI,
        Math.random() * 0.5
      );
      rubble.castShadow = true;
      this.scene.add(rubble);
    }

    // ---- Destroyed buildings (leaning / broken skyscrapers) ----
    const buildingColors = [0x777777, 0x666666, 0x888888, 0x555555];
    const brokenPositions = [
      [-15, -12], [-8, -18], [5, -15], [12, -10], [20, -14],
      [-18, 8], [-10, 12], [8, 10], [16, 15], [22, 8],
    ];
    for (const [bx, bz] of brokenPositions) {
      const width = 3 + Math.random() * 5;
      const depth = 3 + Math.random() * 5;
      const height = 3 + Math.random() * 8;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({ color: buildingColors[Math.floor(Math.random() * buildingColors.length)], roughness: 0.8 })
      );
      building.position.set(bx, height / 2, bz);
      building.rotation.z = (Math.random() - 0.5) * 0.4;
      building.rotation.x = (Math.random() - 0.5) * 0.3;
      building.castShadow = true;
      this.scene.add(building);

      // Broken top debris falling
      for (let d = 0; d < 8; d++) {
        const debris = new THREE.Mesh(
          new THREE.BoxGeometry(0.4 + Math.random() * 0.8, 0.3 + Math.random() * 0.5, 0.4 + Math.random() * 0.8),
          rubbleMat
        );
        debris.position.set(
          bx + (Math.random() - 0.5) * 5,
          height + Math.random() * 2,
          bz + (Math.random() - 0.5) * 5
        );
        debris.rotation.set(Math.random(), Math.random(), Math.random());
        this.scene.add(debris);
      }
    }

    // ---- Fire effects (orange glowing spheres) ----
    const firePositions = [
      [-8, -5], [10, 8], [-12, 10], [5, -8], [15, -3],
      [-5, 15], [18, 5], [-15, -8],
    ];
    for (const [fx, fz] of firePositions) {
      const fireGroup = new THREE.Group();
      fireGroup.position.set(fx, 0, fz);

      for (let f = 0; f < 5; f++) {
        const fireGeo = new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 8, 8);
        const fireMat = new THREE.MeshBasicMaterial({
          color: f < 2 ? 0xff3300 : 0xff8800,
          transparent: true,
          opacity: 0.5 + Math.random() * 0.3
        });
        const fire = new THREE.Mesh(fireGeo, fireMat);
        fire.position.set(
          (Math.random() - 0.5) * 1.0,
          0.3 + Math.random() * 0.8,
          (Math.random() - 0.5) * 1.0
        );
        fireGroup.add(fire);
        this.fires.push(fire);
      }

      // Fire light
      const fireLight = new THREE.PointLight(0xff4400, 3, 12);
      fireLight.position.y = 0.8;
      fireGroup.add(fireLight);

      this.scene.add(fireGroup);
    }

    // ---- Smoke (dark spheres rising) ----
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.25 });
    for (let i = 0; i < 20; i++) {
      const smoke = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 + Math.random() * 2.0, 8, 8),
        smokeMat.clone()
      );
      smoke.position.set(
        (Math.random() - 0.5) * 50,
        3 + Math.random() * 8,
        (Math.random() - 0.5) * 50
      );
      this.scene.add(smoke);
      this.smokeParticles.push({
        mesh: smoke,
        speed: 0.3 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.4,
      });
    }

    // ---- Craters (dark circles on ground from monster footsteps) ----
    const craterMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1.0 });
    for (let i = 0; i < 5; i++) {
      const crater = new THREE.Mesh(
        new THREE.CircleGeometry(2 + Math.random() * 3, 16),
        craterMat
      );
      crater.rotation.x = -Math.PI / 2;
      crater.position.set(
        (Math.random() - 0.5) * 30,
        0.02,
        (Math.random() - 0.5) * 30
      );
      this.scene.add(crater);
    }

    // ---- Overturned cars ----
    const carColors = [0xff0000, 0x0000ff, 0xffffff, 0x000000, 0x888888];
    for (let i = 0; i < 4; i++) {
      const carGroup = new THREE.Group();
      const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.8, 3.5),
        new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length] })
      );
      carBody.position.y = 0.4;
      carGroup.add(carBody);
      
      carGroup.position.set((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20);
      carGroup.rotation.z = (Math.random() - 0.5) * 0.5;
      carGroup.rotation.x = (Math.random() - 0.5) * 0.3;
      this.scene.add(carGroup);
    }

    // ---- Dim directional light (smoky sun) ----
    const sunLight = new THREE.DirectionalLight(0xffaa66, 0.6);
    sunLight.position.set(30, 50, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    // Ambient light (darker)
    const ambientLight = new THREE.AmbientLight(0x332211, 0.4);
    this.scene.add(ambientLight);
  }

  update(time, delta) {
    super.update(time, delta);
    // Fire flicker
    for (const fire of this.fires) {
      fire.scale.setScalar(0.7 + Math.random() * 0.6);
      fire.material.opacity = 0.3 + Math.random() * 0.5;
    }

    // Smoke rise
    for (const particle of this.smokeParticles) {
      particle.mesh.position.y += particle.speed * delta;
      particle.mesh.position.x += particle.drift * delta;
      particle.mesh.material.opacity = Math.max(0, 0.25 - (particle.mesh.position.y - 3) * 0.015);

      if (particle.mesh.position.y > 18 || particle.mesh.material.opacity <= 0) {
        particle.mesh.position.y = 3 + Math.random() * 3;
        particle.mesh.position.x += (Math.random() - 0.5) * 8;
        particle.mesh.material.opacity = 0.25;
      }
    }
  }
}
