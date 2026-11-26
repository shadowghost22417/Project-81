// Dokumente, Pass, Stempel, Lupe und Prüfmodus

const PAGE_W=190, ZOOM=2.2;
const T=(pl,de)=>pl+(S.day===1?`<span class="tr">${de}</span>`:"");

function faceSVG(f,photo){
  return `<svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMax meet">
    <path d="M8 120 Q14 86 50 84 Q86 86 92 120Z" fill="${f.coat}"/>
    <rect x="42" y="76" width="16" height="12" fill="${f.skin}"/>
    <ellipse cx="50" cy="52" rx="25" ry="30" fill="${f.skin}"/>
    <path d="M25 50 Q26 18 50 18 Q74 18 75 50 Q70 32 50 30 Q30 32 25 50Z" fill="${f.hair}"/>
    <circle cx="41" cy="52" r="3" fill="#222"/><circle cx="59" cy="52" r="3" fill="#222"/>
    ${f.glasses?`<g fill="none" stroke="#222" stroke-width="2"><circle cx="41" cy="52" r="7"/><circle cx="59" cy="52" r="7"/><line x1="48" y1="52" x2="52" y2="52"/></g>`:""}
    <path d="M42 68 Q50 72 58 68" stroke="#6a3b2b" stroke-width="2" fill="none"/>
    ${f.beard?`<path d="M28 60 Q30 86 50 86 Q70 86 72 60 Q66 76 50 76 Q34 76 28 60Z" fill="${f.hair}"/>`:""}
    ${f.hat&&!photo?`<rect x="22" y="12" width="56" height="20" rx="8" fill="#4b3a2a"/>`:""}
  </svg>`;
}
const photoHTML=(face,key)=>`<div class="photo f" data-k="${key}">${faceSVG(face,true)}</div>`;

function carSVG(mi,color,low){
  const m=CAR_MODELS[mi], dy=low?7:0;
  return `<svg viewBox="0 0 400 200"><ellipse cx="200" cy="176" rx="170" ry="8" fill="rgba(0,0,0,.25)"/>
    <g transform="translate(0,${dy})"><path d="${m.body}" fill="${color}" stroke="#2e2a1e" stroke-width="3"/>
    ${m.win.map(w=>`<path d="${w}" fill="#9fb6c2" stroke="#2e2a1e" stroke-width="2"/>`).join("")}</g>
    ${m.wheels.map(x=>`<circle cx="${x}" cy="152" r="${m.r}" fill="#222"/><circle cx="${x}" cy="152" r="${m.r*.4}" fill="#888"/>`).join("")}
  </svg>`;
}

// ---------- Ziehen mit dem Finger ----------
function makeDraggable(el,onDrop,handle,onMove){
  el.addEventListener("pointerdown",e=>{
    el._moved=false;
    if(S.checkMode||S.busy||S.flipping||e.target.closest(".nodrag")) return;
    if(handle&&!e.target.closest(handle)) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.style.zIndex=el.classList.contains("stamp")?100001:el.id==="lens"?99999:++S.z;
    const d=$("desk").getBoundingClientRect(), r=el.getBoundingClientRect();
    const ox=e.clientX-r.left, oy=e.clientY-r.top;
    const move=ev=>{
      el._moved=true;
      el.style.left=Math.max(0,Math.min(d.width-r.width,ev.clientX-d.left-ox))+"px";
      el.style.top=Math.max(0,Math.min(d.height-r.height,ev.clientY-d.top-oy))+"px";
      if(onMove) onMove(el);
    };
    const up=ev=>{
      el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);
      if(onDrop) onDrop(el,ev);
    };
    el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
  });
}
function overlaps(a,b){
  const r=a.getBoundingClientRect(), s=b.getBoundingClientRect();
  return !(r.right<s.left||r.left>s.right||r.bottom<s.top||r.top>s.bottom);
}
function placeDoc(cls,html,xFrac,y,onDrop,handle){
  const desk=$("desk"), el=document.createElement("div");
  el.className="doc "+cls; el.innerHTML=html; desk.appendChild(el);
  el.style.left=Math.max(0,Math.min(desk.clientWidth-el.offsetWidth,desk.clientWidth*xFrac))+"px";
  el.style.top=Math.max(0,Math.min(desk.clientHeight-el.offsetHeight,y))+"px";
  el.style.zIndex=++S.z;
  makeDraggable(el,onDrop,handle); return el;
}
function clampDoc(el,left){
  const d=$("desk"), x=left===undefined?el.offsetLeft:left;
  el.style.left=Math.max(0,Math.min(x,d.clientWidth-el.offsetWidth))+"px";
  el.style.top=Math.max(0,Math.min(el.offsetTop,d.clientHeight-el.offsetHeight))+"px";
}
function foldable(el){
  el.querySelector("h3").addEventListener("click",()=>{if(!el._moved&&!S.checkMode){el.classList.toggle("mini");clampDoc(el)}});
}

// ---------- Feste Dokumente der Schicht ----------
function renderRules(){
  const el=placeDoc("rules keep",`<h3>${T("Instrukcja – dzień "+S.day,"Dienstanweisung")}<small>antippen: ein/aus</small></h3><ol>
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
    <li>Fälschung, Schmuggel oder List gończy: Festnahme.</li></ol>`,0.005,52);
  if(S.day>1) el.classList.add("mini");
  foldable(el);
}
function renderWanted(){
  const el=placeDoc("wanted keep",`<h3>${T("List gończy","Fahndungsliste")}<small>antippen: ein/aus</small></h3>${
    S.wantedList.map((w,i)=>`<div class="row wrow"><div class="photo f" data-k="wanted.${i}">${faceSVG(w.face,true)}</div>
      <div>${w.name}<br><small>${w.reason}</small></div></div>`).join("")}`,0.005,9999);
  foldable(el);
}

// ---------- Dokumente der Reisenden ----------
function renderTravelerDocs(){
  document.querySelectorAll(".doc:not(.keep)").forEach(e=>e.remove());
  const t=S.cur, c=t.car;

  placeDoc("id",`<h3>${T("Dowód osobisty","Personalausweis")}</h3><div class="row">${photoHTML(t.photoFace,"id.photo")}<div>
    <small>Name</small><br><span class="f" data-k="id.name">${t.name}</span><br>
    <small>Geburtsdatum</small><br>${fmt(t.birth)}<br>
    <small>Wohnort</small><br>${t.city}<br>
    <small>Ausweisnummer</small><br><span class="f" data-k="id.nr">${t.id}</span></div></div>`,0.2,60);

  if(t.hasPermit) placeDoc("permit",`<h3>${T("Przepustka","Passierschein")}</h3>
    <small>Name</small><br><span class="f" data-k="permit.name">${t.permitName}</span><br>
    <small>Reiseziel</small><br><span class="f" data-k="permit.dest">${t.dest}</span><br>
    <small>Gültig bis</small><br><span class="f" data-k="permit.expiry">${fmt(t.permitUntil)}</span><br>
    <span class="wron">WRON</span>`,0.37,70);

  placeDoc("reg",`<h3>${T("Dowód rejestracyjny","Fahrzeugschein")}</h3>
    <small>Kennzeichen</small><br><span class="f" data-k="reg.plate">${c.regPlate}</span><br>
    <small>Marke und Typ</small><br><span class="f" data-k="reg.model">${CAR_MODELS[c.regModel].name}</span><br>
    <small>Baujahr</small><br>${c.year}<br>
    <small>Halter</small><br><span class="f" data-k="reg.owner">${c.owner}</span>`,0.52,56);

  const decl=t.bag.filter(i=>i.declared).map(i=>`${i.name}: ${i.declared} ${i.unit}`).join("<br>")||"keine Waren";
  placeDoc("decl",`<h3>${T("Deklaracja celna","Zollerklärung")}</h3><small>Angemeldete Waren</small><br>${decl}<br><br>
    <small>Unterschrift</small><div class="sign">${t.name.split(" ")[1]}</div>`,0.66,80);

  if(t.auth) placeDoc("auth",`<h3>${T("Upoważnienie","Vollmacht")}</h3>Ich, ${c.owner}, bevollmächtige<br>
    <span class="f" data-k="auth.name">${t.name}</span><br>zur Nutzung des Fahrzeugs ${c.regPlate}.
    <div class="sign">${c.owner.split(" ")[1]}</div>`,0.6,150);

  const pass=placeDoc("pass","",0.3,150,onPassDrop,".grip");
  pass.id="passport"; renderPass();
  pass.addEventListener("pointerdown",e=>{
    if(!e.target.closest(".spread")) return;
    const x0=e.clientX;
    const up=ev=>{window.removeEventListener("pointerup",up);const dx=ev.clientX-x0;if(Math.abs(dx)>35)flipPass(dx<0?1:-1)};
    window.addEventListener("pointerup",up);
  });
}

// ---------- Pass ----------
function renderPass(){
  const el=$("passport"), t=S.cur, p=S.passSpread;
  el.classList.toggle("closed",p===0);
  let inner;
  if(p===0) inner=`<div class="pg cover"><div class="crest"></div>POLSKA<br>RZECZPOSPOLITA<br>LUDOWA<b>PASZPORT</b><div class="swipe">‹ wischen zum Öffnen</div></div>`;
  else if(p===1) inner=`<div class="pg left"><div class="row">${photoHTML(t.photoFace,"pass.photo")}<div>
      <small>Name</small><br><span class="f" data-k="pass.name">${t.passName}</span><br>
      <small>Ausweisnummer</small><br><span class="f" data-k="pass.nr">${t.passId}</span></div></div>
      <small>Passnummer</small><br>${t.passNr}<br>
      <small>Gültig bis</small><br><span class="f" data-k="pass.expiry">${fmt(t.passExpiry)}</span></div>
    <div class="pg right"><small>Frühere Grenzübertritte</small><div class="history">${
      t.history.map(h=>`<span class="old">${h.place}<br>${fmt(h.date)}</span>`).join("")||"<i>keine Einträge</i>"}</div></div>`;
  else inner=`<div class="pg left"><small>Amtliche Vermerke</small><p class="official">Gültig für Reisen in die DDR.</p></div>
    <div class="pg right"><small>Kontrollstempel</small><div class="stampArea" id="stampArea">${S.mark?imprintHTML(S.mark):""}</div></div>`;
  el.innerHTML=`<div class="grip"><span>Paszport${S.day===1?" (Reisepass)":""}</span><span>${p?p+"/2":""}</span></div><div class="spread">${inner}</div>`;
  clampDoc(el);
  markSelected();
}
function staticClone(node){
  const c=node.cloneNode(true);
  c.removeAttribute("id"); c.style.visibility=""; c.style.display="";
  c.querySelectorAll("[id],[data-k]").forEach(e=>{e.removeAttribute("id");e.removeAttribute("data-k")});
  return c;
}
function flipPass(dir){
  if(S.flipping) return;
  const p=S.passSpread, n=Math.max(0,Math.min(2,p+dir));
  if(n===p) return;
  const el=$("passport"), x=el.offsetLeft;
  if(n===0){S.passSpread=0;renderPass();clampDoc(el,x+PAGE_W);return}

  const oldLeft=el.querySelector(".pg.left"), oldRight=el.querySelector(".pg.right,.pg.cover");
  const front=staticClone(dir>0?oldRight:oldLeft);
  const keep=dir>0?(oldLeft?staticClone(oldLeft):null):staticClone(oldRight);

  S.passSpread=n; renderPass();
  if(p===0) clampDoc(el,x-PAGE_W);
  if(n===2) setHint("Stempelseite offen. Ziehe einen Stempel auf die rechte Seite.");
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target=el.querySelector(dir>0?".pg.left":".pg.right");
  const rear=staticClone(target);
  let under=keep;
  if(!under){under=document.createElement("div");under.className="pg left ghost";el.classList.add("opening")}
  target.style.display="none";
  target.parentNode.insertBefore(under,target);

  front.classList.add("face","front"); rear.classList.add("face","rear");
  const leaf=document.createElement("div");
  leaf.className="leaf "+(dir>0?"fwd":"bwd");
  leaf.appendChild(front); leaf.appendChild(rear);
  el.querySelector(".spread").appendChild(leaf);

  S.flipping=true;
  setTimeout(()=>{leaf.remove();under.remove();target.style.display="";el.classList.remove("opening");S.flipping=false},470);
}
function onPassDrop(el){
  if(!overlaps(el,$("slot"))) return;
  if(!S.mark){toast("Der Pass muss zuerst gestempelt werden.","info");return}
  decide(S.mark.type==="ok"?"approve":"reject");
}

// ---------- Stempel ----------
const imprintHTML=m=>`<span class="imprint ${m.type}" style="left:${m.x}%;top:${m.y}%;transform:translate(-50%,-50%) rotate(${m.rot}deg)">${
  m.type==="ok"?"ZEZWOLONO":"ODMOWA"}<br><small>ZGORZELEC ${fmt(S.date)}</small></span>`;

function setupStamps(){document.querySelectorAll(".stamp").forEach(st=>makeDraggable(st,onStampDrop));homeStamps()}
function homeStamps(){
  const d=$("desk");
  document.querySelectorAll(".stamp").forEach((st,i)=>{
    st.style.left=(d.clientWidth-128)+"px"; st.style.top=(d.clientHeight-74-i*86)+"px"; st.style.zIndex=100000;
  });
}
function onStampDrop(st){
  const area=$("stampArea"), r=st.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.bottom-4;
  if(!area||S.flipping) toast("Blättere im Pass bis zur Stempelseite.","info");
  else{
    const a=area.getBoundingClientRect();
    if(cx>a.left&&cx<a.right&&cy>a.top&&cy<a.bottom){
      if(S.mark) toast("Der Pass ist bereits gestempelt.","info");
      else{
        S.mark={type:st.dataset.type,x:(cx-a.left)/a.width*100,y:(cy-a.top)/a.height*100,rot:rint(-14,14)};
        area.innerHTML=imprintHTML(S.mark);
        // Abdruck vollständig auf das Papier schieben
        const ir=area.firstElementChild.getBoundingClientRect(); let dx=0,dy=0;
        if(ir.left<a.left) dx=a.left-ir.left; else if(ir.right>a.right) dx=a.right-ir.right;
        if(ir.top<a.top) dy=a.top-ir.top; else if(ir.bottom>a.bottom) dy=a.bottom-ir.bottom;
        if(dx||dy){S.mark.x+=dx/a.width*100;S.mark.y+=dy/a.height*100;area.innerHTML=imprintHTML(S.mark)}
        st.classList.add("press"); setTimeout(()=>st.classList.remove("press"),150);
        setHint("Gestempelt. Ziehe den Pass am oberen Rand in die Durchreiche.");
      }
    } else toast("Daneben. Setze den Stempel auf die Stempelseite.","info");
  }
  setTimeout(homeStamps,150);
}

// ---------- Lupe ----------
let lensQueued=false;
function setupLens(){makeDraggable($("lens"),updateLens,null,requestLens);homeLens();setInterval(updateLens,800)}
function homeLens(){const d=$("desk"),l=$("lens");l.style.left=(d.clientWidth-300)+"px";l.style.top=(d.clientHeight-170)+"px";l.style.zIndex=99999}
function requestLens(){if(lensQueued)return;lensQueued=true;requestAnimationFrame(()=>{lensQueued=false;updateLens()})}
function updateLens(){
  const lens=$("lens"), view=$("lensView"); if(!lens||!view) return;
  const r=view.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
  const hitEl=document.elementsFromPoint(cx,cy).find(e=>!e.closest("#lens")&&e.closest(".doc"));
  const doc=hitEl?hitEl.closest(".doc"):null;
  view.innerHTML=""; if(!doc) return;
  const dr=doc.getBoundingClientRect(), c=document.createElement("div");
  c.className=doc.className; c.innerHTML=doc.innerHTML;
  c.querySelectorAll("[id],[data-k]").forEach(e=>{e.removeAttribute("id");e.removeAttribute("data-k")});
  c.style.cssText=`left:0;top:0;width:${doc.offsetWidth}px;transform-origin:0 0;`+
    `transform:translate(${r.width/2-(cx-dr.left)*ZOOM}px,${r.height/2-(cy-dr.top)*ZOOM}px) scale(${ZOOM})`;
  view.appendChild(c);
}

// ---------- Prüfmodus ----------
function toggleCheck(force){
  S.checkMode=typeof force==="boolean"?force:!S.checkMode;
  S.sel=[]; markSelected();
  document.body.classList.toggle("checking",S.checkMode);
  $("bCheck").classList.toggle("on",S.checkMode);
  $("bCheck").textContent=S.checkMode?"Prüfmodus beenden":"Prüfmodus";
  setHint(S.checkMode?"Tippe zwei Angaben an, die nicht zusammenpassen: Namen, Nummern, Fotos, Gesicht, Datum, Auto oder Aussagen.":"");
}
function markSelected(){
  document.querySelectorAll("[data-k]").forEach(e=>e.classList.toggle("sel",S.sel.includes(e.dataset.k)));
}
function comparePair(a,b){
  const t=S.cur, c=t.car, has=(x,y)=>(a===x&&b===y)||(a===y&&b===x);
  const val={"id.name":t.name,"pass.name":t.passName,"permit.name":t.permitName,"auth.name":t.name,"id.nr":t.id,"pass.nr":t.passId};
  const isName=k=>k.endsWith(".name"), isPhoto=k=>k.endsWith(".photo"), isWanted=k=>k.startsWith("wanted.");
  const isFace=k=>k==="face"||isPhoto(k);
  if((isWanted(a)&&isFace(b))||(isWanted(b)&&isFace(a))){
    const i=Number((isWanted(a)?a:b).split(".")[1]);
    return t.wanted===i?{forgery:true,text:"Die Person steht auf dem List gończy."}:null;
  }
  if(isWanted(a)||isWanted(b)) return "none";
  if(isName(a)&&isName(b)) return val[a]!==val[b]?{forgery:true,text:"Die Namen stimmen nicht überein."}:null;
  if((a==="reg.owner"&&isName(b))||(b==="reg.owner"&&isName(a))){
    if(c.owner===t.name) return null;
    return t.auth?"auth":{forgery:true,text:"Fremdes Auto ohne Upoważnienie."};
  }
  if(has("id.nr","pass.nr")) return val[a]!==val[b]?{forgery:true,text:"Die Ausweisnummern stimmen nicht überein."}:null;
  if(has("reg.plate","car.plate")) return c.plate!==c.regPlate?{forgery:true,text:"Das Kennzeichen passt nicht zum Dowód rejestracyjny."}:null;
  if(has("reg.model","car.model")) return c.model!==c.regModel?{forgery:true,text:"Das Auto ist ein anderes Modell als im Dowód rejestracyjny."}:null;
  if(has("ans.dest","permit.dest")) return t.answers.dest!==t.dest?{forgery:true,text:"Die Aussage zum Reiseziel widerspricht der Przepustka."}:null;
  if(has("ans.owner","reg.owner")) return t.answers.claimOwner!==c.owner?{forgery:true,text:"Die Aussage zum Halter widerspricht dem Dowód rejestracyjny."}:null;
  if((isPhoto(a)&&b==="face")||(isPhoto(b)&&a==="face")) return t.flaw==="photo"?{forgery:true,text:"Das Foto zeigt eine andere Person."}:null;
  if(isPhoto(a)&&isPhoto(b)) return null;
  if(has("pass.expiry","date")) return t.passExpiry<S.date?{forgery:false,text:"Der Paszport ist abgelaufen."}:null;
  if(has("permit.expiry","date")) return t.permitUntil<S.date?{forgery:false,text:"Die Przepustka ist abgelaufen."}:null;
  return "none";
}
document.addEventListener("click",e=>{
  if(!S.checkMode||S.busy) return;
  const f=e.target.closest("[data-k]"); if(!f) return;
  const k=f.dataset.k; if(S.sel.includes(k)) return;
  S.sel.push(k); markSelected();
  if(S.sel.length<2) return;
  const res=comparePair(S.sel[0],S.sel[1]);
  if(res==="none") toast("Diese Angaben kann man nicht vergleichen.","info");
  else if(res==="auth") toast("Fremdes Auto, aber es liegt eine Upoważnienie vor.","info");
  else if(!res) toast("Kein Widerspruch.","info");
  else{ toast("Unstimmigkeit: "+res.text,"bad"); if(res.forgery) S.evidence=res; updateHUD(); }
  setTimeout(()=>{S.sel=[];markSelected()},900);
});
