import * as THREE from 'three';
import {closedShell} from './sculpted-clad.js';

const TAU=Math.PI*2,mix=THREE.MathUtils.lerp;
// A periodic shell has one connected outer wall, inner wall and two closed rims.
// The bore stays open for the body; there is no missing back face or doubled seam.
function sleeve(surface,inner,{rows=36,sides=64,sign=1}={}){
 const pos=[],uv=[],ix=[],N=(rows+1)*sides;
 for(const fn of [surface,inner])for(let i=0;i<=rows;i++)for(let j=0;j<sides;j++){
  const q=fn(i/rows,j/sides*TAU);pos.push(q.x,q.y,q.z);uv.push(j/sides,i/rows);
 }
 const tri=(a,b,c,s=sign)=>ix.push(a,s>0?b:c,s>0?c:b);
 for(let i=0;i<rows;i++)for(let j=0;j<sides;j++){
  const a=i*sides+j,d=i*sides+(j+1)%sides,b=a+sides,c=d+sides;
  tri(a,b,d);tri(b,c,d);tri(a+N,b+N,d+N,-sign);tri(b+N,c+N,d+N,-sign);
 }
 for(let j=0;j<sides;j++){
  const a=j,b=(j+1)%sides,c=rows*sides+j,d=rows*sides+(j+1)%sides;
  tri(a,b,b+N);tri(a,b+N,a+N);tri(d,c,c+N);tri(d,c+N,d+N);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();g.userData.closedArmor=true;return g;
}
function metal(parent,geo,color,name){
 const m=new THREE.Mesh(geo,new THREE.MeshToonMaterial({color}));m.name=name;m.castShadow=true;m.receiveShadow=true;
 m.userData.palaceMetal=true;m.userData.polishedArmor=true;parent.add(m);return m;
}
function line(parent,points,color,name,r=.0017){return metal(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,r,8,false),color,name);}
function hideLegacy(parent,name){
 const old=new THREE.Group();old.name=name;
 for(const c of [...parent.children])if(c.isMesh||c.isGroup)old.add(c);
 parent.add(old);old.visible=false;return old;
}

// Opt-in palace equipment. Existing joints, foot contacts and upper-body armor
// remain owned by the original rig. New calf rigs avoid legacy XY rescaling.
export function applyPalaceLowerClad(actor){
 const fire=actor.palaceKind==='aoao',main=fire?'#d9ab63':'#7c89a7',edge=fire?'#f5d898':'#c2d0e3',dark=fire?'#9d6a34':'#454e6b';
 const records={},length=fire?.42:.49,k=fire?1:.81;
 for(const side of ['left','right']){
  const source=actor.shinRigs[side].rig;
  hideLegacy(source,'legacy-shin-plates');hideLegacy(actor.kneeCaps[side],'legacy-knee-cap');
  const rig=new THREE.Group();rig.name='fitted-greave-'+side;actor.mesh.add(rig);
  const radius=u=>{
   const keys=[[0,.053],[.20,.065],[.40,.063],[.72,.043],[1,.037]];
   for(let i=1;i<keys.length;i++)if(u<=keys[i][0]){let t=(u-keys[i-1][0])/(keys[i][0]-keys[i-1][0]);t=t*t*(3-2*t);return mix(keys[i-1][1],keys[i][1],t)*k;}
   return .037*k;
  };
  const surface=(u,a,inset=0)=>{
   const front=Math.max(0,Math.cos(a)),top=.044-.068*Math.pow(front,4),z=mix(top,length-.012,u);
   const r=radius(Math.max(0,z/length))+.011-inset,crest=.003*Math.pow(front,12)*Math.sin(Math.PI*u);
   return new THREE.Vector3(r*Math.sin(a),(r*1.08+crest)*Math.cos(a),z);
  };
  const shell=metal(rig,sleeve((u,a)=>surface(u,a),(u,a)=>surface(u,a,.0045)),main,'greave-'+side+'-sleeve');
  // The raised front lip forms the knee cup; the rear lip is cut lower for flexion.
  for(const u of [0,1])line(rig,Array.from({length:81},(_,j)=>surface(u,j/80*TAU)),edge,'greave-integrated-rim',.0022);
  line(rig,Array.from({length:29},(_,i)=>surface(.10+i/28*.80,0).add(new THREE.Vector3(0,.0013,0))),edge,'greave-long-crest',.0014);
  // A single low side flute keeps the two identities without fragmenting the leg.
  const sign=side==='left'?-1:1;
  line(rig,Array.from({length:29},(_,i)=>surface(.12+i/28*.73,sign*(fire?1.05:1.22))),dark,'greave-side-flute',.0014);
  const foot=actor.feet[side],shoe=foot.children.find(c=>c.isMesh&&c.material.side!==THREE.BackSide),ss=shoe.scale.x;
  // Keep the accepted foot volume/sole exactly, but continue metal around the
  // heel and toe; a top-only cap leaves a conspicuous black rear boot.
  shoe.material=new THREE.MeshToonMaterial({color:main});shoe.userData.palaceMetal=true;shoe.userData.polishedArmor=true;
  const boot=new THREE.Group();boot.name='articulated-metal-boot-'+side;foot.add(boot);
  // A closed curved instep overlays the existing shoe. Its bottom stays well
  // above the unchanged sole; the original foot pitch/yaw still drives the boot.
  const rows=[[-.069,.010,-.036],[-.052,.048,.041],[0,.062,.052],[.045,.069,.022],[.10,.063,-.003],[.137,.042,-.023],[.152,.010,-.042]];
  const bootSurface=(u,v)=>{
   const z=mix(rows[0][0],rows.at(-1)[0],u);let w,top;
   for(let i=1;i<rows.length;i++)if(z<=rows[i][0]+1e-8){const t=(z-rows[i-1][0])/(rows[i][0]-rows[i-1][0]);w=mix(rows[i-1][1],rows[i][1],t);top=mix(rows[i-1][2],rows[i][2],t);break;}
   const a=mix(-Math.PI/2,Math.PI/2,v);return new THREE.Vector3(w*Math.sin(a)*ss,(-.060+(top+.060)*Math.cos(a))*ss,z*ss);
  };
  const instep=metal(boot,closedShell(bootSurface,1,.003,48,32),main,'boot-'+side+'-instep');
  // The ankle collar belongs to the foot, overlapping the calf sleeve as a joint.
  const ankleSurface=(u,a,inset=0)=>new THREE.Vector3((.050*k+.003*u-inset)*Math.sin(a),mix(-.024,.036,u),(.054*k+.003*u-inset)*Math.cos(a)-.002);
  const ankle=metal(boot,sleeve((u,a)=>ankleSurface(u,a),(u,a)=>ankleSurface(u,a,.0035),{rows:8,sign:-1}),dark,'boot-'+side+'-ankle');
  line(boot,Array.from({length:25},(_,i)=>bootSurface(.45+i/24*.43,.5).add(new THREE.Vector3(0,.001,0))),edge,'boot-instep-crest',.0014);
  records[side]={rig,source,shell,boot,instep,ankle,length};
 }
 // Move the metal belt to the natural waist instead of wrapping the thigh roots.
 const beltRoot=actor.fitRefs.belt.parent,oldBelt=hideLegacy(beltRoot,'legacy-low-belt');
 const center=actor.dimsRef.hipIdle+.09,height=.095;
 const beltSurface=(u,a,inset=0)=>{
  const front=Math.max(0,Math.cos(a)),y=center+(u-.5)*height-.012*Math.pow(front,6)*(1-u),[rx,rz]=actor.profileAt(y);
  return new THREE.Vector3((rx+.014-inset)*Math.sin(a),y,(rz+.014-inset)*Math.cos(a));
 };
 const belt=metal(beltRoot,sleeve((u,a)=>beltSurface(u,a),(u,a)=>beltSurface(u,a,.006),{rows:12,sign:-1}),main,'solid-raised-waist-belt');
 for(const u of [0,1])line(beltRoot,Array.from({length:97},(_,i)=>beltSurface(u,i/96*TAU)),edge,'belt-solid-rim',.0024);
 const buckleSurface=(u,v)=>{const a=(v-.5)*.53,q=beltSurface(.10+u*.8,a);q.z+=.005+.005*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);return q;};
 const buckle=metal(beltRoot,closedShell(buckleSurface,-1,.004,16,24),edge,'belt-raised-buckle');
 const jewel=oldBelt.children.find(c=>actor.cladParts.some(p=>p.gems.includes(c)));
 if(jewel){beltRoot.add(jewel);jewel.position.set(0,center,actor.profileAt(center)[1]+.031);}
 // Move the attached hip leaves with the belt so the old dropped hem does not
 // continue to shorten the legs. Their existing thigh-driven hinges stay active.
 const rise=.105;for(const leaf of actor.skirtLeaves)leaf.g.position.y+=rise;
 actor.fitRefs.belt.position.set(actor.profileAt(center)[0]+.011,center,0);actor.fitRefs.belt.userData.waistBelt=true;
 const oldPose=actor.setPose.bind(actor);
 actor.setPose=p=>{oldPose(p);for(const [side,r] of Object.entries(records)){
  r.rig.position.copy(r.source.position);r.rig.quaternion.copy(r.source.quaternion);
  const leg=p[side+'Leg'];r.rig.scale.z=Math.hypot(leg[2].x-leg[1].x,leg[2].y-leg[1].y,leg[2].z-leg[1].z)/r.length;
 }actor.mesh.updateMatrixWorld(true);};
 const oldClad=actor.setCladState.bind(actor);
 actor.setCladState=t=>{oldClad(t);for(const r of Object.values(records)){r.rig.visible=r.source.visible;r.rig.scale.x=r.rig.scale.y=r.source.scale.x;r.boot.visible=r.source.visible;}};
 actor.lowerClad={legs:records,belt,buckle,beltCenter:center,beltRise:rise};return actor.lowerClad;
}
