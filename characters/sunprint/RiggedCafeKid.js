import * as THREE from 'three';
import {CafeKid} from './CafeKid.js';
import {ImportedPerformer} from '../../lib/craft3d/imported-performer.js';
import {illustrateImportedBody} from '../../lib/craft3d/illustrated-import.js';
import {calibrateHands,aimAnatomicalHand} from '../../lib/craft3d/anatomical-hand.js';
import {LimbSurface} from '../../lib/craft3d/surface.js';
import {CafeSkirt} from './CafeSkirt.js';
const V=p=>new THREE.Vector3(p.x,p.y,p.z??0);
/** Imported, skinned body base adapted to the original cafe cast. Its source
 * wardrobe is a candidate adaptation; generated face/hair remain independent. */
export class RiggedCafeKid extends CafeKid{
 constructor(kind,assets){super(kind,{...assets,neckBase:kind==='Girl'?1.32:1.39,headScale:kind==='Girl'?1.23:1.30,headDrop:kind==='Girl'?.070:.135});this.ready=Promise.all([this.ready,this.loadBody(assets.bodyUrl,assets.clothingUrl)]);}
 async loadBody(url,clothingUrl){
  const girl=this.girl,b=this.body=await ImportedPerformer.load(url,girl?1.65:1.78),s=girl?1.06:1;this.bodyScale=s;
  if(girl)b.restrictInfluences({min:[-.30,.53,-.22],max:[.30,.99,.23],maxAlbedoLuma:.42,allow:n=>n==='hips'||/leg|foot|toe/.test(n)});
  for(const m of b.skins)m.geometry.setAttribute('craftRegion',new THREE.BufferAttribute(new Float32Array(m.geometry.attributes.position.count*3),3));
  this.bodyAudit=illustrateImportedBody(b,{kind:girl?'aoi':'lei',headCut:girl?1.385:1.493,keepHair:false,skin:'#ffdcba',refineNeck:true});
  const cloth=await new THREE.TextureLoader().loadAsync(clothingUrl);cloth.colorSpace=THREE.SRGBColorSpace;
  for(const mesh of b.skins){
   const g=mesh.geometry,rest=g.attributes.performerRest,j=g.attributes.skinIndex,w=g.attributes.skinWeight,uv=new Float32Array(rest.count*2),legWeights=new Float32Array(rest.count),armWeights=new Float32Array(rest.count),bare=new Float32Array(rest.count);
   for(let v=0;v<rest.count;v++){
    const x=rest.getX(v),y=rest.getY(v),armWeight=[0,1,2,3].reduce((a,k)=>a+(/arm|hand|thumb|index|middle|ring|pinky/i.test(mesh.skeleton.bones[j.array[v*4+k]].name)?w.array[v*4+k]:0),0);
    armWeights[v]=armWeight;
    legWeights[v]=[0,1,2,3].reduce((a,k)=>a+(/upleg|leg|foot/i.test(mesh.skeleton.bones[j.array[v*4+k]].name)?w.array[v*4+k]:0),0);
    let px=512+x*(girl?850:820),py=girl?650-(y-.95)*940:705-(y-.98)*870;
    if(armWeight>.45&&y>.60){
     const side=x>0?'left':'right',A=b.neutral[side+'arm'],B=b.neutral[side+'forearm'],C=b.neutral[side+'hand'],vtx=new THREE.Vector3(x,y,rest.getZ(v));
     const upper=vtx.clone().sub(A).dot(B.clone().sub(A))/B.distanceToSquared(A),useLower=upper>1,aa=useLower?B:A,bb=useLower?C:B,axis=bb.clone().sub(aa),t=vtx.clone().sub(aa).dot(axis)/axis.lengthSq();
     bare[v]=upper>1.12?1:0;
     const sign=x>0?1:-1,pa=useLower?[512+sign*(girl?185:187),girl?555:575]:[512+sign*(girl?130:146),girl?343:350],pb=useLower?[512+sign*(girl?252:239),girl?755:766]:[512+sign*(girl?185:187),girl?555:575];
     const off=vtx.clone().sub(aa.clone().addScaledVector(axis,t)),normal=new THREE.Vector3(-axis.y,axis.x,0).normalize(),perp=off.dot(normal)*(girl?850:820),dx=pb[0]-pa[0],dy=pb[1]-pa[1],len=Math.hypot(dx,dy);
     px=pa[0]+t*dx+perp*dy/len;py=pa[1]+t*dy-perp*dx/len;
    }else if(!girl&&y<.98){px=512+x*830;py=1518-y/.98*800;}
    uv[v*2]=px/1024;uv[v*2+1]=1-py/1536;
   }
   if(girl){
    // Adapt the reused vest/bow surface into the selected plain shirt. Work on
    // existing rest-space geometry and retain its skin weights.
    const pos=g.attributes.position,inv=mesh.matrixWorld.clone().invert(),clothWeights=g.attributes.drawnCloth;
    for(let i=0;i<rest.count;i++){const x=rest.getX(i),y=rest.getY(i),z=rest.getZ(i);let yy=y,zz=z;
     if(Math.abs(x)<.078&&y>1.12&&y<1.29&&z>.079){const weight=(1-THREE.MathUtils.smoothstep(Math.abs(x),.060,.078))*THREE.MathUtils.smoothstep(y,1.12,1.15)*(1-THREE.MathUtils.smoothstep(y,1.27,1.29));zz=THREE.MathUtils.lerp(z,Math.min(z,.087),weight);}
     if(Math.abs(x)<.17&&y>.92&&y<1.03&&clothWeights.getW(i)<.5&&clothWeights.getX(i)<.1)yy=1.03+(y-1.03)*.30;
     if(yy!==y||zz!==z){const v=new THREE.Vector3(x,yy,zz).applyMatrix4(inv);pos.setXYZ(i,v.x,v.y,v.z);rest.setXYZ(i,x,yy,zz);}
    }pos.needsUpdate=true;rest.needsUpdate=true;g.computeVertexNormals();
   }
   g.setAttribute('cafePaintUV',new THREE.BufferAttribute(uv,2));g.setAttribute('cafeLeg',new THREE.BufferAttribute(legWeights,1));g.setAttribute('cafeBare',new THREE.BufferAttribute(bare,1));g.setAttribute('cafeArm',new THREE.BufferAttribute(armWeights,1));
   const m=mesh.material,compile=m.onBeforeCompile;m.onBeforeCompile=shader=>{compile(shader);
    shader.vertexShader='attribute float cafeArm;varying float vCafeArm;\n'+shader.vertexShader;shader.fragmentShader='varying float vCafeArm;\n'+shader.fragmentShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCafeArm=cafeArm;');
    shader.uniforms.cafeCloth={value:cloth};shader.vertexShader='attribute vec2 cafePaintUV;attribute float cafeLeg;varying vec2 vCafePaintUV;varying float vCafeLeg;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCafePaintUV=cafePaintUV;vCafeLeg=cafeLeg;');shader.fragmentShader='uniform sampler2D cafeCloth;varying vec2 vCafePaintUV;varying float vCafeLeg;\n'+shader.fragmentShader;
    shader.vertexShader='attribute float cafeBare;varying float vCafeBare;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCafeBare=cafeBare;');shader.fragmentShader='varying float vCafeBare;\n'+shader.fragmentShader;
    const palette={shirt:'#fdfbf4',shirtShade:'#c1b7dc',vest:'#fdfbf4',vestShade:'#c1b7dc',tie:'#fdfbf4',tieShade:'#c1b7dc',trousers:'#283b68',trousersShade:'#1e2e54',stockings:'#30303c',stockingsShade:'#222331',shoes:girl?'#30303c':'#f7f2ea',shoesShade:girl?'#20202d':'#c6bdd9'};
    for(const [k,value] of Object.entries(palette))shader.uniforms['drawn_'+k].value.set(value);
    shader.fragmentShader=shader.fragmentShader.replace('outgoingLight=mix(shade,base,skinPixel?mix(.84,1.0,skinLit):lit);',`outgoingLight=mix(shade,base,skinPixel?mix(.90,1.0,skinLit):mix(.52,1.0,lit));
      if(!skinPixel)outgoingLight*=mix(.88,1.03,clamp(dot(raw,vec3(.299,.587,.114))*1.4,0.0,1.0));
      ${girl?`if(y>.60&&y<.98&&!skinPixel){float lines=max(1.0-smoothstep(.018,.036,abs(fract(x*25.0)-.5)),1.0-smoothstep(.018,.036,abs(fract(y*28.0)-.5)));outgoingLight=mix(outgoingLight,vec3(.24,.28,.32),lines*.5);}if(vCafeLeg>.60&&y>.43&&y<.58)outgoingLight=drawn_skin*mix(.80,1.0,skinLit);`:''}
      vec4 painted=texture2D(cafeCloth,vCafePaintUV);float frontPaint=smoothstep(-.01,.055,vPerformerRest.z);bool shirtZone=y>${girl?'.98':'.98'};
      if(!skinPixel&&painted.a>.92&&((shirtZone&&painted.r>.48&&painted.g>.35)||${girl?'false':'(!shirtZone&&painted.r<.40&&painted.b>painted.r*.90)'}))outgoingLight=mix(outgoingLight,painted.rgb*mix(.86,1.0,lit),frontPaint);
      if(vCafeBare>.55)outgoingLight=drawn_skin*mix(.93,1.0,skinLit);
      ${girl?'if(x<.28&&y>.58&&y<1.04&&vCafeBare<.5&&vCafeArm<.15)discard;':''}
      ${girl?'if(x<.28&&y>.52&&y<.60&&vDrawnCloth.x<.2&&vCafeArm<.15)discard;':''}
      if(skinPixel&&x<.065&&y>${girl?'1.32':'1.405'})discard;`);
  };m.customProgramCacheKey=()=>`sunprint-imported-body-${this.kind}`;}
  b.mesh.traverse(o=>{if(o.name==='illustrated-body-outline')o.visible=false;});
  this.torso.visible=false;for(const item of Object.values(this.limbs))item.mesh.visible=false;for(const item of Object.values(this.sleeves))item.mesh.visible=false;for(const item of Object.values(this.socks))item.mesh.visible=false;for(const item of Object.values(this.hands))item.visible=false;for(const item of Object.values(this.feet))item.visible=false;
  b.mesh.scale.setScalar(s);this.mesh.add(b.mesh);this.soleSamples={left:[],right:[]};
  if(girl){this.skirt.visible=false;this.fittedSkirt=new CafeSkirt(this);
   // The source skirt and its hem were fused with the upper-leg shell. Its
   // removal needs a continuous skin bridge, driven by the actual solved rig.
   this.thighSurfaces={};for(const side of ['left','right']){const surface=new LimbSurface(this.mesh,'#ffdcba',[[0,.054],[.35,.048],[.50,.040],[.65,.035],[1,.028]],{start:.36,end:.61,depth:.92});surface.mesh.material=this.skin;surface.mesh.children[0].visible=false;this.thighSurfaces[side]=surface;}
  }
  // Two folded collar leaves overlap the neck base; the neck remains a real
  // continuous surface, rather than ending as a visible rectangular patch.
  this.cleanCollar=new THREE.Group();this.poseRoot.add(this.cleanCollar);
  const base=girl?1.32:1.39;
  for(const sign of [-1,1]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([sign*.037,base+.074,.044,sign*.080,base+.072,.024,sign*.119,base-.025,.09,sign*.047,base+.006,.095],3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#f8f6ed',side:THREE.DoubleSide}));this.cleanCollar.add(m);}
  for(const mesh of b.skins){const g=mesh.geometry,p=g.attributes.performerRest,j=g.attributes.skinIndex,w=g.attributes.skinWeight;
   for(const side of ['left','right']){const candidates=[];for(let i=0;i<p.count;i++){const amount=[0,1,2,3].reduce((a,k)=>a+(new RegExp(side+'.*(foot|toe)','i').test(mesh.skeleton.bones[j.array[i*4+k]].name)?w.array[i*4+k]:0),0);if(amount>.5&&p.getY(i)<.15)candidates.push({i,y:p.getY(i)});}candidates.sort((a,b)=>a.y-b.y);this.soleSamples[side].push(...candidates.slice(0,48).map(c=>({mesh,index:c.i})));}
  }
  this.mesh.updateMatrixWorld(true);
  b.anatomicalHands=calibrateHands(b);
 }
 setPose(p){
  const prior=super.setPose(p);if(!this.body)return prior;
  const a=this.body,s=this.bodyScale;a.reset();this.mesh.updateMatrixWorld(true);
  this.cleanCollar.position.y=p.bob??0;this.cleanCollar.rotation.z=(p.roll??0)*.45;
  const hips=a.bones.hips,world=hips.getWorldPosition(new THREE.Vector3());world.y+=p.bob??0;hips.position.copy(hips.parent.worldToLocal(world));a.rotateLocalFrame(hips,[0,0,(p.roll??0)*.45]);
  const contacts={};
  for(const [side,screenSide] of [['left','right'],['right','left']]){
   const targetW=this.mesh.localToWorld(V(p[screenSide+'Wrist'])),targetF=this.mesh.localToWorld(V(p[screenSide+'Foot']));targetF.y+=a.neutral[side+'foot'].y*s-.074*this.scale;
   const sign=side==='left'?1:-1,armPole=V(p[screenSide+'ElbowPole']??{x:sign,y:-.3,z:-.5}).transformDirection(this.mesh.matrixWorld),legPole=V({x:0,y:0,z:1}).transformDirection(this.mesh.matrixWorld);
   a.solve([side+'arm',side+'forearm',side+'hand'],targetW,armPole);
   if(p[screenSide+'Palm']){const direction=p.naturalWrist?a.bones[side+'hand'].getWorldPosition(new THREE.Vector3()).sub(a.bones[side+'forearm'].getWorldPosition(new THREE.Vector3())).normalize():V(p[screenSide+'Direction']).transformDirection(this.mesh.matrixWorld);aimAnatomicalHand(a,side,V(p[screenSide+'Palm']).transformDirection(this.mesh.matrixWorld),direction,1,{maxBend:p.naturalWrist?.28:1.0});}
   const grip=p[screenSide+'Grip']??0;
   if(grip>0){const palm=a.anatomicalHands[side].palm.clone().applyQuaternion(a.bones[side+'hand'].getWorldQuaternion(new THREE.Quaternion()));for(const finger of ['index','middle','ring','pinky'])for(let n=1;n<=3;n++){const b=a.bones[side+'hand'+finger+n],child=b?.children.find(c=>c.isBone);if(!child)continue;const axis=child.getWorldPosition(new THREE.Vector3()).sub(b.getWorldPosition(new THREE.Vector3())).normalize().cross(palm).normalize(),q=new THREE.Quaternion().setFromAxisAngle(axis,grip*(n===1?.7:1.1)).multiply(b.getWorldQuaternion(new THREE.Quaternion()));a.setWorldQuaternion(b,q);}}
   a.solve([side+'upleg',side+'leg',side+'foot'],targetF,legPole);
   const foot=a.bones[side+'foot'],neutral=a.neutralQuaternion[side+'foot'].clone();
   const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(p[screenSide+'FootPitch']??0,(p.yaw??0)+(p[screenSide+'FootYaw']??0),0));a.setWorldQuaternion(foot,q.multiply(neutral));
   contacts[screenSide]={actual:foot.getWorldPosition(new THREE.Vector3()).toArray(),target:targetF.toArray(),planted:p.stance?.[screenSide],wristActual:a.bones[side+'hand'].getWorldPosition(new THREE.Vector3()).toArray(),wristTarget:targetW.toArray(),grip:a.bones[side+'handindex1'].getWorldPosition(new THREE.Vector3()).lerp(a.bones[side+'handthumb2'].getWorldPosition(new THREE.Vector3()),.5).toArray(),footQuaternion:foot.getWorldQuaternion(new THREE.Quaternion()).toArray()};
  }
  this.mesh.updateMatrixWorld(true);
  if(this.thighSurfaces)for(const side of ['left','right'])this.thighSurfaces[side].update(['upleg','leg','foot'].map(part=>this.mesh.worldToLocal(a.bones[side+part].getWorldPosition(new THREE.Vector3()))));
  const garment=this.fittedSkirt?.update(p);
  for(const mesh of a.skins)mesh.skeleton.update();const feet=[];
  for(const [side,screenSide] of [['right','left'],['left','right']]){const samples=this.soleSamples[side].map(({mesh,index})=>mesh.getVertexPosition(index,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld));const centre=samples.reduce((a,b)=>a.add(b),new THREE.Vector3()).multiplyScalar(1/Math.max(1,samples.length));feet.push({x:centre.x,y:Math.min(...samples.map(v=>v.y)),z:centre.z,planted:p.stance?.[screenSide],samples:samples.length});}
  return{route:'skinned-three-dimensional-body-and-painted-head',joints:contacts,feet,garment};
 }
}
