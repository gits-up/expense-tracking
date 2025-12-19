const Balance = require("../models/Balance");

exports.getMyBalances = async (req, res) => {
  const userId = req.userId;

  const youOwe = await Balance.find({ from: userId })
    .populate("to", "name email");

  const youAreOwed = await Balance.find({ to: userId })
    .populate("from", "name email");

  res.json({ youOwe, youAreOwed });
};

exports.settleBalance = async (req, res) => {
  const { from, to } = req.body;
  await Balance.findOneAndDelete({ from, to });
  res.json({ message: "Balance settled" });
};
