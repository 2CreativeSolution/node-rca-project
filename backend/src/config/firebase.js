const admin = require("firebase-admin");
const { getEnv } = require("./env");

let firebaseAdmin;

function initializeFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  const env = getEnv();
  const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);

  firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return firebaseAdmin;
}

function getFirebaseAdmin() {
  return initializeFirebaseAdmin();
}

module.exports = {
  getFirebaseAdmin
};
