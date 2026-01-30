const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], nextId: 1 }));
}

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { users: [], nextId: 1 }; }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function checkAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Non autorisé' });
  const token = auth.split(' ')[1];
  if (token === Buffer.from(ADMIN_PASSWORD).toString('base64')) next();
  else res.status(401).json({ error: 'Non autorisé' });
}

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: Buffer.from(ADMIN_PASSWORD).toString('base64') });
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
});

app.get('/api/users', checkAuth, (req, res) => {
  try {
    const db = readDB();
    res.json(db.users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', (req, res) => {
  const { nom, prenom } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis' });
  try {
    const db = readDB();
    const newUser = { id: db.nextId, nom, prenom, created_at: new Date().toISOString() };
    db.users.push(newUser);
    db.nextId++;
    writeDB(db);
    res.status(201).json(newUser);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:id', checkAuth, (req, res) => {
  try {
    const db = readDB();
    db.users = db.users.filter(u => u.id !== parseInt(req.params.id));
    writeDB(db);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stats', checkAuth, (req, res) => {
  try {
    const db = readDB();
    const today = new Date().toISOString().split('T')[0];
    res.json({ total: db.users.length, today: db.users.filter(u => u.created_at.startsWith(today)).length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
