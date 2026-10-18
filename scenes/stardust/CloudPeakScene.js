// 《星屑战壳》系列场景资产（R9 新增）— 云巅圣峰（CloudPeakScene）：云海之上的山巅秘境——
// 碎岩山门（双柱残楣）、峰顶平台（岩石纹理大盘+缘部崩岩）、三层云海大盘（纹理 drift
// 纯 t）、远峰锥影带（雪冠）、星屑瀑布（缘部豁口泻下光点流，LCG 确定性循环）。
// 表演走廊 |x|<5, z>0 净空；地面 y=0，世界布局与圣殿一致（跳切坐标连续）。
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
function glowTexture(inner='rgba(235,245,255,1)',outer='rgba(160,200,255,0)'){
  return canvasTex(64,64,(c)=>{
    const g=c.createRadialGradient(32,32,2,32,32,32);
    g.addColorStop(0,inner);g.addColorStop(.4,'rgba(190,220,255,.85)');g.addColorStop(1,outer);
    c.fillStyle=g;c.fillRect(0,0,64,64);
  });
}
// 云海纹理（程序化保底：柔团絮状圆斑；hybrid 有图则换皮）
function cloudTexture(){
  return canvasTex(512,512,(c,w,h)=>{
    c.fillStyle='#dfe8f4';c.fillRect(0,0,w,h);
    const rr=lcg(23);
    for(let i=0;i<160;i++){
      const x=rr()*w,y=rr()*h,r=18+rr()*46,a=.10+rr()*.16;
      const g=c.createRadialGradient(x,y,2,x,y,r);
      g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
    }
    for(let i=0;i<70;i++){ // 云间阴影窝
      const x=rr()*w,y=rr()*h,r=10+rr()*26,a=.06+rr()*.08;
      const g=c.createRadialGradient(x,y,2,x,y,r);
      g.addColorStop(0,`rgba(120,140,175,${a})`);g.addColorStop(1,'rgba(120,140,175,0)');
      c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
    }
  });
}

export class CloudPeakScene extends SceneBase{
  build(){
    const S=this.scene;
    S.background=new THREE.Color('#8fa8cc');
    S.fog=new THREE.Fog('#b8c8e0',34,120);
    // ── 光：高空亮环境 + 暖阳主光（带影）+ 冷补 ──
    S.add(new THREE.HemisphereLight(0xbcd4f0,0x6a6a72,1.3));
    const sun=new THREE.DirectionalLight(0xfff0d0,2.0);
    sun.position.set(14,18,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
    Object.assign(sun.shadow.camera,{left:-16,right:16,top:12,bottom:-4,far:70});
    sun.shadow.bias=-.0004;S.add(sun);
    const fill=new THREE.DirectionalLight(0x9ab4d8,.5);fill.position.set(-6,5,12);S.add(fill);

    const rock='#5a5f6c',rockD='#444a56';
    const texR=(m,r)=>{m.userData.texR=r;return m;};
    this.rockMeshes=[];this.groundMeshes=[];

    // ── 峰顶平台（岩石大盘 y=0）+ 下部岩裙 ──
    const top=this.floorMesh=new THREE.Mesh(new THREE.CircleGeometry(16,48),toon(rock));
    top.rotation.x=-Math.PI/2;top.receiveShadow=true;S.add(top);this.groundMeshes.push(texR(top,[1,1]));
    const skirt=new THREE.Mesh(new THREE.CylinderGeometry(16,24,7,40,1,true),toon(rockD));
    skirt.position.y=-3.5;S.add(skirt);this.rockMeshes.push(texR(skirt,[6,2]));
    // 缘部崩岩（锯齿轮廓）
    {const rr=lcg(13);
     for(let i=0;i<14;i++){
       const a=i/14*TAU+rr()*.2,r=13.2+rr()*2.6;
       const b=new THREE.Mesh(new THREE.DodecahedronGeometry(.6+rr()*.8,0),toon(rr()<.5?rock:rockD));
       b.position.set(Math.cos(a)*r,.1+rr()*.3,Math.sin(a)*r);
       b.scale.y=.5+rr()*.4;b.rotation.set(rr()*3,rr()*3,rr()*3);
       b.castShadow=b.receiveShadow=true;S.add(b);this.rockMeshes.push(texR(b,[1,1]));
     }}
    // ── 山门（双柱残楣+两级台阶，z=-6.5 走廊尽头）──
    const gate=new THREE.Group();gate.position.set(0,0,-6.5);S.add(gate);
    for(const sx of [-1,1]){
      const p=new THREE.Mesh(new THREE.CylinderGeometry(.5,.58,4.2,14),toon(rock));
      p.position.set(sx*1.7,2.1,0);p.castShadow=p.receiveShadow=true;gate.add(p);
      this.rockMeshes.push(texR(p,[2,2]));
      const cap=new THREE.Mesh(new THREE.BoxGeometry(1.3,.4,1.3),toon(rockD));
      cap.position.set(sx*1.7,4.35,0);gate.add(cap);this.rockMeshes.push(texR(cap,[1,1]));
    }
    const lintel=new THREE.Mesh(new THREE.BoxGeometry(2.6,.5,.9),toon(rock)); // 残楣（只剩左段）
    lintel.position.set(-1.1,4.62,0);lintel.rotation.z=.04;lintel.castShadow=true;gate.add(lintel);
    this.rockMeshes.push(texR(lintel,[2,1]));
    for(let i=0;i<2;i++){
      const st=new THREE.Mesh(new THREE.BoxGeometry(4.6-i*.6,.16,1.0),toon(rockD));
      st.position.set(0,.08+i*.14,1.2+i*.55);st.receiveShadow=true;gate.add(st);
      this.rockMeshes.push(texR(st,[2,1]));
    }
    // 散碑刻石（走廊外点缀）
    {const rr=lcg(29);
     for(let i=0;i<8;i++){
       const a=rr()*TAU,r=7+rr()*6;
       const s=new THREE.Mesh(new THREE.BoxGeometry(.5+rr()*.5,.9+rr()*.8,.3),toon(rock));
       s.position.set(Math.cos(a)*r,.45,Math.sin(a)*r*.8-2);
       s.rotation.set((rr()-.5)*.16,rr()*TAU,(rr()-.5)*.16);
       s.castShadow=s.receiveShadow=true;S.add(s);this.rockMeshes.push(texR(s,[1,1]));
     }}
    // ── 三层云海（大盘半透，纹理 drift 纯 t）──
    this.clouds=[];
    {const ct=cloudTexture();
     for(const [r,y,op,rx] of [[34,-3.2,.92,2],[55,-4.8,.86,3],[90,-6.6,.8,4]]){
       const mp=ct.clone();mp.wrapS=mp.wrapT=THREE.MirroredRepeatWrapping;mp.repeat.set(rx,rx);mp.needsUpdate=true;
       const c=new THREE.Mesh(new THREE.CircleGeometry(r,40),
         new THREE.MeshToonMaterial({color:'#eef2fa',map:mp,transparent:true,opacity:op,depthWrite:false}));
       c.rotation.x=-Math.PI/2;c.position.y=y;c.renderOrder=-1;S.add(c);
       this.clouds.push({mesh:c,speed:.0016+Math.abs(y)*.0004,dir:y<-4?-1:1});
     }}
    // ── 远峰锥影带（雪冠，r38-70，云海之上）──
    {const rr=lcg(47);
     for(let i=0;i<9;i++){
       const a=i/9*TAU+.3+rr()*.2,r=38+rr()*32,h=8+rr()*9,pr=3+rr()*4;
       const pk=new THREE.Mesh(new THREE.ConeGeometry(pr,h,7),toon('#6a7a98'));
       pk.position.set(Math.cos(a)*r,-4+h/2,Math.sin(a)*r);S.add(pk);
       const snow=new THREE.Mesh(new THREE.ConeGeometry(pr*.42,h*.3,7),toon('#e8eef6'));
       snow.position.set(pk.position.x,-4+h*.87,pk.position.z);S.add(snow);
     }}
    // ── 星屑瀑布（缘部豁口 (7.5,-4.5) 泻下光点流）──
    this.fall=[];
    {const rr=lcg(61),tex=glowTexture();
     const notch=new THREE.Group();notch.position.set(7.5,0,-4.5);S.add(notch);
     // 豁口岩沿两块
     forconst_guard: {
       const l1=new THREE.Mesh(new THREE.DodecahedronGeometry(.7,0),toon(rockD));
       l1.position.set(-.7,.2,0);l1.castShadow=true;notch.add(l1);this.rockMeshes.push(texR(l1,[1,1]));
       const l2=l1.clone();l2.position.set(.7,.15,.2);notch.add(l2);this.rockMeshes.push(texR(l2,[1,1]));
     }
     for(let i=0;i<26;i++){
       const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
       s.userData={ox:(rr()-.5)*.5,oz:(rr()-.5)*.5,ph:rr(),sp:.5+rr()*.5};
       s.scale.setScalar(.06+rr()*.09);notch.add(s);this.fall.push(s);
     }
     const pool=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
     pool.scale.setScalar(1.4);pool.position.set(0,.3,0);notch.add(pool);this.fallPool=pool;
    }
    this.scene.updateMatrixWorld(true);
    planarUVWorld(this.floorMesh,.15);
  }
  async applyHybrid(base='./assets3d/tex/'){
    const L=new THREE.TextureLoader();
    const load=(n,data=false)=>new Promise(res=>L.load(base+n+'.png',t=>{
      t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.anisotropy=4;res(t);
    },undefined,()=>res(null)));
    const T={};
    await Promise.all([['peak_rock'],['peak_rock_normal',1],['backdrop_cloudpeak']]
      .map(async ([n,d])=>T[n]=await load(n,!!d)));
    this.hybridApplied=[];
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
    if(skin(this.groundMeshes,T.peak_rock,T.peak_rock_normal,2.0,'#9aa0ac'))this.hybridApplied.push('ground');
    if(skin(this.rockMeshes,T.peak_rock,T.peak_rock_normal,1.8,'#8a8f9c',[2,2]))this.hybridApplied.push('rock');
    if(T.backdrop_cloudpeak){
      const bc=document.createElement('canvas');bc.width=2048;bc.height=768;
      const bg=bc.getContext('2d');bg.filter='brightness(1.15)';
      bg.drawImage(T.backdrop_cloudpeak.image,0,0);
      const bt=new THREE.CanvasTexture(bc);bt.colorSpace=THREE.SRGBColorSpace;bt.anisotropy=4;
      bt.wrapS=THREE.MirroredRepeatWrapping;
      const {continuousBackdrop}=await import('dula-assets/lib/craft3d/continuous-backdrop.js');
      this.backdrop=continuousBackdrop(bt,{center:[0,4,-6],cylinderRadius:60,
        cylinderHeight:30,radius:150,repeat:2,offset:.5,zenith:'#5a7ab0'});
      this.scene.add(this.backdrop);
      const sample=(()=>{const c=document.createElement('canvas');c.width=64;c.height=48;
        const g=c.getContext('2d',{willReadFrequently:true});
        g.drawImage(T.backdrop_cloudpeak.image,0,0,2048,768,0,0,64,48);
        const d=g.getImageData(0,0,64,48).data;
        return row=>{let r=0,gg=0,b=0;for(let x=0;x<64;x++){const i=(row*64+x)*4;r+=d[i];gg+=d[i+1];b+=d[i+2];}
          return `rgb(${r/64|0},${gg/64|0},${b/64|0})`;};})();
      const top=sample(2),mid=sample(22),low=sample(34);
      this.scene.background=canvasTex(2,256,(c,w,h)=>{
        const g=c.createLinearGradient(0,0,0,h);
        g.addColorStop(0,top);g.addColorStop(.45,mid);g.addColorStop(.75,low);g.addColorStop(1,'#8fa8cc');
        c.fillStyle=g;c.fillRect(0,0,w,h);
      });
      this.hybridApplied.push('backdrop');
    }
    return this.hybridApplied;
  }
  update(t){
    for(const c of this.clouds){ // 云海漂移（纹理 offset，纯 t）
      c.mesh.material.map.offset.x=t*c.speed*c.dir;
      c.mesh.material.map.offset.y=t*c.speed*.6*c.dir;
    }
    for(const s of this.fall){ // 星屑瀑布循环（纯 t：相位+速度定位置）
      const u=s.userData,v=((t*u.sp+u.ph)%1);
      s.position.set(u.ox*(1+v*2),.2-v*7.2,u.oz);
      s.material.opacity=.85*(1-v*v);
    }
    if(this.fallPool)this.fallPool.material.opacity=.4+.2*Math.sin(t*2.2);
  }
}
