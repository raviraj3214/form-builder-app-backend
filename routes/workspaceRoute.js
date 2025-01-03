const express = require("express");
const router = express.Router();
const { getUserWorkspaces, shareWorkspace } = require("../controllers/workspace.controller"); 
const {auth} = require('../middleware/auth')

router.get("/workspaces",auth, getUserWorkspaces); 
router.post("/share",auth,shareWorkspace)
module.exports = router;
