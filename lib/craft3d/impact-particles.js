import * as THREE from 'three';
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const clamp=x=>Math.max(0,Math.min(1,x));

// Small deterministic burst layer: absolute hit age supports random seek and
// offline rendering. Instances share a draw call; no accumulated simulation.
export function impactParticles(parent,{color,scale,normal,count=96}){
 const tint=new THREE.Color(color),mat=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const sparks=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),mat,count);sparks.frustumCulled=false;parent.add(sparks);
 const shock=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
  uniforms:{color:{value:tint.clone()},age:{value:0}},transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform vec3 color;uniform float age;
   void main(){vec2 p=vUv*2.-1.;float r=length(p),a=atan(p.y,p.x);
   float ridge=exp(-pow((r-.74)/.045,2.));float haze=exp(-pow((r-.70)/.13,2.))*.20;
   float broken=.72+.28*sin(a*13.+age*11.)*sin(a*7.-age*3.);
   gl_FragColor=vec4(color,(ridge+haze)*broken*pow(max(0.,1.-age),1.7)*.62);}`
 }));parent.add(shock);
 const dust=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
  uniforms:{age:{value:0},color:{value:new THREE.Color('#41303c')}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float age;uniform vec3 color;
   void main(){vec2 p=vUv*2.-1.;float r=length(p),a=atan(p.y,p.x);
    float edge=.68+.10*sin(a*5.+age)+.06*sin(a*9.-age*2.);
    float alpha=(1.-smoothstep(edge-.28,edge,r))*smoothstep(0.,.17,age)*pow(max(0.,1.-age),2.)*.18;
    gl_FragColor=vec4(color,alpha);}`
 }));parent.add(dust);
 const dummy=new THREE.Object3D(),dir=new THREE.Vector3(),pos=new THREE.Vector3(),velocity=new THREE.Vector3(),view=new THREE.Vector3(),side=new THREE.Vector3(),face=new THREE.Vector3(),basis=new THREE.Matrix4(),n=normal.clone().normalize();
 const axis=new THREE.Vector3(0,1,0);if(Math.abs(n.y)>.9)axis.set(1,0,0);
 const tangent=new THREE.Vector3().crossVectors(n,axis).normalize(),bitangent=new THREE.Vector3().crossVectors(n,tangent).normalize();
 const seeds=Array.from({length:count},(_,i)=>({angle:hash(i+1)*Math.PI*2,speed:2+hash(i+2)*4.2,life:.24+hash(i+3)*.48,spread:.35+hash(i+4)*1.2,delay:hash(i+5)*.025,hot:hash(i+6)}));
 return{sparks,shock,dust,update(dt,camera){
  const world=parent.getWorldPosition(new THREE.Vector3());
  for(const [i,s] of seeds.entries()){
   const age=dt-s.delay,u=age/s.life,active=u>=0&&u<1;
   dir.copy(n).multiplyScalar(.30+s.hot*.7).addScaledVector(tangent,Math.cos(s.angle)*s.spread).addScaledVector(bitangent,Math.sin(s.angle)*s.spread).normalize();
   velocity.copy(dir).multiplyScalar(s.speed*scale);pos.copy(velocity).multiplyScalar(Math.max(0,age));pos.y-=2.5*age*age;velocity.y-=5*age;
   view.copy(camera.position).sub(world).sub(pos).normalize();dir.copy(velocity).normalize();side.crossVectors(dir,view).normalize();face.crossVectors(side,dir).normalize();basis.makeBasis(side,dir,face);
   dummy.quaternion.setFromRotationMatrix(basis);dummy.position.copy(pos);
   const fade=active?Math.pow(1-clamp(u),.65):0;
   dummy.scale.set((.006+s.hot*.007)*scale*fade,(.045+s.hot*.12)*(1+u)*scale*fade,1);dummy.updateMatrix();sparks.setMatrixAt(i,dummy.matrix);
   sparks.setColorAt(i,tint.clone().lerp(new THREE.Color('#fff5dd'),s.hot*.7).multiplyScalar(fade*1.8));
  }
  sparks.instanceMatrix.needsUpdate=true;sparks.instanceColor.needsUpdate=true;
  shock.quaternion.copy(camera.quaternion);shock.scale.setScalar(scale*(.15+dt*2.6));shock.material.uniforms.age.value=clamp(dt/.65);
  dust.quaternion.copy(camera.quaternion);dust.position.y=dt*.25;dust.scale.setScalar(scale*(.35+dt*1.4));dust.material.uniforms.age.value=clamp(dt/.78);
 }};
}
