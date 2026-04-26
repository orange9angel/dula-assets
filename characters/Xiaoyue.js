import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Xiaoyue (小月) — 温柔的小女孩，星空守护者
 * 银色短发，穿着星空斗篷，眼睛像月牙
 */
export class Xiaoyue extends CharacterBase {
  constructor() {
    super('Xiaoyue');
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

    const skinMat = new THREE.MeshToonMaterial({ color: 0xffe8d6, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0xc0c8d8, gradientMap: toonGradient });
    const cloakMat = new THREE.MeshToonMaterial({ color: 0x2d3561, gradientMap: toonGradient });
    const cloakInnerMat = new THREE.MeshToonMaterial({ color: 0x4a5a8a, gradientMap: toonGradient });
    const eyeMat = new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x1a1a3a, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const bootMat = new THREE.MeshToonMaterial({ color: 0x4a3728, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.75;

    // Face
    const faceGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.scale.set(1.05, 1.1, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Chin
    const chinGeo = new THREE.SphereGeometry(0.16, 24, 24);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.18, 0.1);
    chin.scale.set(1.1, 0.7, 0.9);
    headGroup.add(chin);

    // Hair (short silver, covers top and back)
    const hairGeo = new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.6);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.04, -0.04);
    headGroup.add(hair);

    // Back hair volume
    const backHairGeo = new THREE.SphereGeometry(0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const backHair = new THREE.Mesh(backHairGeo, hairMat);
    backHair.position.set(0, 0.02, -0.08);
    backHair.rotation.x = Math.PI * 0.85;
    headGroup.add(backHair);

    // Bangs (swept to side)
    const bangGeo = new THREE.BoxGeometry(0.08, 0.14, 0.015);
    for (let i = -2; i <= 2; i++) {
      const bang = new THREE.Mesh(bangGeo, hairMat);
      bang.position.set(i * 0.06, 0.18, 0.28);
      bang.rotation.x = -0.25;
      bang.rotation.z = i * 0.1 - 0.15;
      headGroup.add(bang);
    }

    // ========== CRESCENT MOON EYES ==========
    const createCrescent = (radius, thickness) => {
      const shape = new THREE.Shape();
      const points = 24;
      // Outer arc
      for (let i = 0; i <= points; i++) {
        const a = (i / points) * Math.PI + Math.PI;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      // Inner arc (smaller radius, reversed)
      for (let i = points; i >= 0; i--) {
        const a = (i / points) * Math.PI + Math.PI;
        const x = Math.cos(a) * (radius - thickness);
        const y = Math.sin(a) * (radius - thickness);
        shape.lineTo(x, y);
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false });
      return geo;
    };

    const crescentGeo = createCrescent(0.07, 0.025);

    // Left crescent eye
    const leftEye = new THREE.Mesh(crescentGeo, eyeMat);
    leftEye.position.set(-0.12, 0.03, 0.26);
    leftEye.rotation.x = -0.1;
    headGroup.add(leftEye);

    // Right crescent eye
    const rightEye = new THREE.Mesh(crescentGeo, eyeMat);
    rightEye.position.set(0.12, 0.03, 0.26);
    rightEye.rotation.x = -0.1;
    rightEye.rotation.z = Math.PI; // flip for other eye
    headGroup.add(rightEye);

    // Pupils (small dots)
    const pupilGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.12, 0.02, 0.3);
    leftPupil.userData.baseX = leftPupil.position.x;
    headGroup.add(leftPupil);
    this.leftPupil = leftPupil;

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.12, 0.02, 0.3);
    rightPupil.userData.baseX = rightPupil.position.x;
    headGroup.add(rightPupil);
    this.rightPupil = rightPupil;

    // Highlights
    const hlGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const leftHl = new THREE.Mesh(hlGeo, whiteMat);
    leftHl.position.set(-0.1, 0.05, 0.32);
    headGroup.add(leftHl);

    const rightHl = new THREE.Mesh(hlGeo, whiteMat);
    rightHl.position.set(0.14, 0.05, 0.32);
    headGroup.add(rightHl);

    // Eyebrows (gentle curves)
    const browCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.04, 0, 0),
      new THREE.Vector3(0, 0.015, 0),
      new THREE.Vector3(0.04, 0, 0)
    );
    const browGeo = new THREE.TubeGeometry(browCurve, 8, 0.003, 8, false);
    const leftBrow = new THREE.Mesh(browGeo, hairMat);
    leftBrow.position.set(-0.12, 0.14, 0.27);
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, hairMat);
    rightBrow.position.set(0.12, 0.14, 0.27);
    headGroup.add(rightBrow);

    // Mouth (small gentle smile)
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.025, -0.08, 0.28),
      new THREE.Vector3(0, -0.095, 0.3),
      new THREE.Vector3(0.025, -0.08, 0.28)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 10, 0.004, 8, false);
    const smile = new THREE.Mesh(smileGeo, new THREE.MeshToonMaterial({ color: 0xff8da1, gradientMap: toonGradient }));
    headGroup.add(smile);
    this.mouth = smile;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    // Blush
    const blushMat = new THREE.MeshToonMaterial({ color: 0xffaaaa, gradientMap: toonGradient, transparent: true, opacity: 0.4 });
    const blushGeo = new THREE.SphereGeometry(0.03, 16, 16);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.18, -0.02, 0.22);
    leftBlush.scale.set(1, 0.6, 0.4);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.18, -0.02, 0.22);
    rightBlush.scale.set(1, 0.6, 0.4);
    headGroup.add(rightBlush);

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.1, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.58;
    this.mesh.add(neck);

    // ========== CLOAK (star-patterned dark blue) ==========
    // Outer cloak (cone shape)
    const cloakGeo = new THREE.ConeGeometry(0.55, 1.1, 32, 1, true);
    const cloak = new THREE.Mesh(cloakGeo, cloakMat);
    cloak.position.y = 1.0;
    cloak.castShadow = true;
    this.mesh.add(cloak);

    // Inner lining
    const innerGeo = new THREE.ConeGeometry(0.52, 1.05, 32, 1, true);
    const inner = new THREE.Mesh(innerGeo, cloakInnerMat);
    inner.position.y = 1.0;
    inner.scale.x = -1; // flip inside
    this.mesh.add(inner);

    // Cloak hood (down, around shoulders)
    const hoodGeo = new THREE.SphereGeometry(0.38, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const hood = new THREE.Mesh(hoodGeo, cloakMat);
    hood.position.set(0, 1.55, -0.05);
    hood.rotation.x = Math.PI;
    this.mesh.add(hood);

    // Star decorations on cloak (small golden stars)
    const starDecoGeo = createCrescent(0.04, 0.012);
    for (let i = 0; i < 5; i++) {
      const star = new THREE.Mesh(starDecoGeo, eyeMat);
      const angle = (i / 5) * Math.PI * 2 + 0.3;
      star.position.set(Math.cos(angle) * 0.35, 0.8 + Math.sin(i) * 0.2, Math.sin(angle) * 0.35 + 0.05);
      star.rotation.y = -angle;
      star.rotation.z = Math.PI / 2;
      this.mesh.add(star);
    }

    // ========== ARMS + HANDS ==========
    const handGeo = new THREE.SphereGeometry(0.055, 16, 16);

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

      const handMesh = new THREE.Mesh(handGeo, skinMat);
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

    addArm(-0.28, 1.35, 0, -0.35, 0.85, 0, false);
    addArm(0.28, 1.35, 0, 0.35, 0.85, 0, true);

    // ========== LEGS + BOOTS ==========
    const legGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.35, 16);
    const bootGeo = new THREE.SphereGeometry(0.09, 16, 16);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.1, 0.55, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, skinMat);
    leftLegMesh.position.y = -0.175;
    leftLegGroup.add(leftLegMesh);
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(0, -0.35, 0.03);
    leftBoot.scale.set(1, 0.7, 1.4);
    leftLegGroup.add(leftBoot);
    this.mesh.add(leftLegGroup);
    this.leftLeg = leftLegGroup;

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.1, 0.55, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, skinMat);
    rightLegMesh.position.y = -0.175;
    rightLegGroup.add(rightLegMesh);
    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0, -0.35, 0.03);
    rightBoot.scale.set(1, 0.7, 1.4);
    rightLegGroup.add(rightBoot);
    this.mesh.add(rightLegGroup);
    this.rightLeg = rightLegGroup;

    // ========== LETTER PROP (glowing starlight letter) ==========
    this.letterGroup = new THREE.Group();
    this.letterGroup.visible = false;

    // Envelope body
    const envelopeGeo = new THREE.BoxGeometry(0.18, 0.12, 0.02);
    const envelopeMat = new THREE.MeshToonMaterial({ color: 0xf5e6c8, gradientMap: toonGradient });
    const envelope = new THREE.Mesh(envelopeGeo, envelopeMat);
    this.letterGroup.add(envelope);

    // Envelope flap (V shape)
    const flapShape = new THREE.Shape();
    flapShape.moveTo(-0.09, 0);
    flapShape.lineTo(0, 0.06);
    flapShape.lineTo(0.09, 0);
    flapShape.lineTo(-0.09, 0);
    const flapGeo = new THREE.ExtrudeGeometry(flapShape, { depth: 0.005, bevelEnabled: false });
    const flapMat = new THREE.MeshToonMaterial({ color: 0xe8d5b0, gradientMap: toonGradient });
    const flap = new THREE.Mesh(flapGeo, flapMat);
    flap.position.set(0, 0, 0.012);
    this.letterGroup.add(flap);

    // Star seal
    const sealGeo = new THREE.CircleGeometry(0.02, 5);
    const sealMat = new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient });
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.position.set(0, 0.01, 0.016);
    this.letterGroup.add(seal);

    // Glow effect (point light + emissive mesh)
    const glowGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.15,
    });
    this.letterGlow = new THREE.Mesh(glowGeo, glowMat);
    this.letterGroup.add(this.letterGlow);

    // Position in right hand
    this.letterGroup.position.set(0.35, 0.85, 0.15);
    this.letterGroup.rotation.x = -0.3;
    this.letterGroup.rotation.z = -0.2;
    this.mesh.add(this.letterGroup);
  }

  attachLetter() {
    if (this.letterGroup) this.letterGroup.visible = true;
  }

  detachLetter() {
    if (this.letterGroup) this.letterGroup.visible = false;
  }

  /**
   * Set riding pose — Xiaoyue hugs Xingzai from behind while flying
   * Arms wrapped around, legs tucked, cloak billowing back
   */
  setRidingPose(active) {
    this._isRiding = active;
    if (!active) {
      // Reset to default pose
      if (this.leftArm) {
        this.leftArm.rotation.z = this.leftArmBaseZ || 0;
        this.leftArm.rotation.x = 0;
      }
      if (this.rightArm) {
        this.rightArm.rotation.z = this.rightArmBaseZ || 0;
        this.rightArm.rotation.x = 0;
      }
      if (this.leftLeg) this.leftLeg.rotation.x = 0;
      if (this.rightLeg) this.rightLeg.rotation.x = 0;
      if (this.headGroup) this.headGroup.rotation.x = 0;
      return;
    }

    // Arms wrapped around Xingzai's neck/body
    if (this.leftArm) {
      this.leftArm.rotation.z = (this.leftArmBaseZ || 0) + 1.2;
      this.leftArm.rotation.x = -0.5;
    }
    if (this.rightArm) {
      this.rightArm.rotation.z = (this.rightArmBaseZ || 0) - 1.2;
      this.rightArm.rotation.x = -0.5;
    }

    // Legs tucked back (dangling in wind)
    if (this.leftLeg) this.leftLeg.rotation.x = 0.4;
    if (this.rightLeg) this.rightLeg.rotation.x = 0.3;

    // Head looks forward excitedly
    if (this.headGroup) this.headGroup.rotation.x = -0.2;
  }

  update(time, delta) {
    super.update(time, delta);
    // Animate letter glow pulse
    if (this.letterGroup?.visible && this.letterGlow) {
      const pulse = 0.15 + Math.sin(time * 3) * 0.05;
      this.letterGlow.material.opacity = pulse;
      this.letterGlow.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
    }

    // Riding animation: cloak billowing, gentle bob
    if (this._isRiding) {
      // Cloak billowing effect (if we had a separate cloak mesh to animate)
      // For now, subtle body vibration from wind
      if (this.mesh) {
        this.mesh.position.y += Math.sin(time * 8) * 0.003;
      }
    }
  }
}
