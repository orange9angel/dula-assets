import * as THREE from 'three';
import { ProjectileBase } from 'dula-engine';

/**
 * SpiritGunProjectile — 灵丸弹道
 * 蓝色能量球，带螺旋拖尾和击中爆炸
 * 
 * 所有动画基于故事时间，支持离线逐帧渲染
 */
export class SpiritGunProjectile extends ProjectileBase {
  constructor(options = {}) {
    super(options);
    this.speed = options.speed || 20;
    this.duration = this.distance / this.speed;
    this.endTime = this.startTime + this.duration;
  }
  
  createVisual(scene) {
    if (this.visualCreated) return this.mesh;
    this.visualCreated = true;
    
    const group = new THREE.Group();
    
    // 核心 — 高亮球体
    const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.95,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    group.add(this.core);
    
    // 外层光晕
    const glowGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x66aaff,
      transparent: true,
      opacity: 0.3,
    });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(this.glow);
    
    // 螺旋环
    const ringGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.6,
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.rotation.x = Math.PI / 2;
    group.add(this.ring);
    
    group.position.copy(this.fromPos);
    scene.add(group);
    this.mesh = group;
    return group;
  }
  
  update(time, delta, scene, characters) {
    if (!this.active) {
      this._updateHitEffects(time, scene);
      return;
    }
    if (time < this.startTime) return;
    
    // 确保视觉对象已创建
    if (!this.visualCreated && scene) {
      this.createVisual(scene);
    }
    
    // 旋转螺旋环（基于delta，已考虑timeScale）
    if (this.ring) {
      this.ring.rotation.z += delta * 10;
    }
    
    // 脉冲效果
    if (this.glow) {
      const pulse = 1 + Math.sin(time * 15) * 0.15;
      this.glow.scale.setScalar(pulse);
    }
    
    // 调用父类更新（位置、轨迹、碰撞检测）
    super.update(time, delta, scene, characters);
  }
  
  /**
   * 创建灵丸击中特效 — 多层爆炸 + 冲击波环
   * 所有特效加入 hitEffects 数组，由 _updateHitEffects 驱动
   */
  _createHitEffect(time, scene) {
    const hitPos = this.toPos.clone();
    
    // 多层爆炸球
    const layers = [
      { color: 0xffffff, size: 0.3, duration: 0.15, delay: 0 },
      { color: 0x88ccff, size: 0.5, duration: 0.25, delay: 0.05 },
      { color: 0x4466aa, size: 0.8, duration: 0.4, delay: 0.1 },
    ];
    
    layers.forEach((layer) => {
      const geometry = new THREE.SphereGeometry(layer.size, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: 0.7,
      });
      const burst = new THREE.Mesh(geometry, material);
      burst.position.copy(hitPos);
      burst.visible = false; // 初始不可见，等delay过后
      scene.add(burst);
      
      this.hitEffects.push({
        mesh: burst,
        startTime: time + layer.delay,
        duration: layer.duration,
        type: 'burst',
        baseScale: 1,
      });
    });
    
    // 冲击波环
    const ringGeo = new THREE.RingGeometry(0.1, 0.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(hitPos);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    
    this.hitEffects.push({
      mesh: ring,
      startTime: time,
      duration: 0.5,
      type: 'ring',
      baseScale: 1,
    });
  }
  
  /**
   * 更新轨迹 — 使用更粗的tube + 渐隐效果
   */
  _updateTrail(scene) {
    if (this.trail.length < 2) return;
    
    if (this.trailMesh) {
      scene.remove(this.trailMesh);
      this.trailMesh.geometry?.dispose();
      this.trailMesh.material?.dispose();
    }
    
    const points = this.trail.map(t => t.pos);
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, Math.min(points.length * 3, 60), 0.08, 6, false);
    const material = new THREE.MeshBasicMaterial({
      color: 0x66aaff,
      transparent: true,
      opacity: 0.35,
    });
    this.trailMesh = new THREE.Mesh(geometry, material);
    scene.add(this.trailMesh);
  }
}
