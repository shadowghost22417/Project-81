// Gespräch mit der Person, Gegenüberstellung und Protokoll

const QUESTIONS=[
  ["dest","Wohin fahren Sie?"],
  ["owner","Wem gehört das Auto?"],
  ["purpose","Was ist der Zweck Ihrer Reise?"],
  ["declare","Haben Sie etwas anzumelden?"],
  ["stay","Wie lange bleiben Sie drüben?"]
];
const CONFRONT_COST=3;
// Ausreden bei Formfehlern: glaubhaft, aber die Regel bleibt die Regel
const FORM_EXCUSES={
  expired:"Der Pass? Die Verlängerung ist beantragt, aber das Amt braucht Monate.",
  permitExpired:"Abgelaufen? Ich dachte, sie gilt noch bis Ende der Woche. Bitte, nur dieses eine Mal.",
  noPermit:"Man hat sie mir nicht gegeben. Auf dem Amt hieß es: Kommen Sie nächste Woche wieder.",
  bannedCity:"Ich bin dort nur gemeldet. Ich wohne seit Jahren bei meiner Schwester.",
  noExitStamp:"Die Wache der Milicja war geschlossen. Niemand war da, um zu stempeln.",
  currencyLimit:"Das ist alles, was wir gespart haben. Die Operation meiner Mutter kostet Devisen.",
  noDeleg:"Die Delegacja liegt noch im Betrieb, der Direktor war krank und konnte nicht unterschreiben."
};
const REPLIES={
  confess:["Ja… es stimmt. Ich wollte nur zu meiner Familie.","Gut. Sie haben recht. Ich gebe es zu.","Bitte… ich habe Kinder. Ja, es ist nicht echt."],
  confessFound:["Das ist nicht meins… doch. Ja. Man hat mich dafür bezahlt.","Ich sollte es nur rüberbringen. Ich wusste nicht einmal, was drin ist."],
  excuse:["Das ist ein Fehler vom Amt, nicht meiner!","Das hat mir jemand untergeschoben, ich schwöre!","Eine Verwechslung, ganz sicher eine Verwechslung."],
  angry:["Was erlauben Sie sich? Wissen Sie, wer mein Schwager ist?","Ich lasse mir das nicht gefallen, Genosse!","Machen Sie doch, was Sie wollen."],
  bribe:["Vielleicht… können wir das unter uns regeln?","Hören Sie, niemand muss davon erfahren."]
};
const TEMPER_NOTE={confess:"gesteht",excuse:"streitet ab, wirkt nervös",angry:"wird laut",bribe:"bietet Geld an"};

function toggleAsk(force){
  const m=$("askMenu"), show=typeof force==="boolean"?force:!m.classList.contains("show");
  if(show){renderAskMenu();setHint("Tippe die Person erneut an, um das Gespräch zu beenden.")}
  m.classList.toggle("show",show);
}
// Was man der Person vorhalten kann: Widersprüche vom Rotstift und Funde
function claimList(){
  const out=S.claims.map((c,i)=>({id:"c"+i,text:c.text,forgery:c.forgery}));
  if(S.found) out.push({id:"found",text:"Fund: "+S.found,forgery:true,found:true});
  return out;
}
function renderAskMenu(){
  const q=QUESTIONS.map(([k,q])=>`<button class="chip" data-q="${k}" ${S.asked[k]?"disabled":""}>${q}</button>`).join("");
  const c=claimList().map(c=>`<button class="chip confront" data-c="${c.id}" ${S.confronted[c.id]?"disabled":""}>Vorhalten: ${c.text}</button>`).join("");
  $("askMenu").innerHTML=q+c;
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
function confront(id){
  if(S.confronted[id]) return;
  const t=S.cur, claim=claimList().find(c=>c.id===id); if(!claim) return;
  S.confronted[id]=true; S.min+=CONFRONT_COST;
  let reply, note;
  if(!claim.forgery){reply=FORM_EXCUSES[t.flaw]||"Ich weiß nicht, wie das passieren konnte.";note="erklärt sich"}
  else{
    const temper=S.confessed?"confess":t.temper;
    if(temper==="confess"){S.confessed=true;reply=pick(claim.found?REPLIES.confessFound:REPLIES.confess);t.answers.nervous=true}
    else if(temper==="bribe"){reply=pick(REPLIES.bribe);
      if(!t.bribe&&!document.querySelector(".doc.env")){t.bribe=rint(6,15)*10;placeEnvelope(t)}}
    else{reply=pick(REPLIES[temper]);t.answers.nervous=true}
    note=TEMPER_NOTE[temper];
  }
  S.confrontLog.push(`${claim.text} → ${note}`);
  $("speech").textContent="„"+reply+"“";
  renderProtocol(); updateHUD(); renderAskMenu();
}
function renderProtocol(){
  const a=S.cur.answers, rows=[];
  if(S.asked.dest) rows.push(`<small>Reiseziel laut Aussage</small><br><span class="f" data-k="ans.dest">${a.dest}</span>`);
  if(S.asked.owner) rows.push(`<small>Halter laut Aussage</small><br><span class="f" data-k="ans.owner">${a.claimOwner}</span>`);
  if(S.asked.purpose) rows.push(`<small>Zweck</small><br><span class="f" data-k="ans.purpose">${a.purpose}</span>`);
  if(S.asked.declare) rows.push(`<small>Anzumelden</small><br>${a.declare}`);
  if(S.asked.stay) rows.push(`<small>Aufenthalt</small><br>${a.stay}`);
  if((Object.keys(S.asked).length||S.confrontLog.length)&&a.nervous) rows.push(`<small>Bemerkung</small><br>wirkt nervös`);
  if(S.notedPlate) rows.push(`<small>Kennzeichen (abgelesen)</small><br><span class="f" data-k="note.plate">${S.cur.car.plate}</span>`);
  if(S.confrontLog.length) rows.push(`<small>Gegenüberstellung</small><br>${S.confrontLog.join("<br>")}`);
  if(S.confessed) rows.push(`<b class="confessed">GESTÄNDNIS</b>`);
  if(!rows.length) return;
  const html=`<h3>${T("Protokół","Protokoll")}</h3>${rows.join("<br>")}`;
  let el=$("protocol");
  if(!el){el=placeDoc("proto",html,0.8,120);el.id="protocol"}
  else{el.innerHTML=html;clampDoc(el)}
  markSelected();
}

$("traveler").addEventListener("click",()=>{if(S.checkMode||S.busy) return; toggleAsk()});
$("askMenu").addEventListener("click",e=>{
  if(S.busy) return;
  const b=e.target.closest("[data-q]"); if(b) return ask(b.dataset.q);
  const c=e.target.closest("[data-c]"); if(c) confront(c.dataset.c);
});
