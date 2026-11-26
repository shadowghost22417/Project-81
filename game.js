// Spielzustand und Ablauf
const S={day:1,date:new Date(1981,11,14),min:DAY_START,correct:0,errors:0,money:0,cur:null,
  found:null,evidence:null,proven:[],mark:null,passSpread:0,sel:[],checkMode:false,z:10,busy:false,flipping:false,
  outArea:null,bagView:false,latches:[false,false],close:null,spotState:{},spotNote:{},pendingSeize:null,
  asked:{},notedPlate:false,carURL:null,wantedList:[]};

function toast(msg,kind){
  const t=$("toast"); t.textContent=msg; t.className=kind; t.style.display="block";
  clearTimeout(toast.h); toast.h=setTimeout(()=>t.style.display="none",kind==="info"?1600:2400);
}
function updateHUD(){updateWall();updateLog()}

function startShift(){
  S.wantedList=makeWanted();
  takeOut("rules"); takeOut("wanted");
}
function nextTraveler(){
  if(S.min>=DAY_END) return endDay();
  toggleCheck(false); toggleAsk(false); toggleFolderMenu(false);
  Object.assign(S,{cur:makeTraveler(S.date,S.wantedList),found:null,evidence:null,proven:[],mark:null,passSpread:0,
    outArea:null,bagView:false,latches:[false,false],close:null,spotState:{},spotNote:{},pendingSeize:null,
    asked:{},notedPlate:false,carURL:null,busy:false,flipping:false});
  drawWindowScene(S.cur);
  $("speech").textContent="„"+S.cur.line+"“";
  $("queue").textContent="Wartende Autos: "+rint(2,9);
  renderTravelerDocs(); updateHUD();
  setHint(S.day===1&&S.correct+S.errors===0
    ?"Person antippen: reden. Auto antippen: rausgehen. Rotstift: prüfen. Die Fahrzeugtypen liegen in der Teczka."
    :"");
}

function finish(ok,msg,reward,penalty){
  S.busy=true;
  if(ok){S.correct++;S.money+=reward}else{S.errors++;S.money-=(penalty||100)}
  S.min+=DECIDE_COST; updateHUD(); toast(msg,ok?"good":"bad");
  setTimeout(nextTraveler,2400);
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
  if(S.busy) return;
  const t=S.cur, guilty=!!t.contraband||(!!t.flaw&&FLAWS[t.flaw].forgery);
  if(!guilty) return finish(false,"Unschuldig festgenommen! Beschwerde beim Kommandanten: −"+WRONG_ARREST+" zł.",0,WRONG_ARREST);
  const proof=S.found?"Fund: "+S.found+".":S.evidence?S.evidence.text:null;
  finish(true,"Die Milicja führt "+t.name+" ab. "+(proof||"Ohne Beweis – da hattest du Glück."),proof?80:30);
}
function endDay(){
  $("dayEndText").innerHTML=`${fmt(S.date)}: Schicht beendet.<br><br>Richtig: ${S.correct}<br>Fehler: ${S.errors}<br>Kontostand: ${S.money} zł`;
  $("dayEnd").classList.add("show");
}

$("bStart").onclick=()=>{
  $("startScreen").classList.remove("show");
  startShift(); setupStamps(); setupLens(); nextTraveler();
};
$("carView").addEventListener("click",()=>{if(S.checkMode||S.busy) return; openOutside()});
$("bNextDay").onclick=()=>{
  $("dayEnd").classList.remove("show");
  tearCalendar();
  S.day++; S.date=addDays(S.date,1); S.min=DAY_START; S.correct=0; S.errors=0;
  document.querySelectorAll(".doc").forEach(e=>e.remove());
  startShift(); nextTraveler();
};
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
