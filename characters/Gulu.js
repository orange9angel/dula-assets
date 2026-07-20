import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Gulu (咕噜) — chibi robot mascot, procedurally "hand-drawn" with primitives.
 * Design (per dula-skills/character-modeler):
 *   - Silhouette: circle — round white body + big round head (2-heads chibi)
 *   - Signature: dark face screen with glowing cyan LED eyes/mouth, antenna
 *   - Palette: white / sky blue / cyan glow / dark navy / yellow accent
 * Total height ≈ 1.5 (antenna excluded), ground contact at y = 0.
 */
export class Gulu extends CharacterBase {
  constructor() {
    super('Gulu');
    this.archetypes = ['round', 'tiny', 'robot', 'mascot'];
    this.boundingRadius = 0.8;
  }

  build() {
    // Shared 4-step toon gradient (house style)
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

    const whiteMat = new THREE.MeshToonMaterial({ color: 0xf5f7fa, gradientMap: toonGradient });
    const blueMat = new THREE.MeshToonMaterial({ color: 0x29b6f6, gradientMap: toonGradient });
    const screenMat = new THREE.MeshToonMaterial({ color: 0x16202e, gradientMap: toonGradient });
    const darkMat = new THREE.MeshToonMaterial({ color: 0x0d1420, gradientMap: toonGradient });
    const yellowMat = new THREE.MeshToonMaterial({ color: 0xffd54f, gradientMap: toonGradient });
    // LED parts use MeshBasicMaterial so they read as self-lit without extra lights
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x4dd0e1 });
    const ledBrightMat = new THREE.MeshBasicMaterial({ color: 0xe8fbff });

    // ── Head ────────────────────────────────────────────────────────────
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.05;
    this.headBaseY = 1.05;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), whiteMat);
    head.scale.y = 0.95;
    head.castShadow = true;
    headGroup.add(head);

    // Face screen — dark visor bulging slightly past the head surface
    const screen = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), screenMat);
    screen.position.set(0, 0.02, 0.28);
    screen.scale.set(1, 0.82, 0.6);
    headGroup.add(screen);

    // Eyes — cyan LED ovals + dark pupil + catchlight, per-eye groups
    const eyeGeo = new THREE.SphereGeometry(0.095, 24, 24);
    const pupilGeo = new THREE.SphereGeometry(0.034, 16, 16);
    const highlightGeo = new THREE.SphereGeometry(0.014, 8, 8);
    const eyelidGeo = new THREE.SphereGeometry(0.1, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);

    for (const side of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.165, 0.08, 0.505);

      const eye = new THREE.Mesh(eyeGeo, ledMat);
      eye.scale.set(0.85, 1.15, 0.4);
      eyeGroup.add(eye);

      const pupil = new THREE.Mesh(pupilGeo, darkMat);
      pupil.position.set(0, -0.01, 0.035);
      pupil.userData.baseX = 0;
      pupil.userData.baseY = -0.01;
      pupil.userData.eyeRadius = 0.05;
      pupil.userData.noSketch = true; // dark-on-dark ink would only muddy the eye
      eyeGroup.add(pupil);
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;

      const highlight = new THREE.Mesh(highlightGeo, ledBrightMat);
      highlight.position.set(side * 0.025, 0.035, 0.04);
      highlight.userData.noSketch = true;
      eyeGroup.add(highlight);

      // Eyelid matches screen color so a closed eye disappears into the visor
      const eyelid = new THREE.Mesh(eyelidGeo, screenMat);
      eyelid.scale.set(0.9, 1.2, 0.45);
      eyelid.visible = false;
      eyelid.userData.noSketch = true;
      eyeGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;

      headGroup.add(eyeGroup);
    }

    // Eyebrows — short cyan LED bars the expression system can raise/angle
    const browGeo = new THREE.CapsuleGeometry(0.014, 0.07, 4, 8);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, ledMat);
      brow.position.set(side * 0.165, 0.245, 0.50);
      brow.rotation.z = Math.PI / 2 + side * 0.12;
      brow.userData.noSketch = true; // thin LED bar — ink hull would swallow it
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Mouth — LED smile (bezier tube) + lower lip + cavity for lip-sync
    const mouth = new THREE.Group();
    mouth.position.set(0, -0.15, 0.50);

    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.09, 0, 0),
      new THREE.Vector3(0, -0.035, 0.008),
      new THREE.Vector3(0.09, 0, 0)
    );
    const upperLip = new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 20, 0.01, 8, false), ledMat);
    mouth.add(upperLip);
    this.upperLip = upperLip;

    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), ledMat);
    lowerLip.position.set(0, -0.02, 0.006);
    lowerLip.scale.set(1.5, 0.45, 0.8);
    mouth.add(lowerLip);
    this.lowerLip = lowerLip;

    const mouthCavity = new THREE.Mesh(
      new THREE.SphereGeometry(0.034, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x08131c })
    );
    mouthCavity.position.set(0, -0.015, 0.004);
    mouthCavity.scale.set(1.2, 0.6, 0.7);
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

    // Antenna — signature feature, tip pulses in update()
    const antenna = new THREE.Group();
    antenna.position.set(0, 0.47, 0);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.16, 8), blueMat);
    stem.position.y = 0.08;
    antenna.add(stem);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), yellowMat);
    tip.position.y = 0.18;
    antenna.add(tip);
    headGroup.add(antenna);
    this.antenna = antenna;
    this.antennaTip = tip;

    // Ear pods — blue discs on the sides
    const podGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24);
    const podRingGeo = new THREE.TorusGeometry(0.06, 0.012, 8, 24);
    for (const side of [-1, 1]) {
      const pod = new THREE.Mesh(podGeo, blueMat);
      pod.position.set(side * 0.485, 0.02, 0);
      pod.rotation.z = Math.PI / 2;
      headGroup.add(pod);

      const ring = new THREE.Mesh(podRingGeo, ledMat);
      ring.position.set(side * 0.515, 0.02, 0);
      ring.rotation.y = Math.PI / 2;
      headGroup.add(ring);
    }

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ── Body ────────────────────────────────────────────────────────────
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), whiteMat);
    body.position.y = 0.48;
    body.scale.y = 0.92;
    body.castShadow = true;
    this.mesh.add(body);
    this.body = body;
    this.bodyBaseScaleY = body.scale.y;

    // Belly panel — cyan LED patch
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), ledMat);
    belly.position.set(0, 0.46, 0.28);
    belly.scale.set(1, 0.85, 0.55);
    this.mesh.add(belly);

    // Chest light — small yellow core on the belly panel
    const chestLight = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), yellowMat);
    chestLight.position.set(0, 0.52, 0.42);
    chestLight.scale.z = 0.5;
    this.mesh.add(chestLight);

    // ── Arms — shoulder-pivot groups, capsule + ball hand ───────────────
    const handGeo = new THREE.SphereGeometry(0.09, 16, 16);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2); // y-axis points toward hand

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.18);
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, capLen, 4, 16), blueMat);
      armMesh.position.y = -len / 2;
      group.add(armMesh);

      const handMesh = new THREE.Mesh(handGeo, whiteMat);
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

    addArm(-0.38, 0.60, 0, -0.58, 0.36, 0, false); // left
    addArm(0.38, 0.60, 0, 0.58, 0.36, 0, true);    // right

    // ── Legs + feet — hip-pivot groups ──────────────────────────────────
    const legGeo = new THREE.CapsuleGeometry(0.06, 0.1, 4, 12);
    const footGeo = new THREE.SphereGeometry(0.11, 24, 24);

    for (const side of [-1, 1]) {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.15, 0.26, 0);

      const legMesh = new THREE.Mesh(legGeo, blueMat);
      legMesh.position.y = -0.08;
      legGroup.add(legMesh);

      const foot = new THREE.Mesh(footGeo, whiteMat);
      foot.position.set(0, -0.21, 0.04);
      foot.scale.set(1, 0.55, 1.35);
      legGroup.add(foot);

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    }
  }

  update(time, delta) {
    super.update(time, delta);
    // Antenna tip heartbeat + gentle antenna sway
    if (this.antennaTip) {
      const pulse = 1 + Math.sin(time * 4) * 0.15;
      this.antennaTip.scale.setScalar(pulse);
    }
    if (this.antenna) {
      this.antenna.rotation.z = Math.sin(time * 1.8) * 0.08;
    }
    // Soft breathing on the body
    if (this.body) {
      this.body.scale.y = this.bodyBaseScaleY + Math.sin(time * 2) * 0.008;
    }
  }
}
