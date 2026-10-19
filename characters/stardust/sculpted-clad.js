import * as THREE from 'three';

// A closed, double-curved metal shell. The inner wall has its own outward
// winding; FrontSide is sufficient from both outside and the open underside.
export function closedShell(surface,sign,thickness=.007,nu=32,nv=32){
 const p=[],uv=[],ix=[],N=(nu+1)*(nv+1),eps=.0001;
 for(let layer=0;layer<2;layer++)for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){
  const u=i/nu,v=j/nv,q=surface(u,v);
  const du=surface(Math.min(1,u+eps),v).sub(surface(Math.max(0,u-eps),v));
  const dv=surface(u,Math.min(1,v+eps)).sub(surface(u,Math.max(0,v-eps)));
  const n=du.cross(dv).normalize().multiplyScalar(sign);
  q.addScaledVector(n,-layer*thickness);p.push(q.x,q.y,q.z);uv.push(u,v);
 }
 const tri=(a,b,c,reverse=false)=>ix.push(a,reverse?c:b,reverse?b:c);
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){
  const a=i*(nv+1)+j,b=a+nv+1,c=b+1,d=a+1;
  tri(a,b,d,sign<0);tri(b,c,d,sign<0);
  tri(a+N,b+N,d+N,sign>0);tri(b+N,c+N,d+N,sign>0);
 }
 // Perimeter in the same winding as the outward surface, with four sealed edges.
 const edge=[];
 for(let i=0;i<=nu;i++)edge.push(i*(nv+1));
 for(let j=1;j<=nv;j++)edge.push(nu*(nv+1)+j);
 for(let i=nu-1;i>=0;i--)edge.push(i*(nv+1)+nv);
 for(let j=nv-1;j>0;j--)edge.push(j);
 for(let k=0;k<edge.length;k++){
  const a=edge[k],b=edge[(k+1)%edge.length];tri(b,a,a+N,sign<0);tri(b,a+N,b+N,sign<0);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
 g.userData.closedArmor=true;return g;
}
function metal(parent,g,color,name,polished=true){
 const m=new THREE.Mesh(g,new THREE.MeshToonMaterial({color}));m.name=name;
 m.userData.palaceMetal=true;m.userData.polishedArmor=polished;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function rim(parent,points,color,name,r=.0028){
 return metal(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),96,r,8,false),color,name);
}

export function sculptPalaceShoulders(actor,fire){
 for(const pd of actor.pauldronGroups){
  // Remove the obsolete shell's glow seams from the updater as well as hiding
  // its meshes; otherwise applyCladState makes the floating rings visible again.
  const old=new Set();pd.g.traverse(o=>old.add(o));
  for(const part of actor.cladParts){part.seams=part.seams.filter(o=>!old.has(o));part.rings=part.rings.filter(o=>!old.has(o));}
  for(const c of pd.g.children)c.visible=false;
  const {sign:s,li:k}=pd,big=!fire&&s<0;
  const shell=new THREE.Group();shell.name='sculpted-shoulder';pd.g.add(shell);
  const surface=(u,v)=>{
   const a=-.22+v*(Math.PI+.44),tip=1-.88*Math.pow(u,5);
   const w=(k?.112:.130)*(.68+.38*Math.sin(Math.PI*u))*tip;
   const h=(k?.067:.096)*(.82+.20*Math.sin(Math.PI*u))*tip;
   const x=-.022+(big?.30:fire?.245:.22)*u+k*.018;
   const y=-.040-k*.048+.072*u*u+(big?.14:0)*Math.pow(u,4)+h*Math.sin(a);
   return new THREE.Vector3(s*x,y,w*Math.cos(a)-u*.008);
  };
  const color=fire?(k?'#a96a32':'#e7bc75'):(k?'#41465f':'#929ab8');
  const m=metal(shell,closedShell(surface,s),color,`shoulder-${pd.side}-${k}`);
  m.userData.armorShell=true;
  // One rolled front/back edge; the large reflective surfaces remain readable.
  const boundary=[];
  for(let i=0;i<=40;i++)boundary.push(surface(i/40,0));
  for(let j=1;j<=32;j++)boundary.push(surface(1,j/32));
  for(let i=39;i>=0;i--)boundary.push(surface(i/40,1));
  rim(shell,boundary,fire?'#f3d69b':'#c8d6e6',`shoulder-rim-${pd.side}-${k}`,.0032);
  if(!k){
   // Short low-relief crest follows the same surface, never a flat overlay.
   for(const v of [.20,.80])rim(shell,Array.from({length:23},(_,i)=>surface(.18+i/22*.60,v).add(new THREE.Vector3(0,.0018,0))),fire?'#c58f49':'#68799a',`shoulder-flute-${pd.side}`, .0018);
  }
 }
}

export function closePalaceShield(actor){
 const dome=actor.shieldDome;if(!dome)return;
 // Keep the original +Y crown, .27 radius, .32 flattening, mount and contact
 // coordinates. Return from rim to pole along a separate concave inner wall.
 const profile=[];
 for(let i=0;i<=48;i++){const a=i/48*Math.PI/2;profile.push(new THREE.Vector2(.27*Math.sin(a),.27*Math.cos(a)));}
 profile.push(new THREE.Vector2(.258,0));
 for(let i=47;i>=0;i--){const a=i/48*Math.PI/2;profile.push(new THREE.Vector2(.258*Math.sin(a),.252*Math.cos(a)));}
 // LatheGeometry expects the lower-to-upper meridian winding.
 dome.geometry=new THREE.LatheGeometry(profile.reverse(),96);dome.geometry.userData.closedArmor=true;
 dome.name='closed-shield';dome.userData.palaceMetal=true;dome.userData.polishedArmor=true;
 const trim='#e4bf79';
 const lip=new THREE.TorusGeometry(.265,.005,12,96);lip.rotateX(Math.PI/2);
 metal(dome,lip,trim,'shield-rolled-rim');
 // Opaque backing ribs identify the concave inside when the shield turns.
 for(const azimuth of [0,Math.PI/2]){
  const points=Array.from({length:49},(_,i)=>{const r=-.235+i/48*.47;return new THREE.Vector3(Math.cos(azimuth)*r,Math.sqrt(.258*.258-r*r)*(.252/.258)-.008,Math.sin(azimuth)*r);});
  rim(dome,points,'#806448','shield-inner-rib',.006);
 }
 return dome;
}
