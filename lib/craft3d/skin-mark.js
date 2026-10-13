import * as THREE from 'three';
/** Pigment on the original deforming forearm: no floating/intersecting decal. */
export function addForearmMark(actor,side='left'){
  const start=actor.neutral[side+'forearm'],end=actor.neutral[side+'hand'],axis=end.clone().sub(start),length=axis.length();axis.normalize();
  const x=new THREE.Vector3(0,0,1).cross(axis).normalize(),y=axis.clone().cross(x),uniform={value:.4};
  const vec=v=>`vec3(${v.toArray().map(n=>n.toFixed(7)).join(',')})`;
  for(const mesh of actor.skins){const material=mesh.material,previous=material.onBeforeCompile,cache=material.customProgramCacheKey;
    material.onBeforeCompile=s=>{previous(s);s.uniforms.markGrowth=uniform;s.fragmentShader='uniform float markGrowth;\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 markD=vPerformerRest-${vec(start)};
        float markU=dot(markD,${vec(axis)})/${length.toFixed(7)};
        float markR=length(markD-${vec(axis)}*markU*${length.toFixed(7)});
        float markA=atan(dot(markD,${vec(y)}),dot(markD,${vec(x)}));
        float markLine=abs(sin(markA*2.0+sin(markU*29.0)*.2));
        float markAlpha=(1.0-smoothstep(.07,.17,markLine))*smoothstep(.26,.3,markU)*(1.0-smoothstep(.55+markGrowth*.31,.60+markGrowth*.31,markU))*(1.0-step(.075,markR));
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.12,.94,.62),markAlpha*.88);`);
    };material.customProgramCacheKey=()=>cache.call(material)+'_forearm_mark';material.needsUpdate=true;
  }
  return value=>{uniform.value=value;};
}
