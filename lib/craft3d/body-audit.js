// Shared rendered-surface torso audit. Attachment exclusion belongs to the
// actual sleeve root metadata; hands receive no shoulder exemption.
import * as THREE from 'three';
import {MeshVolume,surfacePenetration} from 'dula-engine/lib/MeshCollision.js';
export function createBodyAudit(actors){
  const volumes=Object.fromEntries(Object.entries(actors).map(([key,a])=>[key,new MeshVolume(a.torso,{capRings:true})]));
  return poses=>{
    const pairs={};
    for(const [key,actor] of Object.entries(actors)){
      if(!actor.mesh.visible)throw new Error(`Required actor hidden: ${key}`);
      for(const side of ['left','right']){
        const arm=poses[key][side+'Arm'],shoulder=actor.mesh.localToWorld(new THREE.Vector3(arm[0].x,arm[0].y,arm[0].z));
        const surfaces=[actor.limbs[side+'Arm'],actor.sleeves[side],actor.sleeves[side+'Roll']];
        surfaces.forEach((s,i)=>{s.mesh.name=`${key}:${side}:${['skin','sleeve','cuff'][i]}`;});
        pairs[`${key}:${side}:torso`]=surfacePenetration(surfaces.map(s=>s.mesh),volumes[key],{
          exclude:(point,mesh,id)=>mesh.userData.attachmentRings
            ?id<mesh.userData.attachmentRings*surfaces.find(s=>s.mesh===mesh).sides:point.distanceTo(shoulder)<.06,
        });
        const hands=[];actor.hands[side].traverseVisible(o=>{if(o.isMesh&&o.material.side!==THREE.BackSide)hands.push(o);});
        pairs[`${key}:${side}:hand_torso`]=surfacePenetration(hands,volumes[key]);
      }
    }
    return {pairs,coverage:'actual arm/sleeve/hand vertices; attachment metadata; no full solid or continuous collision guarantee'};
  };
}
