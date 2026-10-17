const P={ink:'#382d38',white:'#fff9ed',iris:'#5aa5c1'};

function shape(c,d,fill,width=.006,stroke=P.ink){
  const p=new Path2D(d);c.fillStyle=fill;c.fill(p);
  if(width){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke(p);}
  return p;
}
function line(c,d,width=.004,color=P.ink){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke(new Path2D(d));}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}

export function drawEye(c,x,y,turn,angry,blink,far=false){
  c.save();c.translate(x,y);c.scale(far?(.98-turn*.5):1,Math.max(.06,1-blink*.94));
  const top=.054-angry*.008;
  const outline=`M -.053 .010 C -.047 ${top+.035} .024 ${top+.035} .052 .032 C .066 -.028 .034 -.062 -.007 -.060 Q -.050 -.055 -.053 .010 Z`;
  shape(c,outline,P.white,.0035);
  c.save();c.clip(new Path2D(outline));
  ellipse(c,.005+turn*.027,.006,.034,.059,'#304965');
  ellipse(c,.007+turn*.027,-.012,.029,.041,P.iris);
  ellipse(c,.005+turn*.027,.009,.015,.037,'#263143');
  ellipse(c,-.007+turn*.027,.039,.010,.014,'#fffdf4');
  ellipse(c,.022+turn*.027,-.025,.005,.007,'#d6f6ef');c.restore();
  line(c,`M -.062 .027 Q -.019 ${top+.053} .046 .044 L .059 .041`,.009);
  line(c,'M -.052 .035 L -.065 .050',.0045);
  c.restore();
}
