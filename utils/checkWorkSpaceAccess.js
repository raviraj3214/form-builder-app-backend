const Workspace = require("../model/workspaceModel");

const checkWorkspaceAccess = async (workspaceId, userId) => {
  // Fetch the workspace by ID
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return { access: false, reason: "Workspace not found" };
  }

  // Check if the user is the owner or a member
  const isOwner = workspace.owner.toString() === userId.toString();
  const isMember = workspace.members.some(
    (member) => member.userId.toString() === userId.toString()
  );

  if (!isOwner && !isMember) {
    return { access: false, reason: "You do not have access to this workspace" };
  }

  return { access: true, workspace };
};

module.exports = checkWorkspaceAccess;
