import * as THREE from 'three';
import {closedShell} from './sculpted-clad.js';

const mix=THREE.MathUtils.lerp;
function metal(parent,geometry,color,name){
 const m=new THREE.Mesh(geometry,new THREE.MeshToonMaterial({color}));m.name=name;
 m.userData.palaceMetal=true;m.userData.polishedArmor=true;m.userData.gauntletPlate=true;
 m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function line(parent,points,color,name,r=.0013){
 return metal(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),28,r,6,false),color,name);
}

/** Fitted armor uses the existing hand frame and finger bones. The shield and
 * weapons retain their original forearm rigs and contact coordinates. */
export function applyPalaceGauntlets(actor,{distinct=false,signature=false}={}){
 const fire=actor.palaceKind==='aoao',main=fire?'#d9b16b':'#8490b1',edge=fire?'#f1d69b':'#d0dce9';
 const records={};
 for(const old of actor.palaceFins??[])old.removeFromParent();actor.palaceFins=[];
 for(const side of ['left','right']){
  const hand=actor.hands[side],s=hand.sign,hs=hand.scale.x;
  actor.forearmShells[side].visible=false;
  // Material is local to this hand: never recolor the shared skin/face material.
  hand.surface.material=new THREE.MeshStandardMaterial({color:fire?'#453a2c':'#282c3b',roughness:.78,metalness:.05});
  const root=new THREE.Group();root.name='articulated-gauntlet-'+side;hand.add(root);
  const forearm=new THREE.Group();root.add(forearm);
  const foreSurface=(u,v)=>{
   const a=-.88+v*(Math.PI+1.76),r=(mix(.057,.0255,u)+.006*Math.sin(Math.PI*u))*(signature?(fire?1+.15*(1-u):.94):1);
   const cuff=.0025*Math.exp(-Math.pow((u-.95)/.06,2));
   const blade=distinct&&!fire?.016*Math.pow(Math.max(0,Math.sin(a)),10)*Math.sin(Math.PI*u):0;
   const flare=distinct&&!fire?(signature?.065:.035)*(1-u)**5*Math.pow(Math.max(0,Math.sin(a)),6):0;
   return new THREE.Vector3((-.20*(1-u)-flare)/hs,(r+cuff)*Math.cos(a)/hs,-s*(r*(distinct&&!fire?.78:.88)+cuff+blade)*Math.sin(a)/hs);
  };
  const bracer=metal(forearm,closedShell(foreSurface,s,.003/hs,28,36),main,'gauntlet-'+side+'-forearm');
  const innerSurface=(u,v)=>{
   const a=mix(Math.PI+.82,Math.PI*2-.82,v),q=foreSurface(u,(a+.88)/(Math.PI+1.76));
   q.y*=.978;q.z*=.978;return q;
  };
  metal(forearm,closedShell(innerSurface,s,.0025/hs,28,18),fire?'#b79459':'#616d8a','gauntlet-'+side+'-inner-forearm');
  // A long dorsal ridge and a shallow V end describe the taper, not loose rings.
  line(forearm,Array.from({length:23},(_,i)=>foreSurface(.07+i/22*.87,.5).add(new THREE.Vector3(0,0,-s*.001/hs))),edge,'gauntlet-dorsal-ridge',.0015/hs);
  const wristPts=Array.from({length:31},(_,i)=>foreSurface(.975,i/30));
  line(forearm,wristPts,edge,'gauntlet-integrated-cuff',.0015/hs);
  // Three low overlapping heat vents keep the established breakaway-fin beat.
  for(let k=0;k<3;k++){
   const u0=.20+k*.155;
   const surface=(u,v)=>foreSurface(u0+u*.10,.16+v*.20).add(new THREE.Vector3(0,.001/hs,-s*.002/hs));
   const fin=metal(forearm,closedShell(surface,s,.0015/hs,8,10),main,'gauntlet-vent-'+side+'-'+k);
   actor.palaceFins.push(fin);
  }
  // Palm +X = fingers, sign*Z = palm. The dorsal cap therefore faces -sign*Z.
  const palmSurface=(u,v)=>{
   const a=-.12+v*(Math.PI+.24),w=mix(.024,.034,u)*(1-.07*Math.pow(u,5))*(signature?(fire?1.12:1-.18*u):1);
   const h=.0215+(distinct&&!fire?.012:.0035)*Math.sin(Math.PI*u);
   return new THREE.Vector3(-.010+.067*u,w*Math.cos(a),-s*h*Math.sin(a));
  };
  const palm=metal(root,closedShell(palmSurface,s,.0023,22,28),edge,'gauntlet-'+side+'-handback');
  if(signature&&fire)for(const u of [.40,.62,.83])line(root,Array.from({length:22},(_,i)=>palmSurface(u,i/21).add(new THREE.Vector3(0,0,-s*.001))),main,'rounded-knuckle-bridge',.0014);
  if(signature&&!fire)for(const v of [.25,.75])line(forearm,Array.from({length:28},(_,i)=>foreSurface(.08+i/27*.83,v+(i/27)*(.5-v)*.75)),edge,'blade-gauntlet-chevron',.0018/hs);
  if(distinct&&fire){
   const crest=metal(root,new THREE.SphereGeometry(.012,24,16),main,'hearth-gauntlet-round-boss');crest.scale.set(1,1,.32);crest.position.set(.028,0,-s*.026);
  }
  for(const v of [.29,.71])line(root,Array.from({length:15},(_,i)=>palmSurface(.24+i/14*.66,v).add(new THREE.Vector3(0,0,-s*.0007))),main,'handback-tendon',.0007);
  const fingers=[];
  for(const chain of hand.chains){
   let acc=0;const total=chain.lengths.reduce((a,b)=>a+b,0);
   chain.bones.forEach((bone,j)=>{
    const len=chain.lengths[j],radius=chain.radius*(1-.28*acc/total)+.0015;
    const fingerSurface=(u,v)=>{
     const a=-1.30+v*(Math.PI+2.6),r=radius*(1-.10*u)+.0005*Math.sin(Math.PI*u);
     return new THREE.Vector3(.0015+(len-.003)*u,r*Math.cos(a),-s*r*Math.sin(a));
    };
    const plate=metal(bone,closedShell(fingerSurface,s,.0012,8,14),j===0?edge:main,`gauntlet-${side}-${chain.name}-${j}`);
    if(j===chain.bones.length-1){
     const tip=metal(plate,new THREE.SphereGeometry(radius*.92,16,12),main,`gauntlet-${side}-${chain.name}-tip`);
     tip.position.x=len+.0003;tip.scale.set(.94,1,.95);
    }
    plate.userData.gauntletFinger={digit:chain.name,joint:j};fingers.push(plate);acc+=len;
   });
  }
  records[side]={root,forearm,bracer,palm,fingers,handScale:hs};
 }
 const oldPose=actor.setPose.bind(actor);
 actor.setPose=p=>{
  oldPose(p);
  for(const [side,r] of Object.entries(records)){
   const a=p[side+'Arm'],length=Math.hypot(a[2].x-a[1].x,a[2].y-a[1].y,a[2].z-a[1].z);
   r.forearm.scale.x=length/.20;
  }
  actor.mesh.updateMatrixWorld(true);
 };
 const oldClad=actor.setCladState.bind(actor);
 actor.setCladState=t=>{oldClad(t);for(const [side,r] of Object.entries(records)){r.root.visible=actor.rigs[side].rig.visible;for(const m of r.fingers)m.visible=r.root.visible;}};
 actor.gauntlets=records;return records;
}
