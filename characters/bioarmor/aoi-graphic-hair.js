import {addGraphicHair} from '../../lib/craft3d/graphic-hair.js';

/** S1E4 unaccepted look-development candidate. Hairline separation still leaves
 * fragments; the original clip and secondary hair motion need restoration. */
export function addAoiGraphicHair(actor){
  // The imported cel material has already classified head-weighted hair.
  // Remove those triangles from the visible mesh and its shadow together.
  for(const mesh of actor.skins){
    const g=mesh.geometry,m=g.attributes.craftRegion,index=g.index,keep=[];
    for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);
      if(m.getX(a)+m.getX(b)+m.getX(c)<.5)keep.push(a,b,c);
    }g.setIndex(keep);
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
