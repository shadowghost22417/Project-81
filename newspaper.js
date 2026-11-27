// Zeitung am Tagesbeginn: Parteizeitung, Mitteilung an den Grenzdienst, Gerüchte und Privates
const MONTHS_DE=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const WEEKDAYS_PL=["NIEDZIELA","PONIEDZIAŁEK","WTOREK","ŚRODA","CZWARTEK","PIĄTEK","SOBOTA"];

function ruleChanges(i){
  const d=DAYS[i], now=activeRules(d), before=i?activeRules(DAYS[i-1]):BASE_RULES, out=[];
  now.filter(r=>!before.includes(r)).forEach(r=>out.push("Neu: "+ruleText(r,d)));
  before.filter(r=>!now.includes(r)).forEach(r=>out.push(r==="banned"?"Die Sperrgebiete sind aufgehoben.":"Aufgehoben: "+ruleText(r,DAYS[i-1])));
  if(i&&now.includes("banned")&&before.includes("banned")&&d.banned.join()!==DAYS[i-1].banned.join())
    out.push("Geändert: "+ruleText("banned",d));
  if(i&&d.price!==DAYS[i-1].price) out.push("Neue Preise für Lebensmittel und Kohle. Löhne werden angehoben.");
  return out;
}
function showNewspaper(i,done){
  const d=DAYS[i], dt=d.date, notes=[...personalNotes(i,S.flags),...familyWorries()], changes=ruleChanges(i);
  $("newsSheet").innerHTML=`
    <div class="mast"><small>ORGAN KC PZPR</small><b>TRYBUNA LUDU</b>
      <small>${WEEKDAYS_PL[dt.getDay()]} · ${dt.getDate()}. ${MONTHS_DE[dt.getMonth()]} ${dt.getFullYear()} · Cena 2 zł</small></div>
    <h2 class="head">${d.paper.head}</h2>
    <div class="cols">
      <div class="main"><p>${d.paper.text}</p></div>
      <div class="side">
        ${changes.length?`<div class="box"><b>Komunikat für den Grenzdienst</b>${changes.map(c=>`<p>${c}</p>`).join("")}</div>`:""}
        <div class="box whisper"><b>Was man sich erzählt</b><p>„${d.whisper}“</p></div>
        ${notes.length?`<div class="box private"><b>Zu Hause</b>${notes.map(n=>`<p>${n}</p>`).join("")}</div>`:""}
      </div>
    </div>
    <p class="dayno">Schicht ${i+1} von ${DAYS.length} · Kapitel 1: Kriegsrecht</p>`;
  $("paper").classList.add("show"); SFX.play("paper");
  $("bToShift").onclick=()=>{$("paper").classList.remove("show");SFX.play("door");done()};
}
