import * as THREE from 'three';

// A restrained reflection rig: broad dark/bright fields, one long key and a
// cooler rim. This changes only the armor's environment, not palace lighting.
export function createRegalMetalEnvironment(renderer){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#182135');
 const shell=new THREE.Mesh(new THREE.BoxGeometry(20,18,20),new THREE.MeshBasicMaterial({color:'#58677c',side:THREE.BackSide}));scene.add(shell);
 const card=(w,h,p,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);scene.add(m);};
 card(6,15,[-5,4,7],'#fff1c9');card(2.4,12,[7,2,3],'#b9d9ff');card(14,4,[0,8,-1],'#e2edff');
 card(11,13,[0,1,-9],'#27304e');card(5,12,[5,-2,8],'#18223a');
 const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(scene,.025,.1,40);pmrem.dispose();
 scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return target;
}

function maps(fire,family,micro){
 const make=()=>{const c=document.createElement('canvas');c.width=c.height=1024;return c;};
 const color=make(),height=make(),rough=make(),c=color.getContext('2d'),b=height.getContext('2d'),r=rough.getContext('2d');
 c.fillStyle='#f4f1e9';c.fillRect(0,0,1024,1024);b.fillStyle='#808080';b.fillRect(0,0,1024,1024);r.fillStyle='#cccccc';r.fillRect(0,0,1024,1024);
 // The prior generated texture is retained only as a weak microrelief source.
 // Macro ornament is separately authored so it follows the armor's UV regions.
 if(micro){b.globalAlpha=.10;b.drawImage(micro,0,0,1024,1024);b.globalAlpha=1;}
 let seed=fire?1801:4203;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<1800;i++){
  const x=rand()*1024,y=rand()*1024,w=2+rand()*20;
  r.strokeStyle=`rgba(255,255,255,${.025+rand()*.05})`;r.lineWidth=.65;r.beginPath();r.moveTo(x,y);r.lineTo(x+w,y+.3);r.stroke();
 }
 const stroke=(path,width=3.0)=>{
  for(const [ctx,col,w] of [[c,fire?'#a58f65':'#9090a9',width],[b,'#555555',width],[r,'#fafafa',width+2]]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(path);}
 };
 const path=(fn,w)=>{const p=new Path2D();fn(p);stroke(p,w);};
 const wrap=family==='body'||family==='leg'||family==='belt';
 // Reserved broad fields remain polished; double incised borders describe
 // workmanship without turning the suit into a noisy tiled surface.
 for(const y of [64,79,945,960])path(p=>{p.moveTo(0,y);p.lineTo(1024,y);},y===64||y===960?3.4:1.6);
 if(!wrap)for(const x of [65,82,942,959])path(p=>{p.moveTo(x,65);p.lineTo(x,960);},x===65||x===959?2.8:1.4);
 const centers=wrap?[0,512,1024]:[512];
 for(const x of centers){
  if(fire){
   for(const s of [-1,1])for(let j=0;j<3;j++)path(p=>{
    const y=300+j*132;p.moveTo(x,y+225);p.bezierCurveTo(x+s*35,y+120,x+s*(145-j*19),y+105,x+s*(119-j*15),y);p.bezierCurveTo(x+s*86,y+70,x+s*30,y+43,x,y-68);
   },j===0?3.2:2.2);
   path(p=>{p.moveTo(x,165);p.lineTo(x+25,214);p.lineTo(x,260);p.lineTo(x-25,214);p.closePath();},3);
  }else{
   for(const s of [-1,1])for(let j=0;j<3;j++)path(p=>{const y=282+j*145;p.moveTo(x,y+187);p.lineTo(x+s*(123-j*13),y+17);p.lineTo(x+s*(63-j*8),y+41);p.lineTo(x,y-62);},2.8);
   path(p=>{p.moveTo(x+23,160);p.bezierCurveTo(x-55,183,x-45,259,x+20,273);p.bezierCurveTo(x-10,231,x-10,204,x+23,160);},3);
  }
 }
 const tex=(canvas,data=false)=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;};
 return {map:tex(color),bumpMap:tex(height,true),roughnessMap:tex(rough,true),canvases:{color,height,rough}};
}

export function applyOrnamentMetal(actor,environment){
 const fire=actor.palaceKind==='aoao',cache=new Map(),records=[];
 actor.mesh.traverse(m=>{
  if(!m.isMesh||!m.userData.metalClad)return;
  // Hidden legacy pieces stay untouched, as do gems, glow, hair and cloth.
  for(let p=m;p&&p!==actor.mesh;p=p.parent)if(p.name.startsWith('legacy-'))return;
  const name=m.name,geo=m.geometry,old=m.material;
  const field=geo.userData.closedArmor||geo.type==='LatheGeometry'||m===actor.shieldDome;
  const edge=/rim|rib|ridge|arc|bridge|sigil|boss|edge|knuckle|finger|tip/.test(name)||geo.type==='TubeGeometry'||geo.type==='TorusGeometry';
  const family=/cuirass/.test(name)?'body':/greave|boot/.test(name)?'leg':/belt/.test(name)?'belt':/shoulder/.test(name)?'shoulder':'arm';
  const primary=field&&!edge;
  const mat=old.clone();
  mat.color.set(fire?(primary?'#e5a629':edge?'#f2c468':'#a16b21'):(primary?'#514766':edge?'#9ca8c6':'#383349'));
  mat.metalness=1;mat.roughness=primary?.29:.23;mat.clearcoat=.12;mat.clearcoatRoughness=.23;
  mat.envMap=environment;mat.envMapIntensity=fire?1.3:1.65;
  mat.map=null;mat.bumpMap=null;mat.roughnessMap=null;
  if(primary&&geo.attributes.uv&&m!==actor.shieldDome){
   if(!cache.has(family))cache.set(family,maps(fire,family,actor.metalClad.map.image));
   const atlas=cache.get(family);Object.assign(mat,{map:atlas.map,bumpMap:atlas.bumpMap,roughnessMap:atlas.roughnessMap,bumpScale:.00017});
  }
  mat.needsUpdate=true;m.material=mat;records.push({name,family,primary});
 });
 actor.ornamentMetal={records,atlases:cache};return actor.ornamentMetal;
}
