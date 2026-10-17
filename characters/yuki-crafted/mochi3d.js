import * as THREE from 'three';
import {LimbSurface,ringsGeometry,mesh,ellipsoid,mat} from '../../lib/craft3d/surface.js';

const C={fur:'#d98a3c',furDark:'#cd7f33',cream:'#fdf3e0',pink:'#f2a3ab',dark:'#2a2020',rim:'#8a5a10'};
const basic=color=>new THREE.MeshBasicMaterial({color});
function raw(parent,geometry,material,{x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1}={}){
  const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);
  m.scale.set(sx,sy,sz);parent.add(m);return m;
}
function earGeometry(radius,height){
  return ringsGeometry([[-height/2,radius,radius],[-height*.1,radius*.78,radius*.78],[height*.32,radius*.3,radius*.3],[height/2,.001,.001]]);
}
function dorsalGeometry(levels,sides=44){
  const pos=[],idx=[];
  levels.forEach(([y,rx,rz],i)=>{
    for(let j=0;j<=sides;j++){
      const th=Math.PI-1.5+3.0*j/sides;
      pos.push(rx*1.008*Math.sin(th),y,rz*1.008*Math.cos(th));
      if(i<levels.length-1&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;idx.push(a,a+1,b,a+1,b+1,b);}
    }
  });
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setIndex(idx);g.computeVertexNormals();return g;
}
function irisTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const c=canvas.getContext('2d'),g=c.createRadialGradient(64,56,6,64,64,62);
  g.addColorStop(0,'#f0be4a');g.addColorStop(.55,'#d8a028');g.addColorStop(1,'#8a5a10');
  c.fillStyle=g;c.fillRect(0,0,128,128);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export class MochiCraft3D {
  constructor(){
    this.mesh=new THREE.Group();this.mesh.name='MochiCraft3D-shared';
    mesh(this.mesh,ringsGeometry([
      [.05,.28,.33],[.14,.335,.38],[.30,.335,.375],[.44,.295,.335],[.56,.235,.285],[.66,.14,.18],[.72,.07,.10],[.755,.001,.001]
    ]),C.fur);
    ellipsoid(this.mesh,[0,.27,.16],[.234,.195,.234],C.cream);
    raw(this.mesh,dorsalGeometry([[.08,.28,.33],[.20,.333,.377],[.30,.335,.375],[.44,.295,.335],[.56,.235,.285],[.63,.175,.225]]),mat(C.furDark));

    const headGroup=this.headGroup=new THREE.Group();
    headGroup.position.set(0,.60,.22);this.headBaseY=.60;this.mesh.add(headGroup);
    ellipsoid(headGroup,[0,0,0],[.231,.1995,.1995],C.fur);
    ellipsoid(headGroup,[0,-.055,.14],[.1265,.0825,.077],C.cream);
    for(const side of [-1,1]){
      mesh(headGroup,earGeometry(.065,.13),C.fur).position.set(side*.12,.19,.01);
      headGroup.children.at(-1).rotation.z=side*-.28;
      raw(headGroup,earGeometry(.035,.07),basic(C.pink),{x:side*.115,y:.175,z:.035,rz:side*-.28});
    }
    const iris=irisTexture();
    for(const side of [-1,1]){
      const eye=new THREE.Group();eye.position.set(side*.085,.035,.165);headGroup.add(eye);
      raw(eye,new THREE.SphereGeometry(.047,20,20),basic(C.rim),{z:.004,sz:.45});
      raw(eye,new THREE.CircleGeometry(.041,32),new THREE.MeshBasicMaterial({map:iris}),{z:.024});
      const pupil=raw(eye,new THREE.SphereGeometry(.016,12,12),basic(C.dark),{z:.030,sx:.6,sy:1.4,sz:.5});
      pupil.userData.baseX=0;pupil.userData.baseY=0;
      raw(eye,new THREE.SphereGeometry(.008,8,8),basic(0xfff8e0),{x:side*.012,y:.014,z:.032});
      raw(eye,new THREE.SphereGeometry(.004,8,8),basic(0xfff8e0),{x:-side*.011,y:-.012,z:.031});
      raw(eye,new THREE.TorusGeometry(.046,.0042,6,24,Math.PI*.72),basic(C.dark),{y:.010,z:.022,rz:Math.PI*.14});
      const lidGeo=new THREE.SphereGeometry(.05,20,20,0,Math.PI*2,0,Math.PI*.5);
      const lid=raw(eye,lidGeo,mat(C.fur),{sx:1.05,sy:.55,sz:.5});
      if(side===-1){this.leftEye=eye;this.leftPupil=pupil;this.leftEyelid=lid;}
      else{this.rightEye=eye;this.rightPupil=pupil;this.rightEyelid=lid;}
    }
    raw(headGroup,new THREE.ConeGeometry(.014,.012,8),basic(C.pink),{y:-.025,z:.235,rx:Math.PI/2});
    const mouth=this.mouth=new THREE.Group();mouth.position.set(0,-.055,.225);headGroup.add(mouth);
    this.mouthBaseY=mouth.position.y;
    for(const side of [-1,1]){
      const curve=new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(side*.03,.008,0),new THREE.Vector3(side*.012,-.012,.004),new THREE.Vector3(0,0,.005));
      raw(mouth,new THREE.TubeGeometry(curve,8,.004,6,false),basic(C.dark));
    }
    for(const side of [-1,1]){
      const brow=raw(headGroup,new THREE.CapsuleGeometry(.005,.03,4,6),mat(C.fur),{x:side*.085,y:.105,z:.17,rz:Math.PI/2+side*.1});
      if(side===-1)this.leftBrow=brow;else this.rightBrow=brow;
    }
    for(const side of [-1,1])for(let i=0;i<3;i++){
      const y=-.04+i*.022;
      const curve=new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(side*.10,y,.20),new THREE.Vector3(side*.19,y+.006,.195),
        new THREE.Vector3(side*.265,y-.014-(1-i)*.012,.175));
      raw(headGroup,new THREE.TubeGeometry(curve,10,.0012,5),basic(C.cream));
    }

    this.arms={};
    for(const [side,name] of [[-1,'leftArm'],[1,'rightArm']]){
      const group=new THREE.Group();group.position.set(side*.13,.30,.40);this.mesh.add(group);
      const paw=new LimbSurface(group,C.cream,[[0,.055],[.55,.055],[1,.048]],{depth:.9});
      paw.update([{x:0,y:0,z:0},{x:0,y:-.10,z:.005},{x:0,y:-.18,z:.01}]);
      ellipsoid(group,[0,-.188,.032],[.026,.010,.018],C.pink,false);
      for(const tx of [-0.022,0,.022])ellipsoid(group,[tx,-.172,.042],[.013,.012,.012],C.cream,false);
      group.userData.basePosition=group.position.clone();this[name]=group;this.arms[name]=group;
    }

    this.legSurfaces={};this.feet={};
    for(const [side,name] of [[-1,'leftLeg'],[1,'rightLeg']]){
      const group=new THREE.Group();group.position.set(side*.17,.20,-.08);this.mesh.add(group);
      const leg=new LimbSurface(group,C.furDark,[[0,.068],[.45,.058],[1,.052]],{depth:.95});
      leg.update([{x:0,y:0,z:0},{x:0,y:-.09,z:0},{x:0,y:-.17,z:.01}]);
      const foot=ellipsoid(group,[0,-.165,.05],[.085,.035,.115],C.furDark);
      ellipsoid(foot,[0,-.025,.065],[.043,.009,.052],C.pink,false);
      group.userData.basePosition=group.position.clone();
      this[name]=group;this.legSurfaces[name]=leg;this.feet[name]=foot;
    }

    const tail=this.tail=new THREE.Group();tail.position.set(0,.38,-.34);this.mesh.add(tail);
    const tailSurf=new LimbSurface(tail,C.fur,[[0,.05],[.6,.047],[1,.03]],{depth:1});
    tailSurf.update([{x:0,y:0,z:0},{x:0,y:.10,z:-.06},{x:0,y:.22,z:-.10}]);
    raw(tail,new THREE.TorusGeometry(.050,.006,8,24),mat(C.furDark),{y:.075,z:-.048,rx:-1.04});
    raw(tail,new THREE.TorusGeometry(.045,.006,8,24),mat(C.furDark),{y:.165,z:-.088,rx:-1.15});
    ellipsoid(tail,[0,.25,-.10],[.042,.042,.042],C.cream);
  }
}
