const DAY_START=16*60, DAY_END=22*60, DECIDE_COST=30;
const COST={look:5,knock:3,open:25,area:2};
const DAMAGE=30, WRONG_SEIZE=20;

const FIRST_M=["Jan","Piotr","Krzysztof","Andrzej","Tomasz","Marek","Józef","Stanisław","Zbigniew","Tadeusz","Łukasz","Wojciech"];
const FIRST_F=["Anna","Maria","Katarzyna","Małgorzata","Agnieszka","Barbara","Ewa","Krystyna","Elżbieta","Zofia","Jadwiga","Bożena"];
const LAST=[["Kowalski","Kowalska"],["Nowak","Nowak"],["Wiśniewski","Wiśniewska"],["Wójcik","Wójcik"],["Kamiński","Kamińska"],
  ["Lewandowski","Lewandowska"],["Zieliński","Zielińska"],["Szymański","Szymańska"],["Dąbrowski","Dąbrowska"],["Mazur","Mazur"],
  ["Woźniak","Woźniak"],["Kozłowski","Kozłowska"],["Jabłoński","Jabłońska"],["Król","Król"]];
const CITIES=["Warszawa","Kraków","Wrocław","Gdańsk","Poznań","Łódź","Katowice","Szczecin","Lublin","Legnica","Jelenia Góra","Białystok"];
const PLATE_PREFIX=["WAB","KRC","WRF","GDA","POZ","LDB","KTA","SZC","LUA","LGA","JGB","BIA"];
const DESTS=["Görlitz","Dresden","Berlin (Ost)","Leipzig","Cottbus"];
const BORDER_PLACES=["Zgorzelec","Świecko","Cieszyn","Kołbaskowo","Okęcie"];
const GOODS=["Solidarność-Flugblätter","Untergrundzeitungen","300 US-Dollar, nicht deklariert","Westmark-Bündel",
  "Tonbänder mit Radio Free Europe","Jeans aus dem Westen","Druckmatrizen"];
const LINES=["Dzień dobry. Ich besuche meine Schwester.","Guten Abend. Ich muss zur Arbeit nach drüben.",
  "Bitte, es ist kalt. Wie lange dauert das noch?","Meine Tante ist krank, ich bringe ihr Medikamente.","Dienstreise. Alles ist gestempelt."];
const NERVOUS=["Ist… ist alles in Ordnung mit den Papieren?","Ich habe es wirklich eilig, Genosse.","Das Auto? Da ist nichts drin. Nur Gepäck."];
const SKINS=["#e8c4a0","#d9ad86","#f0d2b4","#c99a72"];
const HAIRS=["#2b2018","#5a3b22","#8a6a3a","#999999","#c9a35a"];
const COATS=["#4a4a52","#5b4636","#3d4a3a","#6b2f2f"];
const CAR_COLORS=["#c8b26a","#8fa3b0","#a8423a","#6f8a5b","#d6d0c0","#3f5a7a"];

// Gepäck: Name, Einheit, min, max
const BAG_ITEMS=[["Bohnenkaffee","Pakete",1,3],["Wodka","Flaschen",1,2],["Zigaretten","Stangen",1,2],["Kleidung","Stück",2,8],
  ["Konserven","Dosen",1,6],["Bücher","Stück",1,3],["Schokolade","Tafeln",1,5]];
const BAG_SPOTS=[["Kofferboden","panel"],["Futter","panel"],["Seitentasche","open"],["Kulturbeutel","open"]];

// Verstecke: open = offen, dark = braucht Taschenlampe, panel = verschlossen
const CABIN=[["Handschuhfach","open"],["Unter den Sitzen","dark"],["Rücksitzpolster","panel"],["Türverkleidung","panel"]];
const FRONT_ENGINE=[["Luftfilter","open"],["Hinter dem Kühler","dark"],["Batteriekasten","panel"]];
const CAR_MODELS=[
  {name:"Fiat 126p",short:"126p",from:1973,r:20,wheels:[130,270],
    body:"M90 150 L90 115 Q92 100 110 98 L130 96 Q145 58 175 54 L235 54 Q262 58 275 96 L295 100 Q310 104 310 120 L310 150 Z",
    win:["M140 96 Q152 66 178 64 L200 64 L200 96 Z","M208 64 L232 64 Q252 68 264 96 L208 96 Z"],
    areas:[["Kofferraum vorne",[27,58],[["Kofferraumboden","open"],["Reserverad","panel"],["Hinter der Verkleidung","dark"]]],
      ["Innenraum",[50,36],CABIN],
      ["Motorraum hinten",[73,58],[["Luftfilterkasten","open"],["Neben dem Motor","dark"],["Motorabdeckung","panel"]]]]},
  {name:"Polski Fiat 125p",short:"125p",from:1967,r:22,wheels:[100,300],
    body:"M40 150 L40 112 L48 104 L110 100 L140 62 L250 62 L285 100 L352 104 L360 112 L360 150 Z",
    win:["M148 98 L168 70 L205 70 L205 98 Z","M213 70 L245 70 L272 98 L213 98 Z"],
    areas:[["Motorraum vorne",[16,58],FRONT_ENGINE],["Innenraum",[50,36],CABIN],
      ["Kofferraum hinten",[84,58],[["Kofferraumboden","open"],["Reserveradmulde","dark"],["Seitenverkleidung","panel"]]]]},
  {name:"FSO Polonez",short:"Polonez",from:1978,r:22,wheels:[105,300],
    body:"M40 150 L40 118 L52 108 L120 100 L160 62 L270 60 L350 100 L360 118 L360 150 Z",
    win:["M166 98 L180 70 L220 70 L220 98 Z","M228 70 L266 68 L320 98 L228 98 Z"],
    areas:[["Motorraum vorne",[16,58],FRONT_ENGINE],["Innenraum",[50,36],CABIN],
      ["Heckklappe",[84,58],[["Ladeboden","open"],["Unter der Hutablage","dark"],["Seitenverkleidung","panel"]]]]},
  {name:"FSO Syrena 105",short:"Syrena",from:1972,r:22,wheels:[110,290],
    body:"M50 150 L50 120 Q55 96 100 94 Q130 56 190 54 Q260 54 290 92 Q345 98 350 125 L350 150 Z",
    win:["M140 92 Q160 64 195 62 L200 92 Z","M208 62 Q252 64 275 92 L208 92 Z"],
    areas:[["Motorraum vorne",[18,58],[["Werkzeugkiste","open"],["Hinter dem Kühler","dark"],["Kotflügel innen","panel"]]],
      ["Innenraum",[50,36],CABIN],
      ["Kofferraum hinten",[82,58],[["Kofferraumboden","open"],["Reserverad","panel"],["Ecke hinten","dark"]]]]},
  {name:"FS Lublin Żuk",short:"Żuk",from:1959,r:22,wheels:[100,300],
    body:"M40 150 L40 100 L70 60 L360 60 L360 150 Z",
    win:["M78 98 L96 68 L140 68 L140 98 Z"],
    areas:[["Fahrerhaus",[22,40],[["Handschuhfach","open"],["Unter der Sitzbank","dark"],["Türverkleidung","panel"]]],
      ["Motor",[22,74],[["Motorabdeckung","panel"],["Neben dem Motor","dark"]]],
      ["Laderaum",[66,50],[["Kisten","open"],["Ecken hinten","dark"],["Ladeboden","panel"],["Seitenwand","panel"]]]]}
];

const FLAWS={
  expired:{text:"Der Paszport war abgelaufen.",forgery:false},
  permitExpired:{text:"Die Przepustka war nicht mehr gültig.",forgery:false},
  noPermit:{text:"Die Przepustka fehlte.",forgery:false},
  nameMismatch:{text:"Die Przepustka lief auf einen anderen Namen.",forgery:true},
  idMismatch:{text:"Die Dowód-Nummer im Paszport stimmte nicht.",forgery:true},
  spelling:{text:"Ein Name war falsch geschrieben.",forgery:true},
  photo:{text:"Das Foto zeigte eine andere Person.",forgery:true},
  modelMismatch:{text:"Das Auto passte nicht zum Dowód rejestracyjny.",forgery:true},
  plateMismatch:{text:"Das Kennzeichen stimmte nicht mit dem Dowód rejestracyjny überein.",forgery:true},
  noAuth:{text:"Fremdes Auto ohne Upoważnienie.",forgery:true}
};
const DIACRITICS={"ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ź":"z","ż":"z","Ł":"L","Ś":"S","Ż":"Z","Ź":"Z"};

const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const fmt=d=>String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear();
const idNr=()=>pick(["AB","CD","EG","KR","WR"])+" "+rint(100000,999999);

function randomFace(female){
  return {skin:pick(SKINS),hair:pick(HAIRS),coat:pick(COATS),hat:Math.random()<.35,
    beard:!female&&Math.random()<.3,glasses:Math.random()<.25};
}
function randomName(exclude){
  let n;
  do{const f=Math.random()<.5;n=(f?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST)[f?1:0]}while(n===exclude);
  return n;
}
function alterPlate(p){
  const idx=[...p].map((c,i)=>/\d/.test(c)?i:-1).filter(i=>i>=0), i=pick(idx);
  let d;do{d=String(rint(0,9))}while(d===p[i]);
  return p.slice(0,i)+d+p.slice(i+1);
}
// Leicht falsche Schreibweise eines Namens
function misspell(first,li,female){
  const last=LAST[li][female?1:0], full=first+" "+last, opts=[];
  const idx=[...full].map((c,i)=>DIACRITICS[c]?i:-1).filter(i=>i>=0);
  if(idx.length){const i=pick(idx);opts.push(full.slice(0,i)+DIACRITICS[full[i]]+full.slice(i+1))}
  if(female&&LAST[li][0]!==last) opts.push(first+" "+LAST[li][0]);
  if(last.length>4){const i=rint(1,last.length-3);if(last[i]!==last[i+1]) opts.push(first+" "+last.slice(0,i)+last[i+1]+last[i]+last.slice(i+2))}
  return opts.length?pick(opts):first+" "+last+"a";
}
// Alle verschlossenen Stellen (für falsche Verdachtsmomente)
function panelSpots(t){
  const ids=[];
  CAR_MODELS[t.car.model].areas.forEach((a,ai)=>a[2].forEach((s,si)=>{if(s[1]==="panel")ids.push(`c:${ai}:${si}`)}));
  BAG_SPOTS.forEach((s,i)=>{if(s[1]==="panel")ids.push("b:"+i)});
  return ids;
}

function makeTraveler(date){
  const female=Math.random()<.5, li=rint(0,LAST.length-1);
  const first=female?pick(FIRST_F):pick(FIRST_M), name=first+" "+LAST[li][female?1:0];
  const face=randomFace(female), ci=rint(0,CITIES.length-1), mi=rint(0,CAR_MODELS.length-1);
  const plate=PLATE_PREFIX[ci]+" "+rint(1000,9999);
  const t={name,female,face,photoFace:face,passName:name,permitName:name,
    birth:new Date(rint(1920,1963),rint(0,11),rint(1,28)),city:CITIES[ci],dest:pick(DESTS),
    id:idNr(),passNr:"ZA "+rint(1000000,9999999),passExpiry:addDays(date,rint(30,1500)),
    permitUntil:addDays(date,rint(0,30)),hasPermit:true,
    car:{model:mi,regModel:mi,plate,regPlate:plate,owner:name,color:pick(CAR_COLORS),year:rint(CAR_MODELS[mi].from,1981)},
    auth:false,bag:[],flaw:null,contraband:null,falseKnock:null,history:[]};
  t.passId=t.id;
  for(let i=rint(0,3);i>0;i--) t.history.push({place:pick(BORDER_PLACES),date:addDays(date,-rint(30,2500))});
  t.history.sort((a,b)=>b.date-a.date);

  // Gepäck
  t.bag=[...BAG_ITEMS].sort(()=>Math.random()-.5).slice(0,rint(3,5))
    .map(([n,u,a,b])=>{const c=rint(a,b);return {name:n,unit:u,count:c,declared:c}});

  // Fremdes Auto mit Vollmacht
  if(Math.random()<.2){t.car.owner=randomName(name);t.auth=true}

  // Fehler in den Papieren
  if(Math.random()<.45){
    t.flaw=pick(Object.keys(FLAWS));
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
    }
  }

  // Schmuggel
  if(Math.random()<.3){
    const r=Math.random(), m=CAR_MODELS[mi], item=pick(GOODS);
    if(r<.5){
      const ai=rint(0,m.areas.length-1), sp=m.areas[ai][2], si=rint(0,sp.length-1);
      t.contraband={spot:`c:${ai}:${si}`,desc:item+" ("+sp[si][0]+")"};
    } else if(r<.75){
      const bi=rint(0,BAG_SPOTS.length-1);
      t.contraband={spot:"b:"+bi,desc:item+" (Gepäck, "+BAG_SPOTS[bi][0]+")"};
    } else {
      const k=rint(0,t.bag.length-1), it=t.bag[k];
      if(Math.random()<.3) it.declared=0;
      it.count=it.declared+rint(3,8);
      t.contraband={spot:"i:"+k,desc:`${it.count} ${it.unit} ${it.name}, ${it.declared?"nur "+it.declared+" deklariert":"nicht deklariert"}`};
    }
  }
  // Manchmal klingt etwas verdächtig, ist aber harmlos
  if(Math.random()<.2){
    const p=panelSpots(t).filter(id=>!t.contraband||t.contraband.spot!==id);
    if(p.length) t.falseKnock=pick(p);
  }
  t.line=t.contraband&&Math.random()<.5?pick(NERVOUS):pick(LINES);
  return t;
}
