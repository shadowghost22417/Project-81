// Regeln der Dienstanweisung. Jede Regel schaltet Fehlerarten frei; Regeln mit "key" sind mit dem Rotstift einkreisbar.
const BASE_RULES=["docs","passValid","names","idNr","permitValid","photo","car","auth","decl","statements","arrest"];
const RULES={
  docs:{text:"Ausreise nur mit Dowód, Paszport und Przepustka.",flaws:["noPermit"]},
  passValid:{text:"Der Paszport muss gültig sein.",flaws:["expired"]},
  names:{text:"Alle Namen exakt gleich, auch ą, ł, ś usw.",flaws:["nameMismatch","spelling"]},
  idNr:{text:"Die Ausweisnummer im Paszport muss stimmen.",flaws:["idMismatch"]},
  permitValid:{text:"Die Przepustka muss heute gültig sein.",flaws:["permitExpired"]},
  photo:{text:"Das Foto muss die Person zeigen.",flaws:["photo"]},
  car:{text:"Kennzeichen (draußen ablesen) und Modell (siehe Fahrzeugtypen) wie im Dowód rejestracyjny.",flaws:["modelMismatch","plateMismatch"]},
  auth:{text:"Fremdes Auto nur mit Upoważnienie.",flaws:["noAuth"]},
  decl:{text:"Gepäck muss vollständig deklariert sein.",flaws:[]},
  statements:{text:"Aussagen müssen zu den Papieren passen.",flaws:["destLie"]},
  arrest:{text:"Fälschung, Schmuggel, List gończy oder Befehl im Dalekopis: Festnahme.",flaws:[]},
  banned:{key:"rule.banned",text:d=>`Keine Ausreise mit Wohnort ${d.banned.join(", ")} (Sperrgebiet).`,flaws:["bannedCity"]},
  exit:{key:"rule.exit",text:"Im Paszport muss der Ausreisevermerk der Milicja stehen (Seite „Amtliche Vermerke“).",flaws:["noExitStamp"]},
  cur:{key:"rule.cur",text:d=>`Devisen höchstens ${d.curLimit} USD pro Person, auf der Deklaracja anzugeben.`,flaws:["currencyLimit"]},
  deleg:{key:"rule.deleg",text:"Dienstreise nur mit Delegacja. Ihr Reiseziel muss zur Przepustka passen.",flaws:["noDeleg","delegDest"]}
};
Object.assign(FLAWS,{
  bannedCity:{text:"Die Person wohnte im Sperrgebiet.",forgery:false},
  noExitStamp:{text:"Der Ausreisevermerk der Milicja fehlte.",forgery:false},
  currencyLimit:{text:"Es waren mehr Devisen angemeldet als erlaubt.",forgery:false},
  noDeleg:{text:"Dienstreise ohne Delegacja.",forgery:false},
  delegDest:{text:"Das Ziel der Delegacja passte nicht zur Przepustka.",forgery:true},
  ordered:{text:"Die Person wurde im Dalekopis zur Festnahme ausgeschrieben.",forgery:true}
});
const ruleText=(id,d)=>{const r=RULES[id];return typeof r.text==="function"?r.text(d):r.text};
function activeRules(d){return [...BASE_RULES,...d.rules.filter(r=>r!=="banned"||d.banned.length)]}
function flawsFor(rules){return rules.flatMap(r=>RULES[r].flaws)}

// Zusätzliche Rotstift-Vergleiche für die neuen Regeln (null = kein Widerspruch, undefined = nicht zuständig)
function compareRules(a,b,t){
  const has=(x,y)=>(a===x&&b===y)||(a===y&&b===x), d=today();
  if(has("id.city","rule.banned")) return d.banned.includes(t.city)?{forgery:false,text:"Der Wohnort liegt im Sperrgebiet."}:null;
  if(has("pass.exit","rule.exit")) return !t.exitStamp?{forgery:false,text:"Der Ausreisevermerk der Milicja fehlt."}:null;
  if(has("decl.cur","rule.cur")) return t.currency>d.curLimit?{forgery:false,text:"Mehr Devisen als erlaubt."}:null;
  if(has("ans.purpose","rule.deleg")) return t.answers.purpose==="Dienstreise"&&!t.deleg?{forgery:false,text:"Dienstreise, aber keine Delegacja."}:null;
  if(has("deleg.dest","permit.dest")) return t.deleg&&t.deleg.dest!==t.dest?{forgery:true,text:"Das Ziel der Delegacja widerspricht der Przepustka."}:null;
  if(has("deleg.dest","ans.dest")) return t.deleg&&t.deleg.dest!==t.answers.dest?{forgery:true,text:"Das Ziel der Delegacja widerspricht der Aussage."}:null;
  return undefined;
}
