# Admin Panel

Application web simple avec:
- **Page utilisateur** (`/`) - Formulaire d'inscription nom/prénom
- **Panel admin** (`/admin`) - Visualisation et gestion des utilisateurs

## Stack

- Backend: Node.js + Express
- Frontend: HTML/CSS/JS vanilla
- Storage: JSON file (persistant sur Render avec disk)

## Déploiement sur Render

### Option 1: Via GitHub (recommandé)

1. Push ce projet sur un repo GitHub
2. Va sur [render.com](https://render.com) et connecte-toi
3. Click "New" → "Web Service"
4. Connecte ton repo GitHub
5. Render détectera automatiquement la config via `render.yaml`
6. Click "Create Web Service"

### Option 2: Déploiement manuel

1. Va sur [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Choisis "Build and deploy from a Git repository" ou upload le code
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variable**: `DATA_DIR=/data`
5. Ajoute un **Disk** (important pour la persistance):
   - Mount Path: `/data`
   - Size: 1 GB
6. Deploy!

## Développement local

```bash
npm install
npm start
```

Le serveur démarre sur http://localhost:3000

## Endpoints API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Liste tous les utilisateurs |
| POST | `/api/users` | Ajoute un utilisateur `{nom, prenom}` |
| DELETE | `/api/users/:id` | Supprime un utilisateur |
| GET | `/api/stats` | Stats (total, aujourd'hui) |

## Structure

```
admin-panel/
├── server.js          # Serveur Express + API
├── package.json       # Dépendances
├── render.yaml        # Config Render
├── public/
│   ├── index.html     # Page inscription
│   └── admin.html     # Panel admin
└── data/
    └── users.json     # Base de données (auto-créé)
```
