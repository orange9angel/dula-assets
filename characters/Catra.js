import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Catra (卡特拉) — She-Ra's rival / frenemy
 * 猫人特征：尖耳朵，蓬松尾巴，敏捷身材
 * 深色短发，穿着霍达克军团制服变体
 */
export class Catra extends CharacterBase {
  constructor() {
    super('Catra');
    this.boundingRadius = 0.5;
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

    const skinMat = new THREE.MeshToonMaterial({ color: 0xf5d0a0, gradientMap: toonGradient });
    const furMat = new THREE.MeshToonMaterial({ color: 0x5d4037, gradientMap: toonGradient });
    const lightFurMat = new THREE.MeshToonMaterial({ color: 0x8d6e63, gradientMap: toonGradient });
    const uniformMat = new THREE.MeshToonMaterial({ color: 0x3e2723, gradientMap: toonGradient });
    const accentMat = new THREE.MeshToonMaterial({ color: 0xff6f00, gradientMap: toonGradient });
    const eyeMat = new THREE.MeshToonMaterial({ color: 0xff9800, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x1a0a00, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.7;

    // Face (slightly angular, cat-like)
    const faceGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.scale.set(1.0, 1.1, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Chin (pointier)
    const chinGeo = new THREE.SphereGeometry(0.14, 24, 24);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.16, 0.12);
    chin.scale.set(0.9, 0.7, 0.9);
    headGroup.add(chin);

    // Hair (messy dark brown)
    const hairGeo = new THREE.SphereGeometry(0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.75);
    const hair = new THREE.Mesh(hairGeo, furMat);
    hair.position.set(0, 0.06, -0.02);
    headGroup.add(hair);

    // Messy hair tufts
    for (let i = 0; i < 5; i++) {
      const tuftGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const tuft = new THREE.Mesh(tuftGeo, furMat);
      const angle = (i / 5) * Math.PI * 0.8 - Math.PI * 0.4;
      tuft.position.set(Math.sin(angle) * 0.2, 0.2 + Math.random() * 0.1, Math.cos(angle) * 0.15 - 0.05);
      headGroup.add(tuft);
    }

    // Cat ears (pointed, on top)
    for (const side of [-1, 1]) {
      const earGroup = new THREE.Group();
      const earGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.y = 0.09;
      earGroup.add(ear);
      // Inner ear (lighter)
      const innerEarGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
      const innerEar = new THREE.Mesh(innerEarGeo, lightFurMat);
      innerEar.position.set(0, 0.09, 0.02);
      earGroup.add(innerEar);
      earGroup.position.set(side * 0.15, 0.3, 0.05);
      earGroup.rotation.z = side * 0.3;
      headGroup.add(earGroup);
    }

    // Eyes (large amber, cat-like)
    const eyeWhiteGeo = new THREE.SphereGeometry(0.085, 16, 16);
    for (const side of [-1, 1]) {
      const eyeWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
      eyeWhite.position.set(side * 0.1, 0.03, 0.24);
      eyeWhite.scale.set(1.1, 1.3, 0.6);
      headGroup.add(eyeWhite);

      // Cat eye shape (slit pupil) — using elongated sphere
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), eyeMat);
      iris.position.set(side * 0.1, 0.03, 0.28);
      iris.scale.set(1.2, 1.4, 0.5);
      headGroup.add(iris);

      // Slit pupil (thin vertical)
      const slitGeo = new THREE.BoxGeometry(0.008, 0.06, 0.01);
      const slit = new THREE.Mesh(slitGeo, pupilMat);
      slit.position.set(side * 0.1, 0.03, 0.3);
      slit.userData.baseX = slit.position.x;
      if (side === -1) this.leftPupil = slit;
      else this.rightPupil = slit;
      headGroup.add(slit);

      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), whiteMat);
      hl.position.set(side * 0.08, 0.06, 0.31);
      headGroup.add(hl);
    }

    // Eyebrows (sharp, angular)
    const browCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.04, 0, 0),
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0.04, -0.01, 0)
    );
    const browGeo = new THREE.TubeGeometry(browCurve, 8, 0.004, 8, false);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, furMat);
      brow.position.set(side * 0.1, 0.14, 0.26);
      headGroup.add(brow);
    }

    // Nose (small triangle)
    const noseShape = new THREE.Shape();
    noseShape.moveTo(-0.015, 0);
    noseShape.lineTo(0.015, 0);
    noseShape.lineTo(0, -0.02);
    noseShape.lineTo(-0.015, 0);
    const noseGeo = new THREE.ExtrudeGeometry(noseShape, { depth: 0.005, bevelEnabled: false });
    const nose = new THREE.Mesh(noseGeo, new THREE.MeshToonMaterial({ color: 0xd08080, gradientMap: toonGradient }));
    nose.position.set(0, -0.04, 0.29);
    headGroup.add(nose);

    // Mouth (smirk)
    const smirkCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.025, -0.1, 0.27),
      new THREE.Vector3(0, -0.09, 0.29),
      new THREE.Vector3(0.03, -0.11, 0.27)
    );
    const smirkGeo = new THREE.TubeGeometry(smirkCurve, 10, 0.003, 8, false);
    const smirk = new THREE.Mesh(smirkGeo, new THREE.MeshToonMaterial({ color: 0xc06060, gradientMap: toonGradient }));
    headGroup.add(smirk);
    this.mouth = smirk;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    // Whiskers (thin lines)
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const whiskerCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(side * 0.08, (i - 1) * 0.01, 0),
          new THREE.Vector3(side * 0.15, (i - 1) * 0.02, -0.02)
        );
        const whiskerGeo = new THREE.TubeGeometry(whiskerCurve, 6, 0.001, 4, false);
        const whisker = new THREE.Mesh(whiskerGeo, new THREE.MeshToonMaterial({ color: 0x888888, gradientMap: toonGradient }));
        whisker.position.set(side * 0.08, -0.06 + i * 0.015, 0.26);
        headGroup.add(whisker);
      }
    }

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.1, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.55;
    this.mesh.add(neck);

    // ========== BODY ==========
    // Slim athletic build
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.48, 16);
    const torso = new THREE.Mesh(torsoGeo, uniformMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Orange accent stripe
    const stripeGeo = new THREE.BoxGeometry(0.2, 0.04, 0.22);
    const stripe = new THREE.Mesh(stripeGeo, accentMat);
    stripe.position.set(0, 1.35, 0.12);
    this.mesh.add(stripe);

    // Tail (fluffy cat tail)
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.1, -0.15),
      new THREE.Vector3(0, 0.3, -0.25),
      new THREE.Vector3(0, 0.5, -0.2),
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.05, 8, false);
    const tail = new THREE.Mesh(tailGeo, furMat);
    tail.position.set(0, 0.6, -0.2);
    this.mesh.add(tail);
    this.tail = tail;

    // Pants
    const pantsGeo = new THREE.ConeGeometry(0.25, 0.6, 16, 1, true);
    const pants = new THREE.Mesh(pantsGeo, uniformMat);
    pants.position.y = 0.7;
    this.mesh.add(pants);

    // ========== ARMS ==========
    const handGeo = new THREE.SphereGeometry(0.05, 16, 16);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.1);
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, capLen, 4, 16), skinMat);
      armMesh.position.y = -len / 2;
      group.add(armMesh);

      // Clawed hand
      const handMesh = new THREE.Mesh(handGeo, skinMat);
      handMesh.position.y = -len;
      group.add(handMesh);

      // Claws
      for (let i = 0; i < 3; i++) {
        const clawGeo = new THREE.ConeGeometry(0.008, 0.03, 4);
        const claw = new THREE.Mesh(clawGeo, accentMat);
        claw.position.set((i - 1) * 0.015, -len - 0.03, 0.02);
        claw.rotation.x = Math.PI;
        group.add(claw);
      }

      this.mesh.add(group);
      if (isRight) {
        this.rightArm = group;
        this.rightArmLength = len;
        this.rightArmBaseZ = group.rotation.z;
      } else {
        this.leftArm = group;
        this.leftArmBaseZ = group.rotation.z;
      }
    };

    addArm(-0.25, 1.35, 0, -0.35, 0.85, 0, false);
    addArm(0.25, 1.35, 0, 0.35, 0.85, 0, true);

    // ========== LEGS ==========
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 16);
    const bootGeo = new THREE.SphereGeometry(0.08, 16, 16);

    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.1, 0.55, 0);
      const legMesh = new THREE.Mesh(legGeo, uniformMat);
      legMesh.position.y = -0.175;
      legGroup.add(legMesh);

      const boot = new THREE.Mesh(bootGeo, uniformMat);
      boot.position.set(0, -0.35, 0.03);
      boot.scale.set(1, 0.7, 1.4);
      legGroup.add(boot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }

    // ========== MASK (prop, can be attached/detached) ==========
    this.maskGroup = new THREE.Group();
    this.maskGroup.visible = false;

    const maskGeo = new THREE.BoxGeometry(0.22, 0.08, 0.02);
    const mask = new THREE.Mesh(maskGeo, accentMat);
    this.maskGroup.add(mask);

    // Mask eye holes
    for (const side of [-1, 1]) {
      const holeGeo = new THREE.CircleGeometry(0.03, 8);
      const hole = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
      hole.position.set(side * 0.06, 0, 0.012);
      this.maskGroup.add(hole);
    }

    this.maskGroup.position.set(0, 1.75, 0.3);
    this.mesh.add(this.maskGroup);
  }

  attachMask() {
    if (this.maskGroup) this.maskGroup.visible = true;
  }

  detachMask() {
    if (this.maskGroup) this.maskGroup.visible = false;
  }

  update(time, delta) {
    super.update(time, delta);
    // Tail sway
    if (this.tail) {
      this.tail.rotation.z = Math.sin(time * 2) * 0.15;
      this.tail.rotation.x = Math.sin(time * 1.5) * 0.1;
    }
    // Ear twitch (subtle)
    if (this.headGroup) {
      this.headGroup.children.forEach((child) => {
        if (child.type === 'Group' && child.position.y > 0.2) {
          child.rotation.z += Math.sin(time * 3 + child.position.x) * 0.002;
        }
      });
    }
  }
}
