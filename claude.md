#  CoFloww
Application web de gestion budgétaire et patrimoniale personnelle, conçue pour être extensible en SaaS.

## Stack
- **Frontend** : `apps/web` — React + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend** : `apps/api` — Laravel — API RESTful 
- **BDD** : PostgreSQL
- **Auth** : Laravel Breeze (API) + Sanctum (cookies SPA)
- **Infra** : Docker Compose — VPS (Prévoir un docker pour environnement de production. En ce qui concerne docker, il faut que je puisse lancer tout du projet en faisant un docker compose up.)

## Ce que fait l'app
- Enregistrer toutes ses transactions (dépenses & revenus) avec catégorisation
- Gérer plusieurs portefeuilles (compte courant, PEA, CTO, crypto, épargne, tirelire…)
- Suivre des budgets par catégorie avec alertes de dépassement
- Répartir son épargne entre des poches d'investissement (en %)
- Automatiser des règles : tag auto selon mot-clé, alerte si budget dépassé
- Visualiser des stats : revenus vs dépenses, répartition, évolution du patrimoine

## Conventions
- Toute la logique métier dans `app/Services/` — contrôleurs fins
- Global Scope Eloquent sur tous les models : isolation des données par `user_id`
- TypeScript strict — pas de `any`

## Ce que je construis moi-même
J'écris le code. Tu m'aides si je te le demande : déboguer, suggérer une approche,
expliquer un concept, ou générer un bout de code précis. Ne prends pas d'initiative au-delà de ce que je te demande. 
Par contre, si tu sens que je pars dans la mauvaise direction tu dois me le dire. Je suis en phase d'apprentissage. 
Il faut que j'écrive du code, propre, pro, destructuré et surtout propices a l'évolution. 