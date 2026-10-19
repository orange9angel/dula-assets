import * as THREE from 'three';
import {MarchingCubes} from 'three/addons/objects/MarchingCubes.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
const clamp=x=>THREE.MathUtils.clamp(x,0,1),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};

// A single union surface joins the clothed pelvis and upper thighs. Its lower
// region follows the retained hip/knee axes; no independent thigh end-cap is
// exposed at the groin. Legs and feet keep their existing action trajectories.
export function applyConnectedPelvis(actor){
 const d=actor.dimsRef,hip=d.hipIdle,fire=actor.palaceKind==='aoao',k=fire?1:.91;
 const prior=actor.anatomy.pelvis;prior.visible=false;
 // Monotone Hermite interpolation keeps a continuous taper. Smoothstep on
 // every short radius interval made a row of flat tangents and fleshy bands.
 for(const side of ['left','right']){
  const limb=actor.limbs[side+'Leg'];
  limb.radii=[[0,.096*k],[.12,.103*k],[.27,.088*k],[.43,.061*k],[.51,.051*(fire?1:.81)],[.64,.064*(fire?1:.81)],[.78,.054*(fire?1:.81)],[1,.037*k]];
  const a=limb.radii,slopes=a.slice(1).map((p,i)=>(p[1]-a[i][1])/(p[0]-a[i][0]));
  const tangent=a.map((_,i)=>i===0?slopes[0]:i===a.length-1?slopes.at(-1):slopes[i-1]*slopes[i]<=0?0:2/(1/slopes[i-1]+1/slopes[i]));
  limb.radius=t=>{for(let i=1;i<a.length;i++)if(t<=a[i][0]){const h=a[i][0]-a[i-1][0],u=clamp((t-a[i-1][0])/h),u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*a[i-1][1]+(u3-2*u2+u)*h*tangent[i-1]+(-2*u3+3*u2)*a[i][1]+(u3-u2)*h*tangent[i];}return a.at(-1)[1];};
 }
 const material=prior.material,mc=new MarchingCubes(64,material,false,false,40000),sx=.30,sy=.64,sz=.25,cy=hip-.40;
 mc.isolation=0;
 const union=(a,b,r)=>Math.max(a,b)+r*.25*Math.pow(Math.max(0,1-Math.abs(a-b)/r),2);
 const radius=actor.limbs.leftLeg.radius.bind(actor.limbs.leftLeg),legLength=fire?.84:.98;
 const n=mc.resolution;
 for(let iz=0;iz<n;iz++)for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){
  const x=(ix/n*2-1)*sx,y=cy+(iy/n*2-1)*sy,z=(iz/n*2-1)*sz;
  const rear=z<0?1:0,bulge=rear*.025*Math.exp(-Math.pow((Math.abs(x)-.075*k)/.055,2));
  let field=(1-Math.sqrt((x/(.166*k))**2+((y-hip-.020)/.132)**2+((z+.016)/(.112*k+bulge))**2))*.115;
  for(const sign of [-1,1]){
   const depth=THREE.MathUtils.clamp(hip-y,0,legLength-.03),u=depth/legLength;
   const r=radius(u)+.002*(1-smooth((depth-.13)/.09));
   const dz=z/1.08,dx=x-sign*d.hipHalf,dy=y-(hip-depth);
   field=union(field,r-Math.hypot(dx,dy,dz),.035);
  }
  const split=.027*smooth((hip-y-.085)/.115);
  if(y<hip-.09)field=Math.min(field,Math.abs(x)-split);
  mc.field[ix+iy*n+iz*n*n]=field;
 }
 mc.update();
 const count=mc.geometry.drawRange.count,raw=new THREE.BufferGeometry();
 const p=new Float32Array(count*3),source=mc.geometry.attributes.position;
 for(let i=0;i<count;i++){p[i*3]=source.getX(i)*sx;p[i*3+1]=cy+source.getY(i)*sy;p[i*3+2]=source.getZ(i)*sz;}
 raw.setAttribute('position',new THREE.BufferAttribute(p,3));const g=mergeVertices(raw,.00001),triangles=[];
 for(let i=0;i<g.index.count;i+=3){const a=g.index.getX(i),b=g.index.getX(i+1),c=g.index.getX(i+2);if(a!==b&&b!==c&&c!==a)triangles.push(a,b,c);}
 g.setIndex(triangles);g.computeVertexNormals();mc.geometry.dispose();raw.dispose();
 const mesh=new THREE.Mesh(g,material);mesh.name='continuous-pelvis-upper-thighs';mesh.castShadow=true;actor.mesh.add(mesh);
 const position=g.attributes.position,base=Float32Array.from(position.array),point=new THREE.Vector3(),bodyPoint=new THREE.Vector3(),down=new THREE.Vector3(0,-1,0);
 const sides=['left','right'],records=sides.map((side,i)=>({side,sign:i?1:-1,hip:new THREE.Vector3(),knee:new THREE.Vector3(),rotation:new THREE.Quaternion(),lower:new THREE.Quaternion()})),lowerPoint=new THREE.Vector3();
 const oldPose=actor.setPose.bind(actor);
 actor.setPose=pose=>{
  oldPose(pose);actor.body.updateMatrix();
  for(const r of records){const [h,k,e]=pose[r.side+'Leg'];r.hip.set(h.x,h.y,h.z);r.knee.set(k.x,k.y,k.z);r.rotation.setFromUnitVectors(down,new THREE.Vector3(k.x-h.x,k.y-h.y,k.z-h.z).normalize());r.lower.setFromUnitVectors(down,new THREE.Vector3(e.x-k.x,e.y-k.y,e.z-k.z).normalize());}
  for(let i=0;i<position.count;i++){
   const x=base[i*3],y=base[i*3+1],z=base[i*3+2],depth=hip-y;
   bodyPoint.set(x,y,z).applyMatrix4(actor.body.matrix);
   const offset=pose.pelvisOffset??{x:0,z:0},pelvisWeight=1-smooth((y-hip-.015)/.10);
   bodyPoint.x+=offset.x*pelvisWeight;bodyPoint.z+=offset.z*pelvisWeight;
   const weight=smooth((depth+.015)/.19),right=smooth((x+.035)/.070);
   let px=0,py=0,pz=0;
   for(const r of records){
    const w=r.sign>0?right:1-right;
    point.set(x-r.sign*d.hipHalf,y-hip,z).applyQuaternion(r.rotation).add(r.hip);
    lowerPoint.set(x-r.sign*d.hipHalf,y-hip+legLength*.5,z).applyQuaternion(r.lower).add(r.knee);
    point.lerp(lowerPoint,smooth((depth-legLength*.5+.035)/.07));
    px+=point.x*w;py+=point.y*w;pz+=point.z*w;
   }
   position.setXYZ(i,THREE.MathUtils.lerp(bodyPoint.x,px,weight),THREE.MathUtils.lerp(bodyPoint.y,py,weight),THREE.MathUtils.lerp(bodyPoint.z,pz,weight));
  }
  position.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();
 };
 // The old cap and ink shell at each thigh root are inside the union. Suppress
 // their upper surface, retaining the visible leg from mid-thigh downward.
 for(const side of sides)actor.limbs[side+'Leg'].mesh.visible=false;
 actor.anatomy.priorPelvis=prior;actor.anatomy.pelvis=mesh;actor.anatomy.connected=true;
 return mesh;
}
