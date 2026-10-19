import * as THREE from 'three';
import {hearthFire} from '../../lib/craft3d/combustion-particles.js';

// Optional dressing for the existing enclosed hall. The original obstruction
// meshes stay registered; surface offsets resolve the overlapping portal faces.
export function applyPalaceTorchlight(palace){
 const scene=palace.scene,torches=[];
 for(const m of palace.navigationObstacles){
  if(m.name.startsWith('portal_jamb_'))m.scale.z=1.12;
 }
 const stone=new THREE.MeshStandardMaterial({color:'#28232a',roughness:.94});
 const metal=new THREE.MeshStandardMaterial({color:'#72543c',roughness:.52,metalness:.64});
 const back=scene.getObjectByName('palace_inside_back');back.material=stone;
 for(const m of palace.portalSolids)if(m!==back)m.material=stone;
 const dressing=new THREE.Group();dressing.name='torchlit-hall-details';scene.add(dressing);
 const box=(name,size,pos,mat=stone)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.name=name;m.position.set(...pos);m.castShadow=m.receiveShadow=true;dressing.add(m);return m;};
 // Shallow pilasters and wall recess rims become legible only near the lamps.
 for(const sign of [-1,1]){
  for(const z of [-10.9,-12.65]){
   box('hall-pier',[.22,3.75,.28],[sign*2.61,3.38,z]);
   box('hall-pier-cap',[.34,.16,.42],[sign*2.56,5.15,z],metal);
   box('hall-sconce-back',[.075,.52,.20],[sign*2.45,3.35,z],metal);
   box('hall-sconce-arm',[.32,.055,.065],[sign*2.29,3.17,z],metal);
   const cup=new THREE.Mesh(new THREE.CylinderGeometry(.11,.055,.12,12),metal);cup.position.set(sign*2.17,3.21,z);cup.castShadow=true;dressing.add(cup);
   const origin=new THREE.Vector3(sign*2.17,3.29,z),fire=hearthFire(scene,origin);fire.group.name=`wall-torch-${sign}-${z}`;fire.group.scale.setScalar(.43);
   const lamp=new THREE.PointLight('#ffb76c',5,3.7,2);lamp.position.copy(origin).y+=.10;lamp.castShadow=z===-10.9;
   if(lamp.castShadow){lamp.shadow.mapSize.set(512,512);lamp.shadow.camera.near=.08;lamp.shadow.camera.far=4;lamp.shadow.bias=-.0005;lamp.shadow.normalBias=.015;}
   scene.add(lamp);torches.push({fire,lamp,origin,phase:torches.length*2.37});
  }
 }
 for(const y of [1.70,4.55])box('hall-back-course',[5.3,.10,.10],[0,y,-13.44],metal);
 for(const x of [-1.4,0,1.4])box('hall-back-recess',[.055,2.65,.09],[x,3.05,-13.43],metal);
 return {torches,dressing,update(t,camera){
  for(const {fire,lamp,phase} of torches){
   const wave=.70+.16*Math.sin(t*3.1+phase)+.09*Math.sin(t*7.7+phase*1.3)+.05*Math.sin(t*12.9+phase*.7);
   lamp.intensity=5.8*wave;lamp.position.x=Math.sign(lamp.position.x)*2.17+Math.sin(t*3.7+phase)*.018;
   fire.update(t+phase,camera,.55+wave*.40);
  }
 }};
}
