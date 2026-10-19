import * as THREE from 'three';
import {combustionBurst,combustionAura,particleCloud} from './combustion-particles.js';
const clamp=x=>THREE.MathUtils.clamp(x,0,1),hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};

export function createCombustionCombat(scene){
 const impacts=[],aura=combustionAura(scene);
 function impact(id,time,point,{color='#ffbf65',scale=1,normal=[1,0,0]}={}){
  const group=new THREE.Group();group.name='impact-'+id;group.position.copy(point);group.visible=false;scene.add(group);
  const particles=combustionBurst(group,{color,scale,normal:new THREE.Vector3(...normal)}),light=new THREE.PointLight(color,0,4,2);group.add(light);
  impacts.push({id,time,point:point.clone(),group,particles,light,scale});
 }
 const arcGroup=new THREE.Group();scene.add(arcGroup);
 const ribbonGeo=new THREE.BufferGeometry();ribbonGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(40*18),3));
 const ribbon=new THREE.Mesh(ribbonGeo,new THREE.MeshBasicMaterial({color:'#ceadff',transparent:true,opacity:.7,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));arcGroup.add(ribbon);ribbon.frustumCulled=false;
 const arcSparks=particleCloud(arcGroup,40,'spark','#ab83e8');
 const beamGroup=new THREE.Group();scene.add(beamGroup);
 const beamFlame=particleCloud(beamGroup,96,'flame','#ffac38'),beamSparks=particleCloud(beamGroup,80,'spark','#ffdc8b'),beamSmoke=particleCloud(beamGroup,28,'smoke','#796767');
 const zero=new THREE.Vector3(),pos=new THREE.Vector3(),vel=new THREE.Vector3(),side=new THREE.Vector3();
 function update(t,camera,{arc=null,charge=null,beamShot=null}={}){
  for(const e of impacts){const age=t-e.time;e.group.visible=age>=0&&age<1.45;if(e.group.visible){e.group.updateMatrixWorld(true);e.particles.update(age,camera);e.light.intensity=7*e.scale*Math.exp(-age*19);}}
  aura.update(t,camera,charge);
  arcGroup.visible=!!arc;
  if(arc){
   const at=u=>arc.from.clone().lerp(arc.to,u).add(new THREE.Vector3(0,Math.sin(u*Math.PI)*(arc.bend??.35),0)),buf=ribbonGeo.attributes.position;let k=0;
   for(let i=0;i<40;i++){
    const u=i/40,v=(i+1)/40,a=at(u),b=at(v),dir=b.clone().sub(a).normalize(),view=camera.position.clone().sub(a).normalize();side.crossVectors(dir,view).normalize();
    const w=.010+.025*Math.sin(u*Math.PI),ww=.010+.025*Math.sin(v*Math.PI);
    for(const p of [a.clone().addScaledVector(side,-w),b.clone().addScaledVector(side,-ww),a.clone().addScaledVector(side,w),a.clone().addScaledVector(side,w),b.clone().addScaledVector(side,-ww),b.clone().addScaledVector(side,ww)])buf.setXYZ(k++,p.x,p.y,p.z);
   }buf.needsUpdate=true;ribbonGeo.computeBoundingSphere();ribbon.material.opacity=arc.alpha*.75;
   arcSparks.begin();for(let i=0;i<40;i++){const r=hash(i),u=(r+t*.7)%1,p=at(u);p.add(new THREE.Vector3(Math.sin(i*3)*.035,Math.cos(i)*.035,Math.sin(i)*.04));vel.copy(arc.to).sub(arc.from).normalize();arcSparks.set(i,p,.007,.045+r*.08,arc.alpha*Math.sin(Math.PI*u)*.8,u,r*50,camera,vel);}arcSparks.end();
  }
  beamGroup.visible=!!beamShot;
  if(beamShot){
   const d=beamShot.to.clone().sub(beamShot.from),length=d.length(),dir=d.clone().normalize(),cross=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(0,1,0)).normalize(),up=new THREE.Vector3().crossVectors(cross,dir).normalize();
   for(const c of [beamFlame,beamSparks,beamSmoke])c.begin();
   for(let i=0;i<96;i++){
    const r=hash(i+9),u=(r+t*1.6)%1,a=i*2.39996,rad=(.035+r*.085)*(beamShot.width??1);
    pos.copy(beamShot.from).addScaledVector(dir,length*u).addScaledVector(cross,Math.cos(a)*rad).addScaledVector(up,Math.sin(a)*rad);
    beamFlame.set(i,pos,.12+r*.12,.31+r*.30,beamShot.alpha*.66*Math.sin(Math.PI*u),t+r*4,r*90,camera,dir);
   }
   for(let i=0;i<80;i++){
    const r=hash(i+210),u=(r+t*1.9)%1,a=i*2.39996,rad=.05+r*.16;
    pos.copy(beamShot.from).addScaledVector(dir,length*u).addScaledVector(cross,Math.cos(a)*rad).addScaledVector(up,Math.sin(a)*rad);
    beamSparks.set(i,pos,.006+r*.008,.08+r*.17,beamShot.alpha*Math.sin(Math.PI*u),u,r*70,camera,dir);
   }
   for(let i=0;i<28;i++){
    const r=hash(i+410),u=(r+t*.25)%1,a=i*2.39996;
    pos.copy(beamShot.from).addScaledVector(dir,length*u).addScaledVector(cross,Math.cos(a)*.14).addScaledVector(up,Math.sin(a)*.14+.04);
    beamSmoke.set(i,pos,.23+r*.25,.22+r*.20,beamShot.alpha*.11*Math.sin(Math.PI*u),t*.6+r,r*60,camera);
   }for(const c of [beamFlame,beamSparks,beamSmoke])c.end();
  }
 }
 return {impact,update,impacts,aura,arcGroup,beamGroup};
}
