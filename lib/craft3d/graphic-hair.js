import * as THREE from 'three';
import {outlined} from './look.js';
import {mat} from './surface.js';

/** Authored broad locks for a head-local candidate. Units and paths are supplied
 * in the actor's neutral metre frame; no scene camera billboard is involved. */
export function addGraphicHair(actor,{center,radii,hem,locks,colors,flat=false,tailPivot=null,cel=null}){
  const root=new THREE.Group();actor.mesh.add(root);
  const palette=colors.map(c=>flat?new THREE.MeshBasicMaterial({color:c,toneMapped:false}):mat(c).clone());
  const hairMaterial=(index,tail=false,cap=false,highlight=true)=>{
    if(!cel)return palette[index];
    const m=palette[index].clone();
    m.onBeforeCompile=s=>{
      s.uniforms.hairShadow={value:new THREE.Color(cel.shadow)};s.uniforms.hairLight={value:new THREE.Color(cel.light)};
      s.vertexShader='varying vec3 hairRest,hairNormal; varying vec2 hairUv;\n'+s.vertexShader;
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nhairRest=position;hairNormal=normal;hairUv=uv;');
      s.fragmentShader='varying vec3 hairRest,hairNormal; varying vec2 hairUv; uniform vec3 hairShadow,hairLight;\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`
        vec3 n=normalize(hairNormal);
        float bright=smoothstep(.10,.17,dot(n,normalize(vec3(-.5,.65,.8))));
        outgoingLight=mix(hairShadow,diffuseColor.rgb,bright);
        ${tail?`float along=sin(3.14159*clamp((hairUv.y-.12)/.70,0.0,1.0));
        float streak=(1.0-smoothstep(.035*along,.060*along+.001,abs(hairUv.x-.28)))*smoothstep(.13,.20,hairUv.y)*(1.0-smoothstep(.68,.82,hairUv.y));
        outgoingLight=mix(outgoingLight,hairLight,streak*.34);`:cap||!highlight?'':`float stripeT=.40+.065*cos(6.28318*hairUv.x)+.025*sin(12.56636*hairUv.x);
        float stripe=(1.0-smoothstep(.022,.032,abs(hairUv.y-stripeT)))*smoothstep(.35,.65,n.z);
        outgoingLight=mix(outgoingLight,hairLight,stripe*.45);`}
        #include <opaque_fragment>`);
    };m.customProgramCacheKey=()=>`graphic-hair-cel-${index}-${tail}-${cap}-${highlight}-${JSON.stringify(cel)}`;return m;
  };
  const tail=new THREE.Group();root.add(tail);if(tailPivot)tail.position.set(...tailPivot);
  root.userData.tail=tail;
  root.userData.applyLag=(yaw,pitch)=>{tail.rotation.set(THREE.MathUtils.clamp(pitch,-.12,.12),THREE.MathUtils.clamp(yaw,-.16,.16),THREE.MathUtils.clamp(yaw*.35,-.07,.07));};
  const N=128,R=36,pos=[],idx=[],uv=[];
  const edge=a=>{
    for(let i=1;i<hem.length;i++)if(a<=hem[i][0])return THREE.MathUtils.lerp(hem[i-1][1],hem[i][1],THREE.MathUtils.smoothstep(a,hem[i-1][0],hem[i][0]));
    return hem.at(-1)[1];
  };
  for(let row=0;row<=R;row++)for(let col=0;col<=N;col++){
    const a=-Math.PI+col/N*Math.PI*2,lat=row/R*Math.acos(THREE.MathUtils.clamp((edge(a*180/Math.PI)-center[1])/radii[1],-1,1));
    pos.push(center[0]+radii[0]*Math.sin(lat)*Math.sin(a),center[1]+radii[1]*Math.cos(lat),center[2]+radii[2]*Math.sin(lat)*Math.cos(a));
    uv.push(col/N,row/R);
    if(row<R&&col<N){const k=row*(N+1)+col;idx.push(k,k+N+1,k+1,k+1,k+N+1,k+N+2);}
  }
  const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));cap.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));cap.setIndex(idx);cap.computeVertexNormals();
  outlined(root,cap,hairMaterial(0,false,true),.0008);
  for(const lock of locks){
    const curve=new THREE.CatmullRomCurve3(lock.points.map(p=>new THREE.Vector3(...p))),positions=[],indices=[],uvs=[],rows=56,sides=20;
    if(flat&&!lock.tail&&!cel)curve.points[0].y-=.022;
    const forward=new THREE.Vector3(...(lock.flatAxis??[0,0,1]));
    const sample=t=>{
      const c=curve.getPoint(t);
      if(cel&&!lock.tail&&!lock.lift){
        const delta=c.clone().sub(new THREE.Vector3(...center)),unit=Math.hypot(delta.x/radii[0],delta.y/radii[1],delta.z/radii[2]);
        const shell=delta.clone().divideScalar(unit).add(new THREE.Vector3(...center));
        c.lerp(shell,1-THREE.MathUtils.smoothstep(t,.45,.80));
        c.addScaledVector(new THREE.Vector3((c.x-center[0])/(radii[0]**2),(c.y-center[1])/(radii[1]**2),(c.z-center[2])/(radii[2]**2)).normalize(),.0025);
      }return c;
    };
    for(let row=0;row<=rows;row++){
      const t=row/rows,c=sample(t),axis=sample(Math.min(1,t+.001)).sub(sample(Math.max(0,t-.001))).normalize();
      const frame=cel&&!lock.tail&&!lock.lift?new THREE.Vector3((c.x-center[0])/(radii[0]**2),(c.y-center[1])/(radii[1]**2),(c.z-center[2])/(radii[2]**2)).normalize():forward;
      let width=lock.width*Math.pow(Math.sin(Math.PI*(.08+.92*t)),.62)+.0003;
      if(lock.widths){for(let k=1;k<lock.widths.length;k++)if(t<=lock.widths[k][0]){width=lock.width*THREE.MathUtils.lerp(lock.widths[k-1][1],lock.widths[k][1],THREE.MathUtils.smoothstep(t,lock.widths[k-1][0],lock.widths[k][0]));break;}}
      const x=frame.clone().cross(axis).normalize(),z=axis.clone().cross(x).normalize();
      for(let col=0;col<=sides;col++){
        const a=col/sides*Math.PI*2;
        const depth=cel&&!lock.tail&&!lock.lift?Math.min(lock.depth??.18,.20):(lock.depth??.28);
        const v=c.clone().addScaledVector(x,Math.cos(a)*width).addScaledVector(z,Math.sin(a)*width*depth);
        positions.push(...v.toArray());
        uvs.push(col/sides,t);
        if(row<rows&&col<sides){const k=row*(sides+1)+col;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
    if(lock.tail&&tailPivot)g.translate(-tailPivot[0],-tailPivot[1],-tailPivot[2]);
    outlined(lock.tail?tail:root,g,hairMaterial(lock.color??0,!!lock.tail,false,lock.highlight??lock.color===1),lock.outline??.00065);
  }
  root.updateMatrixWorld(true);actor.bones.head.attach(root);
  return root;
}
