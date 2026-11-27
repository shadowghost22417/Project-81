// Intro: Fernsehansprache von General Wojciech Jaruzelski am 13.12.1981 (Auszüge, Originaltext mit Übersetzung)
const SPEECH=[
  ["Obywatelki i obywatele Polskiej Rzeczypospolitej Ludowej!","Bürgerinnen und Bürger der Volksrepublik Polen!"],
  ["Zwracam się dziś do was jako żołnierz i jako szef rządu polskiego.","Ich wende mich heute an euch als Soldat und als Chef der polnischen Regierung."],
  ["Ojczyzna nasza znalazła się nad przepaścią.","Unser Vaterland steht am Rande des Abgrunds."],
  ["Ogłaszam, że w dniu dzisiejszym ukonstytuowała się Wojskowa Rada Ocalenia Narodowego.","Ich gebe bekannt, dass sich am heutigen Tag der Militärrat der Nationalen Errettung gebildet hat."],
  ["Rada Państwa, w zgodzie z postanowieniami Konstytucji, wprowadziła dziś o północy stan wojenny na obszarze całego kraju.",
   "Der Staatsrat hat heute um Mitternacht gemäß der Verfassung den Kriegszustand im ganzen Land eingeführt."]
];
const TV_W=128,TV_H=96;
// Bild im Fernseher (gedämpfte Farben wie ein alter Bildschirm)
function drawBroadcast(p,t,talking){
  const sx=10,sy=8,sw=88,sh=66;
  // Fahne: weiß oben, rot unten, leicht gewellt
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const wave=Math.round(Math.sin(x*.12+t*.002)*1.5);
    const col=y+wave<sh*.46?((x+y)%7===0?"#b8bab2":"#c6c8c0"):((x+y)%7===0?"#7a3434":"#8a3c3a");p.dot(sx+x,sy+y,col)}
  p.rect(sx,sy+sh-14,sw,14,"#3a3a36");p.rect(sx,sy+sh-14,sw,1,"#55554e");   // Tisch
  const cx=sx+44, uni=["#7d8466","#6a7156","#565c45","#43483a"];
  // Uniform mit Schulterstücken
  p.ell(cx,sy+sh-2,32,26,(x,y,u)=>uni[Math.min(3,Math.max(0,Math.floor((u+1)*1.6)))],(x,y)=>y<sy+sh-13);
  p.rect(cx-25,sy+sh-25,11,3,"#b39a52");p.rect(cx+14,sy+sh-25,11,3,"#b39a52");p.line(cx-8,sy+sh-28,cx-1,sy+sh-15,"#3a3f32");p.line(cx+8,sy+sh-28,cx+1,sy+sh-15,"#3a3f32");
  p.poly([[cx-5,sy+sh-29],[cx+5,sy+sh-29],[cx+2,sy+sh-17],[cx-2,sy+sh-17]],"#c9c6b8");   // Hemd
  p.rect(cx-1,sy+sh-28,3,11,"#4a4a40");                                                // Krawatte
  p.rect(cx-19,sy+sh-21,6,4,"#8a3a34");p.rect(cx-19,sy+sh-21,6,1,"#b8b090");           // Ordensspange
  // Kopf: schmal, Haar kurz und zurückgekämmt
  const hy=sy+24, sk=["#d8c4a8","#c4ae92","#a8927a","#86735f"];
  p.rect(cx-4,hy+12,9,8,sk[2]);
  p.ell(cx,hy,10,13,(x,y,u,v)=>sk[Math.min(3,Math.floor(.4+(u+1)*1.3+Math.max(0,v)*.8))]);
  p.ell(cx,hy-9,10,5,(x,y,u)=>u<-.2?"#4a4640":"#3a3632",(x,y)=>y<=hy-7);
  p.rect(cx-10,hy-8,2,6,"#3a3632");p.rect(cx+9,hy-8,2,6,"#3a3632");
  p.line(cx-6,hy-11,cx+5,hy-12,"#5a554d");
  // getönte Brille mit großen Gläsern
  const gl="#1e2224";
  [[cx-8,cx-2],[cx+2,cx+8]].forEach(([a,b])=>{p.rect(a,hy-3,b-a+1,5,gl);p.rect(a,hy-4,b-a+1,1,"#0c0e0f");p.dot(a+1,hy-2,"#5c666a")});
  p.rect(cx-2,hy-3,4,1,"#0c0e0f");p.line(cx-10,hy-2,cx-8,hy-2,"#0c0e0f");p.line(cx+8,hy-2,cx+10,hy-2,"#0c0e0f");
  // Nase, Mund
  p.line(cx,hy+1,cx,hy+5,sk[3]);p.dot(cx-1,hy+6,sk[3]);
  const open=talking&&Math.floor(t/140)%3!==0;
  p.rect(cx-3,hy+8,7,1,"#5a4034"); if(open) p.rect(cx-2,hy+9,5,1,"#2a1e18");
  // Rauschen und Zeilen
  for(let y=0;y<sh;y++){if(y%2===0)for(let x=0;x<sw;x+=1)if(Math.random()<.03)p.dot(sx+x,sy+y,"rgba(230,230,230,.25)");
    if(y%3===0)p.rect(sx,sy+y,sw,1,"rgba(0,0,0,.12)")}
  const roll=Math.floor(t/30)%(sh+20)-10;p.rect(sx,sy+roll,sw,2,"rgba(255,255,255,.06)");
  // Graustufen mit leichtem Blaustich wie ein Schwarzweißgerät
  const d=p.g.getImageData(sx,sy,sw,sh),a=d.data;
  for(let i=0;i<a.length;i+=4){const v=a[i]*.3+a[i+1]*.59+a[i+2]*.11;a[i]=v*.92;a[i+1]=v*.97;a[i+2]=v*1.05}
  p.g.putImageData(d,sx,sy);
  // Senderkennung
  p.rect(sx+3,sy+3,14,5,"rgba(20,20,20,.6)");p.rect(sx+4,sy+4,12,3,"rgba(200,200,200,.5)");
}
function drawTV(t,talking){
  const cv=$("tvCanvas"); cv.width=TV_W; cv.height=TV_H;
  const p=P(cv), wood=["#5e4630","#523c28","#463322","#3a2a1c"];
  for(let y=0;y<TV_H;y++)for(let x=0;x<TV_W;x++)p.dot(x,y,(x+Math.round(Math.sin(y*.4)*2))%9===0?wood[2]:wood[1]);
  p.rect(0,0,TV_W,2,wood[0]);p.rect(0,TV_H-3,TV_W,3,wood[3]);
  p.rect(6,4,96,74,"#141412");
  drawBroadcast(p,t,talking);
  // gewölbtes Glas: dunkle Ecken
  for(let y=8;y<74;y++)for(let x=10;x<98;x++){const dx=Math.min(x-10,97-x),dy=Math.min(y-8,73-y);if(dx+dy<6)p.dot(x,y,"#0a0a09");else if(dx+dy<9&&(x+y)&1)p.dot(x,y,"rgba(0,0,0,.4)")}
  p.line(16,12,30,10,"rgba(255,255,255,.12)");
  // Bedienfeld
  p.rect(106,6,18,70,"#2e2a24");
  [16,30].forEach(y=>{p.ell(115,y,5,5,"#1c1a17");p.ell(115,y,3,3,"#4a453c");p.dot(114,y-2,"#8a8478")});
  for(let y=44;y<70;y+=3)p.rect(108,y,14,1,"#1c1a17");
  p.rect(10,82,30,6,"#2e2a24");p.rect(12,84,10,2,"#8a3a34");
  p.rect(14,TV_H-3,8,3,"#1c1a17");p.rect(TV_W-22,TV_H-3,8,3,"#1c1a17");
}
function playIntro(done){
  let i=0, t0=performance.now(), raf=0, timer=0;
  const ov=$("intro"); ov.classList.add("show");
  const show=()=>{$("tvSub").innerHTML=`<span class="pl">${SPEECH[i][0]}</span><span class="de">${SPEECH[i][1]}</span>`;
    clearTimeout(timer); timer=setTimeout(next,Math.max(4200,SPEECH[i][0].length*70))};
  const loop=now=>{drawTV(now-t0,true);raf=requestAnimationFrame(loop)};
  const end=()=>{cancelAnimationFrame(raf);clearTimeout(timer);ov.classList.remove("show");ov.onclick=null;done()};
  function next(){i++;if(i>=SPEECH.length) return setTimeout(end,600);show()}
  ov.onclick=e=>{if(e.target.id==="bSkip") return end(); next()};
  show(); raf=requestAnimationFrame(loop);
}
