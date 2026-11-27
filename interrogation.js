// Gespräch mit der Person und Protokoll

const QUESTIONS=[
  ["dest","Wohin fahren Sie?"],
  ["owner","Wem gehört das Auto?"],
  ["purpose","Was ist der Zweck Ihrer Reise?"],
  ["declare","Haben Sie etwas anzumelden?"],
  ["stay","Wie lange bleiben Sie drüben?"]
];

function toggleAsk(force){
  const m=$("askMenu"), show=typeof force==="boolean"?force:!m.classList.contains("show");
  if(show){renderAskMenu();setHint("Tippe die Person erneut an, um das Gespräch zu beenden.")}
  m.classList.toggle("show",show);
}
function renderAskMenu(){
  $("askMenu").innerHTML=QUESTIONS.map(([k,q])=>`<button class="chip" data-q="${k}" ${S.asked[k]?"disabled":""}>${q}</button>`).join("");
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
  $("speech").textContent="„"+answerText(k)+"“";
  renderProtocol(); updateHUD(); renderAskMenu();
}
function renderProtocol(){
  const a=S.cur.answers, rows=[];
  if(S.asked.dest) rows.push(`<small>Reiseziel laut Aussage</small><br><span class="f" data-k="ans.dest">${a.dest}</span>`);
  if(S.asked.owner) rows.push(`<small>Halter laut Aussage</small><br><span class="f" data-k="ans.owner">${a.claimOwner}</span>`);
  if(S.asked.purpose) rows.push(`<small>Zweck</small><br><span class="f" data-k="ans.purpose">${a.purpose}</span>`);
  if(S.asked.declare) rows.push(`<small>Anzumelden</small><br>${a.declare}`);
  if(S.asked.stay) rows.push(`<small>Aufenthalt</small><br>${a.stay}`);
  if(Object.keys(S.asked).length&&a.nervous) rows.push(`<small>Bemerkung</small><br>wirkt nervös`);
  if(S.notedPlate) rows.push(`<small>Kennzeichen (abgelesen)</small><br><span class="f" data-k="note.plate">${S.cur.car.plate}</span>`);
  if(!rows.length) return;
  const html=`<h3>${T("Protokół","Protokoll")}</h3>${rows.join("<br>")}`;
  let el=$("protocol");
  if(!el){el=placeDoc("proto",html,0.8,120);el.id="protocol"}
  else{el.innerHTML=html;clampDoc(el)}
  markSelected();
}

$("traveler").addEventListener("click",()=>{if(S.checkMode||S.busy) return; toggleAsk()});
$("askMenu").addEventListener("click",e=>{const b=e.target.closest("[data-q]");if(b&&!S.busy) ask(b.dataset.q)});
