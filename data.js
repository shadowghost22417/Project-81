// Einstellungen, Daten und Hilfsfunktionen
const DAY_START=16*60, DAY_END=22*60, DECIDE_COST=30, ASK_COST=3, WRONG_CHECK=2;
const COST={look:5,knock:3,area:2};
const DAMAGE=15, WRONG_SEIZE=10, WRONG_ARREST=100;
// Lohn in Złoty (wird mit dem Lohnfaktor des Tages multipliziert)
const PAY={base:60,correct:10,arrestProof:25,arrestNoProof:10,error:20,order:25,sb:60};
const TOOL_SHORT={knife:"Messer",screw:"Schraubenzieher",bar:"Brecheisen"};
const TOOL_ACC={knife:"das Messer",screw:"den Schraubenzieher",bar:"das Brecheisen"};

const FIRST_M=["Jan","Piotr","Krzysztof","Andrzej","Tomasz","Marek","Józef","Stanisław","Zbigniew","Tadeusz","Łukasz","Wojciech"];
const FIRST_F=["Anna","Maria","Katarzyna","Małgorzata","Agnieszka","Barbara","Ewa","Krystyna","Elżbieta","Zofia","Jadwiga","Bożena"];
const LAST=[["Kowalski","Kowalska"],["Nowak","Nowak"],["Wiśniewski","Wiśniewska"],["Wójcik","Wójcik"],["Kamiński","Kamińska"],
  ["Lewandowski","Lewandowska"],["Zieliński","Zielińska"],["Szymański","Szymańska"],["Dąbrowski","Dąbrowska"],["Mazur","Mazur"],
  ["Woźniak","Woźniak"],["Kozłowski","Kozłowska"],["Jabłoński","Jabłońska"],["Król","Król"]];
const CITIES=["Warszawa","Kraków","Wrocław","Gdańsk","Poznań","Łódź","Katowice","Szczecin","Lublin","Legnica","Jelenia Góra","Białystok"];
const PLATE_PREFIX=["WAB","KRC","WRF","GDA","POZ","LDB","KTA","SZC","LUA","LGA","JGB","BIA"];
const DESTS=["Görlitz","Dresden","Berlin (Ost)","Leipzig","Cottbus"];
const BORDER_PLACES=["Zgorzelec","Świecko","Cieszyn","Kołbaskowo","Okęcie"];
const GOODS=["Solidarność-Flugblätter","Untergrundzeitungen","300 US-Dollar","Westmark-Bündel",
  "Tonbänder (Radio Free Europe)","Jeans aus dem Westen","Druckmatrizen"];
const LINES=["Dzień dobry. Ich besuche meine Schwester.","Guten Abend. Ich muss zur Arbeit nach drüben.",
  "Bitte, es ist kalt. Wie lange dauert das noch?","Meine Tante ist krank, ich bringe ihr Medikamente.","Dienstreise. Alles ist gestempelt."];
const NERVOUS=["Ist… ist alles in Ordnung mit den Papieren?","Ich habe es wirklich eilig, Genosse.","Das Auto? Da ist nichts drin. Nur Gepäck."];
const PURPOSES=["Familienbesuch","Arbeit auf einer Baustelle","Einkaufen","Arztbesuch bei Verwandten","Dienstreise"];
const STAYS=["Zwei Tage.","Bis Sonntag.","Eine Woche.","Nur heute."];
const WANTED_REASONS=["Solidarność-Aktivist, untergetaucht","Druck verbotener Schriften","Devisenschmuggel",
  "Flucht aus der Internierung","Organisation von Streiks"];
const SKINS=["#e8c4a0","#d9ad86","#f0d2b4","#c99a72"];
const HAIRS=["#2b2018","#5a3b22","#8a6a3a","#999999","#c9a35a"];
const COATS=["#4a4a52","#5b4636","#3d4a3a","#6b2f2f"];
const CAR_COLORS=["#c8b26a","#8fa3b0","#a8423a","#6f8a5b","#d6d0c0","#3f5a7a","#8a7a5c"];

const BAG_ITEMS=[["Bohnenkaffee","Pakete",1,3],["Wodka","Flaschen",1,2],["Zigaretten","Stangen",1,2],["Kleidung","Stück",2,8],
  ["Konserven","Dosen",1,6],["Bücher","Stück",1,3],["Schokolade","Tafeln",1,5]];
const BAG_SPOTS=[["Kofferboden","panel","bar"],["Futter","panel","knife"],["Seitentasche","open"],["Kulturbeutel","open"]];
const CABIN=[["Handschuhfach","open"],["Unter den Sitzen","dark"],["Rücksitzpolster","panel","knife"],["Türverkleidung","panel","screw"]];
const FRONT_ENGINE=[["Luftfilter","open"],["Hinter dem Kühler","dark"],["Batteriekasten","panel","screw"]];
// Bereiche: [Name, Position auf dem Auto in %, Verstecke, Geste]
const CAR_MODELS=[
  {name:"Fiat 126p",from:1973,areas:[
    ["Kofferraum vorne",[25,58],[["Kofferraumboden","open"],["Reserverad","panel","bar"],["Hinter der Verkleidung","dark"]],"up"],
    ["Innenraum",[52,34],CABIN,"side"],
    ["Motorraum hinten",[79,58],[["Luftfilterkasten","open"],["Neben dem Motor","dark"],["Motorabdeckung","panel","screw"]],"up"]]},
  {name:"Polski Fiat 125p",from:1967,areas:[
    ["Motorraum vorne",[14,58],FRONT_ENGINE,"up"],["Innenraum",[52,34],CABIN,"side"],
    ["Kofferraum hinten",[88,56],[["Kofferraumboden","open"],["Reserveradmulde","dark"],["Seitenverkleidung","panel","screw"]],"up"]]},
  {name:"FSO Polonez",from:1978,areas:[
    ["Motorraum vorne",[15,60],FRONT_ENGINE,"up"],["Innenraum",[52,34],CABIN,"side"],
    ["Heckklappe",[88,54],[["Ladeboden","open"],["Unter der Hutablage","dark"],["Seitenverkleidung","panel","screw"]],"up"]]},
  {name:"FSO Syrena 105",from:1972,areas:[
    ["Motorraum vorne",[17,60],[["Werkzeugkiste","open"],["Hinter dem Kühler","dark"],["Kotflügel innen","panel","bar"]],"up"],
    ["Innenraum",[52,32],CABIN,"side"],
    ["Kofferraum hinten",[85,58],[["Kofferraumboden","open"],["Reserverad","panel","bar"],["Ecke hinten","dark"]],"up"]]},
  {name:"FS Lublin Żuk",from:1959,areas:[
    ["Fahrerhaus",[16,36],[["Handschuhfach","open"],["Unter der Sitzbank","dark"],["Sitzbank","panel","knife"],["Türverkleidung","panel","screw"]],"side"],
    ["Motor",[16,74],[["Motorabdeckung","panel","screw"],["Neben dem Motor","dark"]],"up"],
    ["Laderaum",[62,46],[["Kisten","open"],["Ecken hinten","dark"],["Ladeboden","panel","bar"],["Seitenwand","panel","screw"]],"side"]]}
];

const FLAWS={
  expired:{text:"Der Paszport war abgelaufen.",forgery:false},
  permitExpired:{text:"Die Przepustka war nicht mehr gültig.",forgery:false},
  noPermit:{text:"Die Przepustka fehlte.",forgery:false},
  nameMismatch:{text:"Die Przepustka lief auf einen anderen Namen.",forgery:true},
  idMismatch:{text:"Die Ausweisnummer im Paszport stimmte nicht.",forgery:true},
  spelling:{text:"Ein Name war falsch geschrieben.",forgery:true},
  photo:{text:"Das Foto zeigte eine andere Person.",forgery:true},
  modelMismatch:{text:"Das Auto passte nicht zum Dowód rejestracyjny.",forgery:true},
  plateMismatch:{text:"Das Kennzeichen stimmte nicht mit dem Dowód rejestracyjny überein.",forgery:true},
  noAuth:{text:"Fremdes Auto ohne Upoważnienie.",forgery:true},
  destLie:{text:"Die Person log beim Reiseziel.",forgery:true},
  wanted:{text:"Die Person stand auf dem List gończy.",forgery:true}
};
const DIACRITICS={"ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ź":"z","ż":"z","Ł":"L","Ś":"S","Ż":"Z","Ź":"Z"};

const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const fmt=d=>String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear();
const idNr=()=>pick(["AB","CD","EG","KR","WR"])+" "+rint(100000,999999);
const randPos=()=>({x:.25+Math.random()*.5,y:.3+Math.random()*.4});

function randomFace(female){
  return {skin:pick(SKINS),hair:pick(HAIRS),coat:pick(COATS),hat:Math.random()<.4,
    beard:!female&&Math.random()<.3,glasses:Math.random()<.25,female};
}
function randomName(exclude){
  let n;
  do{const f=Math.random()<.5;n=(f?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST)[f?1:0]}while(n===exclude);
  return n;
}
function makeWanted(){
  return [0,1,2].map(()=>{
    const female=Math.random()<.5;
    return {female,face:randomFace(female),name:(female?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST)[female?1:0],reason:pick(WANTED_REASONS)};
  });
}
function alterPlate(p){
  const idx=[...p].map((c,i)=>/\d/.test(c)?i:-1).filter(i=>i>=0), i=pick(idx);
  let d;do{d=String(rint(0,9))}while(d===p[i]);
  return p.slice(0,i)+d+p.slice(i+1);
}
function misspell(first,li,female){
  const last=LAST[li][female?1:0], full=first+" "+last, opts=[];
  const idx=[...full].map((c,i)=>DIACRITICS[c]?i:-1).filter(i=>i>=0);
  if(idx.length){const i=pick(idx);opts.push(full.slice(0,i)+DIACRITICS[full[i]]+full.slice(i+1))}
  if(female&&LAST[li][0]!==last) opts.push(first+" "+LAST[li][0]);
  if(last.length>4){const i=rint(1,last.length-3);if(last[i]!==last[i+1]) opts.push(first+" "+last.slice(0,i)+last[i+1]+last[i]+last.slice(i+2))}
  return opts.length?pick(opts):first+" "+last+"a";
}
function spotById(id,t){
  const p=id.split(":");
  if(p[0]==="b") return BAG_SPOTS[+p[1]];
  return CAR_MODELS[t.car.model].areas[+p[1]][2][+p[2]];
}
function panelSpots(t){
  const ids=[];
  CAR_MODELS[t.car.model].areas.forEach((a,ai)=>a[2].forEach((s,si)=>{if(s[1]==="panel")ids.push(`c:${ai}:${si}`)}));
  BAG_SPOTS.forEach((s,i)=>{if(s[1]==="panel")ids.push("b:"+i)});
  return ids;
}

// ---------- Hilfen für Anweisungen und Figuren ----------
function setHome(t,ci){
  const num=t.car.plate.split(" ")[1], plate=PLATE_PREFIX[ci]+" "+num;
  t.city=CITIES[ci]; if(t.car.regPlate===t.car.plate) t.car.regPlate=plate; t.car.plate=plate;
}
function setModel(t,mi){
  const same=t.car.regModel===t.car.model; t.car.model=mi; if(same) t.car.regModel=mi;
  t.car.year=Math.max(t.car.year,CAR_MODELS[mi].from);
  if(t.contraband&&t.contraband.spot.startsWith("c:")) placeContraband(t,t.contraband.item,"car");
}
function placeContraband(t,item,where){
  const m=CAR_MODELS[t.car.model];
  if(where==="bag"){const bi=rint(0,BAG_SPOTS.length-1);
    t.contraband={spot:"b:"+bi,item,desc:item+" (Gepäck, "+BAG_SPOTS[bi][0]+")",pos:randPos(),hint:Math.random()<.75};return}
  let ai,si;
  if(where&&where.startsWith("c:")){[ai,si]=where.slice(2).split(":").map(Number);if(!m.areas[ai]||!m.areas[ai][2][si]){ai=null}}
  if(ai==null){ai=rint(0,m.areas.length-1);si=rint(0,m.areas[ai][2].length-1)}
  const sp=m.areas[ai][2];
  t.contraband={spot:`c:${ai}:${si}`,item,desc:item+" ("+sp[si][0]+")",pos:randPos(),hint:Math.random()<.75};
}
const DELEG_FIRMS=["Kombinat Budowlany Wrocław","Huta Katowice","FSO Warszawa","PKP Dyrekcja Zachodnia","Zakłady Azotowe Kędzierzyn"];

// opts.flaw: undefined = zufällig, null = keiner, sonst feste Fehlerart; opts.clean = ohne Schmuggel
function makeTraveler(date,wantedList,opts={}){
  const day=today(), rules=S.rules||BASE_RULES, randomFlaws=flawsFor(rules);
  const wi=opts.flaw===undefined&&wantedList&&wantedList.length&&Math.random()<.12?rint(0,wantedList.length-1):null;
  const W=wi!==null?wantedList[wi]:null;
  const female=W?W.female:Math.random()<.5, li=rint(0,LAST.length-1);
  const first=female?pick(FIRST_F):pick(FIRST_M), name=first+" "+LAST[li][female?1:0];
  const allowed=CITIES.map((c,i)=>i).filter(i=>!day.banned.includes(CITIES[i]));
  const face=W?W.face:randomFace(female), ci=pick(allowed), mi=rint(0,CAR_MODELS.length-1);
  const plate=PLATE_PREFIX[ci]+" "+rint(1000,9999);
  const t={name,female,face,photoFace:face,passName:name,permitName:name,seed:rint(1,99999),
    birth:new Date(rint(1920,1963),rint(0,11),rint(1,28)),city:CITIES[ci],dest:pick(DESTS),
    id:idNr(),passNr:"ZA "+rint(1000000,9999999),passExpiry:addDays(date,rint(30,1500)),
    permitUntil:addDays(date,rint(0,30)),hasPermit:true,
    car:{model:mi,regModel:mi,plate,regPlate:plate,owner:name,color:pick(CAR_COLORS),year:rint(CAR_MODELS[mi].from,1981)},
    auth:false,bag:[],flaw:null,wanted:wi,contraband:null,falseSpot:null,falseHintPos:null,history:[],
    exitStamp:true,currency:0,deleg:null,bribe:0,order:null,script:null};
  const purpose=pick(PURPOSES);
  if(rules.includes("cur")&&Math.random()<.5) t.currency=rint(1,day.curLimit/10)*10;
  t.passId=t.id;
  for(let i=rint(0,3);i>0;i--) t.history.push({place:pick(BORDER_PLACES),date:addDays(date,-rint(30,2500))});
  t.history.sort((a,b)=>b.date-a.date);

  t.bag=[...BAG_ITEMS].sort(()=>Math.random()-.5).slice(0,rint(3,5))
    .map(([n,u,a,b])=>{const c=rint(a,b);return {name:n,unit:u,count:c,declared:c}});
  if(Math.random()<.2){t.car.owner=randomName(name);t.auth=true}

  if(W) t.flaw="wanted";
  else if(opts.flaw!==undefined) t.flaw=opts.flaw;
  else if(Math.random()<.45) t.flaw=pick(randomFlaws);
  if(t.flaw&&t.flaw!=="wanted"){
    switch(t.flaw){
      case "expired": t.passExpiry=addDays(date,-rint(1,400)); break;
      case "permitExpired": t.permitUntil=addDays(date,-rint(1,20)); break;
      case "noPermit": t.hasPermit=false; break;
      case "nameMismatch":{let o;do{o=LAST[rint(0,LAST.length-1)][female?1:0]}while(name.endsWith(" "+o));t.permitName=first+" "+o;break}
      case "idMismatch":{let n;do{n=idNr()}while(n===t.id);t.passId=n;break}
      case "spelling":{const w=misspell(first,li,female);if(Math.random()<.5)t.passName=w;else t.permitName=w;break}
      case "photo":{const f=randomFace(female);while(f.hair===face.hair)f.hair=pick(HAIRS);
        f.glasses=!face.glasses;f.beard=!female&&!face.beard;t.photoFace=f;break}
      case "modelMismatch":{let o;do{o=rint(0,CAR_MODELS.length-1)}while(o===mi);t.car.regModel=o;break}
      case "plateMismatch": t.car.regPlate=alterPlate(plate); break;
      case "noAuth": t.car.owner=randomName(name); t.auth=false; break;
      case "bannedCity": setHome(t,CITIES.indexOf(pick(day.banned))); break;
      case "noExitStamp": t.exitStamp=false; break;
      case "currencyLimit": t.currency=day.curLimit+rint(1,10)*10; break;
    }
  }
  t.purpose=["noDeleg","delegDest"].includes(t.flaw)?"Dienstreise":purpose;
  if(rules.includes("deleg")&&t.purpose==="Dienstreise"&&t.flaw!=="noDeleg"){
    let dd=t.dest; if(t.flaw==="delegDest") do{dd=pick(DESTS)}while(dd===t.dest);
    t.deleg={name,firm:pick(DELEG_FIRMS),dest:dd,until:addDays(date,rint(1,14))};
  }

  if(!opts.clean&&Math.random()<.3){
    const r=Math.random(), m=CAR_MODELS[mi], item=pick(GOODS);
    if(r<.5){
      const ai=rint(0,m.areas.length-1), sp=m.areas[ai][2], si=rint(0,sp.length-1);
      t.contraband={spot:`c:${ai}:${si}`,item,desc:item+" ("+sp[si][0]+")",pos:randPos(),hint:Math.random()<.75};
    } else if(r<.75){
      const bi=rint(0,BAG_SPOTS.length-1);
      t.contraband={spot:"b:"+bi,item,desc:item+" (Gepäck, "+BAG_SPOTS[bi][0]+")",pos:randPos(),hint:Math.random()<.75};
    } else {
      const k=rint(0,t.bag.length-1), it=t.bag[k];
      if(Math.random()<.3) it.declared=0;
      it.count=it.declared+rint(3,8);
      t.contraband={spot:"i:"+k,item:it.name,desc:`${it.count} ${it.unit} ${it.name}, ${it.declared?"nur "+it.declared+" deklariert":"nicht deklariert"}`};
    }
  }
  if(Math.random()<.2){
    const p=panelSpots(t).filter(id=>!t.contraband||t.contraband.spot!==id);
    if(p.length){t.falseSpot=pick(p);t.falseHintPos=randPos()}
  }
  let dest=t.dest;
  if(t.flaw==="destLie"){do{dest=pick(DESTS)}while(dest===t.dest)}
  t.answers={dest,claimOwner:t.flaw==="noAuth"?name:t.car.owner,purpose:t.purpose,
    declare:t.contraband&&Math.random()<.6?"Nein, gar nichts.":"Nur das, was auf der Deklaracja steht.",
    stay:pick(STAYS),nervous:(!!t.contraband||(!!t.flaw&&FLAWS[t.flaw].forgery))&&Math.random()<.6};
  t.line=t.contraband&&Math.random()<.5?pick(NERVOUS):pick(LINES);
  if((t.contraband||(t.flaw&&FLAWS[t.flaw].forgery))&&Math.random()<.2) t.bribe=rint(4,12)*10;
  return t;
}
