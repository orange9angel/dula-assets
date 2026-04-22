import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Rock Lee — 李洛克（木叶苍蓝野兽）
 * 纯体术忍者，标志性特征：西瓜头、粗眉毛、绿色紧身衣、木叶护额
 */
export class RockLee extends CharacterBase {
  constructor() {
    super('RockLee');
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
    const hairMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a, gradientMap: toonGradient });
    const suitMat = new THREE.MeshToonMaterial({ color: 0x4a7c2a, gradientMap: toonGradient }); // 绿色紧身衣
    const suitDarkMat = new THREE.MeshToonMaterial({ color: 0x3a6620, gradientMap: toonGradient });
    const bandageMat = new THREE.MeshToonMaterial({ color: 0xd4c4a8, gradientMap: toonGradient });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x111111, gradientMap: toonGradient });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const metalMat = new THREE.MeshToonMaterial({ color: 0x888888, gradientMap: toonGradient });
    const eyeWhiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.85;

    // Face base
    const faceGeo = new THREE.SphereGeometry(0.30, 32, 32);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.scale.set(1.0, 1.08, 0.95);
    face.castShadow = true;
    headGroup.add(face);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.30, 0.02, 0.02);
    leftEar.scale.set(0.5, 1.0, 0.6);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.30, 0.02, 0.02);
    rightEar.scale.set(0.5, 1.0, 0.6);
    headGroup.add(rightEar);

    // ========== HAIR (西瓜头 / Bowl cut) ==========
    const bowlGeo = new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const bowlHair = new THREE.Mesh(bowlGeo, hairMat);
    bowlHair.position.set(0, 0.08, -0.02);
    bowlHair.scale.set(1.05, 0.90, 0.95);
    headGroup.add(bowlHair);

    // Hair spikes (Lee's hair is more spiky than smooth bowl)
    for (let i = 0; i < 8; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.12, 8);
      const spike = new THREE.Mesh(spikeGeo, hairMat);
      const angle = (i / 8) * Math.PI * 2;
      spike.position.set(Math.cos(angle) * 0.28, 0.18, Math.sin(angle) * 0.28);
      spike.rotation.x = -0.3;
      spike.rotation.z = Math.cos(angle) * 0.3;
      headGroup.add(spike);
    }

    // ========== EYEBROWS (标志性粗眉毛!) ==========
    const browGeo = new THREE.CapsuleGeometry(0.018, 0.12, 4, 8);
    const leftBrow = new THREE.Mesh(browGeo, blackMat);
    leftBrow.position.set(-0.10, 0.18, 0.28);
    leftBrow.rotation.z = Math.PI / 2 + 0.15;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, blackMat);
    rightBrow.position.set(0.10, 0.18, 0.28);
    rightBrow.rotation.z = Math.PI / 2 - 0.15;
    headGroup.add(rightBrow);

    // ========== EYES (大而圆，热血风格) ==========
    const eyeGeo = new THREE.SphereGeometry(0.065, 16, 16);

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.11, 0.06, 0.27);
    leftEye.scale.set(1.1, 1.15, 0.45);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.11, 0.06, 0.27);
    rightEye.scale.set(1.1, 1.15, 0.45);
    headGroup.add(rightEye);

    const pupilGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const leftPupil = new THREE.Mesh(pupilGeo, blackMat);
    leftPupil.position.set(-0.11, 0.05, 0.29);
    leftPupil.userData.baseX = leftPupil.position.x;
    headGroup.add(leftPupil);
    this.leftPupil = leftPupil;

    const rightPupil = new THREE.Mesh(pupilGeo, blackMat);
    rightPupil.position.set(0.11, 0.05, 0.29);
    rightPupil.userData.baseX = rightPupil.position.x;
    headGroup.add(rightPupil);
    this.rightPupil = rightPupil;

    // Highlights
    const hlGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const leftHl = new THREE.Mesh(hlGeo, whiteMat);
    leftHl.position.set(-0.10, 0.075, 0.305);
    headGroup.add(leftHl);

    const rightHl = new THREE.Mesh(hlGeo, whiteMat);
    rightHl.position.set(0.12, 0.075, 0.305);
    headGroup.add(rightHl);

    // ========== NOSE ==========
    const noseGeo = new THREE.SphereGeometry(0.018, 16, 16);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, -0.05, 0.28);
    nose.scale.set(1, 0.8, 1.2);
    headGroup.add(nose);

    // ========== MOUTH (热血笑容) ==========
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.10, 0, 0),
      new THREE.Vector3(0, -0.02, 0),
      new THREE.Vector3(0.10, 0, 0)
    );
    const mouthGeo = new THREE.TubeGeometry(mouthCurve, 16, 0.007, 8, false);
    const mouth = new THREE.Mesh(mouthGeo, blackMat);
    mouth.position.set(0, -0.14, 0.26);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = mouth.scale.x;
    this.mouthBaseScaleY = mouth.scale.y;
    this.mouthBaseScaleZ = mouth.scale.z;

    // ========== FOREHEAD PROTECTOR (木叶护额) ==========
    const protectorGroup = new THREE.Group();
    
    // Metal plate
    const plateGeo = new THREE.BoxGeometry(0.42, 0.14, 0.03);
    const plate = new THREE.Mesh(plateGeo, metalMat);
    protectorGroup.add(plate);

    // Cloth band (dark blue)
    const bandMat = new THREE.MeshToonMaterial({ color: 0x2a3a5a, gradientMap: toonGradient });
    const bandGeo = new THREE.BoxGeometry(0.70, 0.12, 0.06);
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.z = -0.02;
    protectorGroup.add(band);

    // Rivets (4 dots)
    const rivetGeo = new THREE.SphereGeometry(0.012, 8, 8);
    for (let i = 0; i < 4; i++) {
      const rivet = new THREE.Mesh(rivetGeo, metalMat);
      rivet.position.set(-0.14 + i * 0.093, 0, 0.02);
      protectorGroup.add(rivet);
    }

    // Leaf symbol (simplified as green shape)
    const leafGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const leafMat = new THREE.MeshToonMaterial({ color: 0x4a7c2a, gradientMap: toonGradient });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0, 0, 0.02);
    leaf.scale.set(1.2, 1.8, 0.3);
    protectorGroup.add(leaf);

    protectorGroup.position.set(0, 0.28, 0.22);
    protectorGroup.rotation.x = -0.15;
    headGroup.add(protectorGroup);

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.13, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.48;
    this.mesh.add(neck);

    // ========== BODY (绿色紧身衣) ==========
    const bodyGeo = new THREE.CylinderGeometry(0.26, 0.30, 0.68, 32);
    const body = new THREE.Mesh(bodyGeo, suitMat);
    body.position.y = 1.08;
    body.castShadow = true;
    this.mesh.add(body);

    // Chest muscles hint (slight bulge)
    const chestGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const chest = new THREE.Mesh(chestGeo, suitMat);
    chest.position.set(0, 1.18, 0.18);
    chest.scale.set(1.4, 0.8, 0.5);
    this.mesh.add(chest);

    // Abs lines (darker green strips)
    for (let i = 0; i < 3; i++) {
      const absGeo = new THREE.BoxGeometry(0.20, 0.015, 0.02);
      const abs = new THREE.Mesh(absGeo, suitDarkMat);
      abs.position.set(0, 1.02 - i * 0.08, 0.30);
      this.mesh.add(abs);
    }

    // Center zipper line
    const zipperGeo = new THREE.BoxGeometry(0.015, 0.55, 0.01);
    const zipper = new THREE.Mesh(zipperGeo, suitDarkMat);
    zipper.position.set(0, 1.05, 0.31);
    this.mesh.add(zipper);

    // High collar (绿色立领)
    const collarGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
    const collar = new THREE.Mesh(collarGeo, suitMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.42;
    this.mesh.add(collar);

    // ========== ARMS + HANDS ==========
    // Lee has bandaged forearms and muscular build
    const handGeo = new THREE.SphereGeometry(0.08, 16, 16);

    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.14);
      
      // Upper arm (suit)
      const upperLen = capLen * 0.45;
      const upperArm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.08, upperLen, 4, 16),
        suitMat
      );
      upperArm.position.y = -upperLen / 2;
      group.add(upperArm);

      // Forearm (bandaged)
      const lowerLen = capLen * 0.45;
      const lowerArm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.075, lowerLen, 4, 16),
        bandageMat
      );
      lowerArm.position.y = -upperLen - lowerLen / 2 - 0.02;
      group.add(lowerArm);

      // Hand
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

    // Arms (muscular, slightly wider)
    addArm(-0.32, 1.35, 0, -0.50, 0.72, 0, false);
    addArm(0.32, 1.35, 0, 0.50, 0.72, 0, true);

    // ========== LEGS + FEET ==========
    // Lee has bandaged lower legs
    const legGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.40, 16);
    const footGeo = new THREE.SphereGeometry(0.12, 16, 16);

    const addLeg = (x, isRight) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(x, 0.52, 0);

      // Thigh (suit)
      const thighGeo = new THREE.CylinderGeometry(0.10, 0.09, 0.22, 16);
      const thigh = new THREE.Mesh(thighGeo, suitMat);
      thigh.position.y = -0.11;
      legGroup.add(thigh);

      // Shin (bandaged)
      const shinGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.20, 16);
      const shin = new THREE.Mesh(shinGeo, bandageMat);
      shin.position.y = -0.32;
      legGroup.add(shin);

      // Foot (blue sandals style)
      const foot = new THREE.Mesh(footGeo, new THREE.MeshToonMaterial({ color: 0x1a3c8a, gradientMap: toonGradient }));
      foot.position.set(0, -0.44, 0.05);
      foot.scale.set(1, 0.5, 1.6);
      legGroup.add(foot);

      this.mesh.add(legGroup);
      if (isRight) {
        this.rightLeg = legGroup;
      } else {
        this.leftLeg = legGroup;
      }
    };

    addLeg(-0.14, false);
    addLeg(0.14, true);

    // Scale to ~1.75m height for basketball court proportion
    this.mesh.scale.set(0.48, 0.48, 0.48);
  }

  update(time, delta) {
    super.update(time, delta);
  }
}
