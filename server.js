const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple JSON file database - stored in project directory (free tier compatible)
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize DB file if doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], nextId: 1 }));
}

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: [], nextId: 1 };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Get all users (for admin panel)
app.get('/api/users', (req, res) => {
  try {
    const db = readDB();
    const users = db.users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new user
app.post('/api/users', (req, res) => {
  const { nom, prenom } = req.body;
  
  if (!nom || !prenom) {
    return res.status(400).json({ error: 'Nom et prénom requis' });
  }
  
  try {
    const db = readDB();
    const newUser = {
      id: db.nextId,
      nom,
      prenom,
      created_at: new Date().toISOString()
    };
    
    db.users.push(newUser);
    db.nextId++;
    writeDB(db);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const db = readDB();
    db.users = db.users.filter(u => u.id !== parseInt(id));
    writeDB(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    const db = readDB();
    const today = new Date().toISOString().split('T')[0];
    const todayCount = db.users.filter(u => u.created_at.startsWith(today)).length;
    
    res.json({
      total: db.users.length,
      today: todayCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
