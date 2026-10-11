// craft3d/locomotion.js — 有限落脚步态引擎（纯数学，无 three 依赖）。
// 自 bio_armor_academy_s1e2/locomotion.js（R21 已验收）晋升：步态逻辑原样保留，
// 原写死的步态风格常量提为 createLocomotion() 参数，默认值即 S1E2 当前验收值。
// +Z 是前进方向，+X 是角色右侧。
//
// ⚠️ 换角色需重测比例、落脚与重心：腿长/髋高/步幅由调用方以
// half（半髋宽）/footY（脚踝静置高度）/stride（同脚连续落点间距）逐次传入；
// 抬脚高度、摆臂幅度等风格量见 createLocomotion() 参数。直接套用默认值到
// 不同比例的角色会破坏接触感。
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>a+(b-a)*t;
export const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const local=(wx,wz,rootX,rootZ,yaw)=>{
  const x=wx-rootX,z=wz-rootZ,c=Math.cos(yaw),s=Math.sin(yaw);
  return {x:c*x-s*z,z:s*x+c*z};
};

// 参数默认值 = S1E2 已验收步态：
//   lift          步行摆动脚抬升峰值（米）
//   pitch         摆动脚俯仰摆动幅度（弧度；P19 起仅作兜底——见足踝滚动）
//   heelStrike    触地背屈峰值（弧度，足尖抬起脚跟着地；.26≈15°）
//   toeOff        蹬离跖屈峰值（弧度，脚跟抬起前掌最后离地；.20≈11°）
//   turnLift      转身换脚抬升峰值（米）
//   sway          髋部横向摆动幅度（米）
//   hipDelta      髋部竖直起伏幅度（米；转身时为负，重心下沉）
//   armSwingGain  步幅 → 手腕前后摆的增益
//   armSwingMax   摆臂限幅（米）
//   turnStepAngle 转身时单步最大角增量（弧度），决定换脚次数
export function createLocomotion({lift=.060,pitch=.16,turnLift=.038,sway=.016,
  hipDelta=.008,armSwingGain=.24,armSwingMax=.11,turnStepAngle=.9,
  heelStrike=.26,toeOff=.22}={}){

  function walkingFeet(walk,rootX,rootZ,yaw,half,footY,stride){
    const {from,to}=walk,dx=to[0]-from[0],dz=to[1]-from[1],D=Math.hypot(dx,dz);
    const heading=walk.facingYaw??Math.atan2(dx,dz),rightX=Math.cos(heading),rightZ=-Math.sin(heading);
    const distance=clamp(((rootX-from[0])*dx+(rootZ-from[1])*dz)/(D*D))*D;
    // stride is the distance between consecutive landings of the SAME foot.
    const count=Math.max(1,Math.ceil(D/(stride*.5))),h=D/count;
    const j=Math.min(count,Math.floor(distance/h+.5));
    const lo=j===0?0:(j-.5)*h,hi=j===count?D:(j+.5)*h;
    const phase=clamp((distance-lo)/(hi-lo)),q=ease((phase-.08)/.84);
    const moving=j%2===0?'left':'right',result={};
    for(const [side,sign] of [['left',-1],['right',1]]){
      const swing=side===moving,old=Math.max(0,(j-1)*h),next=Math.min(D,(j+1)*h);
      const pd=swing?mix(old,next,q):Math.min(D,j*h);
      // A startled backstep widens only as each foot actually changes landing.
      const footHalf=mix(walk.startHalf??half,half,clamp(pd/D));
      const wx=from[0]+dx/D*pd+rightX*sign*footHalf,wz=from[1]+dz/D*pd+rightZ*sign*footHalf;
      // 足踝滚动（P19：整掌平拍翻车实录）：支撑期=脚跟着地背屈→0.33s 段内放平→
      // 蹬离跖屈；摆动期=离地后微垂→勾脚备着地。支撑进度按根位移段内推进（距离驱动，
      // 与速度剖面解耦）。足尖朝上=负 pitch（rotation.x 正值=趾向下）
      const sSt=clamp((distance-j*h)/(.5*h));
      const stancePitch=sSt<.25?mix(-heelStrike,0,ease(sSt/.25)):sSt<.55?0:mix(0,toeOff,ease((sSt-.55)/.45));
      const swingPitch=mix(toeOff*.9,-heelStrike*.92,ease(clamp((q-.1)/.75)));
      const liftY=swing?lift*Math.sin(Math.PI*q):0,pitchA=swing?swingPitch:stancePitch;
      // 俯仰绕踝旋转的触地补偿：背屈时以跟为支点抬踝（跟不穿地）、跖屈时以前掌为支点
      const pitchLiftY=Math.sin(Math.abs(pitchA))*(pitchA<0?.08:.17); // 支点在接触端：背屈=跟（杠杆 .08）、跖屈蹬离=前掌（杠杆 .17=踝到趾尖水平距）
      result[side]={...local(wx,wz,rootX,rootZ,yaw),y:footY+liftY+pitchLiftY,pitch:pitchA,
        yaw:angleDelta(yaw,heading),stance:!swing||q===0||q===1,
        contact:`${side}:${swing?(q===1?next:old):pd}`};
    }
    const movingSign=moving==='left'?-1:1,envelope=Math.sin(Math.PI*phase)**2;
    return {...result,g:(j+phase)/2,phase,step:j,steps:count+1,heading,
      sway:-movingSign*sway*envelope,hipDelta:hipDelta*envelope,
      armSwing:Math.max(-armSwingMax,Math.min(armSwingMax,(result.left.z-result.right.z)*armSwingGain))};
  }

  function turningFeet(turn,rootX,rootZ,yaw,half,footY){
    const delta=angleDelta(turn.fromYaw,turn.toYaw),count=Math.max(1,Math.ceil(Math.abs(delta)/turnStepAngle));
    const progress=clamp(turn.a)*(count+1),j=Math.min(count,Math.floor(progress));
    const phase=progress>=count+1?1:progress-j,q=ease((phase-.06)/.88);
    const moving=j%2===0?'left':'right',result={};
    for(const [side,sign] of [['left',-1],['right',1]]){
      const swing=side===moving,old=Math.max(0,j-1)/count,next=Math.min(count,j+1)/count;
      const a0=turn.fromYaw+delta*(swing?old:Math.min(count,j)/count);
      const a1=turn.fromYaw+delta*(swing?next:Math.min(count,j)/count);
      const wx=rootX+sign*half*mix(Math.cos(a0),Math.cos(a1),q);
      const wz=rootZ-sign*half*mix(Math.sin(a0),Math.sin(a1),q);
      const heading=mix(a0,a1,q);
      result[side]={...local(wx,wz,rootX,rootZ,yaw),y:footY+(swing?turnLift*Math.sin(Math.PI*q):0),
        pitch:0,yaw:angleDelta(yaw,heading),stance:!swing||q===0||q===1,
        contact:`turn:${side}:${swing?(q===1?next:old):Math.min(count,j)/count}`};
    }
    return {...result,g:0,phase,step:j,steps:count+1,hipDelta:-hipDelta*Math.sin(Math.PI*phase)**2,sway:0,armSwing:0};
  }

  return {walkingFeet,turningFeet};
}

// 默认实例：签名与 S1E2 原函数完全一致，消费方改 import 路径即可。
const defaultGait=createLocomotion();
export const walkingFeet=defaultGait.walkingFeet;
export const turningFeet=defaultGait.turningFeet;
