import {paintGeneratedFace} from '../../lib/craft3d/generated-face-paint.js';
import {addPaintedHairShell} from '../../lib/craft3d/painted-hair-shell.js';

export function aoiGeneratedFace(base){
  return {...base,textureSize:2048,skin:'#ffddbf',paintFace:paintGeneratedFace,
    irisArt:new URL('./textures/aoi-painted-face-v1.png',import.meta.url).href,
    paint:{originX:642,originY:658,anchorY:1.473,pixelsPerMetre:3300,
      eyes:[[500,656,458,600,85,111],[785,655,743,599,85,111]],mouth:[641,852]},
    cheekFullness:.045,neckZ:.012,
    profiles:[[1.376,.001,.087,.079],[1.382,.019,.092,.046],[1.394,.042,.096,-.002],[1.406,.056,.098,-.033],[1.418,.067,.100,-.052],[1.438,.079,.099,-.073],[1.464,.091,.099,-.088],[1.505,.093,.103,-.105],[1.537,.087,.099,-.110],[1.574,.065,.065,-.099],[1.605,.018,.012,-.060],[1.612,.001,-.028,-.029]]};
}
export function addAoiGeneratedHair(actor){
  return addPaintedHairShell(actor,{
    url:new URL('./textures/aoi-painted-hair-v1.png',import.meta.url).href,
    backUrl:new URL('./textures/aoi-painted-back-v1.png',import.meta.url).href,
    originX:615,originY:654,anchorY:1.473,pixelsPerMetre:3186,
    projectionRadii:[.166,.163,.142],
    cap:{center:[0,1.514,-.027],radii:[.112,.140,.121],hem:[[-180,1.400],[-145,1.407],[-110,1.430],[-80,1.470],[-45,1.550],[0,1.575],[45,1.550],[80,1.470],[110,1.430],[145,1.407],[180,1.400]]},
    capCrop:[295,140,240,330]
  });
}
