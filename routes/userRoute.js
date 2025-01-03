const express = require('express');
const router = express.Router();
const validateLogin = require('../middleware/validateLogin');

const { signup, login, updateUser,userDetails,logout } = require('../controllers/auth');
const {auth} = require('../middleware/auth')

router.post('/signup',  signup);

router.post('/login', validateLogin, login);

router.put('/updateuser', auth, updateUser);

router.get('/userdetails/:id', userDetails);
router.post('/logout', logout);


module.exports = router;