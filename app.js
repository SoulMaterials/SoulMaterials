const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#080d16"/><circle cx="100" cy="82" r="42" fill="#52e6ff"/><path d="M35 190c8-45 122-45 130 0" fill="#766dff"/><circle cx="84" cy="78" r="5" fill="#fff"/><circle cx="116" cy="78" r="5" fill="#fff"/></svg>`);
const DEFAULT_BANNER = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260"><defs><linearGradient id="g"><stop stop-color="#102a44"/><stop offset=".5" stop-color="#17113c"/><stop offset="1" stop-color="#06151d"/></linearGradient></defs><rect width="900" height="260" fill="url(#g)"/><g fill="none" stroke="#52e6ff" opacity=".25"><circle cx="130" cy="130" r="80"/><circle cx="760" cy="110" r="130"/></g></svg>`);
const COIN_ICON = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g"><stop stop-color="#52e6ff"/><stop offset="1" stop-color="#766dff"/></linearGradient></defs><circle cx="32" cy="32" r="28" fill="#07101a" stroke="url(#g)" stroke-width="5"/><path d="M20 25h25M20 32h25M20 39h18" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`);

// Virtual-only archive data. No real-money value is attached to credits.
// All editable crate/role data lives in ONE folder: /data.
const crateData = window.SSML_CRATE_DATA || [];
const rarityPower = {COMMON:1,UNCOMMON:2,RARE:3,EPIC:4,LEGENDARY:5,MYTHIC:6,ULTRA:7,SPECIAL:0};
const roleMap = new Map();
for (const c of crateData) for (const r of (c.roles || [])) if (!roleMap.has(r.id)) {
  roleMap.set(r.id, { ...r, baseChance:Number(r.chance)||0, glow:r.color||'#ffffff', value:Number(r.price)||0, effect:r.effect||'Archive aura' });
}
const roles = [...roleMap.values()];
const roleById = Object.fromEntries(roles.map(r => [r.id,r]));
const crates = crateData.map(c => ({...c, pool:(c.roles||[]).map(r=>r.id)}));

const STORAGE = "ssmlRareArchiveV4";
function loadArchiveState(){
  const keys=[STORAGE,"ssmlRareArchiveV3"];
  for(const key of keys){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) continue;
      const parsed=JSON.parse(raw);
      if(parsed && typeof parsed === "object" && parsed.accounts && typeof parsed.accounts === "object") return parsed;
    }catch(error){
      console.warn("Ignoring invalid SSML local archive data.",error);
    }
  }
  return {activeUserId:null,accounts:{},activity:[],guestSeeded:false};
}
const state = loadArchiveState();

// One-time fresh start: clear the old browser accounts so everyone can make
// a brand-new SSML account. The version marker prevents this from deleting
// newly-created accounts again on later refreshes.
const ACCOUNT_RESET_VERSION = "ssml-fresh-start-2026-09-18-v1";
function resetOldAccountsOnce(){
  try {
    if(localStorage.getItem(ACCOUNT_RESET_VERSION) === "done") return;
    state.activeUserId = null;
    state.accounts = {};
    state.activity = [];
    state.guestSeeded = false;
    localStorage.removeItem(STORAGE);
    localStorage.removeItem("ssmlRareArchiveV3");
    localStorage.removeItem("ssmlArchiveState");
    localStorage.setItem(ACCOUNT_RESET_VERSION, "done");
  } catch(error) {
    console.warn("Could not clear the old local SSML accounts.", error);
  }
}

// The account modal uses this function for the main SIGN IN / JOIN SSML button.
// A missing function here used to stop wireEvents() halfway through, which made
// the sign-in and join buttons appear completely dead.
function openAuth(){
  $("#signupStep1")?.classList.remove("hidden");
  $("#signupStep2")?.classList.add("hidden");
  $("#adminStep")?.classList.add("hidden");
  $("#adminError") && ($("#adminError").textContent = "");
  showModal("signupModal");
}
let currentCrate=null, rolling=false, rollTimer=null, pendingRole=null, pendingCost=0, pendingChance=0, rollWinnerIndex=34;
let autoSpinCrateId=null, autoSpinCancelTimer=null;
const SPECIAL_EFFECTS_STORAGE = "ssmlSpecialRollEffectsV2";
const DEFAULT_SPECIAL_EFFECT = {
  enabled: true,
  animation: "spin-expand",
  image: "saint-hit.png",
  sound: "assets/Doom effect.mp3",
  volume: 0.9,
  glowColor: "#ff4a00"
};
const DEFAULT_SPECIAL_EFFECTS = {
  "saint-of-the-hallow-night-forgotten-pumpkin-kishin": { ...DEFAULT_SPECIAL_EFFECT }
};
function loadSpecialEffects(){
  try {
    const parsed=JSON.parse(localStorage.getItem(SPECIAL_EFFECTS_STORAGE)||"null");
    if(parsed && typeof parsed === "object") return parsed;
  } catch (_) {}
  return {...DEFAULT_SPECIAL_EFFECTS};
}
function buildConfiguredSpecialEffects(){
  const configured=window.SSML_SPECIAL_EFFECTS || [];
  const byName=new Map(roles.map(r=>[String(r.name).trim(),r.id]));
  const result={...loadSpecialEffects()};

  for(const item of configured){
    if(!item || !item.title) continue;
    const roleId=byName.get(String(item.title).trim());
    if(!roleId){
      console.warn(`Special effect title not found: ${item.title}`);
      continue;
    }

    let base={...DEFAULT_SPECIAL_EFFECT};
    if(item.copyFrom){
      const sourceId=byName.get(String(item.copyFrom).trim());
      if(sourceId && result[sourceId]) base={...base,...result[sourceId]};
    }

    result[roleId]={
      ...base,
      ...item,
      title: undefined,
      copyFrom: undefined
    };
    delete result[roleId].title;
    delete result[roleId].copyFrom;
  }

  return result;
}
const specialEffects = buildConfiguredSpecialEffects();
function specialEffectFor(roleId){
  const e=specialEffects[roleId];
  if(!e) return null;
  return {...DEFAULT_SPECIAL_EFFECT,...e};
}
function saveSpecialEffects(){
  localStorage.setItem(SPECIAL_EFFECTS_STORAGE,JSON.stringify(specialEffects));
}
let specialHitRaf = 0;
let specialHitLastCenters = new Map();

function uid(){ return "u_" + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function money(n){ return Math.max(0,Math.floor(Number(n)||0)).toLocaleString(); }
function account(){ return state.accounts[state.activeUserId] || null; }

// Render shared-data bridge. GitHub Pages can still run the local-only fallback,
// while the Render web service uses the shared API/database.
let serverMode = false;
// Shared API: Render serves the app itself, while GitHub Pages can use the same Render backend.
const API_BASE = (window.SSML_API_BASE || (location.hostname.endsWith('github.io') ? 'https://soulmaterials-1.onrender.com' : '')).replace(/\/$/, '');
async function apiRequest(path, options={}){
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type":"application/json", ...(options.headers||{}) }
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if(!res.ok){ const err=new Error(data?.error || `API ${res.status}`); err.status=res.status; throw err; }
  return data;
}
async function detectServer(){
  try {
    const data = await apiRequest('/api/health', {method:'GET'});
    serverMode = !!data?.ok;
  } catch (_) { serverMode = false; }
}
function mergeServerUser(u){
  if(!u?.id)return null;
  const old=state.accounts[u.id]||{};
  const merged=ensureAccountShape({...old,...u, passwordHash:old.passwordHash||undefined});
  state.accounts[u.id]=merged;
  return merged;
}
async function refreshServerUser(id){
  if(!serverMode)return state.accounts[id]||null;
  try { const data=await apiRequest(`/api/users/${encodeURIComponent(id)}`); return mergeServerUser(data.user); }
  catch (_) { return state.accounts[id]||null; }
}
function role(id){ return roleById[id]; }
function save(){
  try{
    localStorage.setItem(STORAGE,JSON.stringify(state));
  }catch(error){
    console.error("SSML archive save failed",error);
    // Keep the UI alive even if a browser blocks storage or its quota is full.
    try{
      const lightweight={activeUserId:state.activeUserId,accounts:{},activity:state.activity.slice(0,20),guestSeeded:state.guestSeeded};
      for(const [id,a] of Object.entries(state.accounts)){
        lightweight.accounts[id]={...a,activity:[],avatar:DEFAULT_AVATAR,banner:DEFAULT_BANNER};
      }
      localStorage.setItem(STORAGE,JSON.stringify(lightweight));
    }catch(_){
      console.warn("SSML is running in memory because browser storage is unavailable.");
    }
  }
  renderAll();
}
function timeNow(){ return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
function escapeHtml(value){ return String(value ?? "").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
function rarityRank(r){ return rarityPower[r] || 0; }
function ensureAccountShape(a){
  a.inventory ||= {};
  a.activity ||= [];
  a.following ||= [];
  a.followers ||= [];
  a.friends ||= [];
  a.credits = Number.isFinite(a.credits) ? Math.max(0,Math.floor(a.credits)) : 25000;
  a.access ||= "guest";
  a.titleId ||= a.access === "administrative" ? "administrative" : a.access === "member" ? "member" : "guest";
  a.equippedTitleId = a.equippedTitleId === null ? null : (a.equippedTitleId || a.titleId);
  a.avatar ||= DEFAULT_AVATAR; a.banner ||= DEFAULT_BANNER; a.bio ||= "No bio yet.";
  return a;
}
if (!state.accounts || typeof state.accounts !== "object") state.accounts = {};
Object.values(state.accounts).forEach(ensureAccountShape);

// IMPORTANT: Never delete old local accounts during startup.
// Older SSML accounts may not have a password yet; keep their archive data so
// the user can restore the account to the shared Render database by choosing a
// new password during sign-in.
if (state.activeUserId && !state.accounts[state.activeUserId]) state.activeUserId = null;

async function hashPassword(password){
  const text = String(password || "");
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  return btoa(unescape(encodeURIComponent(text)));
}

function profileRole(p){
  return p?.equippedTitleId ? (role(p.equippedTitleId)||role(p.titleId)||role("guest")) : null;
}

function applyProfileTheme(p){
  const r=profileRole(p);
  document.documentElement.style.setProperty("--profile-glow", r?.glow || "#52e6ff");
  document.body.dataset.profileEffect = r?.effect || "";
  document.body.classList.toggle("profile-rgb", !!r && /rgb|rainbow|spectrum|color/i.test(`${r.name} ${r.effect}`));
}

function rarityForCrate(r, c){
  // baseChance is the editable difficulty weight for the title. Lower means harder.
  // The crate's price also gives higher-tier crates a gentle quality bonus without
  // overriding the title's configured rarity/chance.
  const base=Math.max(0.000000001,Number(r.baseChance)||0.000000001);
  const quality=Math.max(1,Math.log10(c.cost+10));
  const crateBoost=1+(quality/14)*((rarityRank(r.rarity)||1)/7);
  return base*crateBoost;
}
function getCrateEntries(c){
  const raw = (c.roles||[]).map(r=>({
    role:{...r,baseChance:Number(r.chance)||0,glow:r.color||'#ffffff',value:Number(r.price)||0,effect:r.effect||'Archive aura'},
    weight:rarityForCrate({baseChance:Number(r.chance)||0,rarity:r.rarity},c)
  }));
  const total = raw.reduce((a,x)=>a+x.weight,0);
  return total>0 ? raw.map(x=>({role:x.role,chance:(x.weight/total)*100})) : [];
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
    <div class="crate-art"><span class="crate-spark spark-a"></span><span class="crate-spark spark-b"></span><img alt="${escapeHtml(c.name)}" src="${escapeHtml(c.image || iconSvg(c))}" onerror="this.onerror=null;this.src='${iconSvg(c)}'"></div>
    <div class="crate-body"><p class="eyebrow">${c.tier.toUpperCase()} ARCHIVE</p><h4>${escapeHtml(c.name)}</h4><p class="crate-desc">${escapeHtml(c.desc)}</p>
      <div class="crate-meta"><span class="rarity" style="color:${c.accent}">${c.pool.length} TITLES</span><span class="cost">${money(c.cost)} C</span></div>
      <div class="crate-actions"><button class="secondary-btn" data-view-crate="${c.id}">VIEW</button><button class="primary-btn" data-open-crate="${c.id}">OPEN</button><button class="auto-spin-btn" data-auto-spin="${c.id}">AUTO SPIN</button></div>
    </div></article>`).join("");
}
function renderInventory(){
  const a=account(), grid=$("#inventoryGrid"); if(!grid)return;
  const entries=Object.entries(a?.inventory||{}).filter(([id,count])=>role(id)&&count>0).sort((x,y)=>rarityRank(role(y[0]).rarity)-rarityRank(role(x[0]).rarity));
  $("#ownedCount").textContent=entries.reduce((n,[,v])=>n+v,0);
  if(!entries.length){grid.innerHTML=`<div class="activity"><div><b>Your backpack is empty.</b><p class="muted">Open a crate to claim your first title.</p></div></div>`;return;}
  grid.innerHTML=entries.map(([id,count])=>{const r=role(id);return `<div class="inventory-item" style="--glow:${r.glow}"><div class="inv-head"><span class="rarity" style="color:${r.glow}">${r.rarity}</span><span class="inv-count">x${count}</span></div><div class="inv-title">${escapeHtml(r.name)}</div><div class="inv-rarity">${escapeHtml(r.effect)}</div><div class="inventory-actions"><button class="equip-btn ${a.equippedTitleId===id?"equipped":""}" data-equip-role="${id}">${a.equippedTitleId===id?"EQUIPPED":"EQUIP"}</button><button class="sell-btn" data-sell-role="${id}">SELL FOR ${money(r.value)} C</button></div></div>`}).join("");
}
function renderActivity(){
  const list=$("#activityList"); if(!list)return;
  const items=state.activity.slice(0,40);
  list.innerHTML=items.length?items.map(a=>`<div class="activity"><div class="activity-dot" style="background:${a.glow};box-shadow:0 0 15px ${a.glow}"></div><div><b>${escapeHtml(a.text)}</b></div><span>${escapeHtml(a.time)}</span></div>`).join(""): `<div class="activity"><div class="activity-dot"></div><b>No archive activity yet.</b></div>`;
}
function renderAll(){
  const a=account();
  $("#credits").textContent=money(a?.credits||0); $("#currencyIcon").src=COIN_ICON; applyProfileTheme(a);
  $("#navName").textContent=a?.username||"GUEST"; $("#navAvatar").src=a?.avatar||DEFAULT_AVATAR;
  $("#titleCount").textContent=roles.length; renderCrates($(".filter.active")?.dataset.filter||"all"); renderInventory(); renderActivity();
  const isAdmin=a?.access==="administrative";
  $("#adminNav")?.classList.toggle("hidden",!isAdmin);
  $("#archiveEditorNav")?.classList.toggle("hidden",!isAdmin);
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
function updateAutoSpinButtons(){
  $$("[data-auto-spin]").forEach(btn=>{
    const active=autoSpinCrateId===btn.dataset.autoSpin;
    btn.textContent=active?"CANCEL AUTO SPIN":"AUTO SPIN";
    btn.classList.toggle("auto-spin-active",active);
  });
}
function stopAutoSpin(){
  autoSpinCrateId=null;
  clearTimeout(autoSpinCancelTimer);
  autoSpinCancelTimer=null;
  updateAutoSpinButtons();
}
function startAutoSpin(id){
  const a=account(), c=crates.find(x=>x.id===id);
  if(!a||!c)return;
  if(autoSpinCrateId===id){ stopAutoSpin(); return; }
  if(autoSpinCrateId) stopAutoSpin();
  autoSpinCrateId=id;
  updateAutoSpinButtons();
  if(!rolling) openCrate(id);
}
function continueAutoSpin(){
  if(!autoSpinCrateId)return;
  const id=autoSpinCrateId, a=account(), c=crates.find(x=>x.id===id);
  if(!a||!c||a.credits<c.cost){ stopAutoSpin(); return; }
  autoSpinCancelTimer=setTimeout(()=>{
    autoSpinCancelTimer=null;
    if(autoSpinCrateId===id&&!rolling) openCrate(id);
  },700);
}

function showContents(id){
  const c=crates.find(x=>x.id===id); if(!c)return;
  $("#contentsEyebrow").textContent=`${c.tier.toUpperCase()} // CONTENTS`;
  $("#contentsTitle").textContent=c.name;
  const entries=getCrateEntries(c).sort((a,b)=>a.chance-b.chance);
  $("#contentsList").innerHTML=entries.map(e=>`<div class="odds-row"><b style="color:${e.role.glow}">${escapeHtml(e.role.name)}</b><span>${e.role.rarity}</span><strong>${e.chance.toFixed(e.chance<1?3:2)}%</strong></div>`).join("");
  $("#contentsNote").textContent=`${c.pool.length} titles • ${money(c.cost)} credits • higher-cost crates contain stronger rarity pools.`;
  showModal("contentsModal");
}
async function openCrate(id){
  if(rolling)return;
  if(autoSpinCrateId && autoSpinCrateId!==id) stopAutoSpin();
  const a=account(); const c=crates.find(x=>x.id===id); if(!a||!c)return;
  if(a.credits<c.cost){alert(`Not enough virtual credits. You need ${money(c.cost)} C.`);return;}
  const entries=getCrateEntries(c);
  const picked=weightedPick(c);
  const pickedEntry=entries.find(e=>e.role.id===picked.id);
  a.credits-=c.cost;
  currentCrate=c; pendingRole=picked; pendingChance=pickedEntry?.chance||0; pendingCost=c.cost;
  if(serverMode){
    try{
      const data=await apiRequest(`/api/users/${encodeURIComponent(a.id)}/archive`,{method:'POST',body:JSON.stringify({requesterId:a.id,credits:a.credits,inventory:a.inventory})});
      mergeServerUser(data.user);
    }catch(err){
      console.error(err); a.credits+=c.cost; save(); alert("The shared archive could not save this crate opening. Nothing was spent."); return;
    }
  }
  animateCurrency(c.cost,"spend"); save(); startRoll(c,picked);
}
function tileMarkup(r){return `<div class="roll-tile" data-role-id="${escapeHtml(r.id)}" style="--glow:${r.glow}"><strong>${escapeHtml(r.name)}</strong><small>${r.rarity}</small></div>`;}
function playSpecialHitSound(effect){
  if(!effect?.sound)return;
  const sound=new Audio(effect.sound);
  sound.volume=Math.min(1,Math.max(0,Number(effect.volume) || 0));
  sound.play().catch(()=>{});
}
function showSpecialHit(roleId){
  const effect=specialEffectFor(roleId);
  if(!effect?.enabled)return;
  const overlay=$("#specialHitOverlay");
  const image=$("#specialHitImage");
  if(!overlay||!image)return;
  image.src=effect.image || DEFAULT_SPECIAL_EFFECT.image;
  overlay.dataset.animation=effect.animation || DEFAULT_SPECIAL_EFFECT.animation;
  overlay.style.setProperty("--specialGlow",effect.glowColor || DEFAULT_SPECIAL_EFFECT.glowColor || "#ff4a00");
  overlay.classList.remove("special-hit-active");
  void overlay.offsetWidth;
  overlay.classList.add("special-hit-active");
  playSpecialHitSound(effect);
}
function monitorSpecialHits(){
  cancelAnimationFrame(specialHitRaf);
  specialHitLastCenters=new Map();
  const tick=()=>{
    const track=$("#rollTrack"), windowEl=track?.parentElement;
    if(!track||!windowEl){specialHitRaf=0;return;}
    const pointerX=windowEl.getBoundingClientRect().left+windowEl.getBoundingClientRect().width/2;
    for(const tile of track.children){
      const rect=tile.getBoundingClientRect();
      const center=rect.left+rect.width/2;
      const previous=specialHitLastCenters.get(tile);
      if(previous!==undefined && previous>pointerX && center<=pointerX){
        showSpecialHit(tile.dataset.roleId);
      }
      specialHitLastCenters.set(tile,center);
    }
    if(rolling) specialHitRaf=requestAnimationFrame(tick); else specialHitRaf=0;
  };
  specialHitRaf=requestAnimationFrame(tick);
}
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
  monitorSpecialHits();
  clearTimeout(rollTimer);
  rollTimer=setTimeout(()=>finishRoll(winner),6300);
}
function finishRoll(r){
  if(!rolling)return;
  rolling=false; clearTimeout(rollTimer); cancelAnimationFrame(specialHitRaf); specialHitRaf=0; $("#skipRoll").classList.add("hidden");
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
  if(serverMode){
    apiRequest(`/api/users/${encodeURIComponent(a.id)}/archive`,{method:'POST',body:JSON.stringify({requesterId:a.id,credits:a.credits,inventory:a.inventory})})
      .then(data=>{ mergeServerUser(data.user); save(); })
      .catch(err=>console.error("Could not sync unlocked title to shared archive",err));
  }
  log(`Unlocked "${r.name}" • ${r.rarity}`,r.glow); save();
  $("#rollStatus").textContent="ARCHIVE LOCKED";
  $("#resultGlow").style.setProperty("--resultGlow",r.glow);
  $("#rollResult").style.setProperty("--resultGlow",r.glow);
  $("#resultTitle").textContent=r.name;
  $("#resultRarity").textContent=`${r.rarity} • ${pendingChance.toFixed(pendingChance<1?4:2)}% chance in ${cNameSafe(currentCrate?.name)}`;
  $("#resultEffect").textContent=r.effect;
  $("#rollResult").classList.remove("hidden");
  continueAutoSpin();
}
function cNameSafe(name){return String(name||"this crate").replace(/[<>]/g,"");}

function switchPage(page){ $$(".page").forEach(x=>x.classList.remove("active")); $("#"+page+"Page")?.classList.add("active"); $$(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.page===page)); }
function readImage(input,img){
  const f=input.files?.[0]; if(!f)return;
  if(!f.type.startsWith("image/")){alert("Please choose an image file.");input.value="";return;}
  if(f.size>12*1024*1024){alert("Please use an image under 12 MB.");input.value="";return;}
  const reader=new FileReader();
  reader.onload=()=>{
    const source=new Image();
    source.onload=()=>{
      const maxSide=input.id==="bannerInput"?1400:700;
      const scale=Math.min(1,maxSide/Math.max(source.naturalWidth,source.naturalHeight));
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(source.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(source.naturalHeight*scale));
      const ctx=canvas.getContext("2d");
      ctx.drawImage(source,0,0,canvas.width,canvas.height);
      let quality=.82; let data=canvas.toDataURL("image/jpeg",quality);
      while(data.length>520000 && quality>.45){quality-=.07;data=canvas.toDataURL("image/jpeg",quality);}
      img.src=data;
    };
    source.onerror=()=>alert("That image could not be read.");
    source.src=reader.result;
  };
  reader.readAsDataURL(f);
}

async function completeProfile(access){
  const username=$("#usernameInput").value.trim();
  const password=$("#passwordInput").value;
  const avatar=$("#avatarPreview").src||DEFAULT_AVATAR;
  const banner=$("#bannerPreview").src||DEFAULT_BANNER;
  const bio=$("#bioInput").value.trim()||"No bio yet.";

  if(username.length<2){alert("Username must be at least 2 characters.");return;}
  if(password.length<6){alert("Password must be at least 6 characters.");return;}

  if(serverMode){
    try{
      const data=await apiRequest('/api/auth/register',{method:'POST',body:JSON.stringify({username,password,avatar,banner,bio,access})});
      const a=mergeServerUser(data.user);
      state.activeUserId=a.id;
      closeModal("signupModal");
      $("#authGate").classList.add("hidden");
      save();
      openProfile(a.id);
      return;
    }catch(err){
      if(err.status===409){alert("That username already exists. Use the existing-account sign in instead.");return;}
      console.error("Shared account registration failed",err);
      alert("The shared account server could not create the account. Try again in a moment.");
      return;
    }
  }

  const existing=Object.values(state.accounts).find(a=>a.username.toLowerCase()===username.toLowerCase());
  if(existing){alert("That username already exists. Use the existing-account sign in instead.");return;}
  const id=uid();
  const passwordHash=await hashPassword(password);
  const a=ensureAccountShape({id,username,avatar,banner,bio,passwordHash,access,credits:25000,inventory:{},activity:[],titleId:access==="guest"?"guest":"member",equippedTitleId:access==="guest"?"guest":"member",following:[],followers:[],friends:[]});
  a.inventory[a.titleId]=1; state.accounts[id]=a; state.activeUserId=id;
  log(`${username} joined SSML as ${role(a.titleId).name}`,access==="guest"?"#5dff9b":"#9b6cff",a);
  closeModal("signupModal"); $("#authGate").classList.add("hidden"); save(); openProfile(id);
}

async function openProfile(id=state.activeUserId){
  if(serverMode){ await refreshServerUser(id); }
  const p=state.accounts[id]; if(!p)return;
  ensureAccountShape(p);
  $("#profileBanner").style.backgroundImage=`url("${p.banner}")`;
  $("#profileAvatar").src=p.avatar; $("#profileName").textContent=p.username;

  const r=profileRole(p);
  $("#profileModal .profile-card")?.style.setProperty("--profileGlow", r?.glow || "#52e6ff");
  const titleBox=$("#profileTitle");
  titleBox.textContent=r ? r.name : "NO TITLE EQUIPPED";
  titleBox.style.borderColor=r?.glow || "#667085"; titleBox.style.color=r?.glow || "#667085";
  titleBox.style.boxShadow=r ? `0 0 18px ${r.glow}66, 0 0 40px ${r.glow}22` : "none";
  titleBox.classList.toggle("rgb-title", !!r && /rgb|rainbow|spectrum|color/i.test(`${r.name} ${r.effect}`));

  $("#profileBio").textContent=p.bio; $("#profileOwned").textContent=Object.values(p.inventory).reduce((x,y)=>x+y,0);
  $("#profileCredits").textContent=money(p.credits); $("#profileAccess").textContent=p.access.toUpperCase();

  const owned=Object.entries(p.inventory).filter(([rid,count])=>role(rid)&&count>0).sort((x,y)=>rarityRank(role(y[0]).rarity)-rarityRank(role(x[0]).rarity));
  $("#profileInventory").innerHTML=owned.length?owned.map(([rid,count])=>{
    const rr=role(rid), equipped=p.equippedTitleId===rid;
    return `<div class="profile-role ${equipped?"profile-role-equipped":""}" style="--roleGlow:${rr.glow}">
      <div class="profile-role-name"><span>${escapeHtml(rr.name)}</span><em>${escapeHtml(rr.effect)}</em></div>
      <small>${rr.rarity}</small><strong>${money(rr.value)} C</strong><b>x${count}</b>
      <button class="profile-equip-btn" data-profile-equip="${rid}">${equipped?"UNEQUIP":"EQUIP"}</button>
    </div>`;
  }).join(""):`<div class="muted">No titles collected yet.</div>`;

  const me=account(); const self=me?.id===p.id; const following=(me?.following||[]).includes(p.id); const friends=(me?.friends||[]).includes(p.id);
  if(self) $("#profileSocialActions").innerHTML=`<span class="social-self">THIS IS YOUR PROFILE</span>`;
  else $("#profileSocialActions").innerHTML=`<button class="social-btn ${following?"active":""}" data-follow-user="${p.id}">${following?"FOLLOWING":"FOLLOW"}</button><button class="social-btn ${friends?"active":""}" data-friend-user="${p.id}">${friends?"FRIENDS":"ADD FRIEND"}</button>`;

  const friendIds=(p.friends||[]);
  if(serverMode){
    await Promise.all(friendIds.map(async fid=>{ if(!state.accounts[fid]) await refreshServerUser(fid); }));
  }
  const visibleFriendIds=friendIds.filter(fid=>state.accounts[fid]);
  $("#profileFriends").innerHTML=visibleFriendIds.length?visibleFriendIds.map(fid=>{
    const f=state.accounts[fid], fr=profileRole(f)||role("guest");
    return `<button class="friend-card" data-profile-user="${f.id}"><img src="${f.avatar}" alt=""><span><b>${escapeHtml(f.username)}</b><small style="color:${fr?.glow||"#fff"}">${escapeHtml(fr?.name||"No title")}</small></span></button>`;
  }).join(""):`<div class="muted">No friends yet.</div>`;

  $("#profileAdminTools")?.classList.toggle("hidden",me?.access!=="administrative"); $("#profileAdminTarget").value=id; showModal("profileModal");
}

async function toggleFollow(targetId){
  const me=account(), target=state.accounts[targetId]; if(!me||!target||me.id===targetId)return;
  if(serverMode){
    try{ const data=await apiRequest(`/api/users/${encodeURIComponent(targetId)}/follow`,{method:'POST',body:JSON.stringify({userId:me.id})}); mergeServerUser(data.me); mergeServerUser(data.target); save(); await openProfile(targetId); return; }
    catch(err){ console.error(err); alert("Could not update the follow right now."); return; }
  }
  me.following ||= []; target.followers ||= []; const i=me.following.indexOf(targetId);
  if(i>=0){me.following.splice(i,1); const j=target.followers.indexOf(me.id);if(j>=0)target.followers.splice(j,1);} else {me.following.push(targetId);if(!target.followers.includes(me.id))target.followers.push(me.id);}
  save(); openProfile(targetId);
}

async function toggleFriend(targetId){
  const me=account(), target=state.accounts[targetId]; if(!me||!target||me.id===targetId)return;
  if(serverMode){
    try{ const data=await apiRequest(`/api/users/${encodeURIComponent(targetId)}/friend`,{method:'POST',body:JSON.stringify({userId:me.id})}); mergeServerUser(data.me); mergeServerUser(data.target); save(); await openProfile(targetId); return; }
    catch(err){ console.error(err); alert("Could not update the friendship right now."); return; }
  }
  me.friends ||= []; target.friends ||= []; const i=me.friends.indexOf(targetId);
  if(i>=0){me.friends.splice(i,1); const j=target.friends.indexOf(me.id);if(j>=0)target.friends.splice(j,1);} else {me.friends.push(targetId);if(!target.friends.includes(me.id))target.friends.push(me.id);}
  save(); openProfile(targetId);
}

async function equipTitle(id){
  const a=account(), r=role(id); if(!a||!r||!(a.inventory[id]>0))return;
  a.equippedTitleId = a.equippedTitleId===id ? null : id;
  if(serverMode){
    try{ const data=await apiRequest(`/api/users/${encodeURIComponent(a.id)}/profile`,{method:'POST',body:JSON.stringify({requesterId:a.id,equippedTitleId:a.equippedTitleId})}); mergeServerUser(data.user); }
    catch(err){ console.error(err); alert("Could not save your equipped title to the shared server."); return; }
  }
  save(); openProfile(a.id);
}

function openDirectory(){
  $("#directorySearch").value=""; $("#directoryResults").innerHTML=`<div class="activity"><b>Search for an SSML username.</b></div>`; showModal("directoryModal"); searchDirectory();
}
async function searchDirectory(){
  const q=$("#directorySearch").value.trim().toLowerCase();
  if(serverMode){
    try{
      const data=await apiRequest(`/api/users?q=${encodeURIComponent(q)}`);
      data.users.forEach(mergeServerUser);
      const results=data.users;
      $("#directoryResults").innerHTML=results.length?results.map(a=>{const r=role(a.equippedTitleId||a.titleId)||role("guest");const admin=account()?.access==="administrative"?`<button class="directory-gift" data-gift-user="${a.id}">GIFT</button>`:"";return `<div class="directory-user"><button class="directory-user-main" data-profile-user="${a.id}"><img src="${a.avatar}" alt=""><span><b>${escapeHtml(a.username)}</b><small style="color:${r?.glow||"#fff"}">${escapeHtml(r?.name||"No title")} • ${a.access}</small></span><strong>${money(a.credits)} C</strong></button>${admin}</div>`}).join(""):`<div class="activity"><b>No matching account.</b></div>`;
      return;
    }catch(err){ console.error(err); }
  }
  const results=Object.values(state.accounts).filter(a=>!q||a.username.toLowerCase().includes(q));
  $("#directoryResults").innerHTML=results.length?results.map(a=>{const r=role(a.equippedTitleId||a.titleId)||role("guest");const admin=account()?.access==="administrative"?`<button class="directory-gift" data-gift-user="${a.id}">GIFT</button>`:"";return `<div class="directory-user"><button class="directory-user-main" data-profile-user="${a.id}"><img src="${a.avatar}" alt=""><span><b>${escapeHtml(a.username)}</b><small style="color:${r?.glow||"#fff"}">${escapeHtml(r?.name||"No title")} • ${a.access}</small></span><strong>${money(a.credits)} C</strong></button>${admin}</div>`}).join(""):`<div class="activity"><b>No matching account.</b></div>`;
}

async function openAdminPanel(targetId=state.activeUserId){
  if(account()?.access!=="administrative")return;
  if(serverMode && targetId) await refreshServerUser(targetId);
  const target=state.accounts[targetId]||account();
  if(!target)return;
  $("#adminTargetId").value=target.id; $("#adminTargetName").textContent=target.username; $("#adminTargetCredits").textContent=money(target.credits)+" C"; $("#adminAmount").value="";
  if(serverMode) await searchAdminUsers();
  showModal("adminModal");
}
async function setAdminCredits(mode){
  const me=account();
  if(me?.access!=="administrative")return;
  const targetId=$("#adminTargetId").value;
  const amount=Number($("#adminAmount").value);
  if(!targetId||!Number.isFinite(amount)||amount<0){alert("Enter a valid non-negative amount.");return;}
  const next=Math.floor(amount);
  if(serverMode){
    try{
      const oldTarget=state.accounts[targetId];
      const oldCredits=Number(oldTarget?.credits||0);
      const data=await apiRequest("/api/admin/set-credits",{method:"POST",body:JSON.stringify({adminId:me.id,targetId,amount:next})});
      const target=mergeServerUser(data.target);
      $("#adminTargetCredits").textContent=money(target.credits)+" C";
      if(target.id===state.activeUserId){const delta=next-oldCredits;$("#profileCredits").textContent=money(target.credits);animateCurrency(delta,delta>=0?"add":"spend");}
      save();
      return;
    }catch(err){console.error(err);alert(err.status===403?"You do not have administrative permission on the shared server.":"Could not set credits right now.");return;}
  }
  const target=state.accounts[targetId]; if(!target)return;
  const delta=next-target.credits; target.credits=next;
  log(`Administrative set ${target.username}'s credits to ${money(next)} C`,target.access==="administrative"?"#ff536e":"#ffd76b",target); save(); $("#adminTargetCredits").textContent=money(target.credits)+" C";
  if(target.id===state.activeUserId){$("#profileCredits").textContent=money(target.credits);animateCurrency(delta,delta>=0?"add":"spend");}
}
async function searchAdminUsers(){
  if(account()?.access!=="administrative")return;
  const q=$("#adminSearchUsers")?.value.trim()||"";
  if(serverMode){
    try{
      const data=await apiRequest(`/api/users?q=${encodeURIComponent(q)}`);
      data.users.forEach(mergeServerUser);
      renderAdminUserList(data.users);
      return;
    }catch(err){console.error(err);}
  }
  const list=Object.values(state.accounts).filter(a=>!q||a.username.toLowerCase().includes(q.toLowerCase())).slice(0,100);
  renderAdminUserList(list);
}
function renderAdminUserList(list){
  $("#adminUserList").innerHTML=list.length?list.map(a=>`<button class="admin-user" data-admin-user="${a.id}"><span>${escapeHtml(a.username)}</span><small>${money(a.credits)} C</small></button>`).join(""):`<p class="muted">No users found.</p>`;
}
async function giftCredits(){
  const me=account();
  if(me?.access!=="administrative")return;
  const targetId=$("#giftTargetId").value;
  const amount=Number($("#giftAmount").value);
  if(!targetId||!Number.isFinite(amount)||amount<=0){alert("Choose a user and enter a positive amount.");return;}
  const n=Math.floor(amount);
  if(serverMode){
    try{
      const data=await apiRequest("/api/admin/gift",{method:"POST",body:JSON.stringify({adminId:me.id,targetId,amount:n})});
      const target=mergeServerUser(data.target);
      if(target.id===me.id) mergeServerUser(data.admin);
      if(target.id===state.activeUserId) animateCurrency(n,"add");
      $("#adminTargetId").value=target.id; $("#adminTargetName").textContent=target.username; $("#adminTargetCredits").textContent=money(target.credits)+" C";
      $("#giftSuccess").textContent=`GIFTED +${money(n)} C TO ${target.username}`;
      save();
      setTimeout(()=>$("#giftSuccess").textContent="",1800);
      return;
    }catch(err){
      console.error(err);
      alert(err.status===403?"You do not have administrative permission on the shared server.":"Could not gift credits right now.");
      return;
    }
  }
  const target=state.accounts[targetId];
  if(!target)return;
  target.credits+=n;
  log(`Administrative gifted ${money(n)} C to ${target.username}`,"#ffd76b",target);
  save();
  if(target.id===state.activeUserId)animateCurrency(n,"add");
  $("#giftSuccess").textContent=`GIFTED +${money(n)} C TO ${target.username}`;
  setTimeout(()=>$("#giftSuccess").textContent="",1800);
}
function sellTitle(id){
  const a=account(), r=role(id);
  const owned=Number(a?.inventory?.[id]||0);
  if(!a||!r||owned<1)return;
  const modal=$("#sellModal"), qty=$("#sellQuantity");
  $("#sellTitleName").textContent=r.name;
  $("#sellOwned").textContent=`YOU OWN x${owned}`;
  $("#sellUnitValue").textContent=`${money(r.value)} C EACH`;
  $("#sellTotal").textContent=`${money(r.value)} C`;
  qty.max=String(owned); qty.min="1"; qty.value="1";
  modal.dataset.roleId=id; modal.classList.remove("hidden");
}
async function confirmSellTitle(){
  const a=account(), modal=$("#sellModal"), id=modal.dataset.roleId, r=role(id);
  const owned=Number(a?.inventory?.[id]||0), qty=Math.floor(Number($("#sellQuantity").value));
  if(!a||!r||qty<1||qty>owned)return;
  const total=r.value*qty;
  if(serverMode){
    try{
      const data=await apiRequest(`/api/users/${encodeURIComponent(a.id)}/sell`,{method:'POST',body:JSON.stringify({requesterId:a.id,roleId:id,quantity:qty,unitValue:r.value})});
      mergeServerUser(data.user);
    }catch(err){ console.error(err); alert(err.status===400?"You don't have enough copies to sell that many.":"The shared archive could not complete the sale."); return; }
  } else {
    a.inventory[id]-=qty; if(a.inventory[id]<=0)delete a.inventory[id]; a.credits+=total;
  }
  closeModal("sellModal");
  animateCurrency(total,"add");
  log(`Sold x${qty} "${r.name}" for ${money(total)} credits`,r.glow);
  save();
}

async function signInExisting(){
  const username = String($("#loginUsername")?.value || "").trim();
  const password = String($("#loginPassword")?.value || "");
  if(!username){ alert("Enter your SSML username first."); return; }
  if(!password){ alert("Enter your password."); return; }

  // IMPORTANT: Check the browser archive FIRST. This protects accounts that
  // were created before DATABASE_URL was connected or before a Render deploy.
  // A server failure must never make a valid local account look deleted.
  const local = Object.values(state.accounts || {}).find(a =>
    String(a.username || "").trim().toLowerCase() === username.toLowerCase()
  );

  if(local){
    // Older local accounts may not have a password hash. In that case the
    // entered password becomes the password used when the archive is restored.
    if(local.passwordHash){
      const hash = await hashPassword(password);
      if(hash !== local.passwordHash){
        // The local password can be old while the shared server has the current
        // password. Give the shared account a chance before rejecting it.
        if(serverMode){
          try{
            const data = await apiRequest('/api/auth/login', {
              method:'POST',
              body:JSON.stringify({username,password})
            });
            const found = mergeServerUser(data.user);
            state.activeUserId = found.id;
            save(); closeModal("signupModal"); $("#authGate")?.classList.add("hidden");
            renderAll(); openProfile(found.id); return;
          }catch(_){ /* fall through to the local password error */ }
        }
        alert("Incorrect password.");
        return;
      }
    }

    // Local password is valid (or this is a legacy account). Save the local
    // session immediately, then sync/restore it on the shared server.
    state.activeUserId = local.id;
    local.passwordHash = local.passwordHash || await hashPassword(password);
    ensureAccountShape(local);
    save();
    closeModal("signupModal");
    $("#authGate")?.classList.add("hidden");
    renderAll();

    if(serverMode){
      try{
        // If the shared account already exists, sign in and merge the server
        // copy so the database remains the source of truth across devices.
        const data = await apiRequest('/api/auth/login', {
          method:'POST',
          body:JSON.stringify({username,password})
        });
        const found = mergeServerUser(data.user);
        // Keep the locally verified password hash so the browser can still
        // recover the session if the server is temporarily unavailable.
        found.passwordHash = local.passwordHash;
        state.activeUserId = found.id;
        save(); renderAll(); openProfile(found.id); return;
      }catch(err){
        // 404 means the account existed locally but was never persisted to the
        // database (for example, it was created before DATABASE_URL was added).
        // Restore it instead of forcing the user to create a new account.
        if(err.status === 404 || err.status === 500 || err.status === 503){
          try{
            const restored = await apiRequest('/api/auth/restore', {
              method:'POST',
              body:JSON.stringify({
                username,password,
                avatar:local.avatar,banner:local.banner,bio:local.bio,access:local.access,
                credits:local.credits,inventory:local.inventory,
                following:local.following,followers:local.followers,friends:local.friends,
                titleId:local.titleId,equippedTitleId:local.equippedTitleId,legacyId:local.id
              })
            });
            const found = mergeServerUser(restored.user);
            found.passwordHash = local.passwordHash;
            state.activeUserId = found.id;
            save(); renderAll(); openProfile(found.id);
            return;
          }catch(restoreErr){
            // If another copy was already created, keep the local session alive.
            if(restoreErr.status !== 409) console.warn("SSML account sync delayed:", restoreErr);
          }
        }
        // Server is unavailable: the local account remains usable and is NOT
        // deleted. It will sync on a later successful connection.
        console.warn("SSML shared account sync delayed:", err);
        openProfile(local.id);
        return;
      }
    }

    openProfile(local.id);
    return;
  }

  // No local copy: use the shared server directly. This is the normal path on
  // a new device/browser.
  if(serverMode){
    try{
      const data = await apiRequest('/api/auth/login', {
        method:'POST', body:JSON.stringify({username,password})
      });
      const found = mergeServerUser(data.user);
      // Keep a browser-side verifier for recovery if the server is unavailable.
      found.passwordHash = await hashPassword(password);
      state.activeUserId = found.id;
      save(); closeModal("signupModal"); $("#authGate")?.classList.add("hidden");
      renderAll(); openProfile(found.id); return;
    }catch(err){
      alert(err.status===404
        ? "That SSML account could not be found. If this is the account you created before the Render database was connected, open the original browser/device where you created it so SSML can recover its archive."
        : err.status===401
          ? "Incorrect password."
          : "The shared account server could not sign you in right now. Your account was NOT deleted.");
      return;
    }
  }

  alert("The SSML account server is offline right now. Your account was NOT deleted. Try again when the server is online.");
}


function renderRoleEditor(selectedId){
  const select=$("#roleEditorSelect"); if(!select)return;
  select.innerHTML=roles.filter(r=>r.id!=="administrative").map(r=>`<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} — ${r.rarity} — ${r.baseChance}%</option>`).join("");
  if(selectedId)select.value=selectedId;
  loadRoleEditor();
}
function loadRoleEditor(){
  const r=role($("#roleEditorSelect")?.value); if(!r)return;
  $("#roleEditorName").value=r.name; $("#roleEditorRarity").value=r.rarity; $("#roleEditorColor").value=r.glow; $("#roleEditorChance").value=r.baseChance; $("#roleEditorValue").value=r.value; $("#roleEditorEffect").value=r.effect;
  $("#roleEditorPreview").textContent=r.name; $("#roleEditorPreview").style.color=r.glow; $("#roleEditorPreview").style.textShadow=`0 0 18px ${r.glow}`;
}
function saveRoleEditor(){
  if(account()?.access!=="administrative")return;
  const r=role($("#roleEditorSelect")?.value); if(!r)return;
  const name=$("#roleEditorName").value.trim(); const rarity=$("#roleEditorRarity").value; const color=$("#roleEditorColor").value.trim(); const chance=Number($("#roleEditorChance").value); const value=Number($("#roleEditorValue").value); const effect=$("#roleEditorEffect").value.trim();
  if(!name||!/^#[0-9a-fA-F]{6}$/.test(color)||!Number.isFinite(chance)||chance<0||!Number.isFinite(value)||value<0){alert("Check the role name, #RRGGBB color, chance, and value.");return;}
  r.name=name;r.rarity=rarity;r.glow=color;r.baseChance=chance;r.value=Math.floor(value);r.effect=effect||"Archive aura";
  for(const c of crates){
    const local=(c.roles||[]).find(x=>x.id===r.id);
    if(local){ local.name=name; local.rarity=rarity; local.color=color; local.chance=chance; local.price=Math.floor(value); local.effect=r.effect; }
  }
  save(); renderRoleEditor(r.id); $("#configSaved").textContent=`SAVED ${r.name}`; setTimeout(()=>$("#configSaved").textContent="",1600);
}
function renderCrateEditor(selectedId){
  const select=$("#crateEditorSelect"); if(!select)return;
  select.innerHTML=crates.map(c=>`<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} — ${money(c.cost)} C</option>`).join("");
  if(selectedId)select.value=selectedId;
  loadCrateEditor();
}
function loadCrateEditor(){
  const c=crates.find(x=>x.id===$("#crateEditorSelect")?.value); if(!c)return;
  $("#crateEditorName").value=c.name; $("#crateEditorTier").value=c.tier; $("#crateEditorCost").value=c.cost; $("#crateEditorColor").value=c.accent; $("#crateEditorDesc").value=c.desc; $("#crateEditorPool").value=c.pool.join(", ");
}
function saveCrateEditor(){
  if(account()?.access!=="administrative")return;
  const c=crates.find(x=>x.id===$("#crateEditorSelect")?.value); if(!c)return;
  const name=$("#crateEditorName").value.trim(); const tier=$("#crateEditorTier").value; const cost=Number($("#crateEditorCost").value); const color=$("#crateEditorColor").value.trim(); const desc=$("#crateEditorDesc").value.trim();
  const pool=$("#crateEditorPool").value.split(",").map(x=>x.trim()).filter(Boolean).filter(id=>role(id));
  if(!name||!Number.isFinite(cost)||cost<0||!/^#[0-9a-fA-F]{6}$/.test(color)||!pool.length){alert("Check the crate name, cost, #RRGGBB color, and use valid role IDs in the pool.");return;}
  c.name=name;c.tier=tier;c.cost=Math.floor(cost);c.accent=color;c.desc=desc||"Archive crate.";c.pool=[...new Set(pool)];
  save(); renderCrateEditor(c.id); $("#configSaved").textContent=`SAVED ${c.name}`; setTimeout(()=>$("#configSaved").textContent="",1600);
}
function renderSpecialEffectEditor(selectedId){
  const select=$("#specialEffectRole"); if(!select)return;
  select.innerHTML=roles.filter(r=>r.id!=="administrative").map(r=>`<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} — ${r.rarity}</option>`).join("");
  if(selectedId)select.value=selectedId;
  loadSpecialEffectEditor();
}
function loadSpecialEffectEditor(){
  const id=$("#specialEffectRole")?.value; if(!id)return;
  const effect=specialEffectFor(id)||{...DEFAULT_SPECIAL_EFFECT,enabled:false};
  $("#specialEffectEnabled").checked=!!effect.enabled;
  $("#specialEffectAnimation").value=effect.animation||"spin-expand";
  $("#specialEffectImage").value=effect.image||"";
  $("#specialEffectSound").value=effect.sound||"";
  $("#specialEffectVolume").value=effect.volume ?? 0.9;
  const name=role(id)?.name||"TITLE";
  $("#specialEffectPreview").textContent=`${name} // ${effect.animation||"spin-expand"}`;
}
function saveSpecialEffectEditor(){
  if(account()?.access!=="administrative")return;
  const id=$("#specialEffectRole")?.value; if(!id)return;
  specialEffects[id]={
    enabled:!!$("#specialEffectEnabled")?.checked,
    animation:$("#specialEffectAnimation")?.value||"spin-expand",
    image:$("#specialEffectImage")?.value.trim()||"",
    sound:$("#specialEffectSound")?.value.trim()||"",
    volume:Math.min(1,Math.max(0,Number($("#specialEffectVolume")?.value)||0)),
    glowColor:$("#specialEffectGlowColor")?.value || "#ff4a00"
  };
  saveSpecialEffects();
  loadSpecialEffectEditor();
  $("#configSaved").textContent=`SAVED EFFECT FOR ${role(id)?.name||id}`;
  setTimeout(()=>$("#configSaved").textContent="",1600);
}
function duplicateSpecialEffect(){
  if(account()?.access!=="administrative")return;
  const sourceId=$("#specialEffectSource")?.value;
  const targetId=$("#specialEffectRole")?.value;
  if(!sourceId||!targetId)return;
  const source=specialEffectFor(sourceId);
  if(!source){alert("That source title does not have an effect yet.");return;}
  specialEffects[targetId]={...source};
  saveSpecialEffects();
  loadSpecialEffectEditor();
  $("#configSaved").textContent=`COPIED EFFECT TO ${role(targetId)?.name||targetId}`;
  setTimeout(()=>$("#configSaved").textContent="",1600);
}
function clearSpecialEffect(){
  if(account()?.access!=="administrative")return;
  const id=$("#specialEffectRole")?.value; if(!id)return;
  delete specialEffects[id];
  saveSpecialEffects();
  loadSpecialEffectEditor();
  $("#configSaved").textContent="SPECIAL EFFECT CLEARED";
  setTimeout(()=>$("#configSaved").textContent="",1600);
}
function loadSpecialConfig(){
  renderSpecialEffectEditor();
  const source=$("#specialEffectSource");
  if(source){
    source.innerHTML=roles.filter(r=>specialEffectFor(r.id)).map(r=>`<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`).join("");
    if(specialEffectFor("saint-of-the-hallow-night-forgotten-pumpkin-kishin"))source.value="saint-of-the-hallow-night-forgotten-pumpkin-kishin";
  }
}
function saveSpecialConfig(){ saveSpecialEffectEditor(); }
function openConfig(){
  if(account()?.access!=="administrative")return;
  renderRoleEditor();renderCrateEditor();loadSpecialConfig();$("#configSaved").textContent="";showModal("configModal");
}

function wireEvents(){
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.close;closeModal(id);if(id==="signupModal"&&!account())$("#authGate")?.classList.remove("hidden");}));
$$(".nav-btn").forEach(b=>b.addEventListener("click",()=>switchPage(b.dataset.page)));
$$(".filter").forEach(b=>b.addEventListener("click",()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderCrates(b.dataset.filter)}));
$("#crateGrid")?.addEventListener("click",e=>{const view=e.target.closest("[data-view-crate]");const open=e.target.closest("[data-open-crate]");const auto=e.target.closest("[data-auto-spin]");if(view)showContents(view.dataset.viewCrate);if(open)openCrate(open.dataset.openCrate);if(auto)startAutoSpin(auto.dataset.autoSpin);});
$("#inventoryGrid")?.addEventListener("click",e=>{
  const equip=e.target.closest("[data-equip-role]");
  const sell=e.target.closest("[data-sell-role]");
  if(equip)equipTitle(equip.dataset.equipRole);
  if(sell)sellTitle(sell.dataset.sellRole);
});
$("#skipRoll")?.addEventListener("click",()=>{
  if(!rolling || !pendingRole)return;
  const track=$("#rollTrack");
  const tile=track?.children?.[rollWinnerIndex];
  if(tile){
    const step=tile.getBoundingClientRect().width+8;
    const target=(step*rollWinnerIndex)+(tile.getBoundingClientRect().width/2);
    track.style.transition="none";
    track.style.transform=`translateX(-${target}px)`;
  }
  finishRoll(pendingRole);
});
$("#closeResult")?.addEventListener("click",()=>closeModal("rollModal"));
$("#openBackpack")?.addEventListener("click",()=>{closeModal("rollModal");switchPage("inventory")});
$("#avatarInput")?.addEventListener("change",()=>readImage($("#avatarInput"),$("#avatarPreview")));
$("#bannerInput")?.addEventListener("change",()=>readImage($("#bannerInput"),$("#bannerPreview")));
$("#openSignup")?.addEventListener("click",openAuth);

$("#continueJoin")?.addEventListener("click",()=>{if(!$("#usernameInput").value.trim()){alert("Enter a username first.");return;}$("#signupStep1").classList.add("hidden");$("#signupStep2").classList.remove("hidden")});
$$("[data-access]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.access==="administrative"){$("#signupStep2").classList.add("hidden");$("#adminStep").classList.remove("hidden");}else completeProfile(b.dataset.access)}));
$("#verifyAdmin")?.addEventListener("click",()=>{if($("#adminCode").value.trim()!=="SSML-ADMIN"){$("#adminError").textContent="Invalid proof code.";return;}completeProfile("administrative")});
$("#profileBtn")?.addEventListener("click",()=>openProfile());
$("#profileSocialActions")?.addEventListener("click",e=>{
  const f=e.target.closest("[data-follow-user]"); const fr=e.target.closest("[data-friend-user]");
  if(f)toggleFollow(f.dataset.followUser);
  if(fr)toggleFriend(fr.dataset.friendUser);
});
$("#profileInventory")?.addEventListener("click",e=>{
  const b=e.target.closest("[data-profile-equip]"); if(b)equipTitle(b.dataset.profileEquip);
});
$("#profileFriends")?.addEventListener("click",e=>{
  const b=e.target.closest("[data-profile-user]"); if(b)openProfile(b.dataset.profileUser);
});
$("#directoryBtn")?.addEventListener("click",openDirectory); $("#directorySearch")?.addEventListener("input",searchDirectory); $("#directoryResults")?.addEventListener("click",e=>{const gift=e.target.closest("[data-gift-user]");if(gift){e.stopPropagation();$("#giftTargetId").value=gift.dataset.giftUser;const target=state.accounts[gift.dataset.giftUser];$("#giftAmount").value="";showModal("giftModal");return;}const b=e.target.closest("[data-profile-user]");if(b){closeModal("directoryModal");openProfile(b.dataset.profileUser)}});
$("#adminNav")?.addEventListener("click",()=>openAdminPanel());
$("#profileAdminGive")?.addEventListener("click",()=>{const id=$("#profileAdminTarget").value;closeModal("profileModal");$("#giftTargetId").value=id;$("#giftAmount").value="";showModal("giftModal")});
$("#profileAdminSet")?.addEventListener("click",()=>{const id=$("#profileAdminTarget").value;closeModal("profileModal");openAdminPanel(id)});
$("#giftCredits")?.addEventListener("click",giftCredits);
$("#adminSetCredits")?.addEventListener("click",()=>setAdminCredits("set"));
$("#adminAddCredits")?.addEventListener("click",()=>{const n=Number($("#adminAmount").value);if(!Number.isFinite(n)||n<0){alert("Enter a valid amount first.");return;}const target=state.accounts[$("#adminTargetId").value];if(!target)return;$("#adminAmount").value=target.credits+Math.floor(n);setAdminCredits("set")});
$("#adminSearchUsers")?.addEventListener("input",searchAdminUsers);
$("#adminUserList")?.addEventListener("click",e=>{const b=e.target.closest("[data-admin-user]");if(b)openAdminPanel(b.dataset.adminUser)});
$("#archiveEditorNav")?.addEventListener("click",openConfig);
$("#roleEditorSelect")?.addEventListener("change",loadRoleEditor);
$("#crateEditorSelect")?.addEventListener("change",loadCrateEditor);
$("#saveRoleEditor")?.addEventListener("click",saveRoleEditor);
$("#saveCrateEditor")?.addEventListener("click",saveCrateEditor);
$("#saveSpecialConfig")?.addEventListener("click",saveSpecialConfig);
$("#specialEffectRole")?.addEventListener("change",loadSpecialEffectEditor);
$("#duplicateSpecialEffect")?.addEventListener("click",duplicateSpecialEffect);
$("#clearSpecialEffect")?.addEventListener("click",clearSpecialEffect);
$$("[data-config-tab]").forEach(b=>b.addEventListener("click",()=>{
  $$("[data-config-tab]").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  $$(".config-panel").forEach(x=>x.classList.add("hidden"));
  $("#"+b.dataset.configTab)?.classList.remove("hidden");
}));
}

document.addEventListener("click",(e)=>{
  const b=e.target.closest?.("#loginExisting");
  if(b){ e.preventDefault(); signInExisting(); }
});

async function bootSSML(){
  try {
    resetOldAccountsOnce();
    await detectServer();
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
    // Never wipe the user's archive just because one startup feature failed.
    // Keep local data intact and leave the authentication gate usable.
    try {
      $("authGate")?.classList.remove("hidden");
      $("profileBtn")?.classList.add("hidden");
      renderCrates($(".filter.active")?.dataset.filter || "all");
      renderInventory();
      renderActivity();
      wireEvents();
    } catch(fallbackError) {
      console.error("SSML fallback boot error:", fallbackError);
    }
  }
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootSSML, {once:true});
else bootSSML();
