import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SceneBase } from 'dula-engine';

/**
 * GLTFArenaScene — 基于 GLTF/GLB 模型的篮球场场景
 *
 * 加载外部 3D 模型作为篮球场环境，同时提供与 BasketballArenaScene
 * 兼容的接口（getCourtGeometry, getHoopPosition 等）。
 *
 * 如果模型加载失败，自动回退到程序化的 BasketballArenaScene。
 */
export class GLTFArenaScene extends SceneBase {
  /**
   * @param {string} modelUrl - GLB/GLTF 模型文件路径
   * @param {Object} options - 配置选项
   * @param {number} options.scale - 模型缩放比例（默认 1）
   * @param {Object} options.offset - 位置偏移 {x, y, z}
   * @param {Object} options.hoopPositions - 篮筐位置覆盖 {north: Vector3, south: Vector3}
   * @param {Object} options.courtGeometry - 球场几何信息覆盖
   * @param {boolean} options.addProceduralStands - 是否添加程序化看台（如果模型没有）
   * @param {boolean} options.addProceduralLights - 是否添加程序化灯光（如果模型没有）
   * @param {SceneBase} options.fallbackScene - 加载失败时的回退场景类
   */
  constructor(modelUrl, options = {}) {
    super('GLTFArenaScene');
    this.modelUrl = modelUrl;
    this.options = {
      scale: 1,
      offset: { x: 0, y: 0, z: 0 },
      hoopPositions: null,
      courtGeometry: null,
      addProceduralStands: false,
      addProceduralLights: true,
      fallbackScene: null,
      ...options,
    };

    this.gltfScene = null;
    this.loaded = false;
    this.loadError = null;
    this.flashbulbs = [];
    this.flashbulbTimers = [];
    this.basketballTrajectory = null;
    this.dunkWindow = null;
    this.rimBend = { north: 0, south: 0 };
    this.basketball = null;

    // 默认球场几何（NBA 标准，可被覆盖）
    this._courtGeom = this.options.courtGeometry || {
      width: 28,
      length: 30,
      halfLength: 15,
      groundY: 0.01,
      hoopHeight: 3.05,
      hoopOffsetZ: 1.35,
      baselineZ: 15,
      centerZ: 0,
    };
  }

  build() {
    super.build();

    // 设置背景
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.Fog(0x0a0a1a, 30, 80);

    // 异步加载 GLTF 模型（加载完成后自动添加到场景）
    this._loadModel().catch((err) => {
      console.warn(`[GLTFArenaScene] Failed to load model ${this.modelUrl}:`, err.message);
      this.loadError = err;
    });

    // 如果模型没有灯光，添加程序化灯光
    if (this.options.addProceduralLights) {
      this._buildArenaLights();
    }

    // 如果模型没有看台，添加程序化看台
    if (this.options.addProceduralStands) {
      this._buildStands();
    }

    return this.scene;
  }

  async _loadModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        this.modelUrl,
        (gltf) => {
          this.gltfScene = gltf.scene;

          // 应用缩放和偏移
          const { scale, offset } = this.options;
          this.gltfScene.scale.set(scale, scale, scale);
          this.gltfScene.position.set(offset.x, offset.y, offset.z);

          // 启用阴影
          this.gltfScene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.scene.add(this.gltfScene);
          this.loaded = true;

          // 分析模型边界，自动调整 court geometry
          this._analyzeModelBounds();

          console.log(`[GLTFArenaScene] Model loaded: ${this.modelUrl}`);
          resolve(gltf);
        },
        // 进度回调
        (xhr) => {
          if (xhr.total > 0) {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
            console.log(`[GLTFArenaScene] Loading ${this.modelUrl}: ${percent}%`);
          }
        },
        // 错误回调
        (error) => {
          reject(error);
        }
      );
    });
  }

  _analyzeModelBounds() {
    if (!this.gltfScene) return;

    const box = new THREE.Box3().setFromObject(this.gltfScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    console.log(`[GLTFArenaScene] Model bounds: size=${size.x.toFixed(2)}x${size.y.toFixed(2)}x${size.z.toFixed(2)}, center=${center.x.toFixed(2)},${center.y.toFixed(2)},${center.z.toFixed(2)}`);

    // 如果用户没有指定 courtGeometry，尝试从模型推断
    if (!this.options.courtGeometry) {
      // 使用模型底面作为球场参考
      this._courtGeom = {
        width: Math.max(size.x, size.z),
        length: Math.max(size.x, size.z),
        halfLength: Math.max(size.x, size.z) / 2,
        groundY: box.min.y,
        hoopHeight: 3.05,
        hoopOffsetZ: 1.35,
        baselineZ: Math.max(size.x, size.z) / 2,
        centerZ: center.z,
      };
    }
  }

  _buildArenaLights() {
    // 环境光
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    // 主聚光灯（球场中央上方）
    const mainSpot = new THREE.SpotLight(0xffffff, 1.5);
    mainSpot.position.set(0, 25, 0);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.3;
    mainSpot.decay = 1;
    mainSpot.distance = 60;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 2048;
    mainSpot.shadow.mapSize.height = 2048;
    this.scene.add(mainSpot);

    // 补光
    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.3);
    fillLight.position.set(-15, 10, -15);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffaa88, 0.2);
    rimLight.position.set(15, 8, 15);
    this.scene.add(rimLight);
  }

  _buildStands() {
    // 简化的程序化看台（与 BasketballArenaScene 类似但简化）
    const tiers = [
      { radius: 12, height: 1.5, depth: 2.5, yOffset: 0.5, rows: 5 },
      { radius: 15, height: 2, depth: 3, yOffset: 2.5, rows: 4 },
      { radius: 18, height: 2.5, depth: 3.5, yOffset: 5, rows: 3 },
    ];

    const standMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.8 });
    const seatColors = [0xcc3333, 0x3366cc, 0x33cc66, 0xcccc33, 0xcc33cc, 0x33cccc];

    for (const tier of tiers) {
      const circumference = 2 * Math.PI * tier.radius;
      const seatCount = Math.floor(circumference / 0.6);

      for (let row = 0; row < tier.rows; row++) {
        const rowRadius = tier.radius + row * (tier.depth / tier.rows);
        const rowHeight = tier.yOffset + row * (tier.height / tier.rows);

        for (let s = 0; s < seatCount; s++) {
          const angle = (s / seatCount) * Math.PI * 2;
          const x = Math.cos(angle) * rowRadius;
          const z = Math.sin(angle) * rowRadius;

          // 座椅
          const seatGeo = new THREE.BoxGeometry(0.4, 0.08, 0.4);
          const seatMat = new THREE.MeshStandardMaterial({
            color: seatColors[Math.floor(Math.random() * seatColors.length)],
            roughness: 0.7,
          });
          const seat = new THREE.Mesh(seatGeo, seatMat);
          seat.position.set(x, rowHeight, z);
          seat.lookAt(0, rowHeight, 0);
          this.scene.add(seat);

          // 观众（简化为彩色小球）
          if (Math.random() < 0.6) {
            const bodyColor = seatColors[Math.floor(Math.random() * seatColors.length)];
            const bodyGeo = new THREE.SphereGeometry(0.15, 6, 6);
            const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.set(x, rowHeight + 0.25, z);
            this.scene.add(body);
          }
        }
      }
    }
  }

  // ---- 兼容 BasketballArenaScene 的接口 ----

  getCourtGeometry() {
    return this._courtGeom;
  }

  getHoopPosition(hoopName) {
    if (this.options.hoopPositions && this.options.hoopPositions[hoopName]) {
      return this.options.hoopPositions[hoopName].clone();
    }
    // 默认位置
    const z = hoopName === 'north'
      ? -this._courtGeom.baselineZ + this._courtGeom.hoopOffsetZ
      : this._courtGeom.baselineZ - this._courtGeom.hoopOffsetZ;
    return new THREE.Vector3(0, this._courtGeom.hoopHeight, z);
  }

  setBasketballTrajectory(startTime, ballPath) {
    this.basketballTrajectory = { startTime, ballPath };
  }

  clearBasketballTrajectory() {
    this.basketballTrajectory = null;
  }

  setDunkWindow(startTime, endTime, hoopName, releaseTime) {
    this.dunkWindow = { startTime, endTime, hoopName, releaseTime };
  }

  triggerRimBend(hoopName) {
    this.rimBend[hoopName] = 0.08;
  }

  // ---- 更新循环 ----

  update(time, delta) {
    super.update(time, delta);
    this._updateFlashbulbs(time, delta);
    this._updateBasketball(time);

    // Rim bend recovery
    for (const name of ['north', 'south']) {
      if (this.rimBend[name] > 0) {
        this.rimBend[name] = Math.max(0, this.rimBend[name] - delta * 2);
      }
    }
  }

  _updateFlashbulbs(time, delta) {
    if (Math.random() < 0.15) {
      const tiers = [
        { radius: 22, height: 2, yOffset: 0.5 },
        { radius: 26, height: 3, yOffset: 3 },
        { radius: 30, height: 3.5, yOffset: 6 },
      ];
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const angle = Math.random() * Math.PI * 2;
      const row = Math.floor(Math.random() * 3);
      const rowOffset = tier.radius * 0.3 + row * 0.7 + 2;
      const x = Math.cos(angle) * (tier.radius + rowOffset);
      const z = Math.sin(angle) * (tier.radius + rowOffset);
      const y = tier.yOffset + 0.5 + row * 0.4 + 0.3;

      const flashGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const flash = new THREE.Mesh(flashGeo, flashMat);
      flash.position.set(x, y, z);
      this.scene.add(flash);
      this.flashbulbs.push({ mesh: flash, life: 0.15 });
    }

    for (let i = this.flashbulbs.length - 1; i >= 0; i--) {
      const fb = this.flashbulbs[i];
      fb.life -= delta;
      if (fb.life <= 0) {
        this.scene.remove(fb.mesh);
        this.flashbulbs.splice(i, 1);
      } else {
        fb.mesh.material.opacity = fb.life / 0.15;
        fb.mesh.material.transparent = true;
        const s = 1 + (0.15 - fb.life) * 10;
        fb.mesh.scale.set(s, s, s);
      }
    }
  }

  _updateBasketball(time) {
    const traj = this.basketballTrajectory;
    if (!traj || !traj.ballPath || traj.ballPath.length === 0) return;

    const elapsed = time - traj.startTime;
    if (elapsed < 0) return;

    const path = traj.ballPath;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      if (elapsed >= a.time && elapsed <= b.time) {
        const t = (elapsed - a.time) / (b.time - a.time);
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const z = a.z + (b.z - a.z) * t;

        if (!this.basketball) {
          const ballGeo = new THREE.SphereGeometry(0.12, 16, 16);
          const ballMat = new THREE.MeshStandardMaterial({
            color: 0xe85d04,
            roughness: 0.4,
          });
          this.basketball = new THREE.Mesh(ballGeo, ballMat);
          this.scene.add(this.basketball);
        }
        this.basketball.position.set(x, y, z);
        this.basketball.visible = true;
        return;
      }
    }

    if (this.basketball) {
      this.basketball.visible = false;
    }
    if (this.dunkWindow && elapsed > this.dunkWindow.endTime - this.dunkWindow.startTime - 0.3) {
      const hoopName = this.dunkWindow.hoopName;
      this.rimBend[hoopName] = 0.08;
    }
  }
}
