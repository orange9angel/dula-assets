import * as THREE from 'three';
import {outlined} from './look.js';
import {mat} from './surface.js';

/** Authored broad locks for a head-local candidate. Units and paths are supplied
 * in the actor's neutral metre frame; no scene camera billboard is involved. */
export function addGraphicHair(actor,{center,radii,hem,locks,colors,flat=false,tailPivot=null}){
  const root=new THREE.Group();actor.mesh.add(root);
  const palette=colors.map(c=>flat?new THREE.MeshBasicMaterial({color:c,toneMapped:false}):mat(c).clone());
  const tail=new THREE.Group();root.add(tail);if(tailPivot)tail.position.set(...tailPivot);
  root.userData.tail=tail;
  root.userData.applyLag=(yaw,pitch)=>{tail.rotation.set(THREE.MathUtils.clamp(pitch,-.12,.12),THREE.MathUtils.clamp(yaw,-.16,.16),THREE.MathUtils.clamp(yaw*.35,-.07,.07));};
  const N=96,R=24,pos=[],idx=[];
  const edge=a=>{
    for(let i=1;i<hem.length;i++)if(a<=hem[i][0])return THREE.MathUtils.lerp(hem[i-1][1],hem[i][1],THREE.MathUtils.smoothstep(a,hem[i-1][0],hem[i][0]));
    return hem.at(-1)[1];
  };
  for(let row=0;row<=R;row++)for(let col=0;col<=N;col++){
    const a=-Math.PI+col/N*Math.PI*2,lat=row/R*Math.acos(THREE.MathUtils.clamp((edge(a*180/Math.PI)-center[1])/radii[1],-1,1));
    pos.push(center[0]+radii[0]*Math.sin(lat)*Math.sin(a),center[1]+radii[1]*Math.cos(lat),center[2]+radii[2]*Math.sin(lat)*Math.cos(a));
    if(row<R&&col<N){const k=row*(N+1)+col;idx.push(k,k+N+1,k+1,k+1,k+N+1,k+N+2);}
  }
  const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));cap.setIndex(idx);cap.computeVertexNormals();
  outlined(root,cap,palette[0],.0008);
  for(const lock of locks){
    const curve=new THREE.CatmullRomCurve3(lock.points.map(p=>new THREE.Vector3(...p))),positions=[],indices=[],rows=32,sides=12;
    if(flat&&!lock.tail)curve.points[0].y-=.022;
    const forward=new THREE.Vector3(...(lock.flatAxis??[0,0,1]));
    for(let row=0;row<=rows;row++){
      const t=row/rows,c=curve.getPoint(t),axis=curve.getTangent(t);
      let width=lock.width*Math.pow(Math.sin(Math.PI*(.08+.92*t)),.62)+.0003;
      if(lock.widths){for(let k=1;k<lock.widths.length;k++)if(t<=lock.widths[k][0]){width=lock.width*THREE.MathUtils.lerp(lock.widths[k-1][1],lock.widths[k][1],THREE.MathUtils.smoothstep(t,lock.widths[k-1][0],lock.widths[k][0]));break;}}
      const x=forward.clone().cross(axis).normalize(),z=axis.clone().cross(x).normalize();
      for(let col=0;col<=sides;col++){
        const a=col/sides*Math.PI*2;
        const v=c.clone().addScaledVector(x,Math.cos(a)*width).addScaledVector(z,Math.sin(a)*width*(lock.depth??.28));
        positions.push(...v.toArray());
        if(row<rows&&col<sides){const k=row*(sides+1)+col;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
    if(lock.tail&&tailPivot)g.translate(-tailPivot[0],-tailPivot[1],-tailPivot[2]);
    outlined(lock.tail?tail:root,g,palette[lock.color??0],lock.outline??.00065);
  }
  root.updateMatrixWorld(true);actor.bones.head.attach(root);
  return root;
}
