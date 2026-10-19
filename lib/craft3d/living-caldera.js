// Animate only the atmosphere and hot vents of an existing cylindrical matte.
// The mountain silhouette and floor keep their original UVs, including the
// continuous-backdrop seam derivative fix. No camera-dependent flat overlay.
export function animateCalderaBackdrop(backdrop){
 const m=backdrop.material;m.uniforms.calderaTime={value:0};
 m.fragmentShader='uniform float calderaTime;\n'+m.fragmentShader;
 const helpers=`
 float calHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float calNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(calHash(i),calHash(i+vec2(1,0)),f.x),mix(calHash(i+vec2(0,1)),calHash(i+vec2(1,1)),f.x),f.y);}
 float calFbm(vec2 p){return calNoise(p)*.58+calNoise(p*2.05+4.)*.28+calNoise(p*4.17+10.)*.14;}
 `;
 m.fragmentShader=m.fragmentShader.replace('void main() {',helpers+'\nvoid main() {');
 m.fragmentShader=m.fragmentShader.replace('vec3 imageColor = textureGrad(sourceMap, vec2(u, clamp(v, 0.0, 1.0)), dx, dy).rgb;',`
  float sky=smoothstep(.335,.43,v)*(1.-smoothstep(.89,1.02,v));
  vec2 flow=vec2(calFbm(vec2(u*8.,v*7.-calderaTime*.035)),calFbm(vec2(u*9.+3.,v*6.-calderaTime*.028)))-.5;
  vec2 livingUv=vec2(u,clamp(v,0.,1.))+flow*vec2(.018,.028)*sky;
  vec3 imageColor=textureGrad(sourceMap,livingUv,dx,dy).rgb;
  float mirrorU=1.-abs(mod(u,2.)-1.);
  for(int j=0;j<6;j++){
   float k=float(j),cx=j==0?.194:j==1?.262:j==2?.426:j==3?.634:j==4?.709:.823;
   float cy=j==2?.322:j==3?.311:.292;
   float glow=exp(-pow((mirrorU-cx)/.014,2.)-pow((v-cy)/.016,2.));
   imageColor+=vec3(.28,.052,.004)*glow*(.55+.45*sin(calderaTime*1.5+k*2.1));
   for(int i=0;i<5;i++){
    float seed=float(i)*.173+k*.31,age=fract(calderaTime*.024+seed),height=age*.20;
    float xx=cx+sin(age*5.+k)*height*.17+age*.018;
    vec2 p=vec2((mirrorU-xx)/(.010+age*.023),(v-cy-height)/(.018+age*.030));
    float n=calFbm(p*2.+seed*20.+vec2(calderaTime*.033,-calderaTime*.041));
    float cloud=(1.-smoothstep(.38,1.,length(p)+(n-.5)*.4))*sin(age*3.14159)*.22*sky;
    imageColor=mix(imageColor,vec3(.064,.034,.041)*(1.+n*.7),cloud);
   }
   for(int i=0;i<5;i++){
    float fi=float(i),age=fract(calderaTime*(.11+fi*.007)+fi*.217+k*.23);
    vec2 center=vec2(cx+sin(fi*4.+k)*.009*age,cy+age*.052);
    float spark=exp(-pow((mirrorU-center.x)/.00038,2.)-pow((v-center.y)/.0014,2.))*sin(age*3.14159);
    imageColor+=vec3(.7,.22,.025)*spark;
   }
  }
 `);
 m.needsUpdate=true;
 return {update(t){m.uniforms.calderaTime.value=t;},material:m};
}
