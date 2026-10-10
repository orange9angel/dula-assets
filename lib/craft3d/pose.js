// craft3d/pose.js — 两骨 IK 求解器（纯数学，无 three 依赖）。
// twoBone 自 dula-story craft_trial/pose3d.js 原样晋升（已验收实现）。
// +Z 是角色前进方向；极点（pole）定义在角色空间，永远不在相机屏幕平面内。
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const v=(x,y,z=0)=>({x,y,z});
const add=(a,b)=>v(a.x+b.x,a.y+b.y,a.z+b.z);
const sub=(a,b)=>v(a.x-b.x,a.y-b.y,a.z-b.z);
const mul=(a,s)=>v(a.x*s,a.y*s,a.z*s);
const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
const length=a=>Math.hypot(a.x,a.y,a.z);
const unit=a=>mul(a,1/(length(a)||1));

// start/end 为肩(髋)与腕(踝)，pole 控制弯曲朝向，a/b 为两节骨长。
// 返回肘(膝)关节位置。骨长永不拉伸：端点不可达时抛错而非静默拉长。
export function twoBone(start,end,pole,a,b){
  const delta=sub(end,start),raw=length(delta);
  if(raw>a+b+1e-7)throw new Error(`Unreachable limb: ${raw} > ${a+b}`);
  const axis=unit(delta),d=clamp(raw,Math.abs(a-b)+1e-6,a+b-1e-6);
  const along=(a*a-b*b+d*d)/(2*d);
  const bend=unit(sub(pole,mul(axis,dot(pole,axis))));
  return add(add(start,mul(axis,along)),mul(bend,Math.sqrt(Math.max(0,a*a-along*along))));
}
