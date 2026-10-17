import * as THREE from 'three';
import {composePortraitPixels} from '../../lib/craft3d/generated-portrait-paint.js';

const caches=new WeakMap();
/** Keep authored facial marks, while skin and the jaw silhouette belong to the
 * continuous head surface. Source paintings remain immutable. */
export function paintCafeFeatures(ctx,config,state,art){
 if(!art)return;
 const p=config.paint;let c=caches.get(art);
 if(!c){
  const mask=document.createElement('canvas');mask.width=art.width;mask.height=art.height;
  const m=mask.getContext('2d');
  const girl=p.originX===658;
  const domains=girl?[[558,439,76,74],[773,439,78,74],[558,355,65,16],[769,355,65,16],[660,515,22,30],[658,588,57,42],[548,508,32,17],[784,508,32,17]]:
   [[584,454,77,51],[776,454,77,51],[579,392,70,19],[774,392,70,19],[679,528,25,41],[680,615,65,43]];
  for(const [x,y,rx,ry] of domains){m.save();m.translate(x,y);m.scale(rx,ry);const g=m.createRadialGradient(0,0,.58,0,0,1);g.addColorStop(0,'white');g.addColorStop(1,'transparent');m.fillStyle=g;m.fillRect(-1,-1,2,2);m.restore();}
  const layer=document.createElement('canvas');layer.width=art.width;layer.height=art.height;c={mask,layer,ctx:layer.getContext('2d')};caches.set(art,c);
 }
 c.ctx.clearRect(0,0,art.width,art.height);c.ctx.drawImage(composePortraitPixels(art,p,state),0,0);
 c.ctx.globalCompositeOperation='destination-in';c.ctx.drawImage(c.mask,0,0);c.ctx.globalCompositeOperation='source-over';
 const ppm=p.pixelsPerMetre;ctx.save();ctx.translate(-p.originX/ppm,p.anchorY+p.originY/ppm);ctx.scale(1/ppm,-1/ppm);ctx.drawImage(c.layer,0,0);ctx.restore();
}

export function integrateCafeHead(actor){
 const face=actor.face,skinMeshes=[face.root.children[0],...face.root.children.filter(o=>o.isMesh&&o.geometry.type==='SphereGeometry')];
 const neck=actor.mesh.getObjectByName('drawn-continuous-neck');if(neck)skinMeshes.push(neck);
 for(const mesh of skinMeshes){
  if(!mesh.visible)continue;
  const material=mesh.material,previous=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.onBeforeCompile=function(shader,renderer){
   previous.call(this,shader,renderer);
   shader.vertexShader='varying vec3 vCafeSkinNormal;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCafeSkinNormal=normalize(mat3(modelMatrix)*normal);');
   shader.fragmentShader='varying vec3 vCafeSkinNormal;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float nLight=dot(normalize(vCafeSkinNormal),normalize(vec3(-.35,.65,.7)));
    float skinLight=smoothstep(-.22,.48,nLight);
    diffuseColor.rgb*=mix(vec3(.87,.85,.89),vec3(1.0),skinLight);
   `);
  };
  material.customProgramCacheKey=()=>key+'|cafe-continuous-skin-v4';material.needsUpdate=true;
 }
 // Actual lower-face movement accompanies the UV mouth; no camera-facing face.
 const jaw={value:0},centre=actor.girl?1.518:1.633;
 for(const mesh of face.root.children.slice(0,2)){
  const m=mesh.material,compile=m.onBeforeCompile,key=m.customProgramCacheKey();
  m.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);shader.uniforms.cafeJaw=jaw;shader.vertexShader='uniform float cafeJaw;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    float jawWeight=(1.0-smoothstep(${(centre-.010).toFixed(6)},${(centre+.008).toFixed(6)},position.y))*smoothstep(-.015,.060,position.z);
    transformed.y-=cafeJaw*.0045*jawWeight;transformed.z-=cafeJaw*.0015*jawWeight;
   `);
  };m.customProgramCacheKey=()=>key+'|cafe-jaw-v4';m.needsUpdate=true;
 }
 actor.cafeJaw=jaw;
}
