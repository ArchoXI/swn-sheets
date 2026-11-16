/* ================= TABLETOP (online map) ================= */
const TT={view:null,sceneId:null,tool:"select",sel:null,bg:{},bgLoading:{},exp:{},unsub:{},lib:null,ui:{panel:"scenes"},wallDraft:null,ruler:null,drag:null,snap:true,preview:false,pings:[],lastPull:undefined,listening:false};
const CFG_P="config/table";
const ttCfg=()=>S.docs[CFG_P]||{};
const ttGM=()=>S.isGM||S.offline;
const ttScenes=()=>Object.keys(S.docs).filter(p=>p.startsWith("scenes/")&&p.split("/").length===2).sort((a,b)=>num(S.docs[a].created)-num(S.docs[b].created));
const ttTokens=sid=>Object.keys(S.docs).filter(p=>p.startsWith("tokens/")&&S.docs[p].scene===sid);
function ttSceneId(){const a=ttCfg().active||null;if(ttGM()){if(TT.sceneId&&S.docs["scenes/"+TT.sceneId])return TT.sceneId;return a&&S.docs["scenes/"+a]?a:(ttScenes()[0]||"").split("/")[1]||null}return a}
const ttScene=()=>{const id=ttSceneId();return id?S.docs["scenes/"+id]:null};
function ttWorld(sc){const g=num(sc.gridPx,70)||70;if(sc.bgW&&sc.bgH)return {w:num(sc.bgW),h:num(sc.bgH),g};return {w:Math.max(1,num(sc.cols,30))*g,h:Math.max(1,num(sc.rows,20))*g,g}}
const ttM=(sc,px)=>px/(num(sc.gridPx,70)||70)*(num(sc.scale,1)||1);
const ttRound=m=>Math.round(m*2)/2;
function ttTokName(t){if(t.sheetId&&S.docs["sheets/"+t.sheetId])return S.docs["sheets/"+t.sheetId].name||"Unnamed";if(t.npcId&&S.docs["npcs/"+t.npcId])return t.name||S.docs["npcs/"+t.npcId].name||"NPC";return t.name||"Token"}
function ttTokImg(t){if(t.img)return t.img;if(t.sheetId)return S.docs["sheets/"+t.sheetId]?.portrait||null;return null}
function ttCanMove(t){if(ttGM())return true;if(!t||!t.sheetId)return false;const c=S.docs["sheets/"+t.sheetId];return !!(c&&(c.owners||[]).includes(S.me))}
const ttMine=t=>!!(t&&t.sheetId&&(S.docs["sheets/"+t.sheetId]?.owners||[]).includes(S.me));

/* ---------- listeners ---------- */
function ttListen(){
  if(TT.listening||!S.db||S.offline)return;TT.listening=true;const db=S.db;
  const track=(key,coll,q)=>{if(TT.unsub[key])TT.unsub[key]();TT.unsub[key]=q.onSnapshot(snap=>{const seen=new Set();snap.docs.forEach(d=>{const p=coll+"/"+d.id;seen.add(p);mergeRemote(p,d.data())});
      const prev=TT["seen_"+key]||new Set();prev.forEach(p=>{if(!seen.has(p)&&!(Q[p]&&Q[p].inflight)){delete S.docs[p];delete S.exists[p]}});TT["seen_"+key]=seen;render()},err=>console.warn(key,err))};
  const watchActive=()=>{const a=ttCfg().active||null;if(TT.watchingActive===a)return;TT.watchingActive=a;
    if(TT.unsub.scene){TT.unsub.scene();TT.unsub.scene=null}if(TT.unsub.tokens){TT.unsub.tokens();TT.unsub.tokens=null}
    Object.keys(S.docs).filter(p=>p.startsWith("scenes/")||p.startsWith("tokens/")).forEach(p=>{delete S.docs[p];delete S.exists[p]});
    if(!a){render();return}
    TT.unsub.scene=db.doc("scenes/"+a).onSnapshot(d=>{if(d.exists)mergeRemote("scenes/"+a,d.data());else delete S.docs["scenes/"+a];render()},err=>console.warn("scene",err));
    track("tokens","tokens",db.collection("tokens").where("scene","==",a).where("hidden","==",false))};
  db.doc(CFG_P).onSnapshot(d=>{const data=d.exists?d.data():{};S.docs[CFG_P]=data;
    if(TT.lastPull!==undefined&&data.pull&&data.pull!==TT.lastPull&&S.view!=="table"){ttEnter();toastMsg("Your GM opened the map.")}
    TT.lastPull=data.pull||null;if(!S.isGM)watchActive();render()},err=>console.warn("table cfg",err));
  if(S.isGM){track("scenes","scenes",db.collection("scenes"));track("tokens","tokens",db.collection("tokens"))}
  const since=Date.now()-15000;
  db.collection("pings").where("ts",">",since).onSnapshot(snap=>{snap.docChanges().forEach(ch=>{if(ch.type==="added"){const p=ch.doc.data();if(Date.now()-num(p.ts)<8000)ttShowPing(p)}})},err=>console.warn("pings",err));
  if(S.isGM)db.collection("pings").where("ts","<",Date.now()-60000).get().then(s=>s.docs.forEach(d=>d.ref.delete().catch(()=>{}))).catch(()=>{});
}

/* ---------- entering / leaving ---------- */
function ttEnter(){if(S.view!=="table")TT.prev=S.view;S.view="table";S.drawer=null;document.body.classList.add("tablemode");TT.fitPending=true;render()}
function ttExit(){S.view=TT.prev&&TT.prev!=="table"?TT.prev:"home";S.tsheet=false;document.body.classList.remove("tablemode");const r=document.getElementById("tt");if(r)r.style.display="none";render()}

/* ---------- background images ---------- */
async function ttLoadBg(sid,sc){
  const key=sid+":"+(sc.bgVer||sc.bgUrl||"");if(TT.bg[sid]?.key===key||TT.bgLoading[key])return;
  if(sc.bgUrl){if(TT.lib===null)ttLibLoad();const lib=Array.isArray(TT.lib)?TT.lib:[];if(TT.lib==="loading")return;
    const m=lib.find(e=>e.file===sc.bgUrl);const v=m&&m.ver?(sc.bgUrl.includes("?")?"&":"?")+"v="+m.ver:"";
    TT.bg[sid]={key,url:sc.bgUrl+v};return}
  if(!sc.bgChunks){TT.bg[sid]={key,url:null};return}
  if(sc._localBg){TT.bg[sid]={key,url:sc._localBg};return}
  if(!S.db)return;TT.bgLoading[key]=true;
  try{const parts=await Promise.all(Array.from({length:num(sc.bgChunks)},(_,i)=>S.db.doc("scenes/"+sid+"/bg/"+i).get()));
    TT.bg[sid]={key,url:parts.map(d=>d.exists?d.data().d:"").join("")};}catch(e){console.warn(e);toastMsg("Couldn't load the map image.",true)}
  delete TT.bgLoading[key];render();
}
function ttCompress(file){return new Promise((res,rej)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(u);
  let max=4096,q=.86,url,w,h;for(let tries=0;tries<10;tries++){const sc=Math.min(1,max/Math.max(img.width,img.height));w=Math.round(img.width*sc);h=Math.round(img.height*sc);
    const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.fillStyle="#000";x.fillRect(0,0,w,h);x.drawImage(img,0,0,w,h);url=c.toDataURL("image/jpeg",q);
    if(url.length<=5.3e6)break;if(q>.6)q-=.08;else max=Math.round(max*.85)}
  res({url,w,h})};img.onerror=()=>{URL.revokeObjectURL(u);rej()};img.src=u})}
async function ttUploadBg(sid,file){
  toastMsg("Compressing the map…");let r;try{r=await ttCompress(file)}catch(e){toastMsg("Couldn't read that image.",true);return}
  const CH=900000;const n=Math.ceil(r.url.length/CH);const ver=rid();const p="scenes/"+sid;
  if(S.db&&!S.offline){try{const b=S.db.batch();for(let i=0;i<n;i++)b.set(S.db.doc(p+"/bg/"+i),{d:r.url.slice(i*CH,(i+1)*CH)});await b.commit()}catch(e){console.warn(e);toastMsg("Couldn't save the map image. Try a smaller picture.",true);return}}
  else S.docs[p]._localBg=r.url;
  const sc=S.docs[p];const g=num(sc.gridPx,70);
  ["bgChunks","bgVer","bgW","bgH","bgUrl","cols","rows"].forEach(()=>{});
  setField(p,"bgUrl",null);setField(p,"bgChunks",n);setField(p,"bgVer",ver);setField(p,"bgW",r.w);setField(p,"bgH",r.h);setField(p,"cols",Math.round(r.w/g));setField(p,"rows",Math.round(r.h/g));
  TT.bg[sid]={key:sid+":"+ver,url:r.url};TT.fitPending=true;toastMsg("Map image saved ("+Math.round(r.url.length/1024)+" KB).");render();
}
async function ttLibLoad(){if(TT.lib)return;TT.lib="loading";try{const r=await fetch("maps/index.json",{cache:"no-cache"});TT.lib=r.ok?await r.json():[]}catch(e){TT.lib=[]}
  Object.keys(TT.bg).forEach(k=>{if(TT.bg[k]&&TT.bg[k].url&&!String(TT.bg[k].url).startsWith("data:"))delete TT.bg[k]});render()}

/* ---------- scenes ---------- */
function ttNewScene(from){if(!ttGM())return;const id=rid();const d={name:"New map",gridPx:70,offX:0,offY:0,scale:1,cols:30,rows:20,lighting:"lit",fog:true,walls:[],created:Date.now(),expVer:1};
  if(from){Object.assign(d,{name:from.name,bgUrl:from.file,bgW:from.w,bgH:from.h,gridPx:from.gridPx||70,offX:from.offX||0,offY:from.offY||0,scale:from.scale||1,walls:clone(from.walls||[]),notes:from.notes||"",lighting:from.lighting||"lit",cols:Math.round(from.w/(from.gridPx||70)),rows:Math.round(from.h/(from.gridPx||70))})}
  createDoc("scenes/"+id,d);TT.sceneId=id;TT.fitPending=true;TT.ui.panel="scene";render()}
async function ttDeleteScene(sid){ttTokens(sid).forEach(p=>deleteDoc(p));
  const sc=S.docs["scenes/"+sid];if(S.db&&!S.offline&&sc?.bgChunks){for(let i=0;i<num(sc.bgChunks);i++)S.db.doc("scenes/"+sid+"/bg/"+i).delete().catch(()=>{})}
  if(ttCfg().active===sid)ttSetCfg({active:null});deleteDoc("scenes/"+sid);TT.sceneId=null;render()}
function ttSetCfg(o){const d={...ttCfg(),...o};S.docs[CFG_P]=d;if(S.db&&!S.offline)S.db.doc(CFG_P).set(d,{merge:true}).catch(e=>{console.warn(e);toastMsg("Couldn't update the map settings.",true)})}

/* ---------- tokens ---------- */
function ttViewCenter(sc){const st=document.querySelector(".tt-stage");const v=TT.view||{x:0,y:0,z:1};if(!st)return [200,200];return [(st.clientWidth/2-v.x)/v.z,(st.clientHeight/2-v.y)/v.z]}
function ttSnapPos(sc,x,y,size){const g=num(sc.gridPx,70)||70,ox=num(sc.offX),oy=num(sc.offY);const odd=Math.round(size)%2===1||size<1;
  const f=v=>odd?Math.floor(v/g)*g+g/2:Math.round(v/g)*g;return [f(x-ox)+ox,f(y-oy)+oy]}
function ttAddToken(o){const sc=ttScene();if(!sc||!ttGM())return;const sid=ttSceneId();const [cx,cy]=ttViewCenter(sc);const n=ttTokens(sid).length;
  const [x,y]=ttSnapPos(sc,cx+((n%5)-2)*num(sc.gridPx,70),cy+(Math.floor(n/5)%3-1)*num(sc.gridPx,70),o.size||1);
  const id=rid();createDoc("tokens/"+id,{scene:sid,x,y,size:1,hidden:false,vision:!!o.sheetId,visionM:0,name:"",color:"#c62828",created:Date.now(),...o});TT.sel=id;render()}
function ttTokenImgUpload(id,file){readPortrait(file).then(url=>{setField("tokens/"+id,"img",url);render()}).catch(()=>toastMsg("Couldn't read that image.",true))}

/* ---------- geometry / vision ---------- */
const ttDoorKey=w=>[w.x1,w.y1,w.x2,w.y2].map(v=>Math.round(num(v))).join("_");
function ttDoorOpen(sc,w){if(!w||!w.door)return false;if(w.locked)return !!w.open;const m=sc.doors||{};const k=ttDoorKey(w);return k in m?!!m[k]:!!w.open}
const DOOR_ICON={closed:"M-4 -5 L4 -5 L4 5 L-4 5 Z",open:"M-4 -5 L-4 5 M-4 -5 L4 -2 L4 7 L-4 5",locked:"M-4 -1 L4 -1 L4 6 L-4 6 Z M-2.5 -1 L-2.5 -4 Q0 -7.5 2.5 -4 L2.5 -1"};
function ttSegs(sc){const {w,h}=ttWorld(sc);const s=(sc.walls||[]).filter(x=>!(x.door&&ttDoorOpen(sc,x))).map(x=>[num(x.x1),num(x.y1),num(x.x2),num(x.y2)]);s.push([0,0,w,0],[w,0,w,h],[w,h,0,h],[0,h,0,0]);return s}
function ttRayHit(ox,oy,dx,dy,segs){let best=Infinity;for(const [x1,y1,x2,y2] of segs){const sx=x2-x1,sy=y2-y1;const den=dx*sy-dy*sx;if(Math.abs(den)<1e-9)continue;
  const t=((x1-ox)*sy-(y1-oy)*sx)/den,u=((x1-ox)*dy-(y1-oy)*dx)/den;if(t>=0&&u>=-1e-6&&u<=1+1e-6&&t<best)best=t}return best}
function ttVisPoly(ox,oy,segs){const angs=[];for(const [x1,y1,x2,y2] of segs)for(const [px,py] of [[x1,y1],[x2,y2]]){const a=Math.atan2(py-oy,px-ox);angs.push(a-1e-4,a,a+1e-4)}
  angs.sort((a,b)=>a-b);const pts=[];for(const a of angs){const dx=Math.cos(a),dy=Math.sin(a);const t=ttRayHit(ox,oy,dx,dy,segs);if(t<Infinity)pts.push([ox+dx*t,oy+dy*t])}return pts}
function ttSegCross(ax,ay,bx,by,segs){for(const [x1,y1,x2,y2] of segs){const d=(bx-ax)*(y2-y1)-(by-ay)*(x2-x1);if(Math.abs(d)<1e-9)continue;const t=((x1-ax)*(y2-y1)-(y1-ay)*(x2-x1))/d,u=((x1-ax)*(by-ay)-(y1-ay)*(bx-ax))/d;if(t>1e-4&&t<1-1e-4&&u>=0&&u<=1)return true}return false}
function ttPtInPoly(x,y,pts){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins}
function ttViewers(sc,sid){const ts=ttTokens(sid).map(p=>({id:p.split("/")[1],...S.docs[p]})).filter(t=>t.vision!==false&&t.sheetId);
  if(ttGM())return TT.preview?ts:[];return ts.filter(ttMine)}
function ttVisionData(sc,sid){if(!sc.fog)return null;if(ttGM()&&!TT.preview)return null;const segs=ttSegs(sc);const g=num(sc.gridPx,70)||70;
  const vs=ttViewers(sc,sid).map(t=>{const pos=TT.drag&&TT.drag.id===t.id?TT.drag.vis:[num(t.x),num(t.y)];const r=sc.lighting==="dark"?(num(t.visionM)||10)/(num(sc.scale,1)||1)*g:0;return {x:pos[0],y:pos[1],r,poly:ttVisPoly(pos[0],pos[1],segs)}});
  return {vs,segs}}
function ttCanSee(V,x,y){if(!V)return true;return V.vs.some(v=>(!v.r||Math.hypot(x-v.x,y-v.y)<=v.r)&&ttPtInPoly(x,y,v.poly))}
function ttDrawFog(sc,sid,V){const cv=document.querySelector(".tt-fog");if(!cv)return;const {w,h}=ttWorld(sc);
  if(!V){cv.style.display="none";return}cv.style.display="block";const f=Math.min(1,2048/Math.max(w,h));const W=Math.round(w*f),H=Math.round(h*f);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}cv.style.width=w+"px";cv.style.height=h+"px";const x=cv.getContext("2d");
  const clipVis=(ctx,v,s)=>{ctx.save();ctx.beginPath();v.poly.forEach(([px,py],i)=>i?ctx.lineTo(px*s,py*s):ctx.moveTo(px*s,py*s));ctx.closePath();ctx.clip();
    if(v.r){const gr=ctx.createRadialGradient(v.x*s,v.y*s,v.r*s*.75,v.x*s,v.y*s,v.r*s);gr.addColorStop(0,"#fff");gr.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=gr;ctx.beginPath();ctx.arc(v.x*s,v.y*s,v.r*s,0,Math.PI*2);ctx.fill()}else{ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H)}ctx.restore()};
  // explored memory (players only)
  let ex=null;if(!ttGM()){const ek=sid+":"+(sc.expVer||1);ex=TT.exp[ek];if(!ex){ex=document.createElement("canvas");ex.width=Math.max(1,Math.round(W/4));ex.height=Math.max(1,Math.round(H/4));TT.exp[ek]=ex;
      try{const s=localStorage.getItem("tt.exp."+ek);if(s){const im=new Image();im.onload=()=>{ex.getContext("2d").drawImage(im,0,0,ex.width,ex.height);ttSync()};im.src=s}}catch(e){}}
    const ec=ex.getContext("2d");V.vs.forEach(v=>clipVis(ec,v,ex.width/w));clearTimeout(TT.expSave);TT.expSave=setTimeout(()=>{try{localStorage.setItem("tt.exp."+ek,ex.toDataURL("image/png"))}catch(e){}},2500)}
  x.globalCompositeOperation="source-over";x.clearRect(0,0,W,H);x.fillStyle=ttGM()?"rgba(0,0,0,.55)":"#05070d";x.fillRect(0,0,W,H);
  x.globalCompositeOperation="destination-out";
  if(ex){x.globalAlpha=.45;x.drawImage(ex,0,0,W,H);x.globalAlpha=1}
  V.vs.forEach(v=>clipVis(x,v,W/w));x.globalCompositeOperation="source-over";
}

/* ---------- view (pan/zoom) ---------- */
function ttApplyView(){const wd=document.querySelector(".tt-world");if(!wd||!TT.view)return;const v=TT.view;wd.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.z})`;
  const zl=document.getElementById("tt-zoom");if(zl)zl.textContent=Math.round(v.z*100)+"%"}
function ttFit(sc){const st=document.querySelector(".tt-stage");if(!st||!sc)return;const {w,h}=ttWorld(sc);const z=Math.min(st.clientWidth/w,st.clientHeight/h)*.94;TT.view={z,x:(st.clientWidth-w*z)/2,y:(st.clientHeight-h*z)/2};ttApplyView()}
function ttZoomAt(f,cx,cy){const v=TT.view;if(!v)return;const z=Math.max(.08,Math.min(6,v.z*f));const k=z/v.z;v.x=cx-(cx-v.x)*k;v.y=cy-(cy-v.y)*k;v.z=z;ttApplyView()}
function ttToWorld(e){const st=document.querySelector(".tt-stage").getBoundingClientRect();const v=TT.view;return [(e.clientX-st.left-v.x)/v.z,(e.clientY-st.top-v.y)/v.z]}
function ttCenterOn(x,y){const st=document.querySelector(".tt-stage");if(!st||!TT.view)return;TT.view.x=st.clientWidth/2-x*TT.view.z;TT.view.y=st.clientHeight/2-y*TT.view.z;ttApplyView()}

/* ---------- pings ---------- */
function ttPing(x,y,pull){const sid=ttSceneId();if(!sid)return;const p={scene:sid,x:Math.round(x),y:Math.round(y),by:S.me||"local",ts:Date.now(),color:ttGM()?"#ffd36b":"#6fd3ff",pull:!!(pull&&ttGM())};
  if(S.db&&!S.offline)S.db.collection("pings").add(p).catch(e=>console.warn(e));else ttShowPing(p)}
function ttShowPing(p){if(S.view!=="table"||p.scene!==ttSceneId())return;TT.pings.push({...p,t0:performance.now()});if(p.pull)ttCenterOn(p.x,p.y);ttPingLoop()}
function ttPingLoop(){if(TT.pingRaf)return;const step=()=>{const g=document.querySelector(".tt-pings");const now=performance.now();TT.pings=TT.pings.filter(p=>now-p.t0<2200);
    if(g){const z=TT.view?.z||1;g.innerHTML=TT.pings.map(p=>{const k=(now-p.t0)/2200;return [0,.33,.66].map(o=>{const kk=(k*1.5+o)%1;return `<circle cx="${p.x}" cy="${p.y}" r="${(10+kk*70)/z}" fill="none" stroke="${p.color}" stroke-width="${3/z}" opacity="${(1-kk)*(1-k*.6)}"/>`}).join("")+`<circle cx="${p.x}" cy="${p.y}" r="${6/z}" fill="${p.color}" opacity="${1-k}"/>`}).join("")}
    if(TT.pings.length)TT.pingRaf=requestAnimationFrame(step);else TT.pingRaf=null};TT.pingRaf=requestAnimationFrame(step)}

/* ---------- DOM: stage (persistent) ---------- */
function ttRoot(){let r=document.getElementById("tt");if(!r){r=document.createElement("div");r.id="tt";r.className="tt";
  r.innerHTML=`<div class="tt-stage"><div class="tt-world"><div class="tt-bgwrap"><img class="tt-bg" alt="" draggable="false"></div><svg class="tt-grid"></svg><div class="tt-tokens"></div><canvas class="tt-fog"></canvas><svg class="tt-walls"></svg><svg class="tt-over"><g class="tt-pings"></g><g class="tt-rul"></g></svg></div><div class="tt-empty"></div></div><div class="tt-ui"></div>`;
  document.body.insertBefore(r,document.getElementById("app"));ttBindStage(r.querySelector(".tt-stage"))}return r}
function ttSync(){
  if(S.view!=="table")return;const r=ttRoot();r.style.display="";document.body.classList.add("tablemode");
  const sid=ttSceneId();const sc=sid?S.docs["scenes/"+sid]:null;const empty=r.querySelector(".tt-empty");const world=r.querySelector(".tt-world");
  if(!sc){world.style.display="none";empty.style.display="flex";empty.innerHTML=ttGM()?`<div><h2>No maps yet</h2><p>Make one from the <b>Maps</b> panel: upload an image, start from the library, or use a blank grid.</p><button class="ttbtn pri" data-act="tt-new">+ New blank map</button></div>`:`<div><h2>No map is up right now</h2><p>Your GM hasn't opened one yet. When they do, it shows up here.</p><button class="ttbtn" data-act="tt-exit">Back to sheets</button></div>`;ttUi(null,null);return}
  world.style.display="";empty.style.display="none";
  if(TT.shownScene!==sid){TT.shownScene=sid;TT.fitPending=true;TT.sel=null;TT.wallDraft=null}
  ttLoadBg(sid,sc);const {w,h,g}=ttWorld(sc);world.style.width=w+"px";world.style.height=h+"px";
  const bg=r.querySelector(".tt-bg");const url=TT.bg[sid]?.url;const bw=r.querySelector(".tt-bgwrap");bw.style.width=w+"px";bw.style.height=h+"px";
  if(url){if(bg.getAttribute("src")!==url)bg.setAttribute("src",url);bg.style.display=""}else{bg.removeAttribute("src");bg.style.display="none"}
  bw.classList.toggle("blank",!url);
  // grid
  const gs=r.querySelector(".tt-grid");gs.setAttribute("width",w);gs.setAttribute("height",h);const ox=((num(sc.offX)%g)+g)%g,oy=((num(sc.offY)%g)+g)%g;
  gs.innerHTML=sc.gridOff?"":`<defs><pattern id="ttgp" width="${g}" height="${g}" patternUnits="userSpaceOnUse" x="${ox}" y="${oy}"><path d="M${g} 0 L0 0 0 ${g}" fill="none" stroke="${url?"rgba(0,0,0,.35)":"rgba(160,180,230,.18)"}" stroke-width="1"/></pattern></defs><rect width="${w}" height="${h}" fill="url(#ttgp)"/>`;
  gs.style.opacity=sc.gridAlpha!=null?num(sc.gridAlpha):1;
  // vision
  const V=ttVisionData(sc,sid);
  // tokens
  const layer=r.querySelector(".tt-tokens");const want=new Set();
  ttTokens(sid).forEach(p=>{const id=p.split("/")[1];const t=S.docs[p];want.add(id);let el=layer.querySelector(`[data-tok="${id}"]`);
    if(!el){el=document.createElement("div");el.className="tt-tok";el.dataset.tok=id;layer.appendChild(el)}
    const size=Math.max(.25,num(t.size,1));const px=size*g;const dragging=TT.drag&&TT.drag.id===id;
    const pos=dragging?TT.drag.pos:[num(t.x),num(t.y)];
    el.style.width=el.style.height=px+"px";el.style.left=(pos[0]-px/2)+"px";el.style.top=(pos[1]-px/2)+"px";
    const img=ttTokImg(t);const nm=ttTokName(t);const sig=[img?img.length+img.slice(-40):"",nm,t.color,size,t.hidden,t.showName,TT.sel===id,ttMine(t)].join("|");
    if(el.dataset.sig!==sig){el.dataset.sig=sig;el.innerHTML=`<div class="tt-tokimg" style="--ring:${esc(t.color||"#c62828")}">${img?`<img src="${esc(img)}" alt="" draggable="false">`:`<span>${esc(initials(nm))}</span>`}</div>${t.hidden?`<span class="tt-hid" title="Hidden from players">◌</span>`:""}<div class="tt-name">${esc(nm)}</div>`}
    el.classList.toggle("sel",TT.sel===id);el.classList.toggle("hidden",!!t.hidden);el.classList.toggle("mine",ttMine(t));el.classList.toggle("movable",ttCanMove(t));el.classList.toggle("dragging",!!dragging);
    el.classList.toggle("showname",t.showName!==false);
    const seen=ttGM()||ttMine(t)||ttCanSee(V,pos[0],pos[1]);el.style.visibility=seen?"":"hidden"});
  layer.querySelectorAll(".tt-tok").forEach(el=>{if(!want.has(el.dataset.tok))el.remove()});
  // walls (GM only)
  const ws=r.querySelector(".tt-walls");ws.setAttribute("width",w);ws.setAttribute("height",h);
  const z=TT.view?.z||1;const sw=2.5/z;
  const doorG=(x,i)=>{const mx=(num(x.x1)+num(x.x2))/2,my=(num(x.y1)+num(x.y2))/2;const op=ttDoorOpen(sc,x);
    return `<g class="tt-door ${op?"open":""} ${x.locked?"locked":""}" data-door="${i}" transform="translate(${mx} ${my}) scale(${1/z})"><title>${x.locked?(op?"Locked door (open)":"Locked door"):(op?"Door (open)":"Door")}</title><circle r="10"/><path d="${x.locked&&!op?DOOR_ICON.locked:op?DOOR_ICON.open:DOOR_ICON.closed}"/></g>`};
  if(!ttGM()){const g=num(sc.gridPx,70);
    ws.innerHTML=(sc.walls||[]).map((x,i)=>{if(!x.door)return "";const mx=(num(x.x1)+num(x.x2))/2,my=(num(x.y1)+num(x.y2))/2;
      const L=Math.hypot(num(x.x2)-num(x.x1),num(x.y2)-num(x.y1))||1;const nx=-(num(x.y2)-num(x.y1))/L*g*.25,ny=(num(x.x2)-num(x.x1))/L*g*.25;
      return (!V||ttCanSee(V,mx+nx,my+ny)||ttCanSee(V,mx-nx,my-ny))?doorG(x,i):""}).join("");ws.classList.remove("editing")}
  else if(TT.showWalls!==false){
    ws.innerHTML=(sc.walls||[]).map((x,i)=>{const op=ttDoorOpen(sc,x);
      return `<line x1="${x.x1}" y1="${x.y1}" x2="${x.x2}" y2="${x.y2}" class="tt-wall ${x.door?"door":""} ${op?"open":""} ${x.locked?"locked":""}" stroke-width="${x.door?sw*1.6:sw}" data-wall="${i}"/>`+(x.door?doorG(x,i):"")}).join("")
      +(TT.wallDraft?`<polyline points="${TT.wallDraft.pts.concat(TT.wallDraft.hover?[TT.wallDraft.hover]:[]).map(p=>p.join(",")).join(" ")}" class="tt-wall draft ${TT.wallDraft.door?"door":""}" stroke-width="${sw}" fill="none"/>`:"");
    ws.classList.toggle("editing",["wall","door","erase"].includes(TT.tool))}else ws.innerHTML="";
  ttDrawFog(sc,sid,V);
  ttDrawRuler();
  if(TT.fitPending){const st=r.querySelector(".tt-stage");if(st.clientWidth){TT.fitPending=false;const mine=!ttGM()&&ttTokens(sid).map(p=>S.docs[p]).find(ttMine);ttFit(sc);if(mine){TT.view.z=Math.max(TT.view.z,.9);ttCenterOn(num(mine.x),num(mine.y))}}}
  ttApplyView();ttUi(sc,sid);
}

/* ---------- UI chrome ---------- */
function ttUi(sc,sid){
  const ui=document.querySelector(".tt-ui");if(!ui)return;const a=document.activeElement;const fid=a&&ui.contains(a)?a.id:null;let ss=null,se=null;try{if(fid&&a.selectionStart!=null){ss=a.selectionStart;se=a.selectionEnd}}catch(e){}
  const gm=ttGM();const cfg=ttCfg();const live=sid&&cfg.active===sid;
  const tools=[["select","Move","V","Select and move tokens. Drag empty space to pan."],["ruler","Ruler","R","Drag to measure in meters."],["ping","Ping","P","Click to ping a spot for everyone"+(gm?". Shift-click to pull everyone's view there.":".")]];
  if(gm)tools.push(["wall","Walls","W","Click to place wall points. Double-click or Esc to finish."],["door","Doors","D","Draw a door. In Move mode click a door's icon to open or close it; Shift-click to lock or unlock it."],["erase","Erase","E","Click a wall or door to delete it."]);
  const scs=gm?ttScenes():[];
  const top=`<div class="tt-top">
    <button class="ttbtn ghost" data-act="tt-exit" title="Back to the sheets">◂ Sheets</button>
    <div class="tt-title"><span class="tt-mark">TABLETOP</span>${sc?`<b>${esc(sc.name||"Map")}</b>${gm?(live?`<span class="tt-live">● Live for players</span>`:`<span class="tt-prep">Prep · players can't see this</span>`):""}`:""}</div>
    ${sc?`<div class="tt-tools">${tools.map(([k,l,key,tip])=>`<button class="tt-tool ${TT.tool===k?"on":""}" data-act="tt-tool" data-tool="${k}" title="${esc(tip)} (${key})">${l}<kbd>${key}</kbd></button>`).join("")}
      ${gm&&["wall","door"].includes(TT.tool)?`<label class="tt-chk" title="Snap wall points to grid corners (hold Alt to place freely)"><input type="checkbox" data-act="tt-snap" ${TT.snap?"checked":""}> Snap</label>`:""}
      ${gm&&TT.tool==="door"?`<label class="tt-chk" title="New doors start locked: only you can open them"><input type="checkbox" data-act="tt-locknew" ${TT.lockNew?"checked":""}> Locked</label>`:""}
      ${gm&&sc.fog?`<label class="tt-chk" title="See what the party's tokens can see"><input type="checkbox" data-act="tt-preview" ${TT.preview?"checked":""}> Player vision</label>`:""}</div>`:""}
    <div class="tt-right">${sc?`<button class="ttbtn ghost sm" data-act="tt-fit" title="Fit the map to the screen">Fit</button><span id="tt-zoom" class="tt-zoomlbl"></span>`:""}
      <button class="ttbtn ${S.tsheet?"on":""}" data-act="tt-sheet" title="Character sheet (C)">Character <kbd>C</kbd></button></div></div>`;
  let left="";
  if(gm){const P=TT.ui.panel;
    left=`<div class="tt-panel ${TT.ui.hide?"min":""}"><div class="tt-ptabs">${[["scenes","Maps"],["scene","Map setup"],["tokens","Tokens"]].map(([k,l])=>`<button class="${P===k?"on":""}" data-act="tt-panel" data-p="${k}">${l}</button>`).join("")}<button class="tt-pmin" data-act="tt-pmin" title="${TT.ui.hide?"Show panel":"Hide panel"}">${TT.ui.hide?"▸":"◂"}</button></div>
      ${TT.ui.hide?"":`<div class="tt-pbody">${P==="scenes"?ttPanelScenes(scs,cfg):P==="scene"?ttPanelScene(sc,sid):ttPanelTokens(sc,sid)}</div>`}</div>`}
  const insp=TT.sel&&S.docs["tokens/"+TT.sel]?ttInspector(TT.sel):"";
  ui.innerHTML=top+left+insp+(TT.tool==="wall"||TT.tool==="door"?`<div class="tt-hintbar">${TT.tool==="door"?`${TT.lockNew?"Locked doors":"Doors"}: click both ends of the doorway · in Move mode click a door to open or close it, Shift-click to lock or unlock`:"Walls: click to add points · double-click, right-click or Esc to finish · Alt places freely"}</div>`:"")+(sc?`<div class="tt-scale">1 square = ${num(sc.scale,1)} m</div>`:"");
  if(fid){const el=document.getElementById(fid);if(el){el.focus({preventScroll:true});try{if(ss!=null)el.setSelectionRange(ss,se)}catch(e){}}}
  Object.entries(S.uiSel||{}).forEach(([id,v])=>{const el=document.getElementById(id);if(el&&el.tagName==="SELECT"&&[...el.options].some(o=>o.value===String(v)))el.value=v});
  ttApplyView();
}
function ttPanelScenes(scs,cfg){
  if(TT.lib===null)ttLibLoad();
  const lib=Array.isArray(TT.lib)?TT.lib:[];
  return `<div class="tt-sec"><div class="tt-sech">Your maps</div>
    ${scs.length?scs.map(p=>{const id=p.split("/")[1];const s=S.docs[p];const on=id===ttSceneId();const live=cfg.active===id;
      return `<div class="tt-scrow ${on?"on":""}"><button class="tt-scname" data-act="tt-open" data-id="${id}">${esc(s.name||"Map")}${live?` <span class="tt-live sm">● Live</span>`:""}</button>
        ${live?`<button class="ttbtn sm" data-act="tt-live" data-id="" title="Players stop seeing a map">Close</button>`:`<button class="ttbtn sm pri" data-act="tt-live" data-id="${id}" title="Players see this map">Go live</button>`}</div>`}).join(""):`<p class="tt-muted">No maps yet.</p>`}
    <div class="tt-row"><button class="ttbtn" data-act="tt-new">+ Blank map</button><button class="ttbtn" data-act="tt-upnew">+ Upload image</button><input type="file" id="tt-upnew-f" accept="image/*" hidden></div>
    ${cfg.active?`<button class="ttbtn wide" data-act="tt-pull" title="Opens the map on every player's screen">Bring everyone to the live map</button>`:""}</div>
    <div class="tt-sec"><div class="tt-sech">Map library <span class="tt-muted">· made by Claude</span></div>
    ${TT.lib==="loading"?`<p class="tt-muted">Loading…</p>`:lib.length?lib.map((m,i)=>`<div class="tt-lib"><img src="${esc((m.thumb||m.file)+(m.thumbVer||m.ver?"?v="+(m.thumbVer||m.ver):""))}" alt="" loading="lazy"><div><b>${esc(m.name)}</b><span class="tt-muted">${esc(m.desc||"")}</span><button class="ttbtn sm" data-act="tt-fromlib" data-i="${i}">Use this map</button></div></div>`).join(""):`<p class="tt-muted">Nothing here yet. Ask Claude in chat for a map and it'll show up here.</p>`}</div>`;
}
function ttPanelScene(sc,sid){
  if(!sc)return `<p class="tt-muted">Open or make a map first.</p>`;const P="scenes/"+sid;
  const ni=(f,o={})=>`<input class="ttin num" type="number" id="tts-${f}" data-doc="${P}" data-path="${f}" value="${esc(String(sc[f]??o.d??""))}" step="${o.step||1}" ${o.min!=null?`min="${o.min}"`:""}>`;
  return `<div class="tt-sec"><label class="tt-lbl">Name<input class="ttin" id="tts-name" data-doc="${P}" data-path="name" value="${esc(sc.name||"")}"></label>
    <div class="tt-row"><button class="ttbtn" data-act="tt-upbg">${sc.bgChunks||sc.bgUrl?"Replace image":"Upload image"}</button><input type="file" id="tt-upbg-f" accept="image/*" hidden>${sc.bgChunks||sc.bgUrl?`<button class="ttbtn" data-act="tt-clearbg">Remove image</button>`:""}</div>
    ${sc.bgChunks||sc.bgUrl?"":`<div class="tt-grid2"><label class="tt-lbl">Width (squares)${ni("cols",{min:1})}</label><label class="tt-lbl">Height (squares)${ni("rows",{min:1})}</label></div>`}</div>
  <div class="tt-sec"><div class="tt-sech">Grid</div>
    <div class="tt-grid2"><label class="tt-lbl">Square size (px)${ni("gridPx",{min:8,d:70})}</label><label class="tt-lbl">Meters per square${ni("scale",{min:.1,step:.5,d:1})}</label>
    <label class="tt-lbl">Shift X (px)${ni("offX",{d:0})}</label><label class="tt-lbl">Shift Y (px)${ni("offY",{d:0})}</label></div>
    <p class="tt-muted">Match the square size to the squares drawn on your map image, then nudge with Shift X/Y until the lines line up.</p>
    <label class="tt-chk"><input type="checkbox" data-doc="${P}" data-path="gridOff" ${sc.gridOff?"checked":""}> Hide grid lines</label></div>
  <div class="tt-sec"><div class="tt-sech">Vision</div>
    <label class="tt-chk"><input type="checkbox" data-doc="${P}" data-path="fog" ${sc.fog?"checked":""}> Line-of-sight fog for players</label>
    <label class="tt-lbl">Lighting<select class="ttin" id="tts-light" data-doc="${P}" data-path="lighting"><option value="lit" ${sc.lighting!=="dark"?"selected":""}>Lit: tokens see as far as walls allow</option><option value="dark" ${sc.lighting==="dark"?"selected":""}>Dark: tokens see their vision range</option></select></label>
    <div class="tt-row"><span class="tt-muted">${(sc.walls||[]).length} wall pieces</span>${(sc.walls||[]).length?(S.confirm==="tt-clearwalls"?`<button class="ttbtn sm" data-act="tt-clearwalls" style="color:#ff8a80">Sure? Delete all</button>`:`<button class="ttbtn sm" data-act="tt-clearwalls">Delete all walls</button>`):""}<button class="ttbtn sm" data-act="tt-expreset" title="Players forget what they've already explored">Reset explored</button></div></div>
  <div class="tt-sec"><label class="tt-lbl">GM notes<textarea class="ttin" id="tts-notes" rows="3" data-doc="${P}" data-path="notes" placeholder="Only you see this">${esc(sc.notes||"")}</textarea></label>
    <div class="tt-row"><button class="ttbtn" data-act="tt-dup">Duplicate map</button>${S.confirm==="tt-delscene"?`<button class="ttbtn" data-act="tt-delscene" style="color:#ff8a80">Sure? Delete map and its tokens</button>`:`<button class="ttbtn" data-act="tt-delscene">Delete map</button>`}</div></div>`;
}
function ttPanelTokens(sc,sid){
  if(!sc)return `<p class="tt-muted">Open or make a map first.</p>`;
  const on=new Set(ttTokens(sid).map(p=>S.docs[p].sheetId).filter(Boolean));
  const pcs=sheetPaths().filter(p=>!S.docs[p].npc);const npcs=npcPaths();
  const list=ttTokens(sid).map(p=>({id:p.split("/")[1],t:S.docs[p]}));
  return `<div class="tt-sec"><div class="tt-sech">Add</div>
    <button class="ttbtn wide" data-act="tt-addparty">+ Whole party</button>
    <label class="tt-lbl">Character<select class="ttin" id="tt-addpc"><option value="">Choose…</option>${sheetPaths().map(p=>`<option value="${p.split("/")[1]}">${esc(S.docs[p].name||"Unnamed")}${on.has(p.split("/")[1])?" (on map)":""}</option>`).join("")}</select></label>
    ${npcs.length?`<label class="tt-lbl">From an NPC sheet<select class="ttin" id="tt-addnpc"><option value="">Choose…</option>${npcs.map(p=>`<option value="${p.split("/")[1]}">${esc(S.docs[p].name||"NPC")}</option>`).join("")}</select></label>`:""}
    <div class="tt-grid2"><label class="tt-lbl">Quick token name<input class="ttin" id="tt-qname" placeholder="Guard"></label><label class="tt-lbl">How many<input class="ttin num" id="tt-qn" type="number" min="1" max="20" value="1"></label></div>
    <label class="tt-chk"><input type="checkbox" id="tt-qhid"> Start hidden</label>
    <button class="ttbtn pri wide" data-act="tt-addq">Add token</button></div>
  <div class="tt-sec"><div class="tt-sech">On this map (${list.length})</div>${list.map(({id,t})=>`<button class="tt-toklist ${TT.sel===id?"on":""}" data-act="tt-selt" data-id="${id}"><span class="tt-dot" style="background:${esc(t.color||"#c62828")}"></span>${esc(ttTokName(t))}${t.hidden?` <span class="tt-muted">hidden</span>`:""}</button>`).join("")||`<p class="tt-muted">No tokens yet.</p>`}</div>`;
}
function ttInspector(id){
  const p="tokens/"+id;const t=S.docs[p];const gm=ttGM();const nm=ttTokName(t);const sc=ttScene();
  const sheetBtn=t.sheetId&&S.docs["sheets/"+t.sheetId]?`<button class="ttbtn sm" data-act="tt-opensheet" data-id="${t.sheetId}">Open sheet</button>`:"";
  const npcBtn=gm&&t.npcId&&S.docs["npcs/"+t.npcId]?`<button class="ttbtn sm" data-act="tt-opennpc" data-id="${t.npcId}">Open NPC</button>`:"";
  if(!gm)return `<div class="tt-insp"><div class="tt-insph"><b>${esc(nm)}</b><button class="tt-x" data-act="tt-desel">✕</button></div><div class="tt-row">${sheetBtn}</div></div>`;
  return `<div class="tt-insp"><div class="tt-insph"><b>${esc(nm)}</b><button class="tt-x" data-act="tt-desel" title="Close">✕</button></div>
    ${t.sheetId?"":`<label class="tt-lbl">Name<input class="ttin" id="tti-name" data-doc="${p}" data-path="name" value="${esc(t.name||"")}"></label>`}
    <div class="tt-grid2"><label class="tt-lbl">Size (squares)<input class="ttin num" id="tti-size" type="number" min=".25" max="12" step=".25" data-doc="${p}" data-path="size" value="${num(t.size,1)}"></label>
      <label class="tt-lbl">Ring color<input type="color" class="ttclr" data-doc="${p}" data-path="color" value="${/^#[0-9a-f]{6}$/i.test(t.color||"")?t.color:"#c62828"}"></label></div>
    <label class="tt-chk"><input type="checkbox" data-doc="${p}" data-path="hidden" ${t.hidden?"checked":""}> Hidden from players <kbd>H</kbd></label>
    <label class="tt-chk"><input type="checkbox" data-doc="${p}" data-path="showName" ${t.showName!==false?"checked":""}> Show name on the map</label>
    ${t.sheetId?`<label class="tt-chk"><input type="checkbox" data-doc="${p}" data-path="vision" ${t.vision!==false?"checked":""}> Gives vision to its player</label>${sc?.lighting==="dark"?`<label class="tt-lbl">Vision range in the dark (m)<input class="ttin num" id="tti-vis" type="number" min="0" step="1" data-doc="${p}" data-path="visionM" value="${num(t.visionM)||10}"></label>`:""}`:""}
    <label class="tt-lbl">Linked sheet<select class="ttin" id="tti-link" data-act-change="tt-link" data-id="${id}"><option value="">None</option>
      <optgroup label="Characters">${sheetPaths().map(q=>`<option value="s:${q.split("/")[1]}" ${t.sheetId===q.split("/")[1]?"selected":""}>${esc(S.docs[q].name||"Unnamed")}</option>`).join("")}</optgroup>
      ${npcPaths().length?`<optgroup label="NPCs">${npcPaths().map(q=>`<option value="n:${q.split("/")[1]}" ${t.npcId===q.split("/")[1]?"selected":""}>${esc(S.docs[q].name||"NPC")}</option>`).join("")}</optgroup>`:""}</select></label>
    <div class="tt-row">${sheetBtn}${npcBtn}<button class="ttbtn sm" data-act="tt-tokimg" data-id="${id}">${t.img?"Change picture":"Set picture"}</button>${t.img?`<button class="ttbtn sm" data-act="tt-tokimg-x" data-id="${id}">Remove picture</button>`:""}<input type="file" id="tt-tokimg-f" accept="image/*" hidden></div>
    <div class="tt-row"><button class="ttbtn sm" data-act="tt-dupt" data-id="${id}">Duplicate</button><button class="ttbtn sm" data-act="tt-delt" data-id="${id}" style="color:#ff8a80">Delete <kbd>Del</kbd></button></div></div>`;
}

/* ---------- ruler ---------- */
function ttDrawRuler(){const g=document.querySelector(".tt-rul");if(!g)return;const sc=ttScene();const z=TT.view?.z||1;const R=TT.ruler||(TT.drag&&TT.drag.moved?{a:TT.drag.start,b:TT.drag.pos,mv:true}:null);
  if(!R||!sc){g.innerHTML="";return}const [ax,ay]=R.a,[bx,by]=R.b;const m=ttRound(ttM(sc,Math.hypot(bx-ax,by-ay)));const sq=m/(num(sc.scale,1)||1);
  let lx=bx+14/z,ly=by-14/z;const label=`${m} m${R.mv?"":" · "+(Math.round(sq*10)/10)+" sq"}`;
  let ex=bx,ey=by;
  if(R.mv&&TT.drag){const t=S.docs["tokens/"+TT.drag.id];const tr=Math.max(.25,num(t?.size,1))*num(sc.gridPx,70)/2;lx=bx+tr+10/z;ly=by-tr-6/z;
    const L=Math.hypot(bx-ax,by-ay);if(L>tr){ex=bx-(bx-ax)/L*tr;ey=by-(by-ay)/L*tr}else{ex=ax;ey=ay}}
  g.innerHTML=`<line x1="${ax}" y1="${ay}" x2="${ex}" y2="${ey}" stroke="#000" stroke-opacity=".5" stroke-width="${6/z}" stroke-linecap="round"/><line x1="${ax}" y1="${ay}" x2="${ex}" y2="${ey}" stroke="#ffd36b" stroke-width="${3/z}" stroke-dasharray="${10/z} ${6/z}" stroke-linecap="round"/><circle cx="${ax}" cy="${ay}" r="${5/z}" fill="#ffd36b"/>
    <g transform="translate(${lx} ${ly}) scale(${1/z})"><rect x="-6" y="-21" width="${label.length*9.6+16}" height="30" rx="6" fill="rgba(10,12,22,.9)" stroke="#ffd36b"/><text x="4" y="0" fill="#fff4d2" font-family="ui-monospace,monospace" font-size="15" font-weight="600">${label}</text></g>`}

/* ---------- input ---------- */
function ttBindStage(st){
  st.addEventListener("wheel",e=>{e.preventDefault();const r=st.getBoundingClientRect();ttZoomAt(Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)),e.clientX-r.left,e.clientY-r.top);ttDrawRuler()},{passive:false});
  st.addEventListener("dragstart",e=>e.preventDefault());
  st.addEventListener("mousedown",e=>{if(!e.target.closest("input,select,textarea,button"))e.preventDefault()});
  st.addEventListener("contextmenu",e=>{if(TT.wallDraft){e.preventDefault();ttFinishWall()}else if(S.view==="table")e.preventDefault()});
  st.addEventListener("pointerdown",e=>{if(S.view!=="table"||!TT.view)return;const sc=ttScene();if(!sc)return;
    const panBtn=e.button===1||e.button===2||TT.space;
    const door=e.target.closest(".tt-door");const tokEl=e.target.closest(".tt-tok");const wp=ttToWorld(e);
    if(panBtn){TT.pan={x:e.clientX,y:e.clientY,vx:TT.view.x,vy:TT.view.y};st.setPointerCapture(e.pointerId);return}
    if(e.button!==0)return;
    if(TT.tool==="ping"){ttPing(wp[0],wp[1],e.shiftKey);return}
    if(TT.tool==="ruler"){TT.ruler={a:wp,b:wp};st.setPointerCapture(e.pointerId);ttDrawRuler();return}
    if(TT.tool==="wall"||TT.tool==="door"){const g=num(sc.gridPx,70);const ox=num(sc.offX),oy=num(sc.offY);const pt=TT.snap&&!e.altKey?[Math.round((wp[0]-ox)/g)*g+ox,Math.round((wp[1]-oy)/g)*g+oy]:[Math.round(wp[0]),Math.round(wp[1])];
      if(!TT.wallDraft)TT.wallDraft={pts:[pt],door:TT.tool==="door",locked:TT.tool==="door"&&!!TT.lockNew};else{const last=TT.wallDraft.pts[TT.wallDraft.pts.length-1];if(last[0]!==pt[0]||last[1]!==pt[1])TT.wallDraft.pts.push(pt);if(TT.wallDraft.door&&TT.wallDraft.pts.length>=2)ttFinishWall()}
      ttSync();return}
    if(TT.tool==="erase"){const wl=e.target.closest("[data-wall]")||e.target.closest("[data-door]");if(wl){const i=num(wl.dataset.wall??wl.dataset.door);const arr=clone(sc.walls||[]);arr.splice(i,1);setField("scenes/"+ttSceneId(),"walls",arr);render()}return}
    if(door){ttDoorClick(sc,num(door.dataset.door),e);return}
    if(tokEl){const id=tokEl.dataset.tok;const t=S.docs["tokens/"+id];TT.sel=id;
      if(ttCanMove(t)){TT.drag={id,start:[num(t.x),num(t.y)],pos:[num(t.x),num(t.y)],vis:[num(t.x),num(t.y)],off:[wp[0]-num(t.x),wp[1]-num(t.y)],moved:false};st.setPointerCapture(e.pointerId)}
      ttSync();return}
    TT.sel=null;TT.pan={x:e.clientX,y:e.clientY,vx:TT.view.x,vy:TT.view.y,click:true};st.setPointerCapture(e.pointerId);ttUi(sc,ttSceneId());
    const tok=document.querySelectorAll(".tt-tok.sel");tok.forEach(x=>x.classList.remove("sel"));
    TT.hold=setTimeout(()=>{if(TT.pan&&TT.pan.click){ttPing(wp[0],wp[1],e.shiftKey);TT.pan=null}},650)});
  st.addEventListener("pointermove",e=>{if(S.view!=="table"||!TT.view)return;const sc=ttScene();if(!sc)return;
    if(TT.pan){const dx=e.clientX-TT.pan.x,dy=e.clientY-TT.pan.y;if(Math.hypot(dx,dy)>4){TT.pan.click=false;clearTimeout(TT.hold)}TT.view.x=TT.pan.vx+dx;TT.view.y=TT.pan.vy+dy;ttApplyView();return}
    const wp=ttToWorld(e);
    if(TT.ruler&&TT.ruler.a){TT.ruler.b=wp;ttDrawRuler();return}
    if(TT.drag){const d=TT.drag;const np=[wp[0]-d.off[0],wp[1]-d.off[1]];if(!d.moved&&Math.hypot(np[0]-d.start[0],np[1]-d.start[1])<3)return;d.moved=true;d.pos=np;
      if(!ttGM()&&sc.fog){if(!ttSegCross(d.start[0],d.start[1],np[0],np[1],ttSegs(sc)))d.vis=np}else d.vis=np;
      if(!TT.dragRaf)TT.dragRaf=requestAnimationFrame(()=>{TT.dragRaf=null;ttSync()});return}
    if(TT.wallDraft){const g=num(sc.gridPx,70);const ox=num(sc.offX),oy=num(sc.offY);TT.wallDraft.hover=TT.snap&&!e.altKey?[Math.round((wp[0]-ox)/g)*g+ox,Math.round((wp[1]-oy)/g)*g+oy]:wp.map(Math.round);
      if(!TT.wdRaf)TT.wdRaf=requestAnimationFrame(()=>{TT.wdRaf=null;ttSync()})}});
  const up=e=>{clearTimeout(TT.hold);if(TT.pan){TT.pan=null;return}
    if(TT.ruler){TT.ruler=null;ttDrawRuler();return}
    if(TT.drag){const d=TT.drag;TT.drag=null;const sc=ttScene();const t=S.docs["tokens/"+d.id];
      if(d.moved&&sc&&t){let [x,y]=e.altKey?d.pos:ttSnapPos(sc,d.pos[0],d.pos[1],num(t.size,1));
        if(!ttGM()&&sc.fog&&ttSegCross(d.start[0],d.start[1],x,y,ttSegs(sc))){toastMsg("A wall is in the way. Move around it.",true);x=d.start[0];y=d.start[1]}
        x=Math.round(x);y=Math.round(y);if(x!==num(t.x)||y!==num(t.y)){setField("tokens/"+d.id,"x",x);setField("tokens/"+d.id,"y",y)}}
      ttSync()}};
  st.addEventListener("pointerup",up);st.addEventListener("pointercancel",up);
  st.addEventListener("dblclick",e=>{if(TT.wallDraft){e.preventDefault();ttFinishWall()}});
}
function ttDoorClick(sc,i,e){const sid=ttSceneId();const P="scenes/"+sid;const w=(sc.walls||[])[i];if(!w||!w.door)return;
  if(ttGM()){
    if(e.altKey||e.shiftKey){const arr=clone(sc.walls);arr[i].locked=!arr[i].locked;arr[i].open=arr[i].locked?false:ttDoorOpen(sc,w);setField(P,"walls",arr);
      if(!arr[i].locked)setField(P,"doors."+ttDoorKey(w),!!arr[i].open);toastMsg(arr[i].locked?"Door locked. Players can't open it.":"Door unlocked. Players can open it.");render();return}
    if(w.locked){const arr=clone(sc.walls);arr[i].open=!arr[i].open;setField(P,"walls",arr)}else setField(P,"doors."+ttDoorKey(w),!ttDoorOpen(sc,w));render();return}
  if(w.locked){toastMsg("It's locked.",true);return}
  const g=num(sc.gridPx,70);const mx=(num(w.x1)+num(w.x2))/2,my=(num(w.y1)+num(w.y2))/2;
  const near=ttTokens(sid).map(p=>S.docs[p]).filter(ttMine).some(t=>Math.hypot(num(t.x)-mx,num(t.y)-my)<=g*2.2);
  if(!near){toastMsg("Move your token next to the door first.",true);return}
  setField(P,"doors."+ttDoorKey(w),!ttDoorOpen(sc,w));render()}
function ttFinishWall(){const d=TT.wallDraft;TT.wallDraft=null;if(!d||d.pts.length<2){ttSync();return}const sc=ttScene();const arr=clone(sc.walls||[]);
  for(let i=1;i<d.pts.length;i++){const [a,b]=[d.pts[i-1],d.pts[i]];if(a[0]===b[0]&&a[1]===b[1])continue;arr.push({x1:a[0],y1:a[1],x2:b[0],y2:b[1],...(d.door?{door:true,open:false,...(d.locked?{locked:true}:{})}:{})})}
  setField("scenes/"+ttSceneId(),"walls",arr);render()}
document.addEventListener("keydown",e=>{if(S.view!=="table")return;const tag=(e.target.tagName||"").toLowerCase();if(tag==="input"||tag==="textarea"||tag==="select"||e.target.isContentEditable)return;
  if(e.key===" "){TT.space=true;e.preventDefault();return}
  const k=e.key.toLowerCase();
  if(k==="escape"){if(TT.wallDraft)ttFinishWall();else if(S.tsheet){S.tsheet=false;render()}else{TT.sel=null;ttSync()}return}
  if(k==="c"){S.tsheet=!S.tsheet;render();return}
  const tk={v:"select",r:"ruler",p:"ping",w:"wall",d:"door",e:"erase"}[k];if(tk&&(ttGM()||["select","ruler","ping"].includes(tk))){if(TT.wallDraft)ttFinishWall();TT.tool=tk;ttSync();return}
  if(ttGM()&&TT.sel&&S.docs["tokens/"+TT.sel]){if(k==="delete"||k==="backspace"){deleteDoc("tokens/"+TT.sel);TT.sel=null;render();return}if(k==="h"){setField("tokens/"+TT.sel,"hidden",!S.docs["tokens/"+TT.sel].hidden);render();return}}});
document.addEventListener("keyup",e=>{if(e.key===" ")TT.space=false});
window.addEventListener("resize",()=>{if(S.view==="table")ttApplyView()});

/* ---------- actions ---------- */
function ttAct(act,t){
  const gm=ttGM();const sid=ttSceneId();const sc=sid?S.docs["scenes/"+sid]:null;const id=t.dataset.id;
  switch(act){
    case "tt-enter":ttEnter();return true;
    case "tt-exit":ttExit();return true;
    case "tt-sheet":S.tsheet=!S.tsheet;render();return true;
    case "tt-tool":if(TT.wallDraft)ttFinishWall();TT.tool=t.dataset.tool;ttSync();return true;
    case "tt-snap":TT.snap=t.checked;return true;
    case "tt-locknew":TT.lockNew=t.checked;return true;
    case "tt-preview":TT.preview=t.checked;ttSync();return true;
    case "tt-fit":ttFit(sc);return true;
    case "tt-desel":TT.sel=null;ttSync();return true;
    case "tt-selt":TT.sel=id;const tk=S.docs["tokens/"+id];if(tk)ttCenterOn(num(tk.x),num(tk.y));ttSync();return true;
    case "tt-opensheet":S.current="sheets/"+id;S.tsheet=true;render();return true;
  }
  if(!gm)return true;
  switch(act){
    case "tt-panel":TT.ui.panel=t.dataset.p;TT.ui.hide=false;ttSync();return true;
    case "tt-pmin":TT.ui.hide=!TT.ui.hide;ttSync();return true;
    case "tt-new":ttNewScene();return true;
    case "tt-upnew":$("#tt-upnew-f")?.click();return true;
    case "tt-open":TT.sceneId=id;TT.fitPending=true;render();return true;
    case "tt-live":ttSetCfg({active:id||null});toastMsg(id?"Players can now see this map.":"Players no longer see a map.");render();return true;
    case "tt-pull":ttSetCfg({pull:rid()});toastMsg("Opening the map for everyone.");return true;
    case "tt-fromlib":{const m=(TT.lib||[])[num(t.dataset.i)];if(m)ttNewScene(m);return true}
    case "tt-upbg":$("#tt-upbg-f")?.click();return true;
    case "tt-clearbg":if(sc){["bgUrl","bgChunks","bgVer","bgW","bgH"].forEach(f=>setField("scenes/"+sid,f,null));render()}return true;
    case "tt-clearwalls":if(S.confirm!==act){S.confirm=act;ttSync();return true}S.confirm=null;setField("scenes/"+sid,"walls",[]);render();return true;
    case "tt-expreset":setField("scenes/"+sid,"expVer",num(sc.expVer,1)+1);toastMsg("Players' explored areas reset.");render();return true;
    case "tt-dup":{const nid=rid();const d=clone(sc);d.name=(sc.name||"Map")+" (copy)";d.created=Date.now();
      if(d.bgChunks&&S.db&&!S.offline){Promise.all(Array.from({length:num(d.bgChunks)},(_,i)=>S.db.doc("scenes/"+sid+"/bg/"+i).get())).then(ps=>{const b=S.db.batch();ps.forEach((x,i)=>b.set(S.db.doc("scenes/"+nid+"/bg/"+i),x.data()||{d:""}));return b.commit()}).catch(e=>console.warn(e))}
      createDoc("scenes/"+nid,d);ttTokens(sid).forEach(p=>createDoc("tokens/"+rid(),{...clone(S.docs[p]),scene:nid}));TT.sceneId=nid;render();return true}
    case "tt-delscene":if(S.confirm!==act){S.confirm=act;ttSync();return true}S.confirm=null;ttDeleteScene(sid);return true;
    case "tt-addparty":{const have=new Set(ttTokens(sid).map(p=>S.docs[p].sheetId));sheetPaths().filter(p=>!S.docs[p].npc&&!have.has(p.split("/")[1])).forEach(p=>ttAddToken({sheetId:p.split("/")[1]}));return true}
    case "tt-addq":{const pc=$("#tt-addpc")?.value,np=$("#tt-addnpc")?.value;const hid=!!$("#tt-qhid")?.checked;
      if(pc){ttAddToken({sheetId:pc,hidden:hid});$("#tt-addpc").value="";return true}
      if(np){ttAddToken({npcId:np,name:S.docs["npcs/"+np]?.name||"NPC",hidden:hid,color:"#555b6e",vision:false});return true}
      const name=($("#tt-qname")?.value||"").trim()||"Token";const n=Math.max(1,Math.min(20,num($("#tt-qn")?.value,1)));
      for(let i=1;i<=n;i++)ttAddToken({name:n>1?name+" "+i:name,hidden:hid,color:"#555b6e",vision:false});return true}
    case "tt-dupt":{const o=S.docs["tokens/"+id];if(o){const nid=rid();createDoc("tokens/"+nid,{...clone(o),x:num(o.x)+num(sc.gridPx,70),created:Date.now()});TT.sel=nid;render()}return true}
    case "tt-delt":deleteDoc("tokens/"+id);TT.sel=null;render();return true;
    case "tt-tokimg":TT.imgFor=id;$("#tt-tokimg-f")?.click();return true;
    case "tt-tokimg-x":setField("tokens/"+id,"img",null);render();return true;
    case "tt-opennpc":S.tnpc="npcs/"+id;S.tsheet=true;render();return true;
  }
  return false;
}
function ttChange(el){
  if(el.id==="tt-upnew-f"&&el.files[0]){const f=el.files[0];el.value="";const id=rid();createDoc("scenes/"+id,{name:f.name.replace(/\.[^.]+$/,"").slice(0,40)||"New map",gridPx:70,offX:0,offY:0,scale:1,cols:30,rows:20,lighting:"lit",fog:true,walls:[],created:Date.now(),expVer:1});TT.sceneId=id;TT.ui.panel="scene";render();setTimeout(()=>ttUploadBg(id,f),300);return true}
  if(el.id==="tt-upbg-f"&&el.files[0]){const f=el.files[0];el.value="";ttUploadBg(ttSceneId(),f);return true}
  if(el.id==="tt-tokimg-f"&&el.files[0]){const f=el.files[0];el.value="";if(TT.imgFor)ttTokenImgUpload(TT.imgFor,f);return true}
  if(el.id==="tti-link"){const v=el.value;const p="tokens/"+el.dataset.id;setField(p,"sheetId",v.startsWith("s:")?v.slice(2):null);setField(p,"npcId",v.startsWith("n:")?v.slice(2):null);if(v.startsWith("s:"))setField(p,"vision",true);render();return true}
  if(["tt-snap","tt-preview","tt-locknew"].includes(el.dataset.act)){ttAct(el.dataset.act,el);return true}
  return false;
}

/* ---------- character drawer (renders into #app while on the map) ---------- */
function renderTableApp(){
  if(!S.tsheet)return renderLog();
  let body;
  if(S.tnpc&&S.docs[S.tnpc]&&ttGM()){body=`<div class="tsh-h"><b>${esc(S.docs[S.tnpc].name||"NPC")}</b><button class="ttbtn sm" data-act="tsh-pcs">Characters</button></div>${npcStatBlock(S.tnpc)}`}
  else{S.tnpc=null;const ps=sheetPaths();if(!S.current||!S.docs[S.current])S.current=myPath()||ps[0]||null;
    body=`<div class="tsh-chips">${ps.map(p=>`<button class="chip ${S.current===p?"on":""}" data-act="tsh-pick" data-doc="${esc(p)}">${portraitHtml(S.docs[p],"av")}${esc(S.docs[p].name||"Unnamed")}</button>`).join("")}</div>${S.current?renderSheet():`<div class="empty">No characters yet.</div>`}`}
  return `<aside class="tsheet" aria-label="Character sheet"><div class="tsh-top"><span class="tt-mark">CHARACTER</span><span class="tt-muted">Press C to hide</span><button class="tt-x" data-act="tt-sheet" title="Close (C)">✕</button></div><div class="tsh-body">${body}</div></aside>`+renderLog();
}
