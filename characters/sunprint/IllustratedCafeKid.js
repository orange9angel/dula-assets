import * as THREE from 'three';
import {composePortraitPixels} from '../../lib/craft3d/generated-portrait-paint.js';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const rotate=(p,c,a)=>{const x=p[0]-c[0],y=p[1]-c[1];return[c[0]+x*Math.cos(a)-y*Math.sin(a),c[1]+x*Math.sin(a)+y*Math.cos(a)];};
const angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function transform(p,a,b,A,B){const t=angle(A,B)-angle(a,b),q=rotate(p,a,t);return[q[0]-a[0]+A[0],q[1]-a[1]+A[1]];}
function knee(a,b,l1,l2,side){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.min(l1+l2-.01,Math.max(Math.abs(l1-l2)+.01,Math.hypot(dx,dy))),t=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-t*t)),u=Math.hypot(dx,dy);return[a[0]+dx/u*t-dy/u*h*side,a[1]+dy/u*t+dx/u*h*side];}
function eye(x,y,w,h){return{upper:[[x-w,y],[x-w*.4,y-h],[x+w*.5,y-h],[x+w,y]],lower:[[x-w,y],[x-w*.5,y+h],[x+w*.5,y+h],[x+w,y]],closed:[[x-w,y],[x-w*.3,y+4],[x+w*.4,y+4],[x+w,y]],clear:{rect:[x-w-7,y-h-9,w*2+14,h*2+20],sampleTop:y-h-9,sampleBottom:y+h+11,feather:5},gazePixels:[3,2],pinMargin:6,closedInkScale:.65};}
const designs={
 Girl:{height:1.86,origin:[512,1518],neck:[515,277],waist:[512,650],shoulders:[[382,343],[641,343]],elbows:[[330,555],[701,555]],wrists:[[260,755],[764,755]],hips:[[444,770],[576,770]],knees:[[435,1025],[591,1025]],ankles:[[401,1420],[624,1420]],footX:[401,624],legStart:815,armBoundary:[[410,300],[411,465],[373,575],[314,710],[315,880]],eyes:[eye(489,159,22,18),eye(564,172,19,18)],mouth:[519,217,15],faceBox:[464,135,125,113]},
 Boy:{height:1.99,origin:[512,1518],neck:[510,277],waist:[510,685],shoulders:[[365,350],[658,350]],elbows:[[322,575],[699,575]],wrists:[[277,766],[751,766]],hips:[[439,741],[576,741]],knees:[[412,1055],[603,1055]],ankles:[[381,1417],[625,1417]],footX:[366,660],legStart:765,armBoundary:[[395,310],[398,500],[362,575],[314,710],[315,900]],eyes:[eye(489,170,20,12),eye(555,172,18,12)],mouth:[518,221,17],faceBox:[451,146,130,111]}
};
// Illustrated front-view mesh, deliberately bounded to small 2D acting.
// Source pixels remain the appearance; geometry supplies continuous limb bends.
export class IllustratedCafeKid{
 constructor(kind,{bodyUrl}){this.kind=kind;this.d=designs[kind];this.mesh=new THREE.Group();this.mesh.name=kind+'-illustrated-deformation';this.ready=this.load(bodyUrl);}
 async load(url){
  this.art=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url;});
  const d=this.d;this.ppm=(1518-18)/d.height;const c=this.canvas=document.createElement('canvas');c.width=this.art.width;c.height=this.art.height;this.ctx=c.getContext('2d');this.ctx.drawImage(this.art,0,0);
  const [x,y,w,h]=d.faceBox,[mx,my,mw]=d.mouth;this.paint={facePath:[['M',x,y],['L',x+w,y],['L',x+w,y+h],['L',x,y+h],['Z']],faceFeatherPixels:7,eyes:d.eyes,mouth:{lip:[[mx-mw,my],[mx-mw*.35,my+5],[mx+mw*.4,my+5],[mx+mw,my]],clear:{rect:[mx-mw-7,my-8,mw*2+14,37],sampleTop:my-8,sampleBottom:my+29,feather:5},openPixels:38,maxJaw:.9}};
  const clearTop=this.kind==='Girl'?[520,195]:[518,202],clearBottom=this.kind==='Girl'?[525,230]:[518,236];
  this.paint.mouth.clear.samplePointTop=clearTop;this.paint.mouth.clear.samplePointBottom=clearBottom;
  for(const e of this.paint.eyes){e.clear.samplePointTop=clearTop;e.clear.samplePointBottom=clearBottom;}
  this.texture=new THREE.CanvasTexture(c);this.texture.colorSpace=THREE.SRGBColorSpace;this.texture.minFilter=THREE.LinearFilter;this.texture.magFilter=THREE.LinearFilter;
  const nx=128,ny=192,positions=[],uv=[],indices=[];this.source=[];
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const px=i/nx*c.width,py=j/ny*c.height;this.source.push([px,py]);positions.push((px-d.origin[0])/this.ppm,(d.origin[1]-py)/this.ppm,0);uv.push(i/nx,1-j/ny);}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,k=a+nx+1;indices.push(a,k,b,b,k,k+1);}
  this.geometry=new THREE.BufferGeometry();this.geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));this.geometry.setIndex(indices);
  this.surface=new THREE.Mesh(this.geometry,new THREE.MeshBasicMaterial({map:this.texture,transparent:true,alphaTest:.015,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));this.surface.frustumCulled=false;this.mesh.add(this.surface);this.lastFace='';
  // Separate actual painted arm pixels before deformation. A shared image
  // grid cannot bend an arm independently when the same row contains a skirt.
  const original=this.ctx.getImageData(0,0,c.width,c.height),N=c.width*c.height;
  this.armMask=document.createElement('canvas');this.armMask.width=c.width;this.armMask.height=c.height;const maskCtx=this.armMask.getContext('2d'),mask=maskCtx.createImageData(c.width,c.height);this.armLayers=[];
  const segmentDistance=(x,y,a,b)=>{const vx=b[0]-a[0],vy=b[1]-a[1],q=clamp(((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy));return Math.hypot(x-a[0]-q*vx,y-a[1]-q*vy);};
  for(let side=0;side<2;side++){
   const raw=new Uint8Array(N),a=d.shoulders[side],b=d.elbows[side],w=d.wrists[side],hand=[w[0]+(side?10:-10),w[1]+48];
   for(let y=445;y<920;y++)for(let x=180;x<845;x++){const k=y*c.width+x,j=k*4,R=original.data[j],G=original.data[j+1],B=original.data[j+2];const skin=R>B*1.10&&R>65;const upper=segmentDistance(x,y,a,b)<58,lower=segmentDistance(x,y,b,w)<48,finger=Math.hypot((x-hand[0])/52,(y-hand[1])/92)<1;const inward=side?x>600:x<424;if(inward&&original.data[j+3]>4&&((skin&&(upper||lower))||finger))raw[k]=1;}
   const ac=document.createElement('canvas');ac.width=c.width;ac.height=c.height;const ax=ac.getContext('2d'),im=ax.createImageData(c.width,c.height);
   for(let y=442;y<924;y++)for(let x=177;x<849;x++){const k=y*c.width+x;let yes=raw[k];if(!yes){for(let dy=-3;dy<=3&&!yes;dy++)for(let dx=-3;dx<=3;dx++)if(raw[k+dy*c.width+dx]){yes=1;break;}}if(yes){const j=k*4;im.data.set(original.data.subarray(j,j+4),j);mask.data[j+3]=255;}}
   ax.putImageData(im,0,0);const tex=new THREE.CanvasTexture(ac);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;const geometry=this.geometry.clone(),mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.015,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));mesh.position.z=.003+side*.001;mesh.frustumCulled=false;this.mesh.add(mesh);this.armLayers.push({mesh,geometry});
  }
  maskCtx.putImageData(mask,0,0);
  if(this.kind==='Girl'){
   const shape=new THREE.Shape(),pts=[[381,410],[330,530],[290,625],[330,678],[380,698],[660,698],[705,655],[687,560],[644,410]];pts.forEach((p,i)=>shape[i?'lineTo':'moveTo']((p[0]-512)/this.ppm,(1518-p[1])/this.ppm));shape.closePath();this.hairUnder=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:'#243987',side:THREE.DoubleSide,toneMapped:false}));this.hairUnder.position.z=-.006;this.mesh.add(this.hairUnder);
  }
 }
 setPose(p){
  const d=this.d,ppm=this.ppm,roll=p.roll??0,bob=-(p.bob??0)*ppm,headRoll=-(p.headRoll??0),footInput=[p.leftFoot,p.rightFoot],t=p.time??0;
  const body=q=>{const r=rotate(q,d.waist,-roll);return[r[0],r[1]+bob];};
  const arms=d.shoulders.map((a,i)=>{const side=i?1:-1,upper=0,lower=-side*(p.elbowBend?.[i]??.08),A=body(a),b=d.elbows[i],c=d.wrists[i],B=rotate(b,a,upper),C0=rotate(c,a,upper),C=rotate(C0,B,lower);const BB=body(B),CC=body(C);return{a,b,c,A,B:BB,C:CC};});
  const legs=d.hips.map((a,i)=>{const b=d.knees[i],c=d.ankles[i],f=footInput[i],A=body(a),side=i?1:-1,base=(i?.11:-.11)*(p.scale??1),C=[c[0]+((f?.x??base)-base)*ppm,c[1]-((f?.y??.074*(p.scale??1))-.074*(p.scale??1))*ppm];const B=knee(A,C,dist(a,b),dist(b,c),i?-1:1);return{a,b,c,A,B,C};});
  const position=this.geometry.attributes.position;
  for(let k=0;k<this.source.length;k++){
   const q=this.source[k],x=q[0],y=q[1],left=x<512,i=left?0:1,arm=arms[i],leg=legs[i];let r=body(q);
   const headWeight=1-smooth(260,330,y);if(headWeight>0){const h=rotate(r,body(d.neck),headRoll);r=[mix(r[0],h[0],headWeight),mix(r[1],h[1],headWeight)];}
   // Arm influence follows the actual sloping inner silhouette, then blends
   // into the shoulder. Long blue hair keeps its own restrained sway.
   const inward=left?x:1024-x,boundary=y<480?420:y<700?mix(420,350,(y-480)/220):335;
   const skirtLeft=417-(y-540)*.29,skirt=this.kind==='Girl'&&y>=535&&y<=875&&x>skirtLeft-50&&x<1024-skirtLeft+50;
   const aw=0;
   if(aw>0){const u=transform(q,arm.a,arm.b,arm.A,arm.B),v=transform(q,arm.b,arm.c,arm.B,arm.C),w=smooth(arm.b[1]-35,arm.b[1]+35,y);r=[mix(r[0],mix(u[0],v[0],w),aw),mix(r[1],mix(u[1],v[1],w),aw)];}
   const legDomain=smooth(315,350,x)*(1-smooth(674,709,x));
   const lw=this.kind==='Girl'&&y<850?0:smooth(d.legStart-40,d.legStart+25,y)*legDomain;if(lw>0){const u=transform(q,leg.a,leg.b,leg.A,leg.B),v=transform(q,leg.b,leg.c,leg.B,leg.C),w=smooth(leg.b[1]-45,leg.b[1]+45,y);let z=[mix(u[0],v[0],w),mix(u[1],v[1],w)];const fw=smooth(1380,1430,y);z=[mix(z[0],x+leg.C[0]-leg.c[0],fw),mix(z[1],y+leg.C[1]-leg.c[1],fw)];r=[mix(r[0],z[0],lw),mix(r[1],z[1],lw)];}
   position.setXYZ(k,(r[0]-d.origin[0])/ppm,(d.origin[1]-r[1])/ppm,0);
  }
  position.needsUpdate=true;this.mesh.position.set(p.x,0,.12);
  for(let i=0;i<2;i++){const arm=arms[i],pos=this.armLayers[i].geometry.attributes.position;for(let k=0;k<this.source.length;k++){const q=this.source[k],u=transform(q,arm.a,arm.b,arm.A,arm.B),v=transform(q,arm.b,arm.c,arm.B,arm.C),w=smooth(arm.b[1]-35,arm.b[1]+35,q[1]);pos.setXYZ(k,(mix(u[0],v[0],w)-512)/ppm,(1518-mix(u[1],v[1],w))/ppm,0);}pos.needsUpdate=true;}
  const face={...p.face,blink:Math.round((p.face?.blink??0)*12)/12,jaw:Math.round((p.face?.jaw??0)*20)/20,gaze:p.face?.gaze??[0,0],smile:0};const key=JSON.stringify(face);
  if(key!==this.lastFace){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.drawImage(this.art,0,0);this.ctx.drawImage(composePortraitPixels(this.art,this.paint,face),0,0);this.ctx.globalCompositeOperation='destination-out';this.ctx.drawImage(this.armMask,0,0);this.ctx.globalCompositeOperation='source-over';this.texture.needsUpdate=true;this.lastFace=key;}
  return{route:'illustrated-2d-deformation',feet:legs.map((l,i)=>({x:p.x+(d.footX[i]+l.C[0]-l.c[0]-512)/ppm,y:(d.origin[1]-(1518+l.C[1]-l.c[1]))/ppm,planted:p.stance?.[i?'right':'left']})),supportedHeadTurn:'in-plane only'};
 }
}
