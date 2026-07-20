import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Yuki (ユキ) — anime girl, classic capsule-and-ball primitive build.
 * Design (per docs/skills/character-modeler):
 *   - Silhouette: twin-tails + pleated skirt — readable at any distance
 *   - Proportions: 3-heads anime chibi, total height ≈ 1.6
 *   - Palette: brown hair / blue eyes / white sailor top / navy skirt / red neckerchief
 *   - Signature: twin tails (sway in update), ahoge cowlick, lash arcs
 */
export class Yuki extends CharacterBase {
  constructor() {
    super('Yuki');
    this.archetypes = ['humanoid', 'girl', 'anime'];
    this.boundingRadius = 0.6;
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

    const skinMat = new THREE.MeshToonMaterial({ color: 0xffe3d0, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x4a3428, gradientMap: toonGradient });
    const eyeWhiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x4a7ec7 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a22 });
    const uniformMat = new THREE.MeshToonMaterial({ color: 0xf8f8fa, gradientMap: toonGradient });
    const navyMat = new THREE.MeshToonMaterial({ color: 0x2a3a5e, gradientMap: toonGradient });
    const navyPleatMat = new THREE.MeshToonMaterial({ color: 0x2a3a5e, gradientMap: toonGradient, flatShading: true });
    const redMat = new THREE.MeshToonMaterial({ color: 0xd44a4a, gradientMap: toonGradient });
    const sockMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const shoeMat = new THREE.MeshToonMaterial({ color: 0x5a3a2a, gradientMap: toonGradient });
    const lipMat = new THREE.MeshBasicMaterial({ color: 0x8a3a3a });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff9a9a, transparent: true, opacity: 0.55 });

    // ── Head ────────────────────────────────────────────────────────────
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.28;
    this.headBaseY = 1.28;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.30, 32, 32), skinMat);
    head.scale.set(1, 1.05, 0.92);
    head.castShadow = true;
    headGroup.add(head);

    // Back-of-head hair mass — larger shell behind/above the face
    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.335, 32, 32), hairMat);
    hairBack.position.set(0, 0.045, -0.075);
    hairBack.scale.set(1.02, 1.08, 0.98);
    hairBack.castShadow = true;
    headGroup.add(hairBack);

    // Bangs — three flattened tufts over the forehead
    const bangGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const bangSpecs = [
      { x: 0, y: 0.225, z: 0.185, rz: 0, s: [1.1, 1.35, 0.55] },
      { x: -0.115, y: 0.21, z: 0.165, rz: 0.35, s: [1.0, 1.25, 0.55] },
      { x: 0.115, y: 0.21, z: 0.165, rz: -0.35, s: [1.0, 1.25, 0.55] },
    ];
    for (const b of bangSpecs) {
      const bang = new THREE.Mesh(bangGeo, hairMat);
      bang.position.set(b.x, b.y, b.z);
      bang.scale.set(...b.s);
      bang.rotation.z = b.rz;
      bang.rotation.x = 0.25;
      headGroup.add(bang);
    }

    // Side locks framing the face
    const lockGeo = new THREE.CapsuleGeometry(0.038, 0.16, 4, 12);
    for (const side of [-1, 1]) {
      const lock = new THREE.Mesh(lockGeo, hairMat);
      lock.position.set(side * 0.245, 0.02, 0.13);
      lock.rotation.z = side * 0.12;
      headGroup.add(lock);
    }

    // Twin tails — group per tail so update() can sway them
    const tailMainGeo = new THREE.CapsuleGeometry(0.072, 0.42, 4, 16);
    const tailTipGeo = new THREE.ConeGeometry(0.052, 0.14, 16);
    const tieGeo = new THREE.TorusGeometry(0.048, 0.018, 8, 16);
    for (const side of [-1, 1]) {
      const tail = new THREE.Group();
      tail.position.set(side * 0.28, 0.22, -0.04);
      tail.rotation.z = side * 0.24; // mostly drooping down
      tail.userData.baseRotZ = side * 0.24;

      const tie = new THREE.Mesh(tieGeo, redMat);
      tie.rotation.x = Math.PI / 2;
      tie.userData.noSketch = true; // small ring — hull would blob it
      tail.add(tie);

      const main = new THREE.Mesh(tailMainGeo, hairMat);
      main.position.y = -0.26;
      main.castShadow = true;
      tail.add(main);

      const tip = new THREE.Mesh(tailTipGeo, hairMat);
      tip.position.y = -0.54;
      tip.rotation.x = Math.PI; // point down
      tail.add(tip);

      headGroup.add(tail);
      if (side === -1) this.leftTail = tail;
      else this.rightTail = tail;
    }

    // Ahoge (cowlick) — signature curved sprout on top
    const ahoge = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.011, 6, 14, Math.PI * 0.85),
      hairMat
    );
    ahoge.position.set(0.01, 0.33, 0.03);
    ahoge.rotation.set(-0.5, 0.2, 0.6);
    ahoge.userData.noSketch = true; // thin curl — hull would swallow it
    headGroup.add(ahoge);
    this.ahoge = ahoge;

    // ── Face ────────────────────────────────────────────────────────────
    // Anime eye = layered lens: white → dark rim → iris → bottom glow → pupil → catchlights
    const eyeWhiteGeo = new THREE.SphereGeometry(0.07, 24, 24);
    const irisRimGeo = new THREE.SphereGeometry(0.055, 24, 24);
    const irisMainGeo = new THREE.SphereGeometry(0.048, 24, 24);
    const irisGlowGeo = new THREE.SphereGeometry(0.026, 16, 16);
    const pupilGeo = new THREE.SphereGeometry(0.026, 16, 16);
    const catchBigGeo = new THREE.SphereGeometry(0.016, 8, 8);
    const catchSmallGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const eyelidGeo = new THREE.SphereGeometry(0.078, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const lashGeo = new THREE.TorusGeometry(0.068, 0.009, 6, 16, Math.PI * 0.65);
    const irisRimMat = new THREE.MeshBasicMaterial({ color: 0x1a2a4a });
    const irisGlowMat = new THREE.MeshBasicMaterial({ color: 0x8ab5e8 });

    for (const side of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.105, 0.02, 0.245);

      const white = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      white.scale.set(0.85, 1.25, 0.35);
      eyeGroup.add(white);

      const rim = new THREE.Mesh(irisRimGeo, irisRimMat);
      rim.position.z = 0.02;
      rim.scale.set(0.95, 1.2, 0.35);
      rim.userData.noSketch = true;
      eyeGroup.add(rim);

      const iris = new THREE.Mesh(irisMainGeo, irisMat);
      iris.position.set(0, -0.004, 0.026);
      iris.scale.set(0.9, 1.15, 0.4);
      iris.userData.noSketch = true;
      eyeGroup.add(iris);

      // Bottom glow — the "light pool" at the bottom of the iris
      const glow = new THREE.Mesh(irisGlowGeo, irisGlowMat);
      glow.position.set(0, -0.02, 0.03);
      glow.scale.set(1.1, 0.7, 0.35);
      glow.userData.noSketch = true;
      eyeGroup.add(glow);

      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0, 0.038);
      pupil.scale.set(1, 1.3, 0.5);
      pupil.userData.baseX = 0;
      pupil.userData.baseY = 0;
      pupil.userData.eyeRadius = 0.04;
      pupil.userData.noSketch = true;
      eyeGroup.add(pupil);
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;

      const catchBig = new THREE.Mesh(catchBigGeo, eyeWhiteMat);
      catchBig.position.set(side * 0.015, 0.026, 0.048);
      catchBig.userData.noSketch = true;
      eyeGroup.add(catchBig);
      const catchSmall = new THREE.Mesh(catchSmallGeo, eyeWhiteMat);
      catchSmall.position.set(side * -0.012, -0.02, 0.048);
      catchSmall.userData.noSketch = true;
      eyeGroup.add(catchSmall);

      // Upper lash line — dark arc hugging the eye top
      const lash = new THREE.Mesh(lashGeo, pupilMat);
      lash.position.set(0, 0.01, 0.043);
      lash.rotation.z = Math.PI * 0.175 + (side === -1 ? 0.06 : -0.06);
      lash.scale.set(0.95, 1.15, 1);
      lash.userData.noSketch = true; // already a drawn line — ink hull would blob it
      eyeGroup.add(lash);

      const eyelid = new THREE.Mesh(eyelidGeo, skinMat);
      eyelid.scale.set(0.9, 1.3, 0.4);
      eyelid.visible = false;
      eyelid.userData.noSketch = true;
      eyeGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;

      headGroup.add(eyeGroup);
    }

    // Eyebrows — thin hair-colored strokes
    const browGeo = new THREE.CapsuleGeometry(0.008, 0.05, 4, 8);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairMat);
      brow.position.set(side * 0.105, 0.15, 0.26);
      brow.rotation.z = Math.PI / 2 + side * 0.15;
      brow.userData.noSketch = true;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Blush
    const blushGeo = new THREE.SphereGeometry(0.03, 12, 12);
    for (const side of [-1, 1]) {
      const blush = new THREE.Mesh(blushGeo, blushMat);
      blush.position.set(side * 0.155, -0.055, 0.225);
      blush.scale.set(1.2, 0.6, 0.3);
      blush.userData.noSketch = true;
      headGroup.add(blush);
    }

    // Mouth — small anime smile with lip-sync structure
    const mouth = new THREE.Group();
    mouth.position.set(0, -0.115, 0.26);

    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.045, 0, 0),
      new THREE.Vector3(0, -0.02, 0.005),
      new THREE.Vector3(0.045, 0, 0)
    );
    const upperLip = new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 16, 0.006, 8, false), lipMat);
    upperLip.userData.noSketch = true; // the smile IS a stroke — outlining it doubles it
    mouth.add(upperLip);
    this.upperLip = upperLip;

    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), lipMat);
    lowerLip.position.set(0, -0.012, 0.004);
    lowerLip.scale.set(1.5, 0.5, 0.7);
    lowerLip.userData.noSketch = true;
    mouth.add(lowerLip);
    this.lowerLip = lowerLip;

    const mouthCavity = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x401818 })
    );
    mouthCavity.position.set(0, -0.01, 0.003);
    mouthCavity.scale.set(1.2, 0.6, 0.6);
    mouthCavity.visible = false;
    mouthCavity.userData.noSketch = true;
    mouth.add(mouthCavity);
    this.mouthCavity = mouthCavity;

    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = mouth.scale.x;
    this.mouthBaseScaleY = mouth.scale.y;
    this.mouthBaseScaleZ = mouth.scale.z;
    this.mouthBaseY = mouth.position.y;

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ── Body ────────────────────────────────────────────────────────────
    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 12), skinMat);
    neck.position.y = 1.16;
    this.mesh.add(neck);

    // Torso — white sailor top
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.16, 4, 20), uniformMat);
    torso.position.y = 0.98;
    torso.scale.set(1, 1, 0.85);
    torso.castShadow = true;
    this.mesh.add(torso);

    // Sailor collar — back flap + neck ring + red neckerchief
    const collarBack = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.015, 0.2), navyMat);
    collarBack.position.set(0, 1.1, -0.08);
    collarBack.rotation.x = -0.22;
    this.mesh.add(collarBack);

    const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.028, 8, 24), navyMat);
    collarRing.position.y = 1.12;
    collarRing.rotation.x = Math.PI / 2;
    this.mesh.add(collarRing);

    const neckerchief = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 12), redMat);
    neckerchief.position.set(0, 1.04, 0.13);
    neckerchief.rotation.x = Math.PI; // point down
    this.mesh.add(neckerchief);

    // Pleated skirt — flared cylinder, flat shading gives pleat facets
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.27, 0.2, 12, 1, true), navyPleatMat);
    skirt.position.y = 0.72;
    skirt.castShadow = true;
    this.mesh.add(skirt);
    const skirtHem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.05, 12), navyMat);
    skirtHem.position.y = 0.845;
    this.mesh.add(skirtHem);

    // ── Arms — capsule + ball hand, white sleeve cap ────────────────────
    const handGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const sleeveGeo = new THREE.CapsuleGeometry(0.062, 0.04, 4, 12);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);

      const sleeve = new THREE.Mesh(sleeveGeo, uniformMat);
      sleeve.position.y = -0.05;
      group.add(sleeve);

      const capLen = Math.max(0.01, len - 0.16);
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, capLen, 4, 12), skinMat);
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

    addArm(-0.185, 1.07, 0, -0.30, 0.84, 0.02, false);
    addArm(0.185, 1.07, 0, 0.30, 0.84, 0.02, true);

    // ── Legs — skin capsule + sock + shoe ───────────────────────────────
    const legGeo = new THREE.CapsuleGeometry(0.05, 0.40, 4, 12);
    const sockGeo = new THREE.CylinderGeometry(0.055, 0.052, 0.12, 12);
    const shoeGeo = new THREE.SphereGeometry(0.075, 20, 20);

    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.075, 0.66, 0);

      const leg = new THREE.Mesh(legGeo, skinMat);
      leg.position.y = -0.25;
      legGroup.add(leg);

      const sock = new THREE.Mesh(sockGeo, sockMat);
      sock.position.y = -0.46;
      legGroup.add(sock);

      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(0, -0.585, 0.03);
      shoe.scale.set(0.9, 0.55, 1.5);
      shoe.castShadow = true;
      legGroup.add(shoe);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  update(time, delta) {
    super.update(time, delta);
    // Twin-tail sway (walking/running drives the big motion via the engine)
    const sway = Math.sin(time * 2.2) * 0.055;
    if (this.leftTail) this.leftTail.rotation.z = this.leftTail.userData.baseRotZ - sway;
    if (this.rightTail) this.rightTail.rotation.z = this.rightTail.userData.baseRotZ + sway;
    // Ahoge wobble
    if (this.ahoge) this.ahoge.rotation.z = 0.6 + Math.sin(time * 3.1) * 0.12;
  }
}
