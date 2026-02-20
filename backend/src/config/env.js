const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadFirebaseServiceAccountJson() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const absolutePath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return fs.readFileSync(absolutePath, "utf8");
  }

  throw new Error(
    "Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
  );
}

function parseAllowedOrigins(value) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getEnv() {
  const allowedOrigins = parseAllowedOrigins(
    process.env.FRONTEND_URLS || process.env.FRONTEND_URL || ""
  );

  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "4000",
    FRONTEND_URL: process.env.FRONTEND_URL,
    FRONTEND_URLS: allowedOrigins,
    SF_LOGIN_URL: requireEnv("SF_LOGIN_URL"),
    SF_CLIENT_ID: requireEnv("SF_CLIENT_ID"),
    SF_CLIENT_SECRET: requireEnv("SF_CLIENT_SECRET"),
    SF_API_VERSION: process.env.SF_API_VERSION || "v60.0",
    FIREBASE_SERVICE_ACCOUNT_JSON: loadFirebaseServiceAccountJson()
  };
}

module.exports = {
  getEnv
};
