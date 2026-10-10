// craft3d/surface.js — 程序化三维积木：曲面肢体与共享 toon 表面。
// 自 dula-story craft_trial/character3d.js 晋升（已验收实现，原样搬运）；
// 角色专属调色板与角色构建逻辑留在各 episode，本模块只含通用积木。
// 浏览器侧经 import map 解析 'three'，不走 dula-engine Registry。
import * as THREE from 'three';

const V=p=>new THREE.Vector3(p.x,p.y,p.z??0);
// 3 阶 toon ramp（NearestFilter 双滤镜缺一不可，渐变即软明暗）。
const ramp=new THREE.DataTexture(new Uint8Array([150,227,255]),3,1,THREE.RedFormat);
ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
const materials=new Map();
export function mat(color){
  if(!materials.has(color))materials.set(color,new THREE.MeshToonMaterial({color,gradientMap:ramp,emissive:color,emissiveIntensity:.14}));
  return materials.get(color);
}
// 轮廓墨线：法线外扩壳，BackSide，暖近黑（非纯黑）。
const ink=new THREE.MeshBasicMaterial({color:'#382d38',side:THREE.BackSide});
ink.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\ntransformed += normalize(normal) * 0.003;');
};
ink.customProgramCacheKey=()=> 'craft-contour-v1';
// 开口关节轮廓：按顶点 contour 属性加权，端环不描边（端帽被肩/髋/手/鞋遮盖）。
export const jointInk=ink.clone();
jointInk.onBeforeCompile=shader=>{
  shader.vertexShader='attribute float contour;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\ntransformed += normalize(normal) * (0.003 * contour);');
};
jointInk.customProgramCacheKey=()=> 'craft-open-joint-contour-v1';

export function mesh(parent,geometry,material,outline=true){
  const m=new THREE.Mesh(geometry,typeof material==='string'?mat(material):material);
  m.castShadow=true;m.receiveShadow=false;parent.add(m);
  if(outline){const edge=new THREE.Mesh(geometry,ink);edge.castShadow=false;m.add(edge);}
  return m;
}
export function ellipsoid(parent,center,radii,color,outline=true){
  const g=new THREE.SphereGeometry(1,40,28);g.scale(...radii);
  const m=mesh(parent,g,color,outline);m.position.set(...center);return m;
}

// Connected rings, shared vertices and one silhouette. Upper/lower axes remain
// straight except for a short rounded elbow/knee transition (not a global spline).
export class LimbSurface {
  constructor(parent,color,radii,{start=0,end=1,depth=.9}={}){
    this.radii=radii;this.start=start;this.end=end;this.depth=depth;
    this.rings=48;this.sides=24;
    const n=(this.rings+1)*this.sides,g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));
    const contour=new Float32Array(n);
    for(let i=0;i<=this.rings;i++)for(let j=0;j<this.sides;j++)contour[i*this.sides+j]=Math.min(1,i/2,(this.rings-i)/2);
    g.setAttribute('contour',new THREE.BufferAttribute(contour,1));
    const index=[];
    for(let i=0;i<this.rings;i++)for(let j=0;j<this.sides;j++){
      const a=i*this.sides+j,b=(i+1)*this.sides+j,c=i*this.sides+(j+1)%this.sides,d=(i+1)*this.sides+(j+1)%this.sides;
      index.push(a,c,b,c,d,b);
    }
    // End caps are concealed under shoulder/hip, hand and shoe overlaps.
    for(let j=1;j<this.sides-1;j++)index.push(0,j+1,j,n-this.sides,n-this.sides+j,n-this.sides+j+1);
    g.setIndex(index);this.geometry=g;this.mesh=mesh(parent,g,color);
    this.mesh.children[0].material=jointInk;
    this.mesh.frustumCulled=false;this.mesh.children[0].frustumCulled=false;
  }
  radius(t){
    const a=this.radii;
    for(let i=1;i<a.length;i++)if(t<=a[i][0]){
      const u=(t-a[i-1][0])/(a[i][0]-a[i-1][0]);
      const s=u*u*(3-2*u);return THREE.MathUtils.lerp(a[i-1][1],a[i][1],s);
    }return a.at(-1)[1];
  }
  update(points){
    const [a,b,c]=points.map(V),ab=b.clone().sub(a),bc=c.clone().sub(b);
    const l1=ab.length(),l2=bc.length(),total=l1+l2,blend=Math.min(l1,l2)*.12;
    ab.normalize();bc.normalize();
    const entry=b.clone().addScaledVector(ab,-blend),exit=b.clone().addScaledVector(bc,blend);
    const center=u=>{
      const d=u*total;
      if(d<l1-blend)return a.clone().addScaledVector(ab,d);
      if(d>l1+blend)return b.clone().addScaledVector(bc,d-l1);
      const s=(d-l1+blend)/(2*blend);
      return entry.clone().multiplyScalar((1-s)**2).addScaledVector(b,2*s*(1-s)).addScaledVector(exit,s*s);
    };
    const p=this.geometry.attributes.position;
    for(let i=0;i<=this.rings;i++){
      const u=THREE.MathUtils.lerp(this.start,this.end,i/this.rings),o=center(u);
      const axis=center(Math.min(1,u+.0005)).sub(center(Math.max(0,u-.0005))).normalize();
      const ref=Math.abs(axis.z)>.95?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
      const x=ref.cross(axis).normalize(),z=axis.clone().cross(x).normalize(),r=this.radius(u);
      for(let j=0;j<this.sides;j++){
        const theta=j/this.sides*Math.PI*2;
        const q=o.clone().addScaledVector(x,r*Math.cos(theta)).addScaledVector(z,r*this.depth*Math.sin(theta));
        p.setXYZ(i*this.sides+j,q.x,q.y,q.z);
      }
    }
    p.needsUpdate=true;this.geometry.computeVertexNormals();this.geometry.computeBoundingSphere();
  }
}

export function ringsGeometry(levels,{pleats=0,faceUV=false}={}){
  const sides=80,pos=[],uv=[],index=[];
  levels.forEach(([y,rx,rz,zc=0],i)=>{
    for(let j=0;j<=sides;j++){
      const theta=j/sides*Math.PI*2,x=rx*Math.sin(theta),front=Math.cos(theta);
      const mod=1+pleats*Math.cos(theta*10),z=zc+rz*front*mod;
      pos.push(x*mod,y,z);
      uv.push(faceUV&&front<0?.015:.5+x/.70,faceUV&&front<0?.985:.5+y/.70);
      if(i<levels.length-1&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;index.push(a,a+1,b,a+1,b+1,b);}
    }
  });
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
}
export function shoeGeometry(){
  const pos=[],idx=[],rows=[[-.073,.001,-.048],[-.062,.043,.028],[-.04,.053,.043],
    [0,.056,.037],[.045,.063,.007],[.10,.057,-.017],[.137,.036,-.035],[.150,.001,-.055]];
  const n=32,bottom=-.081;
  rows.forEach(([z,w,top],i)=>{
    for(let j=0;j<n;j++){
      const a=j/n*Math.PI*2;pos.push(w*Math.sin(a),bottom+(top-bottom)*(Math.cos(a)+1)/2,z);
      if(i<rows.length-1){const k=i*n+j,l=i*n+(j+1)%n;idx.push(k,k+n,l,l,k+n,l+n);}
    }
  });
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
