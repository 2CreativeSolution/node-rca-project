const { getFirebaseAdmin } = require("../config/firebase");
const { createHttpError } = require("../utils/httpErrors");

async function verifyFirebase(req, res, next) {
  const idToken = req.headers.authorization?.split(" ")[1];

  if (!idToken) {
    return res.status(401).json({ message: "Missing token" });
  }

  let admin;
  try {
    admin = getFirebaseAdmin();
  } catch (error) {
    return next(createHttpError(500, "Authentication service unavailable", error));
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = verifyFirebase;
