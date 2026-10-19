import * as THREE from 'three';

// Keep the established shoulder/elbow/wrist trajectories. One continuous
// surface replaces the distant deltoid cap that previously read as an oval pad.
export function applyPalaceArms(actor){
 const fire=actor.palaceKind==='aoao',k=fire?1:.88;
 const cloth=new THREE.MeshStandardMaterial({color:fire?'#655044':'#38435c',roughness:.83,metalness:0});
 for(const side of ['left','right']){
  actor.caps[side].visible=false;
  const arm=actor.limbs[side+'Arm'];arm.start=-.065;arm.depth=1.03;
  arm.radii=[[-.065,.048*k],[0,.061*k],[.12,.064*k],[.27,.058*k],[.42,.046*k],[.51,.037*k],[.63,.041*k],[.79,.034*k],[1,.027*k]];
  arm.mesh.material=cloth;arm.mesh.name=side+'-connected-upper-arm';
 }
 actor.palaceArms={continuous:true};
}

// Growth/charge updates restore each shoulder group every frame; enforce the
// single-shell choice after that updater rather than hiding it only at setup.
export function applySingleShoulders(actor){
 const update=actor.updatePalaceClad.bind(actor);
 const hide=()=>{for(const pd of actor.pauldronGroups)if(pd.li>0)pd.g.visible=false;};
 actor.updatePalaceClad=(...args)=>{update(...args);hide();};hide();
}

export function removeCladGlow(actor){
 const hidden=actor.cladParts.flatMap(p=>[...p.gems,...p.seams,...p.rings]);
 actor.mesh.traverse(m=>{if(m.name==='hearth-round-boss')hidden.push(m);});
 const hide=()=>hidden.forEach(m=>m.visible=false),update=actor.updatePalaceClad.bind(actor);
 actor.updatePalaceClad=(...args)=>{update(...args);hide();};hide();
 actor.reflectiveClad={hidden};return actor.reflectiveClad;
}
