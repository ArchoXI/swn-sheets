/* ================= DICE ANIMATION ================= */
const FX={running:false,last:0,layer:null};
function fxEnabled(){
  try{if(localStorage.getItem("swn.dicefx")==="off")return false}catch(e){}
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return false;
  return true;
}
function fxShape(s){return s===20?"d20":s===4?"d4":s===8?"d8":s===10?"d10":s===12?"d12":"d6"}
// Show a roll: animate dice (if allowed), then show the toast.
function showRoll(rec){
  if(rec&&rec.ship&&/Spike drill/.test(rec.label||"")&&!rec._drilled){drillFx(rec,()=>showRoll({...rec,_drilled:true}));return}
  const dice=((rec.lines||[]).find(l=>l.dice&&l.dice.length)||{}).dice||[];
  const now=Date.now();
  const skip=!fxEnabled()||document.hidden||FX.running||now-FX.last<900||!dice.length||typeof Element.prototype.animate!=="function";
  if(skip){showToast(rec);return}
  FX.running=true;FX.last=now;
  if(!FX.layer){FX.layer=document.createElement("div");FX.layer.className="fxlayer";FX.layer.setAttribute("aria-hidden","true");document.body.appendChild(FX.layer)}
  const show=dice.slice(0,4);const W=window.innerWidth,H=window.innerHeight;const size=W<600?70:92;
  const landY=H*0.42,spread=Math.min(size*1.55,W/(show.length+1.5));
  const startX=W+60;const centerX=W*0.5;
  const els=show.map((d,i)=>{
    const el=document.createElement("div");el.className="fxdie "+fxShape(d.s)+(d.drop?" drop":"");
    el.style.width=el.style.height=size+"px";
    const n=document.createElement("span");n.textContent=String(1+Math.floor(Math.random()*d.s));el.appendChild(n);
    FX.layer.appendChild(el);
    const endX=centerX+(i-(show.length-1)/2)*spread-size/2,endY=landY+(i%2?18:-10);
    const sy=H*(0.25+Math.random()*0.35);const spin=(Math.random()<.5?-1:1)*(Math.random()<.5?720:1080)+(Math.random()*16-8);
    el.animate([
      {transform:`translate(${startX}px,${sy}px) rotate(0deg) scale(.7)`,opacity:0},
      {opacity:1,offset:.1},
      {transform:`translate(${(startX+endX)/2}px,${Math.min(sy,endY)-70}px) rotate(${spin*0.6}deg) scale(1)`,offset:.55},
      {transform:`translate(${endX}px,${endY}px) rotate(${spin}deg) scale(1)`,opacity:1}
    ],{duration:850+i*90,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"});
    return {el,n,d,end:850+i*90};
  });
  // flicker numbers while tumbling (one timer for all dice)
  const t0=performance.now();
  const tick=()=>{const t=performance.now()-t0;let live=false;
    els.forEach(o=>{if(t<o.end-60){live=true;o.n.textContent=String(1+Math.floor(Math.random()*o.d.s))}else if(!o.done){o.done=true;o.n.textContent=String(o.d.v);o.el.classList.add("landed")}});
    if(live)setTimeout(tick,70);};
  tick();
  const total=Math.max(...els.map(o=>o.end));
  setTimeout(()=>{showToast(rec)},total);
  setTimeout(()=>{els.forEach(o=>{const a=o.el.animate([{opacity:1},{opacity:0}],{duration:350,fill:"forwards"});a.onfinish=()=>o.el.remove()});FX.running=false},total+900);
}

/* ================= SPIKE DRILL ANIMATION ================= */
function dfxType(el,text,dur=600){if(!el)return;const G="▮▯/\\<>[]#*+=-_01";const t0=performance.now();const n=text.length;
  const step=now=>{const k=Math.min(1,(now-t0)/dur);const shown=Math.floor(k*n);let out=text.slice(0,shown);for(let i=shown;i<n;i++)out+=text[i]===" "?" ":G[(Math.random()*G.length)|0];el.textContent=out;if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
function drillFx(rec,after){
  const line=(rec.lines||[]).find(l=>l.verdict)||{};const ok=(line.verdict||[])[0]!=="no";
  const ship=(S.docs["ships/"+rec.ship]||{}).name||String(rec.label||"").split(" · ")[0]||"Ship";
  const m=String(rec.label||"").match(/Spike drill(?: to ([^(]+?))?\s*(?:\(|$)/);const dest=m&&m[1]?m[1].trim():"";
  const time=(String(line.note||"").split(" · ").pop()||"").replace(/^Transit\s*/i,"");
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(document.hidden){after&&after();return}
  const ov=document.createElement("div");ov.className="drillfx"+(reduce?" calm":"");ov.setAttribute("role","status");
  ov.innerHTML=`<canvas></canvas><div class="dfxhud"><div class="dfxk"></div><div class="dfxn"></div><div class="dfxs"></div></div><div class="drillskip">esc</div>`;
  document.body.appendChild(ov);
  const K=ov.querySelector(".dfxk"),Nm=ov.querySelector(".dfxn"),Sb=ov.querySelector(".dfxs");
  dfxType(K,"SPIKE DRILL // ENGAGED",500);setTimeout(()=>dfxType(Nm,ship.toUpperCase(),700),180);setTimeout(()=>dfxType(Sb,dest?"COURSE  ›  "+dest.toUpperCase():"COURSE  ›  UNCHARTED",600),380);
  const cv=ov.querySelector("canvas"),ctx=cv.getContext("2d");let W,H,DPR;
  const size=()=>{DPR=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)};size();
  const N=Math.round(Math.min(1400,W*H/1100));const maxR=()=>Math.hypot(W,H)*.75;
  const stars=Array.from({length:N},()=>({a:Math.random()*Math.PI*2,r:Math.random()**.7*Math.hypot(W,H)*.6+2,z:Math.random()*.85+.15,h:Math.random()<.12?265:Math.random()<.35?195:215}));
  const T0=performance.now();let raf,ended=false;const TOTAL=reduce?2400:4600;
  const end=()=>{if(ended)return;ended=true;cancelAnimationFrame(raf);ov.classList.add("out");setTimeout(()=>{ov.remove();after&&after()},450);window.removeEventListener("keydown",key)};
  const key=e=>{if(e.key==="Escape"||e.key===" ")end()};window.addEventListener("keydown",key);ov.addEventListener("click",end);
  let resDone=false;
  const frame=now=>{const t=now-T0;const cx=W/2,cy=H/2;
    // 0-600 drift · 600-2800 accelerate to full speed · 2800-3050 snap · 3050+ arrival
    const sp=reduce?0:Math.min(1,Math.max(0,(t-600)/2200));const accel=sp*sp*sp;const post=t>=3050;
    const snap=!reduce&&t>2800&&t<3050?(t-2800)/250:0;
    const kick=!reduce&&t>=3050&&t<3600?14*Math.pow(1-(t-3050)/550,2):0;const buzz=!reduce&&!post?accel*3:0;
    const sx=(Math.random()-.5)*(kick+buzz),sy=(Math.random()-.5)*(kick+buzz)*.7;
    ov.style.setProperty("--dfxblur",(2+accel*4)+"px");
    ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(sx,sy);
    ctx.fillStyle=`rgba(3,5,12,${post?.72:.66+accel*.26})`;ctx.fillRect(-30,-30,W+60,H+60);
    const vg=ctx.createRadialGradient(cx,cy,Math.min(W,H)*(.5-accel*.3),cx,cy,Math.hypot(W,H)*.62);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,`rgba(0,0,0,${.3+accel*.55})`);ctx.fillStyle=vg;ctx.fillRect(-30,-30,W+60,H+60);
    // soft core glow at the vanishing point
    if(!reduce&&!post){const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,60+accel*140);gr.addColorStop(0,`rgba(200,225,255,${accel*.55})`);gr.addColorStop(1,"rgba(120,160,255,0)");ctx.fillStyle=gr;ctx.fillRect(cx-220,cy-220,440,440)}
    ctx.globalCompositeOperation="lighter";
    stars.forEach(s=>{
      const v=post?(ok?.25+s.z*.4:1.4):.25+accel*70*s.z+snap*120*s.z;s.r+=v;
      if(s.r>maxR()){s.r=Math.random()*30+2;s.a=Math.random()*Math.PI*2}
      const len=post?(ok?1.2:5):1.2+accel*220*s.z+snap*260*s.z;
      const x=cx+Math.cos(s.a)*s.r,y=cy+Math.sin(s.a)*s.r,r0=Math.max(0,s.r-len),x0=cx+Math.cos(s.a)*r0,y0=cy+Math.sin(s.a)*r0;
      const lum=post&&!ok?60:82+accel*10;const col=post&&!ok?`hsla(${Math.random()*15},90%,${lum}%,.85)`:`hsla(${s.h},${30+accel*60}%,${lum}%,${.35+s.z*.6})`;
      const g=ctx.createLinearGradient(x0,y0,x,y);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,col);
      ctx.strokeStyle=len>4?g:col;ctx.lineWidth=Math.max(.5,s.z*(1.1+accel*1.4));ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x,y);ctx.stroke()});
    ctx.globalCompositeOperation="source-over";ctx.restore();
    // brief exit flash
    if(!reduce&&t>2950&&t<3400){const f=t<3050?(t-2950)/100:1-(t-3050)/350;ctx.fillStyle=ok?`rgba(225,238,255,${Math.max(0,f)*.85})`:`rgba(255,70,50,${Math.max(0,f)*.7})`;ctx.fillRect(0,0,W,H)}
    if(!resDone&&(reduce?t>900:t>3050)){resDone=true;ov.classList.add(ok?"ok":"bad");
      if(ok){dfxType(K,"DRILL COMPLETE",400);dfxType(Nm,dest?dest.toUpperCase():"ARRIVED",500);dfxType(Sb,time?"TRANSIT  ›  "+time.toUpperCase():"",400)}
      else{dfxType(K,"DRILL FAILURE",300);dfxType(Nm,"TRANSLATION ERROR",400);dfxType(Sb,"MISHAP PENDING  ›  GM ROLLING",400)}}
    if(t>TOTAL){end();return}
    raf=requestAnimationFrame(frame)};
  raf=requestAnimationFrame(frame);
}
