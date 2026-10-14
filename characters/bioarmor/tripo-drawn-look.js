import {createDrawnHead} from '../../lib/craft3d/drawn-head.js';
import {illustrateImportedBody} from '../../lib/craft3d/illustrated-import.js';

const CONFIG={
  aoi:{centerY:1.49,range:.17,headCut:1.385,noseY:1.435,earX:.102,earY:1.464,skin:'#efcbae',iris:'#a47a3c',
    eyes:[[-.042,1.477,.030,.020],[.042,1.477,.030,.020]],brows:[[-.043,1.512,.024],[.043,1.512,.024]],mouth:[0,1.409,.018],
    profiles:[[1.355,.002,.050,.045],[1.367,.029,.077,.012],[1.388,.058,.091,-.021],[1.423,.086,.100,-.058],[1.463,.102,.101,-.085],[1.505,.107,.091,-.105],[1.544,.101,.074,-.110],[1.581,.079,.052,-.096],[1.612,.043,.012,-.073],[1.627,.001,-.028,-.029]]},
  lei:{centerX:-.012,centerY:1.615,range:.18,headCut:1.493,noseY:1.559,earX:.105,earY:1.591,skin:'#e9c5a5',iris:'#806342',lashes:false,browWidth:.0031,lashWidth:.0015,
    eyes:[[-.055,1.601,.029,.016],[.031,1.601,.029,.016]],brows:[[-.055,1.634,.025],[.031,1.634,.025]],mouth:[-.012,1.529,.020],
    profiles:[[1.477,.002,.051,.035],[1.490,.034,.081,.002],[1.514,.064,.094,-.031],[1.548,.090,.101,-.068],[1.589,.105,.104,-.094],[1.632,.109,.094,-.113],[1.673,.100,.073,-.118],[1.709,.077,.048,-.101],[1.740,.041,.005,-.075],[1.753,.001,-.033,-.034]]}
};
export function applyTripoDrawnLook(actor,key){
  const config=CONFIG[key];
  const body=illustrateImportedBody(actor,{kind:key,headCut:config.headCut,keepHair:false,skin:config.skin});
  const face=createDrawnHead(actor,config);face.apply();
  return {face,body};
}
