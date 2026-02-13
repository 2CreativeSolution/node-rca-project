const express = require("express");
const router = express.Router();
const verifyFirebase = require("../middleware/auth");
const { callIntegration } = require("../services/salesforceService");

router.post("/:action", verifyFirebase, async (req, res) => {
  try {
    const action = req.params.action;

    const data = await callIntegration(action, req.body);

    res.json({
      user: req.user.uid,
      data
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: `${req.params.action} failed` });
  }
});

module.exports = router;
