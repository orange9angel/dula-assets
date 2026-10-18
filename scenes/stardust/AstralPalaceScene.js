// 《星屑战壳》系列场景资产（R9 新增）— 星辉内殿（AstralPalaceScene）：宏伟宫殿内景——
// 镶嵌大理石地面+中央徽记环带+红毯长道、双列巨柱、后墙长阶高台圣火盆、
// 桶形拱顶全封闭（有顶 interior：不用天空圆柱那套，拱顶本身就是带纹理几何，
// 侧墙高拱窗透光+光柱斜射）、悬挂火环吊灯。
// 战斗走廊 |x|<5, z>-1 净空（交锋链 ±4m）；地面 y=0，世界布局与圣殿一致（跳切坐标连续）。
// 程序化几何+applyHybrid(base) 文生图皮肤注入：base 是纹理目录的页面相对 URL
// （默认 './assets3d/tex/'=调用方页面同级，纹理文件归调用剧集，本资产不带纹理；
//  任一纹理缺失静默回退程序化外观）。update(t) 纯 (t,state)。
import * as THREE from 'three';
import {SceneBase} from 'dula-engine';

const TAU=Math.PI*2;
const toon=c=>new THREE.MeshToonMaterial({color:c});
const basic=c=>new THREE.MeshBasicMaterial({color:c});
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
// 高拱窗透光面板：竖直渐变（上暖金下浅蓝）+ 窗棂暗条
function windowGlowTexture(){
  return canvasTex(128,256,(c,w,h)=>{
    const g=c.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#ffe0a8');g.addColorStop(.45,'#c8d4f0');g.addColorStop(1,'#7a8ab8');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(20,18,30,.85)';
    c.fillRect(w/2-4,0,8,h);c.fillRect(0,h*.4,w,7);
  });
}
// 圣火/吊灯火焰 sprite
function glowTexture(inner='#fff6dc',outer='rgba(255,150,60,0)'){
  return canvasTex(64,64,(c)=>{
    const g=c.createRadialGradient(32,32,2,32,32,32);
    g.addColorStop(0,inner);g.addColorStop(.4,'rgba(255,190,110,.85)');g.addColorStop(1,outer);
    c.fillStyle=g;c.fillRect(0,0,64,64);
  });
}

export class AstralPalaceScene extends SceneBase{
  build(){
    const S=this.scene;
    S.background=new THREE.Color('#121020');
    S.fog=new THREE.Fog('#1c1826',30,95);
    // ── 光：暖圣火主光（高台点光）+ 侧窗斜射暖 key（带影）+ 冷正面补 ──
    S.add(new THREE.HemisphereLight(0x8a7a6a,0x241f2e,.95));
    const key=new THREE.DirectionalLight(0xffd8a8,1.25); // 侧窗暖阳主光（从右后高窗斜入）
    key.position.set(10,14,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);
    Object.assign(key.shadow.camera,{left:-16,right:16,top:12,bottom:-4,far:60});
    key.shadow.bias=-.0004;S.add(key);
    const fill=new THREE.DirectionalLight(0x8a9ec8,.6);fill.position.set(-4,6,14);S.add(fill); // 正面冷补（保脸）
    this.fireLight=new THREE.PointLight(0xffa050,34,30,1.7); // 高台圣火
    this.fireLight.position.set(0,2.8,-8.2);S.add(this.fireLight);

    const stone='#4a4550',stoneD='#38333f',gold='#c8a24e';
    const texR=(m,r)=>{m.userData.texR=r;return m;};
    this.stoneMeshes=[];this.floorMeshes=[];this.vaultMeshes=[];

    // ── 地面：镶嵌大理石大盘 + 中央徽记环带 + 红毯长道 ──
    const floor=this.floorMesh=new THREE.Mesh(new THREE.CircleGeometry(42,72),toon('#3d3944'));
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);this.floorMeshes.push(texR(floor,[1,1]));
    // 中央徽记（交锋区视觉中心，z≈1.5）：同心环+星芒棱
    const medal=new THREE.Group();medal.position.set(0,.012,1.5);S.add(medal);
    for(const [r,tube,mat] of [[2.6,.06,gold],[2.0,.035,'#8a6a3a'],[1.2,.045,gold]]){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,48),toon(mat));
      ring.rotation.x=Math.PI/2;medal.add(ring);
    }
    for(let i=0;i<8;i++){ // 八星芒
      const a=i/8*TAU;
      const ray=new THREE.Mesh(new THREE.BoxGeometry(.05,.008,1.3),toon(gold));
      ray.position.set(Math.sin(a)*1.6,0,Math.cos(a)*1.6);ray.rotation.y=a;medal.add(ray);
    }
    // 红毯长道（从大门到高台，战斗走廊两侧各留 3.8m 净空）
    const carpet=new THREE.Mesh(new THREE.PlaneGeometry(2.4,20),toon('#6a1c28'));
    carpet.rotation.x=-Math.PI/2;carpet.position.set(0,.016,-1);carpet.receiveShadow=true;S.add(carpet);
    for(const sx of [-1,1]){ // 金边
      const edge=new THREE.Mesh(new THREE.BoxGeometry(.07,.008,20),toon(gold));
      edge.position.set(sx*1.2,.018,-1);S.add(edge);
    }

    // ── 双列巨柱（x=±6.5，六根/侧）──
    for(const sx of [-1,1])for(let i=0;i<6;i++){
      const z=-8+i*3.4,g=new THREE.Group();g.position.set(sx*6.5,0,z);S.add(g);
      const plinth=new THREE.Mesh(new THREE.BoxGeometry(1.3,.6,1.3),toon(stoneD));
      plinth.position.y=.3;plinth.castShadow=plinth.receiveShadow=true;g.add(plinth);
      this.stoneMeshes.push(texR(plinth,[1,1]));
      const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.46,.52,7,18),toon(stone));
      shaft.position.y=4.1;shaft.castShadow=shaft.receiveShadow=true;g.add(shaft);
      this.stoneMeshes.push(texR(shaft,[4,2]));
      const capRing=new THREE.Mesh(new THREE.TorusGeometry(.55,.08,8,20),toon(stoneD));
      capRing.rotation.x=Math.PI/2;capRing.position.y=7.7;g.add(capRing);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(1.4,.55,1.4),toon(stone));
      cap.position.y=8.05;cap.castShadow=true;g.add(cap);
      this.stoneMeshes.push(texR(cap,[1,1]));
    }

    // ── 后墙高台（长阶三级+平台+圣火盆+双旗杆）──
    const dais=new THREE.Group();dais.position.set(0,0,-9);S.add(dais);
    for(const [w,h,d,z] of [[11,.18,1.2,.6],[9.4,.36,1.2,-.2],[8,.54,1.4,-1.0]]){
      const step=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),toon(stone));
      step.position.set(0,h/2,z);step.castShadow=step.receiveShadow=true;dais.add(step);
      this.stoneMeshes.push(texR(step,[3,1]));
    }
    const platform=new THREE.Mesh(new THREE.BoxGeometry(8,.2,3.2),toon(stoneD));
    platform.position.set(0,.64,-2.2);platform.receiveShadow=true;dais.add(platform);
    this.stoneMeshes.push(texR(platform,[3,1]));
    // 圣火盆（高台中央）
    const basin=new THREE.Group();basin.position.set(0,.74,-2.2);dais.add(basin);
    const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.55,.30,.42,20),toon('#3a3430'));
    bowl.castShadow=true;basin.add(bowl);
    this.stoneMeshes.push(texR(bowl,[2,1]));
    const brim=new THREE.Mesh(new THREE.TorusGeometry(.55,.045,8,24),toon(gold));
    brim.rotation.x=Math.PI/2;brim.position.y=.22;basin.add(brim);
    this.flames=[];
    {const tex=glowTexture();
     for(let i=0;i<7;i++){
       const a=i/7*TAU;
       const f=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
       f.position.set(Math.cos(a)*.3,.45,Math.sin(a)*.3);
       f.userData={ph:i*1.3,f:6+(i%3)};basin.add(f);this.flames.push(f);
     }}
    // 大门（后墙拱形门洞，外透光）
    const wall=new THREE.Mesh(new THREE.BoxGeometry(30,9,.6),toon(stoneD));
    wall.position.set(0,4.5,-11.2);wall.receiveShadow=true;S.add(wall);
    this.stoneMeshes.push(texR(wall,[6,2]));
    const doorGlow=new THREE.Mesh(new THREE.PlaneGeometry(3.2,5.2),
      new THREE.MeshBasicMaterial({map:windowGlowTexture(),transparent:true}));
    doorGlow.position.set(0,2.6,-10.85);S.add(doorGlow);
    // 门拱框
    const arch=new THREE.Mesh(new THREE.TorusGeometry(1.7,.16,8,20,Math.PI),toon(stone));
    arch.position.set(0,5.2,-10.85);S.add(arch);this.stoneMeshes.push(texR(arch,[2,1]));
    for(const sx of [-1,1]){
      const jamb=new THREE.Mesh(new THREE.BoxGeometry(.3,3.0,.3),toon(stone));
      jamb.position.set(sx*1.7,2.4,-10.85);S.add(jamb);this.stoneMeshes.push(texR(jamb,[1,2]));
    }

    // ── 侧墙 + 高拱窗（每侧 3 扇，透光面板+光柱）──
    this.shafts=[];
    for(const sx of [-1,1]){
      const wallS=new THREE.Mesh(new THREE.BoxGeometry(.6,9,24),toon(stoneD));
      wallS.position.set(sx*13,4.5,0);wallS.receiveShadow=true;S.add(wallS);
      this.stoneMeshes.push(texR(wallS,[6,2]));
      for(let i=0;i<3;i++){
        const z=-6+i*6;
        const win=new THREE.Mesh(new THREE.PlaneGeometry(2.0,5.4),
          new THREE.MeshBasicMaterial({map:windowGlowTexture(),transparent:true}));
        win.position.set(sx*12.6,5.4,z);win.rotation.y=-sx*Math.PI/2;S.add(win);
        const frame=new THREE.Mesh(new THREE.TorusGeometry(1.1,.12,8,16,Math.PI),toon(stone));
        frame.position.set(sx*12.55,8.0,z);frame.rotation.y=sx*Math.PI/2;S.add(frame);
        this.stoneMeshes.push(texR(frame,[2,1]));
        // 光柱（斜射入殿的体积光假件，加色薄板）
        const shaft=new THREE.Mesh(new THREE.PlaneGeometry(2.2,11),
          new THREE.MeshBasicMaterial({color:'#ffe8c0',transparent:true,opacity:.05,
            blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
        shaft.position.set(sx*8.5,4.2,z+1.5);
        shaft.rotation.set(0,-sx*Math.PI/2,sx*.42);
        shaft.userData={ph:i*.9+(sx+1)};S.add(shaft);this.shafts.push(shaft);
      }
    }

    // ── 桶形拱顶（全封闭：轴沿 z、半径 13.2、起拱线 y=7.6 接侧墙顶内侧）──
    // 验算：CylinderGeometry θ∈[π/2,3π/2] 半管经 rotateX(π/2) 后覆盖顶部（θ=π/2..3π/2 段
    // cosθ≤0 → 转到 y 正向）；θStart=π 的旧版盖错一侧（zenith 探针抓获半殿露天）
    const vault=new THREE.Mesh(
      new THREE.CylinderGeometry(13.2,13.2,24.4,48,1,true,Math.PI/2,Math.PI),toon('#332e3c'));
    vault.geometry.rotateX(Math.PI/2); // 轴 y→z
    vault.material.side=THREE.BackSide;
    vault.position.set(0,7.6,0);S.add(vault);
    this.vaultMeshes.push(texR(vault,[8,3]));
    // 端墙：下半整墙 + 上半圆封板（两端都封；+z 端开大门洞透光）
    for(const zs of [-12.2,12.2]){
      const lowWall=new THREE.Mesh(new THREE.BoxGeometry(28,9,.6),toon(stoneD));
      lowWall.position.set(0,4.5,zs);lowWall.receiveShadow=true;S.add(lowWall);
      this.stoneMeshes.push(texR(lowWall,[6,2]));
      const cap=new THREE.Mesh(new THREE.CircleGeometry(13.2,32,0,Math.PI),
        new THREE.MeshToonMaterial({color:stoneD,side:THREE.DoubleSide}));
      cap.position.set(0,7.6,zs);cap.rotation.y=zs<0?0:Math.PI;S.add(cap);
      this.stoneMeshes.push(texR(cap,[4,3]));
    }
    // +z 端大门洞透光面板（与后墙门同工艺；reverse 机位不再露背景板底色）
    const entryGlow=new THREE.Mesh(new THREE.PlaneGeometry(4.0,6.4),
      new THREE.MeshBasicMaterial({map:windowGlowTexture(),transparent:true}));
    entryGlow.position.set(0,3.2,11.85);entryGlow.rotation.y=Math.PI;S.add(entryGlow);
    const entryArch=new THREE.Mesh(new THREE.TorusGeometry(2.1,.18,8,20,Math.PI),toon(stone));
    entryArch.position.set(0,6.4,11.8);entryArch.rotation.y=Math.PI;S.add(entryArch);
    this.stoneMeshes.push(texR(entryArch,[2,1]));
    // 拱顶肋梁（XY 平面半环弧跨走廊上方，逐 z 排布；勿加 rotation.y——那会转成
    // 沿 z 纵向贴顶弧，zenith 机位下读成莫名其妙的两道贴面弧）
    for(let i=0;i<5;i++){
      const z=-9.6+i*4.8;
      const rib=new THREE.Mesh(new THREE.TorusGeometry(12.9,.22,6,32,Math.PI),toon(stone));
      rib.position.set(0,7.6,z);S.add(rib);
      this.stoneMeshes.push(texR(rib,[6,1]));
    }
    // 悬挂火环吊灯（两盏，链条+环+火舌）
    {const tex=glowTexture();
     for(const z of [-4,4]){
       const ch=new THREE.Group();ch.position.set(0,7.2,z);S.add(ch);
       const chain=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,4.6,6),toon('#2a2430'));
       chain.position.y=2.3;ch.add(chain);
       const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,.09,8,24),toon(gold));
       ring.rotation.x=Math.PI/2;ch.add(ring);
       for(let i=0;i<8;i++){
         const a=i/8*TAU;
         const f=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
         f.position.set(Math.cos(a)*1.1,.22,Math.sin(a)*1.1);
         f.userData={ph:i*.8+z,ch:1};ch.add(f);this.flames.push(f);
       }
     }}
    // 走廊两侧火盆（|x|>5 净空线外）
    {const tex=glowTexture();
     for(const sx of [-1,1])for(const z of [2.5,7.5]){
       const b=new THREE.Group();b.position.set(sx*5.6,0,z);S.add(b);
       const stand=new THREE.Mesh(new THREE.CylinderGeometry(.09,.16,.95,10),toon(stoneD));
       stand.position.y=.475;stand.castShadow=true;b.add(stand);
       this.stoneMeshes.push(texR(stand,[1,1]));
       const bowl2=new THREE.Mesh(new THREE.CylinderGeometry(.34,.18,.24,16),toon('#3a3430'));
       bowl2.position.y=1.05;b.add(bowl2);
       this.stoneMeshes.push(texR(bowl2,[2,1]));
       const f=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
       f.position.y=1.35;f.userData={ph:z,bra:1};b.add(f);this.flames.push(f);
     }}
    // 尘埃（光柱区浮尘）
    this.motes=[];
    {const rr=lcg(31),tex=glowTexture('rgba(255,240,210,1)','rgba(255,200,120,0)');
     for(let i=0;i<26;i++){
       const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));
       s.userData={x:(rr()-.5)*16,y:1+rr()*6,z:-8+rr()*16,ph:rr()*TAU,f:.3+rr()*.7};
       s.scale.setScalar(.04+rr()*.06);S.add(s);this.motes.push(s);
     }}
    this.scene.updateMatrixWorld(true);
    planarUVWorld(this.floorMesh,.12);
  }
  // craft3d-hybrid：文生图皮肤（几何/灯光不动）。法线=数值数据 NoColorSpace。
  async applyHybrid(base='./assets3d/tex/'){
    const L=new THREE.TextureLoader();
    const load=(n,data=false)=>new Promise(res=>L.load(base+n+'.png',t=>{
      t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.anisotropy=4;res(t);
    },undefined,()=>res(null)));
    const T={};
    await Promise.all([['palace_floor'],['palace_floor_normal',1],['palace_stone'],['palace_stone_normal',1],
        ['vault_coffer'],['vault_coffer_normal',1]]
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
    if(skin(this.floorMeshes,T.palace_floor,T.palace_floor_normal,1.8,'#9a94a4'))this.hybridApplied.push('floor');
    if(skin(this.stoneMeshes,T.palace_stone,T.palace_stone_normal,1.6,'#9892a4'))this.hybridApplied.push('stone');
    if(skin(this.vaultMeshes,T.vault_coffer,T.vault_coffer_normal,1.4,'#8a8496'))this.hybridApplied.push('vault');
    return this.hybridApplied;
  }
  update(t){
    this.fireLight.intensity=30*(1+.10*Math.sin(t*7.3)+.06*Math.sin(t*13.1));
    for(const f of this.flames){
      const u=f.userData;
      f.scale.set(.3+.08*Math.sin(t*u.f+u.ph),.5+.2*Math.max(0,Math.sin(t*u.f*1.3+u.ph)),1);
      f.material.opacity=.55+.4*Math.max(0,Math.sin(t*u.f*.9+u.ph*2));
    }
    for(const s of this.shafts) // 光柱微呼吸（很淡，不抢戏）
      s.material.opacity=.045+.015*Math.sin(t*.5+s.userData.ph);
    for(const m of this.motes){
      const u=m.userData;
      m.position.set(u.x+.25*Math.sin(t*u.f+u.ph),u.y+.2*Math.sin(t*u.f*.7+u.ph*2),u.z+.25*Math.cos(t*u.f*.8+u.ph));
      m.material.opacity=.28+.3*Math.max(0,Math.sin(t*1.1+u.ph));
    }
  }
}
