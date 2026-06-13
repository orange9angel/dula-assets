import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * DiscoWorm — 迪斯科舞王毛毛虫 v4.0
 * 
 * 真正带关节的腿和手：
 * - 4条腿：hip(髋) → thigh(大腿) → knee(膝盖) → shin(小腿) → ankle(脚踝) → foot(脚掌)
 * - 2只手：shoulder(肩) → upperArm(上臂) → elbow(肘) → forearm(前臂) → wrist(腕) → hand(手)
 * 
 * 搞笑表情系统：眉毛、眼皮、瞳孔、嘴巴都能动
 * 黄绿色大肥虫，身上有毛和斑点
 */
export class DiscoWorm extends CharacterBase {
  constructor() {
    super('DiscoWorm');
    this.boundingRadius = 0.7;
    this.archetypes = ['worm', 'serpent', 'round'];
    this.baseY = 0.45;
    this.trustedBodyAnimations = ['WormDance', 'WormWiggle', 'WormTunnel', 'FaceHappy', 'FaceSurprised', 'FaceAngry'];
    this.allowedBodyAnimations = new Set(this.trustedBodyAnimations);
  }

  build() {
    const toonGradient = this.createToonGradient();

    // 材质
    const bodyMat = new THREE.MeshToonMaterial({ color: 0x9acd32, gradientMap: toonGradient });
    const ringMat = new THREE.MeshToonMaterial({ color: 0x6b8e23, gradientMap: toonGradient });
    const bellyMat = new THREE.MeshToonMaterial({ color: 0xcddc39, gradientMap: toonGradient });
    const spotMat = new THREE.MeshToonMaterial({ color: 0x556b2f, gradientMap: toonGradient });
    const hairMat = new THREE.MeshBasicMaterial({ color: 0xadff2f, transparent: true, opacity: 0.6 });
    const legMat = new THREE.MeshToonMaterial({ color: 0x4a5d23, gradientMap: toonGradient });
    const armMat = new THREE.MeshToonMaterial({ color: 0x7cb342, gradientMap: toonGradient });
    const eyeWhiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x000000, gradientMap: toonGradient });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.4 });

    this.segments = [];
    this.segmentRings = [];
    this.bellies = [];
    this.spots = [];
    this.hairs = [];

    const numSegments = 6;
    const baseRadius = 0.28;
    const segmentHeight = 0.32;

    // ========== 身体节段 ==========
    for (let i = 0; i < numSegments; i++) {
      const segGroup = new THREE.Group();
      const t = i / (numSegments - 1);
      const fatFactor = 1.0 - Math.abs(t - 0.5) * 0.3;
      const radius = baseRadius * fatFactor;

      // 主体
      const bodyGeo = new THREE.SphereGeometry(radius, 32, 32);
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.scale.set(1.2, 0.8, 1.1);
      bodyMesh.castShadow = true;
      segGroup.add(bodyMesh);

      // 节段环
      if (i > 0) {
        const ringGeo = new THREE.TorusGeometry(radius * 1.08, 0.03, 10, 32);
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = -segmentHeight * 0.4;
        segGroup.add(ringMesh);
        this.segmentRings.push(ringMesh);
      }

      // 肚皮
      const bellyGeo = new THREE.SphereGeometry(radius * 0.95, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.45);
      const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
      bellyMesh.rotation.x = Math.PI;
      bellyMesh.position.y = -radius * 0.06;
      segGroup.add(bellyMesh);
      this.bellies.push(bellyMesh);

      // 斑点
      const numSpots = 4 + Math.floor(Math.random() * 3);
      for (let s = 0; s < numSpots; s++) {
        const spotGeo = new THREE.SphereGeometry(0.022 + Math.random() * 0.018, 8, 8);
        const spot = new THREE.Mesh(spotGeo, spotMat);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.PI * 0.25 + Math.random() * Math.PI * 0.5;
        spot.position.set(
          Math.sin(phi) * Math.cos(theta) * radius * 0.92,
          Math.cos(phi) * radius * 0.5,
          Math.sin(phi) * Math.sin(theta) * radius * 0.92
        );
        spot.scale.set(1, 0.6, 1);
        segGroup.add(spot);
        this.spots.push(spot);
      }

      // 毛发
      const numHairs = 10 + Math.floor(Math.random() * 8);
      for (let h = 0; h < numHairs; h++) {
        const hairLen = 0.05 + Math.random() * 0.08;
        const hairGeo = new THREE.CylinderGeometry(0.004, 0.001, hairLen, 4);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        const angle = (h / numHairs) * Math.PI * 2 + Math.random() * 0.5;
        const hairRadius = radius * (0.9 + Math.random() * 0.15);
        hair.position.set(
          Math.cos(angle) * hairRadius,
          (Math.random() - 0.5) * radius * 0.5,
          Math.sin(angle) * hairRadius
        );
        hair.lookAt(
          hair.position.x * 2,
          hair.position.y + 0.15,
          hair.position.z * 2
        );
        segGroup.add(hair);
        this.hairs.push(hair);
      }

      segGroup.position.y = i * segmentHeight * 0.6 + radius * 0.5;
      this.mesh.add(segGroup);
      this.segments.push(segGroup);
      this[`segment${i}`] = segGroup;
    }

    // ========== 4条真正的腿（带关节）==========
    // 腿连接在第2、3节段（索引1、2，中间偏下）
    // 左前、右前、左后、右后
    const legConfigs = [
      { name: 'leftLeg',  side: -1, segmentIdx: 2, zOffset: 0.2 },   // 左前
      { name: 'rightLeg', side: 1,  segmentIdx: 2, zOffset: 0.2 },   // 右前
      { name: 'leftLeg2',  side: -1, segmentIdx: 1, zOffset: -0.2 }, // 左后
      { name: 'rightLeg2', side: 1,  segmentIdx: 1, zOffset: -0.2 }, // 右后
    ];

    this.legs = [];
    for (const cfg of legConfigs) {
      const seg = this.segments[cfg.segmentIdx];
      const radius = baseRadius * (1.0 - Math.abs(cfg.segmentIdx / (numSegments - 1) - 0.5) * 0.3);

      // Hip Group（髋关节）
      const hip = new THREE.Group();
      hip.position.set(cfg.side * radius * 0.7, -radius * 0.2, cfg.zOffset);
      seg.add(hip);

      // Thigh（大腿）
      const thighLen = 0.28;
      const thighGeo = new THREE.CapsuleGeometry(0.04, thighLen, 6, 12);
      const thigh = new THREE.Mesh(thighGeo, legMat);
      thigh.position.y = -thighLen / 2;
      hip.add(thigh);

      // Knee Group（膝关节）
      const knee = new THREE.Group();
      knee.position.y = -thighLen;
      hip.add(knee);

      const kneeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), legMat);
      knee.add(kneeMesh);

      // Shin（小腿）
      const shinLen = 0.25;
      const shinGeo = new THREE.CapsuleGeometry(0.032, shinLen, 6, 12);
      const shin = new THREE.Mesh(shinGeo, legMat);
      shin.position.y = -shinLen / 2;
      knee.add(shin);

      // Ankle Group（踝关节）
      const ankle = new THREE.Group();
      ankle.position.y = -shinLen;
      knee.add(ankle);

      // Foot（脚掌）
      const footGeo = new THREE.SphereGeometry(0.055, 12, 12);
      const foot = new THREE.Mesh(footGeo, legMat);
      foot.scale.set(1.4, 0.35, 1.8);
      foot.position.y = -0.02;
      ankle.add(foot);

      // 存储引用
      this[cfg.name] = hip;
      this[`${cfg.name}Knee`] = knee;
      this[`${cfg.name}Ankle`] = ankle;
      this.legs.push({ hip, knee, ankle, thigh, shin, foot, side: cfg.side, config: cfg });
    }

    // 映射到标准关节名（让动画系统能识别）
    this.rightLeg = this.legs[1].hip;    // 右前
    this.rightKnee = this.legs[1].knee;
    this.rightAnkle = this.legs[1].ankle;
    this.leftLeg = this.legs[0].hip;     // 左前
    this.leftKnee = this.legs[0].knee;
    this.leftAnkle = this.legs[0].ankle;
    // 后腿也存一下
    this.rightLeg2 = this.legs[3].hip;
    this.rightKnee2 = this.legs[3].knee;
    this.rightAnkle2 = this.legs[3].ankle;
    this.leftLeg2 = this.legs[2].hip;
    this.leftKnee2 = this.legs[2].knee;
    this.leftAnkle2 = this.legs[2].ankle;

    // ========== 2只真正的手（带关节）==========
    // 手连接在头部节段（最后一段）
    const headSeg = this.segments[numSegments - 1];
    const headRadius = baseRadius * (1.0 - Math.abs(1 - 0.5) * 0.3);

    const armConfigs = [
      { name: 'rightArm', side: 1 },   // 右手
      { name: 'leftArm', side: -1 },   // 左手
    ];

    this.arms = [];
    for (const cfg of armConfigs) {
      // Shoulder Group（肩关节）
      const shoulder = new THREE.Group();
      shoulder.position.set(cfg.side * headRadius * 0.85, headRadius * 0.1, 0.1);
      headSeg.add(shoulder);

      // Upper Arm（上臂）
      const upperArmLen = 0.22;
      const upperArmGeo = new THREE.CapsuleGeometry(0.028, upperArmLen, 6, 12);
      const upperArm = new THREE.Mesh(upperArmGeo, armMat);
      upperArm.position.y = -upperArmLen / 2;
      shoulder.add(upperArm);

      // Elbow Group（肘关节）
      const elbow = new THREE.Group();
      elbow.position.y = -upperArmLen;
      shoulder.add(elbow);

      const elbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), armMat);
      elbow.add(elbowMesh);

      // Forearm（前臂）
      const forearmLen = 0.2;
      const forearmGeo = new THREE.CapsuleGeometry(0.024, forearmLen, 6, 12);
      const forearm = new THREE.Mesh(forearmGeo, armMat);
      forearm.position.y = -forearmLen / 2;
      elbow.add(forearm);

      // Wrist Group（腕关节）
      const wrist = new THREE.Group();
      wrist.position.y = -forearmLen;
      elbow.add(wrist);

      // Hand（手）
      const handGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const hand = new THREE.Mesh(handGeo, armMat);
      hand.scale.set(1.2, 0.5, 1.4);
      hand.position.y = -0.02;
      wrist.add(hand);

      // 存储
      this[cfg.name] = shoulder;
      this[`${cfg.name === 'rightArm' ? 'right' : 'left'}Elbow`] = elbow;
      this[`${cfg.name === 'rightArm' ? 'right' : 'left'}Wrist`] = wrist;
      this.arms.push({ shoulder, elbow, wrist, upperArm, forearm, hand, side: cfg.side });
    }

    // 映射到标准名
    this.rightArm = this.arms[0].shoulder;
    this.rightElbow = this.arms[0].elbow;
    this.rightWrist = this.arms[0].wrist;
    this.leftArm = this.arms[1].shoulder;
    this.leftElbow = this.arms[1].elbow;
    this.leftWrist = this.arms[1].wrist;

    // ========== 头部（在最后一段上）==========
    const head = headSeg;

    // 大眼睛
    this.eyes = [];
    for (const side of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      
      const eyeWhite = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 20, 20),
        eyeWhiteMat
      );
      eyeWhite.scale.set(1.1, 1.2, 0.6);
      eyeGroup.add(eyeWhite);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        pupilMat
      );
      pupil.position.z = 0.055;
      pupil.scale.set(1, 1.1, 0.5);
      eyeGroup.add(pupil);

      const highlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      highlight.position.set(side * 0.03, 0.035, 0.075);
      eyeGroup.add(highlight);

      eyeGroup.position.set(side * 0.14, headRadius * 0.35, headRadius * 0.88);
      head.add(eyeGroup);
      this.eyes.push(eyeGroup);
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
    }

    // 眉毛（可动画）
    this.leftEyebrow = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.018, 0.1, 4, 8),
      spotMat
    );
    this.leftEyebrow.rotation.z = Math.PI / 2;
    this.leftEyebrow.position.set(-0.14, headRadius * 0.55, headRadius * 0.85);
    head.add(this.leftEyebrow);

    this.rightEyebrow = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.018, 0.1, 4, 8),
      spotMat
    );
    this.rightEyebrow.rotation.z = Math.PI / 2;
    this.rightEyebrow.position.set(0.14, headRadius * 0.55, headRadius * 0.85);
    head.add(this.rightEyebrow);

    // 眼皮（可动画 - 眨眼）
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x9acd32, transparent: true, opacity: 0.7 });
    this.leftEyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      eyelidMat
    );
    this.leftEyelid.position.set(-0.14, headRadius * 0.35, headRadius * 0.88);
    this.leftEyelid.visible = false;
    head.add(this.leftEyelid);

    this.rightEyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      eyelidMat
    );
    this.rightEyelid.position.set(0.14, headRadius * 0.35, headRadius * 0.88);
    this.rightEyelid.visible = false;
    head.add(this.rightEyelid);

    // 嘴巴（可动画）
    this.mouth = new THREE.Group();
    this.mouth.position.set(0, -headRadius * 0.25, headRadius * 0.92);

    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.1, 0, 0),
      new THREE.Vector3(0, -0.06, 0.015),
      new THREE.Vector3(0.1, 0, 0)
    );
    const mouthTube = new THREE.TubeGeometry(mouthCurve, 16, 0.018, 8, false);
    const mouthMesh = new THREE.Mesh(mouthTube, new THREE.MeshBasicMaterial({ color: 0x330011 }));
    this.mouth.add(mouthMesh);
    
    // 舌头（搞笑用）
    this.tongue = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff4466 })
    );
    this.tongue.position.set(0, -0.04, 0.01);
    this.tongue.scale.set(1, 0.5, 0.8);
    this.tongue.visible = false;
    this.mouth.add(this.tongue);
    
    head.add(this.mouth);

    // 腮红
    for (const side of [-1, 1]) {
      const blush = new THREE.Mesh(
        new THREE.CircleGeometry(0.07, 16),
        blushMat
      );
      blush.position.set(side * 0.22, -0.08, headRadius * 0.82);
      blush.rotation.y = side * 0.4;
      head.add(blush);
    }

    // 触角
    this.antennae = [];
    for (const side of [-1, 1]) {
      const antenna = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.02, 0.14, 4, 8),
        bodyMat
      );
      stem.position.y = 0.07;
      antenna.add(stem);

      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xadff2f, transparent: true, opacity: 0.5 })
      );
      tip.position.y = 0.16;
      antenna.add(tip);

      antenna.position.set(side * 0.1, headRadius * 0.75, 0.04);
      antenna.rotation.z = side * -0.35;
      head.add(antenna);
      this.antennae.push(antenna);
    }

    this.headGroup = head;
    this.butt = this.segments[0];

    // 整体放大
    this.mesh.scale.set(1.6, 1.6, 1.6);
  }

  createToonGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 4; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 4, 0);
    g.addColorStop(0, '#2a2a2a');
    g.addColorStop(0.45, '#707070');
    g.addColorStop(0.55, '#c0c0c0');
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  update(time, delta) {
    super.update(time, delta);

    // 触角摆动
    if (this.antennae) {
      for (let i = 0; i < this.antennae.length; i++) {
        const a = this.antennae[i];
        const side = i === 0 ? -1 : 1;
        a.rotation.z = side * -0.35 + Math.sin(time * 4 + i) * 0.25;
        a.rotation.x = Math.sin(time * 3 + i * 1.5) * 0.2;
      }
    }

    // 毛发飘动
    if (this.hairs) {
      for (let i = 0; i < this.hairs.length; i++) {
        const hair = this.hairs[i];
        hair.rotation.x += Math.sin(time * 5 + i * 0.7) * 0.003;
        hair.rotation.z += Math.cos(time * 4 + i * 0.5) * 0.003;
      }
    }

    // 节段环呼吸
    if (this.segmentRings) {
      for (let i = 0; i < this.segmentRings.length; i++) {
        const ring = this.segmentRings[i];
        const pulse = 0.5 + 0.5 * Math.sin(time * 3 + i * 0.6);
        ring.scale.setScalar(1 + pulse * 0.05);
      }
    }

    // 自动眨眼
    this._updateBlink(time, delta);
  }

  _updateBlink(time, delta) {
    if (!this.leftEyelid || !this.rightEyelid) return;
    
    switch (this.blinkState) {
      case 'open':
        this.blinkTimer -= delta;
        if (this.blinkTimer <= 0) {
          this.blinkState = 'closing';
          this.blinkProgress = 0;
        }
        break;
      case 'closing':
        this.blinkProgress += delta / (this.blinkDuration * 0.3);
        if (this.blinkProgress >= 1) {
          this.blinkProgress = 1;
          this.blinkState = 'closed';
          this.blinkTimer = 0.05;
        }
        this._setEyelidOpenness(1 - this.blinkProgress);
        break;
      case 'closed':
        this.blinkTimer -= delta;
        if (this.blinkTimer <= 0) {
          this.blinkState = 'opening';
        }
        break;
      case 'opening':
        this.blinkProgress -= delta / (this.blinkDuration * 0.7);
        if (this.blinkProgress <= 0) {
          this.blinkProgress = 0;
          this.blinkState = 'open';
          this.blinkTimer = Math.random() * 3 + 2;
          this._setEyelidOpenness(1);
        } else {
          this._setEyelidOpenness(1 - this.blinkProgress);
        }
        break;
    }
  }

  _setEyelidOpenness(openness) {
    if (openness >= 0.95) {
      this.leftEyelid.visible = false;
      this.rightEyelid.visible = false;
    } else {
      this.leftEyelid.visible = true;
      this.rightEyelid.visible = true;
      const scaleY = 1 - openness;
      this.leftEyelid.scale.y = scaleY;
      this.rightEyelid.scale.y = scaleY;
    }
  }
}
