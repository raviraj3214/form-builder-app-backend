const mongoose =  require("mongoose")
const FolderSchema = new mongoose.Schema(
    {
      foldername: {
        type: String,
        required: true,
        trim: true,
      },
      workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Folder", FolderSchema);
  