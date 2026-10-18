// 《星屑战壳》系列场景资产（R9 新增）— 幽荧之河（GloomriverScene）：冥界河流——
// 暗河横贯（z -2..-6，半透明水面+流光 emissive 脉动+萤光藻点漂移）、河面漂浮魂光
// （加色 sprite，LCG 确定性）、彼岸石柱阵（幽绿符纹环）、渡口碎石滩、雾板分层、
// 幽暗天穹背景板。表演走廊 z>0 净空（角色站近岸），世界布局与圣殿一致。
// 程序化几何+applyHybrid(base) 文生图皮肤注入（默认 './assets3d/tex/'，纹理归调用剧集，
// 缺失静默回退程序化）。update(t) 纯 (t,state)。
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
function glowTexture(inner='rgba(210,255,240,1)',outer='rgba(80,220,190,0)'){
  return canvasTex(64,64,(c)=>{
    const g=c.createRadialGradient(32,32,2,32,32,32);
    g.addColorStop(0,inner);g.addColorStop(.4,'rgba(140,240,210,.8)');g.addColorStop(1,outer);
    c.fillStyle=g;c.fillRect(0,0,64,64);
  });
}
// 水面流光：横向亮丝纹（程序化 canvas，保底不依赖文生图；纯 t 偏移流动）
function streakTexture(){
  return canvasTex(512,128,(c,w,h)=>{
    c.fillStyle='rgba(0,0,0,0)';c.fillRect(0,0,w,h);
    const rr=lcg(17);
    for(let i=0;i<46;i++){
      const y=rr()*h,x=rr()*w,len=30+rr()*120,a=.10+rr()*.22;
      c.strokeStyle=`rgba(120,230,200,${a})`;c.lineWidth=1+rr()*2.2;c.lineCap='round';
      c.beginPath();c.moveTo(x,y);c.lineTo(x+len,y+(rr()-.5)*6);c.stroke();
    }
  });
}
// 雾板：竖直软渐变
function mistTexture(){
  return canvasTex(128,64,(c,w,h)=>{
    const g=c.createLinearGradient(0,h,0,0);
    g.addColorStop(0,'rgba(150,200,190,.55)');g.addColorStop(.6,'rgba(150,200,190,.18)');g.addColorStop(1,'rgba(150,200,190,0)');
    c.fillStyle=g;c.fillRect(0,0,w,h);
  });
}

export class GloomriverScene extends SceneBase{
  build(){
    const S=this.scene;
    S.background=new THREE.Color('#050a0c');
    S.fog=new THREE.Fog('#0a1418',18,68);
    // ── 光：极弱冷环境 + 河面幽绿点光 + 正面冷补（夜景首帧目检调亮：R2.5 教训）──
    S.add(new THREE.HemisphereLight(0x2a4a4c,0x0a0e12,1.15));
    this.riverGlow=new THREE.PointLight(0x4fd8c8,22,26,1.8);
    this.riverGlow.position.set(0,1.6,-4);S.add(this.riverGlow);
    const fill=new THREE.DirectionalLight(0x8a9ab8,.95);fill.position.set(0,5,12);S.add(fill); // 正面冷补保脸（强档）
    const rim=new THREE.DirectionalLight(0x6a9a8a,.85);rim.position.set(-7,9,-14);
    rim.castShadow=true;rim.shadow.mapSize.set(2048,2048);
    Object.assign(rim.shadow.camera,{left:-16,right:16,top:12,bottom:-4,far:60});
    rim.shadow.bias=-.0004;S.add(rim);

    const stone='#2c3138',stoneD='#20242a';
    const texR=(m,r)=>{m.userData.texR=r;return m;};
    this.stoneMeshes=[];this.groundMeshes=[];

    // ── 近岸滩地（表演区 y=0）+ 远景盘 ──
    const shore=this.floorMesh=new THREE.Mesh(new THREE.CircleGeometry(40,64),toon('#232a30'));
    shore.rotation.x=-Math.PI/2;shore.receiveShadow=true;S.add(shore);this.groundMeshes.push(texR(shore,[1,1]));
    const far=this.farMesh=new THREE.Mesh(new THREE.CircleGeometry(90,40),toon('#141a1e'));
    far.rotation.x=-Math.PI/2;far.position.y=-.03;S.add(far);this.groundMeshes.push(texR(far,[1,1]));

    // ── 暗河（z -2..-6 横贯）：底层暗水面 + 流光层（加色薄板，offset 纯 t 流动）──
    const water=this.water=new THREE.Mesh(new THREE.PlaneGeometry(84,4.2),
      new THREE.MeshToonMaterial({color:'#0c1a22',transparent:true,opacity:.9}));
    water.rotation.x=-Math.PI/2;water.position.set(0,.02,-4);S.add(water);
    this.groundMeshes.push(texR(water,[3,1]));
    const streak=streakTexture();streak.wrapS=streak.wrapT=THREE.MirroredRepeatWrapping;streak.repeat.set(3,1);
    this.streakLayer=new THREE.Mesh(new THREE.PlaneGeometry(84,4.2),
      new THREE.MeshBasicMaterial({map:streak,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    this.streakLayer.rotation.x=-Math.PI/2;this.streakLayer.position.set(0,.045,-4);S.add(this.streakLayer);
    // 萤光藻点（水面漂浮，顺流漂移）
    this.algae=[];
    {const rr=lcg(41),tex=glowTexture();
     for(let i=0;i<16;i++){
       const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
       s.userData={x:-40+rr()*80,z:-5.6+rr()*3.2,ph:rr()*TAU,sp:.3+rr()*.5};
       s.scale.setScalar(.05+rr()*.08);S.add(s);this.algae.push(s);
     }}
    // ── 魂光（河面上空漂浮，大光球缓漂）──
    this.wisps=[];
    {const rr=lcg(59),tex=glowTexture('rgba(220,255,245,1)','rgba(90,230,200,0)');
     for(let i=0;i<14;i++){
       const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
       s.userData={x:-30+rr()*60,y:.6+rr()*2.6,z:-6.5+rr()*4.5,ph:rr()*TAU,f:.2+rr()*.4};
       s.scale.setScalar(.25+rr()*.4);S.add(s);this.wisps.push(s);
     }}
    // ── 彼岸石柱阵（z -9..-11，幽绿符纹环）──
    {const rr=lcg(67);
     for(let i=0;i<7;i++){
       const x=-18+i*6+(rr()-.5)*2,h=4.5+rr()*4.5,r=.5+rr()*.35;
       const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.15,h,10),toon(stone));
       p.position.set(x,h/2,-9.5-rr()*1.5);p.castShadow=p.receiveShadow=true;S.add(p);
       this.stoneMeshes.push(texR(p,[2,2]));
       const band=new THREE.Mesh(new THREE.TorusGeometry(r+.06,.03,6,16),
         new THREE.MeshBasicMaterial({color:'#3fd8c8',transparent:true,opacity:.5}));
       band.rotation.x=Math.PI/2;band.position.set(x,h*.62,p.position.z);S.add(band);
     }}
    // 中央断桥拱（彼岸遗迹剪影）
    const archL=new THREE.Mesh(new THREE.BoxGeometry(.8,6,.8),toon(stoneD));
    archL.position.set(-2.2,3,-10.5);S.add(archL);this.stoneMeshes.push(texR(archL,[1,2]));
    const archR=archL.clone();archR.position.set(2.2,3,-10.5);S.add(archR);this.stoneMeshes.push(texR(archR,[1,2]));
    const archTop=new THREE.Mesh(new THREE.BoxGeometry(3.4,.7,.9),toon(stoneD));
    archTop.position.set(-.6,6.1,-10.5);archTop.rotation.z=.06;S.add(archTop);this.stoneMeshes.push(texR(archTop,[2,1]));
    // ── 渡口石阶（近岸右侧，走廊外）──
    for(let i=0;i<3;i++){
      const step=new THREE.Mesh(new THREE.BoxGeometry(1.6,.16,.7),toon(stone));
      step.position.set(6.2,.08+i*.14,1.0-i*.55);step.castShadow=step.receiveShadow=true;S.add(step);
      this.stoneMeshes.push(texR(step,[1,1]));
    }
    // 河面踏步石（半浸）
    {const rr=lcg(83);
     for(let i=0;i<5;i++){
       const st=new THREE.Mesh(new THREE.SphereGeometry(.5+rr()*.3,10,6),toon(stoneD));
       st.scale.y=.35;st.position.set(-8+i*4.5+(rr()-.5),.05,-3.2-rr()*1.6);
       st.castShadow=st.receiveShadow=true;S.add(st);this.stoneMeshes.push(texR(st,[1,1]));
     }}
    // ── 冥草丛（近岸两侧，|x|>6 走廊外）──
    {const rr=lcg(97);
     for(let i=0;i<20;i++){
       const sx=rr()<.5?-1:1,x=sx*(6+rr()*16),z=-1+rr()*6;
       const tuft=new THREE.Mesh(new THREE.ConeGeometry(.10+rr()*.08,.55+rr()*.4,5),toon('#1c2a2e'));
       tuft.position.set(x,.25,z);tuft.rotation.set((rr()-.5)*.3,rr()*TAU,(rr()-.5)*.3);
       tuft.castShadow=true;S.add(tuft);
     }}
    // ── 雾板（分层软过渡，河面上方）──
    this.mists=[];
    {const tex=mistTexture();
     for(const [z,op,w] of [[-1.2,.10,40],[-4.5,.13,60],[-8,.16,80]]){
       const m=new THREE.Mesh(new THREE.PlaneGeometry(w,3.2),
         new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));
       m.position.set(0,1.1,z);m.userData={z,ph:z};S.add(m);this.mists.push(m);
     }}
    this.scene.updateMatrixWorld(true);
    planarUVWorld(this.floorMesh,.12);planarUVWorld(this.farMesh,.12);
  }
  async applyHybrid(base='./assets3d/tex/'){
    const L=new THREE.TextureLoader();
    const load=(n,data=false)=>new Promise(res=>L.load(base+n+'.png',t=>{
      t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.anisotropy=4;res(t);
    },undefined,()=>res(null)));
    const T={};
    await Promise.all([['gloom_shore'],['gloom_shore_normal',1],['gloom_water'],['gloom_water_normal',1],
        ['backdrop_gloom']]
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
    if(skin(this.groundMeshes,T.gloom_shore,T.gloom_shore_normal,2.0,'#8a96a0'))this.hybridApplied.push('shore');
    if(skin(this.stoneMeshes,T.gloom_shore,T.gloom_shore_normal,1.8,'#7d8894',[2,2]))this.hybridApplied.push('stone');
    if(T.gloom_water){ // 水面底色+法线微澜（流光层是程序化 canvas，始终有）
      this.water.material.map=tile(T.gloom_water);this.water.material.color.set('#5a7a80');
      if(T.gloom_water_normal){this.water.material.normalMap=tile(T.gloom_water_normal);
        this.water.material.normalScale=new THREE.Vector2(1.4,1.4);}
      this.water.material.needsUpdate=true;this.hybridApplied.push('water');
    }
    if(T.backdrop_gloom){
      const bc=document.createElement('canvas');bc.width=2048;bc.height=768;
      const bg=bc.getContext('2d');bg.filter='brightness(1.35) saturate(1.05)';
      bg.drawImage(T.backdrop_gloom.image,0,0);
      const bt=new THREE.CanvasTexture(bc);bt.colorSpace=THREE.SRGBColorSpace;bt.anisotropy=4;
      bt.wrapS=THREE.MirroredRepeatWrapping;
      const {continuousBackdrop}=await import('dula-assets/lib/craft3d/continuous-backdrop.js');
      this.backdrop=continuousBackdrop(bt,{center:[0,4,-6],cylinderRadius:60,
        cylinderHeight:30,radius:150,repeat:2,offset:.5,zenith:'#0a1214'});
      this.scene.add(this.backdrop);
      const sample=(()=>{const c=document.createElement('canvas');c.width=64;c.height=48;
        const g=c.getContext('2d',{willReadFrequently:true});
        g.drawImage(T.backdrop_gloom.image,0,0,2048,768,0,0,64,48);
        const d=g.getImageData(0,0,64,48).data;
        return row=>{let r=0,gg=0,b=0;for(let x=0;x<64;x++){const i=(row*64+x)*4;r+=d[i];gg+=d[i+1];b+=d[i+2];}
          return `rgb(${r/64|0},${gg/64|0},${b/64|0})`;};})();
      const top=sample(2),mid=sample(22),low=sample(34);
      this.scene.background=canvasTex(2,256,(c,w,h)=>{
        const g=c.createLinearGradient(0,0,0,h);
        g.addColorStop(0,top);g.addColorStop(.45,mid);g.addColorStop(.75,low);g.addColorStop(1,'#050a0c');
        c.fillStyle=g;c.fillRect(0,0,w,h);
      });
      this.hybridApplied.push('backdrop');
    }
    return this.hybridApplied;
  }
  update(t){
    this.riverGlow.intensity=21*(1+.12*Math.sin(t*1.7)+.06*Math.sin(t*4.3));
    this.streakLayer.material.map.offset.x=t*.012; // 流光顺河（纯 t）
    this.streakLayer.material.map.needsUpdate=false;
    for(const a of this.algae){ // 藻点顺流缓漂（域内回绕）
      const u=a.userData;
      a.position.set(-40+((u.x+t*u.sp)+40)%80,.06+.02*Math.sin(t*2+u.ph),u.z);
      a.material.opacity=.5+.3*Math.sin(t*1.6+u.ph);
    }
    for(const w of this.wisps){ // 魂光缓漂呼吸
      const u=w.userData;
      w.position.set(u.x+1.2*Math.sin(t*u.f+u.ph),u.y+.3*Math.sin(t*u.f*1.4+u.ph*2),u.z+.6*Math.cos(t*u.f*.8+u.ph));
      w.material.opacity=.4+.3*Math.max(0,Math.sin(t*.9+u.ph));
    }
    for(const m of this.mists){ // 雾板缓移
      m.position.x=2.5*Math.sin(t*.07+m.userData.ph);
    }
  }
}
