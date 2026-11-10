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
  if(act==="sec-sel"){S.secSel=S.secSel===k?null:k;render();return true}
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
function secSvg(d){
  const R=46,W=R*2,H=Math.sqrt(3)*R,cols=Math.max(1,Math.min(20,num(d.cols,8))),rows=Math.max(1,Math.min(20,num(d.rows,10)));
  const vw=cols*1.5*R+R/2+8,vh=rows*H+H/2+8;let defs="",hexes="",stars="",labels="";
  Object.entries(SEC_STARS).forEach(([id,[,a,b]])=>{defs+=`<radialGradient id="sg-${id}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient><radialGradient id="sgl-${id}"><stop offset="0" stop-color="${b}" stop-opacity=".55"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>`});
  defs+=`<radialGradient id="bh-disk"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#ffb46b"/><stop offset=".75" stop-color="#b44bff" stop-opacity=".6"/><stop offset="1" stop-color="#b44bff" stop-opacity="0"/></radialGradient>`;
  let partyXY=null;
  for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){
    const k=secKey(c,r);const cx=4+R+c*1.5*R,cy=4+H/2+r*H+(c%2?H/2:0);const h=(d.hexes||{})[k]||{};
    const pts=[0,1,2,3,4,5].map(i=>{const a=Math.PI/3*i;return (cx+R*Math.cos(a)).toFixed(1)+","+(cy+R*Math.sin(a)).toFixed(1)}).join(" ");
    const on=S.secSel===k;
    hexes+=`<polygon points="${pts}" class="sechex ${on?"on":""} ${h.type?"full":""}" data-act="sec-sel" data-hex="${k}"><title>${k}${h.name?" · "+esc(h.name):""}</title></polygon>`;
    labels+=`<text x="${cx}" y="${cy-H/2+11}" class="seccoord">${k}</text>`;
    if(h.type==="star"){const col=SEC_STARS[h.color]?h.color:"yellow";stars+=`<circle cx="${cx}" cy="${cy-4}" r="20" fill="url(#sgl-${col})"/><circle cx="${cx}" cy="${cy-4}" r="9" fill="url(#sg-${col})"/>`}
    else if(h.type==="blackhole")stars+=`<ellipse cx="${cx}" cy="${cy-4}" rx="20" ry="7" fill="url(#bh-disk)" transform="rotate(-18 ${cx} ${cy-4})"/><circle cx="${cx}" cy="${cy-4}" r="7" fill="#000" stroke="#ffcf9a" stroke-width="1.2"/>`;
    const pl=(h.planets||[]).length;if(pl){const n=Math.min(pl,6);for(let i=0;i<n;i++)stars+=`<circle cx="${cx-(n-1)*4+i*8}" cy="${cy+12}" r="2.4" class="secpl"/>`}
    if(h.name)labels+=`<text x="${cx}" y="${cy+H/2-7}" class="secname">${esc(String(h.name).length>14?String(h.name).slice(0,13)+"…":h.name)}</text>`;
    if(d.party===k)partyXY=[cx,cy];
  }
  let party="";
  if(partyXY){const [cx,cy]=partyXY;const s=30;const x=cx+R*.32,y=cy-R*.62;
    party=`<g class="secparty" pointer-events="none"><circle cx="${x+s/2}" cy="${y+s/2}" r="${s/2+3}" class="secpring"/>${d.partyIcon?`<clipPath id="secclip"><circle cx="${x+s/2}" cy="${y+s/2}" r="${s/2}"/></clipPath><image href="${esc(d.partyIcon)}" x="${x}" y="${y}" width="${s}" height="${s}" clip-path="url(#secclip)" preserveAspectRatio="xMidYMid slice"/>`:`<path transform="translate(${x+s/2} ${y+s/2})" d="M0,-11 L7,8 L0,4 L-7,8 Z" fill="#fff"/>`}</g>`}
  return `<svg class="secsvg" viewBox="0 0 ${vw.toFixed(0)} ${vh.toFixed(0)}" role="img" aria-label="Sector map"><defs>${defs}</defs><rect width="100%" height="100%" class="secbg"/>${hexes}<g pointer-events="none">${stars}${labels}</g>${party}</svg>`;
}
function secPanel(d){
  const k=S.secSel;const ed=secCanEdit();
  if(!k)return `<div class="frame"><div class="frame-b"><p class="hint" style="margin:0">Click a hex to ${ed?"edit it":"see what's there"}.${d.party?` The party is at <b>${esc(d.party)}</b>${secHex(d.party).name?" ("+esc(secHex(d.party).name)+")":""}.`:""}</p></div></div>`;
  const h=secHex(k);const pre="hexes."+k+".";const here=d.party===k;
  if(!ed){
    return `<div class="frame"><div class="frame-h"><span>${esc(h.name||"Hex "+k)}</span><span class="hint">${k}</span></div><div class="frame-b">
      ${here?`<p class="tag on" style="display:inline-block">${esc(d.partyLabel||"Party")} is here</p>`:""}
      <p class="hint" style="margin:4px 0">${h.type==="star"?(SEC_STARS[h.color]?.[0]||"Yellow")+" star":h.type==="blackhole"?"Black hole":"Empty space"}</p>
      ${(h.planets||[]).length?`<span class="lbl">Planets</span><ul class="secpls">${h.planets.map(p=>`<li><b>${esc(p.name||"Unnamed")}</b>${p.note?` <span class="hint">${esc(p.note)}</span>`:""}</li>`).join("")}</ul>`:""}
      ${h.note?`<span class="lbl">Notes</span><p style="white-space:pre-wrap;margin:4px 0">${esc(h.note)}</p>`:""}
    </div></div>`;
  }
  const gmd=S.docs[SEC_G];
  return `<div class="frame"><div class="frame-h"><span>Hex ${k}</span>${S.confirm==="sec-clear"+k?`<button class="btn sm" data-act="sec-clear" data-hex="${k}" style="color:var(--bad)">Sure? Clear hex</button>`:`<button class="btn sm" data-act="sec-clear" data-hex="${k}">Clear</button>`}</div><div class="frame-b secform">
    <label><span class="lbl">Name</span>${inp(SEC_P,pre+"name",{ph:"System name"})}</label>
    <div class="secrow"><label><span class="lbl">Object</span>${sel(SEC_P,pre+"type",[["","Empty"],["star","Star"],["blackhole","Black hole"]])}</label>
      ${h.type==="star"?`<label><span class="lbl">Star color</span>${sel(SEC_P,pre+"color",Object.entries(SEC_STARS).map(([id,[l]])=>[id,l]))}</label>`:""}</div>
    <span class="lbl">Planets</span>
    ${(h.planets||[]).map((p,i)=>`<div class="secplrow">${inp(SEC_P,pre+"planets."+i+".name",{ph:"Planet name"})}${inp(SEC_P,pre+"planets."+i+".note",{ph:"Short note (TL4, desert…)"})}<button class="iconbtn" data-act="sec-delpl" data-hex="${k}" data-i="${i}" title="Remove planet" style="color:var(--bad)">✕</button></div>`).join("")}
    <button class="btn sm" data-act="sec-addpl" data-hex="${k}">+ Add planet</button>
    <label><span class="lbl">Notes (players can see)</span>${ta(SEC_P,pre+"note",{rows:3,ph:"What the party knows"})}</label>
    ${gmd?`<label><span class="lbl">GM notes (only you)</span>${ta(SEC_G,"notes."+k,{rows:3,ph:"Secrets, plans, spoilers"})}</label>`:""}
    <button class="btn ${here?"":"pri"}" data-act="sec-party" data-hex="${k}">${here?"Remove party marker":"Move party here"}</button>
  </div></div>`;
}
function renderSector(){
  const d=secDoc();const ed=secCanEdit();
  if(!d)return `<h2 class="pagetitle">Sector</h2><div class="empty">${S.isGM?"Setting up the map…":"Your GM hasn't set up the sector map yet."}</div>`;
  return `<h2 class="pagetitle">${esc(d.name||"Sector")}</h2>
  <div class="secgrid"><div class="frame secmapf">${secSvg(d)}</div>
    <div class="stack">${secPanel(d)}
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
