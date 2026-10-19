import * as THREE from 'three';
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));

// Broad angular eye apertures painted onto the existing curved face. The
// original nose, mouth, gaze targets, blink clock and spoken lip track remain.
function paintEyes(ctx,fire,state){
 const g=ctx,act=state.acting??{},fear=clamp(act.fear??0),focus=clamp(act.focus??0);
 const close=clamp(act.blink??state.blink??0),open=1-close,smile=clamp(act.smile??0);
 const ey=fire?244:248,dx=fire?88:84,skin=fire?'#f4cfa8':'#efe4e6';
 g.save();g.setTransform(2,0,0,2,0,0);g.fillStyle=skin;g.fillRect(40,150,432,147);
 const gx=clamp(act.gazeX??state.gaze.x,-1,1),gy=clamp(act.gazeY??state.gaze.y,-1,1);
 for(const s of [-1,1]){
  const cx=256+s*dx,h=(fire?43:35)*(1+.15*fear-.16*focus),lo=fire?18:14;
  const closed=open<.045||state.emotion==='laugh';
  g.save();g.translate(cx,ey);g.scale(s*(fire?1.13:1.03),1);
  const shape=()=>{g.beginPath();g.moveTo(-48,3);g.lineTo(-37,-h*.72*open);g.quadraticCurveTo(-6,-h*open,27,-h*.87*open);g.lineTo(51,-h*.38*open);g.lineTo(40,lo*.70*open);g.quadraticCurveTo(8,lo*open,-26,lo*.72*open);g.closePath();};
  if(!closed){
   g.save();shape();g.clip();g.fillStyle='#fff8e9';g.fillRect(-60,-60,120,100);
   const ix=-2+gx*s*16,iy=-6+gy*10,ir=fire?24:21;
   const col=g.createLinearGradient(0,-42,0,23);col.addColorStop(0,fire?'#453328':'#1b3340');col.addColorStop(.48,fire?'#966031':'#356c76');col.addColorStop(1,fire?'#e1b56b':'#8cbec1');
   g.fillStyle=col;g.beginPath();g.ellipse(ix,iy,ir,37,0,0,TAU);g.fill();g.strokeStyle=fire?'#453027':'#182c39';g.lineWidth=2;g.stroke();
   g.fillStyle='#1e222b';g.beginPath();g.ellipse(ix,iy-1,9*(act.pupil??1),26,0,0,TAU);g.fill();
   g.fillStyle='#fffdf2';g.beginPath();g.ellipse(ix-8*s,iy-15,6,8,-s*.2,0,TAU);g.fill();g.beginPath();g.arc(ix+9*s,iy+16,2.8,0,TAU);g.fill();
   g.restore();
  }
  g.strokeStyle='#28232d';g.lineWidth=5;g.lineJoin='round';g.lineCap='round';g.beginPath();g.moveTo(-48,3);
  if(closed)g.quadraticCurveTo(0,smile>0?-12:7,51,-2);
  else{g.lineTo(-37,-h*.72*open);g.quadraticCurveTo(-6,-h*open,27,-h*.87*open);g.lineTo(51,-h*.38*open);}
  g.stroke();
  if(!closed){g.lineWidth=2.1;g.beginPath();g.moveTo(-26,lo*.72*open);g.quadraticCurveTo(8,lo*open,40,lo*.70*open);g.lineTo(51,-h*.38*open);g.stroke();}
  // Solid tapered brow: readable at the actual episode size, not a thin arc.
  const by=-h-18,inner=by+focus*13-fear*12+(act.browAsym??.1)*s*5,outer=by-6+fear*4;
  g.fillStyle=fire?'#33252b':'#202235';g.beginPath();g.moveTo(-44,inner);g.lineTo(4,by-7);g.lineTo(51,outer);g.lineTo(41,outer+6);g.lineTo(0,by+7);g.lineTo(-42,inner+13);g.closePath();g.fill();
  g.restore();
 }
 g.restore();
}

function hairLock(root,points,width,depth,base,accent,name){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),pos=[],col=[],ix=[],N=26,M=10;
 const c0=new THREE.Color(base),c1=new THREE.Color(accent),dark=c0.clone().multiplyScalar(.64);
 for(let i=0;i<=N;i++){
  const u=i/N,p=curve.getPoint(u),t=curve.getTangent(u),ref=Math.abs(t.z)>.9?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
  const x=ref.cross(t).normalize(),z=t.clone().cross(x).normalize(),r=width*(.84+.32*Math.sin(Math.PI*u))*Math.pow(1-u,.67)+.00012;
  for(let j=0;j<=M;j++){
   const a=j/M*TAU,v=p.clone().addScaledVector(x,Math.cos(a)*r).addScaledVector(z,Math.sin(a)*r*depth);pos.push(...v.toArray());
   const light=Math.sin(a),c=light>.25?c1:light<-.2?dark:c0;col.push(c.r,c.g,c.b);
   if(i<N&&j<M){const q=i*(M+1)+j;ix.push(q,q+M+1,q+1,q+1,q+M+1,q+M+2);}
  }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(ix);geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));m.name=name;root.add(m);return m;
}

function hairBoundary(a){
 const x=Math.acos(Math.cos(a)),keys=[[0,1.17],[1.05,1.43],[1.56,1.78],[1.97,2.39],[Math.PI,2.51]];
 for(let i=1;i<keys.length;i++)if(x<=keys[i][0]){let u=(x-keys[i-1][0])/(keys[i][0]-keys[i-1][0]);u=u*u*(3-2*u);return THREE.MathUtils.lerp(keys[i-1][1],keys[i][1],u);}return 2.51;
}
function scalpLock(root,a0,a1,end,base,accent,name){
 const pos=[],col=[],ix=[],N=30,M=12,bc=new THREE.Color(base),hi=new THREE.Color(accent),shade=bc.clone().multiplyScalar(.78);
 for(let i=0;i<=N;i++)for(let j=0;j<=M;j++){
  const u=i/N,v=j/M*2-1,th=.32+(end-.32)*u,a=a0+(a1-a0)*u+v*.39*Math.pow(1-u,.65);
  const bulge=.001+.023*Math.sin(Math.PI*u)*(1-v*v)+.023*u*u;
  const sn=Math.sin(th),cs=Math.cos(th);
  pos.push((.139+bulge)*sn*Math.sin(a),.082+(.195+bulge)*cs,-.018+(.151+bulge)*sn*Math.cos(a));
  const c=v<-.5?hi:v>.48?shade:bc;col.push(c.r,c.g,c.b);
  if(i<N&&j<M){const q=i*(M+1)+j;ix.push(q,q+M+1,q+1,q+1,q+M+1,q+M+2);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(ix);g.computeVertexNormals();
 const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));mesh.name=name;root.add(mesh);
}

function fullHair(actor,fire){
 const head=actor.headGroup;
 // The first five direct meshes are skull plus four ear volumes. Armor grows
 // under Groups, so hiding obsolete hair meshes leaves the crown intact.
 const keep=new Set([actor.face.skull,...head.children.filter(m=>m.isMesh&&m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius===1)]);
 for(const m of head.children)if(m.isMesh&&!keep.has(m)&&!m.userData.palaceMetal&&!m.userData.metalClad)m.visible=false;
 const root=new THREE.Group();root.name='palace-volume-hair';head.add(root);
 const base=fire?'#392b32':'#262c42',accent=fire?'#60434b':'#414d67';
 // Continuous scalp cover, then deliberately grouped locks with unequal tips.
 const p=[],ix=[],R=32,S=80;
 for(let i=0;i<=R;i++)for(let j=0;j<=S;j++){
  const a=j/S*TAU,theta=i/R*hairBoundary(a);
  p.push(.139*Math.sin(theta)*Math.sin(a),.082+.195*Math.cos(theta),-.018+.151*Math.sin(theta)*Math.cos(a));
  if(i<R&&j<S){const q=i*(S+1)+j;ix.push(q,q+S+1,q+1,q+1,q+S+1,q+S+2);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();root.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:base,side:THREE.DoubleSide})));
 // Frontal masses sweep across the brow without covering both eye apertures.
 const fringe=fire?[[-.80,-1.20,1.54],[-.42,-.60,1.36],[.02,.10,1.55],[.52,1.18,1.52]]:[[-.72,-1.14,1.62],[-.26,-.55,1.43],[.25,.60,1.36],[.70,1.17,1.65]];
 fringe.forEach(([a,b,end],i)=>scalpLock(root,a,b,end,base,accent,'fringe-'+i));
 // Broad overlapping scalp locks, rooted in the same cranial surface. They
 // carry the volume down the sides and nape without detached tubular roots.
 for(let i=0;i<9;i++){
  const a=1.22+i*(TAU-2.44)/8;
  scalpLock(root,a-(fire?.28:.40),a+.06,hairBoundary(a)+.08+.10*Math.sin(i*1.73),base,accent,'scalp-lock-'+i);
 }
 for(const s of [-1,1])hairLock(root,[[s*.104,.149,-.053],[s*.151,.149,-.070],[s*(fire?.177:.184),.178,-.107]],.021,.30,base,accent,'temple-sweep-'+s);
 if(fire){
  hairLock(root,[[-.057,.245,-.035],[.005,.280,-.032],[.092,.310,-.058]],.036,.30,base,accent,'hero-swept-crest');
  hairLock(root,[[-.065,.232,-.065],[-.024,.272,-.078],[.035,.303,-.116]],.030,.30,base,accent,'hero-second-crest');
  hairLock(root,[[-.045,.218,-.039],[-.123,.280,-.061],[-.181,.282,-.103]],.033,.34,base,accent,'hero-left-volume');
  hairLock(root,[[.043,.219,-.055],[.121,.269,-.076],[.177,.272,-.128]],.033,.34,base,accent,'hero-right-volume');
 }else{
  hairLock(root,[[.004,.239,-.065],[.032,.255,-.125],[.054,.232,-.217]],.034,.32,base,accent,'enemy-crown-sweep');
  hairLock(root,[[.028,.158,-.131],[.100,.088,-.192],[.126,-.040,-.190]],.034,.38,base,accent,'enemy-swept-tail');
 }
 return root;
}

export function applyPalacePortrait(actor){
 const fire=actor.palaceKind==='aoao',face=actor.face,texture=face.skull.material.map,ctx=texture.image.getContext('2d');
 const state={emotion:'neutral',blink:0,acting:{},gaze:{x:0,y:0}};
 const emotion=face.setEmotion.bind(face),acting=face.setActing.bind(face),gaze=face.lookAtWorld.bind(face),mouth=face.mouth.apply.bind(face.mouth),lip=face.applyLip.bind(face);
 face.setEmotion=(e,b)=>{state.emotion=e;state.blink=b;emotion(e,b);};
 face.setActing=a=>{state.acting=a;acting(a);};
 face.lookAtWorld=target=>{gaze(target);const local=face.head.worldToLocal(target.clone());state.gaze={x:clamp(local.x/Math.max(.3,Math.abs(local.z)),-1,1)*.55,y:clamp(-local.y/Math.max(.3,Math.abs(local.z)),-1,1)*.5};};
 const redraw=()=>{paintEyes(ctx,fire,state);actor.palacePortrait?.afterPaint?.(ctx,state);texture.needsUpdate=true;};
 face.mouth.apply=v=>{state.lip=v;const r=mouth(v);redraw();return r;};face.applyLip=v=>{state.lip=v;const r=lip(v);redraw();return r;};
 actor.palacePortrait={hair:fullHair(actor,fire),state};redraw();return actor.palacePortrait;
}
