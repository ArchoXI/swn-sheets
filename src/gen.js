/* ================= GM GENERATORS (Deluxe Edition tables) ================= */
const dN=n=>1+Math.floor(Math.random()*n);
const pickN=(arr,n)=>{const i=dN(n||arr.length)-1;return {n:i+1,text:arr[i]}};
const pick10=arr=>{const v=dN(10);return {n:v,text:arr[Math.ceil(v/2)-1]}}; // d10 read in pairs (1-2, 3-4…)
const range2d6=t=>{const a=dN(6),b=dN(6),v=a+b;return {n:v,text:t.find(r=>v>=r[0]&&v<=r[1])[2]}};
const GL=(k,label,die,r,extra={})=>({k,label,die,n:r.n,text:r.text,...extra});

const GENS={
  world:{group:"World",title:"World",icon:"🪐",desc:"A planet with name, two tags, and its basic stats.",
    make(o={}){const cu=GEN.names[dN(10)-1];const nm=pickN(cu.place,100);
      const t1=dN(100);let t2=dN(100);while(t2===t1)t2=dN(100);
      return [{k:"name",label:"Name",die:"",n:"",text:nm.text,note:cu.culture+" place names"},
        tagLine("tag1",t1),tagLine("tag2",t2),
        GL("atmo","Atmosphere","2d6",range2d6(GEN.atmosphere)),GL("temp","Temperature","2d6",range2d6(GEN.temperature)),
        GL("bio","Biosphere","2d6",range2d6(GEN.biosphere)),GL("pop","Population","2d6",range2d6(GEN.population)),
        GL("tl","Tech level","2d6",range2d6(GEN.techlevel))]},
    reroll:{name:()=>{const cu=GEN.names[dN(10)-1];return {k:"name",label:"Name",die:"",n:"",text:pickN(cu.place,100).text,note:cu.culture+" place names"}},
      tag1:()=>tagLine("tag1",dN(100)),tag2:()=>tagLine("tag2",dN(100)),
      atmo:()=>GL("atmo","Atmosphere","2d6",range2d6(GEN.atmosphere)),temp:()=>GL("temp","Temperature","2d6",range2d6(GEN.temperature)),
      bio:()=>GL("bio","Biosphere","2d6",range2d6(GEN.biosphere)),pop:()=>GL("pop","Population","2d6",range2d6(GEN.population)),tl:()=>GL("tl","Tech level","2d6",range2d6(GEN.techlevel))},
    extras:[["otherworld","+ Another world in the system"],["poi","+ Point of interest"]]},
  otherworld:{group:"World",title:"Another world in the system",icon:"🌑",desc:"Where a second world came from and how it gets along with the main one.",
    make(){return ["origin","relationship","contact"].map((k,i)=>GL(k,["Origin","Relationship to the main world","Point of contact"][i],"d8",pickN(GEN.otherworld[k],8)))},
    reroll:{origin:()=>GL("origin","Origin","d8",pickN(GEN.otherworld.origin,8)),relationship:()=>GL("relationship","Relationship to the main world","d8",pickN(GEN.otherworld.relationship,8)),contact:()=>GL("contact","Point of contact","d8",pickN(GEN.otherworld.contact,8))}},
  poi:{group:"World",title:"Point of interest",icon:"🛰",desc:"A station, base or ruin in the system: a point, who's there, and what's going on.",
    make(){const p=dN(8);return poiLines(p)},
    reroll:{point:()=>null,occ:(ls)=>{const p=ls[0].n;return GL("occ","Occupied by","d10",pick10(GEN.poi[p-1].occ))},sit:(ls)=>{const p=ls[0].n;return GL("sit","Situation","d10",pick10(GEN.poi[p-1].sit))}}},
  adventure:{group:"Adventures",title:"Adventure seed",icon:"⚔",desc:"A conflict with its situation and focus, what's holding it back, and the twist.",
    make(){const c=dN(8);return [...conflictLines(c),GL("restraint","Restraint","d20",pickN(GEN.restraint,20)),GL("twist","Twist","d20",pickN(GEN.twist,20))]},
    reroll:{type:()=>null,sit:(ls)=>GL("sit","Overall situation","d10",pick10(GEN.conflict[ls[0].n-1].a)),focus:(ls)=>GL("focus","Specific focus","d10",pick10(GEN.conflict[ls[0].n-1].b)),
      restraint:()=>GL("restraint","Restraint","d20",pickN(GEN.restraint,20)),twist:()=>GL("twist","Twist","d20",pickN(GEN.twist,20))}},
  patron:{group:"Adventures",title:"Patron and job",icon:"🤝",desc:"Who's hiring, how much you can trust them, the job, and what goes wrong.",
    make(){return patronSpec.map(([k,l,d])=>GL(k,l,"d"+d,pickN(GEN.patron[k],d)))},
    reroll:Object.fromEntries([["eagerness","Eagerness to hire",4],["trust","Trustworthiness",6],["challenge","Basic challenge of the job",8],["force","Main countervailing force",10],["rewards","Possible non-cash reward",12],["complication","Complication",20]].map(([k,l,d])=>[k,()=>GL(k,l,"d"+d,pickN(GEN.patron[k],d))]))},
  hazard:{group:"Adventures",title:"Hazard",icon:"☢",desc:"A danger for the PCs to deal with: type, a specific example, and what could happen.",
    make(){return hazardLines(dN(8))},
    reroll:{type:()=>null,ex:(ls)=>GL("ex","Specific example","d10",pick10(GEN.hazard[ls[0].n-1].a)),danger:(ls)=>GL("danger","Possible danger","d10",pick10(GEN.hazard[ls[0].n-1].b))}},
  reward:{group:"Adventures",title:"Reward and ongoings",icon:"💎",desc:"A prize worth chasing, plus what's happening around the place.",
    make(){return [GL("reward","Reward","d20",pickN(GEN.reward,20)),GL("civ","In a city or town","d20",pickN(GEN.civilized,20)),GL("wild","In the wilderness","d20",pickN(GEN.wilderness,20))]},
    reroll:{reward:()=>GL("reward","Reward","d20",pickN(GEN.reward,20)),civ:()=>GL("civ","In a city or town","d20",pickN(GEN.civilized,20)),wild:()=>GL("wild","In the wilderness","d20",pickN(GEN.wilderness,20))}},
  urban:{group:"Encounters",title:"Urban encounter",icon:"🏙",desc:"A quick event in a city to pull the PCs in.",
    make(){return urbanSpec.map(([k,l,d])=>GL(k,l,"d"+d,pickN(GEN.urban[k],d)))},
    reroll:Object.fromEntries([["about","What the conflict is about",4],["venue","Where",6],["why","Why the PCs are involved",8],["nature","What's happening",10],["antagonists","Antagonists",12],["features","Urban feature",20]].map(([k,l,d])=>[k,()=>GL(k,l,"d"+d,pickN(GEN.urban[k],d))]))},
  wild:{group:"Encounters",title:"Wilderness encounter",icon:"🌲",desc:"Range, weather, what happens, the creatures, and a nearby feature.",
    make(){return wildSpec.map(([k,l,d])=>GL(k,l,"d"+d,pickN(GEN.wild[k],d)))},
    reroll:Object.fromEntries([["range","Range",4],["weather","Weather and light",6],["nature","What happens",8],["friendly","Friendly creatures",10],["hostile","Hostile creatures",12],["feature","Nearby feature",20]].map(([k,l,d])=>[k,()=>GL(k,l,"d"+d,pickN(GEN.wild[k],d))]))},
  npc:{group:"NPCs",title:"NPC",icon:"👤",desc:"A full NPC: name, who they are, what they want, and how they deal with the PCs.",
    make(){const cu=GEN.names[S.genCulture!=null&&S.genCulture!==""?num(S.genCulture):dN(10)-1];const female=Math.random()<.5;
      const nm=pickN(female?cu.female:cu.male,25).text+" "+pickN(cu.surname,25).text;
      return [{k:"name",label:"Name",die:"",n:"",text:nm,note:cu.culture+(female?", female":", male")},
        ...npcSpec.map(([k,l,d])=>GL(k,l,"d"+d,pickN(GEN.npc[k],d))),
        GL("manner","Initial manner","d20",pickN(GEN.manner,20)),GL("deal","If they make a deal","d20",pickN(GEN.deal,20)),
        GL("motivation","Motivation","d20",pickN(GEN.motivation,20)),GL("want","What they want from the PCs","d20",pickN(GEN.want,20)),
        GL("power","Their power","d20",pickN(GEN.power,20)),GL("hook","Memorable hook","d20",pickN(GEN.hook,20)),reactionLine()]},
    reroll:{name:()=>{const cu=GEN.names[dN(10)-1];const f=Math.random()<.5;return {k:"name",label:"Name",die:"",n:"",text:pickN(f?cu.female:cu.male,25).text+" "+pickN(cu.surname,25).text,note:cu.culture+(f?", female":", male")}},
      ...Object.fromEntries([["age","Age",4],["background","Background",6],["role","Role in society",8],["problem","Biggest problem",10],["desire","Greatest desire",12],["trait","Most obvious trait",20]].map(([k,l,d])=>[k,()=>GL(k,l,"d"+d,pickN(GEN.npc[k],d))])),
      manner:()=>GL("manner","Initial manner","d20",pickN(GEN.manner,20)),deal:()=>GL("deal","If they make a deal","d20",pickN(GEN.deal,20)),motivation:()=>GL("motivation","Motivation","d20",pickN(GEN.motivation,20)),
      want:()=>GL("want","What they want from the PCs","d20",pickN(GEN.want,20)),power:()=>GL("power","Their power","d20",pickN(GEN.power,20)),hook:()=>GL("hook","Memorable hook","d20",pickN(GEN.hook,20)),reaction:()=>reactionLine()}},
  reaction:{group:"NPCs",title:"Reaction roll",icon:"🎲",desc:"How an NPC or group first reacts to the PCs.",make(){return [reactionLine()]},reroll:{reaction:()=>reactionLine()}},
  names:{group:"NPCs",title:"Names",icon:"🏷",desc:"Five names and five places from one culture.",
    make(){const ci=S.genCulture!=null&&S.genCulture!==""?num(S.genCulture):dN(10)-1;const cu=GEN.names[ci];
      const five=a=>Array.from({length:5},()=>pickN(a,a.length).text).join(", ");
      return [{k:"culture",label:"Culture",die:"",n:"",text:cu.culture},{k:"m",label:"Male",die:"",n:"",text:five(cu.male)},{k:"f",label:"Female",die:"",n:"",text:five(cu.female)},{k:"s",label:"Surnames",die:"",n:"",text:five(cu.surname)},{k:"p",label:"Places",die:"",n:"",text:five(cu.place)}]},
    reroll:{}}
};
const patronSpec=[["eagerness","Eagerness to hire",4],["trust","Trustworthiness",6],["challenge","Basic challenge of the job",8],["force","Main countervailing force",10],["rewards","Possible non-cash reward",12],["complication","Complication",20]];
const urbanSpec=[["about","What the conflict is about",4],["venue","Where",6],["why","Why the PCs are involved",8],["nature","What's happening",10],["antagonists","Antagonists",12],["features","Urban feature",20]];
const wildSpec=[["range","Range",4],["weather","Weather and light",6],["nature","What happens",8],["friendly","Friendly creatures",10],["hostile","Hostile creatures",12],["feature","Nearby feature",20]];
const npcSpec=[["age","Age",4],["background","Background",6],["role","Role in society",8],["problem","Biggest problem",10],["desire","Greatest desire",12],["trait","Most obvious trait",20]];
function tagLine(k,n){const t=GEN.tags.find(x=>x.n===n)||GEN.tags[n-1];return {k,label:k==="tag1"?"Tag":"Tag",die:"d100",n:n===100?"00":n,text:t.name,tag:t.n}}
function reactionLine(){const a=dN(6),b=dN(6),v=a+b;const r=GEN.reaction.find(x=>v>=x[0]&&v<=x[1]);return {k:"reaction",label:"Reaction",die:"2d6",n:v,text:r[2]+": "+r[3].toLowerCase()}}
function poiLines(p){const P=GEN.poi[p-1];return [{k:"point",label:"A point…",die:"d8",n:p,text:P.point},GL("occ","Occupied by","d10",pick10(P.occ)),GL("sit","Situation","d10",pick10(P.sit))]}
function conflictLines(c){const C=GEN.conflict[c-1];return [{k:"type",label:"Conflict",die:"d8",n:c,text:C.type},GL("sit","Overall situation","d10",pick10(C.a)),GL("focus","Specific focus","d10",pick10(C.b))]}
function hazardLines(h){const H=GEN.hazard[h-1];return [{k:"type",label:"Hazard type",die:"d8",n:h,text:H.type},GL("ex","Specific example","d10",pick10(H.a)),GL("danger","Possible danger","d10",pick10(H.b))]}

function genLoad(){try{S.genHist=JSON.parse(localStorage.getItem("swn.gen")||"[]")}catch(e){S.genHist=[]}}
function genSave(){try{localStorage.setItem("swn.gen",JSON.stringify((S.genHist||[]).slice(0,40)))}catch(e){}}
function genText(r){return r.title+"\n"+r.lines.map(l=>{let s=l.label+": "+l.text+(l.note?" ("+l.note+")":"");if(l.tag){const t=GEN.tags.find(x=>x.n===l.tag);s+="\n   "+t.desc+"\n   Enemies: "+t.E+"\n   Friends: "+t.F+"\n   Complications: "+t.C+"\n   Things: "+t.T+"\n   Places: "+t.P}return s}).join("\n")}

function genAct(act,t){
  if(!(S.isGM||S.offline))return true;
  if(S.genHist==null)genLoad();
  const id=t.dataset.id;const r=id?(S.genHist||[]).find(x=>x.id===id):null;
  switch(act){
    case "gen-roll":{const g=GENS[t.dataset.g];if(!g)return true;const res={id:rid(),g:t.dataset.g,title:g.title,icon:g.icon,ts:Date.now(),lines:g.make()};
      if(t.dataset.parent){const par=(S.genHist||[]).find(x=>x.id===t.dataset.parent);if(par){par.subs=[...(par.subs||[]),res];genSave();render();return true}}
      S.genTab="roll";S.genHist=[res,...(S.genHist||[])];genSave();render();const fc=document.querySelector(".gcard");if(fc)fc.scrollIntoView({behavior:"smooth",block:"start"});return true}
    case "gen-line":{const host=findGen(id);if(!host)return true;const g=GENS[host.g];const k=t.dataset.k;
      if(k==="type"||k==="point"){host.lines=(host.g==="adventure"?[...conflictLines(dN(8)),...host.lines.slice(3)]:host.g==="hazard"?hazardLines(dN(8)):poiLines(dN(8)))}
      else{const fn=g.reroll[k];if(!fn)return true;const nl=fn(host.lines);if(nl)host.lines=host.lines.map(l=>l.k===k?nl:l)}
      genSave();render();return true}
    case "gen-again":{const host=findGen(id);if(!host)return true;host.lines=GENS[host.g].make();host.subs=[];host.ts=Date.now();genSave();render();return true}
    case "gen-x":{S.genHist=(S.genHist||[]).filter(x=>x.id!==id).map(x=>({...x,subs:(x.subs||[]).filter(s=>s.id!==id)}));genSave();render();return true}
    case "gen-pin":{const host=findGen(id);if(host){host.pin=!host.pin;genSave();render()}return true}
    case "gen-copy":{const host=findGen(id);if(!host)return true;const txt=genText(host)+((host.subs||[]).length?"\n\n"+host.subs.map(genText).join("\n\n"):"");
      (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toastMsg("Copied.")).catch(()=>toastMsg("Couldn't copy on this device.",true));return true}
    case "gen-clear":{if(S.confirm!=="gen-clear"){S.confirm="gen-clear";render();return true}S.confirm=null;S.genHist=(S.genHist||[]).filter(x=>x.pin);genSave();render();return true}
    case "gen-tag":{S.genTagOpen={...(S.genTagOpen||{}),[t.dataset.key]:!((S.genTagOpen||{})[t.dataset.key])};render();return true}
    case "gen-tab":{S.genTab=t.dataset.v;render();return true}
    case "gen-tagview":{S.genTagView=num(t.dataset.n);render();return true}
  }
  return false;
}
function findGen(id){for(const x of S.genHist||[]){if(x.id===id)return x;for(const s of x.subs||[])if(s.id===id)return s}return null}

function genCard(r,isSub){
  const open=S.genTagOpen||{};
  const rows=r.lines.map(l=>{const key=r.id+":"+l.k;const t=l.tag?GEN.tags.find(x=>x.n===l.tag):null;
    return `<div class="gline"><span class="glbl">${esc(l.label)}</span>${l.die?`<span class="gdie" title="Rolled ${esc(String(l.n))} on ${esc(l.die)}">${esc(l.die)} <b>${esc(String(l.n))}</b></span>`:`<span class="gdie"></span>`}
      <span class="gtext">${t?`<button class="rword gtag" data-act="gen-tag" data-key="${esc(key)}">${esc(l.text)} <span class="hint">${open[key]?"▴":"▾"}</span></button>`:esc(l.text)}${l.note?` <span class="hint">· ${esc(l.note)}</span>`:""}</span>
      ${GENS[r.g].reroll&&(GENS[r.g].reroll[l.k]||l.k==="type"||l.k==="point")?`<button class="iconbtn" data-act="gen-line" data-id="${esc(r.id)}" data-k="${esc(l.k)}" title="Re-roll this line">↻</button>`:`<span></span>`}
      ${t&&open[key]?`<div class="gtagbody">${tagBody(t)}</div>`:""}</div>`}).join("");
  const extras=!isSub&&GENS[r.g].extras?`<div class="gextras">${GENS[r.g].extras.map(([g,l])=>`<button class="btn sm" data-act="gen-roll" data-g="${g}" data-parent="${esc(r.id)}">${l}</button>`).join("")}</div>`:"";
  const subs=(r.subs||[]).map(s=>genCard(s,true)).join("");
  return `<div class="${isSub?"gsub":"frame gcard"}"><div class="ghead"><span class="gicon">${r.icon||""}</span><b>${esc(r.title)}</b>${isSub?"":`<span class="hint">${ago(r.ts)}</span>`}<span style="flex:1"></span>
    ${isSub?"":`<button class="btn sm ghost" data-act="gen-pin" data-id="${esc(r.id)}" title="Pinned results stay when you clear">${r.pin?"★ Pinned":"☆ Pin"}</button><button class="btn sm ghost" data-act="gen-copy" data-id="${esc(r.id)}">Copy</button><button class="btn sm ghost" data-act="gen-again" data-id="${esc(r.id)}">Re-roll all</button>`}
    <button class="iconbtn" data-act="gen-x" data-id="${esc(r.id)}" title="Remove">×</button></div>
    <div class="glines">${rows}</div>${subs}${extras}</div>`;
}
function tagBody(t){return `<p>${esc(t.desc)}</p><dl class="gtagdl"><dt>Enemies</dt><dd>${esc(t.E)}</dd><dt>Friends</dt><dd>${esc(t.F)}</dd><dt>Complications</dt><dd>${esc(t.C)}</dd><dt>Things</dt><dd>${esc(t.T)}</dd><dt>Places</dt><dd>${esc(t.P)}</dd></dl>`}

function renderGenerators(){
  if(!(S.isGM||S.offline))return `<div class="empty">Only the GM can use the generators.</div>`;
  if(S.genHist==null)genLoad();
  const tab=S.genTab||"roll";
  const groups=["World","Adventures","Encounters","NPCs"];
  const side=groups.map(g=>`<div class="ggroup"><div class="lbl">${g}</div>${Object.entries(GENS).filter(([k,v])=>v.group===g).map(([k,v])=>`<button class="gbtn" data-act="gen-roll" data-g="${k}"><span class="gicon">${v.icon}</span><span><b>${esc(v.title)}</b><span class="hint">${esc(v.desc)}</span></span></button>`).join("")}</div>`).join("")
    +`<div class="ggroup"><div class="lbl">Name culture</div><select class="inp" id="gen-culture"><option value="">Random</option>${GEN.names.map((c,i)=>`<option value="${i}" ${String(S.genCulture??"")===String(i)?"selected":""}>${c.culture}</option>`).join("")}</select><p class="hint" style="margin:4px 0 0">Used by NPC and Names.</p></div>`;
  const hist=S.genHist||[];
  const main=tab==="tags"?renderTagBrowser():hist.length?hist.map(r=>genCard(r)).join(""):`<div class="empty">Pick a generator on the left. Results stay here on this device until you remove them.</div>`;
  return `<div class="genpage"><div class="genhead"><h1 class="pagetitle" style="margin:0">Generators</h1><span class="hint">GM only · tables from the Deluxe Edition</span><span style="flex:1"></span>
    <nav class="gtabs"><button class="${tab==="roll"?"on":""}" data-act="gen-tab" data-v="roll">Results</button><button class="${tab==="tags"?"on":""}" data-act="gen-tab" data-v="tags">World tag list</button></nav>
    ${tab==="roll"&&hist.length?`<button class="btn sm ghost" data-act="gen-clear">${S.confirm==="gen-clear"?"Clear unpinned?":"Clear"}</button>`:""}</div>
    <div class="genbody"><aside class="genside">${side}</aside><section class="genmain">${main}</section></div></div>`;
}
function renderTagBrowser(){
  const q=(S.genTagQ||"").toLowerCase();const sel=S.genTagView||0;
  const list=GEN.tags.filter(t=>!q||t.name.toLowerCase().includes(q)||t.desc.toLowerCase().includes(q));
  const t=GEN.tags.find(x=>x.n===sel);
  return `<div class="tagbrowse"><div class="taglist"><input class="inp" id="gen-tagq" placeholder="Search tags…" value="${esc(S.genTagQ||"")}">
    <div class="tagitems">${list.map(x=>`<button class="${x.n===sel?"on":""}" data-act="gen-tagview" data-n="${x.n}"><span class="hint">${x.n===100?"00":x.n}</span> ${esc(x.name)}</button>`).join("")}</div></div>
    <div class="frame tagdetail">${t?`<h2>${esc(t.name)} <span class="hint">d100: ${t.n===100?"00":t.n}</span></h2>${tagBody(t)}`:`<p class="hint">Pick a tag to read it.</p>`}</div></div>`;
}
