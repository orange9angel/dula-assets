import {paintGeneratedFace} from '../../lib/craft3d/generated-face-paint.js';
import {addPaintedHairShell} from '../../lib/craft3d/painted-hair-shell.js';

export function aoiGeneratedFace(base){
  return {...base,textureSize:2048,skin:'#ffddbf',paintFace:paintGeneratedFace,
    irisArt:new URL('./textures/aoi-painted-face-v1.png',import.meta.url).href,
    paint:{originX:642,originY:658,anchorY:1.473,pixelsPerMetre:3300,
      eyes:[[500,656,458,600,85,111],[785,655,743,599,85,111]],mouth:[641,852]},
    cheekFullness:.045,neckZ:.012,neckTopZ:-.012,earZ:-.040,
    faceRoundness:1.45,noseDepth:0,
    eyeSurface:{slope:.34,recess:.004,width:.017,height:.022},
    earPaint:[[290,620,115,182],[872,620,114,182]],
    profileContour:[[1.376,.079],[1.380,.086],[1.391,.091],[1.403,.094],[1.413,.098],[1.419,.100],[1.426,.099],[1.431,.102],[1.437,.110],[1.441,.1095],[1.448,.106],[1.467,.098],[1.483,.099],[1.510,.104],[1.537,.100],[1.574,.065],[1.605,.012],[1.612,-.028]],
    jawContour:[[1.376,.076],[1.380,.056],[1.389,.011],[1.406,-.033],[1.418,-.052],[1.438,-.073],[1.464,-.088],[1.505,-.105],[1.537,-.110],[1.574,-.099],[1.605,-.060],[1.612,-.029]],
    profiles:[[1.376,.001,.087,.080],[1.382,.019,.092,.062],[1.394,.042,.096,.016],[1.406,.056,.098,-.016],[1.418,.067,.100,-.042],[1.438,.079,.099,-.067],[1.464,.091,.099,-.088],[1.505,.093,.103,-.105],[1.537,.087,.099,-.110],[1.574,.065,.065,-.099],[1.605,.018,.012,-.060],[1.612,.001,-.028,-.029]]};
}
export function addAoiGeneratedHair(actor){
  return addPaintedHairShell(actor,{
    url:new URL('./textures/aoi-painted-hair-v1.png',import.meta.url).href,
    backUrl:new URL('./textures/aoi-painted-back-v1.png',import.meta.url).href,
    originX:615,originY:654,anchorY:1.473,pixelsPerMetre:3186,
    projectionRadii:[.166,.163,.142],
    templeWrap:.065,
    cap:{center:[0,1.514,-.027],radii:[.112,.140,.121],hem:[[-180,1.400],[-145,1.407],[-110,1.430],[-80,1.470],[-45,1.550],[0,1.575],[45,1.550],[80,1.470],[110,1.430],[145,1.407],[180,1.400]]},
    capCrop:[295,140,240,330]
  });
}
