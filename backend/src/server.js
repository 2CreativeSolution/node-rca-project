const { createApp } = require("./app");
const { getEnv } = require("./config/env");

function startServer() {
  const env = getEnv();
  const app = createApp();
  const port = Number(env.PORT);

  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer
};
