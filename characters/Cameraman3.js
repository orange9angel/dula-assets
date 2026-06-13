import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Cameraman — 摄像师（背景记者）
 * 复用 Reporter 的外观，但名字不同，用于场景中作为背景扛摄像机的外星人
 * 绿色小外星人，扛着摄像机
 */
export class Cameraman3 extends CharacterBase {
  constructor() {
    super('Cameraman3');
    this.boundingRadius = 0.4;
    this.archetypes = ['humanoid', 'alien', 'small'];
    this.baseY = 0.15;
    this.trustedBodyAnimations = [
      'Walk', 'Run', 'LookAround',
      'PointForward', 'CrossArms', 'WaveHand',
      'Bow', 'ReachOut', 'Nod', 'FaceHappy',
      'FaceDetermined', 'FaceSurprised', 'FaceBlink',
    ];
    this.allowedBodyAnimations = new Set(this.trustedBodyAnimations);
  }

  createToonGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 4; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 4, 0);
    g.addColorStop(0, '#2a2a2a');
    g.addColorStop(0.45, '#707070');
    g.addColorStop(0.55, '#c0c0c0');
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  build() {
    const toonGradient = this.createToonGradient();

    // Materials - 用不同颜色区分（偏蓝色调）
    const skinMat = new THREE.MeshToonMaterial({ color: 0x5c9bd1, gradientMap: toonGradient });
    const skinDarkMat = new THREE.MeshToonMaterial({ color: 0x3d7ab5, gradientMap: toonGradient });
    const eyeWhiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
    const pupilMat = new THREE.MeshToonMaterial({ color: 0x000000, gradientMap: toonGradient });
    const mouthMat = new THREE.MeshToonMaterial({ color: 0x4a2c6a, gradientMap: toonGradient });
    const suitMat = new THREE.MeshToonMaterial({ color: 0x263238, gradientMap: toonGradient });
    const suitLightMat = new THREE.MeshToonMaterial({ color: 0x455a64, gradientMap: toonGradient });
    const camBodyMat = new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.6, roughness: 0.3 });
    const camLensMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.1 });
    const camGlassMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5c, metalness: 0.8, roughness: 0.05, transparent: true, opacity: 0.8 });
    const camRedMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // ========== BODY GROUP ==========
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0.6;

    // Main body
    const bodyGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const body = new THREE.Mesh(bodyGeo, suitMat);
    body.scale.set(1, 1.1, 0.9);
    body.castShadow = true;
    bodyGroup.add(body);

    // Suit collar
    const collarGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 16);
    const collar = new THREE.Mesh(collarGeo, suitLightMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.32, 0);
    bodyGroup.add(collar);

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.15;
    this.headGroup = headGroup;

    // Head
    const headGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Three eyes
    this.leftPupil = null;
    this.rightPupil = null;
    const eyePositions = [
      { x: -0.12, y: 0.05, z: 0.22 },
      { x: 0.12, y: 0.05, z: 0.22 },
      { x: 0, y: 0.14, z: 0.2 },
    ];

    for (let i = 0; i < 3; i++) {
      const pos = eyePositions[i];
      const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const eye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
      eye.position.set(pos.x, pos.y, pos.z);
      headGroup.add(eye);

      const pupilGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.set(pos.x, pos.y, pos.z + 0.05);
      headGroup.add(pupil);

      if (i === 0) this.leftPupil = pupil;
      if (i === 1) this.rightPupil = pupil;
    }

    // Eyebrows
    for (const side of [-1, 1]) {
      const browGeo = new THREE.CapsuleGeometry(0.02, 0.08, 4, 8);
      const brow = new THREE.Mesh(browGeo, skinDarkMat);
      brow.position.set(side * 0.12, 0.14, 0.24);
      brow.rotation.z = side * 0.2;
      headGroup.add(brow);
    }

    // Mouth
    const mouthGeo = new THREE.TorusGeometry(0.06, 0.015, 8, 16, Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = Math.PI;
    mouth.position.set(0, -0.1, 0.24);
    headGroup.add(mouth);
    this.mouth = mouth;
    this.mouthBaseScaleX = 1;
    this.mouthBaseScaleY = 1;
    this.mouthBaseScaleZ = 1;

    // Antennae
    for (const side of [-1, 1]) {
      const antennaGroup = new THREE.Group();
      const stemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8);
      const stem = new THREE.Mesh(stemGeo, skinDarkMat);
      stem.position.y = 0.1;
      antennaGroup.add(stem);

      const ballGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const ball = new THREE.Mesh(ballGeo, camRedMat);
      ball.position.y = 0.22;
      antennaGroup.add(ball);

      antennaGroup.position.set(side * 0.15, 0.25, 0);
      antennaGroup.rotation.z = side * -0.3;
      headGroup.add(antennaGroup);
    }

    // ========== ARMS ==========
    // Right arm — holds camera on shoulder
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(-0.3, 0.25, 0);
    bodyGroup.add(this.rightArm);

    const armGeo = new THREE.CapsuleGeometry(0.05, 0.2, 4, 8);
    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    rightArmMesh.position.y = -0.1;
    this.rightArm.add(rightArmMesh);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.set(0, -0.2, 0);
    this.rightArm.add(this.rightElbow);

    const forearmGeo = new THREE.CapsuleGeometry(0.04, 0.18, 4, 8);
    const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
    rightForearm.position.y = -0.09;
    this.rightElbow.add(rightForearm);

    this.rightWrist = new THREE.Group();
    this.rightWrist.position.set(0, -0.18, 0);
    this.rightElbow.add(this.rightWrist);

    const handGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const rightHand = new THREE.Mesh(handGeo, skinMat);
    this.rightWrist.add(rightHand);

    // ========== VIDEO CAMERA (larger, on shoulder) ==========
    const camGroup = new THREE.Group();
    camGroup.position.set(0, 0.05, 0.1);
    this.rightWrist.add(camGroup);

    // Camera body
    const camBodyGeo = new THREE.BoxGeometry(0.22, 0.15, 0.3);
    const camBody = new THREE.Mesh(camBodyGeo, camBodyMat);
    camBody.position.set(0, 0.1, 0.05);
    camGroup.add(camBody);

    // Camera lens barrel
    const camBarrelGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.15, 16);
    const camBarrel = new THREE.Mesh(camBarrelGeo, camLensMat);
    camBarrel.rotation.x = Math.PI / 2;
    camBarrel.position.set(0, 0.1, 0.26);
    camGroup.add(camBarrel);

    // Camera lens glass
    const camGlassGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.01, 16);
    const camGlass = new THREE.Mesh(camGlassGeo, camGlassMat);
    camGlass.rotation.x = Math.PI / 2;
    camGlass.position.set(0, 0.1, 0.33);
    camGroup.add(camGlass);

    // Camera viewfinder
    const viewfinderGeo = new THREE.BoxGeometry(0.08, 0.05, 0.1);
    const viewfinder = new THREE.Mesh(viewfinderGeo, camBodyMat);
    viewfinder.position.set(0, 0.2, -0.05);
    camGroup.add(viewfinder);

    // Camera handle
    const handleGeo = new THREE.BoxGeometry(0.05, 0.08, 0.15);
    const handle = new THREE.Mesh(handleGeo, camBodyMat);
    handle.position.set(0, 0.24, 0);
    camGroup.add(handle);

    // Recording light
    const recLightGeo = new THREE.SphereGeometry(0.018, 8, 8);
    const recLight = new THREE.Mesh(recLightGeo, camRedMat);
    recLight.position.set(0.1, 0.17, 0.15);
    camGroup.add(recLight);
    this.recLight = recLight;

    // Camera light glow
    const camLight = new THREE.PointLight(0xff3333, 0.3, 1.5);
    camLight.position.set(0.1, 0.17, 0.15);
    camGroup.add(camLight);

    // Left arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(0.3, 0.25, 0);
    bodyGroup.add(this.leftArm);

    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    leftArmMesh.position.y = -0.1;
    this.leftArm.add(leftArmMesh);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.set(0, -0.2, 0);
    this.leftArm.add(this.leftElbow);

    const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
    leftForearm.position.y = -0.09;
    this.leftElbow.add(leftForearm);

    this.leftWrist = new THREE.Group();
    this.leftWrist.position.set(0, -0.18, 0);
    this.leftElbow.add(this.leftWrist);

    const leftHand = new THREE.Mesh(handGeo, skinMat);
    this.leftWrist.add(leftHand);

    // ========== LEGS ==========
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(-0.15, -0.3, 0);
    bodyGroup.add(this.rightLeg);

    const legGeo = new THREE.CapsuleGeometry(0.06, 0.15, 4, 8);
    const rightLegMesh = new THREE.Mesh(legGeo, suitMat);
    rightLegMesh.position.y = -0.08;
    this.rightLeg.add(rightLegMesh);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.set(0, -0.15, 0);
    this.rightLeg.add(this.rightKnee);

    const shinGeo = new THREE.CapsuleGeometry(0.05, 0.12, 4, 8);
    const rightShin = new THREE.Mesh(shinGeo, suitMat);
    rightShin.position.y = -0.06;
    this.rightKnee.add(rightShin);

    this.rightAnkle = new THREE.Group();
    this.rightAnkle.position.set(0, -0.12, 0);
    this.rightKnee.add(this.rightAnkle);

    const footGeo = new THREE.BoxGeometry(0.1, 0.05, 0.15);
    const rightFoot = new THREE.Mesh(footGeo, suitMat);
    rightFoot.position.set(0, -0.03, 0.03);
    this.rightAnkle.add(rightFoot);

    // Left leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(0.15, -0.3, 0);
    bodyGroup.add(this.leftLeg);

    const leftLegMesh = new THREE.Mesh(legGeo, suitMat);
    leftLegMesh.position.y = -0.08;
    this.leftLeg.add(leftLegMesh);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.set(0, -0.15, 0);
    this.leftLeg.add(this.leftKnee);

    const leftShin = new THREE.Mesh(shinGeo, suitMat);
    leftShin.position.y = -0.06;
    this.leftKnee.add(leftShin);

    this.leftAnkle = new THREE.Group();
    this.leftAnkle.position.set(0, -0.12, 0);
    this.leftKnee.add(this.leftAnkle);

    const leftFoot = new THREE.Mesh(footGeo, suitMat);
    leftFoot.position.set(0, -0.03, 0.03);
    this.leftAnkle.add(leftFoot);

    // ========== ASSEMBLE ==========
    this.mesh.add(bodyGroup);
    this.mesh.add(headGroup);

    // Pose — camera on shoulder, aiming forward
    this.rightArm.rotation.z = -0.5;
    this.rightArm.rotation.x = -0.4;
    this.rightElbow.rotation.x = -1.0;

    return this.mesh;
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.recLight) {
      const blink = Math.sin(time * 6) > 0 ? 1 : 0.3;
      this.recLight.material.opacity = blink;
      this.recLight.scale.setScalar(0.8 + blink * 0.4);
    }
  }
}
