import * as THREE from 'three';
import {paintDrawnFace} from './drawn-face.js';

/** Authored curved head and live drawing, mounted in the imported actor's metre
 * frame. The face follows the head bone; eyes are clipped, never billboards.
 * profiles: [y, halfWidth, frontZ, backZ], in ascending height order. */
export function createDrawnHead(actor,config){
  const {profiles,centerX=0,centerY,range=.17,eyes,brows,mouth,skin='#efcbae',ink='#383237',iris='#956534'}=config;
  const root=new THREE.Group();root.name='drawn-head';actor.mesh.add(root);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=config.textureSize??1024;
  const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
  const pos=[],uv=[],indices=[],N=96,R=(profiles.length-1)*6;
  // Separate the two UV charts. No triangle crosses from the drawn face to
  // the constant-colour rear chart, which would smear eyes over the temples.
  for(let half=0;half<2;half++)for(let row=0;row<=R;row++){
    const f=row/6,k=Math.min(profiles.length-2,Math.floor(f)),t=f-k;
    const p=profiles[k].map((v,j)=>{
      if(j===0)return THREE.MathUtils.lerp(v,profiles[k+1][j],t);
      const a=profiles[Math.max(0,k-1)][j],b=v,c=profiles[k+1][j],d=profiles[Math.min(profiles.length-1,k+2)][j];
      return Math.max(j===1?.001:-Infinity,.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t));
    });
    for(let col=0;col<=N;col++){
      const a=-Math.PI/2+half*Math.PI+col/N*Math.PI,c=Math.cos(a),x=p[1]*Math.sin(a);
      // Keep the central forehead full but round its temples into the scalp;
      // the flatter cheek section must not protrude through the hair cap.
      const frontPower=THREE.MathUtils.lerp(.68,1.18,THREE.MathUtils.smoothstep(p[0],eyes[0][1]+.025,eyes[0][1]+.065));
      let z=(p[2]+p[3])/2+(p[2]-p[3])/2*(c>0?Math.pow(c,frontPower):c);
      if(c>0){
        const dy=p[0]-config.noseY;
        // A longer bridge and a shorter underside give the profile a nose tip;
        // a symmetric tiny bump disappears into the cheek when turning.
        z+=(config.noseDepth??.006)*Math.exp(-((x/.012)**2+(dy/(dy>0?.022:.008))**2));
        z+=.001*Math.exp(-((x/.022)**2+((p[0]-mouth[1])/.004)**2));
      }
      pos.push(centerX+x,p[0],z);
      uv.push(half===0?.5+x/(range*2):.015,half===0?.5+(p[0]-centerY)/(range*2):.985);
      if(row<R&&col<N){const i=half*(R+1)*(N+1)+row*(N+1)+col;indices.push(i,i+1,i+N+1,i+1,i+N+2,i+N+1);}
    }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const head=new THREE.Mesh(g,material);root.add(head);head.castShadow=true;
  const outlineMaterial=new THREE.MeshBasicMaterial({color:config.contour??'#765147',side:THREE.BackSide,toneMapped:false});
  outlineMaterial.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed+=normal*.00045;');};
  root.add(new THREE.Mesh(g,outlineMaterial));
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
      const t=row/16,a=col/48*Math.PI*2,radius=THREE.MathUtils.lerp(config.neckRadius??.041,(config.neckRadius??.041)*.88,t);
      const p=new THREE.Vector3(centerX+radius*Math.sin(a),THREE.MathUtils.lerp(config.headCut-.09,config.headCut+.035,t),-.012+radius*.81*Math.cos(a));
      const bottom=p.clone().applyMatrix4(bottomMatrix),top=p.clone().applyMatrix4(topMatrix);
      bottom.lerp(top,t*t*(3-2*t)).applyMatrix4(toLocal).toArray(neckPos,(row*49+col)*3);
    }neckGeo.attributes.position.needsUpdate=true;neckGeo.computeVertexNormals();
  }
  const state={blink:0,jaw:0,width:1,smile:0,fear:0,focus:0,gaze:[0,0]};let last='';
  let irisArt=null;
  const ready=config.irisArt?new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>{irisArt=image;last='';paint();resolve();};
    image.onerror=()=>reject(new Error('Unable to load painted iris: '+config.irisArt));image.src=config.irisArt;
  }):Promise.resolve();
  function paint(){
    const size=canvas.width;
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=skin;ctx.fillRect(0,0,size,size);
    ctx.translate(size/2,size/2);ctx.scale(size/(2*range),-size/(2*range));ctx.translate(-centerX,-centerY);ctx.lineCap='round';ctx.lineJoin='round';
    (config.paintFace??paintDrawnFace)(ctx,config,state,irisArt);
    texture.needsUpdate=true;
  }
  return {head:actor.bones.head,root,state,texture,ready,updateGeometry,apply(next={}){
    const defaults={blink:0,jaw:0,width:1,smile:0,fear:0,focus:0,gaze:[0,0]};
    for(const k of Object.keys(defaults))state[k]=next[k]??defaults[k];
    for(const k of ['blink','jaw','smile','fear','focus'])state[k]=THREE.MathUtils.clamp(state[k],0,1);
    state.gaze=state.gaze.map(v=>THREE.MathUtils.clamp(v,-1,1));
    const key=JSON.stringify(state);if(key!==last){paint();last=key;}
  },dispose(){texture.dispose();g.dispose();material.dispose();outlineMaterial.dispose();}};
}
