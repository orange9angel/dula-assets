import * as THREE from 'three';

/** Small bind-space ponytail bends on head-weighted vertices. The caller supplies
 * deterministic lag angles; no simulation state survives a frame or seek. */
export function addSecondaryHair(actor,{pivot=[.075,1.57,-.07],maxAngle=.07}={}){
  const records=[],origin=new THREE.Vector3(...pivot),delta=new THREE.Vector3(),point=new THREE.Vector3();
  let selectedVertices=0,maxDisplacement=0;
  for(const mesh of actor.skins){
    const g=mesh.geometry,p=g.attributes.performerRest,j=g.attributes.skinIndex,w=g.attributes.skinWeight;
    const names=mesh.skeleton.bones.map(b=>b.name.toLowerCase());
    const arrays=[new Float32Array(p.count*3),new Float32Array(p.count*3)];
    const inverse=new THREE.Matrix3().setFromMatrix4(mesh.matrixWorld).invert();
    for(let i=0;i<p.count;i++){
      const ids=[j.getX(i),j.getY(i),j.getZ(i),j.getW(i)],weights=[w.getX(i),w.getY(i),w.getZ(i),w.getW(i)];
      const headWeight=weights.reduce((s,v,k)=>s+(names[ids[k]].includes('head')?v:0),0);
      point.fromBufferAttribute(p,i);
      const mask=THREE.MathUtils.smoothstep(point.x,.07,.14)*(1-THREE.MathUtils.smoothstep(point.z,.01,.07))*(1-THREE.MathUtils.smoothstep(point.y,1.13,1.57));
      if(headWeight<.65||mask<.001||point.y<1.08)continue;
      selectedVertices++;
      for(let k=0;k<2;k++){
        const axis=k===0?new THREE.Vector3(0,0,1):new THREE.Vector3(1,0,0);
        delta.copy(point).sub(origin).applyAxisAngle(axis,maxAngle*mask).add(origin).sub(point);
        maxDisplacement=Math.max(maxDisplacement,delta.length());delta.applyMatrix3(inverse).toArray(arrays[k],i*3);
      }
    }
    const start=g.morphAttributes.position.length,weights=mesh.morphTargetInfluences.slice();
    arrays.forEach((array,k)=>{const attr=new THREE.BufferAttribute(array,3);attr.name=k===0?'ponytailSide':'ponytailDepth';g.morphAttributes.position.push(attr);});
    mesh.updateMorphTargets();weights.forEach((v,i)=>mesh.morphTargetInfluences[i]=v);records.push({mesh,start});
  }
  return {selectedVertices,maxDisplacement,
    apply(sideAngle,depthAngle){const values=[sideAngle,depthAngle].map(x=>THREE.MathUtils.clamp(x/maxAngle,-1,1));
      for(const {mesh,start} of records)values.forEach((v,i)=>mesh.morphTargetInfluences[start+i]=v);return values;}
  };
}
