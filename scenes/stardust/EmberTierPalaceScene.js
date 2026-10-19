import * as THREE from 'three';
import {SceneBase} from 'dula-engine';
import {continuousBackdrop} from '../../lib/craft3d/continuous-backdrop.js';
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export class EmberTierPalaceScene extends SceneBase{
 build(){
  this.navigationObstacles=[];
  this.scene.background=new THREE.Color('#101827');
  this.scene.fog=new THREE.Fog('#182132',16,48);
  this.scene.add(new THREE.HemisphereLight('#b9d8ff','#563523',1.4));
  const key=new THREE.DirectionalLight('#ffe1b3',1.55);key.position.set(-3,8,7);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:30});key.shadow.bias=-.0003;this.scene.add(key);
  const rim=new THREE.DirectionalLight('#b2baff',.9);rim.position.set(5,5,-6);this.scene.add(rim);
  this.fireLight=new THREE.PointLight('#ff8d35',12,12,2);this.fireLight.position.set(-2.6,1.1,-1);this.scene.add(this.fireLight);
  const stone=new THREE.MeshStandardMaterial({color:'#6d7788',roughness:.9});
  const dark=new THREE.MeshStandardMaterial({color:'#283243',roughness:.85});
  const gold=new THREE.MeshStandardMaterial({color:'#b88e52',metalness:.5,roughness:.48});
  this.stoneMat=stone;this.goldMat=gold;this.darkMat=dark;this.floorMat=new THREE.MeshStandardMaterial({color:'#88899a',roughness:.78});
  const box=(w,h,d,x,y,z,mat=stone)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;this.scene.add(m);return m;};
  const obstacle=(id,m)=>{m.name=id;m.userData.navigationObstacle=true;this.navigationObstacles.push(m);return m;};
  box(15,.4,16,0,-.21,0,this.floorMat);
  // Rectilinear terraces and a nine-step axial stair distinguish this palace from the round altar.
  for(let i=0;i<9;i++){box(8.5-i*.25,.16,1.0,0,.08+i*.16,-4.6-i*.58);}
  for(const s of [-1,1]){
   obstacle(`rail_${s}`,box(.65,.65,14,s*6.3,.32,-1,dark));
   for(let j=0;j<4;j++){
    const z=3.7-j*3.7,x=s*4.8;
    obstacle(`column_${s}_${j}_base`,box(.95,.3,.95,x,.15,z,gold));obstacle(`column_${s}_${j}_shaft`,box(.68,4.8,.68,x,2.55,z));
    for(const off of [-.23,0,.23])obstacle(`column_${s}_${j}_flute_${off}`,box(.07,4.25,.07,x+off,2.6,z+.36,gold));
    obstacle(`column_${s}_${j}_capital`,box(1.15,.26,1.05,x,4.94,z,gold));
    const g=new THREE.Mesh(new THREE.TorusGeometry(1.0,.13,6,32,Math.PI),gold);g.position.set(x-s*1.0,4.75,z);this.scene.add(g);
    // Pennants hang outside the central movement corridor.
    const banner=new THREE.Mesh(new THREE.PlaneGeometry(.65,2.0),new THREE.MeshStandardMaterial({color:s<0?'#823d30':'#2f3d65',side:THREE.DoubleSide,roughness:.9}));
    banner.position.set(x+s*.65,3.5,z);this.scene.add(banner);
   }
  }
  // The actual fire gate is a wall opening with a sliding copper shutter, never a pot.
  this.gateRoot=new THREE.Group();this.gateRoot.position.set(-2.7,0,-1.25);this.scene.add(this.gateRoot);
  const localBox=(w,h,d,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);this.gateRoot.add(m);m.castShadow=true;obstacle(`firegate_${this.navigationObstacles.length}`,m);return m;};
  localBox(.22,1.8,.35,-.68,.9,0,gold);localBox(.22,1.8,.35,.68,.9,0,gold);localBox(1.65,.25,.4,0,1.77,0,gold);
  localBox(1.25,1.5,.16,0,.82,-.18,dark);
  this.gate=new THREE.Group();this.gateRoot.add(this.gate);
  const shutter=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.4,.09),dark);shutter.position.set(0,.8,.05);this.gate.add(shutter);
  for(let i=0;i<5;i++){
   const bar=new THREE.Mesh(new THREE.BoxGeometry(.11,1.3,.06),gold);bar.position.set((i-2)*.21,.8,.13);this.gate.add(bar);
  }
  this.heart=new THREE.Mesh(new THREE.OctahedronGeometry(.18),new THREE.MeshBasicMaterial({color:'#ffbd58'}));this.heart.position.set(0,1.1,.21);this.gateRoot.add(this.heart);
  this.lockPoint=new THREE.Vector3(-.968,.334,.45);
  const path=[new THREE.Vector3(-2.7,.025,-1.15),new THREE.Vector3(-1.65,.025,-.6),new THREE.Vector3(-.968,.025,.45),new THREE.Vector3(1.5,.025,-.05),new THREE.Vector3(3.8,.025,-1.4)];
  this.channel=[];
  for(let i=0;i<path.length-1;i++){
   const a=path[i],b=path[i+1],v=b.clone().sub(a),mid=a.clone().lerp(b,.5);
   const slot=box(v.length(),.04,.20,mid.x,.004,mid.z,dark);slot.rotation.y=-Math.atan2(v.z,v.x);
   const fire=box(v.length(),.012,.09,mid.x,.03,mid.z,new THREE.MeshBasicMaterial({color:'#ff8d32'}));fire.rotation.y=slot.rotation.y;this.channel.push(fire);
   for(const sign of [-1,1]){const rail=box(v.length(),.035,.025,mid.x,.033,mid.z,gold);rail.rotation.y=slot.rotation.y;rail.position.add(new THREE.Vector3(-v.z,0,v.x).normalize().multiplyScalar(sign*.12));}
  }
  // Gate tongue: its notch is visible in the repair and trap shots.
  this.lockSolids=[];
  const lockSolid=(id,m)=>{m.name=id;this.lockSolids.push(m);return m;};
  lockSolid('lock_base',box(.34,.24,.48,-.968,.12,.45,dark));
  this.tongue=lockSolid('lock_tongue',box(.27,.08,.42,-.968,.294,.45,gold));
  this.tongue.userData.clearanceTravel=[0,0,.16];
  for(const [i,x] of [-1.138,-.798].entries())lockSolid('lock_cheek_'+i,box(.055,.37,.56,x,.185,.45,dark));
  this.scars=[];
  for(let j=0;j<2;j++){
   const m=box(1.4,.009,.022,-.3,.015,.20+j*.26,new THREE.MeshBasicMaterial({color:'#0b101b'}));m.rotation.y=.19+j*.1;this.scars.push(m);
  }
  // Street below the palace, with individual windows and one visible hearth.
  this.windows=[];
  box(34,.30,24,0,-.96,-18,this.floorMat);
  for(let i=0;i<18;i++){
   const x=-9+(i%9)*2.2,z=-15-Math.floor(i/9)*3,h=.8+(i%4)*.35;
   box(1.55,h,1.3,x,h/2-.8,z,dark);
   const roof=new THREE.Mesh(new THREE.ConeGeometry(1.18,.48,4),stone);roof.rotation.y=Math.PI/4;roof.position.set(x,h-.56,z);roof.scale.z=.8;this.scene.add(roof);
   for(const s of [-1,1]){const w=box(.24,.33,.018,x+s*.35,h*.55-.8,z+.66,new THREE.MeshBasicMaterial({color:'#ffba61'}));this.windows.push(w);box(.025,.34,.025,x+s*.35,h*.55-.8,z+.68,gold);box(.25,.025,.025,x+s*.35,h*.55-.8,z+.68,gold);}
  }
  this.hearth=box(.31,.37,.02,-.2,-.59,-14.33,new THREE.MeshBasicMaterial({color:'#ffb547'}));
  // A dark doorway has depth and an opaque enclosing palace, never a sky window.
  const interior=new THREE.MeshStandardMaterial({color:'#11131b',roughness:.95});
  for(const x of [-7,7])obstacle(`palace_facade_${x}`,box(8.6,8.5,1,x,3.95,-10,stone));
  for(const x of [-10.5,-7.7,-4.4,4.4,7.7,10.5]){
   obstacle(`facade_pilaster_${x}`,box(.38,7.7,.28,x,3.8,-9.36,stone));box(.64,.28,.4,x,7.5,-9.3,gold);
  }
  for(const x of [-7,7])for(const y of [1.4,5.55,7.7])box(8.6,.16,.18,x,y,-9.4,gold);
  for(const x of [-2.7,2.7])obstacle(`portal_jamb_${x}`,box(.8,4.4,1,x,3.5,-10,gold));
  obstacle('portal_lintel',box(6.2,.65,1.1,0,5.6,-10,gold));
  obstacle('portal_topwall',box(5.4,2.6,1,0,6.95,-10,stone));
  this.portalSolids=[];
  const enclosure=(id,m)=>{obstacle(id,m);this.portalSolids.push(m);return m;};
  enclosure('palace_inside_back',box(6,4.7,.4,0,3.6,-13.7,new THREE.MeshBasicMaterial({color:'#030409',fog:false})));
  for(const x of [-2.9,2.9])enclosure(`palace_inside_side_${x}`,box(.4,4.7,4,x,3.6,-11.8,interior));
  enclosure('palace_inside_roof',box(6,.35,4,0,5.9,-11.8,interior));
  box(6,.3,4,0,1.35,-11.8,dark);
  // A pair of dim inner pillars gives depth while the far end remains opaque.
  for(const x of [-1.9,1.9]){box(.28,3.5,.3,x,3.2,-12.3,interior);box(.05,.65,.035,x,2.6,-12.12,new THREE.MeshBasicMaterial({color:'#51412c'}));}
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.38,.035,8,48),gold);ring.position.set(0,6.25,-9.45);this.scene.add(ring);
  const star=new THREE.Mesh(new THREE.OctahedronGeometry(.17),gold);star.position.set(0,6.25,-9.4);this.scene.add(star);
  const pos=[];for(let i=0;i<160;i++)pos.push(Math.sin(i*17.23)*26,6+(i%29)*.45,-12-Math.abs(Math.cos(i*13.7))*18);
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));this.scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:'#b9d6fa',size:.05})));
  this.embers=[];
  for(let i=0;i<36;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.014),new THREE.MeshBasicMaterial({color:'#ffcd7d'}));this.scene.add(m);this.embers.push(m);}
  this.readyPromise=Promise.resolve();
 }
 applyHybrid(base='./assets3d/tex/'){
  this.readyPromise=this.loadHybrid(base);return this.readyPromise;
 }
 async loadHybrid(base){
  const loader=new THREE.TextureLoader();
  const load=async(file,repeat,color=true)=>{const t=await loader.loadAsync(base+file);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;t.repeat.set(...repeat);t.anisotropy=8;return t;};
  this.floorMat.map=await load('palace_floor.png',[5,5]);this.floorMat.needsUpdate=true;
  this.stoneMat.map=await load('palace_stone.png',[1,3]);this.stoneMat.needsUpdate=true;
  this.goldMat.map=await load('altar_relief.png',[1,1]);this.goldMat.needsUpdate=true;
  this.darkMat.map=await load('basalt_wall.png',[1,1]);this.darkMat.needsUpdate=true;
  for(const [mat,file,repeat] of [[this.floorMat,'palace_floor',[5,5]],[this.stoneMat,'palace_stone',[1,3]],[this.goldMat,'altar_relief',[1,1]],[this.darkMat,'basalt_wall',[1,1]]]){mat.normalMap=await load(file+'_normal.png',repeat,false);mat.normalScale.set(.35,.35);mat.needsUpdate=true;}
  const bg=await load('backdrop_caldera.png',[1,1]);bg.wrapS=THREE.MirroredRepeatWrapping;
  this.backdrop=continuousBackdrop(bg,{center:[0,3,-4],cylinderRadius:45,cylinderHeight:29,radius:80,repeat:2,offset:.25,zenith:'#10182e'});this.scene.add(this.backdrop);
 }
 update(t,events={}){
  const gate=smooth((t-(events.GATE_OPEN??1e9))/1.7),rest=smooth((t-(events.RESTORE??1e9))/3);
  this.gate.position.y=gate*.95;this.tongue.position.y=.294;this.tongue.position.z=.45+smooth((t-(events.LOCK??1e9))/.8)*.16;
  for(const [i,m] of this.channel.entries()){const power=rest>.01?1:smooth((t-(events.HERO_CHARGE??1e9))/4)*.8;
   m.material.color.setRGB(1,.24+.3*power,.035+.15*power);}
  for(const [i,w] of this.windows.entries())w.visible=t>=(events.RESTORE??1e9)+i*.07;
  this.hearth.visible=rest>.5;
  this.scars.forEach(m=>m.visible=t>=(events.C2??1e9));
  this.heart.rotation.y=t*.25;
  this.fireLight.intensity=3.4+.4*Math.sin(t*2.1)+rest*1.5;
  for(const [i,m] of this.embers.entries()){const u=((t*.19+i*.071)%1);m.position.set(-2.7+Math.sin(i*3.2+u*4)*.5,.25+u*2.4,-1.25+Math.cos(i*1.7)*.45);m.scale.setScalar(Math.sin(u*Math.PI));}
 }
}
