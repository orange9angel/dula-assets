import * as THREE from 'three';
const basic=c=>new THREE.MeshBasicMaterial({color:c});
const toon=c=>new THREE.MeshToonMaterial({color:c});
function tube(parent,pts,color,r=.003){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(8,pts.length*4),r,5,false),basic(color));parent.add(m);return m;}
function plate(parent,points,z,color,depth=.008){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const m=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1}),toon(color));m.position.z=z;m.castShadow=true;parent.add(m);return m;}
export function applyPalaceClad(actor,kind){
 const fire=kind==='aoao',gold=fire?'#ffe4a0':'#d7d7ef',dark=fire?'#633124':'#201b34',main=fire?'#c8873c':'#4b4169';
 const chest=actor.cladParts.find(p=>p.ord===1).groups[0];
 const cy=fire?1.24:1.34;
 // Faceted overlapping chest plates follow the actual chest profile.
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const y=cy+.13-i*.095,rx=actor.profileAt(y)[0],rz=actor.profileAt(y)[1];
  const g=new THREE.Group();chest.add(g);
  const pts=[[side*.025,y+.03],[side*(rx-.012),y+.065],[side*(rx+.003),y+.005],[side*.055,y-.035]];
  plate(g,pts,rz*.80+.021,i%2?dark:main);
  tube(g,pts.slice(0,3).map(([x,y])=>[x,y,rz*.80+.033]),gold,.0035);
  const rivet=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),basic(gold));rivet.position.set(side*(rx-.03),y+.025,rz*.80+.034);g.add(rivet);
 }
 // Engraved sun-rays / diagonal moon-chain distinguish the two torsos.
 if(fire){
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const z=actor.profileAt(cy)[1]+.027;tube(chest,[[Math.cos(a)*.058,cy+.02+Math.sin(a)*.058,z],[Math.cos(a)*.074,cy+.02+Math.sin(a)*.074,z]],gold,.0025);}
 }else{
  for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.012,.003,5,12),basic(gold));m.position.set(-.10+i*.021,cy+.17-i*.027,actor.profileAt(cy)[1]+.035);m.rotation.z=.6;m.rotation.y=i%2*.65;chest.add(m);}
  const moon=new THREE.Mesh(new THREE.TorusGeometry(.052,.012,6,32,Math.PI*1.5),basic('#c2b5ef'));moon.position.set(0,cy+.02,.135);moon.rotation.z=.35;chest.add(moon);
 }
 // Replace common smooth shoulder shells with character-specific lamellar silhouettes.
 for(const pd of actor.pauldronGroups){
  for(const child of [...pd.g.children])if(child.isMesh)child.visible=false;
  const s=pd.sign,k=pd.li;
  const g=new THREE.Group();pd.g.add(g);
  if(fire){
   const pts=[[s*.005,0],[s*.07,.10],[s*(.17+k*.045),.105-k*.025],[s*(.20+k*.045),-.045-k*.035],[s*.05,-.035]];
   plate(g,pts,.015-k*.008,k?dark:main,.018);
   tube(g,pts.map(([x,y])=>[x,y,.04-k*.008]),gold,.004);
   for(let i=0;i<3;i++)tube(g,[[s*(.055+i*.035),.065,.042],[s*(.08+i*.04),-.015-k*.015,.043]],gold,.0025);
  }else{
   const big=s<0,reach=(big?.26:.13)+k*.03;
   const pts=[[0,0],[s*.06,.1],[s*reach,big?.32:.10],[s*(reach-.025),.01],[s*.08,-.08]];
   plate(g,pts,.025-k*.022,k?dark:main,.013);tube(g,pts.map(([x,y])=>[x,y,.047-k*.022]),gold,.004);
  }
 }
 // Forearm fins and greave chevrons are attached to the existing limb rigs.
 actor.palaceFins=[];
 for(const side of ['left','right']){
  const s=side==='left'?-1:1,arm=actor.rigs[side].rig;
  const shin=actor.shinRigs[side].rig;
  const greave=plate(shin,[[-.035,.015],[.035,.015],[.045,.12],[.022,.34],[-.022,.34],[-.045,.12]],0,main,.012);
  greave.rotation.x=Math.PI/2;greave.position.y=.057;
  tube(shin,[[-.032,.061,.028],[0,.073,.09],[.032,.061,.028]],gold,.004);
  tube(shin,[[0,.075,.09],[0,.061,.31]],gold,.003);
  for(let i=0;i<3;i++){
   const m=new THREE.Mesh(new THREE.BoxGeometry(.035,.032,.018),toon(i%2?dark:main));m.position.set(s*.052,.012,.025+i*.044);m.rotation.z=s*.4;arm.add(m);actor.palaceFins.push(m);
   tube(actor.shinRigs[side].rig,[[s*-.027,.05,.07+i*.08],[0,.065,.10+i*.08],[s*.027,.05,.07+i*.08]],gold,.003);
  }
 }
 if(fire){
  // Shield relief lies on the dome surface (local +Y); no hovering graphic plane.
  const shield=actor.shieldDome;
  const point=(r,a)=>[Math.cos(a)*r,Math.sqrt(Math.max(0,.27*.27-r*r))+.006,Math.sin(a)*r];
  for(const r of [.09,.185,.237])tube(shield,Array.from({length:49},(_,i)=>point(r,i*Math.PI/24)),gold,.004);
  for(let i=0;i<16;i++){
   const a=i*Math.PI/8;const p=point(.22,a);const m=new THREE.Mesh(new THREE.SphereGeometry(.007,8,6),basic(gold));m.position.set(...p);shield.add(m);
   tube(shield,[point(.105,a),point(.15,a+.09),point(.18,a)],i%2?gold:'#6c352a',.004);
  }
  actor.palaceScars=new THREE.Group();shield.add(actor.palaceScars);
  for(const a of [.35,1.65])tube(actor.palaceScars,[point(.045,a),point(.09,a+.3),point(.14,a+.1),point(.235,a+.2)],'#362230',.006);
 }
 const head=actor.headGroup;
 for(const side of [-1,1]){
  const pts=fire?[[side*.045,.13],[side*.09,.16],[side*.14,.25],[side*.12,.10]]:[[side*.08,.12],[side*.13,.22],[side*.19,.30],[side*.15,.11]];
  plate(head,pts,.095,main,.008);tube(head,pts.slice(1).map(([x,y])=>[x,y,.11]),gold,.003);
 }
 actor.palaceKind=kind;
 if(!fire){
  const ratchet=new THREE.Group();actor.rigs.right.rig.add(ratchet);ratchet.position.set(.045,.035,-.08);actor.palaceRatchet=ratchet;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.039,.008,6,24),toon('#aaa4c5'));ratchet.add(ring);
  for(let i=0;i<8;i++){const tooth=new THREE.Mesh(new THREE.BoxGeometry(.017,.012,.017),toon('#5b4c78')),a=i*Math.PI/4;tooth.position.set(Math.cos(a)*.04,Math.sin(a)*.04,0);tooth.rotation.z=a;ratchet.add(tooth);}
  tube(ratchet,[[-.026,0,.012],[.026,0,.012]],gold,.006);
 }
 actor.updatePalaceClad=(t,T)=>{
  if(actor.palaceRatchet)actor.palaceRatchet.rotation.z=t>=T.LOCK&&t<T.C7?Math.sin(t*9)*.22:0;
  if(actor.palaceScars)actor.palaceScars.visible=t>=T.SCAR;
  for(const [i,m] of actor.palaceFins.entries()){
   const damaged=fire&&i<3&&t>=T.C7;
   m.material.color.set(damaged?'#3c3033':i%2?dark:main);m.visible=!(damaged&&i===0);
  }
 };
}
