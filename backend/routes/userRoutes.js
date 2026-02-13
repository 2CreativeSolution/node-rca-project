const express = require("express");
const router = express.Router();
const verifyFirebase = require("../middleware/auth");
const { syncUserWithSalesforce } = require("../services/userService");

router.post("/sync-user", verifyFirebase, async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email || "";
    const name = req.user.name || email.split("@")[0];

    const result = await syncUserWithSalesforce(uid, email, name);

    res.json(result);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "User sync failed" });
  }
});

module.exports = router;
