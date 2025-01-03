const mongoose = require("mongoose");
const Folder = require("../model/folderModel"); // Ensure the correct path to your Folder model
const User = require("../model/userModel");

const Workspace = require("../model/workspaceModel")

exports.createFolder = async (req, res) => {
  try {
    const { foldername } = req.body;

    const { workspace } = req; // Workspace is attached to the request by the middleware

    if (!foldername || !workspace) {
      return res.status(400).json({ message: "Folder name and workspace are required" });
    }

    // Ensure the user has access to the workspace
    if (!req.access || req.accessType !== "edit") {
      return res.status(403).json({ message: "You do not have access to this workspace" });
    }

    

    // Check if the folder already exists in the workspace
    const existingFolder = await Folder.findOne({ foldername, workspaceId: workspace._id });
    if (existingFolder) {
      return res.status(400).json({ message: "Folder already exists in the workspace" });
    }

    // Create the folder
    const newFolder = new Folder({ foldername, workspaceId: workspace._id });
    await newFolder.save();

    const response = { message: "Folder created successfully", folder: newFolder };
    if (req.user.token) {
      response.token = req.user.token;
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error creating folder", error });
  }
};



// exports.createFolder = async (req, res) => {
//     try {
//       const { foldername } = req.body;
//       const user = req.user._id;
//       console.log("foldername",foldername)
      
//       if (!foldername) {
//         return res.status(400).json({ message: "Folder name is required" });
//       }
  
//       // Check if the folder already exists
//       const existingFolder = await Folder.findOne({ foldername, user });
//       if (existingFolder) {
//         return res.status(400).json({ message: "Folder already exists" });
//       }
  
//       const newFolder = new Folder({ foldername, user });
//       await newFolder.save();
//       const response = { message: "Folder created successfully", folder: newFolder }
//       if(req.user.token){
//         response.token = req.user.token;
//      }
  
//       res.status(201).json(response);
//     } catch (error) {
//       res.status(500).json({ message: "Error creating in folder", error });
//     }
//   };
  


exports.getFolders = async (req, res) => {
  try {
    const { workspace } = req; // Workspace from middleware
    if (!req.access) {
      return res.status(403).json({ message: "You do not have access to this workspace" });
    }

    // Fetch folders associated with the workspace
    const folders = await Folder.find({ workspaceId: workspace._id });
    const response = { message: "Folders fetched successfully", folders };

    if (req.user.token) {
      response.token = req.user.token;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error fetching folders", error });
  }
};


exports.updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { foldername } = req.body;
    const { workspace } = req; // Workspace from middleware

    if (!req.access || req.accessType !== "edit") {
      return res.status(403).json({ message: "You do not have sufficient permissions to update this folder" });
    }

    // Ensure the folder belongs to the workspace
    const folder = await Folder.findOne({ _id: id, workspaceId: workspace._id });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found in the workspace" });
    }

    // Update the folder
    folder.foldername = foldername;
    await folder.save();

    const response = { message: "Folder updated successfully", folder };
    if (req.user.token) {
      response.token = req.user.token;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error updating folder", error });
  }
};


exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { workspace } = req; // Workspace from middleware

    if (!req.access || req.accessType !== "edit") {
      return res.status(403).json({ message: "You do not have sufficient permissions to delete this folder" });
    }

    // Ensure the folder belongs to the workspace
    const folder = await Folder.findOne({ _id: id, workspaceId: workspace._id });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found in the workspace" });
    }

    // Delete the folder
    await Folder.findByIdAndDelete(id);

    const response = { message: "Folder deleted successfully" };
    if (req.user.token) {
      response.token = req.user.token;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error deleting folder", error });
  }
};




// exports.getFolderId=async(req,res)=>{
//     try {
//         let folder = await Folder.findOne({ userId: req.user.userId });
//         if (!folder) {
//           folder = new Folder({ name: 'Default Folder', userId: req.user.userId });
//           await folder.save();
//         }
//         const response = { folderId: folder._id }

//         if(req.user.token){
//             response.token = req.user.token;
//          }

//         res.json(response);
//       } catch (error) {
//         res.status(500).json({ message: 'Error fetching folder ID', error: error.message });
//       }
// }


// exports.getFoldersByWorkspace = async (req, res) => {
//     try {
//       const userId = req.user._id;
//       const { workspaceId } = req.query; // Assuming workspaceId is passed as a query parameter
  
//       if (!workspaceId) {
//         return res.status(400).json({ message: "Workspace ID is required" });
//       }
  
//       // Check if the user has access to the workspace
//       const { access, reason, workspace } = await checkWorkspaceAccess(workspaceId, userId);
//       if (!access) {
//         return res.status(403).json({ message: reason });
//       }
  
//       // Fetch folders associated with the workspace
//       const folders = await Folder.find({ workspace: workspaceId });
  
//       const response = { folders };
//       if (req.user.token) {
//         response.token = req.user.token;
//       }
  
//       res.status(200).json(response);
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching folders", error });
//     }
//   };

  
  // exports.deleteFolder = async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { workspaceId } = req.body; // Assuming workspace ID is passed
  //     const userId = req.user._id;
  
  //     // Check workspace access
  //     const { access, reason } = await checkWorkspaceAccess(workspaceId, userId);
  //     if (!access) {
  //       return res.status(403).json({ message: reason });
  //     }
  
  //     // Delete folder
  //     const deletedFolder = await Folder.findByIdAndDelete(id);
  //     if (!deletedFolder) {
  //       return res.status(404).json({ message: "Folder not found" });
  //     }
  
  //     const response = { message: "Folder deleted successfully" };
  //     if (req.user.token) {
  //       response.token = req.user.token;
  //     }
  
  //     res.status(200).json(response);
  //   } catch (error) {
  //     res.status(500).json({ message: "Error deleting folder", error });
  //   }
  // };

  
  // exports.updateFolder = async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { foldername, workspaceId } = req.body;
  //     const userId = req.user._id;
  
  //     if (!foldername || !workspaceId) {
  //       return res.status(400).json({ message: "Folder name and workspace ID are required" });
  //     }
  
  //     // Check workspace access
  //     const { access, reason } = await checkWorkspaceAccess(workspaceId, userId);
  //     if (!access) {
  //       return res.status(403).json({ message: reason });
  //     }
  
  //     // Update folder
  //     const updatedFolder = await Folder.findByIdAndUpdate(
  //       id,
  //       { foldername },
  //       { new: true, runValidators: true }
  //     );
  
  //     if (!updatedFolder) {
  //       return res.status(404).json({ message: "Folder not found" });
  //     }
  
  //     const response = { message: "Folder updated successfully", folder: updatedFolder };
  //     if (req.user.token) {
  //       response.token = req.user.token;
  //     }
  
  //     res.status(200).json(response);
  //   } catch (error) {
  //     res.status(500).json({ message: "Error updating folder", error });
  //   }
  // };