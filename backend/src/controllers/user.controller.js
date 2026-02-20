const { syncUserWithSalesforce } = require("../services/user.service");
const { createHttpError } = require("../utils/httpErrors");

async function syncUser(req, res, next) {
  try {
    const uid = req.user.uid;
    const email = req.user.email || "";
    const name = req.user.name || email.split("@")[0];

    const result = await syncUserWithSalesforce(uid, email, name);

    return res.json(result);
  } catch (error) {
    return next(createHttpError(500, "User sync failed", error));
  }
}

module.exports = {
  syncUser
};
