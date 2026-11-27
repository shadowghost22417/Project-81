// Innenansichten beim Durchsuchen: gezeichnete Bereiche mit Verstecken als Hotspots
const INT_W=160, INT_H=80;
const AREA_TYPE=n=>/Innenraum|Fahrerhaus/.test(n)?"cabin":/Laderaum/.test(n)?"cargo":/Motor/.test(n)?"engine":"trunk";
// Lage der Verstecke im Bild [x,y,w,h]
const SPOT_RECT={
  cabin:{"Handschuhfach":[6,8,32,13],"Türverkleidung":[4,26,32,48],"Fahrersitz":[42,6,42,56],"Rücksitzpolster":[92,8,62,54],
    "Sitzbank":[42,8,112,54],"Unter den Sitzen":[42,64,112,12],"Unter der Sitzbank":[42,64,112,12]},
  trunk:{"Kofferraumboden":[16,46,128,28],"Ladeboden":[16,46,128,28],"Reserverad":[100,6,48,36],"Reserveradmulde":[100,6,48,36],
    "Hinter der Verkleidung":[8,6,40,36],"Seitenverkleidung":[8,6,40,36],"Ecke hinten":[8,6,40,36],"Unter der Hutablage":[54,4,40,18]},
  engine:{"Luftfilter":[12,8,40,28],"Luftfilterkasten":[12,8,40,28],"Werkzeugkiste":[12,8,40,28],"Motorabdeckung":[56,16,50,46],
    "Batteriekasten":[12,44,40,30],"Kotflügel innen":[12,44,40,30],"Hinter dem Kühler":[112,6,42,66],"Neben dem Motor":[112,6,42,66]},
  cargo:{"Kisten":[10,18,60,42],"Ecken hinten":[128,6,28,66],"Ladeboden":[10,62,112,14],"Seitenwand":[74,6,50,50]},
  bag:{"Seitentasche":[10,6,48,24],"Futter":[64,6,86,26],"Kulturbeutel":[12,42,34,26],"Kofferboden":[54,40,96,34]}
};
function artFor(name,type,kind){
  if(kind==="dark") return "dark";
  if(/Handschuhfach/.test(name)) return "glove";
  if(/sitz|polster|bank/i.test(name)) return "seat";
  if(/Reserverad$/.test(name)) return "tire";
  if(/Luftfilter/.test(name)) return "filter";
  if(/Batterie/.test(name)) return "battery";
  if(/Kiste/.test(name)) return "crate";
  if(/Futter/.test(name)) return "lining";
  if(/Tasche|Kulturbeutel/.test(name)) return "pouch";
  if(/boden/i.test(name)) return kind==="panel"?"plate":"floor";
  return kind==="panel"?"panel":"floor";
}
function drawSpotArt(p,art,r,st,ctx){
  const [x,y,w,h]=r, open=st==="open"||st==="hit", up=ctx.uph, met=ctx.metal;
  const hole=()=>{p.rect(x+2,y+2,w-4,h-4,"#0d0c0b");p.dith(x+2,y+2,w-4,2,"#2a2620")};
  switch(art){
    case "seat":{
      const back=Math.round(h*.55);
      for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const top=yy<back,c=top?up[(xx>>2)%2?1:2]:up[(xx>>2)%2?2:3];
        p.dot(x+xx,y+yy,((xx%8===0)||(yy===back))?up[3]:c)}
      p.rect(x,y,w,1,up[0]);p.rect(x,y+back,w,1,up[4]);
      if(open){p.rect(x+6,y+back-12,w-12,8,"#d6c27e");p.dith(x+6,y+back-12,w-12,8,"#b9a462");p.line(x+5,y+back-13,x+w-6,y+back-13,"#120c08")}
      break}
    case "glove":p.rect(x,y,w,h,ctx.dash[1]);p.rect(x+2,y+2,w-4,h-4,ctx.dash[2]);p.rect(x+w/2-3,y+3,6,2,"#8a8d85");
      if(open){p.rect(x+2,y+h,w-4,6,ctx.dash[0]);hole()}break;
    case "panel":for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)p.dot(x+xx,y+yy,yy%6===0?ctx.pan[3]:ctx.pan[(xx+yy)%9===0?1:2]);
      p.rect(x,y,w,1,ctx.pan[0]);[[2,2],[w-4,2],[2,h-4],[w-4,h-4]].forEach(([dx,dy])=>{p.rect(x+dx,y+dy,2,2,"#8a8d85");p.dot(x+dx,y+dy,"#c9cbc2")});
      if(open)hole();break;
    case "plate":for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)p.dot(x+xx,y+yy,((xx+yy*2)%7===0)?met[1]:met[2]);
      p.rect(x,y,w,1,met[0]);p.rect(x,y+h-1,w,1,met[3]);if(open)hole();break;
    case "floor":for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)p.dot(x+xx,y+yy,((xx>>1)+(yy>>1))%2?"#2c2a26":"#33302b");
      p.rect(x+6,y+4,14,8,"#5a4a36");p.rect(x+w-30,y+6,20,6,"#3a3a46");
      if(open)p.dith(x,y,w,h,"rgba(230,220,170,.12)");break;
    case "tire":p.ell(x+w/2,y+h/2,Math.min(w,h)/2-1,Math.min(w,h)/2-1,"#141516");p.ell(x+w/2,y+h/2,Math.min(w,h)/2-6,Math.min(w,h)/2-6,"#55585a");
      p.ell(x+w/2,y+h/2,3,3,"#8a8d85");if(open){p.ell(x+w/2,y+h/2,Math.min(w,h)/2-6,Math.min(w,h)/2-6,"#0d0c0b")}break;
    case "filter":p.ell(x+w/2,y+h/2,Math.min(w,h)/2-1,Math.min(w,h)/2-3,met[1]);p.ell(x+w/2,y+h/2,Math.min(w,h)/2-5,Math.min(w,h)/2-7,met[2]);
      p.dot(x+w/2,y+h/2,"#1a1a18");if(open)p.ell(x+w/2,y+h/2,Math.min(w,h)/2-5,Math.min(w,h)/2-7,"#2a2620");break;
    case "battery":p.rect(x+2,y+4,w-4,h-6,"#1c1d1e");p.rect(x+2,y+4,w-4,2,"#2e3032");p.rect(x+6,y+1,5,3,"#8a3a34");p.rect(x+w-11,y+1,5,3,"#3a4a6a");
      if(open)hole();break;
    case "crate":for(let i=0;i<2;i++){const cx=x+i*(w/2),cw=w/2-2;p.rect(cx,y+4,cw,h-4,"#6b5236");for(let yy=y+4;yy<y+h;yy+=5)p.rect(cx,yy,cw,1,"#4a3824");
      p.line(cx,y+4,cx+cw-1,y+h-1,"#4a3824")}if(open)p.dith(x,y,w,h,"rgba(230,220,170,.15)");break;
    case "lining":for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)p.dot(x+xx,y+yy,((xx+yy)>>1)%3===0?"#5e4f6a":"#6d5a7a");
      p.rect(x,y,w,1,"#8a7a96");if(open){p.line(x+6,y+h/2,x+w-6,y+h/2,"#120c08");p.rect(x+8,y+h/2+1,w-16,4,"#c9b98a")}break;
    case "pouch":p.rect(x+2,y+4,w-4,h-6,"#4a5a4a");p.rect(x+2,y+4,w-4,2,"#5a6a5a");p.rect(x+w/2-4,y+2,8,3,"#8a8d85");
      if(open)p.dith(x,y,w,h,"rgba(230,220,170,.15)");break;
    case "dark":p.rect(x,y,w,h,"#070707");
      if(open){for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const d=Math.hypot(xx-w/2,(yy-h/2)*1.6)/(w/2);
        if(d<1)p.dot(x+xx,y+yy,d<.6?"#4a4740":((xx+yy)&1?"#33312c":"#1a1917"))}}
      else for(let i=0;i<6;i++)p.dot(x+4+((i*13)%(w-8)),y+4+((i*7)%(h-8)),"#151513");
      break;
  }
}
function interiorBase(p,type,ctx){
  const W=INT_W,H=INT_H;
  if(type==="cabin"){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)p.dot(x,y,y<6?ctx.dash[3]:((x+y)%11===0?"#242220":"#1e1c1a"));
    p.rect(0,0,W,4,"#3a3832");p.rect(0,20,40,6,ctx.dash[2]);p.rect(0,20,40,1,ctx.dash[0]);
    p.ell(20,14,7,5,"#141414");p.ell(20,14,5,3,ctx.dash[3]);
  } else if(type==="engine"){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)p.dot(x,y,((x*3+y)%13===0)?"#2a2a28":"#1d1d1c");
    p.rect(56,16,50,46,"#2e2f30");for(let i=0;i<4;i++)p.ell(64+i*12,40,4,4,"#3a3b3c");
    p.line(10,40,150,42,"#3a2a1a");p.line(50,10,110,70,"#1a1a1a");
  } else if(type==="cargo"){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)p.dot(x,y,y>60?((x%10===0)?"#2a2622":"#3a342c"):((x%6===0)?"#3a3d38":"#454842"));
  } else if(type==="bag"){
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)p.dot(x,y,y<36?((x+y)%5===0?"#4a3324":"#553b29"):((x+y)%5===0?"#3a2a1e":"#432f22"));
    p.rect(0,34,W,4,"#2a1d14");p.rect(0,35,W,1,"#b0903e");
  } else {
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)p.dot(x,y,((x+y*3)%9===0)?"#2a2823":"#24221e");
    p.rect(0,0,W,3,ctx.pan[3]);
  }
}
// Zeichnet die Innenansicht und gibt das HTML mit den Hotspots zurück
function interiorHTML(type,spots,title){
  const t=S.cur, base=shade(mute(t.car.color,.55),-.25), R=rng(t.seed);
  const ctx={uph:ramp(["#5a4a3a","#4a4a4e","#5e3a32","#3e4a3e"][Math.floor(R()*4)]),pan:ramp(base),dash:ramp("#3a3936"),metal:ramp("#6c6f68")};
  const c=mk(INT_W,INT_H),p=P(c),rects=SPOT_RECT[type]||{};
  interiorBase(p,type,ctx);
  const html=spots.map(([id,s],i)=>{
    const r=rects[s[0]]||[8+(i%3)*50,8+Math.floor(i/3)*36,44,30], st=S.spotState[id]||"";
    drawSpotArt(p,artFor(s[0],type,s[1]),r,st,ctx);
    if(st==="hit"){const l=lootCanvas(S.cur.contraband.item);p.g.drawImage(l,Math.round(r[0]+r[2]/2-l.width/2),Math.round(r[1]+r[3]/2-l.height/2))}
    const note=st==="hit"?"Fund!":(S.spotNote[id]||(s[1]==="panel"?"verschlossen ("+TOOL_SHORT[s[2]]+")":TYPE_LABEL[s[1]]));
    return `<button class="hs ${s[1]} ${st}" data-spot="${id}" style="left:${r[0]/INT_W*100}%;top:${r[1]/INT_H*100}%;width:${r[2]/INT_W*100}%;height:${r[3]/INT_H*100}%">
      <span class="hl"><b>${s[0]}</b><small>${note}</small></span></button>`;
  }).join("");
  return `<div class="compTitle">${title}</div><div class="interior"><img class="px" src="${c.toDataURL()}" alt="">${html}</div>`;
}
