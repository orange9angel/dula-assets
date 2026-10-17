import * as THREE from 'three';
import {LimbSurface,ringsGeometry,shoeGeometry,mesh,jointInk} from '../../lib/craft3d/surface.js';
import {ArticulatedHand} from '../../lib/craft3d/hand.js';
import {twoBone} from '../../lib/craft3d/pose.js';
import {createDrawnHead} from '../../lib/craft3d/drawn-head.js';
import {paintGeneratedPortrait} from '../../lib/craft3d/generated-portrait-paint.js';
import {addPaintedHairShell} from '../../lib/craft3d/painted-hair-shell.js';
import {addCafeRearHair,applyCafeSidePainting} from './CafeRearHair.js';

const V=p=>new THREE.Vector3(p.x,p.y,p.z??0),P=(x,y,z=0)=>({x,y,z});
const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
function cel(color,shade){
  const m=new THREE.MeshBasicMaterial({color,toneMapped:false});
  m.onBeforeCompile=s=>{
    s.uniforms.celShade={value:new THREE.Color(shade)};
    s.vertexShader='varying vec3 cafeNormal;\n'+s.vertexShader;
    s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncafeNormal=normalize(mat3(modelMatrix)*normal);');
    s.fragmentShader='varying vec3 cafeNormal;uniform vec3 celShade;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat lit=step(-.10,dot(normalize(cafeNormal),normalize(vec3(-.8,1.,1.2))));diffuseColor.rgb=mix(celShade*diffuseColor.rgb, diffuseColor.rgb,lit);');
  };
  m.customProgramCacheKey=()=> 'sunprint-cafe-cel-'+color+'-'+shade;return m;
}
function flatPolygon(parent,points,material){
  const s=new THREE.Shape();s.moveTo(points[0][0],points[0][1]);for(const p of points.slice(1))s.lineTo(p[0],p[1]);s.closePath();
  return mesh(parent,new THREE.ShapeGeometry(s),material,false);
}
function plaid(){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#253c79';x.fillRect(0,0,512,512);
  for(let p=0;p<512;p+=64){x.fillStyle='#1f315e';x.fillRect(p,0,12,512);x.fillRect(0,p,512,9);x.fillStyle='#9c9879';x.fillRect(p+22,0,2,512);x.fillRect(0,p+21,512,2);x.fillStyle='#5275a4';x.fillRect(p+29,0,2,512);}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function featureRecipe(kind){
  const girl=kind==='Girl',originX=girl?658:679,originY=girl?441:457,anchorY=girl?1.575:1.690,ppm=girl?2400:2700;
  const eye=(x0,x1,y0,y1,cy)=>({irisCentre:[(x0+x1)/2,cy],irisRadii:[girl?30:24,girl?38:26],upper:[[x0,y0],[x0+(x1-x0)*.24,y0-(girl?30:15)],[x0+(x1-x0)*.77,y0-(girl?25:17)],[x1,y0+3]],lower:[[x0,y0],[x0+(x1-x0)*.23,y1],[x0+(x1-x0)*.77,y1],[x1,y0+3]],closed:[[x0,y0+10],[x0+(x1-x0)*.3,y0+23],[x0+(x1-x0)*.7,y0+24],[x1,y0+12]],gazePixels:[6,3],pinMargin:17,clear:{rect:[x0-8,y0-35,x1-x0+16,y1-y0+49],sampleTop:y0-36,sampleBottom:y1+15,sampleX:[x0+4,x1-4],feather:6},upperBand:{above:7,below:8,inkMin:95,inkMax:175},lowerBand:{above:2,below:3,inkMin:95,inkMax:170}});
  const eyes=girl?[eye(503,611,420,490,446),eye(717,829,420,490,446)]:[eye(525,643,446,487,459),eye(715,836,446,487,459)];
  const mouthY=girl?577:600,mouthX=girl?658:680,mouthW=girl?66:91;
  const facePath=girl?[
    ['M',501,310],['C',528,198,789,198,830,320],['L',830,493],['Q',824,560,775,609],['Q',716,650,658,666],['Q',602,651,549,607],['Q',494,555,487,493],['Z']
  ]:[['M',511,330],['C',546,245,808,245,847,330],['L',854,504],['Q',824,607,756,656],['Q',701,700,680,698],['Q',655,698,601,655],['Q',532,607,509,504],['Z']];
  return {originX,originY,anchorY,pixelsPerMetre:ppm,faceFeatherPixels:7,facePath,eyes,mouth:{lip:[[mouthX-mouthW/2,mouthY],[mouthX-11,mouthY+2],[mouthX+14,mouthY+2],[mouthX+mouthW/2,mouthY-1]],openPixels:55,maxJaw:.95,inside:'#693e43',tongue:'#c98588',clear:{rect:[mouthX-mouthW/2-10,mouthY-10,mouthW+20,70],sampleTop:mouthY-12,sampleBottom:mouthY+64,sampleX:[mouthX-mouthW/2-6,mouthX+mouthW/2+6],feather:6}}};
}

/** Original long-haired/white-shirt Sunprint cast. This is a viewer actor,
 * composed from shared craft3d geometry and generated portrait painting.
 * Asset URLs are supplied by the episode; there are no cross-episode imports.
 * Optional rear/side production paintings complete the turning candidate. */
export class CafeKid {
  constructor(kind,{portraitUrl,hairUrl,rearHairUrl,sideHairUrl,neckBase,headScale=1.18,headDrop=.045}){
    this.kind=kind;this.girl=kind==='Girl';this.headScale=headScale;this.headDrop=headDrop;const girl=this.girl;
    this.mesh=new THREE.Group();this.mesh.name=kind;this.poseRoot=new THREE.Group();this.mesh.add(this.poseRoot);
    this.scale=girl?1:1.07;const s=this.scale;
    this.shirt=cel('#fdfbf4','#b5a9d4');this.skin=cel('#ffdcba','#e7b69c');this.pants=cel('#293851','#8e7cc3');this.shoeMat=cel(girl?'#34333e':'#f3eee5','#a396bd');
    this.torso=new THREE.Group();this.poseRoot.add(this.torso);
    const levels=[[.94,.122,.076],[1.06,.127,.083],[1.23,.148,.09],[1.37,.176,.075],[1.405,.057,.045]].map(r=>[r[0]*s,r[1]*s,r[2]*s]);
    mesh(this.torso,ringsGeometry(levels),this.shirt);
    for(const sign of [-1,1]){
      const collar=flatPolygon(this.torso,[[sign*.015*s,1.412*s],[sign*.061*s,1.426*s],[sign*.106*s,1.342*s],[sign*.047*s,1.365*s]],this.shirt);collar.position.z=.086*s;
    }
    const placket=mesh(this.torso,new THREE.BoxGeometry(.011,.34*s,.003),this.shirt,false);placket.position.set(0,1.18*s,.09*s);
    for(let i=0;i<4;i++){const b=mesh(this.torso,new THREE.CircleGeometry(.005,12),new THREE.MeshBasicMaterial({color:'#bcb5b3'}),false);b.position.set(.001,(1.05+i*.075)*s,.094*s);}
    if(girl){
      const material=cel('#ffffff','#9c8bbd');material.map=plaid();
      this.skirt=mesh(this.torso,ringsGeometry([[.640,.223,.139],[.66,.224,.14],[.81,.162,.102],[.96,.126,.081]],{pleats:.035}),material);
      const p=this.skirt.geometry.attributes.position,u=this.skirt.geometry.attributes.uv;
      for(let i=0;i<p.count;i++)u.setXY(i,.5+Math.atan2(p.getX(i),p.getZ(i))/(Math.PI*2)*2,(p.getY(i)-.64)*3);u.needsUpdate=true;
    }else mesh(this.torso,ringsGeometry([[.83,.145,.096],[1.005,.132,.084]].map(r=>[r[0]*s,r[1]*s,r[2]*s])),this.pants);
    this.limbs={};this.sleeves={};this.hands={};this.feet={};this.socks={};
    for(const [side,sign] of [['left',-1],['right',1]]){
      const arm=new LimbSurface(this.poseRoot,'#ffdcba',[[0,.041],[.3,.038],[.54,.027],[.72,.031],[1,.021]],{depth:.82});arm.mesh.material=this.skin;this.limbs[side+'Arm']=arm;
      const leg=new LimbSurface(this.poseRoot,girl?'#ffdcba':'#293851',girl?[[0,.060],[.30,.053],[.51,.036],[.70,.040],[1,.024]]:[[0,.076],[.28,.069],[.51,.049],[.70,.053],[1,.038]]);leg.mesh.material=girl?this.skin:this.pants;this.limbs[side+'Leg']=leg;
      const sleeve=new LimbSurface(this.poseRoot,'#fdfbf4',[[0,.071],[.32,.065],[1,.054]],{end:.36});sleeve.mesh.material=this.shirt;this.sleeves[side]=sleeve;
      if(girl){const sock=new LimbSurface(this.poseRoot,'#353441',[[0,.039],[.7,.032],[1,.026]],{start:.52,end:1.0});sock.mesh.material=cel('#353441','#8e7cc3');this.socks[side]=sock;}
      const hand=new ArticulatedHand(sign,this.skin,jointInk);hand.scale.setScalar(.82*s);this.poseRoot.add(hand);this.hands[side]=hand;
      const foot=new THREE.Group();this.poseRoot.add(foot);mesh(foot,shoeGeometry(),this.shoeMat);foot.scale.set(.90*s,.90*s,1*s);this.feet[side]=foot;
    }
    // The head/neck bones provide the exact contract required by drawn-head.
    this.bones={neck:new THREE.Bone(),head:new THREE.Bone()};this.poseRoot.add(this.bones.neck);this.bones.neck.position.y=1.40*s;this.bones.neck.add(this.bones.head);this.bones.head.position.y=.115*s;this.mesh.updateMatrixWorld(true);
    const paint=featureRecipe(kind),dy=girl?0:.115;
    const shift=r=>[r[0]+dy,...r.slice(1)],eyeY=paint.anchorY;
    const profiles=[[1.481,.001,.095,.068],[1.490,.021,.102,.040],[1.508,.043,.105,.008],[1.530,.064,.105,-.035],[1.555,.079,.102,-.065],[1.578,.088,.100,-.082],[1.615,.093,.10,-.10],[1.661,.091,.082,-.107],[1.710,.065,.042,-.090],[1.748,.001,-.025,-.026]].map(shift);
    const config={profiles,centerX:0,centerY:1.61+dy,range:.205,headCut:1.475+dy,eyes:[[-.042,eyeY],[.042,eyeY]],brows:[[-.042,eyeY+.032],[.042,eyeY+.032]],mouth:[0,1.518+dy],noseY:1.547+dy,noseDepth:.004,faceRoundness:.62,skin:'#ffdcba',contour:'#765647',irisArt:portraitUrl,textureSize:1024,paintFace:paintGeneratedPortrait,paint,earY:eyeY-.006,earZ:.002,earScale:[.012,.025,.019],drawnEar:true,earShape:'attached',neckRadius:.035,neckProfile:[[1.395+dy,.044,.048,-.033],[1.433+dy,.036,.045,-.037],[1.480+dy,.033,.039,-.044],[1.52+dy,.037,.038,-.047]],neckShading:{start:1.475+dy,end:1.49+dy,color:'#ecb392'}};
    if(neckBase!=null)config.neckProfile[0][0]=neckBase;
    if(rearHairUrl){config.profileContour=[[1.481,.075],[1.493,.091],[1.512,.103],[1.526,.105],[1.540,.103],[1.549,.111],[1.565,.103],[1.595,.101],[1.630,.095],[1.675,.069],[1.748,-.025]].map(p=>[p[0]+dy,p[1]]);config.noseDepth=.004;config.contourWidth=.022;}
    this.face=createDrawnHead(this,config);
    const hc=girl?{originX:658,originY:441,pixelsPerMetre:2400}: {originX:676,originY:783,pixelsPerMetre:4510};
    const capY=1.631+dy;
    this.ready=Promise.all([this.face.ready,addPaintedHairShell(this,{url:hairUrl,backUrl:rearHairUrl,rearOnFrontBack:false,rearMap:girl?{originX:512,originY:32,anchorY:1.755,pixelsPerMetre:1770,spanX:300}:{originX:627,originY:85,anchorY:1.754+dy,pixelsPerMetre:4150,spanX:470},...hc,anchorY:eyeY,cores:[],baseColor:girl?'#223978':'#343440',edgeColor:girl?'#233472':'#302f37',cap:{center:[0,capY,-.015],radii:[.105,.123,.115],hem:[[-180,1.51+dy],[-110,1.54+dy],[-60,1.63+dy],[0,1.70+dy],[60,1.63+dy],[110,1.54+dy],[180,1.51+dy]]},capCrop:girl?[470,92,180,180]:[450,175,240,240],projectionRadii:rearHairUrl?[.119,.125,.125]:[.131,.17,.125],surface:{headClearance:girl&&rearHairUrl?.003:undefined,fringeY:[eyeY+.015,eyeY+.11],fringeX:[.075,.12],fringeDepth:.115,fringeSlope:.15,offset:.004,templeX:girl&&rearHairUrl?[.043,.085]:[.08,.12],templeY:[eyeY,eyeY+.06],templeDepth:girl&&rearHairUrl?-.005:.010,thickness:.001}}).then(async root=>{
      this.hairRoot=root;this.hairRest=[];
      root.traverse(o=>{if(o.isMesh&&o.geometry.attributes.position){const a=o.geometry.attributes.position;if(girl)for(let i=0;i<a.count;i++){const y=a.getY(i),w=1-smooth(1.25,1.51,y);if(y<1.51)a.setXYZ(i,a.getX(i)*(1-.25*w),1.51+(y-1.51)*2.3,a.getZ(i)-.025*w);}a.needsUpdate=true;o.geometry.computeVertexNormals();this.hairRest.push({mesh:o,base:a.array.slice()});}});
      if(rearHairUrl){const texture=await new THREE.TextureLoader().loadAsync(rearHairUrl);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;const mesh=addCafeRearHair(root,texture,{girl,dy});this.hairRest.push({mesh,base:mesh.geometry.attributes.position.array.slice()});}
      if(sideHairUrl){const texture=await new THREE.TextureLoader().loadAsync(sideHairUrl);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;applyCafeSidePainting(root,texture);}
    })]);
  }
  setPose(p){
    const s=this.scale;this.mesh.position.set(p.x??0,0,p.z??0);this.mesh.rotation.y=p.yaw??0;
    const bob=p.bob??0,roll=p.roll??0;this.torso.position.y=bob;this.torso.rotation.z=roll;
    this.bones.neck.position.set(0,1.40*s+bob,0);this.bones.neck.rotation.z=roll*.7;
    this.bones.head.position.y=.115*s-this.headDrop;this.bones.head.scale.setScalar(this.headScale);
    this.bones.head.rotation.set(p.headPitch??0,p.headYaw??0,p.headRoll??0);
    const records={};
    for(const [side,sign] of [['left',-1],['right',1]]){
      const shoulder=P(sign*.174*s-roll*.1,1.37*s+bob,0),hip=P(sign*.080*s,.895*s+bob,0);
      const wrist=p[side+'Wrist']??P(sign*.225*s,.925*s+bob,.055),ankle=p[side+'Foot']??P(sign*.11*s,.074*s,0);
      const elbow=twoBone(shoulder,wrist,P(sign,0,-.5),.248*s,.231*s),knee=twoBone(hip,ankle,P(0,0,1),.425*s,.410*s);
      const arm=[shoulder,elbow,wrist],leg=[hip,knee,ankle];this.limbs[side+'Arm'].update(arm);this.limbs[side+'Leg'].update(leg);this.sleeves[side].update(arm);this.socks[side]?.update(leg);
      const hand=this.hands[side],axis=V(wrist).sub(V(elbow)).normalize();hand.position.copy(V(wrist));
      const thumb=new THREE.Vector3(0,1,0).addScaledVector(axis,-axis.y);if(thumb.length()<.1)thumb.set(sign,0,0).addScaledVector(axis,-axis.x*sign);thumb.normalize();
      const normal=new THREE.Vector3().crossVectors(axis,thumb).normalize();hand.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(axis,thumb,normal));hand.setGesture(p[side+'Gesture']??{open:.2});
      this.feet[side].position.copy(V(ankle));this.feet[side].rotation.set(p[side+'FootPitch']??0,p[side+'FootYaw']??sign*.04,0);
      records[side+'Arm']=arm;records[side+'Leg']=leg;
    }
    this.mesh.updateMatrixWorld(true);this.face.updateGeometry();this.face.apply(p.face??{});
    // World-independent sway below the attached crown; no accumulated state.
    if(this.hairRest)for(const {mesh,base} of this.hairRest){const a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){
      const x=base[i*3],y=base[i*3+1],z=base[i*3+2],w=this.girl?1-smooth(1.28,1.56,y):0;
      const lag=p.hairLag??0,theta=lag*w,c=Math.cos(theta),sn=Math.sin(theta);
      a.setXYZ(i,c*x+sn*z+(p.hairSway??0)*w,y,-sn*x+c*z+Math.abs(p.hairSway??0)*w*.4);
    }a.needsUpdate=true;}
    return records;
  }
}
