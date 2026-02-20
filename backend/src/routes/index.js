const express = require("express");
const healthRoutes = require("./health.routes");
const userRoutes = require("./user.routes");
const salesforceRoutes = require("./salesforce.routes");

const router = express.Router();

router.use(healthRoutes);
router.use("/api", userRoutes);
router.use("/api", salesforceRoutes);

module.exports = router;
