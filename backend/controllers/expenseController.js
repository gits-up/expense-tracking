const Expense = require("../models/Expense");
const Balance = require("../models/Balance");
const Group = require("../models/Group");

exports.addExpense = async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splitType, splits } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Validate paidBy is part of group
    if (!group.members.includes(paidBy)) {
      return res.status(400).json({ message: "Payer not in group" });
    }

    let finalSplits = [];

    // 🔹 EQUAL SPLIT
    if (splitType === "EQUAL") {
      const splitAmount = amount / group.members.length;
      finalSplits = group.members.map((member) => ({
        userId: member,
        amount: splitAmount
      }));
    }

    // 🔹 EXACT SPLIT
    if (splitType === "EXACT") {
      const total = splits.reduce((sum, s) => sum + s.amount, 0);
      if (total !== amount) {
        return res.status(400).json({ message: "Split amounts do not match total" });
      }
      finalSplits = splits;
    }

    // 🔹 PERCENT SPLIT
    if (splitType === "PERCENT") {
      const percentTotal = splits.reduce((sum, s) => sum + s.percent, 0);
      if (percentTotal !== 100) {
        return res.status(400).json({ message: "Percentages must total 100" });
      }
      finalSplits = splits.map((s) => ({
        userId: s.userId,
        amount: (s.percent / 100) * amount
      }));
    }

    // Save expense
    const expense = await Expense.create({
      groupId,
      description,
      amount,
      paidBy,
      splitType,
      splits: finalSplits
    });

    // Update balances
    for (const split of finalSplits) {
      if (split.userId.toString() !== paidBy) {
        const existingBalance = await Balance.findOne({
          from: split.userId,
          to: paidBy
        });

        if (existingBalance) {
          existingBalance.amount += split.amount;
          await existingBalance.save();
        } else {
          await Balance.create({
            from: split.userId,
            to: paidBy,
            amount: split.amount
          });
        }
      }
    }

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
