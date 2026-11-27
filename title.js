// Startbildschirm: Grenzübergang bei Nacht mit Hütte, Schlagbaum, Lampe, Schnee und wartendem Auto
function drawTitleScene(){
  const cv=$("titleCanvas"); if(!cv) return;
  const W=Math.max(120,Math.round(innerWidth/PXS)),H=Math.max(90,Math.round(innerHeight/PXS)),hz=Math.round(H*.58);
  cv.width=W; cv.height=H;
  const p=P(cv),R=rng(81);
  drawSky(p,W,hz);
  for(let i=0;i<8;i++){const cx=Math.round(R()*W),cy=Math.round(R()*hz*.5);p.ell(cx,cy,16+Math.round(R()*30),2,(x,y)=>((x+y)&1)?null:PAL.night[6])}
  drawBlocks(p,W,hz-6,rng(5),1.2);
  drawFog(p,W,hz-16,hz);
  drawGround(p,W,H,hz,[.14,.35,.65]);
  drawConcreteWall(p,W,hz+1,9);
  snowCap(p,0,hz-8,W,2);
  // Kontrollhütte rechts
  const hx=Math.round(W*.66),hw=Math.round(W*.2),hy=hz-30;
  for(let y=hy;y<hz+14;y++)for(let x=hx;x<hx+hw;x++)p.dot(x,y,(x-hx)%10===0||(y-hy)%12===0?"#22241f":((x*3+y)%13===0?"#353731":"#3c3e38"));
  p.rect(hx-3,hy-4,hw+6,4,"#1a1b18");snowCap(p,hx-3,hy-6,hw+6,2);
  p.rect(hx+6,hy+8,hw-12,12,"#8f7f4e");p.rect(hx+Math.round(hw/2),hy+8,1,12,"#2a2a24");
  for(let y=hz;y<H;y++)for(let x=hx-30;x<hx+hw;x++)if(((x+y)&1)===0&&Math.abs(x-hx-hw/2)<(y-hz)*.9+hw*.3)p.dot(x,y,"rgba(160,140,86,.06)");
  // Schlagbaum
  const bx=Math.round(W*.6),by=hz+6;
  p.rect(bx-2,by-3,4,10,"#141613");
  for(let i=0;i<Math.round(W*.34);i++){const c=Math.floor(i/5)%2?"#8d8b80":"#6a2a24";p.dot(bx-2-i,by,c);p.dot(bx-2-i,by+1,shade(c,-.35));if(i%3===0)p.dot(bx-2-i,by-1,"#a9aba2")}
  // Lampe
  const lx=Math.round(W*.48),ly=Math.round(hz*.42);
  for(let y=ly+2;y<H;y++){const hw2=Math.round((y-ly)*.42);for(let x=-hw2;x<=hw2;x++){const a=Math.abs(x)/Math.max(1,hw2);
    if(a<.5||(((x+y)&1)===0&&a<.85))p.dot(lx+x,y,"rgba(208,164,86,.08)")}}
  p.rect(lx,ly,1,hz+6-ly,"#141613");p.rect(lx-3,ly-1,7,2,"#141613");p.rect(lx-2,ly+1,5,1,PAL.lamp);snowCap(p,lx-3,ly-2,7,1);
  // Auto wartet vor dem Schlagbaum
  const car=carSprite(2,"#8fa3b0",true);p.g.drawImage(car,Math.round(W*.6)-car.width-24,hz-14);
  // Schneeflecken
  for(let i=0;i<W*1.2;i++){const x=Math.round(R()*W),y=hz+2+Math.round(R()*(H-hz-2));p.dith(x,y,3+Math.round(R()*6),1,"rgba(200,204,196,.35)")}
}
let titleSnow=null;
function startTitle(){
  drawTitleScene();
  const cv=$("titleSnowCanvas"),W=$("titleCanvas").width,H=$("titleCanvas").height; cv.width=W; cv.height=H;
  const fl=Array.from({length:Math.round(W*H/60)},()=>({x:Math.random()*W,y:Math.random()*H,v:.15+Math.random()*.4,big:Math.random()<.2}));
  const g=cv.getContext("2d");
  cancelAnimationFrame(titleSnow);
  let last=0;
  const loop=now=>{
    if(!$("startScreen").classList.contains("show")) return;
    if(now-last>60){last=now;g.clearRect(0,0,W,H);
      for(const f of fl){f.y+=f.v;f.x+=Math.sin(now/900+f.v*9)*.15;if(f.y>H){f.y=-1;f.x=Math.random()*W}
        g.fillStyle=f.big?"rgba(170,172,162,.8)":"rgba(140,144,134,.6)";g.fillRect(Math.round(f.x),Math.round(f.y),f.big?2:1,1)}}
    titleSnow=requestAnimationFrame(loop)};
  titleSnow=requestAnimationFrame(loop);
}
