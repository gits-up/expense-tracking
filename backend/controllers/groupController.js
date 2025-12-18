const Group = require("../models/Group");

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    // Ensure creator is always a member
    if (!members.includes(req.userId)) {
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
};

exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.userId
    }).populate("members", "name email");

    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
