# Praja Sathi

Praja Sathi is a personalized Telangana citizen-information platform.

The repository currently contains the React/Vite frontend and a new backend foundation under `server/`.

## Product direction

- Six citizen domains: Student, Farmer, Employee, Business Owner, Senior Citizen, Other
- Rule-based personalization and eligibility scoring
- Official-source links
- Bookmarks and reminders
- Multilingual UI: English, Telugu and Hindi
- Sathi AI with configurable Groq/Hindsight/vector providers
- Admin-managed schemes, services, events and knowledge documents
- Docker-ready deployment architecture

## Development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

The backend starts in development mode even when MongoDB is unavailable, but persistence and authentication require `MONGO_URI`.

Seed initial citizen content with `cd server && npm run seed`. Create an admin account with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `.env`, then run `npm run create-admin`.

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/schemes`
- `GET /api/schemes/personalized`

## Current functional slices

- JWT registration/login with citizen profiles
- Rule-based personalized scheme ranking
- Student scheme discovery backed by MongoDB
- Sathi AI API with Groq when configured and grounded mock fallback otherwise
- Bookmarks, reminders and in-app notification APIs
- Admin content management and knowledge-base URL/file ingestion
- Docker Compose for frontend + API + MongoDB
- GitHub Actions frontend/backend CI
