// Befragung und Vernehmungsprotokoll

const QUESTIONS=[
  ["dest","Wohin fahren Sie?"],
  ["owner","Wem gehört das Auto?"],
  ["purpose","Was ist der Zweck Ihrer Reise?"],
  ["declare","Haben Sie etwas anzumelden?"],
  ["stay","Wie lange bleiben Sie drüben?"]
];

function openAsk(){
  if(S.busy) return;
  toggleCheck(false); renderAsk(); $("askScene").classList.add("show");
}
function renderAsk(){
  $("askList").innerHTML=QUESTIONS.map(([k,q])=>`<button class="qbtn" data-q="${k}" ${S.asked[k]?"disabled":""}>${q}</button>`).join("");
  $("askAnswer").textContent=S.lastAnswer||"Wähle eine Frage. Jede Frage kostet "+ASK_COST+" Minuten.";
}
function answerText(k){
  const t=S.cur, a=t.answers, pre=a.nervous?"Äh… ":"";
  if(k==="dest") return pre+"Nach "+a.dest+".";
  if(k==="owner") return pre+(a.claimOwner===t.name?"Das ist meins.":"Es gehört "+a.claimOwner+". Ich habe eine Vollmacht.");
  if(k==="purpose") return pre+a.purpose+".";
  if(k==="declare") return pre+a.declare;
  return pre+a.stay;
}
function ask(k){
  if(S.asked[k]) return;
  S.asked[k]=true; S.min+=ASK_COST;
  S.lastAnswer="„"+answerText(k)+"“";
  $("speech").textContent=S.lastAnswer;
  renderProtocol(); updateHUD(); renderAsk();
}
function renderProtocol(){
  const a=S.cur.answers, rows=[];
  if(S.asked.dest) rows.push(`<small>Reiseziel laut Aussage</small><br><span class="f" data-k="ans.dest">${a.dest}</span>`);
  if(S.asked.owner) rows.push(`<small>Halter laut Aussage</small><br><span class="f" data-k="ans.owner">${a.claimOwner}</span>`);
  if(S.asked.purpose) rows.push(`<small>Zweck</small><br>${a.purpose}`);
  if(S.asked.declare) rows.push(`<small>Anzumelden</small><br>${a.declare}`);
  if(S.asked.stay) rows.push(`<small>Aufenthalt</small><br>${a.stay}`);
  if(a.nervous) rows.push(`<small>Bemerkung</small><br>wirkt nervös`);
  const html=`<h3>${T("Protokół przesłuchania","Vernehmungsprotokoll")}</h3>${rows.join("<br>")}`;
  let el=$("protocol");
  if(!el){el=placeDoc("proto",html,0.8,120);el.id="protocol"}
  else{el.innerHTML=html;clampDoc(el)}
  markSelected();
}

$("askList").addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(b) ask(b.dataset.q)});
$("bAskDone").onclick=()=>$("askScene").classList.remove("show");
