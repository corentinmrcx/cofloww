# CoFloww

Application de gestion de finances personnelles — self-hostée, multi-wallets, multi-devises.

## Fonctionnalités

- **Dashboard** — vue synthétique mensuelle : solde net, revenus, dépenses, taux d'épargne, wallets, budgets en cours, transactions récentes
- **Transactions** — income / dépense / virement, catégories, tags, notes, statuts (en attente / pointée / rapprochée), pagination, actions groupées, import CSV, export CSV
- **Wallets** — plusieurs comptes, réordonnables par glisser-déposer, historique de solde
- **Budgets** — budgets mensuels ou annuels par catégorie, seuil d'alerte configurable, barre de progression
- **Virements récurrents** — règles quotidiennes / hebdomadaires / mensuelles / annuelles, activation / désactivation à la volée
- **Statistiques** — évolution du solde, revenus vs dépenses sur 12 mois, répartition par catégorie (donut)
- **Investissements** — allocation cible par wallet en %, calcul automatique de la répartition à effectuer
- **Notifications** — alertes budget, confirmation d'import
- **Paramètres** — profil, avatar, devise, format de date, fuseau horaire, langue (fr / en), thème clair / sombre
- **Compte** — export JSON de toutes les données, suppression du compte

Chaque utilisateur est isolé — aucune donnée n'est partagée entre comptes.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 · Vite 5 · TypeScript strict · TailwindCSS v4 · shadcn/ui |
| État serveur | TanStack Query v5 |
| État UI | Zustand |
| Formulaires | React Hook Form · Zod |
| Routing | React Router v6 |
| Graphiques | Recharts |
| Drag & Drop | dnd-kit |
| Backend | Laravel 11 · PHP 8.3 |
| Auth | Laravel Sanctum (cookie SPA) |
| Base de données | PostgreSQL 16 |
| Reverse proxy (prod) | nginx (Alpine) |
| Conteneurs | Docker · Docker Compose |

---

## Structure du projet

```
cofloww/
├── api/                     # Laravel 11 — API RESTful /api/v1
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   ├── routes/api.php
│   ├── Dockerfile           # target: dev | prod
│   └── .env.prod.example
├── web/                     # React + Vite
│   ├── src/
│   │   ├── components/      # composants génériques
│   │   ├── features/        # modules métier (budget, wallet, transactions…)
│   │   ├── views/           # pages (1 fichier = 1 route)
│   │   ├── hooks/
│   │   ├── stores/          # Zustand
│   │   ├── services/        # axios
│   │   └── lib/             # utils, formatters
│   ├── Dockerfile           # target: dev | build | prod
│   └── nginx.conf
├── docker-compose.yml       # développement local
├── docker-compose.prod.yml  # production
└── deploy.sh                # script de déploiement
```

---

## Démarrage en développement

### Prérequis

- Docker + Docker Compose

### Lancer l'environnement

```bash
git clone https://github.com/ton-compte/cofloww.git
cd cofloww

# Copier et configurer le .env de l'API
cp api/.env.example api/.env
# Éditer api/.env si nécessaire (les valeurs par défaut fonctionnent en dev)

# Démarrer tous les services
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

### Premières migrations

```bash
docker compose exec api php artisan migrate
```

### Commandes utiles

```bash
# Logs en temps réel
docker compose logs -f

# Accéder au conteneur API
docker compose exec api bash

# Lancer les tests
docker compose exec api php artisan test

# Tinker (REPL Laravel)
docker compose exec api php artisan tinker

# Installer un package npm
docker compose exec web npm install <package>
```

---

## Déploiement en production

### Setup initial sur le serveur (une seule fois)

```bash
# 1. Cloner le projet
git clone https://github.com/ton-compte/cofloww.git /opt/cofloww
cd /opt/cofloww

# 2. Créer le .env de production
cp api/.env.prod.example api/.env
nano api/.env   # renseigner APP_KEY, DB_PASSWORD, APP_URL, SESSION_DOMAIN

# Générer la clé applicative
docker compose -f docker-compose.prod.yml run --rm api php artisan key:generate --show
# Coller la valeur obtenue dans APP_KEY du .env

# 3. Premier déploiement
chmod +x deploy.sh
./deploy.sh
```

### Déploiements suivants

Depuis le serveur, après chaque `git push` :

```bash
./deploy.sh
```

Le script fait automatiquement :
1. `git pull origin main`
2. Build des images Docker
3. Démarrage de la base de données
4. `php artisan migrate --force`
5. Redémarrage de tous les services
6. Nettoyage des images obsolètes

### Variables d'environnement requises en production

Voir [`api/.env.prod.example`](api/.env.prod.example) pour la liste complète.

Les variables à absolument renseigner :

| Variable | Description |
|----------|-------------|
| `APP_KEY` | Clé de chiffrement Laravel (`php artisan key:generate --show`) |
| `APP_URL` | URL publique de l'API (`https://ton-domaine.com`) |
| `DB_PASSWORD` | Mot de passe PostgreSQL (fort) |
| `SESSION_DOMAIN` | Domaine pour les cookies Sanctum |
| `SANCTUM_STATEFUL_DOMAINS` | Même valeur que `SESSION_DOMAIN` |
| `FRONTEND_URL` | URL publique du frontend |

---

## API — Endpoints principaux

Tous les endpoints sont préfixés `/api/v1` et requièrent l'authentification Sanctum.

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/dashboard` | Données du dashboard |
| `GET/POST/PATCH/DELETE` | `/api/v1/wallets` | CRUD wallets |
| `GET/POST/PATCH/DELETE` | `/api/v1/transactions` | CRUD transactions |
| `POST` | `/api/v1/transactions/import` | Prévisualisation import CSV |
| `POST` | `/api/v1/transactions/import/confirm` | Import CSV confirmé |
| `GET` | `/api/v1/transactions/export` | Export CSV |
| `POST` | `/api/v1/transactions/bulk-delete` | Suppression groupée |
| `GET/POST/PATCH/DELETE` | `/api/v1/budgets` | CRUD budgets |
| `GET/POST/PATCH/DELETE` | `/api/v1/recurring-rules` | CRUD règles récurrentes |
| `GET/POST/PATCH/DELETE` | `/api/v1/categories` | CRUD catégories |
| `GET/POST/DELETE` | `/api/v1/tags` | CRUD tags |
| `GET` | `/api/v1/stats/overview` | Résumé financier global |
| `GET` | `/api/v1/stats/income-vs-expenses` | Revenus vs dépenses mensuels |
| `GET` | `/api/v1/stats/expenses-by-category` | Répartition par catégorie |
| `GET` | `/api/v1/investments/compute` | Calcul allocation investissements |
| `GET` | `/api/v1/account/export` | Export JSON des données utilisateur |

---

## Licence

MIT — libre d'utilisation, modification et distribution.
