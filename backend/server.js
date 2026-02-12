require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require("axios");

const app = express();
const serviceAccount = require("./firebase-service-account.json");


app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());

/*
  Firebase Admin Setup
*/

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/*
  Health check
*/
app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});


const qs = require("qs");

let salesforceToken = null;
let tokenExpiry = null;

async function getSalesforceToken() {
  // If token exists and not expired, reuse it
  if (salesforceToken && tokenExpiry && Date.now() < tokenExpiry) {
    return salesforceToken;
  }

  const response = await axios.post(
    `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
    qs.stringify({
      grant_type: "client_credentials",
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  salesforceToken = response.data.access_token;

  // Salesforce usually gives 3600 sec expiry
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

  console.log("New Salesforce token acquired");

  return salesforceToken;
}


/*
  Protected endpoint example
*/

app.post("/api/sync-user", async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(" ")[1];

    if (!idToken) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    const uid = decoded.uid;
    const email = decoded.email || "";
    const name = decoded.name || email.split("@")[0];

    const sfToken = await getSalesforceToken();

    console.log("---- SYNC USER START ----");
    console.log("Decoded UID:", uid);
    console.log("Email:", email);

    // Check if contact exists
    const queryResponse = await axios.get(
      `${process.env.SF_LOGIN_URL}/services/data/v60.0/query`,
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
      return res.json({
        contactId: queryResponse.data.records[0].Id,
        accountId: queryResponse.data.records[0].AccountId,
        existing: true
      });
    }

    // Create Account
    console.log("Creating Account...");
    const accountResponse = await axios.post(
      `${process.env.SF_LOGIN_URL}/services/data/v60.0/sobjects/Account`,
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
    console.log("Creating Contact...");
    const contactResponse = await axios.post(
      `${process.env.SF_LOGIN_URL}/services/data/v60.0/sobjects/Contact`,
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

    return res.json({
      contactId: contactResponse.data.id,
      accountId,
      existing: false
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ message: "Sync error" });
  }
});

app.post("/api/listCatalogs", async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(" ")[1];

    if (!idToken) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log("Firebase UID:", decoded.uid);

    // Get Salesforce Access Token
    const sfToken = await getSalesforceToken();

    // Call Salesforce (Example: get Products)
    const sfResponse = await axios.post(
        `${process.env.SF_LOGIN_URL}/services/apexrest/api/integration`,
        {
            action: "listCatalogs",
            defaultCatalogName: ""
        },
        {
            headers: {
            Authorization: `Bearer ${sfToken}`,
            "Content-Type": "application/json"
            }
        }
    );

    return res.json({
      user: decoded.uid,
      products: sfResponse.data
    });

  } catch (err) {
    console.error("FULL ERROR OBJECT:", err);

    if (err.response) {
        console.error("Salesforce Error Response:", err.response.data);
        return res.status(500).json({
        message: "Salesforce OAuth error",
        details: err.response.data
        });
    }

    return res.status(500).json({
        message: "Backend error",
        details: err.message
    });
    }
});


const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
