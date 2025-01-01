const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {userRegister, userLogin, userUpdate, sharedWorkspace, getUserWorkspace, selectedWorkspace,acceptWorkspaceInvite} = require("../controllers/user.controller.js");

// register new user
router.post("/register", userRegister);

// login user
router.post("/login", userLogin);

// update User
router.put("/:id", authMiddleware, userUpdate);

// shared workSpaces
router.post("/share/:id", authMiddleware, sharedWorkspace);

// get Users workspaces
router.get("/my-workspaces", authMiddleware, getUserWorkspace);

// het Selected workspace by selected id
router.get("/my-workspaces/:id", authMiddleware, selectedWorkspace);

router.post('/accept-invite',authMiddleware, acceptWorkspaceInvite);


module.exports = router;
