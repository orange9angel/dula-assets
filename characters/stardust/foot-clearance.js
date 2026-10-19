import * as THREE from 'three';
const V=p=>new THREE.Vector3(p.x,p.y,p.z??0);
const smooth=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};

// This finite placement adapter is opt-in for the palace's low interaction
// block. Bounds come from actual rendered solids and footwear, not copied sizes.
export function makeFootClearance(actor,solids){
 const box=new THREE.Box3();for(const m of solids){m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m);box.union(b);if(m.userData.clearanceTravel)box.union(b.clone().translate(new THREE.Vector3(...m.userData.clearanceTravel)));}
 const feet={};actor.mesh.updateMatrixWorld(true);
 for(const side of ['left','right']){
  const root=actor.feet[side],bounds=new THREE.Box3(),inv=root.matrixWorld.clone().invert(),q=new THREE.Vector3(),matrix=new THREE.Matrix4();
  root.traverse(m=>{if(!m.isMesh||m.material.side===THREE.BackSide)return;matrix.multiplyMatrices(inv,m.matrixWorld);const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(q.fromBufferAttribute(p,i).applyMatrix4(matrix));});feet[side]=bounds;
 }
 return {box,feet,adjust(end,side,p,pitch=0,yaw=0){
  const sign=side==='left'?-1:1,rot=new THREE.Matrix4().makeRotationY(p.yaw),world=V(end).applyMatrix4(rot).add(new THREE.Vector3(p.rootX,0,p.rootZ));
  const distance=Math.hypot(Math.max(0,box.min.x-world.x,world.x-box.max.x),Math.max(0,box.min.z-world.z,world.z-box.max.z));
  const weight=smooth((.50-distance)/.28)*(1-smooth((world.y-.42)/.18)),targetYaw=sign*.38;
  yaw=THREE.MathUtils.lerp(yaw,targetYaw-p.yaw,weight);
  const orient=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(pitch,p.yaw+yaw,0));
  const extent=feet[side].clone().applyMatrix4(orient);
  // A continuous world-space placement field: a planted source foot maps to a
  // fixed planted result. No enter/exit branch may teleport a swinging foot.
  world.x=THREE.MathUtils.lerp(world.x,(box.min.x+box.max.x)*.5+sign*.16,weight);
  world.z=THREE.MathUtils.lerp(world.z,Math.min(world.z,box.min.z-extent.max.z-.10),weight);
  const local=world.clone().sub(new THREE.Vector3(p.rootX,0,p.rootZ)).applyMatrix4(new THREE.Matrix4().makeRotationY(-p.yaw));
  Object.assign(end,{x:local.x,y:local.y,z:local.z});
  // The knee opens in the same direction as the planted foot during a squat.
  const kneeYaw=sign*1.32;
  const pole=new THREE.Vector3(Math.sin(kneeYaw),0,Math.cos(kneeYaw)).applyMatrix4(new THREE.Matrix4().makeRotationY(-p.yaw));
  return {yaw,pole:V({x:0,y:0,z:1}).lerp(pole,weight),weight};
 }};
}
