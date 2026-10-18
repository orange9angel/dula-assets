// 《星屑战壳》必杀技资产库（R11 晋升）：八技定义 + 技名卡（canvas overlay）+ VFX 构建器。
// 纪律：技名全部原创（厨具×星屑风）；VFX=AdditiveBlending 光效 + LCG 确定性种子 +
// 纯 (t,t0,anchor) 驱动（seek 安全）；白闪 ≤.12s；特效不糊接触帧本身（接触读感优先）。
// 喊招压拍：蓄力期起喊、末字压接触帧（喊招 TTS 实测时长回推起点）。
import * as THREE from 'three';

export const MOVES={
  star_lotus:{id:'star_lotus',name:'圆盾·星莲华',by:'aoao',color:'#3dffc8',
    sfx:'星屑光轮绽开旋转，金属莲瓣依次展开的清亮颤音',cameraNote:'盾面特写'},
  pot_shock:{id:'pot_shock',name:'震堂·锅鸣一击',by:'aoao',color:'#ffd98a',
    sfx:'锅鸣冲击波，圆润“当——”带环形扩散震感',cameraNote:'接触点中景'},
  meteor_rain:{id:'meteor_rain',name:'千孔·银星雨',by:'xiaozao',color:'#8fd8ff',
    sfx:'流星弹雨连发，密集银点破空',cameraNote:'护腕盘侧跟拍'},
  star_net:{id:'star_net',name:'天罗·星屑网',by:'xiaozao',color:'#a8e8ff',
    sfx:'光点织网，细密能量丝线收束的嗡嗡声',cameraNote:'俯角全场'},
  crater_slam:{id:'crater_slam',name:'陨星·釜底落',by:'dafu',color:'#ffb35e',
    sfx:'陨星坠地爆发，沉重落地+碎石迸溅+低频冲击',cameraNote:'低机位落点'},
  steam_pillar:{id:'steam_pillar',name:'沸泉·冲天柱',by:'dafu',color:'#ffc890',
    sfx:'蒸汽星屑柱冲天，沸水喷涌+气流轰鸣',cameraNote:'仰角冲柱'},
  chopstick_barrage:{id:'chopstick_barrage',name:'流星·双箸乱穿',by:'azu',color:'#ff4a58',
    sfx:'双筷连续刺击残影，密集清脆的筷刃破空连响',cameraNote:'刃尖前侧追'},
  star_pierce:{id:'star_pierce',name:'合箸·夹星断',by:'azu',color:'#e02a3c',
    sfx:'双筷合拢夹断，能量收束后“咔”的脆响+星屑崩散',cameraNote:'夹点特写'},
  // ── 敌区（蚀星庭灭焰者绝招；与主角区同库同工艺）──
  night_reap:{id:'night_reap',name:'刈夜·无声镰弧',by:'yekari',color:'#b47cff',
    sfx:'锁镰挥出无声弧光，切开夜风的低音裂帛+镰刃高频细鸣',cameraNote:'弧光中段侧拍'},
};

const lcg=seed=>()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const addMat=(color,op=1)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity:op,
  blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
const spMat=(tex,color,op=1)=>new THREE.SpriteMaterial({map:tex,transparent:true,opacity:op,
  blending:THREE.AdditiveBlending,depthWrite:false});
export function moveGlowTex(){ // 通用径向光点
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,2,32,32,32);
  gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,'#ffffff');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

// ── VFX 构建器：返回 {group, update(t,t0,anchor)} —— anchor=THREE.Vector3 活锚点（每帧传入）──
const BUILDERS={
  // 圆盾·星莲华：盾面光轮展开，莲瓣依次绽开旋转
  star_lotus(color='#3dffc8'){
    const g=new THREE.Group(),petals=[];
    for(let i=0;i<8;i++){
      const p=new THREE.Mesh(new THREE.PlaneGeometry(.10,.34),addMat(color));
      const a=i/8*Math.PI*2;p.userData={a};g.add(p);petals.push(p);
    }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.012,6,40),addMat('#eafff4'));
    g.add(ring);
    return {group:g,update(t,t0,anchor){
      const u=(t-t0)/.7;
      g.visible=u>0&&u<1.6;
      if(!g.visible)return;
      g.position.copy(anchor);
      const k=Math.min(1,Math.max(0,u)),pop=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      const r=.34*pop;
      g.rotation.z=t*2.2; // 绽开后持续缓旋
      ring.scale.setScalar(pop);ring.material.opacity=.9*Math.max(0,1-u/1.6);
      for(const p of petals){
        const a=p.userData.a;
        p.position.set(Math.cos(a)*r,Math.sin(a)*r,0);
        p.rotation.z=a+Math.PI/2;
        p.material.opacity=.85*Math.max(0,1-u/1.6);
        p.scale.setScalar(pop);
      }
    }};
  },
  // 震堂·锅鸣一击：环形冲击波三连扩散
  pot_shock(color='#ffd98a'){
    const g=new THREE.Group(),rings=[];
    for(let i=0;i<3;i++){
      const r=new THREE.Mesh(new THREE.TorusGeometry(.4,.03,8,40),addMat(i?color:'#fff2cc'));
      g.add(r);rings.push(r);
    }
    return {group:g,update(t,t0,anchor){
      const u=(t-t0)/.8;
      g.visible=u>0&&u<1.3;
      if(!g.visible)return;
      g.position.copy(anchor);
      for(const [i,r] of rings.entries()){
        const k=Math.max(0,Math.min(1,u-i*.18));
        r.scale.setScalar(.2+k*2.6); // torus 默认 XY 平面朝 +z 主镜头（OP/S1E1 接触帧机位均在 ±z 侧）
        r.material.opacity=.9*(1-k);
      }
    }};
  },
  // 千孔·银星雨：锚点向前方扇形流星弹雨
  meteor_rain(color='#8fd8ff'){
    const tex=moveGlowTex(),g=new THREE.Group(),ps=[];
    const rr=lcg(101);
    for(let i=0;i<18;i++){
      const s=new THREE.Sprite(spMat(tex,color));
      s.userData={a:(rr()-.5)*.7,el:(rr()-.3)*.5,sp:2.5+rr()*3,dl:rr()*.25};
      g.add(s);ps.push(s);
    }
    return {group:g,update(t,t0,anchor,fwd){
      g.visible=false;
      for(const s of ps){
        const u=(t-t0-s.userData.dl)/.55;
        if(u<0||u>1){s.visible=false;continue;}
        g.visible=true;s.visible=true;const d=s.userData;
        const dx=Math.sin(d.a)*Math.cos(d.el),dy=Math.sin(d.el),dz=Math.cos(d.a)*Math.cos(d.el);
        s.position.set(anchor.x+dx*d.sp*u,anchor.y+dy*d.sp*u-1.2*u*u,anchor.z+dz*d.sp*u);
        s.material.opacity=.9*(1-u);s.scale.setScalar(.06+.05*(1-u));
      }
    }};
  },
  // 天罗·星屑网：锚点周围光点织网扩散
  star_net(color='#a8e8ff'){
    const tex=moveGlowTex(),g=new THREE.Group(),ps=[];
    const rr=lcg(113);
    for(let i=0;i<24;i++){
      const s=new THREE.Sprite(spMat(tex,color));
      const a=rr()*Math.PI*2,el=rr()*1.4-.6;
      s.userData={dx:Math.cos(a)*Math.cos(el),dy:Math.sin(el),dz:Math.sin(a)*Math.cos(el),r:.5+rr()*.9};
      g.add(s);ps.push(s);
    }
    return {group:g,update(t,t0,anchor){
      const u=(t-t0)/.9;g.visible=u>0&&u<1.8;
      if(!g.visible)return;
      for(const s of ps){const d=s.userData,k=Math.min(1,u);
        s.position.set(anchor.x+d.dx*d.r*k,anchor.y+d.dy*d.r*k,anchor.z+d.dz*d.r*k);
        s.material.opacity=.8*Math.max(0,1-u/1.8);s.scale.setScalar(.05+.04*k);}
    }};
  },
  // 陨星·釜底落：落点大环爆发+碎石迸起
  crater_slam(color='#ffb35e'){
    const tex=moveGlowTex(),g=new THREE.Group(),ps=[];
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.07,8,40),addMat('#c9b89a'));
    ring.rotation.x=-Math.PI/2;g.add(ring);
    const flash=new THREE.Sprite(spMat(tex,'#fff2cc'));g.add(flash);
    const rr=lcg(127);
    for(let i=0;i<12;i++){
      const s=new THREE.Mesh(new THREE.TetrahedronGeometry(.05+((i*13)%5)*.012),
        new THREE.MeshToonMaterial({color:'#4a505e'}));
      const a=i/12*Math.PI*2+.4,sp=1+((i*29)%10)/10*1.4;
      s.userData={dx:Math.cos(a)*sp,dz:Math.sin(a)*sp,v0:2.2+((i*17)%10)/10*1.6,ph:i};
      g.add(s);ps.push(s);
    }
    return {group:g,update(t,t0,anchor){
      const u=(t-t0)/.9;g.visible=u>0&&u<1;
      if(!g.visible)return;
      g.position.set(anchor.x,0,anchor.z);
      ring.position.y=.03;
      ring.scale.setScalar(.2+u*2.8);ring.material.opacity=.9*(1-u);
      flash.position.set(0,.5,0);flash.scale.setScalar(.6+2.4*u);
      flash.material.opacity=Math.max(0,.8*(1-u*1.4));
      for(const s of ps){const d=s.userData;
        s.position.set(d.dx*u,.06+Math.max(0,d.v0*u-4.9*u*u),d.dz*u);
        s.rotation.set(u*7+d.ph,u*5,d.ph);s.visible=true;}
    }};
  },
  // 沸泉·冲天柱：锚点向上蒸汽星屑柱（螺旋上升光点+柱形光晕）
  steam_pillar(color='#ffc890'){
    const tex=moveGlowTex(),g=new THREE.Group(),ps=[];
    const col=new THREE.Mesh(new THREE.CylinderGeometry(.16,.30,2.2,12,1,true),
      new THREE.MeshBasicMaterial({color,transparent:true,opacity:.22,
        blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    col.position.y=1.1;g.add(col);
    const rr=lcg(139);
    for(let i=0;i<16;i++){
      const s=new THREE.Sprite(spMat(tex,i%3?'#ffe8c8':color));
      s.userData={a:rr()*Math.PI*2,r:.12+rr()*.18,ph:rr(),sp:.9+rr()*.7};
      g.add(s);ps.push(s);
    }
    return {group:g,update(t,t0,anchor){
      const u=(t-t0)/.8;g.visible=u>0&&u<1.5;
      if(!g.visible)return;
      g.position.set(anchor.x,0,anchor.z);
      const k=Math.min(1,u*1.4),fade=Math.max(0,1-Math.max(0,u-1)/.5);
      col.scale.set(k,Math.max(.05,k),k);
      col.material.opacity=.22*fade;
      for(const s of ps){const d=s.userData,v=((t-t0)*d.sp+d.ph)%1;
        s.position.set(Math.cos(d.a+t*3)*d.r*(1+v),v*2.2*k,Math.sin(d.a+t*3)*d.r*(1+v));
        s.material.opacity=.8*(1-v)*fade;s.scale.setScalar(.05+.06*(1-v));}
    }};
  },
  // 流星·双箸乱穿：双刃方向密集残影刺线（细长加色薄板扇形连闪）
  chopstick_barrage(color='#ff4a58'){
    const g=new THREE.Group(),ls=[];
    const rr=lcg(149);
    for(let i=0;i<14;i++){
      const l=new THREE.Mesh(new THREE.PlaneGeometry(.03,.9),addMat(i%3?'#ffb0b8':color));
      l.userData={a:(rr()-.5)*.5,el:(rr()-.4)*.35,off:rr()*.5,sp:1};
      g.add(l);ls.push(l);
    }
    return {group:g,update(t,t0,anchor,fwd){
      g.visible=false;
      const dir=fwd??new THREE.Vector3(0,0,1);
      for(const l of ls){
        const d=l.userData,u=(t-t0-d.off)/.30;
        if(u<0||u>1){l.visible=false;continue;}
        g.visible=true;l.visible=true;
        // 残影刺线：沿刃方向掠过的细光条
        l.position.copy(anchor).addScaledVector(dir,u*.7-.2);
        l.position.y+=Math.sin(d.a)*0.12;l.position.x+=Math.sin(d.a)*.1;l.position.z+=Math.cos(d.el)*.05;
        l.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
        l.material.opacity=.85*(1-u);
      }
    }};
  },
  // 合箸·夹星断：双刃合拢夹点闪光+星屑崩散
  star_pierce(color='#e02a3c'){
    const tex=moveGlowTex(),g=new THREE.Group(),ps=[];
    const core=new THREE.Sprite(spMat(tex,'#ffffff'));g.add(core);
    const rr=lcg(157);
    for(let i=0;i<16;i++){
      const s=new THREE.Sprite(spMat(tex,i%2?color:'#ffd0d4'));
      const a=rr()*Math.PI*2,el=rr()*1.2-.4,sp=1.6+rr()*2.2;
      s.userData={vx:Math.cos(a)*Math.cos(el)*sp,vy:Math.sin(el)*sp,vz:Math.sin(a)*Math.cos(el)*sp};
      g.add(s);ps.push(s);
    }
    return {group:g,update(t,t0,anchor){
      const u=(t-t0)/.55;g.visible=u>0&&u<1;
      if(!g.visible)return;
      g.position.copy(anchor);
      core.scale.setScalar(.3+1.8*u);
      core.material.opacity=u<.15?u/.15:1-Math.max(0,(u-.15)/.85);
      const tt=u*.55;
      for(const s of ps){const d=s.userData;
        s.position.set(d.vx*tt,d.vy*tt-1.6*tt*tt,d.vz*tt);
        s.material.opacity=.9*(1-u);s.scale.setScalar(.05+.05*(1-u));}
    }};
  },
  // ── 敌区（蚀星庭灭焰者绝招 VFX；与主角区同库同工艺）──
  // 刈夜·无声镰弧：镰尖起点的月牙弧光横扫（前掠斩波+细屑尾迹；无声=低亮度薄刃不炸屏）
  night_reap(color='#b47cff'){
    const tex=moveGlowTex(),g=new THREE.Group(),ps=[];
    const arc=new THREE.Mesh(new THREE.TorusGeometry(.9,.05,8,24,Math.PI*.8),
      addMat(color,.9)); // 弧光薄刃
    arc.rotation.z=-.4;g.add(arc);
    const rr=lcg(139);
    for(let i=0;i<10;i++){ // 细屑尾迹
      const s=new THREE.Sprite(spMat(tex,color));
      const a=-.4+rr()*.8;
      s.userData={a,r:.5+rr()*.6,dl:rr()*.15};
      g.add(s);ps.push(s);
    }
    return {group:g,update(t,t0,anchor,fwd){
      const u=(t-t0)/.5;g.visible=u>0&&u<1;
      if(!g.visible)return;
      g.position.copy(anchor);
      if(fwd)g.rotation.y=Math.atan2(fwd.x,fwd.z)-.5;
      arc.rotation.z=-.4+u*1.9; // 横扫
      arc.scale.setScalar(.4+.8*u);arc.material.opacity=.85*(1-u*u);
      for(const s of ps){const d=s.userData,uu=Math.max(0,Math.min(1,(t-t0-d.dl)/.4));
        s.visible=uu>0&&uu<1;if(!s.visible)continue;
        s.position.set(Math.sin(d.a)*d.r*uu,1.1+.15*uu,Math.cos(d.a)*d.r*uu);
        s.material.opacity=.7*(1-uu);s.scale.setScalar(.04+.03*(1-uu));}
    }};
  },
};
// 必杀技 VFX 实例：组挂场景/特效组，update 纯 (t,t0,anchor[,fwd])。
export function buildMoveFX(id){
  const m=MOVES[id];
  return BUILDERS[id](m.color);
}
// ── 技名卡（canvas overlay 大字卡：刷痕底条+楷体大字+外发光；少年漫喊招招牌）──
// 纯 t 驱动；side 支持左右半屏（双人同屏喊招分屏闪）。
export function drawMoveCard(ctx,W,H,{name,color,t,t0,dur=.85,side='center',flash='#ffffff'}){
  const u=(t-t0)/dur;
  if(u<=0||u>=1)return;
  const pop=u<.14?Math.min(1,u/.14)*1.06+.06:1.06-.06*Math.min(1,(u-.14)/.2);
  const alpha=u>.8?1-(u-.8)/.2:1;
  ctx.save();
  const cx=side==='left'?W*.27:side==='right'?W*.73:W*.5, cy=side==='center'?H*.36:H*.30;
  ctx.translate(cx,cy);ctx.scale(pop,pop);ctx.globalAlpha=alpha;
  // 刷痕底条（斜切黑条+朱红描线）
  ctx.rotate(side==='center'?-.02:0);
  ctx.fillStyle='rgba(12,10,16,.82)';
  ctx.beginPath();
  ctx.moveTo(-W*.30,-46);ctx.lineTo(W*.30,-58);ctx.lineTo(W*.32,44);ctx.lineTo(-W*.28,56);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-W*.28,-40);ctx.lineTo(W*.28,-50);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-W*.26,40);ctx.lineTo(W*.30,30);ctx.stroke();
  // 大字
  ctx.font='bold 64px STKAITI,KaiTi,serif';ctx.textAlign='center';ctx.lineJoin='round';
  ctx.shadowColor=color;ctx.shadowBlur=22;
  ctx.strokeStyle='#0c0a12';ctx.lineWidth=9;
  ctx.strokeText(name,0,16);ctx.fillStyle=flash;ctx.fillText(name,0,16);
  ctx.restore();ctx.globalAlpha=1;
}
