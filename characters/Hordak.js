import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Hordak (霍达克) — Leader of the Horde, main villain
 * 高大威严的反派，白色皮肤，红色眼睛，机械装甲
 * 蝙蝠般的特征，披着黑色斗篷
 */
export class Hordak extends CharacterBase {
  constructor() {
    super('Hordak');
    this.boundingRadius = 0.65;
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

    const skinMat = new THREE.MeshToonMaterial({ color: 0xe8e8e8, gradientMap: toonGradient });
    const armorMat = new THREE.MeshToonMaterial({ color: 0x424242, gradientMap: toonGradient });
    const darkArmorMat = new THREE.MeshToonMaterial({ color: 0x212121, gradientMap: toonGradient });
    const redMat = new THREE.MeshToonMaterial({ color: 0xc62828, gradientMap: toonGradient });
    const eyeMat = new THREE.MeshToonMaterial({ color: 0xff0000, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x000000, gradientMap: toonGradient });
    const capeMat = new THREE.MeshToonMaterial({ color: 0x1a1a2e, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 2.0;

    // Face (angular, gaunt)
    const faceGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.scale.set(0.9, 1.2, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Chin (sharp)
    const chinGeo = new THREE.ConeGeometry(0.12, 0.2, 4);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.35, 0.1);
    chin.rotation.x = Math.PI;
    headGroup.add(chin);

    // Bald head (no hair)
    // Bat-like ears (large, pointed)
    for (const side of [-1, 1]) {
      const earShape = new THREE.Shape();
      earShape.moveTo(0, 0);
      earShape.lineTo(side * 0.15, 0.25);
      earShape.lineTo(side * 0.08, 0.05);
      earShape.lineTo(0, 0);
      const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: 0.03, bevelEnabled: false });
      const ear = new THREE.Mesh(earGeo, skinMat);
      ear.position.set(side * 0.22, 0.15, 0);
      headGroup.add(ear);
    }

    // Eyes (glowing red, menacing)
    const eyeGeo = new THREE.SphereGeometry(0.07, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(side * 0.1, 0.05, 0.24);
      eye.scale.set(1, 0.8, 0.5);
      headGroup.add(eye);

      // Pupil (small, black)
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), pupilMat);
      pupil.position.set(side * 0.1, 0.05, 0.27);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      // Eye glow
      const glowGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 }));
      glow.position.set(side * 0.1, 0.05, 0.24);
      headGroup.add(glow);
    }

    // Eyebrows (furrowed, angry)
    const browCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.04, 0, 0),
      new THREE.Vector3(0, -0.02, 0),
      new THREE.Vector3(0.04, 0, 0)
    );
    const browGeo = new THREE.TubeGeometry(browCurve, 8, 0.005, 8, false);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, darkArmorMat);
      brow.position.set(side * 0.1, 0.14, 0.26);
      headGroup.add(brow);
    }

    // Mouth (thin, grim line)
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.03, -0.15, 0.25),
      new THREE.Vector3(0, -0.15, 0.26),
      new THREE.Vector3(0.03, -0.15, 0.25)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 10, 0.003, 8, false);
    const mouth = new THREE.Mesh(mouthGeo, new THREE.MeshToonMaterial({ color: 0x660000, gradientMap: toonGradient }));
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.15, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.82;
    this.mesh.add(neck);

    // ========== BODY / ARMOR ==========
    // Broad shoulders, armored chest
    const chestGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.6, 16);
    const chest = new THREE.Mesh(chestGeo, armorMat);
    chest.position.y = 1.5;
    chest.castShadow = true;
    this.mesh.add(chest);

    // Chest emblem (red H)
    const emblemGeo = new THREE.BoxGeometry(0.15, 0.15, 0.03);
    const emblem = new THREE.Mesh(emblemGeo, redMat);
    emblem.position.set(0, 1.55, 0.28);
    this.mesh.add(emblem);

    // Shoulder armor (large, spiked)
    for (const side of [-1, 1]) {
      const shoulderGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const shoulder = new THREE.Mesh(shoulderGeo, darkArmorMat);
      shoulder.position.set(side * 0.4, 1.7, 0);
      shoulder.scale.set(1, 0.8, 0.9);
      this.mesh.add(shoulder);

      // Spike on shoulder
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.15, 4);
      const spike = new THREE.Mesh(spikeGeo, darkArmorMat);
      spike.position.set(side * 0.45, 1.85, 0);
      this.mesh.add(spike);
    }

    // Dark cape
    const capeGeo = new THREE.PlaneGeometry(1.0, 1.5);
    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, 1.4, -0.4);
    cape.rotation.x = 0.1;
    this.mesh.add(cape);
    this.cape = cape;

    // Lower body
    const waistGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.4, 16);
    const waist = new THREE.Mesh(waistGeo, darkArmorMat);
    waist.position.y = 1.0;
    this.mesh.add(waist);

    // Legs (armored)
    const legArmorGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.5, 16);
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(legArmorGeo, armorMat);
      leg.position.set(side * 0.15, 0.55, 0);
      this.mesh.add(leg);

      // Boot
      const bootGeo = new THREE.SphereGeometry(0.13, 16, 16);
      const boot = new THREE.Mesh(bootGeo, darkArmorMat);
      boot.position.set(side * 0.15, 0.2, 0.03);
      boot.scale.set(1, 0.7, 1.3);
      this.mesh.add(boot);
    }

    // ========== ARMS ==========
    const handGeo = new THREE.SphereGeometry(0.07, 16, 16);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.14);
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, capLen, 4, 16), armorMat);
      armMesh.position.y = -len / 2;
      group.add(armMesh);

      // Gauntlet
      const gauntletGeo = new THREE.CylinderGeometry(0.075, 0.08, 0.15, 12);
      const gauntlet = new THREE.Mesh(gauntletGeo, darkArmorMat);
      gauntlet.position.y = -len * 0.7;
      group.add(gauntlet);

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

    addArm(-0.42, 1.55, 0, -0.5, 0.9, 0, false);
    addArm(0.42, 1.55, 0, 0.5, 0.9, 0, true);

    // ========== STAFF (prop) ==========
    this.staffGroup = new THREE.Group();
    this.staffGroup.visible = false;

    const staffShaftGeo = new THREE.CylinderGeometry(0.02, 0.025, 1.8, 8);
    const staffShaft = new THREE.Mesh(staffShaftGeo, darkArmorMat);
    staffShaft.position.y = 0.9;
    this.staffGroup.add(staffShaft);

    // Staff head (skull-like)
    const staffHeadGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const staffHead = new THREE.Mesh(staffHeadGeo, redMat);
    staffHead.position.y = 1.85;
    this.staffGroup.add(staffHead);

    // Staff glow
    const staffGlowGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const staffGlow = new THREE.Mesh(staffGlowGeo, new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.15 }));
    staffGlow.position.y = 1.85;
    this.staffGroup.add(staffGlow);
    this.staffGlow = staffGlow;

    // Position in right hand
    this.staffGroup.position.set(0.5, 0.9, 0.2);
    this.mesh.add(this.staffGroup);
  }

  attachStaff() {
    if (this.staffGroup) this.staffGroup.visible = true;
  }

  detachStaff() {
    if (this.staffGroup) this.staffGroup.visible = false;
  }

  update(time, delta) {
    super.update(time, delta);
    // Staff glow pulse
    if (this.staffGroup?.visible && this.staffGlow) {
      const pulse = 0.15 + Math.sin(time * 2) * 0.08;
      this.staffGlow.material.opacity = pulse;
      this.staffGlow.scale.setScalar(1 + Math.sin(time * 2) * 0.2);
    }
    // Cape movement
    if (this.cape) {
      this.cape.rotation.z = Math.sin(time * 0.8) * 0.04;
    }
    // Eye glow pulse
    if (this.headGroup) {
      this.headGroup.children.forEach((child) => {
        if (child.material && child.material.transparent) {
          child.material.opacity = 0.15 + Math.sin(time * 4) * 0.08;
        }
      });
    }
  }
}
