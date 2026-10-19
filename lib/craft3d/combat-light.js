import * as THREE from 'three';
const clamp=x=>Math.max(0,Math.min(1,x));
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'white');r.addColorStop(.12,'white');r.addColorStop(.35,'rgba(255,255,255,.65)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
export function createCombatLight(scene){
 const tex=glowTexture(),add=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const sprite=c=>new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
 const impacts=[];
 function impact(id,time,point,{color='#ffbf65',scale=1,normal=[1,0,0]}={}){
  const group=new THREE.Group();group.position.copy(point);scene.add(group);group.visible=false;
  const core=sprite('#fff6df');group.add(core);
  const rings=Array.from({length:3},(_,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(1,.012+i*.006,6,64),add(i===0?'#fff8e9':color));group.add(m);return m;});
  const rays=[];for(let i=0;i<22;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(.018,1,4),add(i%3===0?'#fffdf1':color));group.add(m);rays.push(m);}
  const sparks=[];for(let i=0;i<38;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.022),add(i%4===0?'#ffffff':color));group.add(m);sparks.push(m);}
  const light=new THREE.PointLight(color,0,5,2);group.add(light);
  impacts.push({id,time,point:point.clone(),group,core,rings,rays,sparks,light,color,scale,normal:new THREE.Vector3(...normal).normalize()});
 }
 const arcGroup=new THREE.Group();scene.add(arcGroup);
 const arcs=Array.from({length:3},(_,i)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(48*3),3));const m=new THREE.Line(geo,new THREE.LineBasicMaterial({color:i?'#b480ff':'#ffffff',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));arcGroup.add(m);return m;});
 const ribbons=Array.from({length:2},(_,j)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(47*18),3));const m=new THREE.Mesh(geo,add(j?'#ede0ff':'#914aff'));arcGroup.add(m);return m;});
 const beamGroup=new THREE.Group();scene.add(beamGroup);
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.07,.22,1,18,1,true),add('#ffb146'));beamGroup.add(beam);
 const beamCore=new THREE.Mesh(new THREE.CylinderGeometry(.035,.10,1,14),add('#fff0ba'));beamGroup.add(beamCore);
 const beamGlow=sprite('#ffc169');beamGroup.add(beamGlow);
 const auraGroup=new THREE.Group();scene.add(auraGroup);
 const auraParticles=Array.from({length:56},(_,i)=>{const m=sprite(i%4===0?'#ffffff':'#f7c97c');auraGroup.add(m);return m;});
 const auraRings=Array.from({length:3},()=>{const m=new THREE.Mesh(new THREE.TorusGeometry(.4,.007,5,56),add('#ffc36a'));auraGroup.add(m);return m;});
 const auraLight=new THREE.PointLight('#ffd280',0,4,2);auraGroup.add(auraLight);
 function update(t,camera,{arc=null,charge=null,beamShot=null}={}){
  for(const e of impacts){
   const dt=t-e.time,u=dt/.78;e.group.visible=u>=0&&u<1;if(!e.group.visible)continue;
   e.core.scale.setScalar(e.scale*(dt<.07?1.05:1.05*Math.exp(-(dt-.07)*8)));e.core.material.opacity=1-clamp(u*1.5);
   e.light.intensity=e.scale*5*Math.exp(-dt*11);
   for(const [i,r] of e.rings.entries()){const a=clamp((dt-i*.045)/.6);r.visible=dt>=i*.045;r.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),e.normal);r.rotateY(i*.24);r.scale.setScalar(e.scale*(.12+a*(1.5+i*.22)));r.material.opacity=(1-a)*.9;}
   for(const [i,r] of e.rays.entries()){
    const a=i*2.399963,d=new THREE.Vector3(Math.cos(a),Math.sin(a)*.8,Math.sin(i*7.3)*.32).normalize();
    const len=e.scale*(.30+(i%5)*.095)*Math.max(0,1-dt*2.3);r.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);r.scale.set(1,len,1);r.position.copy(d).multiplyScalar(.05+len/2+dt*.6);r.material.opacity=Math.max(0,1-dt*2.8);
   }
   for(const [i,s] of e.sparks.entries()){const a=i*2.399963,v=1.3+(i%7)*.28;s.position.set(Math.cos(a)*v*dt,Math.sin(a)*v*dt+.7*dt-2.0*dt*dt,Math.sin(i*4.8)*v*dt*.55);s.scale.setScalar(e.scale*(1-u)*(i%3===0?1.7:.8));s.material.opacity=1-u;}
  }
  arcGroup.visible=!!arc;
  if(arc){for(const [j,m] of arcs.entries()){const p=m.geometry.attributes.position;for(let i=0;i<48;i++){
    const u=i/47,pnt=arc.from.clone().lerp(arc.to,u);pnt.y+=Math.sin(u*Math.PI)*(arc.bend??.35);pnt.z+=Math.sin(u*Math.PI)*j*.018;p.setXYZ(i,pnt.x,pnt.y,pnt.z);}
    p.needsUpdate=true;m.geometry.computeBoundingSphere();m.material.opacity=arc.alpha*(j?.65:1);}
   const point=u=>{const p=arc.from.clone().lerp(arc.to,u);p.y+=Math.sin(u*Math.PI)*(arc.bend??.35);return p;};
   for(const [j,m] of ribbons.entries()){const buf=m.geometry.attributes.position;let k=0;
    for(let i=0;i<47;i++){const a=i/47,b=(i+1)/47,p=point(a),q=point(b),tangent=q.clone().sub(p).normalize(),view=camera.position.clone().sub(p).normalize(),side=new THREE.Vector3().crossVectors(tangent,view).normalize();
     const w=u=>(j?.016:.085)*(.25+.75*Math.sin(u*Math.PI));const p0=p.clone().addScaledVector(side,-w(a)),p1=p.clone().addScaledVector(side,w(a)),q0=q.clone().addScaledVector(side,-w(b)),q1=q.clone().addScaledVector(side,w(b));
     for(const v of [p0,q0,p1,p1,q0,q1])buf.setXYZ(k++,v.x,v.y,v.z);
    }buf.needsUpdate=true;m.geometry.computeBoundingSphere();m.material.opacity=arc.alpha*(j?.95:.65);}
  }
  beamGroup.visible=!!beamShot;
  if(beamShot){const d=beamShot.to.clone().sub(beamShot.from),mid=beamShot.from.clone().lerp(beamShot.to,.5);for(const m of [beam,beamCore]){m.position.copy(mid);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());m.scale.set(beamShot.width??1,d.length(),beamShot.width??1);m.material.opacity=beamShot.alpha;}
   beamGlow.position.copy(beamShot.to);beamGlow.scale.setScalar(.65);beamGlow.material.opacity=beamShot.alpha;}
  auraGroup.visible=!!charge;
  if(charge){auraGroup.position.copy(charge.point);auraLight.color.set(charge.color);auraLight.intensity=1.6*charge.power;
   for(const [i,m] of auraParticles.entries()){const u=(t*.42+i/56)%1,a=i*2.399963+t*.8,r=.25+.25*(1-u);m.position.set(Math.cos(a)*r,(u-.35)*1.8,Math.sin(a)*r);m.scale.setScalar((.025+(i%5)*.012)*charge.power);m.material.color.set(i%4?charge.color:'#ffffff');m.material.opacity=Math.sin(u*Math.PI)*charge.power;}
   for(const [i,m] of auraRings.entries()){const u=(t*.6+i/3)%1;m.position.y=(u-.3)*1.5;m.rotation.set(Math.PI/2,0,t*.7+i);m.scale.setScalar(.6+(1-u)*.8);m.material.color.set(charge.color);m.material.opacity=(1-u)*charge.power*.7;}}
 }
 return{impact,update,impacts};
}
