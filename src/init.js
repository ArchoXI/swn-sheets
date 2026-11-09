/* ================= GM INITIATIVE TRACKER (private) ================= */
const INI_P="gmprivate/initiative";
function iniDoc(){return S.docs[INI_P]||{round:1,turn:null,list:[]}}
function iniSave(d){S.docs[INI_P]=d;if(S.db&&!S.offline)S.db.doc(INI_P).set(clone(d)).catch(err=>{console.warn(err);toastMsg("Couldn't save the initiative tracker.",true)})}
function iniEdit(fn){const d=clone(iniDoc());fn(d);iniSave(d);render()}
const iniKind=ref=>ref?.startsWith("sheets/")?"pc":ref?.startsWith("npcs/")?"npc":ref?.startsWith("ships/")?"ship":"custom";
function iniInfo(e){
  const doc=e.ref?S.docs[e.ref]:null;
  if(e.ref&&!doc)return {name:e.name+" (deleted)",hp:null};
  if(e.kind==="pc"){const R=compute(doc);return {name:doc.name||"Unnamed",sub:doc.player||"PC",bonus:R.init,twice:R.initTwice,hp:num(doc.hp?.cur),max:R.hpMax}}
  if(e.kind==="npc")return {name:doc.name||"NPC",sub:"NPC",bonus:num(e.bonus),hp:num(doc.hp?.cur),max:num(doc.hp?.max)};
  if(e.kind==="ship"){const C=shipCompute(doc);return {name:doc.name||"Ship",sub:doc.npc?"NPC ship":"Party ship",bonus:num(e.bonus),hp:num(doc.hp),max:C.hpMax}}
  return {name:e.name||"Enemy",sub:"Custom",bonus:num(e.bonus),hp:e.hp==null||e.hp===""?null:num(e.hp),max:e.max==null||e.max===""?null:num(e.max)};
}
function iniRollOne(e){const I=iniInfo(e);const a=rand(8);let v=a,txt="1d8 ("+a+")";
  if(I.twice){const b=rand(8);v=Math.max(a,b);txt="1d8 twice ("+a+", "+b+", Alert)"}
  e.init=v+num(I.bonus);e.rollTxt=txt+" "+sgn(num(I.bonus))+" = "+e.init}
function iniSort(d){d.list.sort((a,b)=>num(b.init,-99)-num(a.init,-99)||(a.kind==="pc"?0:1)-(b.kind==="pc"?0:1)||num(iniInfo(b).bonus)-num(iniInfo(a).bonus))}
function iniSetHp(e,v){const I=iniInfo(e);if(I.hp==null&&e.kind!=="custom")return;
  const cl=x=>Math.max(0,I.max!=null&&I.max>0?Math.min(I.max,x):x);
  if(e.kind==="pc"||e.kind==="npc")setField(e.ref,"hp.cur",cl(v));
  else if(e.kind==="ship")setField(e.ref,"hp",cl(v));
  else iniEdit(d=>{const x=d.list.find(y=>y.id===e.id);if(x)x.hp=cl(v)});}
function iniAct(act,t){
  if(!(S.isGM||S.offline))return true;
  const id=t.dataset.id;
  switch(act){
    case "ini-add":{const ref=$("#ini-pick")?.value;if(!ref){toastMsg("Pick someone to add.",true);return true}
      if(iniDoc().list.some(e=>e.ref===ref)){toastMsg("Already in the order.",true);return true}
      iniEdit(d=>d.list.push({id:rid(),ref,kind:iniKind(ref),name:S.docs[ref]?.name||"",bonus:0,init:null}));return true}
    case "ini-party":iniEdit(d=>{sheetPaths().filter(p=>!S.docs[p].npc&&!d.list.some(e=>e.ref===p)).forEach(p=>d.list.push({id:rid(),ref:p,kind:"pc",name:S.docs[p].name||"",init:null}))});return true;
    case "ini-custom":{const name=($("#ini-cname")?.value||"").trim()||"Enemy";const n=Math.max(1,Math.min(20,num($("#ini-ccount")?.value,1)));
      const bonus=num($("#ini-cbonus")?.value,0);const hpv=$("#ini-chp")?.value;const hp=hpv===""||hpv==null?null:num(hpv);
      iniEdit(d=>{for(let i=1;i<=n;i++)d.list.push({id:rid(),kind:"custom",name:n>1?name+" "+i:name,bonus,hp,max:hp,init:null})});
      ["#ini-cname","#ini-chp"].forEach(s=>{const el=$(s);if(el)el.value=""});return true}
    case "ini-roll":iniEdit(d=>{const e=d.list.find(x=>x.id===id);if(e)iniRollOne(e)});return true;
    case "ini-rollall":iniEdit(d=>{d.list.forEach(e=>{if(t.dataset.all||e.init==null)iniRollOne(e)});iniSort(d);d.round=1;d.turn=d.list[0]?.id||null});return true;
    case "ini-sort":iniEdit(iniSort);return true;
    case "ini-next":case "ini-prev":iniEdit(d=>{const L=d.list.filter(e=>!e.out);if(!L.length)return;let i=L.findIndex(e=>e.id===d.turn);
      if(act==="ini-next"){if(i<0){d.turn=L[0].id;return}i++;if(i>=L.length){i=0;d.round=num(d.round,1)+1}}
      else{if(i<0){d.turn=L[L.length-1].id;return}i--;if(i<0){if(num(d.round,1)>1){i=L.length-1;d.round--}else i=0}}
      d.turn=L[i].id});return true;
    case "ini-up":case "ini-down":iniEdit(d=>{const i=d.list.findIndex(e=>e.id===id);const j=act==="ini-up"?i-1:i+1;if(i<0||j<0||j>=d.list.length)return;[d.list[i],d.list[j]]=[d.list[j],d.list[i]]});return true;
    case "ini-here":iniEdit(d=>{d.turn=id});return true;
    case "ini-out":iniEdit(d=>{const e=d.list.find(x=>x.id===id);if(e)e.out=!e.out});return true;
    case "ini-del":iniEdit(d=>{if(d.turn===id){const i=d.list.findIndex(e=>e.id===id);const L=d.list.filter(e=>e.id!==id);d.turn=L.length?L[Math.min(i,L.length-1)].id:null}d.list=d.list.filter(e=>e.id!==id)});return true;
    case "ini-hp":{const e=iniDoc().list.find(x=>x.id===id);if(!e)return true;const I=iniInfo(e);iniSetHp(e,num(I.hp)+num(t.dataset.d));render();return true}
    case "ini-reset":if(S.confirm!==act){S.confirm=act;render();return true}S.confirm=null;iniEdit(d=>{d.round=1;d.turn=null;d.list.forEach(e=>{e.init=null;e.rollTxt="";e.out=false})});toastMsg("New fight: everyone's initiative cleared.");return true;
    case "ini-clear":if(S.confirm!==act){S.confirm=act;render();return true}S.confirm=null;iniEdit(d=>{d.round=1;d.turn=null;d.list=[]});return true;
    case "ini-open":{const e=iniDoc().list.find(x=>x.id===id);if(!e||!S.docs[e.ref])return true;
      if(e.kind==="pc"){S.view="sheet";S.sel=e.ref}else if(e.kind==="npc"){S.view="npcs"}else if(e.kind==="ship"){S.view="ships";S.shipSel=e.ref;S.shipMode=S.docs[e.ref].npc?"npc":"party";S.shipFull=true}
      render();window.scrollTo(0,0);return true}
  }
  return false;
}
function iniChange(el){const id=el.dataset.id;const k=el.dataset.ini;const e=iniDoc().list.find(x=>x.id===id);if(!e)return;
  if(k==="hp"){iniSetHp(e,num(el.value));render();return}
  iniEdit(d=>{const x=d.list.find(y=>y.id===id);if(!x)return;
    if(k==="init"){x.init=el.value===""?null:num(el.value);x.rollTxt=""}
    else if(k==="bonus")x.bonus=num(el.value);
    else if(k==="name")x.name=el.value;
    else if(k==="note")x.note=el.value;});}
function renderInitiative(){
  if(!(S.isGM||S.offline))return `<div class="empty">GM only.</div>`;
  const d=iniDoc();const inList=new Set(d.list.map(e=>e.ref).filter(Boolean));
  const opt=(p,label)=>inList.has(p)?"":`<option value="${esc(p)}">${esc(label)}</option>`;
  const pcs=sheetPaths().map(p=>opt(p,(S.docs[p].name||"Unnamed")+(S.docs[p].npc?" (NPC sheet)":S.docs[p].player?" · "+S.docs[p].player:""))).join("");
  const npcs=npcPaths().map(p=>opt(p,S.docs[p].name||"NPC")).join("");
  const ships=shipPaths().map(p=>opt(p,(S.docs[p].name||"Ship")+(S.docs[p].npc?" (NPC)":""))).join("");
  const rows=d.list.map((e,i)=>{const I=iniInfo(e);const cur=d.turn===e.id;const fixed=e.kind==="pc";
    const hpCol=I.max>0?(I.hp/I.max<.34?"var(--bad)":I.hp/I.max<.67?"var(--warn)":"var(--good)"):"var(--text)";
    return `<div class="inirow ${cur?"cur":""} ${e.out?"out":""}">
      <div class="inival"><input class="inp num" type="number" data-ini="init" data-id="${e.id}" value="${e.init??""}" placeholder="–" title="Initiative (type to set)" aria-label="Initiative"><button class="btn sm" data-act="ini-roll" data-id="${e.id}" title="Roll 1d8 ${sgn(num(I.bonus))}">Roll</button></div>
      <div class="ininame">${e.ref&&S.docs[e.ref]?`<button class="rword" data-act="ini-open" data-id="${e.id}"><b>${esc(I.name)}</b></button>`:e.kind==="custom"?`<input class="inp" data-ini="name" data-id="${e.id}" value="${esc(e.name||"")}" aria-label="Name">`:`<b>${esc(I.name)}</b>`}
        <span class="hint">${esc(I.sub||"")} · ${fixed?`init ${sgn(num(I.bonus))}${I.twice?" (Alert)":""}`:`init <input class="inp num inib" type="number" data-ini="bonus" data-id="${e.id}" value="${num(e.bonus)}" aria-label="Initiative bonus">`}${e.rollTxt?` · <span class="num">${esc(e.rollTxt)}</span>`:""}</span>
        <input class="inp ininote" data-ini="note" data-id="${e.id}" value="${esc(e.note||"")}" placeholder="Note (stunned, hiding…)" aria-label="Note"></div>
      <div class="inihp">${I.hp==null&&e.kind!=="custom"?"":`<span class="lbl">HP</span><div class="inihpc"><button class="btn sm" data-act="ini-hp" data-id="${e.id}" data-d="-1" aria-label="Lose 1 HP">−</button><input class="inp num" type="number" data-ini="hp" data-id="${e.id}" value="${I.hp??""}" placeholder="–" style="color:${hpCol}" aria-label="HP"><button class="btn sm" data-act="ini-hp" data-id="${e.id}" data-d="1" aria-label="Gain 1 HP">+</button></div>${I.max!=null&&I.max>0?`<span class="hint">of ${I.max}</span>`:""}`}</div>
      <div class="inictl"><button class="iconbtn" data-act="ini-up" data-id="${e.id}" title="Move up" ${i===0?"disabled":""}>▲</button><button class="iconbtn" data-act="ini-down" data-id="${e.id}" title="Move down" ${i===d.list.length-1?"disabled":""}>▼</button>
        <button class="btn sm" data-act="ini-here" data-id="${e.id}" title="Make it this one's turn">Turn</button><button class="btn sm" data-act="ini-out" data-id="${e.id}" title="Skip in the turn order">${e.out?"Back in":"Out"}</button><button class="iconbtn" data-act="ini-del" data-id="${e.id}" title="Remove" style="color:var(--bad)">✕</button></div>
    </div>`}).join("");
  const curE=d.list.find(e=>e.id===d.turn);
  return `<h2 class="pagetitle">Initiative</h2><p class="hint" style="margin-top:-6px">Private to you. Rolls here don't go to the game log.</p>
  <div class="frame inibar"><div><span class="lbl">Round</span><b class="num" style="font-size:28px">${num(d.round,1)}</b></div>
    <div style="flex:1;min-width:0"><span class="lbl">Up now</span><b style="font-size:18px">${curE?esc(iniInfo(curE).name):"—"}</b></div>
    <div class="inibtns"><button class="btn" data-act="ini-prev">◀ Back</button><button class="btn pri" data-act="ini-next">Next turn ▶</button></div></div>
  <div class="inigrid"><div class="stack">
    <div class="frame"><div class="frame-b">
      <div class="inibtns" style="margin-bottom:10px"><button class="btn" data-act="ini-rollall" title="Rolls for everyone without a number, sorts, and starts round 1">Roll missing & sort</button><button class="btn" data-act="ini-rollall" data-all="1" title="Re-rolls everyone">Re-roll all</button><button class="btn" data-act="ini-sort">Sort</button>
        <span style="flex:1"></span>${S.confirm==="ini-reset"?`<button class="btn" data-act="ini-reset" style="color:var(--bad)">Sure? Clear rolls</button>`:`<button class="btn" data-act="ini-reset" title="Keep everyone, clear their numbers">New fight</button>`}${S.confirm==="ini-clear"?`<button class="btn" data-act="ini-clear" style="color:var(--bad)">Sure? Empty list</button>`:`<button class="btn" data-act="ini-clear">Clear list</button>`}</div>
      ${rows||`<div class="empty">Add characters, NPCs, ships or enemies to start.</div>`}
      <p class="hint" style="margin:10px 0 0">Everyone rolls 1d8 + DEX modifier (PCs use their sheet's bonus; Alert rolls twice). High goes first, PCs win ties. Initiative isn't re-rolled each round. HP changes on characters, NPCs and ships update their real sheets.</p>
    </div></div></div>
    <div class="stack"><div class="frame"><div class="frame-b">
      <span class="lbl">Add from the app</span>
      <select id="ini-pick" class="inp" style="width:100%;margin:6px 0"><option value="">Choose…</option>${pcs?`<optgroup label="Characters">${pcs}</optgroup>`:""}${npcs?`<optgroup label="NPCs">${npcs}</optgroup>`:""}${ships?`<optgroup label="Ships">${ships}</optgroup>`:""}</select>
      <div class="inibtns"><button class="btn pri" data-act="ini-add">Add</button><button class="btn" data-act="ini-party">Add whole party</button></div>
    </div></div>
    <div class="frame"><div class="frame-b">
      <span class="lbl">Quick enemy</span>
      <input id="ini-cname" class="inp" placeholder="Name (e.g. Pirate)" style="width:100%;margin:6px 0">
      <div class="iniq"><label><span class="hint">How many</span><input id="ini-ccount" class="inp num" type="number" min="1" max="20" value="1"></label><label><span class="hint">Init bonus</span><input id="ini-cbonus" class="inp num" type="number" value="0"></label><label><span class="hint">HP</span><input id="ini-chp" class="inp num" type="number" min="0" placeholder="–"></label></div>
      <button class="btn pri" data-act="ini-custom" style="margin-top:8px">Add enemy</button>
      <p class="hint" style="margin:8px 0 0">Several at once get numbered: Pirate 1, Pirate 2…</p>
    </div></div></div></div>`;
}
