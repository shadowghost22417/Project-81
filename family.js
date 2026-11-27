// Familie, Preise und Tagesabrechnung
const FAMILY_INIT=()=>[
  {name:"Ewa",role:"deine Frau",hunger:0,cold:0,sick:false,crit:0,tough:3},
  {name:"Tosia",role:"Tochter, 9 Jahre",hunger:0,cold:0,sick:false,crit:0,tough:2},
  {name:"Paweł",role:"Sohn, 6 Jahre",hunger:0,cold:0,sick:false,crit:0,tough:2}];
const FAMILY_FACES={
  "Ewa":{skin:"#e8c4a0",hair:"#8a6a3a",coat:"#5b4636",hat:false,beard:false,glasses:false,female:true},
  "Tosia":{skin:"#f0d2b4",hair:"#c9a35a",coat:"#6b2f2f",hat:false,beard:false,glasses:false,female:true,child:true},
  "Paweł":{skin:"#f0d2b4",hair:"#5a3b22",coat:"#3d4a3a",hat:false,beard:false,glasses:false,female:false,child:true}};
// Alte Spielstände (Version 3) auf die neuen Namen umstellen
function migrateFamily(fam){
  const ren={Kasia:"Tosia",Tomek:"Paweł"};
  fam.forEach(m=>{if(ren[m.name])m.name=ren[m.name]});
  return fam;
}
const PRICES={rent:30,food:45,drink:12,coal:30,med:35};
const BUY_LABEL={rent:"Miete",food:"Essen (Brot, Kartoffeln, Kohl)",drink:"Trinken (Milch, Tee)",coal:"Kohle zum Heizen"};
const priceOf=k=>k==="rent"?PRICES.rent:Math.round(PRICES[k]*today().price);

function memberStatus(m){
  if(m.crit>0) return ["schwer krank","crit"];
  if(m.sick) return ["krank","sick"];
  const a=[]; if(m.hunger) a.push("hungrig"); if(m.cold) a.push("friert");
  return a.length?[a.join(", "),"warn"]:["gesund","ok"];
}
function familyWorries(){
  return S.family.filter(m=>memberStatus(m)[1]!=="ok").map(m=>{
    const [st]=memberStatus(m);
    return m.crit?`${m.name} liegt mit Fieber im Bett und isst nichts mehr.`:m.sick?`${m.name} ist krank und hustet die ganze Nacht.`:`${m.name} ist ${st}.`;
  });
}

// ---------- Abrechnung ----------
function ledgerItems(){
  // Reihenfolge = Priorität: bei zu wenig Geld wird von hinten abgewählt
  const items=[{k:"rent",must:true}];
  S.family.forEach((m,i)=>{if(m.sick) items.push({k:"med",i,label:`Medizin für ${m.name}`})});
  items.push({k:"food"},{k:"drink"});
  if(isColdMonth(S.date)) items.push({k:"coal"});
  return items.map(it=>Object.assign(it,{price:priceOf(it.k),label:it.label||BUY_LABEL[it.k]}));
}
function showLedger(){
  const L=S.ledger; L.items=ledgerItems();
  L.buy=L.items.map(()=>true);
  renderLedger(); $("dayEnd").classList.add("show");
}
function ledgerTotal(){return S.ledger.items.reduce((s,it,i)=>s+(S.ledger.buy[i]?it.price:0),0)}
function renderLedger(){
  const L=S.ledger;
  // nicht bezahlbare Posten von hinten abwählen (Miete wird immer bezahlt, notfalls mit Schulden)
  for(let i=L.items.length-1;i>=0&&S.money-ledgerTotal()<0;i--) if(!L.items[i].must) L.buy[i]=false;
  const t2=ledgerTotal(), r2=S.money-t2;
  $("ledger").innerHTML=`<div class="lcol">
    <h3>Schicht vom ${fmt(S.date)}</h3>
    <div class="lrow"><span>Richtig / Fehler</span><b>${S.shift.correct} / ${S.shift.errors}</b></div>
    <div class="lrow"><span>Prämien und Abzüge</span><b>${L.earned>=0?"+":""}${L.earned} zł</b></div>
    <div class="lrow"><span>Grundlohn</span><b>+${L.wage} zł</b></div>
    <div class="lrow sum"><span>Kontostand</span><b>${S.money} zł</b></div>
    ${L.notes.map(n=>`<p class="lnote">${n}</p>`).join("")}
    <div class="lrow"><span>Verwarnungen</span><b class="${S.warnings>=2?"bad":""}">${S.warnings} / 3</b></div>
  </div><div class="lcol">
    <h3>Ausgaben</h3>
    ${L.items.map((it,i)=>{const can=it.must||L.buy[i]||r2-it.price>=0;
      return `<label class="buy ${can?"":"no"}"><input type="checkbox" data-buy="${i}" ${L.buy[i]?"checked":""} ${it.must||!can?"disabled":""}>
        <span>${it.label}</span><b>${it.price} zł</b></label>`}).join("")}
    <div class="lrow sum"><span>Bleibt</span><b class="${r2<0?"bad":""}">${r2} zł</b></div>
  </div>`;
  drawHome();
}

// ---------- Die Wohnung am Abend ----------
// Zeigt Ewa, Tosia und Paweł in ihrem aktuellen Zustand: blass vor Hunger, in Decken, krank im Bett
function tintCanvas(src,col){
  const c=mk(src.width,src.height),g=c.getContext("2d");g.drawImage(src,0,0);
  g.globalCompositeOperation="source-atop";g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return c;
}
function drawHome(){
  const cv=$("homeCanvas"); if(!cv) return;
  const W=220,H=84; cv.width=W; cv.height=H;
  const p=P(cv), cold=isColdMonth(S.date), freezing=cold&&S.family.some(m=>m.cold>0);
  // Wand, Boden, Fenster
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const wall=y<62;
    p.dot(x,y,wall?((x%16===0)?"#3a3a33":((x*7+y*3)%19===0?"#3f3e36":"#45443b")):((x+y*2)%9===0?"#2a241d":"#30291f"))}
  p.rect(0,61,W,2,"#1d1914");
  p.rect(8,10,34,26,"#1a1d22");p.rect(8,10,34,26,"#1a1d22");
  for(let y=11;y<35;y++)for(let x=9;x<41;x++)p.dot(x,y,y<30?"#0f1318":"#1a1f26");
  p.rect(24,10,2,26,"#5a4a36");p.rect(8,22,34,2,"#5a4a36");p.rect(7,9,36,1,"#6b5a42");p.rect(7,36,36,2,"#6b5a42");
  if(cold) for(let i=0;i<14;i++)p.dot(10+((i*37)%30),12+((i*53)%20),"#9a9c94");
  // Heiligenbild und Kalender
  p.rect(52,14,10,13,"#6b5a3a");p.rect(53,15,8,11,"#2f3a52");p.ell(57,19,2,2,"#c9b27a");
  // Ofen
  const sx=W-30;
  p.rect(sx,34,22,28,"#2a2826");p.rect(sx+2,36,18,2,"#3a3835");p.rect(sx+8,14,5,20,"#24221f");
  p.rect(sx+5,46,12,8,freezing?"#141312":"#5a2410");
  if(!freezing){for(let i=0;i<8;i++)p.dot(sx+6+((i*5)%10),47+((i*3)%6),i%2?"#e08a3a":"#f0b860");
    for(let y=30;y<62;y++)for(let x=sx-10;x<W;x++)if(((x+y)&1)===0&&Math.hypot(x-sx-11,y-50)<26)p.dot(x,y,"rgba(230,140,60,.06)")}
  // Familie: gesund stehend, krank im Bett
  const slots=[{x:52},{x:102},{x:146}];
  S.family.forEach((m,i)=>{
    const face=FAMILY_FACES[m.name]||randomFace(i===0); let por=portrait(face,true);
    if(m.hunger>0||m.sick) por=tintCanvas(por,"rgba(215,220,200,.22)");
    const x0=slots[i].x-29, child=face.child;
    if(m.sick){
      p.rect(x0+2,58,56,10,"#4a3a28");p.rect(x0+2,56,56,3,"#5e4a32");p.rect(x0+2,66,4,10,"#3a2c1e");p.rect(x0+52,66,4,10,"#3a2c1e");
      p.rect(x0+6,48,16,9,"#c9c4b4");
      if(m.crit){ // liegt flach
        const hc=mk(68,58),hg=hc.getContext("2d");hg.translate(34,29);hg.rotate(-Math.PI/2);hg.drawImage(por,-29,-34);
        p.g.drawImage(hc,0,0,40,58,x0-12,26,40,58);
      } else p.g.drawImage(por,0,0,58,40,x0,16,58,40);
      p.ell(x0+34,55,23,5,(x,y)=>((x+y)%5===0)?"#5a6a5a":"#6f7f6a",(x,y)=>y>=52);
      p.rect(x0+11,53,48,6,"#6f7f6a");p.line(x0+11,55,x0+58,55,"#5a6a5a");
      if(!m.crit){p.dot(x0+23,46,"#c0504a");p.dot(x0+24,46,"#c0504a");p.dot(x0+34,46,"#b0403a");p.dot(x0+35,46,"#b0403a")}
    } else {
      p.g.drawImage(por,x0,child?24:10);
      if(m.cold){ // Decke über den Schultern
        const by=child?60:50;
        p.poly([[x0+6,by],[x0+52,by],[x0+56,H],[x0+2,H]],(x,y)=>((x>>1)+(y>>1))%4===0?"#6a5a46":(y%6===0?"#7a3a30":"#806c52"));
      }
    }
    if(freezing&&!m.crit){const bx=x0+36,byy=(m.sick?40:child?55:41);for(let k=0;k<6;k++)p.dot(bx+k,byy-((k*3)%4),"rgba(220,225,230,.35)")}
  });
}
document.addEventListener("change",e=>{
  const c=e.target.closest&&e.target.closest("[data-buy]"); if(!c) return;
  S.ledger.buy[+c.dataset.buy]=c.checked; renderLedger();
});

// Wendet die Einkäufe an. Rückgabe: Name eines verstorbenen Familienmitglieds oder null
function applyLedger(){
  const L=S.ledger, bought=k=>L.items.some((it,i)=>it.k===k&&L.buy[i]);
  S.money-=ledgerTotal();
  const cold=isColdMonth(S.date), medFor=new Set(L.items.filter((it,i)=>it.k==="med"&&L.buy[i]).map(it=>it.i));
  let lost=null;
  S.family.forEach((m,i)=>{
    const wasSick=m.sick;
    if(wasSick){ if(medFor.has(i)){m.sick=false;m.crit=0} else m.crit++ }
    // Hunger und Kälte steigen höchstens um 1 pro Tag; Kinder halten weniger aus als Ewa
    m.hunger=bought("food")&&bought("drink")?0:m.hunger+1;
    m.cold=cold&&!bought("coal")?m.cold+1:0;
    const lim=m.tough||2;
    if(!m.sick&&(m.hunger>=lim||m.cold>=lim)&&!(wasSick&&medFor.has(i))){m.sick=true;m.crit=0}
    if(m.crit>=2&&!lost) lost=m.name;
  });
  return lost;
}
