// Hütte: Wanduhr, Kalender, Notizzettel, Mappe, Rotstift, Handschellen

const MONTHS_PL=["STYCZEŃ","LUTY","MARZEC","KWIECIEŃ","MAJ","CZERWIEC","LIPIEC","SIERPIEŃ","WRZESIEŃ","PAŹDZIERNIK","LISTOPAD","GRUDZIEŃ"];

// ---------- Wand ----------
$("ticks").innerHTML=Array.from({length:12},(_,i)=>
  `<line x1="50" y1="8" x2="50" y2="${i%3?13:17}" stroke="#3a3328" stroke-width="${i%3?1.5:3}" transform="rotate(${i*30} 50 50)"/>`).join("");
function updateWall(){
  const h=Math.floor(S.min/60)%12, m=S.min%60;
  $("mHand").setAttribute("transform",`rotate(${m*6} 50 50)`);
  $("hHand").setAttribute("transform",`rotate(${h*30+m*.5} 50 50)`);
  $("calMonth").textContent=MONTHS_PL[S.date.getMonth()];
  $("calDay").textContent=S.date.getDate();
  $("calYear").textContent=S.date.getFullYear();
}
function tearCalendar(){
  const c=$("calendar"), s=c.cloneNode(true);
  s.removeAttribute("id"); s.removeAttribute("data-k");
  s.querySelectorAll("[id]").forEach(e=>e.removeAttribute("id"));
  s.classList.add("sheet");
  s.style.left=c.offsetLeft+"px"; s.style.top=c.offsetTop+"px"; s.style.width=c.offsetWidth+"px";
  $("wall").appendChild(s); setTimeout(()=>s.remove(),800);
}
function setHint(m){$("note").textContent=m||""}

// ---------- Eigene Unterlagen in der Mappe ----------
function renderRules(){
  return placeDoc("rules keep",`<h3>${T("Instrukcja – dzień "+S.day,"Dienstanweisung")}</h3><ol>
    <li>Ausreise nur mit Dowód, Paszport und Przepustka.</li>
    <li>Der Paszport muss gültig sein.</li>
    <li>Alle Namen exakt gleich, auch ą, ł, ś usw.</li>
    <li>Die Ausweisnummer im Paszport muss stimmen.</li>
    <li>Die Przepustka muss heute gültig sein.</li>
    <li>Das Foto muss die Person zeigen.</li>
    <li>Kennzeichen und Modell wie im Dowód rejestracyjny.</li>
    <li>Fremdes Auto nur mit Upoważnienie.</li>
    <li>Gepäck muss vollständig deklariert sein.</li>
    <li>Aussagen müssen zu den Papieren passen.</li>
    <li>Fälschung, Schmuggel oder List gończy: Festnahme.</li></ol>`,0.01,50,onOwnDrop);
}
function renderWanted(){
  return placeDoc("wanted keep",`<h3>${T("List gończy","Fahndungsliste")}</h3>${
    S.wantedList.map((w,i)=>`<div class="row wrow"><div class="photo f" data-k="wanted.${i}">${faceSVG(w.face,true)}</div>
      <div>${w.name}<br><small>${w.reason}</small></div></div>`).join("")}`,0.14,60,onOwnDrop);
}
function logHTML(){
  return `<h3>${T("Dziennik służby","Dienstbuch")}</h3><small>Datum</small><br>${fmt(S.date)}<br>
    <small>Richtig / Fehler</small><br>${S.correct} / ${S.errors}<br><small>Kontostand</small><br>${S.money} zł`;
}
function renderLog(){return placeDoc("log keep",logHTML(),0.02,180,onOwnDrop)}
function updateLog(){const el=$("own-log");if(el) el.innerHTML=logHTML()}

const OWN_DOCS={rules:["Instrukcja",renderRules],wanted:["List gończy",renderWanted],log:["Dziennik służby",renderLog]};
function takeOut(k){
  let el=$("own-"+k);
  if(el){el.style.zIndex=++S.z;return}
  el=OWN_DOCS[k][1](); el.id="own-"+k; markSelected();
}
function onOwnDrop(el,ev){
  if(ev&&pointIn(ev.clientX,ev.clientY,$("folder"))){el.remove();toggleFolderMenu(false);toast("In die Mappe gelegt.","info")}
}
function toggleFolderMenu(force){
  const m=$("folderMenu"), show=typeof force==="boolean"?force:!m.classList.contains("show");
  if(show) m.innerHTML=Object.entries(OWN_DOCS).map(([k,d])=>`<button data-own="${k}">${d[0]}${$("own-"+k)?" (auf dem Tisch)":""}</button>`).join("");
  m.classList.toggle("show",show); $("folder").classList.toggle("open",show);
}
$("folder").addEventListener("click",()=>{if(!S.checkMode&&!S.busy) toggleFolderMenu()});
$("folderMenu").addEventListener("click",e=>{
  const b=e.target.closest("[data-own]"); if(!b) return;
  takeOut(b.dataset.own); toggleFolderMenu(false);
});

// ---------- Rotstift ----------
$("pencil").addEventListener("click",()=>{if(!S.busy) toggleCheck()});

// ---------- Frei ziehen (Handschellen, Werkzeuge) ----------
function freeDrag(el,onDrop,canStart){
  el.addEventListener("pointerdown",e=>{
    if(canStart&&!canStart()) return;
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    const r=el.getBoundingClientRect(), ox=e.clientX-r.left, oy=e.clientY-r.top;
    const ghost=el.cloneNode(true); ghost.removeAttribute("id"); ghost.classList.add("dragGhost");
    ghost.style.cssText=`position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:300000;pointer-events:none`;
    document.body.appendChild(ghost); el.style.opacity=".3";
    const move=ev=>{ghost.style.left=(ev.clientX-ox)+"px";ghost.style.top=(ev.clientY-oy)+"px"};
    const up=ev=>{
      el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);
      ghost.remove(); el.style.opacity=""; onDrop(ev.clientX,ev.clientY);
    };
    el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
  });
}

// ---------- Handschellen ----------
freeDrag($("cuffs"),(x,y)=>{if(pointIn(x,y,$("traveler"))) arrest()},()=>!S.busy&&!S.checkMode);
