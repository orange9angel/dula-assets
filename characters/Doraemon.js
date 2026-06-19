import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

export class Doraemon extends CharacterBase {
  constructor() {
    super('Doraemon');
    this.archetypes = ['round', 'tiny', 'robot'];
    this.boundingRadius = 0.85;
  }

  build() {
    // Materials
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
    const blueMat = new THREE.MeshToonMaterial({ color: 0x0096e1, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const redMat = new THREE.MeshToonMaterial({ color: 0xe60012, gradientMap: toonGradient });
    const yellowMat = new THREE.MeshToonMaterial({ color: 0xffd700, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x111111, gradientMap: toonGradient });

    // Head group
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.6;

    // Main head (blue)
    const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const head = new THREE.Mesh(headGeo, blueMat);
    head.castShadow = true;
    headGroup.add(head);

    // Eyes — grouped so pupils/eyelids move together
    const eyeWhiteGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const pupilGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const highlightGeo = new THREE.SphereGeometry(0.018, 8, 8);

    for (const side of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.18, 0.35, 0.55);

      const eyeWhite = new THREE.Mesh(eyeWhiteGeo, whiteMat);
      eyeWhite.scale.z = 0.5;
      eyeGroup.add(eyeWhite);

      const pupil = new THREE.Mesh(pupilGeo, blackMat);
      pupil.position.set(0, 0, 0.10);
      pupil.scale.z = 0.6;
      pupil.userData.baseX = 0;
      pupil.userData.baseY = 0;
      eyeGroup.add(pupil);
      if (side === -1) this.leftPupil = pupil;
      else this.rightPupil = pupil;

      // Catchlight
      const highlight = new THREE.Mesh(highlightGeo, whiteMat);
      highlight.position.set(side * 0.03, 0.05, 0.12);
      eyeGroup.add(highlight);

      // Eyelid (blue half-sphere, hidden when open)
      const eyelidMat = new THREE.MeshToonMaterial({ color: 0x0096e1, gradientMap: toonGradient });
      const eyelidGeo = new THREE.SphereGeometry(0.19, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelid.visible = false;
      eyeGroup.add(eyelid);
      if (side === -1) this.leftEyelid = eyelid;
      else this.rightEyelid = eyelid;

      headGroup.add(eyeGroup);
    }

    // Eyebrows — thick black arcs that expression animations can raise/angle
    const browGeo = new THREE.CapsuleGeometry(0.02, 0.16, 4, 8);
    for (const side of [-1, 1]) {
      const brow = new THREE.Mesh(browGeo, blackMat);
      brow.position.set(side * 0.18, 0.52, 0.60);
      brow.rotation.z = Math.PI / 2 + side * 0.25;
      brow.rotation.x = -0.15;
      headGroup.add(brow);
      if (side === -1) this.leftEyebrow = brow;
      else this.rightEyebrow = brow;
    }

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.08, 32, 32);
    const nose = new THREE.Mesh(noseGeo, redMat);
    nose.position.set(0, 0.12, 0.68);
    headGroup.add(nose);

    // Mouth — classic Doraemon crescent smile that opens naturally for lip-sync
    // Structure: upper lip (smile curve), lower lip (small black sphere), cavity (dark red).
    const mouth = new THREE.Group();
    mouth.position.set(0, -0.18, 0.62);

    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.13, 0, 0),
      new THREE.Vector3(0, -0.045, 0.01),
      new THREE.Vector3(0.13, 0, 0)
    );
    const upperLipGeo = new THREE.TubeGeometry(smileCurve, 20, 0.012, 8, false);
    const upperLip = new THREE.Mesh(upperLipGeo, blackMat);
    mouth.add(upperLip);
    this.upperLip = upperLip;

    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), blackMat);
    lowerLip.position.set(0, -0.025, 0.008);
    lowerLip.scale.set(1.4, 0.45, 0.9);
    mouth.add(lowerLip);
    this.lowerLip = lowerLip;

    const cavityMat = new THREE.MeshBasicMaterial({ color: 0x330000 });
    const mouthCavity = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), cavityMat);
    mouthCavity.position.set(0, -0.02, 0.005);
    mouthCavity.scale.set(1.1, 0.55, 0.7);
    mouthCavity.visible = false;
    mouth.add(mouthCavity);
    this.mouthCavity = mouthCavity;

    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseRotationX = 0;

    // Whiskers (classic Doraemon: 3 left, 3 right, horizontal fan radiating outward)
    const whiskerGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.28, 8);
    for (let side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const w = new THREE.Mesh(whiskerGeo, blackMat);
        const fanOffset = (1 - i) * 0.22; // +0.22 (bottom), 0 (mid), -0.22 (top)
        if (side === -1) {
          // Left face: pointing left (-x), fan up/down
          w.rotation.z = Math.PI / 2 + fanOffset;
        } else {
          // Right face: pointing right (+x), fan up/down
          w.rotation.z = -Math.PI / 2 - fanOffset;
        }
        w.position.set(side * 0.32, -0.06 + i * 0.06, 0.58);
        headGroup.add(w);
      }
    }

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // Body (blue)
    const bodyGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const body = new THREE.Mesh(bodyGeo, blueMat);
    body.position.y = 0.7;
    body.scale.y = 1.1;
    body.castShadow = true;
    this.mesh.add(body);

    // Belly (white) - the "face patch" moved down to stomach
    const bellyGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const belly = new THREE.Mesh(bellyGeo, whiteMat);
    belly.position.set(0, 0.6, 0.35);
    belly.scale.set(1, 0.9, 0.6);
    this.mesh.add(belly);

    // Pocket
    const pocketGeo = new THREE.SphereGeometry(0.25, 32, 32);
    const pocket = new THREE.Mesh(pocketGeo, whiteMat);
    pocket.position.set(0, 0.55, 0.55);
    pocket.scale.y = 0.6;
    pocket.scale.z = 0.3;
    this.mesh.add(pocket);

    // Collar
    const collarGeo = new THREE.TorusGeometry(0.45, 0.06, 16, 32);
    const collar = new THREE.Mesh(collarGeo, redMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.1;
    this.mesh.add(collar);

    // Bell
    const bellGeo = new THREE.SphereGeometry(0.1, 32, 32);
    const bell = new THREE.Mesh(bellGeo, yellowMat);
    bell.position.set(0, 1.05, 0.4);
    this.mesh.add(bell);

    // Arms + Hands: shoulder and hand positions defined in world space, connected by capsule
    const handGeo = new THREE.SphereGeometry(0.15, 16, 16);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2); // make y-axis point toward hand

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.24); // subtract two hemispheres
      const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, capLen, 4, 16), blueMat);
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

    // Left arm
    addArm(-0.42, 1.05, 0, -0.88, 0.72, 0, false);
    // Right arm
    addArm(0.42, 1.05, 0, 0.88, 0.72, 0, true);

    // Pocket racket (for RoomScene pull-out animation)
    if (this.rightArm && this.rightArmLength) {
      const racket = new THREE.Group();
      // Handle
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.025, 0.4, 8),
        new THREE.MeshToonMaterial({ color: 0x111111, gradientMap: toonGradient })
      );
      handle.position.y = -0.2;
      racket.add(handle);
      // Frame
      const frame = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.02, 8, 16),
        new THREE.MeshToonMaterial({ color: 0xe60012, gradientMap: toonGradient })
      );
      frame.position.y = 0.18;
      racket.add(frame);
      // Strings
      const stringMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
      const vStr = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.32, 0.005), stringMat);
      vStr.position.set(0, 0.18, 0);
      racket.add(vStr);
      const hStr = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.01, 0.005), stringMat);
      hStr.position.set(0, 0.18, 0);
      racket.add(hStr);
      // Orientation
      racket.rotation.set(Math.PI / 6, 0, Math.PI / 2);
      racket.position.set(0, -this.rightArmLength, 0);
      racket.visible = false;
      this.rightArm.add(racket);
      this.pocketRacket = racket;
    }

    // Legs + Feet (grouped for animation)
    const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 16);
    const footGeo = new THREE.SphereGeometry(0.2, 32, 32);

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.25, 0.55, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, blueMat);
    leftLegMesh.position.y = -0.225;
    leftLegGroup.add(leftLegMesh);
    const leftFoot = new THREE.Mesh(footGeo, whiteMat);
    leftFoot.position.set(0, -0.45, 0.05);
    leftFoot.scale.set(1, 0.6, 1.4);
    leftLegGroup.add(leftFoot);
    this.mesh.add(leftLegGroup);
    this.leftLeg = leftLegGroup;

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.25, 0.55, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, blueMat);
    rightLegMesh.position.y = -0.225;
    rightLegGroup.add(rightLegMesh);
    const rightFoot = new THREE.Mesh(footGeo, whiteMat);
    rightFoot.position.set(0, -0.45, 0.05);
    rightFoot.scale.set(1, 0.6, 1.4);
    rightLegGroup.add(rightFoot);
    this.mesh.add(rightLegGroup);
    this.rightLeg = rightLegGroup;

    // Take-copter (bamboo-copter) prop — hidden by default
    this.takeCopter = this.createTakeCopter();
    this.takeCopter.visible = false;
    this.headGroup.add(this.takeCopter);
  }

  createTakeCopter() {
    const group = new THREE.Group();
    group.position.y = 0.72; // on top of large head

    const yellowMat = new THREE.MeshToonMaterial({ color: 0xffd700 });
    const propMat = new THREE.MeshToonMaterial({ color: 0xdddddd });

    // Base disc
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16), yellowMat);
    group.add(base);

    // Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8), propMat);
    shaft.position.y = 0.19;
    group.add(shaft);

    // Blades (3 radiating flat ovals like a real bamboo-copter)
    const bladeMat = new THREE.MeshToonMaterial({ color: 0xffcc33 });
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.015, 0.22), bladeMat);
      blade.position.y = 0.38;
      blade.rotation.y = (i / 3) * Math.PI * 2;
      group.add(blade);
    }

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), yellowMat);
    cap.position.y = 0.40;
    group.add(cap);

    return group;
  }

  attachTakeCopter() {
    if (this.takeCopter) {
      this.takeCopter.visible = true;
    }
  }

  detachTakeCopter() {
    if (this.takeCopter) {
      this.takeCopter.visible = false;
    }
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.takeCopter && this.takeCopter.visible) {
      this.takeCopter.rotation.y += 15 * delta;
    }
  }
}
