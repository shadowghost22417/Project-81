// Kampagne „Kapitel 1: Kriegsrecht“ (13.12.1981 bis 22.07.1983)
// paper = was die Parteizeitung schreibt, whisper = was man sich erzählt (Radio Wolna Europa, Nachbarn)
const D=(y,m,d)=>new Date(y,m-1,d);
const DAYS=[
  {date:D(1981,12,14),rules:[],banned:[],curLimit:0,price:1,wage:1,orders:["cityGoods"],scripted:[],
    paper:{head:"Militärrat zur Nationalen Errettung übernimmt Verantwortung",
      text:"In der Nacht zum 13. Dezember hat der Staatsrat den Kriegszustand ausgerufen. General Wojciech Jaruzelski wandte sich am Morgen im Radio an die Nation. Streiks und Versammlungen sind verboten, von 22 bis 6 Uhr gilt eine Ausgangssperre, die Telefonleitungen sind unterbrochen. Grenzübergänge arbeiten nach besonderen Anweisungen."},
    whisper:"Nachts sind Tausende abgeholt worden. Man sagt, auch Lech Wałęsa ist interniert."},
  {date:D(1981,12,17),rules:["banned"],banned:["Katowice"],curLimit:0,price:1,wage:1,orders:["westmark"],
    scripted:[{at:2,id:"mother1"}],
    paper:{head:"Ruhe und Ordnung in Schlesien wiederhergestellt",
      text:"Am 16. Dezember haben Einheiten der Miliz die Besetzung der Grube „Wujek“ in Katowice beendet. Die Behörden sprechen von Opfern unter den Streikenden und rufen zur Besonnenheit auf. Die Woiwodschaft Katowice gilt bis auf Weiteres als Sperrgebiet."},
    whisper:"Neun Bergleute aus der Grube Wujek sind tot. Die ZOMO hat scharf geschossen."},
  {date:D(1981,12,24),rules:["banned","exit"],banned:["Katowice"],curLimit:0,price:1,wage:1,orders:["sb1"],
    scripted:[{at:1,id:"smuggler1"},{at:4,id:"sb1"}],
    paper:{head:"Washington verhängt Sanktionen gegen Polen",
      text:"Der amerikanische Präsident Reagan hat am 23. Dezember Wirtschaftssanktionen gegen die Volksrepublik verkündet. Die Regierung verurteilt die Einmischung in die inneren Angelegenheiten Polens. Ab heute braucht jede Ausreise einen Vermerk der Milicja im Paszport."},
    whisper:"Heiligabend, und so viele Stühle bleiben leer. Die Internierten dürfen keine Pakete bekommen."},
  {date:D(1982,2,2),rules:["banned","exit","cur"],banned:["Katowice"],curLimit:50,price:1.5,wage:1.3,orders:["zuk"],
    scripted:[{at:3,id:"mother2"}],
    paper:{head:"Neue Preise – ein notwendiger Schritt",
      text:"Seit dem 1. Februar gelten neue Preise für Lebensmittel, Kohle und Energie. Zum Ausgleich erhalten Werktätige und Rentner Zuschläge. Um die Wirtschaft zu schützen, dürfen Reisende künftig nur noch begrenzt Devisen ausführen."},
    whisper:"Fleisch kostet jetzt ein Vielfaches. Und auf die Marken gibt es trotzdem nichts."},
  {date:D(1982,9,1),rules:["banned","exit","cur","deleg"],banned:["Gdańsk","Wrocław","Kraków"],curLimit:50,price:1.5,wage:1.3,orders:["cityGoods","person"],
    scripted:[{at:2,id:"smuggler2"}],
    paper:{head:"Unruhestifter in die Schranken gewiesen",
      text:"Am 31. August versuchten Extremisten in Warschau, Danzig, Breslau, Krakau, Lubin und weiteren Städten, Unruhen zu schüren. Die Ordnungskräfte haben die Lage unter Kontrolle. Dienstreisen ins Ausland sind ab sofort nur noch mit Delegacja des Betriebs erlaubt."},
    whisper:"In Lubin hat die Miliz in die Menge geschossen. Drei Tote."},
  {date:D(1982,10,9),rules:["banned","exit","cur","deleg"],banned:["Gdańsk"],curLimit:50,price:1.5,wage:1.3,orders:["sb2","badges"],
    scripted:[{at:2,id:"sb2"},{at:5,id:"mother3"}],
    paper:{head:"Sejm beschließt neues Gewerkschaftsgesetz",
      text:"Am 8. Oktober hat der Sejm ein neues Gesetz über die Gewerkschaften verabschiedet. Alle bisherigen Gewerkschaften, auch die „Solidarność“, sind damit aufgelöst. Abzeichen und Schriften der aufgelösten Organisation gelten als verbotenes Material."},
    whisper:"Auf der Danziger Werft sagen sie, das lassen sie sich nicht gefallen."},
  {date:D(1982,11,15),rules:["banned","exit","cur","deleg"],banned:["Gdańsk"],curLimit:50,price:1.5,wage:1.3,orders:["person"],
    scripted:[{at:3,id:"smuggler3"}],
    paper:{head:"Lech Wałęsa aus der Internierung entlassen",
      text:"Der Internierte Lech Wałęsa ist am 14. November freigelassen worden und nach Danzig zurückgekehrt. Regierungssprecher Jerzy Urban nannte ihn eine Privatperson, den „ehemaligen Vorsitzenden der ehemaligen Solidarność“."},
    whisper:"Vor seiner Wohnung in Danzig standen Hunderte und haben gesungen."},
  {date:D(1982,12,31),rules:["exit","cur","deleg"],banned:[],curLimit:50,price:1.5,wage:1.3,orders:["westmark","cityGoods"],scripted:[],
    paper:{head:"Kriegszustand ausgesetzt",
      text:"Ab heute ist der Kriegszustand ausgesetzt. Die Internierungslager werden geschlossen. Die Sperrgebiete sind aufgehoben, viele Sonderbestimmungen bleiben jedoch in Kraft."},
    whisper:"Ausgesetzt, nicht aufgehoben. Die Gesetze bleiben, nur die Panzer fahren weg."},
  {date:D(1983,6,17),rules:["exit","cur","deleg"],banned:[],curLimit:50,price:1.5,wage:1.3,orders:["badges","person"],scripted:[],
    paper:{head:"Papst Johannes Paul II. in seiner Heimat",
      text:"Seit dem 16. Juni ist der Papst zu seiner zweiten Pilgerreise in Polen. Zu den Messen kommen Hunderttausende Gläubige. Die Behörden rufen zu Ruhe und Würde auf."},
    whisper:"Auf der Messe in Warschau waren wieder Solidarność-Transparente zu sehen."},
  {date:D(1983,7,22),rules:["exit","cur","deleg"],banned:[],curLimit:50,price:1.5,wage:1.3,orders:["cityGoods"],scripted:[],
    paper:{head:"Kriegszustand aufgehoben – Amnestie",
      text:"Am heutigen Nationalfeiertag, dem 22. Juli, wird der Kriegszustand aufgehoben. Gleichzeitig tritt ein Amnestiegesetz in Kraft."},
    whisper:"Viele Bestimmungen aus dem Kriegsrecht stehen jetzt einfach in normalen Gesetzen."}
];
const today=()=>DAYS[Math.min(S.day,DAYS.length)-1];
const isColdMonth=d=>{const m=d.getMonth();return m>=9||m<=3};

// Persönliche Notizen in der Zeitung, abhängig von früheren Entscheidungen
function personalNotes(dayIdx,f){
  const n=[];
  if(dayIdx===4&&f.motherHelped) n.push("Im Briefkasten ein Zettel ohne Absender: »Die Medizin hilft. Danke. H. W.«");
  if(dayIdx===8){
    if(f.motherHelped>=2) n.push("Ein Brief aus Jelenia Góra: »Tomek ist wieder gesund und geht zur Schule. Wir werden Sie nie vergessen. Halina Wróbel«");
    else if(f.motherRejected>=2) n.push("Eine Kollegin erzählt: Der Sohn von Halina Wróbel liegt seit Monaten im Krankenhaus. Sie selbst kommt nicht mehr an die Grenze.");
  }
  if(dayIdx===5&&f.smugglerArrested) n.push("Im Dienstbuch steht ein Lob des Kommandanten: »Schmugglerring in Wrocław zerschlagen.«");
  if(f.sbDefied&&dayIdx===6) n.push("Kapitan Brzeski hat sich nach dir erkundigt. Der Kommandant sieht dich seitdem anders an.");
  if(f.sbObeyed>=2&&dayIdx===7) n.push("Ein Umschlag vom Kommandanten: Weihnachtsgeld »für besondere Zuverlässigkeit«.");
  return n;
}

// ---------- Tagesanweisungen (Dalekopis) ----------
// Jede Anweisung bereitet einige Reisende vor (t.order = id). Bewertung in game.js.
const ORDER_GEN={
  cityGoods:()=>{const ci=pick(CITIES.map((c,i)=>i).filter(i=>!today().banned.includes(CITIES[i]))),
      item=pick(["Druckmatrizen","Solidarność-Flugblätter","Untergrundzeitungen"]);
    return {kind:"search",count:2,text:`Fahrzeuge aus ${CITIES[ci]} (Kennzeichen ${PLATE_PREFIX[ci]}) gründlich durchsuchen. Erwartet: ${item}.`,
      apply:t=>{setHome(t,ci);placeContraband(t,item,"car")}}},
  westmark:()=>({kind:"search",count:2,text:"Keine Westmark durchlassen. Gepäck und Koffer genau prüfen.",
    apply:t=>placeContraband(t,"Westmark-Bündel","bag")}),
  zuk:()=>({kind:"search",count:2,text:"Alle Żuk-Lieferwagen bis in den Laderaum prüfen. Verdacht auf Druckmaschinenteile.",
    apply:t=>{setModel(t,4);placeContraband(t,"Druckmatrizen","c:2:"+rint(0,3))}}),
  badges:()=>({kind:"search",count:2,text:"Abzeichen und Schriften der aufgelösten Solidarność beschlagnahmen. Auch in Polstern und Futter suchen.",
    apply:t=>placeContraband(t,"Solidarność-Abzeichen",Math.random()<.5?"bag":"car")}),
  person:()=>{const female=Math.random()<.35,glasses=Math.random()<.5,beard=!female&&!glasses,model=rint(0,3),
      ci=pick(CITIES.map((c,i)=>i).filter(i=>!today().banned.includes(CITIES[i])));
    const desc=(female?"Frau":"Mann")+(glasses?" mit Brille":"")+(beard?" mit Bart":"")+`, Wohnort ${CITIES[ci]}, fährt einen ${CAR_MODELS[model].name}`;
    return {kind:"person",count:1,text:`Gesucht: ${desc}. Sofort festnehmen.`,
      apply:t=>{const f=randomFace(female);f.glasses=glasses;f.beard=beard;f.hat=false;
        const name=(female?pick(FIRST_F):pick(FIRST_M))+" "+pick(LAST)[female?1:0];
        Object.assign(t,{female,face:f,photoFace:f,name,passName:name,permitName:name,flaw:"ordered"});t.car.owner=name;t.auth=false;
        setHome(t,ci);setModel(t,model)}}},
  sb1:()=>({kind:"sb",count:0,text:"Befehl von Kapitan Brzeski (SB): Marek Sobczak ungehindert passieren lassen. Keine Fragen, keine Durchsuchung."}),
  sb2:()=>({kind:"sb",count:0,text:"Befehl von Kapitan Brzeski (SB): Edward Gajda passieren lassen. Was in seinen Papieren steht, geht dich nichts an."})
};

// ---------- Wiederkehrende Figuren ----------
const CHAR={
  mother:{name:"Halina Wróbel",female:true,city:9,face:{skin:"#e8c4a0",hair:"#5a3b22",coat:"#4a4a52",hat:true,beard:false,glasses:false,female:true}},
  smuggler:{name:"Ryszard Kos",female:false,city:2,model:2,color:"#8fa3b0",face:{skin:"#d9ad86",hair:"#2b2018",coat:"#5b4636",hat:false,beard:false,glasses:true,female:false}},
  sobczak:{name:"Marek Sobczak",female:false,city:0,face:{skin:"#f0d2b4",hair:"#999999",coat:"#4a4a52",hat:true,beard:false,glasses:false,female:false}},
  gajda:{name:"Edward Gajda",female:false,city:0,face:{skin:"#c99a72",hair:"#5a3b22",coat:"#3d4a3a",hat:false,beard:true,glasses:false,female:false}}
};
function asChar(t,c){
  Object.assign(t,{name:c.name,female:c.female,face:c.face,photoFace:c.face,passName:c.name,permitName:c.name,auth:false,wanted:null});
  t.car.owner=c.name; setHome(t,c.city); if(c.model!==undefined) setModel(t,c.model); if(c.color) t.car.color=c.color;
  if(t.deleg) t.deleg.name=c.name;
}
// build(t) passt einen frisch erzeugten Reisenden an; decide(type) kann das Ergebnis überschreiben
const SCRIPTS={
  mother1:{flaw:"noPermit",build:t=>{asChar(t,CHAR.mother);
      t.line="Bitte, Genosse. Mein Sohn ist krank. In Görlitz gibt es die Medizin. Die Przepustka hat man mir verweigert.";},
    after:(type,f)=>{if(type==="approve")f.motherHelped=(f.motherHelped||0)+1;else f.motherRejected=(f.motherRejected||0)+1}},
  mother2:{flaw:"noPermit",build:t=>{asChar(t,CHAR.mother);
      t.line=S.flags.motherHelped?"Sie sind es. Gott sei Dank. Die Medizin ist aufgebraucht, er braucht mehr.":"Ich versuche es wieder. Er hustet die ganze Nacht. Bitte.";},
    after:(type,f)=>{if(type==="approve")f.motherHelped=(f.motherHelped||0)+1;else f.motherRejected=(f.motherRejected||0)+1}},
  mother3:{flaw:()=>S.flags.motherHelped?null:"noPermit",build:t=>{asChar(t,CHAR.mother);
      t.line=S.flags.motherHelped?"Diesmal habe ich alle Papiere. Ihm geht es besser, wirklich.":"Er ist so schwach geworden. Ich habe wieder keine Przepustka bekommen.";},
    after:(type,f)=>{if(type==="approve")f.motherHelped=(f.motherHelped||0)+1;else f.motherRejected=(f.motherRejected||0)+1}},
  smuggler1:{flaw:null,skip:f=>f.smugglerArrested,bribe:100,build:t=>{asChar(t,CHAR.smuggler);placeContraband(t,"Westmark-Bündel","car");
      t.line="Kalt heute, was? Vielleicht hilft das gegen die Kälte.";},
    after:(type,f)=>{if(type==="arrest")f.smugglerArrested=true;else if(type==="approve")f.smugglerPassed=(f.smugglerPassed||0)+1}},
  smuggler2:{flaw:null,skip:f=>f.smugglerArrested,bribe:200,build:t=>{asChar(t,CHAR.smuggler);placeContraband(t,"300 US-Dollar","car");
      t.line=S.flags.smugglerPassed?"Mein Freund! Wie immer, ja? Ich habe auch etwas mehr dabei.":"Wir kennen uns doch. Diesmal bin ich großzügiger.";},
    after:(type,f)=>{if(type==="arrest")f.smugglerArrested=true;else if(type==="approve")f.smugglerPassed=(f.smugglerPassed||0)+1}},
  smuggler3:{flaw:null,skip:f=>f.smugglerArrested,bribe:400,build:t=>{asChar(t,CHAR.smuggler);placeContraband(t,"Tonbänder (Radio Free Europe)","car");
      t.line="Das letzte Mal, versprochen. Danach bin ich in Westberlin.";},
    after:(type,f)=>{if(type==="arrest")f.smugglerArrested=true;else if(type==="approve")f.smugglerPassed=(f.smugglerPassed||0)+1}},
  sb1:{flaw:"expired",sb:true,build:t=>{asChar(t,CHAR.sobczak);t.line="Sie wissen, wer ich bin. Machen Sie schnell.";}},
  sb2:{flaw:"idMismatch",sb:true,build:t=>{asChar(t,CHAR.gajda);t.line="Man hat Ihnen Bescheid gegeben, nehme ich an.";}}
};
