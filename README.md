# RCA Backend

Layered Node.js backend for Firebase-authenticated Salesforce operations.

## Architecture

`backend/src` is organized as:

- `app.js`: Express app composition
- `server.js`: runtime bootstrap/listen
- `config/`: environment + provider configuration
- `middleware/`: auth, request context, error handler
- `routes/`: HTTP routes
- `controllers/`: HTTP-to-service orchestration
- `services/`: business orchestration
- `clients/`: external API access (Salesforce)
- `utils/`: shared helpers

## API Contract (preserved)

- `GET /` -> `{ "status": "Backend running" }`
- `POST /api/sync-user` (Firebase protected)
- `POST /api/:action` (Firebase protected)

## Environment Variables

Required:

- `SF_LOGIN_URL`
- `SF_CLIENT_ID`
- `SF_CLIENT_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_JSON` (preferred)

Optional:

- `FIREBASE_SERVICE_ACCOUNT_PATH` (transitional fallback)
- `FRONTEND_URL`
- `PORT` (default `4000`)
- `SF_API_VERSION` (default `v60.0`)

Use `.env.example` as the template.

## Commands

- `npm run dev`: run with `nodemon`
- `npm start`: run with `node`
- `npm test`: run Jest tests
- `npm run test:watch`: run Jest in watch mode
- `npm run lint`: run ESLint
- `npm run format:check`: validate formatting

## Notes

- `X-Request-Id` is added to every response for correlation.
- Legacy paths (`backend/server.js`, `backend/routes/*`, `backend/services/*`) are kept as compatibility shims to the new `backend/src` modules.
- Do not use committed credential files in runtime. Inject Firebase credentials via env/secrets.
