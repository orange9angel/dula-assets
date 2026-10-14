import * as THREE from 'three';

/** Paint an animatable face in neutral metre coordinates. The approved artwork
 * supplies iris paint; lids, brows and lips remain separate controllable paths. */
export function paintDrawnFace(ctx,config,state,irisArt){
  const {eyes,brows,mouth,centerX=0,skin='#ffdfbc',iris='#aa762e'}=config;
  const ink=config.ink??'#37292b',female=config.lashes!==false;
  const stroke=(color,width,fn)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();fn(ctx);ctx.stroke();};
  const fill=(color,fn)=>{ctx.fillStyle=color;ctx.beginPath();fn(ctx);ctx.fill();};
  // Light cheek warmth is painted independently of the eyes and stays fixed
  // under gaze changes. No hard cheek polygons or full-face baked lighting.
  for(const side of [-1,1]){
    const cx=centerX+side*.068,cy=eyes[0][1]-.029;
    ctx.save();ctx.translate(cx,cy);ctx.scale(1,.53);
    const blush=ctx.createRadialGradient(0,0,.002,0,0,.036);
    blush.addColorStop(0,'rgba(239,132,114,.11)');blush.addColorStop(.5,'rgba(242,150,127,.055)');blush.addColorStop(1,'rgba(242,150,127,0)');
    ctx.fillStyle=blush;ctx.fillRect(-.037,-.037,.074,.074);ctx.restore();
  }
  for(let i=0;i<eyes.length;i++){
    const [ex,ey,rx,ry]=eyes[i],side=i===0?-1:1;
    // Work from inner to outer corner, mirrored only at the final transform.
    ctx.save();ctx.translate(ex,ey);ctx.scale(side,1);
    const blink=state.blink,upper=ry*(1-.29*state.focus+.10*state.fear),lower=-ry*.48;
    const outerY=ry*.11,innerY=-ry*.16;
    const openTop=upper*.92,closedTop=-ry*.38;
    const top=THREE.MathUtils.lerp(openTop,closedTop,blink);
    // The nose-side end has height and a rounded return, not a second point.
    // Keep the iris fixed while the upper lid sweeps down during a blink.
    const innerTop=THREE.MathUtils.lerp(upper*.38,innerY,blink);
    const lid=p=>{p.moveTo(-rx*.90,innerTop);p.bezierCurveTo(-rx*.55,top*1.12,rx*.22,top*1.20,rx*.69,top*.65);p.quadraticCurveTo(rx*.88,top*.39,rx,outerY);};
    const bottom=p=>{
      p.bezierCurveTo(rx*.64,lower*1.13,-rx*.41,lower*1.08,-rx*.81,lower*.68);
      p.bezierCurveTo(-rx*1.02,lower*.42,-rx*1.01,innerTop*.66,-rx*.90,innerTop);
    };
    const opening=new Path2D();lid(opening);bottom(opening);opening.closePath();
    if(blink<.96){
      ctx.save();ctx.clip(opening);ctx.fillStyle='#fffcf4';ctx.fillRect(-rx*1.2,-ry*1.3,rx*2.4,ry*3);
      const ix=state.gaze[0]*side*rx*.25,iy=state.gaze[1]*ry*.17+ry*.055;
      const irx=rx*(female?.52:.48),iry=ry*.87;
      ctx.save();ctx.beginPath();ctx.ellipse(ix,iy,irx,iry,0,0,Math.PI*2);ctx.clip();
      if(irisArt&&config.irisCrop){
        const [sx,sy,sw,sh]=config.irisCrop;
        // Runtime sampling of the approved painted iris; no image generation
        // occurs per frame. Reverse the canvas Y axis for raster drawing.
        ctx.save();ctx.translate(ix,iy);ctx.scale(side,-1);
        ctx.drawImage(irisArt,sx,sy,sw,sh,-irx,-iry,2*irx,2*iry);ctx.restore();
      }else{
        const grad=ctx.createLinearGradient(0,iy+iry,0,iy-iry);
        grad.addColorStop(0,config.irisTop??'#302737');grad.addColorStop(.43,iris);grad.addColorStop(1,config.irisLight??'#f4c56b');
        ctx.fillStyle=grad;ctx.fillRect(ix-irx,iy-iry,irx*2,iry*2);
        fill('#2e2430',p=>p.ellipse(ix,iy+ry*.12,irx*.39,iry*.61,0,0,Math.PI*2));
        fill('#fffced',p=>p.ellipse(ix-rx*.19*side,iy+ry*.51,rx*.12,ry*.15,0,0,Math.PI*2));
      }
      ctx.restore();
      stroke('#493326',.00075,p=>p.ellipse(ix,iy,irx,iry,0,0,Math.PI*2));
      // A thin eyelid cast shadow ties the iris to the upper lid.
      ctx.fillStyle='rgba(79,53,70,.13)';ctx.beginPath();lid(ctx);ctx.lineTo(rx,outerY-.003);
      ctx.bezierCurveTo(rx*.1,top-.006,-rx*.5,top-.005,-rx*.90,innerTop);ctx.fill();
      ctx.restore();
      // Lower lid is discontinuous and much lighter than the upper lash.
      stroke('#ae8070',.00055,p=>{p.moveTo(-rx*.81,lower*.68);p.quadraticCurveTo(-rx*.58,lower*1.04,-rx*.22,lower*.99);});
      stroke('#6e4b46',.00085,p=>{p.moveTo(rx*.20,lower*.97);p.quadraticCurveTo(rx*.74,lower*.90,rx*.96,outerY-.002);});
      stroke('#dba18c',.00065,p=>{p.moveTo(-rx*.73,upper*.57+.004);p.bezierCurveTo(-rx*.25,upper*1.08+.004,rx*.36,upper*1.01+.004,rx*.68,upper*.67+.004);});
    }
    stroke(ink,female?.00135:.0011,lid);
    // Filled taper rather than an equal-width marker stroke.
    fill(ink,p=>{lid(p);
      p.lineTo(rx+((female?.0045:.0015)*(1-blink)+.0005),outerY+(female?.003:.0012));
      p.quadraticCurveTo(rx*.86,top*.40+.0018,rx*.69,top*.65+.0023);
      p.bezierCurveTo(rx*.22,top*1.20+.0024,-rx*.55,top*1.12+.0007,-rx*.90,innerTop);});
    if(female){
      for(const [x,y,dx,dy] of [[.82,.48,.13,.20],[.64,.70,.09,.22]]){
        fill(ink,p=>{p.moveTo(rx*x,top*y);p.quadraticCurveTo(rx*(x+dx),top*y+.002,rx*(x+dx+.06),top*y+.006*(1-blink));p.quadraticCurveTo(rx*(x+.04),top*y+.001,rx*(x-.05),top*y-.001);});
      }
    }
    ctx.restore();
    const [bx,by,bw]=brows[i],tilt=.0055*state.focus-.0065*state.fear,thick=config.browWidth??.0025;
    fill(config.browColor??ink,p=>{p.moveTo(bx-side*bw,by-tilt+state.fear*.002);
      p.bezierCurveTo(bx-side*bw*.5,by+.005,bx+side*bw*.2,by+.006,bx+side*bw,by+tilt*.3);
      p.bezierCurveTo(bx+side*bw*.2,by+.005+thick,bx-side*bw*.5,by+.004+thick,bx-side*bw,by-tilt+thick+state.fear*.002);});
  }
  // Nose and lips use small, unequal marks with open space between them.
  const ny=config.noseY;
  fill('#f5bf9e',p=>{p.moveTo(centerX+.003,ny+.007);p.quadraticCurveTo(centerX+.005,ny+.001,centerX+.001,ny-.002);p.lineTo(centerX-.002,ny+.001);});
  stroke('#ae7663',.0008,p=>{p.moveTo(centerX+.001,ny-.001);p.quadraticCurveTo(centerX+.002,ny-.003,centerX,ny-.004);});
  fill('rgba(255,242,220,.60)',p=>{p.moveTo(centerX-.003,ny+.006);p.lineTo(centerX-.001,ny+.004);p.lineTo(centerX-.002,ny+.002);p.quadraticCurveTo(centerX-.004,ny+.003,centerX-.003,ny+.006);});
  const [mx,my,mw]=mouth,w=mw*THREE.MathUtils.clamp(state.width,.75,1.25),bend=state.smile*.004-state.fear*.0025;
  if(state.jaw>.055){
    const h=.001+state.jaw*.010;
    fill('#71404a',p=>{p.moveTo(mx-w,my+bend);p.bezierCurveTo(mx-w*.4,my+h,mx+w*.20,my+h*.9,mx+w,my+bend+.0004);p.bezierCurveTo(mx+w*.54,my-h,mx-w*.48,my-h,mx-w,my+bend);});
    if(state.jaw>.33)fill('#e99b9a',p=>{p.moveTo(mx-w*.65,my-h*.5);p.quadraticCurveTo(mx,my-h*.08,mx+w*.59,my-h*.44);p.quadraticCurveTo(mx,my-h*.95,mx-w*.65,my-h*.5);});
    if(state.smile>.35)fill('#fff7e7',p=>{p.moveTo(mx-w*.68,my+h*.55);p.quadraticCurveTo(mx,my+h*.87,mx+w*.64,my+h*.47);p.lineTo(mx+w*.53,my+h*.15);p.quadraticCurveTo(mx,my+h*.43,mx-w*.57,my+h*.18);});
  }else{
    stroke('#885958',.00085,p=>{p.moveTo(mx-w,my+bend);p.bezierCurveTo(mx-w*.42,my+.0007-bend,mx+w*.27,my-bend,mx+w*.73,my+bend+.0006);});
    stroke('#513737',.00115,p=>{p.moveTo(mx-w,my+bend);p.lineTo(mx-w*.84,my+bend-.0002);});
  }
  stroke('#edb198',.0007,p=>{p.moveTo(mx-w*.28,my-.005-state.jaw*.006);p.quadraticCurveTo(mx,my-.006-state.jaw*.006,mx+w*.29,my-.0048-state.jaw*.006);});
}
