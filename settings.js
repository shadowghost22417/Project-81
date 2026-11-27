// Einstellungen: Ton, Lautstärken, Weihnachtsdeko, Übersetzungen. Gespeichert im Browser (falls möglich).
const SET_KEY="zgorzelec81.settings";
const SET=Object.assign({sound:true,sfx:80,amb:60,xmas:"auto",tr:"first"},(()=>{
  try{return JSON.parse(localStorage.getItem(SET_KEY)||"{}")||{}}catch(e){return {}}})());
function saveSettings(){try{localStorage.setItem(SET_KEY,JSON.stringify(SET))}catch(e){}}
// Weihnachtsdeko: automatisch an Spieltagen im Dezember
function xmasOn(){return SET.xmas==="on"||(SET.xmas==="auto"&&S.date&&S.date.getMonth()===11)}
function applySettings(){
  SFX.setMuted(!SET.sound); SFX.setVolumes(SET.sfx/100,SET.amb/100);
  if(typeof drawWall==="function"){drawWall();drawDeskLight()}
}
function openSettings(){
  $("setSound").checked=SET.sound; $("setSfx").value=SET.sfx; $("setAmb").value=SET.amb;
  $("setXmas").value=SET.xmas; $("setTr").value=SET.tr;
  $("settings").classList.add("show");
}
["setSound","setSfx","setAmb","setXmas","setTr"].forEach(id=>$(id).addEventListener("input",()=>{
  SET.sound=$("setSound").checked; SET.sfx=+$("setSfx").value; SET.amb=+$("setAmb").value;
  SET.xmas=$("setXmas").value; SET.tr=$("setTr").value;
  saveSettings(); applySettings(); SFX.play("tick");
}));
$("bSettingsClose").onclick=()=>$("settings").classList.remove("show");
