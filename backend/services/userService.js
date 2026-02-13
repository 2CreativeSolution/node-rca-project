const axios = require("axios");
const { getSalesforceToken } = require("./salesforceService");
const config = require("../config/salesforce");

async function syncUserWithSalesforce(uid, email, name) {
  const sfToken = await getSalesforceToken();

  // Check if Contact already exists
  const queryResponse = await axios.get(
    `${config.loginUrl}/services/data/${config.apiVersion}/query`,
    {
      headers: {
        Authorization: `Bearer ${sfToken}`
      },
      params: {
        q: `SELECT Id, AccountId FROM Contact WHERE Firebase_UID__c = '${uid}' LIMIT 1`
      }
    }
  );

  if (queryResponse.data.records.length > 0) {
    return {
      contactId: queryResponse.data.records[0].Id,
      accountId: queryResponse.data.records[0].AccountId,
      existing: true
    };
  }

  // Create Account
  const accountResponse = await axios.post(
    `${config.loginUrl}/services/data/${config.apiVersion}/sobjects/Account`,
    {
      Name: `${name}'s Account`
    },
    {
      headers: {
        Authorization: `Bearer ${sfToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  const accountId = accountResponse.data.id;

  // Create Contact
  const contactResponse = await axios.post(
    `${config.loginUrl}/services/data/${config.apiVersion}/sobjects/Contact`,
    {
      LastName: name,
      Email: email,
      AccountId: accountId,
      Firebase_UID__c: uid
    },
    {
      headers: {
        Authorization: `Bearer ${sfToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return {
    contactId: contactResponse.data.id,
    accountId,
    existing: false
  };
}

module.exports = {
  syncUserWithSalesforce
};
