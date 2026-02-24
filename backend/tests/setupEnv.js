process.env.PORT = "4000";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.SF_LOGIN_URL = "https://example.my.salesforce.com";
process.env.SF_CLIENT_ID = "client-id";
process.env.SF_CLIENT_SECRET = "client-secret";
process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
  type: "service_account",
  project_id: "test-project",
  private_key_id: "test-private-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
  client_email: "test@test-project.iam.gserviceaccount.com",
  client_id: "test-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://example.com/cert"
});
