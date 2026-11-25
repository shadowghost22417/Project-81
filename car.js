// Fahrzeugkontrolle (wird später ausgebaut)

function openCar(){
  if(S.busy) return;
  $("carSpeech").textContent=S.cur.contraband?"„Ist das wirklich nötig, Genosse?“":"„Bitte sehr. Da ist nur Gepäck drin.“";
  $("searchMsg").textContent="Wo willst du suchen? Jede Stelle kostet "+SEARCH_COST+" Minuten.";
  document.querySelectorAll(".spot").forEach(b=>{
    const s=b.dataset.spot;
    b.classList.toggle("done",S.searched.includes(s));
    b.classList.toggle("hit",!!S.found&&S.cur.contraband.spot===s);
  });
  $("carScene").classList.add("show");
}

document.querySelectorAll(".spot").forEach(b=>b.addEventListener("click",()=>{
  const spot=b.dataset.spot;
  if(S.busy||S.searched.includes(spot)) return;
  S.searched.push(spot); S.min+=SEARCH_COST; b.classList.add("done");
  if(S.cur.contraband&&S.cur.contraband.spot===spot){
    S.found=S.cur.contraband.item; b.classList.add("hit");
    $("searchMsg").textContent="Gefunden: "+S.found+"! Du kannst die Person jetzt festnehmen.";
  } else $("searchMsg").textContent=spot+": nichts Verdächtiges.";
  updateHUD();
}));

$("bBack").onclick=()=>$("carScene").classList.remove("show");
