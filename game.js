// Spielzustand und Ablauf: Zeitung → Schicht → Abrechnung → nächster Tag
const S={day:1,date:DAYS[0].date,min:DAY_START,correct:0,errors:0,money:60,cur:null,
  found:null,evidence:null,proven:[],mark:null,passSpread:0,sel:[],checkMode:false,z:10,busy:false,flipping:false,
  outArea:null,bagView:false,latches:[false,false],close:null,spotState:{},spotNote:{},pendingSeize:null,
  asked:{},notedPlate:false,carURL:null,wantedList:[],
  rules:null,family:FAMILY_INIT(),warnings:0,flags:{},shift:null,orders:[],plan:{},ledger:null};

function toast(msg,kind){
  const t=$("toast"); t.textContent=msg; t.className=kind; t.style.display="block";
  if(kind==="good"||kind==="bad") SFX.play(kind);
  clearTimeout(toast.h); toast.h=setTimeout(()=>t.style.display="none",kind==="info"?1800:2600);
}
function updateHUD(){updateWall();updateLog()}

// ---------- Tagesablauf ----------
function resetGame(){Object.assign(S,{day:1,money:60,family:FAMILY_INIT(),warnings:0,flags:{}})}
function loadGame(d){Object.assign(S,{day:d.day,money:d.money,family:d.family,warnings:d.warnings,flags:d.flags||{}})}
function beginDay(){
  const d=today();
  S.date=d.date; S.rules=activeRules(d); S.min=DAY_START; S.correct=0; S.errors=0;
  S.shift={n:0,correct:0,errors:0,wrongArrests:0,orderHits:0,orderMiss:0,bribes:0,bribeMoney:0,sbObeyed:0,sbDefied:0,startMoney:S.money};
  document.querySelectorAll(".doc").forEach(e=>e.remove());
  S.cur=null; drawWindowScene(null); $("speech").textContent=""; $("queue").textContent=""; setHint("");
  if(S.day===8&&(S.flags.sbObeyed||0)>=2&&!S.flags.bonusPaid){S.money+=80;S.flags.bonusPaid=true}
  updateWall();
  showNewspaper(S.day-1,()=>{startShift();nextTraveler()});
}
function startShift(){
  S.wantedList=makeWanted();
  S.orders=today().orders.map(id=>Object.assign({id},ORDER_GEN[id]()));
  // An festen Plätzen der Schlange kommen Reisende, die zur Anweisung passen
  S.plan={}; const taken=new Set(today().scripted.map(s=>s.at)); let slot=0;
  S.orders.forEach(o=>{for(let k=0;k<o.count;k++){slot+=rint(1,2);while(taken.has(slot))slot++;taken.add(slot);S.plan[slot]=o}});
  takeOut("rules"); takeOut("wanted"); takeOut("orders");
}
function finalizeTraveler(t){
  t.answers.claimOwner=t.flaw==="noAuth"?t.name:t.car.owner;
  if(t.deleg) t.deleg.name=t.name;
  t.exitDate=addDays(S.date,-rint(2,20));
  if(t.contraband&&!t.script){t.answers.nervous=t.answers.nervous||Math.random()<.5;if(Math.random()<.6)t.answers.declare="Nein, gar nichts."}
  return t;
}
function nextTraveler(){
  if(S.min>=DAY_END) return endDay();
  toggleCheck(false); toggleAsk(false); toggleFolderMenu(false);
  const n=++S.shift.n;
  const sc=today().scripted.find(s=>s.at===n&&!(SCRIPTS[s.id].skip&&SCRIPTS[s.id].skip(S.flags)));
  let t;
  if(sc){const def=SCRIPTS[sc.id],fl=typeof def.flaw==="function"?def.flaw():def.flaw;
    t=makeTraveler(S.date,null,{flaw:fl,clean:true});def.build(t);t.script=sc.id;t.bribe=def.bribe||0}
  else if(S.plan[n]){const o=S.plan[n];
    t=makeTraveler(S.date,null,o.kind==="person"?{flaw:null,clean:true}:{clean:true});o.apply(t);t.order=o;
    // Anweisung kann Wohnort oder Auto ändern: dadurch hinfällige Fehler entfernen
    if(t.flaw==="bannedCity"&&!today().banned.includes(t.city)) t.flaw=null;
    if(t.flaw==="modelMismatch"&&t.car.model===t.car.regModel) t.flaw=null}
  else t=makeTraveler(S.date,S.wantedList);
  finalizeTraveler(t);
  Object.assign(S,{cur:t,found:null,evidence:null,proven:[],mark:null,passSpread:0,
    outArea:null,bagView:false,latches:[false,false],close:null,spotState:{},spotNote:{},pendingSeize:null,
    asked:{},notedPlate:false,carURL:null,busy:false,flipping:false});
  drawWindowScene(t);
  $("speech").textContent="„"+t.line+"“";
  $("queue").textContent="Wartende Autos: "+rint(2,9);
  renderTravelerDocs(); updateHUD();
  setHint(S.day===1&&n===1
    ?"Person antippen: reden. Auto antippen: rausgehen. Rotstift: prüfen. Das Dalekopis sagt, worauf du heute achten sollst."
    :t.bribe?"Unter den Papieren liegt ein Umschlag.":"");
}

// ---------- Entscheidungen ----------
function finish(ok,msg,reward,penalty){
  S.busy=true;
  if(ok){S.correct++;S.shift.correct++;S.money+=Math.round((reward||0)*today().wage)}
  else{S.errors++;S.shift.errors++;S.money-=(penalty??PAY.error)}
  S.min+=DECIDE_COST; updateHUD(); toast(msg,ok?"good":"bad");
  setTimeout(nextTraveler,2600);
}
function judge(type){
  const t=S.cur, f=t.flaw?FLAWS[t.flaw]:null;
  if(type==="approve"){
    if(f) return {ok:false,msg:"Fehler: "+f.text};
    if(t.contraband) return {ok:false,msg:"Später entdeckt: "+t.contraband.desc+"."};
    return {ok:true,msg:"Korrekt durchgelassen.",reward:PAY.correct};
  }
  if(type==="reject"){
    if(!f) return {ok:false,msg:"Die Papiere waren in Ordnung."};
    return {ok:true,msg:"Richtig abgewiesen. "+f.text+(f.forgery?" Eine Festnahme wäre möglich gewesen.":""),reward:PAY.correct};
  }
  const guilty=!!t.contraband||(!!f&&f.forgery);
  if(!guilty) return {ok:false,msg:"Unschuldig festgenommen! Beschwerde beim Kommandanten: −"+WRONG_ARREST+" zł.",penalty:WRONG_ARREST,wrongArrest:true};
  const proof=S.found?"Fund: "+S.found+".":S.evidence?S.evidence.text:t.flaw==="ordered"?"Festnahme laut Dalekopis.":null;
  return {ok:true,msg:"Die Milicja führt "+t.name+" ab. "+(proof||"Ohne Beweis – da hattest du Glück."),reward:proof?PAY.arrestProof:PAY.arrestNoProof};
}
function resolve(type){
  if(S.busy) return;
  const t=S.cur, sc=t.script&&SCRIPTS[t.script];
  let r=judge(type);
  if(t.order){
    if(type==="arrest"&&r.ok){S.shift.orderHits++;r.reward+=PAY.order;r.msg+=" Anweisung erfüllt."}
    else if(type==="approve"&&!r.ok){S.shift.orderMiss++;r.msg+=" Genau davor hat das Dalekopis gewarnt."}
  }
  if(sc&&sc.sb){
    if(type==="approve"){S.shift.sbObeyed++;S.flags.sbObeyed=(S.flags.sbObeyed||0)+1;
      r={ok:true,msg:"Befehl befolgt. Kapitan Brzeski ist zufrieden.",reward:PAY.sb}}
    else{S.shift.sbDefied++;S.flags.sbDefied=(S.flags.sbDefied||0)+1;r.msg+=" Du hast den Befehl der SB missachtet."}
  }
  if(sc&&sc.after) sc.after(type,S.flags);
  if(r.wrongArrest) S.shift.wrongArrests++;
  finish(r.ok,r.msg,r.reward,r.penalty);
}
const decide=type=>resolve(type);
const arrest=()=>resolve("arrest");

// ---------- Umschlag (Bestechung) ----------
function onEnvDrop(el,ev){
  const t=S.cur; if(!ev||S.busy) return;
  if(pointIn(ev.clientX,ev.clientY,$("folder"))){
    S.money+=t.bribe; S.shift.bribes++; S.shift.bribeMoney+=t.bribe; S.flags.bribes=(S.flags.bribes||0)+1;
    el.remove(); SFX.play("coin"); toast(`Du steckst ${t.bribe} zł ein. Niemand hat es gesehen. Hoffentlich.`,"info"); updateHUD();
  } else if(overlaps(el,$("slot"))){
    el.remove(); SFX.play("paper"); toast("Du schiebst den Umschlag zurück.","info");
  }
}

// ---------- Schichtende ----------
function endDay(){
  const sh=S.shift, notes=[]; let warn=0;
  if(sh.errors>=3){warn++;notes.push(`Verwarnung: ${sh.errors} Fehler in einer Schicht.`)}
  if(sh.wrongArrests){warn+=sh.wrongArrests;notes.push(`Verwarnung: ${sh.wrongArrests===1?"eine Person":sh.wrongArrests+" Personen"} unschuldig festgenommen.`)}
  if(sh.orderMiss){warn++;notes.push("Verwarnung: Anweisung aus dem Dalekopis nicht befolgt.")}
  if(sh.sbDefied){warn++;notes.push("Verwarnung: Befehl der SB missachtet.")}
  if(sh.orderHits) notes.push(`Lob vom Kommandanten: ${sh.orderHits} Anweisung${sh.orderHits>1?"en":""} erfüllt.`);
  if(sh.bribes&&Math.random()<Math.min(.75,.2*sh.bribes+(S.flags.sbDefied?.15:0))){
    const loss=sh.bribeMoney+50; S.money-=loss; warn++;
    notes.push(`Überraschende Kontrolle! In deiner Schublade wird Geld gefunden: −${loss} zł.`);
  }
  if(!warn&&sh.errors===0&&S.warnings>0){S.warnings--;notes.push("Fehlerfreie Schicht: Eine Verwarnung wird gestrichen.")}
  S.warnings+=warn;
  const wage=Math.round(PAY.base*today().wage); S.money+=wage;
  S.ledger={earned:S.money-wage-sh.startMoney,wage,notes};
  if(S.warnings>=3) return gameOver("fired");
  showLedger();
}
function gameOver(kind,name){
  const fired=kind==="fired";
  $("goTitle").textContent=fired?"Entlassen":"Der Winter war zu hart";
  $("goText").innerHTML=fired
    ?"Der Kommandant hat dich nach der dritten Verwarnung aus dem Dienst entfernt. Ohne Arbeit keine Wohnung, keine Lebensmittelmarken. Ewa nimmt die Kinder und fährt zu ihrer Mutter aufs Land."
    :`${name} hat Hunger, Kälte und Krankheit nicht überstanden. Du hättest es verhindern können. Oder nicht?`;
  $("bRetry").style.display=loadSave()?"":"none";
  $("gameOver").classList.add("show"); SFX.play("bad");
}
function chapterEnd(){
  const f=S.flags, lines=[];
  lines.push(S.family.every(m=>!m.sick)?"Deine Familie hat die Jahre des Kriegsrechts überstanden.":"Deine Familie hat überlebt, aber nicht alle sind gesund.");
  if(f.motherHelped>=2) lines.push("Halina Wróbel schreibt dir jedes Jahr zu Weihnachten.");
  else if(f.motherRejected) lines.push("An Halina Wróbel denkst du manchmal, wenn es still ist in der Hütte.");
  if(f.smugglerArrested) lines.push("Ryszard Kos sitzt in Wronki.");
  else if(f.smugglerPassed) lines.push("Ryszard Kos ist in Westberlin. Dein Name steht vielleicht in seinem Notizbuch.");
  if(f.sbObeyed) lines.push("Kapitan Brzeski hat dich nicht vergessen. Das kann gut oder schlecht sein.");
  if(f.bribes) lines.push(`Du hast ${f.bribes} Umschlag${f.bribes>1?"e":""} angenommen.`);
  $("goTitle").textContent="Ende von Kapitel 1";
  $("goText").innerHTML=lines.join("<br>")+`<br><br>Kontostand: ${S.money} zł<br><br><i>Die Geschichte geht im nächsten Update weiter.</i>`;
  $("bRetry").style.display="none";
  $("gameOver").classList.add("show"); clearSave();
}

// ---------- Knöpfe ----------
let deskReady=false;
function startGame(load){
  SFX.init();
  $("startScreen").classList.remove("show"); $("gameOver").classList.remove("show");
  if(!deskReady){setupStamps();setupLens();deskReady=true}
  if(load) loadGame(load); else{resetGame();saveGame()}
  beginDay();
}
$("bStart").onclick=()=>startGame(null);
$("bContinue").onclick=()=>{const d=loadSave();if(d)startGame(d)};
$("bRetry").onclick=()=>{const d=loadSave();if(d)startGame(d)};
$("bNewGame").onclick=()=>startGame(null);
$("carView").addEventListener("click",()=>{if(S.checkMode||S.busy) return; openOutside()});
$("bNextDay").onclick=()=>{
  const lost=applyLedger(); SFX.play("coin");
  $("dayEnd").classList.remove("show");
  if(lost) return gameOver("family",lost);
  if(S.day>=DAYS.length) return chapterEnd();
  tearCalendar(); S.day++; saveGame(); beginDay();
};
$("mute").onclick=()=>{SFX.setMuted(!SFX.isMuted());$("mute").textContent=SFX.isMuted()?"Ton aus":"Ton an"};
let resizeTimer=null;
window.addEventListener("resize",()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{
    drawWindowScene(S.cur); drawWall(); drawDeskLight(); homeStamps(); homeLens();
    if($("outside").classList.contains("show")) drawOutBg();
  },150);
});

initPixel();
updateWall();
$("mute").textContent=SFX.isMuted()?"Ton aus":"Ton an";
(()=>{const d=loadSave();if(d){$("bContinue").style.display="";$("bContinue").textContent=`Fortsetzen (${fmt(DAYS[d.day-1].date)})`}})();
