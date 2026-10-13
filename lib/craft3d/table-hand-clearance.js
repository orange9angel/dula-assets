import * as THREE from 'three';
import {makeSkinnedSamples} from './skinned-samples.js';

/** Deterministic near-edge routing for free hands behind a fixed desk. This is
 * an authored staging constraint, not a general collision/physics solver.
 * Soft vertical activation starts before contact so the hand follows an arc. */
export function createTableHandClearance(actor,table){
  const samples=makeSkinnedSamples(actor),box=new THREE.Box3().setFromObject(table);
  const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
  return (sides)=>{
    const changes=Object.fromEntries(sides.map(side=>[side,0]));
    for(let pass=0;pass<3;pass++){
      const points=samples.sample(sides.map(s=>s+'Hand'));
      for(const side of sides){
        let offset=0;
        for(const p of points[side+'Hand']){
          const vertical=smooth(box.min.y-.09,box.min.y,p.y)*(1-smooth(box.max.y+.008,box.max.y+.12,p.y));
          const lateral=smooth(box.min.x-.04,box.min.x,p.x)*(1-smooth(box.max.x,box.max.x+.04,p.x));
          offset=Math.max(offset,Math.max(0,p.z-box.min.z+.01)*vertical*lateral);
        }
        if(offset<.00001)continue;
        const b=actor.bones,v=()=>new THREE.Vector3(),hand=b[side+'hand'];
        const target=hand.getWorldPosition(v()),orientation=hand.getWorldQuaternion(new THREE.Quaternion());
        const pole=b[side+'forearm'].getWorldPosition(v()).sub(b[side+'arm'].getWorldPosition(v()));
        target.z-=offset;
        actor.solve([side+'arm',side+'forearm',side+'hand'],target,pole);
        actor.setWorldQuaternion(hand,orientation);changes[side]+=offset;
      }
    }
    return changes;
  };
}
