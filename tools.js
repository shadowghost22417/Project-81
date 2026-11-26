// Nahansicht verschlossener Stellen: Messer, Schraubenzieher, Brecheisen
const CUT_W=600, CUT_H=340;
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
    S.min+=Math.min(30,3+Math.round(c.cutLen/60));
    if(S.spotState[c.id]!=="hit"){
      const pen=Math.min(60,10+Math.round(c.cutLen/25));
      S.money-=pen; S.spotState[c.id]="open"; S.spotNote[c.id]="aufgeschnitten, leer";
      setSearchMsg(c.name+" aufgeschnitten, nichts gefunden. Beschwerde: −"+pen+" zł.");
    }
  }
  updateHUD();
}

// ---------- Messer: gerader Schnitt, Stoff reißt auf ----------
function makeFabric(color,hint){
  const o=document.createElement("canvas"); o.width=CUT_W; o.height=CUT_H;
  const x=o.getContext("2d");
  x.fillStyle=color; x.fillRect(0,0,CUT_W,CUT_H);
  x.strokeStyle="rgba(255,255,255,.12)"; x.lineWidth=3;
  for(let i=75;i<CUT_W;i+=110){x.beginPath();x.moveTo(i,0);x.lineTo(i,CUT_H);x.stroke()}
  for(let i=0;i<1400;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*.1})`;x.fillRect(Math.random()*CUT_W,Math.random()*CUT_H,2,2)}
  if(hint){
    const px=hint.x*CUT_W, py=hint.y*CUT_H;
    x.strokeStyle="#e0c870"; x.lineWidth=2; x.setLineDash([7,5]);
    x.beginPath(); x.moveTo(px-75,py-6); x.lineTo(px+75,py+4); x.stroke(); x.setLineDash([]);
  }
  return o;
}
function makeFoam(item,pos){
  const o=document.createElement("canvas"); o.width=CUT_W; o.height=CUT_H;
  const x=o.getContext("2d");
  x.fillStyle="#dcc98a"; x.fillRect(0,0,CUT_W,CUT_H);
  for(let i=0;i<500;i++){x.fillStyle=`rgba(120,90,30,${Math.random()*.25})`;x.beginPath();x.arc(Math.random()*CUT_W,Math.random()*CUT_H,1+Math.random()*3,0,7);x.fill()}
  let rect=null;
  if(item){
    x.font="bold 15px Courier New, monospace";
    const w=Math.min(300,x.measureText(item).width+24), h=56, px=pos.x*CUT_W, py=pos.y*CUT_H;
    rect={x:px-w/2,y:py-h/2,w,h};
    x.fillStyle="#e8e2cf"; x.fillRect(rect.x,rect.y,w,h);
    x.strokeStyle="#6b5a3a"; x.lineWidth=3; x.strokeRect(rect.x,rect.y,w,h);
    x.fillStyle="#222"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(item,px,py);
  }
  return {canvas:o,rect};
}
function lensPath(ctx,cut,s){
  const {a,b}=cut, w=cut.w*s, mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
  const L=Math.hypot(b.x-a.x,b.y-a.y)||1, nx=-(b.y-a.y)/L, ny=(b.x-a.x)/L;
  ctx.beginPath(); ctx.moveTo(a.x,a.y);
  ctx.quadraticCurveTo(mx+nx*w,my+ny*w,b.x,b.y);
  ctx.quadraticCurveTo(mx-nx*w,my-ny*w,a.x,a.y);
  ctx.closePath();
}
function drawSeat(ctx,c,preview){
  ctx.drawImage(c.base,0,0);
  for(const cut of c.cuts){
    if(cut.w<1) continue;
    ctx.save(); lensPath(ctx,cut,1); ctx.clip(); ctx.drawImage(c.foam,0,0);
    ctx.lineWidth=10; ctx.strokeStyle="rgba(0,0,0,.35)"; lensPath(ctx,cut,1); ctx.stroke(); ctx.restore();
    ctx.lineWidth=3; ctx.strokeStyle="rgba(20,10,5,.75)"; lensPath(ctx,cut,1); ctx.stroke();
    ctx.lineWidth=3; ctx.strokeStyle="rgba(255,255,255,.18)"; lensPath(ctx,cut,1.35); ctx.stroke();
  }
  if(preview){
    ctx.save(); ctx.setLineDash([8,6]); ctx.strokeStyle="rgba(255,255,255,.85)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(preview.a.x,preview.a.y); ctx.lineTo(preview.b.x,preview.b.y); ctx.stroke(); ctx.restore();
  }
}
function cutHits(cut,c){
  const r=c.lootRect; if(!r) return false;
  for(let i=0;i<=24;i++){
    const t=i/24, qx=cut.a.x+(cut.b.x-cut.a.x)*t, qy=cut.a.y+(cut.b.y-cut.a.y)*t;
    const o=cut.w/2*(1-Math.pow(2*t-1,2));
    if(qx>r.x-o&&qx<r.x+r.w+o&&qy>r.y-o&&qy<r.y+r.h+o) return true;
  }
  return false;
}
function buildKnife(box,c){
  box.innerHTML=`<canvas id="cutCanvas" width="${CUT_W}" height="${CUT_H}"></canvas>`;
  const cv=$("cutCanvas"), ctx=cv.getContext("2d");
  c.base=makeFabric(c.id.startsWith("b:")?"#6d5a7a":"#5a4a3a",closeHint(c));
  const f=makeFoam(c.hit?S.cur.contraband.item:null,c.hit?S.cur.contraband.pos:null);
  c.foam=f.canvas; c.lootRect=f.rect;
  drawSeat(ctx,c);
  cv.addEventListener("pointerdown",e=>{
    if(c.using!=="knife") return setSearchMsg("Zum Aufschneiden zieh das Messer aus dem Werkzeugkasten hierher.");
    if(c.anim) return;
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    const to=ev=>{const r=cv.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width*CUT_W,y:(ev.clientY-r.top)/r.height*CUT_H}};
    const a=to(e); let b=a;
    const move=ev=>{b=to(ev);drawSeat(ctx,c,{a,b})};
    const up=()=>{
      cv.removeEventListener("pointermove",move);cv.removeEventListener("pointerup",up);cv.removeEventListener("pointercancel",up);
      const len=Math.hypot(b.x-a.x,b.y-a.y);
      if(len<20){drawSeat(ctx,c);return}
      const cut={a,b,w:0,target:Math.min(54,10+len*.16)};
      c.cuts.push(cut); c.cutLen+=len; c.anim=true;
      const t0=performance.now();
      const step=now=>{
        const k=Math.min(1,(now-t0)/320);
        cut.w=cut.target*(1-Math.pow(1-k,3)); drawSeat(ctx,c);
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
  else setSearchMsg("Schnitt: "+Math.round(c.cutLen/10)+" cm. Nur Schaumstoff. Weiterschneiden oder zurück.");
}

// ---------- Schraubenzieher ----------
function buildScrew(box,c){
  const scratched=!!closeHint(c);
  box.innerHTML=`<div class="cavity">${c.hit?`<div class="loot">${S.cur.contraband.item}</div>`:'<span class="emptyTxt">Nur Staub und Kabel.</span>'}</div>
    <div class="pcover" id="pcover"><span class="plabel">${c.name}</span>${
      [0,1,2,3].map(i=>`<button class="screw s${i} ${scratched?"scratched":""}" style="--r:${rint(0,170)}deg" aria-label="Schraube"></button>`).join("")}</div>`;
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
  box.innerHTML=`<div class="cavity">${c.hit?`<div class="loot">${S.cur.contraband.item}</div>`:'<span class="emptyTxt">Nur Rost.</span>'}</div>
    <div class="pcover metal" id="pcover"><span class="plabel">${c.name}</span>${fresh?'<span class="patch"></span>':""}</div>
    <div class="lever" id="lever"></div><div class="pulls">Hebeln: <span id="pullCount">0</span>/3</div>`;
  const lever=$("lever");
  lever.addEventListener("pointerdown",e=>{
    if(c.using!=="bar") return setSearchMsg("Dafür brauchst du das Brecheisen. Zieh es aus dem Werkzeugkasten hierher.");
    if(c.opened) return;
    e.preventDefault(); lever.setPointerCapture(e.pointerId);
    const y0=e.clientY; let counted=false;
    const move=ev=>{
      const dy=Math.max(0,Math.min(90,ev.clientY-y0));
      lever.style.transform=`translateY(${dy}px)`;
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
