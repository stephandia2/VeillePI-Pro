# VeillePI Pro - Phase 1 MVP

Application de Veille Média & Génération de Contenu LinkedIn pour EABPA.

## ✅ Setup Terminé

### 1. Structure du projet
```
app/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── veille/
│   │           └── route.ts      # API Brave Search + DB
│   └── lib/                       # Utilitaires
├── prisma/
│   └── schema.prisma             # Modèles complets (PRD v1.2)
├── scripts/
│   └── test-veille.sh            # Script de test
└── .env                          # Variables d'environnement
```

### 2. Modèles Prisma configurés
- ✅ `User` - Utilisateur (single-user mode: Nihel)
- ✅ `Article` - Articles de veille avec scoring de pertinence
- ✅ `Tag` - Tags pour catégorisation
- ✅ `Post` - Posts LinkedIn générés
- ✅ `Archive` - Archivage complet des articles
- ✅ `SearchConfig` - Configuration de veille

### 3. API Route `/api/veille`

#### GET `/api/veille`
Récupère les articles récents.

**Query params:**
- `limit` (number, default: 20) - Nombre d'articles
- `category` (string) - Filtre par catégorie
- `language` (string) - Filtre par langue

**Exemple:**
```bash
curl http://localhost:3000/api/veille?limit=5&category=saisie
```

#### POST `/api/veille`
Lance une veille manuelle via Brave Search API.

**Body:**
```json
{
  "keywords": ["contrefaçon", "saisie douane"],
  "maxResults": 5
}
```

**Features:**
- ✅ Rate limiting: 2 secondes entre chaque requête
- ✅ Déduplication par URL
- ✅ Détection auto de la catégorie (saisie, brevet, marque, judiciaire...)
- ✅ Extraction de mots-clés
- ✅ Détection de langue (fr/en/es)
- ✅ Sauvegarde en base de données

## ⚙️ Configuration Requise

### Variables d'environnement (.env)

```bash
# Database (Supabase) - REQUIS
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Brave Search API - REQUIS pour la veille
BRAVE_API_KEY="votre-cle-api-brave"
# Gratuit: 2000 requêtes/mois
# https://api.search.brave.com/app/dashboard

# Kimi API (Moonshot AI) - Pour Phase 2
KIMI_API_KEY=""

# LinkedIn OAuth - Pour Phase 3
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""

# Google Drive API - Pour Phase 4
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Configuration utilisateur
USER_EMAIL="nihel@eabpa.fr"
USER_NAME="Nihel Ben Ali"
```

## 🚀 Démarrage

```bash
# 1. Installer les dépendances
cd ~/clawd/VeillePI/app
npm install

# 2. Configurer les variables d'environnement
# Éditer .env avec vos clés API

# 3. Migrer la base de données
npx prisma migrate dev --name init

# 4. Démarrer le serveur
npm run dev
```

## 🧪 Tests

```bash
# Script de test complet
./scripts/test-veille.sh

# Test manuel GET
curl http://localhost:3000/api/veille?limit=5

# Test manuel POST (veille)
curl -X POST http://localhost:3000/api/veille \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["contrefaçon"], "maxResults": 3}'
```

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS 14 + TYPESCRIPT                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Dashboard)  │  API Routes  │  Prisma ORM        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────▼─────┐       ┌─────▼─────┐
              │ Supabase  │       │  Brave    │
              │PostgreSQL │       │  Search   │
              └───────────┘       └───────────┘
```

## 📝 Mots-clés de veille par défaut

```javascript
[
  'contrefaçon',
  'saisie douane contrefaçon',
  'brevet propriété intellectuelle',
  'marque contrefaçon',
  'contrefaçon produits',
  'customs seizure counterfeit',
  'intellectual property infringement',
  'ompic maroc contrefaçon',
  'douane maroc saisie',
  'euipo counterfeit',
  'wipo counterfeiting'
]
```

## 🔒 Sécurité & Rate Limiting

- **Brave Search**: 2000 requêtes/mois gratuit
- **Délai entre requêtes**: 2 secondes minimum
- **Déduplication**: Les articles sont vérifiés par URL avant sauvegarde

## 📋 Prochaines étapes (Phase 2)

1. **Intégration Kimi API**
   - Génération de résumés intelligents
   - Scoring de pertinence (0-100)
   - Génération de posts LinkedIn

2. **Dashboard Frontend**
   - Liste des articles avec filtres
   - Prévisualisation des posts
   - Interface de validation

3. **LinkedIn OAuth**
   - Connexion compte LinkedIn
   - Publication directe
   - Planification des posts

## 💰 Coûts estimés

| Service | Coût mensuel |
|---------|--------------|
| Brave Search API | Gratuit (2000 req/mois) |
| Kimi K2.5 API | ~$1-2/mois |
| Supabase | Gratuit (jusqu'à limites) |
| Coolify + VPS | ~5€/mois |
| **Total** | **~6-7€/mois** |

---

*Setup complété le 12 février 2026 - Phase 1 MVP*
