const Expense = require("../models/Expense");
const Balance = require("../models/Balance");
const Group = require("../models/Group");

exports.addExpense = async (req, res) => {
  try {
    const { groupId, description, amount, splitType, splits = [] } = req.body;
    const paidBy = req.userId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some(m => m.toString() === paidBy)) {
      return res.status(400).json({ message: "Payer not in group" });
    }

    let finalSplits = [];

    if (splitType === "EQUAL") {
      const splitAmount = Number(
        (amount / group.members.length).toFixed(2)
      );

      finalSplits = group.members.map(member => ({
        userId: member,
        amount: splitAmount
      }));
    }

    if (splitType === "EXACT") {
      const total = splits.reduce((s, x) => s + x.amount, 0);
      if (Math.abs(total - amount) > 0.01)
        return res.status(400).json({ message: "Invalid exact split" });

      finalSplits = splits;
    }

    if (splitType === "PERCENT") {
      const percent = splits.reduce((s, x) => s + x.percent, 0);
      if (percent !== 100)
        return res.status(400).json({ message: "Percent must be 100" });

      finalSplits = splits.map(s => ({
        userId: s.userId,
        amount: Number(((s.percent / 100) * amount).toFixed(2))
      }));
    }

    // Remove self-splits
    finalSplits = finalSplits.filter(
      s => s.userId.toString() !== paidBy
    );

    const expense = await Expense.create({
      groupId,
      description,
      amount,
      paidBy,
      splitType,
      splits: finalSplits
    });

    for (const split of finalSplits) {
      const existing = await Balance.findOne({
        from: split.userId,
        to: paidBy
      });

      if (existing) {
        existing.amount = Number(
          (existing.amount + split.amount).toFixed(2)
        );
        await existing.save();
      } else {
        await Balance.create({
          from: split.userId,
          to: paidBy,
          amount: split.amount
        });
      }
    }

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
