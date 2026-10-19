import * as THREE from 'three';
const TAU=Math.PI*2,clamp=THREE.MathUtils.clamp;

// A restrained two-value key on the existing face surface. Lighting lives in
// world space: turning the head changes the lit cheek without moving the eyes.
function celKey(material,{hair=false,key=new THREE.Vector3(-.20,.55,.82).normalize(),shadow='#95645c'}={}){
 const m=material.clone(),u={key:{value:key.clone()},shadow:{value:new THREE.Color(shadow)},flash:{value:0}};
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{portraitKey:u.key,portraitShadow:u.shadow,portraitFlash:u.flash});
  s.vertexShader='varying vec3 portraitNormal; varying vec3 portraitLocal;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nportraitNormal=normalize(mat3(modelMatrix)*normal);portraitLocal=position;');
  s.fragmentShader='varying vec3 portraitNormal;varying vec3 portraitLocal;uniform vec3 portraitKey,portraitShadow;uniform float portraitFlash;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float nd=dot(normalize(portraitNormal),portraitKey);
   float shade=1.0-smoothstep(${hair?'.10,.25':'.015,.095'},nd);
   vec3 multiplier=mix(vec3(1.0),portraitShadow,shade*${hair?'.48':'.49'});
   diffuseColor.rgb*=multiplier;
   diffuseColor.rgb+=vec3(1.0,.50,.16)*portraitFlash*.12;
  `);
 };
 m.customProgramCacheKey=()=>`palace-cel-key-${hair}`;m.needsUpdate=true;
 return {material:m,uniforms:u};
}

function flowingLock(root,points,width,depth,material,name){
 points=points.map(p=>[...p]);
 points[0]=[points[0][0]*.76,.082+(points[0][1]-.082)*.76,-.018+(points[0][2]+.018)*.76];
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),pos=[],uv=[],colors=[],ix=[],N=30,M=14;
 const base=new THREE.Color('#ffffff'),shade=new THREE.Color('#817784');
 const tangents=Array.from({length:N+1},(_,i)=>curve.getTangent(i/N));
 let axis=new THREE.Vector3(0,0,1).cross(tangents[0]).normalize();
 if(axis.lengthSq()<.01)axis.set(1,0,0);
 const frames=[];
 for(let i=0;i<=N;i++){
  const u=i/N,p=curve.getPoint(u),t=tangents[i];
  if(i)axis.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(tangents[i-1],t));
  const x=axis.clone().normalize(),z=t.clone().cross(x).normalize();
  const w=width*(.90+.16*Math.sin(Math.PI*u))*Math.pow(1-u,1.15)+.00003;
  frames.push({p,x,z,w});
  for(let j=0;j<=M;j++){
   const a=j/M*TAU,cs=Math.cos(a),sn=Math.sin(a),ridge=1+.16*Math.max(0,sn);
   const q=p.clone().addScaledVector(x,cs*w).addScaledVector(z,sn*w*depth*ridge);pos.push(...q.toArray());uv.push(u,j/M);
   const c=base.clone().lerp(shade,clamp((cs+.12)*.55,0,.62));colors.push(c.r,c.g,c.b);
   if(i<N&&j<M){const k=i*(M+1)+j;ix.push(k,k+M+1,k+1,k+1,k+M+1,k+M+2);}
  }
 }
 const center=pos.length/3;pos.push(...curve.getPoint(0).toArray());uv.push(0,.5);colors.push(shade.r,shade.g,shade.b);
 for(let j=0;j<M;j++)ix.push(center,j+1,j);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
 const mesh=new THREE.Mesh(g,material);mesh.name=name;root.add(mesh);
 // Fine strands follow the transported surface, so curved tips do not twist
 // into leaves. Sparse broken highlights describe the same main hair flow.
 const dark=new THREE.Color(material.color).multiplyScalar(.70),lit=new THREE.Color(material.color).lerp(new THREE.Color('#a3a0b7'),.17);
 for(const [j,offset] of [-.48,.02,.48].entries()){
  const points=[];const start=j===1?4:2,end=j===1?25:28;
  for(let i=start;i<=end;i++){
   const {p,x,z,w}=frames[i],sn=Math.sqrt(1-offset*offset);
   points.push(p.clone().addScaledVector(x,offset*w).addScaledVector(z,(sn*w*depth*(1+.16*sn)+.00035)));
  }
  const line=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),26,j===1?.00056:.00040,4,false),new THREE.MeshBasicMaterial({color:j===1?lit:dark}));
  line.name=name+'-strand-'+j;root.add(line);
 }
 return mesh;
}

function flameHair(actor,fire){
 actor.palacePortrait.hair.visible=false;
 const root=new THREE.Group();root.name='flowing-volume-hair';actor.headGroup.add(root);
 const color=fire?'#503238':'#293b52',light=celKey(new THREE.MeshBasicMaterial({color,vertexColors:true,side:THREE.DoubleSide}),{hair:true,shadow:fire?'#69505f':'#50617b'});
 const material=light.material;
 const cap=actor.palacePortrait.hair.children[0].clone();cap.geometry=cap.geometry.clone();cap.scale.set(.99,.99,.99);cap.material=celKey(new THREE.MeshBasicMaterial({color}),{hair:true,shadow:fire?'#69505f':'#50617b'}).material;root.add(cap);
 // Retain the accepted scalp-root topology through the rear hemisphere. Sweep
 // its lower tips back, then layer the longer wind-lifted locks over it.
 for(const old of actor.palacePortrait.hair.children.filter(m=>m.name.startsWith('scalp-lock-'))){
  const m=old.clone();m.geometry=old.geometry.clone();m.material=celKey(old.material,{hair:true,shadow:fire?'#69505f':'#50617b'}).material;
  const p=m.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),w=THREE.MathUtils.smoothstep(.15-y,0,.23)*THREE.MathUtils.smoothstep(-z,-.01,.09);
   p.setXYZ(i,x*(1+.05*w),y+.054*w,z-.043*w);
  }
  p.needsUpdate=true;m.geometry.computeVertexNormals();m.name='rear-root-'+old.name;root.add(m);
 }
 const lock=(p,w,d,name)=>flowingLock(root,p,w,d,material,name);
 // Frontal groups retain the accepted eye openings; the central tip falls
 // between them. Each root starts inside the scalp, not outside a separate cap.
 if(fire){
  lock([[-.018,.245,.035],[-.036,.217,.118],[.010,.145,.160],[-.010,.076,.155]],.052,.43,'central-fringe');
  lock([[-.028,.244,.012],[-.102,.227,.099],[-.145,.170,.128],[-.186,.192,.112]],.054,.48,'left-fringe');
  lock([[.010,.244,.018],[.090,.229,.100],[.122,.163,.130],[.151,.176,.104]],.050,.48,'right-fringe');
  lock([[-.052,.225,-.025],[-.097,.274,-.018],[-.158,.320,-.074],[-.189,.355,-.120]],.043,.52,'left-crown-flame');
  lock([[-.014,.243,-.034],[.015,.285,-.051],[.071,.338,-.114],[.094,.376,-.165]],.044,.52,'crown-flame');
  lock([[.040,.218,-.061],[.107,.260,-.095],[.168,.304,-.156],[.191,.339,-.201]],.040,.52,'right-crown-flame');
 }else{
  lock([[-.020,.243,.032],[-.065,.207,.130],[-.042,.145,.159],[-.080,.091,.145]],.053,.43,'diagonal-fringe');
  lock([[.007,.242,.038],[.075,.225,.110],[.130,.155,.130],[.163,.172,.101]],.052,.45,'right-fringe');
  lock([[-.045,.231,.009],[-.105,.220,.092],[-.145,.159,.108],[-.172,.181,.068]],.044,.45,'left-fringe');
  lock([[-.054,.231,-.042],[-.035,.284,-.083],[.025,.338,-.149],[.063,.369,-.217]],.044,.52,'back-swept-crown');
  lock([[.031,.217,-.054],[.104,.257,-.108],[.169,.297,-.179],[.189,.330,-.233]],.041,.52,'right-crown-flame');
  lock([[-.071,.206,-.047],[-.129,.254,-.102],[-.180,.296,-.173],[-.197,.332,-.217]],.041,.52,'left-crown-flame');
 }
 for(const s of [-1,1]){
  for(let k=0;k<4;k++){
   const y=.210-k*.033,z=.055-k*.012;
   lock([[s*.070,y,z],[s*.137,y+.023,z-.055],[s*(.198+k*.003),y+.055,z-.153],[s*(.223+k*.002),y+.111,z-.213]],.034-k*.002,.48,'side-swept-'+s+'-'+k);
  }
  // Ear-front lock ends above the jaw; the eye/ear gap stays open in profile.
  lock([[s*.112,.139,.040],[s*.133,.099,.054],[s*.128,.044,.040],[s*.143,.012,.022]],.021,.36,'temple-'+s);
 }
 for(let i=0;i<7;i++){
  const x=(i-3)*.030;
  lock([[x,.230,.035],[x*1.24,.276,-.093],[x*1.55,.301,-.182],[x*1.72,.344+(i%2)*.025,-.233]],.030,.50,'crown-fine-'+i);
 }
 for(let i=0;i<5;i++){
  const x=(i-2)*.042,sign=i<2?-1:1;
  lock([[x,.164,-.092],[x*1.22,.110,-.175],[x+sign*.034,.132,-.225],[x+sign*.063,.219,-.286]],.033,.50,'nape-flame-'+i);
 }
 return {root,uniforms:light.uniforms};
}

function detailFace(ctx,state,fire){
 const g=ctx,skin=fire?'#f4cfa8':'#efe4e6',ink=fire?'#875b53':'#827180';
 g.save();g.setTransform(2,0,0,2,0,0);
 // Clear only the old tiny nose mark. Mouth pixels and lip timing are retained.
 g.fillStyle=skin;g.fillRect(242,302,36,27);
 g.strokeStyle=ink;g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(260,300);g.lineTo(266,316);g.lineTo(259,322);g.stroke();
 g.lineWidth=1.2;g.beginPath();g.moveTo(252,323);g.quadraticCurveTo(256,325,259,323);g.stroke();
 const open=1-clamp(state.acting?.blink??state.blink??0,0,1),focus=state.acting?.focus??0,fear=state.acting?.fear??0;
 if(open>.05&&state.emotion!=='laugh')for(const s of [-1,1]){
  const cx=256+s*(fire?88:84),h=(fire?43:35)*(1+.15*fear-.16*focus),ey=fire?244:248;
  g.save();g.translate(cx,ey);g.scale(s*(fire?1.13:1.03),1);
  g.strokeStyle=fire?'#ba8d75':'#b6a5b5';g.lineWidth=1.3;g.beginPath();g.moveTo(-28,-h*open-6);g.quadraticCurveTo(2,-h*open-11,30,-h*.87*open-6);g.stroke();
  g.fillStyle='rgba(62,44,58,.15)';g.beginPath();g.moveTo(-37,-h*.72*open+3);g.quadraticCurveTo(-6,-h*open+3,27,-h*.87*open+3);g.lineTo(45,-h*.38*open);g.lineTo(29,-h*.66*open);g.quadraticCurveTo(-5,-h*.76*open,-36,-h*.49*open);g.closePath();g.fill();
  g.restore();
 }
 g.restore();
}

export function applyShadedPortrait(actor){
 const fire=actor.palaceKind==='aoao',face=actor.face;
 actor.palacePortrait.afterPaint=(ctx,state)=>detailFace(ctx,state,fire);
 const skin=celKey(face.skull.material,{shadow:fire?'#b89b95':'#9b91af'});face.skull.material=skin.material;
 for(const m of actor.headGroup.children)if(m.isMesh&&m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius===1)m.material=celKey(m.material,{shadow:fire?'#b89b95':'#9b91af'}).material;
 const hair=flameHair(actor,fire);
 const crown=[...actor.headGroup.children.filter(m=>m.isMesh&&(m.userData.metalClad||m.userData.palaceMetal)),...(actor.cladParts.find(p=>p.ord===0)?.groups??[])];
 const update=actor.updatePalaceClad.bind(actor);
 const hide=()=>crown.forEach(m=>m.visible=false);hide();actor.updatePalaceClad=(...args)=>{update(...args);hide();};
 actor.shadedPortrait={hair:hair.root,crown,skinUniforms:skin.uniforms,hairUniforms:hair.uniforms};
 return actor.shadedPortrait;
}
