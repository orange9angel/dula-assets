// 《星屑战壳》系列场景资产（R10 新增）— 沉星海底（DeepseaRuinsScene）：海底遗迹——
// 水下无天空圆柱：顶部=从下方仰望的海面光幕（大圆盘贴水纹光斑纹理，加色透光）+
// god ray 光柱（锥形加色薄件群，缓慢摆动）+ 蓝绿水体 Fog；沉柱/断拱遗迹环列、
// 沙地+贝壳碎、上升气泡粒子（LCG 纯 t）、远处遗迹剪影带。顶封纪律同 R9 宫殿
//（顶部光幕大盘盖过仰角，不露平板边界）。
// 表演区 y=0（z>0 净空），世界布局与圣殿一致（跳切坐标连续）。
// applyHybrid(base) 纹理基路径参数（默认 './assets3d/tex/'，纹理归调用剧集，缺失静默回退）。
// update(t) 纯 (t,state)。
import * as THREE from 'three';
import {SceneBase} from 'dula-engine';

const TAU=Math.PI*2;
const toon=c=>new THREE.MeshToonMaterial({color:c});
const canvasTex=(w,h,draw)=>{
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  draw(canvas.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
};
const lcg=seed=>()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
function planarUVWorld(m,s){
  m.updateWorldMatrix(true,false);
  const p=m.geometry.attributes.position,uv=m.geometry.attributes.uv,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
    v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);
    uv.setXY(i,v.x*s,v.z*s);
  }
  uv.needsUpdate=true;
}
// 海面光幕（从水下仰望：亮心+放射波光纹；程序化保底）
function surfaceTexture(){
  return canvasTex(512,512,(c,w,h)=>{
    const g=c.createRadialGradient(w/2,h/2,20,w/2,h/2,w*.62);
    g.addColorStop(0,'#d8f4ee');g.addColorStop(.4,'#8ec8c4');g.addColorStop(1,'#3a7a84');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    const rr=lcg(11);
    c.strokeStyle='rgba(230,255,250,.5)';c.lineWidth=2;
    for(let i=0;i<40;i++){
      const a=rr()*TAU,r0=20+rr()*60;
      c.beginPath();c.moveTo(w/2+Math.cos(a)*r0,h/2+Math.sin(a)*r0);
      c.quadraticCurveTo(w/2+Math.cos(a+.3)*r0*1.8,h/2+Math.sin(a+.3)*r0*1.8,
        w/2+Math.cos(a+.5)*r0*2.6,h/2+Math.sin(a+.5)*r0*2.6);c.stroke();
    }
  });
}
function bubbleTexture(){
  return canvasTex(32,32,(c)=>{
    const g=c.createRadialGradient(16,16,2,16,16,15);
    g.addColorStop(0,'rgba(220,250,255,.9)');g.addColorStop(.7,'rgba(160,220,230,.35)');g.addColorStop(1,'rgba(160,220,230,0)');
    c.fillStyle=g;c.fillRect(0,0,32,32);
  });
}

export class DeepseaRuinsScene extends SceneBase{
  build(){
    const S=this.scene;
    S.background=new THREE.Color('#0e3a44');
    S.fog=new THREE.Fog('#0e3a44',10,58); // 水体压远景（水下能见度低，雾距近）
    // ── 光：蓝绿水体环境 + 顶光（海面光幕下来）+ 正面补（人物可读性，别一潭死蓝）──
    S.add(new THREE.HemisphereLight(0x3a7a80,0x0a1c22,1.15));
    const top=new THREE.DirectionalLight(0xbfe8e0,1.5); // 海面天光
    top.position.set(2,16,4);top.castShadow=true;top.shadow.mapSize.set(2048,2048);
    Object.assign(top.shadow.camera,{left:-16,right:16,top:12,bottom:-4,far:60});
    top.shadow.bias=-.0004;S.add(top);
    const fill=new THREE.DirectionalLight(0x8ac8c0,.55);fill.position.set(-3,4,12);S.add(fill);
    this.ruinGlow=new THREE.PointLight(0x60e8d0,10,18,1.8); // 遗迹幽光
    this.ruinGlow.position.set(0,1.4,-7);S.add(this.ruinGlow);

    const stone='#3c4a50',stoneD='#2c383e',sand='#7a7260';
    const texR=(m,r)=>{m.userData.texR=r;return m;};
    this.stoneMeshes=[];this.groundMeshes=[];

    // ── 沙地（海底沉积）+ 远景盘 ──
    const floor=this.floorMesh=new THREE.Mesh(new THREE.CircleGeometry(38,64),toon(sand));
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);this.groundMeshes.push(texR(floor,[1,1]));
    const far=this.farMesh=new THREE.Mesh(new THREE.CircleGeometry(85,40),toon('#4c463c'));
    far.rotation.x=-Math.PI/2;far.position.y=-.03;S.add(far);this.groundMeshes.push(texR(far,[1,1]));

    // ── 海面光幕（顶封：y=14 大盘，从下方仰望亮心放射波光）──
    this.surface=new THREE.Mesh(new THREE.CircleGeometry(60,48),
      new THREE.MeshBasicMaterial({map:surfaceTexture(),transparent:true,opacity:.96,depthWrite:false}));
    this.surface.rotation.x=Math.PI/2; // 法线朝下（从下方可见）
    this.surface.position.y=14;S.add(this.surface);
    // ── god ray 光柱（锥形加色薄件，自光幕垂下缓摆）──
    this.rays=[];
    {const rr=lcg(17);
     for(let i=0;i<9;i++){
       const a=rr()*TAU,r=3+rr()*13;
       const cone=new THREE.Mesh(new THREE.ConeGeometry(1.1+rr()*.8,13,10,1,true),
         new THREE.MeshBasicMaterial({color:'#c8f0e8',transparent:true,opacity:.07,
           blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
       cone.position.set(Math.cos(a)*r,7.4,Math.sin(a)*r);
       cone.userData={ph:rr()*TAU,ax:(rr()-.5)*.06};
       S.add(cone);this.rays.push(cone);
     }}
    // ── 沉柱遗迹环列（断柱群，z -7 后弧）──
    {const rr=lcg(29);
     for(let i=0;i<8;i++){
       const a=Math.PI*.15+i*Math.PI*.1-.4,x=-14+i*4+(rr()-.5)*1.5,z=-6.5-rr()*3;
       const h=2.2+rr()*4.5;
       const p=new THREE.Mesh(new THREE.CylinderGeometry(.55,.68,h,12),toon(stone));
       p.position.set(x,h/2,z);p.rotation.z=(rr()-.5)*.14;p.castShadow=p.receiveShadow=true;S.add(p);
       this.stoneMeshes.push(texR(p,[2,2]));
       if(rr()<.5){ // 柱顶断冠
         const cap=new THREE.Mesh(new THREE.CylinderGeometry(.72,.6,.5,12),toon(stoneD));
         cap.position.set(x,h+.2,z);cap.rotation.z=(rr()-.5)*.3;S.add(cap);
         this.stoneMeshes.push(texR(cap,[1,1]));
       }
     }}
    // 断拱（中央偏后遗迹主体）
    const archL=new THREE.Mesh(new THREE.CylinderGeometry(.6,.7,5.5,12),toon(stone));
    archL.position.set(-2.6,2.75,-9.5);archL.castShadow=true;S.add(archL);this.stoneMeshes.push(texR(archL,[2,2]));
    const archR=archL.clone();archR.position.set(2.6,2.75,-9.5);S.add(archR);this.stoneMeshes.push(texR(archR,[2,2]));
    const archTop=new THREE.Mesh(new THREE.TorusGeometry(2.6,.55,10,16,Math.PI),toon(stone));
    archTop.position.set(0,5.4,-9.5);S.add(archTop);this.stoneMeshes.push(texR(archTop,[3,1]));
    // 半埋坛罐/箱（沙地散件，走廊外）
    {const rr=lcg(41);
     for(let i=0;i<8;i++){
       const sx=rr()<.5?-1:1,x=sx*(6+rr()*12),z=-2+rr()*8;
       const jar=new THREE.Mesh(new THREE.SphereGeometry(.5+rr()*.3,10,8),toon(rr()<.5?stoneD:'#4c4438'));
       jar.scale.y=.8;jar.position.set(x,.22,z);jar.rotation.y=rr()*TAU;
       jar.castShadow=jar.receiveShadow=true;S.add(jar);this.stoneMeshes.push(texR(jar,[1,1]));
     }}
    // 贝壳碎（沙地小件）
    {const rr=lcg(61);
     for(let i=0;i<14;i++){
       const a=rr()*TAU,r=3+rr()*13;
       const sh=new THREE.Mesh(new THREE.SphereGeometry(.09+rr()*.07,8,6,0,TAU,0,Math.PI/2),toon('#8a8494'));
       sh.position.set(Math.cos(a)*r,.03,Math.sin(a)*r);
       sh.rotation.y=rr()*TAU;S.add(sh);
     }}
    // ── 上升气泡（LCG 循环：从遗迹区上升）──
    this.bubbles=[];
    {const rr=lcg(73),tex=bubbleTexture();
     for(let i=0;i<22;i++){
       const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.55,depthWrite:false}));
       s.userData={x:(rr()-.5)*20,z:-8+rr()*10,ph:rr(),sp:.6+rr()*.8,r:.06+rr()*.1};
       S.add(s);this.bubbles.push(s);
     }}
    // ── 远处遗迹剪影带（压暗土丘状，雾中）──
    {const rr=lcg(83);
     for(let i=0;i<10;i++){
       const a=Math.PI*.1+i*Math.PI*.8/10,r=26+rr()*14;
       const m=new THREE.Mesh(new THREE.SphereGeometry(2+rr()*2.5,8,6),toon('#1c2c30'));
       m.scale.y=.5+rr()*.5;m.position.set(Math.cos(a)*r,.2,-Math.abs(Math.sin(a))*r-6);
       S.add(m);
     }}
    this.scene.updateMatrixWorld(true);
    planarUVWorld(this.floorMesh,.14);planarUVWorld(this.farMesh,.14);
  }
  async applyHybrid(base='./assets3d/tex/'){
    const L=new THREE.TextureLoader();
    const load=(n,data=false)=>new Promise(res=>L.load(base+n+'.png',t=>{
      t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.anisotropy=4;res(t);
    },undefined,()=>res(null)));
    const T={};
    await Promise.all([['deepsea_sand'],['deepsea_sand_normal',1],['deepsea_stone'],['deepsea_stone_normal',1],
        ['water_surface']]
      .map(async ([n,d])=>T[n]=await load(n,!!d)));
    this.hybridApplied=[];
    const tile=t=>{t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;return t;};
    const skin=(meshes,tex,norm,ns,color,defR=[1,1])=>{
      if(!tex)return false;
      for(const m of meshes){
        const [rx,ry]=m.userData.texR??defR;
        const mp=tex.clone();mp.wrapS=mp.wrapT=THREE.MirroredRepeatWrapping;
        mp.repeat.set(rx,ry);mp.needsUpdate=true;
        m.material.map=mp;m.material.color.set(color);
        if(norm){const nm=norm.clone();nm.wrapS=nm.wrapT=THREE.MirroredRepeatWrapping;
          nm.repeat.set(rx,ry);nm.needsUpdate=true;
          m.material.normalMap=nm;m.material.normalScale=new THREE.Vector2(ns,ns);}
        m.material.needsUpdate=true;
      }
      return true;
    };
    if(skin(this.groundMeshes,T.deepsea_sand,T.deepsea_sand_normal,1.6,'#a89a88'))this.hybridApplied.push('sand');
    if(skin(this.stoneMeshes,T.deepsea_stone,T.deepsea_stone_normal,1.8,'#8894a0'))this.hybridApplied.push('stone');
    if(T.water_surface){ // 海面光幕换文生图水纹（法线不吃——Basic 材质）
      this.surface.material.map=tile(T.water_surface);
      this.surface.material.needsUpdate=true;this.hybridApplied.push('surface');
    }
    return this.hybridApplied;
  }
  update(t){
    this.ruinGlow.intensity=9*(1+.15*Math.sin(t*1.3)+.08*Math.sin(t*3.7));
    // 海面光幕波光缓流（纯 t）
    this.surface.material.map.offset.x=t*.004;this.surface.material.map.offset.y=t*.003;
    for(const c of this.rays){ // god ray 缓摆
      c.rotation.z=c.userData.ax*Math.sin(t*.4+c.userData.ph);
      c.material.opacity=.055+.025*Math.sin(t*.6+c.userData.ph);
    }
    for(const b of this.bubbles){ // 气泡上升循环（纯 t 相位回绕）
      const u=b.userData,v=((t*u.sp*.09+u.ph)%1);
      b.position.set(u.x+.3*Math.sin(t*1.3+u.ph*7),v*13.4,u.z);
      b.material.opacity=.6*(1-v*.5);b.scale.setScalar(u.r*(0.7+v*.8));
    }
  }
}
