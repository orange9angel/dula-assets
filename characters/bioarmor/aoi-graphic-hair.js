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
    const widths=[[0,.55],[.18,1],[.49,.78],[.78,.35],[1,.006]];
    const root=addGraphicHair(actor,{center:[0,1.505,-.023],radii:[.112,.137,.132],flat:true,tailPivot:[.073,1.591,-.074],
      cel:{shadow:'#192f39',light:'#7a9c91'},
      hem:[[-180,1.410],[-110,1.426],[-82,1.464],[-60,1.489],[-35,1.515],[0,1.530],[38,1.519],[65,1.489],[85,1.463],[110,1.424],[180,1.410]],
      colors:['#28484c','#31545a','#233e48','#3b5d60'],locks:[
        {points:[[.023,1.638,.014],[-.018,1.605,.067],[-.045,1.557,.105],[-.051,1.505,.108],[-.071,1.479,.092]],width:.025,widths,color:0},
        {points:[[.025,1.634,.027],[.004,1.598,.082],[-.009,1.551,.113],[-.018,1.505,.116],[-.034,1.488,.112]],width:.020,widths,color:1},
        {points:[[.017,1.640,.006],[-.047,1.610,.060],[-.087,1.550,.078],[-.107,1.487,.060],[-.100,1.459,.065]],width:.024,widths,color:0},
        {points:[[.011,1.635,-.005],[-.066,1.596,.032],[-.102,1.538,.044],[-.117,1.482,.032]],width:.014,widths,color:2},
        {points:[[.035,1.635,.018],[.065,1.604,.065],[.078,1.560,.090],[.062,1.517,.103],[.043,1.502,.112]],width:.022,widths,color:0},
        {points:[[.040,1.630,.005],[.088,1.595,.045],[.104,1.544,.054],[.094,1.505,.069],[.090,1.474,.053]],width:.018,widths,color:1},
        {points:[[-.078,1.570,.033],[-.104,1.520,.048],[-.111,1.468,.057],[-.095,1.419,.066],[-.102,1.409,.068]],width:.011,widths,color:2,lift:true},
        {points:[[.092,1.549,.026],[.105,1.510,.031],[.107,1.468,.035],[.096,1.438,.044]],width:.008,widths,color:2,lift:true},
        {points:[[.073,1.591,-.074],[.120,1.625,-.090],[.152,1.556,-.102],[.164,1.450,-.061],[.197,1.366,-.010],[.182,1.317,.028]],width:.030,widths,color:0,depth:.29,tail:true},
        {points:[[.073,1.591,-.074],[.132,1.610,-.080],[.177,1.525,-.085],[.185,1.433,-.027],[.208,1.357,.023],[.232,1.342,.033]],width:.024,widths,color:2,depth:.27,tail:true},
        {points:[[.073,1.591,-.074],[.122,1.589,-.048],[.143,1.510,-.047],[.137,1.437,-.016],[.163,1.366,.031],[.151,1.317,.050]],width:.023,widths,color:1,depth:.26,tail:true},
        {points:[[.073,1.591,-.074],[.116,1.580,-.051],[.126,1.498,-.022],[.120,1.424,.016],[.140,1.362,.045]],width:.016,widths,color:0,depth:.24,tail:true},
        {points:[[.073,1.591,-.074],[.146,1.576,-.068],[.165,1.488,-.030],[.167,1.411,.017],[.194,1.339,.052],[.206,1.312,.047]],width:.017,widths,color:0,depth:.24,tail:true},
        {points:[[.073,1.591,-.074],[.143,1.616,-.089],[.182,1.553,-.068],[.201,1.452,-.014],[.213,1.404,.026],[.202,1.379,.046]],width:.012,widths,color:1,depth:.23,tail:true}
      ]});
    const clip=new THREE.Group();clip.position.set(.084,1.559,.068);clip.rotation.set(-.12,.38,-.45);clip.updateMatrix();
    root.updateWorldMatrix(true,true);
    const hairSurfaces=root.children.filter(o=>o.isMesh),ray=new THREE.Raycaster(),depthCache=new Map();
    for(const surface of hairSurfaces)surface.geometry.computeBoundingBox();
    for(const [x,y,angle] of [[-.008,0,-.5],[.006,.010,.6],[.003,-.010,1.5]]){
      const shape=new THREE.Shape();shape.moveTo(0,-.014);shape.quadraticCurveTo(-.012,0,0,.014);shape.quadraticCurveTo(.012,0,0,-.014);
      const leaf=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:'#b1c98c',side:THREE.DoubleSide,toneMapped:false}));leaf.position.set(x,y,0);leaf.rotation.z=angle;leaf.updateMatrix();
      // Subdivide the interior too: a boundary-only projection leaves large
      // triangles cutting through neighbouring locks of different depths.
      let triangles=Array.from(leaf.geometry.toNonIndexed().attributes.position.array);
      for(let pass=0;pass<4;pass++){
        const next=[];
        for(let i=0;i<triangles.length;i+=9){
          const a=new THREE.Vector3().fromArray(triangles,i),b=new THREE.Vector3().fromArray(triangles,i+3),c=new THREE.Vector3().fromArray(triangles,i+6);
          const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);
          for(const v of [a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca])next.push(v.x,v.y,v.z);
        }triangles=next;
      }
      leaf.geometry.dispose();leaf.geometry=new THREE.BufferGeometry();leaf.geometry.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));
      // Fit the ornament to the actual revised locks, not an obsolete position
      // in front of the previous hairstyle. The resulting geometry follows head.
      const pos=leaf.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){
        const p=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(leaf.matrix).applyMatrix4(clip.matrix);
        const cacheKey=p.x.toFixed(5)+':'+p.y.toFixed(5);
        if(!depthCache.has(cacheKey)){
          ray.set(root.localToWorld(new THREE.Vector3(p.x,p.y,.5)),new THREE.Vector3(0,0,-1).transformDirection(root.matrixWorld));
          const candidates=hairSurfaces.filter(o=>{const b=o.geometry.boundingBox;return p.x>=b.min.x&&p.x<=b.max.x&&p.y>=b.min.y&&p.y<=b.max.y;});
          const hit=ray.intersectObjects(candidates,false)[0];
          depthCache.set(cacheKey,hit?root.worldToLocal(hit.point).z+.0035:p.z);
        }
        p.z=depthCache.get(cacheKey);
        pos.setXYZ(i,p.x,p.y,p.z);
      }
      leaf.position.set(0,0,0);leaf.rotation.set(0,0,0);leaf.geometry.computeVertexNormals();root.add(leaf);
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
