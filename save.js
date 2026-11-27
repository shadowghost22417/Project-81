// Spielstand im Browser speichern (funktioniert auch ohne localStorage, dann eben ohne Speicherstand)
const SAVE_KEY="zgorzelec81.save";
function saveGame(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,day:S.day,money:S.money,family:S.family,warnings:S.warnings,flags:S.flags}))}catch(e){}
}
function loadSave(){
  try{const d=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");if(d&&d.family) migrateFamily(d.family); return d&&d.v===1&&DAYS[d.day-1]?d:null}catch(e){return null}
}
function clearSave(){try{localStorage.removeItem(SAVE_KEY)}catch(e){}}
