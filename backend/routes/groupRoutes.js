const express = require("express");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * CREATE GROUP
 * Creator is always added as a member
 */
router.post("/", auth, async (req, res) => {
  try {
    let { name, members = [] } = req.body;

    // Ensure creator is in group
    if (!members.some(m => m.toString() === req.userId)) {
      members.push(req.userId);
    }

    const group = await Group.create({
      name,
      members,
      createdBy: req.userId
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET MY GROUPS
 */
router.get("/", auth, async (req, res) => {
  try {
    const groups = await Group.find({
      members: { $in: [req.userId] }
    }).populate("members", "name email");

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET EXPENSES OF A GROUP
 */
router.get("/:id/expenses", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({
      groupId: req.params.id
    })
      .populate("paidBy", "name")
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ADD MEMBER TO GROUP (BY EMAIL)
 */
router.post("/:groupId/add-member", auth, async (req, res) => {
  try {
    const { email } = req.body;
    const { groupId } = req.params;

    // Find user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only existing members can add others
    if (!group.members.some(m => m.toString() === req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent duplicate members
    if (group.members.some(m => m.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: "User already in group" });
    }

    group.members.push(userToAdd._id);
    await group.save();

    res.json({ message: "Member added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
