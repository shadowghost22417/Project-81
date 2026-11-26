// Hütte: Uhr, Kalender, Notizzettel, Mappe, Rotstift, Handschellen

const MONTHS_PL=["STYCZEŃ","LUTY","MARZEC","KWIECIEŃ","MAJ","CZERWIEC","LIPIEC","SIERPIEŃ","WRZESIEŃ","PAŹDZIERNIK","LISTOPAD","GRUDZIEŃ"];

function updateWall(){
  drawClock(S.min);
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

// ---------- Eigene Unterlagen in der Teczka ----------
function renderRules(){
  return placeDoc("rules keep",`<h3>${T("Instrukcja – dzień "+S.day,"Dienstanweisung")}</h3><ol>
    <li>Ausreise nur mit Dowód, Paszport und Przepustka.</li>
    <li>Der Paszport muss gültig sein.</li>
    <li>Alle Namen exakt gleich, auch ą, ł, ś usw.</li>
    <li>Die Ausweisnummer im Paszport muss stimmen.</li>
    <li>Die Przepustka muss heute gültig sein.</li>
    <li>Das Foto muss die Person zeigen.</li>
    <li>Kennzeichen (draußen ablesen) und Modell (siehe Fahrzeugtypen) wie im Dowód rejestracyjny.</li>
    <li>Fremdes Auto nur mit Upoważnienie.</li>
    <li>Gepäck muss vollständig deklariert sein.</li>
    <li>Aussagen müssen zu den Papieren passen.</li>
    <li>Fälschung, Schmuggel oder List gończy: Festnahme.</li></ol>`,0.01,50,onOwnDrop);
}
function renderWanted(){
  return placeDoc("wanted keep",`<h3>${T("List gończy","Fahndungsliste")}</h3>${
    S.wantedList.map((w,i)=>`<div class="row wrow"><div class="photo f" data-k="wanted.${i}"><img class="px" src="${facePhoto(w.face)}" alt=""></div>
      <div>${w.name}<br><small>${w.reason}</small></div></div>`).join("")}`,0.14,60,onOwnDrop);
}
function renderTypes(){
  return placeDoc("types keep",`<h3>${T("Typy pojazdów","Fahrzeugtypen")}</h3><div class="types">${
    CAR_MODELS.map((m,i)=>`<figure><img class="px" src="${carPhoto(i)}" alt=""><figcaption>${m.name}</figcaption></figure>`).join("")}</div>`,0.3,40,onOwnDrop);
}
function logHTML(){
  return `<h3>${T("Dziennik służby","Dienstbuch")}</h3><small>Datum</small><br>${fmt(S.date)}<br>
    <small>Richtig / Fehler</small><br>${S.correct} / ${S.errors}<br><small>Kontostand</small><br>${S.money} zł`;
}
function renderLog(){return placeDoc("log keep",logHTML(),0.02,180,onOwnDrop)}
function updateLog(){const el=$("own-log");if(el) el.innerHTML=logHTML()}

const OWN_DOCS={rules:["Instrukcja",renderRules],wanted:["List gończy",renderWanted],
  types:["Typy pojazdów",renderTypes],log:["Dziennik służby",renderLog]};
function takeOut(k){
  let el=$("own-"+k);
  if(el){el.style.zIndex=++S.z;return}
  el=OWN_DOCS[k][1](); el.id="own-"+k; markSelected();
}
function putBack(k){const el=$("own-"+k);if(el){el.remove();toast(OWN_DOCS[k][0]+" liegt wieder in der Teczka.","info")}}
function onOwnDrop(el,ev){
  if(ev&&pointIn(ev.clientX,ev.clientY,$("folder"))){putBack(el.id.replace("own-",""));toggleFolderMenu(false)}
}
function toggleFolderMenu(force){
  const m=$("folderMenu"), show=typeof force==="boolean"?force:!m.classList.contains("show");
  if(show) m.innerHTML=Object.entries(OWN_DOCS).map(([k,d])=>$("own-"+k)
    ?`<button data-put="${k}">${d[0]} zurücklegen</button>`:`<button data-own="${k}">${d[0]} herausnehmen</button>`).join("");
  m.classList.toggle("show",show); $("folder").classList.toggle("open",show);
}
$("folder").addEventListener("click",()=>{if(!S.checkMode&&!S.busy) toggleFolderMenu()});
$("folderMenu").addEventListener("click",e=>{
  const o=e.target.closest("[data-own]"), p=e.target.closest("[data-put]");
  if(o) takeOut(o.dataset.own);
  if(p) putBack(p.dataset.put);
  if(o||p) toggleFolderMenu(false);
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
    ghost.style.position="fixed"; ghost.style.left=r.left+"px"; ghost.style.top=r.top+"px";
    ghost.style.width=r.width+"px"; ghost.style.height=r.height+"px"; ghost.style.margin="0";
    ghost.style.zIndex="300000"; ghost.style.pointerEvents="none"; ghost.style.right="auto"; ghost.style.bottom="auto";
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
