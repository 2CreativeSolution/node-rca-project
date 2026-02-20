const salesforceClient = require("../clients/salesforce.client");

async function callIntegration(action, payload = {}) {
  return salesforceClient.callIntegration(action, payload);
}

module.exports = {
  callIntegration
};
