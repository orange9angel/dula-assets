/** Fit every head layer through the SAME coordinate map. The front painting's
 * X/Y, UV, facial landmarks and positive-depth surface remain unchanged.
 * Independent skull/profile edits had changed the face and buried temple hair.
 * Do not reshape the front to compensate for an oversized rear support. */
export function fitCafeHeadEnvelope(actor){
 const ratio=.62,warp=z=>z<0?z*ratio:z;
 const geometries=new Set(actor.face.root.children.slice(0,2).map(m=>m.geometry));
 actor.hairRoot.traverse(m=>{if(m.isMesh)geometries.add(m.geometry);});
 let vertices=0,frontChanged=0;
 for(const geometry of geometries){
  const p=geometry?.attributes.position;if(!p)continue;
  for(let i=0;i<p.count;i++){const z=p.getZ(i),next=warp(z);p.setZ(i,next);if(z>=0&&p.getZ(i)!==z)frontChanged++;vertices++;}
  p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
 }
 // Nape pixels in the frontal painting represent hair beside/behind the jaw.
 // Wrap only that lower region; retain crown, fringe and every X/Y coordinate.
 const eye=actor.girl?1.575:1.690;
 for(const mesh of actor.hairRoot.children.filter(o=>o.isMesh).slice(1,4)){
  const p=mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const y=p.getY(i),u=Math.max(0,Math.min(1,(eye-(actor.girl?.060:.025)-y)/.045)),w=u*u*(3-2*u);
   p.setZ(i,p.getZ(i)*(1-w)+Math.min(p.getZ(i),-.025)*w);
  }
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();
 }
 // Sway always starts from the fitted rest geometry, including cap and rear.
 actor.hairRest=[];actor.hairRoot.traverse(mesh=>{if(mesh.isMesh&&mesh.geometry.attributes.position)actor.hairRest.push({mesh,base:mesh.geometry.attributes.position.array.slice()});});
 actor.cafeEarCount=actor.face.root.children.filter(m=>m.isMesh&&m.visible&&m.geometry.type==='SphereGeometry').length;
 actor.hairRoot.userData.integration={method:'shared depth map across skull and all hair layers; original UVs and frontal XY retained; lower nape locks wrapped behind jaw',posteriorDepthRatio:ratio,positiveZChangedByPosteriorMap:frontChanged,vertices,frontalXYChanged:false,lowerLocksWrapped:true};
}
