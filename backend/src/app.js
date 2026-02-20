const express = require("express");
const cors = require("cors");
const { getEnv } = require("./config/env");
const requestContext = require("./middleware/requestContext");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

function createApp() {
  const env = getEnv();
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_URL
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
