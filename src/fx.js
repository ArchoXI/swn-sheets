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
function drillFx(rec,after){
  const line=(rec.lines||[]).find(l=>l.verdict)||{};const ok=(line.verdict||[])[0]!=="no";
  const ship=(S.docs["ships/"+rec.ship]||{}).name||String(rec.label||"").split(" · ")[0]||"Ship";
  const m=String(rec.label||"").match(/Spike drill(?: to ([^(]+?))?\s*(?:\(|$)/);const dest=m&&m[1]?m[1].trim():"";
  const time=String(line.note||"").split(" · ").pop()||"";
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(document.hidden){after&&after();return}
  const ov=document.createElement("div");ov.className="drillfx"+(reduce?" calm":"");ov.setAttribute("role","status");
  ov.innerHTML=`<canvas></canvas><div class="drilltxt"><div class="drillk">Spike drill</div><div class="drillship">${esc(ship)}</div><div class="drilldest">${dest?"Course: "+esc(dest):"Drilling into metadimensional space"}</div></div><div class="dfxres"></div><div class="drillskip">Click to skip</div>`;
  document.body.appendChild(ov);
  const cv=ov.querySelector("canvas"),ctx=cv.getContext("2d");let W,H,DPR;
  const size=()=>{DPR=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)};size();
  const N=Math.round(Math.min(900,W*H/1800));const stars=Array.from({length:N},()=>({a:Math.random()*Math.PI*2,r:Math.random()**.6*Math.hypot(W,H)*.6+4,z:Math.random()*.8+.2,h:Math.random()<.15?280:Math.random()<.3?190:220}));
  const T0=performance.now();let raf,ended=false;const TOTAL=reduce?2400:4600;
  // rift: jagged vertical tear
  const tear=Array.from({length:28},(_,i)=>({y:i/27,x:(Math.random()-.5)*(i===0||i===27?0:1)}));
  const end=()=>{if(ended)return;ended=true;cancelAnimationFrame(raf);ov.classList.add("out");setTimeout(()=>{ov.remove();after&&after()},450);window.removeEventListener("keydown",key)};
  const key=e=>{if(e.key==="Escape"||e.key===" ")end()};window.addEventListener("keydown",key);ov.addEventListener("click",end);
  const res=ov.querySelector(".dfxres");
  const frame=now=>{const t=now-T0;const cx=W/2,cy=H/2;
    // phases (ms): 0-700 calm stars, 700-2300 streak, 1500-2700 rift opens, 2700-3000 flash, 3000+ result
    const sp=reduce?0:Math.min(1,Math.max(0,(t-700)/1600));const accel=sp*sp;
    const shake=!reduce&&t>1800&&t<2900?(Math.random()-.5)*8*Math.min(1,(t-1800)/600):0;
    ctx.save();ctx.translate(shake,shake*.6);
    ctx.fillStyle=`rgba(4,6,14,${t<3000?(.35+accel*.5):.6})`;ctx.fillRect(-20,-20,W+40,H+40);
    const post=t>=3000;
    stars.forEach(s=>{
      let v=post?(ok?.4:1.6):.3+accel*38*s.z;s.r+=v;if(s.r>Math.hypot(W,H)*.75){s.r=Math.random()*40+4;s.a=Math.random()*Math.PI*2}
      const x=cx+Math.cos(s.a)*s.r,y=cy+Math.sin(s.a)*s.r;const len=post?(ok?1:6):1+accel*90*s.z;
      const x0=cx+Math.cos(s.a)*(s.r-len),y0=cy+Math.sin(s.a)*(s.r-len);
      const col=post&&!ok?`hsla(${Math.random()<.5?0:350},90%,${60+Math.random()*20}%,.9)`:`hsla(${s.h},${40+accel*50}%,${80-accel*10}%,${.5+s.z*.5})`;
      ctx.strokeStyle=col;ctx.lineWidth=Math.max(.6,s.z*(1.4+accel*1.6));ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x,y);ctx.stroke()});
    // rift
    if(!reduce&&t>1500&&t<3050){const o=Math.min(1,(t-1500)/1100);const wid=o*o*Math.min(W*.35,260);
      ctx.save();ctx.globalCompositeOperation="lighter";
      for(let pass=3;pass>=0;pass--){const ww=wid*(1+pass*.9)+2;const g=ctx.createLinearGradient(cx-ww,0,cx+ww,0);
        const hue=pass===0?190:pass===1?265:pass===2?300:220;g.addColorStop(0,`hsla(${hue},100%,60%,0)`);g.addColorStop(.5,`hsla(${hue},100%,${pass===0?92:70}%,${.55-pass*.1})`);g.addColorStop(1,`hsla(${hue},100%,60%,0)`);
        ctx.fillStyle=g;ctx.beginPath();tear.forEach((p,i)=>{const jit=(Math.random()-.5)*6*o;const x=cx+p.x*wid*.6+jit-(ww*.5),y=p.y*H;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
        [...tear].reverse().forEach(p=>{const jit=(Math.random()-.5)*6*o;ctx.lineTo(cx+p.x*wid*.6+jit+(ww*.5),p.y*H)});ctx.closePath();ctx.fill()}
      // arcs of energy
      for(let i=0;i<4;i++){ctx.strokeStyle=`hsla(${190+Math.random()*90},100%,80%,${.6*o})`;ctx.lineWidth=1.2;ctx.beginPath();let y=Math.random()*H,x=cx;ctx.moveTo(x,y);for(let k=0;k<6;k++){x+=(Math.random()-.5)*wid*1.4;y+=(Math.random()-.5)*60;ctx.lineTo(x,y)}ctx.stroke()}
      ctx.restore()}
    ctx.restore();
    // flash
    if(!reduce&&t>2650&&t<3250){const f=1-Math.abs(t-2900)/350;ctx.fillStyle=ok?`rgba(235,245,255,${Math.max(0,f)})`:`rgba(255,80,60,${Math.max(0,f)*.85})`;ctx.fillRect(0,0,W,H)}
    if((reduce?t>900:t>3000)&&!res.dataset.on){res.dataset.on=1;ov.classList.add(ok?"ok":"bad");
      res.innerHTML=ok?`<div class="drillk">Drill complete</div><div class="drillship">${dest?esc(dest):"Arrived"}</div><div class="drilldest">${esc(time)}</div>`:`<div class="drillk">Drill failure</div><div class="drillship">Something went wrong</div><div class="drilldest">The GM is rolling a mishap…</div>`}
    if(t>TOTAL){end();return}
    raf=requestAnimationFrame(frame)};
  raf=requestAnimationFrame(frame);
}
