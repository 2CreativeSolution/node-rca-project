const axios = require("axios");
const qs = require("qs");
const config = require("../config/salesforce");

let salesforceToken = null;
let tokenExpiry = null;

async function getSalesforceToken() {
  if (salesforceToken && tokenExpiry && Date.now() < tokenExpiry) {
    return salesforceToken;
  }

  const response = await axios.post(
    `${config.loginUrl}/services/oauth2/token`,
    qs.stringify({
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  salesforceToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

  return salesforceToken;
}

async function callIntegration(action, payload = {}) {
  const token = await getSalesforceToken();

  const response = await axios.post(
    `${config.loginUrl}/services/apexrest/api/integration`,
    {
      action,
      ...payload
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}

module.exports = {
  callIntegration,
  getSalesforceToken
};
