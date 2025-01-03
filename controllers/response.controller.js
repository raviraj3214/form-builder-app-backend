const mongoose = require("mongoose");
const Response = require("../model/responseModel");
const Form = require("../model/formModel");

exports.saveResponse = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;
    const responses = req.body;

    console.log("Received responses:", responses); // Log received responses for debugging

    const form = await Form.findOne({ uniqueUrl });
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const newResponse = new Response({
      formId: form._id,
      responses,
      submittedAt: new Date(), // Ensure we save the submission date
    });

    await newResponse.save();
    
    res.status(200).json({ message: "Response saved successfully" });
  } catch (error) {
    console.error("Error saving response:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const responses = await Response.find({ formId });

    if (!responses || responses.length === 0) {
      return res.status(404).json({ message: "Responses not found" });
    }
    res.status(200).json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: error.message });
  }
};