// Spielzustand und Ablauf
const S={day:1,date:new Date(1981,11,14),min:DAY_START,correct:0,errors:0,money:0,cur:null,
  found:null,evidence:null,mark:null,passSpread:0,sel:[],checkMode:false,z:10,busy:false,flipping:false,
  view:"overview",prevView:null,close:null,tool:"hand",spotState:{},spotNote:{},pendingSeize:null,
  asked:{},lastAnswer:null,wantedList:[]};

function toast(msg,kind){
  const t=$("toast"); t.textContent=msg; t.className=kind; t.style.display="block";
  clearTimeout(toast.h); toast.h=setTimeout(()=>t.style.display="none",kind==="info"?1500:2200);
}
function setHint(m){$("hint").textContent=m}

function updateHUD(){
  const h=Math.floor(S.min/60), m=S.min%60;
  $("clock").textContent=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0");
  $("date").textContent=fmt(S.date)+" – Tag "+S.day;
  $("stats").textContent=`Richtig ${S.correct} | Fehler ${S.errors} | ${S.money} zł`;
  $("bArrest").disabled=!(S.found||S.evidence);
}

function startShift(){
  S.wantedList=makeWanted();
  renderRules(); renderWanted();
}
function nextTraveler(){
  if(S.min>=DAY_END) return endDay();
  toggleCheck(false);
  Object.assign(S,{cur:makeTraveler(S.date,S.wantedList),found:null,evidence:null,mark:null,passSpread:0,
    spotState:{},spotNote:{},pendingSeize:null,view:"overview",prevView:null,close:null,
    asked:{},lastAnswer:null,busy:false,flipping:false});
  const c=S.cur.car;
  $("traveler").innerHTML=faceSVG(S.cur.face);
  $("carSvg").innerHTML=carSVG(c.model,c.color,c.low);
  $("carPlate").textContent=c.plate;
  $("carBadge").textContent=CAR_MODELS[c.model].short;
  $("speech").textContent="„"+S.cur.line+"“";
  $("queue").textContent="Wartende Autos: "+rint(2,9);
  renderTravelerDocs(); updateHUD();
  setHint("Wische über den Paszport zum Blättern. Verschieben am gestreiften Rand oben.");
}

function finish(ok,msg,reward){
  S.busy=true;
  if(ok){S.correct++;S.money+=reward}else{S.errors++;S.money-=100}
  S.min+=DECIDE_COST; updateHUD(); toast(msg,ok?"good":"bad");
  setTimeout(nextTraveler,2300);
}
function decide(type){
  if(S.busy) return;
  const t=S.cur, f=t.flaw?FLAWS[t.flaw]:null;
  if(type==="approve"){
    if(f) finish(false,"Fehler: "+f.text);
    else if(t.contraband) finish(false,"Später entdeckt: "+t.contraband.desc+".");
    else finish(true,"Korrekt durchgelassen.",50);
  } else {
    if(!f) finish(false,"Die Papiere waren in Ordnung.");
    else finish(true,"Richtig abgewiesen. "+f.text+(f.forgery?" Eine Festnahme wäre möglich gewesen.":""),50);
  }
}
function arrest(){
  if(S.busy||!(S.found||S.evidence)) return;
  const why=S.found?"Fund: "+S.found+".":S.evidence.text;
  finish(true,"Die Milicja führt "+S.cur.name+" ab. "+why,80);
}
function endDay(){
  $("dayEndText").innerHTML=`${fmt(S.date)}: Schicht beendet.<br><br>Richtig: ${S.correct}<br>Fehler: ${S.errors}<br>Kontostand: ${S.money} zł`;
  $("dayEnd").classList.add("show");
}

$("bStart").onclick=()=>{$("startScreen").classList.remove("show");startShift();setupStamps();setupLens();nextTraveler()};
$("bCheck").onclick=()=>{if(!S.busy) toggleCheck()};
$("bAsk").onclick=openAsk;
$("bSearch").onclick=()=>{toggleCheck(false);openCar()};
$("bArrest").onclick=arrest;
$("bNextDay").onclick=()=>{
  S.day++; S.date=addDays(S.date,1); S.min=DAY_START; S.correct=0; S.errors=0;
  $("dayEnd").classList.remove("show");
  document.querySelectorAll(".doc").forEach(e=>e.remove());
  startShift(); nextTraveler();
};
window.addEventListener("resize",()=>{homeStamps();homeLens()});
