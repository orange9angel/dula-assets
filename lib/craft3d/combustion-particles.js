import * as THREE from 'three';
const TAU=Math.PI*2,clamp=x=>THREE.MathUtils.clamp(x,0,1),hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const noise=`
 float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){return noise(p)*.55+noise(p*2.03+5.1)*.28+noise(p*4.17+11.3)*.12+noise(p*8.31)*.05;}
`;

// Shared instanced quads have coherent volume noise and independent lifetime.
// Absolute age and fixed seeds permit backwards seek and offline frame export.
export function particleCloud(parent,count,kind,color='#ffac42'){
 const geo=new THREE.PlaneGeometry(1,1),data=new Float32Array(count*3);
 geo.setAttribute('particleData',new THREE.InstancedBufferAttribute(data,3));
 const material=new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color(color)}},transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,
  blending:kind==='smoke'?THREE.NormalBlending:THREE.AdditiveBlending,
  vertexShader:`attribute vec3 particleData;varying vec2 vUv;varying vec3 vData;
   void main(){vUv=uv;vData=particleData;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}`,
  fragmentShader:`varying vec2 vUv;varying vec3 vData;uniform vec3 tint;${noise}
   void main(){vec2 p=vUv*2.-1.;float age=vData.y,seed=vData.z,alpha=0.;vec3 c=tint;
   ${kind==='smoke'?`
    vec2 warp=vec2(fbm(p*2.7+seed+age*.7),fbm(p*2.2-seed-age*.6))-.5;
    float shape=length(p+warp*.45),n=fbm(p*3.6+seed+vec2(age*.6,-age*.8));
    alpha=(1.-smoothstep(.48,.98,shape))*(.25+.75*n);
    c=mix(tint*.52,tint*1.5,smoothstep(.22,.76,n+(p.y-p.x)*.12));
   `:kind==='flame'?`
    float y=vUv.y,flow=fbm(vec2(p.x*3.5+seed,y*4.-age*3.2));
    float bend=(fbm(vec2(y*3.,seed-age*1.7))-.5)*.7*y;
    float width=(1.-pow(y,.70))*.91+.035;
    float shape=1.-smoothstep(width*.20,width,abs(p.x+bend)+(flow-.5)*.28);
    alpha=shape*smoothstep(0.,.13,y)*(1.-smoothstep(.73,1.,y))*(.50+flow*.65);
    vec3 edge=mix(vec3(.95,.10,.012),tint,.28);
    c=mix(edge,tint*2.0,1.-y);c=mix(c,vec3(1.7,1.33,.74),pow(shape,3.)*(1.-y)*.72);
   `:`
    float core=exp(-p.x*p.x*30.)*(1.-smoothstep(.58,1.,abs(p.y)));
    alpha=core;c=mix(tint,vec3(1.8,1.5,.95),core*.65);
   `}
   alpha*=vData.x;if(alpha<.006)discard;gl_FragColor=vec4(c,alpha);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`
 });
 const mesh=new THREE.InstancedMesh(geo,material,count);mesh.name='combustion-'+kind;mesh.frustumCulled=false;parent.add(mesh);
 const dummy=new THREE.Object3D(),dir=new THREE.Vector3(),view=new THREE.Vector3(),side=new THREE.Vector3(),normal=new THREE.Vector3(),basis=new THREE.Matrix4();
 const origin=new THREE.Vector3();
 return {mesh,material,data,begin(){parent.getWorldPosition(origin);},set(i,p,w,h,opacity,age,seed,camera,velocity=null){
  dummy.position.copy(p);
  if(velocity&&velocity.lengthSq()>1e-7){
   dir.copy(velocity).normalize();view.copy(camera.position).sub(origin).sub(p).normalize();side.crossVectors(dir,view);
   if(side.lengthSq()<1e-6)side.set(1,0,0);side.normalize();normal.crossVectors(side,dir).normalize();basis.makeBasis(side,dir,normal);dummy.quaternion.setFromRotationMatrix(basis);
  }else dummy.quaternion.copy(camera.quaternion);
  dummy.scale.set(w,h,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);data.set([Math.max(0,opacity),age,seed],i*3);
 },end(){mesh.instanceMatrix.needsUpdate=true;geo.attributes.particleData.needsUpdate=true;mesh.computeBoundingSphere();}};
}

// Persistent scene fire shares the combat particle renderer; no diamond mesh
// is used as a flame or ember. Its absolute clock also supports reverse seek.
export function hearthFire(scene,origin){
 const group=new THREE.Group();group.name='hearth-fire-and-smoke';group.position.copy(origin);scene.add(group);
 const flame=particleCloud(group,38,'flame','#ff9c32'),smoke=particleCloud(group,25,'smoke','#62545a'),embers=particleCloud(group,42,'spark','#ffb94a');
 const p=new THREE.Vector3(),v=new THREE.Vector3(0,1,0);
 return {group,update(t,camera,power=1){
  group.updateMatrixWorld(true);for(const c of [flame,smoke,embers])c.begin();
  for(let i=0;i<38;i++){
   const r=hash(i+24),life=.55+r*.70,u=(t/life+r)%1,a=i*2.39996;
   p.set(Math.cos(a)*(.10+r*.13)*(1-u)+Math.sin(t*1.7+i)*u*.07,u*.60,Math.sin(a)*(.10+r*.08));
   flame.set(i,p,.11+r*.16,.25+r*.36,Math.sin(Math.PI*u)*.61*power,u*life,r*70,camera);
  }
  for(let i=0;i<25;i++){
   const r=hash(i+102),life=2.2+r*2,u=(t/life+r)%1;
   p.set(Math.sin(i*3.1+u*2.6)*(.10+u*.20)+u*.13,.18+u*1.30,Math.cos(i*2.3)*(.12+u*.16));
   const size=.18+u*.46;
   smoke.set(i,p,size,size*1.2,Math.sin(Math.PI*u)*.18*power,u*life,r*70,camera);
  }
  for(let i=0;i<42;i++){
   const r=hash(i+237),u=(t*(.28+r*.22)+r)%1;
   p.set(Math.sin(i*2.7+u*4)*(.12+u*.28),u*1.9,Math.cos(i*1.7)*.23);
   embers.set(i,p,.004+r*.006,.012+r*.029,Math.sin(Math.PI*u)*.8*power,u,r*80,camera,v);
  }
  for(const c of [flame,smoke,embers])c.end();
 }};
}

export function combustionBurst(group,{color='#ffbf65',scale=1,normal=new THREE.Vector3(1,0,0),count=112}={}){
 const sparks=particleCloud(group,count,'spark',color),smoke=particleCloud(group,20,'smoke','#6b6472'),flames=particleCloud(group,12,'flame',color);
 const n=normal.clone().normalize(),axis=Math.abs(n.y)>.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0),tangent=new THREE.Vector3().crossVectors(n,axis).normalize(),bitangent=new THREE.Vector3().crossVectors(n,tangent).normalize();
 const p=new THREE.Vector3(),v=new THREE.Vector3();
 return {sparks,smoke,flames,update(dt,camera){
  for(const c of [sparks,smoke,flames])c.begin();
  for(let i=0;i<count;i++){
   const r=hash(i+1),a=hash(i+40)*TAU,life=.19+hash(i+80)*.61,age=dt-hash(i+12)*.025,u=age/life;
   v.copy(n).multiplyScalar(.65+r*.9).addScaledVector(tangent,Math.cos(a)*1.2).addScaledVector(bitangent,Math.sin(a)*1.2).normalize().multiplyScalar(scale*(2.7+hash(i+57)*5.3));
   const travel=(1-Math.exp(-2.4*Math.max(0,age)))/2.4;p.copy(v).multiplyScalar(travel);p.y-=2.8*age*age;v.multiplyScalar(Math.exp(-2.4*Math.max(0,age)));v.y-=5.6*age;
   const fade=u>=0&&u<1?Math.pow(1-u,.65):0;
   sparks.set(i,p,(.009+r*.010)*scale,(.055+r*.15)*scale*(.5+fade),fade,age,hash(i+150)*40,camera,v);
  }
  for(let i=0;i<20;i++){
   const r=hash(i+302),a=hash(i+405)*TAU,life=.75+r*.65,age=dt-.018-hash(i+512)*.06,u=age/life;
   const fade=u>0&&u<1?Math.sin(Math.PI*u)*Math.pow(1-u,.25):0;
   v.copy(n).multiplyScalar(.18+r*.46).addScaledVector(tangent,Math.cos(a)*(.15+r*.35)).addScaledVector(bitangent,Math.sin(a)*(.15+r*.35));
   p.copy(v).multiplyScalar(Math.max(0,age)*scale);p.y+=age*.22;
   const size=scale*(.12+r*.12+Math.max(0,age)*(.43+r*.33));
   smoke.set(i,p,size,size*(.8+r*.35),fade*.36,age*1.4,r*60,camera);
  }
  for(let i=0;i<12;i++){
   const r=hash(i+901),age=dt-r*.025,u=age/(.20+r*.18),a=i*2.39996,fade=u>=0&&u<1?Math.sin(Math.PI*clamp(u))*.83:0;
   p.copy(n).multiplyScalar(age*(.7+r)).addScaledVector(tangent,Math.cos(a)*age).addScaledVector(bitangent,Math.sin(a)*age);p.y+=age*.45;
   flames.set(i,p,scale*(.17+r*.17),scale*(.31+r*.33),fade,age*4,r*90,camera);
  }
  for(const c of [sparks,smoke,flames])c.end();
 }};
}

export function combustionAura(parent){
 const group=new THREE.Group();group.name='rising-flame-aura';parent.add(group);
 const flame=particleCloud(group,56,'flame'),smoke=particleCloud(group,30,'smoke','#625966'),embers=particleCloud(group,60,'spark');
 const light=new THREE.PointLight('#ffb36c',0,4,2);group.add(light);
 const p=new THREE.Vector3(),v=new THREE.Vector3(0,1,0);
 return {group,flame,smoke,embers,update(t,camera,charge){
  group.visible=!!charge;if(!charge)return;
  group.position.copy(charge.base??charge.point);group.updateMatrixWorld(true);
  const power=charge.power,color=charge.color,height=charge.height??1.85;
  flame.material.uniforms.tint.value.set(color);embers.material.uniforms.tint.value.set(color);light.color.set(color);light.position.y=.8;light.intensity=2.2*power;
  for(const c of [flame,smoke,embers])c.begin();
  const time=Math.max(0,t-(charge.start??0));
  for(let i=0;i<56;i++){
   const r=hash(i+2),life=.56+r*.58,age=(time+r*life)%life,u=age/life,a=i*2.39996,radius=.26+hash(i+120)*.18;
   p.set(Math.cos(a)*radius+Math.sin(u*7+i)*.055,u*height,Math.sin(a)*radius);
   const fade=Math.sin(Math.PI*u)*(.55+power*.45);
   flame.set(i,p,(.16+r*.17)*(.65+power*.4),(.42+r*.48)*(.65+power*.4),fade*.61*power,age,r*80,camera);
  }
  for(let i=0;i<30;i++){
   const r=hash(i+203),life=1.8+r*1.2,age=(time*.7+r*life)%life,u=age/life,a=i*2.39996,radius=.36+u*.35;
   p.set(Math.cos(a)*radius+Math.sin(age+i)*.11,.03+u*height*.92,Math.sin(a)*radius);
   const size=.25+u*.52+r*.15;
   smoke.set(i,p,size,size*(.85+r*.3),Math.sin(Math.PI*u)*power*.16,age,r*80,camera);
  }
  for(let i=0;i<60;i++){
   const r=hash(i+602),u=(time*(.50+r*.6)+r)%1,a=i*2.39996,radius=.35+hash(i+650)*.40;
   p.set(Math.cos(a)*radius+Math.sin(u*5+i)*.08,u*(height+.6),Math.sin(a)*radius);
   embers.set(i,p,.006+r*.006,.018+r*.035,Math.sin(Math.PI*u)*power*.7,u,r*90,camera,v);
  }
  for(const c of [flame,smoke,embers])c.end();
 }};
}
