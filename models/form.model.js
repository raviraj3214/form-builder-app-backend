const mongoose = require("mongoose");
const { Schema } = mongoose;

// form detials schema 
const formDetaiSchema = new Schema({
  inputType: {
    type: String,
    enum: ["Bubble", "Input"],
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "number","image", "email", "phone", "date", "rating", "button"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  showValue: {
    type: String,
    default: "",
  },
});

const formSchema = new mongoose.Schema({
  formName: {
    type: String,
    required: true,
  },
  formDetails: {
    type: [formDetaiSchema],
  },
  shareLink: {
    type: String,
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User who created the form
    required: true,
  },

  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder", 
    default: null, 
  },
  views: {
    type: Number,
    default: 0, // Track number of views (link clicks)
  },
  starts: {
    type: Number,
    default: 0, // Track number of form starts
  },
},
{ timestamps: true });

// Create a compound index to ensure the formName is unique per folder
formSchema.index({ formName: 1, folder: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Form", formSchema);