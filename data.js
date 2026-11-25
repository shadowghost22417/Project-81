// Einstellungen, Daten und Hilfsfunktionen
const DAY_START=16*60, DAY_END=22*60, DECIDE_COST=30, SEARCH_COST=15;

const FIRST_M=["Jan","Piotr","Krzysztof","Andrzej","Tomasz","Marek","Józef","Stanisław","Zbigniew","Tadeusz","Łukasz","Wojciech"];
const FIRST_F=["Anna","Maria","Katarzyna","Małgorzata","Agnieszka","Barbara","Ewa","Krystyna","Elżbieta","Zofia","Jadwiga","Bożena"];
const LAST=[["Kowalski","Kowalska"],["Nowak","Nowak"],["Wiśniewski","Wiśniewska"],["Wójcik","Wójcik"],["Kamiński","Kamińska"],
  ["Lewandowski","Lewandowska"],["Zieliński","Zielińska"],["Szymański","Szymańska"],["Dąbrowski","Dąbrowska"],["Mazur","Mazur"],
  ["Woźniak","Woźniak"],["Kozłowski","Kozłowska"],["Jabłoński","Jabłońska"],["Król","Król"]];
const CITIES=["Warszawa","Kraków","Wrocław","Gdańsk","Poznań","Łódź","Katowice","Szczecin","Lublin","Legnica","Jelenia Góra","Białystok"];
const DESTS=["Görlitz","Dresden","Berlin (Ost)","Leipzig","Cottbus"];
const BORDER_PLACES=["Zgorzelec","Świecko","Cieszyn","Kołbaskowo","Okęcie"];
const SPOTS=["Kofferraum vorne","Handschuhfach","Rücksitz","Motorraum hinten"];
const GOODS=["Solidarność-Flugblätter","Untergrundzeitungen","300 US-Dollar, nicht deklariert","5 kg Bohnenkaffee",
  "Tonbänder mit Radio Free Europe","Jeans aus dem Westen"];
const LINES=["Dzień dobry. Ich besuche meine Schwester.","Guten Abend. Ich muss zur Arbeit nach drüben.",
  "Bitte, es ist kalt. Wie lange dauert das noch?","Meine Tante ist krank, ich bringe ihr Medikamente.","Dienstreise. Alles ist gestempelt."];
const NERVOUS=["Ist… ist alles in Ordnung mit den Papieren?","Ich habe es wirklich eilig, Genosse.","Das Auto? Da ist nichts drin. Nur Gepäck."];
const SKINS=["#e8c4a0","#d9ad86","#f0d2b4","#c99a72"];
const HAIRS=["#2b2018","#5a3b22","#8a6a3a","#999999","#c9a35a"];
const COATS=["#4a4a52","#5b4636","#3d4a3a","#6b2f2f"];

const FLAWS={
  expired:{text:"Der Paszport war abgelaufen.",forgery:false},
  permitExpired:{text:"Die Przepustka war nicht mehr gültig.",forgery:false},
  noPermit:{text:"Die Przepustka fehlte.",forgery:false},
  nameMismatch:{text:"Die Przepustka lief auf einen anderen Namen.",forgery:true},
  idMismatch:{text:"Die Dowód-Nummer im Paszport stimmte nicht.",forgery:true},
  spelling:{text:"Ein Name war falsch geschrieben.",forgery:true},
  photo:{text:"Das Foto zeigte eine andere Person.",forgery:true}
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

// Erzeugt eine leicht falsche Schreibweise des Namens
function misspell(first,li,female){
  const last=LAST[li][female?1:0], full=first+" "+last, opts=[];
  const idx=[...full].map((c,i)=>DIACRITICS[c]?i:-1).filter(i=>i>=0);
  if(idx.length){const i=pick(idx);opts.push(full.slice(0,i)+DIACRITICS[full[i]]+full.slice(i+1))}
  if(female&&LAST[li][0]!==last) opts.push(first+" "+LAST[li][0]);
  if(last.length>4){const i=rint(1,last.length-3);if(last[i]!==last[i+1]) opts.push(first+" "+last.slice(0,i)+last[i+1]+last[i]+last.slice(i+2))}
  return opts.length?pick(opts):first+" "+last+"a";
}

function makeTraveler(date){
  const female=Math.random()<.5, li=rint(0,LAST.length-1);
  const first=female?pick(FIRST_F):pick(FIRST_M), name=first+" "+LAST[li][female?1:0];
  const face=randomFace(female);
  const t={name,female,face,photoFace:face,passName:name,permitName:name,
    birth:new Date(rint(1920,1963),rint(0,11),rint(1,28)),city:pick(CITIES),dest:pick(DESTS),
    id:idNr(),passNr:"ZA "+rint(1000000,9999999),passExpiry:addDays(date,rint(30,1500)),
    permitUntil:addDays(date,rint(0,30)),hasPermit:true,flaw:null,contraband:null,history:[]};
  t.passId=t.id;
  for(let i=rint(0,3);i>0;i--) t.history.push({place:pick(BORDER_PLACES),date:addDays(date,-rint(30,2500))});
  t.history.sort((a,b)=>b.date-a.date);

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
    }
  }
  if(Math.random()<.25) t.contraband={spot:pick(SPOTS),item:pick(GOODS)};
  t.line=t.contraband&&Math.random()<.5?pick(NERVOUS):pick(LINES);
  return t;
}
