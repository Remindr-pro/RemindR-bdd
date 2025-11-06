# RemindR API - Backend

API Backend pour l'application de santé RemindR, construite avec Node.js, Express, PostgreSQL, Prisma et TypeScript.

## 🚀 Stack Technique

### Backend/API
- **Node.js** avec **Express**
- **PostgreSQL** comme SGBD
- **Prisma** comme ORM
- **Zod** pour la validation
- **TypeScript** pour le typage
- API **REST**

### Authentification
- **JWT** (JSON Web Tokens)
- **OAuth2** (Google, Apple) - À implémenter
- **bcrypt** pour le chiffrement des mots de passe
- **pgcrypto** pour la sécurité des données

### Queue/Notifications
- **Redis** + **Bull Queue** pour la gestion des queues
- **Firebase Cloud Messaging** pour les push notifications
- **SendGrid** pour les emails
- **Twilio** pour les SMS

### Infrastructure
- **Docker** pour la conteneurisation
- **Docker Compose** pour l'orchestration
- **GitHub Actions** pour le CI/CD
- **Grafana** pour le monitoring (à configurer)

## 📋 Prérequis

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optionnel)

## 🛠️ Installation

> 📖 **Guide détaillé** : Consultez [SETUP.md](./SETUP.md) pour un guide complet de configuration.

### Démarrage Rapide

#### Option 1 : Avec Docker Compose (Recommandé)

```bash
# 1. Créer le fichier .env
cp env.example .env
# Éditer .env avec vos valeurs

# 2. Démarrer PostgreSQL et Redis
docker-compose up -d postgres redis

# 3. Installer les dépendances
npm install

# 4. Initialiser Prisma
npm run prisma:generate
npm run prisma:migrate

# 5. (Optionnel) Peupler la base de données
npm run prisma:seed

# 6. Démarrer l'API
npm run dev
```

#### Option 2 : PostgreSQL Local

Si vous avez PostgreSQL installé localement :

```bash
# 1. Créer la base de données
psql -U postgres
CREATE DATABASE remindr_db;
CREATE USER remindr WITH PASSWORD 'remindr_password';
GRANT ALL PRIVILEGES ON DATABASE remindr_db TO remindr;
\q

# 2. Créer le fichier .env
cp env.example .env
# Éditer .env avec vos valeurs

# 3. Installer les dépendances
npm install

# 4. Initialiser Prisma
npm run prisma:generate
npm run prisma:migrate

# 5. Démarrer l'API
npm run dev
```

### Configuration de l'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/remindr_db?schema=public

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Firebase Cloud Messaging
FCM_SERVER_KEY=your-fcm-server-key
FCM_PROJECT_ID=your-fcm-project-id

# SendGrid Email
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@remindr.app

# Twilio SMS
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 4. Configuration de la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les migrations
npm run prisma:migrate

# (Optionnel) Peupler la base de données avec des données de test
npm run prisma:seed
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Mode production

```bash
# Build
npm run build

# Start
npm start
```

### Avec Docker

```bash
# Démarrer tous les services (PostgreSQL, Redis, API)
docker-compose up -d

# Voir les logs
docker-compose logs -f api

# Arrêter les services
docker-compose down
```

## 📚 API Endpoints

### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/refresh` - Rafraîchir le token
- `POST /api/v1/auth/logout` - Déconnexion
- `GET /api/v1/auth/me` - Informations utilisateur connecté

### Utilisateurs
- `GET /api/v1/users` - Liste des utilisateurs
- `GET /api/v1/users/:id` - Détails d'un utilisateur
- `PUT /api/v1/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/v1/users/:id` - Supprimer un utilisateur

### Rappels (Reminders)
- `GET /api/v1/reminders` - Liste des rappels de l'utilisateur
- `GET /api/v1/reminders/:id` - Détails d'un rappel
- `POST /api/v1/reminders` - Créer un rappel
- `PUT /api/v1/reminders/:id` - Mettre à jour un rappel
- `DELETE /api/v1/reminders/:id` - Supprimer un rappel
- `PATCH /api/v1/reminders/:id/toggle` - Activer/Désactiver un rappel

### Profils de santé
- `GET /api/v1/health-profiles/me` - Mon profil de santé
- `GET /api/v1/health-profiles/:userId` - Profil de santé d'un utilisateur
- `POST /api/v1/health-profiles` - Créer un profil de santé
- `PUT /api/v1/health-profiles/:id` - Mettre à jour un profil de santé

### Articles
- `GET /api/v1/articles` - Liste des articles
- `GET /api/v1/articles/:id` - Détails d'un article
- `GET /api/v1/articles/category/:categoryId` - Articles par catégorie
- `POST /api/v1/articles` - Créer un article (admin/editor)
- `PUT /api/v1/articles/:id` - Mettre à jour un article (admin/editor)
- `DELETE /api/v1/articles/:id` - Supprimer un article (admin/editor)
- `PATCH /api/v1/articles/:id/publish` - Publier un article (admin/editor)

### Recommandations
- `GET /api/v1/recommendations` - Liste des recommandations
- `GET /api/v1/recommendations/:id` - Détails d'une recommandation
- `POST /api/v1/recommendations/:id/dismiss` - Ignorer une recommandation
- `POST /api/v1/recommendations/:id/click` - Enregistrer un clic

### Notifications
- `GET /api/v1/notifications` - Liste des notifications
- `GET /api/v1/notifications/:id` - Détails d'une notification
- `PATCH /api/v1/notifications/:id/read` - Marquer comme lu

### Questionnaire
- `GET /api/v1/questionnary/me` - Mon questionnaire
- `POST /api/v1/questionnary` - Créer un questionnaire
- `PUT /api/v1/questionnary/:id` - Mettre à jour un questionnaire

### Familles
- `GET /api/v1/families/me` - Ma famille
- `GET /api/v1/families/:id` - Détails d'une famille
- `PUT /api/v1/families/:id` - Mettre à jour une famille

## 🔐 Authentification

La plupart des endpoints nécessitent une authentification via JWT. Inclure le token dans le header :

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Structure de la Base de Données

Le schéma Prisma est défini dans `prisma/schema.prisma`. Les principales tables sont :

- `insurance_companies` - Compagnies d'assurance
- `families` - Familles
- `users` - Utilisateurs
- `health_profiles` - Profils de santé
- `reminder_types` - Types de rappels
- `reminders` - Rappels
- `article_categories` - Catégories d'articles
- `articles` - Articles
- `partners` - Partenaires
- `recommendations` - Recommandations
- `notification_logs` - Logs de notifications
- `questionnary` - Questionnaires

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch
```

## 🔍 Linting

```bash
npm run lint
```

## 📝 Scripts Disponibles

- `npm run dev` - Démarrage en mode développement avec hot-reload
- `npm run build` - Compilation TypeScript
- `npm start` - Démarrage en mode production
- `npm run prisma:generate` - Générer le client Prisma
- `npm run prisma:migrate` - Créer/appliquer les migrations
- `npm run prisma:studio` - Ouvrir Prisma Studio
- `npm run prisma:seed` - Peupler la base de données
- `npm run lint` - Linter le code
- `npm test` - Lancer les tests

## 🐳 Docker

### Build de l'image

```bash
docker build -t remindr-api .
```

### Docker Compose

Le fichier `docker-compose.yml` configure :
- PostgreSQL (port 5432)
- Redis (port 6379)
- API (port 3000)

## 🔄 CI/CD

Le pipeline GitHub Actions (`/.github/workflows/ci.yml`) :
- Lance les tests
- Vérifie le linting
- Build l'image Docker (sur push vers main)

## 📦 Dépendances Principales

- **express** - Framework web
- **@prisma/client** - Client Prisma ORM
- **zod** - Validation de schémas
- **jsonwebtoken** - JWT
- **bcrypt** - Hashage de mots de passe
- **bull** - Queue management
- **ioredis** - Client Redis
- **firebase-admin** - Firebase Cloud Messaging
- **@sendgrid/mail** - Envoi d'emails
- **twilio** - Envoi de SMS
- **helmet** - Sécurité HTTP
- **cors** - Gestion CORS
- **express-rate-limit** - Rate limiting

## 🚧 À Implémenter

- [ ] OAuth2 Google/Apple
- [ ] Tests unitaires et d'intégration
- [ ] Configuration Grafana pour le monitoring
- [ ] Documentation API complète (Swagger/OpenAPI)
- [ ] Webhooks
- [ ] Cache avec Redis
- [ ] Logging avancé (Winston/Pino)

## 📄 Licence

ISC

## 👥 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
