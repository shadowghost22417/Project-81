// Fahrzeug- und Gepäckkontrolle

const TYPE_LABEL={open:"offen",dark:"dunkel"};

function openCar(){
  if(S.busy) return;
  S.view="overview"; S.pendingSeize=null; S.close=null;
  $("carSpeech").textContent=S.cur.contraband?"„Ist das wirklich nötig, Genosse?“":"„Bitte sehr. Da ist nur Gepäck drin.“";
  setSearchMsg("Wähle einen Bereich oder öffne das Gepäck.");
  renderSearch(); $("carScene").classList.add("show");
}
function setSearchMsg(m){$("searchMsg").textContent=m}

function spotTile(id,s){
  const [name,type,tool]=s, st=S.spotState[id]||"";
  const note=st==="hit"?"Fund!":(S.spotNote[id]||(type==="panel"?"verschlossen, "+TOOL_NAMES[tool]:TYPE_LABEL[type]));
  return `<button class="tile ${type} ${st}" data-spot="${id}"><b>${name}</b><small>${note}</small></button>`;
}
function itemTile(it,k){
  const id="i:"+k, st=S.spotState[id]||"", pend=S.pendingSeize===id;
  return `<button class="tile item ${st} ${pend?"pending":""}" data-item="${k}"><b>${it.name}</b><small>${it.count} ${it.unit}${pend?" – nochmal tippen":""}</small></button>`;
}

function renderSearch(){
  const t=S.cur, m=CAR_MODELS[t.car.model], v=$("searchView");
  $("tools").style.display=S.view==="overview"?"none":"flex";
  $("bBack").textContent=S.view==="overview"?"Zurück in die Hütte":S.view==="close"?"Zurück":"Zur Übersicht";
  document.querySelectorAll(".tool").forEach(b=>b.classList.toggle("on",b.dataset.tool===S.tool));
  if(S.view==="close"){ if(!S.close.built) renderCloseup(v); return; }
  if(S.view==="overview"){
    $("searchTitle").textContent=m.name+", "+t.car.plate;
    v.innerHTML=`<div id="carWrap">${carSVG(t.car.model,t.car.color,t.car.low)}${
      m.areas.map((a,i)=>`<button class="area" data-area="${i}" style="left:${a[1][0]}%;top:${a[1][1]}%">${a[0]}</button>`).join("")}</div>
      <button class="area bag" data-area="bag">Gepäck öffnen</button>`;
  } else if(S.view==="bag"){
    $("searchTitle").textContent="Gepäck";
    const decl=t.bag.filter(i=>i.declared).map(i=>`${i.name}: ${i.declared} ${i.unit}`).join("<br>")||"keine Waren";
    v.innerHTML=`<div class="bagWrap"><div class="tiles">${t.bag.map(itemTile).join("")}${
      BAG_SPOTS.map((s,i)=>spotTile("b:"+i,s)).join("")}</div>
      <div class="declCopy"><b>Deklaracja celna</b><br>${decl}</div></div>`;
  } else {
    const a=m.areas[S.view];
    $("searchTitle").textContent=a[0];
    v.innerHTML=`<div class="tiles">${a[2].map((s,i)=>spotTile(`c:${S.view}:${i}`,s)).join("")}</div>`;
  }
}

function useTool(id){
  const [name,type,tool]=spotById(id,S.cur);
  if(S.spotState[id]) return setSearchMsg(name+": schon durchsucht.");
  const hit=!!S.cur.contraband&&S.cur.contraband.spot===id;
  if(type==="panel"){
    if(S.tool==="knock"){
      S.min+=COST.knock;
      const full=hit||S.cur.falseSpot===id;
      S.spotNote[id]=full?"klingt dumpf":"klingt hohl";
      setSearchMsg(name+": "+(full?"dumpf und voll. Da könnte etwas drin sein.":"hohl, klingt normal."));
    } else {
      S.prevView=S.view; S.view="close";
      S.close={id,name,tool,hit,built:false,cutLen:0,screws:0,pulls:0,opened:false};
      S.min+=COST.look;
    }
    updateHUD(); renderSearch(); return;
  }
  if(S.tool==="knock") return setSearchMsg("Klopfen bringt hier nichts.");
  if(S.tool==="lamp"||(type==="open"&&S.tool==="hand")){S.min+=COST.look;reveal(id,name,hit)}
  else if(type==="dark"&&S.tool==="hand"){S.min+=COST.look;S.spotNote[id]="zu dunkel";setSearchMsg(name+": zu dunkel. Nimm die Taschenlampe.")}
  else return setSearchMsg("Mit dem "+TOOL_NAMES[S.tool]+" kommst du hier nicht weiter. Nimm die Hand oder die Taschenlampe.");
  updateHUD(); renderSearch();
}
function reveal(id,name,hit){
  if(hit){S.spotState[id]="hit";S.found=S.cur.contraband.desc;setSearchMsg("Gefunden: "+S.found+"! Du kannst jetzt festnehmen.");return}
  S.spotState[id]="open"; S.spotNote[id]="leer"; setSearchMsg(name+": nichts Verdächtiges.");
}
function seize(k){
  const id="i:"+k, it=S.cur.bag[k];
  if(S.spotState[id]) return setSearchMsg(it.name+": bereits geprüft.");
  if(S.pendingSeize!==id){S.pendingSeize=id;renderSearch();return setSearchMsg(it.name+": nochmal tippen, um zu beschlagnahmen.")}
  S.pendingSeize=null; S.min+=COST.look;
  if(S.cur.contraband&&S.cur.contraband.spot===id){
    S.spotState[id]="hit"; S.found=S.cur.contraband.desc;
    setSearchMsg("Beschlagnahmt: "+S.found+". Du kannst jetzt festnehmen.");
  } else {
    S.spotState[id]="open"; S.money-=WRONG_SEIZE;
    setSearchMsg(it.name+" war korrekt deklariert. Beschwerde: −"+WRONG_SEIZE+" zł.");
  }
  updateHUD(); renderSearch();
}

$("searchView").addEventListener("click",e=>{
  if(S.busy||S.view==="close") return;
  const area=e.target.closest("[data-area]");
  if(area){
    S.view=area.dataset.area==="bag"?"bag":Number(area.dataset.area);
    S.min+=COST.area; updateHUD();
    setSearchMsg(S.view==="bag"?"Vergleiche mit der Deklaracja. Ware doppelt antippen zum Beschlagnahmen, Fächer mit Werkzeug prüfen."
      :"Wähle ein Werkzeug und tippe auf eine Stelle.");
    renderSearch(); return;
  }
  const sp=e.target.closest("[data-spot]");
  if(sp){useTool(sp.dataset.spot);return}
  const it=e.target.closest("[data-item]");
  if(it) seize(Number(it.dataset.item));
});
document.querySelectorAll(".tool").forEach(b=>b.addEventListener("click",()=>{S.tool=b.dataset.tool;renderSearch()}));
$("bBack").onclick=()=>{
  if(S.view==="close"){finishClose();S.view=S.prevView;S.close=null;renderSearch();return}
  if(S.view==="overview"){$("carScene").classList.remove("show");return}
  S.view="overview"; S.pendingSeize=null; setSearchMsg("Wähle einen Bereich oder öffne das Gepäck."); renderSearch();
};
