// Biology-club student: fitted short sleeves, trousers, short hair, no loose coat.
// Same craft3d pose interface as LeiXiaoCraft; authored for bounded standing acting.
import * as THREE from 'three';
import {LimbSurface,ringsGeometry,mesh,shoeGeometry,jointInk} from '../../lib/craft3d/surface.js';
import {ArticulatedHand} from '../../lib/craft3d/hand.js';
import {animatedHead} from './character_look.js';
import {skinMaterial,clothMaterial,finishSleeveRoot} from './character_finish.js';
const v=p=>new THREE.Vector3(p.x,p.y,p.z??0);
export class QianTangKuiCraft {
  constructor(){
    this.mesh=new THREE.Group();this.mesh.name='QianTangKuiCraft';
    this.body=new THREE.Group();this.mesh.add(this.body);
    this.limbs={};this.sleeves={};this.hands={};this.feet={};
    const skin=skinMaterial('aoi'),shirt=clothMaterial('#648b82'),pants=clothMaterial('#424653');
    this.torso=mesh(this.body,ringsGeometry([[.78,.127,.096],[.88,.140,.102],[.97,.143,.103],
      [1.06,.127,.091],[1.18,.138,.099],[1.30,.149,.105],[1.38,.130,.090],[1.43,.064,.058]]),shirt);
    this.torso.name='aoi_torso';
    for(const [side,sign] of [['left',-1],['right',1]]){
      const leg=this.limbs[side+'Leg']=new LimbSurface(this.mesh,pants,[[0,.082],[.4,.064],[.8,.045],[1,.04]],{depth:.94});
      leg.mesh.name=`aoi_${side}_leg`;
      const skinArm=this.limbs[side+'Arm']=new LimbSurface(this.mesh,skin,[[0,.048],[.3,.044],[.6,.034],[1,.026]],{depth:.88});
      const start=Math.floor(skinArm.rings*.43);
      skinArm.geometry.setDrawRange(start*skinArm.sides*6,(skinArm.rings-start)*skinArm.sides*6);
      this.sleeves[side]=new LimbSurface(this.mesh,shirt,[[0,.063],[.8,.055],[1,.050]],{end:.51});
      this.sleeves[side+'Roll']=new LimbSurface(this.mesh,clothMaterial('#d3ded2'),[[0,.061],[.5,.057],[1,.050]],{start:.45,end:.54});
      const hand=this.hands[side]=new ArticulatedHand(sign,skin,jointInk);hand.scale.setScalar(.78);this.mesh.add(hand);
      const shoe=this.feet[side]=new THREE.Group();this.mesh.add(shoe);
      mesh(shoe,shoeGeometry(),'#333a40');
      const sole=mesh(shoe,shoeGeometry(),'#d8d4c7');sole.scale.y=.13;sole.position.y=-.08447;
    }
    for(const y of [1.03,1.15,1.28]){const button=mesh(this.body,new THREE.SphereGeometry(.008,10,8),'#c7ba85',false);button.position.set(0,y,.105);}
    const badge=mesh(this.body,new THREE.BoxGeometry(.045,.065,.005),'#e4ddc5',false);badge.position.set(.068,1.27,.102);
    this.face=animatedHead(this.body,'aoi',1.485);this.headGroup=this.face.head;this.mouth=this.face.mouth;
  }
  setEmotion(e,b){this.face.setEmotion(e,b);}
  setPose(p){
    this.mesh.position.set(p.rootX,0,p.rootZ??0);this.mesh.rotation.y=p.yaw;
    this.body.position.y=p.bob;this.body.rotation.x=p.lean??0;
    this.headGroup.rotation.set(p.headPitch,p.headYaw,p.headRoll);
    for(const side of ['left','right']){
      const arm=p[side+'Arm'];this.limbs[side+'Arm'].update(arm);this.sleeves[side].update(arm);this.sleeves[side+'Roll'].update(arm);
      finishSleeveRoot(this.sleeves[side],arm,'aoi');this.limbs[side+'Leg'].update(p[side+'Leg']);
      const hand=this.hands[side],x=v(arm[2]).sub(v(arm[1])).normalize(),forward=new THREE.Vector3(0,0,1);
      const y=forward.clone().addScaledVector(x,-forward.dot(x)).normalize(),z=x.clone().cross(y).normalize();
      y.copy(z).cross(x).normalize();hand.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
      hand.position.copy(v(arm[2]));hand.setGesture({fist:p.fist??.12,open:p.open??0});
      this.feet[side].position.copy(v(p[side+'Leg'][2]));this.feet[side].rotation.set(0,0,0);
    }
    this.mesh.updateMatrixWorld(true);
  }
}
