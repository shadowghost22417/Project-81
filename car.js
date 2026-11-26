// Fahrzeug- und Gepäckkontrolle draußen

const TYPE_LABEL={open:"offen",dark:"dunkel"};
function setSearchMsg(m){$("searchMsg").textContent=m}

function openOutside(){
  if(S.busy) return;
  toggleCheck(false); toggleAsk(false); toggleFolderMenu(false);
  S.outArea=null; S.bagView=false; S.pendingSeize=null;
  setSearchMsg((S.cur.contraband?"„Ist das wirklich nötig, Genosse?“ ":"„Bitte sehr.“ ")+
    "Öffne Klappen und Türen mit einer Wischbewegung, den Koffer über die Schlösser.");
  renderOutside(); $("outside").classList.add("show");
}
function renderOutside(){
  const t=S.cur, m=CAR_MODELS[t.car.model];
  $("outTitle").textContent=m.name+", "+t.car.plate;
  $("stage").style.display=S.close?"none":"";
  $("carStage").innerHTML=`<div id="carWrap">${carSVG(t.car.model,t.car.color,t.car.low)}${m.areas.map((a,i)=>
    `<div class="hot ${S.outArea===i?"open":""}" data-area="${i}" style="left:${a[1][0]}%;top:${a[1][1]}%">${a[0]}<small>${
      S.outArea===i?"offen":a[3]==="up"?"↑ nach oben wischen":"↔ zur Seite ziehen"}</small></div>`).join("")}</div>`;
  const sc=$("suitcase");
  sc.querySelectorAll(".latch").forEach((l,i)=>l.classList.toggle("on",!!S.latches[i]));
  sc.classList.toggle("open",S.latches[0]&&S.latches[1]);
  renderPanelOut();
}
function spotTile(id,s){
  const [name,type,tool]=s, st=S.spotState[id]||"";
  const note=st==="hit"?"Fund!":(S.spotNote[id]||(type==="panel"?"verschlossen ("+TOOL_SHORT[tool]+")":TYPE_LABEL[type]));
  return `<button class="tile ${type} ${st}" data-spot="${id}"><b>${name}</b><small>${note}</small></button>`;
}
function itemTile(it,k){
  const id="i:"+k, st=S.spotState[id]||"", pend=S.pendingSeize===id;
  return `<button class="tile item ${st} ${pend?"pending":""}" data-item="${k}"><b>${it.name}</b><small>${it.count} ${it.unit}${pend?" – nochmal tippen":""}</small></button>`;
}
function renderPanelOut(){
  const p=$("panelOut"), t=S.cur, m=CAR_MODELS[t.car.model];
  if(S.close){if(!S.close.built) renderCloseup(p);return}
  if(S.bagView){
    const decl=t.bag.filter(i=>i.declared).map(i=>`${i.name}: ${i.declared} ${i.unit}`).join("<br>")||"keine Waren";
    p.innerHTML=`<div class="bagWrap"><div class="tiles">${t.bag.map(itemTile).join("")}${
      BAG_SPOTS.map((s,i)=>spotTile("b:"+i,s)).join("")}</div><div class="declCopy"><b>Deklaracja celna</b><br>${decl}</div></div>`;
  } else if(S.outArea!==null){
    const a=m.areas[S.outArea];
    p.innerHTML=`<div class="compTitle">${a[0]}</div><div class="tiles">${a[2].map((s,i)=>spotTile(`c:${S.outArea}:${i}`,s)).join("")}</div>`;
  } else p.innerHTML=`<p class="empty">Öffne eine Klappe, eine Tür oder den Koffer.</p>`;
}

// ---------- Klappen und Türen per Geste ----------
$("carStage").addEventListener("pointerdown",e=>{
  const h=e.target.closest(".hot"); if(!h||S.busy) return;
  e.preventDefault();
  const i=Number(h.dataset.area), x0=e.clientX, y0=e.clientY;
  const up=ev=>{
    window.removeEventListener("pointerup",up);
    const dx=ev.clientX-x0, dy=ev.clientY-y0, g=CAR_MODELS[S.cur.car.model].areas[i][3];
    const ok=g==="up"?(dy<-35&&Math.abs(dy)>Math.abs(dx)):(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy));
    if(!ok) return setSearchMsg(g==="up"?"Wische nach oben, um die Klappe zu öffnen.":"Ziehe zur Seite, um die Tür zu öffnen.");
    if(S.outArea!==i){S.outArea=i;S.bagView=false;S.pendingSeize=null;S.min+=COST.area;updateHUD()}
    setSearchMsg("Tippe eine Stelle an, um nachzusehen, oder zieh ein Werkzeug aus dem Kasten darauf.");
    renderOutside();
  };
  window.addEventListener("pointerup",up);
});

// ---------- Koffer ----------
$("suitcase").addEventListener("click",e=>{
  if(S.busy) return;
  const l=e.target.closest("[data-latch]");
  if(l) S.latches[+l.dataset.latch]=true;
  if(S.latches[0]&&S.latches[1]){
    if(!S.bagView){S.bagView=true;S.outArea=null;S.pendingSeize=null;S.min+=COST.area;updateHUD()}
    setSearchMsg("Vergleiche mit der Deklaracja. Ware doppelt antippen zum Beschlagnahmen, Fächer mit Werkzeug prüfen.");
  } else setSearchMsg(l?"Ein Schloss ist offen. Noch eins.":"Öffne zuerst beide Schlösser.");
  renderOutside();
});

// ---------- Stellen untersuchen ----------
function openClose(id,using){
  const [name,,tool]=spotById(id,S.cur);
  S.close={id,name,tool,using,hit:!!S.cur.contraband&&S.cur.contraband.spot===id,
    built:false,cutLen:0,cuts:[],screws:0,pulls:0,opened:false,anim:false};
  S.min+=COST.look; updateHUD(); renderOutside();
}
function useHand(id){
  const [name,type]=spotById(id,S.cur);
  if(S.spotState[id]) return setSearchMsg(name+": schon durchsucht.");
  if(type==="panel") return openClose(id,"hand");
  S.min+=COST.look;
  if(type==="dark"){S.spotNote[id]="zu dunkel";setSearchMsg(name+": zu dunkel. Zieh die Taschenlampe hierher.")}
  else reveal(id,name);
  updateHUD(); renderPanelOut();
}
function applyTool(tool,id){
  const [name,type,req]=spotById(id,S.cur);
  if(S.spotState[id]) return setSearchMsg(name+": schon durchsucht.");
  if(tool==="knock"){
    if(type!=="panel") return setSearchMsg("Klopfen bringt hier nichts.");
    const full=(!!S.cur.contraband&&S.cur.contraband.spot===id)||S.cur.falseSpot===id;
    S.min+=COST.knock; S.spotNote[id]=full?"klingt dumpf":"klingt hohl";
    setSearchMsg(name+": "+(full?"dumpf und voll. Da könnte etwas drin sein.":"hohl, klingt normal."));
  } else if(tool==="lamp"){
    if(type==="panel") return openClose(id,"lamp");
    S.min+=COST.look; reveal(id,name);
  } else {
    if(type!=="panel") return setSearchMsg("Hier gibt es nichts aufzumachen. Tippe die Stelle an oder nimm die Taschenlampe.");
    if(tool!==req) return setSearchMsg("Damit kommst du hier nicht weiter. Für "+name+" brauchst du "+TOOL_ACC[req]+".");
    return openClose(id,tool);
  }
  updateHUD(); renderPanelOut();
}
function reveal(id,name){
  if(S.cur.contraband&&S.cur.contraband.spot===id){
    S.spotState[id]="hit"; S.found=S.cur.contraband.desc;
    setSearchMsg("Gefunden: "+S.found+"! Damit kannst du festnehmen."); return;
  }
  S.spotState[id]="open"; S.spotNote[id]="leer"; setSearchMsg(name+": nichts Verdächtiges.");
}
function seize(k){
  const id="i:"+k, it=S.cur.bag[k];
  if(S.spotState[id]) return setSearchMsg(it.name+": bereits geprüft.");
  if(S.pendingSeize!==id){S.pendingSeize=id;renderPanelOut();return setSearchMsg(it.name+": nochmal tippen, um zu beschlagnahmen.")}
  S.pendingSeize=null; S.min+=COST.look;
  if(S.cur.contraband&&S.cur.contraband.spot===id){
    S.spotState[id]="hit"; S.found=S.cur.contraband.desc;
    setSearchMsg("Beschlagnahmt: "+S.found+". Damit kannst du festnehmen.");
  } else {
    S.spotState[id]="open"; S.money-=WRONG_SEIZE;
    setSearchMsg(it.name+" war korrekt deklariert. Beschwerde: −"+WRONG_SEIZE+" zł.");
  }
  updateHUD(); renderPanelOut();
}
$("panelOut").addEventListener("click",e=>{
  if(S.busy||S.close) return;
  const sp=e.target.closest("[data-spot]"); if(sp) return useHand(sp.dataset.spot);
  const it=e.target.closest("[data-item]"); if(it) seize(+it.dataset.item);
});

// ---------- Werkzeugkasten ----------
function dropTool(tool,x,y){
  const els=document.elementsFromPoint(x,y);
  const sp=els.map(e=>e.closest&&e.closest("[data-spot]")).find(Boolean);
  if(sp) return applyTool(tool,sp.dataset.spot);
  if(S.close&&els.some(e=>e.closest&&e.closest("[data-closebox]"))) return useOnClose(tool);
  setSearchMsg("Zieh das Werkzeug direkt auf eine Stelle.");
}
document.querySelectorAll(".tooli").forEach(el=>freeDrag(el,(x,y)=>dropTool(el.dataset.tool,x,y),()=>!S.busy));

$("bDoor").onclick=()=>{
  if(S.close){finishClose();S.close=null}
  $("outside").classList.remove("show");
};
