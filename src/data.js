/* ================= BOOK DATA (SWN Revised, summarized) ================= */
const BG = {
  barbarian:{name:"Barbarian",tag:"Born of a primitive world",free:"survive",quick:["survive","notice","any_combat"],
    growth:["+1any","+2phys","+2phys","+2ment","exert","any_skill"],learning:["any_combat","connect","exert","lead","notice","punch","sneak","survive"]},
  clergy:{name:"Clergy",tag:"A consecrated man or woman",free:"talk",quick:["talk","perform","know"],
    growth:["+1any","+2ment","+2phys","+2ment","connect","any_skill"],learning:["administer","connect","know","lead","notice","perform","talk","talk"]},
  courtesan:{name:"Courtesan",tag:"Trading on pleasurable company",free:"perform",quick:["perform","notice","connect"],
    growth:["+1any","+2ment","+2ment","+2phys","connect","any_skill"],learning:["any_combat","connect","exert","notice","perform","survive","talk","trade"]},
  criminal:{name:"Criminal",tag:"Thief, rogue, liar, or worse",free:"sneak",quick:["sneak","connect","talk"],
    growth:["+1any","+2ment","+2phys","+2ment","connect","any_skill"],learning:["administer","any_combat","connect","notice","program","sneak","talk","trade"]},
  dilettante:{name:"Dilettante",tag:"With money if not purpose",free:"connect",quick:["connect","know","talk"],
    growth:["+1any","+1any","+1any","+1any","connect","any_skill"],learning:["any_skill","any_skill","connect","know","perform","pilot","talk","trade"]},
  entertainer:{name:"Entertainer",tag:"Artful and beguiling",free:"perform",quick:["perform","talk","connect"],
    growth:["+1any","+2ment","+2ment","+2phys","connect","any_skill"],learning:["any_combat","connect","exert","notice","perform","perform","sneak","talk"]},
  merchant:{name:"Merchant",tag:"Whether peddler or far trader",free:"trade",quick:["trade","talk","connect"],
    growth:["+1any","+2ment","+2ment","+2ment","connect","any_skill"],learning:["administer","any_combat","connect","fix","know","notice","trade","talk"]},
  noble:{name:"Noble",tag:"By blood or by social capital",free:"lead",quick:["lead","connect","administer"],
    growth:["+1any","+2ment","+2ment","+2ment","connect","any_skill"],learning:["administer","any_combat","connect","know","lead","notice","pilot","talk"]},
  official:{name:"Official",tag:"A functionary of some greater state",free:"administer",quick:["administer","talk","connect"],
    growth:["+1any","+2ment","+2ment","+2ment","connect","any_skill"],learning:["administer","any_skill","connect","know","lead","notice","talk","trade"]},
  peasant:{name:"Peasant",tag:"Whether primitive or high-tech",free:"exert",quick:["exert","sneak","survive"],
    growth:["+1any","+2phys","+2phys","+2phys","exert","any_skill"],learning:["connect","exert","fix","notice","sneak","survive","trade","work"]},
  physician:{name:"Physician",tag:"A healer of the sick and maimed",free:"heal",quick:["heal","know","notice"],
    growth:["+1any","+2phys","+2ment","+2ment","connect","any_skill"],learning:["administer","connect","fix","heal","know","notice","talk","trade"]},
  pilot:{name:"Pilot",tag:"Pilot, rider, sailor, or driver",free:"pilot",quick:["pilot","fix","shoot|trade"],
    growth:["+1any","+2phys","+2phys","+2ment","connect","any_skill"],learning:["connect","exert","fix","notice","pilot","pilot","shoot","trade"]},
  politician:{name:"Politician",tag:"Aspiring to leadership and control",free:"talk",quick:["talk","lead","connect"],
    growth:["+1any","+2ment","+2ment","+2ment","connect","any_skill"],learning:["administer","connect","connect","lead","notice","perform","talk","talk"]},
  scholar:{name:"Scholar",tag:"A scientist or academic",free:"know",quick:["know","connect","administer"],
    growth:["+1any","+2ment","+2ment","+2ment","connect","any_skill"],learning:["administer","connect","fix","know","notice","perform","program","talk"]},
  soldier:{name:"Soldier",tag:"Whether mercenary or conscript",free:"any_combat",quick:["any_combat","exert","survive"],
    growth:["+1any","+2phys","+2phys","+2phys","exert","any_skill"],learning:["administer","any_combat","exert","fix","lead","notice","sneak","survive"]},
  spacer:{name:"Spacer",tag:"Dwelling in the deep-space habs",free:"fix",quick:["fix","pilot","program"],
    growth:["+1any","+2phys","+2phys","+2ment","exert","any_skill"],learning:["administer","connect","exert","fix","know","pilot","program","talk"]},
  technician:{name:"Technician",tag:"Artisan, engineer, or builder",free:"fix",quick:["fix","exert","notice"],
    growth:["+1any","+2phys","+2ment","+2ment","connect","any_skill"],learning:["administer","connect","exert","fix","fix","know","notice","pilot"]},
  thug:{name:"Thug",tag:"Ruffian, or strong arm of the people",free:"any_combat",quick:["any_combat","talk","connect"],
    growth:["+1any","+2ment","+2phys","+2phys","connect","any_skill"],learning:["any_combat","connect","exert","notice","sneak","stab|shoot","survive","talk"]},
  vagabond:{name:"Vagabond",tag:"Roaming without a home",free:"survive",quick:["survive","sneak","notice"],
    growth:["+1any","+2phys","+2phys","+2ment","exert","any_skill"],learning:["any_combat","connect","notice","perform","pilot","sneak","survive","work"]},
  worker:{name:"Worker",tag:"A cube drone or day laborer",free:"work",quick:["work","connect","exert"],
    growth:["+1any","+1any","+1any","+1any","exert","any_skill"],learning:["administer","any_skill","connect","exert","fix","pilot","program","work"]}
};
const BG_ORDER = Object.keys(BG); // d20 order matches the book's table

const COMBAT_SKILLS = ["stab","shoot","punch"];
const SPEC_LABEL = {any_combat:"Any Combat",any_skill:"Any Skill",any_noncombat:"Any non-combat skill",any_psychic:"Any psychic skill","stab|shoot":"Stab or Shoot","shoot|trade":"Shoot or Trade","punch|stab":"Punch or Stab","+1any":"+1 Any Stat","+2phys":"+2 Physical","+2ment":"+2 Mental"};
function specOptions(spec){
  if(spec==="any_combat")return COMBAT_SKILLS;
  if(spec==="any_skill")return SKILLS.map(s=>s[0]);
  if(spec==="any_noncombat")return SKILLS.map(s=>s[0]).filter(k=>!COMBAT_SKILLS.includes(k));
  if(spec==="any_psychic")return PSY.map(s=>s[0]);
  if(spec&&spec.includes("|"))return spec.split("|");
  return null;
}
const specName = s=>SPEC_LABEL[s]||(SKILL[s]?SKILL[s].name:PSYK[s]?PSYK[s].name:s);

/* Foci. type: combat | noncombat | psychic | special. skill: bonus skill spec at level 1. */
const FOCI = {
  alert:{name:"Alert",type:"combat",skill:"notice",d:"Keenly aware and nearly impossible to catch off guard.",
    l1:"Can't be surprised or targeted by Execution Attacks. Roll initiative twice and keep the better result.",l2:"You always act first in a combat round, unless someone else involved is also this Alert."},
  armsman:{name:"Armsman",type:"combat",skill:"stab",d:"Unusual skill with melee and thrown weapons (not unarmed or guns).",
    l1:"Draw or sheathe a Stowed melee or thrown weapon as an Instant action. Add your Stab skill to melee and thrown weapon damage and Shock.",l2:"Your primitive melee and thrown weapons count as TL4 against advanced armor. Melee misses still deal an unmodified 1d4 damage, plus any Shock."},
  assassin:{name:"Assassin",type:"combat",skill:"sneak",d:"Practiced at sudden murder and Execution Attacks.",
    l1:"Conceal a knife- or pistol-sized object from anything short of a strip search, even TL4 scanners. Draw it as an On Turn action; point-blank shots with it from surprise can't miss.",l2:"Take a Move action in the same round as an Execution Attack, splitting it before and after the attack, too fast for bodyguards to react."},
  authority:{name:"Authority",type:"noncombat",skill:"lead",d:"An uncanny charisma that makes others follow your lead.",
    l1:"Once per day, make a request of an NPC who isn't openly hostile. On a Cha/Lead check against their Morale, they comply if it isn't harmful or wildly out of character.",l2:"NPCs you directly lead gain a Morale and hit bonus equal to your Lead skill and +1 on skill checks. Your followers won't act against you except under extreme pressure."},
  close_combatant:{name:"Close Combatant",type:"combat",skill:"any_combat",d:"Practiced at desperate close-in fighting with pistol or blade.",
    l1:"Use pistol-sized guns in melee without penalty. Ignore Shock damage from melee attackers, even when unarmored.",l2:"Your melee Shock treats every target as AC 10. Fighting Withdrawal is an On Turn action for you."},
  connected:{name:"Connected",type:"noncombat",skill:"connect",d:"Gifted at making friends and useful ties anywhere you go.",
    l1:"After a week somewhere not entirely hostile, you have contacts who'll do mildly illegal favors, one per game day.",l2:"Once per session, if plausible, you meet someone you know who'll do modest favors. You choose when and where; the GM decides who."},
  die_hard:{name:"Die Hard",type:"combat",skill:null,d:"Surprisingly hard to kill.",
    l1:"+2 maximum hit points per level (applied automatically on the sheet). You automatically stabilize when mortally wounded by anything smaller than a Heavy weapon.",l2:"The first time each day an injury would drop you to 0 HP, you stay at 1 HP instead. Doesn't work against Heavy weapons."},
  diplomat:{name:"Diplomat",type:"noncombat",skill:"talk",d:"You know how to get your way in negotiations.",
    l1:"Speak all the sector's common languages; learn new ones to a workable level in a week. Reroll 1s on negotiation and diplomacy checks.",l2:"Once per session, shift an intelligent NPC's reaction one step friendlier after talking to them for 30 seconds."},
  gunslinger:{name:"Gunslinger",type:"combat",skill:"shoot",d:"A gift with guns, bows, and other Shoot weapons.",
    l1:"Draw or holster a Stowed ranged weapon as an On Turn action. Add your Shoot skill to ranged weapon damage (applied automatically).",l2:"Once per round, reload as an On Turn action if it takes one round or less. Shoot misses still deal an unmodified 1d4 damage."},
  hacker:{name:"Hacker",type:"noncombat",skill:"program",d:"Fluent in digital security and encryption.",
    l1:"Roll 3d6 and drop the lowest on skill checks to hack a database or system.",l2:"Your hacks last 1d4 + Program skill × 10 minutes. You're always treated as familiar with any system's data protocols."},
  healer:{name:"Healer",type:"noncombat",skill:"heal",d:"Healing comes naturally, especially stopping a bleed-out.",
    l1:"Try to stabilize one adjacent mortally wounded person per round as an On Turn action. Roll 3d6 and drop the lowest on Heal checks (applied automatically).",l2:"Stims and other healing tech you apply heal double. Ten minutes of first aid heals 1d6 + Heal skill to everyone in your group, once per day each."},
  henchkeeper:{name:"Henchkeeper",type:"noncombat",skill:"lead",d:"A knack for picking up lost souls who do your bidding.",
    l1:"Find henchmen within 24 hours in a community: one per three levels, rounded up. They follow you into danger but won't fight except to save themselves.",l2:"Your henchmen are loyal and will fight for you, counting as Martial Humans. You can win over skilled NPCs you've genuinely helped."},
  ironhide:{name:"Ironhide",type:"combat",skill:null,d:"Natural defenses as good as quality combat armor.",
    l1:"Innate AC of 15 + half your level, rounded up (applied automatically). Doesn't stack with armor, though DEX and shields still apply.",l2:"Immune to unarmed attacks and primitive weapons, as if wearing powered armor."},
  psychic_training:{name:"Psychic Training",type:"psychic",skill:"any_psychic",d:"Extra training in one discipline. Psychics and Partial Psychics only.",
    l1:"Gain a psychic skill as a bonus (Partial Psychics: only your discipline). If it reaches level-1, pick a free level-1 technique. +1 max Effort (applied automatically).",l2:"Each time you level up, that discipline gets a free skill point toward its skill or a technique."},
  savage_fray:{name:"Savage Fray",type:"combat",skill:"stab",d:"A whirlwind of havoc when surrounded in melee.",
    l1:"At the end of your turn, adjacent enemies you didn't attack take your weapon's Shock damage, if their AC allows it.",l2:"After the first melee hit you take in a round, melee attacks from other assailants automatically miss you."},
  shocking_assault:{name:"Shocking Assault",type:"combat",skill:"punch|stab",d:"Your melee attacks rattle foes even when they don't land.",
    l1:"Your weapon's Shock treats all targets as AC 10 (applied automatically).",l2:"+2 to the Shock of all melee and unarmed attacks (applied automatically). Hits never do less than that Shock."},
  sniper:{name:"Sniper",type:"combat",skill:"shoot",d:"Expert at hitting an unsuspecting target from range.",
    l1:"Roll 3d6 and drop the lowest on Execution Attack and target-shooting checks.",l2:"Targets of your Execution Attack take −4 on the save against instant mortal injury, and take double damage even if they save."},
  specialist:{name:"Specialist",type:"noncombat",skill:"any_noncombat",repeat:true,d:"Remarkably talented at one non-combat skill. Can be taken again for another skill.",
    l1:"Gain the chosen skill as a bonus. Roll 3d6 and drop the lowest on all checks with it (applied automatically).",l2:"Roll 4d6 and drop the two lowest on all checks with it (applied automatically)."},
  star_captain:{name:"Star Captain",type:"noncombat",skill:"lead",d:"A natural talent for commanding a ship in combat.",
    l1:"As captain in ship combat, your ship gains 2 extra Command Points each turn.",l2:"Ships you captain gain bonus HP equal to 20% of their max each fight. Once per engagement, resolve a Crisis as an Instant action."},
  starfarer:{name:"Starfarer",type:"noncombat",skill:"pilot",d:"Expert at plotting interstellar spike drills.",
    l1:"Automatically succeed at spike drill checks of difficulty 10 or less.",l2:"Double your Pilot skill for spike drills. Drives you navigate count one level higher (max 7), and drills take half the time."},
  tinker:{name:"Tinker",type:"noncombat",skill:"fix",d:"A knack for modifying and improving equipment.",
    l1:"Your Maintenance score is doubled. Ship and gear mods cost half the credits.",l2:"Fix counts one level higher for building mods and Maintenance. Advanced mods need one fewer pretech salvage part."},
  unarmed_combatant:{name:"Unarmed Combatant",type:"combat",skill:"punch",d:"Your empty hands are deadly weapons.",
    l1:"Unarmed damage grows with Punch: 1d6 at 0, 1d8 at 1, 1d10 at 2, 1d12 at 3, 1d12+1 at 4. At Punch-1+, unarmed attacks have Shock equal to Punch vs AC 15 (applied automatically).",l2:"Unarmed attacks count as TL4 against advanced armor. Punch misses still deal an unmodified 1d6 damage."},
  unique_gift:{name:"Unique Gift",type:"special",skill:null,d:"A unique power or perk agreed with your GM. Describe it in the notes.",
    l1:"Work out the ability with your GM. It should be better than gear you could just buy.",l2:""},
  wanderer:{name:"Wanderer",type:"noncombat",skill:"survive",d:"Life on the road taught you to keep moving.",
    l1:"Convey basic ideas in all the sector's common languages. Within an hour, find free (maybe shady) transport for you and a few friends anywhere traffic goes.",l2:"Forge or scrounge travel papers for the party in 1d6 hours. Transport you find is as fast as a charter."},
  wild_psychic:{name:"Wild Psychic Talent",type:"special",skill:null,d:"A tiny spark of psychic power. Not for Psychics or Partial Psychics.",
    l1:"Gain one discipline's level-0 core power, or a stand-alone level-1 technique. You count as having 1 Effort.",l2:"Your max Effort becomes 2. Pick a second ability; it may augment the first."}
};

const DISC = {
  biopsionics:{core:"Psychic Succor",l0:"Your touch stabilizes a mortally wounded target as a Main Action, within six rounds of their collapse. Commit Effort for the day; each use adds System Strain to the target. At level-1 it also heals 1d6+1 HP.",
    t1:[["Mastered Succor","Use Psychic Succor without Committing Effort."],["Organic Purification Protocols","Psychic Succor also cures poisons and diseases, for an extra Effort for the day."],["Remote Repair","Use touch-range biopsionic powers on anyone you can see within 100 meters. Commit Effort for the scene."]]},
  metapsionics:{core:"Psychic Refinement",l0:"You see and hear psychic powers being used nearby and can tell who's using them. +2 on saves against psionic powers. At level-1 your max Effort rises by 1 (applied automatically).",
    t1:[["Cloak Powers","Hide your psychic abilities from metapsionic senses while Effort stays committed."],["Mindtracing","Trace a psychic power you noticed back to its user and see through their senses. Commit Effort for the scene."],["Synthetic Adaptation","Needs Program-0 or Fix-0. Use Telepathy or Biopsionics on VIs and True AIs."]]},
  precognition:{core:"Oracle",l0:"As a Main Action and Effort for the day, get a brief vision answering a question about your own future, up to one minute ahead (one day ahead at level-1).",
    t1:[["Intuitive Response","Commit Effort for the scene before initiative to act ahead of everyone else (unless surprised)."],["Sense the Need","Commit Effort for the day: it turns out you brought one plausible object you now need."],["Terminal Reflection","Your Oracle fires automatically just before an ambush or sudden danger, negating surprise for you and your companions."]]},
  telekinesis:{core:"Telekinetic Manipulation",l0:"Commit Effort for the scene to push and move things you can see, as if with one hand at your own strength. Can't hurt living targets. At level-1, two hands and up to 200 kg.",
    t1:[["Kinetic Transversal","Walk on walls, ceilings, and liquids while Effort stays committed."],["Pressure Field","As an Instant action, a force skin works like a vacc suit and shrugs off ±100°C."],["Telekinetic Armory","Create TL4 force weapons and armor; attack with DEX, WIS or CON and use Telekinesis as your combat skill."]]},
  telepathy:{core:"Telepathic Contact",l0:"Commit Effort for the day as a Main Action to read a visible target's emotional state. At level-1 you also understand any communication they make.",
    t1:[["Facile Mind","Open Telepathic Contacts for scene Effort instead of day Effort, and for free with allies you've practiced with."],["Transmit Thought","Send two-way thoughts and images over a Telepathic Contact."]]},
  teleportation:{core:"Personal Apportation",l0:"Teleport yourself and what you can carry up to 10 meters, to somewhere you can see or have been. Main Action, Commit Effort for the scene. Level-1 reaches 100 meters.",
    t1:[["Proficient Apportation","Personal Apportation becomes a Move action, and jumps of 10 meters or less cost no Effort."],["Spatial Awareness","Commit Effort for 360° awareness of your surroundings out to 100 meters."]]}
};

/* Gear templates (stats from the book's weapon, armor and gear tables). */
const G = {
  laser_pistol:{type:"weapon",name:"Laser Pistol",dmg:"1d6",range:"100/300",mag:10,attr:"DEX",skill:"shoot",enc:1,energy:true,tl:4},
  laser_rifle:{type:"weapon",name:"Laser Rifle",dmg:"1d10",range:"300/500",mag:20,attr:"DEX",skill:"shoot",enc:2,energy:true,burst:true,tl:4},
  combat_rifle:{type:"weapon",name:"Combat Rifle",dmg:"1d12",range:"100/300",mag:30,attr:"DEX",skill:"shoot",enc:2,burst:true,tl:3},
  spear:{type:"weapon",name:"Spear",dmg:"1d6+1",shock:"2/13",attr:"STR/DEX",skill:"stab",range:"30 (thrown)",enc:1,tl:0},
  knife:{type:"weapon",name:"Knife",dmg:"1d4",shock:"1/15",attr:"STR/DEX",skill:"stab",range:"10 (thrown)",enc:1,tl:0},
  monoblade_knife:{type:"weapon",name:"Monoblade Knife",dmg:"1d6",shock:"1/15",attr:"STR/DEX",skill:"stab",enc:1,tl:4},
  monoblade_sword:{type:"weapon",name:"Monoblade Sword",dmg:"1d8+1",shock:"2/13",attr:"STR/DEX",skill:"stab",enc:1,tl:4},
  thermal_knife:{type:"weapon",name:"Thermal Knife",dmg:"1d6",shock:"1/15",attr:"STR/DEX",skill:"stab",enc:1,tl:4},
  hide_armor:{type:"armor",name:"Primitive Hide Armor",ac:13,enc:1,tl:0},
  shield:{type:"shield",name:"Primitive Shield",ac:13,enc:2,tl:0,description:"Base AC 13, or +1 AC if your armor is already 13 or better. Needs a free hand."},
  woven:{type:"armor",name:"Woven Body Armor",ac:15,enc:2,tl:3},
  undersuit:{type:"armor",name:"Armored Undersuit",ac:13,enc:0,tl:4},
  secure:{type:"armor",name:"Secure Clothing",ac:13,enc:1,tl:4},
  vacc:{type:"armor",name:"Armored Vacc Suit",ac:13,enc:2,tl:4},
  backpack:{type:"gear",name:"Backpack (TL0)",enc:1},
  compad:{type:"gear",name:"Compad",enc:0},
  dataslab:{type:"gear",name:"Dataslab",enc:1},
  metatool:{type:"gear",name:"Metatool",enc:1},
  medkit:{type:"gear",name:"Medkit",enc:2},
  lazarus:{type:"gear",name:"Lazarus Patch",enc:1,bundle:3},
  lift:{type:"gear",name:"Lift (dose)",enc:0},
  bioscanner:{type:"gear",name:"Bioscanner",enc:1},
  toolkit:{type:"gear",name:"Postech Toolkit",enc:1},
  spare_parts:{type:"gear",name:"Spare Parts (unit)",enc:1,bundle:3},
  line_shunt:{type:"gear",name:"Line Shunt",enc:0},
  survey:{type:"gear",name:"Survey Scanner",enc:1},
  survival:{type:"gear",name:"Survival Kit",enc:1},
  binoculars:{type:"gear",name:"Binoculars (TL3)",enc:1},
  harness:{type:"gear",name:"Climbing Harness",enc:1},
  goggles:{type:"gear",name:"Low-light Goggles",enc:1},
  rations:{type:"gear",name:"Rations (1 day)",enc:1,bundle:3},
  rope:{type:"gear",name:"Rope, 20m (TL0)",enc:2},
  cells:{type:"gear",name:"Type A Power Cell",enc:1,bundle:3},
  ammo:{type:"gear",name:"Ammo (20 rounds)",enc:1,bundle:3}
};
const PACKAGES = {
  barbarian:{name:"Barbarian",items:[["spear"],["hide_armor"],["shield"],["knife"],["backpack"],["rations",7],["rope"]],credits:500},
  blade:{name:"Blade",items:[["monoblade_sword"],["woven"],["secure"],["thermal_knife"],["backpack"],["compad"],["lazarus"]],credits:50},
  thief:{name:"Thief",items:[["laser_pistol"],["undersuit"],["monoblade_knife"],["harness"],["goggles"],["cells",2],["backpack"],["compad"],["metatool"]],credits:25},
  hacker:{name:"Hacker",items:[["laser_pistol"],["secure"],["toolkit"],["spare_parts",3],["cells",2],["dataslab"],["metatool"],["line_shunt",2]],credits:100},
  gunslinger:{name:"Gunslinger",items:[["laser_pistol"],["undersuit"],["monoblade_knife"],["cells",8],["backpack"],["compad"]],credits:100},
  soldier:{name:"Soldier",items:[["combat_rifle"],["woven"],["knife"],["ammo",4],["backpack"],["compad"]],credits:100},
  scout:{name:"Scout",items:[["laser_rifle"],["vacc"],["knife"],["survey"],["survival"],["binoculars"],["cells",8],["backpack"],["compad"]],credits:25},
  medic:{name:"Medic",items:[["laser_pistol"],["secure"],["lazarus",4],["lift",2],["backpack"],["medkit"],["compad"],["bioscanner"]],credits:25},
  civilian:{name:"Civilian",items:[["secure"],["compad"]],credits:700},
  technician:{name:"Technician",items:[["laser_pistol"],["undersuit"],["monoblade_knife"],["toolkit"],["spare_parts",6],["cells",4],["backpack"],["dataslab"],["metatool"]],credits:200}
};
function gearItem(key,qty){
  const t=G[key];const it={id:rid(),qty:1,location:"stowed",equipped:false,mods:[],description:"",...clone(t)};
  const q=qty||1;
  if(t.bundle&&q>1){it.qty=q;it.enc=Math.ceil(q/t.bundle);it.encFixed=true}else it.qty=q;
  if(t.type==="weapon"){it.location="readied";it.equipped=true;it.ammo=num(t.mag);it.shock=t.shock||"";it.range=t.range||"";it.mag=num(t.mag)}
  if(t.type==="armor"||t.type==="shield"){it.equipped=true;it.location="readied"}
  delete it.bundle;
  return it;
}
