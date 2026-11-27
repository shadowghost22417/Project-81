// Pressefotos für die Zeitung: eigene Pixel-Zeichnungen typischer Bildmotive der Zeit, gerastert wie Zeitungsdruck
const PH_W=120, PH_H=72;
const PHOTO_CAPTIONS=[
  "Soldaten wärmen sich an einem Koksofen. Warschau, Dezember 1981",
  "Fahrzeuge der Miliz vor dem Förderturm der Grube „Wujek“",
  "Ausgangssperre: leere Straße am Heiligabend",
  "Schlange vor einem Fleischgeschäft nach den Preiserhöhungen",
  "Wasserwerfer gegen Demonstranten, 31. August 1982",
  "Sitzung des Sejm am 8. Oktober 1982",
  "Lech Wałęsa nach seiner Rückkehr nach Danzig, November 1982",
  "Militärfahrzeuge verlassen die Innenstadt",
  "Feldmesse während des Papstbesuchs, Juni 1983",
  "Beflaggte Straße am Nationalfeiertag, 22. Juli 1983"
];
// --- kleine Bausteine ---
function phPerson(p,x,y,s,col){ // Füße bei y, Größe s (Kopf ~ s/4)
  const h=Math.round(s*.3);p.ell(x,y-s+h/2,Math.max(1,Math.round(h/2.2)),Math.round(h/2),col[0]);
  p.rect(x-Math.round(s*.16),y-s+h,Math.round(s*.32)+1,s-h,col[1]);
}
function phCrowd(p,y0,y1,R,dense){
  for(let y=y0;y<y1;y+=2)for(let x=-2;x<PH_W+2;x+=dense?3:4){const s=6+Math.round((y-y0)/(y1-y0)*10),c=R()<.5?["#6a6a66","#2a2a28"]:["#8a8a84","#3a3a36"];
    phPerson(p,x+Math.round(R()*3),y+s*0+Math.round(R()*2),s,c)}
}
function phBlock(p,x,y,w,h,col){p.rect(x,y,w,h,col);for(let yy=y+3;yy<y+h-2;yy+=5)for(let xx=x+2;xx<x+w-2;xx+=5)p.rect(xx,yy,2,2,shade(col,-.4))}
function phText(p,txt,x,y,font,col){p.g.font=font;p.g.fillStyle=col;p.g.textBaseline="top";p.g.fillText(txt,x,y)}
function phSolidarnosc(p,x,y,w,h,bg){ // Transparent mit rotem Schriftzug und Fahne über dem N
  p.rect(x,y,w,h,bg);p.rect(x,y,w,1,"#999");
  phText(p,"Solidarność",x+2,y+1,`bold ${h-2}px sans-serif`,"#b02a26");
  const nx=x+Math.round(w*.62);p.rect(nx,y-5,1,6,"#2a2a28");p.rect(nx+1,y-5,4,1,"#dddddd");p.rect(nx+1,y-4,4,1,"#b02a26");
}
function phSoldier(p,x,y){p.rect(x-2,y-11,5,10,"#4a5040");p.rect(x-1,y-14,3,3,"#b8a690");p.rect(x-2,y-16,5,2,"#3a3f32");p.line(x+3,y-15,x+5,y-3,"#1a1a18")}
function phTank(p,x,y){p.poly([[x,y],[x+3,y-6],[x+34,y-6],[x+38,y]],"#3a3f34");p.rect(x+12,y-11,12,5,"#353a30");p.rect(x+24,y-10,16,2,"#2a2e26");
  for(let i=0;i<6;i++)p.ell(x+5+i*6,y,2,2,"#1a1a18")}
function phTruck(p,x,y,col){p.rect(x,y-12,22,10,col);p.rect(x+22,y-9,8,7,shade(col,-.15));p.rect(x+24,y-8,4,3,"#9a9a94");p.ell(x+6,y-1,2,2,"#111");p.ell(x+24,y-1,2,2,"#111")}

const PHOTO_DRAW=[
  (p,R)=>{ // Panzer, Soldaten am Koksofen, Schnee
    p.rect(0,0,PH_W,PH_H,"#9a9c98");phBlock(p,0,8,40,40,"#6a6c68");phBlock(p,80,4,40,46,"#5e605c");
    p.rect(0,48,PH_W,24,"#d4d6d0");phTank(p,46,52);
    const bx=30;p.rect(bx-3,58,7,8,"#2a2a28");p.dot(bx-1,57,"#ffffff");p.dot(bx+1,56,"#eeeeee");
    for(let y=40;y<60;y++)p.dith(bx-2,y,5,1,"rgba(240,240,240,.25)");
    [bx-9,bx+8,bx+14].forEach(x=>phSoldier(p,x,66));
    for(let i=0;i<120;i++)p.dot(Math.round(R()*PH_W),Math.round(R()*PH_H),"#f4f4f0")},
  (p,R)=>{ // Förderturm, Milizfahrzeuge
    p.rect(0,0,PH_W,PH_H,"#a4a6a2");p.rect(0,50,PH_W,22,"#c8cac4");
    const tx=58;p.line(tx,8,tx-14,50,"#2a2a28");p.line(tx,8,tx+14,50,"#2a2a28");p.line(tx-7,30,tx+7,30,"#2a2a28");p.line(tx-11,42,tx+11,42,"#2a2a28");
    p.ell(tx,8,5,5,"#3a3a38");p.ell(tx,8,3,3,"#a4a6a2");phBlock(p,82,24,34,26,"#6a6c68");p.rect(84,10,4,14,"#5a5c58");
    phTruck(p,10,64,"#4a4e46");phTruck(p,40,66,"#3e423a");[76,82,90].forEach(x=>phPerson(p,x,66,12,["#7a7a74","#2a2a28"]))},
  (p,R)=>{ // leere Straße, Kirchturm, Nacht
    p.rect(0,0,PH_W,PH_H,"#3a3c3a");phBlock(p,0,20,34,40,"#2a2c2a");phBlock(p,86,16,34,44,"#2e302e");
    p.rect(54,10,12,40,"#4a4c4a");p.poly([[52,10],[60,-2],[68,10]],"#4a4c4a");p.rect(59,0,1,4,"#6a6c6a");p.rect(58,1,3,1,"#6a6c6a");
    p.rect(0,56,PH_W,16,"#6a6c68");p.rect(36,40,1,16,"#1a1a18");p.ell(36,40,3,2,"#e0e0d8");
    for(let y=42;y<72;y++)p.dith(26,y,20,1,"rgba(230,230,220,.15)");for(let i=0;i<60;i++)p.dot(Math.round(R()*PH_W),Math.round(R()*PH_H),"#d8d8d0")},
  (p,R)=>{ // Schlange vor dem Geschäft
    p.rect(0,0,PH_W,PH_H,"#b4b6b2");phBlock(p,0,0,PH_W,44,"#8a8c88");p.rect(10,26,60,18,"#2a2a28");p.rect(14,30,24,14,"#4a4a48");

    p.rect(0,44,PH_W,28,"#a2a4a0");
    for(let i=0;i<16;i++)phPerson(p,40+i*5+Math.round(R()*2),62+Math.round(R()*3),18,R()<.5?["#7a7a74","#2a2a28"]:["#9a9a94","#4a4a46"])},
  (p,R)=>{ // Wasserwerfer, Demonstranten, Solidarność-Transparent
    p.rect(0,0,PH_W,PH_H,"#a8aaa6");phBlock(p,0,0,PH_W,30,"#7e807c");p.rect(0,30,PH_W,42,"#9a9c98");
    phCrowd(p,40,62,R,true);
    p.rect(78,40,36,18,"#3a3e36");p.rect(70,46,10,12,"#33372f");p.ell(84,62,3,3,"#111");p.ell(106,62,3,3,"#111");p.rect(92,36,3,5,"#2a2a28");
    for(let i=0;i<34;i++){const x=92-i,y=36-Math.round(Math.sin(i/34*Math.PI)*10)+Math.round(i*.35);p.rect(x,y,1,2,"#f0f0ec");p.dith(x-1,y-1,3,3,"rgba(240,240,236,.4)")}},
  (p,R)=>{ // Sejm-Saal
    p.rect(0,0,PH_W,PH_H,"#7a7c78");p.rect(40,6,40,22,"#5a5c58");p.rect(54,8,12,10,"#e8e8e4");p.ell(60,13,3,4,"#7a7c78");
    p.rect(44,30,32,8,"#4a4c48");for(let r=0;r<5;r++){const y=40+r*7;for(let x=4+r*3;x<PH_W-4-r*3;x+=4)phPerson(p,x,y+6,8,["#bcbcb6","#2e2e2c"]);p.rect(0,y+6,PH_W,1,"#5a5c58")}},
  (p,R)=>{ // Lech Wałęsa winkt vor dem Wohnblock (Person wird scharf darübergezeichnet)
    p.rect(0,0,PH_W,PH_H,"#9a9c98");phBlock(p,0,0,PH_W,40,"#7a7c78");p.rect(0,40,PH_W,32,"#8a8c88");
    phCrowd(p,44,72,R,true);
    for(let i=0;i<5;i++){const x=10+i*24;p.rect(x,30+(i%2)*3,1,10,"#2a2a28");p.rect(x+1,30+(i%2)*3,6,2,"#eeeeea");p.rect(x+1,32+(i%2)*3,6,2,"#8a3a36")}},
  (p,R)=>{ // abfahrende Militärfahrzeuge
    p.rect(0,0,PH_W,PH_H,"#b0b2ae");phBlock(p,0,6,50,34,"#8a8c88");phBlock(p,70,10,50,30,"#7e807c");p.rect(0,40,PH_W,32,"#9a9c98");
    p.line(0,56,PH_W,48,"#c8cac6");phTruck(p,18,62,"#4a4e46");phTruck(p,50,58,"#4e5248");phTank(p,78,56);
    [8,12].forEach(x=>phPerson(p,x,70,14,["#7a7a74","#3a3a36"]))},
  (p,R)=>{ // Feldmesse mit Solidarność-Fahne
    p.rect(0,0,PH_W,PH_H,"#c4c6c2");p.rect(36,10,48,24,"#e8e8e4");p.rect(36,34,48,4,"#6a6a66");p.rect(59,2,2,16,"#2a2a28");p.rect(54,6,12,2,"#2a2a28");
    p.poly([[30,10],[60,0],[90,10]],"#dcdcd8");phCrowd(p,40,72,R,true);
    p.rect(96,32,1,10,"#2a2a28");p.rect(97,32,10,3,"#f0f0ec");p.rect(97,35,10,3,"#9a3a36")},
  (p,R)=>{ // beflaggte Straße
    p.rect(0,0,PH_W,PH_H,"#bcbeba");phBlock(p,0,4,44,50,"#8a8c88");phBlock(p,76,0,44,54,"#7e807c");p.rect(0,54,PH_W,18,"#a4a6a2");
    for(let i=0;i<6;i++){const x=6+i*7;p.rect(x,12+i*3,1,8,"#2a2a28");p.rect(x+1,12+i*3,5,2,"#f0f0ec");p.rect(x+1,14+i*3,5,2,"#a03a36")}
    for(let i=0;i<6;i++){const x=80+i*7;p.rect(x,10+i*3,1,8,"#2a2a28");p.rect(x+1,10+i*3,5,2,"#f0f0ec");p.rect(x+1,12+i*3,5,2,"#a03a36")}

    for(let i=0;i<10;i++)phPerson(p,10+i*11,70,12,["#8a8a84","#3a3a36"])}
];
// Scharf über das Raster gezeichnet: Schriften, Transparente und die Hauptperson
function phBanner(p,x,y,w,h,txt,size,bg,fg,flag){
  p.rect(x,y,w,h,bg);p.rect(x,y+h,w,1,"#3a3a38");p.rect(x-1,y-2,1,h+14,"#2a2a28");p.rect(x+w,y-2,1,h+14,"#2a2a28");
  const g=p.g;g.font=`bold ${size}px "Pixelify Sans",sans-serif`;g.fillStyle=fg;g.textBaseline="middle";g.textAlign="center";g.fillText(txt,x+w/2,y+h/2+1);g.textAlign="left";
  if(flag){const fx=x+Math.round(w*.66);p.rect(fx,y-6,1,6,"#2a2a28");p.rect(fx+1,y-6,5,2,"#e8e8e4");p.rect(fx+1,y-4,5,2,"#5a5a58")}
}
const PHOTO_POST={
  3:p=>phBanner(p,10,16,60,9,"MIĘSO",8,"#d8d8d4","#1a1a18"),
  4:p=>phBanner(p,6,24,62,12,"Solidarność",10,"#ececea","#4a4a48",true),
  6:p=>{ // Lech Wałęsa: dunkles Haar mit Seitenscheitel, dichter Schnurrbart, lächelnd, Anstecker am Revers, winkt
    const x=56,top=6,sk=["#d8d0c6","#c2b8ac","#a89e92","#8a8278"],hair="#2a2826",jk=["#4a4a48","#3a3a38","#2c2c2a"];
    p.ell(x,PH_H+6,28,30,(xx,yy,u)=>jk[Math.min(2,Math.floor((u+1)*1.4))],(xx,yy)=>yy<PH_H);
    p.poly([[x-6,44],[x+6,44],[x+3,PH_H],[x-3,PH_H]],"#e8e8e4");p.rect(x-1,46,3,PH_H-46,"#5a5a58");
    p.poly([[x-6,44],[x-14,52],[x-8,PH_H]],jk[0]);p.poly([[x+6,44],[x+14,52],[x+8,PH_H]],jk[2]);
    p.ell(x-12,56,2,3,"#cfc6a8");p.dot(x-12,55,"#5a5450");p.dot(x-12,57,"#8a7e60");                    // Madonna-Anstecker
    p.rect(x-4,36,9,9,sk[2]);
    p.ell(x,24,11,14,(xx,yy,u,v)=>sk[Math.min(3,Math.max(0,Math.floor(.3+(u+1)*1.2+Math.max(0,v)*.9)))]);
    p.ell(x-1,13,12,6,hair,(xx,yy)=>yy<=15);p.rect(x-12,13,3,10,hair);p.rect(x+10,13,2,8,hair);
    p.line(x-6,10,x+6,9,"#4a4644");p.poly([[x-11,14],[x+3,11],[x+3,14],[x-11,17]],hair);                // Seitenscheitel
    p.ell(x-12,25,2,3,sk[2]);p.ell(x+11,25,2,3,sk[3]);
    p.rect(x-7,20,5,2,hair);p.rect(x+3,20,5,2,hair);
    p.rect(x-6,23,3,2,"#f2f0ec");p.dot(x-5,23,"#1a1a18");p.rect(x+3,23,3,2,"#e2e0da");p.dot(x+4,23,"#1a1a18");
    p.line(x,24,x,29,sk[3]);p.rect(x-1,30,3,1,sk[3]);
    p.rect(x-7,31,15,3,hair);p.rect(x-8,33,3,2,hair);p.rect(x+6,33,3,2,hair);p.dot(x-8,35,hair);p.dot(x+8,35,hair); // Schnurrbart
    p.rect(x-4,35,9,1,"#f2f0ec");p.rect(x-3,36,7,1,"#7a5a52");                                               // Lächeln
    // erhobener rechter Arm mit offener Hand
    p.poly([[x+16,50],[x+22,48],[x+34,22],[x+29,20]],jk[1]);
    p.ell(x+32,16,5,6,sk[1]);for(let i=0;i<4;i++)p.rect(x+28+i*2,7,2,5,sk[i%2?1:0]);p.rect(x+37,13,2,5,sk[1]);
  },
  8:p=>phBanner(p,10,26,40,10,"Solidarność",8,"#f0f0ec","#4a4a48",true),
  9:p=>phBanner(p,44,18,34,8,"22 LIPCA",7,"#6a6a66","#f0f0ec")
};
// Rastert ein Bild wie Zeitungsdruck: Graustufen, wenige Töne, Bayer-Dithering
function newsprint(c){
  const g=c.getContext("2d"),d=g.getImageData(0,0,c.width,c.height),a=d.data,B=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;let v=a[i]*.3+a[i+1]*.59+a[i+2]*.11;
    v=v/255*4+(B[y%4][x%4]/16-.5)*.6;const q=Math.max(0,Math.min(4,Math.round(v)));const o=[28,70,118,166,214][q];a[i]=o;a[i+1]=o-2;a[i+2]=o-8}
  g.putImageData(d,0,0);return c;
}
function photoFor(i){
  const k="news"+i; if(CACHE[k]) return CACHE[k];
  const c=mk(PH_W,PH_H),p=P(c);c.getContext("2d").imageSmoothingEnabled=false;
  (PHOTO_DRAW[i]||PHOTO_DRAW[0])(p,rng(100+i));
  newsprint(c); if(PHOTO_POST[i]) PHOTO_POST[i](p);
  return CACHE[k]=c.toDataURL();
}
