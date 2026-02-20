const express = require("express");
const verifyFirebase = require("../middleware/auth");
const { invokeAction } = require("../controllers/salesforce.controller");

const router = express.Router();

router.post("/:action", verifyFirebase, invokeAction);

module.exports = router;
