const mongoose  = require("mongoose");

const folderSchema = new mongoose.Schema({
    folderName:{
        type:String,
        required:true,
        unique: true
    },
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    form:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Form"
    }],
},
{ timestamps: true })

// Compound unique index for folderName and user
folderSchema.index({ folderName: 1, user: 1 }, { unique: true });

const Folder = mongoose.model("Folder", folderSchema);
module.exports = Folder;