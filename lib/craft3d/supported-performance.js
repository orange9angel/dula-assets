// Waist-pivot acting with coupled torso/arms and independently planted feet.
// Pure pose application: no integration, accumulated transforms or hidden idle.
import * as THREE from 'three';
const v=p=>new THREE.Vector3(p.x,p.y,p.z??0);
export function torsoFrame({shift=[0,0,0],rotation=[0,0,0],pivot=.86}={}){
  const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation));
  const anchor=new THREE.Vector3(0,pivot,0);
  const position=anchor.clone().sub(anchor.clone().applyQuaternion(q)).add(new THREE.Vector3(...shift));
  return new THREE.Matrix4().compose(position,q,new THREE.Vector3(1,1,1));
}
export function applySupportedPerformance(actor,p){
  // Native limb builders work in the anatomical frame, including sleeve roots.
  actor.setPose({...p,leftArm:p.localArms.left,rightArm:p.localArms.right,bob:0,lean:0});
  const m=torsoFrame(p.torso);
  m.decompose(actor.body.position,actor.body.quaternion,actor.body.scale);
  for(const side of ['left','right']){
    for(const surface of [actor.limbs[side+'Arm'],actor.sleeves[side],actor.sleeves[side+'Roll']]){
      surface.mesh.matrixAutoUpdate=false;surface.mesh.matrix.copy(m);
    }
    const hand=actor.hands[side];hand.updateMatrix();hand.applyMatrix4(m);
    hand.setGesture(p.gestures[side]);
    // Foot orientation is in world space. Turning the pelvis must not skid shoes.
    actor.feet[side].rotation.set(0,p.feet[side].yaw-p.yaw,0);
  }
  actor.mesh.updateMatrixWorld(true);
}
export function transformPoint(point,frame){return v(point).applyMatrix4(frame);}
