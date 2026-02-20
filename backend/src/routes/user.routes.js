const express = require("express");
const verifyFirebase = require("../middleware/auth");
const { syncUser } = require("../controllers/user.controller");

const router = express.Router();

router.post("/sync-user", verifyFirebase, syncUser);

module.exports = router;
