import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Mochi (年糕) — fat orange tabby cat, deadpan comedy role.
 * Design (per dula-skills/character-modeler):
 *   - Silhouette: one big loaf — body and head merge, stubby paws, cone ears
 *   - Signature: permanently half-lidded smug eyes, fat tail that sways
 *   - Quadruped mapping: front paws = arms, hind legs = legs (CharacterBase contract)
 * Total height ≈ 0.75, faces +Z.
 */
export class Mochi extends CharacterBase {
  constructor() {
    super('Mochi');
    this.archetypes = ['cat', 'quadruped', 'round'];
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

    const furMat = new THREE.MeshToonMaterial({ color: 0xe8a050, gradientMap: toonGradient });
    const creamMat = new THREE.MeshToonMaterial({ color: 0xfdf3e0, gradientMap: toonGradient });
    const pinkMat = new THREE.MeshBasicMaterial({ color: 0xe88a8a });
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x2a2020 });
    const amberMat = new THREE.MeshBasicMaterial({ color: 0xd8a028 });

    // ── Body — the loaf ─────────────────────────────────────────────────
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), furMat);
    body.position.y = 0.34;
    body.scale.set(1.05, 0.92, 1.18);
    body.castShadow = true;
    this.mesh.add(body);
    this.body = body;

    // Cream belly patch
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), creamMat);
    belly.position.set(0, 0.27, 0.16);
    belly.scale.set(0.9, 0.75, 0.9);
    this.mesh.add(belly);

    // ── Head (merged into the front-top of the loaf) ────────────────────
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.60, 0.22);
    this.headBaseY = 0.60;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 32), furMat);
    head.scale.set(1.1, 0.95, 0.95);
    head.castShadow = true;
    headGroup.add(head);

    // Muzzle — cream snout area
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), creamMat);
    muzzle.position.set(0, -0.055, 0.14);
    muzzle.scale.set(1.15, 0.75, 0.7);
    headGroup.add(muzzle);

    // Ears — cones with cream inner
    const earGeo = new THREE.ConeGeometry(0.065, 0.13, 12);
    const innerEarGeo = new THREE.ConeGeometry(0.035, 0.07, 8);
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(side * 0.12, 0.19, 0.01);
      ear.rotation.z = side * -0.28;
      headGroup.add(ear);
      const inner = new THREE.Mesh(innerEarGeo, pinkMat);
      inner.position.set(side * 0.115, 0.175, 0.035);
      inner.rotation.z = side * -0.28;
      inner.userData.noSketch = true;
      headGroup.add(inner);
    }

    // ── Face — permanently half-lidded smug eyes ────────────────────────
    const eyeWhiteGeo = new THREE.SphereGeometry(0.045, 20, 20);
    const irisRimGeo = new THREE.SphereGeometry(0.047, 20, 20);
    const pupilGeo = new THREE.SphereGeometry(0.016, 12, 12);
    const catchGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const eyelidGeo = new THREE.SphereGeometry(0.05, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const amberRimMat = new THREE.MeshBasicMaterial({ color: 0x8a5a10 });

    for (const side of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.085, 0.035, 0.165);

      const rim = new THREE.Mesh(irisRimGeo, amberRimMat);
      rim.position.z = 0.004;
      rim.scale.set(1, 1, 0.45);
      rim.userData.noSketch = true;
      eyeGroup.add(rim);

      const white = new THREE.Mesh(eyeWhiteGeo, amberMat); // amber cat eyes, no white
      white.scale.set(1, 1, 0.45);
      white.userData.noSketch = true;
      eyeGroup.add(white);

      const pupil = new THREE.Mesh(pupilGeo, darkMat);
      pupil.position.set(0, 0, 0.028);
      pupil.scale.set(0.6, 1.4, 0.5); // vertical slit
      pupil.userData.baseX = 0;
      pupil.userData.baseY = 0;
      pupil.userData.eyeRadius = 0.03;
      pupil.userData.noSketch = true;
      eyeGroup.add(pupil);
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;

      // Tiny catchlight — keeps the deadpan eyes alive
      const catchlight = new THREE.Mesh(catchGeo, new THREE.MeshBasicMaterial({ color: 0xfff8e0 }));
      catchlight.position.set(side * 0.012, 0.014, 0.028);
      catchlight.userData.noSketch = true;
      eyeGroup.add(catchlight);

      // Lid rests at 45% — the smug look; blink system drives scale.y to full close
      const eyelid = new THREE.Mesh(eyelidGeo, furMat);
      eyelid.scale.set(1.05, 0.55, 0.5);
      eyelid.visible = true;
      eyelid.userData.noSketch = true;
      eyeGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;

      headGroup.add(eyeGroup);
    }

    // Nose + mouth (tiny "ω" via two small arcs)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.012, 8), pinkMat);
    nose.position.set(0, -0.025, 0.235);
    nose.rotation.x = Math.PI / 2;
    nose.userData.noSketch = true;
    headGroup.add(nose);

    const mouth = new THREE.Group();
    mouth.position.set(0, -0.055, 0.225);
    const smileL = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.03, 0.008, 0),
      new THREE.Vector3(-0.012, -0.012, 0.004),
      new THREE.Vector3(0, 0, 0.005)
    );
    const smileR = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0.005),
      new THREE.Vector3(0.012, -0.012, 0.004),
      new THREE.Vector3(0.03, 0.008, 0)
    );
    const lipTubeL = new THREE.Mesh(new THREE.TubeGeometry(smileL, 8, 0.004, 6, false), darkMat);
    const lipTubeR = new THREE.Mesh(new THREE.TubeGeometry(smileR, 8, 0.004, 6, false), darkMat);
    lipTubeL.userData.noSketch = true;
    lipTubeR.userData.noSketch = true;
    mouth.add(lipTubeL);
    mouth.add(lipTubeR);
    this.upperLip = lipTubeL;
    this.lowerLip = lipTubeR;
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = mouth.scale.x;
    this.mouthBaseScaleY = mouth.scale.y;
    this.mouthBaseScaleZ = mouth.scale.z;
    this.mouthBaseY = mouth.position.y;

    // Eyebrows — absent on cats, but the expression system wants anchors
    const browGeo = new THREE.CapsuleGeometry(0.005, 0.03, 4, 6);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, furMat);
      brow.position.set(side * 0.085, 0.105, 0.17);
      brow.rotation.z = Math.PI / 2 + side * 0.1;
      brow.userData.noSketch = true;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Whiskers — 3 thin cylinders per side
    const whiskerGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.17, 6);
    const whiskerMat = new THREE.MeshBasicMaterial({ color: 0xfdf3e0 });
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const w = new THREE.Mesh(whiskerGeo, whiskerMat);
        const fan = (1 - i) * 0.18;
        w.rotation.z = side > 0 ? -Math.PI / 2 - fan * side : Math.PI / 2 + fan * side;
        w.position.set(side * 0.14, -0.04 + i * 0.022, 0.20);
        w.userData.noSketch = true;
        headGroup.add(w);
      }
    }

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ── Front paws (arms in contract terms) — stubby cream capsules ─────
    const pawGeo = new THREE.CapsuleGeometry(0.05, 0.08, 4, 12);
    const addFrontPaw = (sx, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, 0.30, 0.40);
      const paw = new THREE.Mesh(pawGeo, creamMat);
      paw.position.y = -0.10;
      group.add(paw);
      this.mesh.add(group);
      if (isRight) {
        this.rightArm = group;
        this.rightArmLength = 0.2;
        this.rightArmBaseZ = group.rotation.z;
      } else {
        this.leftArm = group;
        this.leftArmBaseZ = group.rotation.z;
      }
    };
    addFrontPaw(-0.13, false);
    addFrontPaw(0.13, true);

    // ── Hind legs — loaf stubs, mostly hidden under the body ────────────
    const hindGeo = new THREE.CapsuleGeometry(0.06, 0.06, 4, 12);
    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.17, 0.16, -0.12);
      const hind = new THREE.Mesh(hindGeo, furMat);
      hind.position.y = -0.06;
      legGroup.add(hind);
      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }

    // ── Tail — fat striped capsule chain, sways in update ───────────────
    const tail = new THREE.Group();
    tail.position.set(0, 0.38, -0.34);
    const seg1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 4, 10), furMat);
    seg1.position.set(0, 0.08, -0.05);
    seg1.rotation.x = -0.5;
    tail.add(seg1);
    const seg2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.12, 4, 10), furMat);
    seg2.position.set(0, 0.20, -0.10);
    seg2.rotation.x = -0.15;
    tail.add(seg2);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), creamMat);
    tip.position.set(0, 0.30, -0.10);
    tail.add(tip);
    this.mesh.add(tail);
    this.tail = tail;
  }

  update(time, delta) {
    super.update(time, delta);
    // Slow majestic tail sway — an unbothered cat
    if (this.tail) {
      this.tail.rotation.y = Math.sin(time * 1.4) * 0.25;
      this.tail.rotation.x = Math.sin(time * 0.9) * 0.06;
    }
  }
}
