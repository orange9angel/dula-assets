import {addGraphicHair} from '../../lib/craft3d/graphic-hair.js';
import * as THREE from 'three';

/** S1E4 unaccepted look-development candidate. Hairline separation still leaves
 * fragments; the original clip and secondary hair motion need restoration. */
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
    const widths=[[0,.45],[.20,1],[.50,.82],[.78,.42],[1,.008]];
    const root=addGraphicHair(actor,{center:[0,1.505,-.023],radii:[.113,.140,.112],flat:true,tailPivot:[.086,1.607,-.082],
      hem:[[-180,1.398],[-110,1.410],[-82,1.460],[-60,1.500],[-35,1.530],[0,1.548],[38,1.535],[65,1.487],[85,1.457],[110,1.410],[180,1.398]],
      colors:['#294a4b','#3c6060','#213d41','#527471'],locks:[
        {points:[[.043,1.634,.030],[.006,1.617,.060],[-.049,1.572,.090],[-.085,1.519,.078],[-.102,1.491,.050]],width:.043,widths,color:0,depth:.55},
        {points:[[.040,1.638,.021],[-.020,1.623,.052],[-.085,1.565,.082],[-.112,1.511,.055]],width:.028,widths,color:1,depth:.65},
        {points:[[.046,1.626,.036],[.084,1.592,.058],[.099,1.552,.052],[.077,1.513,.069]],width:.030,widths,color:0,depth:.75},
        {points:[[-.098,1.548,.033],[-.109,1.490,.045],[-.100,1.432,.052],[-.089,1.405,.059]],width:.012,widths,color:2},
        {points:[[.078,1.610,-.083],[.126,1.627,-.093],[.164,1.518,-.104],[.161,1.405,-.070],[.182,1.323,-.015],[.207,1.316,.013]],width:.041,widths,color:2,depth:.56,tail:true},
        {points:[[.082,1.614,-.078],[.133,1.613,-.070],[.155,1.509,-.064],[.146,1.411,-.035],[.166,1.336,.012],[.184,1.322,.027]],width:.030,widths,color:0,depth:.39,tail:true},
        {points:[[.090,1.601,-.059],[.127,1.574,-.039],[.141,1.490,-.036],[.130,1.401,-.010],[.149,1.358,.030]],width:.017,widths,color:1,depth:.28,tail:true},
        // Narrow authored highlight follows the sweep, never a floating plane.
        {points:[[.016,1.623,.071],[-.015,1.604,.086],[-.052,1.573,.098],[-.070,1.546,.090]],width:.004,widths,color:1,depth:.08,outline:0},
      ]});
    const clip=new THREE.Group();clip.position.set(.081,1.560,.099);clip.rotation.set(-.12,.38,-.45);root.add(clip);
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
