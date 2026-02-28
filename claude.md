# CoFloww

Application web de gestion budgétaire et patrimoniale personnelle, conçue dès le départ pour être un SaaS modulaire et évolutif. Inspirée de Finary, mais repensée avec une UX plus personnalisable et une architecture pensée pour grandir.

---

## Structure du projet

```
cofloww/
├── api/          ← Laravel — backend API
├── web/          ← React + Vite + TypeScript — frontend
├── docker/       ← configs nginx, php-fpm
├── docker-compose.yml       ← dev (make dev suffit à tout lancer)
├── docker-compose.prod.yml  ← production
└── Makefile
```

Un seul `docker compose up` doit démarrer l'intégralité du projet (nginx, php-fpm, postgres, redis). Pas de manipulation manuelle.

---

## Stack technique

**Frontend** (`/web`)
- React 18 + Vite 5 + TypeScript (strict, zéro `any`)
- TailwindCSS 3 + shadcn/ui
- React Query v5 (server state)
- Zustand (UI state global)
- React Router v6
- React Hook Form + Zod
- Recharts
- Lucide React
- i18n maison via composant `<T>` (voir section Traduction)

**Backend** (`/api`)
- Laravel 11 / PHP 8.3
- API RESTful — toutes les routes préfixées `/api/v1`
- Auth : Laravel Breeze (mode API) + Sanctum (cookies SPA)
- PostgreSQL 16
- Redis (cache + queues)
- PestPHP (tests)

---

## Architecture fonctionnelle

L'app est organisée en **modules** pouvant être activés ou désactivés par utilisateur (vision SaaS). Chaque module est une section autonome.

**3 entrées principales dans la navigation :**
- `/budget` — Module Budget
- `/investments` — Module Investissements
- `/settings` — Paramètres

**Chaque module principal est un "dashboard de catégorie"** : une page d'accueil qui résume l'essentiel (stats clés, dernières transactions, graphiques) et depuis laquelle on navigue vers les sous-pages (liste complète, détail, etc.). On ne noie pas tout sur une seule page.

**Exemple pour `/budget` :**
- Vue résumé : solde, dépenses du mois, revenus, taux d'épargne
- Raccourcis rapides : "+ Dépense", "+ Revenu"
- Aperçu budgets (top catégories consommées)
- Dernières transactions (5-10)
- Liens vers : `/budget/transactions`, `/budget/categories`, `/budget/rules`

**Priorité V1 : Module Budget complet.** Le module Investissements est prévu dans l'architecture mais développé en V2. Les composants génériques doivent être pensés pour servir les deux modules.

---

## Conventions Frontend — à respecter absolument

### Écriture des composants

Toujours sous cette forme, sans exception :

```tsx
const MonComposant = ({ prop1, prop2 }: MonComposantProps) => {
  return (...)
}

export default MonComposant
```

### Structure en répertoires

Chaque composant non-trivial est un **répertoire**, pas un fichier isolé :

```
components/
└── Button/
    ├── Button.tsx       ← le composant
    ├── index.ts         ← export public : export { default } from './Button'
    └── Button.css       ← styles spécifiques si besoin
```

Les composants simples (vraiment atomiques) peuvent rester en fichier unique. Dès qu'il y a des variantes ou des sous-composants : répertoire.

### Responsabilité des composants

**Règle d'or : un composant ne doit avoir qu'une seule raison de changer.**

- Un composant `Button` ne sait pas ce qu'il fait. C'est le parent qui lui passe `onClick`.
- Un composant `TransactionRow` affiche une transaction. Il ne fetche pas, ne dispatch pas.
- Si tu te demandes "pourquoi ce code est là ?", c'est que le composant en fait trop.
- Toujours se poser : "est-ce que cette logique peut être définie plus haut ?"
- Les composants génériques (`Button`, `Card`, `Input`, `Modal`...) ne doivent jamais avoir de logique métier.

### Déstructuration

```tsx
// ✅ Bien
const TransactionCard = ({ label, amount, category, date }: TransactionCardProps) => {}

// ❌ Pas bien
const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
  // et ensuite on accède à transaction.label, transaction.amount...
  // le composant connaît trop la structure interne
}
```

### Organisation des dossiers `/web/src`

```
src/
├── components/          ← composants génériques réutilisables (Button, Card, Modal...)
├── features/            ← composants métier par domaine
│   ├── budget/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   └── investments/
├── views/               ← une page = un fichier, routing uniquement
├── hooks/               ← hooks custom globaux (useAuth, useTheme...)
├── stores/              ← Zustand stores
├── services/            ← appels API (axios + React Query)
├── lib/                 ← utils, formatters, constants
├── types/               ← types globaux partagés
└── i18n/                ← dictionnaires de traduction globaux
```

### Compound components (Slots)

Quand plusieurs composants partagent la même structure visuelle, on crée un composant générique avec des **slots** via le pattern compound component :

```tsx
// components/Form/Form.tsx
const Form = ({ onSubmit, children }: FormProps) => <form onSubmit={onSubmit}>{children}</form>
Form.Header = ({ children }: { children: React.ReactNode }) => <div className="...">{children}</div>
Form.Body   = ({ children }: { children: React.ReactNode }) => <div className="...">{children}</div>
Form.Footer = ({ children }: { children: React.ReactNode }) => <div className="...">{children}</div>
Form.Error  = ({ message }: { message?: string }) => message ? <p className="...">{message}</p> : null

// Utilisation dans LoginForm
<Form onSubmit={handleSubmit}>
  <Form.Header>Connexion</Form.Header>
  <Form.Body>{/* champs */}</Form.Body>
  <Form.Footer><Button type="submit">Se connecter</Button></Form.Footer>
</Form>
```

Utiliser ce pattern dès qu'il y a **répétition de structure** entre composants (formulaires, cards, modals…). Ça garantit une UI cohérente sans dupliquer le layout.

### Traduction (i18n)

Chaque composant embarque ses propres traductions dans un fichier `.json` à côté de lui. Les clés sont simples, sans préfixe (le JSON est local au composant).

```json
// LoginForm/LoginForm.json
{ "fr": { "title": "Connexion", "email": "Email" }, "en": { "title": "Sign in", "email": "Email" } }
```

Le composant `<T>` prend le json en prop `i18n`. `useT(json)` retourne une fonction `t(key)` pour les attributs string :

```tsx
import T, { useT } from '../../../../components/T'
import json from './LoginForm.json'

const t = useT(json)

// JSX
<T i18n={json}>title</T>

// Attribut string (placeholder, aria-label…)
t('email_placeholder')
```

Langue active depuis le store Zustand (`useLangStore`). Clé manquante → retourne la clé brute.

Langue par défaut : **français**. Les clés `en` doivent exister dès le début.

---

## Conventions Backend — à respecter absolument

### Architecture en couches

```
Controllers  →  Form Requests  →  Services/Actions  →  Models
```

- **Controllers** : uniquement routing + délégation. Max 5 lignes par méthode.
- **Form Requests** : toute la validation. Jamais de `$request->validate()` dans un controller.
- **Services** (`app/Services/`) : toute la logique métier. Testable unitairement.
- **Actions** (`app/Actions/`) : opérations atomiques réutilisables (ex: `CreateTransactionAction`).
- **Resources** (`app/Http/Resources/`) : toutes les réponses JSON. Jamais de `->toArray()` direct.

### Isolation multi-tenant

Tous les models (sauf `User`) ont un `GlobalScope` qui ajoute automatiquement `WHERE user_id = auth()->id()`. Aucune donnée ne doit fuiter entre utilisateurs.

### Autres règles

- `DB::transaction()` pour toute opération qui touche plusieurs tables
- Toujours typer les retours de méthodes
- PestPHP : tests Feature sur toutes les routes, tests Unit sur les Services critiques

---

## Posture de travail

J'écris le code moi-même. Tu interviens quand je te le demande : déboguer, expliquer, suggérer une approche, générer un extrait précis.

**Ne prends pas d'initiative au-delà de ce qui est demandé.**

Par contre, si tu vois que je pars dans une mauvaise direction (composant trop gros, logique mal placée, convention non respectée), **dis-le moi clairement**. Je préfère être corrigé tôt.

L'objectif : écrire du code propre, lisible, destructuré, qu'un autre dev peut reprendre sans se poser de questions.