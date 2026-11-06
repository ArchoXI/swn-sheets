/* ================= LEVEL-UP WIZARD ================= */
const SKILL_MIN_LEVEL=[1,1,3,6,9];      // character level needed for skill level 0..4
const BOOST_MIN_LEVEL=[1,1,3,6,9];      // for the 1st..5th attribute boost
const FOCUS_LEVELS=[2,5,7,10];
const LU_STEPS=[["overview","Overview"],["hp","Hit Points"],["focus","New Focus"],["skills","Skill Points"],["review","Review & Apply"]];
const isCombatSkill=k=>COMBAT_SKILLS.includes(k);
const psyRestricted=c=>c.class==="Adventurer"&&(c.partials||[]).includes("Psychic");
const psyDiscOf=c=>PSY.map(p=>p[0]).find(k=>num(c.psy?.[k],-1)>=0)||"";
const hasPartialC=(c,p)=>c.class===p||(c.class==="Adventurer"&&(c.partials||[]).includes(p));

function newLU(path){return {path,step:0,dice:[],spends:[],freeTechs:{},focus:{mode:"",entry:"",key:"",skill:"",note:""}}}
function luGet(p){return getPath(S.lu,p)}
function luSet(p,v){setPathV(S.lu,p,v)}

function luDerive(c,lu){
  const R=compute(c);const L0=num(c.level,1);const L=L0+1;
  const D={issues:{},R,L0,L,log:[]};
  const issue=(st,m)=>{(D.issues[st]=D.issues[st]||[]).push(m)};
  D.xpNeed=XP_TABLE[L0]??(93+24*(L-10));D.xpOk=num(c.xp)>=D.xpNeed;
  // ---- hit points
  const con=R.mod.con;D.con=con;D.warrior=hasPartialC(c,"Warrior");
  const dice=Array.from({length:L},(_,i)=>lu.dice[i]);
  D.diceMissing=dice.some(d=>!(num(d,0)>=1&&num(d,0)<=6));
  if(D.diceMissing)issue("hp","Roll or enter all "+L+" hit dice.");
  D.dieVals=dice.map(d=>Math.max(1,num(d,0)+con));
  D.hpRoll=D.dieVals.reduce((a,b)=>a+b,0)+(D.warrior?2*L:0);
  D.oldMax=num(c.hp?.max);
  D.newMax=D.diceMissing?null:(D.hpRoll>D.oldMax?D.hpRoll:D.oldMax+1);
  D.hpTook=D.diceMissing?null:D.hpRoll>D.oldMax;
  // ---- working copies
  const W={skills:clone(c.skills||{}),psy:clone(c.psy||{}),attrs:clone(c.attrs||{}),credit:clone(c.skillCredit||{}),boosts:num(c.attrBoosts),techs:clone(c.techniques||[]),foci:clone(c.foci||[])};
  SKILLS.forEach(([k])=>{if(W.skills[k]==null)W.skills[k]=-1});PSY.forEach(([k])=>{if(W.psy[k]==null)W.psy[k]=-1});
  D.W=W;D.psyGains=[];// [disc, newLevel]
  const restricted=psyRestricted(c);const myDisc=psyDiscOf(c);
  D.isPsychic=isPsy(c);D.restricted=restricted;D.myDisc=myDisc;
  const addPoints=(isP,key,pts)=>{ // focus bonus: 3 points toward a skill, ignoring level minimums
    const map=isP?W.psy:W.skills;pts+=num(W.credit[key]);
    while(map[key]<4){const cost=map[key]+2;if(pts>=cost){map[key]+=1;pts-=cost;if(isP)D.psyGains.push([key,map[key]])}else break}
    W.credit[key]=pts;if(!pts)delete W.credit[key];
  };
  // ---- focus
  D.focusEligible=FOCUS_LEVELS.includes(L);
  if(D.focusEligible){
    const f=lu.focus;
    if(f.mode==="raise"){
      const e=W.foci.find(x=>x.id===f.entry);const def=e?resolveFocus(e):null;
      if(!e)issue("focus","Choose which focus to raise.");
      else if(num(e.level,1)>=2||!def.l2)issue("focus",(def.name||"That focus")+" can't go higher.");
      else{e.level=2;D.focusText=def.name+" → level 2"}
    }else if(f.mode==="new"){
      const def=focusDef(f.key);
      if(!def)issue("focus","Choose a new focus.");
      else{
        const dup=W.foci.some(x=>x.key===f.key&&(f.key!=="specialist"||x.skill===f.skill));
        if(dup)issue("focus","You already have "+def.name+(f.key==="specialist"?" for that skill":"")+". Raise it instead.");
        if(f.key==="psychic_training"&&!D.isPsychic)issue("focus","Psychic Training needs the Psychic class or Partial Psychic.");
        if(f.key==="wild_psychic"&&D.isPsychic)issue("focus","Psychics can't take Wild Psychic Talent.");
        let sk=def.skill;
        if(sk&&specOptions(sk)){sk=f.skill;if(!sk)issue("focus",def.name+": choose its bonus skill.")}
        if(f.key==="psychic_training"&&restricted&&sk&&sk!==myDisc)issue("focus","Partial Psychics can only train their own discipline.");
        W.foci.push({id:rid(),key:f.key,name:def.name,level:1,skill:(f.key==="specialist"||specOptions(def.skill))?(f.skill||""):"",text:f.note||""});
        if(sk&&(SKILL[sk]||PSYK[sk]))addPoints(!!PSYK[sk],sk,3);
        D.focusText=def.name+" level 1"+(sk&&(SKILL[sk]||PSYK[sk])?" (+3 points toward "+specName(sk)+")":"");
      }
    }else issue("focus","Pick a new focus or raise one you have.");
  }
  // ---- skill points
  const gTot=3+num(c.spSaved),eTot=(hasPartialC(c,"Expert")?1:0)+num(c.spSavedExpert);
  let g=gTot,e=eTot,gPsy=0;D.gTot=gTot;D.eTot=eTot;
  D.spendResults=lu.spends.map(sp=>{
    const r={...sp,ok:false};
    const pay=(cost,mundaneNoncombat,psychic)=>{
      let fromE=0;if(mundaneNoncombat){fromE=Math.min(e,cost)}
      const fromG=cost-fromE;if(fromG>g){r.err="Not enough points";return false}
      e-=fromE;g-=fromG;if(psychic)gPsy+=fromG;r.cost=cost;return true;
    };
    if(sp.t==="skill"||sp.t==="psy"){
      const isP=sp.t==="psy";const map=isP?W.psy:W.skills;const next=map[sp.k]+1;
      if(next>4){r.err="Already level-4";return r}
      if(L<SKILL_MIN_LEVEL[next]){r.err="Needs character level "+SKILL_MIN_LEVEL[next];return r}
      if(isP&&restricted&&myDisc&&sp.k!==myDisc){r.err="Partial Psychics can only raise "+PSYK[myDisc].name;return r}
      if(isP&&!D.isPsychic){r.err="Only psychics can learn psychic skills";return r}
      const cr=num(W.credit[sp.k]);const cost=Math.max(0,next+1-cr);
      if(!pay(cost,!isP&&!isCombatSkill(sp.k),isP))return r;
      if(cr)delete W.credit[sp.k];
      map[sp.k]=next;r.ok=true;r.desc=specName(sp.k)+"-"+next;if(isP)D.psyGains.push([sp.k,next]);
    }else if(sp.t==="attr"){
      if(W.boosts>=5){r.err="Max five boosts";return r}
      if(L<BOOST_MIN_LEVEL[W.boosts]){r.err="Boost #"+(W.boosts+1)+" needs level "+BOOST_MIN_LEVEL[W.boosts];return r}
      if(num(W.attrs[sp.k],10)>=18){r.err="Already 18";return r}
      if(!pay(W.boosts+1,false,false))return r;
      W.boosts+=1;W.attrs[sp.k]=num(W.attrs[sp.k],10)+1;r.ok=true;r.desc="+1 "+sp.k.toUpperCase();
    }else if(sp.t==="tech"){
      const T=(TECHS[sp.d]||[]).find(x=>x[0]===sp.k);
      if(!T){r.err="Unknown technique";return r}
      if(W.psy[sp.d]<T[1]){r.err="Needs "+PSYK[sp.d].name+"-"+T[1];return r}
      if(W.techs.some(x=>x.name===sp.k)){r.err="Already known";return r}
      if(!pay(T[1],false,true))return r;
      W.techs.push({disc:sp.d,name:sp.k});r.ok=true;r.desc=sp.k;
    }
    return r;
  });
  D.spendResults.filter(r=>!r.ok).forEach(r=>issue("skills",(r.desc||specName(r.k)||r.k)+": "+r.err+". Remove it from the list."));
  D.gLeft=g;D.eLeft=e;
  if(D.isPsychic&&gPsy<1&&g<1)issue("skills","Psychics must put at least 1 skill point into psychic skills or techniques (or save one for later).");
  // ---- free techniques for each psychic level gained
  D.freeNeeded=D.psyGains.map(([d,lv])=>{
    const slot=d+":"+lv;const pick=lu.freeTechs[slot];
    const opts=(TECHS[d]||[]).filter(t=>t[1]<=lv&&!W.techs.some(x=>x.name===t[0])&&!Object.entries(lu.freeTechs).some(([s,n])=>s!==slot&&n===t[0]));
    if(pick&&!(TECHS[d]||[]).some(t=>t[0]===pick&&t[1]<=lv))return {slot,d,lv,opts,pick:""};
    return {slot,d,lv,opts,pick};
  });
  D.freeNeeded.forEach(f=>{if(f.pick)W.techs.push({disc:f.d,name:f.pick});else if(f.opts.length)issue("skills",PSYK[f.d].name+" reached level-"+f.lv+": pick your free technique.")});
  return D;
}

function luRollBox(p,label){
  const v=luGet(p);
  return `<span class="rollpair"><span class="hint" style="min-width:42px">${label}</span><button class="btn sm" data-act="luroll" data-path="${esc(p)}">🎲</button><input id="lu_${p.replace(/\W/g,"_")}" class="inp n" type="number" min="1" max="6" data-lu="${esc(p)}" data-num value="${esc(v??"")}" placeholder="—"></span>`;
}
function luSel(p,opts,{blank="Choose…",style=""}={}){
  const v=luGet(p);
  return `<select id="lu_${p.replace(/\W/g,"_")}" class="inp" data-lu="${esc(p)}" style="${style}">${blank!=null?`<option value="">${esc(blank)}</option>`:""}${opts.map(([val,l])=>`<option value="${esc(val)}" ${String(v??"")===String(val)?"selected":""}>${esc(l)}</option>`).join("")}</select>`;
}

function renderLevelUp(){
  const lu=S.lu;const c=S.docs[lu.path];
  if(!c){S.view="sheet";return renderSheet()}
  const D=luDerive(c,lu);
  const steps=LU_STEPS.filter(s=>s[0]!=="focus"||D.focusEligible);
  if(lu.step>=steps.length)lu.step=steps.length-1;
  const st=steps[lu.step][0];
  const nav=steps.map(([k,l],i)=>{const bad=(D.issues[k]||[]).length;return `<button class="wstep ${i===lu.step?"on":""}" data-act="lugo" data-i="${i}"><span class="wnum">${bad?"!":"✓"}</span>${l}</button>`}).join("");
  const body={overview:luOverview,hp:luHp,focus:luFocus,skills:luSkills,review:luReview}[st](c,lu,D);
  const iss=D.issues[st]||[];
  return `<section class="sheethead"><div class="sheethead-in" style="grid-template-columns:auto minmax(0,1fr) auto">${portraitHtml(c,"portrait")}<div><div class="cname">Level up: ${esc(c.name||"Character")}</div><div class="csub"><span>Level ${D.L0} → <b>Level ${D.L}</b></span><span>${esc(className(c))}</span></div></div>
    <div class="bactions"><button class="btn dk" data-act="lucancel">Cancel</button></div></div></section>
    <div class="wiz"><nav class="frame wsteps">${nav}</nav><div class="stack"><div class="frame"><div class="frame-b wbody" style="padding:18px 20px">${body}
      ${iss.length&&st!=="review"?`<div class="wissues">${iss.map(x=>`<div>• ${esc(x)}</div>`).join("")}</div>`:""}</div>
      <div class="wnav"><button class="btn" data-act="luprev" ${lu.step===0?"disabled":""}>Back</button><span class="hint">Step ${lu.step+1} of ${steps.length}</span>${lu.step<steps.length-1?`<button class="btn pri" data-act="lunext">Next</button>`:`<span></span>`}</div></div></div></div>`;
}
function luOverview(c,lu,D){
  const sv=n=>`${n} → ${n-1}`;
  return wh("Reaching level "+D.L,"Everything that comes with the new level is listed below. Nothing on the sheet changes until you click Apply at the end.")+
  `${D.xpOk?`<div class="wok">${num(c.xp)} XP: enough for level ${D.L} (needs ${D.xpNeed}).</div>`:`<div class="wissues"><b>Not enough XP yet:</b> ${num(c.xp)} of ${D.xpNeed} needed for level ${D.L}. ${S.isGM||S.offline?"As GM you can level them up anyway.":"Ask your GM to award XP first."}</div>`}
  <div class="calc" style="max-width:520px">
    <div><span>Hit points</span><span>re-roll ${D.L}d6${D.con?" "+sgn(D.con)+" each":""}${D.warrior?" + "+2*D.L:""}</span></div>
    <div><span>Attack bonus</span><span>${sgn(D.R.bab)} → ${sgn(c.class==="Warrior"?D.L:Math.floor(D.L/2)+(hasPartialC(c,"Warrior")&&c.class==="Adventurer"?(D.L>=5?2:1):0))}</span></div>
    <div><span>Saving throws</span><span>all improve by 1 (Physical ${sv(D.R.save.physical)})</span></div>
    <div><span>Skill points</span><span>3${D.eTot-num(c.spSavedExpert)?" + 1 non-combat (Expert)":""}${num(c.spSaved)+num(c.spSavedExpert)?" + "+(num(c.spSaved)+num(c.spSavedExpert))+" saved":""}</span></div>
    <div><span>New focus</span><span>${D.focusEligible?"Yes, at level "+D.L:"No (next at level "+(FOCUS_LEVELS.find(x=>x>D.L)||"—")+")"}</span></div>
    ${D.isPsychic?`<div><span>Psychic</span><span>a free technique for each psychic skill level gained</span></div>`:""}
  </div>
  <div class="wnote"><b>How skill points work:</b> raising a skill costs its new level + 1 (level-0 costs 1, level-1 costs 2, level-2 costs 3…). Level-2 needs character level 3, level-3 needs 6, level-4 needs 9. Attribute boosts cost 1, 2, 3, 4, then 5 points. Unspent points are saved for later.</div>`;
}
function luHp(c,lu,D){
  return wh("Hit points","Roll "+D.L+"d6 and add your CON modifier ("+sgn(D.con)+") to each die; no die can go below 1."+(D.warrior?" Warrior training adds "+2*D.L+".":"")+" If the total beats your current maximum ("+D.oldMax+"), you take it. Otherwise your maximum goes up by 1.")+
  `<div style="margin-bottom:10px"><button class="btn sm" data-act="lurollall">🎲 Roll all ${D.L} dice</button> <span class="hint">or roll real dice and type each one</span></div>
   <div class="ludice">${Array.from({length:D.L},(_,i)=>luRollBox("dice."+i,"Die "+(i+1))).join("")}</div>
   <div class="calc" style="max-width:380px"><div><span>Dice with CON</span><span>${D.diceMissing?"—":D.dieVals.join(" + ")}</span></div>${D.warrior?`<div><span>Warrior bonus</span><span>+${2*D.L}</span></div>`:""}<div><span>Rolled total</span><span>${D.diceMissing?"—":D.hpRoll}</span></div><div><span>Current max</span><span>${D.oldMax}</span></div><div><span>New max HP</span><span>${D.newMax??"—"}${D.hpTook===false?" (old max + 1)":""}</span></div></div>
   ${hasFocus(D.R,"die_hard")?`<p class="hint">Die Hard's +2 per level is added on top automatically.</p>`:""}`;
}
function luFocus(c,lu,D){
  const f=lu.focus;const existing=(c.foci||[]).map(e=>({e,r:resolveFocus(e)})).filter(x=>x.r&&x.r.level<2&&x.r.l2);
  const list=allFoci().filter(x=>!(c.foci||[]).some(e=>e.key===x.key&&x.key!=="specialist"));
  const def=f.mode==="new"?focusDef(f.key):null;
  let h=wh("New focus","At levels 2, 5, 7 and 10 you can raise a focus you have to level 2, or take level 1 of a new one. A new focus's bonus skill counts as 3 skill points toward that skill, even past the usual level limits.")+
   `<div class="seg"><button class="${f.mode==="new"?"on":""}" data-act="luset" data-path="focus.mode" data-v="new">Take a new focus</button><button class="${f.mode==="raise"?"on":""}" data-act="luset" data-path="focus.mode" data-v="raise" ${existing.length?"":"disabled"}>Raise one to level 2</button></div>`;
  if(f.mode==="raise")h+=`<div class="field" style="max-width:360px">${luSel("focus.entry",existing.map(x=>[x.e.id,x.r.name]))}</div>`+(existing.find(x=>x.e.id===f.entry)?`<div class="feature" style="margin-top:8px"><h4>Level 2</h4><p>${esc(existing.find(x=>x.e.id===f.entry).r.l2)}</p></div>`:"");
  if(f.mode==="new"){
    const groups=[["combat","Combat"],["noncombat","Non-combat"],["psychic","Psychic"],["special","Special"]];
    h+=`<select class="inp" id="lu_focus_key" data-lu="focus.key"><option value="">Choose a focus…</option>${groups.map(([t,l])=>`<optgroup label="${l}">${list.filter(x=>x.type===t).map(x=>`<option value="${esc(x.key)}" ${f.key===x.key?"selected":""}>${esc(x.name+(x.hb?" (homebrew)":""))}</option>`).join("")}</optgroup>`).join("")}</select>`;
    if(def){
      h+=`<div class="feature" style="margin-top:8px"><h4>${esc(def.name)}</h4><p>${esc(def.d||"")}</p><p style="margin-top:6px"><b>Level 1:</b> ${esc(def.l1||"")}</p></div>`;
      if(def.skill&&specOptions(def.skill))h+=`<div class="field" style="margin-top:6px;max-width:320px"><span class="lbl">Bonus skill: ${esc(specName(def.skill))}</span>${luSel("focus.skill",skillOpts(specOptions(def.skill)))}</div>`;
      else if(def.skill)h+=`<p class="hint">Bonus skill: ${esc(specName(def.skill))} (+3 skill points toward it)</p>`;
      if(def.key==="unique_gift"||def.key==="wild_psychic"||def.hb)h+=`<div class="field" style="margin-top:6px"><span class="lbl">Notes</span><input class="inp" id="lu_focus_note" data-lu="focus.note" data-lulive value="${esc(f.note||"")}"></div>`;
    }
  }
  if(D.focusText)h+=`<div class="wnote"><b>Result:</b> ${esc(D.focusText)}</div>`;
  return h;
}
function luSkills(c,lu,D){
  const W=D.W;
  const spentOf=(t,k)=>lu.spends.filter(s=>s.t===t&&s.k===k).length;
  const avail=(t,k)=>D.gLeft+((t==="skill"&&!isCombatSkill(k))?D.eLeft:0);
  const btn=(t,k,label,cost,extra="")=>cost>avail(t,k)?`<button class="btn sm" disabled title="Not enough points">${label}</button>`:`<button class="btn sm" data-act="luspend" data-t="${t}" data-k="${esc(k)}" ${extra}>${label}</button>`;
  const undo=(t,k)=>spentOf(t,k)?`<button class="iconbtn" data-act="luundo" data-t="${t}" data-k="${esc(k)}" aria-label="Undo">−</button>`:"";
  const nextCost=(isP,k)=>{const map=isP?W.psy:W.skills;const n=map[k]+1;if(n>4)return [null,"maxed"];if(D.L<SKILL_MIN_LEVEL[n])return [null,"needs character level "+SKILL_MIN_LEVEL[n]];return [Math.max(0,n+1-num(W.credit[k])),null]};
  const skRows=SKILLS.map(([k,n])=>{const [cost,why]=nextCost(false,k);const was=num(c.skills?.[k],-1);const now=W.skills[k];
    return `<tr><td><b>${n}</b>${!isCombatSkill(k)&&D.eTot?` <span class="tag" title="Expert point can pay for this">non-combat</span>`:""}</td><td class="num">${was<0?"—":was}${now!==was?` → <b style="color:var(--good)">${now}</b>`:""}${W.credit[k]?` <span class="hint">(${W.credit[k]} pt credit)</span>`:""}</td><td style="text-align:right;white-space:nowrap">${undo("skill",k)} ${cost!=null?btn("skill",k,"+ level "+(now+1)+" ("+cost+" pt)",cost):`<span class="hint">${why}</span>`}</td></tr>`}).join("");
  const boostCost=W.boosts+1,boostGate=W.boosts>=5?"max 5 boosts":D.L<BOOST_MIN_LEVEL[W.boosts]?"next boost at level "+BOOST_MIN_LEVEL[W.boosts]:null;
  const atRows=ATTRS.map(([k,n])=>{const was=num(c.attrs?.[k],10);const now=W.attrs[k];return `<div class="atbox"><b>${k.toUpperCase()}</b><span class="num">${was}${now!==was?` → <b style="color:var(--good)">${now}</b>`:""}</span><span>${undo("attr",k)}${boostGate||now>=18?"":btn("attr",k,"+1",boostCost)}</span></div>`}).join("");
  let psyHtml="";
  if(D.isPsychic){
    const discs=PSY.filter(([k])=>!D.restricted||!D.myDisc||k===D.myDisc);
    psyHtml=`<div class="lbl" style="margin:16px 0 6px;color:var(--info)">Psychic skills${D.restricted?" (Partial Psychic: "+(D.myDisc?PSYK[D.myDisc].name+" only":"one discipline")+")":""}</div>
    <table class="wtable"><tbody>${discs.map(([k,n])=>{const [cost,why]=nextCost(true,k);const was=num(c.psy?.[k],-1);const now=W.psy[k];return `<tr><td><b>${n}</b></td><td class="num">${was<0?"—":was}${now!==was?` → <b style="color:var(--good)">${now}</b>`:""}</td><td style="text-align:right;white-space:nowrap">${undo("psy",k)} ${cost!=null?btn("psy",k,"+ level "+(now+1)+" ("+cost+" pt)",cost):`<span class="hint">${why}</span>`}</td></tr>`}).join("")}</tbody></table>`;
    const learnable=discs.filter(([k])=>W.psy[k]>=1).flatMap(([d])=>TECHS[d].filter(t=>t[1]<=W.psy[d]).map(t=>({d,t})));
    psyHtml+=`<div class="lbl" style="margin:14px 0 6px;color:var(--info)">Buy techniques (cost = technique level)</div>${learnable.length?`<div class="techlist">${learnable.map(({d,t})=>{const known=(c.techniques||[]).some(x=>x.name===t[0]);const bought=lu.spends.some(s=>s.t==="tech"&&s.k===t[0]);const free=Object.values(lu.freeTechs).includes(t[0]);
      return `<div class="techrow ${known||bought||free?"have":""}"><div><b>${esc(t[0])}</b> <span class="tag">${esc(PSYK[d].name)} ${t[1]}</span><div class="hint">${esc(t[2])}</div></div><div>${known?`<span class="hint">known</span>`:free?`<span class="hint">free pick</span>`:bought?`<button class="iconbtn" data-act="luundo" data-t="tech" data-k="${esc(t[0])}">−</button>`:(t[1]>D.gLeft?`<button class="btn sm" disabled title="Not enough points">Learn (${t[1]} pt)</button>`:`<button class="btn sm" data-act="luspend" data-t="tech" data-d="${d}" data-k="${esc(t[0])}">Learn (${t[1]} pt)</button>`)}</div></div>`}).join("")}</div>`:`<p class="hint">Raise a discipline to level-1 or higher to buy techniques from it.</p>`}`;
  }
  const free=D.freeNeeded.length?`<div class="lbl" style="margin:16px 0 6px;color:var(--accent)">Free techniques</div>${D.freeNeeded.map(f=>`<div class="field" style="margin-bottom:8px"><span class="lbl">${esc(PSYK[f.d].name)} reached level-${f.lv}: pick one technique of level ${f.lv} or lower</span>${f.opts.length||f.pick?luSel("freeTechs."+f.slot,[...(f.pick&&!f.opts.some(o=>o[0]===f.pick)?[[f.pick,f.pick]]:[]),...f.opts.map(t=>[t[0],t[0]+" ("+t[1]+") — "+t[2]])]):`<p class="hint">You already know every technique available.</p>`}</div>`).join("")}`:"";
  return wh("Skill points","Spend your points, or leave some unspent to save for later. Click − to undo a purchase.")+
   `<div class="pools"><div class="pool"><span class="lbl">General points</span><span class="big2">${D.gLeft} <small class="hint">of ${D.gTot} left</small></span></div>${D.eTot?`<div class="pool"><span class="lbl">Expert point (non-combat, non-psychic)</span><span class="big2">${D.eLeft} <small class="hint">of ${D.eTot} left</small></span></div>`:""}</div>
   <div class="lbl" style="margin:14px 0 6px">Attributes <span class="hint" style="text-transform:none;letter-spacing:0;font-weight:400">· boost #${W.boosts+1} costs ${boostCost} pt${boostGate?" ("+boostGate+")":""}</span></div><div class="atgrid">${atRows}</div>
   <div class="lbl" style="margin:16px 0 6px">Skills</div><table class="wtable"><tbody>${skRows}</tbody></table>${psyHtml}${free}`;
}
function luReview(c,lu,D){
  const all=Object.entries(D.issues).filter(([k,v])=>v.length);
  const steps=LU_STEPS.filter(s=>s[0]!=="focus"||D.focusEligible);
  const gate=!D.xpOk&&!(S.isGM||S.offline);
  const bought=D.spendResults.filter(r=>r.ok).map(r=>r.desc+" ("+r.cost+")");
  const free=D.freeNeeded.filter(f=>f.pick).map(f=>f.pick+" (free)");
  return wh("Review & apply","This is what will change on the sheet.")+
  `${all.length?`<div class="wissues"><b>Still needed:</b>${all.map(([k,v])=>v.map(x=>`<div>• <button class="linkbtn" data-act="lugo" data-i="${steps.findIndex(s=>s[0]===k)}">${esc((steps.find(s=>s[0]===k)||[,k])[1])}</button>: ${esc(x)}</div>`).join("")).join("")}</div>`:`<div class="wok">All steps are complete.</div>`}
  ${gate?`<div class="wissues">You need ${D.xpNeed} XP to reach level ${D.L} (you have ${num(c.xp)}). Ask your GM.</div>`:""}
  <div class="calc" style="max-width:560px">
    <div><span>Level</span><span>${D.L0} → ${D.L}</span></div>
    <div><span>Max HP (rolled)</span><span>${D.oldMax} → ${D.newMax??"—"}</span></div>
    ${D.focusEligible?`<div><span>Focus</span><span>${esc(D.focusText||"—")}</span></div>`:""}
    <div><span>Bought</span><span>${esc(bought.join(", ")||"nothing")}</span></div>
    ${free.length?`<div><span>Free techniques</span><span>${esc(free.join(", "))}</span></div>`:""}
    <div><span>Saved for later</span><span>${D.gLeft+D.eLeft} point${D.gLeft+D.eLeft===1?"":"s"}</span></div>
  </div>
  <p class="hint">Current HP goes up by the same amount as your max. Attack bonus and saves update automatically.</p>
  <button class="btn pri" data-act="luapply" ${all.length||gate?"disabled":""} style="padding:10px 18px;font-size:15px">Apply level ${D.L}</button>`;
}
function luApply(){
  const lu=S.lu;const c=S.docs[lu.path];if(!c)return;const D=luDerive(c,lu);
  if(Object.values(D.issues).some(v=>v.length))return;
  if(!D.xpOk&&!(S.isGM||S.offline))return;
  const p=lu.path,W=D.W;
  const delta=D.newMax-D.oldMax;
  setField(p,"level",D.L);
  setField(p,"hp",{cur:num(c.hp?.cur)+delta,max:D.newMax});
  setField(p,"skills",W.skills);setField(p,"psy",W.psy);setField(p,"attrs",W.attrs);
  setField(p,"skillCredit",W.credit);setField(p,"attrBoosts",W.boosts);
  setField(p,"techniques",W.techs);setField(p,"foci",W.foci);
  setField(p,"spSaved",D.gLeft);setField(p,"spSavedExpert",D.eLeft);
  const log=c.levelLog||[];log.push({level:D.L,hp:D.newMax,at:Date.now(),bought:D.spendResults.filter(r=>r.ok).map(r=>r.desc),focus:D.focusText||""});setField(p,"levelLog",log);
  S.lu=null;S.view="sheet";S.current=p;
  emitRoll(c,"reached level "+D.L+"!",[{name:"New max HP",dice:[],parts:[],total:D.newMax,note:D.hpTook?"rolled higher":"old max + 1"}]);
  render();window.scrollTo({top:0});
}
function luAction(act,t){
  const lu=S.lu;if(!lu)return false;
  const c=S.docs[lu.path];const D=c?luDerive(c,lu):null;
  const steps=D?LU_STEPS.filter(s=>s[0]!=="focus"||D.focusEligible):LU_STEPS;
  switch(act){
    case "lugo":lu.step=num(t.dataset.i);render();window.scrollTo({top:0});return true;
    case "lunext":lu.step=Math.min(steps.length-1,lu.step+1);render();window.scrollTo({top:0});return true;
    case "luprev":lu.step=Math.max(0,lu.step-1);render();window.scrollTo({top:0});return true;
    case "lucancel":S.lu=null;S.view="sheet";render();return true;
    case "luset":luSet(t.dataset.path,t.dataset.v);render();return true;
    case "luroll":luSet(t.dataset.path,rand(6));render();return true;
    case "lurollall":{const n=num(c.level,1)+1;lu.dice=Array.from({length:n},()=>rand(6));render();return true}
    case "luspend":{lu.spends.push({t:t.dataset.t,k:t.dataset.k,d:t.dataset.d||""});const r=luDerive(c,lu).spendResults.slice(-1)[0];if(!r||!r.ok){lu.spends.pop();toastMsg((r&&r.err)||"Can't buy that.",true)}render();return true}
    case "luundo":{for(let i=lu.spends.length-1;i>=0;i--){if(lu.spends[i].t===t.dataset.t&&lu.spends[i].k===t.dataset.k){lu.spends.splice(i,1);break}}render();return true}
    case "luapply":luApply();return true;
  }
  return false;
}
function luInput(el,live){
  const p=el.dataset.lu;let v=el.dataset.num!==undefined?(el.value===""?null:num(el.value)):el.value;
  luSet(p,v);
  if(p==="focus.key"){S.lu.focus.skill="";S.lu.focus.note=""}
  if(!live)render();
}

/* ================= PORTRAITS ================= */
function portraitHtml(c,cls){
  return c&&c.portrait?`<span class="${cls} hasimg"><img src="${esc(c.portrait)}" alt=""></span>`:`<span class="${cls}">${esc(initials(c?.name))}</span>`;
}
function readPortrait(file){
  return new Promise((res,rej)=>{
    if(!file||!/^image\//.test(file.type)){rej(new Error("Choose an image file."));return}
    const url=URL.createObjectURL(file);const img=new Image();
    img.onload=()=>{try{const s=Math.min(img.naturalWidth,img.naturalHeight);const cv=document.createElement("canvas");cv.width=cv.height=256;
      const ctx=cv.getContext("2d");ctx.fillStyle="#222";ctx.fillRect(0,0,256,256);
      ctx.drawImage(img,(img.naturalWidth-s)/2,(img.naturalHeight-s)/2,s,s,0,0,256,256);
      URL.revokeObjectURL(url);res(cv.toDataURL("image/jpeg",0.82))}catch(e){rej(e)}};
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("That image couldn't be read."))};
    img.src=url;
  });
}
