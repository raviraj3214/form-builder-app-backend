const User = require("../model/userModel")
const Workspace = require("../model/workspaceModel")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync")
require('dotenv').config({'path':'./.env'},);

const generateToken = (id, secret, expiresIn) => {
    return jwt.sign({ id }, secret, { expiresIn });
  };

  exports.signup = async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;
  
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // Create and save the new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        confirmPassword: hashedPassword,
      });
  
      await newUser.save();
  
      // Format the workspace name
      const formatWorkspaceName = (name) => {
        return name
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      };
  
      const workspaceName = formatWorkspaceName(`${username}'s Workspace`);
  
      // Create and save the workspace
      const newWorkspace = new Workspace({
        name: workspaceName,
        owner: newUser._id,
        members: [
          {
            userId: newUser._id,
            accessType: "edit",
          },
        ],
      });
  
      await newWorkspace.save();
  
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: newUser._id,
        workspace: newWorkspace._id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  


// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validate input
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and password are required' });
//         }

//         // Check if user exists
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found. Please register first' });
//         }

//         // Verify password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             { userId: user._id },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         // Prepare response data
//         const userInfo = {
//             id: user._id,
//             username: user.username,
//             email: user.email,
//         };

//         // Send response
//         return res.status(200).json({
//             success: true,
//             message: 'User logged in successfully',
//             token,
//             user: userInfo,
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      throw new AppError('Email and Password are required!', 404);
    }
  
    const user = await User.findOne({ email }).select('+password');
    if(!user){
        throw new AppError('User not found, please register first', 404)
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Invalid password', 401);
        }
  
  
    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    //   expiresIn: process.env.JWT_EXPIRES_IN,
    // });
  
    const accessToken = generateToken(user.id,'djgjkdshbgjkhfnjksdfhbnsjkdfsdhjfk' , '1m');
    const refreshToken = generateToken(user.id,'djgjkdshbgjkhweresdfhbnsjkdfsdhjfk' , '7d');
    const workspace = await Workspace.findOne({owner:user._id})
    const workspaceId = workspace._id
  
     res.cookie("refreshToken", refreshToken, { 
          httpOnly: true, 
          sameSite: 'none',
          secure: true,
          maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      const userInfo = {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                };
      
  
     return  res.status(200).json({
        success: true,
            message: 'User logged in successfully',
             token:accessToken,
             user: userInfo,
             workspaceId:workspaceId
     }
        );
  });

exports.updateUser = async (req, res) => {
    
    try {
      const userId  = req.user._id;
      console.log("user id",userId)
      const { username, email, newPassword, oldPassword } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (oldPassword && newPassword) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Old password is not correct' });
        }
        user.password = await bcrypt.hash(newPassword, 12);
      }
  
      if (username) user.username = username;
      if (email) user.email = email;
  
      await user.save();
      const response = { success: true, message: 'User updated successfully',user }
      if(req.user.token){
        response.token = req.user.token
      }
  
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  

exports.userDetails = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            userDetails,
            message: "User details fetched successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching user details",
        });
    }
};

exports.logout = (req, res) => {
    return res
      .status(200)
      .clearCookie("token", { httpOnly: true, sameSite: 'none', secure: true, })
      .json({ message: 'Logout successful' });
  };