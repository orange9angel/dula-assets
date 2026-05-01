import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Xingzai (星仔) — 星际快递员
 * 全新设计：瘦高的萤火虫星人，透明翅膀，发光尾巴，大触角
 * 完全区别于哆啦A梦的圆滚滚造型
 */
export class Xingzai extends CharacterBase {
  constructor() {
    super('Xingzai');
  }

  build() {
    const toonGradient = (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 4; canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 4, 0);
      g.addColorStop(0, '#aaa'); g.addColorStop(0.4, '#ccc'); g.addColorStop(0.7, '#eee'); g.addColorStop(1, '#fff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 1);
      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      return tex;
    })();

    // 全新配色：亮紫+荧光绿，昆虫感（调亮以便在暗场景中可见）
    const shellMat = new THREE.MeshToonMaterial({ color: 0x6b3fa0, gradientMap: toonGradient });
    const glowMat = new THREE.MeshToonMaterial({ color: 0x39ff14, gradientMap: toonGradient });
    const darkMat = new THREE.MeshToonMaterial({ color: 0x4a2b6e, gradientMap: toonGradient });
    const eyeMat = new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x0a0a0a, gradientMap: toonGradient });
    const wingMat = new THREE.MeshBasicMaterial({ 
      color: 0xaaffaa, 
      transparent: true, 
      opacity: 0.25,
      side: THREE.DoubleSide
    });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.2;

    // 头部：椭圆形的昆虫头，不是圆球
    const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const head = new THREE.Mesh(headGeo, shellMat);
    head.scale.set(1.0, 1.3, 0.9);
    head.castShadow = true;
    headGroup.add(head);

    // 巨大的复眼（昆虫特征），不是星星眼
    const createCompoundEye = () => {
      const eyeGroup = new THREE.Group();
      // 主眼球
      const mainEyeGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const mainEye = new THREE.Mesh(mainEyeGeo, eyeMat);
      mainEye.scale.set(1, 1.2, 0.6);
      eyeGroup.add(mainEye);
      // 复眼小点阵
      for (let i = 0; i < 12; i++) {
        const dotGeo = new THREE.SphereGeometry(0.025, 8, 8);
        const dot = new THREE.Mesh(dotGeo, glowMat);
        const angle = (i / 12) * Math.PI * 2;
        dot.position.set(Math.cos(angle) * 0.12, Math.sin(angle) * 0.14, 0.08);
        eyeGroup.add(dot);
      }
      // 瞳孔
      const pupilGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.z = 0.12;
      pupil.scale.set(1, 1.3, 0.5);
      eyeGroup.add(pupil);
      return eyeGroup;
    };

    const leftEye = createCompoundEye();
    leftEye.position.set(-0.2, 0.1, 0.28);
    headGroup.add(leftEye);
    this.leftEye = leftEye;

    const rightEye = createCompoundEye();
    rightEye.position.set(0.2, 0.1, 0.28);
    headGroup.add(rightEye);
    this.rightEye = rightEye;

    // 嘴巴：小小的下颚
    const jawGeo = new THREE.ConeGeometry(0.04, 0.1, 4);
    const jaw = new THREE.Mesh(jawGeo, darkMat);
    jaw.position.set(0, -0.25, 0.25);
    jaw.rotation.x = Math.PI;
    headGroup.add(jaw);
    this.mouth = jaw;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;
    this.mouthBaseRotationX = Math.PI;

    // 两根巨大的触角（昆虫特征），不是天线
    const createAntenna = () => {
      const group = new THREE.Group();
      // 多段触角，可以弯曲
      const segments = 5;
      let currentY = 0;
      for (let i = 0; i < segments; i++) {
        const segGeo = new THREE.CylinderGeometry(0.015 - i * 0.002, 0.02 - i * 0.002, 0.15, 8);
        const seg = new THREE.Mesh(segGeo, darkMat);
        seg.position.y = currentY + 0.075;
        seg.rotation.z = i * 0.15;
        group.add(seg);
        currentY += 0.15;
      }
      // 触角末端发光球
      const tipGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const tip = new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: 0x39ff14 }));
      tip.position.set(currentY * 0.15, currentY, 0);
      group.add(tip);
      return { group, tip };
    };

    const leftAntenna = createAntenna();
    leftAntenna.group.position.set(-0.15, 0.4, 0);
    leftAntenna.group.rotation.z = 0.3;
    headGroup.add(leftAntenna.group);
    this.leftAntennaTip = leftAntenna.tip;

    const rightAntenna = createAntenna();
    rightAntenna.group.position.set(0.15, 0.4, 0);
    rightAntenna.group.rotation.z = -0.3;
    headGroup.add(rightAntenna.group);
    this.rightAntennaTip = rightAntenna.tip;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY ==========
    // 瘦长的昆虫身体，不是圆球！
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 1.4;

    // 胸部（三段式昆虫身体的第一段）
    const thoraxGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const thorax = new THREE.Mesh(thoraxGeo, shellMat);
    thorax.scale.set(0.9, 1.0, 0.8);
    thorax.castShadow = true;
    bodyGroup.add(thorax);

    // 腹部（第二段，更大一些）
    const abdomenGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const abdomen = new THREE.Mesh(abdomenGeo, shellMat);
    abdomen.position.y = -0.5;
    abdomen.scale.set(1.0, 1.3, 0.9);
    abdomen.castShadow = true;
    bodyGroup.add(abdomen);

    // 腹部发光条纹（萤火虫特征）
    for (let i = 0; i < 3; i++) {
      const stripeGeo = new THREE.TorusGeometry(0.32 - i * 0.02, 0.02, 8, 32);
      const stripe = new THREE.Mesh(stripeGeo, glowMat);
      stripe.position.y = -0.3 - i * 0.2;
      stripe.rotation.x = Math.PI / 2;
      bodyGroup.add(stripe);
    }

    // 尾巴发光器（萤火虫屁股发光）
    const tailGlowGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const tailGlow = new THREE.Mesh(tailGlowGeo, new THREE.MeshBasicMaterial({ 
      color: 0x39ff14, 
      transparent: true, 
      opacity: 0.8 
    }));
    tailGlow.position.y = -1.0;
    bodyGroup.add(tailGlow);
    this.tailGlow = tailGlow;

    // 尾巴光晕
    const tailHaloGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const tailHalo = new THREE.Mesh(tailHaloGeo, new THREE.MeshBasicMaterial({ 
      color: 0x66ff66, 
      transparent: true, 
      opacity: 0.2 
    }));
    tailHalo.position.y = -1.0;
    bodyGroup.add(tailHalo);
    this.tailHalo = tailHalo;

    this.mesh.add(bodyGroup);
    this.bodyGroup = bodyGroup;

    // ========== WINGS ==========
    // 两对透明的昆虫翅膀（蜻蜓/萤火虫风格）
    const createWing = (scaleX, scaleY, offsetX) => {
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.bezierCurveTo(0.3 * scaleX, 0.8 * scaleY, 0.8 * scaleX, 1.2 * scaleY, 0.2 * scaleX, 1.5 * scaleY);
      wingShape.bezierCurveTo(-0.2 * scaleX, 1.3 * scaleY, -0.3 * scaleX, 0.6 * scaleY, 0, 0);
      
      const wingGeo = new THREE.ShapeGeometry(wingShape);
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.x = offsetX;
      return wing;
    };

    // 上翅（大）
    this.leftUpperWing = createWing(1.2, 1.0, -0.1);
    this.leftUpperWing.rotation.z = 0.3;
    this.leftUpperWing.rotation.y = 0.2;
    bodyGroup.add(this.leftUpperWing);

    this.rightUpperWing = createWing(1.2, 1.0, 0.1);
    this.rightUpperWing.rotation.z = -0.3;
    this.rightUpperWing.rotation.y = -0.2;
    this.rightUpperWing.scale.x = -1;
    bodyGroup.add(this.rightUpperWing);

    // 下翅（小）
    this.leftLowerWing = createWing(0.8, 0.7, -0.1);
    this.leftLowerWing.position.y = -0.15;
    this.leftLowerWing.rotation.z = 0.5;
    bodyGroup.add(this.leftLowerWing);

    this.rightLowerWing = createWing(0.8, 0.7, 0.1);
    this.rightLowerWing.position.y = -0.15;
    this.rightLowerWing.rotation.z = -0.5;
    this.rightLowerWing.scale.x = -1;
    bodyGroup.add(this.rightLowerWing);

    // ========== ARMS ==========
    // 细长的昆虫手臂，带关节
    const createArm = (isRight) => {
      const group = new THREE.Group();
      const side = isRight ? 1 : -1;
      group.position.set(side * 0.35, 1.6, 0);

      // 上臂
      const upperArmGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.35, 8);
      const upperArm = new THREE.Mesh(upperArmGeo, shellMat);
      upperArm.position.y = -0.175;
      group.add(upperArm);

      // 关节
      const jointGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const joint = new THREE.Mesh(jointGeo, darkMat);
      joint.position.y = -0.35;
      group.add(joint);

      // 前臂
      const lowerArmGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 8);
      const lowerArm = new THREE.Mesh(lowerArmGeo, shellMat);
      lowerArm.position.y = -0.5;
      group.add(lowerArm);

      // 手（小爪子）
      const handGeo = new THREE.ConeGeometry(0.04, 0.1, 4);
      const hand = new THREE.Mesh(handGeo, glowMat);
      hand.position.y = -0.68;
      hand.rotation.x = Math.PI;
      group.add(hand);

      this.mesh.add(group);
      return group;
    };

    this.leftArm = createArm(false);
    this.rightArm = createArm(true);

    // ========== LEGS ==========
    // 细长的昆虫腿
    const createLeg = (side, front) => {
      const group = new THREE.Group();
      const xOffset = side * 0.25;
      const zOffset = front ? 0.15 : -0.15;
      group.position.set(xOffset, 1.0, zOffset);

      // 大腿
      const thighGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 8);
      const thigh = new THREE.Mesh(thighGeo, shellMat);
      thigh.position.y = -0.2;
      thigh.rotation.z = side * 0.3;
      group.add(thigh);

      // 小腿
      const shinGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.4, 8);
      const shin = new THREE.Mesh(shinGeo, shellMat);
      shin.position.set(side * 0.1, -0.5, 0);
      shin.rotation.z = side * -0.2;
      group.add(shin);

      // 脚（尖爪）
      const footGeo = new THREE.ConeGeometry(0.03, 0.08, 4);
      const foot = new THREE.Mesh(footGeo, glowMat);
      foot.position.set(side * 0.15, -0.72, 0);
      group.add(foot);

      this.mesh.add(group);
      return group;
    };

    this.leftFrontLeg = createLeg(-1, true);
    this.rightFrontLeg = createLeg(1, true);
    this.leftBackLeg = createLeg(-1, false);
    this.rightBackLeg = createLeg(1, false);

    // ========== PROPS ==========
    // 快递包（挂在腹部下方）
    const packGeo = new THREE.BoxGeometry(0.3, 0.25, 0.15);
    const pack = new THREE.Mesh(packGeo, new THREE.MeshToonMaterial({ color: 0x8B4513, gradientMap: toonGradient }));
    pack.position.set(0, 0.8, 0.3);
    pack.rotation.x = -0.2;
    this.mesh.add(pack);
    this.pack = pack;

    // 竹蜻蜓（备用道具，隐藏在头顶）
    this.takeCopter = this.createTakeCopter();
    this.takeCopter.visible = false;
    this.mesh.add(this.takeCopter);
  }

  createTakeCopter() {
    const group = new THREE.Group();
    group.position.set(0, 2.8, 0);

    const shaftMat = new THREE.MeshToonMaterial({ color: 0x8B4513 });
    const bladeMat = new THREE.MeshToonMaterial({ color: 0xFFD700 });

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8), shaftMat);
    shaft.position.y = 0.075;
    group.add(shaft);

    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), shaftMat);
    hub.position.y = 0.15;
    group.add(hub);

    const bladeGeo = new THREE.BoxGeometry(0.8, 0.02, 0.1);
    const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
    blade1.position.y = 0.15;
    group.add(blade1);

    const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
    blade2.position.y = 0.15;
    blade2.rotation.y = Math.PI / 2;
    group.add(blade2);

    return group;
  }

  attachTakeCopter() {
    if (this.takeCopter) this.takeCopter.visible = true;
  }

  detachTakeCopter() {
    if (this.takeCopter) this.takeCopter.visible = false;
  }

  update(time, delta) {
    super.update(time, delta);

    // 触角摆动
    if (this.leftAntennaTip && this.rightAntennaTip) {
      const parent1 = this.leftAntennaTip.parent;
      const parent2 = this.rightAntennaTip.parent;
      if (parent1) parent1.rotation.z = 0.3 + Math.sin(time * 2) * 0.1;
      if (parent2) parent2.rotation.z = -0.3 + Math.sin(time * 2 + 1) * 0.1;
    }

    // 尾巴发光脉冲（萤火虫闪烁）
    if (this.tailGlow && this.tailHalo) {
      const pulse = 0.5 + Math.sin(time * 4) * 0.3 + Math.sin(time * 7) * 0.2;
      this.tailGlow.material.opacity = pulse;
      this.tailHalo.scale.setScalar(1 + pulse * 0.5);
      this.tailHalo.material.opacity = pulse * 0.3;
    }

    // 翅膀微动（待机时）
    if (this.leftUpperWing && this.rightUpperWing) {
      const flutter = Math.sin(time * 8) * 0.05;
      this.leftUpperWing.rotation.z = 0.3 + flutter;
      this.rightUpperWing.rotation.z = -0.3 - flutter;
    }

    // 竹蜻蜓旋转
    if (this.takeCopter?.visible) {
      this.takeCopter.rotation.y += 15 * delta;
    }

    // 复眼小点发光
    if (this.leftEye && this.rightEye) {
      const pulseEmissive = 0.3 + Math.sin(time * 3) * 0.2;
      this.leftEye.traverse((child) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissive = new THREE.Color(0x39ff14);
          child.material.emissiveIntensity = pulseEmissive;
        }
      });
      this.rightEye.traverse((child) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          child.material.emissive = new THREE.Color(0x39ff14);
          child.material.emissiveIntensity = pulseEmissive;
        }
      });
    }
  }
}
