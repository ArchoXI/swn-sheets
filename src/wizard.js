/* ================= CHARACTER CREATION WIZARD ================= */
const ARRAY_VALUES=[14,12,11,10,9,7];
const WSTEPS=[["concept","Concept"],["attributes","Attributes"],["background","Background"],["skills","Background Skills"],["class","Class"],["foci","Foci"],["hobby","Bonus Skill"],["psychic","Psychic Powers"],["hp","Hit Points"],["equipment","Equipment"],["review","Review & Create"]];
function newWiz(){return {step:0,name:"",player:"",homeworld:"",species:"Human",goal:"",
  attrMethod:"roll",rolls:{},rollDice:{},swap14:"",arrayAssign:{},
  bg:"",bgMethod:"quick",freeChoice:"",freeAlt:"",quickChoice:{},quickAlt:{},picks:[{idx:"",choice:"",alt:""},{idx:"",choice:"",alt:""}],
  rollsBg:[{table:"learning",value:null,choice:"",alt:"",a:"",b:""},{table:"learning",value:null,choice:"",alt:"",a:"",b:""},{table:"growth",value:null,choice:"",alt:"",a:"",b:""}],
  cls:"",partials:["",""],foci:[],anyFocus:false,hobby:{choice:""},psy:{picks:["",""],tech:""},ptTech:"",
  hp:{die:null},equip:{mode:"package",pkg:"",d1:null,d2:null}}}
function loadWiz(){try{const v=localStorage.getItem("swn.wiz");if(v){const w=JSON.parse(v);return Object.assign(newWiz(),w)}}catch(e){}return newWiz()}
function saveWiz(){try{localStorage.setItem("swn.wiz",JSON.stringify(S.wiz))}catch(e){}}
function wget(p){return getPath(S.wiz,p)}
function wset(p,v){setPathV(S.wiz,p,v);saveWiz()}

const PHYS=["str","dex","con"],MENT=["int","wis","cha"];
const isPsyClass=w=>w.cls==="Psychic"||(w.cls==="Adventurer"&&w.partials.includes("Psychic"));
const hasPartial=(w,p)=>w.cls===p||(w.cls==="Adventurer"&&w.partials.includes(p));
function focusSlots(w){
  const s=[{slot:"general",label:"Your focus (any kind)"}];
  if(hasPartial(w,"Expert"))s.push({slot:"expert",label:(w.cls==="Expert"?"Expert":"Partial Expert")+" bonus (non-combat focus)"});
  if(hasPartial(w,"Warrior"))s.push({slot:"warrior",label:(w.cls==="Warrior"?"Warrior":"Partial Warrior")+" bonus (combat focus)"});
  return s;
}
function allFoci(){
  const list=Object.entries(FOCI).map(([k,f])=>({key:k,...f,hb:false}));
  hbFociPaths().forEach(p=>{const f=S.docs[p];list.push({key:"hb:"+p.split("/")[1],name:f.name||"Unnamed focus",type:f.type||"noncombat",skill:f.skill||null,d:f.d||"",l1:f.l1||"",l2:f.l2||"",hb:true,repeat:false})});
  return list;
}
const focusDef=key=>key&&key.startsWith("hb:")?(()=>{const f=S.docs["foci/"+key.slice(3)];return f?{key,name:f.name,type:f.type,skill:f.skill||null,d:f.d,l1:f.l1,l2:f.l2,hb:true}:null})():(FOCI[key]?{key,...FOCI[key]}:null);
function focusAllowed(w,slot,f){
  if(w.anyFocus)return true;
  const psy=isPsyClass(w);
  if(f.key==="psychic_training"&&!psy)return false;
  if(f.key==="wild_psychic"&&psy)return false;
  if(slot==="expert")return f.type==="noncombat";
  if(slot==="warrior")return f.type==="combat";
  return true;
}

/* Derive everything from wizard state */
function wizDerive(w){
  const D={issues:{},grants:[],skills:Object.fromEntries(SKILLS.map(s=>[s[0],-1])),psy:Object.fromEntries(PSY.map(s=>[s[0],-1])),attrs:{},statLog:[]};
  const issue=(step,msg)=>{(D.issues[step]=D.issues[step]||[]).push(msg)};
  // attributes
  ATTRS.forEach(([k])=>{
    let v=null;
    if(w.attrMethod==="roll"){v=w.rolls[k];if(w.swap14===k)v=14}
    else v=w.arrayAssign[k];
    D.attrs[k]=v==null||v===""?null:num(v);
  });
  if(ATTRS.some(([k])=>D.attrs[k]==null))issue("attributes",w.attrMethod==="roll"?"Roll or enter all six attributes.":"Assign all six array values.");
  if(w.attrMethod==="roll"&&ATTRS.some(([k])=>w.rolls[k]!=null&&(num(w.rolls[k])<3||num(w.rolls[k])>18)))issue("attributes","Rolled scores must be between 3 and 18.");
  if(w.attrMethod==="array"){const used=ATTRS.map(([k])=>w.arrayAssign[k]).filter(v=>v!=null&&v!=="").map(Number);const pool=[...ARRAY_VALUES];let ok=true;used.forEach(v=>{const i=pool.indexOf(v);if(i<0)ok=false;else pool.splice(i,1)});if(!ok)issue("attributes","Each array value can only be used once.")}
  // grant helpers
  const addSkill=(src,spec,choicePath,altPath,step)=>{
    const g={src,spec,choicePath,altPath,step};
    const opts=specOptions(spec);
    let key=opts?wget(choicePath):spec;
    if(opts&&!key){g.need="choice";issue(step,src+": choose "+specName(spec)+".");D.grants.push(g);return}
    g.skill=key;
    const isP=!!PSYK[key];const map=isP?D.psy:D.skills;
    if(map[key]>=1){
      if(isP){g.need="maxed";issue(step,src+": "+specName(key)+" is already level-1.");D.grants.push(g);return}
      g.maxed=true;const alt=altPath?wget(altPath):"";
      if(!alt||!SKILL[alt]||D.skills[alt]>=1){g.need="alt";issue(step,src+": "+specName(key)+" is already level-1, so pick another skill instead.");D.grants.push(g);return}
      g.alt=alt;D.skills[alt]+=1;D.grants.push(g);return;
    }
    map[key]+=1;D.grants.push(g);
  };
  const addStat=(src,spec,aPath,bPath,step)=>{
    const a=wget(aPath),b=wget(bPath);
    const group=spec==="+2phys"?PHYS:spec==="+2ment"?MENT:ATTRS.map(x=>x[0]);
    const g={src,spec,stat:true,aPath,bPath,step};
    if(spec==="+1any"){if(!a||!group.includes(a)){g.need="stat";issue(step,src+": choose which attribute gets +1.");D.grants.push(g);return}D.statLog.push([a,1,src])}
    else{if(!a||!b||!group.includes(a)||!group.includes(b)){g.need="stat";issue(step,src+": choose where the two points go.");D.grants.push(g);return}D.statLog.push([a,1,src]);D.statLog.push([b,1,src])}
    D.grants.push(g);
  };
  // background
  const bg=BG[w.bg];
  if(!bg)issue("background","Choose a background.");
  else{
    addSkill("Background free skill",bg.free,"freeChoice","freeAlt","skills");
    if(w.bgMethod==="quick"){[1,2].forEach(i=>addSkill("Quick skill",bg.quick[i],"quickChoice."+i,"quickAlt."+i,"skills"))}
    else if(w.bgMethod==="pick"){
      w.picks.forEach((p,i)=>{
        if(p.idx===""||p.idx==null){issue("skills","Pick "+(i+1)+": choose a skill from the Learning table.");return}
        const spec=bg.learning[num(p.idx)];
        if(spec==="any_skill"){issue("skills","Pick "+(i+1)+": \"Any Skill\" can't be picked, only rolled.");return}
        addSkill("Learning pick "+(i+1),spec,"picks."+i+".choice","picks."+i+".alt","skills");
      });
    }else{
      w.rollsBg.forEach((r,i)=>{
        const tbl=r.table==="growth"?bg.growth:bg.learning;const v=num(r.value,0);
        if(!v||v<1||v>tbl.length){issue("skills","Roll "+(i+1)+": roll or enter a result on the "+(r.table==="growth"?"Growth (d6)":"Learning (d8)")+" table.");return}
        const spec=tbl[v-1];const src="Roll "+(i+1)+" ("+(r.table==="growth"?"Growth":"Learning")+" "+v+")";
        if(spec.startsWith("+"))addStat(src,spec,"rollsBg."+i+".a","rollsBg."+i+".b","skills");
        else addSkill(src,spec,"rollsBg."+i+".choice","rollsBg."+i+".alt","skills");
      });
    }
  }
  // class
  if(!w.cls)issue("class","Choose a class.");
  if(w.cls==="Adventurer"&&(!w.partials[0]||!w.partials[1]||w.partials[0]===w.partials[1]))issue("class","Pick two different partial classes.");
  // foci
  const slots=focusSlots(w);
  const seen={};D.foci=[];
  slots.forEach((s,i)=>{
    const e=w.foci[i]||{};const f=focusDef(e.key);
    if(!f){issue("foci",s.label+": choose a focus.");return}
    if(!focusAllowed(w,s.slot,f))issue("foci",s.label+": "+f.name+" isn't allowed in this slot.");
    const id=e.key+(f.key==="specialist"?":"+(e.skill||""):"");
    if(seen[id]!=null){const prev=D.foci[seen[id]];if(prev.level>=2||!(f.l2)){issue("foci",f.name+" can't go past level "+prev.level+".");return}prev.level=2;return}
    seen[id]=D.foci.length;D.foci.push({key:e.key,name:f.name,level:1,skill:"",slotIndex:i,note:e.note||""});
  });
  // psychic
  const psy=isPsyClass(w);
  if(psy){
    const n=w.cls==="Psychic"?2:1;
    for(let i=0;i<n;i++){const d=w.psy.picks[i];if(!d||!DISC[d]){issue("psychic","Choose "+(n===2?"two disciplines":"your discipline")+".");continue}D.psy[d]+=1}
    if(n===2&&w.psy.picks[0]&&w.psy.picks[0]===w.psy.picks[1]&&!w.psy.tech)issue("psychic","You took "+PSYK[w.psy.picks[0]].name+" twice: pick your free level-1 technique.");
  }
  // focus bonus skills (in order)
  D.foci.forEach(f=>{
    const def=focusDef(f.key);if(!def||!def.skill)return;
    const i=f.slotIndex;
    if(def.skill==="any_psychic"){
      const ch=wget("foci."+i+".skill");
      if(!ch){issue("foci",def.name+": choose a psychic skill.");return}
      if(w.cls==="Adventurer"&&w.psy.picks[0]&&ch!==w.psy.picks[0])issue("foci",def.name+": Partial Psychics can only train their own discipline.");
      if(D.psy[ch]>=1){issue("foci",def.name+": "+PSYK[ch].name+" is already level-1.");return}
      D.psy[ch]+=1;f.skill=ch;if(D.psy[ch]===1)f.needsTech=ch;return;
    }
    if(f.key==="specialist"){const ch=wget("foci."+i+".skill");f.skill=ch||""}
    addSkill(def.name+" bonus skill",def.skill,"foci."+i+".skill","foci."+i+".alt","foci");
    if(def.skill==="any_noncombat"||specOptions(def.skill))f.skill=wget("foci."+i+".skill")||f.skill;
  });
  D.foci.forEach(f=>{if(f.needsTech&&!w.ptTech)issue("foci","Psychic Training raised "+PSYK[f.needsTech].name+" to level-1: pick a free level-1 technique.")});
  // hobby
  if(!w.hobby.choice)issue("hobby","Pick your bonus skill.");
  else if(D.skills[w.hobby.choice]>=1)issue("hobby",SKILL[w.hobby.choice].name+" is already level-1. Pick a different skill.");
  else D.skills[w.hobby.choice]+=1;
  D.hobbyOk=w.hobby.choice&&D.skills[w.hobby.choice]<=1;
  // stats
  D.final={...D.attrs};
  D.statLog.forEach(([a,v])=>{if(D.final[a]!=null)D.final[a]=Math.min(18,D.final[a]+v)});
  D.mods=Object.fromEntries(ATTRS.map(([k])=>[k,D.final[k]==null?0:attrMod(D.final[k])]));
  // hp
  D.hpBonus=hasPartial(w,"Warrior")?2:0;
  const die=num(w.hp.die,0);
  if(!die||die<1||die>6)issue("hp","Roll or enter your hit point die (1–6).");
  D.hp=die?Math.max(1,die+D.mods.con+D.hpBonus):null;
  D.dieHard=D.foci.some(f=>f.key==="die_hard");
  // equipment
  if(w.equip.mode==="package"&&!PACKAGES[w.equip.pkg])issue("equipment","Choose an equipment package.");
  if(w.equip.mode==="credits"){const a=num(w.equip.d1,0),b=num(w.equip.d2,0);if(a<1||a>6||b<1||b>6)issue("equipment","Roll or enter both dice for your starting credits.");else D.credits=(a+b)*100}
  if(!w.name.trim())issue("review","Give your character a name.");
  D.techniques=[];
  if(psy&&w.psy.tech&&w.psy.picks[0]===w.psy.picks[1])D.techniques.push([w.psy.picks[0],w.psy.tech]);
  D.foci.forEach(f=>{if(f.needsTech&&w.ptTech)D.techniques.push([f.needsTech,w.ptTech])});
  return D;
}

/* ---------- wizard rendering ---------- */
function wInp(p,{type="text",ph="",min,max,live=false,cls="inp",style=""}={}){
  const v=wget(p);
  return `<input id="w_${p.replace(/[^a-zA-Z0-9]/g,"_")}" class="${cls}" type="${type}" data-w="${esc(p)}" ${type==="number"?"data-num":""} ${live?"data-wlive":""} value="${esc(v??"")}" placeholder="${esc(ph)}" ${min!=null?`min="${min}"`:""} ${max!=null?`max="${max}"`:""} style="${style}">`;
}
function wSel(p,opts,{blank="Choose…",style=""}={}){
  const v=wget(p);
  return `<select id="w_${p.replace(/[^a-zA-Z0-9]/g,"_")}" class="inp" data-w="${esc(p)}" style="${style}">${blank!=null?`<option value="">${esc(blank)}</option>`:""}${opts.map(o=>{const[val,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(val)}" ${String(v??"")===String(val)?"selected":""}>${esc(l)}</option>`}).join("")}</select>`;
}
const skillOpts=keys=>keys.map(k=>[k,specName(k)]);
function rollBox(p,sides,n,label){
  const det=S.wiz.rollDice[p];
  return `<span class="rollpair"><button class="btn sm" data-act="wroll" data-path="${esc(p)}" data-sides="${sides}" data-n="${n}" title="Roll ${n}d${sides}">🎲 Roll ${n}d${sides}</button>
    ${wInp(p,{type:"number",min:n,max:n*sides,cls:"inp n",ph:"—"})}${det?`<span class="hint">${det.map(d=>`<span class="die">${d}</span>`).join("")}</span>`:`<span class="hint">or type your roll</span>`}</span>`;
}
function grantFix(g,D){
  // inline choice controls for a grant
  let h="";
  const opts=specOptions(g.spec);
  if(g.stat){
    const group=g.spec==="+2phys"?PHYS:g.spec==="+2ment"?MENT:ATTRS.map(x=>x[0]);
    const o=group.map(k=>[k,k.toUpperCase()]);
    h+=g.spec==="+1any"?wSel(g.aPath,o,{blank:"+1 to…",style:"max-width:120px"}):`${wSel(g.aPath,o,{blank:"1st point",style:"max-width:110px"})} ${wSel(g.bPath,o,{blank:"2nd point",style:"max-width:110px"})}<span class="hint"> same twice = +2 to one</span>`;
    return h;
  }
  if(opts)h+=wSel(g.choicePath,skillOpts(opts),{blank:specName(g.spec)+"…",style:"max-width:170px"});
  if(g.maxed||g.need==="alt")h+=` <span class="hint">already level-1 →</span> ${wSel(g.altPath,skillOpts(SKILLS.map(s=>s[0]).filter(k=>D.skills[k]<1||k===wget(g.altPath))),{blank:"pick another",style:"max-width:150px"})}`;
  return h;
}
function grantLine(g,D){
  let result="";
  if(g.stat){const a=wget(g.aPath),b=wget(g.bPath);result=g.spec==="+1any"?(a?"+1 "+a.toUpperCase():""):(a&&b?(a===b?"+2 "+a.toUpperCase():"+1 "+a.toUpperCase()+", +1 "+b.toUpperCase()):"")}
  else if(g.need)result="";
  else if(g.alt)result=specName(g.alt)+" (instead of "+specName(g.skill)+")";
  else if(g.skill)result=specName(g.skill);
  return `<div class="grant ${g.need?"need":""}"><span class="gsrc">${esc(g.src)}</span><span class="gspec">${esc(specName(g.spec))}</span><span class="gfix">${grantFix(g,D)}</span><span class="gres">${result?"→ "+esc(result):""}</span></div>`;
}

function renderWizard(){
  const w=S.wiz;const D=wizDerive(w);const st=WSTEPS[w.step][0];
  const psyOn=isPsyClass(w);
  const steps=WSTEPS.map(([k,l],i)=>{const skip=k==="psychic"&&!psyOn;const bad=(D.issues[k]||[]).length;return `<button class="wstep ${i===w.step?"on":""} ${skip?"skip":""}" data-act="wgo" data-i="${i}"><span class="wnum">${skip?"–":bad?"!":"✓"}</span>${l}</button>`}).join("");
  const body=({concept:wConcept,attributes:wAttributes,background:wBackground,skills:wSkills,class:wClass,foci:wFoci,hobby:wHobby,psychic:wPsychic,hp:wHp,equipment:wEquip,review:wReview}[st])(w,D);
  const iss=(D.issues[st]||[]);
  return `<section class="sheethead"><div class="sheethead-in" style="grid-template-columns:minmax(0,1fr) auto"><div><div class="cname">Create a Character</div><div class="csub"><span>Stars Without Number, step by step. Your progress saves on this device.</span></div></div>
    <div class="bactions"><button class="btn dk" data-act="create-mine" title="Skip the wizard and fill in a blank sheet yourself">Blank sheet instead</button><button class="btn dk" data-act="wreset">${S.confirm==="wreset"?"Click again to start over":"Start over"}</button><button class="btn dk" data-act="view" data-v="sheet">Exit</button></div></div></section>
    <div class="wiz"><nav class="frame wsteps">${steps}</nav>
    <div class="stack"><div class="frame"><div class="frame-b wbody" style="padding:18px 20px">${body}
      ${iss.length&&st!=="review"?`<div class="wissues">${iss.map(x=>`<div>• ${esc(x)}</div>`).join("")}</div>`:""}</div>
      <div class="wnav"><button class="btn" data-act="wprev" ${w.step===0?"disabled":""}>Back</button><span class="hint">Step ${w.step+1} of ${WSTEPS.length}</span>${w.step<WSTEPS.length-1?`<button class="btn pri" data-act="wnext">Next</button>`:`<span></span>`}</div></div></div></div>`;
}
const wh=(t,p)=>`<h2 class="wh">${t}</h2>${p?`<p class="wlead">${p}</p>`:""}`;

function wConcept(w){
  return wh("Who are you playing?","Your hero is an adventurer in the year 3200, leaving an old life behind to take up a starfaring one. Every character needs a reason to act: a goal that pushes them out into the sector.")+
  `<div class="grid2"><div class="field"><span class="lbl">Character name</span>${wInp("name",{live:true,ph:"e.g. Basil Hayes"})}</div><div class="field"><span class="lbl">Player name</span>${wInp("player",{live:true,ph:"Your name"})}</div>
   <div class="field"><span class="lbl">Homeworld</span>${wInp("homeworld",{live:true,ph:"Ask your GM for options"})}</div><div class="field"><span class="lbl">Species</span>${wInp("species",{live:true})}</div></div>
   <div class="field" style="margin-top:8px"><span class="lbl">Goal</span>${wInp("goal",{live:true,ph:"e.g. Be known as the greatest pilot in the sector"})}</div>
   <div class="wport">${w.portrait?`<span class="portrait hasimg"><img src="${esc(w.portrait)}" alt=""></span>`:`<span class="portrait">${esc(initials(w.name||"?"))}</span>`}<label class="btn">${w.portrait?"Change picture":"Add a picture"}<input type="file" accept="image/*" data-wportrait hidden></label>${w.portrait?`<button class="btn ghost" data-act="wset" data-path="portrait" data-v="">Remove</button>`:""}<span class="hint">Optional. Square pictures work best; it's cropped to the center.</span></div>
   <p class="hint" style="margin-top:12px">You can change all of this later. Name is required before you create the sheet.</p>`;
}
function wAttributes(w,D){
  const m=w.attrMethod;
  let h=wh("Attributes","Six scores from 3 to 18. What matters in play is the modifier: 3 is −2, 4–7 is −1, 8–13 is +0, 14–17 is +1, and 18 is +2.")+
  `<div class="seg"><button class="${m==="roll"?"on":""}" data-act="wset" data-path="attrMethod" data-v="roll">Roll 3d6 in order</button><button class="${m==="array"?"on":""}" data-act="wset" data-path="attrMethod" data-v="array">Use the standard array</button></div>`;
  if(m==="roll"){
    h+=`<p class="hint">Roll 3d6 for each attribute in order (or roll real dice and type the totals). Then you may change any one score to 14.</p><div style="margin:8px 0"><button class="btn sm" data-act="wrollall">🎲 Roll all six</button></div>`;
    h+=`<table class="wtable"><thead><tr><th>Attribute</th><th>Roll</th><th>Set to 14</th><th>Score</th><th>Mod</th></tr></thead><tbody>${ATTRS.map(([k,n])=>`<tr><td><b>${n}</b></td><td>${rollBox("rolls."+k,6,3)}</td><td><label class="toggle"><input type="radio" name="swap14" data-act="wset" data-path="swap14" data-v="${k}" ${w.swap14===k?"checked":""}>14</label></td><td class="num big2">${D.attrs[k]??"—"}</td><td class="num big2">${D.attrs[k]!=null?sgn(attrMod(D.attrs[k])):""}</td></tr>`).join("")}</tbody></table>
    ${w.swap14?`<button class="btn sm ghost" data-act="wset" data-path="swap14" data-v="">Don't change any score to 14</button>`:""}`;
  }else{
    const used=ATTRS.map(([k])=>w.arrayAssign[k]).filter(v=>v!=null&&v!=="").map(Number);
    h+=`<p class="hint">Assign 14, 12, 11, 10, 9 and 7 however you like. (With the array you can't also swap in a 14.)</p><table class="wtable"><thead><tr><th>Attribute</th><th>Value</th><th>Mod</th></tr></thead><tbody>${ATTRS.map(([k,n])=>{const cur=w.arrayAssign[k];const pool=[...ARRAY_VALUES];used.forEach(v=>{const i=pool.indexOf(v);if(i>=0)pool.splice(i,1)});const opts=[...new Set([...(cur!=null&&cur!==""?[Number(cur)]:[]),...pool])].sort((a,b)=>b-a);
      return `<tr><td><b>${n}</b></td><td>${wSel("arrayAssign."+k,opts.map(v=>[v,v]),{blank:"—",style:"max-width:90px"})}</td><td class="num big2">${D.attrs[k]!=null?sgn(attrMod(D.attrs[k])):""}</td></tr>`}).join("")}</tbody></table>`;
  }
  h+=`<div class="wnote"><b>What they do:</b> STR melee and carrying · DEX ranged attacks, AC, initiative · CON hit points, system strain · INT technical and academic skills · WIS perception, psychic Effort · CHA social skills. Background rolls may raise these later.</div>`;
  return h;
}
function wBackground(w){
  const cards=BG_ORDER.map((k,i)=>{const b=BG[k];return `<button class="bgcard ${w.bg===k?"on":""}" data-act="wset" data-path="bg" data-v="${k}"><span class="bgn">${i+1}. ${b.name}</span><span class="isub">${esc(b.tag)}</span><span class="isub">Free skill: <b>${esc(specName(b.free))}</b></span></button>`}).join("");
  return wh("Background","What did your hero do before adventuring? You get that background's free skill at level-0, plus more skills on the next step.")+
  `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px"><button class="btn sm" data-act="wrollbg">🎲 Roll d20 for a random background</button><span class="hint">or type a d20 result:</span><input class="inp n" type="number" min="1" max="20" id="w_bgnum" data-act-input="bgnum" placeholder="—"></div>
   <div class="bggrid">${cards}</div>`;
}
function wSkills(w,D){
  const bg=BG[w.bg];
  if(!bg)return wh("Background Skills")+`<div class="empty">Choose a background first.</div>`;
  const m=w.bgMethod;
  const tbl=(name,die,arr)=>`<div class="frame" style="padding:10px 12px"><div class="lbl" style="margin-bottom:4px">${name} (${die})</div>${arr.map((s,i)=>`<div class="trow"><span class="num">${i+1}</span><span>${esc(specName(s))}</span></div>`).join("")}</div>`;
  let h=wh(bg.name+" skills",(specOptions(bg.free)?"Your free skill is <b>"+esc(specName(bg.free))+"-0</b> (choose which below).":"You already have <b>"+esc(specName(bg.free))+"-0</b>.")+" Now choose how to get the rest. Taking a skill a second time raises it to level-1; nobody starts above level-1, so a third time lets you pick a different skill instead.")+
  `<div class="seg"><button class="${m==="quick"?"on":""}" data-act="wset" data-path="bgMethod" data-v="quick">Quick skills</button><button class="${m==="pick"?"on":""}" data-act="wset" data-path="bgMethod" data-v="pick">Pick 2 from Learning</button><button class="${m==="roll"?"on":""}" data-act="wset" data-path="bgMethod" data-v="roll">Roll 3 times</button></div>
  <p class="hint">${m==="quick"?"The three skills most critical to the profession, all at level-0. Easiest choice.":m==="pick"?"Choose exactly the skills you want from the Learning table (you can pick the same one twice). \"Any Skill\" entries can only be rolled.":"Split three rolls between the Growth table (d6, can raise attributes) and the Learning table (d8). Roll here or roll real dice and type the result."}</p>
  <div class="grid2" style="margin:10px 0">${tbl("Growth","d6",bg.growth)}${tbl("Learning","d8",bg.learning)}</div>`;
  if(m==="pick"){
    h+=`<div class="grid2">${w.picks.map((p,i)=>`<div class="field"><span class="lbl">Pick ${i+1}</span>${wSel("picks."+i+".idx",bg.learning.map((s,j)=>[j,(j+1)+". "+specName(s)]).filter(o=>bg.learning[o[0]]!=="any_skill"))}</div>`).join("")}</div>`;
  }
  if(m==="roll"){
    h+=`<div class="stack" style="gap:8px">${w.rollsBg.map((r,i)=>{const sides=r.table==="growth"?6:8;const tb=r.table==="growth"?bg.growth:bg.learning;const v=num(r.value,0);
      return `<div class="rollrow"><b>Roll ${i+1}</b>${wSel("rollsBg."+i+".table",[["growth","Growth (d6)"],["learning","Learning (d8)"]],{blank:null,style:"max-width:150px"})}${rollBox("rollsBg."+i+".value",sides,1)}<span class="gres">${v>=1&&v<=tb.length?"= "+esc(specName(tb[v-1])):""}</span></div>`}).join("")}</div>`;
  }
  const g=D.grants.filter(x=>x.step==="skills");
  h+=`<div class="lbl" style="margin:16px 0 6px">What you get</div><div class="grants">${g.map(x=>grantLine(x,D)).join("")||`<p class="hint">Nothing yet.</p>`}</div>`;
  h+=skillSummary(D);
  return h;
}
function skillSummary(D){
  const have=SKILLS.filter(s=>D.skills[s[0]]>=0).map(s=>`${s[1]}-${D.skills[s[0]]}`);
  const ph=PSY.filter(s=>D.psy[s[0]]>=0).map(s=>`${s[1]}-${D.psy[s[0]]}`);
  const st=D.statLog.length?`<div class="hint" style="margin-top:4px">Attribute boosts: ${D.statLog.map(([a,v,s])=>"+"+v+" "+a.toUpperCase()).join(", ")}</div>`:"";
  return `<div class="wnote"><b>Skills so far:</b> ${have.concat(ph).join(", ")||"none"}${st}</div>`;
}
function wClass(w){
  const cards=[["Warrior","Hardened combatant. Attack bonus +1 at 1st level (equal to level), +2 hit points per level, a bonus combat focus, and once per scene turn a miss into a hit or negate a hit on you."],
    ["Expert","Best at non-combat skills. A bonus non-combat focus, an extra skill point each level, and once per scene reroll a failed skill check."],
    ["Psychic","Trained to control psychic powers. Pick two psychic disciplines and fuel techniques with Effort."],
    ["Adventurer","A mix: choose two partial classes and get a weaker version of each."]];
  let h=wh("Class","Your class is your hero's best toolkit. It doesn't have to match your background; a starport clerk can be a born Warrior.")+
    `<div class="clsgrid">${cards.map(([k,d])=>`<button class="bgcard ${w.cls===k?"on":""}" data-act="wset" data-path="cls" data-v="${k}"><span class="bgn">${k}</span><span class="isub" style="font-size:13px">${esc(d)}</span></button>`).join("")}</div>`;
  if(w.cls==="Adventurer"){
    const pd={Warrior:"Bonus combat focus, +1 attack bonus at 1st and 5th level, +2 hit points per level.",Expert:"Bonus non-combat focus and an extra non-combat skill point each level.",Psychic:"One psychic discipline at level-0 with Effort; you can't learn other disciplines."};
    h+=`<div class="lbl" style="margin:14px 0 6px">Pick two partial classes</div><div class="clsgrid">${PARTIALS.map(p=>{const on=w.partials.includes(p);return `<button class="bgcard ${on?"on":""}" data-act="wpartial" data-v="${p}"><span class="bgn">Partial ${p}</span><span class="isub">${pd[p]}</span></button>`}).join("")}</div>`;
  }
  return h;
}
function focusOption(w,slot,f){return [f.key,f.name+(f.hb?" (homebrew)":"")+(focusAllowed(w,slot,f)?"":" — not allowed here")]}
function wFoci(w,D){
  const slots=focusSlots(w);
  const list=allFoci();
  let h=wh("Foci","Foci are special talents. Everyone gets one; Experts and Warriors (or their partial versions) get a bonus pick. Picking the same focus twice gives you level 2 in it.")+
    `<label class="toggle" style="margin-bottom:10px"><input type="checkbox" data-w="anyFocus" ${w.anyFocus?"checked":""}>GM approved: allow any focus in any slot</label>`;
  h+=slots.map((s,i)=>{
    const e=w.foci[i]||{};const f=focusDef(e.key);
    const groups=[["combat","Combat"],["noncombat","Non-combat"],["psychic","Psychic"],["special","Special"]];
    const sel=`<select class="inp" data-w="foci.${i}.key" id="w_foci_${i}_key"><option value="">Choose a focus…</option>${groups.map(([t,l])=>`<optgroup label="${l}">${list.filter(x=>x.type===t).map(x=>{const[v,lab]=focusOption(w,s.slot,x);return `<option value="${esc(v)}" ${e.key===v?"selected":""}>${esc(lab)}</option>`}).join("")}</optgroup>`).join("")}</select>`;
    let extra="";
    if(f&&f.skill){
      if(f.skill==="any_psychic")extra=`<div class="field" style="margin-top:6px"><span class="lbl">Psychic skill to train</span>${wSel("foci."+i+".skill",PSY.map(p=>[p[0],p[1]]))}</div>`;
      else if(specOptions(f.skill))extra=`<div class="field" style="margin-top:6px"><span class="lbl">Bonus skill: ${esc(specName(f.skill))}</span>${wSel("foci."+i+".skill",skillOpts(specOptions(f.skill)))}</div>`;
      else extra=`<p class="hint">Bonus skill: ${esc(specName(f.skill))}</p>`;
    }
    if(f&&(f.key==="unique_gift"||f.key==="wild_psychic"||f.hb))extra+=`<div class="field" style="margin-top:6px"><span class="lbl">Notes (what exactly you get)</span>${wInp("foci."+i+".note",{live:true})}</div>`;
    return `<div class="frame" style="padding:12px 14px;margin-bottom:10px"><div class="lbl" style="margin-bottom:6px">${esc(s.label)}</div>${sel}
      ${f?`<div class="feature" style="margin-top:8px"><h4>${esc(f.name)}${f.hb?` <span class="tag hb">Homebrew</span>`:""}</h4><p>${esc(f.d||"")}</p><p style="margin-top:6px"><b>Level 1:</b> ${esc(f.l1||"")}</p>${f.l2?`<p style="margin-top:4px"><b>Level 2:</b> ${esc(f.l2)}</p>`:""}</div>`:""}${extra}</div>`;
  }).join("");
  const ptNeed=D.foci.find(f=>f.needsTech);
  if(ptNeed)h+=`<div class="field"><span class="lbl">Free level-1 technique (${esc(PSYK[ptNeed.needsTech].name)})</span>${wSel("ptTech",DISC[ptNeed.needsTech].t1.map(t=>[t[0],t[0]+" — "+t[1]]))}</div>`;
  const g=D.grants.filter(x=>x.step==="foci");
  if(g.length)h+=`<div class="lbl" style="margin:14px 0 6px">Bonus skills from foci</div><div class="grants">${g.map(x=>grantLine(x,D)).join("")}</div>`;
  if(D.foci.length)h+=`<div class="wnote"><b>Your foci:</b> ${D.foci.map(f=>f.name+" "+f.level).join(", ")}</div>`;
  return h;
}
function wHobby(w,D){
  const opts=SKILLS.map(s=>s[0]);
  return wh("Bonus skill","Pick one more non-psychic skill for your hobbies, side interests, or natural talent. It's level-0, or raises a level-0 skill to level-1. You can't pick one that's already level-1.")+
    `<div class="field" style="max-width:320px">${wSel("hobby.choice",opts.map(k=>[k,SKILL[k].name+(D.skills[k]>=0?" (have "+(D.skills[k]-(w.hobby.choice===k?1:0))+")":"")]))}</div>`+(w.hobby.choice?`<div class="feature" style="margin-top:10px"><h4>${esc(SKILL[w.hobby.choice].name)}</h4><p>${esc(SKILL[w.hobby.choice].text)}</p></div>`:"")+skillSummary(D);
}
function wPsychic(w,D){
  if(!isPsyClass(w))return wh("Psychic Powers")+`<div class="empty">Only Psychics and Partial Psychics get psychic powers. Skip this step.</div>`;
  const full=w.cls==="Psychic";
  let h=wh("Psychic Powers",full?"Pick two psychic disciplines at level-0. Pick the same one twice to start at level-1 in it and get a free level-1 technique.":"As a Partial Psychic, pick one discipline at level-0. It's the only one you can ever learn.")+
    `<div class="grid2">${(full?[0,1]:[0]).map(i=>`<div class="field"><span class="lbl">${full?"Discipline pick "+(i+1):"Your discipline"}</span>${wSel("psy.picks."+i,PSY.map(p=>[p[0],p[1]]))}</div>`).join("")}</div>`;
  const chosen=[...new Set(w.psy.picks.slice(0,full?2:1).filter(Boolean))];
  h+=chosen.map(d=>`<div class="feature" style="margin-top:10px"><h4>${esc(PSYK[d].name)}: ${esc(DISC[d].core)}</h4><p>${esc(PSYK[d].text)}</p><p style="margin-top:6px"><b>Level-0 core power:</b> ${esc(DISC[d].l0)}</p></div>`).join("");
  if(full&&w.psy.picks[0]&&w.psy.picks[0]===w.psy.picks[1]){const d=w.psy.picks[0];h+=`<div class="field" style="margin-top:10px"><span class="lbl">Free level-1 technique</span>${wSel("psy.tech",DISC[d].t1.map(t=>[t[0],t[0]+" — "+t[1]]))}</div>`}
  const hi=Math.max(0,...Object.values(D.psy));const better=Math.max(D.mods.wis,D.mods.con);
  const meta=D.psy.metapsionics>=1?1:0;const pt=D.foci.some(f=>f.key==="psychic_training")?1:0;
  h+=`<div class="wnote"><b>Max Effort:</b> 1 + highest psychic skill (${hi}) + better of WIS/CON (${sgn(better)})${meta?" + Metapsionics (1)":""}${pt?" + Psychic Training (1)":""} = <b>${Math.max(1,1+hi+better+meta+pt)}</b></div>`;
  return h;
}
function wHp(w,D){
  return wh("Hit Points","Roll 1d6 and add your CON modifier"+(D.hpBonus?", plus 2 for your Warrior training":"")+". You always have at least 1 hit point.")+
   `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">${rollBox("hp.die",6,1)}</div>
   <div class="calc" style="max-width:360px"><div><span>Hit die</span><span>${w.hp.die??"—"}</span></div><div><span>CON modifier</span><span>${sgn(D.mods.con)}</span></div>${D.hpBonus?`<div><span>Warrior bonus</span><span>+2</span></div>`:""}<div><span>Max HP</span><span>${D.hp??"—"}</span></div></div>
   ${D.dieHard?`<p class="hint">Die Hard adds +2 more per level on your sheet automatically.</p>`:""}
   <div class="wnote"><b>Also calculated for you on the sheet:</b> attack bonus (${hasPartial(w,"Warrior")?"+1":"+0"} at 1st level), saving throws (15 minus your best modifier of each pair), Armor Class from your armor + DEX, and system strain (max = CON).</div>`;
}
function wEquip(w,D){
  const m=w.equip.mode;
  let h=wh("Equipment","Take a ready-made gear package, or roll 2d6 × 100 credits and buy your own gear with your GM.")+
  `<div class="seg"><button class="${m==="package"?"on":""}" data-act="wset" data-path="equip.mode" data-v="package">Equipment package</button><button class="${m==="credits"?"on":""}" data-act="wset" data-path="equip.mode" data-v="credits">Roll for credits</button></div>`;
  if(m==="package"){
    h+=`<div class="bggrid">${Object.entries(PACKAGES).map(([k,p])=>`<button class="bgcard ${w.equip.pkg===k?"on":""}" data-act="wset" data-path="equip.pkg" data-v="${k}"><span class="bgn">${p.name}</span><span class="isub">${p.items.map(([g,q])=>(q?q+" ":"")+G[g].name+(G[g].dmg?" ("+G[g].dmg+")":G[g].ac&&G[g].type==="armor"?" (AC "+G[g].ac+")":"")).join(", ")}</span><span class="isub"><b>${p.credits} credits</b></span></button>`).join("")}</div>`;
  }else{
    h+=`<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center"><span>Die 1 ${rollBox("equip.d1",6,1)}</span><span>Die 2 ${rollBox("equip.d2",6,1)}</span></div>
      <div class="calc" style="max-width:300px"><div><span>Starting credits</span><span>${D.credits??"—"}</span></div></div><p class="hint">After creating the sheet, add the gear you buy in the Inventory tab or from your GM's compendium.</p>`;
  }
  h+=`<div class="wnote">Hit bonus with a weapon = attack bonus + Shoot/Stab/Punch skill + the weapon's attribute modifier (energy weapons +1). Without even level-0 in the skill it's −2. The sheet works all of this out for you.</div>`;
  return h;
}
function wReview(w,D){
  const all=Object.entries(D.issues).filter(([k,v])=>v.length);
  const cls=w.cls==="Adventurer"?"Adventurer ("+w.partials.filter(Boolean).map(p=>"Partial "+p).join(", ")+")":w.cls||"—";
  const skills=SKILLS.filter(s=>D.skills[s[0]]>=0).map(s=>s[1]+"-"+D.skills[s[0]]).join(", ");
  const psy=PSY.filter(s=>D.psy[s[0]]>=0).map(s=>s[1]+"-"+D.psy[s[0]]).join(", ");
  return wh("Review & Create","Check everything below. Anything with a ! in the step list still needs attention.")+
  `${all.length?`<div class="wissues"><b>Still needed:</b>${all.map(([k,v])=>v.map(x=>`<div>• <button class="linkbtn" data-act="wgo" data-i="${WSTEPS.findIndex(s=>s[0]===k)}">${esc(WSTEPS.find(s=>s[0]===k)[1])}</button>: ${esc(x)}</div>`).join("")).join("")}</div>`:`<div class="wok">Everything's filled in. Ready to create.</div>`}
  <div class="grid2" style="margin-top:12px">
   <div class="calc" style="margin:0">${ATTRS.map(([k,n])=>`<div><span>${n}</span><span>${D.final[k]??"—"} (${D.final[k]!=null?sgn(D.mods[k]):"—"})</span></div>`).join("")}</div>
   <div class="calc" style="margin:0"><div><span>Name</span><span>${esc(w.name||"—")}</span></div><div><span>Background</span><span>${esc(BG[w.bg]?.name||"—")}</span></div><div><span>Class</span><span>${esc(cls)}</span></div><div><span>Foci</span><span>${esc(D.foci.map(f=>f.name+" "+f.level).join(", ")||"—")}</span></div><div><span>Max HP</span><span>${D.hp??"—"}</span></div><div><span>Gear</span><span>${esc(w.equip.mode==="package"?(PACKAGES[w.equip.pkg]?.name||"—")+" package":(D.credits??"—")+" credits")}</span></div></div>
  </div>
  <div class="wnote"><b>Skills:</b> ${esc(skills||"none")}${psy?`<br><b>Psychic:</b> ${esc(psy)}`:""}${D.techniques.length?`<br><b>Techniques:</b> ${esc(D.techniques.map(t=>t[1]).join(", "))}`:""}</div>
  <div style="margin-top:14px;display:flex;gap:10px;align-items:center"><button class="btn pri" data-act="wcreate" ${all.length?"disabled":""} style="padding:10px 18px;font-size:15px">Create character</button>${all.length?`<span class="hint">Fix the items above first.</span>`:""}</div>`;
}

function wizToSheet(w,D){
  const c=newCharacter(w.name.trim());
  Object.assign(c,{player:w.player,homeworld:w.homeworld,species:w.species||"Human",goal:w.goal,background:BG[w.bg].name,
    class:w.cls,partials:w.cls==="Adventurer"?[...w.partials]:["Warrior","Expert"],level:1,xp:0,attrs:{...D.final},
    skills:{...D.skills},psy:{...D.psy},hp:{cur:D.hp,max:D.hp}});
  c.foci=D.foci.map(f=>({id:rid(),key:f.key,name:f.name,level:f.level,skill:f.skill||"",text:f.note||""}));
  c.techniques=D.techniques.map(([d,t])=>({disc:d,name:t}));
  if(w.equip.mode==="package"){const p=PACKAGES[w.equip.pkg];c.inventory=p.items.map(([g,q])=>gearItem(g,q));c.credits=p.credits;
    const armors=c.inventory.filter(i=>i.type==="armor").sort((a,b)=>num(b.ac)-num(a.ac));armors.slice(1).forEach(a=>a.location="stowed")}
  else{c.inventory=[];c.credits=D.credits}
  c.features=c.techniques.length?"Psychic techniques: "+c.techniques.map(t=>t.name+" ("+PSYK[t.disc].name+")").join(", "):"";
  if(w.portrait)c.portrait=w.portrait;
  c.creation={method:w.attrMethod,bgMethod:w.bgMethod,at:Date.now()};
  return c;
}
function wizAction(act,t){
  const w=S.wiz;
  switch(act){
    case "wgo":w.step=num(t.dataset.i);saveWiz();render();window.scrollTo({top:0});return true;
    case "wnext":{let n=w.step+1;if(WSTEPS[n]&&WSTEPS[n][0]==="psychic"&&!isPsyClass(w))n++;w.step=Math.min(WSTEPS.length-1,n);saveWiz();render();window.scrollTo({top:0});return true}
    case "wprev":{let n=w.step-1;if(WSTEPS[n]&&WSTEPS[n][0]==="psychic"&&!isPsyClass(w))n--;w.step=Math.max(0,n);saveWiz();render();window.scrollTo({top:0});return true}
    case "wset":{let v=t.dataset.v;wset(t.dataset.path,v);if(t.dataset.path==="cls"&&v!=="Adventurer")w.partials=["",""];render();return true}
    case "wpartial":{const p=t.dataset.v;let ps=w.partials.filter(Boolean);if(ps.includes(p))ps=ps.filter(x=>x!==p);else{ps.push(p);if(ps.length>2)ps.shift()}w.partials=[ps[0]||"",ps[1]||""];saveWiz();render();return true}
    case "wroll":{const n=num(t.dataset.n,1),s=num(t.dataset.sides,6);const dice=Array.from({length:n},()=>rand(s));wset(t.dataset.path,dice.reduce((a,b)=>a+b,0));w.rollDice[t.dataset.path]=dice;saveWiz();render();return true}
    case "wrollall":{ATTRS.forEach(([k])=>{const d=[rand(6),rand(6),rand(6)];w.rolls[k]=d[0]+d[1]+d[2];w.rollDice["rolls."+k]=d});saveWiz();render();return true}
    case "wrollbg":{const v=rand(20);w.bg=BG_ORDER[v-1];saveWiz();toastMsg("Rolled "+v+": "+BG[w.bg].name);render();return true}
    case "wreset":if(S.confirm!=="wreset"){S.confirm="wreset";render();return true}S.confirm=null;S.wiz=newWiz();saveWiz();render();return true;
    case "wcreate":{const D=wizDerive(w);if(Object.values(D.issues).some(v=>v.length))return true;
      const c=wizToSheet(w,D);const p=S.offline?"local/"+rid():"sheets/"+rid();
      createDoc(p,{...c,owners:S.offline?[]:[S.me]});if(S.offline)S.exists[p]=true;
      S.wiz=newWiz();saveWiz();S.current=p;S.view="sheet";S.edit=false;S.tab="actions";try{localStorage.setItem("swn.current",p)}catch(e){}
      toastMsg((c.name||"Your character")+" is ready!");render();window.scrollTo({top:0});return true}
  }
  return false;
}
function wizInput(el,isLive){
  const p=el.dataset.w;let v;
  if(el.type==="checkbox")v=el.checked;
  else if(el.dataset.num!==undefined)v=el.value===""?null:num(el.value);
  else v=el.value;
  wset(p,v);
  if(el.dataset.num!==undefined)delete S.wiz.rollDice[p];
  if(/^foci\.\d+\.key$/.test(p)){const i=p.split(".")[1];S.wiz.foci[i]={key:v,skill:"",alt:"",note:""};saveWiz()}
  if(p==="attrMethod"){}
  if(!isLive)render();
}
