import * as THREE from 'three';

/** Rear painted volume in the same neutral-metre frame as the curved head.
 * The front drawing stays attached to the face; this surface owns the rear
 * silhouette, side thickness and the long-hair curtain. No camera-facing cards. */
export function addCafeRearHair(root,texture,{girl,dy=0}){
 const cap=root.children.find(o=>o.isMesh);if(cap){
  cap.visible=true;cap.material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});
  const p=cap.geometry.attributes.position,u=cap.geometry.attributes.uv;
  for(let i=0;i<p.count;i++)u.setXY(i,((girl?512:627)+p.getX(i)*(girl?2100:3700))/texture.image.width,1-((girl?32:150)+((girl?1.755:1.754)+dy-p.getY(i))*(girl?1770:3600))/texture.image.height);u.needsUpdate=true;
 }
 const profiles=girl?[
  [.96,.135,-.095,.040],[1.02,.178,-.085,.070],[1.18,.159,-.066,.088],
  [1.40,.125,-.046,.103],[1.53,.108,-.018,.115],[1.63,.106,-.015,.119],
  [1.70,.083,-.015,.094],[1.747,.026,-.015,.035],[1.755,.001,-.015,.002]
 ]:[
  [1.502,.045,-.040,.050],[1.54,.081,-.030,.091],[1.60,.106,-.017,.119],
  [1.67,.101,-.015,.112],[1.72,.070,-.015,.081],[1.754,.001,-.015,.002]
 ];
 const N=80,R=120,pos=[],uv=[],idx=[],top=profiles.at(-1)[0],bottom=profiles[0][0];
 for(let layer=0;layer<2;layer++)for(let r=0;r<=R;r++)for(let c=0;c<=N;c++){
  const t=r/R,y0=THREE.MathUtils.lerp(bottom,top,t),j=Math.max(0,Math.min(profiles.length-2,profiles.findIndex(p=>p[0]>=y0)-1));
  const a=profiles[j],b=profiles[j+1],q=THREE.MathUtils.smoothstep(y0,a[0],b[0]);
  const rx=THREE.MathUtils.lerp(a[1],b[1],q),centre=THREE.MathUtils.lerp(a[2],b[2],q),depth=THREE.MathUtils.lerp(a[3],b[3],q);
  const angle=Math.PI/3+c/N*Math.PI*4/3,flute=(girl?.0035:.0020)*Math.cos(angle*(girl?15:11)+t*1.3)*Math.sin(Math.PI*t);
  const tip=(girl?.033:.010)*(1-Math.cos(c/N*Math.PI*12+.4))*Math.pow(1-t,14);
  const x=(rx+flute)*Math.sin(angle),z=centre+(depth+flute-layer*.006)*Math.cos(angle),y=y0+dy+tip;
  pos.push(x,y,z);
  const side=(angle-Math.PI)/(Math.PI/2);
  const px=girl?512-Math.sin(side*1.12)*Math.min(390,rx*2150):627-Math.sin(side*1.12)*470*Math.sqrt(Math.max(.04,1-((y0-1.625)/.14)**2));
  const py=girl?32+(1.755-y0)*1770:85+(1.754-y0)*4150;
  uv.push(px/texture.image.width,1-py/texture.image.height);
  if(r<R&&c<N){const k=layer*(R+1)*(N+1)+r*(N+1)+c;if(layer===0)idx.push(k,k+N+1,k+1,k+1,k+N+1,k+N+2);else idx.push(k,k+1,k+N+1,k+1,k+N+2,k+N+1);}
 }
 const stride=(R+1)*(N+1),wall=(i,j)=>idx.push(i,j,i+stride,j,j+stride,i+stride);
 for(let r=0;r<R;r++){wall(r*(N+1),(r+1)*(N+1));wall(r*(N+1)+N,(r+1)*(N+1)+N);}
 for(let c=0;c<N;c++){wall(c,c+1);wall(R*(N+1)+c,R*(N+1)+c+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});
 const mesh=new THREE.Mesh(g,m);mesh.name='cafe-rear-hair-volume';mesh.userData.cafeRear=true;root.add(mesh);return mesh;
}

/** Side painting corrects the projection of the accepted frontal strands.
 * Only colour changes with view; geometry, alpha, attachment and occlusion stay
 * three dimensional. Front and rear retain their own paintings. */
export function applyCafeSidePainting(root,texture){
 const cameraPoint=new THREE.Vector3(),inverse=new THREE.Matrix4();
 root.traverse(mesh=>{if(!mesh.isMesh)return;
  const amount={value:0},m=mesh.material,previous=m.onBeforeCompile,key=m.customProgramCacheKey();
  mesh.onBeforeRender=(_r,_s,camera)=>{camera.getWorldPosition(cameraPoint).applyMatrix4(inverse.copy(mesh.matrixWorld).invert());amount.value=THREE.MathUtils.smoothstep(Math.abs(cameraPoint.x)/Math.hypot(cameraPoint.x,cameraPoint.z),.45,.92);};
  m.onBeforeCompile=function(s,r){previous.call(this,s,r);s.uniforms.cafeSideArt={value:texture};s.uniforms.cafeSideAmount=amount;
   s.vertexShader='varying vec3 cafeSidePoint;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncafeSidePoint=position;');
   s.fragmentShader='varying vec3 cafeSidePoint;uniform sampler2D cafeSideArt;uniform float cafeSideAmount;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    vec2 suv=vec2((600.+cafeSidePoint.z*2000.)/1024.,1.-(55.+(1.75-cafeSidePoint.y)*1740.)/1536.);
    vec4 sideArt=texture2D(cafeSideArt,suv);
    diffuseColor.rgb=mix(diffuseColor.rgb,sideArt.rgb,cafeSideAmount*smoothstep(.65,.95,sideArt.a));
   `);
  };m.customProgramCacheKey=()=>key+'|cafe-side-paint-v1';m.needsUpdate=true;
 });
}
