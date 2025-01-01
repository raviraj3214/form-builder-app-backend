const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true,
    },
    
    folders: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Folder",
    }],

    AccessWorkSpaces : [{
        userId :{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        permission:{
            type:String,
            enum:["View","Edit"],
            required: true,
        }
    }]

}, {timestamps: true});

UserSchema.path('AccessWorkSpaces').default([]);

const User = mongoose.model("User", UserSchema);
module.exports = User;