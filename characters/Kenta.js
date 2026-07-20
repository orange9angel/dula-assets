import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Kenta (健太) — timid bespectacled boy, the "cat book" consultant.
 * Design (per docs/skills/character-modeler):
 *   - Silhouette: short cap hair + big round glasses (the two things you read first)
 *   - Proportions: 3-heads, height ≈ 1.45 (slightly shorter than Yuki)
 *   - Palette: black hair / teal tee / khaki shorts / gray sneakers
 */
export class Kenta extends CharacterBase {
  constructor() {
    super('Kenta');
    this.archetypes = ['humanoid', 'boy', 'anime'];
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

    const skinMat = new THREE.MeshToonMaterial({ color: 0xffe0c8, gradientMap: toonGradient });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x23201e, gradientMap: toonGradient });
    const eyeWhiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x4a5a3a });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a22 });
    const teeMat = new THREE.MeshToonMaterial({ color: 0x3a9a8a, gradientMap: toonGradient });
    const shortsMat = new THREE.MeshToonMaterial({ color: 0x8a7a5a, gradientMap: toonGradient });
    const shoeMat = new THREE.MeshToonMaterial({ color: 0x777777, gradientMap: toonGradient });
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const lipMat = new THREE.MeshBasicMaterial({ color: 0x8a4a3a });

    // ── Head ────────────────────────────────────────────────────────────
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.16;
    this.headBaseY = 1.16;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 32), skinMat);
    head.scale.set(1, 1.05, 0.92);
    head.castShadow = true;
    headGroup.add(head);

    // Short cap hair — shell a bit larger than the skull + front fringe tufts
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.295, 32, 32), hairMat);
    hairCap.position.set(0, 0.045, -0.045);
    hairCap.scale.set(1.02, 1.0, 1.0);
    hairCap.castShadow = true;
    headGroup.add(hairCap);

    const fringeGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const fringeSpecs = [
      { x: 0, y: 0.185, z: 0.16, s: [1.15, 0.9, 0.55] },
      { x: -0.1, y: 0.17, z: 0.145, s: [1.0, 0.85, 0.55] },
      { x: 0.1, y: 0.17, z: 0.145, s: [1.0, 0.85, 0.55] },
    ];
    for (const f of fringeSpecs) {
      const tuft = new THREE.Mesh(fringeGeo, hairMat);
      tuft.position.set(f.x, f.y, f.z);
      tuft.scale.set(...f.s);
      tuft.rotation.x = 0.3;
      headGroup.add(tuft);
    }

    // ── Face ────────────────────────────────────────────────────────────
    // Layered lens: white → dark rim → iris → bottom glow → pupil → catchlight
    const eyeWhiteGeo = new THREE.SphereGeometry(0.06, 24, 24);
    const irisRimGeo = new THREE.SphereGeometry(0.045, 20, 20);
    const irisMainGeo = new THREE.SphereGeometry(0.038, 20, 20);
    const irisGlowGeo = new THREE.SphereGeometry(0.02, 12, 12);
    const pupilGeo = new THREE.SphereGeometry(0.02, 12, 12);
    const catchGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const eyelidGeo = new THREE.SphereGeometry(0.066, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const irisRimMat = new THREE.MeshBasicMaterial({ color: 0x2a351f });
    const irisGlowMat = new THREE.MeshBasicMaterial({ color: 0x9ab08a });

    for (const side of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.095, 0.015, 0.225);

      const white = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      white.scale.set(0.9, 1.15, 0.35);
      eyeGroup.add(white);

      const rim = new THREE.Mesh(irisRimGeo, irisRimMat);
      rim.position.z = 0.018;
      rim.scale.set(0.95, 1.15, 0.35);
      rim.userData.noSketch = true;
      eyeGroup.add(rim);

      const iris = new THREE.Mesh(irisMainGeo, irisMat);
      iris.position.set(0, -0.003, 0.023);
      iris.scale.set(0.9, 1.1, 0.4);
      iris.userData.noSketch = true;
      eyeGroup.add(iris);

      const glow = new THREE.Mesh(irisGlowGeo, irisGlowMat);
      glow.position.set(0, -0.016, 0.027);
      glow.scale.set(1.1, 0.7, 0.35);
      glow.userData.noSketch = true;
      eyeGroup.add(glow);

      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(0, 0, 0.032);
      pupil.userData.baseX = 0;
      pupil.userData.baseY = 0;
      pupil.userData.eyeRadius = 0.035;
      pupil.userData.noSketch = true;
      eyeGroup.add(pupil);
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;

      const catchlight = new THREE.Mesh(catchGeo, eyeWhiteMat);
      catchlight.position.set(side * 0.012, 0.02, 0.042);
      catchlight.userData.noSketch = true;
      eyeGroup.add(catchlight);

      const eyelid = new THREE.Mesh(eyelidGeo, skinMat);
      eyelid.scale.set(0.95, 1.2, 0.4);
      eyelid.visible = false;
      eyelid.userData.noSketch = true;
      eyeGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;

      headGroup.add(eyeGroup);
    }

    // Round glasses — two rings + bridge + temples (his signature)
    const ringGeo = new THREE.TorusGeometry(0.075, 0.008, 8, 24);
    for (const side of [-1, 1]) {
      const ring = new THREE.Mesh(ringGeo, frameMat);
      ring.position.set(side * 0.095, 0.02, 0.245);
      ring.userData.noSketch = true;
      headGroup.add(ring);

      const temple = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 6), frameMat);
      temple.position.set(side * 0.175, 0.02, 0.165);
      temple.rotation.x = Math.PI / 2;
      temple.userData.noSketch = true;
      headGroup.add(temple);
    }
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.05, 6), frameMat);
    bridge.position.set(0, 0.025, 0.245);
    bridge.rotation.z = Math.PI / 2;
    bridge.userData.noSketch = true;
    headGroup.add(bridge);

    // Eyebrows — thin, slightly worried default angle
    const browGeo = new THREE.CapsuleGeometry(0.007, 0.045, 4, 8);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, hairMat);
      brow.position.set(side * 0.095, 0.135, 0.235);
      brow.rotation.z = Math.PI / 2 - side * 0.18; // inner ends up — timid look
      brow.userData.noSketch = true;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Mouth — small nervous smile with lip-sync structure
    const mouth = new THREE.Group();
    mouth.position.set(0, -0.105, 0.235);
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.035, 0, 0),
      new THREE.Vector3(0, -0.014, 0.004),
      new THREE.Vector3(0.035, 0, 0)
    );
    const upperLip = new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 16, 0.005, 8, false), lipMat);
    upperLip.userData.noSketch = true;
    mouth.add(upperLip);
    this.upperLip = upperLip;

    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), lipMat);
    lowerLip.position.set(0, -0.01, 0.003);
    lowerLip.scale.set(1.5, 0.5, 0.7);
    lowerLip.userData.noSketch = true;
    mouth.add(lowerLip);
    this.lowerLip = lowerLip;

    const mouthCavity = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x401818 })
    );
    mouthCavity.position.set(0, -0.008, 0.002);
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
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.09, 12), skinMat);
    neck.position.y = 1.06;
    this.mesh.add(neck);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.15, 4, 20), teeMat);
    torso.position.y = 0.9;
    torso.scale.set(1, 1, 0.82);
    torso.castShadow = true;
    this.mesh.add(torso);

    // Shorts
    const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.13, 16), shortsMat);
    shorts.position.y = 0.68;
    this.mesh.add(shorts);

    // ── Arms — capsule + ball hand, tee sleeve cap ──────────────────────
    const handGeo = new THREE.SphereGeometry(0.046, 16, 16);
    const sleeveGeo = new THREE.CapsuleGeometry(0.056, 0.035, 4, 12);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);

      const sleeve = new THREE.Mesh(sleeveGeo, teeMat);
      sleeve.position.y = -0.045;
      group.add(sleeve);

      const capLen = Math.max(0.01, len - 0.15);
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, capLen, 4, 12), skinMat);
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

    addArm(-0.17, 0.97, 0, -0.275, 0.77, 0.02, false);
    addArm(0.17, 0.97, 0, 0.275, 0.77, 0.02, true);

    // ── Legs — skin capsule + sneaker ───────────────────────────────────
    const legGeo = new THREE.CapsuleGeometry(0.045, 0.34, 4, 12);
    const shoeGeo = new THREE.SphereGeometry(0.068, 20, 20);

    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.07, 0.62, 0);

      const leg = new THREE.Mesh(legGeo, skinMat);
      leg.position.y = -0.22;
      legGroup.add(leg);

      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(0, -0.55, 0.025);
      shoe.scale.set(0.9, 0.55, 1.45);
      shoe.castShadow = true;
      legGroup.add(shoe);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }
}
