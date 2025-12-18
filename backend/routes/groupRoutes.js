const express = require("express");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { name, members } = req.body;

  if (!members.includes(req.userId)) members.push(req.userId);

  const group = await Group.create({
    name,
    members,
    createdBy: req.userId,
  });

  res.status(201).json(group);
});

router.get("/", auth, async (req, res) => {
  const groups = await Group.find({ members: req.userId });
  res.json(groups);
});

router.get("/:id/expenses", auth, async (req, res) => {
  const expenses = await Expense.find({ groupId: req.params.id });
  res.json(expenses);
});

module.exports = router;
