/* ================= MECHS (Deluxe Edition pp. 302–311) ================= */
// Hulls: [name, cost, maint, speed, armor, hp, ac, power, mass, hardpoints, class, type]
const MECH_HULLS=[
  ["Shock Suit",150e3,500,4,12,15,18,10,5,2,"Suit","Shock"],["Specialist Suit",150e3,500,6,8,10,17,5,10,1,"Suit","Specialist"],["Psi Suit",300e3,500,4,8,15,20,5,5,1,"Suit","Psi"],
  ["Light Shock",500e3,1000,3,15,40,16,20,10,3,"Light","Shock"],["Light Specialist",500e3,1000,5,10,30,15,10,20,2,"Light","Specialist"],["Light Psimech",1e6,1000,3,10,40,17,10,10,2,"Light","Psi"],
  ["Heavy Shock",1e6,2000,2,25,70,15,40,20,6,"Heavy","Shock"],["Heavy Specialist",1e6,2000,4,15,50,14,20,40,3,"Heavy","Specialist"],["Heavy Psimech",2e6,2000,2,15,60,16,15,15,3,"Heavy","Psi"]];
const MECH_CLASSES=["Suit","Light","Heavy"];const MC_COST=[1,3,6],MC_HASH=[1,2,4];
// Fittings: [name, cost, power, power#, mass, mass#, min class, psi, multi, effect]
const MECH_FITTINGS=[
  ["Active Camo Surface",25e3,1,0,2,1,"Suit",0,0,"+2 Sneak against distant observers (10 m suit, 50 m light, 100 m heavy)"],
  ["Ammunition Cells",10e3,1,1,1,0,"Suit",0,1,"Ignore one failed out-of-ammo check per cell until the next maintenance"],
  ["Antigrav Nodes",50e3,2,1,4,1,"Suit",0,0,"Flight at normal Speed. Heavy mechs need pretech nodes"],
  ["Augmented Enviroseals",15e3,1,0,2,0,"Suit",0,0,"Extended operation in invasive or corrosive atmospheres"],
  ["Breaching Tool",20e3,1,0,1,1,"Suit",0,0,"Blows a mech-sized hole in normal walls in one round (1d6+1 vs hardened)"],
  ["Bridging Laminates",10e3,1,0,1,1,"Light",0,0,"Builds 20 m of bridge per round, 600 m between maintenance"],
  ["Cargo Space",1e3,0,0,1,0,"Suit",0,1,"Protected cargo: 100 kg suit, 500 kg light, 2,000 kg heavy"],
  ["Comm Interceptors",30e3,2,0,5,0,"Light",0,0,"Breaks civilian comms; military needs opposed Program"],
  ["Construction Array",50e3,1,1,3,1,"Light",0,0,"Field workshop: repair and maintain itself and other mechs"],
  ["Drop Sheathing",10e3,0,0,1,1,"Suit",0,0,"Spotting its orbital insertion takes Program vs 10"],
  ["Escape Pod",25e3,1,0,1,1,"Light",0,0,"Reroll a failed Physical save when the mech is destroyed"],
  ["Field Medical Unit",25e3,2,0,1,1,"Suit",0,0,"One round: lazarus-patch care for up to 20 allies within 200 m (Int/Heal)"],
  ["Fire Control Unit/Master",100e3,2,0,3,1,"Light",0,0,"Linked mechs fire one attack at a time, seeing each result"],
  ["Fire Control Unit/Slave",20e3,1,0,1,1,"Light",0,0,"Needed to link with an ally's master unit"],
  ["Grav Chutes",20e3,1,0,1,1,"Suit",0,0,"No falling damage, even from orbit"],
  ["Inquisitor Probe",60e3,1,0,1,1,"Suit",1,0,"Psi (Telepathy-1): target makes a Mental save or you read its plan"],
  ["Integral Maintenance",30e3,2,0,1,1,"Light",0,0,"Self-maintenance in 30 minutes, supplies for 7 cycles"],
  ["Jump Coil",60e3,1,0,1,1,"Suit",1,0,"Psi (teleporter): bring up to 5 allied mechs within 10 m"],
  ["Kinesis Boost",60e3,1,0,1,1,"Suit",1,0,"Psi (Telekinesis-1): +2 Speed and +2 initiative"],
  ["Neural Activity Sensors",60e3,1,0,1,1,"Suit",1,0,"Psi: sense sentient minds within 2 km"],
  ["Neural Static Generator",60e3,1,0,1,1,"Suit",1,0,"Psi (Metapsionics-1): negate psi fittings at you or allies; +5 Armor vs psi"],
  ["Omen Tap",60e3,1,0,1,1,"Suit",1,0,"Psi: force a reroll of a successful hit or check, once per round"],
  ["Panoptic Cloud",25e3,2,0,2,1,"Light",0,0,"Microscopic sensors give awareness out to 200 m"],
  ["Polyspectral Sensors",40e3,1,0,1,1,"Suit",0,0,"Terrain model 100 m ahead"],
  ["Pulse Transceiver",75e3,2,0,5,0,"Suit",0,0,"Faster-than-light text and image comms within a system"],
  ["Skywatch Drones",40e3,1,0,2,1,"Light",0,0,"Spy drones with 10 km range, 8 hours aloft"],
  ["Vivification Field",60e3,1,0,1,1,"Suit",1,0,"Psi (Biopsionics-1): stabilizes mortally wounded allies within 100 m"],
  ["Void Thrusters",25e3,1,1,2,1,"Suit",0,0,"Flight in zero-g; no falling damage"]];
// Defenses: [name, cost, power, power#, mass, mass#, min class, effect]
const MECH_DEFENSES=[
  ["Augmented ECM Projector",75e3,2,1,1,1,"Light","+2 AC against vehicles and mechs, −1 Speed"],
  ["Hardened Polyceramic Overlay",50e3,1,1,1,1,"Light","Attacking weapons' AP reduced by 5"],
  ["MES Shunt Channels",25e3,1,1,2,1,"Suit","Armor 10 against Psi weapons"],
  ["Morphic Silhouette Damper",25e3,1,1,2,1,"Suit","Halves attackers' weapon range beyond 50 m"],
  ["Redundant Systems Buffer",75e3,10,0,5,0,"Heavy","+20 hit points"],
  ["Vanguard Plating",100e3,15,0,5,0,"Heavy","Attacking weapons' AP reduced by 15 (doesn't stack with the overlay)"]];
// Weapons: [name, cost, dmg, power, mass, hardpoints, range, min class, specials, suppress]
const MECH_WEAPONS=[
  ["Banshee Vox",35e3,"2d12",5,3,1,"30 m","Light","Cone 30m, Anti-personnel",0],["Beam Lance",100e3,"5d8",15,5,3,"1k/2k","Heavy","AP 30",0],
  ["Cutter Plates",20e3,"1d12/class",5,3,1,"Melee","Suit","AP 10, Melee",0],["Finger of God",300e3,"4d12",6,3,2,"500/1k","Heavy","Psi, Slow",0],
  ["Heavy Machine Gun",10e3,"3d6",3,2,1,"500/2k","Suit","AP 5, Ammo",1],["Hydra Array",40e3,"3d6",6,3,1,"2k/4k","Light","AP 5, Ammo",1],
  ["Improvised Weapon",0,"1d8/class",0,0,0,"Melee","Suit","Melee",0],["Inferno Projector",35e3,"4d6",6,3,2,"20 m","Light","AP 10, Cone 20m, Slow",0],
  ["Laser, Anti-Air",40e3,"3d8",5,2,2,"6k/12k","Suit","AP 10, Slow, −4 vs ground targets",0],["Laser, Anti-Vehicle",20e3,"3d10",7,3,2,"500/1k","Suit","AP 15, reroll 1s vs Armor",0],
  ["Laser, Heavy",75e3,"3d12",10,4,3,"1k/2k","Heavy","AP 20",0],["Laser, Light",35e3,"3d8",5,2,1,"500/1k","Light","AP 10",0],
  ["MES Knife",100e3,"1d12/class",1,1,1,"Melee","Suit","Psi, Melee",0],["Mindburner",200e3,"4d10",2,2,1,"20 m","Light","Cone 20m, Psi",0],
  ["Plasma Thrower",50e3,"4d10",10,2,2,"250/500","Light","AP 10",0],["Rail Cannon",150e3,"4d12",20,5,4,"2k/4k","Heavy","AP 45, Slow, Ammo",0],
  ["Railgun",16e3,"3d8",7,4,2,"1k/2k","Light","AP 15, Ammo",1],["Razor Cloud",30e3,"3d10",4,3,2,"30/60","Light","Anti-personnel, Ammo",0],
  ["Rocket Launcher",8e3,"3d10",3,2,1,"2k/4k","Suit","AP 5, Ammo, −4 vs human-sized",0],["Vortex Cannon",150e3,"5d12",15,5,3,"1k/2k","Heavy","AP 10",0],
  ["Wheatcutter Belt",20e3,"2d12",2,3,1,"10/20","Light","Anti-personnel, Ammo",0]];
// Book examples (pp. 310–311): [name, hull, weapons (name or [name,tl4]), defenses, fittings]
const MECH_TEMPLATES=[
  ["Achilles","Shock Suit",[["Rocket Launcher",1],"Cutter Plates"],[],[]],
  ["Ulysses","Specialist Suit",[],[],["Cargo Space","Field Medical Unit","Polyspectral Sensors","Antigrav Nodes"]],
  ["Hecate","Psi Suit",["MES Knife"],[],[]],
  ["Angurvadal","Light Shock",["Railgun",["Heavy Machine Gun",1]],["Hardened Polyceramic Overlay"],[["Ammunition Cells",2]]],
  ["Curtana","Light Specialist",[["Rocket Launcher",1]],[],["Field Medical Unit","Panoptic Cloud","Skywatch Drones","Pulse Transceiver"]],
  ["Durandal","Light Psimech",["Mindburner"],["Hardened Polyceramic Overlay"],["Escape Pod","Neural Activity Sensors"]],
  ["Scorn","Heavy Shock",["Rail Cannon","Railgun"],[],["Breaching Tool","Integral Maintenance",["Ammunition Cells",2]]],
  ["Odium","Heavy Specialist",["Laser, Heavy"],[],["Construction Array","Integral Maintenance","Skywatch Drones","Polyspectral Sensors","Pulse Transceiver"]],
  ["Despite","Heavy Psimech",["Finger of God","MES Knife"],["Hardened Polyceramic Overlay"],["Neural Activity Sensors"]]];

Object.assign(RULES,{
  mech_armor:{t:"Mech Armor",p:["Suits use Armor like vehicles do: it's subtracted from the damage of each hit, but Heavy weapons, explosives and similar brutal tools ignore it.","Light and heavy mechs are immune to ordinary small arms. Only TL4 Heavy weapons (and things like heavy shaped charges or artillery) can hurt them, and they subtract their Armor from that damage.","A weapon's AP ignores that many points of Armor, but can't do more than reduce it to 0. Hardened Polyceramic Overlay cuts attackers' AP by 5; Vanguard Plating by 15 (they don't stack). Psi weapons ignore Armor except MES Shunt Channels."]},
  mech_damage:{t:"Mech Damage",p:["Mechs take damage normally but leave the pilot unharmed until they're destroyed. A suit pilot can choose to take a hit's damage on their own hit points instead, after it's rolled.","At 0 hit points the hull is inoperable. The pilot makes a Physical save: on a success they escape with a quarter of their current hit points, rounded up; on a failure they're mortally wounded. An Escape Pod lets them reroll a failed save.","Repairs cost 500 credits per hit point for a suit and 1,000 for a light or heavy mech. A tech repairs Fix + 1 hit points per hour. Suits need only spare parts and a toolkit; bigger mechs need repair facilities."]},
  mech_attack:{t:"Mech Weapons",p:["Hit roll: 1d20 + base attack bonus + the better of Int or Dex modifier + Shoot. Damage adds the same modifier. Melee weapons use Punch or Stab instead and never do Shock.","Psi weapons use Wisdom or Constitution instead, and the pilot may use a psychic skill in place of Shoot. They ignore Armor.","The pilot can fire every gun on the mech each turn, at different targets, but must pick all targets before rolling. A suit pilot can't fire personal weapons and suit weapons in the same round.","Slow: after firing, roll Int/Shoot against 8; on a failure the gun cools down for a round. Suppress (#): every target in front without hard cover takes half damage, Evasion save negates."]},
  mech_ammo:{t:"Mech Ammunition",p:["After each fight where an Ammo weapon was fired, the pilot makes a Wis/Shoot check against difficulty 6 for that gun. On a failure, it's out of ammo until the next maintenance cycle.","The difficulty goes up by 1 after each fight until maintenance. Each Ammunition Cells fitting lets the pilot ignore one failed check. Energy, melee and psitech weapons never run out."]},
  mech_maint:{t:"Mech Maintenance",p:["A mech runs 24 hours before it needs maintenance. For each further 2 hours (or part), it takes a cumulative −1 to all hit rolls and skill checks. At −10 it shuts down. Parked mechs don't count.","A maintenance cycle costs 500 credits for a suit, 1,000 for a light mech and 2,000 for a heavy. In one hour a tech can service Fix + 1 heavy mechs, twice as many light mechs or four times as many suits. Maintenance also refills all ammunition."]},
  mech_style:{t:"Mech Pilot Styles",p:["As a Move action you can activate or switch a fighting style for your mech: Aggressive (+1 to hit), Defensive (+1 AC) or Swift (+1 Speed). It lasts until you switch or leave combat or the mech. Once per turn.","At level 2, switching is an On Turn action and the bonuses become +2."]}
});

const mechPaths=()=>Object.keys(S.docs).filter(p=>p.startsWith("mechs/")).sort((a,b)=>String(S.docs[a].name).localeCompare(String(S.docs[b].name)));
const mechHull=m=>MECH_HULLS.find(h=>h[0]===(m&&m.hull))||MECH_HULLS[0];
const mcIdx=c=>Math.max(0,MECH_CLASSES.indexOf(c));
function mfCost(F,ci){return {cost:F[1]*MC_COST[ci],power:F[2]*(F[3]?MC_HASH[ci]:1),mass:F[4]*(F[5]?MC_HASH[ci]:1)}}
function mwDmg(W,ci){return /\/class/.test(W[2])?(ci+1)+W[2].replace(/^1|\/class/g,""):W[2]}
function mechDesign(m){
  const H=mechHull(m);const ci=mcIdx(H[10]);const psi=H[11]==="Psi";let cost=H[1],power=0,mass=0,hard=0;const issues=[];
  (m.weapons||[]).forEach(w=>{const W=MECH_WEAPONS.find(x=>x[0]===w.name);if(!W)return;cost+=W[1]*(w.tl4?2:1);power+=W[3];mass+=W[4];hard+=W[5];
    if(ci<mcIdx(W[7]))issues.push(W[0]+" needs a "+W[7]+" hull");if(/Psi/.test(W[8])&&!psi)issues.push(W[0]+" needs a psimech")});
  (m.defenses||[]).forEach(x=>{const D=MECH_DEFENSES.find(y=>y[0]===x.name);if(!D)return;const c=mfCost(D,ci);cost+=c.cost;power+=c.power;mass+=c.mass;if(ci<mcIdx(D[6]))issues.push(D[0]+" needs a "+D[6]+" hull")});
  (m.fittings||[]).forEach(x=>{const F=MECH_FITTINGS.find(y=>y[0]===x.name);if(!F)return;const q=Math.max(1,num(x.qty,1));const c=mfCost(F,ci);cost+=c.cost*q;power+=c.power*q;mass+=c.mass*q;
    if(ci<mcIdx(F[6]))issues.push(F[0]+" needs a "+F[6]+" hull");if(F[7]&&!psi)issues.push(F[0]+" needs a psimech")});
  const has=n=>(m.defenses||[]).some(x=>x.name===n);const fq=n=>(m.fittings||[]).filter(f=>f.name===n).reduce((s,f)=>s+Math.max(1,num(f.qty,1)),0);
  return {H,ci,cls:H[10],type:H[11],psi,cost,power,mass,hard,powerMax:H[7]+num(m.bonusPM),massMax:H[8]+num(m.bonusPM),hardMax:H[9],issues,
    hpMax:H[5]+(has("Redundant Systems Buffer")?20:0),acBase:H[6],speedBase:H[3]-(has("Augmented ECM Projector")?1:0),armor:H[4],
    apRed:has("Vanguard Plating")?15:has("Hardened Polyceramic Overlay")?5:0,ecm:has("Augmented ECM Projector"),cells:fq("Ammunition Cells"),escapePod:fq("Escape Pod")>0,maint:H[2]};
}
function mechPilot(m){const id=m.ownerSheet;const p=id?"sheets/"+id:null;if(p&&S.docs[p]){const c=S.docs[p];return {path:p,c,R:compute(c)}}return null}
function mechStyle(m,P){if(!P)return {lv:0};const f=(P.c.foci||[]).find(x=>x.key==="mech_pilot");if(!f)return {lv:0};const lv=num(f.level,1)>=2?2:1;return {lv,style:m.style||"",bonus:lv}}
function mechCompute(m){
  const D=mechDesign(m);const P=mechPilot(m);const st=mechStyle(m,P);
  const pen=-Math.max(0,num(m.penalty));
  return {...D,P,st,pen,ac:D.acBase+(st.style==="defensive"?st.bonus:0),speed:D.speedBase+(st.style==="swift"?st.bonus:0),hit:st.style==="aggressive"?st.bonus:0};
}
function mechCanUse(mp){if(S.offline||S.isGM)return true;const m=S.docs[mp];return !!(m&&m.ownerSheet&&isMine("sheets/"+m.ownerSheet))}
function mechWeapParts(m,C,W){
  const P=C.P;const melee=/Melee/.test(W[8]);const psi=/Psi/.test(W[8]);let parts=[],mod=0;
  if(P){const R=P.R;const attrs=psi?["wis","con"]:["int","dex"];const a=attrs.reduce((b,x)=>R.mod[x]>R.mod[b]?x:b,attrs[0]);
    const skills=melee?["punch","stab"]:psi?["shoot","telekinesis","telepathy","biopsionics","metapsionics","precognition","teleportation"]:["shoot"];
    const sk=skills.reduce((b,x)=>(R.skills[x]??-1)>(R.skills[b]??-1)?x:b,skills[0]);const lv=R.skills[sk]??-1;
    parts=[{l:"Attack bonus",v:R.bab},{l:a.toUpperCase(),v:R.mod[a]},{l:(SKILL[sk]?.name||sk)+(lv<0?" (untrained)":""),v:lv}];mod=R.mod[a]}
  else{parts=[{l:"Pilot",v:num(m.npcHit,3)}];mod=num(m.npcDmg,1)}
  if(C.hit)parts.push({l:"Aggressive style",v:C.hit});
  if(C.pen)parts.push({l:"Overdue maintenance",v:C.pen});
  return {parts,mod,bonus:parts.reduce((s,p)=>s+p.v,0)};
}
function mechEmit(mp,label,lines){
  const m=S.docs[mp];const C=mechCompute(m);
  if(C.P&&!m.npc){const c=C.P.c;emitRoll(c,(m.name||"Mech")+" · "+label,lines);return}
  npcRoll({name:m.name||"Mech"},label,lines);
}
function mechHit(mp,wid){
  const m=S.docs[mp];const C=mechCompute(m);const w=(m.weapons||[]).find(x=>x.id===wid);const W=w&&MECH_WEAPONS.find(x=>x[0]===w.name);if(!W)return;
  if((m.ammoOut||{})[wid]){toastMsg("That gun is out of ammo until the next maintenance.",true);return}
  const X=mechWeapParts(m,C,W);const d={v:rand(20),s:20};const tot=d.v+X.bonus;
  mechEmit(mp,(w.tl4?"TL4 ":"")+w.name+" hit",[{name:"Hit",dice:[d],parts:X.parts,total:tot,note:[W[8],W[6]!=="Melee"?"Range "+W[6]:""].filter(Boolean).join(" · ")}]);
}
function mechDmg(mp,wid){
  const m=S.docs[mp];const C=mechCompute(m);const w=(m.weapons||[]).find(x=>x.id===wid);const W=w&&MECH_WEAPONS.find(x=>x[0]===w.name);if(!W)return;
  const X=mechWeapParts(m,C,W);const p=parseDice(mwDmg(W,C.ci));const rr=rollGroups(p);const tot=rr.sum+p.flat+X.mod;
  mechEmit(mp,(w.tl4?"TL4 ":"")+w.name+" damage",[{name:"Damage",dice:rr.dice,parts:X.mod?[{l:"Attribute",v:X.mod}]:[],total:tot,note:[W[8],/Melee/.test(W[8])?"No Shock":""].filter(Boolean).join(" · ")}]);
}

/* ---------- actions ---------- */
function mechAct(act,t){
  const mp=t.dataset.doc;const m=mp?S.docs[mp]:null;const gm=S.isGM||S.offline;
  const can=()=>{if(!mechCanUse(mp)){toastMsg("Only the GM or this mech's pilot can do that.",true);return false}return true};
  switch(act){
    case "mech-hit":if(m&&can())mechHit(mp,t.dataset.id);return true;
    case "mech-dmg":if(m&&can())mechDmg(mp,t.dataset.id);return true;
    case "mech-hp":{if(!m||!can())return true;const C=mechCompute(m);const amt=Math.max(0,num($(t.dataset.inp)?.value,0));if(!amt){toastMsg("Type an amount first.",true);return true}
      const nv=Math.max(0,Math.min(C.hpMax,num(m.hp,C.hpMax)+num(t.dataset.d)*amt));setField(mp,"hp",nv);if(nv===0)toastMsg("The mech is down. The pilot makes a Physical save to escape.",true);render();return true}
    case "mech-style":{if(!m||!can())return true;setField(mp,"style",t.dataset.v===m.style?"":t.dataset.v);render();return true}
    case "mech-pen":{if(!m||!can())return true;setField(mp,"penalty",Math.max(0,Math.min(10,num(m.penalty)+num(t.dataset.d))));render();return true}
    case "mech-maint":{if(!m||!can())return true;if(S.confirm!=="mech-maint:"+mp){S.confirm="mech-maint:"+mp;render();return true}S.confirm=null;
      const C=mechCompute(m);setField(mp,"penalty",0);setField(mp,"fights",0);setField(mp,"ammoOut",{});setField(mp,"cellsUsed",0);toastMsg("Maintenance done ("+C.maint.toLocaleString()+" credits). Ammo refilled, penalty cleared.");render();return true}
    case "mech-ammo-check":{if(!m||!can())return true;const C=mechCompute(m);const P=C.P;const diff=6+num(m.fights);let cells=Math.max(0,C.cells-num(m.cellsUsed));
      const guns=(m.weapons||[]).filter(w=>{const W=MECH_WEAPONS.find(x=>x[0]===w.name);return W&&/Ammo/.test(W[8])&&!(m.ammoOut||{})[w.id]});
      if(!guns.length){toastMsg("No ammo-using guns that still have ammo.",true);return true}
      const out={...(m.ammoOut||{})};let used=num(m.cellsUsed);const lines=[];
      guns.forEach(w=>{const dice=[{v:rand(6),s:6},{v:rand(6),s:6}];let parts;
        if(P){const R=P.R;const lv=R.skills.shoot??-1;parts=[{l:"Shoot"+(lv<0?" (untrained)":""),v:lv},{l:"WIS",v:R.mod.wis}]}else parts=[{l:"Pilot",v:num(m.npcHit,3)-2}];
        if(C.pen)parts.push({l:"Overdue maintenance",v:C.pen});
        const tot=dice[0].v+dice[1].v+parts.reduce((s,p)=>s+p.v,0);let ok=tot>=diff;let note="vs "+diff;
        if(!ok&&cells>0){cells--;used++;ok=true;note+=" · failed, but an Ammunition Cell covers it"}
        if(!ok)out[w.id]=true;
        lines.push({name:w.name,dice,parts,total:tot,verdict:ok?["ok","Still has ammo"]:["no","Out of ammo"],note})});
      setField(mp,"ammoOut",out);setField(mp,"fights",num(m.fights)+1);setField(mp,"cellsUsed",used);
      mechEmit(mp,"After-fight ammo check",lines);render();return true}
    case "mech-escape":{if(!m||!can())return true;const C=mechCompute(m);const P=C.P;if(!P){toastMsg("No pilot assigned.",true);return true}
      const R=P.R;const t1=R.save.physical;const roll=()=>{const d={v:rand(20),s:20};return {d,ok:d.v===20||d.v>=t1}};
      let r=roll();const lines=[{name:"Physical save",dice:[r.d],parts:[],total:r.d.v,verdict:r.ok?["ok","Escaped"]:["no","Failed"],note:"needs "+t1+"+"}];
      if(!r.ok&&C.escapePod){r=roll();lines.push({name:"Escape Pod reroll",dice:[r.d],parts:[],total:r.d.v,verdict:r.ok?["ok","Escaped"]:["no","Mortally wounded"],note:"needs "+t1+"+"})}
      const hp=num(P.c.hp?.cur);lines.push({name:r.ok?"Escapes":"Mortally wounded",dice:[],parts:[],total:r.ok?Math.ceil(hp/4):0,note:r.ok?"Escapes with a quarter of current HP, rounded up ("+hp+" → "+Math.ceil(hp/4)+")":"Needs biopsionics or a lazarus patch quickly"});
      emitRoll(P.c,(m.name||"Mech")+" destroyed: escape",lines);return true}
    case "mech-new":if(!gm)return true;S.mw={step:0,name:"",hull:"Shock Suit",weapons:[],defenses:[],fittings:[],ownerSheet:t.dataset.owner||"",npc:false,npcHit:3,npcDmg:1};S.view="mechwiz";render();return true;
    case "mech-tpl":{if(!gm||!S.mw)return true;const T=MECH_TEMPLATES[num(t.dataset.i)];const one=x=>Array.isArray(x)?x:[x,0];
      Object.assign(S.mw,{name:S.mw.name||T[0],hull:T[1],weapons:T[2].map(x=>{const [n,tl]=one(x);return {id:rid(),name:n,...(tl?{tl4:true}:{})}}),defenses:T[3].map(n=>({id:rid(),name:n})),fittings:T[4].map(x=>{const [n,q]=one(x);return {id:rid(),name:n,qty:q||1}})});render();return true}
    case "mech-refit":if(!gm||!m)return true;S.mw={step:0,editing:mp,...clone({name:m.name,hull:m.hull,weapons:m.weapons||[],defenses:m.defenses||[],fittings:m.fittings||[],ownerSheet:m.ownerSheet||"",npc:!!m.npc,npcHit:m.npcHit??3,npcDmg:m.npcDmg??1,bonusPM:m.bonusPM||0})};S.view="mechwiz";render();return true;
    case "mech-del":{if(!gm||!m)return true;if(S.confirm!=="mech-del:"+mp){S.confirm="mech-del:"+mp;render();return true}S.confirm=null;deleteDoc(mp);toastMsg("Mech deleted.");render();return true}
    case "mech-dup":{if(!gm||!m)return true;const path=(S.offline?"mechs/local-":"mechs/")+rid();const C=mechCompute(m);createDoc(path,{...clone(m),name:(m.name||"Mech")+" 2",ownerSheet:"",assigned:false,hp:C.hpMax,ammoOut:{},fights:0,penalty:0,cellsUsed:0,style:"",createdAt:Date.now()});if(S.offline)S.exists[path]=true;render();return true}
    // wizard
    case "mw-step":S.mw.step=Math.max(0,Math.min(4,num(t.dataset.v)));render();window.scrollTo(0,0);return true;
    case "mw-hull":S.mw.hull=t.dataset.v;render();return true;
    case "mw-add":{const k=t.dataset.k,n=t.dataset.v;S.mw[k]=S.mw[k]||[];if(k==="fittings"){const ex=S.mw[k].find(f=>f.name===n);if(ex)ex.qty=num(ex.qty,1)+1;else S.mw[k].push({id:rid(),name:n,qty:1})}else S.mw[k].push({id:rid(),name:n});render();return true}
    case "mw-rm":{const k=t.dataset.k,i=num(t.dataset.i);const a=S.mw[k]||[];if(k==="fittings"&&num(a[i].qty,1)>1)a[i].qty--;else a.splice(i,1);render();return true}
    case "mw-tl4":{const w=(S.mw.weapons||[])[num(t.dataset.i)];if(w)w.tl4=!w.tl4;render();return true}
    case "mw-cancel":S.mw=null;S.view="mechs";render();return true;
    case "mw-finish":{const w=S.mw;const D=mechDesign(w);if(D.power>D.powerMax||D.mass>D.massMax||D.hard>D.hardMax||D.issues.length)return true;
      const data={name:(w.name||"").trim()||"Unnamed mech",hull:w.hull,weapons:w.weapons||[],defenses:w.defenses||[],fittings:w.fittings||[],ownerSheet:w.npc?"":(w.ownerSheet||""),assigned:!w.npc&&!!w.ownerSheet,npc:!!w.npc,npcHit:num(w.npcHit,3),npcDmg:num(w.npcDmg,1),bonusPM:num(w.bonusPM)};
      if(w.editing){const mp2=w.editing;Object.entries(data).forEach(([k,v])=>setField(mp2,k,v));const C=mechCompute(S.docs[mp2]);if(num(S.docs[mp2].hp,C.hpMax)>C.hpMax)setField(mp2,"hp",C.hpMax);toastMsg("Mech saved.")}
      else{const path=(S.offline?"mechs/local-":"mechs/")+rid();createDoc(path,{...data,hp:D.hpMax,ammoOut:{},fights:0,penalty:0,cellsUsed:0,style:"",notes:"",createdAt:Date.now()});if(S.offline)S.exists[path]=true;toastMsg("Mech created"+(data.assigned?" and added to "+(S.docs["sheets/"+data.ownerSheet]?.name||"the character")+"'s inventory.":"."))}
      S.mw=null;S.view="mechs";render();return true}
  }
  return false;
}

/* ---------- mech block (inventory and GM page) ---------- */
function mechBlock(mp,opt={}){
  const m=S.docs[mp];const C=mechCompute(m);const can=mechCanUse(mp);const gm=S.isGM||S.offline;const id=mp.slice(mp.indexOf("/")+1);
  const hp=num(m.hp,C.hpMax);const pct=Math.max(0,Math.min(100,Math.round(100*hp/Math.max(1,C.hpMax))));const col=pct>50?"var(--good)":pct>25?"var(--warn)":"var(--bad)";
  const rw=(k,txt)=>`<button class="rword" data-act="rule" data-key="${k}">${txt}</button>`;
  const rows=(m.weapons||[]).map(w=>{const W=MECH_WEAPONS.find(x=>x[0]===w.name)||[];const X=mechWeapParts(m,C,W);const out=(m.ammoOut||{})[w.id];
    return `<tr class="${out?"dead":""}"><td><b>${w.tl4?"TL4 ":""}${esc(w.name)}</b><div class="hint">${esc(W[8]||"")}${W[6]&&W[6]!=="Melee"?" · "+esc(W[6]):""}${out?` · <b style="color:var(--bad)">out of ammo</b>`:""}</div></td>
      <td style="white-space:nowrap">${can?`<button class="rollbtn" data-act="mech-hit" data-doc="${esc(mp)}" data-id="${esc(w.id)}" ${out?"disabled":""}>${sgn(X.bonus)}</button>`:`<span class="num">${sgn(X.bonus)}</span>`}</td>
      <td>${can?`<button class="rollbtn" data-act="mech-dmg" data-doc="${esc(mp)}" data-id="${esc(w.id)}">${esc(mwDmg(W,C.ci))}${X.mod?sgn(X.mod):""}</button>`:esc(mwDmg(W,C.ci))}</td></tr>`}).join("");
  const styles=C.st.lv?`<div class="mstyle"><span class="lbl">${rw("mech_style","Fighting style")}</span>${[["aggressive","Aggressive","+"+C.st.lv+" hit"],["defensive","Defensive","+"+C.st.lv+" AC"],["swift","Swift","+"+C.st.lv+" Speed"]].map(([k,l,b])=>`<button class="btn sm ${m.style===k?"pri":""}" data-act="mech-style" data-doc="${esc(mp)}" data-v="${k}" ${can?"":"disabled"}>${l} <span class="hint">${b}</span></button>`).join("")}</div>`:"";
  const pilot=C.P?esc(C.P.c.name||"Unnamed"):m.npc?"NPC pilot ("+sgn(num(m.npcHit,3))+" to hit)":"No pilot";
  return `<div class="frame mechblock ${hp===0?"down":""}"><div class="mhead"><span class="mtitle">${esc(m.name||"Mech")}</span><span class="hint">${esc(C.H[0])} · pilot: ${pilot}</span><span style="flex:1"></span>
      ${gm&&!opt.inSheet?`<button class="btn sm" data-act="mech-refit" data-doc="${esc(mp)}">Edit</button><button class="btn sm" data-act="mech-dup" data-doc="${esc(mp)}">Duplicate</button><button class="btn sm" style="color:var(--bad)" data-act="mech-del" data-doc="${esc(mp)}">${S.confirm==="mech-del:"+mp?"Click again":"Delete"}</button>`:gm&&opt.inSheet?`<button class="btn sm" data-act="mech-refit" data-doc="${esc(mp)}">Edit in Mechs</button>`:""}</div>
    <div class="mstats">
      <div class="mhp"><div class="hpnums"><b style="color:${col}">${hp}</b>/${C.hpMax}</div><div class="hpbar"><i style="width:${pct}%;background:${col}"></i></div>
        <div class="lbl" style="text-align:center">${rw("mech_damage","Hit points")}</div>
        ${can?`<div class="nshpctl"><button class="btn sm" style="color:var(--bad)" data-act="mech-hp" data-doc="${esc(mp)}" data-d="-1" data-inp="#mhp-${esc(id)}">Dmg</button><input id="mhp-${esc(id)}" class="inp" type="number" min="0" placeholder="0"><button class="btn sm" style="color:var(--good)" data-act="mech-hp" data-doc="${esc(mp)}" data-d="1" data-inp="#mhp-${esc(id)}">Repair</button></div>`:""}</div>
      <div><span class="lbl">AC</span><b>${C.ac}</b>${C.ecm?`<span class="hint">+2 vs vehicles</span>`:""}</div>
      <div><span class="lbl">${rw("mech_armor","Armor")}</span><b>${C.armor}</b><span class="hint">${C.ci===0?"not vs Heavy":"Heavy only"}</span></div>
      <div><span class="lbl">Speed</span><b>${C.speed}</b></div>
      <div><span class="lbl">${rw("mech_maint","Maintenance")}</span><b class="${C.pen?"bad":""}">${C.pen||"OK"}</b>${can?`<span class="mpen"><button class="iconbtn" data-act="mech-pen" data-doc="${esc(mp)}" data-d="-1" title="Less overtime">−</button><button class="iconbtn" data-act="mech-pen" data-doc="${esc(mp)}" data-d="1" title="Each 2 hours past 24: −1">+</button></span>`:""}</div>
    </div>
    ${C.ci===0&&C.P?`<p class="hint" style="margin:0">Suit: the pilot can take a hit on their own HP instead, after damage is rolled.</p>`:""}
    ${styles}
    ${rows?`<table class="shipguns mguns"><thead><tr><th>${rw("mech_attack","Weapon")}</th><th>Hit</th><th>Damage</th></tr></thead><tbody>${rows}</tbody></table>`:`<p class="hint">No weapons. The pilot can use personal weapons.</p>`}
    ${can?`<div class="nsfoot">
      ${(m.weapons||[]).some(w=>/Ammo/.test((MECH_WEAPONS.find(x=>x[0]===w.name)||[])[8]||""))?`<button class="btn sm" data-act="mech-ammo-check" data-doc="${esc(mp)}" title="Wis/Shoot vs ${6+num(m.fights)} for each ammo gun">After-fight ammo check <span class="hint">vs ${6+num(m.fights)}</span></button>`:""}
      <button class="btn sm" data-act="mech-maint" data-doc="${esc(mp)}">${S.confirm==="mech-maint:"+mp?"Pay "+C.maint.toLocaleString()+" cr?":"Maintenance cycle"}</button>
      ${hp===0&&C.P?`<button class="btn sm pri" data-act="mech-escape" data-doc="${esc(mp)}">Escape save</button>`:""}
      ${C.cells?`<span class="hint">Ammo cells: ${Math.max(0,C.cells-num(m.cellsUsed))}/${C.cells}</span>`:""}</div>`:""}
    ${(m.fittings||[]).length||(m.defenses||[]).length?`<details class="mfits"><summary class="hint">Defenses and fittings (${(m.defenses||[]).length+(m.fittings||[]).length})</summary>
      ${(m.defenses||[]).map(x=>{const D=MECH_DEFENSES.find(y=>y[0]===x.name)||[];return `<div class="sysrow"><div><b>${esc(x.name)}</b><div class="hint">${esc(D[7]||"")}</div></div></div>`}).join("")}
      ${(m.fittings||[]).map(x=>{const F=MECH_FITTINGS.find(y=>y[0]===x.name)||[];return `<div class="sysrow"><div><b>${esc(x.name)}${num(x.qty,1)>1?" ×"+num(x.qty,1):""}</b><div class="hint">${esc(F[9]||"")}</div></div></div>`}).join("")}</details>`:""}
  </div>`;
}
function renderMechsInSheet(path){const id=path.startsWith("sheets/")?path.slice(7):path;const ps=mechPaths().filter(p=>S.docs[p].ownerSheet===id&&!S.docs[p].npc);
  return ps.map(p=>`<div style="margin-top:16px">${mechBlock(p,{inSheet:true})}</div>`).join("")}

/* ---------- GM page and wizard ---------- */
function renderMechs(){
  const gm=S.isGM||S.offline;if(!gm)return `<div class="empty">Only the GM can manage mechs. Your mechs show up in your character's Inventory.</div>`;
  const all=mechPaths();const party=all.filter(p=>!S.docs[p].npc);const npc=all.filter(p=>S.docs[p].npc);
  const chars=sheetPaths().filter(p=>!S.docs[p].npc&&p.startsWith("sheets/"));
  const assign=p=>{const m=S.docs[p];return `<label class="massign"><span class="lbl">In the inventory of</span><select class="inp" data-mechowner="${esc(p)}"><option value="">Nobody (stored)</option>${chars.map(c=>`<option value="${esc(c.slice(7))}" ${m.ownerSheet===c.slice(7)?"selected":""}>${esc(S.docs[c].name||"Unnamed")}</option>`).join("")}</select></label>`};
  return `<div class="genpage"><div class="genhead"><h1 class="pagetitle" style="margin:0">Mechs</h1><span class="hint">GM only. Assigned mechs appear in that character's Inventory, where their player can use them.</span><span style="flex:1"></span><button class="btn pri" data-act="mech-new">+ New mech</button></div>
    <h3 class="msec">Party mechs</h3>${party.length?`<div class="nsgrid">${party.map(p=>`<div>${assign(p)}${mechBlock(p)}</div>`).join("")}</div>`:`<div class="empty">No party mechs yet.</div>`}
    <h3 class="msec">NPC mechs <span class="hint">only you see these</span></h3>${npc.length?`<div class="nsgrid">${npc.map(p=>mechBlock(p)).join("")}</div>`:`<div class="empty">No NPC mechs. Tick “NPC mech” in the builder to make one.</div>`}</div>`;
}
function renderMechWizard(){
  const w=S.mw;if(!w)return `<div class="empty">No mech in progress.</div>`;
  const D=mechDesign(w);const ci=D.ci;const steps=["Hull","Weapons","Defenses","Fittings","Pilot & finish"];
  const fP=D.powerMax-D.power,fM=D.massMax-D.mass,fH=D.hardMax-D.hard;const fits=(p,ms,h=0)=>p<=fP&&ms<=fM&&h<=fH;
  const bar=`<div class="frame swbud"><div class="frame-b budget">${budgetBar("Power",D.power,D.powerMax)}${budgetBar("Mass",D.mass,D.massMax)}${budgetBar("Hardpoints",D.hard,D.hardMax)}<div class="bud"><div class="budl"><span>Cost</span><b>${money(D.cost)} cr</b></div><div class="hint">Maintenance ${D.maint.toLocaleString()} per cycle</div></div></div></div>`;
  let body="";
  if(w.step===0){body=`<div class="field"><span class="lbl">Mech name</span><input class="inp" data-mw="name" value="${esc(w.name||"")}" placeholder="e.g. Achilles"></div>
    <div class="lbl" style="margin:12px 0 6px">Start from a book example (optional)</div><div class="mtpls">${MECH_TEMPLATES.map((T,i)=>`<button class="btn sm" data-act="mech-tpl" data-i="${i}">${T[0]} <span class="hint">${T[1]}</span></button>`).join("")}</div>
    <div class="hulls">${MECH_HULLS.map(h=>`<button class="hull ${w.hull===h[0]?"on":""}" data-act="mw-hull" data-v="${esc(h[0])}"><b>${h[0]}</b><span class="tag">${h[10]}</span><div class="hint">${money(h[1])} cr · HP ${h[5]} · AC ${h[6]} · Armor ${h[4]} · Speed ${h[3]}</div><div class="hint">Power ${h[7]} · Mass ${h[8]} · Hardpoints ${h[9]}</div></button>`).join("")}</div>`}
  else if(w.step===1){body=`<div class="picklist">${MECH_WEAPONS.map(W=>{const okC=ci>=mcIdx(W[7])&&(!/Psi/.test(W[8])||D.psi);const ok=okC&&fits(W[3],W[4],W[5]);
    return `<div class="pickrow ${okC?"":"na"}"><div><b>${W[0]}</b> <span class="tag">${W[7]}+</span>${/Psi/.test(W[8])?` <span class="tag">psimech</span>`:""}<div class="hint">${mwDmg(W,ci)} dmg · ${esc(W[8])}${W[9]?" · can suppress":""} · range ${W[6]}</div><div class="hint">${W[1]?money(W[1])+" cr":"Free"} · Power ${W[3]} · Mass ${W[4]} · Hardpoints ${W[5]}</div></div><button class="btn sm" data-act="mw-add" data-k="weapons" data-v="${esc(W[0])}" ${ok?"":"disabled"}>Add</button></div>`}).join("")}</div>`}
  else if(w.step===2){body=`<div class="picklist">${MECH_DEFENSES.map(X=>{const c=mfCost(X,ci);const okC=ci>=mcIdx(X[6]);const have=(w.defenses||[]).some(d=>d.name===X[0]);const ok=okC&&!have&&fits(c.power,c.mass);
    return `<div class="pickrow ${okC?"":"na"}"><div><b>${X[0]}</b> <span class="tag">${X[6]}+</span><div class="hint">${esc(X[7])}</div><div class="hint">${money(c.cost)} cr · Power ${c.power} · Mass ${c.mass}</div></div><button class="btn sm" data-act="mw-add" data-k="defenses" data-v="${esc(X[0])}" ${ok?"":"disabled"}>${have?"Added":"Add"}</button></div>`}).join("")}</div>`}
  else if(w.step===3){body=`<div class="picklist">${MECH_FITTINGS.map(F=>{const c=mfCost(F,ci);const okC=ci>=mcIdx(F[6])&&(!F[7]||D.psi);const q=(w.fittings||[]).filter(f=>f.name===F[0]).reduce((a,f)=>a+num(f.qty,1),0);const ok=okC&&(F[8]||!q)&&fits(c.power,c.mass);
    return `<div class="pickrow ${okC?"":"na"}"><div><b>${F[0]}</b> <span class="tag">${F[6]}+</span>${F[7]?` <span class="tag">psimech</span>`:""}${q?` <span class="tag on">×${q}</span>`:""}<div class="hint">${esc(F[9])}</div><div class="hint">${money(c.cost)} cr · Power ${c.power} · Mass ${c.mass}</div></div><button class="btn sm" data-act="mw-add" data-k="fittings" data-v="${esc(F[0])}" ${ok?"":"disabled"}>${!F[8]&&q?"Added":"Add"}</button></div>`}).join("")}</div>`}
  else{const chars=sheetPaths().filter(p=>!S.docs[p].npc&&p.startsWith("sheets/"));
    body=`<div class="grid2">
      <label class="chk"><input type="checkbox" data-mw="npc" ${w.npc?"checked":""}> NPC mech (only you see it)</label>
      ${w.npc?`<div class="field"><span class="lbl">NPC pilot hit bonus</span><input class="inp" type="number" data-mw="npcHit" value="${num(w.npcHit,3)}"><span class="hint">Book: +3 typical, +5 veteran, +7 elite.</span></div><div class="field"><span class="lbl">NPC damage bonus</span><input class="inp" type="number" data-mw="npcDmg" value="${num(w.npcDmg,1)}"><span class="hint">Book: +1 typical, +2 veteran or elite.</span></div>`
        :`<div class="field"><span class="lbl">Put it in the inventory of</span><select class="inp" data-mw="ownerSheet"><option value="">Nobody yet (stored)</option>${chars.map(c=>`<option value="${esc(c.slice(7))}" ${w.ownerSheet===c.slice(7)?"selected":""}>${esc(S.docs[c].name||"Unnamed")}</option>`).join("")}</select><span class="hint">That character's player can pilot it: rolls use their skills.</span></div>`}
      <div class="field"><span class="lbl">Extra power and mass</span><input class="inp" type="number" min="0" data-mw="bonusPM" value="${num(w.bonusPM)}"><span class="hint">For Mech Technician-2 (+2 to mechs they maintain) or other house bonuses.</span></div></div>
    <div class="swsum"><div><span class="lbl">Hull</span><b>${D.H[0]}</b></div><div><span class="lbl">HP</span><b>${D.hpMax}</b></div><div><span class="lbl">AC</span><b>${D.acBase}</b></div><div><span class="lbl">Armor</span><b>${D.armor}</b></div><div><span class="lbl">Speed</span><b>${D.speedBase}</b></div><div><span class="lbl">Cost</span><b>${money(D.cost)}</b></div></div>
    ${D.issues.length?`<div class="notice">${D.issues.map(esc).join("<br>")}</div>`:""}${D.power>D.powerMax||D.mass>D.massMax||D.hard>D.hardMax?`<div class="notice">Over budget: remove something to finish.</div>`:""}`}
  const chosen=w.step>=1&&w.step<=3?(()=>{const k=["","weapons","defenses","fittings"][w.step];const arr=w[k]||[];return arr.length?`<div class="frame"><div class="frame-h"><span>On this mech</span></div><div class="frame-b">${arr.map((x,i)=>`<div class="pickrow"><div><b>${x.tl4?"TL4 ":""}${esc(x.name)}</b>${k==="fittings"&&num(x.qty,1)>1?" ×"+num(x.qty,1):""}${k==="weapons"&&/^(Rocket Launcher|Heavy Machine Gun)$/.test(x.name)?` <label class="chk" style="display:inline-flex"><input type="checkbox" data-act="mw-tl4" data-i="${i}" ${x.tl4?"checked":""}> TL4 upgrade (double cost, can hurt mechs)</label>`:""}</div><button class="iconbtn" data-act="mw-rm" data-k="${k}" data-i="${i}" aria-label="Remove">×</button></div>`).join("")}</div></div>`:""})():"";
  const over=D.power>D.powerMax||D.mass>D.massMax||D.hard>D.hardMax||D.issues.length;
  return `<div class="swiz"><h2 class="pagetitle">${w.editing?"Edit mech":"New mech"}</h2>
    <nav class="swsteps">${steps.map((l,i)=>`<button class="${i===w.step?"on":""}" data-act="mw-step" data-v="${i}">${i+1}. ${l}</button>`).join("")}</nav>
    ${bar}<div class="frame"><div class="frame-b">${body}</div></div>${chosen}
    <div class="swnav"><button class="btn" data-act="mw-cancel">Cancel</button><span style="flex:1"></span>${w.step>0?`<button class="btn" data-act="mw-step" data-v="${w.step-1}">Back</button>`:""}${w.step<4?`<button class="btn pri" data-act="mw-step" data-v="${w.step+1}">Next</button>`:`<button class="btn pri" data-act="mw-finish" ${over?"disabled":""}>${w.editing?"Save mech":"Create mech"}</button>`}</div></div>`;
}
