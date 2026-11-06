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
const SPEC_LABEL = {specialist_any:"Any non-psychic skill (house rule)",any_combat:"Any Combat",any_skill:"Any Skill",any_noncombat:"Any non-combat skill",any_psychic:"Any psychic skill","stab|shoot":"Stab or Shoot","shoot|trade":"Shoot or Trade","punch|stab":"Punch or Stab","+1any":"+1 Any Stat","+2phys":"+2 Physical","+2ment":"+2 Mental"};
function specOptions(spec){
  if(spec==="any_combat")return COMBAT_SKILLS;
  if(spec==="any_skill")return SKILLS.map(s=>s[0]);
  if(spec==="specialist_any")return SKILLS.map(s=>s[0]);
  if(spec==="any_noncombat")return SKILLS.map(s=>s[0]).filter(k=>!COMBAT_SKILLS.includes(k));
  if(spec==="any_psychic")return PSY.map(s=>s[0]);
  if(spec&&spec.includes("|"))return spec.split("|");
  return null;
}
const specName = s=>SPEC_LABEL[s]||(SKILL[s]?SKILL[s].name:PSYK[s]?PSYK[s].name:s);

/* Foci. type: combat | noncombat | psychic | special. skill: bonus skill spec at level 1. */
const FOCI = {
  alert:{name:"Alert",type:"combat",skill:"notice",d:"You are keenly aware of your surroundings and nearly impossible to catch unaware.",
    l1:"Can't be surprised or targeted by Execution Attacks. Roll initiative twice and keep the better result.",l2:"You always act first in a combat round, unless someone else involved is also this Alert."},
  armsman:{name:"Armsman",type:"combat",skill:"stab",d:"Unusual competence with melee and thrown weapons. Doesn't apply to unarmed attacks or projectile weapons.",
    l1:"Draw or sheathe a Stowed melee or thrown weapon as an Instant action. Add your Stab skill to melee and thrown weapon damage and Shock.",l2:"Your primitive melee and thrown weapons count as TL4 against advanced armor. Melee misses still deal an unmodified 1d4 damage, plus any Shock."},
  assassin:{name:"Assassin",type:"combat",skill:"sneak",d:"Practiced at sudden murder, with advantages when making an Execution Attack.",
    l1:"Conceal a knife- or pistol-sized object from anything short of a strip search, even TL4 scanners. Draw it as an On Turn action; point-blank shots with it from surprise can't miss.",l2:"Take a Move action in the same round as an Execution Attack, splitting it before and after the attack, too fast for bodyguards to react."},
  authority:{name:"Authority",type:"noncombat",skill:"lead",d:"An uncanny charisma that makes others instinctively follow your instructions.",
    l1:"Once per day, make a request of an NPC who isn't openly hostile. On a Cha/Lead check against their Morale, they comply if it isn't harmful or wildly out of character.",l2:"NPCs you directly lead gain a Morale and hit bonus equal to your Lead skill and +1 on skill checks. Your followers won't act against you except under extreme pressure."},
  close_combatant:{name:"Close Combatant",type:"combat",skill:"any_combat",d:"Practiced at desperate close-in fighting with pistol or blade.",
    l1:"Use pistol-sized guns in melee without penalty. Ignore Shock damage from melee attackers, even when unarmored.",l2:"Your melee Shock treats every target as AC 10. Fighting Withdrawal is an On Turn action for you."},
  connected:{name:"Connected",type:"noncombat",skill:"connect",d:"Remarkably gifted at making friends and forging ties with the people around you.",
    l1:"After a week somewhere not entirely hostile, you have contacts who'll do mildly illegal favors, one per game day.",l2:"Once per session, if plausible, you meet someone you know who'll do modest favors. You choose when and where; the GM decides who."},
  die_hard:{name:"Die Hard",type:"combat",skill:null,d:"Surprisingly hard to kill.",
    l1:"+2 maximum hit points per level (applied automatically on the sheet). You automatically stabilize when mortally wounded by anything smaller than a Heavy weapon.",l2:"The first time each day an injury would drop you to 0 HP, you stay at 1 HP instead. Doesn't work against Heavy weapons."},
  diplomat:{name:"Diplomat",type:"noncombat",skill:"talk",d:"You know how to get your way in personal negotiations.",
    l1:"Speak all the sector's common languages; learn new ones to a workable level in a week. Reroll 1s on negotiation and diplomacy checks.",l2:"Once per session, shift an intelligent NPC's reaction one step friendlier after talking to them for 30 seconds."},
  gunslinger:{name:"Gunslinger",type:"combat",skill:"shoot",d:"A gift with a gun. Also works with bows, thrown weapons, and anything else that uses Shoot.",
    l1:"Draw or holster a Stowed ranged weapon as an On Turn action. Add your Shoot skill to ranged weapon damage (applied automatically).",l2:"Once per round, reload as an On Turn action if it takes one round or less. Shoot misses still deal an unmodified 1d4 damage."},
  hacker:{name:"Hacker",type:"noncombat",skill:"program",d:"Considerable fluency with digital security and standard encryption.",
    l1:"Roll 3d6 and drop the lowest on skill checks to hack a database or system.",l2:"Your hacks last 1d4 + Program skill × 10 minutes. You're always treated as familiar with any system's data protocols."},
  healer:{name:"Healer",type:"noncombat",skill:"heal",d:"Healing comes naturally to you, especially keeping wounded allies from bleeding out.",
    l1:"Try to stabilize one adjacent mortally wounded person per round as an On Turn action. Roll 3d6 and drop the lowest on Heal checks (applied automatically).",l2:"Stims and other healing tech you apply heal double. Ten minutes of first aid heals 1d6 + Heal skill to everyone in your group, once per day each."},
  henchkeeper:{name:"Henchkeeper",type:"noncombat",skill:"lead",d:"A knack for picking up lost souls who willingly do your bidding.",
    l1:"Find henchmen within 24 hours in a community: one per three levels, rounded up. They follow you into danger but won't fight except to save themselves.",l2:"Your henchmen are loyal and will fight for you, counting as Martial Humans. You can win over skilled NPCs you've genuinely helped."},
  ironhide:{name:"Ironhide",type:"combat",skill:null,d:"Natural defenses equal to high-quality combat armor.",
    l1:"Innate AC of 15 + half your level, rounded up (applied automatically). Doesn't stack with armor, though DEX and shields still apply.",l2:"Immune to unarmed attacks and primitive weapons, as if wearing powered armor."},
  psychic_training:{name:"Psychic Training",type:"psychic",skill:"any_psychic",d:"Special training in one psychic discipline. Psychics and Partial Psychics only.",
    l1:"Gain a psychic skill as a bonus (Partial Psychics: only your discipline). If it reaches level-1, pick a free level-1 technique. +1 max Effort (applied automatically).",l2:"Each time you level up, that discipline gets a free skill point toward its skill or a technique."},
  savage_fray:{name:"Savage Fray",type:"combat",skill:"stab",d:"A whirlwind of bloody havoc in melee, able to survive being surrounded.",
    l1:"At the end of your turn, adjacent enemies you didn't attack take your weapon's Shock damage, if their AC allows it.",l2:"After the first melee hit you take in a round, melee attacks from other assailants automatically miss you."},
  shocking_assault:{name:"Shocking Assault",type:"combat",skill:"punch|stab",d:"Your melee attacks stress and distract enemies even when they don't draw blood.",
    l1:"Your weapon's Shock treats all targets as AC 10 (applied automatically).",l2:"+2 to the Shock of all melee and unarmed attacks (applied automatically). Hits never do less than that Shock."},
  sniper:{name:"Sniper",type:"combat",skill:"shoot",d:"An expert at placing a bullet or beam on an unsuspecting target.",
    l1:"Roll 3d6 and drop the lowest on Execution Attack and target-shooting checks.",l2:"Targets of your Execution Attack take −4 on the save against instant mortal injury, and take double damage even if they save."},
  specialist:{name:"Specialist",type:"noncombat",skill:"any_noncombat",repeat:true,d:"Remarkably talented at one non-combat skill. Can be taken more than once for different skills.",
    l1:"Gain the chosen skill as a bonus. Roll 3d6 and drop the lowest on all checks with it (applied automatically).",l2:"Roll 4d6 and drop the two lowest on all checks with it (applied automatically)."},
  star_captain:{name:"Star Captain",type:"noncombat",skill:"lead",d:"A tremendous natural talent for ship combat.",
    l1:"As captain in ship combat, your ship gains 2 extra Command Points each turn.",l2:"Ships you captain gain bonus HP equal to 20% of their max each fight. Once per engagement, resolve a Crisis as an Instant action."},
  starfarer:{name:"Starfarer",type:"noncombat",skill:"pilot",d:"An expert at plotting and executing interstellar spike drills.",
    l1:"Automatically succeed at spike drill checks of difficulty 10 or less.",l2:"Double your Pilot skill for spike drills. Drives you navigate count one level higher (max 7), and drills take half the time."},
  tinker:{name:"Tinker",type:"noncombat",skill:"fix",d:"A knack for modifying and improving equipment.",
    l1:"Your Maintenance score is doubled. Ship and gear mods cost half the credits.",l2:"Fix counts one level higher for building mods and Maintenance. Advanced mods need one fewer pretech salvage part."},
  unarmed_combatant:{name:"Unarmed Combatant",type:"combat",skill:"punch",d:"Your empty hands are more dangerous than knives and guns in less gifted hands.",
    l1:"Unarmed damage grows with Punch: 1d6 at 0, 1d8 at 1, 1d10 at 2, 1d12 at 3, 1d12+1 at 4. At Punch-1+, unarmed attacks have Shock equal to Punch vs AC 15 (applied automatically).",l2:"Unarmed attacks count as TL4 against advanced armor. Punch misses still deal an unmodified 1d6 damage."},
  unique_gift:{name:"Unique Gift",type:"special",skill:null,d:"Something a normal human simply can't do, worked out with your GM. Describe it in the notes.",
    l1:"Work out the ability with your GM. It should be better than gear you could just buy.",l2:""},
  wanderer:{name:"Wanderer",type:"noncombat",skill:"survive",d:"Your hero gets around, and knows how to keep moving and survive life on the road.",
    l1:"Convey basic ideas in all the sector's common languages. Within an hour, find free (maybe shady) transport for you and a few friends anywhere traffic goes.",l2:"Forge or scrounge travel papers for the party in 1d6 hours. Transport you find is as fast as a charter."},
  wild_psychic:{name:"Wild Psychic Talent",type:"special",skill:null,d:"A very mild form of psychic ability that allows one limited psychic effect. Not for Psychics or Partial Psychics.",
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
  cells:{type:"gear",name:"Type A Power Cell",enc:1,bundle:6},
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
  const t=G[key];const it={id:rid(),qty:1,location:"stowed",mods:[],description:"",...clone(t)};
  const q=qty||1;
  if(t.bundle&&q>1){it.qty=q;it.enc=Math.ceil(q/t.bundle);it.encFixed=true}else it.qty=q;
  if(t.type==="weapon"){it.location="readied";it.ammo=num(t.mag);it.shock=t.shock||"";it.range=t.range||"";it.mag=num(t.mag)}
  if(t.type==="armor"||t.type==="shield")it.location="readied";
  delete it.bundle;
  return it;
}

/* All psychic techniques by discipline: [name, level, summary] */
const TECHS = {
  biopsionics:[["Mastered Succor",1,"Use Psychic Succor without Committing Effort."],["Organic Purification Protocols",1,"Psychic Succor also cures poisons and diseases, for an extra Effort for the day."],["Remote Repair",1,"Use touch-range biopsionic powers on anyone you can see within 100 meters. Commit Effort for the scene."],
    ["Invincible Stand",2,"As an Instant action, Commit Effort for the scene to keep yourself or someone you touch active even at 0 HP."],["Major Organ Restoration",2,"Psychic Succor can regrow limbs and organs, fix birth defects, and stabilize even catastrophic injuries if used quickly."],["Tissue Integrity Field",2,"Psychic Succor also affects all willing allies within 10 meters of the target."],
    ["Accelerated Succor",3,"Psychic Succor becomes an On Turn power (once per round), or Instant for an extra Effort for the day."],["Metamorph",3,"Reshape your own or a willing target's body into any humanoid form within 50% of their mass, with natural weapons, armor, or gills."],["Teratic Overload",3,"Touch attack: 1d6 damage per Biopsionics level; on a failed Physical save the damage triples and a lethal cancer takes hold. Commit Effort for the scene."],
    ["Holistic Optimization Patterning",4,"On Turn: drastically boost your own or an ally's physical abilities for the scene, at 2 System Strain."],["Quintessential Reconstruction",4,"If killed, you regenerate from your largest remaining piece over 24 hours."]],
  metapsionics:[["Cloak Powers",1,"Hide your psychic abilities from metapsionic senses while Effort stays committed."],["Mindtracing",1,"Trace a psychic power you noticed back to its user and see through their senses. Commit Effort for the scene."],["Synthetic Adaptation",1,"Needs Program-0 or Fix-0. Use Telepathy or Biopsionics on VIs and True AIs."],
    ["Neural Trap",2,"Voluntarily fail a save against a hostile power; your next power against that psychic allows no save."],["Psychic Static",2,"As an Instant, Commit Effort for the day to negate a psychic power you perceive. The user can spend Effort to resist."],["Suspended Manifestation",2,"Hang a prepared power in your mind and release it later as an Instant action."],
    ["Concert of Minds",3,"Form a gestalt with willing psychics nearby to share Effort and powers."],["Metadimensional Friction",3,"Make a visible psychic take 1d8 damage per Metapsionics level each time they use Effort. Commit Effort for the scene."],["Psychic Tutelage",3,"Safely train untrained psychics, buffering them from the dangers of their powers."],["Surge Momentum",3,"For Effort for the day, targets of your power take a penalty on their save, and weak minds can be crushed outright."],
    ["Flawless Mastery",4,"Pick one technique you know; it never needs Effort again."],["Impervious Pavis of Will",4,"Pick a discipline: you become immune to its unwanted powers."]],
  precognition:[["Intuitive Response",1,"Commit Effort for the scene before initiative to act ahead of everyone else (unless surprised)."],["Sense the Need",1,"Commit Effort for the day: it turns out you brought one plausible object you now need."],["Terminal Reflection",1,"Your Oracle fires automatically just before an ambush or sudden danger, negating surprise for you and your companions."],
    ["Alternate Outcome",2,"As an Instant, Commit Effort for the day to let yourself or a visible ally reroll a failed hit roll, save, or skill check."],["Destiny's Shield",2,"As an Instant, Commit Effort for the day to force an attacker to reroll a successful hit against you."],
    ["Anguished Vision",3,"As an Instant, declare that what just happened was a vision of the future and rewind a few seconds. Effort for the day."],["Cursed Luck",3,"A visible target rolls everything twice and takes the worse result, and attacks against it roll twice and take the better. Effort for the scene."],["Forced Outcome",3,"Completely control a simple random physical event nearby. Effort for the scene."],
    ["Not My Time",4,"When you're about to die, chance conspires to keep you alive. Effort for the day."],["Prophecy",4,"Make one prediction about your own future within a year, and it comes true if you take reasonable steps."]],
  telekinesis:[["Kinetic Transversal",1,"Walk on walls, ceilings, and liquids while Effort stays committed."],["Pressure Field",1,"As an Instant action, a force skin works like a vacc suit and shrugs off ±100°C."],["Telekinetic Armory",1,"Create TL4 force weapons and armor; attack with DEX, WIS or CON and use Telekinesis as your combat skill."],
    ["Impact Sump",2,"Once per day, as an Instant, negate one instance of physical damage, even after it's rolled."],["Slip Field",2,"Make a 10-meter area frictionless; targets must save or be stuck in place. Effort for the scene."],["Telekinetic Expertise",2,"Use Telekinetic Manipulation without Committing Effort."],["Thermokinesis",2,"Heat or chill an inanimate object enough to melt, ignite, or freeze it."],
    ["Reactive Telekinesis",3,"When an attacker misses you, reflect the attack back at them. Effort for the scene."],["Tangible Force Construct",3,"Create a solid force object up to a three-meter cube. Effort for the scene."],["Telekinetic Ram",3,"A huge delayed burst of force at a target in sight, detonating at the end of next round. Effort for the scene."],
    ["Force Puppetry",4,"Take control of a visible target's movement, up to car-sized; sapient targets get a Mental save. Effort for the day."],["Telekinetic Flight",4,"Fly at double move, carrying up to six willing allies."]],
  telepathy:[["Facile Mind",1,"Open Telepathic Contacts for scene Effort instead of day Effort, and for free with allies you've practiced with."],["Transmit Thought",1,"Send two-way thoughts and images over a Telepathic Contact."],
    ["Far Thought",2,"Reconnect with someone you've contacted before at long range (100 km, more at higher skill)."],["Suppress Cognition",2,"Make a contacted target simply not think about one thing or person. Effort for the scene."],
    ["Reflex Response",3,"Force a sudden irrational impulse into a contacted target; Mental save resists. Effort for the day."],["Telepathic Assault",3,"Blast a contacted target's mind for 6d6 damage (9d6 at Telepathy-4); Mental save for half. Effort for the day."],
    ["Memory Editing",4,"Erase or alter up to 24 hours of a contacted target's memories."],["Unity of Thought",4,"Link up to six willing allies into one shared Telepathic Contact."]],
  teleportation:[["Proficient Apportation",1,"Personal Apportation becomes a Move action, and jumps of 10 meters or less cost no Effort."],["Spatial Awareness",1,"Commit Effort for 360° awareness of your surroundings out to 100 meters."],
    ["Burdened Apportation",2,"Carry up to three willing companions per Teleportation level when you teleport."],["Perceptive Dislocation",2,"Commit Effort for the day to sense any location you could teleport to, as if you were there."],["Spatial Synchrony Mandala",2,"Imprint an object or person; you always know where it is and can teleport to it."],
    ["Effortless Apportation",3,"Personal Apportation no longer needs Effort."],["Stutterjump",3,"For extra Effort, teleport again as an On Turn action even if you already did this round."],["Rift Reduplication",3,"Micro-teleport away from attacks for a base AC of 20 while Effort stays committed."],
    ["Deep Intrusion",4,"Blind-teleport into a building, vehicle, or nearby spaceship you can see."],["Offensive Apportation",4,"Teleport an unwilling target you touch (Punch hit if they resist)."]]
};

/* Rulebook weapons and armor. Ranged: [name,dmg,range,cost,mag,enc,tl,flags]; e=energy, b=burst */
const BOOK_RANGED=[["Primitive Bow","1d6","50/75",15,1,2,1,""],["Advanced Bow","1d6","100/150",50,1,2,3,""],["Conversion Bow","1d8","150/300",500,1,2,4,""],
  ["Grenade","2d6","10/30",25,0,1,3,""],["Crude Pistol","1d6","5/15",20,1,1,2,""],["Musket","1d12","25/50",30,1,2,2,""],["Revolver","1d8","30/100",50,6,1,2,""],
  ["Rifle","1d10+2","200/400",75,6,2,2,""],["Shotgun","3d4","10/30",50,2,2,2,""],["Semi-Auto Pistol","1d6+1","30/100",75,12,1,3,""],["Submachine Gun","1d8","30/100",200,20,1,3,"b"],
  ["Combat Rifle","1d12","100/300",300,30,2,3,"b"],["Combat Shotgun","3d4","10/30",300,12,2,3,"b"],["Sniper Rifle","2d8","1000/2000",400,1,2,3,""],["Void Carbine","2d6","100/300",400,10,2,4,""],
  ["Mag Pistol","2d6+2","100/300",400,6,1,4,""],["Mag Rifle","2d8+2","300/600",500,10,2,4,""],["Spike Thrower","3d8","20/40",600,15,2,4,"b"],
  ["Laser Pistol","1d6","100/300",200,10,1,4,"e"],["Laser Rifle","1d10","300/500",300,20,2,4,"eb"],["Thermal Pistol","2d6","25/50",300,5,1,4,"e"],["Plasma Projector","2d8","50/100",400,6,2,4,"e"],
  ["Shear Rifle","2d8","100/300",600,10,2,5,"eb"],["Thunder Gun","2d10","100/300",1000,6,2,5,"e"],["Distortion Cannon","2d12","100/300",1250,6,2,5,"e"]];
/* Melee: [name,dmg,shock,attr,cost,enc,tl] */
const BOOK_MELEE=[["Small Primitive Weapon (knife, club)","1d4","1/15","STR/DEX",0,1,0],["Medium Primitive Weapon (sword, axe, spear)","1d6+1","2/13","STR/DEX",20,1,0],["Large Primitive Weapon (greatsword, halberd)","1d8+1","2/15","STR",30,2,0],
  ["Small Advanced Weapon (monoblade knife)","1d6","1/15","STR/DEX",40,1,4],["Medium Advanced Weapon (monoblade sword)","1d8+1","2/13","STR/DEX",60,1,4],["Large Advanced Weapon (power hammer)","1d10+1","2/15","STR",80,2,4],
  ["Stun Baton","1d8","1/15","STR/DEX",50,1,4],["Suit Ripper","1d6","","STR/DEX",75,1,4]];
/* Heavy: [name,dmg,range,cost,mag,enc,tl] (Shoot skill, need a mount unless noted) */
const BOOK_HEAVY=[["Heavy Machine Gun","3d6","500/2000",5000,10,3,3],["Rocket Launcher","3d10","2000/4000",4000,1,2,3],["Demo Charge","3d10","20/40",250,0,1,3],["Railgun","3d8","4000/8000",8000,20,0,4],
  ["Anti-Vehicle Laser","3d10","2000/4000",10000,15,0,4],["Hydra Array","3d6","4000/8000",20000,10,0,4],["Wheatcutter Belt","2d12","10/20",10000,5,0,4],["Vortex Cannon","5d12","1000/2000",75000,5,0,5]];
/* Armor: [name,ac,cost,enc,tl,type] */
const BOOK_ARMOR=[["Primitive Shield",13,10,2,0,"shield"],["Leather Jack / Hides",13,10,1,0,"armor"],["Cuirass / Brigandine",15,50,1,1,"armor"],["Full Plate",17,100,2,1,"armor"],
  ["Warpaint",12,300,0,4,"armor"],["Armored Undersuit",13,600,0,4,"armor"],["Secure Clothing",13,300,1,4,"armor"],["Armored Vacc Suit",13,400,2,4,"armor"],["Deflector Array",18,30000,0,5,"armor"],
  ["Force Pavis",15,10000,1,5,"shield"],["Security Armor",14,700,1,4,"armor"],["Woven Body Armor",15,400,2,3,"armor"],["Combat Field Uniform",16,1000,1,4,"armor"],["Icarus Harness",16,8000,1,4,"armor"],
  ["Vestimentum",18,15000,0,5,"armor"],["Assault Suit",18,10000,2,4,"armor"],["Storm Armor",19,20000,2,5,"armor"],["Field Emitter Panoply",20,40000,1,5,"armor"]];
function bookItems(){
  const L=[];
  BOOK_RANGED.forEach(([n,d,r,c,m,e,t,f])=>L.push({bk:"r:"+n,group:"Ranged weapons",type:"weapon",name:n,dmg:d,range:r,cost:c,mag:m,enc:e,tl:t,attr:"DEX",skill:"shoot",shock:"",energy:f.includes("e"),burst:f.includes("b")}));
  BOOK_MELEE.forEach(([n,d,s,a,c,e,t])=>L.push({bk:"m:"+n,group:"Melee weapons",type:"weapon",name:n,dmg:d,shock:s,attr:a,cost:c,enc:e,tl:t,skill:"stab",range:"",mag:0}));
  BOOK_HEAVY.forEach(([n,d,r,c,m,e,t])=>L.push({bk:"h:"+n,group:"Heavy weapons",type:"weapon",name:n,dmg:d,range:r,cost:c,mag:m,enc:e,tl:t,attr:"DEX",skill:"shoot",shock:"",heavy:true,description:"Heavy weapon: usually needs a mount or vehicle to fire."}));
  BOOK_ARMOR.forEach(([n,a,c,e,t,ty])=>L.push({bk:"a:"+n,group:"Armor & shields",type:ty,name:n,ac:a,cost:c,enc:e,tl:t,description:ty==="shield"?"Base AC "+a+", or +1 if your armor is already that good. Needs a free hand.":""}));
  return L;
}
