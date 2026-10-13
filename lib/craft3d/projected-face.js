import * as THREE from 'three';
import {addFacialDeformation} from './facial-deform.js';

/** Local facial texture controls on the actual skinned surface, never a camera billboard.
 * Landmarks are calibrated in bind-pose metres. Original PBR maps remain on the body.
 * This is a limited graphic face rig, not a recovered anatomical mouth/eyeball rig.
 */
export function createProjectedFace(actor,renderer,config){
  const {centerY,range=.19,eyes,mouth}=config;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e7c4ac');scene.add(actor.mesh);
  const originals=actor.skins.map(o=>o.material);
  for(const o of actor.skins)o.material=new THREE.MeshBasicMaterial({map:o.material.map});
  const camera=new THREE.OrthographicCamera(-range,range,range,-range,.01,5);camera.position.set(0,centerY,2);camera.lookAt(0,centerY,0);
  const rt=new THREE.WebGLRenderTarget(1024,1024,{type:THREE.UnsignedByteType});rt.texture.colorSpace=THREE.SRGBColorSpace;
  const previous=renderer.getRenderTarget(),tone=renderer.toneMapping;
  renderer.toneMapping=THREE.NoToneMapping;renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(previous);renderer.toneMapping=tone;
  actor.skins.forEach((o,i)=>{o.material.dispose();o.material=originals[i];});scene.remove(actor.mesh);
  const deform=addFacialDeformation(actor,config);
  const u={faceAtlas:{value:rt.texture},faceBlink:{value:0},faceJaw:{value:0},faceWidth:{value:1},faceSmile:{value:0},faceFear:{value:0},faceFocus:{value:0},faceGaze:{value:new THREE.Vector2()}};
  const f=n=>Number(n).toFixed(7),vec=a=>`vec${a.length}(${a.map(f).join(',')})`;
  const shader=`
  uniform sampler2D faceAtlas;
  uniform float faceBlink,faceJaw,faceWidth,faceSmile,faceFear,faceFocus;
  uniform vec2 faceGaze;
  varying vec3 vPerformerRest;
  vec3 faceRead(vec2 p){return texture2D(faceAtlas,(p-vec2(0.0,${f(centerY)}))/(2.0*${f(range)})+0.5).rgb;}
  vec3 movingIris(vec2 p,vec4 eye,vec4 iris){
    // Continuous inverse warp, pinned at the original eyelid outline. Erasing
    // the old iris with sampled white creates double rims on textured eyes.
    vec2 shift=faceGaze*vec2(.0045,.0025);
    vec2 ed=(p-eye.xy)/eye.zw;
    float interior=1.0-smoothstep(.58,1.02,length(ed));
    return faceRead(p-shift*interior);
  }
  vec3 faceEye(vec3 base,vec2 p,vec4 eye,vec4 iris){
    vec2 d=(p-eye.xy)/eye.zw;
    float coverage=1.0-smoothstep(1.10,1.35,length(d));
    if(coverage<=0.0)return base;
    float openness=max(0.015,(1.0-faceBlink)*(1.0-.14*faceFocus+.08*faceFear));
    vec3 skin=faceRead(vec2(p.x,eye.y-eye.w*1.65));
    vec2 source=eye.xy+vec2(p.x-eye.x,(p.y-eye.y)/openness);
    float inside=1.0-smoothstep(.87,1.12,abs(d.y)/openness);
    vec3 color=mix(skin,movingIris(source,eye,iris),inside);
    float lidY=-.10+.17*d.x*d.x;
    float line=(1.0-smoothstep(.035,.10,abs(d.y-lidY)))*(1.0-smoothstep(.84,1.03,abs(d.x)));
    color=mix(color,vec3(.095,.043,.025),line*smoothstep(.88,.98,faceBlink));
    return mix(base,color,coverage);
  }
  vec3 faceMouth(vec3 base,vec2 p){
    vec2 center=${vec(mouth.slice(0,2))};vec2 size=${vec(mouth.slice(2))};
    vec2 d=(p-center)/size;
    float coverage=1.0-smoothstep(1.1,1.5,length(d));if(coverage<=0.0)return base;
    float width=clamp(faceWidth,.73,1.22),x=d.x/width;
    float smile=(faceSmile*.24-faceFear*.24)*x*x;
    float aperture=faceJaw*.63*sqrt(max(0.0,1.0-x*x));
    float y=d.y-smile;
    vec2 source=center+vec2(x*size.x,(y-sign(y)*aperture)*size.y);
    vec3 color=faceRead(source);
    float hole=(1.0-smoothstep(aperture-.035,aperture+.025,abs(y)))*(1.0-smoothstep(.87,1.0,abs(x)))*smoothstep(.015,.10,faceJaw);
    vec3 inner=mix(vec3(.075,.017,.025),vec3(.27,.067,.088),smoothstep(.05,-.50,y));
    float teeth=smoothstep(aperture-.16,aperture-.08,y)*(1.0-smoothstep(aperture-.03,aperture+.02,y))*smoothstep(.22,.42,faceJaw);
    inner=mix(inner,vec3(.83,.75,.62),teeth*.84);
    color=mix(color,inner,hole);
    return mix(base,color,coverage);
  }
  vec3 faceBrow(vec3 base,vec2 p,vec4 brow,float side){
    vec2 d=(p-brow.xy)/brow.zw;float coverage=1.0-smoothstep(1.0,1.6,length(d));
    float shift=.0015*faceFear+side*d.x*(.003*faceFocus-.0035*faceFear);
    return mix(base,faceRead(p-vec2(0.0,shift)),coverage*min(1.0,faceFear+faceFocus));
  }
  float faceLidMask(vec2 p,vec4 eye){return (1.0-smoothstep(.95,1.4,length((p-eye.xy)/eye.zw)))*faceBlink;}
  float faceMask(){return step(${f(config.frontZ??.035)},vPerformerRest.z)*max(faceLidMask(vPerformerRest.xy,${vec(eyes[0])}),faceLidMask(vPerformerRest.xy,${vec(eyes[1])}));}
  `;
  for(const mesh of actor.skins){
    const rest=mesh.geometry.attributes.performerRest,normal=new Float32Array(rest.count*3),mask=new Float32Array(rest.count);
    const inverseNormal=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld).invert();
    const smooth=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
    for(let i=0;i<rest.count;i++){
      const x=rest.getX(i),y=rest.getY(i),z=rest.getZ(i);
      mask[i]=z>(config.frontZ??.035)?Math.max(...eyes.map(e=>1-smooth(.9,1.5,Math.hypot((x-e[0])/e[2],(y-e[1])/e[3])))):0;
      new THREE.Vector3(x*3,0,1).normalize().applyMatrix3(inverseNormal).normalize().toArray(normal,i*3);
    }
    mesh.geometry.setAttribute('performerLidNormal',new THREE.BufferAttribute(normal,3));
    mesh.geometry.setAttribute('performerLidMask',new THREE.BufferAttribute(mask,1));
    const m=mesh.material;m.onBeforeCompile=s=>{
      Object.assign(s.uniforms,u);
      s.vertexShader='attribute vec3 performerRest; attribute vec3 performerLidNormal; attribute float performerLidMask; uniform float faceBlink; varying vec3 vPerformerRest;\n'+s.vertexShader;
      s.vertexShader=s.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=normalize(mix(objectNormal,performerLidNormal,performerLidMask*faceBlink));');
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPerformerRest=performerRest;');
      s.fragmentShader=shader+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','vec3 faceSmoothNormal=normal;\n#include <normal_fragment_maps>\nnormal=normalize(mix(normal,faceSmoothNormal,faceMask()));');
      s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.9,faceMask());');
      s.fragmentShader=s.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,0.0,faceMask());');
      s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        if(vPerformerRest.z>${f(config.frontZ??.035)}){
          vec2 p=vPerformerRest.xy;
          diffuseColor.rgb=faceEye(diffuseColor.rgb,p,${vec(eyes[0])},${vec(config.irises[0])});
          diffuseColor.rgb=faceEye(diffuseColor.rgb,p,${vec(eyes[1])},${vec(config.irises[1])});
          diffuseColor.rgb=faceMouth(diffuseColor.rgb,p);
          ${config.brows?config.brows.map((b,i)=>`diffuseColor.rgb=faceBrow(diffuseColor.rgb,p,${vec(b)},${i===0?'-1.0':'1.0'});`).join('\n'):''}
        }`);
    };m.customProgramCacheKey=()=>JSON.stringify(config);m.needsUpdate=true;
  }
  const state={blink:0,jaw:0,width:1,smile:0,fear:0,focus:0,gaze:[0,0]};
  return {head:actor.bones.head,atlas:rt.texture,state,
    apply({blink=0,jaw=0,width=1,smile=0,fear=0,focus=0,gaze=[0,0]}={}){
      Object.assign(state,{blink,jaw,width,smile,fear,focus,gaze});
      deform(state);
      u.faceBlink.value=THREE.MathUtils.clamp(blink,0,1);u.faceJaw.value=THREE.MathUtils.clamp(jaw,0,1);u.faceWidth.value=width;
      u.faceSmile.value=smile;u.faceFear.value=fear;u.faceFocus.value=focus;u.faceGaze.value.set(...gaze);
    },dispose(){rt.dispose();}
  };
}
