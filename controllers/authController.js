const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError.js');

const jwt = require('jsonwebtoken');

const generateToken = (id, secret, expiresIn) => {
  return jwt.sign({ id }, secret, { expiresIn });
};



exports.register = catchAsync(async (req, res, next) => {
  const { email, name, password, confirmPassword } = req.body;

  const user = await User.create({ email, name, password, confirmPassword });

  res.status(200).json({
    status: 'success',
    data: user,
  });
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and Password are required!', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePasswords(password, user.password))) {
    throw new AppError('Email or password mismatch', 400);
  }

  

  const accessToken = generateToken(user.id, process.env.JWT_SECRET_KEY, '1m');
  const refreshToken = generateToken(user.id, process.env.JWT_REFRESH_SECRET_KEY, '7d');

   res.cookie("refreshToken", refreshToken, { 
        httpOnly: true, 
        sameSite: 'none',
        secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000,
    })
    

   return  res.status(200).json({
      message: 'Login successful',
      data: {
        info: { email: user.email, name: user.name, _id: user._id, },
        token: accessToken,
      },
      
    });
});
exports.logout = (req, res) => {
  return res
    .status(200)
    .clearCookie("token", { httpOnly: true, sameSite: 'none', secure: true, })
    .json({ message: 'Logout successful' });
};

exports.refreshToken = catchAsync(async (req, res, next) => {
  // Get the refresh token from the cookie
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new AppError('Refresh token is missing. Please log in again.', 401);
  }

  // Verify the refresh token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 403);
  }

  // Check if the user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists. Please log in again.', 403);
  }

  // Generate a new access token
  const newAccessToken = generateToken(user.id, process.env.JWT_SECRET_KEY, '1m');

  // Send the new access token to the client
  res.status(200).json({
    data: {
      info: { email: user.email, name: user.name, _id: user._id, },
      token: newAccessToken,
    },
    message: 'Access token refreshed successfully',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let accessToken = req.headers.authorization?.split(' ')[1];
  const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies

  if (!accessToken && !refreshToken) {
    throw new AppError('You are not logged in. Please log in to access this route.', 401);
  }

  let decoded;
  try {
    // Verify the access token
    decoded = await promisify(jwt.verify)(accessToken, process.env.JWT_SECRET_KEY);
  } catch (err) {
    // Handle token expiration
    if (err.name === 'TokenExpiredError' && refreshToken) {
      // Verify the refresh token
      const refreshDecoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);

      // Check if the user still exists
      const user = await User.findById(refreshDecoded.id);
      if (!user) {
        throw new AppError('User no longer exists. Please log in again.', 403);
      }

      // Generate a new access token
      const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
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
