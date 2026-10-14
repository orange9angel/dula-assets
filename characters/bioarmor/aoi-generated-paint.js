import {paintGeneratedFace} from '../../lib/craft3d/generated-face-paint.js';
import {addPaintedHairShell} from '../../lib/craft3d/painted-hair-shell.js';

export function aoiGeneratedFace(base){
  return {...base,textureSize:2048,skin:'#ffddbf',paintFace:paintGeneratedFace,
    irisArt:new URL('./textures/aoi-painted-face-v1.png',import.meta.url).href,
    paint:{originX:642,originY:658,anchorY:1.473,pixelsPerMetre:3300,
      eyes:[[500,656,458,600,85,111],[785,655,743,599,85,111]],mouth:[641,852]},
    profiles:[[1.376,.002,.089,.085],[1.382,.017,.095,.062],[1.394,.039,.098,.016],[1.406,.053,.099,-.016],[1.418,.064,.101,-.042],[1.438,.077,.098,-.067],[1.464,.091,.098,-.088],[1.505,.093,.103,-.105],[1.537,.087,.099,-.110],[1.574,.065,.065,-.099],[1.605,.018,.012,-.060],[1.612,.001,-.028,-.029]]};
}
export function addAoiGeneratedHair(actor){
  return addPaintedHairShell(actor,{
    url:new URL('./textures/aoi-painted-hair-v1.png',import.meta.url).href,
    backUrl:new URL('./textures/aoi-painted-back-v1.png',import.meta.url).href,
    originX:615,originY:654,anchorY:1.473,pixelsPerMetre:3186,
    projectionRadii:[.166,.163,.142],
    cap:{center:[0,1.514,-.027],radii:[.112,.131,.121],hem:[[-180,1.416],[-110,1.430],[-80,1.470],[-45,1.550],[0,1.575],[45,1.550],[80,1.470],[110,1.430],[180,1.416]]},
    capCrop:[295,140,240,330]
  });
}
