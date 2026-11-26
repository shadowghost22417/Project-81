// Nahansicht verschlossener Stellen in Pixel-Grafik
const CUT_W=150, CUT_H=85;
const HINT_TEXT={knife:"Eine Naht sieht frisch genäht aus. ",screw:"Die Schrauben haben frische Kratzer. ",bar:"Eine Stelle glänzt wie frisch lackiert. "};
const HOWTO={knife:"Setz das Messer an und zieh eine gerade Linie.",screw:"Halte jede Schraube gedrückt, bis sie herauskommt.",bar:"Ziehe das Brecheisen dreimal kräftig nach unten."};

function closeHint(c){
  const t=S.cur;
  if(c.hit) return t.contraband.hint?t.contraband.pos:null;
  return t.falseSpot===c.id?t.falseHintPos:null;
}
function closeMsg(c){
  return (closeHint(c)?HINT_TEXT[c.tool]:"")+
    (c.using===c.tool?HOWTO[c.tool]:"Hier brauchst du "+TOOL_ACC[c.tool]+". Zieh es aus dem Werkzeugkasten hierher.");
}
function renderCloseup(p){
  const c=S.close; c.built=true;
  p.innerHTML=`<div class="closeHead"><button class="door" id="bCloseBack">‹ Zurück</button><b>${c.name}</b></div>
    <div class="closeup" id="closeBox" data-closebox></div>`;
  $("bCloseBack").onclick=()=>{finishClose();S.close=null;renderOutside()};
  const box=$("closeBox");
  if(c.tool==="knife") buildKnife(box,c); else if(c.tool==="screw") buildScrew(box,c); else buildBar(box,c);
  setSearchMsg(closeMsg(c));
}
function useOnClose(tool){
  const c=S.close;
  if(tool===c.tool){c.using=tool;setSearchMsg(closeMsg(c))}
  else setSearchMsg("Damit kommst du hier nicht weiter. Hier brauchst du "+TOOL_ACC[c.tool]+".");
}
function markFound(c){
  S.spotState[c.id]="hit"; S.found=S.cur.contraband.desc;
  setSearchMsg("Gefunden: "+S.found+"! Damit kannst du festnehmen.");
  updateHUD();
}
function openPanel(c,damage){
  const pc=$("pcover"); pc.style.transform=""; pc.classList.add("off"); c.opened=true;
  if(c.hit){markFound(c);return}
  S.spotState[c.id]="open";
  if(damage){S.money-=DAMAGE;S.spotNote[c.id]="aufgebrochen, leer";setSearchMsg(c.name+": nichts drin. Beschwerde wegen Schaden: −"+DAMAGE+" zł.")}
  else{S.spotNote[c.id]="abgeschraubt, leer";setSearchMsg(c.name+": nichts Verdächtiges.")}
  updateHUD();
}
function finishClose(){
  const c=S.close; if(!c) return;
  if(c.tool==="knife"&&c.cutLen>0){
    S.min+=Math.min(30,3+Math.round(c.cutLen/15));
    if(S.spotState[c.id]!=="hit"){
      const pen=Math.min(60,10+Math.round(c.cutLen/6));
      S.money-=pen; S.spotState[c.id]="open"; S.spotNote[c.id]="aufgeschnitten, leer";
      setSearchMsg(c.name+" aufgeschnitten, nichts gefunden. Beschwerde: −"+pen+" zł.");
    }
  }
  updateHUD();
}

// ---------- Messer ----------
function makeFabric(color,hint){
  const c=mk(CUT_W,CUT_H),p=P(c),r=ramp(color);
  for(let y=0;y<CUT_H;y++)for(let x=0;x<CUT_W;x++){let col=((x>>1)+(y>>1))&1?r[2]:r[3];if(x%28===14)col=r[4];if(x%28===15)col=r[1];p.dot(x,y,col)}
  for(let x=14;x<CUT_W;x+=28)for(let y=1;y<CUT_H;y+=4)p.dot(x+1,y,r[0]);
  if(hint){const hx=Math.round(hint.x*CUT_W),hy=Math.round(hint.y*CUT_H);
    for(let i=-22;i<=22;i++)if(((i+30)%4)<2)p.dot(hx+i,hy+Math.round(i*.08),"#e8cf74")}
  return c;
}
function makeFoam(item,pos){
  const c=mk(CUT_W,CUT_H),p=P(c),R=rng(8);
  for(let y=0;y<CUT_H;y++)for(let x=0;x<CUT_W;x++){const n=R();p.dot(x,y,n<.1?"#b9a462":n>.93?"#e8d79a":"#d6c27e")}
  let rect=null;
  if(item){const l=lootCanvas(item),x=Math.round(pos.x*CUT_W-l.width/2),y=Math.round(pos.y*CUT_H-l.height/2);
    p.g.drawImage(l,x,y);rect={x,y,w:l.width,h:l.height}}
  const data=p.g.getImageData(0,0,CUT_W,CUT_H).data;
  return {rect,px:(x,y)=>{if(x<0||y<0||x>=CUT_W||y>=CUT_H)return null;const i=(y*CUT_W+x)*4;return`rgb(${data[i]},${data[i+1]},${data[i+2]})`}};
}
function lensPts(cut,s){
  const {a,b}=cut,w=cut.w*s,L=Math.hypot(b.x-a.x,b.y-a.y)||1,nx=-(b.y-a.y)/L,ny=(b.x-a.x)/L,pts=[];
  for(let i=0;i<=12;i++){const t=i/12,o=w/2*4*t*(1-t);pts.push([a.x+(b.x-a.x)*t+nx*o,a.y+(b.y-a.y)*t+ny*o])}
  for(let i=12;i>=0;i--){const t=i/12,o=w/2*4*t*(1-t);pts.push([a.x+(b.x-a.x)*t-nx*o,a.y+(b.y-a.y)*t-ny*o])}
  return pts;
}
function drawSeat(c,preview){
  const p=c.p; p.g.clearRect(0,0,CUT_W,CUT_H); p.g.drawImage(c.base,0,0);
  for(const cut of c.cuts){
    if(cut.w<.6) continue;
    const outer=lensPts(cut,1.6), inner=lensPts(cut,1);
    for(let i=0;i<outer.length;i++){const a=outer[i],b=outer[(i+1)%outer.length];p.line(a[0],a[1],b[0],b[1],c.flap)}
    p.poly(inner,(x,y)=>c.foam.px(x,y));
    for(let i=0;i<inner.length;i++){const a=inner[i],b=inner[(i+1)%inner.length];p.line(a[0],a[1],b[0],b[1],"#120c08")}
  }
  if(preview){const {a,b}=preview,n=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))||1;
    for(let i=0;i<=n;i++)if(i%4<2)p.dot(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,"#f2ead2")}
}
function cutHits(cut,c){
  const r=c.foam.rect; if(!r) return false;
  for(let i=0;i<=24;i++){
    const t=i/24, qx=cut.a.x+(cut.b.x-cut.a.x)*t, qy=cut.a.y+(cut.b.y-cut.a.y)*t, o=cut.w/2*4*t*(1-t);
    if(qx>r.x-o&&qx<r.x+r.w+o&&qy>r.y-o&&qy<r.y+r.h+o) return true;
  }
  return false;
}
function buildKnife(box,c){
  box.innerHTML=`<canvas id="cutCanvas" class="px" width="${CUT_W}" height="${CUT_H}"></canvas>`;
  const cv=$("cutCanvas"), color=c.id.startsWith("b:")?"#6d5a7a":"#5a4a3a";
  c.p=P(cv); c.base=makeFabric(color,closeHint(c)); c.flap=shade(color,.3);
  c.foam=makeFoam(c.hit?S.cur.contraband.item:null,c.hit?S.cur.contraband.pos:null);
  drawSeat(c);
  cv.addEventListener("pointerdown",e=>{
    if(c.using!=="knife") return setSearchMsg("Zum Aufschneiden zieh das Messer aus dem Werkzeugkasten hierher.");
    if(c.anim) return;
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    const to=ev=>{const r=cv.getBoundingClientRect();return {x:Math.floor((ev.clientX-r.left)/r.width*CUT_W),y:Math.floor((ev.clientY-r.top)/r.height*CUT_H)}};
    const a=to(e); let b=a;
    const move=ev=>{b=to(ev);drawSeat(c,{a,b})};
    const up=()=>{
      cv.removeEventListener("pointermove",move);cv.removeEventListener("pointerup",up);cv.removeEventListener("pointercancel",up);
      const len=Math.hypot(b.x-a.x,b.y-a.y);
      if(len<6){drawSeat(c);return}
      const cut={a,b,w:0,target:Math.min(16,3+len*.17)};
      c.cuts.push(cut); c.cutLen+=len; c.anim=true;
      const t0=performance.now();
      const step=now=>{
        const k=Math.min(1,(now-t0)/320);
        cut.w=cut.target*(1-Math.pow(1-k,3)); drawSeat(c);
        if(k<1) requestAnimationFrame(step); else {c.anim=false;afterCut(c,cut)}
      };
      requestAnimationFrame(step);
    };
    cv.addEventListener("pointermove",move);cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  });
}
function afterCut(c,cut){
  if(S.spotState[c.id]==="hit") return;
  if(c.hit&&cutHits(cut,c)) markFound(c);
  else setSearchMsg("Schnitt: "+Math.round(c.cutLen*.4)+" cm. Nur Schaumstoff. Weiterschneiden oder zurück.");
}

// ---------- Schraubenzieher ----------
const lootImg=()=>`<img class="px loot" src="${lootURL(S.cur.contraband.item)}" alt="${S.cur.contraband.item}">`;
function buildScrew(box,c){
  const scr=!!closeHint(c);
  box.innerHTML=`<div class="cavity">${c.hit?lootImg():'<span class="emptyTxt">Nur Staub und Kabel.</span>'}</div>
    <div class="pcover vinyl" id="pcover"><span class="plabel">${c.name}</span>${
      [0,1,2,3].map(i=>`<button class="screw s${i}" style="background-image:url(${scr?SPR.screwX:SPR.screw})" aria-label="Schraube"></button>`).join("")}</div>`;
  box.querySelectorAll(".screw").forEach(s=>{
    let timer=null;
    s.addEventListener("pointerdown",e=>{
      if(c.using!=="screw") return setSearchMsg("Dafür brauchst du den Schraubenzieher. Zieh ihn aus dem Werkzeugkasten hierher.");
      if(s.classList.contains("gone")||c.opened) return;
      e.preventDefault(); s.setPointerCapture(e.pointerId); s.classList.add("turning");
      timer=setTimeout(()=>{
        timer=null; s.classList.remove("turning"); s.classList.add("gone"); c.screws++; S.min+=2; updateHUD();
        if(c.screws===4) openPanel(c,false); else setSearchMsg("Schraube raus. Noch "+(4-c.screws)+".");
      },700);
    });
    const cancel=()=>{if(timer){clearTimeout(timer);timer=null;s.classList.remove("turning")}};
    s.addEventListener("pointerup",cancel); s.addEventListener("pointercancel",cancel);
  });
}

// ---------- Brecheisen ----------
function buildBar(box,c){
  const fresh=!!closeHint(c);
  box.innerHTML=`<div class="cavity">${c.hit?lootImg():'<span class="emptyTxt">Nur Rost.</span>'}</div>
    <div class="pcover metal" id="pcover"><span class="plabel">${c.name}</span>${fresh?`<span class="patch px" style="background-image:url(${SPR.patch})"></span>`:""}</div>
    <div class="lever px" id="lever" style="background-image:url(${SPR.lever})"></div><div class="pulls">Hebeln: <span id="pullCount">0</span>/3</div>`;
  const lever=$("lever");
  lever.addEventListener("pointerdown",e=>{
    if(c.using!=="bar") return setSearchMsg("Dafür brauchst du das Brecheisen. Zieh es aus dem Werkzeugkasten hierher.");
    if(c.opened) return;
    e.preventDefault(); lever.setPointerCapture(e.pointerId);
    const y0=e.clientY; let counted=false;
    const move=ev=>{
      const dy=Math.max(0,Math.min(90,ev.clientY-y0));
      lever.style.transform=`translateY(${Math.round(dy/3)*3}px)`;
      if(dy>70&&!counted&&!c.opened){
        counted=true; c.pulls++; $("pullCount").textContent=c.pulls;
        $("pcover").style.transform=`rotate(${-4*c.pulls}deg)`;
        if(c.pulls>=3){S.min+=8;openPanel(c,true)}
      }
    };
    const up=()=>{lever.style.transform="";lever.removeEventListener("pointermove",move);lever.removeEventListener("pointerup",up);lever.removeEventListener("pointercancel",up)};
    lever.addEventListener("pointermove",move);lever.addEventListener("pointerup",up);lever.addEventListener("pointercancel",up);
  });
}
