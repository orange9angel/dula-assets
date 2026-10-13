import * as THREE from 'three';
import {ImportedPerformer} from './imported-performer.js';
const Q=()=>new THREE.Quaternion(),V=()=>new THREE.Vector3();
/** Bind-relative world rotation retargeting. Handles exporters that change bone
 * local axes (e.g. Blender), unlike copying raw quaternion tracks by name. */
export class RetargetedMotion {
  static async load(target,url){
    const source=await ImportedPerformer.load(url,target.height),motion=new RetargetedMotion();
    if(!source.clips.length)throw new Error('Motion asset has no animation');
    motion.source=source;motion.target=target;motion.duration=source.clips[0].duration;
    motion.sourceBind={};motion.targetBind={};
    for(const [name,bone] of Object.entries(source.bones))motion.sourceBind[name]=bone.getWorldQuaternion(Q());
    target.reset();for(const [name,bone] of Object.entries(target.bones))motion.targetBind[name]=bone.getWorldQuaternion(Q());
    motion.mixer=new THREE.AnimationMixer(source.model);motion.mixer.clipAction(source.clips[0]).setLoop(THREE.LoopOnce,1).play();
    const action=motion.mixer.existingAction(source.clips[0]);action.clampWhenFinished=true;
    return motion;
  }
  apply(time,weight=1,{include=()=>true,rootMotion=true}={}){
    const a=this.target,s=this.source,base=a.rest.map(([b])=>b.quaternion.clone()),baseHip=a.bones.hips.position.clone();
    this.mixer.setTime(THREE.MathUtils.clamp(time,0,this.duration-.00001));s.mesh.updateMatrixWorld(true);
    const rootQ=a.mesh.getWorldQuaternion(Q());
    for(const [name,bone] of Object.entries(a.bones)){
      if(!s.bones[name]||!include(name))continue;
      const q=s.bones[name].getWorldQuaternion(Q()).multiply(this.sourceBind[name].clone().invert()).multiply(this.targetBind[name]).premultiply(rootQ);
      a.setWorldQuaternion(bone,q);
    }
    const drift=s.bones.hips.getWorldPosition(V()).sub(s.neutral.hips);
    const hipTarget=a.mesh.localToWorld(a.neutral.hips.clone().add(drift));
    if(rootMotion)a.bones.hips.position.copy(a.bones.hips.parent.worldToLocal(hipTarget));
    if(weight<1){a.rest.forEach(([b],i)=>b.quaternion.copy(base[i].slerp(b.quaternion.clone(),weight)));a.bones.hips.position.lerpVectors(baseHip,a.bones.hips.position.clone(),weight);}
    a.mesh.updateMatrixWorld(true);
  }
}
