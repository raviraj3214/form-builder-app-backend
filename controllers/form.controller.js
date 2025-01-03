const User = require("../model/userModel");
const Form = require("../model/formModel");
const Folder = require("../model/folderModel")
const { v4: uuidv4 } = require('uuid');
const mongoose=require('mongoose')
const checkWorkspaceAccess  = require('../utils/checkWorkSpaceAccess');


// exports.saveForm = async (req, res) => {
//   try {
//     const { formname, folderId, theme, fields } = req.body;
//     const userId = req.user._id;
//     const uniqueUrl = uuidv4();

//     console.log("Received form details:", { formname, folderId, theme, fields, userId, uniqueUrl });

//     const newForm = new Form({
//       formname,
//       userId,
//       folderId: folderId || null,
//       theme,
//       views: 0,
//       starts: 0,
//       completionrate: 0,
//       fields,
//       uniqueUrl
//     });

//     await newForm.save();
//     console.log("Form saved successfully:", newForm);
//     const response = { message: "Form saved successfully", form: newForm }
//     if(req.user.token){
//       response.token = req.user.token;
//    }
//     res.status(201).json(response);
//   } catch (error) {
//     console.error("Error saving form:", error.message);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

exports.saveForm = async (req, res) => {
  try {
    const { formname, folderId, theme, fields } = req.body;
    const { workspace } = req; // Access workspace info from middleware
    if (!req.access || req.accessType !== "edit") {
      return res.status(403).json({ message: "You do not have sufficient permissions to delete this folder" });
    }


    // Check if the folder belongs to the specified workspace
    if(folderId){
    const folder = await Folder.findById(folderId);
    if (folder && folder.workspaceId.toString() !== workspace._id.toString()) {
      return res.status(400).json({ message: "Folder does not belong to the specified workspace" });
    }
  }

    // Generate a unique URL for the form
    const uniqueUrl = uuidv4();

    // Create a new form
    const newForm = new Form({
      formname,
      workspaceId: workspace._id,
      folderId: folderId || null,
      theme,
      fields,
      uniqueUrl,
    });

    await newForm.save();

    // Prepare response
    const response = { message: "Form saved successfully", form: newForm };
    if (req.user.token) {
      response.token = req.user.token;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error saving form:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



exports.fetchform = async (req, res) => {
  try {
    const { formId } = req.params;
    if (!req.access) {
      return res.status(403).json({ message: "You do not have access to this workspace" });
    }

    // Fetch the form using the ID or unique URL
    let form;
    if (mongoose.Types.ObjectId.isValid(formId)) {
      form = await Form.findById(formId);
    } else {
      form = await Form.findOne({ uniqueUrl: formId });
    }

    // If the form is not found, return an error
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Ensure the user has access to the workspace associated with the form
    const workspaceId = form.workspaceId;

    // Access information is attached to the request by `checkWorkspaceAccess`
    if (!req.access || req.workspace._id.toString() !== workspaceId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this workspace",
      });
    }

    // If the user has access, return the form details
    const response = {
      success: true,
      message: "Form fetched successfully",
      form,
    };

    // Include the token in the response if available
    if (req.user.token) {
      response.token = req.user.token;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching form:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching form",
      error: error.message,
    });
  }
};


exports.deleteform = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.access || req.accessType !== "edit") {
      return res.status(403).json({ message: "You do not have sufficient permissions to delete this folder" });
    }
    // Find the form either by form ID or unique URL
    let form;
    if (mongoose.Types.ObjectId.isValid(id)) {
      form = await Form.findById(id);
    } else {
      form = await Form.findOne({ uniqueUrl: id });
    }

    // If the form is not found, return an error
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    

    // Delete the form
    await Form.findByIdAndDelete(form._id);

    const response = { message: "Form deleted successfully" };
    if (req.user.token) {
      response.token = req.user.token;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error deleting form:", error.message);
    res.status(500).json({ message: "Error deleting form", error: error.message });
  }
};


exports.getFormByWorkspaceId = async (req, res) => {
    try {
        const workspaceId = req.workspace._id;
        
    if (!req.access) {
      return res.status(403).json({ message: "You do not have sufficient permissions to delete this folder" });
    }

        const forms = await Form.find({ workspaceId: workspaceId,folderId: null });
        if (!forms) {
            return res.status(404).json({ message: 'Forms not found' });
        }
        const response = {forms}

        if(req.user.token){
          response.token = req.user.token;
       }
        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching forms:", error);
        res.status(500).json({ message: error.message });
    }
}

exports.fetchByUniqueUrl = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;
    
    if (!req.access) {
      return res.status(403).json({ message: "You do not have sufficient permissions to delete this folder" });
    }

    const form = await Form.findOne({ uniqueUrl });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const response = { form }
    if(req.user.token){
      response.token = req.user.token;
   }
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching form by unique URL:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.saveResponse = async (req, res) => {
    try {
        const { uniqueUrl } = req.params;
        const response = req.body;
        
    if (!req.access || req.accessType !== "edit") {
      return res.status(403).json({ message: "You do not have sufficient permissions to delete this folder" });
    }


        const form = await Form.findOne({ uniqueUrl });
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }

        if (!form.responses) {
            form.responses = [];
        }

        form.responses.push(response);

        await form.save();

        const res = { message: 'Response saved successfully' }
        if(req.user.token){
          res.token = req.user.token;
       }
        res.status(200).json(res);
    } catch (error) {
        console.error("Error saving response:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getFormsByFolder = async (req, res) => {
    try {
        const { folderId } = req.params;
        
    if (!req.access) {
      return res.status(403).json({ message: "You do not have sufficient permissions to delete this folder" });
    }

        const forms = await Form.find({ folderId });
        if (!forms) {
            return res.status(404).json({ message: 'Forms not found' });
        }
        const response = {forms}
        if(req.user.token){
          response.token = req.user.token;
       }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateTheme = async (req, res) => {
  try {
    const { formId } = req.params;
    const { theme } = req.body;

    console.log(`Received request to update theme for formId: ${formId} to ${theme}`);

    let form;
    if (mongoose.Types.ObjectId.isValid(formId)) {
      form = await Form.findByIdAndUpdate(formId, { theme }, { new: true });
    } else {
      form = await Form.findOneAndUpdate({ uniqueUrl: formId }, { theme }, { new: true });
    }

    if (!form) {
      console.log(`Form not found for formId: ${formId}`);
      return res.status(404).send({ message: 'Form not found' });
    }

    console.log(`Theme updated successfully for formId: ${formId}`);
    res.send(form);
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).send({ message: 'Error updating theme', error });
  }
};


exports.updateForm = async (req, res) => {
  try {
    const { formId } = req.params; // Get formId from the request parameters
    const { formname, folderId, theme, fields } = req.body; // Extract form details from the request body
    
    if (!req.access || req.accessType !== "edit") {
      return res.status(403).json({ message: "You do not have sufficient permissions to delete this folder" });
    }


    console.log(`Updating form with ID: ${formId}`);

    // Validate if formId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: 'Invalid Form ID' });
    }

    // Find and update the form
    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      {
        formname,
        folderId: folderId || null,
        theme,
        fields
      },
      { new: true } // Return the updated form
    );

    if (!updatedForm) {
      console.log(`Form not found for ID: ${formId}`);
      return res.status(404).json({ message: 'Form not found' });
    }

    console.log('Form updated successfully:', updatedForm);
    const response = { message: 'Form updated successfully', form: updatedForm }
    if(req.user.token){
      response.token = req.user.token;
   }
    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating form:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};