import * as THREE from 'three';
/** Conservative local shape keys on the accepted mesh. These authored keys are
 * a small stylized rig, not an ARKit-compatible 52-shape anatomical reconstruction. */
export function addFacialDeformation(actor,config){
  const names=['jawOpen','mouthSmile','mouthFrown','browInnerUp','browDown','cheekRaise','eyeBlinkLeft','eyeBlinkRight'];
  const gaussian=x=>Math.exp(-x*x*2),[mx,my]=config.mouth;
  for(const mesh of actor.skins){
    const p=mesh.geometry.attributes.performerRest,arrays=names.map(()=>new Float32Array(p.count*3));
    const inverse=new THREE.Matrix3().setFromMatrix4(mesh.matrixWorld).invert(),d=new THREE.Vector3();
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(z<(config.frontZ??.035)||Math.abs(x-mx)>.13||y<my-.09||y>config.centerY+.12)continue;
      const lipSide=Math.abs(x-mx),mouthWeight=gaussian((y-my)/.025)*gaussian((lipSide-.028)/.025);
      const cheek=gaussian((y-my-.043)/.035)*gaussian((lipSide-.050)/.03);
      const deltas=[
        [0,-.003*gaussian((x-mx)/.075)*gaussian((y-my+.027)/.045)*(y<my+.004?1:0),0],
        [Math.sign(x-mx)*.001*mouthWeight,.002*mouthWeight,.0012*cheek],
        [0,-.002*mouthWeight,0],
        [0,0,0],[0,0,0],[0,.0035*cheek,.0015*cheek],[0,0,0],[0,0,0]
      ];
      for(let e=0;e<2;e++){
        const eye=config.eyes[e],brow=config.brows[e],sgn=e===0?1:-1;
        const bw=gaussian((x-brow[0])/(brow[2]*1.1))*gaussian((y-brow[1])/.019);
        deltas[3][1]+=.005*bw*(.65+sgn*(x-brow[0])/brow[2]*.35);
        deltas[4][1]-=.0038*bw;
        const ew=gaussian((x-eye[0])/(eye[2]*1.05))*gaussian((y-eye[1])/(eye[3]*1.15));
        deltas[6+e][1]=-(y-eye[1])*.40*ew;
      }
      deltas.forEach((v,k)=>d.set(...v).applyMatrix3(inverse).toArray(arrays[k],i*3));
    }
    mesh.geometry.morphTargetsRelative=true;
    mesh.geometry.morphAttributes.position=arrays.map((array,i)=>{const attr=new THREE.BufferAttribute(array,3);attr.name=names[i];return attr;});mesh.updateMorphTargets();
  }
  return state=>{const v=[state.jaw??0,state.smile??0,(state.fear??0)*.5,state.fear??0,state.focus??0,(state.smile??0)*.75,state.blink??0,state.blink??0];
    for(const mesh of actor.skins)mesh.morphTargetInfluences.splice(0,names.length,...v.map(n=>THREE.MathUtils.clamp(n,0,1)));};
}
