const express = require("express");
const router = express.Router();


const{createFolder,getFolders,updateFolder,deleteFolder,getFolderId}=require("../controllers/folder.controller")

const {auth} = require("../middleware/auth")
const {checkWorkspaceAccess} = require("../middleware/checkWorkSpaceAccess")


// Create a new folder
router.post("/createfolder",auth, checkWorkspaceAccess, createFolder);

// Get all folders
// router.get("/getfolders",auth, checkWorkspaceAccess, getFolders);

// Update a folder by ID
router.put("/updatefolder/:id",auth, checkWorkspaceAccess, updateFolder);

// Delete a folder by ID
router.delete("/deletefolder/:id",auth, checkWorkspaceAccess, deleteFolder);

router.get('/user',auth, checkWorkspaceAccess, getFolders);

// router.get('/getfolderid',auth, checkWorkspaceAccess, getFolderId)


module.exports = router;