const express = require("express");
const {
  getMyBalances,
  settleBalance
} = require("../controllers/balanceController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, getMyBalances);
router.post("/settle", auth, settleBalance);

module.exports = router;
