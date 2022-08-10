const express = require("express");
const router = express.Router();
// const { authMiddleware } = require("../../middleware/middleware");
const { getConfig } = require("./controller");

// router.use(authMiddleware);

router.route("/config/:chainId").get(getConfig);
module.exports = router;
