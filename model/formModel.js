const mongoose = require("mongoose");

const formSchema = new mongoose.Schema(
  {
    formname: { type: String, required: true },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
    theme: { type: String, required: true },
    fields: [
      {
        type: { type: String, required: true },
        heading: { type: String, required: true },
        value: { type: String },
      },
    ],
    uniqueUrl: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
