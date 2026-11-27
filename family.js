// Familie, Preise und Tagesabrechnung
const FAMILY_INIT=()=>[
  {name:"Ewa",role:"deine Frau",hunger:0,cold:0,sick:false,crit:0,tough:3},
  {name:"Kasia",role:"Tochter, 9 Jahre",hunger:0,cold:0,sick:false,crit:0,tough:2},
  {name:"Tomek",role:"Sohn, 6 Jahre",hunger:0,cold:0,sick:false,crit:0,tough:2}];
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
    <h3>Familie</h3>
    ${S.family.map(m=>{const [st,c]=memberStatus(m);return `<div class="lrow"><span>${m.name} <small>(${m.role})</small></span><b class="st ${c}">${st}</b></div>`}).join("")}
  </div>`;
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
