import * as THREE from 'three';

/** Authored curved head and live drawing, mounted in the imported actor's metre
 * frame. The face follows the head bone; eyes are clipped, never billboards.
 * profiles: [y, halfWidth, frontZ, backZ], in ascending height order. */
export function createDrawnHead(actor,config){
  const {profiles,centerX=0,centerY,range=.17,eyes,brows,mouth,skin='#efcbae',ink='#383237',iris='#956534'}=config;
  const root=new THREE.Group();root.name='drawn-head';actor.mesh.add(root);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
  const pos=[],uv=[],indices=[],N=96,R=(profiles.length-1)*6;
  // Separate the two UV charts. No triangle crosses from the drawn face to
  // the constant-colour rear chart, which would smear eyes over the temples.
  for(let half=0;half<2;half++)for(let row=0;row<=R;row++){
    const f=row/6,k=Math.min(profiles.length-2,Math.floor(f)),t=f-k;
    const p=profiles[k].map((v,j)=>THREE.MathUtils.lerp(v,profiles[k+1][j],t));
    for(let col=0;col<=N;col++){
      const a=-Math.PI/2+half*Math.PI+col/N*Math.PI,c=Math.cos(a),x=p[1]*Math.sin(a);
      let z=(p[2]+p[3])/2+(p[2]-p[3])/2*(c>0?Math.pow(c,.68):c);
      if(c>0)z+=(config.noseDepth??.006)*Math.exp(-((x/.012)**2+((p[0]-config.noseY)/.014)**2));
      pos.push(centerX+x,p[0],z);
      uv.push(half===0?.5+x/(range*2):.015,half===0?.5+(p[0]-centerY)/(range*2):.985);
      if(row<R&&col<N){const i=half*(R+1)*(N+1)+row*(N+1)+col;indices.push(i,i+1,i+N+1,i+1,i+N+2,i+N+1);}
    }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const head=new THREE.Mesh(g,material);root.add(head);head.castShadow=true;
  // Ears are behind the face and have a restrained drawn inner shape.
  for(const side of [-1,1]){
    const ear=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:skin,toneMapped:false}));
    ear.position.set(centerX+side*config.earX,config.earY,config.earZ??.006);ear.scale.set(.015,.026,.014);root.add(ear);
    const inner=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),new THREE.MeshBasicMaterial({color:'#d9a38e',toneMapped:false}));
    inner.position.copy(ear.position).add(new THREE.Vector3(side*.003,0,.011));inner.scale.set(.007,.016,.003);root.add(inner);
  }
  root.updateMatrixWorld(true);actor.bones.head.attach(root);
  // Continuous neck: bottom follows the original neck base, top follows head.
  // Baking a rigid neck into the new head exposes a seam on relative head turns.
  const neckBone=actor.bones.neck,headInverse=actor.bones.head.matrixWorld.clone().invert(),neckInverse=neckBone.matrixWorld.clone().invert();
  const neckPos=new Float32Array(17*49*3),neckIndex=[];
  for(let row=0;row<16;row++)for(let col=0;col<48;col++){const i=row*49+col;neckIndex.push(i,i+1,i+49,i+1,i+50,i+49);}
  const neckGeo=new THREE.BufferGeometry();neckGeo.setAttribute('position',new THREE.BufferAttribute(neckPos,3));neckGeo.setIndex(neckIndex);
  const neck=new THREE.Mesh(neckGeo,new THREE.MeshBasicMaterial({color:skin,toneMapped:false}));neck.name='drawn-continuous-neck';neck.frustumCulled=false;actor.mesh.add(neck);
  function updateGeometry(){
    actor.mesh.updateMatrixWorld(true);
    const topMatrix=actor.bones.head.matrixWorld.clone().multiply(headInverse),bottomMatrix=neckBone.matrixWorld.clone().multiply(neckInverse),toLocal=actor.mesh.matrixWorld.clone().invert();
    for(let row=0;row<=16;row++)for(let col=0;col<=48;col++){
      const t=row/16,a=col/48*Math.PI*2,radius=THREE.MathUtils.lerp(.052,.047,t);
      const p=new THREE.Vector3(centerX+radius*Math.sin(a),THREE.MathUtils.lerp(config.headCut-.09,config.headCut+.035,t),-.012+radius*.81*Math.cos(a));
      const bottom=p.clone().applyMatrix4(bottomMatrix),top=p.clone().applyMatrix4(topMatrix);
      bottom.lerp(top,t*t*(3-2*t)).applyMatrix4(toLocal).toArray(neckPos,(row*49+col)*3);
    }neckGeo.attributes.position.needsUpdate=true;neckGeo.computeVertexNormals();
  }
  const state={blink:0,jaw:0,width:1,smile:0,fear:0,focus:0,gaze:[0,0]};let last='';
  const line=(color,width,draw)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();draw();ctx.stroke();};
  function paint(){
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=skin;ctx.fillRect(0,0,1024,1024);
    ctx.translate(512,512);ctx.scale(1024/(2*range),-1024/(2*range));ctx.translate(-centerX,-centerY);ctx.lineCap='round';ctx.lineJoin='round';
    for(let i=0;i<eyes.length;i++){
      const [ex,ey,rx,ry]=eyes[i],side=i===0?-1:1,blink=state.blink;
      const upper=ry*(1-.30*state.focus+.12*state.fear),lower=-ry*.66;
      const top=THREE.MathUtils.lerp(upper,lower+.001,blink);
      const path=new Path2D();path.moveTo(ex-rx,ey+.001);path.bezierCurveTo(ex-rx*.65,ey+top*1.4,ex+rx*.60,ey+top*1.35,ex+rx,ey+.002);
      path.bezierCurveTo(ex+rx*.70,ey+lower,ex-rx*.62,ey+lower,ex-rx,ey+.001);
      if(blink<.97){
        ctx.save();ctx.clip(path);ctx.fillStyle='#fff4df';ctx.fillRect(ex-rx*1.2,ey-ry*1.3,rx*2.4,ry*3);
        const ix=ex+state.gaze[0]*rx*.30,iy=ey+state.gaze[1]*ry*.20;
        ctx.fillStyle=ink;ctx.beginPath();ctx.ellipse(ix,iy,rx*.46,ry*.93,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=iris;ctx.beginPath();ctx.ellipse(ix,iy-ry*.12,rx*.38,ry*.76,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#d3a96a';ctx.beginPath();ctx.ellipse(ix,iy-ry*.48,rx*.29,ry*.27,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=ink;ctx.beginPath();ctx.ellipse(ix,iy+ry*.09,rx*.19,ry*.64,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff9eb';ctx.beginPath();ctx.ellipse(ix-rx*.17,iy+ry*.40,rx*.13,ry*.19,-.3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.ellipse(ix+rx*.20,iy-ry*.43,rx*.06,ry*.08,0,0,Math.PI*2);ctx.fill();ctx.restore();
        line('#98715e',.0008,()=>{ctx.moveTo(ex-rx*.87,ey-.002);ctx.bezierCurveTo(ex-rx*.5,ey+lower,ex+rx*.6,ey+lower,ex+rx*.90,ey);});
      }
      line(ink,config.lashWidth??.0018,()=>{ctx.moveTo(ex-rx,ey+.001);ctx.bezierCurveTo(ex-rx*.65,ey+top*1.4,ex+rx*.6,ey+top*1.35,ex+rx,ey+.002);});
      if(config.lashes!==false)line(ink,.0013,()=>{ctx.moveTo(ex+side*rx*.85,ey+top*.45);ctx.lineTo(ex+side*rx*1.13,ey+top*.60+.003);});
      const [bx,by,bw]=brows[i];
      const tilt=.006*state.focus-.006*state.fear;
      line(config.browColor??ink,config.browWidth??.0021,()=>{ctx.moveTo(bx-side*bw,by-tilt+state.fear*.002);ctx.quadraticCurveTo(bx,by+.003,bx+side*bw,by+tilt*.35);});
    }
    // Warm short nose mark, no baked nostril shadows or permanent smile.
    line('#bf8c78',.0009,()=>{ctx.moveTo(centerX+.002,config.noseY+.002);ctx.quadraticCurveTo(centerX+.004,config.noseY-.003,centerX,config.noseY-.004);});
    const [mx,my,mw]=mouth,w=mw*THREE.MathUtils.clamp(state.width,.75,1.25),bend=state.smile*.005-state.fear*.003;
    if(state.jaw>.06){
      const h=.001+state.jaw*.011;ctx.fillStyle='#63313e';ctx.beginPath();ctx.moveTo(mx-w,my+bend);ctx.bezierCurveTo(mx-w*.35,my+h,mx+w*.35,my+h,mx+w,my+bend);ctx.bezierCurveTo(mx+w*.5,my-h,mx-w*.5,my-h,mx-w,my+bend);ctx.fill();
      if(state.jaw>.35){ctx.fillStyle='#cd7e83';ctx.beginPath();ctx.ellipse(mx,my-h*.50,w*.48,h*.22,0,0,Math.PI*2);ctx.fill();}
    }else line('#88575a',.0011,()=>{ctx.moveTo(mx-w,my+bend);ctx.quadraticCurveTo(mx,my-bend,mx+w,my+bend);});
    texture.needsUpdate=true;
  }
  return {head:actor.bones.head,root,state,texture,updateGeometry,apply(next={}){
    Object.assign(state,{blink:0,jaw:0,width:1,smile:0,fear:0,focus:0,gaze:[0,0]},next);
    for(const k of ['blink','jaw','smile','fear','focus'])state[k]=THREE.MathUtils.clamp(state[k],0,1);
    state.gaze=state.gaze.map(v=>THREE.MathUtils.clamp(v,-1,1));
    const key=JSON.stringify(state);if(key!==last){paint();last=key;}
  },dispose(){texture.dispose();g.dispose();material.dispose();}};
}
