// SSML crate configuration. Edit name, tier, cost, accent, description, and pool here.
let SSML_CRATES = [
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

SSML_CRATES.push(...[
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
].map(([id,name,tier,cost,desc,accent,pool])=>({id,name,tier,cost,desc,accent,pool})));


window.SSML_CRATES = SSML_CRATES;
