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
