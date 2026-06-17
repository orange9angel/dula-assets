import * as THREE from 'three';
import { SceneBase } from 'dula-engine';

export class LockerRoomScene extends SceneBase {
  constructor() {
    super('LockerRoomScene');
  }

  build() {
    super.build();

    // Floor - sports locker room style
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a5a4a, roughness: 0.7 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(30, 30);
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.9 });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 8;
    this.scene.add(ceiling);

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(30, 8);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.9 });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 4, -15);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-15, 4, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(15, 4, 0);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // Locker rows (back wall)
    const lockerMat = new THREE.MeshStandardMaterial({ color: 0x4a6a8a, roughness: 0.5, metalness: 0.3 });
    const lockerGeo = new THREE.BoxGeometry(1.2, 2.0, 0.8);
    for (let i = 0; i < 10; i++) {
      const locker = new THREE.Mesh(lockerGeo, lockerMat);
      locker.position.set(-6 + i * 1.4, 1.0, -14.2);
      locker.castShadow = true;
      this.scene.add(locker);

      // Locker door line
      const doorLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 1.8, 0.82),
        new THREE.MeshStandardMaterial({ color: 0x3a5a7a, roughness: 0.6 })
      );
      doorLine.position.set(-6 + i * 1.4, 1.0, -14.2);
      this.scene.add(doorLine);

      // Locker number plate
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.2, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
      );
      plate.position.set(-6 + i * 1.4, 1.7, -13.79);
      this.scene.add(plate);
    }

    // Bench (center area)
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6 });
    const benchTop = new THREE.Mesh(new THREE.BoxGeometry(12, 0.15, 1.5), benchMat);
    benchTop.position.set(0, 0.8, 0);
    benchTop.castShadow = true;
    this.scene.add(benchTop);

    const benchLegGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16);
    for (const [x, z] of [[-5.5, -0.6], [5.5, -0.6], [-5.5, 0.6], [5.5, 0.6]]) {
      const leg = new THREE.Mesh(benchLegGeo, benchMat);
      leg.position.set(x, 0.4, z);
      leg.castShadow = true;
      this.scene.add(leg);
    }

    // Water cooler
    const coolerBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.45, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    coolerBase.position.set(12, 0.6, -12);
    coolerBase.castShadow = true;
    this.scene.add(coolerBase);

    const coolerTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x66aaff, roughness: 0.3, transparent: true, opacity: 0.7 })
    );
    coolerTop.position.set(12, 1.45, -12);
    this.scene.add(coolerTop);

    // Towel rack (right wall)
    const rackBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.3 })
    );
    rackBar.rotation.z = Math.PI / 2;
    rackBar.position.set(14.8, 2.5, -5);
    this.scene.add(rackBar);

    // Towels hanging
    const towelColors = [0xcc3333, 0x3366cc, 0x33aa33, 0xffaa00, 0x9933cc];
    for (let i = 0; i < 5; i++) {
      const towel = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.5, 0.05),
        new THREE.MeshStandardMaterial({ color: towelColors[i], roughness: 0.9 })
      );
      towel.position.set(11 + i * 1.8, 1.8, -5);
      towel.rotation.z = (Math.random() - 0.5) * 0.1;
      this.scene.add(towel);
    }

    // Trophy shelf (back wall above lockers)
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.1, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.6 })
    );
    shelf.position.set(0, 3.2, -14.5);
    shelf.castShadow = true;
    this.scene.add(shelf);

    // Trophies on shelf
    const trophyMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    for (let i = 0; i < 5; i++) {
      const trophyBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.2, 16), trophyMat);
      trophyBase.position.set(-5 + i * 2.5, 3.4, -14.3);
      this.scene.add(trophyBase);

      const trophyCup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.1, 0.3, 16), trophyMat);
      trophyCup.position.set(-5 + i * 2.5, 3.65, -14.3);
      this.scene.add(trophyCup);

      const trophyHandle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI), trophyMat);
      trophyHandle.position.set(-5 + i * 2.5, 3.65, -14.3);
      trophyHandle.rotation.y = Math.PI / 2;
      this.scene.add(trophyHandle);
    }

    // Sports equipment rack (left wall)
    const equipRack = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5, roughness: 0.4 })
    );
    equipRack.position.set(-14.8, 1.5, 5);
    this.scene.add(equipRack);

    // Hurdles leaning against rack
    const hurdleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    for (let i = 0; i < 3; i++) {
      const hurdle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05), hurdleMat);
      hurdle.position.set(-14.5, 0.6, 4 + i * 0.8);
      hurdle.rotation.z = 0.3;
      this.scene.add(hurdle);
    }

    // Clock on back wall
    const clockFrame = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 })
    );
    clockFrame.position.set(0, 5, -14.92);
    this.scene.add(clockFrame);

    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.36, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    clockFace.position.set(0, 5, -14.9);
    this.scene.add(clockFace);

    // Whiteboard (left wall)
    const whiteboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 2.5, 4),
      new THREE.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 0.9 })
    );
    whiteboard.position.set(-14.9, 3.5, -8);
    this.scene.add(whiteboard);

    const wbFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 2.6, 4.1),
      new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.4 })
    );
    whiteboard.position.set(-14.9, 3.5, -8);
    this.scene.add(wbFrame);

    // Floor mat near entrance
    const matMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.95 });
    const mat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.02, 2), matMat);
    mat.position.set(0, 0.01, 12);
    this.scene.add(mat);

    return this.scene;
  }
}
