const axios = require("axios");
const qs = require("qs");
const { getSalesforceConfig } = require("../config/salesforce");

let salesforceToken = null;
let tokenExpiry = null;

async function getToken() {
  if (salesforceToken && tokenExpiry && Date.now() < tokenExpiry) {
    return salesforceToken;
  }

  const config = getSalesforceConfig();

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
  const token = await getToken();
  const config = getSalesforceConfig();

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

async function query(soql) {
  const token = await getToken();
  const config = getSalesforceConfig();

  return axios.get(`${config.loginUrl}/services/data/${config.apiVersion}/query`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      q: soql
    }
  });
}

async function createSObject(type, payload) {
  const token = await getToken();
  const config = getSalesforceConfig();

  return axios.post(
    `${config.loginUrl}/services/data/${config.apiVersion}/sobjects/${type}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
}

function __resetTokenCache() {
  salesforceToken = null;
  tokenExpiry = null;
}

module.exports = {
  getToken,
  callIntegration,
  query,
  createSObject,
  __resetTokenCache
};
