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

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/schemes`
- `GET /api/schemes/personalized`
