# Restructure Notes

## Objective

Move to layered architecture without changing existing business logic or public API behavior.

## File Mapping

- `backend/server.js` -> `backend/src/server.js` + `backend/src/app.js`
- `backend/routes/userRoutes.js` -> `backend/src/routes/user.routes.js` + `backend/src/controllers/user.controller.js`
- `backend/routes/salesforceRoutes.js` -> `backend/src/routes/salesforce.routes.js` + `backend/src/controllers/salesforce.controller.js`
- `backend/services/userService.js` -> `backend/src/services/user.service.js`
- `backend/services/salesforceService.js` -> `backend/src/services/salesforce.service.js` + `backend/src/clients/salesforce.client.js`
- `backend/config/firebase.js` -> `backend/src/config/firebase.js`
- `backend/config/salesforce.js` -> `backend/src/config/salesforce.js`
- `backend/middleware/auth.js` -> `backend/src/middleware/auth.js`

## Compatibility Strategy

- Keep legacy file paths as thin re-export shims.
- Preserve endpoint signatures, response bodies, and status codes.
- Add only non-breaking observability (`X-Request-Id` header + structured logs).

## Security Migration

- Active runtime now reads Firebase credentials from:
  1. `FIREBASE_SERVICE_ACCOUNT_JSON` (preferred)
  2. `FIREBASE_SERVICE_ACCOUNT_PATH` (transitional fallback)
- Legacy committed credential file is no longer referenced by active runtime code.
