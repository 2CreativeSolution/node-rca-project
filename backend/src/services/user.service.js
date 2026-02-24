const salesforceClient = require("../clients/salesforce.client");

async function syncUserWithSalesforce(uid, email, name) {
  const queryResponse = await salesforceClient.query(
    `SELECT Id, AccountId FROM Contact WHERE Firebase_UID__c = '${uid}' LIMIT 1`
  );

  if (queryResponse.data.records.length > 0) {
    return {
      contactId: queryResponse.data.records[0].Id,
      accountId: queryResponse.data.records[0].AccountId,
      existing: true
    };
  }

  const accountResponse = await salesforceClient.createSObject("Account", {
    Name: `${name}'s Account`
  });

  const accountId = accountResponse.data.id;

  const contactResponse = await salesforceClient.createSObject("Contact", {
    LastName: name,
    Email: email,
    AccountId: accountId,
    Firebase_UID__c: uid
  });

  return {
    contactId: contactResponse.data.id,
    accountId,
    existing: false
  };
}

module.exports = {
  syncUserWithSalesforce
};
