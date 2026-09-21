const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT) || 10000;
const HOST = '0.0.0.0';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://soulmaterials.github.io';
const FIXED_PASSWORD = process.env.SSML_ACCOUNT_PASSWORD || 'Drool56';
const ADMIN_CODE = process.env.SSML_ADMIN_CODE || 'SSML-ADMIN';
const STARTING_CREDITS = 999000;

app.use(express.json({ limit: '12mb' }));
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const allowed = !origin || origin === FRONTEND_URL || origin === 'https://soulmaterials.github.io' || origin === 'https://soulmaterials-1.onrender.com';
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || FRONTEND_URL);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, max: 5, ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } })
  : null;

const memoryUsers = new Map();

function cleanUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    avatar: u.avatar || '',
    banner: u.banner || '',
    bio: u.bio || 'No bio yet.',
    access: u.access === 'administrative' ? 'administrative' : 'member',
    banned: !!u.banned,
    credits: Number(u.credits ?? STARTING_CREDITS),
    titleId: u.title_id || u.titleId || (u.access === 'administrative' ? 'administrative' : 'drool56'),
    equippedTitleId: u.equipped_title_id || u.equippedTitleId || null,
    inventory: typeof u.inventory === 'string' ? JSON.parse(u.inventory || '{}') : (u.inventory || {}),
    following: typeof u.following === 'string' ? JSON.parse(u.following || '[]') : (u.following || []),
    followers: typeof u.followers === 'string' ? JSON.parse(u.followers || '[]') : (u.followers || []),
    friends: typeof u.friends === 'string' ? JSON.parse(u.friends || '[]') : (u.friends || [])
  };
}

function safeJson(v, fallback) {
  try { return JSON.parse(v); } catch (_) { return fallback; }
}

async function initDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      banned BOOLEAN DEFAULT FALSE,
      avatar TEXT DEFAULT '',
      banner TEXT DEFAULT '',
      bio TEXT DEFAULT 'No bio yet.',
      access TEXT DEFAULT 'member',
      credits BIGINT DEFAULT 999000,
      title_id TEXT DEFAULT 'drool56',
      equipped_title_id TEXT,
      inventory JSONB DEFAULT '{}'::jsonb,
      following JSONB DEFAULT '[]'::jsonb,
      followers JSONB DEFAULT '[]'::jsonb,
      friends JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Keep older Render databases compatible with the new account/ban model.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE users ALTER COLUMN access SET DEFAULT 'member'`);
  await pool.query(`ALTER TABLE users ALTER COLUMN credits SET DEFAULT 999000`);
  await pool.query(`ALTER TABLE users ALTER COLUMN title_id SET DEFAULT 'drool56'`);

  // ONE-TIME ACCOUNT RESET for this fresh SSML launch.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ssml_system_flags (
      flag TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  const resetFlag = 'fresh_start_2026_09_21_v2';
  const existing = await pool.query('SELECT 1 FROM ssml_system_flags WHERE flag=$1 LIMIT 1', [resetFlag]);
  if (!existing.rowCount) {
    await pool.query('DELETE FROM users');
    await pool.query('INSERT INTO ssml_system_flags(flag) VALUES($1) ON CONFLICT (flag) DO NOTHING', [resetFlag]);
    console.log('[SSML] Old accounts cleared once for the fresh start.');
  }
}

async function findByUsername(username) {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(username)=LOWER($1) LIMIT 1', [username]);
    return rows[0] || null;
  }
  return [...memoryUsers.values()].find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

async function findById(id) {
  if (pool) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1 LIMIT 1', [id]);
    return rows[0] || null;
  }
  return memoryUsers.get(id) || null;
}

async function saveUser(u) {
  if (pool) {
    await pool.query(`
      UPDATE users SET avatar=$2,banner=$3,bio=$4,access=$5,banned=$6,credits=$7,title_id=$8,equipped_title_id=$9,
      inventory=$10,following=$11,followers=$12,friends=$13 WHERE id=$1
    `, [u.id, u.avatar || '', u.banner || '', u.bio || 'No bio yet.', u.access === 'administrative' ? 'administrative' : 'member', !!u.banned, Number(u.credits ?? STARTING_CREDITS),
      u.title_id || u.titleId || (u.access === 'administrative' ? 'administrative' : 'drool56'), u.equipped_title_id || u.equippedTitleId || null,
      JSON.stringify(u.inventory || {}), JSON.stringify(u.following || []), JSON.stringify(u.followers || []), JSON.stringify(u.friends || [])]);
  } else {
    memoryUsers.set(u.id, u);
  }
  return cleanUser(u);
}

async function listUsers(q, includeBanned=false) {
  if (pool) {
    const term = `%${q || ''}%`;
    const { rows } = await pool.query(`SELECT * FROM users WHERE username ILIKE $1 ${includeBanned ? '' : 'AND banned=FALSE'} ORDER BY created_at ASC LIMIT 100`, [term]);
    return rows.map(cleanUser);
  }
  return [...memoryUsers.values()].filter(u => (includeBanned || !u.banned) && (!q || u.username.toLowerCase().includes(q.toLowerCase()))).slice(0, 100).map(cleanUser);
}

function newId() { return 'u_' + crypto.randomBytes(8).toString('hex'); }

app.get('/api/health', (_req, res) => res.json({ ok: true, database: !!pool }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, avatar, banner, bio, access = 'member', adminCode = '' } = req.body || {};
    const name = String(username || '').trim();
    if (name.length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters.' });
    const accessType = access === 'administrative' ? 'administrative' : 'member';
    if (accessType === 'administrative' && String(adminCode) !== ADMIN_CODE) return res.status(403).json({ error: 'Administrative proof required.' });
    if (await findByUsername(name)) return res.status(409).json({ error: 'That username already exists.' });
    const id = newId();
    const hash = await bcrypt.hash(FIXED_PASSWORD, 12);
    const titleId = accessType === 'administrative' ? 'administrative' : 'drool56';
    const inventory = { drool56: 1 };
    if (accessType === 'administrative') inventory.administrative = 1;
    const user = { id, username:name, password_hash:hash, avatar:avatar||'', banner:banner||'', bio:bio||'No bio yet.', access:accessType, banned:false, credits:STARTING_CREDITS, title_id:titleId, equipped_title_id:titleId, inventory, following:[], followers:[], friends:[] };
    if(pool){
      await pool.query(`INSERT INTO users (id,username,password_hash,avatar,banner,bio,access,banned,credits,title_id,equipped_title_id,inventory,following,followers,friends) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, [id,name,hash,user.avatar,user.banner,user.bio,user.access,false,STARTING_CREDITS,titleId,titleId,JSON.stringify(inventory),'[]','[]','[]']);
    } else memoryUsers.set(id,user);
    res.json({user:cleanUser(user)});
  } catch(e){ console.error(e); res.status(500).json({error:'Could not create the account.'}); }
});

app.post('/api/auth/restore', async (req, res) => {
  try {
    const { username, password, avatar, banner, bio, access = 'member', credits, inventory, following, followers, friends, titleId, equippedTitleId, legacyId } = req.body || {};
    const name = String(username || '').trim();
    if (name.length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters.' });
    if (String(password || '').length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (await findByUsername(name)) return res.status(409).json({ error: 'That username already exists.' });
    const id = String(legacyId || newId());
    const hash = await bcrypt.hash(String(password), 12);
    const user = {
      id, username: name, password_hash: hash, avatar: avatar || '', banner: banner || '', bio: bio || 'No bio yet.',
      access: access === 'administrative' ? 'administrative' : 'member',
      banned: false,
      credits: Number.isFinite(Number(credits)) ? Math.max(0, Math.floor(Number(credits))) : STARTING_CREDITS,
      title_id: titleId || 'drool56', equipped_title_id: equippedTitleId || titleId || 'guest',
      inventory: inventory && typeof inventory === 'object' ? inventory : {},
      following: Array.isArray(following) ? following : [], followers: Array.isArray(followers) ? followers : [], friends: Array.isArray(friends) ? friends : []
    };
    if (pool) {
      await pool.query(`INSERT INTO users
        (id,username,password_hash,avatar,banner,bio,access,credits,title_id,equipped_title_id,inventory,following,followers,friends)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [id,name,hash,user.avatar,user.banner,user.bio,user.access,user.credits,user.title_id,user.equipped_title_id,
          JSON.stringify(user.inventory),JSON.stringify(user.following),JSON.stringify(user.followers),JSON.stringify(user.friends)]);
    } else memoryUsers.set(id, user);
    res.json({ user: cleanUser(user), restored: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not restore the account.' });
  }
});

app.post('/api/auth/login', async (req,res)=>{
  try{
    const username=String(req.body?.username||'').trim();
    if(!username)return res.status(400).json({error:'Username required.'});
    const user=await findByUsername(username);
    if(!user)return res.status(404).json({error:'Account not found.'});
    if(user.banned)return res.status(403).json({error:'Account is banned.'});
    res.json({user:cleanUser(user)});
  }catch(e){console.error(e);res.status(500).json({error:'Could not sign in.'});}
});

app.get('/api/users', async (req, res) => {
  res.setHeader('Cache-Control','no-store');
  try { res.json({ users: await listUsers(String(req.query.q || '').trim(), String(req.query.admin || '') === '1') }); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Could not load users.' }); }
});

app.get('/api/users/:id', async (req, res) => {
  res.setHeader('Cache-Control','no-store');
  try {
    const u = await findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: cleanUser(u) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not load profile.' }); }
});

app.post('/api/users/:id/follow', async (req, res) => {
  try {
    const me = await findById(String(req.body?.userId || ''));
    const target = await findById(req.params.id);
    if (!me || !target || me.id === target.id) return res.status(400).json({ error: 'Invalid user.' });
    me.following = safeJson(me.following, me.following || []); target.followers = safeJson(target.followers, target.followers || []);
    const i = me.following.indexOf(target.id);
    if (i >= 0) { me.following.splice(i,1); target.followers = target.followers.filter(id => id !== me.id); }
    else { me.following.push(target.id); if (!target.followers.includes(me.id)) target.followers.push(me.id); }
    await saveUser(me); await saveUser(target);
    res.json({ me: cleanUser(me), target: cleanUser(target) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not update follow.' }); }
});

app.post('/api/users/:id/friend', async (req, res) => {
  try {
    const me = await findById(String(req.body?.userId || ''));
    const target = await findById(req.params.id);
    if (!me || !target || me.id === target.id) return res.status(400).json({ error: 'Invalid user.' });
    me.friends = safeJson(me.friends, me.friends || []); target.friends = safeJson(target.friends, target.friends || []);
    const i = me.friends.indexOf(target.id);
    if (i >= 0) { me.friends.splice(i,1); target.friends = target.friends.filter(id => id !== me.id); }
    else { me.friends.push(target.id); if (!target.friends.includes(me.id)) target.friends.push(me.id); }
    await saveUser(me); await saveUser(target);
    res.json({ me: cleanUser(me), target: cleanUser(target) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not update friendship.' }); }
});

app.post('/api/admin/gift', async (req, res) => {
  res.setHeader('Cache-Control','no-store');
  try {
    const admin = await findById(String(req.body?.adminId || ''));
    const targetId = String(req.body?.targetId || '');
    const amount = Number(req.body?.amount);
    if (!admin || admin.access !== 'administrative') return res.status(403).json({ error: 'Administrative access required.' });
    if (!targetId || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Choose a valid user and positive amount.' });
    const n = Math.floor(amount);

    // Use PostgreSQL arithmetic instead of reading/modifying/writing a stale JS value.
    // This makes gifts reliable even when multiple users are online at once.
    if (pool) {
      const { rows } = await pool.query(
        'UPDATE users SET credits = credits + $1 WHERE id = $2 AND banned = FALSE RETURNING *',
        [n, targetId]
      );
      if (!rows[0]) return res.status(404).json({ error: 'Target account was not found or is banned.' });
      const target = rows[0];
      const freshAdmin = await findById(admin.id);
      return res.json({ admin: cleanUser(freshAdmin), target: cleanUser(target), gifted: n });
    }

    const target = await findById(targetId);
    if (!target || target.banned) return res.status(404).json({ error: 'Target account was not found or is banned.' });
    target.credits = Number(target.credits || 0) + n;
    await saveUser(target);
    res.json({ admin: cleanUser(admin), target: cleanUser(target), gifted: n });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not gift credits.' }); }
});

app.post('/api/admin/set-credits', async (req, res) => {
  try {
    const admin = await findById(String(req.body?.adminId || ''));
    const target = await findById(String(req.body?.targetId || ''));
    const amount = Number(req.body?.amount);
    if (!admin || admin.access !== 'administrative') return res.status(403).json({ error: 'Administrative access required.' });
    if (!target || !Number.isFinite(amount) || amount < 0) return res.status(400).json({ error: 'Choose a valid user and non-negative amount.' });
    target.credits = Math.floor(amount);
    await saveUser(target);
    res.json({ admin: cleanUser(admin), target: cleanUser(target) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not set credits.' }); }
});

app.post('/api/admin/ban', async (req,res)=>{
  try{
    const admin=await findById(String(req.body?.adminId||''));
    const target=await findById(String(req.body?.targetId||''));
    const banned=!!req.body?.banned;
    if(!admin||admin.access!=='administrative')return res.status(403).json({error:'Administrative access required.'});
    if(!target)return res.status(404).json({error:'User not found.'});
    if(target.id===admin.id)return res.status(400).json({error:'You cannot ban your own administrative account.'});
    target.banned=banned; await saveUser(target);
    res.json({target:cleanUser(target)});
  }catch(e){console.error(e);res.status(500).json({error:'Could not update account ban.'});}
});

app.post('/api/users/:id/archive', async (req, res) => {
  try {
    const user = await findById(req.params.id);
    if (!user || String(req.body?.requesterId || '') !== user.id) return res.status(403).json({ error: 'Not allowed.' });
    if (req.body.credits !== undefined) {
      const credits = Number(req.body.credits);
      if (!Number.isFinite(credits) || credits < 0) return res.status(400).json({ error: 'Invalid credits.' });
      user.credits = Math.floor(credits);
    }
    if (req.body.inventory && typeof req.body.inventory === 'object') user.inventory = req.body.inventory;
    await saveUser(user);
    res.json({ user: cleanUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save archive data.' }); }
});

app.post('/api/users/:id/sell', async (req, res) => {
  res.setHeader('Cache-Control','no-store');
  try {
    const user = await findById(req.params.id);
    const roleId = String(req.body?.roleId || '');
    const quantity = Math.floor(Number(req.body?.quantity));
    if (!user || String(req.body?.requesterId || '') !== user.id) return res.status(403).json({ error: 'Not allowed.' });
    if (!roleId || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ error: 'Choose a valid quantity.' });
    const inventory = typeof user.inventory === 'string' ? safeJson(user.inventory, {}) : (user.inventory || {});
    const owned = Number(inventory[roleId] || 0);
    if (quantity > owned) return res.status(400).json({ error: 'Not enough copies.' });
    // The client supplies title values for display, but the server needs the same archive data.
    // The actual unit value is supplied by the request and validated as a non-negative integer.
    const unitValue = Math.floor(Number(req.body?.unitValue));
    if (!Number.isFinite(unitValue) || unitValue < 0) return res.status(400).json({ error: 'Invalid title value.' });
    const total = unitValue * quantity;
    inventory[roleId] = owned - quantity;
    if (inventory[roleId] <= 0) delete inventory[roleId];
    user.inventory = inventory;
    user.credits = Number(user.credits || 0) + total;
    await saveUser(user);
    res.json({ user: cleanUser(user), sold: quantity, total });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not complete the sale.' }); }
});

app.post('/api/users/:id/profile', async (req, res) => {
  try {
    const user = await findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (String(req.body?.requesterId || '') !== user.id) return res.status(403).json({ error: 'Not allowed.' });
    if (typeof req.body.equippedTitleId === 'string' || req.body.equippedTitleId === null) {
      user.equipped_title_id = req.body.equippedTitleId;
    }
    if (typeof req.body.avatar === 'string') user.avatar = req.body.avatar;
    if (typeof req.body.banner === 'string') user.banner = req.body.banner;
    if (typeof req.body.bio === 'string') user.bio = req.body.bio.slice(0, 180);
    await saveUser(user);
    res.json({ user: cleanUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not update profile.' }); }
});

app.get('/api/config', (_req, res) => res.json({ shared: !!pool, note: pool ? 'PostgreSQL enabled.' : 'Temporary memory mode: add DATABASE_URL for persistent shared data.' }));

app.use(express.static(__dirname, { extensions: ['html'] }));
app.use((req, res, next) => { if (req.method === 'GET' && !req.path.startsWith('/api/')) return res.sendFile(path.join(__dirname, 'index.html')); next(); });

initDb().then(() => {
  app.listen(PORT, HOST, () => console.log(`SSML Rare Archive listening on ${HOST}:${PORT} database=${!!pool}`));
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
