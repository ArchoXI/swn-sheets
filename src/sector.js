/* ================= SECTOR MAP ================= */
const SEC_P="sector/main",SEC_G="gmprivate/sector";
const SEC_STARS={yellow:["Yellow","#ffe27a","#ffb300"],orange:["Orange","#ffc27a","#ff7a1a"],red:["Red","#ff9a8a","#d6342a"],white:["White","#ffffff","#cfd8ff"],blue:["Blue","#c9e4ff","#4f8dff"]};
const secDefault=()=>({name:"Sector",cols:8,rows:10,hexes:{},party:null,partyIcon:null,partyLabel:"Party"});
const secKey=(c,r)=>String(c).padStart(2,"0")+String(r).padStart(2,"0");
const secCanEdit=()=>S.isGM||S.offline;
function secDoc(){if(!S.docs[SEC_P]&&S.offline)S.docs[SEC_P]=secDefault();return S.docs[SEC_P]}
function secHex(k){return (secDoc()?.hexes||{})[k]||{}}
function secAct(act,t){
  const d=secDoc();const k=t.dataset.hex;
  if(act==="sec-sel"){if(window._secMoved){window._secMoved=false;return true}S.secSel=S.secSel===k?null:k;render();return true}
  if(act==="sec-zin"){secAnimTo(secZoomBy(1/1.6));return true}
  if(act==="sec-zout"){secAnimTo(secZoomBy(1.6));return true}
  if(act==="sec-fit"){const svg=secEl();if(svg)secAnimTo(secFitVB(svg));return true}
  if(act==="sec-view"){secZoomTo(k);return true}
  if(!secCanEdit()||!d)return true;
  switch(act){
    case "sec-party":setField(SEC_P,"party",d.party===k?null:k);render();return true;
    case "sec-addpl":{const h=secHex(k);setField(SEC_P,"hexes."+k+".planets",[...(h.planets||[]),{name:"",note:""}]);render();return true}
    case "sec-delpl":{const h=secHex(k);const i=num(t.dataset.i);setField(SEC_P,"hexes."+k+".planets",(h.planets||[]).filter((_,j)=>j!==i));render();return true}
    case "sec-clear":{if(S.confirm!==act+k){S.confirm=act+k;render();return true}S.confirm=null;const hx={...(d.hexes||{})};delete hx[k];setField(SEC_P,"hexes",hx);render();return true}
    case "sec-icon":$("#sec-iconfile")?.click();return true;
    case "sec-icon-reset":setField(SEC_P,"partyIcon",null);render();return true;
  }
  return false;
}
function secIconUpload(file){
  if(!file)return;const img=new Image();const url=URL.createObjectURL(file);
  img.onload=()=>{const N=96;const c=document.createElement("canvas");c.width=c.height=N;const x=c.getContext("2d");
    const sc=Math.min(N/img.width,N/img.height);const w=img.width*sc,h=img.height*sc;x.drawImage(img,(N-w)/2,(N-h)/2,w,h);
    URL.revokeObjectURL(url);setField(SEC_P,"partyIcon",c.toDataURL("image/png"));render();toastMsg("Party icon updated.")};
  img.onerror=()=>toastMsg("Couldn't read that image.",true);img.src=url;
}
const SEC_R=46,SEC_H=Math.sqrt(3)*46;
const SEC_PCOL=["#6fa8ff","#d9a066","#7fd18b","#e06b5f","#c7a4ff","#5fd3d3","#f0d36b","#b0b8c8"];
const secPCol=(p,i)=>/^#[0-9a-f]{6}$/i.test(p?.color||"")?p.color:SEC_PCOL[i%SEC_PCOL.length];
function secDims(d){const cols=Math.max(1,Math.min(20,num(d.cols,8))),rows=Math.max(1,Math.min(20,num(d.rows,10)));return {cols,rows,w:cols*1.5*SEC_R+SEC_R/2+8,h:rows*SEC_H+SEC_H/2+8}}
const secCenter=(c,r)=>[4+SEC_R+c*1.5*SEC_R,4+SEC_H/2+r*SEC_H+(c%2?SEC_H/2:0)];
const secHash=s=>{let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h};
function secSystemNear(k,h,cx,cy){
  const pl=h.planets||[];const n=pl.length;const anim=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;let o="";
  if(h.type==="star"){const col=SEC_STARS[h.color]?h.color:"yellow";o+=`<circle cx="${cx}" cy="${cy}" r="11" fill="url(#sgl-${col})"/><circle cx="${cx}" cy="${cy}" r="4.6" fill="url(#sg-${col})"/>`}
  else if(h.type==="blackhole")o+=`<ellipse cx="${cx}" cy="${cy}" rx="11" ry="4" fill="url(#bh-disk)" transform="rotate(-18 ${cx} ${cy})"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="#000" stroke="#ffcf9a" stroke-width=".5"/>`;
  pl.forEach((p,i)=>{const r=11+(i+.5)*(26/Math.max(n,1));const a=((secHash(k+i+(p.name||""))%360)*Math.PI)/180;const x0=cx+r*Math.cos(a),y0=cy+r*Math.sin(a),x1=cx-r*Math.cos(a),y1=cy-r*Math.sin(a);
    const col=secPCol(p,i);const pr=1.5+Math.min(1.2,(secHash(p.name||i)%10)/10);const dur=(30*Math.pow(r/15,1.5)).toFixed(1);
    o+=`<circle cx="${cx}" cy="${cy}" r="${r.toFixed(2)}" class="secorbit"/>`;
    const body=`<circle r="${pr.toFixed(2)}" fill="${col}"/><circle r="${pr.toFixed(2)}" fill="url(#pl-shade)"/>${p.name?`<text y="${(pr+3.4).toFixed(2)}" class="secpname">${esc(p.name)}</text>`:""}`;
    o+=anim?`<g>${body}<animateMotion dur="${dur}s" repeatCount="indefinite" path="M${x0.toFixed(2)},${y0.toFixed(2)} A${r.toFixed(2)},${r.toFixed(2)} 0 1 1 ${x1.toFixed(2)},${y1.toFixed(2)} A${r.toFixed(2)},${r.toFixed(2)} 0 1 1 ${x0.toFixed(2)},${y0.toFixed(2)}"/></g>`:`<g transform="translate(${x0.toFixed(2)} ${y0.toFixed(2)})">${body}</g>`});
  if(h.name)o+=`<text x="${cx}" y="${cy-SEC_H/2+7}" class="secnname">${esc(h.name)}</text>`;
  return o;
}
function secSvg(d){
  const R=SEC_R,H=SEC_H;const {cols,rows,w:vw,h:vh}=secDims(d);let defs="",hexes="",far="",near="",labels="";
  Object.entries(SEC_STARS).forEach(([id,[,a,b]])=>{defs+=`<radialGradient id="sg-${id}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient><radialGradient id="sgl-${id}"><stop offset="0" stop-color="${b}" stop-opacity=".55"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>`});
  defs+=`<radialGradient id="bh-disk"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#ffb46b"/><stop offset=".75" stop-color="#b44bff" stop-opacity=".6"/><stop offset="1" stop-color="#b44bff" stop-opacity="0"/></radialGradient><radialGradient id="pl-shade" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`;
  let partyXY=null;
  for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){
    const k=secKey(c,r);const [cx,cy]=secCenter(c,r);const h=(d.hexes||{})[k]||{};
    const pts=[0,1,2,3,4,5].map(i=>{const a=Math.PI/3*i;return (cx+R*Math.cos(a)).toFixed(1)+","+(cy+R*Math.sin(a)).toFixed(1)}).join(" ");
    hexes+=`<polygon points="${pts}" class="sechex ${S.secSel===k?"on":""} ${h.type||(h.planets||[]).length?"full":""}" data-act="sec-sel" data-hex="${k}"><title>${k}${h.name?" · "+esc(h.name):""}</title></polygon>`;
    labels+=`<text x="${cx}" y="${cy-H/2+11}" class="seccoord">${k}</text>`;
    if(h.type==="star"){const col=SEC_STARS[h.color]?h.color:"yellow";far+=`<circle cx="${cx}" cy="${cy-4}" r="20" fill="url(#sgl-${col})"/><circle cx="${cx}" cy="${cy-4}" r="9" fill="url(#sg-${col})"/>`}
    else if(h.type==="blackhole")far+=`<ellipse cx="${cx}" cy="${cy-4}" rx="20" ry="7" fill="url(#bh-disk)" transform="rotate(-18 ${cx} ${cy-4})"/><circle cx="${cx}" cy="${cy-4}" r="7" fill="#000" stroke="#ffcf9a" stroke-width="1.2"/>`;
    const pl=h.planets||[];if(pl.length){const n=Math.min(pl.length,6);for(let i=0;i<n;i++)far+=`<circle cx="${cx-(n-1)*4+i*8}" cy="${cy+12}" r="2.6" fill="${secPCol(pl[i],i)}"/>`}
    if(h.name)far+=`<text x="${cx}" y="${cy+H/2-7}" class="secname">${esc(String(h.name).length>14?String(h.name).slice(0,13)+"…":h.name)}</text>`;
    if(h.type||pl.length||h.name)near+=secSystemNear(k,h,cx,cy);
    if(d.party===k)partyXY=[cx,cy];
  }
  let party="";
  if(partyXY){const [cx,cy]=partyXY;
    const mk=(cls,s,x,y,ring,id)=>`<g class="secparty ${cls}" pointer-events="none"><circle cx="${x+s/2}" cy="${y+s/2}" r="${s/2+ring}" class="secpring" style="stroke-width:${ring/2}"/>${d.partyIcon?`<clipPath id="${id}"><circle cx="${x+s/2}" cy="${y+s/2}" r="${s/2}"/></clipPath><image href="${esc(d.partyIcon)}" x="${x}" y="${y}" width="${s}" height="${s}" clip-path="url(#${id})" preserveAspectRatio="xMidYMid slice"/>`:`<path transform="translate(${x+s/2} ${y+s/2}) scale(${s/30})" d="M0,-11 L7,8 L0,4 L-7,8 Z" fill="#fff"/>`}<text x="${x+s/2}" y="${y+s+ring+4.5}" class="secpartyname">${esc(d.partyLabel||"")}</text></g>`;
    party=mk("ppfar",30,cx+R*.32,cy-R*.62,3,"secclip")+mk("ppnear",8,cx+R*.42,cy-R*.62,.9,"secclip2")}
  const vb=S.secVB||{x:0,y:0,w:vw,h:vh};
  return `<svg id="secsvg" class="secsvg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" data-mw="${vw.toFixed(1)}" data-mh="${vh.toFixed(1)}" role="img" aria-label="Sector map"><defs>${defs}</defs><rect x="-5000" y="-5000" width="10000" height="10000" class="secbg"/>${hexes}<g pointer-events="none"><g class="lodfar">${far}</g><g class="lodnear">${near}</g>${labels}</g>${party}</svg>`;
}
/* ---- zoom & pan ---- */
function secEl(){return document.getElementById("secsvg")}
function secFitVB(svg){const mw=num(svg.dataset.mw),mh=num(svg.dataset.mh);const A=(svg.clientWidth||1)/(svg.clientHeight||1);let w,h;if(mw/mh>A){w=mw;h=mw/A}else{h=mh;w=mh*A}return {x:(mw-w)/2,y:(mh-h)/2,w,h}}
function secApply(vb,svg=secEl()){if(!svg)return;const A=(svg.clientWidth||1)/(svg.clientHeight||1);const mw=num(svg.dataset.mw),mh=num(svg.dataset.mh);
  const minW=SEC_R*2.2,maxW=Math.max(mw,mh*A)*1.6;let w=Math.max(minW,Math.min(maxW,vb.w));const cx=vb.x+vb.w/2,cy=vb.y+vb.h/2;const h=w/A;
  let x=cx-w/2,y=cy-h/2;x=Math.max(-w*.6,Math.min(mw-w*.4,x));y=Math.max(-h*.6,Math.min(mh-h*.4,y));
  S.secVB={x,y,w,h};svg.setAttribute("viewBox",`${x} ${y} ${w} ${h}`);
  const hexPx=2*SEC_R*(svg.clientWidth/w);svg.classList.toggle("near",hexPx>=230);const zl=document.getElementById("sec-zl");if(zl)zl.textContent=hexPx>=230?"System view":"Sector view";}
function secAnimTo(to){const svg=secEl();if(!svg)return;const from={...(S.secVB||secFitVB(svg))};const t0=performance.now();const D=320;
  const step=t=>{const k=Math.min(1,(t-t0)/D);const e=1-Math.pow(1-k,3);secApply({x:from.x+(to.x-from.x)*e,y:from.y+(to.y-from.y)*e,w:from.w+(to.w-from.w)*e,h:from.h+(to.h-from.h)*e},svg);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
function secZoomBy(f,px,py){const svg=secEl();if(!svg)return;const vb=S.secVB||secFitVB(svg);const r=svg.getBoundingClientRect();
  const ux=vb.x+((px??r.left+r.width/2)-r.left)/r.width*vb.w,uy=vb.y+((py??r.top+r.height/2)-r.top)/r.height*vb.h;
  return {x:ux-(ux-vb.x)*f,y:uy-(uy-vb.y)*f,w:vb.w*f,h:vb.h*f}}
function secZoomTo(k){const svg=secEl();if(!svg||!k)return;const c=parseInt(k.slice(0,2),10),r=parseInt(k.slice(2),10);const [cx,cy]=secCenter(c,r);const A=svg.clientWidth/svg.clientHeight;
  let h=SEC_H*1.25,w=h*A;if(w<SEC_R*2.2){w=SEC_R*2.2;h=w/A}
  const side=document.querySelector(".secside");let off=0;if(side&&getComputedStyle(side).position==="absolute")off=((side.offsetWidth+24)/2)*(w/svg.clientWidth);
  secAnimTo({x:cx-w/2+off,y:cy-h/2,w,h})}
function secInit(){const svg=secEl();if(!svg)return;if(!S.secVB)S.secVB=secFitVB(svg);secApply(S.secVB,svg);
  if(!window._secRO){window._secRO=new ResizeObserver(()=>{const s=secEl();if(s&&S.secVB)secApply(S.secVB,s)});}
  window._secRO.disconnect();window._secRO.observe(svg);}
(()=>{const P=new Map();let start=null,pinch=null;
  document.addEventListener("wheel",e=>{const svg=e.target.closest&&e.target.closest("#secsvg");if(!svg)return;e.preventDefault();
    secApply(secZoomBy(Math.exp(e.deltaY*(e.ctrlKey?.01:.0018)),e.clientX,e.clientY),svg)},{passive:false});
  document.addEventListener("pointerdown",e=>{const svg=e.target.closest&&e.target.closest("#secsvg");if(!svg)return;window._secMoved=false;
    P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size===1)start={x:e.clientX,y:e.clientY,vb:{...(S.secVB||secFitVB(svg))}};
    else if(P.size===2){const [a,b]=[...P.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),vb:{...S.secVB},mx:(a[0]+b[0])/2,my:(a[1]+b[1])/2};start=null}});
  window.addEventListener("pointermove",e=>{if(!P.has(e.pointerId))return;P.set(e.pointerId,[e.clientX,e.clientY]);const svg=secEl();if(!svg)return;
    if(pinch&&P.size>=2){const [a,b]=[...P.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);const f=pinch.d/Math.max(d,1);const r=svg.getBoundingClientRect();
      const vb=pinch.vb;const ux=vb.x+(pinch.mx-r.left)/r.width*vb.w,uy=vb.y+(pinch.my-r.top)/r.height*vb.h;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
      const w=vb.w*f,h=vb.h*f;secApply({x:ux-(mx-r.left)/r.width*w,y:uy-(my-r.top)/r.height*h,w,h},svg);window._secMoved=true;return}
    if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(!window._secMoved&&Math.hypot(dx,dy)<5)return;window._secMoved=true;svg.classList.add("dragging");
    const sc=start.vb.w/svg.clientWidth;secApply({...start.vb,x:start.vb.x-dx*sc,y:start.vb.y-dy*sc},svg)});
  const up=e=>{P.delete(e.pointerId);if(P.size<2)pinch=null;if(!P.size){start=null;secEl()?.classList.remove("dragging")}};
  window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  document.addEventListener("dblclick",e=>{const hx=e.target.closest&&e.target.closest("#secsvg [data-hex]");if(!hx)return;e.preventDefault();S.secSel=hx.dataset.hex;render();secZoomTo(hx.dataset.hex)});
})();
function secPanel(d){
  const k=S.secSel;const ed=secCanEdit();
  if(!k)return `<div class="frame"><div class="frame-b"><p class="hint" style="margin:0">Click a hex to ${ed?"edit it":"see what's there"}.${d.party?` The party is at <b>${esc(d.party)}</b>${secHex(d.party).name?" ("+esc(secHex(d.party).name)+")":""}.`:""}</p></div></div>`;
  const h=secHex(k);const pre="hexes."+k+".";const here=d.party===k;
  if(!ed){
    return `<div class="frame"><div class="frame-h"><span>${esc(h.name||"Hex "+k)}</span><span class="hint">${k}</span></div><div class="frame-b">
      ${here?`<p class="tag on" style="display:inline-block">${esc(d.partyLabel||"Party")} is here</p>`:""}
      <p class="hint" style="margin:4px 0">${h.type==="star"?(SEC_STARS[h.color]?.[0]||"Yellow")+" star":h.type==="blackhole"?"Black hole":"Empty space"}</p>
      ${(h.planets||[]).length?`<span class="lbl">Planets</span><ul class="secpls">${h.planets.map((p,i)=>`<li><span class="secdot" style="background:${secPCol(p,i)}"></span><b>${esc(p.name||"Unnamed")}</b>${p.note?` <span class="hint">${esc(p.note)}</span>`:""}</li>`).join("")}</ul>`:""}
      ${h.note?`<span class="lbl">Notes</span><p style="white-space:pre-wrap;margin:4px 0">${esc(h.note)}</p>`:""}
      <button class="btn" data-act="sec-view" data-hex="${k}">View system</button>
    </div></div>`;
  }
  const gmd=S.docs[SEC_G];
  return `<div class="frame"><div class="frame-h"><span>Hex ${k}</span>${S.confirm==="sec-clear"+k?`<button class="btn sm" data-act="sec-clear" data-hex="${k}" style="color:var(--bad)">Sure? Clear hex</button>`:`<button class="btn sm" data-act="sec-clear" data-hex="${k}">Clear</button>`}</div><div class="frame-b secform">
    <label><span class="lbl">Name</span>${inp(SEC_P,pre+"name",{ph:"System name"})}</label>
    <div class="secrow"><label><span class="lbl">Object</span>${sel(SEC_P,pre+"type",[["","Empty"],["star","Star"],["blackhole","Black hole"]])}</label>
      ${h.type==="star"?`<label><span class="lbl">Star color</span>${sel(SEC_P,pre+"color",Object.entries(SEC_STARS).map(([id,[l]])=>[id,l]))}</label>`:""}</div>
    <span class="lbl">Planets</span>
    ${(h.planets||[]).map((p,i)=>`<div class="secplrow"><input type="color" class="secclr" data-doc="${SEC_P}" data-path="${pre}planets.${i}.color" value="${secPCol(p,i)}" title="Planet color" aria-label="Planet color">${inp(SEC_P,pre+"planets."+i+".name",{ph:"Planet name"})}${inp(SEC_P,pre+"planets."+i+".note",{ph:"Short note (TL4, desert…)"})}<button class="iconbtn" data-act="sec-delpl" data-hex="${k}" data-i="${i}" title="Remove planet" style="color:var(--bad)">✕</button></div>`).join("")}
    <button class="btn sm" data-act="sec-addpl" data-hex="${k}">+ Add planet</button>
    <label><span class="lbl">Notes (players can see)</span>${ta(SEC_P,pre+"note",{rows:3,ph:"What the party knows"})}</label>
    ${gmd?`<label><span class="lbl">GM notes (only you)</span>${ta(SEC_G,"notes."+k,{rows:3,ph:"Secrets, plans, spoilers"})}</label>`:""}
    <div class="secrow"><button class="btn" data-act="sec-view" data-hex="${k}">View system</button><button class="btn ${here?"":"pri"}" data-act="sec-party" data-hex="${k}" style="flex:1">${here?"Remove party marker":"Move party here"}</button></div>
  </div></div>`;
}
function renderSector(){
  const d=secDoc();const ed=secCanEdit();
  if(!d)return `<h2 class="pagetitle">Sector</h2><div class="empty">${S.isGM?"Setting up the map…":"Your GM hasn't set up the sector map yet."}</div>`;
  setTimeout(secInit,0);
  return `<div class="sechead"><h2 class="pagetitle" style="margin:0">${esc(d.name||"Sector")}</h2><span class="hint">Scroll or pinch to zoom, drag to move, double-click a hex to view its system.</span></div>
  <div class="secwrap"><div class="secmapf">${secSvg(d)}
      <div class="seczoom"><button class="iconbtn" data-act="sec-zin" title="Zoom in" aria-label="Zoom in">+</button><button class="iconbtn" data-act="sec-zout" title="Zoom out" aria-label="Zoom out">−</button><button class="iconbtn" data-act="sec-fit" title="Show the whole sector" aria-label="Show the whole sector">⤢</button><span id="sec-zl" class="seczl">Sector view</span></div></div>
    <div class="secside">${secPanel(d)}
    ${ed?`<details class="frame" ${S.secSet?"open":""}><summary class="frame-h" data-act="sec-set-tog"><span>Map settings</span><span class="hint">▾</span></summary><div class="frame-b secform">
      <label><span class="lbl">Sector name</span>${inp(SEC_P,"name",{ph:"Sector name"})}</label>
      <div class="secrow"><label><span class="lbl">Columns</span>${inp(SEC_P,"cols",{type:"number",min:1,max:20})}</label><label><span class="lbl">Rows</span>${inp(SEC_P,"rows",{type:"number",min:1,max:20})}</label></div>
      <span class="lbl">Party marker</span>
      <div class="secrow" style="align-items:center"><span class="secicon">${d.partyIcon?`<img src="${esc(d.partyIcon)}" alt="Party icon">`:`<svg viewBox="-15 -15 30 30" width="30" height="30"><path d="M0,-11 L7,8 L0,4 L-7,8 Z" fill="#fff"/></svg>`}</span>
        <button class="btn sm" data-act="sec-icon">Upload icon</button>${d.partyIcon?`<button class="btn sm" data-act="sec-icon-reset">Use default</button>`:""}<input type="file" id="sec-iconfile" accept="image/*" hidden></div>
      <label><span class="lbl">Marker name</span>${inp(SEC_P,"partyLabel",{ph:"Party"})}</label>
      <p class="hint" style="margin:0">Players see the map, names, planets and player notes. GM notes stay private.</p>
    </div></details>`:""}</div></div>`;
}
