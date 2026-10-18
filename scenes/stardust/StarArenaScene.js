// 《星屑战壳》系列场景资产（R10 新增）— 星屑角斗场（StarArenaScene）：露天环形沙场——
// 细沙地面（爪痕拖痕纹理）+ 风化岩壁座席圈层（三层台阶式岩块环）+ 残破旗幡/火炬环 +
// 夜空开放顶（ContinuousBackdrop）。交锋区半径 ≥5m 净空（接触帧链主场：裂缝/碎石常驻）。
// 地面 y=0，世界布局与圣殿一致（跳切坐标连续）。applyHybrid(base) 纹理基路径参数
// （默认 './assets3d/tex/'，纹理归调用剧集，缺失静默回退程序化）。update(t) 纯 (t,state)。
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
function glowTexture(inner='#fff6dc',outer='rgba(255,150,60,0)'){
  return canvasTex(64,64,(c)=>{
    const g=c.createRadialGradient(32,32,2,32,32,32);
    g.addColorStop(0,inner);g.addColorStop(.4,'rgba(255,190,110,.85)');g.addColorStop(1,outer);
    c.fillStyle=g;c.fillRect(0,0,64,64);
  });
}
// 沙场拖痕覆盖层（透明底加色：旧战爪痕/拖痕弧，程序化保底一直有）
function sandScratchTexture(){
  return canvasTex(1024,1024,(c,w,h)=>{
    const rr=lcg(37),cx=w/2,cy=h/2;
    c.strokeStyle='rgba(60,48,36,.5)';c.lineWidth=3;c.lineCap='round';
    for(let i=0;i<26;i++){ // 拖痕弧
      const a=rr()*TAU,r=60+rr()*380,sw=.2+rr()*.9;
      c.beginPath();c.arc(cx,cy,r,a,a+sw);c.stroke();
    }
    for(let i=0;i<12;i++){ // 爪痕组
      const x=cx+(rr()-.5)*w*.7,y=cy+(rr()-.5)*h*.7,a=rr()*TAU;
      for(let k=0;k<3;k++){
        c.beginPath();c.moveTo(x+k*9,y);c.lineTo(x+Math.cos(a)*26+k*9,y+Math.sin(a)*26);c.stroke();
      }
    }
    // 中央战纹暖晕
    const warm=c.createRadialGradient(cx,cy,10,cx,cy,320);
    warm.addColorStop(0,'rgba(255,180,100,.16)');warm.addColorStop(1,'rgba(255,180,100,0)');
    c.fillStyle=warm;c.fillRect(0,0,w,h);
  });
}

export class StarArenaScene extends SceneBase{
  build(){
    const S=this.scene;
    S.background=new THREE.Color('#0a0d1c');
    S.fog=new THREE.Fog('#10141f',30,100);
    // ── 光：夜空冷环境 + 火炬暖点环 + 月光冷 rim（带影）+ 正面暖补 ──
    S.add(new THREE.HemisphereLight(0x3a4468,0x1c140c,.9));
    const moon=new THREE.DirectionalLight(0x9fb4e8,1.1);
    moon.position.set(-8,13,6);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);
    Object.assign(moon.shadow.camera,{left:-16,right:16,top:12,bottom:-4,far:60});
    moon.shadow.bias=-.0004;S.add(moon);
    const fill=new THREE.DirectionalLight(0xffc890,.65);fill.position.set(2,4,12);S.add(fill);

    const rock='#4a4a52',rockD='#3a3a42';
    const texR=(m,r)=>{m.userData.texR=r;return m;};
    this.rockMeshes=[];this.groundMeshes=[];this.fabricMeshes=[];

    // ── 沙场（交锋区 r12 细沙）+ 拖痕覆盖层 + 外圈碎石岩盘 ──
    const sand=this.floorMesh=new THREE.Mesh(new THREE.CircleGeometry(13,64),toon('#8a7a5e'));
    sand.rotation.x=-Math.PI/2;sand.receiveShadow=true;S.add(sand);this.groundMeshes.push(texR(sand,[1,1]));
    const scratch=new THREE.Mesh(new THREE.CircleGeometry(13,64),
      new THREE.MeshBasicMaterial({map:sandScratchTexture(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    scratch.rotation.x=-Math.PI/2;scratch.position.y=.006;S.add(scratch);
    const outer=this.farMesh=new THREE.Mesh(new THREE.CircleGeometry(60,48),toon('#2e2c34'));
    outer.rotation.x=-Math.PI/2;outer.position.y=-.02;S.add(outer);this.groundMeshes.push(texR(outer,[1,1]));

    // ── 座席圈层（三层台阶式岩块环，缺口朝 +z 留机位走廊）──
    {const rr=lcg(53);
     for(let tier=0;tier<3;tier++){
       const r=15+tier*3.4,y=.65+tier*1.25;
       const n=18+tier*4;
       for(let i=0;i<n;i++){
         const a=Math.PI/2+Math.PI/10+i*(TAU*0.8)/n; // 正面 ±36° 缺口
         const b=new THREE.Mesh(new THREE.BoxGeometry(2.6+rr()*.8,1.3,2.2),toon(tier%2?rockD:rock));
         b.position.set(Math.cos(a)*r,y,Math.sin(a)*r);
         b.rotation.y=-a+(rr()-.5)*.12;b.castShadow=b.receiveShadow=true;S.add(b);
         this.rockMeshes.push(texR(b,[2,1]));
       }
     }}
    // ── 旗幡杆（残破旗幡，顶点摆动纯 t）+ 火炬环 ──
    this.drapes=[];this.flames=[];
    {const tex=glowTexture();const rr=lcg(71);
     for(let i=0;i<10;i++){
       const a=Math.PI/2+Math.PI/12+i*TAU/10;
       const x=Math.cos(a)*13.2,z=Math.sin(a)*13.2;
       const g=new THREE.Group();g.position.set(x,0,z);S.add(g);
       if(i%2===0){ // 火炬：石座+火舌
         const stand=new THREE.Mesh(new THREE.CylinderGeometry(.09,.16,1.1,10),toon(rockD));
         stand.position.y=.55;stand.castShadow=true;g.add(stand);this.rockMeshes.push(texR(stand,[1,1]));
         const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.26,.14,.2,12),toon(rock));
         bowl.position.y=1.18;g.add(bowl);this.rockMeshes.push(texR(bowl,[1,1]));
         const f=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
         f.position.y=1.5;f.userData={ph:i*1.1,f:6+(i%3)};g.add(f);this.flames.push(f);
       }else{ // 旗幡：杆+残幡（顶边钉住下摆摆动）
         const pole=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,3.6,8),toon('#2a2630'));
         pole.position.y=1.8;pole.castShadow=true;g.add(pole);this.rockMeshes.push(texR(pole,[1,1]));
         const geo=new THREE.PlaneGeometry(.9,1.3,6,8);
         const m=new THREE.Mesh(geo,new THREE.MeshToonMaterial({color:'#5a2430',side:THREE.DoubleSide}));
         m.position.set(.48,2.85,0);m.rotation.y=-a+Math.PI/2;
         m.userData={base:geo.attributes.position.array.slice(),h:1.3,ph:i*.8,amp:.10};
         g.add(m);this.drapes.push(m);this.fabricMeshes.push(m);
       }
     }}
    // ── 沙场散件（断刃插沙/兽骨，走廊外）──
    {const rr=lcg(89);
     for(let i=0;i<9;i++){
       const a=Math.PI/2+.5+i*.62,r=7.5+rr()*3.5;
       if(rr()<.5){ // 断刃
         const blade=new THREE.Mesh(new THREE.BoxGeometry(.09,.9,.26),toon('#5a5e6a'));
         blade.position.set(Math.cos(a)*r,.4,Math.sin(a)*r);
         blade.rotation.set((rr()-.5)*.5,rr()*TAU,(rr()-.5)*.5);blade.castShadow=true;S.add(blade);
         this.rockMeshes.push(texR(blade,[1,1]));
       }else{ // 兽骨弧
         const rib=new THREE.Mesh(new THREE.TorusGeometry(.5,.07,6,12,Math.PI*.8),toon('#8a8274'));
         rib.position.set(Math.cos(a)*r,.1,Math.sin(a)*r);
         rib.rotation.set(-.4,rr()*TAU,0);rib.castShadow=true;S.add(rib);
         this.rockMeshes.push(texR(rib,[1,1]));
       }
     }}
    this.scene.updateMatrixWorld(true);
    planarUVWorld(this.floorMesh,.16);planarUVWorld(this.farMesh,.16);
  }
  async applyHybrid(base='./assets3d/tex/'){
    const L=new THREE.TextureLoader();
    const load=(n,data=false)=>new Promise(res=>L.load(base+n+'.png',t=>{
      t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.anisotropy=4;res(t);
    },undefined,()=>res(null)));
    const T={};
    await Promise.all([['arena_sand'],['arena_sand_normal',1],['arena_rock'],['arena_rock_normal',1],
        ['backdrop_arena']]
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
    if(skin(this.groundMeshes,T.arena_sand,T.arena_sand_normal,2.2,'#a89a80'))this.hybridApplied.push('sand');
    if(skin(this.rockMeshes,T.arena_rock,T.arena_rock_normal,1.8,'#8a8a94'))this.hybridApplied.push('rock');
    if(T.backdrop_arena){
      const bc=document.createElement('canvas');bc.width=2048;bc.height=768;
      const bg=bc.getContext('2d');bg.filter='brightness(1.45) saturate(1.05)';
      bg.drawImage(T.backdrop_arena.image,0,0);
      const bt=new THREE.CanvasTexture(bc);bt.colorSpace=THREE.SRGBColorSpace;bt.anisotropy=4;
      bt.wrapS=THREE.MirroredRepeatWrapping;
      const {continuousBackdrop}=await import('dula-assets/lib/craft3d/continuous-backdrop.js');
      this.backdrop=continuousBackdrop(bt,{center:[0,4,-6],cylinderRadius:60,
        cylinderHeight:30,radius:150,repeat:2,offset:.5,zenith:'#0d1226'});
      this.scene.add(this.backdrop);
      const sample=(()=>{const c=document.createElement('canvas');c.width=64;c.height=48;
        const g=c.getContext('2d',{willReadFrequently:true});
        g.drawImage(T.backdrop_arena.image,0,0,2048,768,0,0,64,48);
        const d=g.getImageData(0,0,64,48).data;
        return row=>{let r=0,gg=0,b=0;for(let x=0;x<64;x++){const i=(row*64+x)*4;r+=d[i];gg+=d[i+1];b+=d[i+2];}
          return `rgb(${r/64|0},${gg/64|0},${b/64|0})`;};})();
      const top=sample(2),mid=sample(22),low=sample(34);
      this.scene.background=canvasTex(2,256,(c,w,h)=>{
        const g=c.createLinearGradient(0,0,0,h);
        g.addColorStop(0,top);g.addColorStop(.45,mid);g.addColorStop(.75,low);g.addColorStop(1,'#0a0d1c');
        c.fillStyle=g;c.fillRect(0,0,w,h);
      });
      this.hybridApplied.push('backdrop');
    }
    return this.hybridApplied;
  }
  update(t){
    for(const f of this.flames){
      const u=f.userData;
      f.scale.set(.34+.09*Math.sin(t*u.f+u.ph),.55+.2*Math.max(0,Math.sin(t*u.f*1.3+u.ph)),1);
      f.material.opacity=.6+.35*Math.max(0,Math.sin(t*u.f*.9+u.ph*2));
    }
    for(const d of this.drapes){ // 残幡顶点摆动（顶边钉住；纯 t）
      const u=d.userData,p=d.geometry.attributes.position;
      for(let i=0;i<p.count;i++){
        const bx=u.base[i*3],by=u.base[i*3+1];
        const w=(u.h/2-by)/u.h;
        p.setZ(i,w*(u.amp*Math.sin(t*1.5+u.ph+by*2.2)+u.amp*.4*Math.sin(t*2.9+u.ph*1.7+bx*3)));
      }
      p.needsUpdate=true;
    }
  }
}
