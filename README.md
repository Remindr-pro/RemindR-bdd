# RemindR – API Backend

Backend de l'app RemindR, une application de suivi santé familiale. Construit avec Node.js, Express, PostgreSQL et Prisma.

## Contexte du projet

RemindR permet aux familles de gérer leurs rappels de santé (vaccins, rendez-vous, prises de médicaments, etc.) et de centraliser les infos utiles (profils santé, documents mutuelle, recommandations personnalisées). Cette API sert de backend pour l'app mobile et le futur portail web.

## Stack technique

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (via Prisma)
- **Redis** + **Bull** pour les queues (notifications, rappels)
- **JWT** pour l’auth, **bcrypt** pour les mots de passe
- **Zod** pour la validation des entrées
- **Swagger** pour la doc API (`/api-docs`)

OAuth2 (Google, Apple) est prévu dans les routes mais pas encore branché côté front. Firebase, SendGrid et Twilio sont configurés pour les notifs (emails, SMS, push).

## Prérequis

- Node.js 20+
- PostgreSQL 16+
- Redis (optionnel en dev si tu ne lances pas les jobs de rappels)

Docker est pratique pour lancer Postgres et Redis sans les installer en local.

## Installation

```bash
# 1. Cloner et installer les deps
npm install

# 2. Fichier .env
cp env.example .env
# Éditer .env avec ta DATABASE_URL et les secrets JWT

# 3. Base de données
npm run prisma:generate
npm run prisma:migrate

# 4. (Optionnel) Données de test
npm run prisma:seed

# 5. Lancer l'API
npm run dev
```

L’API tourne sur `http://localhost:3000`. La doc Swagger est dispo sur `http://localhost:3000/api-docs`.

### Avec Docker pour Postgres + Redis

```bash
docker-compose up -d postgres redis
# Puis npm run dev comme ci-dessus
```

### Variables d'environnement importantes

Dans `.env` :

- `DATABASE_URL` – connexion PostgreSQL
- `JWT_SECRET` et `JWT_REFRESH_SECRET` – à changer en prod
- `REDIS_HOST`, `REDIS_PORT` – pour les queues (optionnel en dev)
- `CORS_ORIGIN` – origines autorisées (ex: `http://localhost:5173`)

Le reste (SendGrid, Twilio, Firebase, Sentry) peut rester vide en dev.

## Endpoints principaux

### Auth
- `POST /api/v1/auth/register` – Inscription
- `POST /api/v1/auth/login` – Connexion
- `POST /api/v1/auth/verify-identity` – Vérification par numéro d’adhérent (mutuelle)
- `POST /api/v1/auth/refresh` – Rafraîchir le token
- `GET /api/v1/auth/me` – Profil connecté

### Utilisateurs
- `GET /api/v1/users` – Liste (admin/pro)
- `GET /api/v1/users/:id` – Détail
- `PUT /api/v1/users/:id` – Mise à jour

### Familles
- `GET /api/v1/families/me` – Ma famille (avec profils santé des membres)
- `PUT /api/v1/families/:id` – Mise à jour

### Rappels
- `GET /api/v1/reminders` – Mes rappels
- `GET /api/v1/reminders/calendar` – Calendrier familial
- `POST /api/v1/reminders` – Créer
- `PUT /api/v1/reminders/:id` – Modifier
- `PATCH /api/v1/reminders/:id/toggle` – Activer / désactiver

### Profils santé
- `GET /api/v1/health-profiles/me` – Mon profil
- `GET /api/v1/health-profiles/:userId` – Profil d’un membre (famille)
- `POST /api/v1/health-profiles` – Créer
- `PUT /api/v1/health-profiles/:id` – Modifier

### Articles
- `GET /api/v1/articles` – Liste
- `GET /api/v1/articles/:id` – Détail
- `GET /api/v1/articles/category/:categoryId` – Par catégorie

### Recommandations
- `GET /api/v1/recommendations` – Liste
- `POST /api/v1/recommendations/:id/dismiss` – Ignorer
- `POST /api/v1/recommendations/:id/click` – Enregistrer un clic

### Documents (factures mutuelle)
- `GET /api/v1/documents` – Mes documents
- `POST /api/v1/documents` – Upload
- `POST /api/v1/documents/:id/send-to-mutuelle` – Envoyer à la mutuelle

### Analytics (B2B)
- `GET /api/v1/analytics/dashboard` – Dashboard métriques (mutuelles, partenaires)

### Autres
- `GET /api/v1/notifications` – Notifications
- `GET /api/v1/questionnary/me` – Mon questionnaire
- `POST /api/v1/questionnary` – Créer / mettre à jour

Tous les endpoints protégés attendent un header `Authorization: Bearer <token>`.

## Structure du projet

```
src/
├── config/        # Swagger, Sentry, logger, passport
├── controllers/   # Logique métier
├── middleware/    # Auth, validation, rate limit
├── routes/        # Routes Express
├── services/      # Queue, notifications
├── jobs/          # Scheduler des rappels
└── utils/         # Helpers
prisma/
├── schema.prisma  # Modèles
├── migrations/
└── seed.ts
```

## Scripts utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrage en dev (hot reload) |
| `npm run build` | Build TypeScript |
| `npm start` | Démarrage en prod |
| `npm run prisma:studio` | Interface Prisma sur la BDD |
| `npm run prisma:seed` | Peupler la BDD |
| `npm run lint` | Linter |
| `npm test` | Tests |

## Base de données

Le schéma est dans `prisma/schema.prisma`. Tables principales : `users`, `families`, `health_profiles`, `reminders`, `reminder_types`, `articles`, `recommendations`, `documents`, `insurance_companies`, etc.

## Ce qui reste à faire

- Brancher OAuth2 Google/Apple côté front
- Tests unitaires / d’intégration (structure Jest en place)
- Config Grafana pour le monitoring (Docker Compose dispo)
- Webhooks pour les partenaires externes

## Licence

ISC
