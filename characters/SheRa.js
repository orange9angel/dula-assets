import * as THREE from 'three';
import { CharacterBase, GlowEffect } from 'dula-engine';

/**
 * She-Ra (希瑞) — Princess of Power
 * 金色长发，白色长裙配红色披风，手持力量之剑
 * 高大威严的女性战士形象
 */
export class SheRa extends CharacterBase {
  constructor() {
    super('SheRa');
    this.boundingRadius = 0.6;
    this.archetypes = ['humanoid', 'fighter', 'athletic', 'agile'];
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
    const hairMat = new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient });
    const dressMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const goldMat = new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient });
    const redMat = new THREE.MeshToonMaterial({ color: 0xd32f2f, gradientMap: toonGradient });
    const eyeMat = new THREE.MeshToonMaterial({ color: 0x2196f3, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x1a1a3a, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const bootMat = new THREE.MeshToonMaterial({ color: 0xd32f2f, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.85;

    // Face
    const faceGeo = new THREE.SphereGeometry(0.32, 32, 32);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.scale.set(1.0, 1.15, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Chin
    const chinGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.2, 0.12);
    chin.scale.set(1.1, 0.75, 0.9);
    headGroup.add(chin);

    // Long golden hair (flowing back)
    const hairGeo = new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.8);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.08, -0.05);
    headGroup.add(hair);

    // Back hair (long flowing)
    const backHairGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 16);
    const backHair = new THREE.Mesh(backHairGeo, hairMat);
    backHair.position.set(0, -0.3, -0.25);
    backHair.rotation.x = 0.3;
    headGroup.add(backHair);

    // Side hair panels
    for (const side of [-1, 1]) {
      const sideHairGeo = new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI, 0, Math.PI * 0.7);
      const sideHair = new THREE.Mesh(sideHairGeo, hairMat);
      sideHair.position.set(side * 0.28, 0.0, -0.08);
      sideHair.rotation.z = side * Math.PI * 0.3;
      headGroup.add(sideHair);
    }

    // Tiara (gold headband with red gem)
    const tiaraGeo = new THREE.TorusGeometry(0.3, 0.025, 8, 32, Math.PI);
    const tiara = new THREE.Mesh(tiaraGeo, goldMat);
    tiara.position.set(0, 0.18, 0.15);
    tiara.rotation.x = -0.2;
    headGroup.add(tiara);

    // Red gem on tiara
    const gemGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const gem = new THREE.Mesh(gemGeo, redMat);
    gem.position.set(0, 0.22, 0.28);
    headGroup.add(gem);

    // Eyes (large blue)
    const eyeWhiteGeo = new THREE.SphereGeometry(0.09, 16, 16);
    for (const side of [-1, 1]) {
      const eyeWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
      eyeWhite.position.set(side * 0.11, 0.04, 0.26);
      eyeWhite.scale.set(1, 1.2, 0.6);
      headGroup.add(eyeWhite);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), eyeMat);
      iris.position.set(side * 0.11, 0.04, 0.3);
      iris.scale.set(1, 1.2, 0.5);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), pupilMat);
      pupil.position.set(side * 0.11, 0.04, 0.32);
      pupil.userData.baseX = pupil.position.x;
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;
      headGroup.add(pupil);

      // Highlight
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), whiteMat);
      hl.position.set(side * 0.09, 0.07, 0.33);
      headGroup.add(hl);
    }

    // Eyebrows (strong, confident)
    const browCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.05, 0, 0),
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0.05, 0, 0)
    );
    const browGeo = new THREE.TubeGeometry(browCurve, 8, 0.004, 8, false);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairMat);
      brow.position.set(side * 0.11, 0.16, 0.28);
      headGroup.add(brow);
    }

    // Mouth (confident smile)
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.03, -0.1, 0.28),
      new THREE.Vector3(0, -0.12, 0.3),
      new THREE.Vector3(0.03, -0.1, 0.28)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 10, 0.004, 8, false);
    const smile = new THREE.Mesh(smileGeo, new THREE.MeshToonMaterial({ color: 0xd06060, gradientMap: toonGradient }));
    headGroup.add(smile);
    this.mouth = smile;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.12, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.68;
    this.mesh.add(neck);

    // ========== BODY / DRESS ==========
    // Torso (white dress top)
    const torsoGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.55, 16);
    const torso = new THREE.Mesh(torsoGeo, dressMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Gold chest plate
    const chestGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const chest = new THREE.Mesh(chestGeo, goldMat);
    chest.position.set(0, 1.45, 0.12);
    chest.rotation.x = -0.3;
    this.mesh.add(chest);

    // Red cape
    const capeGeo = new THREE.PlaneGeometry(0.7, 1.2);
    const cape = new THREE.Mesh(capeGeo, redMat);
    cape.position.set(0, 1.3, -0.35);
    cape.rotation.x = 0.15;
    this.mesh.add(cape);
    this.cape = cape;

    // Skirt (white flowing)
    const skirtGeo = new THREE.ConeGeometry(0.45, 0.9, 32, 1, true);
    const skirt = new THREE.Mesh(skirtGeo, dressMat);
    skirt.position.y = 0.65;
    skirt.castShadow = true;
    this.mesh.add(skirt);

    // Gold belt
    const beltGeo = new THREE.TorusGeometry(0.26, 0.03, 8, 32);
    const belt = new THREE.Mesh(beltGeo, goldMat);
    belt.position.y = 1.05;
    belt.rotation.x = Math.PI / 2;
    this.mesh.add(belt);

    // ========== ARMS ==========
    const handGeo = new THREE.SphereGeometry(0.06, 16, 16);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.12);
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, capLen, 4, 16), skinMat);
      armMesh.position.y = -len / 2;
      group.add(armMesh);

      // Gold arm band
      const bandGeo = new THREE.TorusGeometry(0.055, 0.012, 8, 16);
      const band = new THREE.Mesh(bandGeo, goldMat);
      band.position.y = -len * 0.6;
      band.rotation.x = Math.PI / 2;
      group.add(band);

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

    addArm(-0.3, 1.45, 0, -0.4, 0.9, 0, false);
    addArm(0.3, 1.45, 0, 0.4, 0.9, 0, true);

    // ========== LEGS + BOOTS ==========
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 16);
    const bootGeo = new THREE.SphereGeometry(0.1, 16, 16);

    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.12, 0.6, 0);
      const legMesh = new THREE.Mesh(legGeo, skinMat);
      legMesh.position.y = -0.2;
      legGroup.add(legMesh);

      // Red boot
      const boot = new THREE.Mesh(bootGeo, bootMat);
      boot.position.set(0, -0.42, 0.03);
      boot.scale.set(1, 0.8, 1.3);
      legGroup.add(boot);

      // Gold boot trim
      const trimGeo = new THREE.TorusGeometry(0.08, 0.01, 8, 16);
      const trim = new THREE.Mesh(trimGeo, goldMat);
      trim.position.set(0, -0.35, 0.03);
      trim.rotation.x = Math.PI / 2;
      legGroup.add(trim);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }

    // ========== SWORD OF POWER (prop) ==========
    this.swordGroup = new THREE.Group();
    this.swordGroup.visible = false;

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.04, 1.2, 0.01);
    const bladeMat = new THREE.MeshToonMaterial({ color: 0xeeeeee, gradientMap: toonGradient, emissive: 0x88ccff, emissiveIntensity: 0.3 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.6;
    this.swordGroup.add(blade);

    // Hilt
    const hiltGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 8);
    const hilt = new THREE.Mesh(hiltGeo, goldMat);
    hilt.position.y = 0.0;
    this.swordGroup.add(hilt);

    // Crossguard
    const guardGeo = new THREE.BoxGeometry(0.25, 0.04, 0.03);
    const guard = new THREE.Mesh(guardGeo, goldMat);
    guard.position.y = 0.12;
    this.swordGroup.add(guard);

    // Pommel gem
    const pommelGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pommel = new THREE.Mesh(pommelGeo, redMat);
    pommel.position.y = -0.14;
    this.swordGroup.add(pommel);

    // Glow effect — using reusable GlowEffect component
    const swordGlow = new GlowEffect({
      color: 0x88ccff,
      size: 0.3,
      intensity: 0.1,
      pulseSpeed: 3.0,
      pulseRange: 0.05,
    });
    swordGlow.mesh.position.y = 0.6;
    this.addLightEffect('swordGlow', swordGlow, this.swordGroup);
    this.swordGlow = swordGlow.mesh; // keep backward compat for external refs

    // Position in right hand
    this.swordGroup.position.set(0.4, 0.9, 0.2);
    this.swordGroup.rotation.x = -0.2;
    this.swordGroup.rotation.z = -0.3;
    this.mesh.add(this.swordGroup);

    // ========== SHIELD (prop) ==========
    this.shieldGroup = new THREE.Group();
    this.shieldGroup.visible = false;

    const shieldGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.03, 32);
    const shieldMat2 = new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient });
    const shield = new THREE.Mesh(shieldGeo, shieldMat2);
    shield.rotation.x = Math.PI / 2;
    this.shieldGroup.add(shield);

    // Shield emblem (red heart)
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.1);
    heartShape.bezierCurveTo(0.1, 0.15, 0.15, 0.05, 0, -0.05);
    heartShape.bezierCurveTo(-0.15, 0.05, -0.1, 0.15, 0, 0.1);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.01, bevelEnabled: false });
    const heart = new THREE.Mesh(heartGeo, redMat);
    heart.position.z = 0.02;
    this.shieldGroup.add(heart);

    // Position in left hand
    this.shieldGroup.position.set(-0.4, 0.9, 0.2);
    this.shieldGroup.rotation.y = 0.3;
    this.mesh.add(this.shieldGroup);
  }

  attachSword() {
    if (this.swordGroup) this.swordGroup.visible = true;
  }

  detachSword() {
    if (this.swordGroup) this.swordGroup.visible = false;
  }

  attachShield() {
    if (this.shieldGroup) this.shieldGroup.visible = true;
  }

  detachShield() {
    if (this.shieldGroup) this.shieldGroup.visible = false;
  }

  /**
   * Set battle stance — sword raised, shield forward
   */
  setBattleStance(active) {
    if (!active) {
      if (this.leftArm) this.leftArm.rotation.z = this.leftArmBaseZ || 0;
      if (this.rightArm) this.rightArm.rotation.z = this.rightArmBaseZ || 0;
      if (this.leftArm) this.leftArm.rotation.x = 0;
      if (this.rightArm) this.rightArm.rotation.x = 0;
      return;
    }
    // Right arm raises sword
    if (this.rightArm) {
      this.rightArm.rotation.z = (this.rightArmBaseZ || 0) - 0.8;
      this.rightArm.rotation.x = -0.5;
    }
    // Left arm holds shield forward
    if (this.leftArm) {
      this.leftArm.rotation.z = (this.leftArmBaseZ || 0) + 0.6;
      this.leftArm.rotation.x = -0.3;
    }
  }

  update(time, delta) {
    super.update(time, delta);
    this.updateLightEffects(time, delta);
    // Cape subtle movement
    if (this.cape) {
      this.cape.rotation.z = Math.sin(time * 1.5) * 0.03;
    }
  }
}
