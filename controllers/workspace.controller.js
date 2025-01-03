const Workspace = require("../model/workspaceModel"); 
const User = require("../model/userModel")

exports.getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user.id` contains the authenticated user's ID

    // Fetch workspaces where the user is the owner or a member
    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { "members.userId": userId }
      ],
    })
      // .populate("owner", "username email") // Populate owner details (customize fields as needed)
      // .populate("members.userId", "username email") // Populate member details (customize fields as needed)
      // .populate("folders") // Populate folders if necessary
      // .populate("forms") // Populate forms if necessary
      // .exec();

    res.status(200).json({
      success: true,
      message: "Workspaces retrieved successfully",
      workspaces,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.shareWorkspace = async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const { email, accessType } = req.body;

    // Validate accessType
    if (!["view", "edit"].includes(accessType)) {
      return res.status(400).json({ message: "Invalid access type." });
    }

    // Find the user to share the workspace with
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: "User not found." });
    }
    const userId = userToShare._id;

    // Validate workspace existence
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    // Check if the requester is the owner or already a member with sharing rights
    const isRequesterOwner = String(workspace.owner) === String(req.user._id);
    const isRequesterMember = workspace.members.some(
      (member) => String(member.userId) === String(req.user._id)
    );

    if (!isRequesterOwner && !isRequesterMember) {
      return res.status(403).json({
        message: "You do not have permission to share this workspace.",
      });
    }

    // Check if the user is already a member
    const isAlreadyMember = workspace.members.some(
      (member) => String(member.userId) === String(userId)
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        message: "User is already a member of this workspace.",
      });
    }

    // Add new member to the workspace
    workspace.members.push({ userId, accessType });
    await workspace.save();

    res.status(200).json({
      message: "Workspace shared successfully.",
      workspace,
    });
  } catch (error) {
    console.error("Error sharing workspace:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
