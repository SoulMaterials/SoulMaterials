const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#0b1220"/><circle cx="100" cy="82" r="42" fill="#52e6ff"/><path d="M35 190c8-45 122-45 130 0" fill="#766dff"/></svg>`);
const DEFAULT_BANNER = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260"><defs><linearGradient id="g"><stop stop-color="#102a44"/><stop offset=".5" stop-color="#17113c"/><stop offset="1" stop-color="#06151d"/></linearGradient></defs><rect width="900" height="260" fill="url(#g)"/><g fill="none" stroke="#52e6ff" opacity=".25"><circle cx="130" cy="130" r="80"/><circle cx="760" cy="110" r="130"/></g></svg>`);
const COIN_ICON = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g"><stop stop-color="#52e6ff"/><stop offset="1" stop-color="#766dff"/></linearGradient></defs><circle cx="32" cy="32" r="28" fill="#07101a" stroke="url(#g)" stroke-width="5"/><path d="M20 25h25M20 32h25M20 39h18" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`);

const titles = [
 {id:"guest",name:"Guest",rarity:"COMMON",chance:50,value:100,glow:"#5dff9b",effect:"Green arrival aura"},
 {id:"new-blood",name:"New Blood",rarity:"COMMON",chance:22,value:250,glow:"#52e6ff",effect:"Soft cyan trail"},
 {id:"known",name:"Known",rarity:"UNCOMMON",chance:12,value:700,glow:"#7be7ff",effect:"Blue name pulse"},
 {id:"member",name:"Member",rarity:"UNCOMMON",chance:7,value:1500,glow:"#9b6cff",effect:"Purple ring"},
 {id:"academy",name:"Academy",rarity:"RARE",chance:4,value:5000,glow:"#ffd76b",effect:"Golden sparks"},
 {id:"sinner",name:"Sinner's Faith",rarity:"RARE",chance:2.5,value:10000,glow:"#ff536e",effect:"Crimson aura"},
 {id:"ruination",name:"Ruination",rarity:"EPIC",chance:1,value:25000,glow:"#d36cff",effect:"Fractured violet"},
 {id:"hallow",name:"Hallow Night",rarity:"EPIC",chance:.5,value:50000,glow:"#ff8b52",effect:"Halloween flame"},
 {id:"royal",name:"Royal Gathering",rarity:"LEGENDARY",chance:.2,value:100000,glow:"#fff0a6",effect:"Royal gold halo"},
 {id:"no-company",name:"NO COMPANY",rarity:"MYTHIC",chance:.1,value:200000,glow:"#ffffff",effect:"White void aura"},
 {id:"void-saint",name:"Void Saint",rarity:"MYTHIC",chance:.05,value:350000,glow:"#b58cff",effect:"Void wings"},
 {id:"forever",name:"You and I Forever",rarity:"ULTRA",chance:.01,value:800000,glow:"#ff4bdb",effect:"Twin-eye aura"},
];
const crates = [
 {id:"starter",name:"FIRST SIGNAL",tier:"starter",cost:500,desc:"A safe entry into the archive.",icon:"📡",accent:"#52e6ff",pool:["guest","new-blood","known","member","academy"]},
 {id:"rare",name:"DARK RARE",tier:"rare",cost:2500,desc:"Where the harder titles begin.",icon:"🜏",accent:"#9b6cff",pool:["known","member","academy","sinner","ruination","hallow"]},
 {id:"mythic",name:"MYTHIC VAULT",tier:"mythic",cost:10000,desc:"Low odds. Loud effects.",icon:"✦",accent:"#ffd76b",pool:["academy","sinner","ruination","hallow","royal","no-company","void-saint"]},
 {id:"void",name:"VOID ARCHIVE",tier:"mythic",cost:25000,desc:"The archive barely wants to give these up.",icon:"◈",accent:"#ff536e",pool:["ruination","hallow","royal","no-company","void-saint","forever"]},
 {id:"academy",name:"ACADEMY FILES",tier:"rare",cost:4000,desc:"Seasonal records and academy titles.",icon:"▣",accent:"#5dff9b",pool:["member","academy","sinner","ruination","hallow"]},
 {id:"royal",name:"ROYAL GATHERING",tier:"mythic",cost:15000,desc:"Ceremonial and high-tier titles.",icon:"♛",accent:"#fff0a6",pool:["sinner","ruination","royal","no-company","void-saint"]},
 {id:"hallow",name:"HALLOW NIGHT",tier:"rare",cost:3000,desc:"A seasonal crate with cursed energy.",icon:"☾",accent:"#ff8b52",pool:["academy","sinner","hallow","ruination","royal"]},
 {id:"company",name:"NO COMPANY",tier:"mythic",cost:50000,desc:"The expensive way into the void.",icon:"X",accent:"#ffffff",pool:["hallow","royal","no-company","void-saint","forever"]},
];

const state = JSON.parse(localStorage.getItem("ssmlArchiveState") || "null") || {
 credits:25000, profile:null, inventory:{}, activity:[]
};
let currentCrate = null, rolling = false, rollTimer = null, pendingTitle = null;

function save(){localStorage.setItem("ssmlArchiveState",JSON.stringify(state)); renderAll();}
function title(id){return titles.find(t=>t.id===id);}
function money(n){return n.toLocaleString();}
function weightedPick(pool){
  const list=pool.map(title);
  const weights=list.map(t=>Math.max(t.chance,.001));
  const total=weights.reduce((a,b)=>a+b,0); let r=Math.random()*total;
  for(let i=0;i<list.length;i++){r-=weights[i];if(r<=0)return list[i];}
  return list[list.length-1];
}
function crateArt(c){
  return `<div class="crate-art" style="--accent:${c.accent}"><img alt="" src="${"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g"><stop stop-color="${c.accent}"/><stop offset="1" stop-color="#111827"/></linearGradient></defs><rect x="27" y="45" width="146" height="110" rx="18" fill="#07101a" stroke="${c.accent}" stroke-width="5"/><path d="M38 77h124M60 45v110M140 45v110" stroke="${c.accent}" opacity=".5" stroke-width="4"/><circle cx="100" cy="105" r="24" fill="url(#g)" opacity=".9"/><path d="M89 105h22M100 94v22" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`) }">`);
}
function renderCrates(filter="all"){
 const grid=$("#crateGrid");
 const list=crates.filter(c=>filter==="all"||c.tier===filter);
 grid.innerHTML=list.map(c=>`<article class="crate">
   ${crateArt(c)}
   <div class="crate-body"><p class="eyebrow">${c.tier.toUpperCase()} ARCHIVE</p><h4>${c.name}</h4><p style="color:#8997ad;font-size:11px;line-height:1.5;margin:8px 0">${c.desc}</p>
   <div class="crate-meta"><span class="rarity" style="color:${c.accent}">${c.pool.length} TITLES</span><span class="cost">${money(c.cost)} C</span></div>
   <div class="crate-actions"><button class="secondary-btn" onclick="showContents('${c.id}')">VIEW</button><button class="primary-btn" onclick="openCrate('${c.id}')">OPEN</button></div></div></article>`).join("");
}
function renderInventory(){
 const grid=$("#inventoryGrid"), entries=Object.entries(state.inventory);
 $("#ownedCount").textContent=entries.reduce((n,[,v])=>n+v,0);
 if(!entries.length){grid.innerHTML=`<div class="activity"><div><b>Your backpack is empty.</b><p style="color:#8997ad;font-size:11px">Open a crate to claim your first title.</p></div></div>`;return;}
 grid.innerHTML=entries.map(([id,count])=>{const t=title(id);return `<div class="inventory-item" style="--glow:${t.glow}"><div class="inv-head"><span class="rarity" style="color:${t.glow}">${t.rarity}</span><span class="inv-count">x${count}</span></div><div class="inv-title">${t.name}</div><div class="inv-rarity">${t.effect}</div><button class="sell-btn" onclick="sellTitle('${id}')">SELL FOR ${money(t.value)} C</button></div>`}).join("");
}
function renderActivity(){
 const list=$("#activityList");
 if(!state.activity.length){list.innerHTML=`<div class="activity"><div class="activity-dot"></div><b>No archive activity yet.</b></div>`;return;}
 list.innerHTML=state.activity.slice(0,30).map(a=>`<div class="activity"><div class="activity-dot" style="background:${a.glow};box-shadow:0 0 15px ${a.glow}"></div><div><b>${a.text}</b></div><span>${a.time}</span></div>`).join("");
}
function renderAll(){
 $("#credits").textContent=money(state.credits);
 const p=state.profile;
 $("#navName").textContent=p?.username||"GUEST"; $("#navAvatar").src=p?.avatar||DEFAULT_AVATAR;
 $("#currencyIcon").src=COIN_ICON;
 renderCrates(document.querySelector(".filter.active")?.dataset.filter||"all");renderInventory();renderActivity();
}
function showModal(id){$("#"+id).classList.remove("hidden")}
function closeModal(id){$("#"+id).classList.add("hidden")}
$$("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));

function showContents(id){
 const c=crates.find(x=>x.id===id);
 $("#contentsEyebrow").textContent=`${c.tier.toUpperCase()} // CONTENTS`;
 $("#contentsTitle").textContent=c.name;
 $("#contentsList").innerHTML=c.pool.map(x=>{const t=title(x);return `<div class="odds-row"><b style="color:${t.glow}">${t.name}</b><span>${t.rarity}</span><strong>${t.chance}%</strong></div>`}).join("");
 showModal("contentsModal");
}
window.showContents=showContents;

function openCrate(id){
 if(rolling)return;
 const c=crates.find(x=>x.id===id);
 if(state.credits<c.cost){alert("Not enough virtual credits.");return;}
 state.credits-=c.cost; currentCrate=c; pendingTitle=weightedPick(c.pool); save();
 startRoll(c,pendingTitle);
}
window.openCrate=openCrate;

function startRoll(c,winner){
 rolling=true; $("#rollCrateName").textContent=c.name; $("#rollStatus").textContent="ROLLING ARCHIVE...";
 $("#rollResult").classList.add("hidden"); $("#skipRoll").classList.remove("hidden"); showModal("rollModal");
 const fake=Array.from({length:31},()=>title(c.pool[Math.floor(Math.random()*c.pool.length)]));
 fake[24]=winner;
 $("#rollTrack").innerHTML=fake.map(t=>`<div class="roll-tile" style="--glow:${t.glow}">${t.name}<small>${t.rarity}</small></div>`).join("");
 const track=$("#rollTrack"); track.style.transition="none"; track.style.transform="translateX(0)";
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const tile=track.children[0].getBoundingClientRect().width+8;
   const target=(tile*24)-(window.innerWidth<650?65:80);
   track.style.transition="transform 5.8s cubic-bezier(.08,.78,.12,1)";
   track.style.transform=`translateX(-${target}px)`;
 }));
 clearTimeout(rollTimer); rollTimer=setTimeout(()=>finishRoll(winner),6100);
}
function finishRoll(t){
 if(!rolling)return; rolling=false;clearTimeout(rollTimer);$("#skipRoll").classList.add("hidden");
 state.inventory[t.id]=(state.inventory[t.id]||0)+1;
 state.activity.unshift({text:`Unlocked "${t.name}" • ${t.rarity}`,glow:t.glow,time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})});
 save();
 $("#rollStatus").textContent="ARCHIVE LOCKED";
 $("#resultGlow").style.setProperty("--resultGlow",t.glow);$("#rollResult").style.setProperty("--resultGlow",t.glow);
 $("#resultTitle").textContent=t.name;$("#resultRarity").textContent=t.rarity+" • "+t.chance+"% base chance";$("#resultEffect").textContent=t.effect;
 $("#rollResult").classList.remove("hidden");
}
$("#skipRoll").onclick=()=>finishRoll(pendingTitle);
$("#closeResult").onclick=()=>closeModal("rollModal");
$("#openBackpack").onclick=()=>{closeModal("rollModal");switchPage("inventory")};

function switchPage(page){
 $$(".page").forEach(x=>x.classList.remove("active"));$("#"+page+"Page").classList.add("active");
 $$(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
}
$$(".nav-btn").forEach(b=>b.onclick=()=>switchPage(b.dataset.page));
$$(".filter").forEach(b=>b.onclick=()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderCrates(b.dataset.filter)});

function readImage(input,img){
 const f=input.files?.[0];if(!f)return;
 if(f.size>4*1024*1024){alert("Please use an image under 4 MB.");input.value="";return;}
 const r=new FileReader();r.onload=()=>img.src=r.result;r.readAsDataURL(f);
}
$("#avatarInput").onchange=()=>readImage($("#avatarInput"),$("#avatarPreview"));
$("#bannerInput").onchange=()=>readImage($("#bannerInput"),$("#bannerPreview"));

$("#openSignup").onclick=()=>{showModal("signupModal");$("#signupStep1").classList.remove("hidden");$("#signupStep2").classList.add("hidden");$("#adminStep").classList.add("hidden")};
$("#continueJoin").onclick=()=>{
 const username=$("#usernameInput").value.trim();
 if(!username){alert("Enter a username first.");return;}
 $("#signupStep1").classList.add("hidden");$("#signupStep2").classList.remove("hidden");
};
$$("[data-access]").forEach(b=>b.onclick=()=>{
 const access=b.dataset.access;
 if(access==="administrative"){$("#signupStep2").classList.add("hidden");$("#adminStep").classList.remove("hidden");return;}
 completeProfile(access);
});
$("#verifyAdmin").onclick=()=>{
 const code=$("#adminCode").value.trim();
 if(code!=="SSML-ADMIN"){ $("#adminError").textContent="Invalid proof code.";return;}
 completeProfile("administrative");
};
function completeProfile(access){
 const username=$("#usernameInput").value.trim();
 const avatar=$("#avatarPreview").src||DEFAULT_AVATAR,banner=$("#bannerPreview").src||DEFAULT_BANNER,bio=$("#bioInput").value.trim()||"No bio yet.";
 state.profile={username,avatar,banner,bio,access,title:access==="guest"?"Guest":access==="member"?"Member":"Administrative"};
 if(!state.inventory.guest)state.inventory.guest=1;
 state.activity.unshift({text:`${username} joined SSML as ${state.profile.title}`,glow:access==="guest"?"#5dff9b":"#9b6cff",time:"NOW"});
 closeModal("signupModal");$("#authGate").classList.add("hidden");save();
}
function openProfile(){
 const p=state.profile;if(!p)return;
 $("#profileBanner").style.backgroundImage=`url("${p.banner}")`;$("#profileAvatar").src=p.avatar;$("#profileName").textContent=p.username;
 $("#profileTitle").textContent=p.title;$("#profileTitle").style.borderColor=p.access==="guest"?"#5dff9b":"#9b6cff";$("#profileTitle").style.color=p.access==="guest"?"#5dff9b":"#9b6cff";
 $("#profileBio").textContent=p.bio;$("#profileOwned").textContent=Object.values(state.inventory).reduce((a,b)=>a+b,0);$("#profileCredits").textContent=money(state.credits);$("#profileAccess").textContent=p.access.toUpperCase();
 showModal("profileModal");
}
$("#profileBtn").onclick=openProfile;

function sellTitle(id){
 const t=title(id),count=state.inventory[id]||0;if(!count)return;
 const code=prompt(`SELL "${t.name}" for ${money(t.value)} virtual credits.\nEnter SELL-SSML to confirm:`);
 if(code!=="SELL-SSML"){if(code!==null)alert("Sale cancelled: incorrect code.");return;}
 state.inventory[id]--;if(state.inventory[id]<=0)delete state.inventory[id];state.credits+=t.value;
 state.activity.unshift({text:`Sold "${t.name}" for ${money(t.value)} credits`,glow:t.glow,time:"NOW"});save();
}
window.sellTitle=sellTitle;

if(!state.profile)$("#authGate").classList.remove("hidden"); else $("#authGate").classList.add("hidden");
renderAll();
