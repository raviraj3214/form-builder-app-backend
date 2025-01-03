const mongoose = require("mongoose");

const WorkspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        accessType: { type: String, enum: ["view", "edit"], required: true },
      },
    ],
    folders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
    forms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Form" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", WorkspaceSchema);
