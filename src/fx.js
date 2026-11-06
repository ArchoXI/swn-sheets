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
  const show=dice.slice(0,4);const W=window.innerWidth,H=window.innerHeight;
  const size=W<600?70:92;
  const landY=H*0.40,spread=Math.min(size*1.6,W/(show.length+1.5));
  const startX=W+80;const centerX=W*0.5;
  const els=show.map((d,i)=>{
    const sh=document.createElement("div");sh.className="fxshadow";FX.layer.appendChild(sh);
    const el=document.createElement("div");el.className="fxdie "+fxShape(d.s)+(d.drop?" drop":"");
    el.style.width=el.style.height=size+"px";sh.style.width=size+"px";
    const n=document.createElement("span");n.textContent=String(1+Math.floor(Math.random()*d.s));el.appendChild(n);
    FX.layer.appendChild(el);
    const endX=centerX+(i-(show.length-1)/2)*spread-size/2,endY=landY+(i%2?22:-12);
    const sy=H*(0.22+Math.random()*0.3);const dir=Math.random()<.5?-1:1;
    const spin=dir*(Math.random()<.5?720:1080)+(Math.random()*16-8);
    const fx=(Math.random()<.5?-1:1)*720,fy=(Math.random()<.5?-1:1)*360;
    const dur=900+i*90;
    el.animate([
      {transform:`translate(${startX}px,${sy}px) rotateX(0deg) rotateY(0deg) rotate(0deg) scale(.65)`,opacity:0},
      {opacity:1,offset:.08},
      {transform:`translate(${(startX+endX)/2}px,${Math.min(sy,endY)-90}px) rotateX(${fx*0.6}deg) rotateY(${fy*0.6}deg) rotate(${spin*0.6}deg) scale(1.08)`,offset:.5},
      {transform:`translate(${endX}px,${endY+8}px) rotateX(${fx*0.95}deg) rotateY(${fy}deg) rotate(${spin*0.97}deg) scale(.97)`,offset:.86},
      {transform:`translate(${endX}px,${endY}px) rotateX(${fx}deg) rotateY(${fy}deg) rotate(${spin}deg) scale(1)`,opacity:1}
    ],{duration:dur,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"});
    sh.animate([
      {transform:`translate(${startX}px,${endY+size*0.92}px) scale(.3)`,opacity:0},
      {transform:`translate(${(startX+endX)/2}px,${endY+size*0.92}px) scale(.55)`,opacity:.25,offset:.5},
      {transform:`translate(${endX}px,${endY+size*0.92}px) scale(1)`,opacity:.45}
    ],{duration:dur,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"});
    return {el,sh,n,d,end:dur};
  });
  // flicker numbers while tumbling (one timer for all dice)
  const t0=performance.now();
  const tick=()=>{const t=performance.now()-t0;let live=false;
    els.forEach(o=>{if(t<o.end-60){live=true;o.n.textContent=String(1+Math.floor(Math.random()*o.d.s))}else if(!o.done){o.done=true;o.n.textContent=String(o.d.v);o.el.classList.add("landed")}});
    if(live)setTimeout(tick,70);};
  tick();
  const total=Math.max(...els.map(o=>o.end));
  setTimeout(()=>{showToast(rec)},total);
  setTimeout(()=>{els.forEach(o=>{[o.el,o.sh].forEach(x=>{const a=x.animate([{opacity:getComputedStyle(x).opacity},{opacity:0}],{duration:350,fill:"forwards"});a.onfinish=()=>x.remove()})});FX.running=false},total+1000);
}
