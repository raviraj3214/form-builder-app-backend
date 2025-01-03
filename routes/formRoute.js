const express = require("express");
const router = express.Router();

const { saveForm, fetchform, deleteform, getFormByUser, fetchByUniqueUrl, getFormsByFolder, updateTheme, updateForm, getFormByWorkspaceId } = require("../controllers/form.controller");

// const { auth } = require("../middleware/auth");
const { auth } = require("../middleware/auth");
const {checkWorkspaceAccess} = require("../middleware/checkWorkSpaceAccess")

const updateViewCount = require("../middleware/viewCount");

router.post("/saveform",auth,checkWorkspaceAccess, saveForm);

router.get("/fetchform/:formId",auth,checkWorkspaceAccess, fetchform);

router.delete("/deleteform/:id", auth,checkWorkspaceAccess, deleteform);

router.get('/user',auth,checkWorkspaceAccess, getFormByWorkspaceId);

router.get('/fetchByUniqueUrl/:uniqueUrl',auth, checkWorkspaceAccess, updateViewCount, fetchByUniqueUrl);

router.get('/folder/:folderId',auth,checkWorkspaceAccess, getFormsByFolder);

router.put('/updateTheme/:formId', auth,checkWorkspaceAccess, updateTheme);

router.put("/updateform/:formId", auth,checkWorkspaceAccess, updateForm);

module.exports = router;