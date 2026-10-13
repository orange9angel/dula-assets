import * as THREE from 'three';
/** Representative render vertices, deduplicated in bind space. This deliberately
 * reports sampled coverage, not continuous mesh/mesh collision certification. */
export function makeSkinnedSamples(actor,spacing=.009){
  const parts={leftHand:[],rightHand:[],leftArm:[],rightArm:[],leftFoot:[],rightFoot:[]};
  for(const mesh of actor.skins){
    const p=mesh.geometry.attributes.performerRest,j=mesh.geometry.attributes.skinIndex,w=mesh.geometry.attributes.skinWeight;
    const names=mesh.skeleton.bones.map(b=>b.name.toLowerCase()),seen={};for(const k in parts)seen[k]=new Set();
    for(let i=0;i<p.count;i++){
      const ids=[j.getX(i),j.getY(i),j.getZ(i),j.getW(i)],weights=[w.getX(i),w.getY(i),w.getZ(i),w.getW(i)];
      for(const side of ['left','right']){
        for(const part of ['Hand','Arm','Foot']){
          const match=n=>n.includes(side)&&(part==='Hand'?n.includes('hand'):part==='Arm'?/arm/.test(n):/foot|toe/.test(n));
          const weight=weights.reduce((s,v,k)=>s+(match(names[ids[k]])?v:0),0);if(weight<.65)continue;
          const k=side+part,grid=[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x/spacing)).join(',');
          if(seen[k].has(grid))continue;seen[k].add(grid);parts[k].push([mesh,i]);
        }
      }
    }
  }
  if(Object.values(parts).some(p=>!p.length))throw new Error('Missing sampled anatomical part');
  const point=new THREE.Vector3();
  return {spacing,counts:Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,v.length])),
    sample(selected=null){actor.mesh.updateMatrixWorld(true);actor.skins.forEach(m=>m.skeleton.update());
      return Object.fromEntries(Object.entries(parts).filter(([name])=>!selected||selected.includes(name)).map(([name,points])=>[name,points.map(([mesh,i])=>mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld).clone())]));}
  };
}
