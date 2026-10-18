// 《星屑战壳》系列场景资产（R10 新增）— 星辉门阙（PalaceGateScene）：宫殿正门外景——
// 超长宽石阶（层层下延向广场）+ 巨型双开门扉（浅浮雕纹理）+ 门侧巨像守卫（执戟立像）+
// 圣火盆列沿阶而下 + 夜空背景板。登场/冲锋仰角排面镜头用。
// 广场表演区 y=0（z>0 平地），台阶向 -z 上行；世界布局与圣殿一致（跳切坐标连续）。
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
function glowTexture(inner='#fff6dc',outer='rgba(255,150,60,0)'){
  return canvasTex(64,64,(c)=>{
    const g=c.createRadialGradient(32,32,2,32,32,32);
    g.addColorStop(0,inner);g.addColorStop(.4,'rgba(255,190,110,.85)');g.addColorStop(1,outer);
    c.fillStyle=g;c.fillRect(0,0,64,64);
  });
}

export class PalaceGateScene extends SceneBase{
  build(){
    const S=this.scene;
    S.background=new THREE.Color('#0b0e1e');
    S.fog=new THREE.Fog('#12182c',32,110);
    // ── 光：夜环境 + 门上暖光洗墙 + 月光冷 rim + 正面暖补 ──
    S.add(new THREE.HemisphereLight(0x3a4468,0x201a24,1.0));
    const moon=new THREE.DirectionalLight(0x9fb4e8,1.2);
    moon.position.set(-9,14,7);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);
    Object.assign(moon.shadow.camera,{left:-16,right:16,top:12,bottom:-4,far:70});
    moon.shadow.bias=-.0004;S.add(moon);
    const fill=new THREE.DirectionalLight(0xffc890,.7);fill.position.set(3,4,12);S.add(fill);
    this.doorGlowLight=new THREE.PointLight(0xffc060,26,22,1.8); // 门扉暖洗
    this.doorGlowLight.position.set(0,4.5,-6.4);S.add(this.doorGlowLight);

    const stone='#4c4652',stoneD='#3a3540',gold='#c8a24e';
    const texR=(m,r)=>{m.userData.texR=r;return m;};
    this.stoneMeshes=[];this.groundMeshes=[];this.doorMeshes=[];

    // ── 广场（y=0 表演区）+ 远景盘 ──
    const plaza=this.floorMesh=new THREE.Mesh(new THREE.CircleGeometry(34,64),toon('#3f3a46'));
    plaza.rotation.x=-Math.PI/2;plaza.receiveShadow=true;S.add(plaza);this.groundMeshes.push(texR(plaza,[1,1]));
    const far=this.farMesh=new THREE.Mesh(new THREE.CircleGeometry(90,40),toon('#242028'));
    far.rotation.x=-Math.PI/2;far.position.y=-.02;S.add(far);this.groundMeshes.push(texR(far,[1,1]));

    // ── 超长石阶（z -1.5→-7.5 上行到门廊台；八级，每级抬 .28）──
    for(let i=0;i<8;i++){
      const w=16-i*.4;
      const step=new THREE.Mesh(new THREE.BoxGeometry(w,.28,1.1),toon(i%2?stoneD:stone));
      step.position.set(0,.14+i*.28,-1.6-i*.85);
      step.castShadow=step.receiveShadow=true;S.add(step);this.stoneMeshes.push(texR(step,[4,1]));
    }
    // 门廊平台（阶顶）
    const porch=new THREE.Mesh(new THREE.BoxGeometry(13,.28,3.4),toon(stone));
    porch.position.set(0,2.38,-8.6);porch.castShadow=porch.receiveShadow=true;S.add(porch);
    this.stoneMeshes.push(texR(porch,[4,1]));

    // ── 宫殿立面 + 巨型双开门扉（浅浮雕）──
    const facade=new THREE.Mesh(new THREE.BoxGeometry(26,11,.8),toon(stoneD));
    facade.position.set(0,5.5,-10.6);facade.receiveShadow=true;S.add(facade);
    this.stoneMeshes.push(texR(facade,[6,3]));
    for(const sx of [-1,1]){
      const door=new THREE.Mesh(new THREE.BoxGeometry(3.1,7.6,.3),toon('#3a3244'));
      door.position.set(sx*1.65,3.8,-10.15);door.castShadow=true;S.add(door);
      this.doorMeshes.push(texR(door,[1,2]));
      // 门扉金框+圆形门环
      const frame=new THREE.Mesh(new THREE.BoxGeometry(3.4,7.9,.16),toon(gold));
      frame.position.set(sx*1.65,3.95,-10.3);S.add(frame);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.05,8,20),toon(gold));
      ring.position.set(sx*.6,3.6,-9.95);S.add(ring);
    }
    // 门楣浮雕带+三角山墙
    const frieze=new THREE.Mesh(new THREE.BoxGeometry(13,1.1,.5),toon(stone));
    frieze.position.set(0,8.4,-10.4);S.add(frieze);this.stoneMeshes.push(texR(frieze,[4,1]));
    const pedi=new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.6,1.0,3),toon(stoneD));
    pedi.rotation.x=Math.PI/2;pedi.rotation.y=Math.PI/6;pedi.position.set(0,10.2,-10.6);
    pedi.scale.z=.22;S.add(pedi);this.stoneMeshes.push(texR(pedi,[3,1]));
    // 立面凹槽柱（两侧各 3 根半圆柱）
    for(const sx of [-1,1])for(let i=1;i<=3;i++){
      const c=new THREE.Mesh(new THREE.CylinderGeometry(.55,.6,10,14),toon(stone));
      c.position.set(sx*(3.4+i*2.6),5,-10.2);c.castShadow=c.receiveShadow=true;S.add(c);
      this.stoneMeshes.push(texR(c,[2,3]));
    }
    // ── 门侧巨像守卫（执戟立像，程序化几何拼件）──
    for(const sx of [-1,1]){
      const st=new THREE.Group();st.position.set(sx*5.6,2.5,-8.4);st.rotation.y=-sx*.25;S.add(st);
      const plinth=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.6,2.2),toon(stoneD));
      plinth.position.y=-1.7;plinth.castShadow=plinth.receiveShadow=true;st.add(plinth);
      this.stoneMeshes.push(texR(plinth,[2,1]));
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.75,1.0,3.6,12),toon(stone));
      body.position.y=.9;body.castShadow=true;st.add(body);this.stoneMeshes.push(texR(body,[2,2]));
      const headM=new THREE.Mesh(new THREE.SphereGeometry(.55,12,10),toon(stone));
      headM.position.y=3.1;headM.castShadow=true;st.add(headM);this.stoneMeshes.push(texR(headM,[1,1]));
      const helm=new THREE.Mesh(new THREE.ConeGeometry(.6,.9,8),toon(stoneD));
      helm.position.y=3.75;st.add(helm);
      // 执戟（长杆立地）
      const spear=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,6.8,8),toon('#2e2a34'));
      spear.position.set(sx*1.1,2.2,.4);st.add(spear);
      const blade=new THREE.Mesh(new THREE.ConeGeometry(.16,.7,6),toon(gold));
      blade.position.set(sx*1.1,5.8,.4);st.add(blade);
      // 披风背板
      const cape=new THREE.Mesh(new THREE.BoxGeometry(1.5,3.2,.18),toon(stoneD));
      cape.position.set(0,.8,-.85);st.add(cape);this.stoneMeshes.push(texR(cape,[1,2]));
    }
    // ── 圣火盆列（沿阶两侧）──
    this.flames=[];
    {const tex=glowTexture();
     for(const sx of [-1,1])for(let i=0;i<3;i++){
       const g=new THREE.Group();g.position.set(sx*(4.6-i*.3),.28+i*.28,-2.4-i*1.7);S.add(g);
       const stand=new THREE.Mesh(new THREE.CylinderGeometry(.10,.17,.9,10),toon(stoneD));
       stand.position.y=.45;stand.castShadow=true;g.add(stand);this.stoneMeshes.push(texR(stand,[1,1]));
       const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.3,.16,.22,14),toon(stone));
       bowl.position.y=1.0;g.add(bowl);this.stoneMeshes.push(texR(bowl,[1,1]));
       const f=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
       f.position.y=1.3;f.userData={ph:i*1.2+sx,f:6+i};g.add(f);this.flames.push(f);
     }}
    // 广场散件（断裂徽记碑/矮墩，走廊外）
    {const rr=lcg(43);
     for(let i=0;i<7;i++){
       const a=rr()*TAU,r=8+rr()*9;
       const b=new THREE.Mesh(new THREE.BoxGeometry(.8+rr()*.7,.5+rr()*.5,.6),toon(rr()<.5?stone:stoneD));
       b.position.set(Math.cos(a)*r,.25,Math.abs(Math.sin(a))*r*.6+2); // 广场前侧
       b.rotation.y=rr()*TAU;b.castShadow=b.receiveShadow=true;S.add(b);
       this.stoneMeshes.push(texR(b,[1,1]));
     }}
    this.scene.updateMatrixWorld(true);
    planarUVWorld(this.floorMesh,.13);planarUVWorld(this.farMesh,.13);
  }
  async applyHybrid(base='./assets3d/tex/'){
    const L=new THREE.TextureLoader();
    const load=(n,data=false)=>new Promise(res=>L.load(base+n+'.png',t=>{
      t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.anisotropy=4;res(t);
    },undefined,()=>res(null)));
    const T={};
    await Promise.all([['gate_stone'],['gate_stone_normal',1],['door_relief'],['door_relief_normal',1],
        ['backdrop_gate']]
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
    if(skin(this.groundMeshes,T.gate_stone,T.gate_stone_normal,1.8,'#9890a0'))this.hybridApplied.push('ground');
    if(skin(this.stoneMeshes,T.gate_stone,T.gate_stone_normal,1.6,'#908898'))this.hybridApplied.push('stone');
    if(skin(this.doorMeshes,T.door_relief,T.door_relief_normal,1.8,'#8a80a0'))this.hybridApplied.push('door');
    if(T.backdrop_gate){
      const bc=document.createElement('canvas');bc.width=2048;bc.height=768;
      const bg=bc.getContext('2d');bg.filter='brightness(1.4)';
      bg.drawImage(T.backdrop_gate.image,0,0);
      const bt=new THREE.CanvasTexture(bc);bt.colorSpace=THREE.SRGBColorSpace;bt.anisotropy=4;
      bt.wrapS=THREE.MirroredRepeatWrapping;
      const {continuousBackdrop}=await import('dula-assets/lib/craft3d/continuous-backdrop.js');
      this.backdrop=continuousBackdrop(bt,{center:[0,4,-6],cylinderRadius:60,
        cylinderHeight:30,radius:150,repeat:2,offset:.5,zenith:'#10142c'});
      this.scene.add(this.backdrop);
      const sample=(()=>{const c=document.createElement('canvas');c.width=64;c.height=48;
        const g=c.getContext('2d',{willReadFrequently:true});
        g.drawImage(T.backdrop_gate.image,0,0,2048,768,0,0,64,48);
        const d=g.getImageData(0,0,64,48).data;
        return row=>{let r=0,gg=0,b=0;for(let x=0;x<64;x++){const i=(row*64+x)*4;r+=d[i];gg+=d[i+1];b+=d[i+2];}
          return `rgb(${r/64|0},${gg/64|0},${b/64|0})`;};})();
      const top=sample(2),mid=sample(22),low=sample(34);
      this.scene.background=canvasTex(2,256,(c,w,h)=>{
        const g=c.createLinearGradient(0,0,0,h);
        g.addColorStop(0,top);g.addColorStop(.45,mid);g.addColorStop(.75,low);g.addColorStop(1,'#0b0e1e');
        c.fillStyle=g;c.fillRect(0,0,w,h);
      });
      this.hybridApplied.push('backdrop');
    }
    return this.hybridApplied;
  }
  update(t){
    this.doorGlowLight.intensity=24*(1+.08*Math.sin(t*6.1)+.05*Math.sin(t*11.3));
    for(const f of this.flames){
      const u=f.userData;
      f.scale.set(.32+.09*Math.sin(t*u.f+u.ph),.52+.2*Math.max(0,Math.sin(t*u.f*1.3+u.ph)),1);
      f.material.opacity=.6+.35*Math.max(0,Math.sin(t*u.f*.9+u.ph*2));
    }
  }
}
