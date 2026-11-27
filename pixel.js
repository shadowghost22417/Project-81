// Pixel-Grafik: Farben, Zeichenwerkzeuge, Sprites und Szenen
const PXS=3;               // Bildschirmpixel pro Spielpixel
const CACHE={}, SPR={};

// ---------- Farben ----------
function hex2rgb(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function rgb2hex(r,g,b){const c=v=>Math.max(0,Math.min(255,Math.round(v)));return"#"+((1<<24)|(c(r)<<16)|(c(g)<<8)|c(b)).toString(16).slice(1)}
function shade(h,f){const[r,g,b]=hex2rgb(h),t=f<0?0:255,a=Math.abs(f);return rgb2hex(r+(t-r)*a,g+(t-g)*a,b+(t-b)*a)}
function ramp(c){return[shade(c,.38),shade(c,.16),c,shade(c,-.24),shade(c,-.46)]}
function band(r,v,x,y){const s=[.14,.32,.66,.84];let i=0;while(i<4&&v>s[i])i++;if(i<4&&s[i]-v<.05&&((x+y)&1))i++;return r[Math.min(i,4)]}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// Gedämpfte, kalte Palette: Beton, Smog, Matsch, Natriumlicht
const PAL={ink:"#0b0b0a",tree:"#0c0e0d",lamp:"#d0a456",
  night:["#0a0c0b","#0e100f","#121512","#161a16","#1b1f1a","#20251f","#252a23"],
  snow:["#6c7068","#5b5f57","#4a4e47","#3c3f39","#2f322d"],
  chrome:["#b9bbb2","#8a8d85","#55584f"],metal:["#a9aca3","#8a8d85","#6c6f68","#50534d","#363833"]};
const SCARVES=["#4a2a27","#363d45","#4a463a","#2e3a31"], HATS=["#2e2822","#242320","#3a332a"];
function mix(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return rgb2hex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)}
function mute(c,t=.45){const[r,g,b]=hex2rgb(c),l=r*.3+g*.59+b*.11;return mix(c,rgb2hex(l*.96,l,l*.9),t)}
function gramp(c){return[shade(c,.26),shade(c,.08),c,shade(c,-.32),shade(c,-.6)]}

// ---------- Zeichenwerkzeuge ----------
function mk(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c}
function P(c){
  const g=c.getContext("2d"),W=c.width,H=c.height;
  const o={g,W,H,
    dot(x,y,col){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;g.fillStyle=col;g.fillRect(x,y,1,1)},
    clr(x,y){g.clearRect(Math.round(x),Math.round(y),1,1)},
    rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))},
    dith(x,y,w,h,col){for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(((x+i+y+j)&1)===0)o.dot(x+i,y+j,col)},
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
function photoize(src,w,h,ox,oy,bg){
  const c=mk(w,h),g=c.getContext("2d");g.fillStyle=bg;g.fillRect(0,0,w,h);g.drawImage(src,ox,oy);
  const d=g.getImageData(0,0,w,h),a=d.data,R=rng(w*31+h);
  for(let i=0;i<a.length;i+=4){let v=a[i]*.3+a[i+1]*.59+a[i+2]*.11;v=(v-110)*1.3+120+(R()-.5)*26;
    v=Math.round(Math.max(10,Math.min(235,v))/22)*22;a[i]=a[i+1]=a[i+2]=v;a[i+3]=255}
  g.putImageData(d,0,0); return c;
}
// Himmel und Schnee mit sauberen Übergängen (Schachbrett-Dithering nur an Bandgrenzen)
function drawSky(p,W,hz){const N=PAL.night;
  for(let y=0;y<hz;y++){const v=y/hz*(N.length-1),i=Math.floor(v),f=v-i;p.rect(0,y,W,1,N[i]);if(i+1<N.length&&f>.6)p.dith(0,y,W,1,N[i+1])}}
function drawGround(p,W,H,hz,stops){const S=PAL.snow;
  const bandAt=y=>{const v=(y-hz)/Math.max(1,H-hz);return v<stops[0]?4:v<stops[1]?3:v<stops[2]?2:1};
  for(let y=hz;y<H;y++){const i=bandAt(y);p.rect(0,y,W,1,S[i]);if(y>hz&&bandAt(y-1)!==i)p.dith(0,y,W,2,S[bandAt(y-1)])}}

// Plattenbauten am Horizont, fast alle Fenster dunkel
function drawBlocks(p,W,base,R,scale){
  let x=-Math.round(R()*20);
  while(x<W){const bw=Math.round((18+R()*36)*scale),bh=Math.round((10+R()*24)*scale),top=base-bh,col=R()<.5?"#151816":"#191c19";
    p.rect(x,top,bw,bh+1,col);p.rect(x,top,bw,1,"#222622");
    for(let wy=top+2;wy<base-1;wy+=3){p.rect(x,wy+1,bw,1,shade(col,-.15));
      for(let wx=x+2;wx<x+bw-1;wx+=3){const n=R();p.dot(wx,wy,n<.05?(n<.015?"#8f8251":"#5a553c"):"#0d0f0d")}}
    x+=bw+Math.round(R()*12);
  }
}
function drawFog(p,W,y0,y1){for(let y=y0;y<y1;y++){const a=(y-y0)/(y1-y0);for(let x=0;x<W;x++)if(((x+y)&1)===0&&((x*7+y*3)%5)<a*5)p.dot(x,y,"rgba(120,126,112,.12)")}}
// Betonmauer mit Rohr und Stacheldraht; y0 = Unterkante
function drawConcreteWall(p,W,y0,h){const top=y0-h;
  for(let x=0;x<W;x++){const seg=x%14,col=seg===0?"#1f211d":seg<2?"#575a52":"#464942";p.rect(x,top+2,1,h-2,col);
    if((x*7)%13===0)p.dot(x,top+3+(x%3),"#383b35");if((x*5)%11===0)p.dot(x,y0-2,"#2f322c")}
  p.rect(0,top,W,1,"#62655c");p.rect(0,top+1,W,1,"#373a34");
  for(let x=0;x<W;x++){if(x%5===0)p.dot(x,top-3,"#1e201c");p.dot(x,top-2+((x>>1)&1),"#262924")}
}

// ---------- Kacheln ----------
function noiseTile(base,amt,seed){const c=mk(24,24),p=P(c),R=rng(seed);
  for(let y=0;y<24;y++)for(let x=0;x<24;x++){const n=R();p.dot(x,y,n<.1?shade(base,-amt):n>.94?shade(base,amt*.7):base)}return c.toDataURL()}
function passTile(){const c=mk(24,24),p=P(c);
  for(let y=0;y<24;y++)for(let x=0;x<24;x++){const v=Math.sin((x+Math.sin(y*.52)*3)*.52);p.dot(x,y,v>.9?"#a9ac9a":"#bcbeac")}return c.toDataURL()}
function metalTile(){const c=mk(16,16),p=P(c),R=rng(4),m=PAL.metal;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++)p.dot(x,y,R()<.15?m[3]:(y%4===0?m[1]:m[2]));return c.toDataURL()}
function woodTile(){const c=mk(48,24),p=P(c),R=rng(3),cols=["#2c2822","#28241f","#302b25"];
  for(let y=0;y<24;y++){const pl=Math.floor(y/8),base=cols[pl%3];
    for(let x=0;x<48;x++){let col=base;const gr=Math.sin((x+pl*13)*.35+y*.9)*.5+R()*.6;
      if(gr>.75)col=shade(base,-.18);else if(gr<-.2&&R()<.3)col=shade(base,.05);
      if(y%8===0)col="#141210";if(y%8===1)col=shade(base,.07);p.dot(x,y,col)}}
  p.rect(13,1,1,7,"#141210");p.rect(37,9,1,7,"#141210");p.rect(25,17,1,7,"#141210");
  p.line(4,5,11,3,"#3a362f");p.line(30,19,41,21,"#3a362f");
  return c.toDataURL()}

// ---------- Autos (Front links). zones = leuchtende Bereiche in derselben Reihenfolge wie die Bereiche in data.js ----------
const CAR_SHAPES=[
  {body:[[20,34],[20,28],[22,25],[30,23],[38,22],[44,13],[49,11],[70,11],[76,13],[82,21],[88,23],[91,26],[92,30],[92,34]],
    glass:[[[40,21],[45,14],[60,13],[60,21]],[[62,13],[70,13],[75,15],[79,21],[62,21]]],
    wheels:[[32,35,5],[79,35,5]],doors:[[39,23,32],[61,21,32]],handles:[[56,24]],
    chrome:[[17,30,6],[90,30,6]],lights:[[20,26,2,2,"#efe3a6"],[21,30,2,1,"#d99a3a"],[90,25,2,3,"#a3241f"]],
    lines:[[84,24,88,24,"#17191b"],[84,26,88,26,"#17191b"],[84,28,88,28,"#17191b"]],
    zones:[[20,21,38,34],[39,11,80,33],[81,19,93,34]]},
  {body:[[6,33],[6,25],[9,23],[30,22],[36,21],[44,12],[72,12],[80,21],[101,22],[105,24],[106,27],[106,33]],
    glass:[[[38,21],[45,13],[58,13],[58,21]],[[60,13],[71,13],[78,21],[60,21]]],
    wheels:[[24,35,6],[88,35,6]],doors:[[37,22,32],[59,21,32],[79,21,32]],handles:[[52,24],[73,24]],
    chrome:[[3,29,9],[99,29,9]],belt:[10,102,23],lights:[[6,24,2,2,"#efe3a6"],[6,27,2,1,"#efe3a6"],[104,24,2,3,"#a3241f"]],
    zones:[[4,21,36,33],[37,12,79,33],[80,20,108,33]]},
  {body:[[6,33],[6,27],[9,24],[32,22],[40,20],[52,11],[78,11],[97,17],[103,21],[106,25],[106,33]],
    glass:[[[42,20],[53,12],[64,12],[64,20]],[[66,12],[77,12],[93,18],[66,19]]],
    wheels:[[24,35,6],[88,35,6]],doors:[[41,21,32],[65,20,32],[85,19,32]],handles:[[59,23],[80,23]],
    black:[[4,29,10,3],[98,29,10,3],[14,27,80,1]],lights:[[6,25,3,2,"#ece8cf"],[104,23,2,3,"#a3241f"]],
    zones:[[4,20,40,33],[41,11,85,33],[86,16,108,33]]},
  {body:[[10,34],[10,27],[12,24],[18,21],[30,20],[37,19],[44,11],[50,9],[66,9],[73,11],[80,19],[92,20],[98,22],[102,26],[102,34]],
    glass:[[[46,18],[51,11],[58,10],[58,18]],[[60,10],[66,10],[71,12],[76,18],[60,18]]],
    wheels:[[26,35,6],[86,35,6]],doors:[[45,19,32],[59,18,32]],handles:[[53,22]],
    chrome:[[8,30,6],[98,30,6]],belt:[14,98,24],lights:[[11,24,2,2,"#efe3a6"],[100,24,2,2,"#a3241f"]],
    zones:[[8,18,44,34],[45,9,79,33],[80,18,104,34]]},
  {body:[[6,34],[6,22],[8,16],[12,11],[18,9],[30,8],[106,8],[107,10],[107,34]],
    glass:[[[8,16],[12,11],[15,11],[11,17]],[[15,18],[17,12],[29,10],[29,18]]],
    wheels:[[22,35,6],[90,35,6]],doors:[[31,9,32],[94,9,32]],handles:[[26,21],[97,20]],
    chrome:[[4,30,6],[104,30,6]],lights:[[6,23,2,2,"#efe3a6"],[105,26,2,3,"#a3241f"]],
    lines:[40,48,56,64,72,80,88].map(x=>[x,12,x,28,null]),
    zones:[[12,8,31,25],[4,26,30,34],[32,8,108,34]]}
];
function carSprite(mi,color,dim){
  const key="car"+mi+color+(dim?1:0); if(CACHE[key]) return CACHE[key];
  const S=CAR_SHAPES[mi],c=mk(116,46),p=P(c),mc=shade(mute(color,.5),-.08),r=ramp(dim?shade(mc,-.32):mc);
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
// Leuchtender Umriss eines Autoteils (für draußen)
function zoneGlow(mi,color,z,open){
  const key="zg"+mi+color+z.join(",")+(open?1:0); if(CACHE[key]) return CACHE[key];
  const src=carSprite(mi,color,false),W=src.width,H=src.height,d=src.getContext("2d").getImageData(0,0,W,H).data;
  const c=mk(W,H),p=P(c),[x0,y0,x1,y1]=z;
  const inM=(x,y)=>x>=x0&&x<=x1&&y>=y0&&y<=y1&&y<41&&d[(y*W+x)*4+3]>200;
  const edge=open?"#a9d8ee":"#f2d27a", fill=open?"rgba(160,210,240,.32)":"rgba(255,220,130,.3)";
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(!inM(x,y))continue;
    const border=!inM(x-1,y)||!inM(x+1,y)||!inM(x,y-1)||!inM(x,y+1);
    if(border)p.dot(x,y,edge);else if(((x+y)&1)===0)p.dot(x,y,fill)}
  return CACHE[key]=c.toDataURL();
}
function carPhoto(mi){
  const key="ph"+mi; if(CACHE[key]) return CACHE[key];
  const ph=photoize(carSprite(mi,"#9c9a90"),118,48,1,1,"#5e5e58");
  const c=mk(122,52),g=c.getContext("2d");g.fillStyle="#e6e1d3";g.fillRect(0,0,122,52);g.drawImage(ph,2,2);
  return CACHE[key]=c.toDataURL();
}

// ---------- Menschen ----------
function hashF(f){const s=JSON.stringify(f);let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
// Müde, ernste Gesichter mit harter Licht-von-oben-Schattierung.
// Ausdruck je Person: neutral, leicht traurig oder leicht verärgert.
// Im Fenster liegen die Augen oft im Schatten (Mütze oder Deckenlicht), auf dem Passfoto (Blitz) nie.
const USH_FUR=["#6a5e4e","#5c5850","#4a4038","#7a7266"];
function portrait(f,photo){
  const c=mk(58,68),p=P(c),h=hashF(f),cx=29,fem=f.female;
  const sk=gramp(shade(mute(mix(f.skin,"#8b9472",fem?.34:.42),.4),fem?-.04:-.08)), hr=gramp(mute(f.hair,.35)), co=gramp(shade(mute(f.coat,.5),-.12));
  const hood=f.hat&&!photo, old=!fem&&h%5<2, gaunt=!fem&&h%3!==1, bald=!fem&&h%4===0;
  const hat=hood?(fem?(h%3===0?"ushanka":"scarf"):(h%3!==0?"ushanka":"cap")):null;
  const expr=["neutral","sad","neutral","angry","neutral","sad","angry"][(h>>4)%7];
  const hairStyle=(h>>2)%3; // Frauen: 0 lang, 1 Dauerwelle, 2 Bob
  const shadowEyes=hood;
  const dark=shade(sk[4],-.4), mouth=shade(sk[4],-.25);
  // Mantel mit hängenden Schultern und hochgeschlagenem Kragen
  p.ell(cx,77,29,28,(x,y,u)=>band(co,.2+(u+1)*.34,x,y),(x,y)=>y<68);
  p.poly([[cx-6,45],[cx+6,45],[cx+1,60],[cx-1,60]],h%2?"#1d1e1b":"#2e2822");
  p.poly([[cx-6,43],[cx-16,50],[cx-13,62],[cx-3,52]],co[1]);p.line(cx-6,43,cx-16,50,co[0]);
  p.poly([[cx+6,43],[cx+16,50],[cx+13,62],[cx+3,52]],co[3]);
  if(h%3===0){const sc=gramp(mute(SCARVES[(h>>3)%SCARVES.length],.3));
    p.ell(cx,46,11,3,(x,y,u)=>band(sc,.15+(u+1)*.38,x,y));p.rect(cx+3,47,4,11,sc[3]);p.dith(cx+3,47,4,11,sc[2])}
  // Hals im Schatten des Kinns
  const nw=fem?8:10;
  p.rect(cx-nw/2,35,nw,12,sk[3]);p.rect(cx-nw/2,35,2,12,sk[2]);p.rect(cx-nw/2,36,nw,3,sk[4]);
  // Frauenhaar hinter dem Kopf
  const hairT=(x,y,u)=>band(hr,.15+(u+1)*.36,x,y), curl=(x,y,u)=>((x*3+y*2)%5<2)?hr[1]:((x+y*3)%4===0?hr[4]:band(hr,.2+(u+1)*.34,x,y));
  if(fem&&!hood){
    if(hairStyle===0) p.ell(cx,31,14,19,hairT,(x,y)=>y>12&&(y<34||Math.abs(x-cx)>7)&&y<47);
    else if(hairStyle===1) p.ell(cx,25,17,16,curl,(x,y)=>y>8&&y<41);
    else p.ell(cx,25,14,13,hairT,(x,y)=>y>11&&y<=31);
  }
  // Kopf: schmal, zum Kinn hin verjüngt
  const hy=26,rx=fem?10:11,ry=15,inHead=new Set(),taper=fem?.55:.42;
  for(let y=hy-ry;y<=hy+ry;y++){const v=(y-hy)/ry;let w=rx*Math.sqrt(Math.max(0,1-v*v));if(v>.25)w*=1-(v-.25)*taper;
    for(let x=Math.round(cx-w);x<=Math.round(cx+w);x++){const u=(x-cx)/rx;
      let t=.2+(u+1)*.34+Math.max(0,v)*.14;
      if(gaunt&&v>.12&&v<.5&&Math.abs(u)>.45&&Math.abs(u)<.85) t+=.2;
      inHead.add(y*58+x); p.dot(x,y,band(sk,t,x,y))}}
  const keepHead=(x,y)=>inHead.has(y*58+x);
  p.rect(cx-rx-1,23,2,7,sk[2]);p.dot(cx-rx-1,26,sk[4]);p.rect(cx+rx,23,2,7,sk[4]);p.dot(cx+rx+1,26,dark);
  // Licht auf Stirn und Schädel
  p.ell(cx-3,15,4,2,(x,y)=>((x+y)&1)?null:sk[0],keepHead);p.rect(cx-4,15,3,1,sk[0]);
  if(old){[17,19].forEach(y=>{for(let x=cx-5;x<=cx+3;x++)if((x+y)%3)p.dot(x,y,sk[3])})}
  // Haare vorne
  if(fem){
    if(hairStyle===1){p.ell(cx,14,13,7,curl,(x,y)=>y<=16);p.rect(cx-13,15,3,16,hr[2]);p.dith(cx-13,15,3,16,hr[1]);p.rect(cx+10,15,3,16,hr[4])}
    else{p.ell(cx,15,12,6,hairT,(x,y)=>y<=16);p.rect(cx-12,16,3,hairStyle===2?15:19,hr[2]);p.rect(cx+10,16,3,hairStyle===2?15:19,hr[4]);
      p.dith(cx-9,16,18,2,hr[2]);
      if(hairStyle===2){p.line(cx+3,10,cx+2,16,hr[4]);p.poly([[cx+3,11],[cx-11,15],[cx-11,19],[cx-4,17]],hr[1]);
        p.line(cx-13,22,cx-13,30,hr[3]);p.line(cx+12,22,cx+12,30,hr[4]);p.dot(cx-12,31,hr[2]);p.dot(cx+11,31,hr[4])}
      else{p.line(cx-11,20,cx-11,34,hr[3]);p.line(cx+11,20,cx+11,34,hr[4])}}
  }
  else if(bald){p.rect(cx-12,17,2,7,hr[3]);p.rect(cx+10,17,2,7,hr[4]);p.dith(cx-8,12,10,2,hr[3])}
  else{p.ell(cx,14,12,5,hairT,(x,y)=>y<=15);p.rect(cx-12,14,2,9,hr[2]);p.rect(cx+10,14,2,9,hr[4])}
  // Augen, Lider, Brauen (nur leicht geneigt)
  [[cx-6,1],[cx+5,-1]].forEach(([ex,s])=>{
    p.rect(ex-3,22,6,4,s>0?(fem?sk[2]:sk[3]):sk[4]);
    p.rect(ex-2,24,4,1,"#8f8c7a");p.dot(ex,24,"#0d0c0a");p.dot(ex+(s>0?1:-1),24,"#0d0c0a");
    p.rect(ex-2,23,5,1,expr==="angry"?dark:sk[4]);
    if(fem) p.dot(s>0?ex-3:ex+3,23,dark);
    // Leichte Augenringe bei allen
    const ring=mix(sk[3],"#4a4652",.3);
    p.rect(ex-2,26,5,1,ring);
    for(let x=ex-1;x<=ex+1;x++)if(!fem||(x+27)&1)p.dot(x,27,s>0?mix(sk[2],ring,.5):ring);
    const brow=fem?shade(hr[3],-.1):hr[4];
    for(let i=0;i<5;i++){const x=s>0?ex-2+i:ex+2-i;
      const y=expr==="sad"&&i>=3?20:expr==="angry"&&i>=3?22:21;
      p.dot(x,y,brow);if(!fem&&i>0&&i<4)p.dot(x,y-1,brow)}
  });
  if(expr==="angry"){p.dot(cx-1,21,sk[4]);p.dot(cx-1,22,sk[4]);p.dot(cx,22,sk[3])}
  else if(old) p.dot(cx-1,22,sk[3]);
  // Halbtransparenter Schatten: Augen bleiben schwach sichtbar, oben (unter der Krempe) am dunkelsten
  if(shadowEyes){const top=hood?17:19;
    for(let y=top;y<=26;y++)for(let x=cx-12;x<=cx+12;x++){if(!keepHead(x,y))continue;
      const a=y<=top+2?.62:y>=25?((x+y)&1?.4:0):.5;if(a)p.dot(x,y,`rgba(8,9,7,${a})`)}
    p.dot(cx-6,24,"rgba(150,148,128,.5)");p.dot(cx+5,24,"rgba(150,148,128,.35)");
  }
  // Nase mit Licht auf dem Rücken
  const ny=shadowEyes?26:23;
  p.line(cx-1,ny,cx-1,29,sk[1]);p.line(cx+1,ny+1,cx+1,30,sk[4]);p.dot(cx-1,29,sk[0]);
  p.rect(cx-2,30,4,1,sk[2]);p.rect(cx-1,31,3,1,sk[3]);p.dot(cx-2,31,dark);p.dot(cx+2,31,dark);
  // Wangenfalten und Mund
  if(fem){p.dot(cx-5,33,sk[3]);p.dot(cx+5,33,sk[4])}
  else{p.line(cx-4,31,cx-6,35,sk[3]);p.line(cx+4,31,cx+6,35,sk[4])}
  const lip=fem?mix(sk[3],"#6e3432",.5):sk[3], lipLo=fem?mix(sk[2],"#7a4a44",.4):sk[1];
  if(expr==="sad"){p.rect(cx-2,33,5,1,lip);p.rect(cx-2,34,5,1,mouth);p.dot(cx-3,35,mouth);p.dot(cx+3,35,mouth);p.rect(cx-1,35,3,1,lipLo)}
  else if(expr==="angry"){p.rect(cx-3,33,7,1,fem?lip:sk[4]);p.rect(cx-3,34,7,1,mouth);p.rect(cx-1,35,3,1,fem?lipLo:sk[3])}
  else{p.rect(cx-2,33,5,1,lip);p.rect(cx-3,34,7,1,mouth);p.rect(cx-2,35,5,1,lipLo)}
  p.dot(cx-1,38,sk[1]);
  if(f.beard) p.ell(cx,35,11,7,(x,y)=>((x*3+y)&1)?hr[3]:hr[4],(x,y)=>keepHead(x,y)&&y>=31&&!(y===34&&Math.abs(x-cx)<4));
  else if(!fem&&h%3===0) p.ell(cx,36,10,6,(x,y)=>((x*3+y*5)%4===0)?shade(hr[3],-.1):null,(x,y)=>keepHead(x,y)&&y>=32&&!(y>=33&&y<=35&&Math.abs(x-cx)<5));
  if(f.glasses){const gc="#0f0e0c";
    [[cx-9,cx-3],[cx+2,cx+8]].forEach(([a,b])=>{p.rect(a,22,b-a+1,1,gc);p.rect(a,26,b-a+1,1,gc);p.rect(a,22,1,5,gc);p.rect(b,22,1,5,gc);
      // Leichter Glanz auf dem Glas
      for(let y=23;y<=25;y++)for(let x=a+1;x<b;x++)p.dot(x,y,"rgba(200,210,200,.14)");
      const k=a<cx?.6:.35;p.dot(a+3,23,`rgba(235,240,228,${k})`);p.dot(a+2,24,`rgba(235,240,228,${k})`);p.dot(a+1,25,`rgba(235,240,228,${k*.5})`)});
    p.rect(cx-3,23,5,1,gc)}
  // Kopfbedeckungen
  if(hat==="scarf"){const sc=gramp(mute(SCARVES[h%SCARVES.length],.3));
    p.ell(cx,24,15,17,(x,y,u)=>band(sc,.15+(u+1)*.36,x,y),(x,y)=>y<=19||(Math.abs(x-cx)>=11&&y<=37));
    p.rect(cx-3,38,7,3,sc[2]);p.dot(cx-4,40,sc[3]);p.dot(cx+4,40,sc[3]);
    for(let x=cx-12;x<=cx+12;x+=3)p.dot(x,11+Math.round(Math.abs(x-cx)*.15),sc[1]);
  } else if(hat==="cap"){const hm=gramp(HATS[h%HATS.length]);
    p.ell(cx,15,13,6,(x,y,u)=>band(hm,.15+(u+1)*.36,x,y),(x,y)=>y<=18);
    p.rect(cx-14,18,24,2,hm[3]);p.rect(cx-14,18,24,1,hm[2]);
  } else if(hat==="ushanka"){
    // Uschanka: Stoffkrone, dicker Fellrand, Ohrenklappen (manchmal hochgebunden)
    const hm=gramp(fem?mute(["#4a3a2c","#3a3530","#55493c"][h%3],.3):HATS[h%HATS.length]);
    const fur=gramp(USH_FUR[(h>>2)%USH_FUR.length]), flapsUp=(h>>5)%3===0;
    const FR=rng(h);const furPx=(x,y,base)=>{const n=FR();return n<.12?fur[0]:n<.3?fur[1]:n>.86?fur[4]:n>.72?fur[3]:band(fur,base,x,y)};
    if(fem&&!flapsUp){p.rect(cx-11,26,2,10,hr[2]);p.rect(cx+9,26,2,10,hr[4])}
    p.ell(cx,12,12,7,(x,y,u)=>band(hm,.2+(u+1)*.34,x,y),(x,y)=>y<=14);
    p.line(cx-1,6,cx-1,13,hm[3]);p.line(cx+5,7,cx+6,13,hm[3]);
    const flapBot=flapsUp?23:33;
    for(let y=15;y<=flapBot;y++)for(const [x0,x1,sh] of [[cx-15,cx-11,.25],[cx+10,cx+14,.7]]){
      for(let x=x0;x<=x1;x++){if(y>=flapBot-1&&(x===x0||x===x1))continue;p.dot(x,y,furPx(x,y,sh))}}
    if(!flapsUp){p.line(cx-13,flapBot+1,cx-12,flapBot+5,"#1c1a17");p.line(cx+12,flapBot+1,cx+13,flapBot+5,"#1c1a17")}
    for(let y=13;y<=19;y++)for(let x=cx-14;x<=cx+14;x++){if((y===19&&FR()<.5)||(y===13&&FR()<.4))continue;
      p.dot(x,y,furPx(x,y,.15+((x-cx)/14+1)*.34+(y-13)*.03))}
    if(flapsUp){p.rect(cx-6,10,12,1,"#1c1a17");p.dot(cx,11,"#1c1a17")}
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
function stampSprite(col){const c=mk(40,24),p=P(c),w=ramp("#5c4a38"),rr=ramp(col);
  p.ell(20,5,6,4,(x,y,u)=>band(w,.1+(u+1)*.4,x,y));
  p.rect(17,8,7,4,w[3]);p.rect(17,8,2,4,w[2]);
  for(let x=4;x<36;x++)for(let y=12;y<19;y++)p.dot(x,y,band(w,.08+(x-4)/32*.85,x,y));
  p.rect(4,12,32,1,w[0]);p.rect(4,19,32,3,rr[2]);p.rect(4,21,32,1,rr[4]);
  return outline(c).toDataURL()}
function pencilSprite(){const c=mk(60,10),p=P(c),r=ramp("#8a2a25");
  for(let x=9;x<56;x++){p.dot(x,2,r[1]);p.dot(x,3,r[1]);p.dot(x,4,r[2]);p.dot(x,5,r[2]);p.dot(x,6,r[3]);p.dot(x,7,r[4])}
  p.line(9,3,55,3,r[0]);
  for(let x=2;x<9;x++){const h=Math.round((x-2)/7*3);for(let y=5-h;y<=5+h;y++)p.dot(x,y,x<4?"#2a2a2a":"#d8b98a")}
  p.rect(55,2,3,6,"#2a2a2e");
  return outline(c).toDataURL()}
function cuffsSprite(){const c=mk(38,22),p=P(c),m=PAL.metal;
  [[9,11],[29,11]].forEach(([x,y])=>{p.ell(x,y,7,8,(X,Y,u,v)=>band(m,.1+(u+v+2)*.2,X,Y));p.ell(x,y,4,5,"clear")});
  for(let x=16;x<=22;x+=2)p.rect(x,10,2,2,m[1]);
  return outline(c).toDataURL()}
function lensSprite(){const c=mk(56,56),p=P(c),b=ramp("#857048");
  for(let i=0;i<14;i++)p.rect(38+i,38+i,4,4,i<3?b[3]:"#3a2618");
  p.ell(23,23,22,22,(x,y,u,v)=>band(b,.1+(u+v+2)*.2,x,y));
  p.ell(23,23,19,19,"clear");
  return outline(c).toDataURL()}
function folderSprite(){const c=mk(52,36),p=P(c),m=ramp("#857552");
  p.rect(4,1,18,5,m[3]);p.rect(4,1,18,1,m[2]);
  for(let y=4;y<35;y++)for(let x=1;x<51;x++)p.dot(x,y,band(m,.06+(y-4)/31*.8,x,y));
  p.rect(1,4,50,1,m[0]);p.rect(14,13,24,10,"#b9b29a");
  p.line(26,24,26,34,"#5e2420");p.ell(26,30,2,2,"#5e2420");
  return outline(c).toDataURL()}
function slotSprite(){const c=mk(94,16),p=P(c),m=PAL.metal;
  for(let y=1;y<15;y++)for(let x=1;x<93;x++)p.dot(x,y,band(m,.1+(y-1)/14*.8,x,y));
  p.rect(5,5,84,7,"#101316");p.rect(5,5,84,1,"#050607");
  return outline(c).toDataURL()}
function suitcaseSprite(){const c=mk(58,44),p=P(c),l=ramp("#4f3d2c");
  p.rect(22,2,14,2,l[4]);p.rect(22,2,2,7,l[4]);p.rect(34,2,2,7,l[4]);
  for(let y=8;y<42;y++)for(let x=2;x<56;x++)p.dot(x,y,band(l,.06+(y-8)/34*.85,x,y));
  p.rect(2,8,54,1,l[0]);
  [13,43].forEach(x=>{p.rect(x,8,4,34,l[4]);p.rect(x,8,1,34,l[3])});
  [[2,8],[52,8],[2,38],[52,38]].forEach(([x,y])=>{p.rect(x,y,4,4,"#8a7a4e");p.dot(x,y,"#b5a46e")});
  p.line(2,24,55,24,l[4]);
  return outline(c).toDataURL()}
function screwSprite(scr){const c=mk(16,16),p=P(c),m=PAL.metal;
  p.ell(7,7,6,6,(x,y,u,v)=>band(m,.1+(u+v+2)*.2,x,y));
  p.line(4,10,10,4,"#26292c");p.line(5,10,10,5,"#4a5056");
  if(scr){[[2,5],[3,4],[11,10],[12,9],[9,13]].forEach(([x,y])=>p.dot(x,y,"#ffffff"))}
  return outline(c).toDataURL()}
function leverSprite(){const c=mk(12,46),p=P(c),r=ramp("#6e2a24");
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
  drawSky(p,W,hz);
  for(let i=0;i<7;i++){const cx=Math.round(R()*W),cy=Math.round(R()*hz*.55),rx=14+Math.round(R()*30);
    p.ell(cx,cy,rx,2,(x,y)=>((x+y)&1)?null:N[N.length-1])}
  drawBlocks(p,W,hz-6,rng(11),1);
  drawFog(p,W,hz-14,hz);
  drawGround(p,W,H,hz,[.18,.4,.7]);
  for(let y=hz+2;y<H;y++){const s=(y-hz)/(H-hz),c=Math.round(W*.42),off=Math.round(6+s*24);
    [c-off,c-off+1,c+off,c+off-1].forEach(x=>p.dot(x,y,S[4]))}
  drawConcreteWall(p,W,hz+1,8);
  // Wachturm aus Beton
  const tx=Math.round(W*.22),ty=hz-30;
  p.rect(tx+4,ty+9,5,hz-ty-9,"#33362f");p.rect(tx+4,ty+9,1,hz-ty-9,"#4a4d45");
  p.rect(tx-2,ty,17,10,"#3f423b");p.rect(tx-2,ty,1,10,"#555850");
  p.rect(tx,ty+3,13,3,"#0b0c0b");p.rect(tx+2,ty+3,3,3,"#8a7c4c");
  p.rect(tx-4,ty-2,21,2,"#2a2c27");p.rect(tx+6,ty-5,2,3,"#1c1e1a");
  for(let i=0;i<70;i++){const y=ty+2+Math.round(i*.2),x=tx+15+i,s=1+Math.floor(i/9);
    for(let d=-s;d<=s;d++)if(((x+y+d)&1)===0)p.dot(x,y+d,"rgba(190,190,165,.07)")}
  // Natriumlampe
  const lx=Math.round(W*.9),ly=Math.round(hz*.35);
  for(let y=ly+2;y<H;y++){const hw=Math.round((y-ly)*.42);for(let x=-hw;x<=hw;x++){const a=Math.abs(x)/Math.max(1,hw);
    if(a<.5||(((x+y)&1)===0&&a<.85))p.dot(lx+x,y,y<hz?"rgba(208,164,86,.07)":"rgba(208,164,86,.12)")}}
  p.rect(lx,ly,1,hz+4-ly,"#141613");p.rect(lx-3,ly-1,7,2,"#141613");p.rect(lx-2,ly+1,5,1,PAL.lamp);
  p.ell(lx,ly+2,4,2,(x,y)=>((x+y)&1)?"rgba(208,164,86,.3)":null);
  const by=hz+3,bx=Math.round(W*.5);
  p.rect(bx-2,by-2,4,9,"#141613");p.rect(bx-3,by+6,6,2,"#141613");
  for(let i=0;i<Math.round(W*.42);i++){const c=Math.floor(i/5)%2?"#8d8b80":"#6a2a24";p.dot(bx+2+i,by,c);p.dot(bx+2+i,by+1,shade(c,-.35))}
  let carHit=null,manHit=null;
  if(t){
    const spr=carSprite(t.car.model,t.car.color,true),cx=Math.round(W*.02),cy=Math.round(hz+(H-hz)*.42)-38;
    p.g.drawImage(spr,cx,cy);carHit=[cx,cy+8,spr.width,spr.height-10];
    const man=portraitC(t.face,false),mx=Math.round(W*.66)-29,my=H-man.height+4;
    p.g.drawImage(man,mx,my);manHit=[mx+4,my,man.width-8,man.height-4];
  }
  // Schmutzige Scheibe statt Eisblumen
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=Math.min(x,W-1-x),dy=Math.min(y,H-1-y),d=Math.min(dx+dy*1.6,dx*1.6+dy);
    if(d<16){const n=R();if(n<(1-d/16)*.6)p.dot(x,y,n<.12?"rgba(120,124,110,.35)":"rgba(18,20,17,.45)")}}
  for(let i=0;i<Math.min(W,H)*.8;i++){p.dot(Math.round(W*.72)+i,i,"rgba(160,165,150,.07)");p.dot(Math.round(W*.76)+i,i,"rgba(160,165,150,.05)")}
  p.rect(0,0,W,3,"#121311");p.rect(0,H-3,W,3,"#121311");p.rect(0,0,3,H,"#121311");p.rect(W-3,0,3,H,"#121311");
  p.rect(3,3,W-6,1,"#2b2d29");p.rect(3,3,1,H-6,"#2b2d29");
  const setHit=(el,h)=>{if(!h){el.style.display="none";return}el.style.display="";
    el.style.left=h[0]/W*100+"%";el.style.top=h[1]/H*100+"%";el.style.width=h[2]/W*100+"%";el.style.height=h[3]/H*100+"%"};
  setHit($("carView"),carHit); setHit($("traveler"),manHit);
  setSnowLayer(0,W,H);
}

// ---------- Fallender Schnee (Fenster und draußen) ----------
const SNOWS=[{id:"snowCanvas",fl:[],W:0,H:0},{id:"outSnow",fl:[],W:0,H:0}];
let snowRun=false, snowLast=0;
const reduceMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function setSnowLayer(i,W,H){
  const s=SNOWS[i],cv=$(s.id); if(!cv) return;
  cv.width=W;cv.height=H;s.W=W;s.H=H;
  s.fl=Array.from({length:Math.round(W*H/70)},()=>({x:Math.random()*W,y:Math.random()*H,v:.15+Math.random()*.35,big:Math.random()<.2,ph:Math.random()*6}));
  if(reduceMotion()) snowFrame(s,0,false);
  else if(!snowRun){snowRun=true;requestAnimationFrame(snowLoop)}
}
function snowFrame(s,now,move){
  const g=$(s.id).getContext("2d"); g.clearRect(0,0,s.W,s.H);
  for(const f of s.fl){
    if(move){f.y+=f.v;f.x+=Math.sin(now/900+f.ph)*.15;if(f.y>s.H){f.y=-1;f.x=Math.random()*s.W}}
    g.fillStyle=f.big?"rgba(170,172,162,.75)":"rgba(140,144,134,.55)";g.fillRect(Math.round(f.x),Math.round(f.y),f.big?2:1,1)}
}
function snowLoop(now){
  if(now-snowLast>60){snowLast=now;SNOWS.forEach(s=>{if(s.W)snowFrame(s,now,true)})}
  requestAnimationFrame(snowLoop);
}

// ---------- Wand, Uhr, Tischlicht ----------
function drawWall(){
  const box=$("wall"),cv=$("wallCanvas"),W=Math.max(20,Math.round(box.clientWidth/PXS)),H=Math.max(20,Math.round(box.clientHeight/PXS));
  cv.width=W;cv.height=H;const p=P(cv),R=rng(77),base="#45473f",ws=Math.round(H*.62);
  // Betonplatten mit Fugen, Wasserflecken und Rissen
  for(let y=0;y<ws;y++)for(let x=0;x<W;x++){const n=R();p.dot(x,y,n<.08?shade(base,-.14):n>.97?shade(base,.07):base)}
  for(let y=0;y<ws;y+=18){p.rect(0,y,W,1,"#24261f");p.rect(0,y+1,W,1,shade(base,.08))}
  for(let x=Math.round(W*.5);x<W;x+=26){p.rect(x,0,1,ws,"#24261f");p.rect(x+1,0,1,ws,shade(base,.06))}
  for(let k=0;k<6;k++){const sx=Math.round(R()*W),sy=Math.floor(R()*3)*18+2,len=6+Math.round(R()*14);
    for(let y=0;y<len;y++)for(let x=-1;x<=1;x++)if(R()<.7-y/len*.6)p.dot(sx+x,sy+y,"rgba(20,22,18,.25)")}
  p.line(Math.round(W*.2),0,Math.round(W*.26),Math.round(H*.18),shade(base,-.35));
  p.line(Math.round(W*.26),Math.round(H*.18),Math.round(W*.22),Math.round(H*.26),shade(base,-.3));
  // Kacheln unten
  for(let y=ws;y<H;y++)for(let x=0;x<W;x++){const g=x%6===0||(y-ws)%5===0,col=g?"#22251f":((Math.floor(x/6)+Math.floor((y-ws)/5))%2?"#363b34":"#3a3f37");
    p.dot(x,y,(!g&&(x*7+y*3)%13===0)?shade(col,-.15):col)}
  p.rect(0,ws,W,2,"#2b2d28");p.rect(0,ws+2,W,1,"#121311");
}
function drawClock(min){
  const cv=$("clockCanvas"),p=P(cv);p.g.clearRect(0,0,34,34);
  p.ell(17,17,16,16,"#141512");p.ell(17,17,14,14,"#3c3e39");
  p.ell(17,17,12,12,(x,y,u,v)=>(u+v<-.7)?"#b9b7a7":"#a3a192");
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
    if(dd<.35){if(((x+y)&1)===0)p.dot(x,y,"rgba(220,205,160,.07)")}
    else if(dd<1){if((x+y)%3===0)p.dot(x,y,"rgba(220,205,160,.04)")}
    else if(dd>1.5)p.dot(x,y,(x+y)&1?"rgba(0,0,0,.5)":"rgba(0,0,0,.36)");
    else if(dd>1.1&&((x+y)&1))p.dot(x,y,"rgba(0,0,0,.26)")}
}

// ---------- Szene: draußen (Horizont richtet sich nach dem Auto) ----------
let outKey="", outHz=null;
function drawOutBg(){
  const cv=$("outBg"),W=Math.max(100,Math.round(innerWidth/PXS)),H=Math.max(80,Math.round(innerHeight/PXS));
  const wrap=$("carWrap");
  if(wrap){const r=wrap.getBoundingClientRect();if(r.height>0)outHz=Math.round((r.top+r.height*.62)/PXS)}
  const hz=Math.max(20,Math.min(H-20,outHz||Math.round(H*.4)));
  const key=W+"x"+H+"@"+hz; if(key===outKey) return; outKey=key;
  cv.width=W;cv.height=H;const p=P(cv);
  drawSky(p,W,hz);
  drawBlocks(p,W,hz-5,rng(23),1.4);
  drawFog(p,W,hz-16,hz);
  drawGround(p,W,H,hz,[.12,.3,.6]);
  drawConcreteWall(p,W,hz+1,9);
  // Kontrollhütte aus Betonplatten mit trübem Fenster
  const hw=Math.round(W*.08);
  for(let y=hz-40;y<H;y++)for(let x=0;x<hw;x++)p.dot(x,y,x%9===0||(y-hz+40)%12===0?"#22241f":((x*3+y)%13===0?"#353731":"#3c3e38"));
  p.rect(0,hz-43,hw+3,3,"#1a1b18");
  const wx=Math.max(2,Math.round(hw*.25));
  p.rect(wx,hz-28,10,8,"#8f7f4e");p.rect(wx+4,hz-28,1,8,"#2a2a24");p.rect(wx,hz-24,10,1,"#2a2a24");
  for(let y=hz;y<hz+30;y++)for(let x=hw;x<hw+30;x++)if(((x+y)&1)===0&&(x-hw)+(y-hz)*.6<28)p.dot(x,y,"rgba(160,140,86,.08)");
  // Natriumlampe in der Ferne
  const lx=Math.round(W*.93),ly=hz-30;
  for(let y=ly+2;y<H;y++){const w=Math.round((y-ly)*.5);for(let x=-w;x<=w;x++){const a=Math.abs(x)/Math.max(1,w);
    if(a<.5||(((x+y)&1)===0&&a<.85))p.dot(lx+x,y,"rgba(208,164,86,.08)")}}
  p.rect(lx,ly,1,32,"#141613");p.rect(lx-3,ly-1,7,2,"#141613");p.rect(lx-2,ly+1,5,1,PAL.lamp);
  setSnowLayer(1,W,H);
}

// ---------- Start ----------
function initPixel(){
  const st=document.documentElement.style;
  st.setProperty("--paperTex",`url(${noiseTile("#b9b29a",.1,2)})`);
  st.setProperty("--passTex",`url(${passTile()})`);
  st.setProperty("--coverTex",`url(${noiseTile("#45201e",.2,3)})`);
  st.setProperty("--woodTex",`url(${woodTile()})`);
  st.setProperty("--vinylTex",`url(${noiseTile("#33322e",.14,4)})`);
  st.setProperty("--metalTex",`url(${metalTile()})`);
  Object.assign(SPR,{crest:fromMap(CREST,{g:"#b3a06a"},false).toDataURL(),screw:screwSprite(false),screwX:screwSprite(true),
    lever:leverSprite(),patch:patchSprite()});
  const bg=(sel,url)=>{document.querySelector(sel).style.backgroundImage=`url(${url})`};
  bg("#folder",folderSprite());bg("#pencil",pencilSprite());bg("#cuffs",cuffsSprite());bg("#lens",lensSprite());
  bg("#slot",slotSprite());bg(".stamp.ok",stampSprite("#4d6b45"));bg(".stamp.no",stampSprite("#8a2a25"));bg("#suitcase",suitcaseSprite());
  document.querySelectorAll(".tooli").forEach(el=>{const ic=TOOL_ICONS[el.dataset.tool](),img=document.createElement("img");
    img.className="px";img.src=ic.toDataURL();img.alt="";img.style.width=ic.width*3+"px";img.style.height=ic.height*3+"px";el.prepend(img)});
  drawWall(); drawDeskLight(); drawWindowScene(null); drawClock(DAY_START);
}
