const { getEnv } = require("./env");

function getSalesforceConfig() {
  const env = getEnv();

  return {
    loginUrl: env.SF_LOGIN_URL,
    clientId: env.SF_CLIENT_ID,
    clientSecret: env.SF_CLIENT_SECRET,
    apiVersion: env.SF_API_VERSION
  };
}

module.exports = {
  getSalesforceConfig
};
