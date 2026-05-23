import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Shota (翔太) — 少年主角
 * 普通小学生形象，黄色T恤 + 蓝色短裤
 * 用于人类视角的剧情推进
 */
export class Shota extends CharacterBase {
  constructor() {
    super('Shota');
    this.boundingRadius = 0.35;
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

    const skinMat = new THREE.MeshToonMaterial({ color: 0xffdfc4, gradientMap: toonGradient });
    const shirtMat = new THREE.MeshToonMaterial({ color: 0xffcc00, gradientMap: toonGradient });
    const shortsMat = new THREE.MeshToonMaterial({ color: 0x1a5fb4, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x3d2b1f, gradientMap: toonGradient });
    const shoeMat = new THREE.MeshToonMaterial({ color: 0xcc3333, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x111111, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.35;

    // Face
    const faceGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.scale.set(1, 1.05, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Hair (short, spiky)
    const hairGeo = new THREE.SphereGeometry(0.23, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.06, -0.02);
    headGroup.add(hair);

    // Spiky tufts
    for (let i = 0; i < 5; i++) {
      const tuftGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
      const tuft = new THREE.Mesh(tuftGeo, hairMat);
      const angle = (i / 5) * Math.PI - Math.PI / 2;
      tuft.position.set(Math.sin(angle) * 0.15, 0.2, Math.cos(angle) * 0.1);
      tuft.rotation.x = -0.3;
      tuft.rotation.z = -angle * 0.5;
      headGroup.add(tuft);
    }

    // Eyes (large, expressive)
    const eyeWhiteGeo = new THREE.SphereGeometry(0.055, 16, 16);
    for (const side of [-1, 1]) {
      const eyeWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
      eyeWhite.position.set(side * 0.08, 0.02, 0.18);
      eyeWhite.scale.set(1, 1.1, 0.5);
      headGroup.add(eyeWhite);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), blackMat);
      pupil.position.set(side * 0.08, 0.02, 0.2);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      // Highlight
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), whiteMat);
      hl.position.set(side * 0.07, 0.04, 0.21);
      headGroup.add(hl);
    }

    // Mouth
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.025, -0.08, 0.18),
      new THREE.Vector3(0, -0.09, 0.19),
      new THREE.Vector3(0.025, -0.08, 0.18)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 8, 0.003, 8, false);
    const mouth = new THREE.Mesh(mouthGeo, new THREE.MeshToonMaterial({ color: 0xcc5555, gradientMap: toonGradient }));
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== BODY ==========
    // Torso (yellow shirt)
    const torsoGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.35, 12);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.85;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Arms
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.06);

      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, capLen, 4, 12), skinMat);
      armMesh.position.y = -len / 2;
      group.add(armMesh);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), skinMat);
      hand.position.y = -len;
      group.add(hand);

      this.mesh.add(group);
      if (isRight) {
        this.rightArm = group;
        this.rightArmBaseZ = group.rotation.z;
      } else {
        this.leftArm = group;
        this.leftArmBaseZ = group.rotation.z;
      }
    };

    addArm(-0.2, 0.95, 0, -0.28, 0.5, 0, false);
    addArm(0.2, 0.95, 0, 0.28, 0.5, 0, true);

    // ========== LEGS ==========
    const addLeg = (side) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.08, 0.5, 0);

      // Shorts
      const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 12), shortsMat);
      shorts.position.y = -0.05;
      legGroup.add(shorts);

      // Leg
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.2, 4, 12), skinMat);
      leg.position.y = -0.2;
      legGroup.add(leg);

      // Shoe
      const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), shoeMat);
      shoe.position.set(0, -0.35, 0.02);
      shoe.scale.set(1, 0.7, 1.3);
      legGroup.add(shoe);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    };

    addLeg(-1);
    addLeg(1);
  }
}
