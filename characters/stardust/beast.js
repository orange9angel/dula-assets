// 《星屑战壳》蚀星兽（S1E2 新资产）：狼形蚀星兽——黑躯+蚀纹紫光+颈后驭纹（F03 镜头件）。
// 剪影优先：拉长躯干/肩峰/楔头/低伏潜行读形；动作集=潜行低伏/扑击/肩撞/倒地挣扎/逃窜，
// 不走连续四足步态（腿只做小幅拖步与预备弯曲，位移靠根）。update(t) 蚀纹脉动纯 (t,state)。
// 探针锚点：claws.left/right（前爪尖 c1）/shoulderL（肩撞 c2）/spineBack（背中 c4）/
// napeMark（驭纹 F03）/headG（头）；契约=setPose(p)+update(t)+setMarkGlow(k)+mesh。
import * as THREE from 'three';
import {LimbSurface,mesh,ellipsoid} from 'dula-assets/lib/craft3d/surface.js';

const BODY='#0d0b12';         // 黑躯
const ERODE='#a47cff';        // 蚀纹紫光
const ERODE_HOT='#d8c8ff';

export class ErosionBeastCraft{
  constructor(){
    this.mesh=new THREE.Group();this.mesh.name='ErosionBeastCraft';
    this.body=new THREE.Group();this.mesh.add(this.body);
    // ── 躯干剪影：拉长躯干+肩峰+后胯+颈 ──
    ellipsoid(this.body,[0,0,-.10],[.98,.40,.38],BODY);                    // 主躯干
    ellipsoid(this.body,[0,.16,.52],[.50,.40,.40],BODY);                   // 肩峰（前躯重量感）
    ellipsoid(this.body,[0,.06,-.62],[.46,.34,.38],BODY);                  // 后胯
    ellipsoid(this.body,[0,.24,.88],[.24,.22,.30],BODY);                   // 颈
    // ── 头：楔形颅+吻部+竖耳+紫瞳 ──
    this.headG=new THREE.Group();this.headG.position.set(0,.30,1.02);this.body.add(this.headG);
    const skull=mesh(this.headG,new THREE.ConeGeometry(.20,.42,4),BODY);   // 楔头
    skull.rotation.x=Math.PI/2;skull.rotation.y=Math.PI/4;skull.position.z=.16;
    skull.scale.set(1,.72,1);
    const jaw=mesh(this.headG,new THREE.ConeGeometry(.13,.30,4),BODY);     // 下吻
    jaw.rotation.x=Math.PI/2;jaw.rotation.y=Math.PI/4;jaw.position.set(0,-.09,.14);
    this.jaw=jaw;
    for(const s of[-1,1]){
      const ear=mesh(this.headG,new THREE.ConeGeometry(.05,.16,4),BODY);
      ear.position.set(s*.10,.16,-.02);ear.rotation.x=-.25;
      const eye=new THREE.Mesh(new THREE.SphereGeometry(.028,10,8),
        new THREE.MeshBasicMaterial({color:ERODE_HOT}));
      eye.position.set(s*.085,.045,.28);this.headG.add(eye);
    }
    // ── 蚀纹：躯干两侧的紫光裂片（update 脉动）──
    this.cracks=[];
    const crackMat=()=>new THREE.MeshBasicMaterial({color:ERODE,transparent:true,opacity:.5,
      blending:THREE.AdditiveBlending,depthWrite:false});
    const crackAt=(x,y,z,rx,rz,len)=>{
      const g=new THREE.Group();g.position.set(x,y,z);g.rotation.set(rx,0,rz);this.body.add(g);
      for(let i=0;i<3;i++){ // 折线裂片：三段递减
        const p=new THREE.Mesh(new THREE.PlaneGeometry(.035,len*(1-.25*i)),crackMat());
        p.position.set((i%2?-.02:.02),-i*len*.8,0);p.rotation.z=(i%2?-.5:.5);
        g.add(p);this.cracks.push(p);
      }return g;
    };
    crackAt(.40,.10,.30, 0,-.5,.16);crackAt(-.40,.08,-.05, 0,.5,.14);
    crackAt(.38,.06,-.45, .2,-.9,.13);crackAt(-.36,.14,.62, -.1,.7,.12);
    // ── 驭纹（颈后烙式环+三刻齿；平时近隐，F03 镜头 setMarkGlow 点亮）──
    this.mark=new THREE.Group();this.mark.position.set(0,.40,.78);this.mark.rotation.x=.35;
    this.markMats=[];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.085,.012,8,28),
      new THREE.MeshBasicMaterial({color:ERODE,transparent:true,opacity:.12,
        blending:THREE.AdditiveBlending,depthWrite:false}));
    this.mark.add(ring);this.markMats.push(ring.material);
    for(let i=0;i<3;i++){const a=i/3*Math.PI*2;
      const tick=new THREE.Mesh(new THREE.BoxGeometry(.014,.05,.012),ring.material.clone());
      tick.position.set(Math.cos(a)*.085,Math.sin(a)*.085,0);tick.rotation.z=a;
      this.mark.add(tick);this.markMats.push(tick.material);}
    this.markGlow=.12;
    this.body.add(this.mark);this.napeMark=ring;
    // ── 四肢（LimbSurface 两段管）+尾 ──
    const legR=[[0,.085],[.45,.055],[1,.035]];
    this.legs={};
    for(const[key,hx,hz]of[['fl',.30,.55],['fr',-.30,.55],['bl',.28,-.55],['br',-.28,-.55]]){
      const hip=new THREE.Group();hip.position.set(hx,-.10,hz);this.body.add(hip);
      const limb=new LimbSurface(hip,BODY,legR);
      this.legs[key]={hip,limb,paw:new THREE.Object3D(),hx,hz};
      this.body.add(this.legs[key].paw); // paw 锚挂 body（世界读出用）
    }
    this.claws={left:this.legs.fl.paw,right:this.legs.fr.paw};
    this.shoulderL=new THREE.Object3D();this.shoulderL.position.set(.44,.18,.55);this.body.add(this.shoulderL);
    this.spineBack=new THREE.Object3D();this.spineBack.position.set(0,.40,-.10);this.body.add(this.spineBack);
    const tailG=new THREE.Group();tailG.position.set(0,.10,-.92);this.body.add(tailG);
    this.tail=new LimbSurface(tailG,BODY,[[0,.06],[1,.015]],{depth:.8});
    this.tail.update([[0,0,0],[0,.02,-.35],[.06,.10,-.62]].map(p=>({x:p[0],y:p[1],z:p[2]})));
    this.setPose({rootX:0,rootZ:0,yaw:0,crouch:0});
  }
  // p:{rootX,rootZ,yaw,bob,crouch,air,pitch,pace(0-1 拖步幅度),downK,headYaw,headPitch}
  setPose(p){
    const c=p.crouch??0,air=p.air??0,down=p.downK??0;
    const bodyY=.62-.26*c-.30*down+air;
    this.mesh.position.set(p.rootX,0,p.rootZ);
    this.mesh.rotation.y=p.yaw??0;
    this.body.position.y=bodyY;
    this.body.rotation.x=(p.pitch??0)+down*.25;   // 倒地时躯干侧沉
    this.body.rotation.z=down*.9;                  // 倒地侧翻
    this.body.scale.y=1-.08*c;
    this.headG.rotation.y=p.headYaw??0;this.headG.rotation.x=(p.headPitch??0)+.12*c;
    this.jaw.rotation.x=Math.PI/2+(p.jawOpen??0)*.5;
    // 腿：站姿足点在地面；下蹲膝前弓；腾空收腿；倒地侧伸
    const pace=p.pace??0,t=p.t??0;
    let i=0;
    for(const key of['fl','fr','bl','br']){
      const L=this.legs[key],side=L.hx>0?1:-1,front=L.hz>0;
      const ph=i*.9+(front?0:.6);i++;
      const shuffle=pace*Math.sin(t*2.2+ph)*.10;          // 潜行拖步小幅前后错
      const lift=Math.max(0,pace*Math.sin(t*2.2+ph))*.05;
      let pawY=-bodyY+.02, kneeY=-bodyY*.55, kneeZ=.07*(front?1:-1);
      let pawZ=shuffle;
      if(air>0){pawY=-bodyY+.34*air;kneeY=-bodyY*.4;kneeZ=(front?.16:-.10)*air;pawZ+= (front?.10:-.14)*air;}
      if(down>0){pawY=-bodyY+.06;kneeY=-bodyY*.5;kneeZ=side*.22*down;pawZ+=side*.30*down;}
      L.limb.update([{x:0,y:0,z:0},{x:side*.03,y:kneeY,z:kneeZ},{x:side*.02,y:pawY+lift,z:pawZ}]);
      L.paw.position.set(L.hx+side*.02,bodyY+pawY+lift,L.hz+pawZ);
    }
  }
  update(t){ // 蚀纹脉动（活物感，纯 t）+驭纹亮度
    const k=.42+.18*Math.sin(t*1.7)+.08*Math.sin(t*3.9);
    for(const c of this.cracks)c.material.opacity=k;
    for(const m of this.markMats)m.opacity=this.markGlow*(0.8+.2*Math.sin(t*2.3));
  }
  setMarkGlow(k){this.markGlow=k;}
}
