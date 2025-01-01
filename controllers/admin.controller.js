const Folder = require("../models/folder.model.js");
const User = require("../models/user.model.js");
const Form = require("../models/form.model.js");
const FormResponse = require("../models/Response.model.js");

const getFolders = async (req, res) => {
  const userId = req.user.id;
  const folders = await Folder.find({ user: userId }).populate("form");
  if (!folders) {
    return res
      .status(404)
      .json({ success: false, message: "No folder found !" });
  }
  res.status(200).json({ folders: folders });
};

const createFolder = async (req, res) => {
  const { folderName } = req.body;
  const userId = req.user.id;
  if (!folderName) {
    return res
      .status(400)
      .json({ success: false, message: "Folder name is Required !" });
  }
  try {
    const existUser = await User.findById(userId);

    const existFolder = await Folder.findOne({
      folderName: folderName,
      user: userId,
    });

    if (existFolder) {
      return res
        .status(400)
        .json({ success: false, message: "Folder name alrady exist !" });
    }

    const newFolder = new Folder({
      folderName: folderName,
      user: userId,
    });

    await newFolder.save();
    await existUser.folders.push(newFolder._id);
    await existUser.save();

    return res.status(200).json({
      success: true,
      message: "Folder Created succesfully",
      folder: newFolder,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error !!" });
  }
};

const deleteFolder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const folder = await Folder.findById(id);

    const existUser = await User.findById(userId);

    if (userId !== folder.user.toString()) {
      return res
        .status(401)
        .json({ success: false, message: "You are Not Authorized" });
    }
    if (!folder) {
      return res
        .status(404)
        .json({ success: false, message: "Folder Not Found !" });
    }

    // delete all form's inside folder
    await Form.deleteMany({ folder: id });

    // delete folder
    await Folder.deleteOne({ _id: id });

    await existUser.folders.pull(folder._id);
    await existUser.save();

    res.status(200).json({ success: true, message: "Folder Deleted !" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error !!" });
  }
};

const createForm = async (req, res) => {
  const { formName, formDetail, folderId } = req.body;
  const userId = req.user.id;

  try {
    if (!formName) {
      return res
        .status(400)
        .json({ success: false, message: "Form Name is Required" });
    }

    if (!formDetail) {
      return res
        .status(400)
        .json({ success: false, message: "Form Details is Required" });
    }

    let targetFolder = null;
    if (folderId) {
      targetFolder = await Folder.findById(folderId);
      if (!targetFolder) {
        return res
          .status(400)
          .json({ success: false, message: "Folder not found" });
      }
    } else {
      targetFolder = { _id: null };
    }

    const formNameExist = await Form.findOne({
      formName: formName,
      user: userId,
      folder: folderId || null,
    });

    if (formNameExist) {
      return res
        .status(400)
        .json({ success: false, message: "Same FormName Already exists" });
    }

    const newForm = new Form({
      formName: formName,
      formDetails: formDetail,
      user: userId,
      folder: folderId || null,
    });

    await newForm.save();

    if (targetFolder._id != null) {
      targetFolder.form.push(newForm._id);
      await targetFolder.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Form Created Successfully!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error !!" });
  }
};

const getGlobalForm = async (req, res) => {
  const userId = req.user.id;
  const forms = await Form.find({ user: userId, folder: null });
  if (!forms) {
    return res
      .status(404)
      .json({ success: false, message: "No form found at Workspace !" });
  }
  res.status(200).json({ forms: forms });
};

const deleteFormById = async (req, res) => {
  const formId = req.params.id;
  const userId = req.user.id;

  try {
    const form = await Form.findOne({ _id: formId, user: userId });
    const response = await FormResponse.find({ form: formId });

    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    if (form.folder) {
      const folder = await Folder.findById(form.folder);
      if (folder) {
        folder.form.pull(form._id);
        await folder.save();
      }
    }

    await Form.deleteOne({ _id: form._id });
    if (response) {
      await FormResponse.deleteMany({ form: formId });
    }

    res
      .status(200)
      .json({ success: true, message: "Form Deleted Succesfully !" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error !!" });
  }
};

const getFormDetailsById = async (req, res) => {
  const formId = req.params.id;
  // const userId = req.user.id;

  try {
    const form = await Form.findOne({ _id: formId });

    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    res.status(200).json({ formData: form });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error !!" });
  }
};

const formDetailsForGlobal = async (req, res) => {
  const formId = req.params.id;

  try {
    const form = await Form.findById(formId);

    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    res
      .status(200)
      .json({ formDetails: form.formDetails, formName: form.formName });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error !!" });
  }
};

module.exports = {
  getFolders,
  createFolder,
  deleteFolder,
  createForm,
  getGlobalForm,
  deleteFormById,
  getFormDetailsById,
  formDetailsForGlobal,
};
