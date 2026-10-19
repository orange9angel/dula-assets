import * as THREE from 'three';
import {twoBone} from '../../lib/craft3d/pose.js';
import {createLocomotion} from '../../lib/craft3d/locomotion.js';
const WALK_GAIT=createLocomotion({hipDelta:.040,lift:.068});
const RUN_GAIT=createLocomotion({hipDelta:.050,lift:.105,sway:.022,armSwingGain:.30,armSwingMax:.16,heelStrike:.30,toeOff:.30});
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,u)=>a+(b-a)*u,V=(x,y,z=0)=>({x,y,z});
export function buildPose(actor,s,t,d){
  // Derive neutral height from THIS actor's bone lengths: 172-degree knees.
  // A copied offset left the new long-legged enemy standing at 120 degrees.
  const hipIdle=d.hipIdle,half=d.hipHalf*1.15;
  const restReach=(d.legA+d.legB)*Math.cos(4*Math.PI/180);
  const restHip=d.footY+Math.sqrt(restReach**2-(half-d.hipHalf)**2);
  const st=restHip-hipIdle;
  let hipY=hipIdle+s.bob+st;
  const p={rootX:s.rootX,rootZ:s.rootZ,yaw:s.yaw,bob:s.bob+st,lean:s.lean,
    headYaw:s.headYaw,headPitch:s.headPitch,headRoll:s.headRoll,
    fist:s.fist,open:s.open,point:s.point,blink:s.blink,capeLift:s.capeLift??0,crouch:s.sit?.drop??0};
  let locomotion=null;
  if(s.walk||s.turn){
    const G=!s.turn&&s.walk.run?RUN_GAIT:WALK_GAIT;
    const gait=s.turn?WALK_GAIT.turningFeet(s.turn,s.rootX,s.rootZ,s.yaw,half,d.footY)
      :G.walkingFeet({...s.walk,facingYaw:s.walk.facingYaw??s.yaw},s.rootX,s.rootZ,s.yaw,half,d.footY,(d.legA+d.legB)*.75);
    // Foot roll resolves to flat soles at both finite-path endpoints.
    const settle=s.walk?ease(s.walk.a/.06)*ease((1-s.walk.a)/.10):1;
    for(const side of ['left','right']){
      const f=gait[side],oldPitch=f.pitch;
      f.pitch*=settle;
      f.y+=Math.sin(Math.abs(f.pitch))*(f.pitch<0?.08:.17)-Math.sin(Math.abs(oldPitch))*(oldPitch<0?.08:.17);
    }
    const heading=s.turn?s.yaw:(s.walk.facingYaw??s.yaw);
    p.rootX=s.rootX+Math.cos(heading)*gait.sway;p.rootZ=s.rootZ-Math.sin(heading)*gait.sway;
    if(actor.footClearance)for(const side of ['left','right']){const f=gait[side],fit=actor.footClearance.adjust(f,side,p,f.pitch,f.yaw);f.yaw=fit.yaw;f.kneePole=fit.pole;}
    hipY=hipIdle+st+s.bob-(s.sit?.drop??0)+gait.hipDelta-(s.tuck??0)*.1;
    for(const [side,sign] of [['left',-1],['right',1]]){
      const f=gait[side],horizontal=(f.x-sign*d.hipHalf)**2+f.z*f.z;
      hipY=Math.min(hipY,f.y+Math.sqrt(Math.max(.01,(d.legA+d.legB-mix(.0015,.008,settle))**2-horizontal)));
    }
    for(const [side,sign] of [['left',-1],['right',1]]){
      const f=gait[side],start=V(sign*d.hipHalf,hipY,0),end=V(f.x,f.y,f.z+(s.tuck??0)*.3);
      try{p[side+'Leg']=[start,twoBone(start,end,f.kneePole??V(0,0,1),d.legA,d.legB),end];}
      catch(e){throw new Error(`leg[${side}] hip=${start.y.toFixed(3)} foot=(${end.x.toFixed(2)},${end.y.toFixed(2)},${end.z.toFixed(2)}) ${e.message}`);} // 腿长帽撞线时的真值
      p[side+'FootPitch']=f.pitch;p[side+'FootYaw']=f.yaw;
    }
    p.bob=hipY-hipIdle;
    locomotion={kind:s.turn?'turn':'walk',step:gait.step,steps:gait.steps,bob:p.bob,
      root:[p.rootX,0,p.rootZ],feet:Object.fromEntries(['left','right'].map(side=>[side,
        {stance:gait[side].stance,contact:gait[side].contact}]))};
    for(const [side,sign] of [['left',-1],['right',1]]){
      const shoulder=V(sign*d.shoulderHalf,d.shoulderY+p.bob,0);
      const hand={...s[side]};
      if(!s.turn&&!s.noSwing){
        const dy=s[side].y-d.shoulderY,horiz0=Math.hypot(s[side].x-sign*d.shoulderHalf,s[side].z);
        const hangDeg=Math.atan2(horiz0,Math.max(.01,-dy))*180/Math.PI;
        const swingWeight=clamp((32-hangDeg)/18);
        hand.z+=(side==='right'?1:-1)*gait.armSwing*swingWeight;
        hand.y+=Math.abs(gait.armSwing)*(s.walk.run?.45:.20)*swingWeight;
      }
      const target=V(hand.x,hand.y+p.bob,hand.z);
      const delta=new THREE.Vector3(target.x-shoulder.x,target.y-shoulder.y,target.z-shoulder.z);
      const maxR=d.armA+d.armB-.005;
      if(delta.length()>maxR){delta.setLength(maxR);Object.assign(target,V(shoulder.x+delta.x,shoulder.y+delta.y,shoulder.z+delta.z));}
      p[side+'Arm']=[shoulder,twoBone(shoulder,target,V(sign*.25,-.65,-.5),d.armA,d.armB),target];
    }
  }else{
    const tuck=s.tuck??0;
    const planted=end=>{if(s.supportShift){const {x,z}=s.supportShift;end.x+=-Math.cos(s.yaw)*x+Math.sin(s.yaw)*z;end.z+=-Math.sin(s.yaw)*x-Math.cos(s.yaw)*z;}return end;};
    if(s.sit){
      hipY=hipIdle+s.bob+st-s.sit.drop;
      p.bob=s.bob+st-s.sit.drop;
    }
    // R16 站直：腿长帽细化到脚位水平距（epsilon .003 留膝向 slack），挺身被帽收成微屈不抛错
    const ends={},fits={};
    // A deep squat folds at the hips: move the pelvis behind the low block
    // while the chest and working shield keep their established contact pose.
    const retreat=actor.footClearance&&s.sit?ease(s.sit.drop/.40)*.25:0;
    const shift=V(Math.sin(p.yaw)*retreat,0,-Math.cos(p.yaw)*retreat);
    p.pelvisOffset=shift;
    for(const [side,sign] of [['left',-1],['right',1]]){
      const end=ends[side]=planted(s.sit&&!actor.footClearance?V(sign*.13,d.footY,s.sit.feet):V(sign*half,d.footY+tuck,-.4*tuck));
      if(actor.footClearance){fits[side]=actor.footClearance.adjust(end,side,p);p[side+'FootYaw']=fits[side].yaw;}
      hipY=Math.min(hipY,end.y+Math.sqrt(Math.max(.01,(d.legA+d.legB-.003)**2-((end.x-sign*d.hipHalf)**2+end.z*end.z))));
    }
    p.bob=hipY-hipIdle;
    for(const [side,sign] of [['left',-1],['right',1]]){
      const end=ends[side];
      p[side+'Leg']=[V(sign*d.hipHalf+shift.x,hipY,shift.z),null,end];
    }
    for(const [side,sign] of [['left',-1],['right',1]]){
      const leg=p[side+'Leg'];leg[1]=twoBone(leg[0],leg[2],fits[side]?.pole??V(0,0,1),d.legA,d.legB);
      const shoulder=V(sign*d.shoulderHalf,d.shoulderY+p.bob,0),target=V(s[side].x,s[side].y+p.bob,s[side].z);
      const delta=new THREE.Vector3(target.x-shoulder.x,target.y-shoulder.y,target.z-shoulder.z);
      const maxR=d.armA+d.armB-.005;
      if(delta.length()>maxR){delta.setLength(maxR);Object.assign(target,V(shoulder.x+delta.x,shoulder.y+delta.y,shoulder.z+delta.z));}
      p[side+'Arm']=[shoulder,twoBone(shoulder,target,V(sign*.25,-.65,-.5),d.armA,d.armB),target];
    }
  }
  if(p.blink==null)p.blink=Math.max(0,1-Math.abs((t%3.7)-3.4)/.12);
  actor.setCladState(s.cladT);
  actor.setPose(p);
  actor.mesh.visible=s.visible!==false;
  actor.mesh.position.y=s.air??0;
  return {...p,locomotion};
}

