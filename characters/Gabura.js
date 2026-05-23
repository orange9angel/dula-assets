import * as THREE from 'three';
import { CharacterBase } from 'dula-engine';

/**
 * Gabura — 经典怪兽风格
 * 厚重装甲、尖牙、背鳍、粗壮四肢
 * 类似哥莫拉/雷德王的经典怪兽造型
 */
export class Gabura extends CharacterBase {
  constructor() {
    super('Gabura');
    this.boundingRadius = 2.5;
  }

  build() {
    const toonGradient = (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 4; canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 4, 0);
      g.addColorStop(0, '#333'); g.addColorStop(0.4, '#555'); g.addColorStop(0.7, '#777'); g.addColorStop(1, '#999');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 1);
      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      return tex;
    })();

    // Classic monster colors
    const darkGreenMat = new THREE.MeshToonMaterial({ color: 0x2d5016, gradientMap: toonGradient });
    const darkBrownMat = new THREE.MeshToonMaterial({ color: 0x4a3728, gradientMap: toonGradient });
    const redEyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const boneMat = new THREE.MeshToonMaterial({ color: 0xddddaa, gradientMap: toonGradient });

    // ========== HEAD GROUP ==========
    const headGroup = new THREE.Group();
    headGroup.position.y = 5.5;

    // Main head (reptilian, angular)
    const headGeo = new THREE.BoxGeometry(1.6, 1.4, 1.8);
    const head = new THREE.Mesh(headGeo, darkGreenMat);
    head.castShadow = true;
    headGroup.add(head);

    // Snout
    const snoutGeo = new THREE.BoxGeometry(1.0, 0.8, 1.2);
    const snout = new THREE.Mesh(snoutGeo, darkGreenMat);
    snout.position.set(0, -0.15, 1.2);
    headGroup.add(snout);

    // Jaw (lower)
    const jawGeo = new THREE.BoxGeometry(0.9, 0.3, 1.0);
    const jaw = new THREE.Mesh(jawGeo, darkGreenMat);
    jaw.position.set(0, -0.7, 1.0);
    headGroup.add(jaw);
    this.jaw = jaw;

    // Eyes (glowing red, angry)
    const eyeGeo = new THREE.SphereGeometry(0.2, 16, 16);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, redEyeMat);
      eye.position.set(side * 0.5, 0.1, 0.8);
      eye.scale.set(1, 0.7, 0.5);
      headGroup.add(eye);

      // Eye glow
      const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(side * 0.5, 0.1, 0.8);
      glow.scale.set(1, 0.7, 0.5);
      headGroup.add(glow);
    }

    // Horns (curving back)
    for (const side of [-1, 1]) {
      const hornGeo = new THREE.ConeGeometry(0.12, 1.0, 8);
      const horn = new THREE.Mesh(hornGeo, boneMat);
      horn.position.set(side * 0.6, 0.9, -0.3);
      horn.rotation.z = side * 0.4;
      horn.rotation.x = -0.3;
      headGroup.add(horn);
    }

    // Fangs (upper jaw)
    for (const side of [-1, 1]) {
      const fangGeo = new THREE.ConeGeometry(0.06, 0.4, 6);
      const fang = new THREE.Mesh(fangGeo, boneMat);
      fang.position.set(side * 0.25, -0.5, 1.6);
      fang.rotation.x = Math.PI;
      headGroup.add(fang);
    }

    // Nostril bumps
    for (const side of [-1, 1]) {
      const nostrilGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const nostril = new THREE.Mesh(nostrilGeo, darkBrownMat);
      nostril.position.set(side * 0.2, -0.2, 1.7);
      headGroup.add(nostril);
    }

    this.headGroup = headGroup;
    this.mesh.add(headGroup);

    // ========== NECK ==========
    const neckGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.8, 12);
    const neck = new THREE.Mesh(neckGeo, darkGreenMat);
    neck.position.y = 4.8;
    this.mesh.add(neck);

    // ========== BODY (heavy, armored) ==========
    const torsoGeo = new THREE.BoxGeometry(2.2, 2.5, 1.6);
    const torso = new THREE.Mesh(torsoGeo, darkGreenMat);
    torso.position.y = 3.2;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Belly armor plates (lighter color)
    const bellyGeo = new THREE.BoxGeometry(1.4, 2.0, 0.1);
    const belly = new THREE.Mesh(bellyGeo, darkBrownMat);
    belly.position.set(0, 3.2, 0.81);
    this.mesh.add(belly);

    // Armor plate lines
    for (let i = 0; i < 3; i++) {
      const plateGeo = new THREE.BoxGeometry(1.2, 0.5, 0.05);
      const plate = new THREE.Mesh(plateGeo, boneMat);
      plate.position.set(0, 2.5 + i * 0.7, 0.86);
      this.mesh.add(plate);
    }

    // Back spines (dorsal fins)
    for (let i = 0; i < 5; i++) {
      const spineGeo = new THREE.ConeGeometry(0.15, 0.6 + i * 0.15, 6);
      const spine = new THREE.Mesh(spineGeo, boneMat);
      spine.position.set(0, 4.0 - i * 0.6, -0.9);
      spine.rotation.x = -0.3;
      this.mesh.add(spine);
    }

    // ========== ARMS (thick, muscular) ==========
    const addArm = (sx, sy, sz, hx, hy, hz, isRight) => {
      const group = new THREE.Group();
      group.position.set(sx, sy, sz);
      group.lookAt(hx, hy, hz);
      group.rotateX(-Math.PI / 2);

      const len = Math.sqrt((hx - sx) ** 2 + (hy - sy) ** 2 + (hz - sz) ** 2);
      const capLen = Math.max(0.01, len - 0.5);

      // Upper arm (thick)
      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, capLen * 0.4, 4, 16), darkGreenMat);
      upperArm.position.y = -capLen * 0.2;
      group.add(upperArm);

      // Lower arm
      const lowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, capLen * 0.35, 4, 16), darkGreenMat);
      lowerArm.position.y = -capLen * 0.55;
      group.add(lowerArm);

      // Claw hand
      const clawGroup = new THREE.Group();
      clawGroup.position.y = -len;

      // Palm
      const palmGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const palm = new THREE.Mesh(palmGeo, darkGreenMat);
      palm.scale.set(1, 0.6, 1.2);
      clawGroup.add(palm);

      // Claws
      for (let c = 0; c < 3; c++) {
        const clawGeo = new THREE.ConeGeometry(0.06, 0.5, 6);
        const claw = new THREE.Mesh(clawGeo, boneMat);
        claw.position.set((c - 1) * 0.15, -0.15, 0.35);
        claw.rotation.x = -Math.PI / 3;
        clawGroup.add(claw);
      }

      group.add(clawGroup);
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

    addArm(-1.3, 4.2, 0, -2.0, 1.5, 0.5, false);
    addArm(1.3, 4.2, 0, 2.0, 1.5, 0.5, true);

    // ========== LEGS (thick, pillar-like) ==========
    const addLeg = (side) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.7, 1.9, 0);

      // Thigh (thick)
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.0, 4, 16), darkGreenMat);
      thigh.position.y = -0.5;
      legGroup.add(thigh);

      // Shin
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.0, 4, 16), darkGreenMat);
      shin.position.y = -1.5;
      legGroup.add(shin);

      // Foot (clawed)
      const footGeo = new THREE.BoxGeometry(0.7, 0.3, 1.0);
      const foot = new THREE.Mesh(footGeo, darkGreenMat);
      foot.position.set(0, -2.2, 0.2);
      legGroup.add(foot);

      // Toe claws
      for (let t = 0; t < 3; t++) {
        const toeGeo = new THREE.ConeGeometry(0.06, 0.3, 6);
        const toe = new THREE.Mesh(toeGeo, boneMat);
        toe.position.set((t - 1) * 0.2, -2.2, 0.7);
        toe.rotation.x = -Math.PI / 2;
        legGroup.add(toe);
      }

      this.mesh.add(legGroup);
      if (side === -1) this.leftLeg = legGroup;
      else this.rightLeg = legGroup;
    };

    addLeg(-1);
    addLeg(1);

    // ========== TAIL ==========
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 2.0, -0.8);

    for (let i = 0; i < 6; i++) {
      const segGeo = new THREE.CapsuleGeometry(0.2 - i * 0.02, 0.6, 4, 8);
      const seg = new THREE.Mesh(segGeo, darkGreenMat);
      seg.position.set(0, -i * 0.5, -i * 0.3);
      seg.rotation.x = 0.3;
      tailGroup.add(seg);

      // Tail spikes
      if (i < 4) {
        const spikeGeo = new THREE.ConeGeometry(0.08, 0.3, 6);
        const spike = new THREE.Mesh(spikeGeo, boneMat);
        spike.position.set(0, -i * 0.5 + 0.1, -i * 0.3 - 0.2);
        spike.rotation.x = -0.5;
        tailGroup.add(spike);
      }
    }

    this.mesh.add(tailGroup);
    this.tail = tailGroup;

    // ========== GLOW EFFECT (menacing aura) ==========
    const auraGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0x330000, transparent: true, opacity: 0.03 });
    this.aura = new THREE.Mesh(auraGeo, auraMat);
    this.aura.position.y = 3.0;
    this.mesh.add(this.aura);
  }

  update(time, delta) {
    super.update(time, delta);
    // Tail sway
    if (this.tail) {
      this.tail.rotation.y = Math.sin(time * 2) * 0.2;
    }
    // Aura pulse
    if (this.aura) {
      this.aura.material.opacity = 0.02 + Math.sin(time * 3) * 0.015;
      this.aura.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
    }
  }
}
