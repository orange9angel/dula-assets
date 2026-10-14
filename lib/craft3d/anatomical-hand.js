import * as THREE from 'three';
const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
const clamp=THREE.MathUtils.clamp;

/** Experimental controls. Palm signs are calibrated for the current A-pose;
 * another rig needs a visible palm-side check before reusing these defaults. */
export function calibrateHands(actor,{palmSigns={left:-1,right:1}}={}){
  const records={};
  for(const side of ['left','right']){
    const b=actor.bones,hand=b[side+'hand'];
    const y=actor.neutral[side+'handmiddle1'].clone().sub(actor.neutral[side+'hand']).normalize();
    const radial=actor.neutral[side+'handindex1'].clone().sub(actor.neutral[side+'handpinky1']).normalize();
    const z=radial.cross(y).normalize().multiplyScalar(palmSigns[side]);
    const world=actor.neutralQuaternion[side+'hand'],inverse=world.clone().invert();
    records[side]={hand,forearm:b[side+'forearm'],rest:actor.rest.find(([bone])=>bone===hand)[2].clone(),
      along:y.applyQuaternion(inverse),palm:z.applyQuaternion(inverse)};
  }
  return records;
}

/** Orient the forearm's longitudinal frame, keeping the wrist near its bind
 * pose. Caller supplies a continuously authored physical palm normal. */
export function orientHandWithForearm(actor,side,normal){
  const r=actor.anatomicalHands[side],hand=r.hand,forearm=r.forearm;
  const axis=hand.getWorldPosition(V()).sub(forearm.getWorldPosition(V())).normalize();
  const palm=normal.clone().addScaledVector(axis,-normal.dot(axis));
  if(palm.lengthSq()<1e-5)return;
  palm.normalize();
  const x=axis.clone().cross(palm).normalize();
  const targetFrame=Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,axis,palm));
  const bindAxis=hand.position.clone().normalize(),bindPalm=r.palm.clone().applyQuaternion(r.rest);
  bindPalm.addScaledVector(bindAxis,-bindPalm.dot(bindAxis)).normalize();
  const bindFrame=Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(bindAxis.clone().cross(bindPalm).normalize(),bindAxis,bindPalm));
  actor.setWorldQuaternion(forearm,targetFrame.multiply(bindFrame.invert()));
  hand.quaternion.copy(r.rest);actor.mesh.updateMatrixWorld(true);
}

/** Bend stays at the wrist; pronation is shared with the forearm. This finite
 * pose controller preserves the wrist target, but still requires surface QA. */
export function aimAnatomicalHand(actor,side,normal,direction,amount=1,{maxBend=.85}={}){
  const r=actor.anatomicalHands[side],hand=r.hand;
  const restWorld=hand.parent.getWorldQuaternion(Q()).multiply(r.rest);
  const natural=r.along.clone().applyQuaternion(restWorld).normalize();
  const requested=direction.clone().normalize();
  // A pose may request a direction behind the wrist. Keep a bounded bend and
  // let the shot's arm target/pole provide the remaining change in orientation.
  const angle=natural.angleTo(requested),swing=Q().setFromUnitVectors(natural,requested);
  swing.slerp(Q(),1-Math.min(1,maxBend/Math.max(angle,1e-8)));
  const desiredAlong=natural.clone().applyQuaternion(swing);
  const basePalm=r.palm.clone().applyQuaternion(restWorld).applyQuaternion(swing);
  const wantPalm=normal.clone().addScaledVector(desiredAlong,-normal.dot(desiredAlong));
  if(wantPalm.lengthSq()<1e-8)wantPalm.copy(basePalm);wantPalm.normalize();
  let roll=Math.atan2(desiredAlong.dot(basePalm.clone().cross(wantPalm)),basePalm.dot(wantPalm));
  roll=clamp(roll,-2.1,2.1);
  const target=Q().setFromAxisAngle(desiredAlong,roll).multiply(swing).multiply(restWorld);
  const desired=hand.getWorldQuaternion(Q()).slerp(target,clamp(amount,0,1));
  actor.setWorldQuaternion(hand,desired);
  distributeWristTwist(actor,side);
}

export function distributeWristTwist(actor,side,{maxSwing=.9,maxTwist=.32,share=.86}={}){
  const r=actor.anatomicalHands[side],hand=r.hand,axis=r.along;
  const delta=r.rest.clone().invert().multiply(hand.quaternion);
  const projection=delta.x*axis.x+delta.y*axis.y+delta.z*axis.z;
  const twist=new THREE.Quaternion(axis.x*projection,axis.y*projection,axis.z*projection,delta.w).normalize();
  if(twist.w<0)twist.set(-twist.x,-twist.y,-twist.z,-twist.w);
  const signed=2*Math.atan2(twist.x*axis.x+twist.y*axis.y+twist.z*axis.z,twist.w);
  const swing=delta.clone().multiply(twist.clone().invert());
  const swingAngle=2*Math.acos(clamp(Math.abs(swing.w),0,1));
  if(swingAngle>maxSwing)swing.slerp(Q(),1-maxSwing/swingAngle);
  const transfer=clamp(signed*share,-1.25,1.25);
  const foreAxis=hand.getWorldPosition(V()).sub(r.forearm.getWorldPosition(V())).normalize();
  const world=hand.getWorldQuaternion(Q());
  actor.setWorldQuaternion(r.forearm,Q().setFromAxisAngle(foreAxis,transfer).multiply(r.forearm.getWorldQuaternion(Q())));
  actor.setWorldQuaternion(hand,world);
  // Recompute after moving the parent, then keep a small residual axial turn.
  const after=r.rest.clone().invert().multiply(hand.quaternion),pr=after.x*axis.x+after.y*axis.y+after.z*axis.z;
  const tw=new THREE.Quaternion(axis.x*pr,axis.y*pr,axis.z*pr,after.w).normalize();
  if(tw.w<0)tw.set(-tw.x,-tw.y,-tw.z,-tw.w);
  const residual=clamp(2*Math.atan2(tw.x*axis.x+tw.y*axis.y+tw.z*axis.z,tw.w),-maxTwist,maxTwist);
  hand.quaternion.copy(r.rest).multiply(swing).multiply(Q().setFromAxisAngle(axis,residual));
  actor.mesh.updateMatrixWorld(true);
}
