// Pixel-Grafik: Farben, Zeichenwerkzeuge, Sprites und Szenen
const PXS=3;               // Bildschirmpixel pro Spielpixel
const CACHE={}, SPR={};

// ---------- Farben ----------
function hex2rgb(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function rgb2hex(r,g,b){const c=v=>Math.max(0,Math.min(255,Math.round(v)));return"#"+((1<<24)|(c(r)<<16)|(c(g)<<8)|c(b)).toString(16).slice(1)}
function shade(h,f){const[r,g,b]=hex2rgb(h),t=f<0?0:255,a=Math.abs(f);return rgb2hex(r+(t-r)*a,g+(t-g)*a,b+(t-b)*a)}
function ramp(c){return[shade(c,.38),shade(c,.16),c,shade(c,-.24),shade(c,-.46)]}
// Wählt eine Farbe aus einer Abstufung, mit Dithering an den Übergängen
function band(r,v,x,y){const s=[.14,.32,.66,.84];let i=0;while(i<4&&v>s[i])i++;if(i<4&&s[i]-v<.05&&((x+y)&1))i++;return r[Math.min(i,4)]}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const PAL={ink:"#120f0c",tree:"#04070a",lamp:"#e6d08c",
  night:["#020409","#050811","#080d17","#0b121e","#0f1726","#141d2e","#19233a"],
  snow:["#9aa6b1","#7d8996","#626e7b","#4c5764","#3a434e"],
  chrome:["#e2e7ea","#aab2b8","#6c757c"],metal:["#d9dee1","#aab2b8","#7f878d","#5b6268","#3c4247"]};
const SCARVES=["#5b2a2a","#3d4a5c","#5a5040","#2f4a3a"], HATS=["#3a2c20","#2a2622","#4a3a2a"];

// ---------- Zeichenwerkzeuge ----------
function mk(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c}
function P(c){
  const g=c.getContext("2d"),W=c.width,H=c.height;
  const o={g,W,H,
    dot(x,y,col){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;g.fillStyle=col;g.fillRect(x,y,1,1)},
    clr(x,y){g.clearRect(Math.round(x),Math.round(y),1,1)},
    rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))},
    dith(x,y,w,h,col,ph=0){for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(((x+i+y+j+ph)&1)===0)o.dot(x+i,y+j,col)},
    ell(cx,cy,rx,ry,col,keep){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const u=rx?x/rx:0,v=ry?y/ry:0;
      if(u*u+v*v<=1.0001){const X=cx+x,Y=cy+y;if(keep&&!keep(X,Y))continue;const cc=typeof col==="function"?col(X,Y,u,v):col;
        if(cc==="clear")o.clr(X,Y);else if(cc)o.dot(X,Y,cc)}}},
    line(x0,y0,x1,y1,col){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)o.dot(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,col)},
    poly(pts,col){let a=1e9,b=-1e9;for(const q of pts){a=Math.min(a,q[1]);b=Math.max(b,q[1])}
      for(let y=Math.floor(a);y<=Math.ceil(b);y++){const yy=y+.5,xs=[];
        for(let i=0;i<pts.length;i++){const A=pts[i],B=pts[(i+1)%pts.length];
          if((A[1]<=yy&&B[1]>yy)||(B[1]<=yy&&A[1]>yy))xs.push(A[0]+(yy-A[1])/(B[1]-A[1])*(B[0]-A[0]))}
        xs.sort((m,n)=>m-n);
        for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]);x<Math.round(xs[k+1]);x++){
          const cc=typeof col==="function"?col(x,y):col;if(cc)o.dot(x,y,cc)}}}
  };
  return o;
}
// Dunkle Kontur um alle sichtbaren Pixel
function outline(c,col=PAL.ink){
  const g=c.getContext("2d"),W=c.width,H=c.height,d=g.getImageData(0,0,W,H),a=d.data,out=new Uint8ClampedArray(a),[r,gg,b]=hex2rgb(col);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(a[i+3]>0)continue;
    if((x>0&&a[i-1]>0)||(x<W-1&&a[i+7]>0)||(y>0&&a[i-W*4+3]>0)||(y<H-1&&a[i+W*4+3]>0)){out[i]=r;out[i+1]=gg;out[i+2]=b;out[i+3]=255}}
  g.putImageData(new ImageData(out,W,H),0,0); return c;
}
function fromMap(rows,colors,line=true){
  const h=rows.length,w=Math.max(...rows.map(r=>r.length)),c=mk(w+2,h+2),p=P(c);
  rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(colors[ch])p.dot(x+1,y+1,colors[ch])}));
  if(line) outline(c); return c;
}
// Schwarz-Weiß-Foto mit Körnung
function photoize(src,w,h,ox,oy,bg){
  const c=mk(w,h),g=c.getContext("2d");g.fillStyle=bg;g.fillRect(0,0,w,h);g.drawImage(src,ox,oy);
  const d=g.getImageData(0,0,w,h),a=d.data,R=rng(w*31+h);
  for(let i=0;i<a.length;i+=4){let v=a[i]*.3+a[i+1]*.59+a[i+2]*.11;v=(v-110)*1.3+120+(R()-.5)*26;
    v=Math.round(Math.max(10,Math.min(235,v))/22)*22;a[i]=a[i+1]=a[i+2]=v;a[i+3]=255}
  g.putImageData(d,0,0); return c;
}

// ---------- Kacheln ----------
function noiseTile(base,amt,seed){const c=mk(24,24),p=P(c),R=rng(seed);
  for(let y=0;y<24;y++)for(let x=0;x<24;x++){const n=R();p.dot(x,y,n<.1?shade(base,-amt):n>.94?shade(base,amt*.7):base)}return c.toDataURL()}
function passTile(){const c=mk(24,24),p=P(c);
  for(let y=0;y<24;y++)for(let x=0;x<24;x++){const v=Math.sin((x+Math.sin(y*.52)*3)*.52);p.dot(x,y,v>.9?"#c0c8b0":"#d4d7c3")}return c.toDataURL()}
function metalTile(){const c=mk(16,16),p=P(c),R=rng(4),m=PAL.metal;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++)p.dot(x,y,R()<.15?m[3]:(y%4===0?m[1]:m[2]));return c.toDataURL()}
function woodTile(){const c=mk(48,24),p=P(c),R=rng(3),cols=["#3d2a1b","#382619","#422e1e"];
  for(let y=0;y<24;y++){const pl=Math.floor(y/8),base=cols[pl%3];
    for(let x=0;x<48;x++){let col=base;const gr=Math.sin((x+pl*13)*.35+y*.9)*.5+R()*.6;
      if(gr>.75)col=shade(base,-.14);else if(gr<-.2&&R()<.3)col=shade(base,.06);
      if(y%8===0)col="#20150c";if(y%8===1)col=shade(base,.1);p.dot(x,y,col)}}
  p.rect(13,1,1,7,"#20150c");p.rect(37,9,1,7,"#20150c");p.rect(25,17,1,7,"#20150c");
  return c.toDataURL()}

// ---------- Autos (Front links) ----------
const CAR_SHAPES=[
  {body:[[20,34],[20,28],[22,25],[30,23],[38,22],[44,13],[49,11],[70,11],[76,13],[82,21],[88,23],[91,26],[92,30],[92,34]],
    glass:[[[40,21],[45,14],[60,13],[60,21]],[[62,13],[70,13],[75,15],[79,21],[62,21]]],
    wheels:[[32,35,5],[79,35,5]],doors:[[39,23,32],[61,21,32]],handles:[[56,24]],
    chrome:[[17,30,6],[90,30,6]],lights:[[20,26,2,2,"#efe3a6"],[21,30,2,1,"#d99a3a"],[90,25,2,3,"#a3241f"]],
    lines:[[84,24,88,24,"#17191b"],[84,26,88,26,"#17191b"],[84,28,88,28,"#17191b"]]},
  {body:[[6,33],[6,25],[9,23],[30,22],[36,21],[44,12],[72,12],[80,21],[101,22],[105,24],[106,27],[106,33]],
    glass:[[[38,21],[45,13],[58,13],[58,21]],[[60,13],[71,13],[78,21],[60,21]]],
    wheels:[[24,35,6],[88,35,6]],doors:[[37,22,32],[59,21,32],[79,21,32]],handles:[[52,24],[73,24]],
    chrome:[[3,29,9],[99,29,9]],belt:[10,102,23],lights:[[6,24,2,2,"#efe3a6"],[6,27,2,1,"#efe3a6"],[104,24,2,3,"#a3241f"]]},
  {body:[[6,33],[6,27],[9,24],[32,22],[40,20],[52,11],[78,11],[97,17],[103,21],[106,25],[106,33]],
    glass:[[[42,20],[53,12],[64,12],[64,20]],[[66,12],[77,12],[93,18],[66,19]]],
    wheels:[[24,35,6],[88,35,6]],doors:[[41,21,32],[65,20,32],[85,19,32]],handles:[[59,23],[80,23]],
    black:[[4,29,10,3],[98,29,10,3],[14,27,80,1]],lights:[[6,25,3,2,"#ece8cf"],[104,23,2,3,"#a3241f"]]},
  {body:[[10,34],[10,27],[12,24],[18,21],[30,20],[37,19],[44,11],[50,9],[66,9],[73,11],[80,19],[92,20],[98,22],[102,26],[102,34]],
    glass:[[[46,18],[51,11],[58,10],[58,18]],[[60,10],[66,10],[71,12],[76,18],[60,18]]],
    wheels:[[26,35,6],[86,35,6]],doors:[[45,19,32],[59,18,32]],handles:[[53,22]],
    chrome:[[8,30,6],[98,30,6]],belt:[14,98,24],lights:[[11,24,2,2,"#efe3a6"],[100,24,2,2,"#a3241f"]]},
  {body:[[6,34],[6,22],[8,16],[12,11],[18,9],[30,8],[106,8],[107,10],[107,34]],
    glass:[[[8,16],[12,11],[15,11],[11,17]],[[15,18],[17,12],[29,10],[29,18]]],
    wheels:[[22,35,6],[90,35,6]],doors:[[31,9,32],[94,9,32]],handles:[[26,21],[97,20]],
    chrome:[[4,30,6],[104,30,6]],lights:[[6,23,2,2,"#efe3a6"],[105,26,2,3,"#a3241f"]],
    lines:[40,48,56,64,72,80,88].map(x=>[x,12,x,28,null])}
];
function carSprite(mi,color,dim){
  const key="car"+mi+color+(dim?1:0); if(CACHE[key]) return CACHE[key];
  const S=CAR_SHAPES[mi],c=mk(116,46),p=P(c),r=ramp(dim?shade(color,-.3):color);
  const ys=S.body.map(q=>q[1]),top=Math.min(...ys),bot=Math.max(...ys);
  p.poly(S.body,(x,y)=>band(r,(y-top)/(bot-top),x,y));
  if(S.belt){p.line(S.belt[0],S.belt[2],S.belt[1],S.belt[2],PAL.chrome[0]);p.line(S.belt[0],S.belt[2]+1,S.belt[1],S.belt[2]+1,PAL.chrome[2])}
  const gl=dim?["#0e141b","#18212b","#3c4c5a"]:["#141c25","#223040","#5d7486"];
  S.glass.forEach(gp=>{const gy=Math.min(...gp.map(q=>q[1]));
    p.poly(gp,(x,y)=>{const s=((x-Math.round((y-gy)*1.3))%13+13)%13;return s<2?gl[2]:(y-gy<2?gl[1]:gl[0])})});
  (S.doors||[]).forEach(([x,y0,y1])=>p.line(x,y0,x,y1,r[4]));
  (S.handles||[]).forEach(([x,y])=>{p.rect(x,y,3,1,PAL.chrome[0]);p.rect(x,y+1,3,1,PAL.chrome[2])});
  (S.chrome||[]).forEach(([x,y,w])=>{p.rect(x,y,w,1,PAL.chrome[0]);p.rect(x,y+1,w,1,PAL.chrome[1]);p.rect(x,y+2,w,1,PAL.chrome[2])});
  (S.black||[]).forEach(([x,y,w,h])=>{p.rect(x,y,w,h,"#1a1c1e");p.rect(x,y,w,1,"#34383c")});
  (S.lines||[]).forEach(([x0,y0,x1,y1,col])=>p.line(x0,y0,x1,y1,col||r[3]));
  (S.lights||[]).forEach(([x,y,w,h,col])=>{p.rect(x,y,w,h,dim?shade(col,-.2):col);p.dot(x,y,shade(col,.4))});
  S.wheels.forEach(([x,y,rad])=>{
    p.ell(x,y,rad+2,rad+2,"#0a0b0c",(X,Y)=>Y<=y);
    p.ell(x,y,rad,rad,"#141617"); p.ell(x,y,rad-2,rad-2,"#2f3438");
    p.ell(x,y,Math.max(1,rad-3),Math.max(1,rad-3),dim?"#6d757b":"#a9b1b6");
    p.dot(x-1,y-1,"#e4e8ea"); p.dot(x,y,"#3c4247")});
  outline(c);
  const xs=S.body.map(q=>q[0]),x0=Math.min(...xs),x1=Math.max(...xs);
  for(let x=x0-2;x<=x1+2;x++){p.dot(x,42,"rgba(0,0,0,.45)");if(x>x0&&x<x1)p.dot(x,43,"rgba(0,0,0,.25)")}
  return CACHE[key]=c;
}
function carPhoto(mi){
  const key="ph"+mi; if(CACHE[key]) return CACHE[key];
  const ph=photoize(carSprite(mi,"#9c9a90"),118,48,1,1,"#5e5e58");
  const c=mk(122,52),g=c.getContext("2d");g.fillStyle="#e6e1d3";g.fillRect(0,0,122,52);g.drawImage(ph,2,2);
  return CACHE[key]=c.toDataURL();
}

// ---------- Menschen ----------
function hashF(f){const s=JSON.stringify(f);let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
function portrait(f,photo){
  const c=mk(58,68),p=P(c),h=hashF(f),sk=ramp(f.skin),hr=ramp(f.hair),co=ramp(f.coat),cx=29;
  p.ell(cx,72,27,24,(x,y,u)=>band(co,.08+(u+1)*.42,x,y),(x,y)=>y<67);
  p.poly([[cx-12,47],[cx-2,58],[cx-7,67],[cx-16,54]],co[1]);
  p.poly([[cx+12,47],[cx+2,58],[cx+7,67],[cx+16,54]],co[3]);
  p.poly([[cx-6,46],[cx+6,46],[cx+2,60],[cx-2,60]],h%2?"#26292e":"#4a3a2e");
  if(h%3===0){const sc=ramp(SCARVES[(h>>3)%SCARVES.length]);
    p.ell(cx,47,12,4,(x,y,u)=>band(sc,.1+(u+1)*.4,x,y));p.rect(cx+3,48,4,10,sc[3]);p.dith(cx+3,48,4,10,sc[2])}
  p.rect(cx-4,38,9,10,sk[3]); p.rect(cx-4,38,3,10,sk[2]);
  if(f.female&&!(f.hat&&!photo)) p.ell(cx,31,14,19,(x,y,u)=>band(hr,.1+(u+1)*.4,x,y),(x,y)=>y>12);
  p.ell(cx,27,11,14,(x,y,u,v)=>band(sk,.05+(u+1)*.36+Math.max(0,v)*.14,x,y));
  p.rect(cx-12,25,2,5,sk[2]);p.dot(cx-12,27,sk[4]);p.rect(cx+11,25,2,5,sk[3]);p.dot(cx+12,27,sk[4]);
  p.ell(cx,18,12,7,(x,y,u)=>band(hr,.1+(u+1)*.38,x,y),(x,y)=>y<=19);
  if(f.female){p.rect(cx-12,19,3,17,hr[2]);p.rect(cx+10,19,3,17,hr[3]);p.dith(cx-9,19,18,2,hr[2])}
  else{p.rect(cx-11,18,2,6,hr[2]);p.rect(cx+10,18,2,6,hr[3])}
  p.rect(cx-8,22,4,1,hr[4]);p.rect(cx+4,22,4,1,hr[4]);
  p.rect(cx-7,24,3,1,"#d8d2c4");p.dot(cx-6,24,"#17120e");
  p.rect(cx+4,24,3,1,"#bdb6a8");p.dot(cx+5,24,"#17120e");
  p.rect(cx-7,25,3,1,sk[3]);p.rect(cx+4,25,3,1,sk[4]);
  p.line(cx+1,25,cx+1,29,sk[3]);p.dot(cx-1,29,sk[1]);p.rect(cx-1,30,3,1,sk[4]);
  p.rect(cx-3,33,7,1,shade(f.skin,-.52));p.rect(cx-2,34,5,1,sk[3]);
  p.dith(cx-9,28,3,3,sk[1]);
  if(f.beard) p.ell(cx,33,10,7,(x,y)=>((x*3+y)&1)?hr[2]:hr[3],(x,y)=>y>=30&&!(y===33&&Math.abs(x-cx)<4));
  if(f.glasses){const gc="#15120e";
    [[cx-9,cx-4],[cx+3,cx+8]].forEach(([a,b])=>{p.rect(a,23,b-a+1,1,gc);p.rect(a,27,b-a+1,1,gc);p.rect(a,23,1,5,gc);p.rect(b,23,1,5,gc);p.dot(a+1,24,"#9fb2c2")});
    p.rect(cx-3,24,6,1,gc)}
  if(f.hat&&!photo){
    if(f.female){const sc=ramp(SCARVES[h%SCARVES.length]);
      p.ell(cx,24,15,17,(x,y,u)=>band(sc,.08+(u+1)*.4,x,y),(x,y)=>y<=20||(Math.abs(x-cx)>=11&&y<=37));
      p.rect(cx-3,38,7,3,sc[2]);p.dot(cx-4,40,sc[3]);p.dot(cx+4,40,sc[3]);
      for(let x=cx-12;x<=cx+12;x+=3)p.dot(x,11+Math.round(Math.abs(x-cx)*.15),sc[0]);
    } else {const hm=ramp(HATS[h%HATS.length]);
      p.ell(cx,15,14,8,(x,y)=>((x+y*2)%3===0)?hm[1]:((x*5+y)%7===0?hm[3]:hm[2]),(x,y)=>y<=20);
      p.rect(cx-14,18,4,11,hm[2]);p.dith(cx-14,18,4,11,hm[1]);p.rect(cx+10,18,4,11,hm[3]);
      p.rect(cx-13,18,26,3,hm[1]);p.dith(cx-13,18,26,3,hm[0]);
    }
  }
  return outline(c);
}
function portraitC(f,photo){const k="pt"+JSON.stringify(f)+(photo?1:0);return CACHE[k]||(CACHE[k]=portrait(f,photo))}
function facePhoto(f){const k="fp"+JSON.stringify(f);return CACHE[k]||(CACHE[k]=photoize(portraitC(f,true),40,48,-9,-5,"#8f8f88").toDataURL())}

// ---------- Schmuggelware ----------
function lootCanvas(item){
  const key="lc"+item; if(CACHE[key]) return CACHE[key];
  const c=mk(28,18),p=P(c);
  if(/Flugbl|Zeitung|Matriz/.test(item)){for(let i=0;i<4;i++){p.rect(2+i,3+i*2,20,8,i%2?"#d9d4c4":"#ebe6d6");p.line(4+i,5+i*2,18+i,5+i*2,"#6d6a60")}p.rect(9,3,2,15,"#8e2226")}
  else if(/Dollar|Westmark/.test(item)){const col=/Dollar/.test(item)?"#5e7a52":"#5a6f8a";for(let i=0;i<3;i++)p.rect(2,4+i*3,22,6,i%2?shade(col,.15):col);p.rect(11,3,4,12,"#d9d0b0")}
  else if(/Tonb/.test(item)){for(let i=0;i<2;i++){const x=2+i*12;p.rect(x,4,11,8,"#2a2a2e");p.rect(x+1,5,9,3,"#c9c2b0");p.dot(x+3,9,"#777");p.dot(x+7,9,"#777")}}
  else if(/Jeans/.test(item)){p.rect(2,4,22,10,"#3d5a86");p.dith(2,4,22,10,"#36507a");p.line(2,8,23,8,"#c9a24a");p.rect(18,5,4,3,"#2e4568")}
  else{p.rect(2,3,22,12,"#8a6a44");p.dith(2,3,22,12,"#7a5c3a");p.line(2,9,23,9,"#d8cba4");p.line(13,3,13,14,"#d8cba4")}
  return CACHE[key]=outline(c);
}
function lootURL(item){const k="lu"+item;return CACHE[k]||(CACHE[k]=lootCanvas(item).toDataURL())}

// ---------- Gegenstände ----------
function stampSprite(col){const c=mk(40,24),p=P(c),w=ramp("#7a5634"),rr=ramp(col);
  p.ell(20,5,6,4,(x,y,u)=>band(w,.1+(u+1)*.4,x,y));
  p.rect(17,8,7,4,w[3]);p.rect(17,8,2,4,w[2]);
  for(let x=4;x<36;x++)for(let y=12;y<19;y++)p.dot(x,y,band(w,.08+(x-4)/32*.85,x,y));
  p.rect(4,12,32,1,w[0]);p.rect(4,19,32,3,rr[2]);p.rect(4,21,32,1,rr[4]);
  return outline(c).toDataURL()}
function pencilSprite(){const c=mk(60,10),p=P(c),r=ramp("#a3262b");
  for(let x=9;x<56;x++){p.dot(x,2,r[1]);p.dot(x,3,r[1]);p.dot(x,4,r[2]);p.dot(x,5,r[2]);p.dot(x,6,r[3]);p.dot(x,7,r[4])}
  p.line(9,3,55,3,r[0]);
  for(let x=2;x<9;x++){const h=Math.round((x-2)/7*3);for(let y=5-h;y<=5+h;y++)p.dot(x,y,x<4?"#2a2a2a":"#d8b98a")}
  p.rect(55,2,3,6,"#2a2a2e");
  return outline(c).toDataURL()}
function cuffsSprite(){const c=mk(38,22),p=P(c),m=PAL.metal;
  [[9,11],[29,11]].forEach(([x,y])=>{p.ell(x,y,7,8,(X,Y,u,v)=>band(m,.1+(u+v+2)*.2,X,Y));p.ell(x,y,4,5,"clear")});
  for(let x=16;x<=22;x+=2)p.rect(x,10,2,2,m[1]);
  return outline(c).toDataURL()}
function lensSprite(){const c=mk(56,56),p=P(c),b=ramp("#b08a3c");
  for(let i=0;i<14;i++)p.rect(38+i,38+i,4,4,i<3?b[3]:"#3a2618");
  p.ell(23,23,22,22,(x,y,u,v)=>band(b,.1+(u+v+2)*.2,x,y));
  p.ell(23,23,19,19,"clear");
  return outline(c).toDataURL()}
function folderSprite(){const c=mk(52,36),p=P(c),m=ramp("#b08a4a");
  p.rect(4,1,18,5,m[3]);p.rect(4,1,18,1,m[2]);
  for(let y=4;y<35;y++)for(let x=1;x<51;x++)p.dot(x,y,band(m,.06+(y-4)/31*.8,x,y));
  p.rect(1,4,50,1,m[0]);p.rect(14,13,24,10,"#e2dac6");
  p.line(26,24,26,34,"#7a1c20");p.ell(26,30,2,2,"#7a1c20");
  return outline(c).toDataURL()}
function slotSprite(){const c=mk(94,16),p=P(c),m=PAL.metal;
  for(let y=1;y<15;y++)for(let x=1;x<93;x++)p.dot(x,y,band(m,.1+(y-1)/14*.8,x,y));
  p.rect(5,5,84,7,"#101316");p.rect(5,5,84,1,"#050607");
  return outline(c).toDataURL()}
function suitcaseSprite(){const c=mk(58,44),p=P(c),l=ramp("#6b3f22");
  p.rect(22,2,14,2,l[4]);p.rect(22,2,2,7,l[4]);p.rect(34,2,2,7,l[4]);
  for(let y=8;y<42;y++)for(let x=2;x<56;x++)p.dot(x,y,band(l,.06+(y-8)/34*.85,x,y));
  p.rect(2,8,54,1,l[0]);
  [13,43].forEach(x=>{p.rect(x,8,4,34,l[4]);p.rect(x,8,1,34,l[3])});
  [[2,8],[52,8],[2,38],[52,38]].forEach(([x,y])=>{p.rect(x,y,4,4,"#b0903e");p.dot(x,y,"#e0c36a")});
  p.line(2,24,55,24,l[4]);
  return outline(c).toDataURL()}
function screwSprite(scr){const c=mk(16,16),p=P(c),m=PAL.metal;
  p.ell(7,7,6,6,(x,y,u,v)=>band(m,.1+(u+v+2)*.2,x,y));
  p.line(4,10,10,4,"#26292c");p.line(5,10,10,5,"#4a5056");
  if(scr){[[2,5],[3,4],[11,10],[12,9],[9,13]].forEach(([x,y])=>p.dot(x,y,"#ffffff"))}
  return outline(c).toDataURL()}
function leverSprite(){const c=mk(12,46),p=P(c),r=ramp("#8e2226");
  for(let y=1;y<38;y++)for(let x=4;x<8;x++)p.dot(x,y,r[x-3]);
  p.rect(1,38,8,3,r[2]);p.rect(1,41,3,3,r[3]);p.rect(1,38,8,1,r[1]);p.rect(4,1,4,2,r[0]);
  return outline(c).toDataURL()}
function patchSprite(){const c=mk(30,20),p=P(c);p.dith(0,0,30,20,"rgba(255,255,255,.22)");return c.toDataURL()}

const CREST=["......g.g......",".....ggggg.....","g...ggg.ggg...g","gg..ggggggg..gg","ggg.ggggggg.ggg",
  ".ggggggggggggg.","..ggggggggggg..","....ggggggg....",".....ggggg.....",".....gg.gg.....","....gg...gg...."];
const TOOL_ICONS={
  lamp:()=>fromMap(["...........yy.","..........yyy.",".kkkkkkkhhyyy.","kmmmmmmmhhyyy.","kMMMMMMMhhyyy.",".kkkkkkkhhyyy.","..........yyy.","...........yy."],
    {k:"#1f2226",m:"#9aa2a8",M:"#6c747a",h:"#c9a84f",y:"#f0e2a0"}),
  knock:()=>fromMap(["...sssss...","..sSsSsSs..",".ssssssss..",".sSSSSSSSs.",".sSSSSSSSs.","..sSSSSSs..","...sssss...","...ccccc...","...ccccc..."],
    {s:"#c49a7a",S:"#a77f62",c:"#3a4048"}),
  knife:()=>fromMap(["............bw","...........bw.","..........bw..",".........bw...","........bw....",".......bw.....",
    "......kk......",".....hk.......","....hh........","...hh.........","..hh.........."],{b:"#c9cfd3",w:"#f2f5f7",k:"#2a2622",h:"#6b4a2e"}),
  screw:()=>fromMap(["............g","...........g.","..........g..",".........g...","........g....",".......rr....",
    "......rrr....",".....rrr.....","....rrr......","...rr........"],{g:"#aab2b8",r:"#c8a234"}),
  bar:()=>fromMap(["..........RR.",".........R..R","........r....",".......r.....","......r......",".....r.......",
    "....r........","...r.........","..r..........",".rr..........","rr..........."],{r:"#8e2226",R:"#5e1517"})
};

// ---------- Szene: Blick aus dem Fenster ----------
function drawWindowScene(t){
  const box=$("window"),cv=$("winCanvas");
  const W=Math.max(100,Math.round(box.clientWidth/PXS)),H=Math.max(50,Math.round(box.clientHeight/PXS));
  cv.width=W;cv.height=H;
  const p=P(cv),R=rng(t?t.seed:3),hz=Math.round(H*.56),N=PAL.night,S=PAL.snow;
  for(let y=0;y<hz;y++){const v=y/hz*(N.length-1),i=Math.floor(v),f=v-i;p.rect(0,y,W,1,N[i]);if(i+1<N.length&&f>.5)p.dith(0,y,W,1,N[i+1],y)}
  for(let i=0;i<6;i++){const cx=Math.round(R()*W),cy=Math.round(R()*hz*.5),rx=10+Math.round(R()*26);
    p.ell(cx,cy,rx,3,(x,y)=>((x+y)&1)?null:N[N.length-1])}
  for(let x=0;x<W;x++){const th=3+Math.round(2.5+Math.sin(x*.9)*1.5+Math.sin(x*.31)*2.2+(x%6===0?3:0));p.rect(x,hz-th,1,th+1,PAL.tree)}
  for(let y=hz;y<H;y++){const v=(y-hz)/(H-hz),i=v<.18?4:v<.4?3:v<.7?2:1;p.rect(0,y,W,1,S[i]);if(((v*10)%1)>.7&&i>1)p.dith(0,y,W,1,S[i-1],y)}
  for(let y=hz+2;y<H;y++){const s=(y-hz)/(H-hz),c=Math.round(W*.42),off=Math.round(6+s*24);
    [c-off,c-off+1,c+off,c+off-1].forEach(x=>p.dot(x,y,S[4]))}
  for(let x=2;x<W;x+=8)p.rect(x,hz-7,1,8,"#0b0f14");
  [hz-6,hz-4,hz-2].forEach(yy=>{for(let x=0;x<W;x++)if((x+yy)%3)p.dot(x,yy,"#232b35")});
  // Wachturm mit Suchscheinwerfer
  const tx=Math.round(W*.22),ty=hz-26;
  p.line(tx,hz,tx+3,ty+8,"#06090d");p.line(tx+12,hz,tx+9,ty+8,"#06090d");
  p.line(tx+1,hz-6,tx+11,hz-6,"#06090d");p.line(tx+2,hz-12,tx+10,hz-12,"#06090d");p.line(tx+1,hz-6,tx+10,hz-12,"#06090d");
  p.rect(tx-1,ty,15,9,"#080b10");p.rect(tx-3,ty-2,19,2,"#06090d");p.rect(tx+5,ty-5,3,3,"#06090d");
  p.rect(tx+2,ty+3,3,3,"#c7ad62");p.rect(tx+8,ty+3,3,3,"#3a3520");
  for(let i=0;i<60;i++){const y=ty+1+Math.round(i*.18),x=tx+14+i,s=1+Math.floor(i/8);
    for(let d=-s;d<=s;d++)if(((x+y+d)&1)===0)p.dot(x,y+d,"rgba(200,205,180,.10)")}
  // Laterne
  const lx=Math.round(W*.9),ly=Math.round(hz*.35);
  for(let y=ly+2;y<H;y++){const hw=Math.round((y-ly)*.45);for(let x=-hw;x<=hw;x++){const a=Math.abs(x)/Math.max(1,hw);
    if(a<.55||(((x+y)&1)===0&&a<.9))p.dot(lx+x,y,y<hz?"rgba(230,208,140,.10)":"rgba(230,208,140,.16)")}}
  p.rect(lx,ly,1,hz+4-ly,"#0a0d11");p.rect(lx-3,ly-1,7,2,"#0a0d11");p.rect(lx-2,ly+1,5,1,PAL.lamp);
  p.ell(lx,ly+2,4,2,(x,y)=>((x+y)&1)?"rgba(230,208,140,.35)":null);
  // Schlagbaum
  const by=hz+3,bx=Math.round(W*.5);
  p.rect(bx-2,by-2,4,9,"#0b0e12");p.rect(bx-3,by+6,6,2,"#0b0e12");
  for(let i=0;i<Math.round(W*.42);i++){const c=Math.floor(i/5)%2?"#b9b4a8":"#8e2226";p.dot(bx+2+i,by,c);p.dot(bx+2+i,by+1,shade(c,-.3))}
  // Auto und Person
  let carHit=null,manHit=null;
  if(t){
    const spr=carSprite(t.car.model,t.car.color,true),cx=Math.round(W*.02),cy=Math.round(hz+(H-hz)*.42)-38;
    p.g.drawImage(spr,cx,cy);carHit=[cx,cy+8,spr.width,spr.height-10];
    const man=portraitC(t.face,false),mx=Math.round(W*.66)-29,my=H-man.height+4;
    p.g.drawImage(man,mx,my);manHit=[mx+4,my,man.width-8,man.height-4];
  }
  // Reif an den Ecken, Spiegelung, Rahmen
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=Math.min(x,W-1-x),dy=Math.min(y,H-1-y),d=Math.min(dx+dy*1.6,dx*1.6+dy);
    if(d<14){const n=R();if(n<(1-d/14)*.55)p.dot(x,y,n<.15?"rgba(225,235,245,.55)":"rgba(190,205,220,.28)")}}
  for(let i=0;i<Math.min(W,H)*.8;i++){p.dot(Math.round(W*.72)+i,i,"rgba(170,190,210,.10)");p.dot(Math.round(W*.76)+i,i,"rgba(170,190,210,.07)")}
  p.rect(0,0,W,3,"#140f0b");p.rect(0,H-3,W,3,"#140f0b");p.rect(0,0,3,H,"#140f0b");p.rect(W-3,0,3,H,"#140f0b");
  p.rect(3,3,W-6,1,"#2c2118");p.rect(3,3,1,H-6,"#2c2118");
  const setHit=(el,h)=>{if(!h){el.style.display="none";return}el.style.display="";
    el.style.left=h[0]/W*100+"%";el.style.top=h[1]/H*100+"%";el.style.width=h[2]/W*100+"%";el.style.height=h[3]/H*100+"%"};
  setHit($("carView"),carHit); setHit($("traveler"),manHit);
  resizeSnow(W,H);
}

// ---------- Fallender Schnee ----------
const SNOW={fl:[],W:0,H:0,run:false,last:0};
const reduceMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function resizeSnow(W,H){
  const cv=$("snowCanvas");cv.width=W;cv.height=H;SNOW.W=W;SNOW.H=H;
  SNOW.fl=Array.from({length:Math.round(W*H/70)},()=>({x:Math.random()*W,y:Math.random()*H,v:.15+Math.random()*.35,s:Math.random()<.2?2:1,ph:Math.random()*6}));
  if(reduceMotion()) snowFrame(0,false); else if(!SNOW.run){SNOW.run=true;requestAnimationFrame(snowLoop)}
}
function snowFrame(now,move){
  const g=$("snowCanvas").getContext("2d");g.clearRect(0,0,SNOW.W,SNOW.H);
  for(const f of SNOW.fl){
    if(move){f.y+=f.v;f.x+=Math.sin(now/900+f.ph)*.15;if(f.y>SNOW.H){f.y=-1;f.x=Math.random()*SNOW.W}}
    g.fillStyle=f.s>1?"rgba(220,228,236,.85)":"rgba(200,210,222,.6)";g.fillRect(Math.round(f.x),Math.round(f.y),f.s>1?2:1,1)}
}
function snowLoop(now){if(now-SNOW.last>60){SNOW.last=now;snowFrame(now,true)}requestAnimationFrame(snowLoop)}

// ---------- Wand, Uhr, Tischlicht ----------
function drawWall(){
  const box=$("wall"),cv=$("wallCanvas"),W=Math.max(20,Math.round(box.clientWidth/PXS)),H=Math.max(20,Math.round(box.clientHeight/PXS));
  cv.width=W;cv.height=H;const p=P(cv),R=rng(77),base="#3c4a42",ws=Math.round(H*.62);
  for(let y=0;y<ws;y++)for(let x=0;x<W;x++){const n=R();p.dot(x,y,n<.06?shade(base,-.12):n>.97?shade(base,.08):base)}
  p.ell(Math.round(W*.7),Math.round(H*.1),7,5,(x,y)=>((x+y)&1)?shade(base,-.2):null);
  p.line(Math.round(W*.2),0,Math.round(W*.26),Math.round(H*.18),shade(base,-.3));
  for(let y=ws;y<H;y++)for(let x=0;x<W;x++){const pl=Math.floor(x/7),col=x%7===0?"#1e140c":(pl%2?"#3b2919":"#36251a");
    p.dot(x,y,((x*7+y*3)%11===0)?shade(col,-.15):col)}
  p.rect(0,ws,W,2,"#4a3422");p.rect(0,ws+2,W,1,"#1e140c");
}
function drawClock(min){
  const cv=$("clockCanvas"),p=P(cv);p.g.clearRect(0,0,34,34);
  p.ell(17,17,16,16,"#1c1612");p.ell(17,17,14,14,"#3a2f25");
  p.ell(17,17,12,12,(x,y,u,v)=>(u+v<-.7)?"#e3dccb":"#cfc7b2");
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=17+Math.round(Math.sin(a)*10),y=17-Math.round(Math.cos(a)*10);
    p.dot(x,y,"#14110d");if(i%3===0)p.dot(17+Math.round(Math.sin(a)*9),17-Math.round(Math.cos(a)*9),"#14110d")}
  const h=(Math.floor(min/60)%12+min%60/60)/12*Math.PI*2,m=(min%60)/60*Math.PI*2;
  p.line(17,17,17+Math.round(Math.sin(h)*6),17-Math.round(Math.cos(h)*6),"#14110d");
  p.line(17,17,17+Math.round(Math.sin(m)*9),17-Math.round(Math.cos(m)*9),"#14110d");
  p.dot(17,17,"#a3262b");p.dot(11,10,"#f4efe2");p.dot(12,9,"#f4efe2");
}
function drawDeskLight(){
  const d=$("desk"),cv=$("deskLight"),W=Math.max(10,Math.round(d.clientWidth/PXS)),H=Math.max(10,Math.round(d.clientHeight/PXS));
  cv.width=W;cv.height=H;const p=P(cv),cx=W*.48,cy=H*.55,rx=W*.42,ry=H*.6;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dd=((x-cx)/rx)**2+((y-cy)/ry)**2;
    if(dd<.35){if(((x+y)&1)===0)p.dot(x,y,"rgba(255,210,140,.10)")}
    else if(dd<1){if((x+y)%3===0)p.dot(x,y,"rgba(255,210,140,.06)")}
    else if(dd>1.6)p.dot(x,y,(x+y)&1?"rgba(0,0,0,.35)":"rgba(0,0,0,.22)");
    else if(dd>1.2&&((x+y)&1))p.dot(x,y,"rgba(0,0,0,.18)")}
}

// ---------- Szene: draußen ----------
function drawOutBg(){
  const cv=$("outBg"),W=Math.max(100,Math.round(innerWidth/PXS)),H=Math.max(80,Math.round(innerHeight/PXS));
  cv.width=W;cv.height=H;const p=P(cv),R=rng(21),hz=Math.round(H*.36),N=PAL.night,S=PAL.snow;
  for(let y=0;y<hz;y++){const v=y/hz*(N.length-1),i=Math.floor(v),f=v-i;p.rect(0,y,W,1,N[i]);if(i+1<N.length&&f>.5)p.dith(0,y,W,1,N[i+1],y)}
  for(let x=0;x<W;x++){const th=3+Math.round(2.5+Math.sin(x*.7)*1.5+Math.sin(x*.27)*2.4+(x%7===0?3:0));p.rect(x,hz-th,1,th+1,PAL.tree)}
  for(let y=hz;y<H;y++){const v=(y-hz)/(H-hz),i=v<.12?4:v<.3?3:v<.6?2:1;p.rect(0,y,W,1,S[i]);if(((v*12)%1)>.7&&i>1)p.dith(0,y,W,1,S[i-1],y)}
  const hw=Math.round(W*.1);
  for(let y=hz-34;y<H;y++)for(let x=0;x<hw;x++)p.dot(x,y,x%6===0?"#160f09":((x*3+y)%13===0?"#2a1d12":"#24180f"));
  p.rect(Math.round(hw*.3),hz-22,10,8,"#d8b46a");p.rect(Math.round(hw*.3)+4,hz-22,1,8,"#3a2a18");p.rect(Math.round(hw*.3),hz-18,10,1,"#3a2a18");
  for(let y=hz;y<hz+30;y++)for(let x=hw;x<hw+30;x++)if(((x+y)&1)===0&&(x-hw)+(y-hz)*.6<28)p.dot(x,y,"rgba(216,180,106,.12)");
  const lx=Math.round(W*.86),ly=Math.round(hz*.4);
  for(let y=ly+2;y<H;y++){const w=Math.round((y-ly)*.5);for(let x=-w;x<=w;x++){const a=Math.abs(x)/Math.max(1,w);
    if(a<.5||(((x+y)&1)===0&&a<.9))p.dot(lx+x,y,"rgba(230,208,140,.12)")}}
  p.rect(lx,ly,1,H-ly,"#0a0d11");p.rect(lx-3,ly-1,7,2,"#0a0d11");p.rect(lx-2,ly+1,5,1,PAL.lamp);
  for(let i=0;i<W*H/90;i++)p.dot(Math.floor(R()*W),Math.floor(R()*H),"rgba(210,218,228,.6)");
}

// ---------- Start ----------
function initPixel(){
  const st=document.documentElement.style;
  st.setProperty("--paperTex",`url(${noiseTile("#cfc6aa",.07,2)})`);
  st.setProperty("--passTex",`url(${passTile()})`);
  st.setProperty("--coverTex",`url(${noiseTile("#5a1a1e",.18,3)})`);
  st.setProperty("--woodTex",`url(${woodTile()})`);
  st.setProperty("--vinylTex",`url(${noiseTile("#3a3632",.12,4)})`);
  st.setProperty("--metalTex",`url(${metalTile()})`);
  Object.assign(SPR,{crest:fromMap(CREST,{g:"#cdb26a"},false).toDataURL(),screw:screwSprite(false),screwX:screwSprite(true),
    lever:leverSprite(),patch:patchSprite()});
  const bg=(sel,url)=>{document.querySelector(sel).style.backgroundImage=`url(${url})`};
  bg("#folder",folderSprite());bg("#pencil",pencilSprite());bg("#cuffs",cuffsSprite());bg("#lens",lensSprite());
  bg("#slot",slotSprite());bg(".stamp.ok",stampSprite("#3f7a46"));bg(".stamp.no",stampSprite("#a3262b"));bg("#suitcase",suitcaseSprite());
  document.querySelectorAll(".tooli").forEach(el=>{const ic=TOOL_ICONS[el.dataset.tool](),img=document.createElement("img");
    img.className="px";img.src=ic.toDataURL();img.alt="";img.style.width=ic.width*3+"px";img.style.height=ic.height*3+"px";el.prepend(img)});
  drawWall(); drawDeskLight(); drawWindowScene(null); drawClock(DAY_START);
}
