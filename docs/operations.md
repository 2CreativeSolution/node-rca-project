# Operations Runbook

## Startup Requirements

Set required environment variables before starting the server:

- `SF_LOGIN_URL`
- `SF_CLIENT_ID`
- `SF_CLIENT_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`

## Local Startup

1. Copy `.env.example` to `.env` and fill values.
2. Run `npm install`.
3. Run `npm run dev` for local development.

## Secret Injection Guidance

Preferred:

- Inject `FIREBASE_SERVICE_ACCOUNT_JSON` from your secret manager.

Transitional fallback:

- Point `FIREBASE_SERVICE_ACCOUNT_PATH` to a local secret file excluded from git.

Do not use tracked credentials from repository files in runtime.

## Verification Checklist

- `GET /` returns status payload.
- Auth-protected routes return 401 on missing/invalid token.
- `X-Request-Id` present in responses.
- Salesforce calls succeed with valid credentials.

## Troubleshooting

- `Missing required environment variable`: check `.env` completeness.
- `Firebase credentials not configured`: set `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`.
- `401 Invalid token`: verify Firebase token issuer/project alignment.
- Salesforce errors: verify connected app credentials and org endpoint.
