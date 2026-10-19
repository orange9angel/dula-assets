import * as THREE from 'three';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';

// Reflections are a material light rig, not a replacement for the palace backdrop.
// Explicit envMap on armor leaves the accepted face and environment rendering alone.
export function createArmorEnvironment(renderer){
 const room=new THREE.Scene();room.background=new THREE.Color('#171d2c');
 const shell=new THREE.Mesh(new THREE.BoxGeometry(20,16,20),new THREE.MeshBasicMaterial({color:'#8594ad',side:THREE.BackSide}));room.add(shell);
 const card=(w,h,pos,color,intensity)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));m.position.set(...pos);m.lookAt(0,1,0);room.add(m);};
 card(3,8,[-5,4,5],'#ffe2a7',3.0);card(2,7,[5,3,1],'#c9dcff',2.5);
 card(7,3,[0,7,-2],'#ffffff',2.2);card(3,2,[-3,-1,-4],'#ff7d35',1.2);
 card(10,7,[1,4,8],'#fff1d5',1.6);card(8,6,[-1,3,-8],'#afcaff',1.1);
 const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(room,.035,.1,40);pmrem.dispose();
 room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 return target;
}

// Normalize generated plate UVs; geometry dimensions in metres are not texture UVs.
function plateUV(mesh){
 const g=mesh.geometry;
 if(g.type!=='ExtrudeGeometry'&&!g.userData.ringStride&&!g.userData.metalPlate)return;
 g.computeBoundingBox();const b=g.boundingBox,p=g.attributes.position,uv=g.attributes.uv??new THREE.BufferAttribute(new Float32Array(p.count*2),2);
 for(let i=0;i<p.count;i++){
  uv.setXY(i,g.userData.ringStride?(Math.atan2(p.getX(i),p.getZ(i))/(Math.PI*2)+.5):(p.getX(i)-b.min.x)/Math.max(.001,b.max.x-b.min.x),
   (p.getY(i)-b.min.y)/Math.max(.001,b.max.y-b.min.y));
 }g.setAttribute('uv',uv);uv.needsUpdate=true;
}

function curvePlate(mesh){
 if(mesh.geometry.type!=='ExtrudeGeometry'||!mesh.userData.palaceMetal)return;
 const g=new TessellateModifier(.035,5).modify(mesh.geometry);mesh.geometry=g;g.userData.metalPlate=true;
 g.computeBoundingBox();const b=g.boundingBox,p=g.attributes.position,w=b.max.x-b.min.x,c=(b.max.x+b.min.x)/2;
 const bulge=Math.min(.018,w*.12),n=g.attributes.normal;
 for(let i=0;i<p.count;i++){
  const u=(p.getX(i)-c)/(w/2);p.setZ(i,p.getZ(i)+bulge*(1-u*u));
  const normal=new THREE.Vector3(n.getX(i)+(4*bulge*u/w)*n.getZ(i),n.getY(i),n.getZ(i)).normalize();n.setXYZ(i,normal.x,normal.y,normal.z);
 }
 p.needsUpdate=true;n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
 // The engraved ribs/rivets must follow the same shell deformation, or the
 // newly convex surface buries precisely the details this upgrade preserves.
 for(const detail of mesh.parent.children){
  if(detail===mesh||!detail.isMesh||!detail.userData.palaceMetal||detail.geometry.type==='ExtrudeGeometry')continue;
  const dg=detail.geometry.clone(),dp=dg.attributes.position,dn=dg.attributes.normal;
  for(let i=0;i<dp.count;i++){
   const x=dp.getX(i)+detail.position.x;if(x<b.min.x-.008||x>b.max.x+.008)continue;
   const u=(x-c)/(w/2);dp.setZ(i,dp.getZ(i)+bulge*(1-u*u));
   if(dn){const q=new THREE.Vector3(dn.getX(i)+(4*bulge*u/w)*dn.getZ(i),dn.getY(i),dn.getZ(i)).normalize();dn.setXYZ(i,q.x,q.y,q.z);}
  }
  dp.needsUpdate=true;if(dn)dn.needsUpdate=true;dg.computeBoundingBox();dg.computeBoundingSphere();detail.geometry=dg;
 }
}

export async function applyMetalClad(actor,{url,environment,cleanMetal=false}){
 const map=await new THREE.TextureLoader().loadAsync(url);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.MirroredRepeatWrapping;map.anisotropy=8;
 const data=map.clone();data.colorSpace=THREE.NoColorSpace;data.needsUpdate=true;
 const roots=new Set(actor.cladParts.flatMap(p=>p.groups));
 for(const pd of actor.pauldronGroups)roots.add(pd.g);
 for(const side of ['left','right']){roots.add(actor.rigs[side].rig);roots.add(actor.shinRigs[side].rig);}
 const gems=new Set(actor.cladParts.flatMap(p=>p.gems)),selected=new Set();
 for(const root of roots)root.traverse(m=>selected.add(m));
 actor.mesh.traverse(m=>{if(m.userData.palaceMetal)selected.add(m);});
 const fire=actor.palaceKind==='aoao',materials=new Map();let converted=0;
 for(const m of selected){
  const old=m.material;
  if(!m.isMesh||!old||Array.isArray(old)||gems.has(m)||old.transparent||old.side===THREE.BackSide||m===actor.cape?.mesh||m.userData.palaceScar)continue;
  // Cloth is deliberately excluded even when parented under an armor growth group.
  if(m.geometry.type==='PlaneGeometry'||m===actor.cape?.m)continue;
  const col=old.color?.clone();if(!col)continue;
  const hsl=col.getHSL({}),trim=hsl.l>.43||m.geometry.type==='TubeGeometry'||m.geometry.type==='TorusGeometry';
  const polished=!!m.userData.polishedArmor;
  const cacheKey=old.uuid+':'+trim+':'+polished;
  if(!materials.has(cacheKey)){
   if(!fire&&hsl.l<.08)col.set('#34314d');
   // In the clean finish the generated engraving modulates surface relief only:
   // its gray albedo used at full strength reads as dirty sandpaper in close-up.
   const mat=new THREE.MeshPhysicalMaterial({color:col,metalness:1,roughness:polished?.22:trim?.23:cleanMetal?.28:.35,
    map:trim||polished||cleanMetal?null:map,bumpMap:trim?null:data,bumpScale:polished?.000025:cleanMetal?.000045:.00016,
    envMap:environment,envMapIntensity:1.35,clearcoat:.15,clearcoatRoughness:.24,side:old.side});
   mat.name='palace-metal-'+(trim?'polished-edge':'engraved-plate');materials.set(cacheKey,mat);
  }
  m.material=materials.get(cacheKey);m.userData.metalClad=true;curvePlate(m);plateUV(m);converted++;
 }
 actor.metalClad={converted,map,materials:[...materials.values()]};return actor.metalClad;
}

// Opt-in anatomy profile: preserve the rig and endpoints, give the thigh and calf
// separate volumes with a narrower knee and ankle. No bone or action rescaling.
export function refinePalaceLimbs(actor){
 const slim=actor.palaceKind==='yekari',k=slim?.81:1;
 for(const side of ['left','right']){
  actor.limbs[side+'Leg'].radii=[[0,.080*k],[.16,.085*k],[.30,.077*k],[.45,.053*k],[.51,.051*k],[.61,.065*k],[.70,.063*k],[.86,.043*k],[1,.037*k]];
  actor.limbs[side+'Leg'].depth=1.08;
  actor.limbs[side+'Arm'].radii=[[0,.050*k],[.18,.054*k],[.36,.045*k],[.51,.034*k],[.63,.041*k],[.78,.035*k],[1,.027*k]];
  // Greaves follow the enlarged calf. Scale cross section only, never bone axis.
  actor.shinRigs[side].rig.traverse(m=>{if(!m.isMesh)return;m.geometry=m.geometry.clone();m.geometry.scale(1.14,1.14,1);m.position.x*=1.14;m.position.y*=1.14;});
 }
}
