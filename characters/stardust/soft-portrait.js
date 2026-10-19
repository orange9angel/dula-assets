import * as THREE from 'three';
const TAU=Math.PI*2,clamp=THREE.MathUtils.clamp,mix=THREE.MathUtils.lerp;
const key=new THREE.Vector3(-.32,.70,.78).normalize();

// The face keeps its animated drawing. A broad form light is separated from
// the smaller drawn nose/lip planes, avoiding a hard polygon across the muzzle.
function skinLight(source){
 const m=source.clone();
 m.onBeforeCompile=s=>{
  s.uniforms.softKey={value:key};
  s.vertexShader='varying vec3 softNormal;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 sn=normal;sn.x*=.68;sn.z=mix(sn.z,max(sn.z,.58),smoothstep(.04,.11,position.z));
   softNormal=normalize(mat3(modelMatrix)*normalize(sn));`);
  s.fragmentShader='varying vec3 softNormal;uniform vec3 softKey;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float nd=dot(normalize(softNormal),softKey);
   float shade=1.-smoothstep(-.22,.24,nd);
   float halftone=(1.-smoothstep(.22,.65,nd))*(1.-shade);
   diffuseColor.rgb*=mix(vec3(1.),vec3(.76,.67,.74),shade*.76);
   diffuseColor.rgb*=1.-halftone*.055;`);
 };m.customProgramCacheKey=()=> 'soft-portrait-skin-v1';m.needsUpdate=true;return m;
}
function hairMaterial(fire){
 const m=new THREE.MeshBasicMaterial({color:fire?'#56383c':'#28374c',vertexColors:true});
 m.onBeforeCompile=s=>{
  s.uniforms.hairKey={value:key};
  s.vertexShader='varying vec3 hairN;varying vec2 hairUV;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nhairN=normalize(mat3(modelMatrix)*normal);hairUV=uv;');
  s.fragmentShader='varying vec3 hairN;varying vec2 hairUV;uniform vec3 hairKey;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float light=smoothstep(-.12,.66,dot(normalize(hairN),hairKey));
   float sheen=pow(max(0.,dot(normalize(hairN),hairKey)),5.)*.14;
   float strand=pow(.5+.5*sin(hairUV.y*67.+sin(hairUV.x*5.)*1.2),22.);
   float ends=smoothstep(.06,.25,hairUV.x)*(1.-smoothstep(.66,.98,hairUV.x));
   diffuseColor.rgb*=.61+.62*light;
   diffuseColor.rgb+=vec3(${fire?'.28,.17,.14':'.13,.22,.33'})*(sheen+strand*ends*.055);`);
 };m.customProgramCacheKey=()=>`soft-lock-${fire}`;return m;
}

function lock(root,points,width,depth,mat,name,normalHint){
 points=points.map(p=>[...p]);points[0]=[points[0][0]*.80,.082+(points[0][1]-.082)*.80,-.018+(points[0][2]+.018)*.80];
 const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),N=36,M=16,pos=[],uv=[],color=[],ix=[];
 const ts=Array.from({length:N+1},(_,i)=>c.getTangent(i/N));
 let x=new THREE.Vector3(...normalHint).cross(ts[0]).normalize();if(x.lengthSq()<.01)x.set(1,0,0);
 for(let i=0;i<=N;i++){
  const u=i/N,p=c.getPoint(u),t=ts[i];if(i)x.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(ts[i-1],t));
  const z=t.clone().cross(x).normalize();
  // Broad middle, buried narrow root, and a fine tip. No cylindrical root cap
  // sits above the scalp and no identical end curl is repeated around the head.
  const w=width*(.54+.64*Math.sin(Math.PI*u*.92))*Math.pow(1-u,.68)*THREE.MathUtils.smoothstep(u,0,.13)+.00004;
  for(let j=0;j<=M;j++){
   const a=j/M*TAU,sn=Math.sin(a),q=p.clone().addScaledVector(x,Math.cos(a)*w).addScaledVector(z,sn*w*depth);
   pos.push(...q.toArray());uv.push(u,j/M);
   const v=.80+.20*Math.sin(Math.PI*Math.min(1,u*1.3));color.push(v,v,v);
   if(i<N&&j<M){const k=i*(M+1)+j;ix.push(k,k+1,k+M+1,k+1,k+M+2,k+M+1);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.setIndex(ix);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat);m.name=name;m.castShadow=true;root.add(m);return m;
}

function softHair(actor,fire){
 actor.shadedPortrait.hair.visible=false;
 const root=new THREE.Group();root.name=fire?'short-tousled-hair':'long-side-parted-hair';actor.headGroup.add(root);
 const mat=hairMaterial(fire),cap=actor.palacePortrait.hair.children[0].clone();cap.geometry=cap.geometry.clone();cap.scale.set(.97,.97,.97);
 const count=cap.geometry.attributes.position.count,colors=new Float32Array(count*3);colors.fill(.84);cap.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));cap.material=mat;root.add(cap);
 const L=(p,w,name,n=[0,0,1],d=.32)=>lock(root,p,w,d,mat,name,n);
 const scalp=(theta,a,pad=0)=>[(.151+pad)*Math.sin(theta)*Math.sin(a),.082+(.204+pad)*Math.cos(theta),(.164+pad)*Math.sin(theta)*Math.cos(a)-.018];
 // Layered scalp groups continue around the ears and back. Distinct cuts use
 // different lengths and fall directions, rather than recolouring one crown.
 for(let i=0;i<15;i++){
  const a=.72+i/14*(TAU-1.44),side=Math.sin(a),back=Math.max(0,-Math.cos(a));
  const end=1.55+back*(fire?1.14:1.18)+.06*Math.sin(i*1.73),start=.32+.12*Math.sin(i*2.1),drift=fire?.09*Math.sin(i*1.7):-.18;
  const p0=scalp(start,a,-.010),p1=scalp(.80,a+drift,.009),p2=scalp(end-.28,a+drift,.012),p3=scalp(end,a+drift,.009);
  if(fire){p3[0]+=side*(.018+.009*Math.sin(i*2.3));p3[1]+=.015-.030*back;p3[2]-=.018*back;}
  else{p3[0]+=side*.019;p3[1]-=.028*back;p3[2]-=.012*back;}
  L([p0,p1,p2,p3],.026+.009*(.5+.5*Math.sin(i*2.4)),`scalp-soft-${i}`,[Math.sin(a),.3,Math.cos(a)],.33);
 }
 if(fire){
  L([[-.04,.224,.012],[-.035,.255,.088],[.009,.204,.151],[-.022,.106,.148]],.049,'hero-central-fringe');
  L([[-.052,.215,.018],[-.102,.233,.092],[-.139,.173,.121],[-.151,.107,.075]],.045,'hero-left-fringe');
  L([[.001,.234,.017],[.078,.246,.096],[.125,.177,.127],[.153,.144,.073]],.050,'hero-right-fringe');
  L([[-.038,.224,-.025],[-.076,.280,-.034],[-.123,.266,-.073],[-.159,.219,-.109]],.048,'hero-loose-crown-left',[0,1,.3]);
  L([[.005,.231,-.027],[.040,.290,-.052],[.089,.278,-.095],[.118,.227,-.149]],.046,'hero-loose-crown-right',[0,1,.3]);
  L([[-.023,.216,-.073],[.006,.269,-.131],[.044,.268,-.190],[.073,.240,-.213]],.045,'hero-back-volume',[0,1,-.4]);
  for(const sign of [-1,1]){
   L([[sign*.082,.183,-.030],[sign*.157,.208,-.069],[sign*.188,.179,-.117],[sign*.210,.199,-.154]],.039,`hero-side-${sign}`,[sign,.5,0]);
   L([[sign*.101,.132,-.063],[sign*.161,.125,-.120],[sign*.182,.106,-.153],[sign*.194,.133,-.177]],.029,`hero-lower-side-${sign}`,[sign,.3,-.4]);
  }
 }else{
  L([[.045,.225,.018],[.021,.256,.105],[-.062,.193,.153],[-.108,.098,.136]],.058,'enemy-side-swept-fringe');
  L([[.020,.222,.008],[-.063,.230,.103],[-.129,.156,.123],[-.145,.044,.059]],.048,'enemy-long-left-fringe');
  L([[.058,.215,.018],[.114,.220,.075],[.151,.153,.094],[.146,.084,.046]],.040,'enemy-open-temple');
  L([[.028,.229,-.026],[.083,.265,-.070],[.122,.225,-.150],[.126,.153,-.214]],.055,'enemy-swept-crown',[0,1,-.3]);
  L([[-.029,.229,-.026],[-.068,.256,-.086],[-.114,.216,-.162],[-.133,.144,-.211]],.048,'enemy-left-crown',[0,1,-.3]);
  for(const sign of [-1,1])L([[sign*.096,.126,-.065],[sign*.143,.099,-.129],[sign*.139,-.005,-.170],[sign*.160,-.086,-.181]],.038,`enemy-nape-${sign}`,[sign,.1,-.5]);
 }
 return root;
}

function earAnatomy(actor,fire){
 const old=actor.headGroup.children.filter(m=>m.isMesh&&m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius===1);old.forEach(m=>m.visible=false);
 const root=new THREE.Group();root.name='sculpted-ear-pair';actor.headGroup.add(root);
 const skin=skinLight(new THREE.MeshBasicMaterial({color:fire?'#f4cfa8':'#efe4e6'}));
 const inner=skinLight(new THREE.MeshBasicMaterial({color:fire?'#d5a68a':'#cbb3c1'}));
 for(const sign of [-1,1]){
  const side=new THREE.Group();side.position.set(sign*.110,.043,-.016);side.rotation.y=sign*.48;root.add(side);
  const g=new THREE.SphereGeometry(1,40,28),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,x*.020*(1+.12*y),y*.034,z*.010-(z>0?.004*Math.exp(-x*x*8-y*y*4):0));}g.computeVertexNormals();
  const bowl=new THREE.Mesh(g,skin);side.add(bowl);
  const cavity=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),inner);cavity.position.set(sign*.002,.002,.007);cavity.scale.set(.010,.021,.003);side.add(cavity);
  const curve=(pts,r,mat)=>{const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(sign*v[0],v[1],v[2]))),36,r,8,false),mat);side.add(m);};
  curve([[-.008,-.013,.008],[-.014,.009,.009],[-.008,.027,.009],[.007,.028,.008],[.016,.013,.007],[.014,-.007,.007],[.007,-.026,.006]],.0026,skin);
  curve([[.005,-.017,.010],[.007,-.004,.011],[.001,.005,.012],[.006,.017,.011]],.0020,skin);
  curve([[.001,.005,.012],[-.005,.014,.011]],.0017,skin);
  const tragus=new THREE.Mesh(new THREE.SphereGeometry(.004,16,12),skin);tragus.position.set(-sign*.008,-.006,.013);side.add(tragus);
 }
 return root;
}

function features(ctx,state,fire,localKey){
 const g=ctx,skin=fire?'#f4cfa8':'#efe4e6',line=fire?'#9b6e5b':'#97808c';
 g.save();g.setTransform(2,0,0,2,0,0);g.lineCap='round';
 // Nose ridge, side plane, alar fold and nostril stay small relative to the eyes.
 g.fillStyle=skin;g.fillRect(237,293,40,43);
 const dir=localKey.x<0?1:-1;
 g.save();g.translate(256,0);g.scale(dir,1);
 g.fillStyle=fire?'#d9af94':'#d0becb';g.beginPath();g.moveTo(2,299);g.quadraticCurveTo(3,310,9,317);g.lineTo(3,324);g.lineTo(15,324);g.quadraticCurveTo(12,315,7,310);g.closePath();g.fill();
 g.strokeStyle=line;g.lineWidth=1.3;g.beginPath();g.moveTo(4,312);g.quadraticCurveTo(9,318,3,321);g.stroke();
 g.beginPath();g.moveTo(-7,322);g.quadraticCurveTo(-3,320,-1,323);g.stroke();
 g.strokeStyle=fire?'#ffe1bb':'#fff3ed';g.lineWidth=1.7;g.beginPath();g.moveTo(-1,306);g.lineTo(0,314);g.stroke();g.restore();
 const jaw=clamp(Math.max(state.lip?.jaw??0,state.acting?.jawOverride??0),0,1),my=378;
 // Subtle lip planes supplement the existing animated opening, never replace it.
 const clearY=jaw<.035?my+4:my+4+jaw*38;
 g.fillStyle=skin;g.fillRect(230,clearY,53,Math.max(0,438-clearY));
 const lipY=my+8+jaw*38;
 g.strokeStyle=fire?'#c4957d':'#bc9ba7';g.lineWidth=1.5;g.beginPath();g.moveTo(247,lipY);g.quadraticCurveTo(256,lipY+2.7,266,lipY-.1);g.stroke();
 if(jaw<.035){g.strokeStyle=fire?'#fff0cc':'#fff6f1';g.lineWidth=1.2;g.beginPath();g.moveTo(250,my+4);g.quadraticCurveTo(256,my+5,261,my+3.8);g.stroke();}
 g.restore();
}

export function applySoftPortrait(actor){
 const fire=actor.palaceKind==='aoao',head=actor.headGroup;
 actor.face.skull.material=skinLight(actor.face.skull.material);
 const hair=softHair(actor,fire),ears=earAnatomy(actor,fire),q=new THREE.Quaternion(),localKey=key.clone();
 const previousPaint=actor.palacePortrait.afterPaint;
 actor.palacePortrait.afterPaint=(ctx,state)=>{previousPaint?.(ctx,state);head.getWorldQuaternion(q);localKey.copy(key).applyQuaternion(q.invert());features(ctx,state,fire,localKey);};
 actor.softPortrait={hair,ears,update(t){
  // Each main group moves as a connected tuft; roots stay buried. The motion is
  // bounded and absolute-time so reversing a shot cannot accumulate simulation.
  hair.children.forEach((m,i)=>{if(i===0)return;const amount=fire?.010:.014;m.rotation.z=Math.sin(t*1.45+i*.93)*amount;m.rotation.x=Math.sin(t*1.17+i*1.3)*amount*.45;});
 }};
 return actor.softPortrait;
}
