// Nahansicht verschlossener Stellen: Messer, Schraubenzieher, Brecheisen
const CUT_W=600, CUT_H=340;

function closeHint(c){
  const t=S.cur;
  if(c.hit) return t.contraband.hint?t.contraband.pos:null;
  return t.falseSpot===c.id?t.falseHintPos:null;
}
const lootHTML=()=>`<div class="loot">${S.cur.contraband.item}</div>`;

function renderCloseup(v){
  const c=S.close; c.built=true;
  $("searchTitle").textContent=c.name;
  if(c.tool==="knife") buildKnife(v,c);
  else if(c.tool==="screw") buildScrew(v,c);
  else buildBar(v,c);
}
function markFound(c){
  S.spotState[c.id]="hit"; S.found=S.cur.contraband.desc;
  setSearchMsg("Gefunden: "+S.found+"! Du kannst jetzt festnehmen.");
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
// Wird beim Verlassen der Nahansicht aufgerufen
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

// ---------- Messer: freies Schneiden ----------
function paintFabric(ctx,color,hint){
  ctx.fillStyle=color; ctx.fillRect(0,0,CUT_W,CUT_H);
  ctx.strokeStyle="rgba(255,255,255,.12)"; ctx.lineWidth=3;
  for(let x=75;x<CUT_W;x+=110){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CUT_H);ctx.stroke()}
  for(let i=0;i<1400;i++){ctx.fillStyle=`rgba(0,0,0,${Math.random()*.1})`;ctx.fillRect(Math.random()*CUT_W,Math.random()*CUT_H,2,2)}
  if(hint){ // frisch genähte Naht in hellerem Garn
    const x=hint.x*CUT_W, y=hint.y*CUT_H;
    ctx.strokeStyle="#e0c870"; ctx.lineWidth=2; ctx.setLineDash([7,5]);
    ctx.beginPath(); ctx.moveTo(x-75,y-6); ctx.lineTo(x+75,y+4); ctx.stroke(); ctx.setLineDash([]);
  }
}
function buildKnife(v,c){
  const pos=c.hit?S.cur.contraband.pos:null, hint=closeHint(c);
  v.innerHTML=`<div class="closeup"><div class="under">${pos?`<div class="loot" style="left:${pos.x*100}%;top:${pos.y*100}%">${S.cur.contraband.item}</div>`:""}</div>
    <canvas id="cutCanvas" width="${CUT_W}" height="${CUT_H}"></canvas></div>`;
  const cv=$("cutCanvas"), ctx=cv.getContext("2d");
  paintFabric(ctx,c.id.startsWith("b:")?"#6d5a7a":"#5a4a3a",hint);
  setSearchMsg((hint?"Eine Naht sieht frisch genäht aus. ":"")+"Nimm das Messer und schneide, wo du willst. Jeder Zentimeter Schaden kostet.");
  cv.addEventListener("pointerdown",e=>{
    if(S.tool!=="knife") return setSearchMsg("Zum Aufschneiden brauchst du das Messer.");
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    const to=ev=>{const r=cv.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width*CUT_W,y:(ev.clientY-r.top)/r.height*CUT_H}};
    let last=to(e);
    ctx.globalCompositeOperation="destination-out"; ctx.strokeStyle="#000"; ctx.lineWidth=16; ctx.lineCap="round"; ctx.lineJoin="round";
    const move=ev=>{
      const p=to(ev);
      ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke();
      c.cutLen+=Math.hypot(p.x-last.x,p.y-last.y); last=p;
      if(pos&&S.spotState[c.id]!=="hit"&&Math.hypot(p.x-pos.x*CUT_W,p.y-pos.y*CUT_H)<50) markFound(c);
    };
    const up=()=>{
      cv.removeEventListener("pointermove",move);cv.removeEventListener("pointerup",up);cv.removeEventListener("pointercancel",up);
      ctx.globalCompositeOperation="source-over";
      if(S.spotState[c.id]!=="hit") setSearchMsg("Schnitt: "+Math.round(c.cutLen/10)+" cm. Nichts zu sehen. Weiterschneiden oder zurück.");
    };
    cv.addEventListener("pointermove",move);cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  });
}

// ---------- Schraubenzieher: vier Schrauben ----------
function buildScrew(v,c){
  const scratched=!!closeHint(c);
  v.innerHTML=`<div class="closeup"><div class="cavity">${c.hit?lootHTML():'<span class="emptyTxt">Nur Staub und Kabel.</span>'}</div>
    <div class="pcover" id="pcover"><span class="plabel">${c.name}</span>${
      [0,1,2,3].map(i=>`<button class="screw s${i} ${scratched?"scratched":""}" style="--r:${rint(0,170)}deg" aria-label="Schraube"></button>`).join("")}</div></div>`;
  setSearchMsg((scratched?"Die Schrauben haben frische Kratzer. ":"")+"Halte jede Schraube mit dem Schraubenzieher gedrückt, bis sie herauskommt.");
  v.querySelectorAll(".screw").forEach(s=>{
    let timer=null;
    s.addEventListener("pointerdown",e=>{
      if(S.tool!=="screw") return setSearchMsg("Dafür brauchst du den Schraubenzieher.");
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

// ---------- Brecheisen: dreimal hebeln ----------
function buildBar(v,c){
  const fresh=!!closeHint(c);
  v.innerHTML=`<div class="closeup"><div class="cavity">${c.hit?lootHTML():'<span class="emptyTxt">Nur Rost.</span>'}</div>
    <div class="pcover metal" id="pcover"><span class="plabel">${c.name}</span>${fresh?'<span class="patch"></span>':""}</div>
    <div class="lever" id="lever"></div><div class="pulls">Hebeln: <span id="pullCount">0</span>/3</div></div>`;
  setSearchMsg((fresh?"Eine Stelle glänzt, als wäre sie frisch lackiert. ":"")+"Ziehe das Brecheisen dreimal kräftig nach unten.");
  const lever=$("lever");
  lever.addEventListener("pointerdown",e=>{
    if(S.tool!=="bar") return setSearchMsg("Dafür brauchst du das Brecheisen.");
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
