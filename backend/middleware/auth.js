const admin = require("../config/firebase");

async function verifyFirebase(req, res, next) {
  try {
    const idToken = req.headers.authorization?.split(" ")[1];

    if (!idToken) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = verifyFirebase;
