// Dokumente, Pass, Stempel und Prüfmodus

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

// ---------- Ziehen mit dem Finger ----------
function makeDraggable(el,onDrop){
  el.addEventListener("pointerdown",e=>{
    if(S.checkMode||S.busy||e.target.closest(".nodrag")) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.style.zIndex=el.classList.contains("stamp")?100001:++S.z;
    const d=$("desk").getBoundingClientRect(), r=el.getBoundingClientRect();
    const ox=e.clientX-r.left, oy=e.clientY-r.top;
    const move=ev=>{
      el.style.left=Math.max(0,Math.min(d.width-r.width,ev.clientX-d.left-ox))+"px";
      el.style.top=Math.max(0,Math.min(d.height-r.height,ev.clientY-d.top-oy))+"px";
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
function placeDoc(cls,html,xFrac,y,onDrop){
  const desk=$("desk"), el=document.createElement("div");
  el.className="doc "+cls; el.innerHTML=html; desk.appendChild(el);
  el.style.left=Math.max(0,Math.min(desk.clientWidth-el.offsetWidth,desk.clientWidth*xFrac))+"px";
  el.style.top=y+"px"; el.style.zIndex=++S.z;
  makeDraggable(el,onDrop); return el;
}

// ---------- Dokumente ----------
function renderRules(){
  placeDoc("rules keep",`<h3>Instrukcja – dzień ${S.day}</h3><ol>
    <li>Ausreise in die DDR nur mit Dowód, Paszport und Przepustka.</li>
    <li>Der Paszport muss gültig sein.</li>
    <li>Alle Namen müssen exakt übereinstimmen, auch ą, ł, ś usw.</li>
    <li>Die Dowód-Nummer im Paszport muss stimmen.</li>
    <li>Die Przepustka muss heute gültig sein.</li>
    <li>Das Foto muss die Person zeigen.</li>
    <li>Fälschung oder Schmuggel: Festnahme.</li></ol>`,0.01,52);
}
function renderTravelerDocs(){
  document.querySelectorAll(".doc:not(.keep)").forEach(e=>e.remove());
  const t=S.cur;
  placeDoc("id",`<h3>Dowód osobisty</h3><div class="row">${photoHTML(t.photoFace,"id.photo")}<div>
    <small>Imię i nazwisko</small><br><span class="f" data-k="id.name">${t.name}</span><br>
    <small>Data urodzenia</small><br>${fmt(t.birth)}<br>
    <small>Miejsce zamieszkania</small><br>${t.city}<br>
    <small>Seria i numer</small><br><span class="f" data-k="id.nr">${t.id}</span></div></div>`,0.23,60);

  const pass=placeDoc("pass","",0.45,70,onPassDrop);
  pass.id="passport"; renderPass();
  pass.addEventListener("click",e=>{
    const b=e.target.closest("[data-dir]"); if(!b) return;
    S.passPage=Math.max(0,Math.min(3,S.passPage+Number(b.dataset.dir))); renderPass();
  });

  if(t.hasPermit) placeDoc("permit",`<h3>Przepustka</h3>
    <small>Imię i nazwisko</small><br><span class="f" data-k="permit.name">${t.permitName}</span><br>
    <small>Cel podróży</small><br>${t.dest}<br>
    <small>Ważna do</small><br><span class="f" data-k="permit.expiry">${fmt(t.permitUntil)}</span><br>
    <span class="wron">WRON</span>`,0.68,56);
}
function renderPass(){
  const el=$("passport"), t=S.cur, p=S.passPage;
  el.classList.toggle("closed",p===0);
  let body="";
  if(p===0) body=`<div class="cover"><div class="crest"></div>POLSKA RZECZPOSPOLITA LUDOWA<br><b>PASZPORT</b></div>`;
  if(p===1) body=`<div class="row">${photoHTML(t.photoFace,"pass.photo")}<div>
    <small>Nazwisko i imię</small><br><span class="f" data-k="pass.name">${t.passName}</span><br>
    <small>Nr paszportu</small><br>${t.passNr}<br>
    <small>Nr dowodu osobistego</small><br><span class="f" data-k="pass.nr">${t.passId}</span><br>
    <small>Ważny do</small><br><span class="f" data-k="pass.expiry">${fmt(t.passExpiry)}</span></div></div>`;
  if(p===2) body=`<small>Wcześniejsze przekroczenia granicy</small><div class="history">${
    t.history.map(h=>`<span class="old">${h.place}<br>${fmt(h.date)}</span>`).join("")||"<i>keine Einträge</i>"}</div>`;
  if(p===3) body=`<small>Stemple kontrolne</small><div class="stampArea" id="stampArea">${S.mark?imprintHTML(S.mark):""}</div>`;
  el.innerHTML=`<h3>Paszport<span class="pg">${p+1}/4</span></h3><div class="page">${body}</div>
    <div class="flip nodrag"><button data-dir="-1" aria-label="Zurückblättern">◀</button><button data-dir="1" aria-label="Weiterblättern">▶</button></div>`;
  markSelected();
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
  if(!area) toast("Blättere im Pass auf die Stempelseite (4/4).","info");
  else{
    const a=area.getBoundingClientRect();
    if(cx>a.left&&cx<a.right&&cy>a.top&&cy<a.bottom){
      if(S.mark) toast("Der Pass ist bereits gestempelt.","info");
      else{
        S.mark={type:st.dataset.type,x:(cx-a.left)/a.width*100,y:(cy-a.top)/a.height*100,rot:rint(-14,14)};
        area.innerHTML=imprintHTML(S.mark);
        st.classList.add("press"); setTimeout(()=>st.classList.remove("press"),150);
        setHint("Gestempelt. Ziehe den Pass jetzt in die Durchreiche.");
      }
    } else toast("Daneben. Setze den Stempel auf die Stempelseite.","info");
  }
  setTimeout(homeStamps,150);
}

// ---------- Prüfmodus ----------
function toggleCheck(force){
  S.checkMode=typeof force==="boolean"?force:!S.checkMode;
  S.sel=[]; markSelected();
  document.body.classList.toggle("checking",S.checkMode);
  $("bCheck").classList.toggle("on",S.checkMode);
  $("bCheck").textContent=S.checkMode?"Prüfmodus beenden":"Prüfmodus";
  setHint(S.checkMode?"Tippe zwei Angaben an, die nicht zusammenpassen, z. B. zwei Namen, Foto und Gesicht oder Ablaufdatum und heutiges Datum.":"");
}
function markSelected(){
  document.querySelectorAll("[data-k]").forEach(e=>e.classList.toggle("sel",S.sel.includes(e.dataset.k)));
}
function comparePair(a,b){
  const t=S.cur, has=(x,y)=>(a===x&&b===y)||(a===y&&b===x);
  const val={"id.name":t.name,"pass.name":t.passName,"permit.name":t.permitName,"id.nr":t.id,"pass.nr":t.passId};
  const isName=k=>k.endsWith(".name"), isPhoto=k=>k.endsWith(".photo");
  if(isName(a)&&isName(b)) return val[a]!==val[b]?{forgery:true,text:"Die Namen stimmen nicht überein."}:null;
  if(has("id.nr","pass.nr")) return val[a]!==val[b]?{forgery:true,text:"Die Dowód-Nummern stimmen nicht überein."}:null;
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
  else if(!res) toast("Kein Widerspruch.","info");
  else{ toast("Unstimmigkeit: "+res.text,"bad"); if(res.forgery) S.evidence=res; updateHUD(); }
  setTimeout(()=>{S.sel=[];markSelected()},900);
});
