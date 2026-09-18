const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT) || 10000;
const HOST = '0.0.0.0';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://soulmaterials.github.io';

app.use(express.json({ limit: '2mb' }));
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
    access: u.access || 'guest',
    credits: Number(u.credits || 25000),
    titleId: u.title_id || u.titleId || (u.access === 'guest' ? 'guest' : 'member'),
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
      avatar TEXT DEFAULT '',
      banner TEXT DEFAULT '',
      bio TEXT DEFAULT 'No bio yet.',
      access TEXT DEFAULT 'guest',
      credits BIGINT DEFAULT 25000,
      title_id TEXT DEFAULT 'guest',
      equipped_title_id TEXT,
      inventory JSONB DEFAULT '{}'::jsonb,
      following JSONB DEFAULT '[]'::jsonb,
      followers JSONB DEFAULT '[]'::jsonb,
      friends JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
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
      UPDATE users SET avatar=$2,banner=$3,bio=$4,access=$5,credits=$6,title_id=$7,equipped_title_id=$8,
      inventory=$9,following=$10,followers=$11,friends=$12 WHERE id=$1
    `, [u.id, u.avatar || '', u.banner || '', u.bio || 'No bio yet.', u.access || 'guest', Number(u.credits || 0),
      u.title_id || u.titleId || 'guest', u.equipped_title_id || u.equippedTitleId || null,
      JSON.stringify(u.inventory || {}), JSON.stringify(u.following || []), JSON.stringify(u.followers || []), JSON.stringify(u.friends || [])]);
  } else {
    memoryUsers.set(u.id, u);
  }
  return cleanUser(u);
}

async function listUsers(q) {
  if (pool) {
    const term = `%${q || ''}%`;
    const { rows } = await pool.query('SELECT * FROM users WHERE username ILIKE $1 ORDER BY created_at ASC LIMIT 100', [term]);
    return rows.map(cleanUser);
  }
  return [...memoryUsers.values()].filter(u => !q || u.username.toLowerCase().includes(q.toLowerCase())).slice(0, 100).map(cleanUser);
}

function newId() { return 'u_' + crypto.randomBytes(8).toString('hex'); }

app.get('/api/health', (_req, res) => res.json({ ok: true, database: !!pool }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, avatar, banner, bio, access = 'guest' } = req.body || {};
    const name = String(username || '').trim();
    if (name.length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters.' });
    if (String(password || '').length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (!['guest', 'member', 'administrative'].includes(access)) return res.status(400).json({ error: 'Invalid access type.' });
    if (await findByUsername(name)) return res.status(409).json({ error: 'That username already exists.' });

    const id = newId();
    const titleId = access === 'guest' ? 'guest' : 'member';
    const hash = await bcrypt.hash(String(password), 12);
    const user = {
      id, username: name, password_hash: hash, avatar: avatar || '', banner: banner || '', bio: bio || 'No bio yet.',
      access, credits: 25000, title_id: titleId, equipped_title_id: titleId,
      inventory: { [titleId]: 1 }, following: [], followers: [], friends: []
    };

    if (pool) {
      await pool.query(`INSERT INTO users
        (id,username,password_hash,avatar,banner,bio,access,credits,title_id,equipped_title_id,inventory,following,followers,friends)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [id,name,hash,user.avatar,user.banner,user.bio,access,25000,titleId,titleId,
          JSON.stringify(user.inventory),JSON.stringify([]),JSON.stringify([]),JSON.stringify([])]);
    } else memoryUsers.set(id, user);

    res.json({ user: cleanUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create the account.' });
  }
});

app.post('/api/auth/restore', async (req, res) => {
  try {
    const { username, password, avatar, banner, bio, access = 'guest', credits, inventory, following, followers, friends, titleId, equippedTitleId, legacyId } = req.body || {};
    const name = String(username || '').trim();
    if (name.length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters.' });
    if (String(password || '').length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    if (await findByUsername(name)) return res.status(409).json({ error: 'That username already exists.' });
    const id = String(legacyId || newId());
    const hash = await bcrypt.hash(String(password), 12);
    const user = {
      id, username: name, password_hash: hash, avatar: avatar || '', banner: banner || '', bio: bio || 'No bio yet.',
      access: ['guest','member','administrative'].includes(access) ? access : 'guest',
      credits: Number.isFinite(Number(credits)) ? Math.max(0, Math.floor(Number(credits))) : 25000,
      title_id: titleId || 'guest', equipped_title_id: equippedTitleId || titleId || 'guest',
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const user = await findByUsername(username);
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect password.' });
    res.json({ user: cleanUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not sign in.' });
  }
});

app.get('/api/users', async (req, res) => {
  try { res.json({ users: await listUsers(String(req.query.q || '').trim()) }); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Could not load users.' }); }
});

app.get('/api/users/:id', async (req, res) => {
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
  try {
    const admin = await findById(String(req.body?.adminId || ''));
    const target = await findById(String(req.body?.targetId || ''));
    const amount = Number(req.body?.amount);
    if (!admin || admin.access !== 'administrative') return res.status(403).json({ error: 'Administrative access required.' });
    if (!target || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Choose a valid user and positive amount.' });
    const n = Math.floor(amount);
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
