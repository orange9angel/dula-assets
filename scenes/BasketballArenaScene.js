import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { SceneBase } from 'dula-engine';

/**
 * BasketballArenaScene — NBA 篮球场场景
 *
 * 包含：
 * - 篮球场地板（枫木色 + 白色标线 + 蓝色油漆区）
 * - 南北两个篮筐（篮板 + 篮架 + 篮网）
 * - 3 层环形看台（观众席）
 * - 中央穹顶显示器（Jumbotron）
 * - 观众（彩色小人）
 * - 灯光系统
 */
export class BasketballArenaScene extends SceneBase {
  constructor() {
    super('BasketballArenaScene');
    this.flashbulbs = [];
    this.flashbulbTimers = [];
    this.basketballTrajectory = null;
    this.dunkWindow = null;
    this.rimBend = { north: 0, south: 0 };
    this.readyPromise = null;
  }

  build() {
    super.build();

    // Dark arena background
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.Fog(0x0a0a1a, 30, 80);

    // ---- Court Floor ----
    this._buildCourtFloor();

    // ---- Hoops (north & south) ----
    this._buildHoop('north', 0, 0, -14);
    this._buildHoop('south', 0, 0, 14);

    // ---- 3-Tier Stands ----
    this._buildStands();

    // ---- Jumbotron (center ceiling) ----
    this._buildJumbotron();

    // ---- Arena Lights ----
    this._buildArenaLights();

    // ---- Sports Car under north hoop ----
    this.readyPromise = this._loadSportsCar();

    return this.scene;
  }

  _buildCourtFloor() {
    const courtGroup = new THREE.Group();

    // Main floor — maple wood color
    const floorGeo = new THREE.PlaneGeometry(28, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xc4956a,
      roughness: 0.35,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    courtGroup.add(floor);

    // ---- Court dimensions (NBA regulation scaled) ----
    const courtLength = 28;      // total length
    const courtWidth = 15;       // total width
    const baselineZ = courtLength / 2;  // 14
    const hoopZOffset = 1.575;   // distance from baseline to hoop center
    const hoopZ = baselineZ - hoopZOffset;  // 12.425
    const threePointRadius = 6.75;
    const cornerDist = 1.575;    // distance from baseline to 3pt line start
    const keyWidth = 4.9;
    const keyLength = 5.8;
    const ftCircleRadius = 1.8;
    const centerCircleRadius = 1.8;

    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.4 });
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

    // ---- Paint areas (blue) — aligned with key lines ----
    const paintGeo = new THREE.PlaneGeometry(keyWidth, keyLength);
    const northPaint = new THREE.Mesh(paintGeo, blueMat);
    northPaint.rotation.x = -Math.PI / 2;
    northPaint.position.set(0, 0.005, -(baselineZ - keyLength / 2));
    courtGroup.add(northPaint);

    const southPaint = new THREE.Mesh(paintGeo, blueMat);
    southPaint.rotation.x = -Math.PI / 2;
    southPaint.position.set(0, 0.005, baselineZ - keyLength / 2);
    courtGroup.add(southPaint);

    // ---- Center circle (fill + ring) ----
    const centerFill = new THREE.Mesh(new THREE.CircleGeometry(centerCircleRadius, 64), blueMat);
    centerFill.rotation.x = -Math.PI / 2;
    centerFill.position.y = 0.006;
    courtGroup.add(centerFill);

    const centerRing = new THREE.Mesh(new THREE.RingGeometry(centerCircleRadius, centerCircleRadius + 0.1, 64), whiteMat);
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.y = 0.008;
    courtGroup.add(centerRing);

    // ---- Key lines (free-throw lanes) ----
    const laneGeoH = new THREE.PlaneGeometry(keyWidth, 0.08);
    const laneGeoV = new THREE.PlaneGeometry(0.08, keyLength);

    // North key (free-throw lane)
    const nkTop = new THREE.Mesh(laneGeoH, whiteMat);
    nkTop.rotation.x = -Math.PI / 2;
    nkTop.position.set(0, 0.01, -(baselineZ - keyLength));
    courtGroup.add(nkTop);
    const nkLeft = new THREE.Mesh(laneGeoV, whiteMat);
    nkLeft.rotation.x = -Math.PI / 2;
    nkLeft.position.set(-keyWidth / 2, 0.01, -(baselineZ - keyLength / 2));
    courtGroup.add(nkLeft);
    const nkRight = new THREE.Mesh(laneGeoV, whiteMat);
    nkRight.rotation.x = -Math.PI / 2;
    nkRight.position.set(keyWidth / 2, 0.01, -(baselineZ - keyLength / 2));
    courtGroup.add(nkRight);

    // South key
    const skTop = new THREE.Mesh(laneGeoH, whiteMat);
    skTop.rotation.x = -Math.PI / 2;
    skTop.position.set(0, 0.01, baselineZ - keyLength);
    courtGroup.add(skTop);
    const skLeft = new THREE.Mesh(laneGeoV, whiteMat);
    skLeft.rotation.x = -Math.PI / 2;
    skLeft.position.set(-keyWidth / 2, 0.01, baselineZ - keyLength / 2);
    courtGroup.add(skLeft);
    const skRight = new THREE.Mesh(laneGeoV, whiteMat);
    skRight.rotation.x = -Math.PI / 2;
    skRight.position.set(keyWidth / 2, 0.01, baselineZ - keyLength / 2);
    courtGroup.add(skRight);

    // ---- Free-throw circles (full circle centered on free-throw line) ----
    // Use RingGeometry for thick line like center circle
    const ftRingGeo = new THREE.RingGeometry(
      ftCircleRadius, ftCircleRadius + 0.08, 64, 1, 0, Math.PI * 2
    );

    const northFTCircle = new THREE.Mesh(ftRingGeo, whiteMat);
    northFTCircle.rotation.x = -Math.PI / 2;
    northFTCircle.position.set(0, 0.011, -(baselineZ - keyLength));
    courtGroup.add(northFTCircle);

    const southFTCircle = new THREE.Mesh(ftRingGeo, whiteMat);
    southFTCircle.rotation.x = -Math.PI / 2;
    southFTCircle.position.set(0, 0.011, baselineZ - keyLength);
    courtGroup.add(southFTCircle);

    // ---- 3-point lines ----
    // Arc centered on hoop, with straight sides parallel to sidelines
    // Using a fixed arc angle that looks correct for our court proportions
    const threePointArcAngle = 1.25; // ~71.6 degrees, gives nice arc + straight line balance

    const arcPoints = [];
    const arcSegs = 48;
    for (let i = 0; i <= arcSegs; i++) {
      const t = i / arcSegs;
      const angle = -threePointArcAngle + t * (threePointArcAngle * 2);
      arcPoints.push(new THREE.Vector3(
        Math.sin(angle) * threePointRadius,
        0.012,
        Math.cos(angle) * threePointRadius
      ));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);

    // North 3-point arc (centered at north hoop, arc faces south toward court)
    const north3PTArc = new THREE.Line(arcGeo, lineMat);
    north3PTArc.position.set(0, 0, -hoopZ);
    courtGroup.add(north3PTArc);

    // South 3-point arc (centered at south hoop, arc faces north toward court)
    const south3PTArc = new THREE.Line(arcGeo, lineMat);
    south3PTArc.position.set(0, 0, hoopZ);
    courtGroup.add(south3PTArc);

    // Straight sides: from arc endpoints, parallel to sidelines (Z axis), down toward baseline
    const arcEndX = Math.sin(threePointArcAngle) * threePointRadius;  // ~6.2
    const arcEndZ = Math.cos(threePointArcAngle) * threePointRadius;  // ~2.4

    // North straight sides: from arc endpoint to baseline
    const nSideGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(arcEndX, 0.012, -hoopZ + arcEndZ),
      new THREE.Vector3(arcEndX, 0.012, -baselineZ),
    ]);
    const nSideL = new THREE.Line(nSideGeo, lineMat);
    courtGroup.add(nSideL);

    const nSideRGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-arcEndX, 0.012, -hoopZ + arcEndZ),
      new THREE.Vector3(-arcEndX, 0.012, -baselineZ),
    ]);
    const nSideR = new THREE.Line(nSideRGeo, lineMat);
    courtGroup.add(nSideR);

    // South straight sides: from arc endpoint to baseline
    const sSideGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(arcEndX, 0.012, hoopZ - arcEndZ),
      new THREE.Vector3(arcEndX, 0.012, baselineZ),
    ]);
    const sSideL = new THREE.Line(sSideGeo, lineMat);
    courtGroup.add(sSideL);

    const sSideRGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-arcEndX, 0.012, hoopZ - arcEndZ),
      new THREE.Vector3(-arcEndX, 0.012, baselineZ),
    ]);
    const sSideR = new THREE.Line(sSideRGeo, lineMat);
    courtGroup.add(sSideR);

    // ---- Half-court line ----
    const halfLine = new THREE.Mesh(new THREE.PlaneGeometry(0.08, courtWidth), whiteMat);
    halfLine.rotation.x = -Math.PI / 2;
    halfLine.rotation.z = Math.PI / 2;
    halfLine.position.y = 0.01;
    courtGroup.add(halfLine);

    // ---- Sidelines ----
    const sideLineGeo = new THREE.PlaneGeometry(0.08, courtLength);
    const leftSideline = new THREE.Mesh(sideLineGeo, whiteMat);
    leftSideline.rotation.x = -Math.PI / 2;
    leftSideline.position.set(-courtWidth / 2, 0.01, 0);
    courtGroup.add(leftSideline);
    const rightSideline = new THREE.Mesh(sideLineGeo, whiteMat);
    rightSideline.rotation.x = -Math.PI / 2;
    rightSideline.position.set(courtWidth / 2, 0.01, 0);
    courtGroup.add(rightSideline);

    // ---- Baselines ----
    const baseLineGeo = new THREE.PlaneGeometry(courtWidth, 0.08);
    const northBaseline = new THREE.Mesh(baseLineGeo, whiteMat);
    northBaseline.rotation.x = -Math.PI / 2;
    northBaseline.position.set(0, 0.01, -baselineZ);
    courtGroup.add(northBaseline);
    const southBaseline = new THREE.Mesh(baseLineGeo, whiteMat);
    southBaseline.rotation.x = -Math.PI / 2;
    southBaseline.position.set(0, 0.01, baselineZ);
    courtGroup.add(southBaseline);

    // ---- Floor planks texture lines ----
    const plankMat = new THREE.MeshBasicMaterial({ color: 0xb08050, transparent: true, opacity: 0.3 });
    for (let i = -6; i <= 6; i += 1.0) {
      const plank = new THREE.Mesh(new THREE.PlaneGeometry(0.03, courtLength), plankMat);
      plank.rotation.x = -Math.PI / 2;
      plank.position.set(i, 0.004, 0);
      courtGroup.add(plank);
    }

    this.scene.add(courtGroup);
    this.courtGroup = courtGroup;
  }

  _buildHoop(name, x, y, z) {
    const hoopGroup = new THREE.Group();
    hoopGroup.position.set(x, y, z);
    hoopGroup.name = `hoop_${name}`;

    // Pole
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.6 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3.5, 12), poleMat);
    pole.position.set(0, 1.75, 0);
    pole.castShadow = true;
    hoopGroup.add(pole);

    // Arm connecting pole to backboard
    const armMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.6 });
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 1.2), armMat);
    arm.position.set(0, 3.3, name === 'north' ? 0.6 : -0.6);
    hoopGroup.add(arm);

    // Backboard
    const boardGeo = new THREE.BoxGeometry(1.8, 1.05, 0.06);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 3.75, name === 'north' ? 1.1 : -1.1);
    board.castShadow = true;
    hoopGroup.add(board);

    // Backboard inner square (target)
    const squareGeo = new THREE.PlaneGeometry(0.59, 0.45);
    const squareMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const square = new THREE.Mesh(squareGeo, squareMat);
    square.position.set(0, 3.75, name === 'north' ? 1.14 : -1.14);
    hoopGroup.add(square);

    // Rim
    const rimRadius = 0.23;
    const rimGeo = new THREE.TorusGeometry(rimRadius, 0.015, 8, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xff4500, roughness: 0.2, metalness: 0.7 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.05, name === 'north' ? 1.35 : -1.35);
    hoopGroup.add(rim);
    this[`${name}Rim`] = rim;

    // Net (simplified — cone of thin lines)
    const netGroup = new THREE.Group();
    netGroup.position.set(0, 3.05, name === 'north' ? 1.35 : -1.35);
    const netMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(angle) * rimRadius, 0, Math.sin(angle) * rimRadius),
        new THREE.Vector3(Math.cos(angle) * 0.12, -0.4, Math.sin(angle) * 0.12),
      ]);
      const line = new THREE.Line(lineGeo, netMat);
      netGroup.add(line);
    }
    hoopGroup.add(netGroup);
    this[`${name}Net`] = netGroup;

    this.scene.add(hoopGroup);
    this[`${name}Hoop`] = hoopGroup;
  }

  _buildStands() {
    const standGroup = new THREE.Group();

    // NBA-style seat colors (team colors + neutral)
    const seatColors = [
      0xd63031, 0x0984e3, 0xfdcB6e, 0x00b894, 0xe17055,
      0x6c5ce7, 0xfd79a8, 0xa29bfe, 0x74b9ff, 0xff7675,
    ];

    // Spectator shirt colors
    const shirtColors = [
      0x3b82f6, 0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6,
      0xec4899, 0x06b6d4, 0xf97316, 0x84cc16, 0xa855f7,
      0xffffff, 0x333333, 0xdddddd,
    ];

    // 3 tiers: inner, middle, outer
    // Court half-length = 15, so baseline at z=±15
    // Stands must start OUTSIDE the court, with buffer zone
    // innerRadius = 17 means first seat is 2m beyond baseline
    const tiers = [
      { innerRadius: 17, rows: 8, riserHeight: 0.45, rowDepth: 0.7, yStart: 0.3, angleSpan: 160 },
      { innerRadius: 23, rows: 10, riserHeight: 0.45, rowDepth: 0.7, yStart: 3.5, angleSpan: 170 },
      { innerRadius: 29, rows: 12, riserHeight: 0.45, rowDepth: 0.7, yStart: 7.5, angleSpan: 180 },
    ];

    for (const tier of tiers) {
      const seatsPerRow = Math.floor((tier.innerRadius * Math.PI * 2) / 0.55);
      const angleStep = (Math.PI * 2) / seatsPerRow;

      for (let row = 0; row < tier.rows; row++) {
        const rowRadius = tier.innerRadius + row * tier.rowDepth;
        const rowY = tier.yStart + row * tier.riserHeight;

        // Skip rows at hoop positions for aisles (every ~8th row)
        const isAisleRow = (row % 4 === 3);

        for (let s = 0; s < seatsPerRow; s++) {
          const angle = s * angleStep;
          const deg = (angle * 180) / Math.PI;

          // Skip behind hoops for entry gaps
          if ((deg > 80 && deg < 100) || (deg > 260 && deg < 280)) continue;

          // Aisle gaps every ~30 seats
          if (isAisleRow && (s % 15 === 0)) continue;

          const sx = Math.cos(angle) * rowRadius;
          const sz = Math.sin(angle) * rowRadius;

          // Seat platform (small concrete step)
          const stepMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
          const step = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.08, tier.rowDepth),
            stepMat
          );
          step.position.set(sx, rowY, sz);
          step.lookAt(0, rowY, 0);
          standGroup.add(step);

          // Colored seat
          const seatColor = seatColors[Math.floor(Math.random() * seatColors.length)];
          const seatMat = new THREE.MeshStandardMaterial({ color: seatColor, roughness: 0.6 });

          // Seat cushion
          const cushion = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.06, 0.38),
            seatMat
          );
          cushion.position.set(sx, rowY + 0.07, sz);
          cushion.lookAt(0, rowY + 0.07, 0);
          standGroup.add(cushion);

          // Seat back
          const back = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.35, 0.05),
            seatMat
          );
          back.position.set(
            sx + Math.cos(angle) * 0.18,
            rowY + 0.27,
            sz + Math.sin(angle) * 0.18
          );
          back.lookAt(0, rowY + 0.27, 0);
          standGroup.add(back);

          // Random spectator (60% chance)
          if (Math.random() < 0.6) {
            const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
            const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 });

            // Body
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.35, 6), shirtMat);
            body.position.set(sx, rowY + 0.32, sz);
            body.lookAt(0, rowY + 0.32, 0);
            standGroup.add(body);

            // Head
            const skinTones = [0xf5d0b0, 0xe0ac69, 0x8d5524, 0xc68642, 0xffdbac];
            const skinColor = skinTones[Math.floor(Math.random() * skinTones.length)];
            const headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), headMat);
            head.position.set(sx, rowY + 0.58, sz);
            standGroup.add(head);
          }
        }

        // Riser wall between rows (small, not solid)
        if (row < tier.rows - 1) {
          const nextRowY = tier.yStart + (row + 1) * tier.riserHeight;
          const riserMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });
          const riserRadius = rowRadius + tier.rowDepth * 0.5;
          const riserSegments = Math.min(seatsPerRow, 64);

          for (let s = 0; s < riserSegments; s++) {
            const angle = s * angleStep;
            const deg = (angle * 180) / Math.PI;
            if ((deg > 80 && deg < 100) || (deg > 260 && deg < 280)) continue;

            const rx = Math.cos(angle) * riserRadius;
            const rz = Math.sin(angle) * riserRadius;

            const riser = new THREE.Mesh(
              new THREE.BoxGeometry(0.5, tier.riserHeight - 0.1, 0.08),
              riserMat
            );
            riser.position.set(rx, rowY + tier.riserHeight / 2, rz);
            riser.lookAt(0, rowY + tier.riserHeight / 2, 0);
            standGroup.add(riser);
          }
        }
      }

      // Guard rail at front of each tier
      const railRadius = tier.innerRadius - 0.3;
      const railY = tier.yStart + 0.6;
      const railMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.7 });
      const railSegments = Math.min(seatsPerRow, 80);

      for (let s = 0; s < railSegments; s++) {
        const angle = s * angleStep;
        const deg = (angle * 180) / Math.PI;
        if ((deg > 80 && deg < 100) || (deg > 260 && deg < 280)) continue;

        const rx = Math.cos(angle) * railRadius;
        const rz = Math.sin(angle) * railRadius;

        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6),
          railMat
        );
        post.position.set(rx, railY, rz);
        standGroup.add(post);
      }
    }

    this.scene.add(standGroup);
    this.standGroup = standGroup;
  }

  _createChair(group, x, y, z, rotationY, color) {
    // Deprecated: seats are now built inline in _buildStands
    const chairGroup = new THREE.Group();
    chairGroup.position.set(x, y, z);
    chairGroup.rotation.y = rotationY;

    const plasticMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });

    // Seat cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.38), plasticMat);
    seat.position.set(0, 0, 0);
    chairGroup.add(seat);

    // Backrest
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.05), plasticMat);
    backrest.position.set(0, 0.2, -0.18);
    chairGroup.add(backrest);

    group.add(chairGroup);
  }

  _buildJumbotron() {
    const jumboGroup = new THREE.Group();
    jumboGroup.position.set(0, 14, 0);

    // Main cylindrical body
    const bodyGeo = new THREE.CylinderGeometry(3.5, 3.5, 1.8, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.5,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    jumboGroup.add(body);

    // Screen faces (4 sides)
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0a1628,
      roughness: 0.1,
      emissive: 0x1a3a6a,
      emissiveIntensity: 0.3,
    });

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 1.2),
        screenMat
      );
      screen.position.set(Math.sin(angle) * 3.55, 0, Math.cos(angle) * 3.55);
      screen.rotation.y = angle;
      jumboGroup.add(screen);
    }

    // Glowing ring (top and bottom)
    const ringGeo = new THREE.TorusGeometry(3.6, 0.08, 8, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff4500,
      emissiveIntensity: 0.8,
    });
    const topRing = new THREE.Mesh(ringGeo, ringMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 0.95;
    jumboGroup.add(topRing);

    const bottomRing = new THREE.Mesh(ringGeo, ringMat);
    bottomRing.rotation.x = Math.PI / 2;
    bottomRing.position.y = -0.95;
    jumboGroup.add(bottomRing);

    // Hanging cables
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 6, 4),
        cableMat
      );
      cable.position.set(Math.sin(angle) * 2.5, 3, Math.cos(angle) * 2.5);
      jumboGroup.add(cable);
    }

    this.scene.add(jumboGroup);
    this.jumbotron = jumboGroup;
  }

  _buildArenaLights() {
    // Ambient — dim, let spotlights do the work
    this.scene.children.forEach((child) => {
      if (child.isAmbientLight) {
        child.intensity = 0.3;
      }
    });

    // Main court spotlight from above
    const mainSpot = new THREE.SpotLight(0xffffff, 3.0);
    mainSpot.position.set(0, 22, 0);
    mainSpot.target.position.set(0, 0, 0);
    mainSpot.angle = Math.PI / 3;
    mainSpot.penumbra = 0.4;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 2048;
    mainSpot.shadow.mapSize.height = 2048;
    this.scene.add(mainSpot);
    this.scene.add(mainSpot.target);
    this.lights.push(mainSpot);

    // Secondary fill light
    const fillLight = new THREE.SpotLight(0xffeedd, 1.5);
    fillLight.position.set(0, 18, 12);
    fillLight.target.position.set(0, 0, -5);
    fillLight.angle = Math.PI / 3;
    fillLight.penumbra = 0.5;
    this.scene.add(fillLight);
    this.scene.add(fillLight.target);
    this.lights.push(fillLight);

    // Rim lights for dramatic effect
    const rimLight1 = new THREE.SpotLight(0x4488ff, 1.2);
    rimLight1.position.set(-18, 14, -18);
    rimLight1.target.position.set(0, 0, 0);
    rimLight1.angle = Math.PI / 4;
    rimLight1.penumbra = 0.5;
    this.scene.add(rimLight1);
    this.scene.add(rimLight1.target);
    this.lights.push(rimLight1);

    const rimLight2 = new THREE.SpotLight(0xff6644, 1.0);
    rimLight2.position.set(18, 12, 18);
    rimLight2.target.position.set(0, 3, 0);
    rimLight2.angle = Math.PI / 4;
    rimLight2.penumbra = 0.5;
    this.scene.add(rimLight2);
    this.scene.add(rimLight2.target);
    this.lights.push(rimLight2);

    // Stand area lights (to illuminate spectators and chairs)
    const standLight1 = new THREE.PointLight(0xffffff, 1.2, 25);
    standLight1.position.set(-14, 8, 0);
    this.scene.add(standLight1);
    this.lights.push(standLight1);

    const standLight2 = new THREE.PointLight(0xffffff, 1.2, 25);
    standLight2.position.set(14, 8, 0);
    this.scene.add(standLight2);
    this.lights.push(standLight2);

    const standLight3 = new THREE.PointLight(0xffffff, 1.0, 25);
    standLight3.position.set(0, 8, -14);
    this.scene.add(standLight3);
    this.lights.push(standLight3);

    const standLight4 = new THREE.PointLight(0xffffff, 1.0, 25);
    standLight4.position.set(0, 8, 14);
    this.scene.add(standLight4);
    this.lights.push(standLight4);

    // Jumbotron glow (point light)
    const jumboLight = new THREE.PointLight(0x4488ff, 1.0, 25);
    jumboLight.position.set(0, 12, 0);
    this.scene.add(jumboLight);
    this.lights.push(jumboLight);
  }

  // ---- API for Storyboard / DunkDirector ----

  getCourtGeometry() {
    return {
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

  getHoopPosition(hoopName) {
    const z = hoopName === 'north' ? -14 + 1.35 : 14 - 1.35;
    return new THREE.Vector3(0, 3.05, z);
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

  // ---- Update loop ----

  update(time, delta) {
    super.update(time, delta);

    // Flashbulb effects during dunk window
    if (this.dunkWindow && time >= this.dunkWindow.startTime && time <= this.dunkWindow.endTime) {
      this._updateFlashbulbs(time, delta);
    }

    // Basketball trajectory visualization
    if (this.basketballTrajectory) {
      this._updateBasketball(time);
    }

    // Rim bend recovery
    for (const name of ['north', 'south']) {
      if (this.rimBend[name] > 0) {
        this.rimBend[name] = Math.max(0, this.rimBend[name] - delta * 2);
        if (this[`${name}Rim`]) {
          this[`${name}Rim`].position.y = 3.05 - this.rimBend[name];
        }
      }
    }
  }

  _updateFlashbulbs(time, delta) {
    // Spawn random flashbulbs from spectator stands
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

    // Update existing flashbulbs
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

  _loadSportsCar() {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      // Setup DRACO decoder for compressed models
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/episode/draco/');
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        '/episode/materials/models/ferrari.glb',
        (gltf) => {
          const car = gltf.scene;
          // Compute bounding box to center and scale the car
          const box = new THREE.Box3().setFromObject(car);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Normalize scale so car is ~2.5m long
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2.5 / maxDim;

          // Center the geometry
          car.position.sub(center);
          car.scale.set(scale, scale, scale);

          // Position under north hoop, on floor, facing south
          car.position.set(0, size.y * scale * 0.5, -10);
          car.rotation.y = Math.PI;

          this.scene.add(car);
          this.sportsCar = car;
          console.log('[BasketballArenaScene] Sports car loaded, size:', size.x, size.y, size.z, 'scale:', scale);
          resolve();
        },
        undefined,
        (error) => {
          console.warn('[BasketballArenaScene] Failed to load sports car:', error);
          resolve(); // resolve anyway so rendering doesn't block
        }
      );
    });
  }

  _updateBasketball(time) {
    const traj = this.basketballTrajectory;
    if (!traj || !traj.ballPath || traj.ballPath.length === 0) return;

    const elapsed = time - traj.startTime;
    if (elapsed < 0) return;

    // Find current position in ball path
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

    // Past end of trajectory — hide ball and trigger rim bend
    if (this.basketball) {
      this.basketball.visible = false;
    }
    if (this.dunkWindow && elapsed > this.dunkWindow.endTime - this.dunkWindow.startTime - 0.3) {
      const hoopName = this.dunkWindow.hoopName;
      this.rimBend[hoopName] = 0.08;
    }
  }
}
