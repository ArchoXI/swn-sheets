/* ================= STARSHIPS ================= */
// Book tables (Building a Starship, pp. 94-103).
// Hulls: [name, cost, speed, armor, hp, crewMin, crewMax, ac, power, mass, hardpoints, class]
const SHIP_HULLS=[
  ["Strike Fighter",200e3,5,5,8,1,1,16,5,2,1,"Fighter"],["Shuttle",200e3,3,0,15,1,10,11,3,5,1,"Fighter"],
  ["Free Merchant",500e3,3,2,20,1,6,14,10,15,2,"Frigate"],["Patrol Boat",2.5e6,4,5,25,5,20,14,15,10,4,"Frigate"],
  ["Corvette",4e6,2,10,40,10,40,13,15,15,6,"Frigate"],["Heavy Frigate",7e6,1,10,50,30,120,15,25,20,8,"Frigate"],
  ["Bulk Freighter",5e6,0,0,40,10,40,11,15,25,2,"Cruiser"],["Fleet Cruiser",10e6,1,15,60,50,200,14,50,30,10,"Cruiser"],
  ["Battleship",50e6,0,20,100,200,1000,16,75,50,15,"Capital"],["Carrier",60e6,0,10,75,300,1500,14,50,100,4,"Capital"],
  ["Small Station",5e6,null,5,120,20,200,11,50,40,10,"Cruiser"],["Large Station",40e6,null,20,120,100,1000,17,125,75,30,"Capital"]];
const SHIP_CLASSES=["Fighter","Frigate","Cruiser","Capital"];
// Fittings: [name, cost, cost scales (*), power, power scales (#), mass, mass scales (#), min class, effect]
const SHIP_FITTINGS=[
  ["Advanced lab",10e3,1,1,1,2,0,"Frigate","Skill bonus for analysis and research"],
  ["Advanced nav computer",10e3,1,1,1,0,0,"Frigate","+2 on drills along familiar spike courses"],
  ["Amphibious operation",25e3,1,1,0,1,1,"Fighter","Can land and can operate under water"],
  ["Armory",10e3,1,0,0,0,0,"Frigate","Weapons and armor for the crew"],
  ["Atmospheric configuration",5e3,1,0,0,1,1,"Fighter","Can land. Frigates and fighters only, and only when built."],
  ["Auto-targeting system",50e3,0,1,0,0,0,"Fighter","Fires one weapon system without a gunner"],
  ["Automation support",10e3,1,2,0,1,0,"Fighter","Ship can use simple robots as crew"],
  ["Boarding tubes",5e3,1,0,0,1,0,"Frigate","Allows boarding of a hostile disabled ship"],
  ["Cargo lighter",25e3,0,0,0,2,0,"Frigate","Orbit-to-surface cargo shuttle"],
  ["Cargo space",0,0,0,0,1,0,"Fighter","Pressurized cargo: 2 tons per mass on a fighter, 20 frigate, 200 cruiser, 2,000 capital"],
  ["Cold sleep pods",5e3,1,1,0,1,0,"Frigate","Keeps occupants in stasis"],
  ["Colony core",100e3,1,4,0,2,1,"Frigate","Ship can be deconstructed into a colony base"],
  ["Drill course regulator",25e3,1,1,1,1,0,"Frigate","Common drill routes become automatic successes"],
  ["Drop pod",300e3,0,0,0,2,0,"Frigate","Stealthed landing pod for troops"],
  ["Emissions dampers",25e3,1,1,1,1,1,"Fighter","+2 to skill checks to avoid detection"],
  ["Exodus bay",50e3,1,1,1,2,1,"Cruiser","Houses vast numbers of cold sleep passengers"],
  ["Extended life support",5e3,1,1,1,1,1,"Fighter","Doubles maximum crew size"],
  ["Extended medbay",5e3,1,1,0,1,0,"Frigate","Can provide medical care to more patients"],
  ["Extended stores",2.5e3,1,0,0,1,1,"Fighter","Maximum life support duration is doubled"],
  ["Fuel bunkers",2.5e3,1,0,0,1,0,"Fighter","Fuel for one more drill between refuelings"],
  ["Fuel scoops",5e3,1,2,0,1,1,"Frigate","Can scoop fuel from a gas giant or star"],
  ["Hydroponic production",10e3,1,1,1,2,1,"Cruiser","Ship produces life support resources"],
  ["Lifeboats",2.5e3,1,0,0,1,0,"Frigate","Emergency escape craft for the crew"],
  ["Luxury cabins",10e3,1,1,0,1,1,"Frigate","10% of the max crew get luxurious quarters"],
  ["Mobile extractor",50e3,0,2,0,1,0,"Frigate","Space mining and refinery fittings"],
  ["Mobile factory",50e3,1,3,0,2,1,"Cruiser","Self-sustaining factory and repair facilities"],
  ["Precognitive nav chamber",100e3,1,1,0,0,0,"Frigate","Lets a precog assist in navigation"],
  ["Psionic anchorpoint",0,0,3,0,0,0,"Frigate","Focal point for allied psychics' powers (special cost)"],
  ["Sensor mask",10e3,1,1,1,0,0,"Frigate","At long distances, disguise ship as another"],
  ["Ship bay/fighter",200e3,0,0,0,2,0,"Cruiser","Carrier housing for a fighter"],
  ["Ship bay/frigate",1e6,0,1,0,4,0,"Capital","Carrier housing for a frigate"],
  ["Ship's locker",2e3,1,0,0,0,0,"Frigate","General equipment for the crew"],
  ["Shiptender mount",25e3,1,1,0,1,0,"Frigate","Lets another ship hitch on the spike drive"],
  ["Smuggler's hold",2.5e3,1,0,0,1,0,"Fighter","Small amount of well-hidden cargo space"],
  ["Survey sensor array",5e3,1,2,0,1,0,"Frigate","Improved planetary sensor array"],
  ["System drive",0,0,-1,1,-2,1,"Fighter","Replaces the spike drive with a small system drive (no drilling). Frees power and mass."],
  ["Teleportation pads",0,0,1,0,1,0,"Frigate","Pretech teleportation to and from the ship (special cost)"],
  ["Tractor beams",10e3,1,2,0,1,0,"Frigate","Manipulate objects in space at a distance"],
  ["Vehicle transport fittings",2.5e3,1,0,0,1,1,"Frigate","Halves tonnage space of carried vehicles"],
  ["Workshop",500,1,1,0,0.5,1,"Frigate","Automated tech workshops for maintenance"]];
// Drive upgrades: [rating, cost, power, mass, min class] (cost *, power and mass #)
const SHIP_DRIVES=[[1,0,0,0,"Fighter"],[2,10e3,1,1,"Fighter"],[3,20e3,2,2,"Fighter"],[4,40e3,2,3,"Frigate"],[5,100e3,3,3,"Frigate"],[6,500e3,3,4,"Cruiser"]];
// Defenses: [name, cost (*), power, mass (#), min class, effect]
const SHIP_DEFENSES=[
  ["Ablative Hull Compartments",100e3,5,2,"Capital","+1 AC, +20 maximum hit points"],
  ["Augmented Plating",25e3,0,1,"Fighter","+2 AC, −1 Speed"],
  ["Boarding Countermeasures",25e3,2,1,"Frigate","Makes enemy boarding more difficult"],
  ["Burst ECM Generator",25e3,2,1,"Frigate","Negate one successful hit, once per engagement"],
  ["Foxer Drones",10e3,2,1,"Cruiser","+2 AC for one round when fired, Ammo 5"],
  ["Grav Eddy Displacer",50e3,5,2,"Frigate","1 in 6 chance of any given hit being negated"],
  ["Hardened Polyceramic Overlay",25e3,0,1,"Fighter","AP of attacking weapons reduced by 5"],
  ["Planetary Defense Array",50e3,4,2,"Frigate","Anti-impact and anti-nuke surface defenses"],
  ["Point Defense Lasers",10e3,3,2,"Frigate","+2 AC versus weapons that use ammo"]];
// Weapons: [name, cost, ammo cost, dmg, power, mass, hardpoints, min class, tl, AP, qualities, ammo]
const SHIP_WEAPONS=[
  ["Multifocal Laser",100e3,0,"1d4",5,1,1,"Fighter",4,20,"",0],["Reaper Battery",100e3,0,"3d4",4,1,1,"Fighter",4,0,"Clumsy",0],
  ["Fractal Impact Charge",200e3,500,"2d6",5,1,1,"Fighter",4,15,"",4],["Polyspectral MES Beam",2e6,0,"2d4",5,1,1,"Fighter",5,25,"",0],
  ["Sandthrower",50e3,0,"2d4",3,1,1,"Fighter",4,0,"Flak",0],["Flak Emitter Battery",500e3,0,"2d6",5,3,1,"Frigate",4,10,"Flak",0],
  ["Torpedo Launcher",500e3,2500,"3d8",10,3,1,"Frigate",4,20,"",4],["Charged Particle Caster",800e3,0,"3d6",10,1,2,"Frigate",4,15,"Clumsy",0],
  ["Plasma Beam",700e3,0,"3d6",5,2,2,"Frigate",4,10,"",0],["Mag Spike Array",1e6,5000,"2d6+2",5,2,2,"Frigate",4,10,"Flak",5],
  ["Nuclear Missiles",50e3,5000,"Special",5,1,2,"Frigate",4,0,"Useless against ships or worlds with nuke snuffers",5],
  ["Spinal Beam Cannon",1.5e6,0,"3d10",10,5,3,"Cruiser",4,15,"Clumsy",0],["Smart Cloud",2e6,0,"3d10",10,5,2,"Cruiser",4,0,"Cloud, Clumsy",0],
  ["Gravcannon",2e6,0,"4d6",15,4,3,"Cruiser",4,20,"",0],["Spike Inversion Projector",2.5e6,0,"3d8",10,3,3,"Cruiser",4,15,"",0],
  ["Vortex Tunnel Inductor",5e6,0,"3d20",20,10,4,"Capital",4,20,"Clumsy",0],["Mass Cannon",5e6,50e3,"2d20",10,5,4,"Capital",4,20,"",4],
  ["Lightning Charge Mantle",4e6,0,"1d20",15,5,2,"Capital",4,5,"Cloud",0],["Singularity Gun",20e6,0,"5d20",25,10,5,"Capital",5,25,"",0]];
const SHIP_CRISES=[
  ["Armor Loss","Continuing","Until resolved, the ship's Armor is halved, rounded down."],
  ["Cargo Loss","Acute","If not resolved by the end of the next round, lose 1d10×10% of the ship's cargo."],
  ["Crew Lost","Acute","Crew are in danger keeping systems running. If not resolved by the end of the next round, 10% of the ship's maximum crew are incapacitated; half of them are dead or permanently disabled. If the ship has no NPC crew left, a random PC makes a Physical save: lose half HP on a success, mortally wounded on a failure."],
  ["Engine Lock","Continuing","No bridge actions until resolved. The pilot can still take general actions."],
  ["Fuel Bleed","Acute","If not resolved by the end of the next round, the ship dumps all fuel except what it needs for in-system travel."],
  ["Haywire Systems","Continuing","Until resolved, the ship starts each round at −2 Command Points. Stacks."],
  ["Hull Breach","Acute","If not resolved by the end of the next round, the ship takes 1d10 (fighter), 2d10 (frigate), 3d10 (cruiser) or 4d10 (capital) damage, ignoring Armor."],
  ["System Damage","Continuing","The GM picks a random weapon, fitting or engine. It's disabled as if hit by a targeted shot (drives lose 1 rating)."],
  ["Target Decalibration","Continuing","The guns can't lock on a target until this is resolved."],
  ["VIP Imperiled","Acute","A random PC or important NPC makes a Physical save: lose half HP on a success, mortally wounded on a failure. They die at the end of the ship's turn unless stabilized."]];
const DRILL_MISHAP=[[3,3,"Catastrophic dimensional energy incursion. The ship emerges around a star within 1d6 hexes of the target with its drive and all systems destroyed."],
  [4,5,"Shear surge overwhelms internal systems. The ship emerges around the star nearest the drill origin. Each system has a 50% chance to be disabled until repaired; if the spike drive is disabled, treat as a 3."],
  [6,8,"Power spike. One system disabled until repaired, and the ship is stuck in transit for the full base time before another Pilot check. If the spike drive fails, treat as a 3."],
  [9,12,"Ship off course. Spend the base time in transit, then make another Pilot check."],
  [13,15,"Ship off course, but it's caught early. Make another Pilot check."],
  [16,17,"Drill successful, but it takes twice the base time."],
  [18,18,"Drill successful and on time, by blind luck."]];
// Book example ships (pp. 104-107): [name, hull, drive, crew skill, NPC CP, gun hit bonus, crew, weapons, defenses, fittings]
const SHIP_TEMPLATES=[
  ["Strike Fighter","Strike Fighter",1,2,4,4,1,["Reaper Battery"],[],["Atmospheric configuration"]],
  ["Shuttle","Shuttle",1,1,4,3,1,[],[],["Atmospheric configuration","Extended life support","Cargo space","Cargo space","Cargo space"]],
  ["Free Merchant","Free Merchant",1,1,4,3,3,["Multifocal Laser","Sandthrower"],[],["Atmospheric configuration","Fuel scoops","Fuel bunkers",["Cargo space",8]]],
  ["Patrol Boat","Patrol Boat",2,2,5,4,15,["Plasma Beam"],[],["Atmospheric configuration","Extended stores","Boarding tubes","Armory","Ship's locker","Survey sensor array"]],
  ["Corvette","Corvette",2,2,5,4,30,["Plasma Beam","Plasma Beam","Sandthrower"],["Hardened Polyceramic Overlay"],["Cargo lighter","Extended stores","Boarding tubes","Armory","Ship's locker","Fuel bunkers"]],
  ["Heavy Frigate","Heavy Frigate",2,2,5,4,90,["Plasma Beam","Plasma Beam",["Torpedo Launcher",3]],["Hardened Polyceramic Overlay"],["Drop pod","Fuel scoops","Fuel bunkers","Armory","Ship's locker","Boarding tubes"]],
  ["Bulk Freighter","Bulk Freighter",2,1,4,3,15,["Plasma Beam"],[],["Cargo lighter","Fuel bunkers","Ship's locker",["Cargo space",17]]],
  ["Fleet Cruiser","Fleet Cruiser",3,2,5,5,150,["Gravcannon","Smart Cloud","Multifocal Laser","Multifocal Laser"],["Hardened Polyceramic Overlay"],["Drop pod","Armory","Ship's locker","Boarding tubes","Fuel scoops","Advanced nav computer"]],
  ["Battleship","Battleship",3,3,6,6,800,["Vortex Tunnel Inductor","Lightning Charge Mantle","Multifocal Laser","Multifocal Laser","Gravcannon"],["Hardened Polyceramic Overlay","Ablative Hull Compartments"],["Drop pod","Armory","Ship's locker","Boarding tubes","Fuel scoops","Advanced nav computer","Ship bay/fighter","Fuel bunkers"]],
  ["Carrier","Carrier",3,3,6,6,1000,["Gravcannon"],["Hardened Polyceramic Overlay","Ablative Hull Compartments"],["Drop pod","Armory","Ship's locker","Workshop","Fuel scoops","Advanced nav computer","Lifeboats","Fuel bunkers",["Ship bay/fighter",20],["Ship bay/frigate",5]]],
  ["Pirate Free Merchant","Free Merchant",1,1,5,3,6,["Fractal Impact Charge","Sandthrower"],[],["Atmospheric configuration","Fuel bunkers","Boarding tubes",["Cargo space",4]]],
  ["Small Station","Small Station",1,1,4,3,20,["Plasma Beam"],[],[]],["Large Station","Large Station",1,2,5,4,100,["Gravcannon","Plasma Beam"],[],[]]];
function shipFromTemplate(ti,name){
  const T=SHIP_TEMPLATES[ti]||SHIP_TEMPLATES[2];const one=x=>Array.isArray(x)?x:[x,1];
  const d={name:name||T[0],hull:T[1],drive:T[2],crewSkill:T[3],npcCP:T[4],npcHit:T[5],crew:T[6],
    weapons:T[7].map(x=>{const [n,extra]=Array.isArray(x)?x:[x,0];return {id:rid(),name:n,...(extra?{extraAmmo:extra}:{})}}),
    defenses:T[8].map(n=>({id:rid(),name:n})),fittings:T[9].map(x=>{const [n,q]=one(x);return {id:rid(),name:n,qty:q}}),npc:true};
  const D=shipDesign(d);
  return {...d,drive:D.sysDrive?0:d.drive,hp:D.hpMax,fuel:D.fuelMax,cp:0,crises:[],roles:{},tmp:{},sys:{},ammo:{},escape:0,shared:false,notes:"",createdAt:Date.now()};
}
const DEPTS=[["bridge","Bridge","Pilot"],["gunnery","Gunnery","Shoot"],["engineering","Engineering","Fix"],["comms","Comms","Program"],["captain","Captain","Lead"]];

Object.assign(RULES,{
  ship_cp:{t:"Command Points",p:["Each turn the ship starts at 0 Command Points (CP). Department heads earn CP with Do Your Duty (+1) or Above and Beyond, and spend them on department actions like firing guns.","A department head can take as many actions as there are points to pay for them, and doesn't need permission to spend them. Unspent points are lost when the ship's turn ends.","Haywire Systems crises make the ship start each turn at −2 CP. NPC ships just get a fixed number each turn: 4 for fighters and civilians, 5 for military and pirates, 6 for elite crews, 7 for the very best."]},
  ship_dept:{t:"Departments",p:["Every ship has five departments: bridge, gunnery, engineering, comms and captain. Each PC heads one, ideally the one that suits their skills. One PC can head several.","On the ship's turn, the captain sets the order departments act in. Each head picks actions from their own department's list or the general list, never both in the same turn.","A PC heading several departments acts in only one of them each turn. The others automatically Do Your Duty (+1 CP). A PC who's no good in space combat can run the NPC officer of their department instead."]},
  ship_attack:{t:"Ship Attacks",p:["Hit roll: 1d20 + base attack bonus + the better of Int or Dex modifier + Shoot. On a fighter-class ship, Pilot can be used instead of Shoot. Foci like Gunslinger don't apply unless they say so.","If the total meets or beats the target's AC, roll damage plus the better of Int or Dex modifier. The target's Armor is subtracted from the damage, and the weapon's AP cancels that much Armor (never below 0).","If Armor stops all of the damage, the hit can't disable systems. A Warrior's luck can be used once per fight to hit with ship guns, but not to negate a hit against their ship."]},
  ship_crisis:{t:"Crises",p:["Once per round, instead of taking a hit (right after damage is rolled), the ship can accept a Crisis. Any one department head can ask for it. The hit is negated and the GM rolls on the Crisis table.","Continuing crises stay until someone resolves them. Acute crises do something bad if they're not resolved by the end of the next round.","To resolve one, a PC takes Deal With a Crisis, explains what they're doing, and rolls a fitting skill check, usually against difficulty 10 (8 to 12 depending on the plan). Several PCs can try, or help. All crises end when the fight ends."]},
  ship_drill:{t:"Spike Drills",p:["Needs a target within range (drive rating in hexes), one load of fuel, a rutter (course record), and a pilot at the edge of the system. The navigator rolls Int/Pilot; it takes 30 minutes, or one combat round if rushed.","Base difficulty 7. Uncharted course +6; rutter over 5 years old +2, 1 to 5 years +1, under a year +0, under a month −2; +1 per 2 full hexes; trimming the course +2; rushed +2. At 6 or less, the drill is automatic.","Transit takes 6 days per hex, divided by the drive rating. Trimming the course counts the drive as 1 higher for speed (not range). On a failure, roll 3d6 on the mishap table."]},
  ship_insys:{t:"In-System Travel",p:["Moving within a region takes 6 hours; moving between regions takes 48 hours. Both are divided by the spike drive rating. No Pilot checks are needed in normal conditions.","Bold navigators can trim the course with a difficulty 9 Pilot check to count the drive as 1 higher. On a failure, the trip takes twice as long."]},
  ship_sensors:{t:"Sensors and Pursuit",p:["Detection lock: in the same region, the observer wins an opposed Int/Program check against the ship's comms officer. Observer: fighter +0, frigate +1, cruiser +2, capital +3, minor outpost +2, major station +4, planet +5, passive sensors −2. The target's comms officer rolls Avoid detection: Int/Program plus fighter +3, frigate +2, cruiser +1, capital +0, station −2, +2 if avoiding population centers, +2 with Emissions dampers. If the observer loses or ties, the target stays hidden and the observer can try again in 24 hours.","Scanning: ask one question, then roll Int/Program against difficulty 8. Each later question the same day is +1 harder; a failure ends questions for the day.","Pursuit: both pilots roll opposed Int/Pilot, adding their spike drive ratings. If the pursuer wins or ties, they force an engagement. If the pursued wins, it gets 6 hours of distance (adjusted by the drive difference)."]},
  ship_maint:{t:"Maintenance and Repair",p:["Every six months a ship needs 5% of its non-crew cost in maintenance. Each period skipped gives −1 to all ship skill checks and hit rolls. At −4, the ship has a 10% chance per month of breaking down entirely.","Repairing hit points costs 1,000 credits per point, up to the engineer's Fix skill in points each day. A disabled system can be jury-rigged for a tenth of its cost (one day per 25,000 credits); a jury-rigged system disabled again is destroyed. Full repair of a disabled system costs a quarter of its price.","Fuel costs 500 credits per load. Repairs made during combat don't need to be redone or paid for afterwards."]}
});


Object.assign(RULES,{
  ship_hp:{t:"Hull Points",p:["How much damage the ship can take. At 0, a fighter-class ship is destroyed with all hands.","A larger ship at 0 is mortally damaged: it can take no actions and explodes in 2d6 minutes unless the chief engineer makes an Int/Fix check against difficulty 10. On a success it becomes a burnt-out hulk with every system destroyed.","Ship hulls ignore small arms and TL3 Heavy weapons. Repairs cost 1,000 credits per point, up to the engineer's Fix skill in points per day. Damage Control can patch hull points during a fight."]},
  ship_ac:{t:"Ship Armor Class",p:["A mix of agility and electronic countermeasures. An attack hits if the gunner's roll meets or beats it.","Evasive Maneuvers adds the pilot's Pilot skill until the ship's next turn. Sensor Ghost adds the comms officer's Program skill. Augmented Plating gives +2, Ablative Hull Compartments +1, and Foxer Drones +2 for a round."]},
  ship_armor:{t:"Ship Armor",p:["Plating and redundant systems. Armor is subtracted from the damage of every hit.","A weapon's AP (armor piercing) rating ignores that many points of Armor, but can't take it below 0 or add damage. Hardened Polyceramic Overlay cuts the AP of attacks against the ship by 5.","If Armor stops all of a hit's damage, that hit can't disable a system. The Armor Loss crisis halves Armor until it's fixed."]},
  ship_speed:{t:"Speed",p:["How nimble the ship is in combat. Speed is added to every Pilot check the ship's pilot makes, in combat or not, including Escape Combat and Pursue Target.","Augmented Plating lowers Speed by 1, and can push it below 0. Boost Engines adds 2 until the ship's next turn. Stations have no Speed and can't maneuver. Over long distances only the spike drive rating matters."]},
  ship_fuel:{t:"Fuel",p:["Each spike drill uses one load of fuel. Most ships hold one load; each Fuel Bunker fitting holds one more. Moving around inside a system uses no meaningful fuel.","Refueling costs 500 credits per load at a starport or refinery. Fuel Scoops let a ship scoop fuel from a gas giant or star. The Fuel Bleed crisis can dump everything but what's needed for in-system travel."]},
  ship_crew:{t:"Crew Stations",p:["Each PC heads one department, ideally the one that fits their skills. One PC can head several, but each turn they act in only one; the others automatically Do Your Duty (+1 CP).","A PC who's no good in space combat can run the NPC officer of their department for the fight. If the ship is too small to have one, the PC can only take general actions.","Stations can be swapped at the start of any turn if the heads involved agree. Rolls here use the character on the station, or the ship's NPC crew skill if the station is empty."]},
  ship_bridge:{t:"Bridge Actions",p:["Escape Combat (4 CP): opposed Int or Dex/Pilot plus Speed against the fastest enemy's. On a win, every enemy ship gains 1 Escape point. When an enemy reaches 3, your ship gets away from that ship.","Evasive Maneuvers (2 CP): Int or Dex/Pilot against difficulty 9. On a success, add your Pilot skill to the ship's AC until its next turn. Once per round.","Pursue Target (3 CP): opposed Int or Dex/Pilot plus Speed against the target's. On a win, take away 1 Escape point the target has on you.","Engine Lock stops all bridge actions until it's resolved."]},
  ship_gunnery:{t:"Gunnery Actions",p:["Fire One Weapon (2 CP): fire one gun. Fire All Guns (3 CP): fire every gun, picking targets as you like. Each gunner can man only one gun a round; the gunnery head spends the points but can name other PCs to roll.","Target Systems (1 CP): your next Fire One Weapon aims at a weapon, engine or fitting the GM says is vulnerable. −4 to hit; damage is halved before Armor. If any gets through, that system is disabled, or the drive loses 1 rating. A disabled system hit again is destroyed.","Target Decalibration stops the guns from firing until it's resolved."]},
  ship_engineering:{t:"Engineering Actions",p:["Boost Engines (2 CP): Int/Fix against difficulty 8. On a success, +2 Speed until the ship's next turn.","Damage Control (3 CP): Int/Fix against difficulty 7. On a success, repair Fix skill × 2 HP on a fighter, × 3 on a frigate, × 4 on a cruiser or × 6 on a capital ship. Each attempt after the first in a fight is +1 harder.","Emergency Repairs (3 CP): Int/Fix against difficulty 8. On a success, a disabled system works again, or a damaged drive gains back 1 rating. Destroyed systems can't be fixed this way."]},
  ship_comms:{t:"Comms Actions",p:["Crash Systems (2 CP): opposed Int/Program against a target ship. On a win, it starts its next turn with a Command Point penalty equal to your Program skill.","Defeat ECM (2 CP): opposed Int/Program against a target ship. On a win, your ship's attacks on it this round get a hit bonus of twice your Program skill.","Sensor Ghost (2 CP): Int/Program against difficulty 9. On a success, add your Program skill to the ship's AC until its next turn. Once per round."]},
  ship_captain:{t:"Captain Actions",p:["Into the Fire (0 CP): accept a Crew Lost crisis and gain your Lead skill + 1 in Command Points. Once per round.","Keep It Together (0 CP): as an Instant, negate a successful enemy hit and roll a Crisis instead. Once per round. This doesn't count against the ship's one voluntary Crisis per round.","Support Department (0 CP): pick a department. One of its actions this turn costs 2 fewer CP. Once per round.","The captain also sets the order the departments act in, though the heads don't have to follow orders."]},
  ship_general:{t:"General Actions",p:["Anyone can take these, but they're exclusive: take one and you do nothing else that turn.","Do Your Duty (0 CP): the ship gains 1 CP. Name something useful you're doing, and not the same thing two rounds in a row.","Above and Beyond (0 CP): explain how you're helping, then roll a skill check the GM agrees with against difficulty 9. Success: gain your skill level + 1 CP. Failure: lose 1 CP.","Deal With a Crisis (0 CP): explain your plan and roll a fitting skill, usually against 10 (8 to 12 depending on the plan). Success resolves the crisis. You can also use it to help someone else's attempt, or to spend a scene doing something else aboard."]},
  ship_weapq:{t:"Ship Weapon Qualities",p:["AP: ignores that many points of the target's Armor.","Ammo: each shot uses a round. One mass of space holds that many rounds, doubled for each hull class above the weapon's minimum. Mounting the weapon includes one load.","Clumsy: −4 to hit fighter-class ships.","Flak: against fighter-class ships, roll hit and damage twice and keep the better.","Cloud: automatically targets every fighter that attacked the ship in the past round, with one hit roll each. No effect on anything bigger than a fighter."]},
  ship_drive:{t:"Spike Drive",p:["The drive's rating is how many hexes the ship can drill in one jump. Transit takes 6 days per hex divided by the rating, and in-system trips are divided by it too.","Targeted shots and the System Damage crisis knock the rating down by 1. Below drive-0 it's destroyed. Emergency Repairs can restore 1 rating at a time. A System Drive fitting replaces the spike drive: the ship can't drill at all."]}
});
const shipPaths=()=>Object.keys(S.docs).filter(p=>p.startsWith("ships/")).sort((a,b)=>num(!!S.docs[a].npc)-num(!!S.docs[b].npc)||String(S.docs[a].name).localeCompare(String(S.docs[b].name)));
const clsIdx=c=>Math.max(0,SHIP_CLASSES.indexOf(c));
const CLS_STAR=[1,10,25,100],CLS_HASH=[1,2,3,4];
const money=v=>v>=1e6?(Math.round(v/1e5)/10)+"m":v>=1e3?(Math.round(v/100)/10)+"k":String(Math.round(v));
const hullOf=s=>SHIP_HULLS.find(h=>h[0]===(s&&s.hull))||SHIP_HULLS[2];
function fitCost(f,ci){return {cost:f[1]*(f[2]?CLS_STAR[ci]:1),power:f[3]*(f[4]?CLS_HASH[ci]:1),mass:f[5]*(f[6]?CLS_HASH[ci]:1)}}
function defCost(d,ci){return {cost:d[1]*CLS_STAR[ci],power:d[2],mass:d[3]*CLS_HASH[ci]}}
function driveCost(r,ci){const d=SHIP_DRIVES[Math.max(0,Math.min(5,r-1))];return {cost:d[1]*CLS_STAR[ci],power:d[2]*CLS_HASH[ci],mass:d[3]*CLS_HASH[ci],cls:d[4]}}
function weapAmmoMax(w,ci,extra){const W=SHIP_WEAPONS.find(x=>x[0]===w);if(!W||!W[11])return 0;return W[11]*Math.pow(2,Math.max(0,ci-clsIdx(W[7])))*(1+num(extra))}

// Build totals for a ship design (used by the sheet and the wizard)
function shipDesign(d){
  const H=hullOf(d);const ci=clsIdx(H[11]);
  let cost=H[1],power=0,mass=0,hard=0;const issues=[];
  const sysDrive=(d.fittings||[]).some(f=>f.name==="System drive");
  const drive=sysDrive?0:Math.max(1,num(d.drive,1));
  if(!sysDrive&&drive>1){const dc=driveCost(drive,ci);cost+=dc.cost;power+=dc.power;mass+=dc.mass;if(ci<clsIdx(dc.cls))issues.push("Drive-"+drive+" needs a "+dc.cls+" hull or larger")}
  (d.weapons||[]).forEach(w=>{const W=SHIP_WEAPONS.find(x=>x[0]===w.name);if(!W)return;cost+=W[1]+num(w.extraAmmo)*0;power+=W[4];mass+=W[5]+num(w.extraAmmo);hard+=W[6];if(ci<clsIdx(W[7]))issues.push(W[0]+" needs a "+W[7]+" hull")});
  (d.defenses||[]).forEach(x=>{const D=SHIP_DEFENSES.find(y=>y[0]===x.name);if(!D)return;const c=defCost(D,ci);cost+=c.cost;power+=c.power;mass+=c.mass;if(ci<clsIdx(D[4]))issues.push(D[0]+" needs a "+D[4]+" hull")});
  (d.fittings||[]).forEach(x=>{const F=SHIP_FITTINGS.find(y=>y[0]===x.name);if(!F)return;const q=Math.max(1,num(x.qty,1));const c=fitCost(F,ci);cost+=c.cost*q;power+=c.power*q;mass+=c.mass*q;if(ci<clsIdx(F[7]))issues.push(F[0]+" needs a "+F[7]+" hull")});
  const qty=n=>(d.fittings||[]).filter(f=>f.name===n).reduce((s,f)=>s+Math.max(1,num(f.qty,1)),0);
  const has=n=>(d.defenses||[]).some(x=>x.name===n);
  const cargo=qty("Cargo space")*[2,20,200,2000][ci];
  return {H,ci,cls:H[11],cost,power,mass,hard,powerMax:H[8],massMax:H[9],hardMax:H[10],issues,drive,sysDrive,cargo,
    fuelMax:sysDrive?0:1+qty("Fuel bunkers"),crewMax:H[6]*Math.pow(2,qty("Extended life support")),crewMin:H[5],
    hpMax:H[4]+(has("Ablative Hull Compartments")?20:0),acBase:H[7]+(has("Augmented Plating")?2:0)+(has("Ablative Hull Compartments")?1:0),
    speedBase:H[2]==null?null:H[2]-(has("Augmented Plating")?1:0),armorBase:H[3],maint:Math.round(cost*0.05)};
}
function shipCompute(s){
  const D=shipDesign(s);const tmp=s.tmp||{};const cr=s.crises||[];
  const armorLoss=cr.filter(c=>c.type==="Armor Loss").length;
  let armor=D.armorBase;for(let i=0;i<armorLoss;i++)armor=Math.floor(armor/2);
  const sysOf=id=>(s.sys||{})[id]||"ok";
  return {...D,hpMax:D.hpMax+num(s.hpBonus),ac:D.acBase+num(tmp.ac),acNote:[tmp.evasive?"Evasive +"+tmp.evasive:"",tmp.ghost?"Sensor Ghost +"+tmp.ghost:"",tmp.foxer?"Foxer +2":""].filter(Boolean),
    speed:D.speedBase==null?null:D.speedBase+num(tmp.speed),armor,drive:Math.max(0,D.drive-num(s.driveDmg)),driveFull:D.drive,
    pen:-Math.max(0,num(s.maintSkipped)),haywire:cr.filter(c=>c.type==="Haywire Systems").length,engineLock:cr.some(c=>c.type==="Engine Lock"),
    decal:cr.some(c=>c.type==="Target Decalibration"),sysOf};
}

// Who acts for a department: a party character or the ship's NPC crew
function shipRoller(s,dept){
  const p=(s.roles||{})[dept];
  if(p&&S.docs[p]&&!S.docs[p].npc){const c=S.docs[p];return {pc:true,path:p,c,R:compute(c),name:c.name||"Unnamed"}}
  return {pc:false,name:(s.name||"Ship")+" crew",skill:num(s.crewSkill,1)};
}
function shipCanAct(sp,dept){
  if(S.offline||S.isGM)return true;const s=S.docs[sp];if(!s||s.npc)return false;
  const r=shipRoller(s,dept);if(r.pc)return isMine(r.path);
  return !!myPath();
}
function shipCanAny(sp){if(S.offline||S.isGM)return true;const s=S.docs[sp];if(!s||s.npc)return false;return DEPTS.some(([k])=>shipCanAct(sp,k))}
function shipEmit(sp,r,label,lines){
  const s=S.docs[sp];const lbl=r.pc?(s.name||"Ship")+" · "+label:label;
  if(s.npc){npcRoll({name:s.name||"Enemy ship"},lbl,lines);return}
  const rec={ts:Date.now(),by:S.me||"",ship:sp.slice(sp.indexOf("/")+1),sheet:r.pc&&r.path.startsWith("sheets/")?r.path.slice(7):"",char:r.pc?String(r.name):String(s.name||"Ship"),player:r.pc?String(r.c.player||""):"",label:lbl,lines};
  showRoll(rec);
  if(S.db&&!S.offline)S.db.collection("rolls").add(clone(rec)).catch(()=>toastMsg("Your roll didn't post to the shared game log.",true));
  else{S.rolls.unshift({id:rid(),...rec});S.rolls=S.rolls.slice(0,60);render()}
}
const bestOf=(R,attrs)=>attrs.reduce((b,a)=>R.mod[a]>R.mod[b]?a:b,attrs[0]);
// A ship skill check. attrs like ["int","dex"]; returns {total, ok}
function shipCheck(sp,dept,{attrs=["int"],skill,diff=null,label,extra=[],note="",opposed=false,skillOverride,result}={}){
  const s=S.docs[sp];const C=shipCompute(s);const r=shipRoller(s,dept);
  const dice=[{v:rand(6),s:6},{v:rand(6),s:6}];let parts=[];
  if(r.pc){const sk=skillOverride||skill;const a=bestOf(r.R,attrs);const lv=r.R.skills[sk]??-1;
    parts=[{l:(SKILL[sk]?.name||sk)+(lv<0?" (untrained)":""),v:lv},{l:a.toUpperCase(),v:r.R.mod[a]},...r.R.br("skillChecks")]}
  else parts=[{l:"Crew skill",v:r.skill}];
  if(C.pen)parts.push({l:"Missed maintenance",v:C.pen});
  parts.push(...extra);
  const total=dice.reduce((a,d)=>a+d.v,0)+parts.reduce((a,p)=>a+p.v,0);
  const ok=diff!=null?total>=diff:null;
  const lines=[{name:r.name,dice,parts,total,verdict:diff!=null?(ok?["ok","Success"]:["no","Failure"]):null,note:[opposed?"Opposed roll":"",diff!=null?"vs difficulty "+diff:"",note].filter(Boolean).join(" · ")}];
  if(result){const x=result(ok,r);if(x)lines.push({dice:[],parts:[],...x})}
  shipEmit(sp,r,label,lines);
  return {total,ok,r};
}
function shipSkillLv(s,dept,sk){const r=shipRoller(s,dept);return r.pc?Math.max(0,r.R.skills[sk]??-1):Math.max(0,num(s.crewSkill,1))}
function shipSpend(sp,cost,dept){
  const s=S.docs[sp];const tmp=s.tmp||{};let c=cost;
  if(tmp.support===dept&&c>0){c=Math.max(0,c-2)}
  if(num(s.cp)<c){toastMsg("Not enough Command Points ("+num(s.cp)+" left, need "+c+").",true);return false}
  setField(sp,"cp",num(s.cp)-c);if(tmp.support===dept&&cost>0)setField(sp,"tmp",{...tmp,support:""});
  return true;
}
const effCost=(s,cost,dept)=>(s.tmp||{}).support===dept&&cost>0?Math.max(0,cost-2):cost;
// Gunnery: separate hit and damage rolls, like a character's weapon
function shipHitParts(s,C){
  const r=shipRoller(s,"gunnery");let parts=[],dmgMod=0,sk="shoot";
  if(r.pc){const a=bestOf(r.R,["int","dex"]);if(C.ci===0&&(r.R.skills.pilot??-1)>(r.R.skills.shoot??-1))sk="pilot";const lv=r.R.skills[sk]??-1;
    parts=[{l:"Attack bonus",v:r.R.bab},{l:a.toUpperCase(),v:r.R.mod[a]},{l:SKILL[sk].name+(lv<0?" (untrained)":""),v:lv}];dmgMod=r.R.mod[a]}
  else parts=[{l:"Crew gunnery",v:num(s.npcHit,num(s.crewSkill,1)+2)}];
  if(C.pen)parts.push({l:"Missed maintenance",v:C.pen});
  if(num((s.tmp||{}).hit))parts.push({l:"Defeat ECM",v:num(s.tmp.hit)});
  return {r,parts,dmgMod,bonus:parts.reduce((a,p)=>a+p.v,0)};
}
function shipHit(sp,wid){
  const s=S.docs[sp];const C=shipCompute(s);const w=(s.weapons||[]).find(x=>x.id===wid);const W=w&&SHIP_WEAPONS.find(x=>x[0]===w.name);if(!W)return;
  const tmp=s.tmp||{};const targeted=num(tmp.targetSys)>0;const tgt=S.shipTgt||{};const tac=num(tgt.ac,0);
  const H=shipHitParts(s,C);const parts=[...H.parts];
  if(targeted)parts.push({l:"Targeting a system",v:-4});
  if(/Clumsy/.test(W[10])&&tgt.fighter)parts.push({l:"Clumsy vs fighter",v:-4});
  const d20={v:rand(20),s:20};const hit=d20.v+parts.reduce((a,p)=>a+p.v,0);
  const t2={...(S.docs[sp].tmp||{})};if(targeted){t2.targetSys=num(t2.targetSys)-1;t2.targeted={...(t2.targeted||{}),[wid]:true}}else if(t2.targeted&&t2.targeted[wid]){const x={...t2.targeted};delete x[wid];t2.targeted=x}
  setField(sp,"tmp",t2);
  if(W[11]){const mx=weapAmmoMax(w.name,C.ci,w.extraAmmo);const am=(s.ammo||{})[wid];setField(sp,"ammo",{...(s.ammo||{}),[wid]:Math.max(0,(am==null?mx:num(am))-1)})}
  shipEmit(sp,H.r,w.name+" hit"+(targeted?" (targeting a system)":""),[{name:"Hit",dice:[d20],parts,total:hit,verdict:tac?(hit>=tac?["ok","Hit"]:["no","Miss"]):null,note:tac?"vs AC "+tac:"Compare to the target's AC"}]);
}
function shipDmg(sp,wid){
  const s=S.docs[sp];const C=shipCompute(s);const w=(s.weapons||[]).find(x=>x.id===wid);const W=w&&SHIP_WEAPONS.find(x=>x[0]===w.name);if(!W)return;
  if(W[3]==="Special"){toastMsg("Nuclear missiles don't roll ship damage.",true);return}
  const H=shipHitParts(s,C);const tgt=S.shipTgt||{};const tarm=tgt.armor==null?null:num(tgt.armor);const targeted=!!((s.tmp||{}).targeted||{})[wid];
  const p=parseDice(W[3]);const rr=rollGroups(p);let raw=rr.sum+p.flat+H.dmgMod;
  const dparts=[...(p.flat?[{l:"Weapon",v:p.flat}]:[]),...(H.dmgMod?[{l:"Int/Dex",v:H.dmgMod}]:[])];
  const notes=[W[9]?"AP "+W[9]:"",W[10]].filter(Boolean);
  let total=raw;if(targeted){total=Math.ceil(raw/2);notes.push("halved for a targeted shot ("+raw+" → "+total+")")}
  const ap=Math.max(0,W[9]-((S.shipTgt||{}).hpo?5:0));if(ap!==W[9])notes.push("AP "+W[9]+" − 5 (overlay) = "+ap);
  if(tarm!=null){const eff=Math.max(0,tarm-ap);const fin=Math.max(0,total-eff);notes.push("after Armor "+tarm+(ap?" − AP "+ap+" = "+eff:"")+": "+fin+" gets through"+(targeted&&fin>0?", system disabled":""))}
  if(targeted){const t2={...(S.docs[sp].tmp||{})};const x={...(t2.targeted||{})};delete x[wid];t2.targeted=x;setField(sp,"tmp",t2)}
  shipEmit(sp,H.r,w.name+" damage",[{name:"Damage",dice:rr.dice,parts:dparts,total,note:notes.join(" · ")}]);
}

/* ---------- actions ---------- */
function shipAct(act,t){
  const sp=t.dataset.doc;const s=sp?S.docs[sp]:null;const gm=S.isGM||S.offline;
  const D=t.dataset.dept;
  const need=(dept)=>{if(!shipCanAct(sp,dept)){toastMsg("Only the GM or the character in that department can do that.",true);return false}return true};
  switch(act){
    case "ship-sel":S.shipSel=sp;S.shipTab=S.shipTab||"combat";render();return true;
    case "ship-vis":{if(!gm||!s||s.npc)return true;setField(sp,"shared",!s.shared);toastMsg(s.shared?"Players can see this ship now.":"Hidden. Players can't see this ship until you show it.");render();return true}
    case "ship-mode":S.shipMode=t.dataset.v;S.shipFull=false;render();return true;
    case "ship-full":if(!gm)return true;S.shipSel=sp;S.shipFull=true;S.shipMode="npc";S.shipTab="combat";render();window.scrollTo(0,0);return true;
    case "ship-dup":{if(!gm||!s)return true;const C=shipCompute(s);const path=(S.offline?"ships/local-":"ships/")+rid();const base=clone(s);const m=String(s.name||"Ship").match(/^(.*?)\s*(\d+)$/);const stem=m?m[1]:String(s.name||"Ship");const used=new Set(shipPaths().map(p=>S.docs[p].name));let k=2;while(used.has(stem+" "+k))k++;
      createDoc(path,{...base,name:stem+" "+k,hp:C.hpMax,cp:0,crises:[],tmp:{},sys:{},ammo:{},escape:0,dcUses:0,round:0,mishap:null,createdAt:Date.now()});if(S.offline)S.exists[path]=true;render();return true}
    case "ship-npc-new":{if(!gm)return true;const ti=num($("#nsh-tpl")?.value,3);const base=($("#nsh-name")?.value||"").trim();const n=Math.max(1,Math.min(12,num($("#nsh-count")?.value,1)));
      for(let k=0;k<n;k++){const nm=(base||SHIP_TEMPLATES[ti][0])+(n>1?" "+(k+1):"");const path=(S.offline?"ships/local-":"ships/")+rid();createDoc(path,shipFromTemplate(ti,nm));if(S.offline)S.exists[path]=true}
      toastMsg(n>1?n+" NPC ships created.":"NPC ship created.");render();return true}
    case "ship-tgt-hpo":S.shipTgt={...(S.shipTgt||{}),hpo:!((S.shipTgt||{}).hpo)};render();return true;
    case "ship-cheat":{const det=t.closest("details");setTimeout(()=>{S.cheatOpen=!!(det&&det.open)},0);return true}
    case "ship-gen":{const det=t.closest("details");setTimeout(()=>{S.shipGen={...(S.shipGen||{}),[D]:!!(det&&det.open)}},0);return true}
    case "ship-tab":S.shipTab=t.dataset.v;render();return true;
    case "ship-new":if(!gm)return true;S.sw={step:0,name:"",hull:"Free Merchant",drive:1,weapons:[],defenses:[],fittings:[],crewSkill:1,npc:!!t.dataset.npc,npcCP:4,crew:1};S.view="shipwiz";render();return true;
    case "ship-refit":if(!gm||!s)return true;S.sw={step:0,editing:sp,...clone({name:s.name,hull:s.hull,drive:s.drive||1,weapons:s.weapons||[],defenses:s.defenses||[],fittings:s.fittings||[],crewSkill:s.crewSkill??1,npc:!!s.npc,npcCP:s.npcCP||4,crew:s.crew||1,npcHit:s.npcHit})};S.view="shipwiz";render();return true;
    case "ship-del":{if(!gm||!s)return true;if(S.confirm!=="ship-del:"+sp){S.confirm="ship-del:"+sp;render();return true}S.confirm=null;deleteDoc(sp);if(S.shipSel===sp){S.shipSel=null;S.shipFull=false}toastMsg("Ship deleted.");render();return true}
    case "ship-hp":{if(!shipCanAny(sp))return true;const C=shipCompute(s);const amt=Math.max(0,num($(t.dataset.inp||"#ship-hp-amt")?.value,0));if(!amt){toastMsg("Type an amount first.",true);return true}
      const d=num(t.dataset.d);setField(sp,"hp",Math.max(0,Math.min(C.hpMax,num(s.hp,C.hpMax)+d*amt)));render();return true}
    case "ship-step":{const f=t.dataset.f;if(!shipCanAny(sp))return true;const v=num(getPath(s,f))+num(t.dataset.d);
      if(f==="fuel"){const C=shipCompute(s);setField(sp,"fuel",Math.max(0,Math.min(C.fuelMax,v)))}
      else if(f==="maintSkipped"||f==="driveDmg"){if(!gm)return true;setField(sp,f,Math.max(0,v))}
      else if(f==="tmp.hit"){setField(sp,"tmp",{...(s.tmp||{}),hit:Math.max(0,v)})}
      else setField(sp,f,Math.max(f==="cp"?-20:0,v));render();return true}
    case "ship-turn":{if(!shipCanAny(sp))return true;const C=shipCompute(s);const start=(s.npc?num(s.npcCP,4):0)-2*C.haywire;
      setField(sp,"cp",start);setField(sp,"tmp",{});setField(sp,"round",num(s.round)+1);toastMsg("New turn: "+start+" Command Points"+(C.haywire?" (Haywire −"+2*C.haywire+")":"")+".");render();return true}
    case "ship-endfight":{if(!shipCanAny(sp))return true;if(S.confirm!=="ship-endfight"){S.confirm="ship-endfight";render();return true}S.confirm=null;
      setField(sp,"cp",0);setField(sp,"tmp",{});setField(sp,"crises",[]);setField(sp,"escape",0);setField(sp,"dcUses",0);setField(sp,"round",0);setField(sp,"ecmUsed",false);toastMsg("Fight over. Crises cleared and turn trackers reset.");render();return true}
    case "ship-role-clear":{if(!shipCanAny(sp))return true;setField(sp,"roles",{});render();return true}
    case "ship-sys":{if(!gm&&!shipCanAny(sp))return true;const id=t.dataset.id;const cur=(s.sys||{})[id]||"ok";const nxt=cur==="ok"?"disabled":cur==="disabled"?"destroyed":"ok";setField(sp,"sys",{...(s.sys||{}),[id]:nxt});render();return true}
    case "ship-ammo":{if(!shipCanAny(sp))return true;const id=t.dataset.id;const w=(s.weapons||[]).find(x=>x.id===id);const C=shipCompute(s);const mx=weapAmmoMax(w.name,C.ci,w.extraAmmo);const am=(s.ammo||{})[id];const cur=am==null?mx:num(am);
      setField(sp,"ammo",{...(s.ammo||{}),[id]:t.dataset.d==="full"?mx:Math.max(0,Math.min(mx,cur+num(t.dataset.d)))});render();return true}
    case "ship-tgt":{S.shipTgt={...(S.shipTgt||{}),fighter:!((S.shipTgt||{}).fighter)};render();return true}

    // ---- department actions
    case "ship-duty":{if(!need(D))return true;setField(sp,"cp",num(s.cp)+1);shipEmit(sp,shipRoller(s,D),"Do Your Duty",[{name:"Command Points",dice:[],parts:[],total:"+1",note:"Now "+(num(s.cp))+" CP"}]);render();return true}
    case "ship-above":{if(!need(D))return true;const a=$("#ab-attr-"+D)?.value||"int";const sk=$("#ab-skill-"+D)?.value||"fix";
      const lv=shipSkillLv(s,D,sk);const before=num(s.cp);const skName=shipRoller(s,D).pc?(SKILL[sk]?.name||sk)+"-"+lv:"Crew skill "+lv;
      shipCheck(sp,D,{attrs:[a],skill:sk,diff:9,label:"Above and Beyond",result:ok=>{const g=ok?lv+1:-1;setField(sp,"cp",before+g);
        return {name:"Command Points",total:g,note:(ok?skName+" + 1 = +"+g+" CP":"Failed: the ship loses 1 CP")+" · ship now has "+(before+g)+" CP"}}});
      render();return true}
    case "ship-crisis-deal":{if(!need(D))return true;const id=$("#cr-pick-"+D)?.value;const cr=(s.crises||[]).find(c=>c.id===id);if(!cr){toastMsg("No crisis selected.",true);return true}
      const a=$("#cr-attr-"+D)?.value||"int";const sk=$("#cr-skill-"+D)?.value||"fix";const diff=num($("#cr-diff-"+D)?.value,10);
      const res=shipCheck(sp,D,{attrs:[a],skill:sk,diff,label:"Deal With a Crisis: "+cr.type});
      if(res.ok){setField(sp,"crises",(s.crises||[]).filter(c=>c.id!==id));toastMsg(cr.type+" resolved.")}render();return true}
    case "ship-escape":{if(!need("bridge"))return true;const C=shipCompute(s);if(C.engineLock){toastMsg("Engine Lock: no bridge actions until it's resolved.",true);return true}if(!shipSpend(sp,4,"bridge"))return true;
      shipCheck(sp,"bridge",{attrs:["int","dex"],skill:"pilot",label:"Escape Combat",extra:C.speed?[{l:"Speed",v:C.speed}]:[],opposed:true,note:"vs the fastest enemy's Pilot + Speed. On a win, add 1 Escape point."});render();return true}
    case "ship-pursue":{if(!need("bridge"))return true;const C=shipCompute(s);if(C.engineLock){toastMsg("Engine Lock: no bridge actions until it's resolved.",true);return true}if(!shipSpend(sp,3,"bridge"))return true;
      shipCheck(sp,"bridge",{attrs:["int","dex"],skill:"pilot",label:"Pursue Target",extra:C.speed?[{l:"Speed",v:C.speed}]:[],opposed:true,note:"vs the target's Pilot + Speed. On a win, the target loses 1 Escape point on you."});render();return true}
    case "ship-evasive":{if(!need("bridge"))return true;const C=shipCompute(s);const tmp=s.tmp||{};if(C.engineLock){toastMsg("Engine Lock: no bridge actions until it's resolved.",true);return true}if(tmp.evasive!=null){toastMsg("Evasive Maneuvers can only be used once per round.",true);return true}
      if(!shipSpend(sp,2,"bridge"))return true;const lv=shipSkillLv(s,"bridge","pilot");
      const res=shipCheck(sp,"bridge",{attrs:["int","dex"],skill:"pilot",diff:9,label:"Evasive Maneuvers",extra:C.speed?[{l:"Speed",v:C.speed}]:[],note:"success: +"+lv+" AC until next turn"});
      const t2=S.docs[sp].tmp||{};setField(sp,"tmp",{...t2,evasive:res.ok?lv:0,ac:num(t2.ac)+(res.ok?lv:0)});render();return true}
    case "ship-fireall":{if(!need("gunnery"))return true;const C=shipCompute(s);if(C.decal){toastMsg("Target Decalibration: the guns can't lock on until it's resolved.",true);return true}
      if((s.tmp||{}).fireAll){toastMsg("Fire All Guns is already paid for this turn.",true);return true}
      if(!shipSpend(sp,3,"gunnery"))return true;setField(sp,"tmp",{...(S.docs[sp].tmp||{}),fireAll:true,fired:{}});toastMsg("Fire All Guns: roll Hit on each weapon, no extra CP.");render();return true}
    case "ship-hit":{if(!need("gunnery"))return true;const C=shipCompute(s);if(C.decal){toastMsg("Target Decalibration: the guns can't lock on until it's resolved.",true);return true}
      const id=t.dataset.id;if(C.sysOf(id)!=="ok"){toastMsg("That weapon is "+C.sysOf(id)+".",true);return true}
      const w=(s.weapons||[]).find(x=>x.id===id);const mx=weapAmmoMax(w.name,C.ci,w.extraAmmo);const am=(s.ammo||{})[id];if(mx&&(am==null?mx:num(am))<=0){toastMsg("Out of ammo.",true);return true}
      const tmp=s.tmp||{};const free=tmp.fireAll&&!(tmp.fired||{})[id];
      if(!free&&!shipSpend(sp,2,"gunnery"))return true;
      if(tmp.fireAll){const t2=S.docs[sp].tmp||{};setField(sp,"tmp",{...t2,fired:{...(t2.fired||{}),[id]:true}})}
      shipHit(sp,id);render();return true}
    case "ship-dmg":{if(!need("gunnery"))return true;shipDmg(sp,t.dataset.id);render();return true}
    case "ship-target":{if(!need("gunnery"))return true;if(!shipSpend(sp,1,"gunnery"))return true;const tmp=S.docs[sp].tmp||{};setField(sp,"tmp",{...tmp,targetSys:num(tmp.targetSys)+1});toastMsg("Your next Hit roll targets a system: −4 to hit, half damage.");render();return true}
    case "ship-boost":{if(!need("engineering"))return true;if(!shipSpend(sp,2,"engineering"))return true;
      const res=shipCheck(sp,"engineering",{attrs:["int"],skill:"fix",diff:8,label:"Boost Engines",note:"success: +2 Speed until next turn"});
      if(res.ok){const tmp=S.docs[sp].tmp||{};setField(sp,"tmp",{...tmp,speed:num(tmp.speed)+2})}render();return true}
    case "ship-dc":{if(!need("engineering"))return true;if(!shipSpend(sp,3,"engineering"))return true;const C=shipCompute(s);const uses=num(s.dcUses);const lv=shipSkillLv(s,"engineering","fix");const per=[2,3,4,6][C.ci];
      const res=shipCheck(sp,"engineering",{attrs:["int"],skill:"fix",diff:7+uses,label:"Damage Control",note:"success: repair "+lv*per+" HP (Fix "+lv+" × "+per+")"+(uses?" · attempt "+(uses+1)+" this fight":"")});
      setField(sp,"dcUses",uses+1);if(res.ok){const cur=num(S.docs[sp].hp,C.hpMax);setField(sp,"hp",Math.min(C.hpMax,cur+lv*per))}render();return true}
    case "ship-repair":{if(!need("engineering"))return true;const id=$("#er-pick")?.value;if(!id){toastMsg("Pick a disabled system first.",true);return true}if(!shipSpend(sp,3,"engineering"))return true;
      const res=shipCheck(sp,"engineering",{attrs:["int"],skill:"fix",diff:8,label:"Emergency Repairs",note:"success: a disabled system works again, or a damaged drive gains 1 rating"});
      if(res.ok){if(id==="drive")setField(sp,"driveDmg",Math.max(0,num(s.driveDmg)-1));else setField(sp,"sys",{...(S.docs[sp].sys||{}),[id]:"ok"})}render();return true}
    case "ship-crash":{if(!need("comms"))return true;if(!shipSpend(sp,2,"comms"))return true;const lv=shipSkillLv(s,"comms","program");
      shipCheck(sp,"comms",{attrs:["int"],skill:"program",label:"Crash Systems",opposed:true,note:"vs the target's Int/Program. On a win, it starts its next turn with −"+lv+" CP."});render();return true}
    case "ship-ecm":{if(!need("comms"))return true;if(!shipSpend(sp,2,"comms"))return true;const lv=shipSkillLv(s,"comms","program");
      shipCheck(sp,"comms",{attrs:["int"],skill:"program",label:"Defeat ECM",opposed:true,note:"vs the target's Int/Program. On a win, your attacks on it get +"+2*lv+" to hit this round. Add it with the Defeat ECM counter."});render();return true}
    case "ship-ghost":{if(!need("comms"))return true;const tmp=s.tmp||{};if(tmp.ghost!=null){toastMsg("Sensor Ghost can only be used once per round.",true);return true}if(!shipSpend(sp,2,"comms"))return true;const lv=shipSkillLv(s,"comms","program");
      const res=shipCheck(sp,"comms",{attrs:["int"],skill:"program",diff:9,label:"Sensor Ghost",note:"success: +"+lv+" AC until next turn"});
      const t2=S.docs[sp].tmp||{};setField(sp,"tmp",{...t2,ghost:res.ok?lv:0,ac:num(t2.ac)+(res.ok?lv:0)});render();return true}
    case "ship-intofire":{if(!need("captain"))return true;const tmp=s.tmp||{};if(tmp.intoFire){toastMsg("Into the Fire can only be used once per round.",true);return true}
      const lv=shipSkillLv(s,"captain","lead");setField(sp,"cp",num(s.cp)+lv+1);setField(sp,"tmp",{...tmp,intoFire:true});
      setField(sp,"crises",[...(s.crises||[]),{id:rid(),type:"Crew Lost",ts:Date.now()}]);
      shipEmit(sp,shipRoller(s,"captain"),"Into the Fire",[{name:"Command Points",dice:[],parts:[],total:"+"+(lv+1),note:"Accepted a Crew Lost crisis"}]);render();return true}
    case "ship-keep":{if(!need("captain"))return true;const tmp=s.tmp||{};if(tmp.keep){toastMsg("Keep It Together can only be used once per round.",true);return true}
      setField(sp,"tmp",{...tmp,keep:true});shipRequestCrisis(sp,"Keep It Together: hit negated");render();return true}
    case "ship-support":{if(!need("captain"))return true;const tmp=s.tmp||{};if(tmp.supportUsed){toastMsg("Support Department can only be used once per round.",true);return true}
      const dep=$("#sup-pick")?.value||"gunnery";setField(sp,"tmp",{...tmp,support:dep,supportUsed:true});toastMsg("The next "+DEPTS.find(d=>d[0]===dep)[1]+" action costs 2 fewer CP.");render();return true}
    case "ship-crisis-take":{if(!shipCanAny(sp))return true;shipRequestCrisis(sp,"Taken instead of a hit");render();return true}
    case "ship-crisis-roll":{if(!gm)return true;shipRollCrisis(sp,t.dataset.id);render();return true}
    case "ship-mishap-roll":{if(!gm)return true;shipRollMishap(sp);render();return true}
    case "ship-mishap-x":{if(!shipCanAny(sp))return true;setField(sp,"mishap",null);render();return true}
    case "ship-crisis-add":{if(!gm)return true;const ty=$("#cr-add")?.value;if(!ty)return true;setField(sp,"crises",[...(s.crises||[]),{id:rid(),type:ty,ts:Date.now()}]);render();return true}
    case "ship-crisis-x":{if(!shipCanAny(sp))return true;setField(sp,"crises",(s.crises||[]).filter(c=>c.id!==t.dataset.id));render();return true}
    case "ship-ecmburst":{if(!shipCanAny(sp))return true;if(s.ecmUsed){toastMsg("The Burst ECM Generator only works once per engagement.",true);return true}setField(sp,"ecmUsed",true);toastMsg("Burst ECM: one successful hit negated.");render();return true}

    // ---- travel
    case "ship-drill":{if(!need("bridge"))return true;const C=shipCompute(s);const T=shipDrillCalc(s);
      if(C.sysDrive||!C.drive){toastMsg("This ship has no working spike drive.",true);return true}
      if(T.hexes>C.drive){toastMsg("Out of range: drive-"+C.drive+" reaches "+C.drive+" hex"+(C.drive>1?"es":"")+".",true);return true}
      if(num(s.fuel,C.fuelMax)<=0){toastMsg("No fuel left for a drill.",true);return true}
      setField(sp,"fuel",Math.max(0,num(s.fuel,C.fuelMax)-1));
      if(T.auto){shipEmit(sp,shipRoller(s,"bridge"),"Spike drill"+((s.trip||{}).dest?" to "+(s.trip||{}).dest:""),[{name:"Drill",dice:[],parts:[],total:"Auto",verdict:["ok","Success"],note:"Difficulty "+T.diff+" (6 or less is automatic) · "+T.time}]);render();return true}
      const res=shipCheck(sp,"bridge",{attrs:["int"],skill:"pilot",diff:T.diff,label:"Spike drill"+((s.trip||{}).dest?" to "+(s.trip||{}).dest:"")+" ("+T.hexes+" hex"+(T.hexes>1?"es":"")+")",extra:[...(C.speed?[{l:"Speed",v:C.speed}]:[]),...(T.nav?[{l:"Adv. nav computer",v:2}]:[])],note:T.time});
      if(!res.ok){setField(sp,"mishap",{pending:true,ts:Date.now()});toastMsg("The drill failed. Your GM rolls the mishap.",true)}
      render();return true}
    case "ship-trim":{if(!need("bridge"))return true;const C=shipCompute(s);shipCheck(sp,"bridge",{attrs:["int"],skill:"pilot",diff:9,label:"Trim the course (in-system)",extra:C.speed?[{l:"Speed",v:C.speed}]:[],note:"success: count the drive as "+(C.drive+1)+" · failure: the trip takes twice as long"});render();return true}
    case "ship-detect":{if(!need("comms"))return true;const own=[0,1,2,3][shipCompute(s).ci];const passive=$("#sen-passive")?.checked;
      shipCheck(sp,"comms",{attrs:["int"],skill:"program",label:"Detection lock",opposed:true,extra:[{l:"Our hull",v:own},...(passive?[{l:"Passive sensors",v:-2}]:[])],note:"vs the target's Avoid detection roll (their comms Int/Program + their hull bonus). Win to get a lock; a tie or loss and they stay hidden."});render();return true}
    case "ship-hide":{if(!need("comms"))return true;const own=[3,2,1,0][shipCompute(s).ci];const damp=(s.fittings||[]).some(f=>f.name==="Emissions dampers");const avoid=$("#sen-avoid")?.checked;
      shipCheck(sp,"comms",{attrs:["int"],skill:"program",label:"Avoid detection",opposed:true,extra:[{l:"Our hull",v:own},...(damp?[{l:"Emissions dampers",v:2}]:[]),...(avoid?[{l:"Avoiding population centers",v:2}]:[])],note:"vs the observer's Int/Program + their modifier. A tie or win keeps you hidden."});render();return true}
    case "ship-scan":{if(!need("comms"))return true;const n=num(s.scanQ);const res=shipCheck(sp,"comms",{attrs:["int"],skill:"program",diff:8+n,label:"Scan question "+(n+1),note:"a failure ends questions for today"});
      setField(sp,"scanQ",res.ok?n+1:0);render();return true}
    case "ship-chase":{if(!need("bridge"))return true;const C=shipCompute(s);shipCheck(sp,"bridge",{attrs:["int"],skill:"pilot",label:"Pursuit (long range)",opposed:true,extra:[{l:"Drive rating",v:C.drive},...(C.speed?[{l:"Speed",v:C.speed}]:[])],note:"vs the other pilot's Int/Pilot + drive. Pursuer wins ties."});render();return true}
  }
  return false;
}
function shipRequestCrisis(sp,why){
  const s=S.docs[sp];setField(sp,"crises",[...(s.crises||[]),{id:rid(),type:"",pending:true,why,ts:Date.now()}]);
  toastMsg("Crisis taken. Your GM rolls which one.");
}
function shipRollCrisis(sp,id){
  if(!(S.isGM||S.offline))return;const s=S.docs[sp];const cr=(s.crises||[]).find(c=>c.id===id);if(!cr)return;
  const v=rand(10);const c=SHIP_CRISES[v-1];
  setField(sp,"crises",(s.crises||[]).map(x=>x.id===id?{id,type:c[0],ts:Date.now()}:x));
  shipEmit(sp,{pc:false,name:s.name},"Crisis: "+c[0],[{name:"d10",dice:[{v,s:10}],parts:[],total:v,note:c[1]+" · "+c[2]+(cr.why?" ("+cr.why+")":"")}]);
}
function shipRollMishap(sp){
  if(!(S.isGM||S.offline))return;const s=S.docs[sp];
  const m=[rand(6),rand(6),rand(6)];const tot=m[0]+m[1]+m[2];const row=DRILL_MISHAP.find(x=>tot>=x[0]&&tot<=x[1]);
  setField(sp,"mishap",{pending:false,total:tot,text:row?row[2]:"",ts:Date.now()});
  shipEmit(sp,{pc:false,name:s.name},"Drill mishap",[{name:"3d6",dice:m.map(v=>({v,s:6})),parts:[],total:tot,note:row?row[2]:""}]);
}
function shipDrillCalc(s){
  const T=s.trip||{};const C=shipCompute(s);const hexes=Math.max(1,num(T.hexes,1));
  const rut={uncharted:6,old:2,mid:1,year:0,month:-2}[T.rutter||"year"]??0;
  const nav=!!T.familiar&&(s.fittings||[]).some(f=>f.name==="Advanced nav computer");
  const diff=7+rut+Math.floor(hexes/2)+(T.trim?2:0)+(T.rushed?2:0);
  const eff=Math.max(1,C.drive+(T.trim?1:0));const days=6*hexes/eff;
  const regulator=!!T.familiar&&(s.fittings||[]).some(f=>f.name==="Drill course regulator");
  return {hexes,diff,auto:diff<=6||regulator,nav,days,time:"Transit "+(Math.round(days*10)/10)+" days"+(T.trim?" (trimmed)":"")+(regulator?" · Drill course regulator: automatic":""),rut};
}

/* ---------- views ---------- */
function shipNav(){return S.isGM||S.offline||shipPaths().length}
function renderShips(){
  const gm=S.isGM||S.offline;
  const party=shipPaths().filter(p=>!S.docs[p].npc&&(gm||S.docs[p].shared));
  const npcs=gm?shipPaths().filter(p=>S.docs[p].npc):[];
  const mode=gm&&S.shipMode==="npc"?"npc":"party";
  const switcher=gm?`<nav class="shipmode"><button class="${mode==="party"?"on":""}" data-act="ship-mode" data-v="party">Party ships <span class="tag">${party.length}</span></button><button class="${mode==="npc"?"on":""}" data-act="ship-mode" data-v="npc">NPC ships <span class="tag">${npcs.length}</span> <span class="hint">only you see these</span></button></nav>`:"";
  if(mode==="npc"){
    if(S.shipFull&&S.shipSel&&S.docs[S.shipSel]&&S.docs[S.shipSel].npc)return switcher+renderShipSheet(S.shipSel);
    return switcher+renderNpcShips(npcs);
  }
  const sel=S.shipSel&&S.docs[S.shipSel]&&party.includes(S.shipSel)?S.shipSel:party[0];
  const list=`<div class="shiplist">${party.map(p=>{const s=S.docs[p];const C=shipCompute(s);const hp=num(s.hp,C.hpMax);
    return `<button class="chip ${p===sel?"on":""}" data-act="ship-sel" data-doc="${esc(p)}"><span class="av">✦</span>${esc(s.name||"Unnamed")}<span class="mini"><i style="width:${Math.round(100*hp/Math.max(1,C.hpMax))}%"></i></span>${gm&&!s.shared?`<span class="tag">hidden</span>`:""}</button>`}).join("")}
    ${gm?`<button class="btn pri sm" data-act="ship-new">+ New party ship</button>`:""}</div>`;
  if(!sel)return switcher+`${list}<div class="empty" style="margin-top:16px">${gm?"No party ship yet. Use “+ New party ship” to build one.":"Your GM hasn't added a ship yet."}</div>`;
  return switcher+list+renderShipSheet(sel);
}
function renderNpcShips(npcs){
  const tgt=S.shipTgt||{};const party=shipPaths().filter(p=>!S.docs[p].npc);
  const make=`<div class="frame"><div class="frame-b npcmake" style="padding-top:12px">
    <div class="field"><span class="lbl">Start from</span><select id="nsh-tpl" class="inp">${SHIP_TEMPLATES.map((t,i)=>{const H=SHIP_HULLS.find(h=>h[0]===t[1]);return `<option value="${i}" ${i===3?"selected":""}>${esc(t[0])} · HP ${H[4]}, AC ${H[7]}, Armor ${H[3]}, CP ${t[4]}</option>`}).join("")}</select></div>
    <div class="field"><span class="lbl">Name (optional)</span><input id="nsh-name" class="inp" placeholder="e.g. Sacred Wrath"></div>
    <div class="field" style="max-width:90px"><span class="lbl">How many</span><input id="nsh-count" class="inp" type="number" min="1" max="12" value="1"></div>
    <button class="btn pri" data-act="ship-npc-new" style="align-self:end">Create</button><button class="btn" data-act="ship-new" data-npc="1" style="align-self:end">Custom build…</button></div>
    <p class="hint" style="margin:0 14px 12px">Loadouts, crew skill and Command Points come from the book's example ships. Rolls for NPC ships go to your GM log only.</p></div>`;
  const target=`<div class="tgtbox" style="margin:12px 0"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_attack">Shooting at</button></span>
    <select class="inp" data-shiptgtship style="width:auto">${`<option value="">Type it in…</option>`+party.map(p=>`<option value="${esc(p)}" ${tgt.ship===p?"selected":""}>${esc(S.docs[p].name)}</option>`).join("")}</select>
    <label>AC <input class="inp" type="number" value="${esc(tgt.ac??"")}" placeholder="?" data-shiptgt="ac"></label><label>Armor <input class="inp" type="number" value="${esc(tgt.armor??"")}" placeholder="?" data-shiptgt="armor"></label>
    <label class="chk"><input type="checkbox" data-act="ship-tgt" ${tgt.fighter?"checked":""}> Fighter</label><label class="chk"><input type="checkbox" data-act="ship-tgt-hpo" ${tgt.hpo?"checked":""}> Polyceramic overlay (−5 AP)</label></div>`;
  return `${make}${target}<div class="nsgrid">${npcs.length?npcs.map(npcShipCard).join(""):`<div class="empty">No NPC ships yet.</div>`}</div>`;
}
function npcShipCard(sp){
  const s=S.docs[sp];const C=shipCompute(s);const tmp=s.tmp||{};const id=sp.slice(sp.indexOf("/")+1);
  const hp=num(s.hp,C.hpMax);const pct=Math.max(0,Math.min(100,Math.round(100*hp/Math.max(1,C.hpMax))));const col=pct>50?"var(--accent2,#2f855a)":pct>25?"#c27b13":"var(--bad)";
  const H=shipHitParts(s,C);
  const guns=(s.weapons||[]).map(w=>{const W=SHIP_WEAPONS.find(x=>x[0]===w.name)||[];const st=C.sysOf(w.id);const mx=weapAmmoMax(w.name,C.ci,w.extraAmmo);const am=(s.ammo||{})[w.id];const cur=am==null?mx:num(am);
    const free=tmp.fireAll&&!(tmp.fired||{})[w.id];const cost=free?0:2;const dis=st!=="ok"||C.decal||(mx&&cur<=0)||num(s.cp)<cost;
    return `<tr class="${st!=="ok"?"dead":""}"><td><b>${esc(w.name)}</b><div class="hint">${[W[9]?"AP "+W[9]:"",W[10]||"",mx?"Ammo "+cur+"/"+mx:"",st!=="ok"?st:""].filter(Boolean).join(" · ")||"&nbsp;"}</div></td>
      <td><button class="rollbtn" data-act="ship-hit" data-doc="${esc(sp)}" data-dept="gunnery" data-id="${esc(w.id)}" ${dis?"disabled":""}>${sgn(H.bonus+(num(tmp.targetSys)?-4:0))}</button><span class="cpcost ${free?"disc":""}">${free?"paid":"2 CP"}</span></td>
      <td><button class="rollbtn" data-act="ship-dmg" data-doc="${esc(sp)}" data-dept="gunnery" data-id="${esc(w.id)}" ${W[3]==="Special"?"disabled":""}>${esc(W[3]||"")}</button></td></tr>`}).join("");
  const crN=(s.crises||[]).length;
  return `<div class="frame nscard"><div class="nshead"><button class="rword nsname" data-act="ship-full" data-doc="${esc(sp)}" title="Open the full sheet">${esc(s.name||"NPC ship")}</button><span class="hint">${esc(C.H[0])} · crew ${sgn(num(s.crewSkill,1))}</span><span style="flex:1"></span>
      <button class="btn sm" data-act="ship-full" data-doc="${esc(sp)}">Full sheet</button><button class="btn sm" data-act="ship-dup" data-doc="${esc(sp)}">Duplicate</button><button class="btn sm" style="color:var(--bad)" data-act="ship-del" data-doc="${esc(sp)}">${S.confirm==="ship-del:"+sp?"Click again":"Delete"}</button></div>
    <div class="nsstats">
      <div class="nshp"><div class="hpnums"><b style="color:${col}">${hp}</b>/${C.hpMax}</div><div class="hpbar"><i style="width:${pct}%;background:${col}"></i></div>
        <div class="nshpctl"><button class="btn sm" style="color:var(--bad)" data-act="ship-hp" data-doc="${esc(sp)}" data-d="-1" data-inp="#nshp-${esc(id)}">Dmg</button><input id="nshp-${esc(id)}" class="inp" type="number" min="0" placeholder="0"><button class="btn sm" style="color:var(--accent2,#2f855a)" data-act="ship-hp" data-doc="${esc(sp)}" data-d="1" data-inp="#nshp-${esc(id)}">Fix</button></div></div>
      <div><span class="lbl">AC</span><b>${C.ac}</b></div><div><span class="lbl">Armor</span><b>${C.armor}</b></div><div><span class="lbl">Speed</span><b>${C.speed==null?"—":sgn(C.speed)}</b></div>
      <div class="nscp"><span class="lbl">CP</span><span><button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="cp" data-d="-1">−</button><b>${num(s.cp)}</b><button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="cp" data-d="1">+</button></span><button class="btn sm" data-act="ship-turn" data-doc="${esc(sp)}">New turn (${num(s.npcCP,4)-2*C.haywire})</button></div>
    </div>
    ${guns?`<table class="shipguns nsguns"><tbody>${guns}</tbody></table>`:`<p class="hint">Unarmed.</p>`}
    <div class="nsfoot"><button class="btn sm" data-act="ship-fireall" data-doc="${esc(sp)}" data-dept="gunnery" ${tmp.fireAll||num(s.cp)<3||!guns?"disabled":""}>Fire All Guns <span class="cpcost">3 CP</span></button>
      <button class="btn sm" data-act="ship-target" data-doc="${esc(sp)}" data-dept="gunnery" ${num(s.cp)<1||!guns?"disabled":""}>Target Systems <span class="cpcost">1 CP</span></button>
      <button class="btn sm" data-act="ship-evasive" data-doc="${esc(sp)}" data-dept="bridge" ${num(s.cp)<2||tmp.evasive!=null?"disabled":""}>Evasive <span class="cpcost">2 CP</span></button>
      ${crN?`<span class="tag on">${crN} crisis${crN>1?"es":""}</span>`:""}${num(tmp.ac)?`<span class="tag on">AC +${num(tmp.ac)}</span>`:""}</div>
  </div>`;
}
function roleOpts(s,dept){
  const cur=(s.roles||{})[dept]||"";const chars=sheetPaths().filter(p=>!S.docs[p].npc);
  return `<option value="">NPC crew (${sgn(num(s.crewSkill,1))})</option>`+chars.map(p=>`<option value="${esc(p)}" ${p===cur?"selected":""}>${esc(S.docs[p].name||"Unnamed")}${S.docs[p].player?" ("+esc(S.docs[p].player)+")":""}</option>`).join("");
}
function rollerHint(s,dept,sk){const r=shipRoller(s,dept);if(!r.pc)return "Crew "+sgn(num(s.crewSkill,1));const lv=r.R.skills[sk]??-1;return (SKILL[sk]?.name||sk)+" "+(lv<0?"untrained":lv)}
function renderShipSheet(sp){
  const s=S.docs[sp];const C=shipCompute(s);const gm=S.isGM||S.offline;const anyAct=shipCanAny(sp);
  const hp=num(s.hp,C.hpMax);const hpPct=Math.max(0,Math.min(100,Math.round(100*hp/Math.max(1,C.hpMax))));
  const hpCol=hpPct>50?"var(--accent2,#2f855a)":hpPct>25?"#c27b13":"var(--bad)";
  const fuel=num(s.fuel,C.fuelMax);const tab=S.shipTab||"combat";const tmp=s.tmp||{};
  const step=(f,d,lbl,dis)=>`<button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="${f}" data-d="${d}" ${dis?"disabled":""} aria-label="${lbl}">${d>0?"+":"−"}</button>`;
  const head=`<header class="sheethead shiphead"><div class="sheethead-in">
    <div class="portrait shipicon">${s.npc?"⚠":"✦"}</div>
    <div class="who"><h1>${esc(s.name||"Unnamed ship")}</h1><div class="sub">${esc(C.H[0])} · ${C.cls}${C.sysDrive?" · System drive":" · Spike drive-"+C.drive+(C.drive<C.driveFull?" (damaged from "+C.driveFull+")":"")}${s.npc?` · <b style="color:var(--bad)">NPC ship</b> (only you see this)`:!s.shared?` · <b style="color:#c27b13">Hidden from players</b>`:""}</div>
      <div class="sub" style="opacity:.8">Crew ${num(s.crew,C.crewMin)} (min ${C.crewMin}, max ${C.crewMax})${C.cargo?" · Cargo "+C.cargo+" tons":""} · Value ${money(C.cost)} cr · Maintenance ${money(C.maint)} cr / 6 months</div></div>
    <div class="bactions">${gm?`<button class="btn dk" data-act="ship-refit" data-doc="${esc(sp)}">Refit / edit</button>${s.npc?`<button class="btn dk" data-act="view" data-v="ships" onclick="S.shipMode='npc';S.shipFull=false">← NPC ships</button>`:`<button class="btn dk" data-act="ship-vis" data-doc="${esc(sp)}">${s.shared?"Hide from players":"Show to players"}</button>`}<button class="btn dk" data-act="ship-del" data-doc="${esc(sp)}">${S.confirm==="ship-del:"+sp?"Click again to delete":"Delete"}</button>`:""}</div>
  </div></header>`;
  const box=(label,val,sub,extra="",key="")=>`<div class="frame stat shipstat"><div class="lbl">${key?`<button class="rword" data-act="rule" data-key="${key}">${label}</button>`:label}</div><div class="big">${val}</div>${sub?`<div class="hint">${sub}</div>`:""}${extra}</div>`;
  const top=`<section class="shiptop">
    <div class="frame hpbox shiphp"><div class="hpctl">${anyAct?`<button class="btn sm" style="color:var(--accent2,#2f855a)" data-act="ship-hp" data-doc="${esc(sp)}" data-d="1">Repair</button><input id="ship-hp-amt" class="inp" type="number" min="0" placeholder="0"><button class="btn sm" style="color:var(--bad)" data-act="ship-hp" data-doc="${esc(sp)}" data-d="-1">Damage</button>`:""}</div>
      <div><div class="hpnums"><b style="color:${hpCol}">${hp}</b> / ${C.hpMax}</div><div class="hpbar"><i style="width:${hpPct}%;background:${hpCol}"></i></div><div class="lbl" style="text-align:center"><button class="rword" data-act="rule" data-key="ship_hp">Hull points</button></div></div></div>
    ${box("Armor Class",C.ac,C.acNote.join(", "),"","ship_ac")}
    ${box("Armor",C.armor,C.armor<C.armorBase?"Halved by Armor Loss":"Subtracted from damage","","ship_armor")}
    ${box("Speed",C.speed==null?"—":sgn(C.speed),C.speed==null?"Stations can't maneuver":"Added to Pilot checks"+(num(tmp.speed)?" · Boost +"+tmp.speed:""),"","ship_speed")}
    <div class="frame stat shipstat cpbox"><div class="lbl"><button class="rword" data-act="rule" data-key="ship_cp">Command Points</button></div><div class="big">${num(s.cp)}</div>
      <div class="cpctl">${anyAct?step("cp",-1,"Spend 1 CP")+step("cp",1,"Add 1 CP"):""}</div>
      ${anyAct?`<button class="btn sm" data-act="ship-turn" data-doc="${esc(sp)}">New turn</button>`:""}<div class="hint">${s.npc?"Starts each turn at "+num(s.npcCP,4):"Starts each turn at 0"}${C.haywire?" −"+2*C.haywire+" (Haywire)":""}${num(s.round)?" · turn "+num(s.round):""}</div></div>
    <div class="frame stat shipstat"><div class="lbl"><button class="rword" data-act="rule" data-key="ship_fuel">Fuel</button></div><div class="big">${fuel}<small>/${C.fuelMax}</small></div><div class="cpctl">${anyAct?step("fuel",-1,"Use fuel")+step("fuel",1,"Refuel"):""}</div><div class="hint">500 cr per load</div></div>
  </section>`;
  // Roles
  const roles=`<div class="frame"><div class="frame-h"><span><button class="rword" data-act="rule" data-key="ship_crew">Crew stations</button></span></div><div class="frame-b roles">
    ${DEPTS.map(([k,l,sk])=>`<label class="rolerow"><span class="rlbl">${l}</span><select class="inp" data-shiprole="${esc(sp)}" data-dept="${k}" ${anyAct?"":"disabled"}>${roleOpts(s,k)}</select><span class="hint">${rollerHint(s,k,{bridge:"pilot",gunnery:"shoot",engineering:"fix",comms:"program",captain:"lead"}[k])}</span></label>`).join("")}
    ${anyAct?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn sm" data-act="ship-role-clear" data-doc="${esc(sp)}">Clear all stations</button><button class="btn sm" data-act="ship-endfight" data-doc="${esc(sp)}">${S.confirm==="ship-endfight"?"Click again to end the fight":"End fight"}</button></div>`:""}
    <p class="hint" style="margin:6px 0 0">Anyone can take any station, and one person can hold several. Empty stations use the NPC crew.</p></div></div>`;
  const tabs=`<nav class="tabs">${[["combat","Combat"],["systems","Weapons & systems"],["travel","Travel"],["notes","Notes"]].map(([k,l])=>`<button class="tab ${tab===k?"on":""}" data-act="ship-tab" data-v="${k}">${l}</button>`).join("")}</nav>`;
  const body=tab==="systems"?shipSystemsTab(sp,s,C):tab==="travel"?shipTravelTab(sp,s,C):tab==="notes"?`<div class="frame-b">${gm?`<textarea class="inp" rows="10" data-doc="${esc(sp)}" data-path="notes" data-live placeholder="Ship notes, cargo manifest, debts…">${esc(s.notes||"")}</textarea>`:`<p style="white-space:pre-wrap">${esc(s.notes||"No notes.")}</p>`}</div>`:shipCombatTab(sp,s,C);
  return `${head}${top}<section class="shipbody"><div class="stack">${s.npc?"":shipCheatSheet()+roles}${shipCrisesBox(sp,s,C)}${s.npc?`<div class="frame"><div class="frame-b"><p class="hint" style="margin:0">NPC ships use a fixed ${num(s.npcCP,4)} Command Points each turn and roll with crew skill ${sgn(num(s.crewSkill,1))} (guns ${sgn(num(s.npcHit,num(s.crewSkill,1)+2))}). Per the book, they don't earn extra points or take captain actions. Change these with Refit / edit.</p></div></div>`:""}</div><div class="frame col-panel">${tabs}${body}</div></section>`;
}
function actBtn(sp,s,act,dept,cost,label,desc,extra="",o={}){
  const cd=o.as||dept;const ec=effCost(s,cost,cd);const can=shipCanAct(sp,cd);const short=num(s.cp)<ec;
  return `<div class="sact"><button class="btn ${can&&!short?"":"off"}" data-act="${act}" data-doc="${esc(sp)}" data-dept="${dept}" ${can&&!short?"":"disabled"} title="${can?short?"Not enough Command Points":"":"Only the GM or this department's character"}">${label}<span class="cpcost ${ec<cost||o.cpTxt?"disc":""}">${o.cpTxt||ec+" CP"}</span></button><span class="hint">${desc}</span>${extra}</div>`;
}
const ATTR_OPTS=["str","dex","con","int","wis","cha"].map(a=>`<option value="${a}" ${a==="int"?"selected":""}>${a.toUpperCase()}</option>`).join("");
const shipSkillOpts=sel=>Object.keys(SKILL).filter(k=>!/^(biopsionics|metapsionics|precognition|telekinesis|telepathy|teleportation)$/.test(k)||true).map(k=>`<option value="${k}" ${k===sel?"selected":""}>${esc(SKILL[k].name)}</option>`).join("");
function shipCombatTab(sp,s,C){
  const tmp=s.tmp||{};const tgt=S.shipTgt||{};const can=shipCanAny(sp);
  const who=d=>`<span class="hint deptby">${esc(shipRoller(s,d).name)}</span>`;
  const sect=(d,title,inner,note="")=>`<div class="sect deptsect"><div class="deptttl"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_${d}">${title}</button></span>${who(d)}<span style="flex:1"></span></div>${genFor(d)}${note}<div class="actgrid2">${inner}</div></div>`;
  const counter=(f,val,lbl,post="")=>`<span class="ctr"><span class="lbl">${lbl}</span>${can?`<button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="${f}" data-d="-1">−</button>`:""}<b>${val}</b>${post}${can?`<button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="${f}" data-d="1">+</button>`:""}</span>`;
  const crises=(s.crises||[]);
  const live=crises.filter(c=>!c.pending);
  function genFor(d){if(s.npc)return "";return `<details class="gen" ${(S.shipGen||{})[d]?"open":""}><summary class="hint" data-act="ship-gen" data-dept="${d}">General actions</summary><p class="hint" style="margin:4px 0"><button class="rword" data-act="rule" data-key="ship_general">Taking a general action uses up your whole turn.</button></p>
    <div class="actgrid2">
    ${actBtn(sp,s,"ship-duty",d,0,"Do Your Duty","+1 CP. No roll.","",{cpTxt:"+1"})}
    ${actBtn(sp,s,"ship-above",d,0,"Above and Beyond","Explain how you help, roll vs 9. Success: skill + 1 CP. Failure: −1 CP.",`<span class="pick"><select class="inp" id="ab-attr-${d}">${ATTR_OPTS}</select><select class="inp" id="ab-skill-${d}">${shipSkillOpts({bridge:"pilot",gunnery:"shoot",engineering:"fix",comms:"program",captain:"lead"}[d])}</select></span>`,{cpTxt:"roll"})}
    ${actBtn(sp,s,"ship-crisis-deal",d,0,"Deal With a Crisis",live.length?"Explain your plan, roll vs 10 (GM can shift it ±2). Also covers other things aboard, like fighting boarders.":"No active crises right now.",live.length?`<span class="pick"><select class="inp" id="cr-pick-${d}">${live.map(c=>`<option value="${esc(c.id)}">${esc(c.type)}</option>`).join("")}</select><select class="inp" id="cr-attr-${d}">${ATTR_OPTS}</select><select class="inp" id="cr-skill-${d}">${shipSkillOpts("fix")}</select><input class="inp" id="cr-diff-${d}" type="number" value="10" min="6" max="14" style="width:56px" title="Difficulty"></span>`:"",{cpTxt:"roll"})}
    </div></details>`}
  // weapons table, like a character's attacks
  const H=shipHitParts(s,C);const gunOk=shipCanAct(sp,"gunnery");
  const weapRows=(s.weapons||[]).map(w=>{const W=SHIP_WEAPONS.find(x=>x[0]===w.name)||[];const st=C.sysOf(w.id);const mx=weapAmmoMax(w.name,C.ci,w.extraAmmo);const am=(s.ammo||{})[w.id];const cur=am==null?mx:num(am);
    const free=tmp.fireAll&&!(tmp.fired||{})[w.id];const hitCost=free?0:effCost(s,2,"gunnery");const dead=st!=="ok";const noAmmo=mx&&cur<=0;
    const hitDis=!gunOk||dead||C.decal||noAmmo||num(s.cp)<hitCost;
    return `<tr class="${dead?"dead":""}"><td><b>${esc(w.name)}</b><div class="hint">${[W[9]?"AP "+W[9]:"",W[10]||"",dead?`<b style="color:var(--bad)">${st}</b>`:""].filter(Boolean).join(" · ")||"&nbsp;"}</div></td>
      <td><button class="rollbtn" data-act="ship-hit" data-doc="${esc(sp)}" data-dept="gunnery" data-id="${esc(w.id)}" ${hitDis?"disabled":""} title="${free?"Paid by Fire All Guns":"Fire One Weapon: "+hitCost+" CP"}">${sgn(H.bonus+(num(tmp.targetSys)?-4:0))}</button><span class="cpcost ${free?"disc":""}">${free?"paid":hitCost+" CP"}</span>${(tmp.targeted||{})[w.id]?` <span class="tag on">targeted</span>`:""}</td>
      <td><button class="rollbtn" data-act="ship-dmg" data-doc="${esc(sp)}" data-dept="gunnery" data-id="${esc(w.id)}" ${!gunOk||W[3]==="Special"?"disabled":""}>${esc(W[3]||"")}${H.dmgMod?sgn(H.dmgMod).replace("+0",""):""}</button></td>
      <td class="num">${mx?`${cur}/${mx}`:"—"}</td></tr>`}).join("");
  const gun=`${C.decal?`<div class="notice">Target Decalibration: the guns can't fire until it's resolved.</div>`:""}
    <div class="tgtbox"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_attack">Target</button></span><label>AC <input class="inp" id="tgt-ac" type="number" value="${esc(tgt.ac??"")}" placeholder="?" data-shiptgt="ac"></label><label>Armor <input class="inp" id="tgt-arm" type="number" value="${esc(tgt.armor??"")}" placeholder="?" data-shiptgt="armor"></label><label class="chk"><input type="checkbox" data-act="ship-tgt" ${tgt.fighter?"checked":""}> Fighter</label></div>
    ${(s.weapons||[]).length?`<div class="tbl-wrap"><table class="shipguns"><thead><tr><th><button class="rword" data-act="rule" data-key="ship_weapq">Weapon</button></th><th><button class="rword" data-act="rule" data-key="ship_attack">Hit</button></th><th>Damage</th><th>Ammo</th></tr></thead><tbody>${weapRows}</tbody></table></div>`:`<p class="hint">No weapons mounted.</p>`}
    <div class="actgrid2">${actBtn(sp,s,"ship-fireall","gunnery",3,"Fire All Guns",tmp.fireAll?"Paid. Roll Hit on each weapon.":"Every weapon gets one free Hit roll this turn.")}
    ${actBtn(sp,s,"ship-target","gunnery",1,"Target Systems",num(tmp.targetSys)?"Next Hit roll is aimed at a system.":"Next Hit: −4, half damage, disables a system.")}</div>
    <div class="ctrs">${counter("tmp.hit",sgn(num(tmp.hit)),"Defeat ECM bonus")}</div>`;
  const disabled=[...(s.weapons||[]).map(w=>[w.id,w.name]),...(s.defenses||[]).map(x=>[x.id,x.name]),...(s.fittings||[]).map(x=>[x.id,x.name])].filter(([id])=>C.sysOf(id)==="disabled");
  return `<div class="frame-b shipcombat">
    ${C.pen?`<div class="notice">Missed maintenance: ${C.pen} to all ship checks and hit rolls.</div>`:""}
    <div class="sect deptsect"><div class="deptttl"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_gunnery">Gunnery</button></span>${who("gunnery")}<span style="flex:1"></span></div>${genFor("gunnery")}${gun}</div>
    ${sect("bridge","Bridge",`
      ${actBtn(sp,s,"ship-evasive","bridge",2,"Evasive Maneuvers",tmp.evasive!=null?"Used this round.":"Pilot vs 9: +Pilot to AC until your next turn.")}
      ${actBtn(sp,s,"ship-escape","bridge",4,"Escape Combat","Opposed Pilot. Each win is 1 Escape point; 3 and you're out.")}
      ${actBtn(sp,s,"ship-pursue","bridge",3,"Pursue Target","Opposed Pilot. A win takes 1 Escape point off the target.")}`,
      (C.engineLock?`<div class="notice">Engine Lock: no bridge actions until it's resolved.</div>`:"")+`<div class="ctrs">${counter("escape",num(s.escape),"Escape points","/3")}</div>`)}
    ${sect("engineering","Engineering",`
      ${actBtn(sp,s,"ship-boost","engineering",2,"Boost Engines","Int/Fix vs 8: +2 Speed until your next turn.")}
      ${actBtn(sp,s,"ship-dc","engineering",3,"Damage Control","Int/Fix vs "+(7+num(s.dcUses))+": repair Fix × "+[2,3,4,6][C.ci]+" HP.")}
      ${actBtn(sp,s,"ship-repair","engineering",3,"Emergency Repairs","Int/Fix vs 8: get a disabled system working.",disabled.length||num(s.driveDmg)?`<span class="pick"><select class="inp" id="er-pick">${disabled.map(([id,n])=>`<option value="${esc(id)}">${esc(n)}</option>`).join("")}${num(s.driveDmg)?`<option value="drive">Spike drive (−${num(s.driveDmg)})</option>`:""}</select></span>`:"")}`)}
    ${sect("comms","Comms",`
      ${actBtn(sp,s,"ship-crash","comms",2,"Crash Systems","Opposed Program: the target loses CP next turn.")}
      ${actBtn(sp,s,"ship-ecm","comms",2,"Defeat ECM","Opposed Program: +2 × Program to hit it this round.")}
      ${actBtn(sp,s,"ship-ghost","comms",2,"Sensor Ghost",tmp.ghost!=null?"Used this round.":"Program vs 9: +Program to AC until your next turn.")}`)}
    ${s.npc?"":sect("captain","Captain",`
      ${actBtn(sp,s,"ship-support","captain",0,"Support Department",tmp.support?"Active: "+DEPTS.find(d=>d[0]===tmp.support)?.[1]+".":tmp.supportUsed?"Used this round.":"One action there costs 2 less CP.",`<span class="pick"><select class="inp" id="sup-pick">${DEPTS.filter(d=>d[0]!=="captain").map(([k,l])=>`<option value="${k}">${l}</option>`).join("")}</select></span>`)}
      ${actBtn(sp,s,"ship-intofire","captain",0,"Into the Fire","Take a Crew Lost crisis, gain Lead + 1 CP.")}
      ${actBtn(sp,s,"ship-keep","captain",0,"Keep It Together","Turn an enemy hit into a Crisis.")}`)}
    ${(s.defenses||[]).some(d=>d.name==="Burst ECM Generator")?`<div class="sect"><span class="lbl">Defenses</span><div class="sact"><button class="btn" data-act="ship-ecmburst" data-doc="${esc(sp)}" ${s.ecmUsed?"disabled":""}>Burst ECM</button><span class="hint">Negate one hit, once per fight.${s.ecmUsed?" Used.":""}</span></div></div>`:""}
  </div>`;
}
function shipCheatSheet(){
  return `<details class="frame cheat" ${(S.cheatOpen??!window.matchMedia("(max-width:640px)").matches)?"open":""}><summary class="frame-h" data-act="ship-cheat"><span>Space combat cheat sheet</span><span class="hint">▾</span></summary><div class="frame-b"><ol>
    <li><b>Initiative:</b> each ship rolls 1d8 + its pilot's Int or Dex.</li>
    <li><b>Your ship's turn:</b> press <b>New turn</b>. You start with 0 Command Points (CP).</li>
    <li><b>Earn CP:</b> <i>Do Your Duty</i> (+1) or <i>Above and Beyond</i> (a skill roll).</li>
    <li><b>Spend CP</b> on your station's actions, like firing a gun (2 CP).</li>
    <li><b>One kind per person:</b> station actions <i>or</i> a general action, not both.</li>
    <li><b>Leftover CP is lost</b> when the turn ends.</li>
    <li><b>Big hit?</b> Once per round, take a <i>Crisis</i> instead, then fix it with <i>Deal With a Crisis</i>.</li>
  </ol></div></details>`;
}
function shipCrisesBox(sp,s,C){
  const cr=s.crises||[];const can=shipCanAny(sp);const gm=S.isGM||S.offline;const mi=s.mishap;
  const mishap=mi?`<div class="crisis ${mi.pending?"acute":""}"><div><b>Drill mishap</b>${mi.pending?` <span class="tag on">waiting for GM</span><div class="hint">The spike drill failed.${gm?"":" Your GM rolls what went wrong."}</div>`:`<div class="hint">${mi.total}: ${esc(mi.text||"")}</div>`}</div>
    <span>${mi.pending&&gm?`<button class="btn sm pri" data-act="ship-mishap-roll" data-doc="${esc(sp)}">Roll 3d6</button>`:""}${!mi.pending&&can?`<button class="iconbtn" data-act="ship-mishap-x" data-doc="${esc(sp)}" title="Clear">✓</button>`:""}</span></div>`:"";
  return `<div class="frame"><div class="frame-h"><span><button class="rword" data-act="rule" data-key="ship_crisis">Crises</button></span></div><div class="frame-b">
    ${mishap}
    ${cr.length?cr.map(c=>{if(c.pending)return `<div class="crisis acute"><div><b>Crisis</b> <span class="tag on">waiting for GM</span><div class="hint">${esc(c.why||"")}${gm?"":". Your GM rolls which crisis it is."}</div></div><span>${gm?`<button class="btn sm pri" data-act="ship-crisis-roll" data-doc="${esc(sp)}" data-id="${esc(c.id)}">Roll d10</button>`:""}${gm?`<button class="iconbtn" data-act="ship-crisis-x" data-doc="${esc(sp)}" data-id="${esc(c.id)}" title="Cancel">×</button>`:""}</span></div>`;
      const d=SHIP_CRISES.find(x=>x[0]===c.type)||["","",""];return `<div class="crisis ${d[1]==="Acute"?"acute":""}"><div><b>${esc(c.type)}</b> <span class="tag ${d[1]==="Acute"?"on":""}">${d[1]}</span><div class="hint">${esc(d[2])}${d[1]==="Acute"?" Resolve it by the end of the next round.":""}</div></div>${can?`<button class="iconbtn" data-act="ship-crisis-x" data-doc="${esc(sp)}" data-id="${esc(c.id)}" title="Mark resolved">✓</button>`:""}</div>`}).join(""):mishap?"":`<p class="hint" style="margin:0">No active crises.</p>`}
    ${can?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn sm" data-act="ship-crisis-take" data-doc="${esc(sp)}" title="Negates the hit. Once per round.">Take a Crisis instead of a hit</button>${gm?`<select class="inp" id="cr-add" style="width:auto"><option value="">Add a specific crisis…</option>${SHIP_CRISES.map(c=>`<option>${c[0]}</option>`).join("")}</select><button class="btn sm" data-act="ship-crisis-add" data-doc="${esc(sp)}">Add</button>`:""}</div>`:""}
  </div></div>`;
}
function shipSystemsTab(sp,s,C){
  const gm=S.isGM||S.offline;const can=shipCanAny(sp);
  const stBtn=(id)=>{const st=C.sysOf(id);return can?`<button class="tag sys-${st}" data-act="ship-sys" data-doc="${esc(sp)}" data-id="${esc(id)}" title="Click to cycle: working → disabled → destroyed">${st==="ok"?"working":st}</button>`:`<span class="tag sys-${st}">${st==="ok"?"working":st}</span>`};
  const row=(id,name,meta,desc)=>`<div class="sysrow"><div><b>${esc(name)}</b> ${stBtn(id)}<div class="hint">${meta}</div>${desc?`<div class="hint">${esc(desc)}</div>`:""}</div></div>`;
  const weap=(s.weapons||[]).map(w=>{const W=SHIP_WEAPONS.find(x=>x[0]===w.name)||[];const mx=weapAmmoMax(w.name,C.ci,w.extraAmmo);const am=(s.ammo||{})[w.id];const cur=am==null?mx:num(am);
    return row(w.id,w.name,`${W[3]} damage${W[9]?" · AP "+W[9]:""}${W[10]?" · "+W[10]:""}${mx?` · Ammo <b>${cur}</b>/${mx} ${can?`<button class="iconbtn" data-act="ship-ammo" data-doc="${esc(sp)}" data-id="${esc(w.id)}" data-d="-1">−</button><button class="iconbtn" data-act="ship-ammo" data-doc="${esc(sp)}" data-id="${esc(w.id)}" data-d="full" title="Restock (${money(W[2])} cr each)">↺</button>`:""}`:""}`,"")}).join("")||`<p class="hint">None.</p>`;
  const defs=(s.defenses||[]).map(x=>{const D=SHIP_DEFENSES.find(y=>y[0]===x.name)||[];return row(x.id,x.name,"",D[5])}).join("")||`<p class="hint">None.</p>`;
  const fits=(s.fittings||[]).map(x=>{const F=SHIP_FITTINGS.find(y=>y[0]===x.name)||[];return row(x.id,x.name+(num(x.qty,1)>1?" ×"+num(x.qty,1):""),"",F[8])}).join("")||`<p class="hint">None.</p>`;
  return `<div class="frame-b">
    <div class="budget" style="margin-bottom:16px">${budgetBar("Power",C.power,C.powerMax)}${budgetBar("Mass",C.mass,C.massMax)}${budgetBar("Hardpoints",C.hard,C.hardMax)}</div>
    <div class="sect"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_drive">Spike drive</button></span><div class="sysrow"><div><b>${C.sysDrive?"System drive (no spike drilling)":"Drive-"+C.driveFull}</b>${num(s.driveDmg)?` <span class="tag sys-disabled">−${num(s.driveDmg)} damaged</span>`:""}<div class="hint">${C.sysDrive?"":"Range "+C.drive+" hex"+(C.drive===1?"":"es")+" · 6 days per hex ÷ "+C.drive}</div></div>${gm&&!C.sysDrive?`<span><button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="driveDmg" data-d="-1" title="Repair drive">−</button><button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="driveDmg" data-d="1" title="Damage drive">+</button></span>`:""}</div></div>
    <div class="sect"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_weapq">Weapons</button></span>${weap}</div>
    <div class="sect"><span class="lbl">Defenses</span>${defs}</div>
    <div class="sect"><span class="lbl">Fittings</span>${fits}</div>
    <p class="hint">Click a status tag to cycle it: working → disabled → destroyed → working. Disabled systems can be fixed with Emergency Repairs; destroyed ones can't be fixed during a fight.</p>
  </div>`;
}
function budgetBar(l,used,max){const over=used>max;const pct=Math.min(100,Math.round(100*used/Math.max(1,max)));return `<div class="bud ${over?"over":""}"><div class="budl"><span>${l}</span><b>${Math.round(used*10)/10} / ${max}</b></div><div class="bar"><i style="width:${pct}%"></i></div></div>`}
function shipTravelTab(sp,s,C){
  const T=s.trip||{};const D=shipDrillCalc(s);const can=shipCanAny(sp);const gm=S.isGM||S.offline;
  const tin=(k,attrs)=>`data-shiptrip="${esc(sp)}" data-k="${k}" ${can?"":"disabled"} ${attrs||""}`;
  const reg=(within)=>{const base=within?6:48;const t=base/Math.max(1,C.drive);const tt=base/Math.max(1,C.drive+1);return `${Math.round(t*10)/10} h <span class="hint">(trimmed ${Math.round(tt*10)/10} h)</span>`};
  return `<div class="frame-b">
    <div class="sect"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_drill">Spike drill</button></span>
      ${C.sysDrive?`<p class="hint">This ship has a system drive and can't drill between stars.</p>`:`
      <div class="drill">
<label>Destination <input class="inp" type="text" value="${esc((s.trip||{}).dest||"")}" placeholder="Optional, e.g. Brannock" ${tin("dest")}></label>
        <label>Hexes <input class="inp" type="number" min="1" max="${Math.max(1,C.drive)}" value="${D.hexes}" ${tin("hexes")}></label>
        <label>Rutter <select class="inp" ${tin("rutter")}>${[["month","Less than a month old (−2)"],["year","Less than a year old (+0)"],["mid","1 to 5 years old (+1)"],["old","Over 5 years old (+2)"],["uncharted","No rutter: uncharted (+6)"]].map(([k,l])=>`<option value="${k}" ${(T.rutter||"year")===k?"selected":""}>${l}</option>`).join("")}</select></label>
        <label class="chk"><input type="checkbox" ${tin("trim")} ${T.trim?"checked":""}> Trim the course (+2, faster)</label>
        <label class="chk"><input type="checkbox" ${tin("rushed")} ${T.rushed?"checked":""}> Rushed start (+2)</label>
        ${(s.fittings||[]).some(f=>f.name==="Advanced nav computer"||f.name==="Drill course regulator")?`<label class="chk"><input type="checkbox" ${tin("familiar")} ${T.familiar?"checked":""}> Familiar course</label>`:""}
      </div>
      <div class="drillres"><div><span class="lbl">Difficulty</span><b>${D.diff}</b>${D.auto?` <span class="tag on">automatic</span>`:""}</div><div><span class="lbl">Transit</span><b>${Math.round(D.days*10)/10} days</b></div><div><span class="lbl">Range</span><b>${C.drive} hex${C.drive===1?"":"es"}</b></div><div><span class="lbl">Fuel</span><b>${num(s.fuel,C.fuelMax)} / ${C.fuelMax}</b></div></div>
      ${D.hexes>C.drive?`<div class="notice">Out of range for drive-${C.drive}.</div>`:""}
      <div class="sact"><button class="btn pri" data-act="ship-drill" data-doc="${esc(sp)}" ${shipCanAct(sp,"bridge")?"":"disabled"}>Make the drill</button><span class="hint">Uses 1 fuel. Rolled by the bridge (${esc(shipRoller(s,"bridge").name)}). On a failure the mishap table is rolled for you.</span></div>`}
    </div>
    <div class="sect"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_insys">In-system travel</button></span>
      <table class="mini"><tr><td>Within a region</td><td>${reg(true)}</td></tr><tr><td>Between regions</td><td>${reg(false)}</td></tr></table>
      <div class="sact"><button class="btn" data-act="ship-trim" data-doc="${esc(sp)}" ${shipCanAct(sp,"bridge")?"":"disabled"}>Trim the course</button><span class="hint">Pilot vs 9. Failure doubles the trip.</span></div></div>
    <div class="sect"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_sensors">Sensors and pursuit</button></span>
      <div class="sact"><button class="btn" data-act="ship-detect" data-doc="${esc(sp)}" ${shipCanAct(sp,"comms")?"":"disabled"}>Get a detection lock</button><span class="pick"><label class="chk"><input type="checkbox" id="sen-passive"> Passive (−2)</label></span></div>
      <div class="sact"><button class="btn" data-act="ship-hide" data-doc="${esc(sp)}" ${shipCanAct(sp,"comms")?"":"disabled"}>Avoid detection</button><span class="pick"><label class="chk"><input type="checkbox" id="sen-avoid"> Avoiding population centers (+2)</label></span></div>
      <div class="sact"><button class="btn" data-act="ship-scan" data-doc="${esc(sp)}" ${shipCanAct(sp,"comms")?"":"disabled"}>Ask a scan question</button><span class="hint">Int/Program vs ${8+num(s.scanQ)}. Ask the question first.${num(s.scanQ)?" "+num(s.scanQ)+" answered today.":""}</span>${can&&num(s.scanQ)?`<button class="btn sm" data-act="ship-step" data-doc="${esc(sp)}" data-f="scanQ" data-d="${-num(s.scanQ)}">New day</button>`:""}</div>
      <div class="sact"><button class="btn" data-act="ship-chase" data-doc="${esc(sp)}" ${shipCanAct(sp,"bridge")?"":"disabled"}>Long-range pursuit</button><span class="hint">Opposed Pilot + drive rating.</span></div></div>
    <div class="sect"><span class="lbl"><button class="rword" data-act="rule" data-key="ship_maint">Upkeep</button></span>
      <table class="mini"><tr><td>Maintenance every 6 months</td><td>${C.maint.toLocaleString()} cr</td></tr><tr><td>Periods skipped</td><td>${gm?`<button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="maintSkipped" data-d="-1">−</button>`:""} <b>${num(s.maintSkipped)}</b> ${gm?`<button class="iconbtn" data-act="ship-step" data-doc="${esc(sp)}" data-f="maintSkipped" data-d="1">+</button>`:""} ${num(s.maintSkipped)?`<span class="hint">(${-num(s.maintSkipped)} to ship rolls${num(s.maintSkipped)>=4?", 10% monthly breakdown chance":""})</span>`:""}</td></tr>
      <tr><td>Hull repairs</td><td>1,000 cr per point · ${C.hpMax-num(s.hp,C.hpMax)} missing = ${((C.hpMax-num(s.hp,C.hpMax))*1000).toLocaleString()} cr</td></tr><tr><td>Fuel</td><td>500 cr per load</td></tr><tr><td>NPC crew wages</td><td>120 cr per crew member per day (100 wages + 20 stores)</td></tr></table></div>
  </div>`;
}

/* ---------- wizard ---------- */
function swDesign(){return shipDesign(S.sw)}
function renderShipWizard(){
  const w=S.sw;if(!w)return `<div class="empty">No ship in progress.</div>`;
  const D=swDesign();const ci=D.ci;const steps=["Hull","Weapons","Defenses","Fittings","Crew & finish"];
  const freeP=D.powerMax-D.power,freeM=D.massMax-D.mass,freeH=D.hardMax-D.hard;
  const fits=(c,p,m,h=0)=>p<=freeP&&m<=freeM&&h<=freeH;
  const bar=`<div class="frame swbud"><div class="frame-b budget">${budgetBar("Power",D.power,D.powerMax)}${budgetBar("Mass",D.mass,D.massMax)}${budgetBar("Hardpoints",D.hard,D.hardMax)}<div class="bud"><div class="budl"><span>Cost</span><b>${money(D.cost)} cr</b></div><div class="hint">Maintenance ${money(D.maint)} / 6 mo</div></div></div></div>`;
  let body="";
  if(w.step===0){
    body=`<div class="field"><span class="lbl">Ship name</span><input class="inp" data-sw="name" value="${esc(w.name||"")}" placeholder="e.g. Grendel"></div>
    <div class="hulls">${SHIP_HULLS.map(h=>`<button class="hull ${w.hull===h[0]?"on":""}" data-act="sw-hull" data-v="${esc(h[0])}"><b>${h[0]}</b><span class="tag">${h[11]}</span><div class="hint">${money(h[1])} cr · HP ${h[4]} · AC ${h[7]} · Armor ${h[3]} · Speed ${h[2]??"—"}</div><div class="hint">Power ${h[8]} · Mass ${h[9]} · Hardpoints ${h[10]} · Crew ${h[5]}/${h[6]}</div></button>`).join("")}</div>
    ${D.H[2]==null?"":`<div class="field" style="max-width:320px"><span class="lbl">Spike drive</span><select class="inp" data-sw="drive">${SHIP_DRIVES.map(d=>{const dc=driveCost(d[0],ci);const ok=ci>=clsIdx(d[4]);return `<option value="${d[0]}" ${num(w.drive,1)===d[0]?"selected":""} ${ok?"":"disabled"}>Drive-${d[0]}${d[0]>1?` (${money(dc.cost)} cr, power ${dc.power}, mass ${dc.mass})`:" (included)"}${ok?"":" · needs "+d[4]}</option>`}).join("")}</select></div>`}`;
  }else if(w.step===1){
    body=`<div class="picklist">${SHIP_WEAPONS.map(W=>{const okC=ci>=clsIdx(W[7]);const ok=okC&&fits(0,W[4],W[5],W[6]);
      return `<div class="pickrow ${okC?"":"na"}"><div><b>${W[0]}</b> <span class="tag">${W[7]}+</span><div class="hint">${W[3]} dmg${W[9]?" · AP "+W[9]:""}${W[10]?" · "+W[10]:""}${W[11]?" · Ammo "+W[11]+" ("+money(W[2])+" each)":""}</div><div class="hint">${money(W[1])} cr · Power ${W[4]} · Mass ${W[5]} · Hardpoints ${W[6]}</div></div>
      <button class="btn sm" data-act="sw-add" data-k="weapons" data-v="${esc(W[0])}" ${ok?"":"disabled"} title="${okC?ok?"":"Not enough power, mass or hardpoints":"Needs a "+W[7]+" hull"}">Add</button></div>`}).join("")}</div>`;
  }else if(w.step===2){
    body=`<div class="picklist">${SHIP_DEFENSES.map(X=>{const c=defCost(X,ci);const okC=ci>=clsIdx(X[4]);const have=(w.defenses||[]).some(d=>d.name===X[0]);const ok=okC&&!have&&fits(0,c.power,c.mass);
      return `<div class="pickrow ${okC?"":"na"}"><div><b>${X[0]}</b> <span class="tag">${X[4]}+</span><div class="hint">${esc(X[5])}</div><div class="hint">${money(c.cost)} cr · Power ${c.power} · Mass ${c.mass}</div></div>
      <button class="btn sm" data-act="sw-add" data-k="defenses" data-v="${esc(X[0])}" ${ok?"":"disabled"}>${have?"Added":"Add"}</button></div>`}).join("")}</div>`;
  }else if(w.step===3){
    body=`<div class="picklist">${SHIP_FITTINGS.map(F=>{const c=fitCost(F,ci);const okC=ci>=clsIdx(F[7]);const ok=okC&&fits(0,c.power,c.mass);const q=(w.fittings||[]).filter(f=>f.name===F[0]).reduce((a,f)=>a+num(f.qty,1),0);
      return `<div class="pickrow ${okC?"":"na"}"><div><b>${F[0]}</b> <span class="tag">${F[7]}+</span>${q?` <span class="tag on">×${q}</span>`:""}<div class="hint">${esc(F[8])}</div><div class="hint">${c.cost?money(c.cost)+" cr":F[0]==="Cargo space"?"Free":"Special"} · Power ${c.power} · Mass ${c.mass}</div></div>
      <button class="btn sm" data-act="sw-add" data-k="fittings" data-v="${esc(F[0])}" ${ok?"":"disabled"}>Add</button></div>`}).join("")}</div>`;
  }else{
    body=`<div class="grid2">
      <div class="field"><span class="lbl">Crew aboard</span><input class="inp" type="number" min="${D.crewMin}" max="${D.crewMax}" data-sw="crew" value="${num(w.crew,D.crewMin)}"><span class="hint">Min ${D.crewMin}, max ${D.crewMax}. Three are needed for a safe drill.</span></div>
      <div class="field"><span class="lbl">NPC crew skill</span><input class="inp" type="number" min="-1" max="4" data-sw="crewSkill" value="${num(w.crewSkill,1)}"><span class="hint">Used for any station no character is on. The book uses +1 for civilian crews, +2 military, +3 elite.</span></div>
      ${S.isGM||S.offline?`<label class="chk"><input type="checkbox" data-sw="npc" ${w.npc?"checked":""}> NPC ship (only you see it)</label>${w.npc?"":`<label class="chk"><input type="checkbox" data-sw="hidden" ${w.hidden?"checked":""}> Hide from players for now (no spoilers)</label>`}`:""}
      ${w.npc?`<div class="field"><span class="lbl">Command Points per turn</span><select class="inp" data-sw="npcCP">${[[4,"4: fighters and civilians"],[5,"5: military or pirates"],[6,"6: native spacers, elite warships"],[7,"7: the finest crews in space"]].map(([v,l])=>`<option value="${v}" ${num(w.npcCP,4)===v?"selected":""}>${l}</option>`).join("")}</select></div>
      <div class="field"><span class="lbl">Gunnery hit bonus</span><input class="inp" type="number" data-sw="npcHit" value="${esc(w.npcHit??num(w.crewSkill,1)+2)}"><span class="hint">The book's example ships list this next to each gun.</span></div>`:""}
    </div>
    <div class="swsum"><div><span class="lbl">Hull</span><b>${D.H[0]}</b></div><div><span class="lbl">HP</span><b>${D.hpMax}</b></div><div><span class="lbl">AC</span><b>${D.acBase}</b></div><div><span class="lbl">Armor</span><b>${D.armorBase}</b></div><div><span class="lbl">Speed</span><b>${D.speedBase??"—"}</b></div><div><span class="lbl">Drive</span><b>${D.sysDrive?"System":D.drive}</b></div><div><span class="lbl">Fuel loads</span><b>${D.fuelMax}</b></div><div><span class="lbl">Cargo</span><b>${D.cargo} t</b></div></div>
    ${D.issues.length?`<div class="notice">${D.issues.map(esc).join("<br>")}</div>`:""}
    ${D.power>D.powerMax||D.mass>D.massMax||D.hard>D.hardMax?`<div class="notice">Over budget: remove something to finish.</div>`:""}`;
  }
  const chosen=w.step>=1&&w.step<=3?(()=>{const k=["","weapons","defenses","fittings"][w.step];const arr=w[k]||[];return arr.length?`<div class="frame"><div class="frame-h"><span>On this ship</span></div><div class="frame-b">${arr.map((x,i)=>`<div class="pickrow"><div><b>${esc(x.name)}</b>${k==="fittings"&&num(x.qty,1)>1?" ×"+num(x.qty,1):""}${k==="weapons"&&weapAmmoMax(x.name,ci,0)?`<div class="hint">Ammo ${weapAmmoMax(x.name,ci,x.extraAmmo)} <button class="iconbtn" data-act="sw-ammo" data-i="${i}" data-d="-1" ${num(x.extraAmmo)?"":"disabled"}>−</button><button class="iconbtn" data-act="sw-ammo" data-i="${i}" data-d="1" ${freeM>=1?"":"disabled"} title="Extra magazine: 1 mass">+</button></div>`:""}</div><button class="iconbtn" data-act="sw-rm" data-k="${k}" data-i="${i}" aria-label="Remove">×</button></div>`).join("")}</div></div>`:""})():"";
  const over=D.power>D.powerMax||D.mass>D.massMax||D.hard>D.hardMax||D.issues.length;
  return `<div class="swiz"><h2 class="pagetitle">${w.editing?"Refit ":"New ship"}${w.editing?esc(w.name||""):""}</h2>
    <nav class="swsteps">${steps.map((l,i)=>`<button class="${i===w.step?"on":""}" data-act="sw-step" data-v="${i}">${i+1}. ${l}</button>`).join("")}</nav>
    ${bar}<div class="frame"><div class="frame-b">${body}</div></div>${chosen}
    <div class="swnav"><button class="btn" data-act="sw-cancel">Cancel</button><span style="flex:1"></span>${w.step>0?`<button class="btn" data-act="sw-step" data-v="${w.step-1}">Back</button>`:""}${w.step<4?`<button class="btn pri" data-act="sw-step" data-v="${w.step+1}">Next</button>`:`<button class="btn pri" data-act="sw-finish" ${over?"disabled":""}>${w.editing?"Save refit":"Create ship"}</button>`}</div></div>`;
}
function swAct(act,t){
  const w=S.sw;if(!w)return false;
  switch(act){
    case "sw-step":w.step=Math.max(0,Math.min(4,num(t.dataset.v)));render();window.scrollTo(0,0);return true;
    case "sw-hull":w.hull=t.dataset.v;const D=swDesign();if(D.H[2]==null)w.drive=1;w.crew=Math.max(num(w.crew,1),D.crewMin);render();return true;
    case "sw-add":{const k=t.dataset.k;const n=t.dataset.v;w[k]=w[k]||[];if(k==="fittings"){const ex=w[k].find(f=>f.name===n);if(ex)ex.qty=num(ex.qty,1)+1;else w[k].push({id:rid(),name:n,qty:1})}else w[k].push({id:rid(),name:n});render();return true}
    case "sw-rm":{const k=t.dataset.k;const i=num(t.dataset.i);const arr=w[k]||[];if(k==="fittings"&&num(arr[i].qty,1)>1)arr[i].qty--;else arr.splice(i,1);render();return true}
    case "sw-ammo":{const x=(w.weapons||[])[num(t.dataset.i)];if(x)x.extraAmmo=Math.max(0,num(x.extraAmmo)+num(t.dataset.d));render();return true}
    case "sw-cancel":S.view=w.editing?"ships":"ships";S.sw=null;render();return true;
    case "sw-finish":{const D=swDesign();if(D.power>D.powerMax||D.mass>D.massMax||D.hard>D.hardMax||D.issues.length)return true;
      const data={name:(w.name||"").trim()||"Unnamed ship",hull:w.hull,drive:D.sysDrive?0:num(w.drive,1),weapons:w.weapons||[],defenses:w.defenses||[],fittings:w.fittings||[],crew:Math.max(D.crewMin,Math.min(D.crewMax,num(w.crew,D.crewMin))),crewSkill:num(w.crewSkill,1),npc:!!w.npc,npcCP:num(w.npcCP,4),npcHit:w.npc?num(w.npcHit,num(w.crewSkill,1)+2):null};
      if(w.editing){const sp=w.editing;const s=S.docs[sp];if(!s)return true;Object.entries(data).forEach(([k,v])=>setField(sp,k,v));const C=shipCompute(S.docs[sp]);if(num(s.hp,C.hpMax)>C.hpMax)setField(sp,"hp",C.hpMax);if(num(s.fuel,C.fuelMax)>C.fuelMax)setField(sp,"fuel",C.fuelMax);toastMsg("Refit saved.");S.shipSel=sp}
      else{const path=(S.offline?"ships/local-":"ships/")+rid();createDoc(path,{...data,hp:D.hpMax,fuel:D.fuelMax,cp:0,crises:[],roles:{},tmp:{},sys:{},ammo:{},escape:0,shared:!data.npc&&!w.hidden,notes:"",createdAt:Date.now()});if(S.offline)S.exists[path]=true;S.shipSel=path;toastMsg("Ship created.")}
      S.shipMode=data.npc?"npc":"party";S.shipFull=false;S.sw=null;S.view="ships";S.shipTab="combat";render();return true}
  }
  return false;
}
