// craft3d/look.js — toon 材质与描边助手（赛璐璐外观统一件）。
// outlined() 自 bio_armor_academy_s1e2/character_look.js 原样晋升；
// coolShadowRamp() 为共享 4 阶冷阴影 toon ramp 工厂（每阶纯色块、阴影阶偏蓝紫、
// 受光阶偏暖，NearestFilter 双滤镜缺一不可）；
// skinMaterial() 是肤色平涂材质的通用化版本（按基色缓存；角色专属肤色板留在各 episode）。
import * as THREE from 'three';

// 法线外扩壳描边：壳网格 add 为原网格子节点，跟随动画与 visible 开关。
// width 按部件半径分级：躯干/头 .0014，四肢 .0010，手指/发束等细节件 .0006。
// 已知风险：壳沿法线外扩会描到凹面内部（鼻/颊交界假褶）——皮肤件谨慎上壳。
export function outlined(parent,geometry,material,width=.0014){
  const mesh=new THREE.Mesh(geometry,material);parent.add(mesh);mesh.castShadow=true;
  const ink=new THREE.MeshBasicMaterial({color:'#3a3039',side:THREE.BackSide});
  ink.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\ntransformed += normal * ${width.toFixed(5)};`);};
  ink.customProgramCacheKey=()=>`portrait-outline-${width}`;
  mesh.add(new THREE.Mesh(geometry,ink));return mesh;
}

// 共享 4 阶冷阴影 ramp：明度阶 0.38 / 0.6 / 0.82 / 1.0，阴影阶偏蓝紫、受光阶偏暖。
// 同一角色全部 MeshToonMaterial 共享同一 gradientMap，皮肤/头发/衣服一视同仁。
export function coolShadowRamp(){
  const colors=['#6b6b8a','#a39eb0','#e8e2da','#fffaf2'],data=new Uint8Array(colors.length*4);
  colors.forEach((hex,i)=>{
    data[i*4]=parseInt(hex.slice(1,3),16);
    data[i*4+1]=parseInt(hex.slice(3,5),16);
    data[i*4+2]=parseInt(hex.slice(5,7),16);
    data[i*4+3]=255;
  });
  const ramp=new THREE.DataTexture(data,colors.length,1,THREE.RGBAFormat);
  ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
  return ramp;
}

// 肤色平涂（Basic 兜底件：逆光/黄昏场景正面全黑时脸与小件用）。
// 颜色按角色手工预调暗（×0.85–0.92），否则平涂比 toon 件亮一档。
const skinMaterials=new Map();
export function skinMaterial(base){
  if(!skinMaterials.has(base))skinMaterials.set(base,new THREE.MeshBasicMaterial({color:base}));
  return skinMaterials.get(base);
}
