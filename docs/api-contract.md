# API Contract

## Preserved Endpoints

### `GET /`

- Response: `200`
- Body: `{ "status": "Backend running" }`

### `POST /api/sync-user`

- Auth: Firebase bearer token required
- Success:
  - Existing contact: `{ contactId, accountId, existing: true }`
  - New contact: `{ contactId, accountId, existing: false }`
- Error:
  - Missing token: `401 { "message": "Missing token" }`
  - Invalid token: `401 { "message": "Invalid token" }`
  - Service failure: `500 { "message": "User sync failed" }`

### `POST /api/:action`

- Auth: Firebase bearer token required
- Pass-through to Salesforce integration endpoint with body:
  - `{ action: <route-param>, ...payload }`
- Success: `{ user: <firebase-uid>, data: <integration-response> }`
- Error:
  - Missing token: `401 { "message": "Missing token" }`
  - Invalid token: `401 { "message": "Invalid token" }`
  - Service failure: `500 { "message": "<action> failed" }`

## Additive, Non-Breaking Behavior

- Response header: `X-Request-Id`
