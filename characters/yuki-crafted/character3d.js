import * as THREE from 'three';
import {TessellateModifier} from 'three/addons/modifiers/TessellateModifier.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {HeadAssembly} from './head3d.js';
import {ArticulatedHand} from '../../lib/craft3d/hand.js';
import {LimbSurface,ringsGeometry,shoeGeometry,mesh,ellipsoid,mat,jointInk} from '../../lib/craft3d/surface.js';

export {LimbSurface,ringsGeometry,shoeGeometry,mesh,ellipsoid,mat,jointInk};

const C={ink:'#382d38',skin:'#ffe3d1',hair:'#644039',hairDark:'#4a3030',white:'#fff9ed',
  navy:'#35466f',navyDark:'#293452',red:'#d95863',shoe:'#684c45',sole:'#352f39'};
const V=p=>new THREE.Vector3(p.x,p.y,p.z??0);

function shapeGeometry(d,depth=.008){
  const s=new THREE.Shape();d(s);
  const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.0025,
    bevelSize:.0025,bevelSegments:2,steps:1,curveSegments:12});
  g.computeVertexNormals();return g;
}
function panel(parent,draw,color,z){const m=mesh(parent,shapeGeometry(draw),color);m.position.z=z;return m;}
const shirtProfile=[[.797,.158,.10],[.85,.15,.106],[.98,.158,.113],[1.07,.178,.10],[1.10,.071,.061]];
function collarPanel(parent,draw,front=true){
  const raw=shapeGeometry(draw),g=new TessellateModifier(.015,6).modify(raw);raw.dispose();
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i);let rx=.071,rz=.061;
    for(let k=1;k<shirtProfile.length;k++)if(y<=shirtProfile[k][0]){
      const a=shirtProfile[k-1],b=shirtProfile[k],u=THREE.MathUtils.clamp((y-a[0])/(b[0]-a[0]),0,1);
      rx=THREE.MathUtils.lerp(a[1],b[1],u);rz=THREE.MathUtils.lerp(a[2],b[2],u);break;
    }
    p.setZ(i,(front?1:-1)*(rz*Math.sqrt(Math.max(0,1-(x/rx)**2))+.009+p.getZ(i)));
  }
  if(!front){
    for(let i=0;i<p.count;i+=3){
      const v=new THREE.Vector3().fromBufferAttribute(p,i);
      p.setXYZ(i,p.getX(i+2),p.getY(i+2),p.getZ(i+2));p.setXYZ(i+2,v.x,v.y,v.z);
    }
  }
  g.deleteAttribute('normal');g.deleteAttribute('uv');const joined=mergeVertices(g,1e-5);g.dispose();joined.computeVertexNormals();
  return mesh(parent,joined,C.navy);
}

export class YukiCraft3D {
  constructor(){
    this.mesh=new THREE.Group();this.mesh.name='YukiCraft3D-shared';
    this.body=new THREE.Group();this.mesh.add(this.body);
    this.limbs={};this.socks={};this.sleeves={};this.hands={};this.feet={};
    for(const [side,sign] of [['left',-1],['right',1]]){
      this.limbs[side+'Leg']=new LimbSurface(this.mesh,C.skin,[[0,.067],[.25,.058],[.51,.039],[.67,.046],[.82,.037],[1,.027]],{depth:.92});
      this.socks[side]=new LimbSurface(this.mesh,C.white,[[0,.04],[.77,.041],[1,.03]],{start:.77});
      this.limbs[side+'Arm']=new LimbSurface(this.mesh,C.skin,[[0,.046],[.23,.044],[.51,.031],[.68,.035],[1,.022]],{depth:.85});
      this.sleeves[side]=new LimbSurface(this.mesh,C.white,[[0,.064],[.12,.064],[.28,.052],[1,.04]],{end:.28});
      const hand=new ArticulatedHand(sign,mat(C.skin),jointInk);this.mesh.add(hand);this.hands[side]=hand;
      const shoe=new THREE.Group();this.mesh.add(shoe);this.feet[side]=shoe;
      mesh(shoe,shoeGeometry(),C.shoe);
      const sole=mesh(shoe,shoeGeometry(),C.sole);sole.scale.y=.13;sole.position.y=-.08447;
      const strap=ellipsoid(shoe,[0,.023,-.003],[.054,.009,.034],'#98796b',false);
      strap.rotation.x=-.23;
    }
    mesh(this.body,ringsGeometry(shirtProfile),C.white);
    mesh(this.body,ringsGeometry([[.543,.257,.174],[.565,.25,.172],[.70,.196,.137],[.802,.165,.111]],{pleats:.028}),C.navy);
    mesh(this.body,ringsGeometry([[.560,.254,.177],[.568,.252,.176]],{pleats:.028}),'#7382a2',false);
    collarPanel(this.body,s=>{s.moveTo(-.151,1.067);s.lineTo(-.055,1.095);s.lineTo(0,1.017);s.lineTo(.055,1.095);s.lineTo(.151,1.067);s.quadraticCurveTo(.09,.996,0,.966);s.quadraticCurveTo(-.10,1.003,-.151,1.067);});
    panel(this.body,s=>{s.moveTo(-.018,1.013);s.quadraticCurveTo(-.067,1.023,-.086,.980);s.lineTo(-.027,.951);s.lineTo(0,.987);s.lineTo(.027,.951);s.lineTo(.086,.980);s.quadraticCurveTo(.067,1.023,.018,1.013);s.closePath();},C.red,.132);
    panel(this.body,s=>{s.moveTo(-.015,.991);s.lineTo(-.035,.924);s.lineTo(0,.900);s.lineTo(.035,.924);s.lineTo(.015,.991);s.closePath();},C.red,.13);
    collarPanel(this.body,s=>{s.moveTo(-.151,1.068);s.lineTo(.151,1.068);s.lineTo(.136,1.003);s.lineTo(-.136,1.003);s.closePath();},false);
    this.headAssembly=new HeadAssembly({mesh,ellipsoid,C});this.body.add(this.headAssembly);
  }
  setPose(p){
    this.mesh.position.set(p.rootX??0,p.rootY??0,p.rootZ??0);this.mesh.rotation.y=p.yaw??0;
    this.body.position.y=p.bob??0;this.headAssembly.setPose(p);
    for(const [side,sign] of [['left',-1],['right',1]]){
      const arm=p[side+'Arm'],leg=p[side+'Leg'];
      this.limbs[side+'Arm'].update(arm);this.sleeves[side].update(arm);
      this.limbs[side+'Leg'].update(leg);this.socks[side].update(leg);
      const hand=this.hands[side],x=V(arm[2]).sub(V(arm[1])).normalize();
      const forward=new THREE.Vector3(0,0,1);
      const y=forward.clone().addScaledVector(x,-forward.dot(x)).normalize(),z=x.clone().cross(y).normalize();
      y.copy(z).cross(x).normalize();hand.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
      const point=side==='right'?(p.point??0):0;
      const roll=THREE.MathUtils.lerp(-sign*.35,-Math.PI/2,point);
      hand.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),roll));
      hand.setGesture({point,fist:p[side+'Fist']??0,open:p[side+'Open']??0});
      hand.position.copy(V(arm[2]));this.feet[side].position.copy(V(leg[2]));
      this.feet[side].quaternion.copy(p[side+'FootQuaternion']??new THREE.Quaternion());
    }
    this.mesh.updateMatrixWorld(true);
  }
}
