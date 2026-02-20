const express = require("express");
const cors = require("cors");
const { getEnv } = require("./config/env");
const requestContext = require("./middleware/requestContext");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

function isOriginAllowed(origin, allowedOrigins) {
  if (allowedOrigins.length === 0) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return allowedOrigins.some((allowedOrigin) => {
    if (!allowedOrigin.includes("*.")) {
      return false;
    }

    const [scheme, wildcardHost] = allowedOrigin.split("*.");
    if (!origin.startsWith(scheme)) {
      return false;
    }

    const originHost = origin.slice(scheme.length);
    return originHost.endsWith(wildcardHost);
  });
}

function createApp() {
  const env = getEnv();
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser requests or tools that do not send Origin.
        if (!origin) {
          return callback(null, true);
        }

        if (isOriginAllowed(origin, env.FRONTEND_URLS)) {
          return callback(null, true);
        }

        return callback(null, false);
      }
    })
  );

  app.use(express.json());
  app.use(requestContext);
  app.use(routes);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
