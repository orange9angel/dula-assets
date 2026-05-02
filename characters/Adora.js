import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Adora (阿多拉) — She-Ra's alter ego
 * 白色短发，穿着霍达克军团制服（红色+黑色）
 * 比 SheRa 更中性、更干练的造型
 */
export class Adora extends CharacterBase {
  constructor() {
    super('Adora');
    this.boundingRadius = 0.55;
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

    const skinMat = new THREE.MeshToonMaterial({ color: 0xffe0c0, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0xf5f5f5, gradientMap: toonGradient });
    const uniformMat = new THREE.MeshToonMaterial({ color: 0x333333, gradientMap: toonGradient });
    const redMat = new THREE.MeshToonMaterial({ color: 0xb71c1c, gradientMap: toonGradient });
    const eyeMat = new THREE.MeshToonMaterial({ color: 0x2196f3, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x1a1a3a, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const bootMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.75;

    // Face
    const faceGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.scale.set(1.0, 1.12, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Chin
    const chinGeo = new THREE.SphereGeometry(0.16, 24, 24);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.18, 0.1);
    chin.scale.set(1.1, 0.7, 0.9);
    headGroup.add(chin);

    // Short white hair (pixie cut style)
    const hairGeo = new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.06, -0.02);
    headGroup.add(hair);

    // Side hair (short, swept)
    for (const side of [-1, 1]) {
      const sideHairGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI, 0, Math.PI * 0.6);
      const sideHair = new THREE.Mesh(sideHairGeo, hairMat);
      sideHair.position.set(side * 0.24, 0.0, -0.05);
      sideHair.rotation.z = side * Math.PI * 0.25;
      headGroup.add(sideHair);
    }

    // Eyes (determined blue)
    const eyeWhiteGeo = new THREE.SphereGeometry(0.085, 16, 16);
    for (const side of [-1, 1]) {
      const eyeWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
      eyeWhite.position.set(side * 0.1, 0.03, 0.25);
      eyeWhite.scale.set(1, 1.2, 0.6);
      headGroup.add(eyeWhite);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), eyeMat);
      iris.position.set(side * 0.1, 0.03, 0.29);
      iris.scale.set(1, 1.2, 0.5);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), pupilMat);
      pupil.position.set(side * 0.1, 0.03, 0.31);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), whiteMat);
      hl.position.set(side * 0.08, 0.06, 0.32);
      headGroup.add(hl);
    }

    // Eyebrows (straight, serious)
    const browCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.04, 0, 0),
      new THREE.Vector3(0, 0.005, 0),
      new THREE.Vector3(0.04, 0, 0)
    );
    const browGeo = new THREE.TubeGeometry(browCurve, 8, 0.004, 8, false);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairMat);
      brow.position.set(side * 0.1, 0.13, 0.27);
      headGroup.add(brow);
    }

    // Mouth (serious line)
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.025, -0.09, 0.27),
      new THREE.Vector3(0, -0.09, 0.28),
      new THREE.Vector3(0.025, -0.09, 0.27)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 10, 0.003, 8, false);
    const mouth = new THREE.Mesh(mouthGeo, new THREE.MeshToonMaterial({ color: 0xc06060, gradientMap: toonGradient }));
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.1, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.58;
    this.mesh.add(neck);

    // ========== BODY / UNIFORM ==========
    // Torso (dark uniform)
    const torsoGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 16);
    const torso = new THREE.Mesh(torsoGeo, uniformMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Red chest insignia (Horde symbol simplified)
    const insigniaGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const insignia = new THREE.Mesh(insigniaGeo, redMat);
    insignia.position.set(0, 1.4, 0.2);
    insignia.scale.set(1.2, 0.8, 0.3);
    this.mesh.add(insignia);

    // Red shoulder pads
    for (const side of [-1, 1]) {
      const padGeo = new THREE.SphereGeometry(0.1, 12, 12);
      const pad = new THREE.Mesh(padGeo, redMat);
      pad.position.set(side * 0.28, 1.48, 0);
      pad.scale.set(1, 0.6, 0.8);
      this.mesh.add(pad);
    }

    // Pants (dark)
    const pantsGeo = new THREE.ConeGeometry(0.3, 0.7, 16, 1, true);
    const pants = new THREE.Mesh(pantsGeo, uniformMat);
    pants.position.y = 0.7;
    this.mesh.add(pants);

    // ========== ARMS ==========
    const handGeo = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), skinMat);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.11);
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, capLen, 4, 16), skinMat);
      armMesh.position.y = -len / 2;
      group.add(armMesh);

      // Red arm band
      const bandGeo = new THREE.TorusGeometry(0.05, 0.01, 8, 16);
      const band = new THREE.Mesh(bandGeo, redMat);
      band.position.y = -len * 0.5;
      band.rotation.x = Math.PI / 2;
      group.add(band);

      const handMesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), skinMat);
      handMesh.position.y = -len;
      group.add(handMesh);

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

    addArm(-0.28, 1.4, 0, -0.38, 0.85, 0, false);
    addArm(0.28, 1.4, 0, 0.38, 0.85, 0, true);

    // ========== LEGS + BOOTS ==========
    const legGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.35, 16);
    const bootGeo = new THREE.SphereGeometry(0.09, 16, 16);

    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.1, 0.55, 0);
      const legMesh = new THREE.Mesh(legGeo, uniformMat);
      legMesh.position.y = -0.175;
      legGroup.add(legMesh);

      const boot = new THREE.Mesh(bootGeo, bootMat);
      boot.position.set(0, -0.35, 0.03);
      boot.scale.set(1, 0.7, 1.4);
      legGroup.add(boot);

      // Red boot stripe
      const stripeGeo = new THREE.TorusGeometry(0.07, 0.008, 8, 16);
      const stripe = new THREE.Mesh(stripeGeo, redMat);
      stripe.position.set(0, -0.3, 0.03);
      stripe.rotation.x = Math.PI / 2;
      legGroup.add(stripe);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }

    // ========== SWORD (she transforms with this) ==========
    this.swordGroup = new THREE.Group();
    this.swordGroup.visible = false;

    const bladeGeo = new THREE.BoxGeometry(0.035, 1.0, 0.008);
    const bladeMat = new THREE.MeshToonMaterial({ color: 0xcccccc, gradientMap: toonGradient });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.5;
    this.swordGroup.add(blade);

    const hiltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
    const hilt = new THREE.Mesh(hiltGeo, redMat);
    hilt.position.y = -0.1;
    this.swordGroup.add(hilt);

    const guardGeo = new THREE.BoxGeometry(0.2, 0.03, 0.02);
    const guard = new THREE.Mesh(guardGeo, redMat);
    guard.position.y = 0.0;
    this.swordGroup.add(guard);

    // Position in right hand
    this.swordGroup.position.set(0.38, 0.85, 0.15);
    this.swordGroup.rotation.x = -0.3;
    this.swordGroup.rotation.z = -0.2;
    this.mesh.add(this.swordGroup);
  }

  attachSword() {
    if (this.swordGroup) this.swordGroup.visible = true;
  }

  detachSword() {
    if (this.swordGroup) this.swordGroup.visible = false;
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
