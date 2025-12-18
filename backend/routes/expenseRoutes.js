const express = require("express");
const { addExpense } = require("../controllers/expenseController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, addExpense);

module.exports = router;
