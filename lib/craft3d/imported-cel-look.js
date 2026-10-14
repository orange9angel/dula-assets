import * as THREE from 'three';

/** Experimental look development on an imported mesh. Retains its skeleton,
 * UVs, face shader and morphs. 'toon' isolates lighting from texture changes;
 * 'painted' additionally replaces selected baked tones with authored colors.
 * This does not reconstruct topology or remove geometric sculpting. */
export function applyImportedCelLook(actor,{mode='toon',palette,hairMinY,headMinY,face}={}){
  const counts={hair:0,skin:0,other:0};
  for(const mesh of actor.skins){
    const old=mesh.material,g=mesh.geometry,p=g.attributes.performerRest,uv=g.attributes.uv;
    const map=old.map,canvas=document.createElement('canvas');canvas.width=map.image.width;canvas.height=map.image.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(map.image,0,0);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,texel=new THREE.Vector2();
    const mask=new Float32Array(p.count*3);
    const joints=g.attributes.skinIndex,weights=g.attributes.skinWeight,names=mesh.skeleton.bones.map(b=>b.name.toLowerCase());
    for(let i=0;i<p.count;i++){
      texel.fromBufferAttribute(uv,i);map.transformUv(texel);
      const k=(Math.min(canvas.height-1,Math.max(0,Math.floor(texel.y*canvas.height)))*canvas.width+Math.min(canvas.width-1,Math.max(0,Math.floor(texel.x*canvas.width))))*4;
      const r=pixels[k]/255,green=pixels[k+1]/255,b=pixels[k+2]/255;
      const ids=[joints.getX(i),joints.getY(i),joints.getZ(i),joints.getW(i)],ws=[weights.getX(i),weights.getY(i),weights.getZ(i),weights.getW(i)];
      const headWeight=ws.reduce((s,w,j)=>s+(names[ids[j]].includes('head')?w:0),0);
      const hair=headWeight>.65&&p.getY(i)>hairMinY&&((green>r*1.045&&b>r*.98&&r<.52)||(p.getY(i)>headMinY+.085&&r<.55&&green>r*.85));
      const skin=(p.getY(i)>headMinY-.12||Math.abs(p.getX(i))>.22)&&r>green*1.10&&green>b*1.04&&r>.28;
      mask[i*3]=hair?1:0;mask[i*3+1]=skin?1:0;mask[i*3+2]=p.getY(i)>headMinY?1:0;
      counts[hair?'hair':skin?'skin':'other']++;
    }
    g.setAttribute('craftRegion',new THREE.BufferAttribute(mask,3));
    const m=new THREE.MeshToonMaterial({map:old.map,color:'#ffffff'});m.toneMapped=false;
    const previousCompile=old.onBeforeCompile.bind(old),previousKey=old.customProgramCacheKey();
    const colors=Object.fromEntries(Object.entries(palette).map(([key,hex])=>[key,new THREE.Color(hex)]));
    m.onBeforeCompile=s=>{
      previousCompile(s); // preserves projected eyes, lips and facial deformation
      Object.assign(s.uniforms,{craftHair:{value:colors.hair},craftSkin:{value:colors.skin},craftHairLight:{value:colors.hairLight}});
      s.vertexShader='attribute vec3 craftRegion; varying vec3 vCraftRegion;\n'+s.vertexShader;
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCraftRegion=craftRegion;');
      s.fragmentShader='varying vec3 vCraftRegion; uniform vec3 craftHair,craftSkin,craftHairLight;\n'+s.fragmentShader;
      const features=[...face.eyes,...face.brows,face.mouth].map((e,i)=>{
        const scale=i<2?1.8:i<4?1.9:2.1;
        return `(1.0-smoothstep(.8,1.2,length((vPerformerRest.xy-vec2(${e[0]},${e[1]}))/vec2(${e[2]*scale},${e[3]*scale}))))`;
      }).reduce((a,b)=>`max(${a},${b})`);
      const painted=mode==='painted'?`
        float hair=smoothstep(.25,.75,vCraftRegion.x);
        float skin=smoothstep(.25,.75,vCraftRegion.y);
        // Keep actual eye/brow/mouth pixels; flatten broad skin only. Skin
        // classification excludes dark line work and iris/white regions.
        float feature=${features};
        diffuseColor.rgb=mix(diffuseColor.rgb,craftSkin,skin*(1.0-feature)*.88);
        float band=smoothstep(${(headMinY+.12).toFixed(4)},${(headMinY+.145).toFixed(4)},vPerformerRest.y)*(1.0-smoothstep(${(headMinY+.16).toFixed(4)},${(headMinY+.185).toFixed(4)},vPerformerRest.y));
        vec3 hairColor=mix(craftHair,craftHairLight,band*.75);
        diffuseColor.rgb=mix(diffuseColor.rgb,hairColor,hair);
      `:'';
      s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`
        ${painted}
        vec3 worldN=inverseTransformDirection(normal,viewMatrix);
        float ndl=dot(worldN,normalize(vec3(-.35,.65,.7)));
        float level=mix(.70,1.0,smoothstep(.12,.20,ndl));
        // Avoid fine generated normals on head/hair by using the geometric
        // normal only; baked base-color variation remains visible in toon A/B.
        outgoingLight=diffuseColor.rgb*level;
        #include <opaque_fragment>`);
    };
    m.customProgramCacheKey=()=>`imported-cel-${mode}-${headMinY}-${previousKey}`;
    mesh.material=m;
  }
  return {mode,counts,geometry:'unchanged',body:'original UV colors with simplified light',hair:mode==='painted'?'authored base and highlight band':'original base color'};
}
