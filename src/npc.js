/* ================= NPC MAKER (GM) ================= */
// From the rulebook's human NPC table: [name, HD, AC, acNote, atk, dmgBonus, move, morale, skill, save, attacks per action]
const NPC_TEMPLATES=[
  ["Peaceful Human",1,10,"",0,0,10,6,1,15,1,"unarmed"],["Martial Human",1,10,"",1,0,10,8,1,15],["Veteran Fighter",2,14,"",2,1,10,9,1,14],
  ["Elite Fighter",3,16,"combat",4,1,10,10,2,14],["Heroic Fighter",6,16,"combat",8,3,10,11,3,12],
  ["Barbarian Hero",6,16,"primitive",8,3,10,11,3,12],["Barbarian Tribal",1,12,"primitive",2,0,10,8,1,15],["Gang Boss",3,14,"",4,1,10,9,2,14],
  ["Gang Member",1,12,"",1,0,10,7,1,15],["Gengineered Killer",4,16,"",5,1,15,10,2,13],["Legendary Fighter",10,20,"powered",12,4,10,12,5,10,2],
  ["Military Elite",3,16,"combat",4,1,10,10,2,14],["Military Soldier",1,16,"combat",1,0,10,9,1,15],["Normal Human",1,10,"",0,0,10,6,1,15,1,"unarmed"],
  ["Pirate King",7,18,"powered",9,2,10,11,3,12],["Police Officer",1,14,"",1,0,10,8,1,15],["Serial Killer",6,12,"",8,3,10,12,3,12],
  ["Skilled Professional",1,10,"",0,0,10,6,2,15],["Warrior Tyrant",8,20,"powered",10,3,10,11,3,11]
];
const npcPaths=()=>Object.keys(S.docs).filter(p=>p.startsWith("npcs/")).sort((a,b)=>String(S.docs[a].name).localeCompare(String(S.docs[b].name)));
function rollHD(hd){let t=0;for(let i=0;i<Math.max(1,num(hd,1));i++)t+=rand(8);return t}
function npcFromTemplate(ti,name){
  const t=NPC_TEMPLATES[ti]||NPC_TEMPLATES[1];const hp=rollHD(t[1]);
  const weapon=t[11]==="unarmed"?{name:"Unarmed",dmg:"1d2"}:{name:"Weapon",dmg:"1d6"};
  return {name:name||t[0],kind:t[0],hd:t[1],hp:{cur:hp,max:hp},ac:t[2],acNote:t[3],atkBase:t[4],dmgBonus:t[5],move:t[6],morale:t[7],skill:t[8],save:t[9],
    attacks:[{id:rid(),name:weapon.name,atk:t[4],dmg:weapon.dmg+(t[5]?"+"+t[5]:""),times:t[10]||1}],notes:"",shared:false,createdAt:Date.now()};
}
function npcRoll(npc,label,lines){
  const rec={ts:Date.now(),by:S.me||"",char:String(npc.name||"NPC"),npc:true,label,lines};
  showToast(rec);
  if(S.db&&!S.offline){S.db.collection("npcrolls").add(clone(rec)).catch(()=>toastMsg("NPC roll didn't save to the GM log.",true))}
  else{S.npcRolls.unshift({id:rid(),...rec});S.npcRolls=S.npcRolls.slice(0,60);render()}
}
function npcAct(act,t){
  const p=t.dataset.doc;const n=p?S.docs[p]:null;
  switch(act){
    case "npc-new":{
      if(!(S.isGM||S.offline))return true;
      const ti=num($("#npc-tpl")?.value,1);const base=($("#npc-name")?.value||"").trim();const count=Math.max(1,Math.min(20,num($("#npc-count")?.value,1)));
      let last=null;
      for(let i=0;i<count;i++){const nm=(base||NPC_TEMPLATES[ti][0])+(count>1?" "+(i+1):"");const path=(S.offline?"npcs/local-":"npcs/")+rid();createDoc(path,npcFromTemplate(ti,nm));if(S.offline)S.exists[path]=true;last=path}
      S.npcSel=last;toastMsg(count>1?count+" NPCs created.":"NPC created.");render();return true}
    case "npc-sel":S.npcSel=p;render();return true;
    case "npc-share":if(n){setField(p,"shared",!n.shared);render()}return true;
    case "npc-dup":if(n){const d=clone(n);d.name=(d.name||"NPC")+" (copy)";const hp=rollHD(d.hd);d.hp={cur:hp,max:hp};d.shared=false;d.createdAt=Date.now();const path=(S.offline?"npcs/local-":"npcs/")+rid();createDoc(path,d);if(S.offline)S.exists[path]=true;S.npcSel=path;render()}return true;
    case "npc-del":if(S.confirm!=="npc"+p){S.confirm="npc"+p;render();return true}S.confirm=null;deleteDoc(p);S.npcSel=null;render();return true;
    case "npc-hp":if(n){const amt=Math.abs(num($("#npc-hp-amt")?.value,0))||1;const v=t.dataset.d==="full"?num(n.hp?.max):Math.max(0,Math.min(num(n.hp?.max),num(n.hp?.cur)+num(t.dataset.d)*amt));setField(p,"hp.cur",v);render()}return true;
    case "npc-rerollhp":if(n){const hp=rollHD(n.hd);setField(p,"hp",{cur:hp,max:hp});render()}return true;
    case "npc-wadd":if(n){const v=$("#npc-wpick")?.value;const w=v?pickedItem(v):null;if(!w||w.type!=="weapon"){toastMsg("Pick a weapon first.",true);return true}
      const base=n.atkBase!=null&&n.atkBase!==""?num(n.atkBase):num((n.attacks||[])[0]?.atk,num(n.hd,1));const bonus=num(n.dmgBonus);
      const pd=parseDice(w.dmg||"1d6");const flat=pd.flat+bonus;const dice=pd.groups.map(g=>g.n+"d"+g.s).join("+");
      let shock="";const m=/(\d+)\s*\/\s*(\d+)/.exec(String(w.shock||""));if(m)shock=(num(m[1])+bonus)+"/"+m[2];
      const a=n.attacks||[];a.push({id:rid(),name:w.name,atk:base+(w.energy?1:0),dmg:dice+(flat?(flat>0?"+":"")+flat:""),shock,range:w.range||"",times:1});
      setField(p,"attacks",a);toastMsg("Added "+w.name+".");render()}return true;
    case "npc-atk-add":if(n){const a=n.attacks||[];a.push({id:rid(),name:"Attack",atk:num(n.hd,1),dmg:"1d6",times:1});setField(p,"attacks",a);render()}return true;
    case "npc-atk-del":if(n){const a=n.attacks||[];a.splice(num(t.dataset.j),1);setField(p,"attacks",a);render()}return true;
    case "npc-hit":if(n){const a=(n.attacks||[])[num(t.dataset.j)];if(!a)return true;const d={v:rand(20),s:20};const parts=[{l:"Attack bonus",v:num(a.atk)},...(t.dataset.snap?[{l:"Snap Attack",v:-4}]:[])];
      npcRoll(n,(a.name||"Attack")+(t.dataset.snap?" snap attack":" to hit"),[{name:"To hit",dice:[d],parts,total:d.v+parts.reduce((s,x)=>s+x.v,0),verdict:null,note:"vs target AC"}])}return true;
    case "npc-dmg":if(n){const a=(n.attacks||[])[num(t.dataset.j)];if(!a)return true;const pd=parseDice(a.dmg||"1d6");const r=rollGroups(pd);npcRoll(n,(a.name||"Attack")+" damage",[{name:"Damage",dice:r.dice,parts:pd.flat?[{l:"Bonus",v:pd.flat}]:[],total:Math.max(0,r.sum+pd.flat)}])}return true;
    case "npc-skill":if(n){const dice=[{v:rand(6),s:6},{v:rand(6),s:6}];const parts=t.dataset.untrained?[]:[{l:"Skill bonus",v:num(n.skill)}];const diff=num(S.opts.diff);const tot=dice[0].v+dice[1].v+parts.reduce((s,x)=>s+x.v,0);
      npcRoll(n,t.dataset.untrained?"unrelated skill check":"skill check",[{name:"Check",dice,parts,total:tot,verdict:diff?(tot>=diff?["ok","Success"]:["no","Failure"]):null,note:diff?"vs difficulty "+diff:(t.dataset.untrained?"no skill bonus":"related to their role")}])}return true;
    case "npc-save":if(n){const d={v:rand(20),s:20};npcRoll(n,"saving throw",[{name:"Save",dice:[d],parts:[],total:d.v,verdict:(d.v===20||d.v>=num(n.save))?["ok","Saved"]:["no","Failed"],note:"needs "+num(n.save)+"+"}])}return true;
    case "npc-morale":if(n){const dice=[{v:rand(6),s:6},{v:rand(6),s:6}];const tot=dice[0].v+dice[1].v;npcRoll(n,"morale check",[{name:"Morale",dice,parts:[],total:tot,verdict:tot<=num(n.morale)?["ok","Holds"]:["no","Breaks"],note:"holds on "+num(n.morale)+" or less"}])}return true;
    case "npc-init":if(n){const d={v:rand(8),s:8};npcRoll(n,"initiative",[{name:"Initiative",dice:[d],parts:[],total:d.v}])}return true;
    case "npc-reveal":{const r=[...S.npcRolls].find(x=>x.id===t.dataset.id);if(!r)return true;const rec={ts:Date.now(),by:S.me||"",char:r.char,player:"GM",label:r.label,lines:r.lines};
      if(S.db&&!S.offline)S.db.collection("rolls").add(clone(rec)).then(()=>toastMsg("Shown to players.")).catch(()=>toastMsg("Couldn't post that roll.",true));else{S.rolls.unshift({id:rid(),...rec});render()}return true}
  }
  return false;
}
function npcStatBlock(p){
  const n=S.docs[p];const gm=S.isGM||S.offline;const E=gm;
  const f=(k,l,o={})=>`<div class="field"><span class="lbl">${l}</span>${E?inp(p,k,{type:"number",cls:"inp",...o}):`<b class="big2">${esc(getPath(n,k)??"—")}</b>`}</div>`;
  const hpPct=num(n.hp?.max)>0?Math.max(0,Math.min(100,num(n.hp?.cur)/num(n.hp?.max)*100)):0;
  const atks=(n.attacks||[]).map((a,j)=>`<tr>
    <td>${E?inp(p,"attacks."+j+".name",{live:true}):`<b>${esc(a.name)}</b>`}</td>
    <td style="width:90px">${E?inp(p,"attacks."+j+".atk",{type:"number",cls:"inp n"}):sgn(a.atk)}</td>
    <td style="width:120px">${E?inp(p,"attacks."+j+".dmg",{live:true,ph:"1d6+1"}):esc(a.dmg)}</td>
    <td style="width:90px">${E?inp(p,"attacks."+j+".shock",{live:true,ph:"—",attrs:'title="Shock: damage/AC, e.g. 2/13"'}):esc(a.shock||"—")}</td>
    <td style="width:70px">${E?inp(p,"attacks."+j+".times",{type:"number",cls:"inp n",min:1,attrs:'title="Attacks per Main Action"'}):"×"+num(a.times,1)}</td>
    <td style="white-space:nowrap">${gm?`<button class="rollbtn" data-act="npc-hit" data-doc="${esc(p)}" data-j="${j}">Hit ${sgn(a.atk)}</button> <button class="rollbtn" data-act="npc-dmg" data-doc="${esc(p)}" data-j="${j}">Dmg</button> <button class="rollbtn snap" data-act="npc-hit" data-snap="1" data-doc="${esc(p)}" data-j="${j}">Snap</button> <button class="iconbtn" data-act="npc-atk-del" data-doc="${esc(p)}" data-j="${j}" aria-label="Remove attack">×</button>`:""}</td></tr>`).join("");
  return `<div class="frame-h"><h3>${gm?"NPC":"Shared NPC"}${n.kind?` <span class="tag">${esc(n.kind)}</span>`:""}${n.shared?` <span class="tag on">Visible to players</span>`:gm?` <span class="tag">Hidden</span>`:""}</h3>
    ${gm?`<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm ${n.shared?"on":""}" data-act="npc-share" data-doc="${esc(p)}">${n.shared?"Hide from players":"Share with players"}</button><button class="btn sm" data-act="npc-dup" data-doc="${esc(p)}">Duplicate</button><button class="btn sm danger" data-act="npc-del" data-doc="${esc(p)}">${S.confirm==="npc"+p?"Click again":"Delete"}</button></div>`:""}</div>
  <div class="frame-b">
    <div class="field" style="margin-bottom:10px">${E?inp(p,"name",{live:true,cls:"inp npcname"}):`<h3 style="font-size:26px">${esc(n.name)}</h3>`}</div>
    <div class="npchp"><div><span class="lbl">Hit points</span><div class="big num" style="font-family:var(--display);font-size:34px">${num(n.hp?.cur)} <small class="hint">/ ${num(n.hp?.max)}</small></div><div class="hpbar"><i style="width:${hpPct}%;background:${hpPct<34?"var(--bad)":hpPct<67?"var(--warn)":"var(--good)"}"></i></div></div>
      ${gm?`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><button class="btn sm" style="color:var(--bad)" data-act="npc-hp" data-doc="${esc(p)}" data-d="-1">Damage</button><input id="npc-hp-amt" class="inp n" type="number" min="1" placeholder="1"><button class="btn sm" style="color:var(--good)" data-act="npc-hp" data-doc="${esc(p)}" data-d="1">Heal</button><button class="btn sm ghost" data-act="npc-hp" data-doc="${esc(p)}" data-d="full">Full</button><button class="btn sm ghost" data-act="npc-rerollhp" data-doc="${esc(p)}" title="Roll ${num(n.hd)}d8">Re-roll HP (${num(n.hd)}d8)</button></div>`:""}</div>
    <div class="npcgrid">${f("hd","Hit dice",{min:1})}${f("ac","AC")}${f("atkBase","Attack bonus",{ph:String(num(n.hd,1))})}${f("dmgBonus","Damage bonus",{ph:"0"})}${f("move","Move (m)")}${f("morale","Morale")}${f("skill","Skill bonus")}${f("save","Save")}${E?`<div class="field"><span class="lbl">Max HP</span>${inp(p,"hp.max",{type:"number",cls:"inp",min:1})}</div><div class="field"><span class="lbl">AC note</span>${inp(p,"acNote",{live:true,ph:"combat, powered…"})}</div>`:""}</div>
    ${gm?`<div class="npcrolls"><button class="btn" data-act="npc-init" data-doc="${esc(p)}">Initiative 1d8</button><button class="btn" data-act="npc-skill" data-doc="${esc(p)}">Skill check 2d6${sgn(num(n.skill))}</button><button class="btn ghost" data-act="npc-skill" data-untrained="1" data-doc="${esc(p)}" title="For checks unrelated to their role">Unrelated check 2d6</button><button class="btn" data-act="npc-save" data-doc="${esc(p)}">Save ${num(n.save)}+</button><button class="btn" data-act="npc-morale" data-doc="${esc(p)}">Morale (${num(n.morale)})</button></div><p class="hint">NPC rolls go to your GM log only. Use "Show to players" on a log entry to reveal one.</p>`:""}
    <div class="sect" style="margin-top:12px"><span class="lbl">Attacks</span><div class="tbl-wrap"><table><thead><tr><th>Attack</th><th>Hit</th><th>Damage</th><th>Shock</th><th>Per action</th><th></th></tr></thead><tbody>${atks||`<tr><td colspan="6" class="hint">No attacks.</td></tr>`}</tbody></table></div>
    ${gm?`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px"><select id="npc-wpick" class="inp" style="max-width:320px">${itemPickOpts("Add a weapon…",true)}</select><button class="btn sm pri" data-act="npc-wadd" data-doc="${esc(p)}">Add weapon</button><button class="btn sm" data-act="npc-atk-add" data-doc="${esc(p)}">+ Custom attack</button></div>
    <p class="hint">Weapons use this NPC's attack bonus (+1 for energy weapons) and add its damage bonus to damage and Shock.</p>`:""}</div>
    <div class="sect"><span class="lbl">Notes</span>${E?ta(p,"notes",{rows:4,ph:"Personality, gear, special abilities, loot…"}):`<p style="white-space:pre-wrap">${esc(n.notes||"")}</p>`}</div>
    ${gm?`<p class="hint">From the book: an NPC's attack bonus usually equals its hit dice, and its save is 15 minus half its hit dice, rounded down. For a morale check, roll 2d6: at or under Morale they keep fighting, over it they break. NPC psychics get Effort equal to a third of their hit dice, rounded up.</p>`:""}
  </div>`;
}
function renderNPCs(){
  const gm=S.isGM||S.offline;const ps=npcPaths();
  const sel=S.npcSel&&S.docs[S.npcSel]?S.npcSel:ps[0];
  const q=(S.npcQ||"").toLowerCase();const list=ps.filter(p=>!q||String(S.docs[p].name).toLowerCase().includes(q)||String(S.docs[p].kind||"").toLowerCase().includes(q));
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin:18px 0 12px;gap:8px;flex-wrap:wrap"><h2 class="pagetitle" style="margin:0">NPCs</h2>${gm?`<span class="hint">Hidden from players unless you share them.</span>`:`<span class="hint">NPCs your GM has shared.</span>`}</div>
  ${gm?`<div class="frame" style="margin-bottom:14px"><div class="frame-b npcmake" style="padding-top:12px">
    <div class="field"><span class="lbl">Start from</span><select id="npc-tpl" class="inp">${NPC_TEMPLATES.map((t,i)=>`<option value="${i}" ${i===1?"selected":""}>${esc(t[0])} — HD ${t[1]}, AC ${t[2]}, Atk ${sgn(t[4])}</option>`).join("")}</select></div>
    <div class="field"><span class="lbl">Name (optional)</span><input id="npc-name" class="inp" placeholder="e.g. Dock Guard"></div>
    <div class="field" style="max-width:90px"><span class="lbl">How many</span><input id="npc-count" class="inp" type="number" min="1" max="20" value="1"></div>
    <button class="btn pri" data-act="npc-new" style="align-self:end">Create</button></div></div>`:""}
  <div class="comp"><div class="frame clist"><div style="padding:8px 10px"><input id="npc-q" class="inp" placeholder="Search NPCs" value="${esc(S.npcQ||"")}"></div>
    ${list.length?list.map(p=>{const n=S.docs[p];return `<button class="citem ${p===sel?"on":""}" data-act="npc-sel" data-doc="${esc(p)}"><b>${esc(n.name||"NPC")}</b>${n.shared?`<span class="tag on">shared</span>`:""}<span class="isub">${esc(n.kind||"")} · HP ${num(n.hp?.cur)}/${num(n.hp?.max)} · AC ${num(n.ac)}</span></button>`}).join(""):`<p class="hint" style="padding:0 14px">${gm?"No NPCs yet. Make one above.":"Nothing shared yet."}</p>`}</div>
  <div class="frame">${sel?npcStatBlock(sel):`<div class="empty" style="margin:12px">${gm?"Create an NPC to see its stat block.":"Select an NPC."}</div>`}</div></div>`;
}
