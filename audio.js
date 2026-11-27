// Geräusche, komplett im Code erzeugt (Web Audio). Startet erst nach dem ersten Klick.
const SFX=(()=>{
  let ctx=null,master=null,NB=null,amb=null,muted=false;
  try{muted=localStorage.getItem("zgorzelec81.mute")==="1"}catch(e){}
  const noiseBuf=sec=>{const b=ctx.createBuffer(1,Math.round(ctx.sampleRate*sec),ctx.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};
  const env=(g,t,peak,dur)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur)};
  function noise(t,dur,freq,q,peak,type="bandpass"){
    const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=NB;f.type=type;f.frequency.value=freq;f.Q.value=q;env(g,t,peak,dur);
    s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*.5);s.stop(t+dur+.05);
  }
  function tone(t,freq,dur,peak,type="sine",to){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
    if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);env(g,t,peak,dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);
  }
  const SOUNDS={
    stamp:t=>{noise(t,.14,220,.7,.9,"lowpass");tone(t,95,.2,.55,"sine",45);noise(t+.01,.05,2600,1,.2)},
    paper:t=>noise(t,.13,3000,.7,.1,"highpass"),
    coin:t=>{tone(t,1850,.25,.1,"triangle");tone(t+.08,2470,.3,.08,"triangle")},
    door:t=>{tone(t,150,.45,.18,"sawtooth",55);noise(t,.35,380,2,.18)},
    good:t=>{tone(t,392,.12,.08,"square");tone(t+.11,523,.2,.06,"square")},
    bad:t=>tone(t,196,.32,.1,"square",140),
    tear:t=>noise(t,.4,1700,1.4,.16),
    knock:t=>{tone(t,170,.09,.4,"sine",110);tone(t+.17,170,.09,.4,"sine",110)},
    latch:t=>{noise(t,.04,3400,3,.3);tone(t,1150,.04,.08,"square")},
    cut:t=>noise(t,.28,1300,.6,.2),
    screw:t=>{for(let i=0;i<4;i++)noise(t+i*.08,.05,2600,4,.12)},
    pry:t=>{tone(t,280,.3,.16,"sawtooth",85);noise(t,.22,900,2,.22)},
    type:t=>{for(let i=0;i<8;i++)noise(t+i*.075+Math.random()*.02,.03,2300,2,.18)},
    tick:t=>noise(t,.02,4200,5,.035)
  };
  function startAmbience(){
    const w=ctx.createBufferSource(),wf=ctx.createBiquadFilter(),wg=ctx.createGain();
    w.buffer=noiseBuf(4);w.loop=true;wf.type="bandpass";wf.frequency.value=420;wf.Q.value=.6;wg.gain.value=.05;
    const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.13;lg.gain.value=.03;lfo.connect(lg);lg.connect(wg.gain);
    const lfo2=ctx.createOscillator(),l2=ctx.createGain();lfo2.frequency.value=.07;l2.gain.value=160;lfo2.connect(l2);l2.connect(wf.frequency);
    w.connect(wf);wf.connect(wg);wg.connect(master);w.start();lfo.start();lfo2.start();
    const hg=ctx.createGain();hg.gain.value=.01;
    [50,100,150].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=i?"sine":"triangle";o.frequency.value=f;g.gain.value=[1,.5,.25][i];o.connect(g);g.connect(hg);o.start()});
    hg.connect(master);amb={wind:wg,hum:hg};
    setInterval(()=>{if(!document.hidden)play("tick")},1000);
  }
  function init(){
    if(ctx) return; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    try{ctx=new AC();master=ctx.createGain();master.gain.value=muted?0:.8;master.connect(ctx.destination);NB=noiseBuf(1.5);startAmbience()}
    catch(e){ctx=null}
  }
  function play(n){
    if(!ctx||muted||!SOUNDS[n]) return;
    if(ctx.state==="suspended") ctx.resume();
    try{SOUNDS[n](ctx.currentTime+.01)}catch(e){}
  }
  function setOutside(o){if(!amb)return;const t=ctx.currentTime;amb.wind.gain.setTargetAtTime(o?.13:.05,t,.4);amb.hum.gain.setTargetAtTime(o?0:.01,t,.4)}
  function setMuted(m){muted=m;try{localStorage.setItem("zgorzelec81.mute",m?"1":"0")}catch(e){};if(master)master.gain.value=m?0:.8}
  return {init,play,setOutside,setMuted,isMuted:()=>muted,ready:()=>!!ctx};
})();
