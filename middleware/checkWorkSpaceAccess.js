const Workspace = require("../model/workspaceModel");

exports.checkWorkspaceAccess = async (req, res, next) => {
  try {
    // Fetch the workspace by ID
    const userId = req.user._id;
    const workspaceId = req.headers['x-workspace-id']; // Corrected header access
    console.log("Workspace ID:", workspaceId);

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ access: false, reason: "Workspace not found" });
    }

    // Check if the user is the owner
    const isOwner = workspace.owner.toString() === userId.toString();

    // Check if the user is a member and fetch their access type
    const member = workspace.members.find(
      (member) => member.userId.toString() === userId.toString()
    );

    if (!isOwner && !member) {
      return res.status(403).json({ access: false, reason: "You do not have access to this workspace" });
    }

    // If the user is a member, check their access type
    const accessType = isOwner ? "edit" : member.accessType;

    // Attach the workspace and access information to the request
    req.workspace = workspace;
    req.access = true;
    req.accessType = accessType;

    // Continue to the next middleware
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ access: false, reason: "Server error" });
  }
};