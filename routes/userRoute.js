const express = require('express');
const { updateUser, getUser, getUserByEmail } = require('../controllers/userController');
const { protect } = require('../controllers/authController');



const router = express.Router();




router.patch('/', protect, updateUser);
router.get('/', protect, getUser);
router.get('/searchUserByEmail',protect, getUserByEmail);


module.exports = router;
