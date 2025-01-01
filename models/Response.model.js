const mongoose = require("mongoose");
const { Schema } = mongoose;

const formResponseSchema = new Schema({
    randomId:{
        type:String,
        required:true,
        unique:true,
    },
    formName: {
        type:String,
        required: true,
    },
    userResponse :{
        type: [Schema.Types.Mixed],
        default:[],
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    form:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Form",
    }
},
{ timestamps: true });

const FormResponse = mongoose.model("FormResponse", formResponseSchema);
module.exports = FormResponse;

