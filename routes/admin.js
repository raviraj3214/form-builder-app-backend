const express = require("express");
const router = express.Router();
const Folder = require("../models/folder.model.js");
const User = require("../models/user.model.js");
const Form = require("../models/form.model.js");
const FormResponse = require("../models/Response.model.js");
const authMiddleware = require("../middleware/auth.js");
const {
  getFolders,
  createFolder,
  deleteFolder,
  createForm,
  getGlobalForm,
  deleteFormById,
  getFormDetailsById,
  formDetailsForGlobal,
} = require("../controllers/admin.controller.js");

// get user created folders
router.get("/", authMiddleware, getFolders);

// create folder
router.post("/folder-create", authMiddleware, createFolder);

// delete folder
router.delete("/:id", authMiddleware, deleteFolder);

// create form
router.post("/form", authMiddleware, createForm);

// get form in Workspace
router.get("/global-form", authMiddleware, getGlobalForm);

// delete formBy id
router.delete("/form/:id", authMiddleware, deleteFormById);

// get form details by id
router.get("/form/:id", getFormDetailsById);

// get form Details for Global user
router.get("/form-bot/:id", formDetailsForGlobal);



module.exports = router;
