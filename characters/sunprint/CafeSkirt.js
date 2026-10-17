import * as THREE from 'three';
const clamp=THREE.MathUtils.clamp, smooth=THREE.MathUtils.smoothstep;
const point=(actor,name)=>actor.mesh.worldToLocal(actor.body.bones[name].getWorldPosition(new THREE.Vector3()));
function plaid(){
 const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');x.fillStyle='#293e79';x.fillRect(0,0,1024,1024);
 // Lines follow the garment's circumference/length coordinates. The pleats
 // themselves belong to geometry, not a frontal photograph of another skirt.
 for(let i=0;i<24;i++){const u=i*1024/24;x.fillStyle='#23356a';x.fillRect(u,0,8,1024);x.fillStyle='#a6a48c';x.fillRect(u+17,0,1.7,1024);}
 for(let i=0;i<6;i++){const v=i*1024/6;x.fillStyle='#26396d';x.fillRect(0,v,1024,10);x.fillStyle='#a6a48c';x.fillRect(0,v+16,1024,2.4);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=8;return t;
}
function nearest(p,a,b){const d=b.clone().sub(a),t=clamp(p.clone().sub(a).dot(d)/d.lengthSq(),0,1);return a.clone().addScaledVector(d,t);}
/** Episode wardrobe fitted to the actual solved hip/thigh rig. Absolute-time
 * deformation avoids stateful cloth drift while preserving pose/seek equality. */
export class CafeSkirt{
 constructor(actor){
  this.actor=actor;this.rows=24;this.sides=128;
  const n=(this.rows+1)*(this.sides+1),g=new THREE.BufferGeometry(),uv=new Float32Array(n*2),index=[];
  g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));
  for(let r=0;r<=this.rows;r++)for(let j=0;j<=this.sides;j++){const k=r*(this.sides+1)+j;uv[k*2]=j/this.sides;uv[k*2+1]=1-r/this.rows;if(r<this.rows&&j<this.sides){const b=k+this.sides+1;index.push(k,b,k+1,k+1,b,b+1);}}
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(index);
  const material=new THREE.MeshBasicMaterial({map:plaid(),side:THREE.DoubleSide,toneMapped:false});
  material.onBeforeCompile=s=>{s.vertexShader='varying vec3 skirtNormal;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nskirtNormal=normalize(mat3(modelMatrix)*normal);');s.fragmentShader='varying vec3 skirtNormal;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat clothLight=smoothstep(-.15,.70,dot(normalize(skirtNormal),normalize(vec3(-.35,.65,.7))));diffuseColor.rgb*=mix(vec3(.60,.62,.75),vec3(1.04),clothLight);');};
  material.customProgramCacheKey=()=> 'cafe-fitted-pleats-v1';
  this.mesh=new THREE.Mesh(g,material);this.mesh.name='CafeSkirtFitted';this.mesh.frustumCulled=false;actor.mesh.add(this.mesh);
 }
 update(p){
  const a=this.actor,hip=point(a,'hips'),legs=['left','right'].map(side=>[point(a,side+'upleg'),point(a,side+'leg'),point(a,side+'foot')]);
  const knee=legs[0][1].clone().add(legs[1][1]).multiplyScalar(.5),seat=clamp(-(p.bob??0)/.385,0,1),waist=hip.y+.137;
  const capsules=legs.flatMap(([h,k,f])=>[{a:h,b:k,r:.062},{a:k,b:f,r:.046}]);
  const pos=this.mesh.geometry.attributes.position;let corrected=0,maxPush=0,minClearance=Infinity;
  for(let r=0;r<=this.rows;r++)for(let j=0;j<=this.sides;j++){
   const u=r/this.rows,theta=j/this.sides*Math.PI*2+(p.hairLag??0)*u*u*.45,front=smooth(Math.cos(theta),-.6,.6);
   const pleat=(.003+.012*u)*Math.cos(theta*16)*smooth(u,.055,.2),rx=.131+.091*Math.pow(u,.82),rz=.086+.062*u;
   // Extend the waistband into the actual shirt hem, preserving the hem height.
   // The previous top was below the discarded source-cloth boundary.
   const q=new THREE.Vector3(hip.x+Math.sin(theta)*(rx+pleat),waist-.443*u,hip.z+Math.cos(theta)*(rz+pleat));
   q.y+=seat*(.443*u+(knee.y-.025+.093*front-waist)*u+(.012+.053*front)*Math.sin(Math.PI*u));
   q.z+=seat*front*u*Math.max(0,knee.z-hip.z)*.97;
   q.x+=(p.roll??0)*u*.23;q.y+=u*u*(.0035*Math.cos(theta*16)+.004*Math.sin(theta*2));
   const before=q.clone();
   // Fit surface to finite leg capsules. The waist stays in the shirt overlap;
   // the lower rows have enough freedom to avoid the actual raised knee.
   if(u>.10)for(let pass=0;pass<3;pass++)for(const c of capsules){const hit=nearest(q,c.a,c.b),d=q.clone().sub(hit),len=d.length();if(len<c.r+.007){if(len<1e-8)d.set(Math.sin(theta),0,Math.cos(theta));else d.multiplyScalar(1/len);q.copy(hit).addScaledVector(d,c.r+.007);}}
   const push=q.distanceTo(before);if(push>.00001)corrected++;maxPush=Math.max(maxPush,push);
   if(u>.10)for(const c of capsules)minClearance=Math.min(minClearance,q.distanceTo(nearest(q,c.a,c.b))-c.r);
   pos.setXYZ(r*(this.sides+1)+j,q.x,q.y,q.z);
  }
  pos.needsUpdate=true;this.mesh.geometry.computeVertexNormals();this.mesh.geometry.computeBoundingSphere();
  this.audit={scope:'Skirt vertices against solved leg capsules; not full imported mesh collision',vertices:pos.count,corrected,maxPush,minClearance};return this.audit;
 }
}
