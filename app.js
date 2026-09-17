const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#080d16"/><circle cx="100" cy="82" r="42" fill="#52e6ff"/><path d="M35 190c8-45 122-45 130 0" fill="#766dff"/><circle cx="84" cy="78" r="5" fill="#fff"/><circle cx="116" cy="78" r="5" fill="#fff"/></svg>`);
const DEFAULT_BANNER = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260"><defs><linearGradient id="g"><stop stop-color="#102a44"/><stop offset=".5" stop-color="#17113c"/><stop offset="1" stop-color="#06151d"/></linearGradient></defs><rect width="900" height="260" fill="url(#g)"/><g fill="none" stroke="#52e6ff" opacity=".25"><circle cx="130" cy="130" r="80"/><circle cx="760" cy="110" r="130"/></g></svg>`);
const COIN_ICON = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g"><stop stop-color="#52e6ff"/><stop offset="1" stop-color="#766dff"/></linearGradient></defs><circle cx="32" cy="32" r="28" fill="#07101a" stroke="url(#g)" stroke-width="5"/><path d="M20 25h25M20 32h25M20 39h18" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`);

// Virtual-only archive data. No real-money value is attached to credits.
const roles = [
  ["guest","Guest","COMMON",50,100,"#5dff9b","Green arrival aura"],
  ["new-blood","New Blood","COMMON",22,250,"#52e6ff","Soft cyan trail"],
  ["known","Known","COMMON",12,700,"#7be7ff","Blue name pulse"],
  ["member","Member","UNCOMMON",7,1500,"#9b6cff","Purple ring"],
  ["administrative","Administrative","SPECIAL",0,0,"#ff536e","Red command aura"],
  ["academy","Academy","RARE",4,5000,"#ffd76b","Golden sparks"],
  ["sinners-faith","Sinner's Faith","RARE",2.5,10000,"#ff536e","Crimson aura"],
  ["ruination","Ruination","EPIC",1,25000,"#d36cff","Fractured violet"],
  ["hallow-night","Hallow Night","EPIC",.5,50000,"#ff8b52","Halloween flame"],
  ["royal-gathering","Royal Gathering","LEGENDARY",.2,100000,"#fff0a6","Royal gold halo"],
  ["no-company","NO COMPANY","MYTHIC",.1,200000,"#ffffff","White void aura"],
  ["void-saint","Void Saint","MYTHIC",.05,350000,"#b58cff","Void wings"],
  ["you-and-i-forever","You and I Forever","ULTRA",.01,800000,"#ff4bdb","Twin-eye aura"],
  ["frost-walker","Frost Walker","UNCOMMON",6,2200,"#72d9ff","Frozen footsteps"],
  ["bell-ringer","Bell Ringer","RARE",3,7500,"#ffcf66","Bell shockwave"],
  ["shadow-hunter","Shadow Hunter","RARE",2.2,9000,"#8b7cff","Shadow cloak"],
  ["weeping-queen","Weeping Queen","EPIC",.8,30000,"#67d9ff","Rainfall crown"],
  ["crying-soldier","Crying Soldier","EPIC",.7,35000,"#7ea4ff","Blue tear particles"],
  ["solar","Solar","LEGENDARY",.18,125000,"#ffb347","Solar flare"],
  ["forever","Forever","LEGENDARY",.12,175000,"#ff6bcb","Infinite heart loop"],
  ["the-knight","The Knight","MYTHIC",.06,325000,"#dfe7ff","Steel phantom"],
  ["artist-experiment-557","Artist Experiment 557","MYTHIC",.04,450000,"#ff66ff","RGB brush burst"],
  ["luckus","Luckus","ULTRA",.015,650000,"#7dffbd","Luck constellation"],
  ["ormnikakkishin","Ormnikakkishin","ULTRA",.01,900000,"#ff3864","Glitched red orbit"],
  ["weeping-angel","Weeping Angel","MYTHIC",.07,280000,"#e9efff","Stone-wing pulse"],
  ["black-crown","Black Crown","LEGENDARY",.16,140000,"#d9d9ff","Dark crown halo"],
  ["red-moon","Red Moon","EPIC",.65,42000,"#ff455c","Lunar eclipse"],
  ["voidborn","Voidborn","MYTHIC",.045,500000,"#8e6bff","Void particles"],
  ["star-mid","Star-mid","LEGENDARY",.11,180000,"#ffffff","White stars + username aura"],
  ["angelic-praise","Angelic Praise","ULTRA",.012,1000000,"#ffffff","Large wings + halo"],
  ["eye-of-the-archive","Eye of the Archive","MYTHIC",.055,375000,"#4df5ff","Floating eye sigil"],
  ["malfunction","Malfunction","ULTRA",.02,950000,"#ff315f","RGB corruption"],
  ["soul-eater","Soul Eater","MYTHIC",.05,420000,"#ff335c","Soul flame"],
  ["dark-rpg","Dark RPG","EPIC",.6,60000,"#a87cff","RPG rune field"],
  ["hunting-horn","Hunting Horn","RARE",2.1,11000,"#f2c27b","Resonance rings"],
  ["sinners-court","Sinners Court","LEGENDARY",.13,160000,"#ff5a6e","Crimson throne"],
  ["hallow-king","Hallow King","MYTHIC",.045,400000,"#ff984d","Cursed crown"],
  ["hallow-queen","Hallow Queen","MYTHIC",.04,425000,"#ff6bd6","Cursed veil"],
  ["academy-legend","Academy Legend","LEGENDARY",.14,145000,"#ffd76b","Golden school crest"],
  ["ruined-scholar","Ruined Scholar","EPIC",.55,55000,"#a58bff","Broken book sigils"],
  ["purple-fang","Purple Fang","RARE",2,8500,"#b66cff","Fanged purple glow"],
  ["crimson-royal","Crimson Royal","LEGENDARY",.1,210000,"#ff536e","Royal red aura"],
  ["white-void","White Void","MYTHIC",.035,550000,"#f8fbff","Blinding void ring"],
  ["golden-saint","Golden Saint","MYTHIC",.03,600000,"#ffe58a","Saint halo"],
  ["nightmare","Nightmare","EPIC",.45,70000,"#b35cff","Nightmare smoke"],
  ["broken-angel","Broken Angel","LEGENDARY",.12,240000,"#d6e0ff","Cracked halo"],
  ["fallen-star","Fallen Star","MYTHIC",.035,575000,"#8ddcff","Falling star trail"],
  ["eternal","Eternal","ULTRA",.012,1100000,"#ffffff","Eternal RGB crown"],
  ["hollow-kingdom","Hollow Kingdom","ULTRA",.009,1250000,"#a8a8ff","Kingdom void field"],
  ["the-last-sinner","The Last Sinner","ULTRA",.008,1500000,"#ff294f","Final crimson mark"],
  ["ssml-ancient","SSML Ancient","MYTHIC",.025,700000,"#72ffff","Ancient archive runes"],
  ["archive-keeper","Archive Keeper","LEGENDARY",.1,250000,"#8fe4ff","Orbiting archive keys"],
  ["royal-keeper","Royal Keeper","MYTHIC",.025,725000,"#ffe7a1","Royal key aura"],
  ["company-breaker","Company Breaker","ULTRA",.007,1750000,"#ffffff","Shattered white logo"],
  ["god-of-the-archive","God of the Archive","ULTRA",.003,2500000,"#ffffff","Massive celestial aura"],
  ["unknown","UNKNOWN","ULTRA",.001,5000000,"#ff00ff","Reality-error aura"]
].map(([id,name,rarity,baseChance,value,glow,effect]) => ({id,name,rarity,baseChance,value,glow,effect}));

const EXTRA_ROLES = [
  ["grave-scribe","Grave Scribe","EPIC",0.4,90000,"#8b8cff","Floating grave-script glyphs"],
  ["blood-moon","Blood Moon","LEGENDARY",0.09,300000,"#ff244f","Blood-moon eclipse"],
  ["void-prince","Void Prince","MYTHIC",0.018,950000,"#a46bff","Purple void crown"],
  ["void-emperor","Void Emperor","ULTRA",0.006,2200000,"#7b5cff","Expanding void crown"],
  ["celestial-sinner","Celestial Sinner","ULTRA",0.004,3000000,"#fff1ff","Black-winged halo"],
  ["fallen-king","Fallen King","MYTHIC",0.02,1100000,"#9d8cff","Broken throne aura"],
  ["fallen-emperor","Fallen Emperor","ULTRA",0.004,4000000,"#ff496d","Imperial fracture aura"],
  ["sinners-apocalypse","Sinner's Apocalypse","ULTRA",0.002,5000000,"#ff1f45","Crimson apocalypse field"],
  ["endless-night","Endless Night","MYTHIC",0.016,1300000,"#6670ff","Endless night sky"],
  ["nightmare-god","Nightmare God","ULTRA",0.0025,6500000,"#a34cff","Nightmare galaxy"],
  ["godslayer","Godslayer","ULTRA",0.0018,7500000,"#ff5a5a","Divine blade flare"],
  ["heaven-breaker","Heaven Breaker","ULTRA",0.0012,9000000,"#ffffff","Heaven-splitting beam"],
  ["hell-crowned","Hell-Crowned","ULTRA",0.001,10000000,"#ff3d21","Infernal crown"],
  ["absolute-void","Absolute Void","ULTRA",0.0007,15000000,"#d9d9ff","Absolute void distortion"],
  ["eternal-king","Eternal King","ULTRA",0.0005,20000000,"#ffe99a","Eternal royal halo"],
  ["archive-deity","Archive Deity","ULTRA",0.00035,30000000,"#67f6ff","Infinite archive orbit"],
  ["ssml-overlord","SSML Overlord","ULTRA",0.0002,50000000,"#ff4dce","Overlord RGB storm"],
  ["final-judgement","FINAL JUDGEMENT","ULTRA",0.00012,75000000,"#ffffff","Judgement sigil"],
  ["end-of-archive","END OF THE ARCHIVE","ULTRA",0.00008,100000000,"#ff2e5e","Archive collapse"],
  ["one-in-a-billion","ONE IN A BILLION","ULTRA",0.00002,250000000,"#00ffff","One-in-a-billion aura"],
  ["absolute-saint","ABSOLUTE SAINT","ULTRA",0.00001,500000000,"#fff4cf","Six-wing saint aura"],
  ["god-of-ssml","GOD OF SSML","ULTRA",0.000005,1000000000,"#ffffff","Massive celestial field"],
  ["reality-ended","REALITY ENDED","ULTRA",0.000002,2500000000,"#ff00ff","Reality tear"],
  ["beyond-divine","BEYOND DIVINE","ULTRA",0.000001,5000000000,"#7fffff","Beyond-divine distortion"],
  ["final-file","FINAL FILE","ULTRA",0.0000005,10000000000,"#fff","Archive terminal glow"],
  ["saint-god-coin","SAINT GOD","ULTRA",0.0000002,25000000000,"#ffd66b","Saint-god coin halo"],
  ["9999","9999","ULTRA",0.0000001,99999999999,"#ff00ff","Numerical reality glitch"],
  ["the-finalline","THE FINAL LINE","ULTRA",0.00000005,250000000000,"#ffffff","Final-line beam"],
  ["hollow-deity","HOLLOW DEITY","ULTRA",0.00000003,500000000000,"#bbaaff","Hollow divine wings"],
  ["absolute-end","ABSOLUTE END","ULTRA",0.00000001,1000000000000,"#ff315f","Absolute end aura"]
].map(([id,name,rarity,baseChance,value,glow,effect]) => ({id,name,rarity,baseChance,value,glow,effect}));
roles.push(...EXTRA_ROLES);

const roleById = Object.fromEntries(roles.map(r => [r.id,r]));
const rarityPower = {COMMON:1,UNCOMMON:2,RARE:3,EPIC:4,LEGENDARY:5,MYTHIC:6,ULTRA:7};

const crates = [
  ["first-signal","FIRST SIGNAL","starter",500,"The safest entry into the archive.","#52e6ff",["guest","new-blood","known","member","frost-walker"]],
  ["new-member","NEW MEMBER DROP","starter",1200,"Starter titles with a few better surprises.","#5dff9b",["new-blood","known","member","frost-walker","purple-fang"]],
  ["academy-files","ACADEMY FILES","rare",4000,"Academy records and early rare titles.","#ffd76b",["member","academy","academy-legend","ruined-scholar","bell-ringer","sinners-faith"]],
  ["dark-rare","DARK RARE","rare",7500,"The first serious hunt for rare archive names.","#9b6cff",["academy","sinners-faith","purple-fang","shadow-hunter","bell-ringer","ruination"]],
  ["hallow-night","HALLOW NIGHT","rare",12000,"Cursed seasonal records.","#ff8b52",["hallow-night","hallow-king","hallow-queen","red-moon","nightmare","ruination"]],
  ["shadow-vault","SHADOW VAULT","rare",18000,"A darker crate built around shadow titles.","#765cff",["shadow-hunter","ruination","weeping-queen","crying-soldier","nightmare","soul-eater"]],
  ["royal-gathering","ROYAL GATHERING","mythic",30000,"Ceremonial titles begin here.","#fff0a6",["royal-gathering","black-crown","academy-legend","sinners-court","crimson-royal","royal-keeper"]],
  ["sinners-court","SINNER'S COURT","mythic",50000,"High-tier crimson archive records.","#ff536e",["sinners-faith","sinners-court","crimson-royal","hallow-king","void-saint","no-company"]],
  ["void-archive","VOID ARCHIVE","mythic",80000,"The archive starts fighting back.","#b58cff",["ruination","no-company","void-saint","voidborn","white-void","eye-of-the-archive"]],
  ["starfall","STARFALL","mythic",125000,"Celestial names and violent light effects.","#ffffff",["star-mid","fallen-star","solar","broken-angel","weeping-angel","void-saint"]],
  ["angelic-vault","ANGELIC VAULT","mythic",175000,"Halo, wing and celestial records.","#dce8ff",["angelic-praise","broken-angel","weeping-angel","golden-saint","star-mid","solar"]],
  ["malfunction","MALFUNCTION","mythic",250000,"Corrupted titles with RGB archive effects.","#ff315f",["malfunction","artist-experiment-557","ormnikakkishin","unknown","star-mid","no-company"]],
  ["ancient-ssml","ANCIENT SSML","mythic",350000,"Titles pulled from the oldest records.","#72ffff",["ssml-ancient","archive-keeper","royal-keeper","voidborn","the-knight","artist-experiment-557"]],
  ["soul-forge","SOUL FORGE","mythic",500000,"Heavy effects, heavy prices.","#ff335c",["soul-eater","dark-rpg","crying-soldier","weeping-queen","hallow-king","the-knight"]],
  ["eternal-vault","ETERNAL VAULT","mythic",750000,"The expensive route toward ultra-rare names.","#ff6bcb",["forever","eternal","luckus","you-and-i-forever","angelic-praise","malfunction"]],
  ["god-tier","GOD TIER","mythic",1000000,"Almost everything here is brutally rare.","#ffffff",["the-knight","voidborn","golden-saint","fallen-star","ssml-ancient","company-breaker"]],
  ["last-sinner","LAST SINNER","mythic",1500000,"Endgame crimson records.","#ff294f",["the-last-sinner","crimson-royal","white-void","hollow-kingdom","company-breaker","god-of-the-archive"]],
  ["company-breaker","COMPANY BREAKER","mythic",2500000,"The archive's absurdly expensive endgame crate.","#f7f7ff",["no-company","company-breaker","god-of-the-archive","unknown","hollow-kingdom","the-last-sinner"]],
  ["ancient-god","ANCIENT GOD","mythic",5000000,"For collectors chasing the deepest records.","#a77bff",["god-of-the-archive","unknown","company-breaker","hollow-kingdom","eternal","angelic-praise"]],
  ["unknown-file","UNKNOWN FILE","mythic",10000000,"The highest-cost crate currently in the prototype.","#ff00ff",["unknown","god-of-the-archive","company-breaker","the-last-sinner","hollow-kingdom"]]
].map(([id,name,tier,cost,desc,accent,pool]) => ({id,name,tier,cost,desc,accent,pool}));

crates.push(
  ["royal-vault","ROYAL VAULT","mythic",900000,"A royal vault with serious endgame titles.","#ffe7a1",["royal-keeper","golden-saint","eternal","fallen-king","void-prince","celestial-sinner"]],
  ["divine-vault","DIVINE VAULT","mythic",1250000,"Divine titles begin appearing in the pool.","#ffffff",["golden-saint","angelic-praise","fallen-emperor","heaven-breaker","absolute-saint","god-of-ssml"]],
  ["apocalypse","APOCALYPSE","mythic",2000000,"Apocalyptic records and violent effects.","#ff315f",["sinners-apocalypse","nightmare-god","godslayer","fallen-emperor","the-last-sinner","heaven-breaker"]],
  ["overlord","OVERLORD","mythic",3500000,"Only the archive's highest classes belong here.","#ff4dce",["void-emperor","ssml-overlord","archive-deity","eternal-king","god-of-the-archive","company-breaker"]],
  ["absolute","ABSOLUTE","mythic",5000000,"The first absurd-tier crate.","#00ffff",["absolute-void","archive-deity","reality-ended","beyond-divine","god-of-ssml","final-judgement"]],
  ["end-game","END GAME","mythic",10000000,"End-game archive records.","#ff2e5e",["end-of-archive","one-in-a-billion","final-file","the-last-sinner","god-of-ssml","reality-ended"]],
  ["beyond-divine","BEYOND DIVINE","mythic",25000000,"A crate for titles that should barely exist.","#7fffff",["beyond-divine","absolute-saint","hollow-deity","final-judgement","the-finalline","god-of-ssml"]],
  ["saint-god","SAINT GOD","mythic",50000000,"Near-terminal rarity pool.","#ffd66b",["saint-god-coin","eternal-king","absolute-saint","archive-deity","god-of-ssml","hollow-deity"]],
  ["reality-breaker","REALITY BREAKER","mythic",100000000,"Reality-breaking endgame titles.","#ff00ff",["reality-ended","beyond-divine","absolute-end","one-in-a-billion","the-finalline","god-of-ssml"]],
  ["final-archive","FINAL ARCHIVE","mythic",250000000,"The final public prototype crate.","#ffffff",["absolute-end","final-file","end-of-archive","the-finalline","hollow-deity","one-in-a-billion"]],
  ["terminal","TERMINAL","mythic",1000000000,"Terminal archive. Almost nothing survives the roll.","#ff315f",["the-finalline","absolute-end","reality-ended","beyond-divine","god-of-ssml","final-file"]]
).forEach(([id,name,tier,cost,desc,accent,pool])=>crates.push({id,name,tier,cost,desc,accent,pool}));

const STORAGE = "ssmlRareArchiveV3";
let old = null;
try { old = JSON.parse(localStorage.getItem(STORAGE) || "null"); } catch (error) {
  console.warn("SSML archive storage was invalid. Starting a clean local archive.", error);
  try { localStorage.removeItem(STORAGE); } catch (_) {}
}
const state = (old && typeof old === "object" && old.accounts && typeof old.accounts === "object") ? old : {
  activeUserId:null,
  accounts:{},
  activity:[],
  guestSeeded:false
};
let currentCrate=null, rolling=false, rollTimer=null, pendingRole=null, pendingCost=0, pendingChance=0, rollWinnerIndex=34;

function uid(){ return "u_" + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function money(n){ return Math.max(0,Math.floor(Number(n)||0)).toLocaleString(); }
function account(){ return state.accounts[state.activeUserId] || null; }
function role(id){ return roleById[id]; }
function save(){ localStorage.setItem(STORAGE,JSON.stringify(state)); renderAll(); }
function timeNow(){ return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
function escapeHtml(value){ return String(value ?? "").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
function rarityRank(r){ return rarityPower[r] || 0; }
function ensureAccountShape(a){
  a.inventory ||= {};
  a.activity ||= [];
  a.credits = Number.isFinite(a.credits) ? Math.max(0,Math.floor(a.credits)) : 25000;
  a.access ||= "guest";
  a.titleId ||= a.access === "administrative" ? "administrative" : a.access === "member" ? "member" : "guest";
  a.avatar ||= DEFAULT_AVATAR; a.banner ||= DEFAULT_BANNER; a.bio ||= "No bio yet.";
  return a;
}
if (!state.accounts || typeof state.accounts !== "object") state.accounts = {};
Object.values(state.accounts).forEach(ensureAccountShape);

function rarityForCrate(r, c){
  const distance = Math.max(0, rarityRank(r.rarity) - 1);
  const quality = Math.max(1, Math.log10(c.cost + 10));
  return Math.max(.0002, (1 / Math.pow(2.05,distance)) * (0.65 + quality / 8));
}
function getCrateEntries(c){
  const raw = c.pool.map(id=>role(id)).filter(Boolean).map(r=>({r,weight:rarityForCrate(r,c)}));
  const total = raw.reduce((a,x)=>a+x.weight,0);
  return raw.map(x=>({role:x.r,chance:(x.weight/total)*100}));
}
function weightedPick(c){
  const entries=getCrateEntries(c); let n=Math.random()*entries.reduce((a,x)=>a+x.chance,0);
  for(const e of entries){ n-=e.chance; if(n<=0) return e.role; }
  return entries.at(-1).role;
}
function iconSvg(c){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${c.accent}"/><stop offset="1" stop-color="#101827"/></linearGradient><filter id="f"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><ellipse cx="110" cy="132" rx="72" ry="12" fill="${c.accent}" opacity=".16" filter="url(#f)"/><rect x="35" y="42" width="150" height="86" rx="15" fill="#070d17" stroke="${c.accent}" stroke-width="4"/><path d="M47 70h126M70 42v86M150 42v86" stroke="${c.accent}" opacity=".4" stroke-width="4"/><rect x="89" y="78" width="42" height="28" rx="7" fill="url(#g)" stroke="#fff" opacity=".9"/><circle cx="110" cy="92" r="6" fill="#fff"/><path d="M48 42l20-19h84l20 19" fill="#0a1420" stroke="${c.accent}" stroke-width="4"/></svg>`;
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
function renderCrates(filter="all"){
  const grid=$("#crateGrid"); if(!grid)return;
  const list=crates.filter(c=>filter==="all"||c.tier===filter);
  grid.innerHTML=list.map(c=>`<article class="crate crate-${c.tier}" style="--crateGlow:${c.accent}">
    <div class="crate-art"><span class="crate-spark spark-a"></span><span class="crate-spark spark-b"></span><img alt="${escapeHtml(c.name)}" src="${iconSvg(c)}"></div>
    <div class="crate-body"><p class="eyebrow">${c.tier.toUpperCase()} ARCHIVE</p><h4>${escapeHtml(c.name)}</h4><p class="crate-desc">${escapeHtml(c.desc)}</p>
      <div class="crate-meta"><span class="rarity" style="color:${c.accent}">${c.pool.length} TITLES</span><span class="cost">${money(c.cost)} C</span></div>
      <div class="crate-actions"><button class="secondary-btn" data-view-crate="${c.id}">VIEW</button><button class="primary-btn" data-open-crate="${c.id}">OPEN</button></div>
    </div></article>`).join("");
}
function renderInventory(){
  const a=account(), grid=$("#inventoryGrid"); if(!grid)return;
  const entries=Object.entries(a?.inventory||{}).filter(([id,count])=>role(id)&&count>0).sort((x,y)=>rarityRank(role(y[0]).rarity)-rarityRank(role(x[0]).rarity));
  $("#ownedCount").textContent=entries.reduce((n,[,v])=>n+v,0);
  if(!entries.length){grid.innerHTML=`<div class="activity"><div><b>Your backpack is empty.</b><p class="muted">Open a crate to claim your first title.</p></div></div>`;return;}
  grid.innerHTML=entries.map(([id,count])=>{const r=role(id);return `<div class="inventory-item" style="--glow:${r.glow}"><div class="inv-head"><span class="rarity" style="color:${r.glow}">${r.rarity}</span><span class="inv-count">x${count}</span></div><div class="inv-title">${escapeHtml(r.name)}</div><div class="inv-rarity">${escapeHtml(r.effect)}</div><button class="sell-btn" data-sell-role="${id}">SELL FOR ${money(r.value)} C</button></div>`}).join("");
}
function renderActivity(){
  const list=$("#activityList"); if(!list)return;
  const items=state.activity.slice(0,40);
  list.innerHTML=items.length?items.map(a=>`<div class="activity"><div class="activity-dot" style="background:${a.glow};box-shadow:0 0 15px ${a.glow}"></div><div><b>${escapeHtml(a.text)}</b></div><span>${escapeHtml(a.time)}</span></div>`).join(""): `<div class="activity"><div class="activity-dot"></div><b>No archive activity yet.</b></div>`;
}
function renderAll(){
  const a=account();
  $("#credits").textContent=money(a?.credits||0); $("#currencyIcon").src=COIN_ICON;
  $("#navName").textContent=a?.username||"GUEST"; $("#navAvatar").src=a?.avatar||DEFAULT_AVATAR;
  $("#titleCount").textContent=roles.length; renderCrates($(".filter.active")?.dataset.filter||"all"); renderInventory(); renderActivity();
  $("#adminNav")?.classList.toggle("hidden",a?.access!=="administrative");
}
function showModal(id){$("#"+id)?.classList.remove("hidden");}
function closeModal(id){$("#"+id)?.classList.add("hidden");}
function animateCurrency(delta, mode="add"){
  const pill=$(".currency-pill"); if(!pill)return;
  pill.classList.remove("currency-add","currency-spend"); void pill.offsetWidth; pill.classList.add(mode==="spend"?"currency-spend":"currency-add");
  const floater=document.createElement("div"); floater.className=`currency-floater ${mode==="spend"?"spend":"add"}`; floater.textContent=(delta>=0?"+":"-")+money(Math.abs(delta))+" C"; document.body.appendChild(floater); setTimeout(()=>floater.remove(),1100);
  setTimeout(()=>pill.classList.remove("currency-add","currency-spend"),900);
}
function log(text,glow="#52e6ff",toAccount=null){
  const entry={text,glow,time:timeNow()}; state.activity.unshift(entry); state.activity=state.activity.slice(0,60);
  if(toAccount){toAccount.activity.unshift(entry);toAccount.activity=toAccount.activity.slice(0,30);}
}
function showContents(id){
  const c=crates.find(x=>x.id===id); if(!c)return;
  $("#contentsEyebrow").textContent=`${c.tier.toUpperCase()} // CONTENTS`;
  $("#contentsTitle").textContent=c.name;
  const entries=getCrateEntries(c).sort((a,b)=>b.chance-a.chance);
  $("#contentsList").innerHTML=entries.map(e=>`<div class="odds-row"><b style="color:${e.role.glow}">${escapeHtml(e.role.name)}</b><span>${e.role.rarity}</span><strong>${e.chance.toFixed(e.chance<1?3:2)}%</strong></div>`).join("");
  $("#contentsNote").textContent=`${c.pool.length} titles • ${money(c.cost)} credits • higher-cost crates contain stronger rarity pools.`;
  showModal("contentsModal");
}
function openCrate(id){
  if(rolling)return;
  const a=account(); const c=crates.find(x=>x.id===id); if(!a||!c)return;
  if(a.credits<c.cost){alert(`Not enough virtual credits. You need ${money(c.cost)} C.`);return;}
  const entries=getCrateEntries(c);
  const picked=weightedPick(c);
  const pickedEntry=entries.find(e=>e.role.id===picked.id);
  a.credits-=c.cost;
  currentCrate=c; pendingRole=picked; pendingChance=pickedEntry?.chance||0; pendingCost=c.cost;
  animateCurrency(c.cost,"spend"); save(); startRoll(c,picked);
}
function tileMarkup(r){return `<div class="roll-tile" style="--glow:${r.glow}"><strong>${escapeHtml(r.name)}</strong><small>${r.rarity}</small></div>`;}
function startRoll(c,winner){
  rolling=true;
  $("#rollCrateName").textContent=c.name;
  $("#rollStatus").textContent="ROLLING ARCHIVE...";
  $("#rollResult").classList.add("hidden");
  $("#skipRoll").classList.remove("hidden");
  showModal("rollModal");

  // The winning title is placed at one exact index. The animation and skip button
  // both use this same index, so the visible landing tile is always the actual win.
  rollWinnerIndex=34;
  const fake=Array.from({length:rollWinnerIndex+8},()=>role(c.pool[Math.floor(Math.random()*c.pool.length)]));
  fake[rollWinnerIndex]=winner;
  $("#rollTrack").innerHTML=fake.map(tileMarkup).join("");
  const track=$("#rollTrack");
  track.style.transition="none";
  track.style.transform="translateX(0px)";

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const tile=track.children[0];
    if(!tile)return;
    const step=tile.getBoundingClientRect().width+8;
    const target=(step*rollWinnerIndex)+(tile.getBoundingClientRect().width/2);
    track.style.transition="transform 6s cubic-bezier(.06,.82,.12,1)";
    track.style.transform=`translateX(-${target}px)`;
  }));
  clearTimeout(rollTimer);
  rollTimer=setTimeout(()=>finishRoll(winner),6300);
}
function finishRoll(r){
  if(!rolling)return;
  rolling=false; clearTimeout(rollTimer); $("#skipRoll").classList.add("hidden");
  const a=account(); if(!a)return;
  // On skip, snap to the exact winning tile before revealing the result.
  const track=$("#rollTrack");
  if(track?.children?.[rollWinnerIndex]){
    const tile=track.children[rollWinnerIndex];
    const step=tile.getBoundingClientRect().width+8;
    const target=(step*rollWinnerIndex)+(tile.getBoundingClientRect().width/2);
    track.style.transition="transform .35s cubic-bezier(.2,.8,.2,1)";
    track.style.transform=`translateX(-${target}px)`;
  }
  a.inventory[r.id]=(a.inventory[r.id]||0)+1;
  log(`Unlocked "${r.name}" • ${r.rarity}`,r.glow); save();
  $("#rollStatus").textContent="ARCHIVE LOCKED";
  $("#resultGlow").style.setProperty("--resultGlow",r.glow);
  $("#rollResult").style.setProperty("--resultGlow",r.glow);
  $("#resultTitle").textContent=r.name;
  $("#resultRarity").textContent=`${r.rarity} • ${pendingChance.toFixed(pendingChance<1?4:2)}% chance in ${cNameSafe(currentCrate?.name)}`;
  $("#resultEffect").textContent=r.effect;
  $("#rollResult").classList.remove("hidden");
}
function cNameSafe(name){return String(name||"this crate").replace(/[<>]/g,"");}

function switchPage(page){ $$(".page").forEach(x=>x.classList.remove("active")); $("#"+page+"Page")?.classList.add("active"); $$(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.page===page)); }
function readImage(input,img){const f=input.files?.[0]; if(!f)return; if(f.size>4*1024*1024){alert("Please use an image under 4 MB.");input.value="";return;} const r=new FileReader(); r.onload=()=>img.src=r.result; r.readAsDataURL(f);}

function completeProfile(access){
  const username=$("#usernameInput").value.trim();
  const avatar=$("#avatarPreview").src||DEFAULT_AVATAR, banner=$("#bannerPreview").src||DEFAULT_BANNER, bio=$("#bioInput").value.trim()||"No bio yet.";
  const existing=Object.values(state.accounts).find(a=>a.username.toLowerCase()===username.toLowerCase());
  if(existing){alert("That username already exists in this browser archive.");return;}
  const id=uid(); const a=ensureAccountShape({id,username,avatar,banner,bio,access,credits:25000,inventory:{},activity:[],titleId:access==="guest"?"guest":"member"});
  a.inventory[a.titleId]=1; state.accounts[id]=a; state.activeUserId=id;
  log(`${username} joined SSML as ${role(a.titleId).name}`,access==="guest"?"#5dff9b":"#9b6cff",a); closeModal("signupModal"); $("#authGate").classList.add("hidden"); save(); openProfile(id);
}
function openProfile(id=state.activeUserId){
  const p=state.accounts[id]; if(!p)return;
  $("#profileBanner").style.backgroundImage=`url("${p.banner}")`; $("#profileAvatar").src=p.avatar; $("#profileName").textContent=p.username;
  const r=role(p.titleId)||role("guest"); $("#profileTitle").textContent=r.name; $("#profileTitle").style.borderColor=r.glow; $("#profileTitle").style.color=r.glow; $("#profileTitle").style.boxShadow=`0 0 18px ${r.glow}44`;
  $("#profileBio").textContent=p.bio; $("#profileOwned").textContent=Object.values(p.inventory).reduce((x,y)=>x+y,0); $("#profileCredits").textContent=money(p.credits); $("#profileAccess").textContent=p.access.toUpperCase();
  const owned=Object.entries(p.inventory).filter(([id,count])=>role(id)&&count>0).sort((x,y)=>rarityRank(role(y[0]).rarity)-rarityRank(role(x[0]).rarity));
  $("#profileInventory").innerHTML=owned.length?owned.map(([id,count])=>{const rr=role(id);return `<div class="profile-role" style="--roleGlow:${rr.glow}"><div class="profile-role-name"><span>${escapeHtml(rr.name)}</span><em>${escapeHtml(rr.effect)}</em></div><small>${rr.rarity}</small><strong>${money(rr.value)} C</strong><b>x${count}</b></div>`}).join(""):`<div class="muted">No titles collected yet.</div>`;
  $("#profileAdminTools")?.classList.toggle("hidden",account()?.access!=="administrative"); $("#profileAdminTarget").value=id; showModal("profileModal");
}
function openDirectory(){
  $("#directorySearch").value=""; $("#directoryResults").innerHTML=`<div class="activity"><b>Search for an SSML username.</b></div>`; showModal("directoryModal");
}
function searchDirectory(){
  const q=$("#directorySearch").value.trim().toLowerCase(); const results=Object.values(state.accounts).filter(a=>!q||a.username.toLowerCase().includes(q));
  $("#directoryResults").innerHTML=results.length?results.map(a=>{const r=role(a.titleId)||role("guest");return `<button class="directory-user" data-profile-user="${a.id}"><img src="${a.avatar}" alt=""><span><b>${escapeHtml(a.username)}</b><small style="color:${r.glow}">${escapeHtml(r.name)} • ${a.access}</small></span><strong>${money(a.credits)} C</strong></button>`}).join(""):`<div class="activity"><b>No matching account.</b></div>`;
}
function openAdminPanel(targetId=state.activeUserId){
  if(account()?.access!=="administrative")return;
  const target=state.accounts[targetId]||account(); $("#adminTargetId").value=target.id; $("#adminTargetName").textContent=target.username; $("#adminTargetCredits").textContent=money(target.credits)+" C"; $("#adminAmount").value=""; showModal("adminModal");
}
function setAdminCredits(mode){
  if(account()?.access!=="administrative")return; const target=state.accounts[$("#adminTargetId").value]; if(!target)return;
  const amount=Number($("#adminAmount").value); if(!Number.isFinite(amount)||amount<0){alert("Enter a valid non-negative amount.");return;}
  const next=Math.floor(amount); const delta=next-target.credits; target.credits=next;
  log(`Administrative set ${target.username}'s credits to ${money(next)} C`,target.access==="administrative"?"#ff536e":"#ffd76b",target); save(); $("#adminTargetCredits").textContent=money(target.credits)+" C";
  if(target.id===state.activeUserId){$("#profileCredits").textContent=money(target.credits);animateCurrency(delta,delta>=0?"add":"spend");}
}
function giftCredits(){
  if(account()?.access!=="administrative")return; const target=state.accounts[$("#giftTargetId").value]; const amount=Number($("#giftAmount").value);
  if(!target||!Number.isFinite(amount)||amount<=0){alert("Choose a user and enter a positive amount.");return;}
  const n=Math.floor(amount); target.credits+=n; log(`Administrative gifted ${money(n)} C to ${target.username}`,"#ffd76b",target); save(); if(target.id===state.activeUserId)animateCurrency(n,"add"); $("#giftSuccess").textContent=`GIFTED +${money(n)} C TO ${target.username}`; setTimeout(()=>$("#giftSuccess").textContent="",1800);
}
function sellTitle(id){
  const a=account(), r=role(id); if(!a||!r||!(a.inventory[id]>0))return;
  const code=prompt(`SELL "${r.name}" for ${money(r.value)} virtual credits.\nEnter SELL-SSML to confirm:`);
  if(code!=="SELL-SSML"){if(code!==null)alert("Sale cancelled: incorrect code.");return;}
  a.inventory[id]--; if(a.inventory[id]<=0)delete a.inventory[id]; a.credits+=r.value; animateCurrency(r.value,"add"); log(`Sold "${r.name}" for ${money(r.value)} credits`,r.glow); save();
}

function resetSignup(){
  $("#signupStep1")?.classList.remove("hidden");
  $("#signupStep2")?.classList.add("hidden");
  $("#adminStep")?.classList.add("hidden");
  $("#loginStep")?.classList.add("hidden");
  $("#adminError") && ($("#adminError").textContent = "");
}
function openAuth(){
  resetSignup();
  $("#authGate")?.classList.add("hidden");
  showModal("signupModal");
}
function signInExisting(){
  const username=$("#loginUsername")?.value.trim();
  if(!username){ alert("Enter your SSML username first."); return; }
  const found=Object.values(state.accounts).find(a=>a.username.toLowerCase()===username.toLowerCase());
  if(!found){ alert("No SSML account with that username exists in this browser yet. Create it with JOIN SSML NOW."); return; }
  state.activeUserId=found.id; save(); closeModal("signupModal"); $("#authGate")?.classList.add("hidden"); renderAll(); openProfile(found.id);
}
function wireEvents(){
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.close;closeModal(id);if(id==="signupModal"&&!account())$("#authGate")?.classList.remove("hidden");}));
$$(".nav-btn").forEach(b=>b.addEventListener("click",()=>switchPage(b.dataset.page)));
$$(".filter").forEach(b=>b.addEventListener("click",()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderCrates(b.dataset.filter)}));
$("#crateGrid").addEventListener("click",e=>{const view=e.target.closest("[data-view-crate]");const open=e.target.closest("[data-open-crate]");if(view)showContents(view.dataset.viewCrate);if(open)openCrate(open.dataset.openCrate);});
$("#inventoryGrid").addEventListener("click",e=>{const b=e.target.closest("[data-sell-role]");if(b)sellTitle(b.dataset.sellRole);});
$("#skipRoll").addEventListener("click",()=>finishRoll(pendingRole));
$("#closeResult").addEventListener("click",()=>closeModal("rollModal"));
$("#openBackpack").addEventListener("click",()=>{closeModal("rollModal");switchPage("inventory")});
$("#avatarInput").addEventListener("change",()=>readImage($("#avatarInput"),$("#avatarPreview")));
$("#bannerInput").addEventListener("change",()=>readImage($("#bannerInput"),$("#bannerPreview")));
$("#openSignup")?.addEventListener("click",openAuth);
$("#loginExisting")?.addEventListener("click",signInExisting);
$("#continueJoin")?.addEventListener("click",()=>{if(!$("#usernameInput").value.trim()){alert("Enter a username first.");return;}$("#signupStep1").classList.add("hidden");$("#signupStep2").classList.remove("hidden")});
$$("[data-access]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.access==="administrative"){$("#signupStep2").classList.add("hidden");$("#adminStep").classList.remove("hidden");}else completeProfile(b.dataset.access)}));
$("#verifyAdmin").addEventListener("click",()=>{if($("#adminCode").value.trim()!=="SSML-ADMIN"){$("#adminError").textContent="Invalid proof code.";return;}completeProfile("administrative")});
$("#profileBtn").addEventListener("click",()=>openProfile());
$("#directoryBtn").addEventListener("click",openDirectory); $("#directorySearch").addEventListener("input",searchDirectory); $("#directoryResults").addEventListener("click",e=>{const b=e.target.closest("[data-profile-user]");if(b){closeModal("directoryModal");openProfile(b.dataset.profileUser)}});
$("#adminNav").addEventListener("click",()=>openAdminPanel());
$("#profileAdminGive").addEventListener("click",()=>{const id=$("#profileAdminTarget").value;closeModal("profileModal");$("#giftTargetId").value=id;$("#giftAmount").value="";showModal("giftModal")});
$("#profileAdminSet").addEventListener("click",()=>{const id=$("#profileAdminTarget").value;closeModal("profileModal");openAdminPanel(id)});
$("#giftCredits").addEventListener("click",giftCredits);
$("#adminSetCredits").addEventListener("click",()=>setAdminCredits("set"));
$("#adminAddCredits").addEventListener("click",()=>{const n=Number($("#adminAmount").value);if(!Number.isFinite(n)||n<0){alert("Enter a valid amount first.");return;}const target=state.accounts[$("#adminTargetId").value];if(!target)return;$("#adminAmount").value=target.credits+Math.floor(n);setAdminCredits("set")});
$("#adminSearchUsers").addEventListener("input",()=>{const q=$("#adminSearchUsers").value.trim().toLowerCase();const list=Object.values(state.accounts).filter(a=>a.username.toLowerCase().includes(q));$("#adminUserList").innerHTML=list.map(a=>`<button class="admin-user" data-admin-user="${a.id}"><span>${escapeHtml(a.username)}</span><small>${money(a.credits)} C</small></button>`).join("")||`<p class="muted">No users found.</p>`});
$("#adminUserList").addEventListener("click",e=>{const b=e.target.closest("[data-admin-user]");if(b)openAdminPanel(b.dataset.adminUser)});
}

function bootSSML(){
  try {
    // Migrate the previous prototype before rendering or deciding whether the gate is needed.
    (function migrateOld(){
      if(state.accounts && Object.keys(state.accounts).length)return;
      let legacy=null;
      try { legacy=JSON.parse(localStorage.getItem("ssmlArchiveState")||"null"); } catch (_) {}
      if(!legacy?.profile)return;
      const p=legacy.profile, id=uid();
      const a=ensureAccountShape({id,username:p.username,avatar:p.avatar,banner:p.banner,bio:p.bio,access:p.access,credits:legacy.credits||25000,inventory:legacy.inventory||{},activity:legacy.activity||[],titleId:p.access==="administrative"?"administrative":p.access==="guest"?"guest":"member"});
      state.accounts[id]=a; state.activeUserId=id; save();
    })();
    wireEvents();
    if(account()) $("#authGate")?.classList.add("hidden");
    else $("#authGate")?.classList.remove("hidden");
    renderAll();
  } catch(error) {
    console.error("SSML boot error:", error);
    alert("SSML could not start correctly. The local archive data has been reset; refresh the page and try again.");
    try { localStorage.removeItem(STORAGE); } catch (_) {}
  }
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootSSML, {once:true});
else bootSSML();
