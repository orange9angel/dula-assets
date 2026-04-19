import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

export class RoomScene extends SceneBase {
  constructor() {
    super('RoomScene');
  }

  build() {
    super.build();

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd9a066, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(20, 20);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f0, roughness: 0.9 });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 10;
    this.scene.add(ceiling);

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(20, 10);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.9 });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 5, -5);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-10, 5, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(10, 5, 0);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // Desk
    const deskTopGeo = new THREE.BoxGeometry(3, 0.15, 1.5);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
    const deskTop = new THREE.Mesh(deskTopGeo, woodMat);
    deskTop.position.set(0, 1.2, -3);
    deskTop.castShadow = true;
    this.scene.add(deskTop);

    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
    for (const [x, z] of [[-1.3, -0.6], [1.3, -0.6], [-1.3, 0.6], [1.3, 0.6]]) {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, 0.6, -3 + z);
      leg.castShadow = true;
      this.scene.add(leg);
    }

    // Chair
    const seatGeo = new THREE.BoxGeometry(1, 0.1, 1);
    const seat = new THREE.Mesh(seatGeo, woodMat);
    seat.position.set(0, 0.7, -1.5);
    seat.castShadow = true;
    this.scene.add(seat);

    const backGeo = new THREE.BoxGeometry(1, 1, 0.1);
    const back = new THREE.Mesh(backGeo, woodMat);
    back.position.set(0, 1.2, -1.95);
    back.castShadow = true;
    this.scene.add(back);

    const chairLegGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 16);
    for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      const leg = new THREE.Mesh(chairLegGeo, woodMat);
      leg.position.set(x, 0.35, -1.5 + z);
      leg.castShadow = true;
      this.scene.add(leg);
    }

    // Desk lamp
    const lampBaseGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.06, 16);
    const lampMetalMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.6 });
    const lampBase = new THREE.Mesh(lampBaseGeo, lampMetalMat);
    lampBase.position.set(-1.0, 1.35, -3);
    this.scene.add(lampBase);

    const lampPoleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
    const lampPole = new THREE.Mesh(lampPoleGeo, lampMetalMat);
    lampPole.position.set(-1.0, 1.6, -3);
    this.scene.add(lampPole);

    const lampShadeGeo = new THREE.ConeGeometry(0.18, 0.22, 16, 1, true);
    const lampShadeMat = new THREE.MeshStandardMaterial({ color: 0x66aaff, roughness: 0.5, side: THREE.DoubleSide });
    const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat);
    lampShade.position.set(-1.0, 1.82, -3);
    this.scene.add(lampShade);

    // Light bulb glow
    const bulbGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: 0xffffcc, emissiveIntensity: 0.6 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(-1.0, 1.75, -3);
    this.scene.add(bulb);

    // Dorayaki stack on desk
    const doraMat = new THREE.MeshStandardMaterial({ color: 0xd4a058, roughness: 0.7 });
    for (let i = 0; i < 3; i++) {
      const doraGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16);
      const dora = new THREE.Mesh(doraGeo, doraMat);
      dora.position.set(1.0, 1.34 + i * 0.04, -3);
      dora.castShadow = true;
      this.scene.add(dora);
    }
    // Single dorayaki on floor (dropped)
    const droppedDora = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16), doraMat);
    droppedDora.position.set(2.5, 0.02, -1.5);
    droppedDora.rotation.z = 0.3;
    this.scene.add(droppedDora);

    // Bookshelf (left wall)
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.7 });
    const shelfGeo = new THREE.BoxGeometry(0.15, 3.5, 2.5);
    const shelfBack = new THREE.Mesh(shelfGeo, shelfMat);
    shelfBack.position.set(-9.85, 1.75, 2);
    shelfBack.castShadow = true;
    this.scene.add(shelfBack);

    // Shelf boards
    for (let i = 0; i < 4; i++) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 2.4), shelfMat);
      board.position.set(-9.75, 0.5 + i * 1.0, 2);
      board.castShadow = true;
      this.scene.add(board);
    }

    // Books on shelf (colorful spines)
    const bookColors = [0xcc3333, 0x3366cc, 0x33aa33, 0xffaa00, 0x9933cc, 0x00aaaa];
    for (let row = 0; row < 3; row++) {
      for (let b = 0; b < 8; b++) {
        const h = 0.2 + Math.random() * 0.25;
        const bookGeo = new THREE.BoxGeometry(0.06, h, 0.18);
        const bookMat = new THREE.MeshStandardMaterial({ color: bookColors[(row * 8 + b) % bookColors.length], roughness: 0.8 });
        const book = new THREE.Mesh(bookGeo, bookMat);
        book.position.set(-9.6, 0.5 + row * 1.0 + h / 2, 1.2 + b * 0.22);
        book.rotation.y = (Math.random() - 0.5) * 0.1;
        this.scene.add(book);
      }
    }

    // Bed (right wall area)
    const bedFrameMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const blanketMat = new THREE.MeshStandardMaterial({ color: 0x4a90a4, roughness: 0.8 });

    // Bed frame
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 3.2), bedFrameMat);
    bedFrame.position.set(7, 0.175, -1);
    bedFrame.castShadow = true;
    this.scene.add(bedFrame);

    // Mattress
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 3.0), mattressMat);
    mattress.position.set(7, 0.475, -1);
    mattress.castShadow = true;
    this.scene.add(mattress);

    // Blanket (covers lower half)
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.28, 1.8), blanketMat);
    blanket.position.set(7, 0.49, -0.2);
    this.scene.add(blanket);

    // Pillow
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.6), new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.9 }));
    pillow.position.set(7, 0.63, -2.1);
    pillow.castShadow = true;
    this.scene.add(pillow);

    // Headboard
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 0.1), bedFrameMat);
    headboard.position.set(7, 0.8, -2.55);
    headboard.castShadow = true;
    this.scene.add(headboard);

    // Wardrobe (back-left corner)
    const wardrobeMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4.0, 1.2), wardrobeMat);
    wardrobe.position.set(-7, 2.0, -4.3);
    wardrobe.castShadow = true;
    this.scene.add(wardrobe);

    // Wardrobe doors line
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.02, 3.8, 1.22), new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 }));
    doorLine.position.set(-7, 2.0, -4.3);
    this.scene.add(doorLine);

    // Wardrobe handles
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.3 });
    for (const x of [-6.4, -7.6]) {
      const handle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), handleMat);
      handle.position.set(x, 2.0, -3.65);
      this.scene.add(handle);
    }

    // Rug (center of room)
    const rugMat = new THREE.MeshStandardMaterial({ color: 0xcc5544, roughness: 0.95 });
    const rug = new THREE.Mesh(new THREE.CircleGeometry(2.5, 32), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.01, 1);
    rug.receiveShadow = true;
    this.scene.add(rug);

    // Window
    const windowFrameGeo = new THREE.BoxGeometry(4, 3, 0.1);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4 });
    const windowFrame = new THREE.Mesh(windowFrameGeo, frameMat);
    windowFrame.position.set(0, 4.5, -4.95);
    this.scene.add(windowFrame);

    const glassGeo = new THREE.PlaneGeometry(3.6, 2.6);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xadd8e6,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 4.5, -4.9);
    this.scene.add(glass);

    // Door (on right wall)
    const doorFrameGeo = new THREE.BoxGeometry(0.2, 4, 2.2);
    const doorFrame = new THREE.Mesh(doorFrameGeo, new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 }));
    doorFrame.position.set(-9.9, 2, 2);
    this.scene.add(doorFrame);

    const doorGeo = new THREE.BoxGeometry(0.1, 3.8, 2);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(-9.85, 2, 2);
    this.scene.add(door);

    // Doorknob
    const knobGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(-9.75, 2, 2.7);
    this.scene.add(knob);

    // Wall clock
    const clockFrame = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 24), frameMat);
    clockFrame.position.set(0, 6, -4.92);
    this.scene.add(clockFrame);
    const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    clockFace.position.set(0, 6, -4.9);
    this.scene.add(clockFace);
    // Clock hands
    const handMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.01), handMat);
    hourHand.position.set(0, 6.05, -4.88);
    hourHand.rotation.z = -0.5;
    this.scene.add(hourHand);
    const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.22, 0.01), handMat);
    minuteHand.position.set(0, 6.08, -4.88);
    minuteHand.rotation.z = 0.3;
    this.scene.add(minuteHand);

    return this.scene;
  }
}
