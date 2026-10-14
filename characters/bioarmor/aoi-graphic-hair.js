import {addGraphicHair} from '../../lib/craft3d/graphic-hair.js';
import * as THREE from 'three';

/** S1E4 broad-lock candidates. Refined version is paired with the drawn head;
 * the earlier material-only comparison remains available with refined=false. */
export function addAoiGraphicHair(actor,{refined=false}={}){
  // The imported cel material has already classified head-weighted hair.
  // Remove those triangles from the visible mesh and its shadow together.
  for(const mesh of actor.skins){
    const g=mesh.geometry,m=g.attributes.craftRegion,index=g.index,keep=[];
    for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);
      if(m.getX(a)+m.getX(b)+m.getX(c)<.5)keep.push(a,b,c);
    }g.setIndex(keep);
  }
  if(refined){
    const widths=[[0,.30],[.18,1],[.49,.78],[.78,.35],[1,.008]];
    const root=addGraphicHair(actor,{center:[0,1.505,-.023],radii:[.113,.140,.112],flat:true,tailPivot:[.073,1.591,-.074],
      cel:{shadow:'#162b35',light:'#689c96',bandY:1.582},
      hem:[[-180,1.398],[-110,1.410],[-82,1.460],[-60,1.500],[-35,1.530],[0,1.548],[38,1.535],[65,1.487],[85,1.457],[110,1.410],[180,1.398]],
      colors:['#294c50','#355f62','#203b46','#527471'],locks:[
        {points:[[.043,1.634,.030],[.006,1.617,.060],[-.049,1.572,.090],[-.085,1.519,.078],[-.102,1.491,.050]],width:.034,widths,color:0,depth:.55},
        {points:[[.040,1.638,.021],[-.020,1.623,.052],[-.085,1.565,.082],[-.112,1.511,.055]],width:.026,widths,color:1,depth:.55},
        {points:[[.044,1.624,.038],[.010,1.601,.079],[-.028,1.556,.101],[-.049,1.523,.093]],width:.018,widths,color:0,depth:.38},
        {points:[[.046,1.626,.036],[.084,1.592,.058],[.099,1.552,.052],[.077,1.513,.069]],width:.030,widths,color:0,depth:.75},
        {points:[[-.098,1.548,.033],[-.109,1.490,.045],[-.100,1.432,.052],[-.089,1.405,.059]],width:.012,widths,color:2,lift:true},
        {points:[[.073,1.591,-.074],[.137,1.630,-.093],[.177,1.510,-.104],[.169,1.397,-.065],[.199,1.322,-.005],[.222,1.329,.022]],width:.037,widths,color:2,depth:.46,tail:true},
        {points:[[.073,1.591,-.074],[.137,1.606,-.070],[.158,1.509,-.064],[.148,1.401,-.032],[.168,1.317,.016],[.195,1.284,.033]],width:.030,widths,color:0,depth:.39,tail:true},
        {points:[[.073,1.591,-.074],[.127,1.574,-.039],[.140,1.490,-.036],[.125,1.403,-.010],[.142,1.340,.030],[.161,1.323,.033]],width:.021,widths,color:1,depth:.28,tail:true},
      ]});
    const clip=new THREE.Group();clip.position.set(.080,1.558,.059);clip.rotation.set(-.12,.38,-.45);root.add(clip);
    for(const [x,y,angle] of [[-.008,0,-.5],[.006,.010,.6],[.003,-.010,1.5]]){
      const shape=new THREE.Shape();shape.moveTo(0,-.014);shape.quadraticCurveTo(-.012,0,0,.014);shape.quadraticCurveTo(.012,0,0,-.014);
      const leaf=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:'#9dbd8b',side:THREE.DoubleSide,toneMapped:false}));leaf.position.set(x,y,0);leaf.rotation.z=angle;clip.add(leaf);
    }
    return root;
  }
  return addGraphicHair(actor,{center:[0,1.505,-.023],radii:[.113,.140,.112],
    hem:[[-180,1.395],[-110,1.405],[-75,1.45],[-45,1.545],[0,1.57],[45,1.535],[75,1.45],[110,1.405],[180,1.395]],
    colors:['#294646','#355655','#203d40'],locks:[
      {points:[[.045,1.633,.035],[.003,1.613,.092],[-.063,1.555,.111],[-.115,1.47,.095]],width:.052,color:0},
      {points:[[.040,1.635,.027],[-.020,1.621,.075],[-.085,1.56,.093],[-.123,1.50,.065]],width:.033,color:1},
      {points:[[.05,1.622,.048],[.085,1.589,.082],[.106,1.548,.080],[.083,1.508,.09]],width:.032,color:0},
      {points:[[-.100,1.54,.045],[-.114,1.48,.062],[-.105,1.42,.068],[-.092,1.38,.079]],width:.014,color:2},
      {points:[[.070,1.603,-.085],[.113,1.638,-.09],[.156,1.50,-.104],[.172,1.37,-.08],[.200,1.28,-.02]],width:.052,color:2,depth:.6},
      {points:[[.08,1.617,-.085],[.139,1.638,-.08],[.174,1.505,-.073],[.161,1.374,-.047],[.194,1.255,.016]],width:.041,color:0,depth:.4},
      {points:[[.082,1.618,-.081],[.125,1.603,-.053],[.143,1.477,-.045],[.172,1.36,-.020],[.164,1.293,.028]],width:.029,color:1,depth:.35}
    ]});
}
