import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {twoBone} from './pose.js';

const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
const key=n=>n.replace(/[^a-z0-9]/gi,'').toLowerCase().replace(/^mixamorig/,'');

/** Imported humanoid in metres, with deterministic bind-pose reset and world IK. */
export class ImportedPerformer {
  static async load(url,height){
    const gltf=await new GLTFLoader().loadAsync(url),a=new ImportedPerformer();
    a.mesh=new THREE.Group();a.model=gltf.scene;a.mesh.add(a.model);a.bones={};a.skins=[];a.rest=[];
    a.model.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.pose();a.skins.push(o);}});
    a.model.updateMatrixWorld(true);a.skins.forEach(o=>o.computeBoundingBox());
    const box=new THREE.Box3().setFromObject(a.model),center=box.getCenter(V()),scale=height/box.getSize(V()).y;
    a.model.scale.multiplyScalar(scale);a.model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
    a.mesh.updateMatrixWorld(true);
    a.model.traverse(o=>{
      if(o.isBone){a.bones[key(o.name)]=o;a.rest.push([o,o.position.clone(),o.quaternion.clone(),o.scale.clone()]);}
      if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.material=o.material.clone();o.material.map.anisotropy=8;}
    });
    for(const o of a.skins){
      const pos=o.geometry.attributes.position,rest=new Float32Array(pos.count*3);
      for(let i=0;i<pos.count;i++){const p=V().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);p.toArray(rest,i*3);}
      o.geometry.setAttribute('performerRest',new THREE.BufferAttribute(rest,3));
    }
    a.height=height;a.scale=scale;a.clips=gltf.animations;a.hands={};
    for(const side of ['left','right'])a.hands[side]=a.bones[side+'hand'];
    a.neutral={};a.neutralQuaternion={};for(const [name,bone] of Object.entries(a.bones)){a.neutral[name]=bone.getWorldPosition(V());a.neutralQuaternion[name]=bone.getWorldQuaternion(Q());}
    a.reset();return a;
  }
  reset(){for(const [b,p,q,s] of this.rest){b.position.copy(p);b.quaternion.copy(q);b.scale.copy(s);}this.mesh.updateMatrixWorld(true);}
  aim(bone,child,target){
    this.mesh.updateMatrixWorld(true);
    const origin=bone.getWorldPosition(V()),old=child.getWorldPosition(V()).sub(origin).normalize();
    const q=Q().setFromUnitVectors(old,target.clone().sub(origin).normalize()).multiply(bone.getWorldQuaternion(Q()));
    bone.quaternion.copy(bone.parent.getWorldQuaternion(Q()).invert().multiply(q));this.mesh.updateMatrixWorld(true);
  }
  rotateLocalFrame(bone,euler){
    this.mesh.updateMatrixWorld(true);
    const rootQ=this.mesh.getWorldQuaternion(Q()),delta=Q().setFromEuler(new THREE.Euler(...euler));
    delta.premultiply(rootQ).multiply(rootQ.clone().invert());
    const world=bone.getWorldQuaternion(Q()).premultiply(delta);
    bone.quaternion.copy(bone.parent.getWorldQuaternion(Q()).invert().multiply(world));this.mesh.updateMatrixWorld(true);
  }
  setWorldQuaternion(bone,q){bone.quaternion.copy(bone.parent.getWorldQuaternion(Q()).invert().multiply(q));this.mesh.updateMatrixWorld(true);}
  restrictInfluences({min,max,allow,fallback='hips',maxAlbedoLuma=null}){
    let changed=0;
    for(const mesh of this.skins){const p=mesh.geometry.attributes.performerRest,j=mesh.geometry.attributes.skinIndex,w=mesh.geometry.attributes.skinWeight;
      const names=mesh.skeleton.bones.map(b=>key(b.name)),fallbackIndex=names.indexOf(fallback);
      if(fallbackIndex<0)throw new Error('Missing fallback bone '+fallback);
      let pixels=null,width=0,height=0;
      const map=mesh.material.map,uv=mesh.geometry.attributes.uv,texel=new THREE.Vector2();
      if(maxAlbedoLuma!==null){
        if(!map?.image||!uv)throw new Error('Cloth palette selection requires albedo and UV');
        const canvas=document.createElement('canvas');width=canvas.width=map.image.width;height=canvas.height=map.image.height;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(map.image,0,0);pixels=ctx.getImageData(0,0,width,height).data;
      }
      for(let i=0;i<p.count;i++){
        if(p.getX(i)<min[0]||p.getX(i)>max[0]||p.getY(i)<min[1]||p.getY(i)>max[1]||p.getZ(i)<min[2]||p.getZ(i)>max[2])continue;
        if(pixels){
          texel.fromBufferAttribute(uv,i);map.transformUv(texel);
          const offset=(Math.min(height-1,Math.floor(texel.y*height))*width+Math.min(width-1,Math.floor(texel.x*width)))*4;
          if((.299*pixels[offset]+.587*pixels[offset+1]+.114*pixels[offset+2])/255>maxAlbedoLuma)continue;
        }
        const ids=[j.getX(i),j.getY(i),j.getZ(i),j.getW(i)],weights=[w.getX(i),w.getY(i),w.getZ(i),w.getW(i)];let dirty=false;
        for(let k=0;k<4;k++)if(weights[k]>0&&!allow(names[ids[k]])){weights[k]=0;dirty=true;}
        if(!dirty)continue;changed++;const sum=weights.reduce((a,b)=>a+b,0);
        if(sum<1e-6){j.setXYZW(i,fallbackIndex,0,0,0);w.setXYZW(i,1,0,0,0);}else w.setXYZW(i,...weights.map(x=>x/sum));
      }j.needsUpdate=true;w.needsUpdate=true;
    }return changed;
  }
  solve(chain,target,pole){
    const [b,e,w]=chain.map(n=>this.bones[n]);if(!b||!e||!w)return;
    this.mesh.updateMatrixWorld(true);
    const p=b.getWorldPosition(V()),el=e.getWorldPosition(V()),wr=w.getWorldPosition(V());
    const l1=p.distanceTo(el),l2=el.distanceTo(wr),end=target.clone();
    if(end.distanceTo(p)>l1+l2-.0005)end.sub(p).setLength(l1+l2-.0005).add(p);
    const mid=twoBone(p,end,pole,l1,l2);this.aim(b,e,new THREE.Vector3(mid.x,mid.y,mid.z));this.aim(e,w,end);
    return {requested:target.toArray(),actual:w.getWorldPosition(V()).toArray(),error:w.getWorldPosition(V()).distanceTo(target)};
  }
  info(){return {height:this.height,scale:this.scale,bones:Object.fromEntries(Object.entries(this.neutral).map(([k,p])=>[k,p.toArray()])),meshes:this.skins.map(m=>({name:m.name,vertices:m.geometry.attributes.position.count,matrix:m.matrixWorld.elements}))};}
}
