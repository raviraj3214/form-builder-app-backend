const { promisify } = require('util');
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")
const User = require("../model/userModel")
require("dotenv").config();


exports.auth = catchAsync(async (req, res, next) => {
    let accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    console.log("access token", accessToken)
    console.log("refresh token", refreshToken)


  
    if (!accessToken && !refreshToken) {
      throw new AppError('You are not logged in. Please log in to access this route.', 401);
    }
  
    let decoded;
    try {
      // Verify the access token
      decoded = await promisify(jwt.verify)(accessToken, 'djgjkdshbgjkhfnjksdfhbnsjkdfsdhjfk');
      
      
    } catch (err) {
      // Handle token expiration
      if (err.name === 'TokenExpiredError' && refreshToken) {
        // Verify the refresh token
        const refreshDecoded = await promisify(jwt.verify)(refreshToken, 'djgjkdshbgjkhweresdfhbnsjkdfsdhjfk');
  
        // Check if the user still exists
        const user = await User.findById(refreshDecoded.id);
        if (!user) {
          throw new AppError('User no longer exists. Please log in again.', 403);
        }
  
        // Generate a new access token
        const newAccessToken = jwt.sign({ id: user.id }, 'djgjkdshbgjkhfnjksdfhbnsjkdfsdhjfk', {
          expiresIn: '1m',
        });
  
  
        req.user = user; 
        req.user.token = newAccessToken;
        return next();
      } else {
        throw new AppError('Invalid or expired token. Please log in again.', 403);
      }
    }
  
    // If token is valid, continue with the request
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 403);
    }
  
    req.user = user; // Attach user to the request
    next();
  });
  