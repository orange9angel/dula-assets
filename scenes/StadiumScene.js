import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

const LANE_COUNT = 8;
const LANE_WIDTH = 1.22;
const TRACK_WIDTH = LANE_COUNT * LANE_WIDTH;
const START_Z = -50;
const FINISH_Z = 60;
const TRACK_CENTER_Z = 5;
const TRACK_LENGTH = 132;

function makeTextTexture(text, options = {}) {
  const width = options.width || 512;
  const height = options.height || 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);
  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = options.color || '#ffffff';
  ctx.font = options.font || 'bold 56px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * StadiumScene — 110米栏运动场
 *
 * 包含：
 * - 红色塑胶跑道（8条跑道）
 * - 白色跑道标线
 * - 起跑线 / 终点线
 * - 栏架（10个，标准间距）
 * - 绿色草坪内场
 * - 环形看台（观众席）
 * - 体育场灯光系统
 * - 记分牌
 */
export class StadiumScene extends SceneBase {
  constructor() {
    super('StadiumScene');
    this.flashbulbs = [];
    this.flashbulbTimers = [];
    this.hurdles = [];
    this.hurdleGroup = null;
    this.hurdleMarkerGroup = null;
    this._previousCharacterPositions = new Map();
    this._lastCollisionTime = null;
    this._currentTime = 0;
    this.spectators = [];       // animated spectator meshes
    this.confetti = [];         // confetti particles
    this.balloons = [];         // floating balloons
    this.bannerWaves = [];      // banner animation data
  }

  build() {
    super.build();

    // 天空蓝背景
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 60, 150);

    // ---- 地面基础 ----
    this._buildGround();

    // ---- 跑道 ----
    this._buildTrack();

    // ---- 栏架 ----
    this._buildHurdles();

    // ---- 草坪内场 ----
    this._buildField();

    // ---- 看台 ----
    this._buildStands();

    // ---- 记分牌 ----
    this._buildScoreboard();

    // ---- 体育场灯光 ----
    this._buildStadiumLights();

    // ---- 穹顶 ----
    this._buildDome();

    // ---- 观众人群 ----
    this._buildAnimatedSpectators();

    // ---- 彩旗横幅 ----
    this._buildBanners();

    // ---- 气球 ----
    this._buildBalloons();

    // ---- 五彩纸屑 ----
    this._buildConfetti();

    return this.scene;
  }

  _buildGround() {
    // 主地面
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4a7c59,
      roughness: 0.9,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  _buildTrack() {
    const trackGroup = new THREE.Group();

    // 跑道底色 — 深红色塑胶直道，长度覆盖起跑、110m栏和缓冲区
    const trackBaseGeo = new THREE.PlaneGeometry(TRACK_WIDTH + 2.2, TRACK_LENGTH);
    const trackBaseMat = new THREE.MeshStandardMaterial({
      color: 0x9f2f2a,
      roughness: 0.78,
      metalness: 0.05,
    });
    const trackBase = new THREE.Mesh(trackBaseGeo, trackBaseMat);
    trackBase.rotation.x = -Math.PI / 2;
    trackBase.position.set(0, 0.01, TRACK_CENTER_Z);
    trackBase.receiveShadow = true;
    trackGroup.add(trackBase);

    // 每条道轻微色差，避免跑道看起来是一整块平面
    for (let i = 0; i < LANE_COUNT; i++) {
      const laneCenterX = -TRACK_WIDTH / 2 + i * LANE_WIDTH + LANE_WIDTH / 2;
      const laneGeo = new THREE.PlaneGeometry(LANE_WIDTH - 0.06, TRACK_LENGTH);
      const laneMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xa93830 : 0x942822,
        roughness: 0.82,
        metalness: 0.02,
      });
      const lane = new THREE.Mesh(laneGeo, laneMat);
      lane.rotation.x = -Math.PI / 2;
      lane.position.set(laneCenterX, 0.012, TRACK_CENTER_Z);
      lane.receiveShadow = true;
      trackGroup.add(lane);
    }

    // 跑道线 — 白色
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // 跑道分道线
    for (let i = 0; i <= LANE_COUNT; i++) {
      const x = -TRACK_WIDTH / 2 + i * LANE_WIDTH;
      const lineGeo = new THREE.PlaneGeometry(0.055, TRACK_LENGTH);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.017, TRACK_CENTER_Z);
      trackGroup.add(line);
    }

    // 起跑线
    const startLineGeo = new THREE.PlaneGeometry(TRACK_WIDTH + 2.2, 0.34);
    const startLine = new THREE.Mesh(startLineGeo, lineMat);
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.set(0, 0.02, START_Z);
    trackGroup.add(startLine);

    // 起跑线文字标识
    const startLabelGeo = new THREE.PlaneGeometry(5.6, 1.0);
    const startLabelTex = makeTextTexture('START', {
      width: 512,
      height: 128,
      font: 'bold 58px Arial',
      color: '#101010',
      background: '#ffffff',
    });
    const startLabelMat = new THREE.MeshBasicMaterial({ map: startLabelTex });
    const startLabel = new THREE.Mesh(startLabelGeo, startLabelMat);
    startLabel.rotation.x = -Math.PI / 2;
    startLabel.position.set(0, 0.023, START_Z - 2.0);
    trackGroup.add(startLabel);

    // 起跑器
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x29313d,
      roughness: 0.42,
      metalness: 0.28,
    });
    const padMat = new THREE.MeshStandardMaterial({
      color: 0xf6d365,
      roughness: 0.45,
      metalness: 0.12,
    });
    for (let i = 0; i < LANE_COUNT; i++) {
      const x = -TRACK_WIDTH / 2 + i * LANE_WIDTH + LANE_WIDTH / 2;
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 1.0), blockMat);
      rail.position.set(x, 0.055, START_Z - 1.0);
      rail.castShadow = true;
      trackGroup.add(rail);

      const leftPad = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.20), padMat);
      leftPad.position.set(x - 0.23, 0.095, START_Z - 1.22);
      leftPad.rotation.y = -0.12;
      leftPad.castShadow = true;
      trackGroup.add(leftPad);

      const rightPad = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.20), padMat);
      rightPad.position.set(x + 0.23, 0.095, START_Z - 0.78);
      rightPad.rotation.y = 0.12;
      rightPad.castShadow = true;
      trackGroup.add(rightPad);
    }

    // 终点线（黑白格子）
    const finishGroup = new THREE.Group();
    const checkerSize = LANE_WIDTH / 4;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < Math.floor(TRACK_WIDTH / checkerSize) + 2; col++) {
        const isWhite = (row + col) % 2 === 0;
        const checkerGeo = new THREE.PlaneGeometry(checkerSize, checkerSize);
        const checkerMat = new THREE.MeshBasicMaterial({
          color: isWhite ? 0xffffff : 0x000000,
        });
        const checker = new THREE.Mesh(checkerGeo, checkerMat);
        checker.rotation.x = -Math.PI / 2;
        checker.position.set(
          -TRACK_WIDTH / 2 + col * checkerSize,
          0.016,
          FINISH_Z + row * checkerSize - checkerSize * 2
        );
        finishGroup.add(checker);
      }
    }
    trackGroup.add(finishGroup);

    // 终点横梁
    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.35, metalness: 0.45 });
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.2, 0.18), gantryMat);
      post.position.set(side * (TRACK_WIDTH / 2 + 1.25), 2.1, FINISH_Z);
      post.castShadow = true;
      trackGroup.add(post);
    }
    const finishBannerTex = makeTextTexture('FINISH', {
      width: 512,
      height: 128,
      font: 'bold 64px Arial',
      color: '#ffffff',
      background: '#111827',
    });
    const finishBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(TRACK_WIDTH + 2.8, 1.0),
      new THREE.MeshBasicMaterial({ map: finishBannerTex })
    );
    finishBanner.position.set(0, 3.9, FINISH_Z);
    finishBanner.rotation.y = Math.PI;
    trackGroup.add(finishBanner);

    // 跑道数字
    for (let i = 0; i < LANE_COUNT; i++) {
      const x = -TRACK_WIDTH / 2 + i * LANE_WIDTH + LANE_WIDTH / 2;
      const numGeo = new THREE.PlaneGeometry(0.56, 0.68);
      const numTex = makeTextTexture(String(i + 1), {
        width: 128,
        height: 128,
        font: 'bold 72px Arial',
      });
      const numMat = new THREE.MeshBasicMaterial({ map: numTex, transparent: true });
      const num = new THREE.Mesh(numGeo, numMat);
      num.rotation.x = -Math.PI / 2;
      num.position.set(x, 0.024, START_Z - 4.0);
      trackGroup.add(num);
    }

    // 110m栏标题牌，给转播镜头一个强视觉识别
    const boardTex = makeTextTexture('110M HURDLES', {
      width: 1024,
      height: 160,
      font: 'bold 72px Arial',
      color: '#ffffff',
      background: '#1b4d89',
    });
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 1.4),
      new THREE.MeshBasicMaterial({ map: boardTex })
    );
    board.position.set(-(TRACK_WIDTH / 2 + 4.2), 2.0, START_Z - 2.0);
    board.rotation.y = Math.PI / 2;
    trackGroup.add(board);

    this.scene.add(trackGroup);
  }

  _buildHurdles() {
    const hurdleGroup = new THREE.Group();
    hurdleGroup.name = 'hurdles';
    const markerGroup = new THREE.Group();
    markerGroup.name = 'hurdleCoordinateMarkers';
    markerGroup.visible = false;
    this.hurdles = [];

    // 标准110米栏参数
    const hurdleCount = 10;
    const startToFirst = 13.72;
    const hurdleSpacing = 9.14;
    const hurdleHeight = 1.067;
    const hurdleWidth = 1.2;

    const hurdleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
    });
    const barMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.4,
      metalness: 0.05,
    });
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xffff33,
      transparent: true,
      opacity: 0.82,
    });

    const addBox = (group, geometry, material, position) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position.x, position.y, position.z);
      mesh.castShadow = true;
      group.add(mesh);
      return mesh;
    };

    // 每条道都放置栏架，选手从中间道起跑时不会跨空气
    const lanes = Array.from({ length: LANE_COUNT }, (_, i) => i);
    for (let laneIdx of lanes) {
      const laneCenterX = -TRACK_WIDTH / 2 + laneIdx * LANE_WIDTH + LANE_WIDTH / 2;

      for (let i = 0; i < hurdleCount; i++) {
        const z = START_Z + startToFirst + i * hurdleSpacing;
        const root = new THREE.Group();
        root.name = `hurdle_L${laneIdx + 1}_${i + 1}`;
        root.position.set(laneCenterX, 0, z);
        root.userData.basePosition = root.position.clone();
        root.userData.hurdle = {
          lane: laneIdx + 1,
          laneIdx,
          hurdleIndex: i + 1,
          x: laneCenterX,
          z,
          height: hurdleHeight,
          width: hurdleWidth,
        };

        // 左支架
        const leftLegGeo = new THREE.BoxGeometry(0.03, hurdleHeight, 0.03);
        addBox(root, leftLegGeo, hurdleMat, { x: -hurdleWidth / 2, y: hurdleHeight / 2, z: 0 });

        // 右支架
        const rightLegGeo = new THREE.BoxGeometry(0.03, hurdleHeight, 0.03);
        addBox(root, rightLegGeo, hurdleMat, { x: hurdleWidth / 2, y: hurdleHeight / 2, z: 0 });

        // 横杆
        const barGeo = new THREE.BoxGeometry(hurdleWidth, 0.04, 0.03);
        addBox(root, barGeo, barMat, { x: 0, y: hurdleHeight - 0.02, z: 0 });

        // 底座
        const baseGeo = new THREE.BoxGeometry(0.15, 0.02, 0.4);
        addBox(root, baseGeo, hurdleMat, { x: -hurdleWidth / 2, y: 0.01, z: 0 });
        addBox(root, baseGeo, hurdleMat, { x: hurdleWidth / 2, y: 0.01, z: 0 });

        hurdleGroup.add(root);

        const marker = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), markerMat);
        marker.position.set(laneCenterX, hurdleHeight + 0.16, z);
        marker.userData.hurdle = root.userData.hurdle;
        markerGroup.add(marker);

        this.hurdles.push({
          lane: laneIdx + 1,
          laneIdx,
          hurdleIndex: i + 1,
          x: laneCenterX,
          z,
          height: hurdleHeight,
          width: hurdleWidth,
          group: root,
          knockedDown: false,
          knockStart: null,
          knockDuration: 0.6,
          fallDirection: 1,
          sideTilt: 0,
        });
      }
    }

    this.hurdleGroup = hurdleGroup;
    this.hurdleMarkerGroup = markerGroup;
    this.scene.add(hurdleGroup);
    this.scene.add(markerGroup);
  }

  getHurdleLayout() {
    return this.hurdles.map((h) => ({
      lane: h.lane,
      hurdleIndex: h.hurdleIndex,
      x: h.x,
      z: h.z,
      height: h.height,
      width: h.width,
      knockedDown: h.knockedDown,
    }));
  }

  setHurdleMarkersVisible(visible = true) {
    if (this.hurdleMarkerGroup) {
      this.hurdleMarkerGroup.visible = visible;
    }
  }

  showHurdleMarkers() {
    this.setHurdleMarkersVisible(true);
  }

  hideHurdleMarkers() {
    this.setHurdleMarkersVisible(false);
  }

  _resetHurdles() {
    for (const h of this.hurdles) {
      h.knockedDown = false;
      h.knockStart = null;
      h.group.rotation.set(0, 0, 0);
      h.group.position.copy(h.group.userData.basePosition);
    }
  }

  _findNearestHurdle(options = {}) {
    const char = options.character
      ? this.characters.find((c) => c.name === options.character || c.constructor?.name === options.character)
      : null;
    const x = Number.isFinite(Number(options.x)) ? Number(options.x) : (char?.mesh?.position?.x ?? 0);
    const z = Number.isFinite(Number(options.z)) ? Number(options.z) : (char?.mesh?.position?.z ?? START_Z);
    const lane = Number.isFinite(Number(options.lane)) ? Number(options.lane) : null;
    const hurdleIndex = Number.isFinite(Number(options.hurdleIndex ?? options.hurdle ?? options.index))
      ? Number(options.hurdleIndex ?? options.hurdle ?? options.index)
      : null;

    let candidates = this.hurdles;
    if (lane !== null) {
      candidates = candidates.filter((h) => h.lane === lane || h.laneIdx === lane);
    }
    if (hurdleIndex !== null) {
      candidates = candidates.filter((h) => h.hurdleIndex === hurdleIndex);
    }
    if (!candidates.length) return null;

    return candidates.reduce((best, h) => {
      const score = Math.abs(h.z - z) + Math.abs(h.x - x) * 1.8;
      if (!best || score < best.score) return { hurdle: h, score };
      return best;
    }, null)?.hurdle || null;
  }

  knockHurdle(options = {}, time = this._currentTime) {
    const hurdle = this._findNearestHurdle(options);
    if (!hurdle) return null;

    const directionValue = String(options.direction || 'forward').toLowerCase();
    const fallDirection = directionValue === 'back' || directionValue === 'backward' || directionValue === '-1'
      ? -1
      : 1;
    const duration = Number(options.duration);

    hurdle.knockedDown = true;
    hurdle.knockStart = Number.isFinite(Number(options.startTime)) ? Number(options.startTime) : time;
    hurdle.knockDuration = Number.isFinite(duration) && duration > 0 ? duration : 0.6;
    hurdle.fallDirection = fallDirection;
    hurdle.sideTilt = ((hurdle.lane % 2 === 0) ? -1 : 1) * 0.28;
    return hurdle;
  }

  knockDownHurdle(options = {}, time = this._currentTime) {
    return this.knockHurdle(options, time);
  }

  _animateHurdles(time) {
    for (const h of this.hurdles) {
      if (!h.knockedDown || h.knockStart === null) continue;
      const p = Math.min(1, Math.max(0, (time - h.knockStart) / h.knockDuration));
      const ease = 1 - Math.pow(1 - p, 3);
      const base = h.group.userData.basePosition;
      h.group.rotation.x = h.fallDirection * Math.PI * 0.5 * ease;
      h.group.rotation.z = h.sideTilt * ease;
      h.group.position.set(
        base.x,
        base.y + Math.sin(p * Math.PI) * 0.055,
        base.z + h.fallDirection * 0.38 * ease
      );
    }
  }

  _updateHurdleCollisions(time) {
    if (this._lastCollisionTime !== null && time < this._lastCollisionTime - 0.001) {
      this._previousCharacterPositions.clear();
      this._resetHurdles();
    }
    this._lastCollisionTime = time;

    for (const char of this.characters) {
      if (!char?.mesh?.position) continue;
      const name = char.name || char.constructor?.name || '';
      const pos = char.mesh.position;
      const previous = this._previousCharacterPositions.get(name);

      const continuousStep = previous && time > previous.time && time - previous.time <= 0.12;
      if (continuousStep && Math.abs(pos.z - previous.z) > 0.01) {
        const lowZ = Math.min(previous.z, pos.z);
        const highZ = Math.max(previous.z, pos.z);
        for (const h of this.hurdles) {
          if (h.knockedDown) continue;
          if (h.z < lowZ || h.z > highZ) continue;
          const approxX = (previous.x + pos.x) * 0.5;
          if (Math.abs(approxX - h.x) > h.width * 0.62) continue;
          if (name === 'DiscoWorm') continue;

          const ratio = (h.z - previous.z) / (pos.z - previous.z);
          const approxY = previous.y + (pos.y - previous.y) * ratio;
          if (approxY < h.height + 0.05) {
            this.knockHurdle({
              x: h.x,
              z: h.z,
              lane: h.lane,
              hurdleIndex: h.hurdleIndex,
              direction: pos.z >= previous.z ? 'forward' : 'back',
              duration: 0.55,
            }, time);
          }
        }
      }

      this._previousCharacterPositions.set(name, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        time,
      });
    }
  }

  _buildField() {
    // 跑道两侧草坪缓冲区
    const fieldMat = new THREE.MeshStandardMaterial({
      color: 0x2f7d3a,
      roughness: 0.92,
      metalness: 0.0,
    });
    for (const side of [-1, 1]) {
      const grass = new THREE.Mesh(new THREE.PlaneGeometry(28, TRACK_LENGTH), fieldMat);
      grass.rotation.x = -Math.PI / 2;
      grass.position.set(side * (TRACK_WIDTH / 2 + 15), 0.006, TRACK_CENTER_Z);
      grass.receiveShadow = true;
      this.scene.add(grass);

      for (let i = 0; i < 8; i++) {
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(28, 0.08),
          new THREE.MeshBasicMaterial({ color: 0x55a860, opacity: 0.35, transparent: true })
        );
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(side * (TRACK_WIDTH / 2 + 15), 0.009, -56 + i * 16);
        this.scene.add(stripe);
      }
    }
  }

  _buildStands() {
    const standGroup = new THREE.Group();

    const standMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.8 });
    const seatColors = [0xe53e3e, 0x3182ce, 0x38a169, 0xd69e2e, 0x805ad5, 0xdd6b20];

    // 左右两侧看台：沿跑道方向展开
    for (const side of [-1, 1]) {
      for (let tier = 0; tier < 8; tier++) {
        const tierLength = 136;
        const tierDepth = 2.0;
        const tierHeight = 0.6;
        const y = tier * tierHeight + 0.3;
        const xOffset = side * (TRACK_WIDTH / 2 + 22 + tier * tierDepth);

        const tierGeo = new THREE.BoxGeometry(tierDepth, tierHeight, tierLength);
        const tierMesh = new THREE.Mesh(tierGeo, standMat);
        tierMesh.position.set(xOffset, y, TRACK_CENTER_Z);
        tierMesh.castShadow = true;
        tierMesh.receiveShadow = true;
        standGroup.add(tierMesh);

        // 座椅
        const seatCount = 110;
        for (let s = 0; s < seatCount; s++) {
          if (Math.random() < 0.64) {
            const seatGeo = new THREE.BoxGeometry(0.35, 0.06, 0.35);
            const seatMat = new THREE.MeshStandardMaterial({
              color: seatColors[Math.floor(Math.random() * seatColors.length)],
              roughness: 0.7,
            });
            const seat = new THREE.Mesh(seatGeo, seatMat);
            seat.position.set(
              xOffset - side * 0.38,
              y + tierHeight / 2 + 0.03,
              TRACK_CENTER_Z - tierLength / 2 + s * (tierLength / seatCount)
            );
            standGroup.add(seat);

            // 观众（彩色小球）
            if (Math.random() < 0.5) {
              const bodyGeo = new THREE.SphereGeometry(0.12, 8, 8);
              const bodyMat = new THREE.MeshStandardMaterial({
                color: seatColors[Math.floor(Math.random() * seatColors.length)],
              });
              const body = new THREE.Mesh(bodyGeo, bodyMat);
              body.position.set(
                xOffset - side * 0.42,
                y + tierHeight / 2 + 0.2,
                TRACK_CENTER_Z - tierLength / 2 + s * (tierLength / seatCount)
              );
              standGroup.add(body);
            }
          }
        }
      }
    }

    // 起点和终点两端短看台
    for (const end of [-1, 1]) {
      for (let tier = 0; tier < 5; tier++) {
        const tierWidth = TRACK_WIDTH + 34;
        const tierDepth = 1.5;
        const tierHeight = 0.5;
        const y = tier * tierHeight + 0.3;
        const zOffset = (end < 0 ? START_Z - 15 : FINISH_Z + 15) + end * tier * tierDepth;

        const tierGeo = new THREE.BoxGeometry(tierWidth, tierHeight, tierDepth);
        const tierMesh = new THREE.Mesh(tierGeo, standMat);
        tierMesh.position.set(0, y, zOffset);
        tierMesh.castShadow = true;
        standGroup.add(tierMesh);
      }
    }

    this.scene.add(standGroup);
  }

  _buildScoreboard() {
    const scoreGroup = new THREE.Group();

    // 记分牌立柱
    const poleGeo = new THREE.CylinderGeometry(0.3, 0.4, 8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.3, roughness: 0.6 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(-35, 4, -40);
    pole.castShadow = true;
    scoreGroup.add(pole);

    // 记分牌屏幕
    const screenGeo = new THREE.BoxGeometry(8, 4, 0.3);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.2, roughness: 0.5 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-35, 8.5, -40);
    screen.castShadow = true;
    scoreGroup.add(screen);

    // 屏幕发光面
    const displayGeo = new THREE.PlaneGeometry(7.5, 3.5);
    const displayTex = makeTextTexture('110M HURDLES', {
      width: 512,
      height: 192,
      font: 'bold 42px Arial',
      color: '#7cff8a',
      background: '#08140a',
    });
    const displayMat = new THREE.MeshBasicMaterial({ map: displayTex });
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(-35, 8.5, -39.84);
    display.rotation.y = Math.PI;
    scoreGroup.add(display);

    // 顶部装饰灯
    for (const side of [-1, 1]) {
      const lightGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.position.set(-35 + side * 3.5, 10.8, -40);
      scoreGroup.add(light);
    }

    this.scene.add(scoreGroup);
  }

  _buildDome() {
    // 体育场穹顶 — 半透明网格结构
    const domeGroup = new THREE.Group();

    // 主穹顶半球
    const domeRadius = 70;
    const domeGeo = new THREE.SphereGeometry(domeRadius, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0;
    domeGroup.add(dome);

    // 穹顶钢架结构 — 经线
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.6,
    });
    const frameCount = 24;
    for (let i = 0; i < frameCount; i++) {
      const angle = (i / frameCount) * Math.PI * 2;
      const frameGeo = new THREE.TorusGeometry(domeRadius, 0.15, 8, 64, Math.PI * 0.45);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.rotation.y = angle;
      frame.position.y = 0;
      domeGroup.add(frame);
    }

    // 穹顶钢架结构 — 纬线
    const ringCount = 6;
    for (let i = 1; i <= ringCount; i++) {
      const phi = (i / (ringCount + 1)) * Math.PI * 0.45;
      const ringRadius = domeRadius * Math.sin(phi);
      const ringY = domeRadius * Math.cos(phi);
      const ringGeo = new THREE.TorusGeometry(ringRadius, 0.12, 8, 64);
      const ring = new THREE.Mesh(ringGeo, frameMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = ringY;
      domeGroup.add(ring);
    }

    // 支撑柱（连接穹顶和看台）
    const pillarCount = 12;
    for (let i = 0; i < pillarCount; i++) {
      const angle = ((i + 0.5) / pillarCount) * Math.PI * 2;
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.4, domeRadius * 0.55, 8);
      const pillar = new THREE.Mesh(pillarGeo, frameMat);
      const px = Math.cos(angle) * domeRadius * 0.85;
      const pz = Math.sin(angle) * domeRadius * 0.85;
      pillar.position.set(px, domeRadius * 0.25, pz);
      pillar.castShadow = true;
      domeGroup.add(pillar);
    }

    // 顶部采光窗
    const skylightGeo = new THREE.CircleGeometry(8, 32);
    const skylightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const skylight = new THREE.Mesh(skylightGeo, skylightMat);
    skylight.rotation.x = -Math.PI / 2;
    skylight.position.y = domeRadius * Math.cos(Math.PI * 0.45) + 0.1;
    domeGroup.add(skylight);

    this.scene.add(domeGroup);
  }

  _buildStadiumLights() {
    // 环境光
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // 主阳光
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(50, 80, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    this.scene.add(sunLight);

    // 体育场四角大灯
    const lightPositions = [
      { x: 40, z: 40 },
      { x: -40, z: 40 },
      { x: 40, z: -40 },
      { x: -40, z: -40 },
    ];

    for (const pos of lightPositions) {
      // 灯柱
      const poleGeo = new THREE.CylinderGeometry(0.2, 0.3, 20, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.4 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pos.x, 10, pos.z);
      pole.castShadow = true;
      this.scene.add(pole);

      // 灯架
      const armGeo = new THREE.BoxGeometry(6, 0.3, 0.3);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(pos.x > 0 ? pos.x - 3 : pos.x + 3, 20, pos.z);
      this.scene.add(arm);

      // 聚光灯
      const spotLight = new THREE.SpotLight(0xffffff, 0.8);
      spotLight.position.set(pos.x > 0 ? pos.x - 3 : pos.x + 3, 20, pos.z);
      spotLight.target.position.set(0, 0, 0);
      spotLight.angle = Math.PI / 5;
      spotLight.penumbra = 0.3;
      spotLight.decay = 1;
      spotLight.distance = 100;
      spotLight.castShadow = true;
      this.scene.add(spotLight);
      this.scene.add(spotLight.target);

      // 灯泡发光效果
      for (let i = 0; i < 3; i++) {
        const bulbGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(
          pos.x > 0 ? pos.x - 2 - i * 1.5 : pos.x + 2 + i * 1.5,
          19.8,
          pos.z
        );
        this.scene.add(bulb);
      }
    }
  }

  update(time, delta) {
    this._currentTime = time;
    super.update(time, delta);
    this._updateHurdleCollisions(time);
    this._animateHurdles(time);
    this._updateFlashbulbs(time, delta);
    this._animateSpectators(time, delta);
    this._animateBanners(time);
    this._animateBalloons(time, delta);
    this._animateConfetti(time, delta);
  }

  _buildAnimatedSpectators() {
    const spectatorGroup = new THREE.Group();
    this.spectatorGroup = spectatorGroup;

    // Alien type definitions - simplified geometries for background crowd
    const alienTypes = [
      // Type 0: Green 3-eyed alien (Reporter-like)
      {
        name: 'green',
        build: (color) => {
          const g = new THREE.Group();
          // Round body
          const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.11, 8, 8),
            new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
          );
          body.scale.set(1, 1.15, 0.9);
          body.position.y = 0.18;
          body.castShadow = true;
          g.add(body);
          // Head
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
          );
          head.position.y = 0.38;
          g.add(head);
          // Three eyes
          const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
          for (const ep of [{x:-0.04,y:0.02,z:0.08}, {x:0.04,y:0.02,z:0.08}, {x:0,y:0.07,z:0.06}]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
            eye.position.set(ep.x, ep.y + 0.38, ep.z);
            g.add(eye);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), pupilMat);
            pupil.position.set(ep.x, ep.y + 0.38, ep.z + 0.015);
            g.add(pupil);
          }
          // Antennae
          for (const side of [-1, 1]) {
            const stem = new THREE.Mesh(
              new THREE.CylinderGeometry(0.005, 0.005, 0.08, 4),
              new THREE.MeshStandardMaterial({ color: 0x558b2f })
            );
            stem.position.set(side * 0.06, 0.46, 0);
            stem.rotation.z = side * 0.3;
            g.add(stem);
            const ball = new THREE.Mesh(
              new THREE.SphereGeometry(0.015, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0xff3333 })
            );
            ball.position.set(side * 0.07, 0.5, 0);
            g.add(ball);
          }
          // Arms
          const armGeo = new THREE.CapsuleGeometry(0.025, 0.14, 4, 6);
          const armMat = new THREE.MeshStandardMaterial({ color });
          const leftArm = new THREE.Mesh(armGeo, armMat);
          leftArm.position.set(-0.13, 0.22, 0);
          leftArm.rotation.z = 0.5;
          g.add(leftArm);
          const rightArm = new THREE.Mesh(armGeo, armMat);
          rightArm.position.set(0.13, 0.22, 0);
          rightArm.rotation.z = -0.5;
          g.add(rightArm);
          return { group: g, head, leftArm, rightArm, body };
        },
      },
      // Type 1: Reptile alien (Klaw-like)
      {
        name: 'reptile',
        build: (color) => {
          const g = new THREE.Group();
          // Scaled body
          const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.09, 0.22, 4, 8),
            new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
          );
          body.position.y = 0.2;
          body.castShadow = true;
          g.add(body);
          // Spikes on back
          for (let i = 0; i < 3; i++) {
            const spike = new THREE.Mesh(
              new THREE.ConeGeometry(0.015, 0.06, 4),
              new THREE.MeshStandardMaterial({ color: 0x8a3a2a })
            );
            spike.position.set(0, 0.28 + i * 0.04, -0.08);
            spike.rotation.x = -0.5;
            g.add(spike);
          }
          // Head - elongated
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 8, 8),
            new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
          );
          head.scale.set(0.85, 0.85, 1.2);
          head.position.y = 0.38;
          g.add(head);
          // Snout
          const snout = new THREE.Mesh(
            new THREE.ConeGeometry(0.04, 0.08, 6),
            new THREE.MeshStandardMaterial({ color })
          );
          snout.position.set(0, 0.32, 0.1);
          snout.rotation.x = -Math.PI / 2;
          g.add(snout);
          // Red eyes
          for (const side of [-1, 1]) {
            const eye = new THREE.Mesh(
              new THREE.SphereGeometry(0.02, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0xcc2222 })
            );
            eye.position.set(side * 0.04, 0.38, 0.08);
            g.add(eye);
          }
          // Tail
          const tail = new THREE.Mesh(
            new THREE.ConeGeometry(0.03, 0.15, 6),
            new THREE.MeshStandardMaterial({ color })
          );
          tail.position.set(0, 0.08, -0.12);
          tail.rotation.x = 0.6;
          g.add(tail);
          // Arms with claws
          const armGeo = new THREE.CapsuleGeometry(0.022, 0.13, 4, 6);
          const armMat = new THREE.MeshStandardMaterial({ color });
          const leftArm = new THREE.Mesh(armGeo, armMat);
          leftArm.position.set(-0.12, 0.22, 0);
          leftArm.rotation.z = 0.5;
          g.add(leftArm);
          const rightArm = new THREE.Mesh(armGeo, armMat);
          rightArm.position.set(0.12, 0.22, 0);
          rightArm.rotation.z = -0.5;
          g.add(rightArm);
          return { group: g, head, leftArm, rightArm, body };
        },
      },
      // Type 2: Insect alien (Vex-like)
      {
        name: 'insect',
        build: (color) => {
          const g = new THREE.Group();
          // Segmented body
          const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.06, 0.25, 6),
            new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
          );
          body.position.y = 0.2;
          body.castShadow = true;
          g.add(body);
          // Segment rings
          for (let i = 0; i < 2; i++) {
            const ring = new THREE.Mesh(
              new THREE.TorusGeometry(0.072, 0.005, 4, 8),
              new THREE.MeshStandardMaterial({ color: 0x0f1f3f })
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.set(0, 0.14 + i * 0.08, 0);
            g.add(ring);
          }
          // Triangular head
          const head = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.12, 6),
            new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
          );
          head.position.set(0, 0.36, 0.02);
          head.rotation.x = -0.3;
          g.add(head);
          // Compound eyes
          for (const side of [-1, 1]) {
            const eye = new THREE.Mesh(
              new THREE.SphereGeometry(0.025, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0x66ffcc })
            );
            eye.position.set(side * 0.05, 0.36, 0.04);
            g.add(eye);
          }
          // Antennae
          for (const side of [-1, 1]) {
            const ant = new THREE.Mesh(
              new THREE.CylinderGeometry(0.003, 0.003, 0.1, 4),
              new THREE.MeshStandardMaterial({ color: 0x2a5a9a })
            );
            ant.position.set(side * 0.04, 0.44, 0);
            ant.rotation.z = side * 0.4;
            g.add(ant);
            const tip = new THREE.Mesh(
              new THREE.SphereGeometry(0.01, 4, 4),
              new THREE.MeshBasicMaterial({ color: 0x44ffaa })
            );
            tip.position.set(side * 0.06, 0.49, 0);
            g.add(tip);
          }
          // Wings (small, folded)
          for (const side of [-1, 1]) {
            const wing = new THREE.Mesh(
              new THREE.PlaneGeometry(0.08, 0.12),
              new THREE.MeshBasicMaterial({
                color: 0x88ccff, transparent: true, opacity: 0.3, side: THREE.DoubleSide
              })
            );
            wing.position.set(side * 0.08, 0.28, -0.04);
            wing.rotation.y = side * 0.5;
            g.add(wing);
          }
          // Arms
          const armGeo = new THREE.CapsuleGeometry(0.018, 0.12, 4, 6);
          const armMat = new THREE.MeshStandardMaterial({ color });
          const leftArm = new THREE.Mesh(armGeo, armMat);
          leftArm.position.set(-0.1, 0.22, 0);
          leftArm.rotation.z = 0.5;
          g.add(leftArm);
          const rightArm = new THREE.Mesh(armGeo, armMat);
          rightArm.position.set(0.1, 0.22, 0);
          rightArm.rotation.z = -0.5;
          g.add(rightArm);
          return { group: g, head, leftArm, rightArm, body };
        },
      },
      // Type 3: Crystal alien (Rex-like)
      {
        name: 'crystal',
        build: (color) => {
          const g = new THREE.Group();
          // Crystal body - octahedron
          const body = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.11, 0),
            new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 })
          );
          body.scale.set(1, 1.3, 0.8);
          body.position.y = 0.2;
          body.castShadow = true;
          g.add(body);
          // Crystal head
          const head = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.09, 0),
            new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 })
          );
          head.scale.set(0.9, 1.2, 0.85);
          head.position.y = 0.38;
          g.add(head);
          // Glowing eye cores
          for (const side of [-1, 1]) {
            const eye = new THREE.Mesh(
              new THREE.SphereGeometry(0.018, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.7 })
            );
            eye.position.set(side * 0.035, 0.38, 0.07);
            eye.scale.set(1.5, 0.4, 0.3);
            g.add(eye);
          }
          // Crystal facets
          for (let i = 0; i < 3; i++) {
            const facet = new THREE.Mesh(
              new THREE.OctahedronGeometry(0.03, 0),
              new THREE.MeshStandardMaterial({ color: 0xf0a860, roughness: 0.2 })
            );
            facet.position.set(
              (Math.random() - 0.5) * 0.1,
              0.15 + Math.random() * 0.15,
              0.06 + Math.random() * 0.04
            );
            g.add(facet);
          }
          // Chest glow
          const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.5 })
          );
          glow.position.set(0, 0.24, 0.08);
          g.add(glow);
          // Arms
          const armGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.14, 6);
          const armMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
          const leftArm = new THREE.Mesh(armGeo, armMat);
          leftArm.position.set(-0.13, 0.22, 0);
          leftArm.rotation.z = 0.5;
          g.add(leftArm);
          const rightArm = new THREE.Mesh(armGeo, armMat);
          rightArm.position.set(0.13, 0.22, 0);
          rightArm.rotation.z = -0.5;
          g.add(rightArm);
          return { group: g, head, leftArm, rightArm, body };
        },
      },
      // Type 4: Worm alien (DiscoWorm-like)
      {
        name: 'worm',
        build: (color) => {
          const g = new THREE.Group();
          // Segmented body - 3 segments
          const segColors = [color, color, color];
          for (let i = 0; i < 3; i++) {
            const seg = new THREE.Mesh(
              new THREE.SphereGeometry(0.08 - i * 0.01, 8, 8),
              new THREE.MeshStandardMaterial({ color: segColors[i], roughness: 0.7 })
            );
            seg.scale.set(1.1, 0.7, 1);
            seg.position.set(0, 0.1 + i * 0.1, 0);
            seg.castShadow = true;
            g.add(seg);
          }
          // Head segment (top)
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 8, 8),
            new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
          );
          head.scale.set(1.1, 0.85, 1.1);
          head.position.y = 0.38;
          g.add(head);
          // Big eyes
          for (const side of [-1, 1]) {
            const eyeWhite = new THREE.Mesh(
              new THREE.SphereGeometry(0.03, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            eyeWhite.position.set(side * 0.04, 0.4, 0.06);
            g.add(eyeWhite);
            const pupil = new THREE.Mesh(
              new THREE.SphereGeometry(0.015, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0x000000 })
            );
            pupil.position.set(side * 0.04, 0.4, 0.075);
            g.add(pupil);
          }
          // Antennae
          for (const side of [-1, 1]) {
            const ant = new THREE.Mesh(
              new THREE.CapsuleGeometry(0.008, 0.06, 4, 6),
              new THREE.MeshStandardMaterial({ color: 0xadff2f })
            );
            ant.position.set(side * 0.03, 0.45, 0);
            ant.rotation.z = side * 0.3;
            g.add(ant);
          }
          // Tiny arms
          const armGeo = new THREE.CapsuleGeometry(0.015, 0.08, 4, 6);
          const armMat = new THREE.MeshStandardMaterial({ color });
          const leftArm = new THREE.Mesh(armGeo, armMat);
          leftArm.position.set(-0.1, 0.28, 0);
          leftArm.rotation.z = 0.6;
          g.add(leftArm);
          const rightArm = new THREE.Mesh(armGeo, armMat);
          rightArm.position.set(0.1, 0.28, 0);
          rightArm.rotation.z = -0.6;
          g.add(rightArm);
          return { group: g, head, leftArm, rightArm, body: head };
        },
      },
      // Type 5: Blob alien - amorphous with tentacles
      {
        name: 'blob',
        build: (color) => {
          const g = new THREE.Group();
          // Blob body
          const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
          );
          body.scale.set(1.1, 0.9, 1);
          body.position.y = 0.18;
          body.castShadow = true;
          g.add(body);
          // Wobble bumps
          for (let i = 0; i < 4; i++) {
            const bump = new THREE.Mesh(
              new THREE.SphereGeometry(0.04, 6, 6),
              new THREE.MeshStandardMaterial({ color })
            );
            const angle = (i / 4) * Math.PI * 2;
            bump.position.set(Math.cos(angle) * 0.08, 0.2 + Math.sin(i) * 0.03, Math.sin(angle) * 0.06);
            g.add(bump);
          }
          // Head blob
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 8, 8),
            new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
          );
          head.position.y = 0.36;
          g.add(head);
          // Single big eye
          const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          eye.position.set(0, 0.37, 0.06);
          g.add(eye);
          const pupil = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
          );
          pupil.position.set(0, 0.37, 0.08);
          g.add(pupil);
          // Tentacle arms
          const armGeo = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -0.05, 0.02),
            new THREE.Vector3(0, -0.08, 0.05),
          ]);
          const armTube = new THREE.TubeGeometry(armGeo, 4, 0.012, 4, false);
          const armMat = new THREE.MeshStandardMaterial({ color });
          const leftArm = new THREE.Mesh(armTube, armMat);
          leftArm.position.set(-0.12, 0.22, 0);
          leftArm.rotation.z = 0.4;
          g.add(leftArm);
          const rightArm = new THREE.Mesh(armTube, armMat);
          rightArm.position.set(0.12, 0.22, 0);
          rightArm.rotation.z = -0.4;
          g.add(rightArm);
          return { group: g, head, leftArm, rightArm, body };
        },
      },
    ];

    // Color palettes for each alien type
    const typeColors = [
      [0x7cb342, 0x558b2f, 0x9ccc65, 0x33691e], // green
      [0x2a8a6a, 0x1a5a4a, 0x3aaa8a, 0x4aaa7a], // reptile
      [0x1a3a6a, 0x2a5a9a, 0x0f1f3f, 0x3a6aaa], // insect
      [0xd4883a, 0xa06020, 0xf0a860, 0xb07030], // crystal
      [0x9acd32, 0x6b8e23, 0xcddc39, 0x7cb342], // worm
      [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xff9f43, 0x5f27cd, 0xff9ff3], // blob
    ];

    // Build spectators for left and right stands
    for (const side of [-1, 1]) {
      for (let tier = 0; tier < 6; tier++) {
        const tierLength = 130;
        const tierDepth = 2.0;
        const tierHeight = 0.6;
        const y = tier * tierHeight + 0.8;
        const xOffset = side * (TRACK_WIDTH / 2 + 20 + tier * tierDepth);

        const count = 25 + tier * 8;
        for (let s = 0; s < count; s++) {
          if (Math.random() < 0.75) {
            const z = TRACK_CENTER_Z - tierLength / 2 + s * (tierLength / count);
            
            // Pick random alien type
            const typeIdx = Math.floor(Math.random() * alienTypes.length);
            const color = typeColors[typeIdx][Math.floor(Math.random() * typeColors[typeIdx].length)];
            
            const alien = alienTypes[typeIdx].build(color);
            alien.group.position.set(xOffset - side * 0.5, y + tierHeight / 2 + 0.1, z);
            
            // Random facing variation
            alien.group.rotation.y = (Math.random() - 0.5) * 0.3;
            
            spectatorGroup.add(alien.group);

            this.spectators.push({
              group: alien.group,
              head: alien.head,
              leftArm: alien.leftArm,
              rightArm: alien.rightArm,
              body: alien.body,
              baseY: alien.group.position.y,
              phase: Math.random() * Math.PI * 2,
              speed: 1.5 + Math.random() * 3,
              cheerIntensity: 0.3 + Math.random() * 0.7,
              side,
              alienType: typeIdx,
            });
          }
        }
      }
    }

    // End stands spectators (start and finish)
    for (const end of [-1, 1]) {
      for (let tier = 0; tier < 4; tier++) {
        const tierWidth = TRACK_WIDTH + 30;
        const tierDepth = 1.5;
        const tierHeight = 0.5;
        const y = tier * tierHeight + 0.8;
        const zOffset = (end < 0 ? START_Z - 12 : FINISH_Z + 12) + end * tier * tierDepth;

        const count = 20 + tier * 5;
        for (let s = 0; s < count; s++) {
          if (Math.random() < 0.7) {
            const x = -tierWidth / 2 + s * (tierWidth / count);
            
            const typeIdx = Math.floor(Math.random() * alienTypes.length);
            const color = typeColors[typeIdx][Math.floor(Math.random() * typeColors[typeIdx].length)];
            
            const alien = alienTypes[typeIdx].build(color);
            alien.group.position.set(x, y + tierHeight / 2 + 0.1, zOffset);
            alien.group.rotation.y = (Math.random() - 0.5) * 0.3;
            
            spectatorGroup.add(alien.group);

            this.spectators.push({
              group: alien.group,
              head: alien.head,
              leftArm: alien.leftArm,
              rightArm: alien.rightArm,
              body: alien.body,
              baseY: alien.group.position.y,
              phase: Math.random() * Math.PI * 2,
              speed: 1.5 + Math.random() * 3,
              cheerIntensity: 0.3 + Math.random() * 0.7,
              side: end,
              alienType: typeIdx,
            });
          }
        }
      }
    }

    this.scene.add(spectatorGroup);
  }
  _buildBanners() {
    const bannerGroup = new THREE.Group();
    const bannerTexts = ['GO GO GO!', 'HURDLES 2026', 'STAR RACE', 'WINNER!', 'LET\'S GO!'];
    const bannerColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

    // Side banners
    for (let i = 0; i < 8; i++) {
      const z = -40 + i * 22;
      for (const side of [-1, 1]) {
        const tex = makeTextTexture(bannerTexts[i % bannerTexts.length], {
          width: 512,
          height: 128,
          font: 'bold 48px Arial',
          color: '#ffffff',
          background: bannerColors[i % bannerColors.length],
        });
        const banner = new THREE.Mesh(
          new THREE.PlaneGeometry(6, 1.2),
          new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        );
        banner.position.set(side * (TRACK_WIDTH / 2 + 16), 5 + Math.sin(i) * 1.5, z);
        banner.rotation.y = side > 0 ? -Math.PI / 6 : Math.PI / 6;
        bannerGroup.add(banner);
        this.bannerWaves.push({ mesh: banner, baseY: banner.position.y, phase: i * 0.8, speed: 1.2 });
      }
    }

    // Finish line arch decoration
    const archTex = makeTextTexture('🏆 CHAMPIONSHIP 🏆', {
      width: 1024,
      height: 160,
      font: 'bold 64px Arial',
      color: '#ffd700',
      background: '#8b0000',
    });
    const archBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 2),
      new THREE.MeshBasicMaterial({ map: archTex, side: THREE.DoubleSide })
    );
    archBanner.position.set(0, 5.5, FINISH_Z);
    bannerGroup.add(archBanner);
    this.bannerWaves.push({ mesh: archBanner, baseY: 5.5, phase: 0, speed: 0.8 });

    this.scene.add(bannerGroup);
  }

  _buildBalloons() {
    const balloonColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xff9f43, 0x5f27cd, 0xff9ff3];
    for (let i = 0; i < 20; i++) {
      const group = new THREE.Group();
      const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];

      // Balloon
      const balloonGeo = new THREE.SphereGeometry(0.35 + Math.random() * 0.2, 16, 16);
      const balloonMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
      });
      const balloon = new THREE.Mesh(balloonGeo, balloonMat);
      group.add(balloon);

      // String
      const stringGeo = new THREE.CylinderGeometry(0.005, 0.005, 3 + Math.random() * 2, 4);
      const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const string = new THREE.Mesh(stringGeo, stringMat);
      string.position.y = -2;
      group.add(string);

      const x = (Math.random() - 0.5) * 60;
      const z = -30 + Math.random() * 80;
      const y = 8 + Math.random() * 10;
      group.position.set(x, y, z);
      this.scene.add(group);

      this.balloons.push({
        group,
        baseY: y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        driftX: (Math.random() - 0.5) * 0.3,
        driftZ: (Math.random() - 0.5) * 0.3,
      });
    }
  }

  _buildConfetti() {
    const confettiColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500];
    for (let i = 0; i < 150; i++) {
      const geo = new THREE.PlaneGeometry(0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const x = (Math.random() - 0.5) * 50;
      const z = -20 + Math.random() * 60;
      const y = 5 + Math.random() * 15;
      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(mesh);

      this.confetti.push({
        mesh,
        baseY: y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        rotSpeed: {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3,
          z: (Math.random() - 0.5) * 3,
        },
        driftX: (Math.random() - 0.5) * 0.5,
        driftZ: (Math.random() - 0.5) * 0.5,
      });
    }
  }

  _animateSpectators(time, delta) {
    for (const s of this.spectators) {
      // Jump up and down cheering
      const jump = Math.sin(time * s.speed + s.phase) * 0.08 * s.cheerIntensity;
      s.group.position.y = s.baseY + Math.max(0, jump);

      // Arms wave
      s.leftArm.rotation.z = 0.4 + Math.sin(time * s.speed * 1.3 + s.phase) * 0.6 * s.cheerIntensity;
      s.rightArm.rotation.z = -0.4 - Math.sin(time * s.speed * 1.3 + s.phase + 0.5) * 0.6 * s.cheerIntensity;

      // Head bob
      s.head.rotation.x = Math.sin(time * s.speed * 0.7 + s.phase) * 0.15 * s.cheerIntensity;
      s.head.rotation.y = Math.sin(time * s.speed * 0.5 + s.phase + 1) * 0.1 * s.cheerIntensity;

      // Type-specific animations
      if (s.alienType === 1) { // reptile - tail wag
        if (s.body) {
          s.body.rotation.z = Math.sin(time * s.speed * 0.8 + s.phase) * 0.1 * s.cheerIntensity;
        }
      } else if (s.alienType === 2) { // insect - wing flutter
        // Wings are children 5 and 6 (after body, rings, head, eyes, antennae)
        const wings = s.group.children.filter(c => c.material && c.material.transparent && c.material.opacity < 0.5);
        for (const wing of wings) {
          wing.rotation.y = (wing.position.x > 0 ? 1 : -1) * (0.5 + Math.sin(time * 15 + s.phase) * 0.3 * s.cheerIntensity);
        }
      } else if (s.alienType === 3) { // crystal - glow pulse
        const glowChildren = s.group.children.filter(c => c.material && c.material.emissive);
        for (const glow of glowChildren) {
          if (glow.material.opacity !== undefined) {
            glow.material.opacity = 0.3 + Math.sin(time * 3 + s.phase) * 0.2 * s.cheerIntensity;
          }
        }
      } else if (s.alienType === 4) { // worm - body wiggle
        s.group.rotation.z = Math.sin(time * s.speed * 0.6 + s.phase) * 0.05 * s.cheerIntensity;
      } else if (s.alienType === 5) { // blob - wobble scale
        const wobble = 1 + Math.sin(time * s.speed * 1.5 + s.phase) * 0.03 * s.cheerIntensity;
        s.body.scale.set(1.1 * wobble, 0.9 / wobble, 1 * wobble);
      }
    }
  }
  _animateBanners(time) {
    for (const b of this.bannerWaves) {
      b.mesh.position.y = b.baseY + Math.sin(time * b.speed + b.phase) * 0.3;
      b.mesh.rotation.z = Math.sin(time * b.speed * 0.7 + b.phase) * 0.05;
    }
  }

  _animateBalloons(time, delta) {
    for (const b of this.balloons) {
      b.group.position.y = b.baseY + Math.sin(time * b.speed + b.phase) * 0.8;
      b.group.position.x += Math.sin(time * 0.2 + b.phase) * 0.01;
      b.group.rotation.y += delta * 0.1;
    }
  }

  _animateConfetti(time, delta) {
    for (const c of this.confetti) {
      c.mesh.position.y = c.baseY + Math.sin(time * c.speed + c.phase) * 2;
      c.mesh.position.x += Math.sin(time * 0.3 + c.phase) * 0.02;
      c.mesh.rotation.x += c.rotSpeed.x * delta;
      c.mesh.rotation.y += c.rotSpeed.y * delta;
      c.mesh.rotation.z += c.rotSpeed.z * delta;
    }
  }

  _updateFlashbulbs(time, delta) {
    // 观众闪光灯效果
    if (Math.random() < 0.15) {
      const tiers = [
        { radius: 25, height: 2, yOffset: 1 },
        { radius: 30, height: 3, yOffset: 3 },
        { radius: 35, height: 3.5, yOffset: 5 },
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
}
