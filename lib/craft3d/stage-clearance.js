import * as THREE from 'three';
import {visibleVertexIndices} from 'dula-engine/lib/MeshCollision.js';

const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const gap=(a,b)=>Math.hypot(Math.max(0,a.min.x-b.max.x,b.min.x-a.max.x),Math.max(0,a.min.y-b.max.y,b.min.y-a.max.y),Math.max(0,a.min.z-b.max.z,b.min.z-a.max.z));

/** Sampled final rendered triangles against real BoxGeometry stage solids.
 * AABB is only a broad-phase: overlap triggers transformed triangle/box SAT.
 * Includes weapons/armor/cape; excludes non-solid glow and duplicate ink shells.
 * This is NOT continuous-time collision detection or actor self collision. */
export function createStageClearance(actors,obstacles,{tolerance=.001}={}){
 if(!obstacles.length)throw new Error('Missing navigation solids');
 const ids=obstacles.map(m=>m.name);if(new Set(ids).size!==ids.length)throw new Error('Duplicate stage obstacle');
 const solids=obstacles.map(mesh=>{
  if(mesh.geometry.type!=='BoxGeometry')throw new Error('Stage box audit does not support '+mesh.geometry.type);
  mesh.geometry.computeBoundingBox();return{mesh,local:mesh.geometry.boundingBox.clone(),world:new THREE.Box3(),inverse:new THREE.Matrix4()};
 });
 const shapeVersions=new WeakMap(),tri=new THREE.Triangle(),v=new THREE.Vector3(),matrix=new THREE.Matrix4();
 return {ids,sample(){
  const result={obstacles:ids.length,actors:0,pairs:0,broadSeparated:0,narrowPairs:0,triangles:0,vertices:0,maxDepth:0,collisions:[],minBroadGap:Infinity};
  for(const s of solids){s.mesh.updateWorldMatrix(true,false);s.world.copy(s.local).applyMatrix4(s.mesh.matrixWorld);s.inverse.copy(s.mesh.matrixWorld).invert();}
  for(const [name,actor] of Object.entries(actors)){
   if(!visible(actor.mesh))continue;result.actors++;actor.mesh.updateMatrixWorld(true);
   const meshes=[],bounds=new THREE.Box3();
   actor.mesh.traverse(mesh=>{
    if(!mesh.isMesh||!visible(mesh)||mesh.material?.side===THREE.BackSide||mesh.material?.depthWrite===false)return;
    const g=mesh.geometry,p=g.attributes.position;if(!p)throw new Error('Missing actor positions');
    if(mesh.isSkinnedMesh){mesh.skeleton.update();mesh.computeBoundingBox();}
    else if(shapeVersions.get(g)!==p.version){g.computeBoundingBox();shapeVersions.set(g,p.version);}
    const box=(mesh.isSkinnedMesh?mesh.boundingBox:g.boundingBox).clone().applyMatrix4(mesh.matrixWorld);bounds.union(box);meshes.push({mesh,box});
   });
   if(!meshes.length||bounds.isEmpty())throw new Error('Missing actor surface: '+name);
   for(const s of solids){
    result.pairs++;const d=gap(bounds,s.world);result.minBroadGap=Math.min(result.minBroadGap,d);
    if(d>0){result.broadSeparated++;continue;}
    result.narrowPairs++;let crossings=0,depth=0,part=null;
    const local=s.local.clone().expandByScalar(-tolerance);
    for(const {mesh,box} of meshes){
     if(!box.intersectsBox(s.world))continue;
     matrix.multiplyMatrices(s.inverse,mesh.matrixWorld);
     const g=mesh.geometry,p=g.attributes.position,ix=g.index,end=Math.min(ix?ix.count:p.count,g.drawRange.start+g.drawRange.count);
     for(const i of visibleVertexIndices(mesh)){
      mesh.getVertexPosition(i,v).applyMatrix4(matrix);result.vertices++;
      if(![v.x,v.y,v.z].every(Number.isFinite))throw new Error('Non-finite actor surface');
      if(local.containsPoint(v)){const dd=Math.min(v.x-s.local.min.x,s.local.max.x-v.x,v.y-s.local.min.y,s.local.max.y-v.y,v.z-s.local.min.z,s.local.max.z-v.z);if(dd>depth){depth=dd;part=mesh.name||g.type;}}
     }
     for(let i=g.drawRange.start;i+2<end;i+=3){
      [tri.a,tri.b,tri.c].forEach((pt,j)=>mesh.getVertexPosition(ix?ix.getX(i+j):i+j,pt).applyMatrix4(matrix));result.triangles++;
      if(local.intersectsTriangle(tri)){crossings++;part??=mesh.name||g.type;}
     }
    }
    if(crossings||depth>tolerance)result.collisions.push({actor:name,obstacle:s.mesh.name,triangles:crossings,depth,part});
    result.maxDepth=Math.max(result.maxDepth,depth);
   }
  }
  if(!Number.isFinite(result.minBroadGap)||!result.pairs)throw new Error('Empty stage audit');
  return result;
 }};
}
