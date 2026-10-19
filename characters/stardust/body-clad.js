import * as THREE from 'three';
import {ringsGeometry} from '../../lib/craft3d/surface.js';
const mix=THREE.MathUtils.lerp,clamp=x=>THREE.MathUtils.clamp(x,0,1),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function metal(root,g,color,name){const m=new THREE.Mesh(g,new THREE.MeshToonMaterial({color}));m.name=name;m.userData.palaceMetal=true;m.userData.polishedArmor=true;m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
function line(root,p,c,name,r=.002){return metal(root,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p),64,r,8,false),c,name);}

// A continuous front/back cuirass with a neck opening and two actual armholes.
// Boundary edges of the cut surface are sealed to the inner wall, including the
// armholes. The shoulder bridges continue under the animated outer pauldrons.
export function applyPalaceCuirass(actor,{integratedShoulders=false,signature=false}={}){
 const fire=actor.palaceKind==='aoao',d=actor.dimsRef,cy=d.chestY,shoulder=d.shoulderY;
 const root=actor.cladParts.find(p=>p.ord===1).groups[0],old=new THREE.Group();old.name='legacy-chest-plates';
 for(const c of [...root.children])if(c.isMesh||c.isGroup)old.add(c);root.add(old);old.visible=false;
 const archived=new Set();old.traverse(o=>archived.add(o));for(const p of actor.cladParts){p.seams=p.seams.filter(m=>!archived.has(m));p.rings=p.rings.filter(m=>!archived.has(m));}
 const bottom=d.hipIdle+.138,top=shoulder+.068,rows=64,sides=96,N=(rows+1)*sides,positions=[],uv=[],indices=[];
 const levels=integratedShoulders?
  [[bottom,fire?.139:.125,fire?.107:.101],[cy-.08,fire?.140:.126,fire?.112:.102],[cy+.045,fire?.182:.160,fire?.132:.120],[shoulder-.070,fire?.204:.188,.118],[shoulder-.005,fire?.286:.279,fire?.119:.108],[shoulder+.034,fire?.238:.226,.088],[top,.064,.061]]:
  [[bottom,fire?.139:.125,fire?.107:.101],[cy-.08,fire?.140:.126,fire?.112:.102],[cy+.045,fire?.180:.158,fire?.126:.116],[shoulder-.015,fire?.164:.148,.106],[shoulder+.029,fire?.161:.146,.089],[top,.064,.061]];
 const profile=y=>{for(let i=1;i<levels.length;i++)if(y<=levels[i][0]){const q=smooth((y-levels[i-1][0])/(levels[i][0]-levels[i-1][0]));return [mix(levels[i-1][1],levels[i][1],q),mix(levels[i-1][2],levels[i][2],q)];}return levels.at(-1).slice(1);};
 const surface=(u,a,inset=0)=>{
  const y=mix(bottom,top,u),[rx,rz]=profile(y),front=Math.max(0,Math.cos(a));
  const upper=smooth((y-shoulder+.10)/.09),outer=smooth((Math.abs(Math.sin(a))-.38)/.56);
  const x=(rx-inset)*Math.sin(a)*(fire?1:1-.08*Math.sin(a)*Math.sin(Math.PI*u))*(signature?1+upper*outer*(fire?.075:-.10):1);
  const pec=(fire?.026:.014)*Math.exp(-Math.pow((y-cy-.045)/.085,2))*front**3*(fire?(.65+.35*Math.exp(-Math.pow((Math.abs(x)-.075)/.05,2))):1);
  const keel=(fire?.003:.010)*Math.exp(-Math.pow((a%(Math.PI*2))/.20,2))*Math.sin(Math.PI*u)**2;
  const wing=integratedShoulders?smooth((Math.abs(x)-.11)/.16)*smooth((y-shoulder+.10)/.08):0;
  const crest=signature?(fire?.012:.027)*front**(fire?4:16)*Math.sin(Math.PI*u)**2:0;
  return new THREE.Vector3(x,y+wing*(signature?(fire?.030:x<0?.180:.145):(fire?.075:x<0?.135:.075)),(rz-inset)*Math.cos(a)+pec+keel+crest);
 };
 for(let l=0;l<2;l++)for(let i=0;i<=rows;i++)for(let j=0;j<sides;j++){const p=surface(i/rows,j/sides*Math.PI*2,l*.006);positions.push(p.x,p.y,p.z);uv.push(j/sides,i/rows);}
 const edges=new Map(),tri=(a,b,c)=>{indices.push(a,b,c);for(const [x,y] of [[a,b],[b,c],[c,a]]){const key=x<y?x+':'+y:y+':'+x;const old=edges.get(key);if(old)old.count++;else edges.set(key,{a:x,b:y,count:1});}};
 for(let i=0;i<rows;i++)for(let j=0;j<sides;j++){
  const a=(j+.5)/sides*Math.PI*2,y=mix(bottom,top,(i+.5)/rows),sideAngle=Math.min(Math.abs(a-Math.PI/2),Math.abs(a-3*Math.PI/2));
  if((sideAngle/(integratedShoulders?.72:.64))**2+((y-(shoulder-(integratedShoulders?.105:.078)))/(integratedShoulders?.095:.105))**2<1)continue;
  const q=i*sides+j,b=q+sides,c=i*sides+(j+1)%sides,e=c+sides;tri(q,c,b);tri(b,c,e);
 }
 const outer=[...indices];for(let i=0;i<outer.length;i+=3)indices.push(outer[i]+N,outer[i+2]+N,outer[i+1]+N);
 for(const {a,b,count} of edges.values())if(count===1)indices.push(b,a,a+N,b,a+N,b+N);
 // Round the sampled armhole boundary without changing its sealed topology.
 const neighbors=new Map();for(const {a,b,count} of edges.values())if(count===1&&a>=sides&&b>=sides&&a<rows*sides&&b<rows*sides){for(const [x,y] of [[a,b],[b,a]]){if(!neighbors.has(x))neighbors.set(x,[]);neighbors.get(x).push(y);}}
 for(let pass=0;pass<4;pass++){const prior=[...positions];for(const [i,ns] of neighbors)for(let c=0;c<3;c++){const delta=(ns.reduce((n,j)=>n+prior[j*3+c],0)/ns.length-prior[i*3+c])*.5;positions[i*3+c]+=delta;positions[(i+N)*3+c]+=delta;}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();geo.userData.closedArmor=true;
 const main=fire?'#dcb56e':'#72809e',edge=fire?'#f4d99a':'#d3deed',dark=fire?'#996633':'#39465f';
 const shell=metal(root,geo,main,fire?'hearth-connected-cuirass':'crescent-connected-cuirass');
 const at=(y,a,offset=.002)=>surface((y-bottom)/(top-bottom),a).add(new THREE.Vector3(0,0,offset));
 for(const u of [0,1])line(root,Array.from({length:97},(_,i)=>surface(u,i/96*Math.PI*2)),edge,'cuirass-sealed-rim',.0023);
 // Broad round breast arcs on the hero; a long oblique split on the adversary.
 if(fire){
  for(const sign of [-1,1]){
   line(root,Array.from({length:25},(_,i)=>{const u=i/24;return at(cy-.045+.095*u*u,sign*(.10+1.02*u));}),edge,'hearth-breast-arc',.003);
   line(root,Array.from({length:20},(_,i)=>{const u=i/19;return at(cy+.11+u*.08,sign*(.3+.55*u));}),edge,'hearth-shoulder-bridge',.002);
  }
  const boss=metal(root,new THREE.SphereGeometry(.042,32,20),edge,'hearth-round-boss');boss.scale.z=.25;boss.position.copy(at(cy+.015,0,.003));
 }else{
  for(const offset of [-.08,.0,.08])line(root,Array.from({length:40},(_,i)=>{const u=i/39;return at(cy-.14+u*.29,-.70+u*1.10+offset);}),offset===0?edge:dark,'crescent-oblique-rib',offset===0?.004:.002);
  const moon=metal(root,new THREE.TorusGeometry(.035,.007,10,48,Math.PI*1.45),edge,'crescent-chest-sigil');moon.position.copy(at(cy+.01,0,.009));moon.rotation.z=.5;
 }
 const gems=actor.cladParts.find(p=>p.ord===1).gems;for(const gem of gems)if(archived.has(gem)){root.add(gem);gem.position.copy(at(cy+.015,0,.016));}
 if(integratedShoulders){
  // Shoulder wings are part of this same sealed shell. The former independent
  // bowls are hidden after all growth updaters, rather than stacked underneath.
  const update=actor.updatePalaceClad.bind(actor),hide=()=>actor.pauldronGroups.forEach(pd=>pd.g.visible=false);
  actor.updatePalaceClad=(...args)=>{update(...args);hide();};hide();
  const rest=Float32Array.from(geo.attributes.position.array),position=geo.attributes.position;
  const oldPose=actor.setPose.bind(actor);
  actor.setPose=p=>{
   oldPose(p);
   for(let i=0;i<position.count;i++){
    const x=rest[i*3],y=rest[i*3+1],z=rest[i*3+2],side=x<0?'left':'right',a=p[side+'Arm'];
    const lift=a?clamp((a[1].y-a[0].y)/Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y,a[1].z-a[0].z)+.70,0,1):0;
    const w=smooth((Math.abs(x)-.145)/.20)*smooth((y-shoulder+.11)/.14);
    position.setXYZ(i,x,y+lift*w*.065,z);
   }
   position.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();
  };
 }
 actor.cuirass={shell,root,surface,bottom,top,integratedShoulders};return actor.cuirass;
}

// Pelvis and upper legs share the retained hip/knee joints. The pelvis is a
// sculpted clothed volume, with paired gluteal bulges and a rounded crotch;
// lower vertices follow the squat's posterior hip shift, waist stays attached.
export function applyPalaceAnatomy(actor){
 const fire=actor.palaceKind==='aoao',hip=actor.dimsRef.hipIdle,k=fire?1:.91;
 for(const side of ['left','right']){
  const leg=actor.limbs[side+'Leg'];leg.radii=[[0,.097*k],[.12,.108*k],[.24,.099*k],[.36,.080*k],[.45,.057*k],[.51,.051*(fire?1:.81)],[.61,.065*(fire?1:.81)],[.70,.063*(fire?1:.81)],[.86,.043*(fire?1:.81)],[1,.037*(fire?1:.81)]];leg.depth=1.08;leg.mesh.name=side+'-anatomical-leg';
 }
 const geometry=new THREE.SphereGeometry(1,64,40),pos=geometry.attributes.position;
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),xx=x*.169*k;
  const rear=Math.max(0,-z),lobe=Math.exp(-Math.pow((Math.abs(xx)-.077*k)/(.059*k),2))*Math.exp(-Math.pow((y+.15)/.66,2));
  const crease=.016*Math.exp(-Math.pow(xx/.026,2))*Math.exp(-Math.pow((y+.2)/.63,2));
  pos.setXYZ(i,xx,hip+.015+y*.151,z*(z<0?.126:.100)*k-.013-.035*rear*lobe+crease*rear);
 }
 geometry.computeVertexNormals();const base=Float32Array.from(pos.array);
 const material=new THREE.MeshStandardMaterial({color:fire?'#493d36':'#30364b',roughness:.86,metalness:0});
 const pelvis=new THREE.Mesh(geometry,material);pelvis.name='clothed-anatomical-pelvis';pelvis.castShadow=true;actor.body.add(pelvis);
 // Remove the old straight shirt hem below the waist, which cut across hips.
 const start=hip+.055,[rx,rz]=actor.profileAt(start),levels=[[start,rx,rz],...actor.torsoProfile.filter(p=>p[0]>start)];
 actor.torso.geometry=ringsGeometry(levels);for(const c of actor.torso.children)if(c.isMesh)c.geometry=actor.torso.geometry;
 for(const side of ['left','right'])actor.limbs[side+'Leg'].mesh.material=material;
 const oldPose=actor.setPose.bind(actor);
 actor.setPose=p=>{
  oldPose(p);const offset=p.pelvisOffset??{x:0,z:0};
  for(let i=0;i<pos.count;i++){
   const x=base[i*3],y=base[i*3+1],z=base[i*3+2],w=1-smooth((y-hip-.015)/.10);
   pos.setXYZ(i,x+offset.x*w,y,z+offset.z*w);
  }
  pos.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();actor.mesh.updateMatrixWorld(true);
 };
 actor.anatomy={pelvis,hip};return actor.anatomy;
}
